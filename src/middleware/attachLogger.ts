import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { ContextLogger, type LogAttributes } from "../ContextLogger";

let globalRequestCounter = 0;

/**
 * Middleware to attach a logger to the request context.
 * It increments a global request counter and sets up an async context for logging.
 *
 * @param req - The Express request object.
 * @param _res - The Express response object (not used).
 * @param next - The next middleware function in the stack.
 */
export default function attachLogger(
	req: Request,
	_res: Response,
	next: NextFunction,
): void {
	const logger = ContextLogger.getInstance();

	// Test 'Global' context
	globalRequestCounter++;
	logger.upsertGlobalContext({ globalRequestCounter });

	// Test 'Async' context
	const requestContext: LogAttributes = {
		traceId: randomUUID(),
		entryPoint: `${req.method}: ${req.url}`,
		requestNumber: globalRequestCounter,
	};

	logger.runWithAsyncContext(next, requestContext);
}
