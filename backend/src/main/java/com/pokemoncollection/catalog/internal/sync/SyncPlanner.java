package com.pokemoncollection.catalog.internal.sync;

import java.util.HashSet;
import java.util.Set;

/**
 * Pure decision logic of the catalog sync: compares upstream ids with the local catalog.
 */
public final class SyncPlanner {

    private SyncPlanner() {}

    /**
     * @param upstreamIds         ids currently available in PokéAPI
     * @param knownIds            all ids in the local catalog (active and deprecated)
     * @param deprecatedIds       ids in the local catalog that are deprecated
     * @param maxDeprecationRatio max share of active Pokémon that may be deprecated in one run
     */
    public static SyncPlan plan(
            Set<Integer> upstreamIds, Set<Integer> knownIds, Set<Integer> deprecatedIds, double maxDeprecationRatio) {
        Set<Integer> activeIds = new HashSet<>(knownIds);
        activeIds.removeAll(deprecatedIds);

        Set<Integer> removed = new HashSet<>(activeIds);
        removed.removeAll(upstreamIds);

        Set<Integer> reappeared = new HashSet<>(deprecatedIds);
        reappeared.retainAll(upstreamIds);

        // Guard against upstream glitches (empty or truncated list): never mass-deprecate
        boolean skipDeprecation = !removed.isEmpty()
                && (upstreamIds.isEmpty() || removed.size() > activeIds.size() * maxDeprecationRatio);

        return new SyncPlan(
                Set.copyOf(upstreamIds),
                skipDeprecation ? Set.of() : Set.copyOf(removed),
                Set.copyOf(reappeared),
                skipDeprecation);
    }

    public record SyncPlan(
            Set<Integer> toUpsert, Set<Integer> toDeprecate, Set<Integer> toReactivate, boolean deprecationSkipped) {}
}
