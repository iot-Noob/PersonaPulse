from llama_cpp import Llama
from threading import Lock
import gc
import time
from collections import defaultdict
from Helper.SysPrompt import system_messages, SYSTEM_MM
import os
import json
class llmManager:
    def __init__(self, thread=6, nctx=4096, batch=64,mod_mf:dict={}):
        self._model_locks = defaultdict(Lock)  # now keyed by model_name
        self._cache_lock = Lock()
        self._llm_cache = {}  # {model_name: {"model": Llama, "last_used": time, "path": str}}
        self.n_thread = thread
        self.n_ctx = nctx
        self.batch = batch
        self.mod_mainifest_file:dict=mod_mf
    def get_llm(self, model_name: str, chat_format: str = "chatml") -> Llama:
        model_lock = self._model_locks[model_name]
        with model_lock:
            if model_name in self._llm_cache:
                self._llm_cache[model_name]["last_used"] = time.time()
                return self._llm_cache[model_name]["model"]
            # Get model path from manifest
            if model_name not in self.mod_mainifest_file:
                raise ValueError(f"❌ Model name '{model_name}' not found in manifest.")
            model_path = self.mod_mainifest_file[model_name]
            # Clear previous models before loading new one
            self.remove_all_models()
            gc.collect()
            try:
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
            except Exception as e:
                raise RuntimeError(f"Failed to load model from {model_path}: {e}")

            with self._cache_lock:
                self._llm_cache[model_name] = {
                    "model": model,
                    "last_used": time.time(),
                    "model_path": model_path
                }

            print(f"✅ Loaded model: {model_path}")
            return model


    def stream_chat(self, model_name: str, prompt, max_tokens=1024, temperature=0.2, top_p=0.9, top_k=50):
        try:
            if model_name not in self._llm_cache:
                raise ValueError("❌ Model not loaded or name is invalid")

            self._llm_cache[model_name]["last_used"] = time.time()
            model = self._llm_cache[model_name]["model"]

            # 🔧 Correctly use dict-based manifest
            if model_name not in self.mod_mainifest_file:
                raise ValueError(f"❌ Model name '{model_name}' not found in manifest.")
            model_filename = self.mod_mainifest_file[model_name].lower()

            is_mistral = any(x in model_filename for x in ["mistral", "openhermes", "dolphin"])

            if is_mistral:
                prompt =  [{"role": "system", "content": SYSTEM_MM}, {"role": "user", "content": prompt}]
                output_stream = model(
                    prompt=prompt,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    top_p=top_p,
                    top_k=top_k,
                    stream=True,
                    stop=["<|endoftext|>"]
                )
                for chunk in output_stream:
                    yield chunk["choices"][0]["text"]
            else:
                try:
                    chat_messages = system_messages + [{"role": "user", "content": prompt}]
                    output_stream = model(
                        messages=chat_messages,
                        temperature=temperature,
                        top_p=top_p,
                        top_k=top_k,
                        max_tokens=max_tokens,
                        stream=True,
                       stop=["<|endoftext|>"]
                    )
                    for chunk in output_stream:
                        yield chunk["choices"][0]["delta"].get("content", "")
                except TypeError:
                    prompt = f"{SYSTEM_MM}\n\nUser: {prompt}\nAssistant:"
                    output_stream = model(
                        prompt=prompt,
                        max_tokens=max_tokens,
                        temperature=temperature,
                        top_p=top_p,
                        top_k=top_k,
                        stream=True,
                        stop=["<|endoftext|>"]
                    )
                    for chunk in output_stream:
                        yield chunk["choices"][0]["text"]
        except Exception as e:
            raise ValueError(f"❌ LLM Stream Chat error: {e}")

    def chat(self, model_name: str, prompt, max_tokens=1024, temperature=0.2, top_p=0.9, top_k=50):
        try:
            if model_name not in self._llm_cache:
                raise ValueError("❌ Model not loaded. Please load the model first.")

            self._llm_cache[model_name]["last_used"] = time.time()
            model = self._llm_cache[model_name]["model"]

            # 🔧 Correctly use dict-based manifest
            if model_name not in self.mod_mainifest_file:
                raise ValueError(f"❌ Model name '{model_name}' not found in manifest.")
            model_filename = self.mod_mainifest_file[model_name].lower()

            is_mistral = any(x in model_filename for x in ["mistral", "openhermes", "dolphin"])

            if is_mistral:
                prompt = f"{SYSTEM_MM}\n\nUser: {prompt}\nAssistant:"
                output = model(
                    prompt=prompt,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    top_p=top_p,
                    top_k=top_k,
                   stop=["<|endoftext|>"]
                )
                return output["choices"][0]["text"].strip()
            else:
                try:
                    chat_messages = system_messages + [{"role": "user", "content": prompt}]
                    output = model(
                        messages=chat_messages,
                        temperature=temperature,
                        top_p=top_p,
                        top_k=top_k,
                        max_tokens=max_tokens,
                        stop=["<|endoftext|>"]
                    )
                    return output["choices"][0]["message"]["content"].strip()
                except TypeError:
                    prompt = f"{SYSTEM_MM}\n\nUser: {prompt}\nAssistant:"
                    output = model(
                        prompt=prompt,
                        max_tokens=max_tokens,
                        temperature=temperature,
                        top_p=top_p,
                        top_k=top_k,
                        stop=["<|endoftext|>"]
                    )
                    return output["choices"][0]["text"].strip()
        except Exception as e:
            raise ValueError(f"❌ LLM Chat error: {e}")


    def model_eviction_loop(self, ttl_seconds=600):
        while True:
            time.sleep(60)
            now = time.time()
            with self._cache_lock:
                to_remove = [k for k, v in self._llm_cache.items() if now - v["last_used"] > ttl_seconds]
                for k in to_remove:
                    del self._llm_cache[k]
                    print(f"🧹 Unloaded model: {k}")
            gc.collect()
    def get_loaded_models(self):
        try:
            with self._cache_lock:
                return [
                    {"model_name": k, "path": v.get("model_path"), "last_used": v.get("last_used")}
                    for k, v in self._llm_cache.items()
                ]
        except Exception as e:
            raise ValueError(f"Error getting loaded models: {e}")
    def remove_all_models(self):
        try: 
            with self._cache_lock:
                self._llm_cache.clear()
                print("🧹 Unloaded all models from cache.")
            gc.collect()
            return  " 🧹 All model unloaded sucess"
        except Exception as e:
            raise ValueError(f"Error removing all models: {e}")
    def is_loaded(self, model_name: str) -> bool:
        return model_name in self._llm_cache
        
    def convert_manifest_json(self, manifest_path: str) -> dict:
        with open(manifest_path, 'r') as jf:
            jdata = json.load(jf)
        out = {}
        base_path = os.path.dirname(manifest_path)
        for entry in jdata:
            out[entry['file_name']] = os.path.join(base_path, entry['model_name'])
        return out
