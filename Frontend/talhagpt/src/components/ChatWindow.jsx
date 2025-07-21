import React from "react";
import MarkdownMessage from "./MarkdownMessage";
import EChartsRenderer from "./EChartsRenderer";
const ChatWindow = ({ chatHistory, sref, Mode, chatEndRef }) => {
  return (
    <>
      <div className="flex-1 w-full h-full">
        <div
          className="h-[calc(100vh-200px)] overflow-y-auto pr-2 space-y-4"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#888 transparent",
          }}
        >
          {chatHistory.map((chat, index) => (
            <div key={index}>
              {/* User message */}
              <div className="chat chat-end">
                <div className="chat-bubble bg-base-200 text-black text-sm max-w-xl">
                  {chat.user}
                </div>
              </div>
              <div className="chat chat-start" ref={sref}>
                <div className="chat-bubble bg-primary text-white text-sm max-w-[80vw] sm:max-w-xl">
                  <MarkdownMessage
                    content={Mode === "Prompt" ? chat.bot : chat.bot?.message}
                    key={`msg-${index}`}
                  />
                  {Mode === "Analytical" && typeof chat.bot === "object" && (
                    <EChartsRenderer
                      option={chat.bot.echartsOption}
                      key={`chart-${index}`}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>
    </>
  );
};

export default ChatWindow;
