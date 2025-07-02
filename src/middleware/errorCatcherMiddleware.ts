import type { NextFunction, Request, Response } from "express";
import logger from "../Logger";

/**
 * Error catcher middleware for handling uncaught errors in Express.
 * It logs the error and sends a JSON response with a 500 status code.
 * @param {Error} err - The error object that was thrown.
 * @param {Request} _req - The Express request object (not used).
 * @param {Response} res - The Express response object used to send the error response.
 * @param {NextFunction} _next - The next middleware function (not used).
 */
export default function errorCatcherMiddleware(
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
): void {
	logger.error(`Uncaught Error at errorCatcherMiddleware: ${err.message}`, {
		error: err,
		stack: err.stack,
	});

	res.status(500).json({
		error: "Internal Server Error",
		message: err.message,
	});
}
