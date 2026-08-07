# The Promise as a Monad

**Date**: August 7, 2026  
**Context**: Week 5 Lab Activity - Monads in JavaScript

## 1. Concept: Monads in Functional Programming
A Monad is an abstract data type used to represent computations instead of data in the domain model. It wraps a value in a computational context.
In functional programming, a Monad must provide two primary operations:
1. `of` (or `unit`/`return`): Wraps a plain value into a monadic context.
2. `chain` (or `bind`/`flatMap`): Applies a function that returns a monad to the value inside a monad, and then flattens the result so you don't get nested monads.

### Functor vs. Monad
A **Functor** provides a `map` operation. If you `map` over a Functor with a function that returns another Functor, you end up with a nested context (e.g., `M<M<A>>`).
A **Monad** provides `chain` (which is effectively `map` followed by `flatten`). If you `chain` a function that returns a Monad, the result is flattened back into a single context (e.g., `M<A>`). Every Monad is a Functor, but not every Functor is a Monad.

## 2. JavaScript's Promise as a Monad
In JavaScript, `Promise` natively acts as a Monad for asynchronous computation. 
- **`of`**: `Promise.resolve(value)`
- **`chain`**: `promise.then(fn)` where `fn` returns a Promise. `Promise.then` automatically flattens nested promises, fulfilling the `chain` requirement.
- **`map`**: `promise.then(fn)` where `fn` returns a plain value. `Promise.then` wraps the result, fulfilling the Functor requirement.

Because `Promise.then` handles both mapping and chaining natively, we can define explicit wrappers in `src/utils/monad.js` to demonstrate this structure.

## 3. Monad Laws Verified
To formally qualify as a Monad, a structure must satisfy three mathematical laws. We verify these in `tests/utils/monad.test.js` using our Promise wrappers:

1. **Left Identity**: `of(a).chain(f) ≡ f(a)`
   - Wrapping a value and then chaining a function is the same as calling the function directly.
2. **Right Identity**: `m.chain(of) ≡ m`
   - Chaining the `of` function to a monad returns the original monad unmodified.
3. **Associativity**: `m.chain(f).chain(g) ≡ m.chain(x => f(x).chain(g))`
   - The grouping of chained operations does not affect the final result.

## 4. Application in `routeService.js`
In `src/business/services/routeService.js`, the process of creating a route involves several asynchronous validations, computations, and database writes. 
Instead of an imperative sequence of `await` statements, we use `pipeAsync` (function composition within the Promise monad) to express the business logic declaratively:

```javascript
const createRouteService = async (data) =>
  pipeAsync(
    fetchMapContext,
    validateContext,
    computePath,
    validatePath,
    persistRoute,
    toResponse
  )(data);
```

Each step takes the state from the previous Promise and returns a new state wrapped in a Promise. If any step throws an error or returns a rejected Promise, the monadic context short-circuits, and the rejection propagates down the chain, mimicking traditional `try/catch` behavior but purely functionally.
