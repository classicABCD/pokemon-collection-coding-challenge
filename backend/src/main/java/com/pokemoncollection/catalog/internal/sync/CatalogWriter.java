package com.pokemoncollection.catalog.internal.sync;

import com.pokemoncollection.catalog.internal.Pokemon;
import com.pokemoncollection.catalog.internal.PokemonRepository;
import java.time.Instant;
import java.util.Set;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Transactional writes of the sync. One small transaction per Pokémon, so a failure never loses the whole run.
 */
@Component
class CatalogWriter {

    private final PokemonRepository pokemon;

    CatalogWriter(PokemonRepository pokemon) {
        this.pokemon = pokemon;
    }

    @Transactional
    public void upsert(PokeApiClient.PokemonDetails details) {
        Instant now = Instant.now();
        pokemon.findById(details.id()).ifPresentOrElse(
                existing -> existing.update(details.name(), details.types(), details.spriteUrl(), now),
                () -> pokemon.save(new Pokemon(details.id(), details.name(), details.types(), details.spriteUrl(), now)));
    }

    @Transactional
    public void applyDeprecation(Set<Integer> toDeprecate, Set<Integer> toReactivate) {
        Instant now = Instant.now();
        pokemon.findAllById(toDeprecate).forEach(p -> p.deprecate(now));
        pokemon.findAllById(toReactivate).forEach(Pokemon::reactivate);
    }
}
