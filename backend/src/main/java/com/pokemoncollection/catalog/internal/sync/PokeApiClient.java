package com.pokemoncollection.catalog.internal.sync;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Adapter to PokéAPI. Only used by the sync job, never during user requests.
 */
@Component
public class PokeApiClient {

    /** PokéAPI ids from 10001 are alternative forms (megas, regional variants, …); only base species are synced. */
    static final int MAX_BASE_SPECIES_ID = 9999;

    private final RestClient restClient;

    PokeApiClient(RestClient.Builder builder, CatalogSyncProperties properties) {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofSeconds(15));
        this.restClient = builder
                .baseUrl(properties.baseUrl())
                .requestFactory(requestFactory)
                .build();
    }

    /** Ids of all base species currently available upstream. */
    public List<Integer> fetchAllIds() {
        PokemonList list = restClient.get()
                .uri("/pokemon?limit=100000")
                .retrieve()
                .body(PokemonList.class);
        if (list == null || list.results() == null) {
            return List.of();
        }
        return list.results().stream()
                .map(resource -> idFromUrl(resource.url()))
                .filter(id -> id <= MAX_BASE_SPECIES_ID)
                .toList();
    }

    public PokemonDetails fetchDetails(int id) {
        PokemonResponse response = Objects.requireNonNull(restClient.get()
                .uri("/pokemon/{id}", id)
                .retrieve()
                .body(PokemonResponse.class), "Empty response for Pokémon " + id);
        List<String> types = response.types().stream()
                .sorted(Comparator.comparingInt(TypeSlot::slot))
                .map(slot -> slot.type().name())
                .toList();
        String sprite = response.sprites() == null ? null : response.sprites().frontDefault();
        return new PokemonDetails(response.id(), response.name(), types, sprite);
    }

    static int idFromUrl(String url) {
        // e.g. https://pokeapi.co/api/v2/pokemon/25/
        String trimmed = url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
        return Integer.parseInt(trimmed.substring(trimmed.lastIndexOf('/') + 1));
    }

    public record PokemonDetails(int id, String name, List<String> types, String spriteUrl) {
    }

    record PokemonList(List<NamedResource> results) {
    }

    record NamedResource(String name, String url) {
    }

    record PokemonResponse(int id, String name, List<TypeSlot> types, Sprites sprites) {
    }

    record TypeSlot(int slot, NamedResource type) {
    }

    record Sprites(@JsonProperty("front_default") String frontDefault) {
    }
}
