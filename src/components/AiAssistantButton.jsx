import { useState } from "react";
import { aiChat } from "../services/api.js";
import styles from "./AiAssistantButton.module.css";

function AiAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi. Ask me about properties, booking, or how to use StayNest.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage() {
    const text = message.trim();

    if (!text || isLoading) {
      return;
    }

    setMessages((current) => [...current, { role: "user", content: text }]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await aiChat(text);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response.result || "I could not find a helpful answer.",
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error.message ||
            "AI assistant is currently unavailable. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className={styles.wrap}>
      {isOpen ? (
        <section className={styles.panel} aria-label="AI assistant chat">
          <header className={styles.header}>
            <div>
              <strong>AI Assistant</strong>
              <span>Rental help</span>
            </div>
            <button type="button" onClick={() => setIsOpen(false)}>
              Close
            </button>
          </header>

          <div className={styles.messages}>
            {messages.map((entry, index) => (
              <div
                key={`${entry.role}-${index}`}
                className={entry.role === "user" ? styles.user : styles.assistant}
              >
                {entry.content}
              </div>
            ))}
            {isLoading ? <div className={styles.assistant}>Thinking...</div> : null}
          </div>

          <div className={styles.inputRow}>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about properties or booking..."
            />
            <button type="button" onClick={sendMessage} disabled={isLoading}>
              Send
            </button>
          </div>
        </section>
      ) : null}

      <button
        className={styles.launcher}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Open AI assistant"
      >
        AI
      </button>
    </div>
  );
}

export default AiAssistantButton;
