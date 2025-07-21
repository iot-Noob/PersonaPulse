import React from "react";

export const TextInputBox = ({ setPrompt, handleSubmit, loading, prompt }) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2">
        <textarea
          placeholder="Type your message..."
          rows={1}
          className="flex-1 p-3 rounded-xl text-white bg-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none max-h-40 overflow-y-auto"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
        />
        <button
          className="btn btn-sm btn-primary shrink-0 "
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <span className="loading loading-spinner" /> : "Send"}
        </button>
      </div>
    </>
  );
};
