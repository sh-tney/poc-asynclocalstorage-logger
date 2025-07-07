import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Represents a structured logging context, which may include a traceId and any additional key-value pairs.
 */
export type LogAttributes = {
	traceId?: string;
} & { [key: string]: unknown };

/**
 * The log levels that can be used to filter logs, and the corresponding console methods.
 */
const LOG_OUTPUTS = {
	DEBUG: console.debug,
	INFO: console.info,
	WARN: console.warn,
	ERROR: console.error,
} as const;
type LogLevel = keyof typeof LOG_OUTPUTS;

/**
 * Logger provides context-aware structured logging, supporting both global and async-local context.
 */
export class Logger {
	private static instance: Logger;

	private globalContext: LogAttributes;
	private readonly asyncContext: AsyncLocalStorage<LogAttributes>;

	/**
	 * Constructor is private to enforce singleton pattern.
	 */
	private constructor() {
		this.globalContext = {};
		this.asyncContext = new AsyncLocalStorage();
	}

	/**
	 * Returns the singleton instance of Logger, ensuring a shared global context.
	 * @returns The singleton Logger instance.
	 */
	static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger();
		}
		return Logger.instance;
	}

	/**
	 * Runs a function within a new async logging context.
	 * Provided attributes will be attached to all logs produced within this context.
	 *
	 * Attributes can be further added or updated with @function upsertAsyncContext
	 * @param fn - The function to execute.
	 * @param context - The attributes to associate with this async scope.
	 * @returns The result of the function.
	 */
	public runWithAsyncContext<T>(fn: () => T, context: LogAttributes = {}): T {
		return this.asyncContext.run(context, fn);
	}

	/**
	 * Returns a snapshot of the current merged context, combining global and async context.
	 * @returns The current effective logging context.
	 */
	public get context(): LogAttributes {
		const asyncStore = this.asyncContext.getStore();
		return {
			...this.globalContext,
			...(asyncStore || {}),
		};
	}

	/**
	 * Adds or updates properties in the global context.
	 * All future logs will have these attributes attached.
	 * @param context - The context properties to add or update globally.
	 */
	public upsertGlobalContext(context: LogAttributes): void {
		this.globalContext = { ...this.globalContext, ...context };
	}

	/**
	 * Adds or updates attributes to the current async logging context.
	 * All future logs from this same async context will have these attributes attached.
	 * If not in an async context, logs a warning that attributes will not be applied.
	 * @param context - The context properties to add or update for the current async scope.
	 */
	public upsertAsyncContext(context: LogAttributes): void {
		const store = this.asyncContext.getStore();
		if (!store) {
			this.warn(
				'This logger is not attached to an asyncContext; make sure you run your function within "runWithAsyncContext(fn, {})".',
			);
			return;
		}
		for (const key in context) store[key] = context[key];
	}

	// ** STANDARD LOGGING FUNCTIONS **

	/**
	 * Logs a structured debug-level message, including any attributes from the current context.
	 * @param message - The message to log.
	 * @param attributes - Additional context to include for just this log entry.
	 */
	public debug(message: string, attributes?: LogAttributes): void {
		this.log("DEBUG", message, attributes);
	}

	/**
	 * Logs a structured info-level message, including any attributes from the current context.
	 * @param message - The message to log.
	 * @param attributes - Additional context to include for just this log entry.
	 */
	public info(message: string, attributes?: LogAttributes): void {
		this.log("INFO", message, attributes);
	}

	/**
	 * Logs a structured warn-level message, including any attributes from the current context.
	 * @param message - The message to log.
	 * @param attributes - Additional context to include for just this log entry.
	 */
	public warn(message: string, attributes?: LogAttributes): void {
		this.log("WARN", message, attributes);
	}

	/**
	 * Logs a structured error-level message, including any attributes from the current context.
	 * @param message - The message to log.
	 * @param attributes - Additional context to include for just this log entry.
	 */
	public error(message: string, attributes?: LogAttributes): void {
		this.log("ERROR", message, attributes);
	}

	/**
	 * Internal log function used by all log level methods.
	 * @param level - The log level.
	 * @param message - The message to log.
	 * @param attributes - Additional context to include for just this log entry.
	 * @private
	 */
	private log(
		level: LogLevel,
		message: string,
		attributes?: LogAttributes,
	): void {
		LOG_OUTPUTS[level](`${level}: "${message}"`, {
			...this.context,
			...attributes,
		});
	}
}

// Create and export the singleton instance
const logger = Logger.getInstance();
export default logger;
