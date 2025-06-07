import React from 'react';
import { ChatHeader } from './ChatHeader';
import { MessagesList } from '../ui/MessagesList';
import { MessageInput } from '../ui/MessageInput';

export function ChatContainer({
  messages,
  newMessage,
  setNewMessage,
  userId,
  loading,
  error,
  handleSubmit,
  dealStatus,
  handleDealClick,
  propertyFetched,
  propertyTitle
}) {
  
  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <ChatHeader propertyTitle={propertyTitle} dealStatus={dealStatus} propertyFetched={propertyFetched} handleDealClick={handleDealClick} />
      <MessagesList messages={messages} userId={userId} loading={loading} error={error} />
      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSubmit={handleSubmit}
        loading={loading}
        propertyFetched={propertyFetched}
      />
    </div>
  );
}