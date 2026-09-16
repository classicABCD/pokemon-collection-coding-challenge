package com.pokemoncollection.collection;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pokemoncollection.IntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.ResultActions;

class CollectionIntegrationTest extends IntegrationTest {

    private static final int PIKACHU = 25;
    private static final int MISSINGNO = 999;

    @BeforeEach
    void seedCatalog() {
        insertPokemon(PIKACHU, "pikachu", false);
        insertPokemon(MISSINGNO, "missingno", true);
    }

    @Test
    void trainersOnlySeeTheirOwnCollection() throws Exception {
        MockHttpSession ash = registerTrainer();
        MockHttpSession misty = registerTrainer();

        add(ash, PIKACHU)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.pokemon.id").value(PIKACHU))
                .andExpect(jsonPath("$.addedAt").exists());

        mockMvc.perform(get("/api/collection").session(ash))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
        mockMvc.perform(get("/api/collection").session(misty))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void addingTheSamePokemonTwiceIsConflict() throws Exception {
        MockHttpSession ash = registerTrainer();

        add(ash, PIKACHU).andExpect(status().isCreated());
        add(ash, PIKACHU).andExpect(status().isConflict());
    }

    @Test
    void deprecatedOrUnknownPokemonCannotBeAdded() throws Exception {
        MockHttpSession ash = registerTrainer();

        add(ash, MISSINGNO).andExpect(status().isUnprocessableContent());
        add(ash, 12345).andExpect(status().isUnprocessableContent());
    }

    @Test
    void deprecatedPokemonStaysVisibleInCollection() throws Exception {
        MockHttpSession ash = registerTrainer();
        add(ash, PIKACHU).andExpect(status().isCreated());

        jdbc.update("UPDATE pokemon SET deprecated = true, deprecated_at = now() WHERE id = ?", PIKACHU);

        mockMvc.perform(get("/api/collection").session(ash))
                .andExpect(jsonPath("$[0].pokemon.id").value(PIKACHU))
                .andExpect(jsonPath("$[0].pokemon.deprecated").value(true));
    }

    @Test
    void catalogExcludesDeprecatedPokemon() throws Exception {
        mockMvc.perform(get("/api/pokemon").session(registerTrainer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("pikachu"));
    }

    @Test
    void addWithoutCsrfTokenIsForbidden() throws Exception {
        mockMvc.perform(post("/api/collection").session(registerTrainer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body(PIKACHU)))
                .andExpect(status().isForbidden());
    }

    @Test
    void anonymousCannotAccessCollection() throws Exception {
        mockMvc.perform(get("/api/collection")).andExpect(status().isUnauthorized());
    }

    private ResultActions add(MockHttpSession session, int pokemonId) throws Exception {
        return mockMvc.perform(post("/api/collection").session(session).with(xsrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body(pokemonId)));
    }

    private static String body(int pokemonId) {
        return """
                {"pokemonId": %d}""".formatted(pokemonId);
    }
}
