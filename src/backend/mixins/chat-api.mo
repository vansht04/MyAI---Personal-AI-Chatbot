import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Types "../types/common";
import ChatTypes "../types/chat";
import ChatLib "../lib/chat";
import OpenAI "../lib/openai";

mixin (
  accessControlState : AccessControl.AccessControlState,
  conversations : Map.Map<Types.ConversationId, Types.Conversation>,
  anonCounts : Map.Map<Principal, Nat>,
  counters : Map.Map<Text, Nat>,
) {
  let FREE_TIER_LIMIT : Nat = 20;

  // Transform callback required by the IC for HTTP outcalls
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input)
  };

  func getNextId() : Nat {
    switch (counters.get("nextConversationId")) {
      case null 1;
      case (?n) n;
    }
  };

  public shared ({ caller }) func createConversation() : async Types.ConversationId {
    let nextId = getNextId();
    let (convId, newNextId) = ChatLib.createConversation(conversations, nextId, caller);
    counters.add("nextConversationId", newNextId);
    convId
  };

  public shared ({ caller }) func sendMessage(conversationId : Types.ConversationId, text : Text) : async Types.SendMessageResult {
    // Check free tier limit for anonymous users
    if (caller.isAnonymous()) {
      if (ChatLib.isAnonymousLimitReached(anonCounts, caller, FREE_TIER_LIMIT)) {
        return #freeTierLimitReached;
      };
    };

    // Add user message to conversation
    let userMsgResult = ChatLib.addMessage(conversations, conversationId, #user, text, caller);
    let conv = switch (userMsgResult) {
      case null { return #notFound };
      case (?c) c;
    };

    // Build messages array for Pollinations.ai request
    let aiMessages = conv.messages.map(
      func(msg : Types.Message) : { role : Text; content : Text } {
        let roleText = switch (msg.role) {
          case (#user) "user";
          case (#assistant) "assistant";
        };
        { role = roleText; content = msg.content }
      }
    );

    let requestBody = OpenAI.buildRequestBody(aiMessages);

    // Call Pollinations.ai API (no API key required)
    let responseJson = try {
      await OpenAI.callChatCompletion(requestBody, transform)
    } catch (_) {
      return #notFound;
    };

    // Parse assistant response
    let assistantContent = OpenAI.parseResponseContent(responseJson);

    // Add assistant message to conversation
    let assistantMsgResult = ChatLib.addMessage(conversations, conversationId, #assistant, assistantContent, caller);
    let updatedConv = switch (assistantMsgResult) {
      case null { return #notFound };
      case (?c) c;
    };

    // Increment anon count after successful message
    if (caller.isAnonymous()) {
      ignore ChatLib.incrementAnonCount(anonCounts, caller);
    };

    // Return the assistant message (last message in the updated conversation)
    let msgCount = updatedConv.messages.size();
    if (msgCount == 0) {
      return #notFound;
    };
    let lastMsg = updatedConv.messages[msgCount - 1];

    #ok(lastMsg)
  };

  public query ({ caller }) func getConversation(id : Types.ConversationId) : async ?Types.Conversation {
    ChatLib.getConversation(conversations, id, caller)
  };

  public query ({ caller }) func listConversations() : async [ChatTypes.ConversationSummary] {
    ChatLib.listConversations(conversations, caller)
  };

  public shared ({ caller }) func deleteConversation(id : Types.ConversationId) : async Bool {
    ChatLib.deleteConversation(conversations, id, caller)
  };

  public query ({ caller }) func getAnonymousMessageCount() : async Nat {
    ChatLib.getAnonCount(anonCounts, caller)
  };

  public shared ({ caller }) func updateConversationTitle(conversationId : Types.ConversationId, newTitle : Text) : async { #ok; #err : Text } {
    switch (ChatLib.updateConversationTitle(conversations, conversationId, newTitle, caller)) {
      case (#ok) #ok;
      case (#notFound) #err("Conversation not found");
      case (#unauthorized) #err("You do not own this conversation");
      case (#invalidTitle(msg)) #err(msg);
    }
  };
};
