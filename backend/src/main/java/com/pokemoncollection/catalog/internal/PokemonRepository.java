package com.pokemoncollection.catalog.internal;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PokemonRepository extends JpaRepository<Pokemon, Integer> {

    List<Pokemon> findAllByDeprecatedFalseOrderByIdAsc();
}
