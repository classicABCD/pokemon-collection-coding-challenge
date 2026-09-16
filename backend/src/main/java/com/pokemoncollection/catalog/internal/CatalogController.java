package com.pokemoncollection.catalog.internal;

import com.pokemoncollection.api.CatalogApi;
import com.pokemoncollection.api.CatalogSyncStateDto;
import com.pokemoncollection.api.CatalogSyncStatusDto;
import com.pokemoncollection.api.PokemonDto;
import com.pokemoncollection.catalog.CatalogQuery;
import com.pokemoncollection.catalog.PokemonView;
import com.pokemoncollection.catalog.internal.sync.CatalogSync;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
class CatalogController implements CatalogApi {

    private final CatalogQuery catalog;
    private final CatalogSync sync;

    CatalogController(CatalogQuery catalog, CatalogSync sync) {
        this.catalog = catalog;
        this.sync = sync;
    }

    @Override
    public ResponseEntity<List<PokemonDto>> listPokemon() {
        return ResponseEntity.ok(
                catalog.findAll().stream().map(PokemonView::toDto).toList());
    }

    @Override
    public ResponseEntity<CatalogSyncStatusDto> getCatalogSyncStatus() {
        CatalogSyncStateDto state =
                switch (sync.state()) {
                    case IDLE -> CatalogSyncStateDto.IDLE;
                    case RUNNING -> CatalogSyncStateDto.RUNNING;
                    case FAILED -> CatalogSyncStateDto.FAILED;
                };
        return ResponseEntity.ok(new CatalogSyncStatusDto(state));
    }
}
