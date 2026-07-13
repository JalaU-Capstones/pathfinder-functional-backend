# Functional Programming Approach

## Rationale
The primary requirement for this capstone project is to implement the backend using strictly **Functional Programming (FP)** principles. This is to demonstrate a clear understanding of alternative paradigms to Object-Oriented Programming (OOP) within a Node.js context.

## Core Principles Adopted
1. **No OOP Features:** Classes, prototypes, the `new` keyword, and `this` context are strictly forbidden.
2. **Pure Functions:** Functions should avoid side effects and always produce the same output for a given input whenever possible. 
3. **Immutability:** Avoid mutating data (objects and arrays). Use `const` over `let`, and prefer functions like `map`, `filter`, and `reduce` over traditional `for` loops.
4. **Higher-Order Functions:** Functions can take other functions as arguments or return them to achieve composition and dependency injection.

## Enforcement
These principles are enforced by project conventions and specific ESLint rules configured in `eslint.config.js`.
