import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import logger, { type LogAttributes } from "../utils/ContextLogger";

/**
 * Middleware to attach a logger to the request context.
 * It increments a global request counter and sets up an async context for logging.
 *
 * @param req - The Express request object.
 * @param _res - The Express response object (not used).
 * @param next - The next middleware function in the stack.
 */
export default function loggerAttacher(
	req: Request,
	_res: Response,
	next: NextFunction,
): void {
	// Starting async context
	const requestContext: LogAttributes = {
		traceId: randomUUID(),
		entryPoint: `${req.method}: ${req.url}`,
	};

	logger.runWithAsyncContext(next, requestContext);
}
