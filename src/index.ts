import type { Express, Request, Response } from "express";
import express from "express";
import { ContextLogger } from "./ContextLogger";
import attachLogger from "./middleware/attachLogger";

const app: Express = express();

app.use(attachLogger);

app.get("/", (req: Request, _res: Response) => {
	const logger = ContextLogger.getInstance();
	logger.info(`here`);
});

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
