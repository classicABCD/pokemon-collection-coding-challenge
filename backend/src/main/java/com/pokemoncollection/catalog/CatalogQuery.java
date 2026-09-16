package com.pokemoncollection.catalog;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * Public read API of the catalog module.
 */
public interface CatalogQuery {

    /** All Pokémon including deprecated ones, ordered by id. */
    List<PokemonView> findAll();

    /** A Pokémon by id, including deprecated ones. */
    Optional<PokemonView> findById(int id);

    /** Pokémon by ids, including deprecated ones. */
    List<PokemonView> findAllByIds(Collection<Integer> ids);
}
