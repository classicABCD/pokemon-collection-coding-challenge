package com.pokemoncollection.catalog;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * Public read API of the catalog module.
 */
public interface CatalogQuery {

    /** All Pokémon that are not deprecated, ordered by id. */
    List<PokemonView> findAllActive();

    /** A Pokémon by id, including deprecated ones. */
    Optional<PokemonView> findById(int id);

    /** Pokémon by ids, including deprecated ones. */
    List<PokemonView> findAllByIds(Collection<Integer> ids);
}
