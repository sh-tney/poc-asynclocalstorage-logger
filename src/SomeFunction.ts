import { randomInt } from "node:crypto";
import type { Request, Response } from "express";
import ContextLogger from "./ContextLogger";

// Because the logger is a singleton, we can get the instance directly
const logger = ContextLogger.getInstance();

export default async function someFunction(
	_req: Request,
	_res: Response,
): Promise<void> {
	logger.info("Executing someFunction");

	// Simulate some asynchronous operation
	const assignedAfterDelay = randomInt(10000); // Generate a random integer after the delay
	await new Promise((resolve) => setTimeout(resolve, assignedAfterDelay)); // Simulate async operation
	logger.upsertAsyncContext({ assignedAfterDelay });
	logger.debug("Assigned a random integer after delay.");

	logger.debug(
		"Starting deep parallel execution, which will throw an error in one of the branches.",
	);
	await Promise.all([deepAwaitFunction(), deepPromiseThenFunction()]).catch(
		(err) => {
			logger.error("Caught error in someFunction, re-throwing", { error: err });
			throw err; // Re-throw the error to be caught by the error catcher middleware
		},
	);
}

async function deepAwaitFunction() {
	async function layer1() {
		async function layer2() {
			async function layer3() {
				async function layer4() {
					async function layer5() {
						const assignedAwaitFromLayer5 = randomInt(10000);
						await new Promise((resolve) =>
							setTimeout(resolve, assignedAwaitFromLayer5),
						); // Simulate async operation
						logger.upsertAsyncContext({ assignedAwaitFromLayer5 });
						logger.info("Logging from 5 await layers deep!");
					}
					await layer5();
				}
				await layer4();
			}
			await layer3();
			const assignedFromAwaitLayer2 = randomInt(10000);
			logger.upsertAsyncContext({ assignedFromAwaitLayer2 });
			await new Promise((resolve) =>
				setTimeout(resolve, assignedFromAwaitLayer2),
			); // Simulate async operation
			logger.debug("Logging from await layer 2, on the way back up!");
		}
		await layer2();
	}
	await layer1();
}

async function deepPromiseThenFunction() {
	function layer5(): Promise<void> {
		const assignedFromPromiseThenLayer5 = randomInt(10000);
		return new Promise((resolve) =>
			setTimeout(resolve, assignedFromPromiseThenLayer5),
		).then(() => {
			logger.upsertAsyncContext({
				assignedFromPromiseThenLayer5,
			});
			logger.info("Throwing error from 5 promise-then layers deep!");
			throw new Error("Random error from promise-then layer 5!");
		});
	}

	function layer4(): Promise<void> {
		return layer5();
	}

	function layer3(): Promise<void> {
		return layer4();
	}

	function layer2(): Promise<void> {
		const assignedFromPromiseThenLayer2 = randomInt(10000);
		return layer3()
			.then(() => {
				logger.upsertAsyncContext({ assignedFromPromiseThenLayer2 });
				return new Promise((resolve) =>
					setTimeout(resolve, assignedFromPromiseThenLayer2),
				);
			})
			.then(() => {
				logger.debug("This promise-then log should never be reached.");
			});
	}

	function layer1(): Promise<void> {
		return layer2();
	}

	try {
		await layer1();
	} catch (err) {
		logger.error("Caught error in deepPromiseThenFunction, re-throwing", {
			error: err,
		});
		throw err; // Re-throw the error to be caught by the error catcher middleware
	}
}
