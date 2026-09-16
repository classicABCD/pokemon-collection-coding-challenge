package com.pokemoncollection.collection.internal;

import com.pokemoncollection.api.AddToCollectionRequestDto;
import com.pokemoncollection.api.CollectionApi;
import com.pokemoncollection.api.CollectionEntryDto;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
class CollectionController implements CollectionApi {

    private final CollectionService collection;

    CollectionController(CollectionService collection) {
        this.collection = collection;
    }

    @Override
    public ResponseEntity<CollectionEntryDto> addToCollection(AddToCollectionRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(collection.add(request.getPokemonId())));
    }

    @Override
    public ResponseEntity<List<CollectionEntryDto>> listCollection() {
        return ResponseEntity.ok(
                collection.list().stream().map(CollectionController::toDto).toList());
    }

    private static CollectionEntryDto toDto(CollectionService.CollectionItem item) {
        return new CollectionEntryDto(item.pokemon().toDto(), item.addedAt().atOffset(ZoneOffset.UTC));
    }
}
