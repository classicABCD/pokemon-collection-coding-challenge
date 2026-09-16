package com.pokemoncollection.catalog.internal.sync;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app.catalog.sync")
public record CatalogSyncProperties(
        String baseUrl,
        boolean syncOnStartup,
        double maxDeprecationRatio,
        int maxConcurrentRequests) {
}
