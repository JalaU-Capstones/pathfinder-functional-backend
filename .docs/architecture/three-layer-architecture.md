# Three-Layer Architecture

This project strictly adheres to a three-layer architecture to separate concerns and improve maintainability.

## 1. Presentation Layer (`src/presentation/`)
- **Responsibility:** Handle HTTP interactions (request and response).
- **Contents:** Express routes, controllers, input validation.
- **Rule:** Controllers should only parse incoming data, pass it to the business layer, and format the response. No business rules should live here.

## 2. Business Logic Layer (`src/business/`)
- **Responsibility:** Core application logic and algorithms.
- **Contents:** Services, pathfinding algorithms, domain rules.
- **Rule:** This layer should be completely independent of HTTP and the database. It should rely on pure functions where possible, receiving inputs and returning outputs.

## 3. Data Access Layer (`src/data/`)
- **Responsibility:** Persistence and database interactions.
- **Contents:** Sequelize models, database queries, repository-like functions.
- **Rule:** This layer abstracts the database from the business logic. Any changes to the database schema or ORM should only impact this layer.
