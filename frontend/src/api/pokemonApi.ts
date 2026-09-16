import { TAG_TYPES } from './api.const';
import { errorStatus } from './apiError.util';
import { baseApi } from './baseApi';
import { generatedApi } from './generated';

/**
 * Cache invalidation on top of the generated endpoints. Components import hooks from here, never from generated.ts.
 *
 * - addToCollection invalidates `collection` (generated from the OpenAPI tag)
 * - login/register invalidate everything: no cached data of a previous trainer survives a new session
 * - logout resets the whole cache once the session is gone (also if it had already expired: 401)
 */
export const pokemonApi = generatedApi.enhanceEndpoints({
  endpoints: {
    login: { invalidatesTags: [...TAG_TYPES] },
    register: { invalidatesTags: [...TAG_TYPES] },
    logout: {
      invalidatesTags: [],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(baseApi.util.resetApiState());
        } catch (rejection) {
          if (errorStatus((rejection as { error?: unknown }).error) === 401) {
            dispatch(baseApi.util.resetApiState());
          }
        }
      },
    },
  },
});

export const {
  useAddToCollectionMutation,
  useGetCurrentTrainerQuery,
  useListCollectionQuery,
  useListPokemonQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
} = pokemonApi;

export type { CollectionEntry, LoginRequest, Pokemon, Trainer } from './generated';
