package com.pokemoncollection.catalog.internal;

import com.pokemoncollection.api.CatalogApi;
import com.pokemoncollection.api.PokemonDto;
import com.pokemoncollection.catalog.CatalogQuery;
import com.pokemoncollection.catalog.PokemonView;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
class CatalogController implements CatalogApi {

    private final CatalogQuery catalog;

    CatalogController(CatalogQuery catalog) {
        this.catalog = catalog;
    }

    @Override
    public ResponseEntity<List<PokemonDto>> listPokemon() {
        return ResponseEntity.ok(catalog.findAllActive().stream().map(PokemonView::toDto).toList());
    }
}
