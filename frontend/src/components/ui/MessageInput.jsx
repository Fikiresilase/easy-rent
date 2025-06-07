import React from 'react';

export function MessageInput({ newMessage, setNewMessage, handleSubmit, disabled }) {
  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t border-gray-200 bg-white flex items-center gap-3 rounded-b-xl"
    >
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:bg-gray-100"
        disabled={disabled}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-[#3B5ED6] text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        disabled={disabled || !newMessage.trim()}
      >
        Send
      </button>
    </form>
  );
}