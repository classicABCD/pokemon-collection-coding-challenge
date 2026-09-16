package com.pokemoncollection.catalog.internal.sync;

import com.pokemoncollection.catalog.internal.PokemonRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
class CatalogSyncJob {

    private final CatalogSync sync;
    private final PokemonRepository pokemon;
    private final CatalogSyncProperties properties;

    CatalogSyncJob(CatalogSync sync, PokemonRepository pokemon, CatalogSyncProperties properties) {
        this.sync = sync;
        this.pokemon = pokemon;
        this.properties = properties;
    }

    /** Initial load in the background, so the app is available immediately. */
    @Async
    @EventListener(ApplicationReadyEvent.class)
    public void initialSync() {
        syncIfEmpty();
    }

    /**
     * Retries the initial load until the catalog has data, e.g. if PokéAPI was unreachable on the first start. Only the
     * cheap id list request is repeated while PokéAPI stays unreachable; a filled catalog is left to the nightly sync.
     */
    @Scheduled(
            initialDelayString = "${app.catalog.sync.initial-sync-retry-delay}",
            fixedDelayString = "${app.catalog.sync.initial-sync-retry-delay}")
    public void retryInitialSyncWhileEmpty() {
        syncIfEmpty();
    }

    @Scheduled(cron = "${app.catalog.sync.cron}")
    public void scheduledSync() {
        sync.run();
    }

    void syncIfEmpty() {
        if (properties.initialSync() && pokemon.count() == 0) {
            sync.run();
        }
    }
}
