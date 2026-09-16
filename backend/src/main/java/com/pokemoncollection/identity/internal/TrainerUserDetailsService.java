package com.pokemoncollection.identity.internal;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
class TrainerUserDetailsService implements UserDetailsService {

    private final TrainerRepository trainers;

    TrainerUserDetailsService(TrainerRepository trainers) {
        this.trainers = trainers;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        return trainers.findByUsernameIgnoreCase(username)
                .map(TrainerUserDetails::from)
                .orElseThrow(() -> new UsernameNotFoundException("Unknown trainer"));
    }
}
