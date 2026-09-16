package com.pokemoncollection.collection.internal;

import com.pokemoncollection.api.CollectionApi;
import com.pokemoncollection.api.model.AddToCollectionRequest;
import com.pokemoncollection.api.model.CollectionEntry;
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
    public ResponseEntity<CollectionEntry> addToCollection(AddToCollectionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(collection.add(request.getPokemonId())));
    }

    @Override
    public ResponseEntity<List<CollectionEntry>> listCollection() {
        return ResponseEntity.ok(collection.list().stream().map(CollectionController::toDto).toList());
    }

    private static CollectionEntry toDto(CollectionService.CollectionItem item) {
        return new CollectionEntry(item.pokemon().toDto(), item.addedAt().atOffset(ZoneOffset.UTC));
    }
}
