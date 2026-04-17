import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { AnonymousQuota } from "../types";

const FREE_LIMIT = 20;

export function useAnonymousQuota() {
  const { actor, isFetching } = useActor(createActor);

  const query = useQuery<AnonymousQuota>({
    queryKey: ["anonymousQuota"],
    queryFn: async () => {
      if (!actor)
        return {
          used: 0,
          limit: FREE_LIMIT,
          remaining: FREE_LIMIT,
          isExceeded: false,
        };
      const used = Number(
        await (
          actor as unknown as {
            getAnonymousMessageCount: () => Promise<bigint>;
          }
        ).getAnonymousMessageCount(),
      );
      const remaining = Math.max(0, FREE_LIMIT - used);
      return {
        used,
        limit: FREE_LIMIT,
        remaining,
        isExceeded: used >= FREE_LIMIT,
      };
    },
    enabled: !!actor && !isFetching,
  });

  return {
    quota: query.data ?? {
      used: 0,
      limit: FREE_LIMIT,
      remaining: FREE_LIMIT,
      isExceeded: false,
    },
    isLoading: query.isLoading,
  };
}
