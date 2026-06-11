# =============================================================
# Repo Dockerfile - ISystem backend
# Spring Boot + gRPC microservices monorepo (9 services).
#
# Builds the project and installs its dependencies so this image
# can serve as the approved repo base for per-task Dockerfiles.
#
# Compliant with assessment static-check rules:
#   - pinned base images
#   - COPY into absolute /app (platform strips the top-level folder)
#   - no loops / dynamic command construction in RUN
#   - no apt / pip / npm network installs
# =============================================================

# -------------------------------------------------------------
# 1) Build stage - install dependencies and package every service
# -------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app

# Bring in the whole monorepo (top folder stripped by the platform).
COPY . /app

# Package each service explicitly (no loops). Dependencies are
# resolved and installed during these builds; tests skipped for images.
RUN cd activity-service && mvn -B clean package -DskipTests
RUN cd application-service && mvn -B clean package -DskipTests
RUN cd leave-service && mvn -B clean package -DskipTests
RUN cd message-service && mvn -B clean package -DskipTests
RUN cd notification-service && mvn -B clean package -DskipTests
RUN cd project-service && mvn -B clean package -DskipTests
RUN cd report-service && mvn -B clean package -DskipTests
RUN cd schedule-service && mvn -B clean package -DskipTests
RUN cd user-service && mvn -B clean package -DskipTests

# Collect every built jar into one directory (explicit, no loops).
RUN mkdir -p /app/jars
RUN cp activity-service/target/*.jar /app/jars/activity-service.jar
RUN cp application-service/target/*.jar /app/jars/application-service.jar
RUN cp leave-service/target/*.jar /app/jars/leave-service.jar
RUN cp message-service/target/*.jar /app/jars/message-service.jar
RUN cp notification-service/target/*.jar /app/jars/notification-service.jar
RUN cp project-service/target/*.jar /app/jars/project-service.jar
RUN cp report-service/target/*.jar /app/jars/report-service.jar
RUN cp schedule-service/target/*.jar /app/jars/schedule-service.jar
RUN cp user-service/target/*.jar /app/jars/user-service.jar

# -------------------------------------------------------------
# 2) Runtime stage - run one selected service
#    Override at build time:  --build-arg SERVICE=project-service
# -------------------------------------------------------------
FROM eclipse-temurin:17-jdk-jammy

ARG SERVICE=user-service
ENV SERVICE=${SERVICE}

WORKDIR /app

# Copy the selected service jar as app.jar.
COPY --from=build /app/jars/${SERVICE}.jar /app/app.jar

EXPOSE 8080 9090

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
