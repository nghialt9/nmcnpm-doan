import React, { useState, useEffect, useRef, Fragment } from "react";
import { IoSend } from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa6";
import { IoMdAddCircle } from "react-icons/io";
import { useAuth } from "../../providers/AuthContext";
import {
  saveWordForUser,
  getSavedWordsForUser,
  saveHistories,
  getHistories,
  getConversationByHistoryId,
  sendConversation,
  textToSpeechFromServer
} from "../../services/chat";
import { speechToText } from "../../services/openapi";
import { ListGroup, ListGroupItem, Spinner } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";

import UserConversation from "./Conversation/User";
import BotConversation from "./Conversation/Bot";
import ConversationView from "./Conversation/ConversationView";

import "./chatui.css";
import Header from "../Header";
import { Message as ChatMessage } from "../../types/Chat";
import { FaCertificate } from "react-icons/fa";

interface SavedWord {
  text: string;
  meaning: string;
}

interface ChatHistory {
  history_uuid: string;
  createdAt: string;
  title: string;
}

type UIMode = "DEFAULT" | "CONVERSATION_FULLSCREEN";

const Chat: React.FC = () => {
  const { state } = useAuth();
  const [histories, setHistories] = useState<ChatHistory[]>([]);
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [activeHistory, setActiveHistory] = useState<Partial<ChatHistory>>({});
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [selectedSavedWord, setSelectedSavedWord] = useState<SavedWord | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<UIMode>("DEFAULT");
  const [isManualRecording, setIsManualRecording] = useState(false);
  const botAudioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const activeHistoryUuidRef = useRef<string | null>(null);
  const hideSavedWordDisplay = () => {
    if (selectedSavedWord) {
      setSelectedSavedWord(null);
    }
  };
  const handleExitConversationView = () => {
    setMode("DEFAULT");
    // Ngay sau khi quay lại màn hình chính, ta tải lại cuộc hội thoại
    if (activeHistory.history_uuid) {
      _handleFetchConversation(activeHistory.history_uuid);
    }
  };
  useEffect(() => {
    activeHistoryUuidRef.current = activeHistory.history_uuid ?? null;
  }, [activeHistory.history_uuid]);

  useEffect(() => {
    if (state.user?.uuid) {
      _handleFetchHistories({ uuid: state.user.uuid });
      _handleFetchSavedWords(state.user.uuid);
    }
  }, [state.user?.uuid]);

  useEffect(() => {
    if (activeHistory.history_uuid) {
      _handleFetchConversation(activeHistory.history_uuid);
    } else {
      setConversation([]);
    }
  }, [activeHistory.history_uuid]);

  useEffect(() => {
    const el = document.querySelector<HTMLDivElement>(".chats");
    if (el) el.scrollTop = el.scrollHeight;
  }, [conversation]);

  const speakText = async (text: string) => {
    if (botAudioRef.current && !botAudioRef.current.paused) {
      botAudioRef.current.pause();
    }
    try {
      const audioUrl = await textToSpeechFromServer(text);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        botAudioRef.current = audio;
        await audio.play();
        audio.onended = () => {
          if (audio.src.startsWith('blob:')) URL.revokeObjectURL(audio.src);
          botAudioRef.current = null;
        };
      }
    } catch (error) {
      console.error("Lỗi Text-to-Speech:", error);
      setChatError("Không thể phát âm thanh.");
    }
  };

  useEffect(() => {
    return () => {
      if (botAudioRef.current) {
        botAudioRef.current.pause();
        if(botAudioRef.current.src.startsWith('blob:')) URL.revokeObjectURL(botAudioRef.current.src);
      }
    };
  }, []);
  
  const handleManualRecord = async () => {
    hideSavedWordDisplay();
    if (isManualRecording) return;
    setIsManualRecording(true);
    setChatError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
          stream.getTracks().forEach(track => track.stop());
          if (chunks.length === 0) {
              setChatError("Không ghi nhận được âm thanh.");
              setIsManualRecording(false);
              return;
          }
          const audioBlob = new Blob(chunks, { type: "audio/webm" });
          const transcribedText = await speechToText(audioBlob);
          setInputText(transcribedText ?? "");
          setIsManualRecording(false);
      };
      recorder.start();
      setTimeout(() => {
        if (recorder.state === 'recording') {
            recorder.stop();
        }
      }, 5000);
    } catch (err) {
      console.error("Manual recording failed:", err);
      setChatError("Không thể truy cập micro. Vui lòng cấp quyền.");
      setIsManualRecording(false);
    }
  };

const _updateHistoryTitleIfNeeded = async (history_uuid: string, firstUserMessageContent: string) => {
    const historyToUpdate = histories.find(h => h.history_uuid === history_uuid);

    if (historyToUpdate && historyToUpdate.title === "New Conversation...") {
        const newTitle = firstUserMessageContent.length > 35 
            ? firstUserMessageContent.substring(0, 32) + '...' 
            : firstUserMessageContent;

        setHistories(prev => prev.map(h => 
            h.history_uuid === history_uuid ? { ...h, title: newTitle } : h
        ));

        if (activeHistory.history_uuid === history_uuid) {
            setActiveHistory(prev => ({ ...prev, title: newTitle }));
        }
        console.log(`History title for ${history_uuid} updated to: "${newTitle}"`);
    }
};


const _handleSendTextContent = async (text: string) => {
    const userMsg: ChatMessage = { uuid: uuidv4(), sender: "user", content: text, role: "user" };
    setConversation((prev) => [...prev, userMsg]);
    setSuggestions([]);

    let historyToUse = activeHistoryUuidRef.current;

    try {
        if (!historyToUse) {
            const res = await saveHistories({ user_uuid: state.user?.uuid });
            if (res.success && res.data) {
                const newHistory: ChatHistory = {
                    history_uuid: res.data.uuid,
                    createdAt: res.data.created_at,
                    title: "New Conversation..." 
                };
                setHistories((prev) => [newHistory, ...prev]);
                setActiveHistory(newHistory);
                historyToUse = newHistory.history_uuid;
            } else {
                setChatError(res.error || "Không thể bắt đầu cuộc trò chuyện mới.");
                setConversation(prev => prev.slice(0, prev.length - 1));
                return;
            }
        }

        if (historyToUse) {
            await _updateHistoryTitleIfNeeded(historyToUse, text);
        }
        
        const res = await sendConversation({ number_sentence: "1", sentences: text, history_uuid: historyToUse });

        const botMsg: ChatMessage = {
            uuid: uuidv4(),
            sender: "system",
            content: res.success ? (res.message ?? "No response message.") : "Sorry, I encountered an error.",
            role: "system",
        };
        setConversation((prev) => [...prev, botMsg]);



        if (res.success && botMsg.content) {
            await speakText(botMsg.content);
        }
        if (res.success) setSuggestions(res.suggestions || []);

    } catch (err) {
        console.error("Error sending conversation:", err);
        setChatError("Lỗi kết nối, không thể gửi tin nhắn.");
        setConversation(prev => prev.slice(0, prev.length - 1));
    }
};
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { setInputText(e.target.value); };
  const handleVoiceModeClick = () => { hideSavedWordDisplay(); if (!activeHistory.history_uuid) { setChatError("Vui lòng bắt đầu một cuộc hội thoại mới trước."); return; } setMode("CONVERSATION_FULLSCREEN"); };
  const _handleSendFromInput = async () => { hideSavedWordDisplay(); if (!inputText.trim()) return; const textToSend = inputText; setInputText(""); await _handleSendTextContent(textToSend); };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); _handleSendFromInput(); } };
  
// Code mới - Sửa trong Chat.tsx

const handleCreateNewChatClick = async () => {
  hideSavedWordDisplay(); // Thêm dòng này để ẩn từ đã lưu nếu có
  setChatError(null);
  setInputText("");
  setSuggestions([]);

  try {
    const res = await saveHistories({ user_uuid: state.user?.uuid });

    if (res.success && res.data) {
      const newHistory: ChatHistory = {
        history_uuid: res.data.uuid,
        createdAt: res.data.created_at,
        title: "New Conversation...", 
      };
      setHistories((prev) => [newHistory, ...prev]);
      setActiveHistory(newHistory);
      setConversation([]); 

      console.log("New chat created successfully:", newHistory.history_uuid);
    } else {
      setChatError(res.error || "Không thể bắt đầu cuộc trò chuyện mới.");
    }
  } catch (err) {
    console.error("Failed to create new chat:", err);
    setChatError("Lỗi kết nối khi tạo cuộc trò chuyện mới.");
  }
};

  const _handleFetchSavedWords = async (user_uuid: string) => {
    try {
      const res = await getSavedWordsForUser(user_uuid);
      if (res.success && res.data) {
        setSavedWords(
          res.data.map((item: any) => ({ text: item.word, meaning: item.meaning }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch saved words:", error);
    }
  };

  const handleSaveWord = async (word: string, meaning: string) => {
    if (!state.user?.uuid) return;
    const res = await saveWordForUser(state.user.uuid, word, meaning);
    if (res.success && res.data) {
      setSavedWords((prev) => [
        { text: res.data.word, meaning: res.data.meaning },
        ...prev,
      ]);
    } else {
      console.error("Could not save word:", res.error);
      setChatError(res.error || "Could not save the word.");
    }
  };

  const handleSavedWordClick = (word: SavedWord) => {
    if (selectedSavedWord && selectedSavedWord.text === word.text) {
      setSelectedSavedWord(null);
    } else {
      setSelectedSavedWord(word);
    }
  };

  const _handleFetchHistories = async ({ uuid }: { uuid?: string }) => {
    if (!uuid) return;
    try {
      const res = await getHistories({ uuid });
      if (res.success && res.data?.length) {
        const normalized: ChatHistory[] = res.data.map((h: any) => ({
          history_uuid: h.uuid,
          createdAt: h.createdAt ?? h.created_at,
          title: h.title || `Chat from ${new Date(h.createdAt ?? h.created_at).toLocaleDateString()}`,
        }));

        setHistories(normalized);

        const currentActive = activeHistory.history_uuid 
            ? normalized.find(h => h.history_uuid === activeHistory.history_uuid)
            : normalized[0];

        setActiveHistory(currentActive || {});

      } else {
        setHistories([]);
        setActiveHistory({});
        setConversation([]);
      }
    } catch (err) {
      console.error("FetchHistories error:", err);
    }
  };

  const _handleFetchConversation = async (history_uuid: string) => {
    try {
      const res = await getConversationByHistoryId(history_uuid);
      if (res.success && res.conversations) {
        const convs: ChatMessage[] = res.conversations.map((c) => ({
          uuid: c.uuid || uuidv4(),
          sender: c.sender,
          content: c.content,
          role: c.role || (c.sender === "user" ? "user" : "system"),
        }));
        setConversation(convs);
      } else {
        setConversation([]);
      }
    } catch (err) {
      console.error("FetchConversation error:", err);
      setConversation([]);
    }
  };

  if (mode === "CONVERSATION_FULLSCREEN") {
    return (
      <ConversationView activeHistory={activeHistory} onExit={handleExitConversationView} />
    );
  }

  return (
    <>
      <Header />
      <div className="App">
        <div className="sidebar">
          <div className="top">
            <div className="newChat" onClick={handleCreateNewChatClick}>
              <IoMdAddCircle size={30} color="white" />
              <button>New Chat</button>
            </div>
            <div className="titleSideBar"><h1>History</h1></div>
            <ListGroup className="list historyList">
              {histories.map((h) => (
                <ListGroupItem
                  key={h.history_uuid}
                  active={h.history_uuid === activeHistory.history_uuid}
                  onClick={() => setActiveHistory(h)}
                  className="detailList"
                >
                  {h.title}
                </ListGroupItem>
              ))}
            </ListGroup>
          </div>
          <div className="savedwords-section">
            <div className="titleSideBar" style={{ marginTop: 20 }}>
              <h1>Saved Words</h1>
            </div>
            <ListGroup className="list savedWordsList">
              {savedWords.map((w, index) => (
                <ListGroupItem
                  key={`${w.text}-${index}`}
                  active={selectedSavedWord?.text === w.text}
                  onClick={() => handleSavedWordClick(w)}
                  className="detailList"
                >
                  {w.text}
                </ListGroupItem>
              ))}
            </ListGroup>
          </div>
        </div>
        <div className="chatting">
          <div className="titleMain"><h1>Chatting</h1></div>
          {selectedSavedWord && (
            <div className="saved-word-display">
              <h3>{selectedSavedWord.text}</h3>
              <p>{selectedSavedWord.meaning}</p>
            </div>
          )}
          <div className="main">
            <div className="chats">
              {conversation.map((msg) => (
                <Fragment key={msg.uuid}>
                  {msg.role === "user" ? (
                    <UserConversation content={msg.content} onSaveWord={handleSaveWord} />
                  ) : (
                    <BotConversation content={msg.content} onSaveWord={handleSaveWord} />
                  )}
                </Fragment>
              ))}
            </div>
            {chatError && <p className="error-message">{chatError}</p>}
            {suggestions.length > 0 && (
              <div className="suggestions">
                {suggestions.map((s, idx) => (
                  <button key={idx} className="suggestion-button" onClick={() => _handleSendTextContent(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="chatFooter">
              <div className="inp">
                <input type="text" ref={inputRef} value={inputText} onChange={handleInputChange} placeholder="Gõ tin nhắn hoặc dùng các nút chức năng..." onKeyDown={handleKeyDown} onFocus={hideSavedWordDisplay} />
                {inputText ? (
                  <button className="send" onClick={_handleSendFromInput} title="Send Message"><IoSend size={30} color="white" /></button>
                ) : (
                  <>
                    <button className="manual-btn" onClick={handleManualRecord} disabled={isManualRecording} title="Manual Mode">
                      {isManualRecording ? <Spinner animation="border" size="sm" /> : <FaMicrophone  size={30} color="#white" />}
                    </button>
                    <button className="voice-btn" onClick={handleVoiceModeClick} title="Conversation Mode">
                      <FaCertificate size={30} color="white" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;