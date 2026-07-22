# Chain of Responsibility Pattern

## What it is
The Chain of Responsibility is a behavioral design pattern that allows passing requests along a chain of handlers. Upon receiving a request, each handler decides either to process the request or to pass it to the next handler in the chain.

## Why it was chosen
Express.js middleware is inherently built around the Chain of Responsibility pattern via the `next()` function. By embracing this native capability, we eliminate inline error handling in controllers. Controllers simply do their job (process the happy path) and if something goes wrong, they throw the error down the chain for a dedicated handler to deal with.

## Where it is implemented
In `src/app.js`, the request flows through a strict chain:
1. **`requestLogger`**: Intercepts the request to track its start time, hooks into `res.on('finish')`, and passes control to the next handler.
2. **Controllers (Routes)**: Attempt to handle the request. If successful, they send the response. If an error occurs, they call `next(error)`.
3. **`notFound`**: If no route matches the request, this middleware creates a `NOT_FOUND` error and passes it down the chain via `next(error)`.
4. **`errorHandler`**: The final stop. This 4-argument middleware receives all errors, maps the error type to the proper HTTP status using `ERROR_STATUS_MAP`, logs it with the appropriate severity, and sends the standardized JSON error response.
