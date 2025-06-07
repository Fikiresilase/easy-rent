import React, { useEffect, useRef } from 'react';

export function MessagesList({ messages, userId, loading }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-100 space-y-3">
      {loading && (
        <div className="text-center text-gray-500 text-sm">Loading messages...</div>
      )}
      {!loading && messages.length === 0 && (
        <div className="text-center text-gray-500 text-sm">No messages yet</div>
      )}
      {messages.map((message) => {
        const isUser = (message.senderId?._id || message.senderId) === userId;
        return (
          <div
            key={message._id}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                isUser ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900 shadow-sm'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${isUser ? 'text-indigo-100' : 'text-gray-500'}`}>
                {new Date(message.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}