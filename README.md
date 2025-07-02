# poc-asynclocalstorage-logger
Proof of Concept for a logger implementation using AsyncLocalStorage on Node18

## Project Structure

- **src/Logger.ts**  
  **Primary focus of this project.** Implements a singleton, context-aware logger using Node's `AsyncLocalStorage`. This logger demonstrates how to maintain and propagate structured logging context (such as trace IDs or request-specific data) across asynchronous and deeply nested call stacks. The core proof-of-concept is the reliable use of `AsyncLocalStorage` for per-request or per-async-flow logging context.

- **src/index.ts**  
  Entry point. Sets up an Express server and applies the logger middleware, showcasing how the logger's async context is established and used for each incoming request.

- **src/SomeFunction.ts**  
  Contains `someFunction` and related helpers that exercise deep async/await and promise chains, logging context at each layer. This file is used to demonstrate and stress-test the logger's ability to maintain context across complex async flows.

- **src/SomeFunction.test.ts**  
  Vitest test suite for `someFunction`. Mocks the logger and verifies that logging and context-upserting methods are called as expected, ensuring that context propagation and structured logging work even in error scenarios.

- **src/middleware/loggerMiddleware.ts**  
  (Not shown, but implied) Middleware that likely initializes async context for each request, demonstrating how to hook the logger into a real-world web server.

- **src/middleware/anotherMiddleware.ts**  
  (Not shown, but implied) Additional middleware for demonstration.

- **src/middleware/errorCatcherMiddleware.ts**  
  (Not shown, but implied) Middleware for catching and logging errors.

## Key Concepts Demonstrated

- **AsyncLocalStorage for Logging Context**  
  The main proof-of-concept: using Node's `AsyncLocalStorage` to reliably propagate and access per-request (or per-async-flow) logging context, even through deep async/await and promise chains.

- **Structured, Context-Aware Logging**  
  The `Logger` always includes merged global and async-local context in every log entry, making it easy to trace requests and debug async flows.

- **Testing Context Propagation**  
  The logger is mocked in tests to verify that context is correctly attached to logs, and that logging works as expected in both normal and error scenarios.

## Usage

- **Start the server:**  
  `npm run start`  
  Visit [http://localhost:3000](http://localhost:3000) to trigger logs and see context propagation in action, in the console (rather than the browser).

- **Run tests:**  
  `npm run test`  
  Ensures the logger's context propagation and structured logging work as intended, even in complex async scenarios.
