FROM maven:latest

WORKDIR /app

COPY . .


EXPOSE 8080

RUN mvn install -DskipTests

CMD ["mvn", "spring-boot:run"]