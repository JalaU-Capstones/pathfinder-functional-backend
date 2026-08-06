# SOLID Principles in a Functional Paradigm

This directory documents how the SOLID principles are explicitly applied within the Pathfinder Functional Backend project. 

While SOLID is traditionally associated with Object-Oriented Programming (OOP) to govern class design and inheritance, the underlying philosophies of high cohesion and low coupling apply equally to Functional Programming. In our functional codebase, we adapt these principles to govern **module boundaries**, **function signatures**, and **data composition**.

## Documentation Index

| Principle | Functional Adaptation | Primary Example Location | Read More |
| :--- | :--- | :--- | :--- |
| **Single Responsibility (SRP)** | Functions have one job; modules represent one entity. | `src/utils/` and 3-Layer Architecture | [SRP Docs](./SRP-single-responsibility.md) |
| **Open/Closed (OCP)** | Higher-order functions, composition, and stable signatures. | `calculatePath` (`src/business/pathfinder.js`) | [OCP Docs](./OCP-open-closed.md) |
| **Liskov Substitution (LSP)** | Strict adherence to function signatures and contracts. | Repository CRUD contracts | [LSP Docs](./LSP-liskov-substitution.md) |
| **Interface Segregation (ISP)** | Granular module exports (no "god" modules). | Repositories & `src/utils/` | [ISP Docs](./ISP-interface-segregation.md) |
| **Dependency Inversion (DIP)** | Depend on data shapes (params) and repo abstractions. | Services depending on Repositories | [DIP Docs](./DIP-dependency-inversion.md) |
