import type { NextFunction, Request, Response } from "express";
import { ContextLogger } from "../ContextLogger";

export default function errorCatcher(
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
): void {
	const logger = ContextLogger.getInstance();
	const context = logger.context;

	logger.error(`Uncaught Error: ${err.message}`, context);

	res.status(500).json({
		error: "Internal Server Error",
		message: err.message,
	});
}
