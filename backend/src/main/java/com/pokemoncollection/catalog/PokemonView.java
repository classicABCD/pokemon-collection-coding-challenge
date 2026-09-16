package com.pokemoncollection.catalog;

import com.pokemoncollection.api.model.Pokemon;
import java.util.List;

/**
 * Read model of a catalog Pokémon, exposed to other modules.
 */
public record PokemonView(int id, String name, List<String> types, String spriteUrl, boolean deprecated) {

    public Pokemon toDto() {
        return new Pokemon(id, name, types, deprecated).spriteUrl(spriteUrl);
    }
}
