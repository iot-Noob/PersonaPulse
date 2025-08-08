import asyncio
from fastapi.concurrency import run_in_threadpool

class MicroBatcher:
    def __init__(self, max_batch_size=4, max_wait_ms=50):
        self.max_batch_size = max_batch_size
        self.max_wait_ms = max_wait_ms / 1000  # convert ms to seconds
        self.queue = []
        self.lock = asyncio.Lock()
        self.batch_ready_event = asyncio.Event()
        self.running = True

    async def add_request(self, model_name, prompt, temperature, max_tokens):
        future = asyncio.get_event_loop().create_future()

        async with self.lock:
            self.queue.append({
                "model_name": model_name,
                "prompt": prompt,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "future": future
            })

            # If batch full, trigger batch processing early
            if len(self.queue) >= self.max_batch_size:
                self.batch_ready_event.set()

        # Wait for batch to be processed and get the result
        return await future

    async def batch_worker(self, llm_manager):
        while self.running:
            try:
                # Wait for batch ready or timeout
                try:
                    await asyncio.wait_for(self.batch_ready_event.wait(), timeout=self.max_wait_ms)
                except asyncio.TimeoutError:
                    pass

                async with self.lock:
                    batch = self.queue
                    self.queue = []
                    self.batch_ready_event.clear()

                if not batch:
                    continue

                # Prepare batch inputs
                prompts = [item["prompt"] for item in batch]
                model_name = batch[0]["model_name"]
                temperature = batch[0]["temperature"]
                max_tokens = batch[0]["max_tokens"]

                # IMPORTANT: Adjust this depending on how your llm_manager.chat supports batch
                # For demonstration, we join prompts with a delimiter (e.g. "\n---\n")
                combined_prompt = "\n---\n".join(prompts)

                # Run model call in threadpool to avoid blocking
                combined_response = await run_in_threadpool(
                    llm_manager.chat,
                    model_name,
                    combined_prompt,
                    temperature,
                    max_tokens
                )

                # Here you must split combined_response into individual responses.
                # This depends on your model output format. For demo, assume responses are separated by "\n---\n"
                split_responses = combined_response.split("\n---\n")

                # If split count doesn't match batch size, fallback: send full response to all
                if len(split_responses) != len(batch):
                    split_responses = [combined_response] * len(batch)

                # Set result for each future to unblock requests
                for item, response in zip(batch, split_responses):
                    if not item["future"].done():
                        item["future"].set_result(response)

            except Exception as e:
                # On error, fail all futures so callers don't wait forever
                async with self.lock:
                    for item in self.queue:
                        if not item["future"].done():
                            item["future"].set_exception(e)
                    self.queue.clear()
                    self.batch_ready_event.clear()

    def stop(self):
        self.running = False
        self.batch_ready_event.set()
