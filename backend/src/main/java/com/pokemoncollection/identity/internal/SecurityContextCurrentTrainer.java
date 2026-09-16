package com.pokemoncollection.identity.internal;

import com.pokemoncollection.identity.CurrentTrainer;
import java.util.Optional;
import java.util.UUID;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
class SecurityContextCurrentTrainer implements CurrentTrainer {

    @Override
    public UUID id() {
        return principal()
                .map(TrainerUserDetails::id)
                .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("No authenticated trainer"));
    }

    static Optional<TrainerUserDetails> principal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof TrainerUserDetails details) {
            return Optional.of(details);
        }
        return Optional.empty();
    }
}
