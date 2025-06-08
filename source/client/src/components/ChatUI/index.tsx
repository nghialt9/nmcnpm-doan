// File: client/src/components/ChatUI/index.tsx
import React, { useState, useEffect, useRef, Fragment } from "react";
import { IoSend } from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa6";
import { IoMdAddCircle } from "react-icons/io";
import { useAuth } from "../../providers/AuthContext";
import { saveWordForUser, getSavedWordsForUser } from "../../services/chat";
import {
  saveHistories,
  getHistories,
  getConversationByHistoryId,
  sendConversation,
} from "../../services/chat";
import { ListGroup, ListGroupItem, Spinner } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import { speechToText } from "../../services/openapi";

import UserConversation from "./Conversation/User";
import BotConversation from "./Conversation/Bot";


import "./chatui.css";
import Header from "../Header";

// Import Message type from shared types to match API
import { Message as ChatMessage } from "../../types/Chat";

interface SavedWord {
  text: string;
  meaning: string;
}

// Declare mediaRecorder and audioChunks at module scope
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

const Chat: React.FC = () => {
  /* ---------------------------- STATE DECLARATION --------------------------- */
  const { state } = useAuth();
  const [histories, setHistories] = useState<any[]>([]);
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [activeHistory, setActiveHistory] = useState<any>({});
  const [activeDate, setActiveDate] = useState<string>("");
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [selectedSavedWord, setSelectedSavedWord] = useState<SavedWord | null>(
    null
  );
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  /* ----------------------------- REFS & EFFECTS ---------------------------- */
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    _initMediaRecorder();
    return () => {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    _handleFetchHistories({ uuid: state.user?.uuid });
  }, [state.user?.uuid]);

  useEffect(() => {
    if (activeHistory.history_uuid) _handleFetchConversation(activeHistory.history_uuid);
  }, [activeHistory.history_uuid]);

  useEffect(() => {
    const el = document.querySelector<HTMLDivElement>(".chats");
    if (el) el.scrollTop = el.scrollHeight;
  }, [conversation]);

  /* ------------------------------ FUNCTIONS ------------------------------- */
  const _initMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        audioChunks = [];
        try {
          const txt = await speechToText(audioBlob);
          if (txt && inputRef.current) inputRef.current.value = txt;
        } catch (err) {
          console.error("Transcribe error", err);
        }
      };
    } catch (err) {
      console.error("Mic init error", err);
      alert("Could not access microphone. Check permission.");
    }
  };

  const startRecording = () => {
    if (mediaRecorder?.state === "inactive") {
      audioChunks = [];
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder?.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const _handleFetchHistories = async ({ uuid }: { uuid?: string }) => {
    if (!uuid) return;
    try {
      const res = await getHistories({ uuid });
      if (res.success && res.data?.length) {
        setHistories(res.data);
        const first = res.data[0];
        setActiveHistory(first);
        setActiveDate(first.createdAt);
      } else {
        setHistories([]);
        setActiveHistory({});
        setActiveDate("");
        setConversation([]);
      }
    } catch (err) {
      console.error("FetchHistories", err);
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
          role: c.role || "",
          created_at: c.created_at
        }));
        setConversation(convs);
      }
    } catch (err) {
      console.error("FetchConversation", err);
    }
  };

      const _handleSendText = async (e: React.FormEvent) => {
      e.preventDefault();
      const text = inputRef.current?.value.trim() || "";
      if (!text) return;
      if (inputRef.current) inputRef.current.value = "";
      await _handleSendTextContent(text);
    };

      const _handleSendTextContent = async (text: string) => {
      if (!text.trim()) return;
      if (!activeHistory.history_uuid) {
        setChatError("Hãy tạo hoặc chọn History trước!");
        return;
      }
      setChatError(null);

      const userMsg: ChatMessage = {
        uuid: uuidv4(),
        sender: "user",
        content: text,
        role: "user",
        created_at: new Date().toISOString()
      };
      setConversation((prev) => [...prev, userMsg]);

      try {
        setIsLoading(true);
        const res = await sendConversation({
          number_sentence: "1",
          sentences: text,
          history_uuid: activeHistory.history_uuid,
        });

        if (res.success && res.message) {
          const botMsg: ChatMessage = {
            uuid: uuidv4(),
            sender: "system",
            content: res.message,
            role: "system",
            created_at: new Date().toISOString()
          };
          setConversation((prev) => [...prev, botMsg]);
          setSuggestions(res.suggestions || []);
        }
      } catch (err) {
        console.error("sendText", err);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    if (state.user?.uuid) {
      getSavedWordsForUser(state.user.uuid).then(res => {
        if (res.success && Array.isArray(res.data)) {
          setSavedWords(res.data.map((row: any) => ({
            text: row.word,
            meaning: row.meaning
          })));
        }
      });
    }
  }, [state.user?.uuid]);

  const handleSaveWord = async (word: string, meaning: string) => {
  if (!state.user?.uuid) return;
  const res = await saveWordForUser(state.user.uuid, word, meaning);
  if (res.success && res.data) {
    // prepend to the UI list
    setSavedWords(prev => [{ text: res.data.word, meaning: res.data.meaning }, ...prev]);
  } else {
    console.error("Could not save word:", res.error);
  }
};


  /* ------------------------------- RENDER --------------------------------- */
  return (
    <>
      <Header />
      <div className="App">
        {/* --------------------------- SIDEBAR --------------------------- */}
        <div className="sidebar">
          {/* Histories */}
          <div className="titleSideBar">
            <h1>History</h1>
          </div>
          <div className="histories-section">
            <div className="newChat">
              <IoMdAddCircle size={30} color="white" />
              <button
                onClick={async () => {
                  if (state.user?.uuid) {
                    const res = await saveHistories({ user_uuid: state.user.uuid });
                    if (res.success) _handleFetchHistories({ uuid: state.user.uuid });
                  }
                }}
                disabled={histories.some((h) => h.createdAt === activeDate)}
              >
                Today
              </button>
            </div>
            <ListGroup className="list historyList">
              {histories.map((h) => (
                <ListGroupItem
                  key={h.uuid}
                  active={h.createdAt === activeDate}
                  onClick={() => {
                    setActiveHistory(h);
                    setActiveDate(h.createdAt);
                  }}
                  className="detailList"
                >
                  {h.createdAt}
                </ListGroupItem>
              ))}
            </ListGroup>
          </div>

          {/* Saved Words */}
          <div className="savedwords-section">
            <div className="titleSideBar" style={{ marginTop: 20 }}>
              <h1>Saved Words</h1>
            </div>
            <ListGroup className="list savedWordsList">
              {savedWords.map((w) => (
                <ListGroupItem
                  key={w.text}
                  active={selectedSavedWord?.text === w.text}
                  onClick={() => setSelectedSavedWord(w)}
                  className="detailList"
                >
                  {w.text}
                </ListGroupItem>
              ))}
            </ListGroup>
          </div>
        </div>

        {/* --------------------------- MAIN PANEL --------------------------- */}
        <div className="chatting">
          <div className="titleMain">
            <h1>Chatting</h1>
          </div>

          {/* --- Phần hiển thị từ vựng được tách biệt --- */}
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
                    <UserConversation content={msg.content} created_at={msg.created_at} />
                  ) : (
                    <BotConversation content={msg.content} created_at={msg.created_at} onSaveWord={handleSaveWord} />
                  )}
                </Fragment>
              ))}
            </div>
              {suggestions.length > 0 && (
              <div className="suggestions">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    className="suggestion-button"
                    onClick={() => {
                    if (inputRef.current) inputRef.current.value = s;
                    _handleSendTextContent(s);
                  }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="chatFooter">
              <div className="inp">
                <input
                  type="text"
                  ref={inputRef}
                  placeholder="Ask me anything...."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      _handleSendText(e);
                    }
                  }}
                />
                <button
                  style={{ width: "auto" }}
                  className={`micro ${isRecording ? 'recording' : ''}`}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? (
                    <FaMicrophone size={30} color="blue" />
                  ) : (
                    <FaMicrophone size={30} color="white" />
                  )}
                </button>
                <button className="send" onClick={_handleSendText}>
                  {isLoading ? (
                    <Spinner animation="border" variant="light" size="sm" />
                  ) : (
                    <IoSend size={30} color="white" />
                  )}
                </button>
              </div>
            </div>

          </div>

          {chatError && <div className="chat-error-message">{chatError}</div>}
        </div>
      </div>
    </>
  );
};

export default Chat;
