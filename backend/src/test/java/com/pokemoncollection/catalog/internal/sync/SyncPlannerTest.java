package com.pokemoncollection.catalog.internal.sync;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;

class SyncPlannerTest {

    private static final double MAX_RATIO = 0.1;

    @Test
    void newAndExistingPokemonAreUpserted() {
        var plan = SyncPlanner.plan(Set.of(1, 2, 3), Set.of(1, 2), Set.of(), MAX_RATIO);

        assertThat(plan.toUpsert()).containsExactlyInAnyOrder(1, 2, 3);
        assertThat(plan.toDeprecate()).isEmpty();
    }

    @Test
    void pokemonMissingUpstreamIsDeprecated() {
        var plan = SyncPlanner.plan(ids(1, 19), ids(1, 20), Set.of(), MAX_RATIO);

        assertThat(plan.toDeprecate()).containsExactly(20);
        assertThat(plan.deprecationSkipped()).isFalse();
    }

    @Test
    void reappearedPokemonIsReactivated() {
        var plan = SyncPlanner.plan(Set.of(1, 2), Set.of(1, 2), Set.of(2), MAX_RATIO);

        assertThat(plan.toReactivate()).containsExactly(2);
        assertThat(plan.toDeprecate()).isEmpty();
    }

    @Test
    void alreadyDeprecatedPokemonIsNotDeprecatedAgain() {
        var plan = SyncPlanner.plan(ids(1, 19), ids(1, 20), Set.of(20), MAX_RATIO);

        assertThat(plan.toDeprecate()).isEmpty();
    }

    @Test
    void emptyUpstreamListNeverDeprecates() {
        var plan = SyncPlanner.plan(Set.of(), ids(1, 20), Set.of(), MAX_RATIO);

        assertThat(plan.toDeprecate()).isEmpty();
        assertThat(plan.deprecationSkipped()).isTrue();
    }

    @Test
    void truncatedUpstreamListNeverMassDeprecates() {
        var plan = SyncPlanner.plan(ids(1, 10), ids(1, 20), Set.of(), MAX_RATIO);

        assertThat(plan.toDeprecate()).isEmpty();
        assertThat(plan.deprecationSkipped()).isTrue();
    }

    @Test
    void initialLoadHasNothingToDeprecate() {
        var plan = SyncPlanner.plan(ids(1, 20), Set.of(), Set.of(), MAX_RATIO);

        assertThat(plan.toUpsert()).hasSize(20);
        assertThat(plan.deprecationSkipped()).isFalse();
    }

    private static Set<Integer> ids(int fromInclusive, int toInclusive) {
        return IntStream.rangeClosed(fromInclusive, toInclusive).boxed().collect(Collectors.toSet());
    }
}
