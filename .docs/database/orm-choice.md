# ORM Choice: Sequelize

## Context
Interacting directly with PostgreSQL via raw SQL strings can be error-prone and hard to maintain as the application scales.

## Options Considered
- **Raw SQL queries (pg module):** Maximum performance, but high boilerplate and harder to maintain complex queries.
- **Query Builders (Knex.js):** Good middle ground, but lacks built-in validation and model relationship management.
- **ORMs (Sequelize, Prisma, TypeORM):** High level of abstraction, manages migrations, validations, and relationships.

## Decision
We chose **Sequelize**.

## Rationale
- Sequelize is a mature, widely-used ORM in the Node.js ecosystem.
- It provides a robust migration and seeding system out of the box.
- Although ORMs often imply an OOP approach (e.g., Model instances), we will constrain our usage of Sequelize within the Data Access layer to return plain objects (`raw: true`) to maintain the functional paradigm across the rest of the application.
