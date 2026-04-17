import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  Conversation as BackendConversation,
  Message as BackendMessage,
} from "../backend";
import type { Conversation, ConversationId, Message } from "../types";

function mapMessage(m: BackendMessage, index: number): Message {
  return {
    id: `${String(m.timestamp)}-${index}`,
    role: m.role === "user" ? "user" : "assistant",
    content: m.content,
    timestamp: m.timestamp,
  };
}

function mapConversation(c: BackendConversation): Conversation {
  return {
    id: String(c.id),
    title: c.title,
    messages: c.messages.map(mapMessage),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export function useConversation(id: ConversationId | null) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<Conversation | null>({
    queryKey: ["conversation", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      const result = await actor.getConversation(BigInt(id));
      if (!result) return null;
      return mapConversation(result);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useSendMessage(conversationId: ConversationId | null) {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<Message, Error, string>({
    mutationFn: async (text: string) => {
      if (!actor || !conversationId)
        throw new Error("Actor or conversation not available");

      const result = await actor.sendMessage(BigInt(conversationId), text);

      if (result.__kind__ === "ok") {
        // Index 0 is fine for optimistic messages — real data refreshes via invalidation
        return mapMessage(result.ok, Date.now());
      }
      if (result.__kind__ === "freeTierLimitReached") {
        throw new Error("freeTierLimitReached");
      }
      if (result.__kind__ === "unauthorized") {
        throw new Error("unauthorized");
      }
      throw new Error("notFound");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["anonymousQuota"] });
    },
  });
}
