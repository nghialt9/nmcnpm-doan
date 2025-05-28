import React, { useState, useEffect, useRef, Fragment } from "react";
import { IoSend } from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa6";
import { IoMdAddCircle } from "react-icons/io";
import { RiLogoutBoxRFill } from "react-icons/ri";
import { useAuth } from "../../providers/AuthContext";
import { saveHistories } from "../../services/chat";
import { SubmitConversation } from "../../types/Chat";
import { sendConversation } from "../../services/chat";
import { ListGroup, ListGroupItem, Spinner } from "react-bootstrap";
import { getHistories, getConversationByHistoryId } from "../../services/chat";

import UserConversation from "./Conversation/User";
import BotConversation from "./Conversation/Bot";

import "./chatui.css";
import Header from "../Header";

interface Message {
  sender: string;
  content: string;
}

interface ChatProps {}

const SpeechRecognition: any =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const Chat: React.FC<ChatProps> = () => {
  const { state, logout: serviceLoggout } = useAuth();
  const [histories, setHistories] = useState<any[]>([]);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [activeHistory, setActiveHistory] = useState<any>({});
  const [activeDate, setActiveDate] = useState<string>("");
  const [isRecording, setIsRecording] = useState<any>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const inputRef: any = useRef<HTMLInputElement>(null);

  useEffect(() => {
    _handleInitSpeechRecognition();
  }, []); // Adding transcription as a dependency

  const _handleInitSpeechRecognition = () => {
    // Check if the browser supports SpeechRecognition
    if (!SpeechRecognition) {
      alert(
        "Your browser does not support Speech Recognition. Please use a supported browser."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      console.log("recognition.onresult", event.results);
      let interimTranscript = "";

      const results: any = event.results;
      const resultLength = results.length;

      if (resultLength !== 0) {
        for (let i = 0; i < resultLength; i++) {
          const transcript = results[i][0].transcript;
          interimTranscript += transcript;
        }
      }

      console.log("interimTranscript", interimTranscript);

      inputRef.current.value = interimTranscript;
    };

    recognitionRef.current = recognition;
  };

  const startRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();

      setIsRecording(false);
    }
  };

  useEffect(() => {
    _handleFetchHistories({ uuid: state.user?.uuid });
  }, []);

  useEffect(() => {
    if (activeDate.length) {
      _handleFetchConversation(activeHistory.history_uuid || "");
    }
  }, [activeHistory.history_uuid, activeDate]);

  useEffect(() => {
    let object: any = document.getElementsByClassName("chats")[0];
    object.scrollTop = object.scrollHeight;
  }, [conversation]);

  const _handleFetchHistories = async ({ uuid }: any) => {
    try {
      const data: any = await getHistories({ uuid });
      setHistories(data || []);
    } catch (error) {
      console.error("Error _handleFetchHistories:", error);
    }
  };

  const _handleFetchConversation = async (history_uuid: string) => {
    try {
      const data: any = await getConversationByHistoryId(history_uuid);
      setConversation(data?.conversations);
    } catch (error) {
      console.error("Error _handleFetchHistories:", error);
    }
  };

  const _handleSendText = async (event: any) => {
    event.preventDefault();
    console.log("_handleSendText", inputRef.current.value);
    try {
      setIsLoading(true);
      const submitConversation: SubmitConversation = {
        number_sentence: "123",
        sentences: inputRef.current.value,
        history_uuid: activeHistory.history_uuid,
      };
      const response = await sendConversation(submitConversation);
      await _handleFetchConversation(activeHistory.history_uuid);
      inputRef.current.value = "";
      console.log(response);
    } catch (error) {
      console.error("Error _handleSendText:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const _handleCreateHistory = async () => {
    try {
      // if (_handleDisabledCreateNewHistory()) return;
      const response: any = await saveHistories({
        user_uuid: state?.user?.uuid,
      });
      await _handleFetchHistories({ uuid: state?.user?.uuid });
    } catch (error) {
      console.error("Error _handleCreateHistory:", error);
    }
  };

  const _handleActivateHistory = (history: any) => {
    setActiveHistory(history);
    setActiveDate(history.createdAt);
  };

  const _handleDisabledCreateNewHistory = () => {
    const today = new Date();
    const date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    const exist = histories.find((history) => history.createdAt === date);
    return Boolean(!exist);
  };

  console.log(
    "_handleDisabledCreateNewHistory",
    _handleDisabledCreateNewHistory()
  );

  return (
    <>
      <Header />

      <div className="App">
        <div className="sidebar">
          <div className="titleSideBar">
            <h1>History</h1>
          </div>
          <div className="top">
            <div className="newChat">
              <IoMdAddCircle size={30} color="white" />
              <button
                // disabled={_handleDisabledCreateNewHistory()}
                onClick={_handleCreateHistory}
              >
                Today
              </button>
            </div>
            <div className="historyList">
              <ListGroup className="list">
                {histories.map((history, _) => (
                  <ListGroupItem
                    key={history.uuid}
                    active={history.createdAt === activeDate}
                    className="detailList"
                    onClick={() => _handleActivateHistory(history)}
                  >
                    {history?.createdAt}
                  </ListGroupItem>
                ))}
              </ListGroup>
            </div>
          </div>

          {/* <div className="bottom"></div> */}
        </div>
        <div className="chatting">
          <div className="titleMain">
            <h1>Chatting</h1>
          </div>
          <div className="main">
            <div className="chats">
              {
                // Render chat messages here
                conversation.map((msg: any, _) => (
                  <Fragment key={msg?.uuid}>
                    {msg?.role === "user" ? (
                      <UserConversation content={msg.content} />
                    ) : (
                      <BotConversation content={msg.content} />
                    )}
                  </Fragment>
                ))
              }
            </div>

            <div className="chatFooter">
              <div className="inp">
                <input
                  type="text"
                  ref={inputRef}
                  placeholder="Ask me anything...."
                />
                <button
                  style={{ width: "auto" }}
                  className="micro"
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
        </div>
      </div>
    </>
  );
};

export default Chat;
