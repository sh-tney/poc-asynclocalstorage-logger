import { describe, it, beforeEach, vi, expect } from 'vitest';
import someFunction from './SomeFunction';
import type { Request, Response } from 'express';

vi.mock('./Logger', () => ({
  default: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    upsertAsyncContext: vi.fn(),
    upsertGlobalContext: vi.fn(),
  }
}));

import logger from './Logger';

describe('someFunction', () => {
  const timeoutScalar = 5; // small for fast tests

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls logger.info when executed', async () => {
    await expect(someFunction(timeoutScalar)).rejects.toThrow();
    expect(logger.info).toHaveBeenCalledWith('Executing someFunction');
  });

  it('calls logger.debug with expected messages', async () => {
    await expect(someFunction(timeoutScalar)).rejects.toThrow();
    expect(logger.debug).toHaveBeenCalledWith('Assigned a random integer after delay.');
    expect(logger.debug).toHaveBeenCalledWith(
      'Starting deep parallel execution, which will throw an error in one of the branches.'
    );
    // There may be more debug calls from deepAwaitFunction
  });

  it('calls logger.upsertAsyncContext with assignedAfterDelay', async () => {
    await expect(someFunction(timeoutScalar)).rejects.toThrow();
    expect(logger.upsertAsyncContext).toHaveBeenCalledWith(
      expect.objectContaining({ assignedAfterDelay: expect.any(Number) })
    );
  });

  it('calls logger.error if a Promise in Promise.all rejects', async () => {
    await expect(someFunction(timeoutScalar)).rejects.toThrow();
    expect(logger.error).toHaveBeenCalledWith(
      'Caught error in someFunction, re-throwing',
      expect.objectContaining({ error: expect.any(Error) })
    );
  });

  it('calls logger.info from deepAwaitFunction', async () => {
    await expect(someFunction(timeoutScalar)).rejects.toThrow();
    expect(logger.info).toHaveBeenCalledWith('Logging from 5 await layers deep!');
  });
}); 