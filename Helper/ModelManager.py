from llama_cpp import Llama
from threading import Lock
import gc
from Helper.SysPrompt import messages, SYSTEM
import time
from collections import defaultdict
class llmManager:
    def __init__(self, thread=6, nctx=4096, batch=64):
        self._model_locks = defaultdict(Lock)
        self._cache_lock = Lock()  # ✅ Add this line
        self._llm_cache = {}  # {model_path: Llama instance}
        self.n_thread = thread
        self.n_ctx = nctx
        self.batch = batch

    def get_llm(self, model_path: str, chat_format: str = "chatml") -> Llama:
        model_lock = self._model_locks[model_path]
        with model_lock:
            if model_path in self._llm_cache:
                self._llm_cache[model_path]["last_used"] = time.time()
                return self._llm_cache[model_path]["model"]
            if self._llm_cache:
                if model_path not in self._llm_cache:
                    self.remove_all_models()
                    gc.collect()
            model = Llama(
                model_path=model_path,
                n_threads=self.n_thread,
                n_ctx=self.n_ctx,
                n_batch=self.batch,
                chat_format=chat_format,
                use_mmap=True,
                use_mlock=False,
                n_gpu_layers=0,
                vocab_only=False,
                verbose=False
            )
            self._llm_cache[model_path] = {
                "model": model,
                "last_used": time.time()
            }
            print(f"✅ Loaded model: {model_path}")
            return model
    def stream_chat(self, model_path, prompt, max_tokens=256, temperature=0.2, top_p=0.9, top_k=50):
        try:
            if model_path not in self._llm_cache:
                self.get_llm(model_path)  # Re-load if evicted
            self._llm_cache[model_path]["last_used"] = time.time()
            model = self._llm_cache[model_path]["model"]

            # Determine format (chat vs prompt)
            if "mistral" in model_path.lower() or "openhermes" in model_path.lower():
                prompt = f"{SYSTEM}\n\nUser: {prompt}\nAssistant:"
                output_stream = model(
                    prompt=prompt,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    top_p=top_p,
                    top_k=top_k,
                    stream=True,
                    stop=["User:", "Assistant:"]
                )
                for chunk in output_stream:
                    yield chunk["choices"][0]["text"]
            else:
                try:
                    chat_messages = messages + [{"role": "user", "content": prompt}]
                    output_stream = model(
                        messages=chat_messages,
                        temperature=temperature,
                        top_p=top_p,
                        top_k=top_k,
                        max_tokens=max_tokens,
                        stream=True,
                        stop=["<|im_end|>"]
                    )
                    for chunk in output_stream:
                        yield chunk["choices"][0]["delta"].get("content", "")
                except TypeError:
                    prompt = f"{SYSTEM}\n\nUser: {prompt}\nAssistant:"
                    output_stream = model(
                        prompt=prompt,
                        max_tokens=max_tokens,
                        temperature=temperature,
                        top_p=top_p,
                        top_k=top_k,
                        stream=True,
                        stop=["User:", "Assistant:"]
                    )
                    for chunk in output_stream:
                        yield chunk["choices"][0]["text"]
        except Exception as e:
            raise ValueError(f"❌ LLM Stream Chat error: {e}")

    # In ModelManager.py - Modified chat() method
    def chat(self, model_path, prompt, max_tokens=256, temperature=0.2, top_p=0.9, top_k=50):
        """Handle non-streaming chat only"""
        try:
            self._llm_cache[model_path]["last_used"] = time.time()
            model = self._llm_cache[model_path]["model"]

            if "mistral" in model_path.lower() or "openhermes" in model_path.lower():
                prompt = f"{SYSTEM}\n\nUser: {prompt}\nAssistant:"
                output = model(
                    prompt=prompt,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    top_p=top_p,
                    top_k=top_k,
                    stop=["User:", "Assistant:"]
                )
                return output["choices"][0]["text"].strip()
            else:
                try:
                    chat_messages = messages + [{"role": "user", "content": prompt}]
                    output = model(
                        messages=chat_messages,
                        temperature=temperature,
                        top_p=top_p,
                        top_k=top_k,
                        max_tokens=max_tokens,
                        stop=["<|im_end|>"]
                    )
                    return output["choices"][0]["message"]["content"].strip()
                except TypeError:
                    prompt = f"{SYSTEM}\n\nUser: {prompt}\nAssistant:"
                    output = model(
                        prompt=prompt,
                        max_tokens=max_tokens,
                        temperature=temperature,
                        top_p=top_p,
                        top_k=top_k,
                        stop=["User:", "Assistant:"]
                    )
                    return output["choices"][0]["text"].strip()
        except Exception as e:
            raise ValueError(f"❌ LLM Chat error: {e}")

    # Keep stream_chat() as is for streaming functionality

    def model_eviction_loop(self, ttl_seconds=600):
        while True:
            time.sleep(60)  # Check every 1 min
            now = time.time()
            with self._cache_lock:  # ✅ Fix: lock access to _llm_cache safely
                to_remove = [
                    k for k, v in self._llm_cache.items()
                    if now - v["last_used"] > ttl_seconds
                ]
                for k in to_remove:
                    del self._llm_cache[k]
                    print(f"🧹 Unloaded model: {k}")
            gc.collect()
                
    def get_loaded_models(self):
        try:
            with self._cache_lock:
                return list(self._llm_cache.keys())
        except Exception as e:
            return ValueError(f"Error loaded model due to {e}")
    
    def remove_all_models(self):
        try:
            
            with self._cache_lock:
                self._llm_cache.clear()
                print("🧹 Unloaded all models from cache.")
            gc.collect()
        except Exception as e:
            raise ValueError(f"Error remove all model due to {e}")
        
    def is_loaded(self, model_path: str) -> bool:
        return model_path in self._llm_cache