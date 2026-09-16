package com.pokemoncollection.identity.internal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "trainer")
class TrainerAccount {

    @Id
    private UUID id;

    private String username;

    @Column(name = "password_hash")
    private String passwordHash;

    private Instant createdAt;

    protected TrainerAccount() {
    }

    TrainerAccount(String username, String passwordHash) {
        this.id = UUID.randomUUID();
        this.username = username;
        this.passwordHash = passwordHash;
        this.createdAt = Instant.now();
    }

    UUID getId() {
        return id;
    }

    String getUsername() {
        return username;
    }

    String getPasswordHash() {
        return passwordHash;
    }
}
