package com.pokemoncollection.catalog.internal.sync;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class PokeApiClientTest {

    @Test
    void idIsParsedFromResourceUrl() {
        assertThat(PokeApiClient.idFromUrl("https://pokeapi.co/api/v2/pokemon/25/"))
                .isEqualTo(25);
        assertThat(PokeApiClient.idFromUrl("https://pokeapi.co/api/v2/pokemon/10001"))
                .isEqualTo(10001);
    }

    @Test
    void onlyHttpsSpriteUrlsAreAccepted() {
        assertThat(PokeApiClient.httpsOrNull("https://raw.githubusercontent.com/25.png"))
                .isNotNull();
        assertThat(PokeApiClient.httpsOrNull("http://example.com/25.png")).isNull();
        assertThat(PokeApiClient.httpsOrNull("javascript:alert(1)")).isNull();
        assertThat(PokeApiClient.httpsOrNull(null)).isNull();
    }
}
