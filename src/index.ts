import type { Express, Request, Response } from "express";
import express from "express";

const app: Express = express();

app.get("/", (req: Request, _res: Response) => {
	console.log("Got req", req.ip);
});

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
