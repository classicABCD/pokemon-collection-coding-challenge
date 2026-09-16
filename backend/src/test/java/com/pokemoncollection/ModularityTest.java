package com.pokemoncollection;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

/**
 * Fails the build if a module accesses another module's internals or a dependency cycle appears (ADR-1).
 */
class ModularityTest {

    @Test
    void verifyModuleBoundaries() {
        ApplicationModules.of(PokemonCollectionApplication.class).verify();
    }
}
