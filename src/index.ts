import type { Express, Request, Response } from "express";
import express from "express";
import ContextLogger from "./ContextLogger";
import anotherMiddleware from "./middleware/anotherMiddleware";
import errorCatcher from "./middleware/errorCatcher";
import loggerAttacher from "./middleware/loggerAttacher";
import someFunction from "./SomeFunction";

const app: Express = express();
let globalRequestCounter = 0;

app.use(loggerAttacher);
app.use(anotherMiddleware);

app.get("/", async (req: Request, res: Response) => {
	const logger = ContextLogger.getInstance();

	// Have a global request counter to track the number of requests
	globalRequestCounter++;
	logger.upsertGlobalContext({ globalRequestCounter });
	logger.upsertAsyncContext({ requestNumber: globalRequestCounter });

	logger.info(`Received request number: ${globalRequestCounter}`);

	return someFunction(req, res);
});

app.use(errorCatcher);

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
