import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Represents a structured logging context, which may include a traceId and any additional key-value pairs.
 */
export type LogAttributes = {
	traceId?: string;
} & { [key: string]: unknown };

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";
const LOG_OUTPUTS: Record<
	LogLevel,
	(message?: unknown, ...optionalParams: unknown[]) => void
> = {
	DEBUG: console.debug,
	INFO: console.info,
	WARN: console.warn,
	ERROR: console.error,
};

/**
 * ContextLogger provides context-aware structured logging, supporting both global and async-local context.
 */
export default class ContextLogger {
	private static instance: ContextLogger;

	private globalContext: LogAttributes = {};
	private asyncContext: AsyncLocalStorage<LogAttributes> =
		new AsyncLocalStorage();

	/**
	 * Returns the singleton instance of ContextLogger, ensuring a shared global context.
	 * @returns The singleton ContextLogger instance.
	 */
	public static getInstance(): ContextLogger {
		if (!ContextLogger.instance) {
			ContextLogger.instance = new ContextLogger();
		}
		return ContextLogger.instance;
	}

	/**
	 * Runs a function within a new async logging context.
	 * Provided attributes will be attached to all logs produced within this context.
	 *
	 * Attributes can be further added or updated with @function upsertContext
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
		return {
			...this.globalContext,
			...this.asyncContext.getStore(),
		};
	}

	/**
	 * Adds or updates properties in the global context.
	 * All future logs will have these attributes attached.
	 * @param context - The context properties to add or update globally.
	 */
	public upsertGlobalContext(context: LogAttributes): void {
		for (const key in context) this.globalContext[key] = context[key];
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
				'This logger is not attached to an asyncContext; make sure you run your function with "runWithAsyncContext(fn, {})".',
			);
			return;
		}
		for (const key in context) store[key] = context[key];
	}

	// ** STANDARD LOGGING FUNCTIONS **

	/**
	 * Logs a stuctured debug-level message, including any attributes from the current context.
	 * @param message - The message to log.
	 * @param attributes - Additional context to include for just this log entry.
	 */
	public debug(message: string, attributes?: LogAttributes): void {
		this.log("DEBUG", message, attributes);
	}

	/**
	 * Logs a stuctured info-level message, including any attributes from the current context.
	 * @param message - The message to log.
	 * @param attributes - Additional context to include for just this log entry.
	 */
	public info(message: string, attributes?: LogAttributes): void {
		this.log("INFO", message, attributes);
	}

	/**
	 * Logs a stuctured warn-level message, including any attributes from the current context.
	 * @param message - The message to log.
	 * @param attributes - Additional context to include for just this log entry.
	 */
	public warn(message: string, attributes?: LogAttributes): void {
		this.log("WARN", message, attributes);
	}

	/**
	 * Logs a stuctured error-level message, including any attributes from the current context.
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
