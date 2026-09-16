package com.pokemoncollection.catalog.internal;

import com.pokemoncollection.catalog.PokemonView;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "pokemon")
public class Pokemon {

    @Id
    private Integer id;

    private String name;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private List<String> types;

    private String spriteUrl;

    private boolean deprecated;

    private Instant deprecatedAt;

    private Instant lastSyncedAt;

    protected Pokemon() {
    }

    public Pokemon(int id, String name, List<String> types, String spriteUrl, Instant syncedAt) {
        this.id = id;
        update(name, types, spriteUrl, syncedAt);
    }

    public void update(String name, List<String> types, String spriteUrl, Instant syncedAt) {
        this.name = name;
        this.types = List.copyOf(types);
        this.spriteUrl = spriteUrl;
        this.lastSyncedAt = syncedAt;
    }

    public void deprecate(Instant now) {
        if (!deprecated) {
            deprecated = true;
            deprecatedAt = now;
        }
    }

    public void reactivate() {
        deprecated = false;
        deprecatedAt = null;
    }

    public int getId() {
        return id;
    }

    public boolean isDeprecated() {
        return deprecated;
    }

    public PokemonView toView() {
        return new PokemonView(id, name, types, spriteUrl, deprecated);
    }
}
