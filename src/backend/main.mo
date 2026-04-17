import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Types "types/common";
import ChatMixin "mixins/chat-api";
import AdminMixin "mixins/admin-api";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Conversations keyed by ConversationId
  let conversations = Map.empty<Types.ConversationId, Types.Conversation>();

  // Anonymous message counts keyed by Principal
  let anonCounts = Map.empty<Principal, Nat>();

  // Mutable counters: "nextConversationId" -> Nat
  let counters = Map.empty<Text, Nat>();

  include ChatMixin(accessControlState, conversations, anonCounts, counters);
  include AdminMixin(accessControlState);
};
