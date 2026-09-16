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
    public void syncOnStartupIfEmpty() {
        if (properties.syncOnStartup() && pokemon.count() == 0) {
            sync.run();
        }
    }

    @Scheduled(cron = "${app.catalog.sync.cron}")
    public void scheduledSync() {
        sync.run();
    }
}
