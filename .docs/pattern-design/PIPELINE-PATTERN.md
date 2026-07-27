# Pipeline Pattern

The Pipeline pattern involves organizing sequential data processing into distinct stages. Each stage (or filter) takes input, processes it, and passes the output to the next stage. 

## Where is it used?
In **Phase 8**, we applied the Pipeline pattern to route validation within `src/business/services/routeService.js`.

## Why was it chosen?
Previously, validation consisted of sequential `if` statements throwing errors. As validation logic grows, this becomes an imperative mess that is hard to test and maintain.

By adopting a Pipeline pattern using the `pipe` composition function, we transitioned to **Railway-Oriented Programming**. 
- The data (`context`) flows through a series of pure transformer functions.
- Each validator function has a single responsibility: check one rule.
- If a rule fails, the function throws an error (switching to the "failure track").
- If it passes, it returns the unmodified context to the next function in the pipe.

This pattern makes adding new validation rules as simple as plugging a new pure function into the `pipe` list, drastically improving the modularity and readability of the business logic layer.
