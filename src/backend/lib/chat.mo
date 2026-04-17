import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Types "../types/common";
import ChatTypes "../types/chat";

module {
  public func createConversation(
    conversations : Map.Map<Types.ConversationId, Types.Conversation>,
    nextId : Nat,
    owner : Principal,
  ) : (Types.ConversationId, Nat) {
    let now = Time.now();
    let conv : Types.Conversation = {
      id = nextId;
      owner = owner;
      title = "New Conversation";
      createdAt = now;
      updatedAt = now;
      messages = [];
    };
    conversations.add(nextId, conv);
    (nextId, nextId + 1)
  };

  func truncateTitle(content : Text) : Text {
    let maxLen = 50;
    if (content.size() <= maxLen) {
      content
    } else {
      var t = "";
      var count = 0;
      label truncLoop for (c in content.toIter()) {
        if (count >= maxLen) break truncLoop;
        t #= Text.fromChar(c);
        count += 1;
      };
      t # "..."
    }
  };

  public func addMessage(
    conversations : Map.Map<Types.ConversationId, Types.Conversation>,
    conversationId : Types.ConversationId,
    role : Types.MessageRole,
    content : Text,
    caller : Principal,
  ) : ?Types.Conversation {
    switch (conversations.get(conversationId)) {
      case null null;
      case (?conv) {
        // Allow access if caller owns the conversation (including anonymous owners)
        if (not Principal.equal(conv.owner, caller)) {
          null
        } else {
          let msg : Types.Message = {
            role = role;
            content = content;
            timestamp = Time.now();
          };
          let msgs = List.fromArray<Types.Message>(conv.messages);
          msgs.add(msg);
          let title = if (conv.title == "New Conversation" and role == #user) {
            truncateTitle(content)
          } else {
            conv.title
          };
          let updated : Types.Conversation = {
            conv with
            messages = msgs.toArray();
            updatedAt = Time.now();
            title = title;
          };
          conversations.add(conversationId, updated);
          ?updated
        }
      };
    }
  };

  public func getConversation(
    conversations : Map.Map<Types.ConversationId, Types.Conversation>,
    conversationId : Types.ConversationId,
    caller : Principal,
  ) : ?Types.Conversation {
    switch (conversations.get(conversationId)) {
      case null null;
      case (?conv) {
        if (Principal.equal(conv.owner, caller)) {
          ?conv
        } else {
          null
        }
      };
    }
  };

  public func listConversations(
    conversations : Map.Map<Types.ConversationId, Types.Conversation>,
    caller : Principal,
  ) : [ChatTypes.ConversationSummary] {
    let results = List.empty<ChatTypes.ConversationSummary>();
    for ((_, conv) in conversations.entries()) {
      if (Principal.equal(conv.owner, caller)) {
        results.add({
          id = conv.id;
          title = conv.title;
          createdAt = conv.createdAt;
          updatedAt = conv.updatedAt;
          messageCount = conv.messages.size();
        });
      };
    };
    results.toArray()
  };

  public func deleteConversation(
    conversations : Map.Map<Types.ConversationId, Types.Conversation>,
    conversationId : Types.ConversationId,
    caller : Principal,
  ) : Bool {
    switch (conversations.get(conversationId)) {
      case null false;
      case (?conv) {
        if (Principal.equal(conv.owner, caller)) {
          conversations.remove(conversationId);
          true
        } else {
          false
        }
      };
    }
  };

  public func isAnonymousLimitReached(
    anonCounts : Map.Map<Principal, Nat>,
    caller : Principal,
    limit : Nat,
  ) : Bool {
    let count = switch (anonCounts.get(caller)) {
      case null 0;
      case (?n) n;
    };
    count >= limit
  };

  public func incrementAnonCount(
    anonCounts : Map.Map<Principal, Nat>,
    caller : Principal,
  ) : Nat {
    let current = switch (anonCounts.get(caller)) {
      case null 0;
      case (?n) n;
    };
    let next = current + 1;
    anonCounts.add(caller, next);
    next
  };

  public func getAnonCount(
    anonCounts : Map.Map<Principal, Nat>,
    caller : Principal,
  ) : Nat {
    switch (anonCounts.get(caller)) {
      case null 0;
      case (?n) n;
    }
  };

  public func updateConversationTitle(
    conversations : Map.Map<Types.ConversationId, Types.Conversation>,
    conversationId : Types.ConversationId,
    newTitle : Text,
    caller : Principal,
  ) : { #ok; #notFound; #unauthorized; #invalidTitle : Text } {
    let trimmed = newTitle.trim(#char ' ');
    if (trimmed.size() == 0) {
      return #invalidTitle("Title cannot be empty");
    };
    if (trimmed.size() > 100) {
      return #invalidTitle("Title cannot exceed 100 characters");
    };
    switch (conversations.get(conversationId)) {
      case null #notFound;
      case (?conv) {
        if (not Principal.equal(conv.owner, caller)) {
          #unauthorized
        } else {
          let updated : Types.Conversation = {
            conv with
            title = trimmed;
            updatedAt = Time.now();
          };
          conversations.add(conversationId, updated);
          #ok
        }
      };
    }
  };
};
