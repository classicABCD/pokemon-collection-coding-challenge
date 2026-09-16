import { useGetCurrentTrainerQuery } from '../../api/pokemonApi';

/**
 * The logged-in trainer, or undefined, based on the session query.
 *
 * The query is not polled, so the server-side idle timeout applies. An expired session is noticed on the next
 * request (401 → session re-check in baseApi.ts) or when the tab regains focus (refetchOnFocus).
 *
 * RTK Query subtleties handled here:
 * - After a failed refetch (session expired → 401), `data`/`currentData` still hold the last trainer.
 * - Refetches after a 401 are "loading" again because no data was ever received.
 * `error` is kept until a request succeeds, so it is the stable signal for "not logged in".
 */
export const useCurrentTrainer = () => {
  const { currentData, error, isLoading } = useGetCurrentTrainerQuery();
  return {
    trainer: error ? undefined : currentData,
    /** Only the very first session check, not every refetch. */
    isCheckingSession: isLoading && !error,
  };
};
