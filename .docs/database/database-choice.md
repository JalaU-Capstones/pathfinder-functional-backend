# Database Choice: PostgreSQL

## Context
We need a robust, reliable data store to manage maps, obstacles, users, and routing waypoints for the Pathfinder backend.

## Options Considered
- **Document Databases (MongoDB):** Flexible schema, easy to map JSON objects directly to the DB.
- **Relational Databases (PostgreSQL):** Rigid schema, ACID compliance, powerful relational queries.

## Decision
We chose **PostgreSQL**.

## Rationale
- The application involves strong relationships between entities (e.g., users own maps, maps contain obstacles and waypoints). Relational databases excel at maintaining data integrity in such scenarios.
- PostgreSQL offers advanced geographical and coordinate-based features (e.g., PostGIS) should we need them later for the pathfinding algorithm.
- It integrates seamlessly with our chosen ORM, Sequelize.
