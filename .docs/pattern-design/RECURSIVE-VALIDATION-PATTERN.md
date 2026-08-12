# Recursive Validation Pattern

## What it is
A validation approach where complex, hierarchical, or
sequential constraints are expressed as recursive functions
rather than iterative loops. Each recursive call validates
one level of the structure or one rule in a chain,
returning early on failure (short-circuit evaluation).

## Why it was chosen
Assignment 6.4 explicitly requires recursive techniques
for validation logic. Beyond the requirement, recursion
is the natural choice for:
- **Structural validation:** nested objects (UUID segments,
  position objects) map directly to recursive calls.
- **Rule chains:** a sequence of ordered constraints where
  each rule either passes (recurse to next) or fails
  (return error) is a natural recursive structure.
- **Graph traversal:** DFS cycle detection is canonically
  recursive — the call stack tracks the traversal path.

## Where it is implemented
- `src/utils/recursion.js`: all four recursive functions.
- `src/business/services/validationService.js`: uses the
  pure recursive functions in business context.
- `src/presentation/routes/validationRoutes.js`: exposes
  the validation operations via HTTP.

## Functions and their recursion rationale
| Function | Recursion type | Why recursive |
|---|---|---|
| `validateUuidFormat` | Segment-by-segment | UUID is a 5-segment structure |
| `validateMapConfigStructure` | Depth-first | Config is a nested object |
| `validateMapDimensions` | Rule-list reduction | Rule chain = natural recursion |
| `detectCyclicDependencies` | DFS | Graph traversal = canonical DFS |
