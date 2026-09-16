package com.pokemoncollection.collection.internal;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.PostLoad;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.domain.Persistable;

@Entity
@Table(name = "collection_entry")
@IdClass(CollectionEntry.Key.class)
class CollectionEntry implements Persistable<CollectionEntry.Key> {

    @Id
    private UUID trainerId;

    @Id
    private Integer pokemonId;

    private Instant addedAt;

    // Assigned ids: always INSERT new entries, so a duplicate fails on the primary key instead of being merged
    @Transient
    private boolean isNew = true;

    protected CollectionEntry() {
    }

    CollectionEntry(UUID trainerId, int pokemonId) {
        this.trainerId = trainerId;
        this.pokemonId = pokemonId;
        this.addedAt = Instant.now();
    }

    int getPokemonId() {
        return pokemonId;
    }

    Instant getAddedAt() {
        return addedAt;
    }

    @Override
    public Key getId() {
        return new Key(trainerId, pokemonId);
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    @PostLoad
    void markNotNew() {
        isNew = false;
    }

    record Key(UUID trainerId, Integer pokemonId) implements Serializable {
    }
}
