import { randomInt } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import logger from "../Logger";

/**
 * Middleware to assign a random integer to the logger's async context.
 * This middleware simulates an operation that assigns a value to the logger's context.
 *
 * @param _req - The Express request object (not used).
 * @param _res - The Express response object (not used).
 * @param next - The next middleware function in the stack.
 */
export default function anotherMiddleware(
	_req: Request,
	_res: Response,
	next: NextFunction,
): void {
	logger.upsertAsyncContext({ assignedFromAnotherMiddleware: randomInt(1000) });

	logger.debug("Assigned a field from another middleware");

	next();
}
