package com.pokemoncollection.identity;

import java.util.UUID;

/**
 * Provides the trainer of the current authenticated session. The only way other modules learn who the trainer is.
 */
public interface CurrentTrainer {

    UUID id();
}
