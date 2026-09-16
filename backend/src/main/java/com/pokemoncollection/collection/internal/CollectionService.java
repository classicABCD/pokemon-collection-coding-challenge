package com.pokemoncollection.collection.internal;

import com.pokemoncollection.catalog.CatalogQuery;
import com.pokemoncollection.catalog.PokemonView;
import com.pokemoncollection.identity.CurrentTrainer;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
class CollectionService {

    private final CollectionEntryRepository entries;
    private final CatalogQuery catalog;
    private final CurrentTrainer currentTrainer;

    CollectionService(CollectionEntryRepository entries, CatalogQuery catalog, CurrentTrainer currentTrainer) {
        this.entries = entries;
        this.catalog = catalog;
        this.currentTrainer = currentTrainer;
    }

    @Transactional
    CollectionItem add(int pokemonId) {
        UUID trainerId = currentTrainer.id();
        PokemonView pokemon = catalog.findById(pokemonId)
                .filter(p -> !p.deprecated())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNPROCESSABLE_CONTENT, "Pokémon %d is unknown or deprecated".formatted(pokemonId)));
        try {
            CollectionEntry entry = entries.saveAndFlush(new CollectionEntry(trainerId, pokemonId));
            return new CollectionItem(pokemon, entry.getAddedAt());
        } catch (DataIntegrityViolationException e) {
            // Primary key (trainer_id, pokemon_id) guarantees uniqueness
            throw alreadyInCollection(pokemonId);
        }
    }

    @Transactional(readOnly = true)
    List<CollectionItem> list() {
        List<CollectionEntry> own = entries.findAllByTrainerIdOrderByAddedAtDesc(currentTrainer.id());
        Map<Integer, PokemonView> pokemonById =
                catalog
                        .findAllByIds(
                                own.stream().map(CollectionEntry::getPokemonId).toList())
                        .stream()
                        .collect(Collectors.toMap(PokemonView::id, Function.identity()));
        return own.stream()
                .map(entry -> new CollectionItem(pokemonById.get(entry.getPokemonId()), entry.getAddedAt()))
                .toList();
    }

    private static ResponseStatusException alreadyInCollection(int pokemonId) {
        return new ResponseStatusException(
                HttpStatus.CONFLICT, "Pokémon %d is already in your collection".formatted(pokemonId));
    }

    record CollectionItem(PokemonView pokemon, Instant addedAt) {}
}
