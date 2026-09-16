package com.pokemoncollection.catalog;

import com.pokemoncollection.api.PokemonDto;
import java.util.List;

/**
 * Read model of a catalog Pokémon, exposed to other modules.
 */
public record PokemonView(int id, String name, List<String> types, String spriteUrl, boolean deprecated) {

    public PokemonDto toDto() {
        return new PokemonDto(id, name, types, deprecated).spriteUrl(spriteUrl);
    }
}
