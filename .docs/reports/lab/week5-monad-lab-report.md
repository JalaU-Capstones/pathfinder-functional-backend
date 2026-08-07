# Week 5 Lab Report: Promise as Monad

**Date:** August 7, 2026
**Course:** Programming 4
**Project:** Pathfinder Functional Backend

## 1. Introduction
The objective of this lab was to implement a functional design pattern into the Pathfinder Functional Backend project. Given our strict adherence to the functional paradigm and the asynchronous nature of a Node.js API, we elected to formalize our use of the Monad pattern—specifically treating JavaScript's native `Promise` as a Monad.

## 2. Design Decision: Monad over Functor
While Functors allow us to map over wrapped values (via `Promise.prototype.then`), they are insufficient for chaining operations that themselves return wrapped values (asynchronous operations).

In a typical Express service layer, fetching data from a database, validating it, and saving it are all asynchronous operations. If we only had a Functor's `map`, chaining these operations would result in nested Promises (e.g., `Promise<Promise<Data>>`). 

A Monad provides a `bind` (or `flatMap`) operation which automatically flattens these nested contexts. Because JavaScript's `then` method automatically acts as `bind` when a Promise is returned, the native Promise is inherently monadic. We chose to explicitly expose and utilize this monadic behavior to compose our asynchronous service pipelines.

## 3. Implementation Details
The implementation involved three primary components:

### 3.1 The Monad Utility (`src/utils/monad.js`)
We created a functional wrapper around the native Promise to expose standard monadic nomenclature:
- `pure(x)`: Lifts a value into the Monad context (`Promise.resolve(x)`).
- `bind(f)`: Chains a function that returns a Monad, flattening the result.
- `map(f)`: Applies a synchronous function to the inner value.
- `pipeAsync(...fns)`: A utility to compose asynchronous monadic functions from left to right.

### 3.2 Refactoring `routeService.js`
We refactored `createRouteService`, moving from an imperative `try/catch` block with `await` statements to a pure, declarative pipeline using `pipeAsync`. The service now elegantly chains validations, database reads, pathfinding calculations, and database writes. Errors are inherently caught and propagated down the monadic chain without breaking the flow.

### 3.3 Test Verification (`tests/utils/monad.test.js`)
To mathematically prove our implementation, we wrote unit tests verifying the three Monad laws for our Promise wrapper:
1. **Left Identity:** `pure(x).bind(f)` is equivalent to `f(x)`.
2. **Right Identity:** `m.bind(pure)` is equivalent to `m`.
3. **Associativity:** `m.bind(f).bind(g)` is equivalent to `m.bind(x => f(x).bind(g))`.

## 4. Conclusion
By formally recognizing and utilizing the native Promise as a Monad, we eliminated imperative side-effect management in our business layer. The resulting code is highly declarative, composing complex asynchronous workflows into readable, easily testable pipelines. This directly aligns with our overarching goal of maintaining a pure functional architecture.
