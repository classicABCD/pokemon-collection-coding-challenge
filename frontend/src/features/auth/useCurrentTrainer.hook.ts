import { QUERY_OPTIONS } from '../../api/api.const';
import { useGetCurrentTrainerQuery } from '../../api/pokemonApi';

/**
 * The logged-in trainer, or undefined, based on the (polled) session query.
 *
 * RTK Query subtleties handled here:
 * - After a failed refetch (session expired → 401), `data`/`currentData` still hold the last trainer.
 * - While polling after a 401, every refetch is "loading" again because no data was ever received.
 * `error` is kept until a request succeeds, so it is the stable signal for "not logged in".
 */
export const useCurrentTrainer = () => {
  const { currentData, error, isLoading } = useGetCurrentTrainerQuery(undefined, QUERY_OPTIONS);
  return {
    trainer: error ? undefined : currentData,
    /** Only the very first session check, not every poll. */
    isCheckingSession: isLoading && !error,
  };
};
