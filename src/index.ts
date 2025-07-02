import type { Express, Request, Response } from "express";
import express from "express";
import anotherMiddleware from "./middleware/anotherMiddleware";
import errorCatcherMiddleware from "./middleware/errorCatcherMiddleware";
import loggerMiddleware from "./middleware/loggerMiddleware";
import someFunction from "./SomeFunction";
import logger from "./Logger";

const app: Express = express();
let globalRequestCounter = 0;

app.use(loggerMiddleware);
app.use(anotherMiddleware);

app.get("/", async (req: Request, res: Response) => {
	// Have a global request counter to track the number of requests
	globalRequestCounter++;
	logger.upsertGlobalContext({ globalRequestCounter });
	logger.upsertAsyncContext({ requestNumber: globalRequestCounter });

	logger.info(`Received request number: ${globalRequestCounter}`);

	return someFunction(10000);
});

app.use(errorCatcherMiddleware);

app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
