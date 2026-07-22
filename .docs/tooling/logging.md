# Logging Strategy

The application uses `winston` as its structured logging library.

## Why Winston?
Winston was chosen because it is highly maintained, supports structured JSON logging natively (crucial for log aggregation tools in production), and makes it trivial to configure multiple transports with different formatting based on the environment.

## Log Levels
We adhere to the following standard log levels:
- `error`: Used for unhandled exceptions, 5xx server errors, and critical failures.
- `warn`: Used for 4xx client errors (e.g., validation failures, resource not found, conflicts).
- `info`: Used for incoming HTTP requests (method, url, status, duration) and application lifecycle events (server start).
- `debug`: Used for internal service/repository tracing (only visible during development).

## Environment Configuration
- **Development (`NODE_ENV !== 'production'`)**: Logs are output to the console with human-readable colorized formatting and timestamps.
- **Production (`NODE_ENV === 'production'`)**: Logs are output to the console as strictly structured JSON (one object per line), which is expected to be consumed by log forwarders (e.g., FluentBit, Datadog).

## Modifying the Logger
The `winston` instance is strictly isolated to `src/utils/logger.js`. No other files should import `winston` directly. To log messages, require `logger` from `src/utils/logger.js` and call the appropriate level method.
