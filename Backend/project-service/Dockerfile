# =======================
# 1️⃣ Build stage
# =======================
FROM maven:3.9.9-eclipse-temurin-17 AS build

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies first
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# =======================
# 2️⃣ Runtime stage
# =======================
FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

# Copy built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
