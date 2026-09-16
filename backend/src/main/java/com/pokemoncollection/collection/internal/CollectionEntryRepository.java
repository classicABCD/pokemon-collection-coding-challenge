package com.pokemoncollection.collection.internal;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * All queries are scoped by trainer id (data isolation, ADR-3).
 */
interface CollectionEntryRepository extends JpaRepository<CollectionEntry, CollectionEntry.Key> {

    List<CollectionEntry> findAllByTrainerIdOrderByAddedAtDesc(UUID trainerId);
}
