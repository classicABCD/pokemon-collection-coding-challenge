# Build context: repository root (the build generates the API interfaces from api/openapi.yaml)

FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /workspace

# Dependencies first, so they are cached as long as pom.xml does not change
COPY api/openapi.yaml api/openapi.yaml
COPY backend/pom.xml backend/pom.xml
RUN mvn -f backend/pom.xml -B -q dependency:go-offline

COPY backend/src backend/src
# Tests need a Docker daemon (Testcontainers) and run separately: ./mvnw verify
RUN mvn -f backend/pom.xml -B -q -DskipTests package

FROM eclipse-temurin:25-jre-alpine
# Pick up OS security fixes published after the base image was built
RUN apk upgrade --no-cache
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /workspace/backend/target/pokemon-collection-backend-*.jar app.jar
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
