const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function callWithRetry<T>(fn: () => Promise<T>, depth = 0): Promise<T> {
  try {
    return await fn();
  } catch(e: unknown) {
    if (depth > 5) {
      throw e;
    }
    await wait(2 ** depth * 100);

    return callWithRetry(fn, depth + 1);
  }
}
