import type { Express, Request, Response } from "express";
import express from "express";
import { ContextLogger } from "./ContextLogger";
import attachLogger from "./middleware/attachLogger";
import errorCatcher from "./middleware/errorCatcher";

const app: Express = express();
let globalRequestCounter = 0;

app.use(attachLogger);

app.get("/", async (_req: Request, _res: Response) => {
	const logger = ContextLogger.getInstance();
	globalRequestCounter++;
	logger.upsertGlobalContext({ globalRequestCounter });
	logger.upsertAsyncContext({ requestNumber: globalRequestCounter });

	logger.info(`Received request number: ${globalRequestCounter}`);

	await new Promise((resolve) => setTimeout(resolve, 5000));

	logger.info("This message is logged after 5 seconds");

	throw new Error(
		"This is a test error, which will be thrown to an error middleware",
	); // This will trigger the error catcher middleware
});

app.use(errorCatcher);

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
