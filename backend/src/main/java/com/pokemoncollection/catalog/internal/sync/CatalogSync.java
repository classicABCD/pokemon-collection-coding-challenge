package com.pokemoncollection.catalog.internal.sync;

import com.pokemoncollection.catalog.internal.PokemonRepository;
import java.util.HashSet;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Aligns the local catalog with PokéAPI. PokéAPI being unavailable never changes the local catalog.
 */
@Service
public class CatalogSync {

    private static final Logger log = LoggerFactory.getLogger(CatalogSync.class);

    private final PokeApiClient client;
    private final CatalogWriter writer;
    private final PokemonRepository pokemon;
    private final CatalogSyncProperties properties;
    private final AtomicBoolean running = new AtomicBoolean(false);

    CatalogSync(PokeApiClient client, CatalogWriter writer, PokemonRepository pokemon,
            CatalogSyncProperties properties) {
        this.client = client;
        this.writer = writer;
        this.pokemon = pokemon;
        this.properties = properties;
    }

    public void run() {
        if (!running.compareAndSet(false, true)) {
            log.info("Catalog sync already running, skipping");
            return;
        }
        try {
            doRun();
        } finally {
            running.set(false);
        }
    }

    private void doRun() {
        HashSet<Integer> upstreamIds;
        try {
            upstreamIds = new HashSet<>(client.fetchAllIds());
        } catch (RuntimeException e) {
            log.warn("Catalog sync aborted, PokéAPI unavailable: {}", e.getMessage());
            return;
        }

        SyncPlanner.SyncPlan plan = SyncPlanner.plan(upstreamIds, pokemon.findAllIds(), pokemon.findDeprecatedIds(),
                properties.maxDeprecationRatio());
        log.info("Catalog sync started: {} upstream, {} to deprecate, {} to reactivate",
                plan.toUpsert().size(), plan.toDeprecate().size(), plan.toReactivate().size());

        AtomicInteger failures = new AtomicInteger();
        Semaphore permits = new Semaphore(properties.maxConcurrentRequests());
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int id : plan.toUpsert()) {
                executor.submit(() -> {
                    try {
                        permits.acquire();
                        try {
                            writer.upsert(client.fetchDetails(id));
                        } finally {
                            permits.release();
                        }
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    } catch (RuntimeException e) {
                        // Keep the last known data of this Pokémon
                        failures.incrementAndGet();
                        log.debug("Could not sync Pokémon {}: {}", id, e.getMessage());
                    }
                });
            }
        }

        if (plan.deprecationSkipped()) {
            log.warn("Deprecation skipped: upstream list looks incomplete ({} ids)", upstreamIds.size());
        }
        writer.applyDeprecation(plan.toDeprecate(), plan.toReactivate());
        log.info("Catalog sync finished: {} failed", failures.get());
    }
}
