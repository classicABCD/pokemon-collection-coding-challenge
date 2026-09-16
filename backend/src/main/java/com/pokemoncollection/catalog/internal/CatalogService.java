package com.pokemoncollection.catalog.internal;

import com.pokemoncollection.catalog.CatalogQuery;
import com.pokemoncollection.catalog.PokemonView;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
class CatalogService implements CatalogQuery {

    private final PokemonRepository pokemon;

    CatalogService(PokemonRepository pokemon) {
        this.pokemon = pokemon;
    }

    @Override
    public List<PokemonView> findAllActive() {
        return pokemon.findAllByDeprecatedFalseOrderByIdAsc().stream().map(Pokemon::toView).toList();
    }

    @Override
    public Optional<PokemonView> findById(int id) {
        return pokemon.findById(id).map(Pokemon::toView);
    }

    @Override
    public List<PokemonView> findAllByIds(Collection<Integer> ids) {
        return pokemon.findAllById(ids).stream().map(Pokemon::toView).toList();
    }
}
