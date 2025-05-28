import React, { useState, useRef } from "react";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import TextToSpeech from "../TextToSpeech";
import TextSelector from "../TextSelector";

import { useAuth } from "../../providers/AuthContext";
import { ChatProps, Message } from "../../types/Chat";
import { generateConversation } from "../../services/openapi";

const Chat: React.FC<ChatProps> = () => {
  const { state } = useAuth();
  const [conversation, setConversation] = useState<Message[]>([]);
  const inputRef: any = useRef<HTMLInputElement>(null);

  // Integrate a speech recognition library (e.g., Web Speech API or third-party SDK)
  // Here's a simplified example using Web Speech API (requires additional setup):
  const handleSpeechInput = () => {
    if (!(window as any).SpeechRecognition) {
      console.error("Speech Recognition is not supported");
      return;
    }

    const recognition = new (window as any).SpeechRecognition();
    recognition.start();

    recognition.onresult = (event: any) => {
      const text = event.result[0][0].transcript;
      setConversation((prev) => [...prev, { sender: "User", content: text }]);
      handleUserInput(text); // Send user input for processing
    };
  };

  const handleUserInput = async (text: string) => {
    // Send user text to OpenAI API for processing
    try {
      const responseText = await generateConversation(text);
      setConversation((prev) => [
        ...prev,
        { sender: "System", content: responseText },
      ]);

      // Integrate a text-to-speech library (e.g., Web Speech API or third-party SDK)
      // Here's a simplified example using Web Speech API (requires additional setup):
      const synth = window.speechSynthesis;
      if (synth.speaking) {
        synth.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(responseText);
      synth.speak(utterance);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <ListGroup>
        {conversation.map((message) => (
          <ListGroupItem key={message.content}>
            <span
              style={{
                fontWeight: message.sender === "User" ? "bold" : "normal",
              }}
            >
              {message.sender}: {message.content}
              <TextToSpeech formText={message.sender} />
              <TextSelector />
            </span>
          </ListGroupItem>
        ))}
      </ListGroup>
      <div>
        <textarea ref={inputRef} />
      </div>
    </div>
  );
};

export default Chat;
