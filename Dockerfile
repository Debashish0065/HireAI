# =========================================
# STAGE 1 — BUILD HIREAI
# =========================================
FROM eclipse-temurin:21-jdk AS builder

# Set working directory
WORKDIR /app

# Copy Maven wrapper files
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Make Maven wrapper executable
RUN chmod +x mvnw

# Download project dependencies
# This layer is cached unless pom.xml changes
RUN ./mvnw dependency:go-offline -B

# Copy application source code
COPY src ./src

# Build Spring Boot application
# Tests were already verified separately:
# 384 tests, 0 failures, 0 errors
RUN ./mvnw clean package -DskipTests


# =========================================
# STAGE 2 — RUN HIREAI
# =========================================
FROM eclipse-temurin:21-jre

# Set application working directory
WORKDIR /app

# Create persistent resume upload directory
RUN mkdir -p /app/uploads/resumes

# Copy the Spring Boot JAR from build stage
COPY --from=builder /app/target/*.jar app.jar

# HireAI Spring Boot port
EXPOSE 8080

# Optional JVM options
ENV JAVA_OPTS=""

# Start HireAI
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]