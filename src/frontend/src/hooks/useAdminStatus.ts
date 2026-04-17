import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";

interface AdminStatus {
  isAdmin: boolean;
  hasOpenAIKey: boolean;
}

export function useAdminStatus() {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const query = useQuery<AdminStatus>({
    queryKey: ["adminStatus"],
    queryFn: async () => {
      if (!actor) return { isAdmin: false, hasOpenAIKey: false };
      const [isAdmin, hasOpenAIKey] = await Promise.all([
        (actor as unknown as { isAdmin: () => Promise<boolean> }).isAdmin(),
        (
          actor as unknown as { getOpenAIKeyStatus: () => Promise<boolean> }
        ).getOpenAIKeyStatus(),
      ]);
      return { isAdmin, hasOpenAIKey };
    },
    enabled: !!actor && !isFetching,
  });

  const setKeyMutation = useMutation<void, Error, string>({
    mutationFn: async (key: string) => {
      if (!actor) throw new Error("Actor not available");
      await (
        actor as unknown as { setOpenAIKey: (key: string) => Promise<void> }
      ).setOpenAIKey(key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminStatus"] });
    },
  });

  return {
    isAdmin: query.data?.isAdmin ?? false,
    hasOpenAIKey: query.data?.hasOpenAIKey ?? false,
    isLoading: query.isLoading,
    setOpenAIKey: setKeyMutation.mutateAsync,
    isSavingKey: setKeyMutation.isPending,
  };
}
