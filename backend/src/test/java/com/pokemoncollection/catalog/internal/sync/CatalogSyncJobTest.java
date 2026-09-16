package com.pokemoncollection.catalog.internal.sync;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pokemoncollection.catalog.internal.PokemonRepository;
import org.junit.jupiter.api.Test;

class CatalogSyncJobTest {

    private final CatalogSync sync = mock(CatalogSync.class);
    private final PokemonRepository pokemon = mock(PokemonRepository.class);

    @Test
    void retrySyncsWhileCatalogIsEmpty() {
        when(pokemon.count()).thenReturn(0L);

        job(true).retryInitialSyncWhileEmpty();

        verify(sync).run();
    }

    @Test
    void retryLeavesAFilledCatalogToTheNightlySync() {
        when(pokemon.count()).thenReturn(1350L);

        job(true).retryInitialSyncWhileEmpty();

        verify(sync, never()).run();
    }

    @Test
    void noInitialSyncWhenDisabled() {
        when(pokemon.count()).thenReturn(0L);

        job(false).retryInitialSyncWhileEmpty();

        verify(sync, never()).run();
    }

    private CatalogSyncJob job(boolean initialSync) {
        return new CatalogSyncJob(sync, pokemon, new CatalogSyncProperties("http://pokeapi", initialSync, 0.1, 10));
    }
}
