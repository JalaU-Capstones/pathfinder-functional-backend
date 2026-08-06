# Liskov Substitution Principle (LSP)

**Definition:** Subtypes must be substitutable for their base types without altering the correctness of the program.

Since this project strictly follows a Functional Programming paradigm and forbids OOP classes and inheritance, there are no "subtypes" or "base classes." Instead, LSP applies to **function signatures and contracts**.

In a functional context, LSP means that any function conforming to a specific signature can be substituted for another without breaking the system.

## 1. Repository Function Contracts
All data access operations across the 5 repository files adhere to consistent input/output contracts.

For example, CRUD operations have predictable signatures:
- **Create:** `createX(data) → Promise<Record>`
- **Read:** `getXById(id) → Promise<Record | null>`
- **Update:** `updateX(id, data) → Promise<number>` (returns rows affected)
- **Delete:** `deleteX(id) → Promise<number>` (returns rows affected)

Because these contracts are standardized, any service that consumes a repository function expects these exact return types. You could theoretically substitute a PostgreSQL repository for an In-Memory repository, and as long as it honors these signatures, the business layer will continue to function flawlessly.

## 2. Validator Pipeline Substitutability
All individual validator functions inside `src/utils/routeValidators.js` follow the exact same contract:

```javascript
// Contract: (context) → context (or throws an Error)
const someValidator = (context) => {
  // validation logic
  return context;
};
```

Because they all adhere to this signature, they are completely substitutable within a composition `pipe`. Any validator can be rearranged, replaced, or swapped out with another validator without breaking the pipeline structure. 

In this way, functional LSP ensures robustness through **contract adherence** rather than inheritance hierarchies.
