package com.pokemoncollection.catalog.internal;

import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PokemonRepository extends JpaRepository<Pokemon, Integer> {

    List<Pokemon> findAllByDeprecatedFalseOrderByIdAsc();

    @Query("select p.id from Pokemon p")
    Set<Integer> findAllIds();

    @Query("select p.id from Pokemon p where p.deprecated = true")
    Set<Integer> findDeprecatedIds();
}
