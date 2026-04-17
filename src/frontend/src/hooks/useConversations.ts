import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { ConversationSummary as BackendConversationSummary } from "../backend";
import type { ConversationId, ConversationSummary } from "../types";

function mapSummary(s: BackendConversationSummary): ConversationSummary {
  return {
    id: String(s.id),
    title: s.title,
    messageCount: s.messageCount,
    updatedAt: s.updatedAt,
  };
}

export function useConversations() {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const query = useQuery<ConversationSummary[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.listConversations();
      return result.map(mapSummary);
    },
    enabled: !!actor && !isFetching,
  });

  const createMutation = useMutation<ConversationId, Error>({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const bigintId = await actor.createConversation();
      return String(bigintId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const deleteMutation = useMutation<boolean, Error, ConversationId>({
    mutationFn: async (id: ConversationId) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteConversation(BigInt(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const updateTitleMutation = useMutation<
    void,
    Error,
    { id: ConversationId; newTitle: string }
  >({
    mutationFn: async ({ id, newTitle }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.updateConversationTitle(
        BigInt(id),
        newTitle.trim(),
      );
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return {
    conversations: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createConversation: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteConversation: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    updateConversationTitle: updateTitleMutation.mutateAsync,
    isUpdatingTitle: updateTitleMutation.isPending,
  };
}
