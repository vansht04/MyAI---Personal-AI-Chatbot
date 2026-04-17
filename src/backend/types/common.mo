module {
  public type Timestamp = Int;
  public type ConversationId = Nat;

  public type MessageRole = { #user; #assistant };

  public type Message = {
    role : MessageRole;
    content : Text;
    timestamp : Timestamp;
  };

  public type Conversation = {
    id : ConversationId;
    owner : Principal;
    title : Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
    messages : [Message];
  };

  public type SendMessageResult = {
    #ok : Message;
    #freeTierLimitReached;
    #notFound;
    #unauthorized;
  };
};
