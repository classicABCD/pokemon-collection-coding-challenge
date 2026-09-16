package com.pokemoncollection.identity.internal;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface TrainerRepository extends JpaRepository<TrainerAccount, UUID> {

    Optional<TrainerAccount> findByUsernameIgnoreCase(String username);
}
