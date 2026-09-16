package com.pokemoncollection.identity.internal;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Security principal stored in the session. Carries the trainer id so no lookup is needed per request.
 */
record TrainerUserDetails(UUID id, String username, String passwordHash) implements UserDetails, Serializable {

    static TrainerUserDetails from(TrainerAccount trainer) {
        return new TrainerUserDetails(trainer.getId(), trainer.getUsername(), trainer.getPasswordHash());
    }

    /** Copy without the password hash, used once the trainer is authenticated. */
    TrainerUserDetails withoutPassword() {
        return new TrainerUserDetails(id, username, null);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return username;
    }
}
