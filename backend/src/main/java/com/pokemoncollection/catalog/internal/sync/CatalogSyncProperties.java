package com.pokemoncollection.catalog.internal.sync;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @param initialSync loads the catalog on startup and retries until it has data (disabled in tests)
 */
@ConfigurationProperties("app.catalog.sync")
public record CatalogSyncProperties(
        String baseUrl, boolean initialSync, double maxDeprecationRatio, int maxConcurrentRequests) {}
