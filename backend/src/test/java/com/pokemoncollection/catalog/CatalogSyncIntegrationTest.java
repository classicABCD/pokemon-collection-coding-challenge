package com.pokemoncollection.catalog;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.okJson;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.options;
import static org.assertj.core.api.Assertions.assertThat;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.pokemoncollection.TestcontainersConfiguration;
import com.pokemoncollection.catalog.internal.sync.CatalogSync;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

/**
 * Sync against a stubbed PokéAPI: initial load, outage and deprecation.
 */
@SpringBootTest(properties = "app.catalog.sync.sync-on-startup=false")
@Import(TestcontainersConfiguration.class)
class CatalogSyncIntegrationTest {

    private static final WireMockServer pokeApi = new WireMockServer(options().dynamicPort());

    static {
        pokeApi.start();
    }

    @DynamicPropertySource
    static void pokeApiUrl(DynamicPropertyRegistry registry) {
        registry.add("app.catalog.sync.base-url", () -> pokeApi.baseUrl() + "/api/v2");
    }

    @AfterAll
    static void stopPokeApi() {
        pokeApi.stop();
    }

    @Autowired
    private CatalogSync sync;

    @Autowired
    private JdbcTemplate jdbc;

    @BeforeEach
    void reset() {
        jdbc.execute("TRUNCATE collection_entry, pokemon, trainer CASCADE");
        pokeApi.resetAll();
    }

    @Test
    void syncLoadsPokemonFromPokeApi() {
        stubPokeApi(1, 20);

        sync.run();

        assertThat(count("deprecated = false")).isEqualTo(20);
        assertThat(jdbc.queryForObject("SELECT name FROM pokemon WHERE id = 1", String.class)).isEqualTo("pokemon-1");
        assertThat(jdbc.queryForObject("SELECT types[1] FROM pokemon WHERE id = 1", String.class)).isEqualTo("grass");
    }

    @Test
    void pokeApiOutageLeavesCatalogUnchanged() {
        stubPokeApi(1, 20);
        sync.run();

        pokeApi.resetAll();
        pokeApi.stubFor(get(urlPathEqualTo("/api/v2/pokemon")).willReturn(aResponse().withStatus(503)));
        sync.run();

        assertThat(count("deprecated = false")).isEqualTo(20);
    }

    @Test
    void pokemonRemovedUpstreamIsDeprecatedNotDeleted() {
        stubPokeApi(1, 20);
        sync.run();

        pokeApi.resetAll();
        stubPokeApi(1, 19);
        sync.run();

        assertThat(count("true")).isEqualTo(20);
        assertThat(jdbc.queryForObject("SELECT deprecated FROM pokemon WHERE id = 20", Boolean.class)).isTrue();
    }

    private void stubPokeApi(int fromId, int toId) {
        String results = IntStream.rangeClosed(fromId, toId)
                .mapToObj(id -> """
                        {"name": "pokemon-%d", "url": "%s/api/v2/pokemon/%d/"}""".formatted(id, pokeApi.baseUrl(), id))
                .collect(Collectors.joining(","));
        pokeApi.stubFor(get(urlPathEqualTo("/api/v2/pokemon")).willReturn(okJson("""
                {"count": %d, "results": [%s]}""".formatted(toId - fromId + 1, results))));

        IntStream.rangeClosed(fromId, toId).forEach(id -> pokeApi.stubFor(get(urlPathEqualTo("/api/v2/pokemon/" + id))
                .willReturn(okJson("""
                        {"id": %d, "name": "pokemon-%d",
                         "types": [{"slot": 2, "type": {"name": "poison"}}, {"slot": 1, "type": {"name": "grass"}}],
                         "sprites": {"front_default": "https://sprites.example/%d.png"}}"""
                        .formatted(id, id, id)))));
    }

    private int count(String condition) {
        return jdbc.queryForObject("SELECT count(*) FROM pokemon WHERE " + condition, Integer.class);
    }
}
