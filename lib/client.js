var module = { exports: {} }; var exports = module.exports;
window.__ModuleLoader__.load({ id: "dsh-gitlab-panel", factory: (require) => {
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js
var React, import_jsx_runtime, QueryClientContext, useQueryClient, QueryClientProvider;
var init_QueryClientProvider = __esm({
  "node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js"() {
    "use client";
    React = __toESM(require("react"), 1);
    import_jsx_runtime = require("react/jsx-runtime");
    QueryClientContext = React.createContext(void 0);
    useQueryClient = (queryClient2) => {
      const client = React.useContext(QueryClientContext);
      if (queryClient2) return queryClient2;
      if (!client) throw new Error("No QueryClient set, use QueryClientProvider to set one");
      return client;
    };
    QueryClientProvider = ({ client, children }) => {
      React.useEffect(() => {
        client.mount();
        return () => {
          client.unmount();
        };
      }, [client]);
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientContext.Provider, {
        value: client,
        children
      });
    };
  }
});

// node_modules/@tanstack/query-core/build/modern/timeoutManager.js
function systemSetTimeoutZero(callback) {
  setTimeout(callback, 0);
}
var defaultTimeoutProvider, TimeoutManager, timeoutManager;
var init_timeoutManager = __esm({
  "node_modules/@tanstack/query-core/build/modern/timeoutManager.js"() {
    defaultTimeoutProvider = {
      setTimeout: (callback, delay) => setTimeout(callback, delay),
      clearTimeout: (timeoutId) => clearTimeout(timeoutId),
      setInterval: (callback, delay) => setInterval(callback, delay),
      clearInterval: (intervalId) => clearInterval(intervalId)
    };
    TimeoutManager = class {
      #provider = defaultTimeoutProvider;
      #providerCalled = false;
      /**
      * `setTimeoutProvider` can be used to set a custom implementation of the
      * `setTimeout`, `clearTimeout`, `setInterval`, `clearInterval` functions,
      * called a `TimeoutProvider`.
      *
      * This may be useful if you notice event loop performance issues with
      * thousands of queries. A custom TimeoutProvider could also support timer
      * delays longer than the global `setTimeout` maximum delay value of about
      * 24 days.
      *
      * It is important to call `setTimeoutProvider` before creating a
      * QueryClient or queries, so that the same provider is used consistently
      * for all timers in the application, since different TimeoutProviders
      * cannot cancel each others' timers.
      * @param provider - The `TimeoutProvider` to use for all timers from now on.
      * @example
      * ```ts
      * import { timeoutManager, QueryClient } from '@tanstack/query-core'
      * import { CustomTimeoutProvider } from './CustomTimeoutProvider'
      *
      * timeoutManager.setTimeoutProvider(new CustomTimeoutProvider())
      *
      * export const queryClient = new QueryClient()
      * ```
      */
      setTimeoutProvider(provider) {
        if (false) {
          if (this.#providerCalled && provider !== this.#provider) console.error(`[timeoutManager]: Switching provider after calls to previous provider might result in unexpected behavior.`, {
            previous: this.#provider,
            provider
          });
        }
        this.#provider = provider;
        if (false) this.#providerCalled = false;
      }
      /**
      * `setTimeout` schedules a callback to run after approximately `delay`
      * milliseconds, like the global `setTimeout` function. The callback can be
      * canceled with `clearTimeout`.
      *
      * It returns a timer ID, which may be a number or an object that can be
      * coerced to a number via `Symbol.toPrimitive`.
      * @param callback - The function to call when the timeout elapses.
      * @param delay - The time to wait before calling `callback`, in milliseconds.
      * @returns The timer ID, to pass to {@link TimeoutManager#clearTimeout}.
      * @example
      * ```ts
      * import { timeoutManager } from '@tanstack/query-core'
      *
      * const timeoutId = timeoutManager.setTimeout(
      *   () => console.log('ran at:', new Date()),
      *   1000,
      * )
      *
      * const timeoutIdNumber: number = Number(timeoutId)
      * ```
      */
      setTimeout(callback, delay) {
        if (false) this.#providerCalled = true;
        return this.#provider.setTimeout(callback, delay);
      }
      /**
      * `clearTimeout` cancels a timeout callback scheduled with `setTimeout`,
      * like the global `clearTimeout` function. It should be called with a
      * timer ID returned by `setTimeout`.
      * @param timeoutId - The timer ID returned by `setTimeout`, or `undefined`.
      * @example
      * ```ts
      * import { timeoutManager } from '@tanstack/query-core'
      *
      * const timeoutId = timeoutManager.setTimeout(
      *   () => console.log('ran at:', new Date()),
      *   1000,
      * )
      *
      * timeoutManager.clearTimeout(timeoutId)
      * ```
      */
      clearTimeout(timeoutId) {
        this.#provider.clearTimeout(timeoutId);
      }
      /**
      * `setInterval` schedules a callback to be called approximately every
      * `delay` milliseconds, like the global `setInterval` function.
      *
      * Like `setTimeout`, it returns a timer ID, which may be a number or an
      * object that can be coerced to a number via `Symbol.toPrimitive`.
      * @param callback - The function to call on every interval.
      * @param delay - The time between calls, in milliseconds.
      * @returns The timer ID, to pass to {@link TimeoutManager#clearInterval}.
      * @example
      * ```ts
      * import { timeoutManager } from '@tanstack/query-core'
      *
      * const intervalId = timeoutManager.setInterval(
      *   () => console.log('ran at:', new Date()),
      *   1000,
      * )
      * ```
      */
      setInterval(callback, delay) {
        if (false) this.#providerCalled = true;
        return this.#provider.setInterval(callback, delay);
      }
      /**
      * `clearInterval` can be used to cancel an interval, like the global
      * `clearInterval` function. It should be called with an interval ID
      * returned by `setInterval`.
      * @param intervalId - The timer ID returned by `setInterval`, or `undefined`.
      * @example
      * ```ts
      * import { timeoutManager } from '@tanstack/query-core'
      *
      * const intervalId = timeoutManager.setInterval(
      *   () => console.log('ran at:', new Date()),
      *   1000,
      * )
      *
      * timeoutManager.clearInterval(intervalId)
      * ```
      */
      clearInterval(intervalId) {
        this.#provider.clearInterval(intervalId);
      }
    };
    timeoutManager = new TimeoutManager();
  }
});

// node_modules/@tanstack/query-core/build/modern/utils.js
function noop() {
}
function functionalUpdate(updater, input) {
  return typeof updater === "function" ? updater(input) : updater;
}
function isValidTimeout(value) {
  return typeof value === "number" && value >= 0 && value !== Infinity;
}
function timeUntilStale(updatedAt, staleTime) {
  return Math.max(updatedAt + (staleTime || 0) - Date.now(), 0);
}
function resolveQueryValue(value, query) {
  return typeof value === "function" ? value(query) : value;
}
function matchQuery(filters, query) {
  const { type = "all", exact, fetchStatus, predicate, queryKey, stale } = filters;
  if (queryKey) {
    if (exact) {
      if (query.queryHash !== hashQueryKeyByOptions(queryKey, query.options)) return false;
    } else if (!partialMatchKey(query.queryKey, queryKey)) return false;
  }
  if (type !== "all") {
    const isActive = query.isActive();
    if (type === "active" && !isActive) return false;
    if (type === "inactive" && isActive) return false;
  }
  if (typeof stale === "boolean" && query.isStale() !== stale) return false;
  if (fetchStatus && fetchStatus !== query.state.fetchStatus) return false;
  if (predicate && !predicate(query)) return false;
  return true;
}
function matchMutation(filters, mutation) {
  const { exact, status, predicate, mutationKey } = filters;
  if (mutationKey) {
    if (!mutation.options.mutationKey) return false;
    if (exact) {
      if (hashKey(mutation.options.mutationKey) !== hashKey(mutationKey)) return false;
    } else if (!partialMatchKey(mutation.options.mutationKey, mutationKey)) return false;
  }
  if (status && mutation.state.status !== status) return false;
  if (predicate && !predicate(mutation)) return false;
  return true;
}
function hashQueryKeyByOptions(queryKey, options) {
  return (options?.queryKeyHashFn || hashKey)(queryKey);
}
function hashKey(queryKey) {
  return JSON.stringify(queryKey, (_, val) => isPlainObject(val) ? Object.keys(val).sort().reduce((result, key) => {
    result[key] = val[key];
    return result;
  }, {}) : val);
}
function partialMatchKey(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a && b && typeof a === "object" && typeof b === "object") {
    if (Array.isArray(a) && Array.isArray(b)) {
      if (b.length > a.length) return false;
      for (let i = 0; i < b.length; i++) if (!partialMatchKey(a[i], b[i])) return false;
      return true;
    }
    const bKeys = Object.keys(b);
    for (const key of bKeys) if (!partialMatchKey(a[key], b[key])) return false;
    return true;
  }
  return false;
}
function replaceEqualDeep(a, b, depth = 0) {
  if (a === b) return a;
  if (depth > 500) return b;
  const array = isPlainArray(a) && isPlainArray(b);
  if (!array && !(isPlainObject(a) && isPlainObject(b))) return b;
  const aSize = (array ? a : Object.keys(a)).length;
  const bItems = array ? b : Object.keys(b);
  const bSize = bItems.length;
  const copy = array ? new Array(bSize) : {};
  let equalItems = 0;
  for (let i = 0; i < bSize; i++) {
    const key = array ? i : bItems[i];
    const aItem = a[key];
    const bItem = b[key];
    if (aItem === bItem) {
      copy[key] = aItem;
      if (array ? i < aSize : hasOwn.call(a, key)) equalItems++;
      continue;
    }
    if (aItem === null || bItem === null || typeof aItem !== "object" || typeof bItem !== "object") {
      copy[key] = bItem;
      continue;
    }
    const v = replaceEqualDeep(aItem, bItem, depth + 1);
    copy[key] = v;
    if (v === aItem) equalItems++;
  }
  return aSize === bSize && equalItems === aSize ? a : copy;
}
function shallowEqualObjects(a, b) {
  if (!b || Object.keys(a).length !== Object.keys(b).length) return false;
  for (const key in a) if (a[key] !== b[key]) return false;
  return true;
}
function isPlainArray(value) {
  return Array.isArray(value) && value.length === Object.keys(value).length;
}
function isPlainObject(o) {
  if (!hasObjectPrototype(o)) return false;
  const objectPrototype = Object.getPrototypeOf(o);
  const ctor = objectPrototype?.constructor;
  if (ctor === void 0) return true;
  if (typeof ctor !== "function") return false;
  const prot = ctor.prototype;
  if (!hasObjectPrototype(prot)) return false;
  if (!prot.hasOwnProperty("isPrototypeOf")) return false;
  if (objectPrototype !== Object.prototype) return false;
  return true;
}
function hasObjectPrototype(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}
function sleep(timeout) {
  return new Promise((resolve) => {
    timeoutManager.setTimeout(resolve, timeout);
  });
}
function replaceData(prevData, data, options) {
  if (typeof options.structuralSharing === "function") return options.structuralSharing(prevData, data);
  else if (options.structuralSharing !== false) {
    if (false) try {
      return replaceEqualDeep(prevData, data);
    } catch (error) {
      console.error(`Structural sharing requires data to be JSON serializable. To fix this, turn off structuralSharing or return JSON-serializable data from your queryFn. [${options.queryHash}]: ${error}`);
      throw error;
    }
    return replaceEqualDeep(prevData, data);
  }
  return data;
}
function addToEnd(items, item, max = 0) {
  const newItems = [...items, item];
  return max && newItems.length > max ? newItems.slice(1) : newItems;
}
function addToStart(items, item, max = 0) {
  const newItems = [item, ...items];
  return max && newItems.length > max ? newItems.slice(0, -1) : newItems;
}
function ensureQueryFn(options, fetchOptions) {
  if (false) {
    if (options.queryFn === skipToken) console.error(`Attempted to invoke queryFn when set to skipToken. This is likely a configuration error. Query hash: '${options.queryHash}'`);
  }
  if (!options.queryFn && fetchOptions?.initialPromise) return () => fetchOptions.initialPromise;
  if (!options.queryFn || options.queryFn === skipToken) return () => Promise.reject(/* @__PURE__ */ new Error(`Missing queryFn: '${options.queryHash}'`));
  return options.queryFn;
}
function shouldThrowError(throwOnError, params) {
  if (typeof throwOnError === "function") return throwOnError(...params);
  return !!throwOnError;
}
function addConsumeAwareSignal(object, getSignal, onCancelled) {
  let consumed = false;
  let signal;
  Object.defineProperty(object, "signal", {
    enumerable: true,
    get: () => {
      signal ??= getSignal();
      if (consumed) return signal;
      consumed = true;
      if (signal.aborted) onCancelled();
      else signal.addEventListener("abort", onCancelled, { once: true });
      return signal;
    }
  });
  return object;
}
var isServer, hasOwn, skipToken;
var init_utils = __esm({
  "node_modules/@tanstack/query-core/build/modern/utils.js"() {
    init_timeoutManager();
    isServer = typeof window === "undefined" || "Deno" in globalThis;
    hasOwn = Object.prototype.hasOwnProperty;
    skipToken = Symbol();
  }
});

// node_modules/@tanstack/query-core/build/modern/environmentManager.js
var isServerFn, isServer2;
var init_environmentManager = __esm({
  "node_modules/@tanstack/query-core/build/modern/environmentManager.js"() {
    init_utils();
    isServerFn = () => isServer;
    isServer2 = () => isServerFn();
  }
});

// node_modules/@tanstack/query-core/build/modern/subscribable.js
var Subscribable;
var init_subscribable = __esm({
  "node_modules/@tanstack/query-core/build/modern/subscribable.js"() {
    Subscribable = class {
      constructor() {
        this.listeners = /* @__PURE__ */ new Set();
        this.subscribe = this.subscribe.bind(this);
      }
      /**
      * Registers a listener to be called on every update this object notifies about. Returns a function
      * that removes the listener again — call it to stop listening. The base class never drops a listener
      * on its own, though some subclasses clear all of theirs in `destroy()`.
      * @param listener - Called on each update, with whatever the subclass passes to its subscribers.
      * @returns A function that removes the listener.
      * @example
      * ```ts
      * const unsubscribe = subscribable.subscribe(() => {
      *   // react to the update
      * })
      *
      * unsubscribe()
      * ```
      */
      subscribe(listener) {
        this.listeners.add(listener);
        this.onSubscribe();
        return () => {
          this.listeners.delete(listener);
          this.onUnsubscribe();
        };
      }
      /**
      * Returns `true` while at least one listener is registered, `false` once they have all unsubscribed.
      * @returns `true` if at least one listener is registered.
      */
      hasListeners() {
        return this.listeners.size > 0;
      }
      /**
      * Called after a listener is added. Does nothing here; subclasses override it, e.g. to start
      * tracking what they observe once the first listener subscribes.
      */
      onSubscribe() {
      }
      /**
      * Called after a listener is removed. Does nothing here; subclasses override it, e.g. to clean up
      * once the last listener unsubscribes.
      */
      onUnsubscribe() {
      }
    };
  }
});

// node_modules/@tanstack/query-core/build/modern/focusManager.js
var FocusManager, focusManager;
var init_focusManager = __esm({
  "node_modules/@tanstack/query-core/build/modern/focusManager.js"() {
    init_subscribable();
    FocusManager = class extends Subscribable {
      #focused;
      #cleanup;
      #setup;
      constructor() {
        super();
        this.#setup = (onFocus) => {
          if (typeof window !== "undefined" && window.addEventListener) {
            const listener = () => onFocus();
            window.addEventListener("visibilitychange", listener, false);
            return () => {
              window.removeEventListener("visibilitychange", listener);
            };
          }
        };
      }
      onSubscribe() {
        if (!this.#cleanup) this.setEventListener(this.#setup);
      }
      onUnsubscribe() {
        if (!this.hasListeners()) {
          this.#cleanup?.();
          this.#cleanup = void 0;
        }
      }
      /**
      * `setEventListener` can be used to set a custom event listener that will
      * be used to determine the focus state. The provided `setup` function
      * receives a `setFocused` callback: call it with a `boolean` to manually
      * set the focus state, or with no arguments to re-evaluate the current
      * focus state and notify subscribers.
      * @param setup - Receives the `setFocused` callback, registers the event listener, and may return
      * a cleanup function that is called when the listener is replaced or no longer needed.
      * @example
      * ```ts
      * import { focusManager } from '@tanstack/query-core'
      *
      * focusManager.setEventListener((handleFocus) => {
      *   const listener = () => handleFocus()
      *   // Listen to visibilitychange
      *   if (typeof window !== 'undefined' && window.addEventListener) {
      *     window.addEventListener('visibilitychange', listener, false)
      *   }
      *
      *   return () => {
      *     // Be sure to unsubscribe if a new handler is set
      *     window.removeEventListener('visibilitychange', listener)
      *   }
      * })
      * ```
      */
      setEventListener(setup) {
        this.#setup = setup;
        this.#cleanup?.();
        this.#cleanup = setup((focused) => {
          if (typeof focused === "boolean") this.setFocused(focused);
          else this.onFocus();
        });
      }
      /**
      * `setFocused` can be used to manually set the focus state. Set `undefined`
      * to fall back to the default focus check.
      * @param focused - The focus state, or `undefined` to use the default focus check.
      * @example
      * ```ts
      * import { focusManager } from '@tanstack/query-core'
      *
      * // Set focused
      * focusManager.setFocused(true)
      *
      * // Set unfocused
      * focusManager.setFocused(false)
      *
      * // Fallback to the default focus check
      * focusManager.setFocused(undefined)
      * ```
      */
      setFocused(focused) {
        if (this.#focused !== focused) {
          this.#focused = focused;
          this.onFocus();
        }
      }
      /**
      * `onFocus` notifies all subscribed listeners with the current focus state.
      */
      onFocus() {
        const isFocused = this.isFocused();
        this.listeners.forEach((listener) => {
          listener(isFocused);
        });
      }
      /**
      * `isFocused` can be used to get the current focus state.
      * @returns The focus state set with `setFocused`, or otherwise whether the document is visible.
      */
      isFocused() {
        if (typeof this.#focused === "boolean") return this.#focused;
        return globalThis.document?.visibilityState !== "hidden";
      }
    };
    focusManager = new FocusManager();
  }
});

// node_modules/@tanstack/query-core/build/modern/notifyManager.js
function createNotifyManager() {
  let queue = [];
  let transactions = 0;
  let notifyFn = (callback) => {
    callback();
  };
  let batchNotifyFn = (callback) => {
    callback();
  };
  let scheduleFn = defaultScheduler;
  const schedule = (callback) => {
    if (transactions) queue.push(callback);
    else scheduleFn(() => {
      notifyFn(callback);
    });
  };
  const flush = () => {
    const originalQueue = queue;
    queue = [];
    if (originalQueue.length) scheduleFn(() => {
      batchNotifyFn(() => {
        originalQueue.forEach((callback) => {
          notifyFn(callback);
        });
      });
    });
  };
  return {
    /**
    * Batches all updates scheduled inside the passed callback.
    * This is mainly used internally to optimize query client updating.
    * Batches can be nested; the queue is only flushed once the outermost `batch` call finishes.
    * The return value of `callback` is passed through.
    * @param callback - The function to run in the batch.
    * @returns The return value of `callback`.
    */
    batch: (callback) => {
      let result;
      transactions++;
      try {
        result = callback();
      } finally {
        transactions--;
        if (!transactions) flush();
      }
      return result;
    },
    /**
    * All calls to the wrapped function will be batched.
    * @param callback - The function to wrap.
    * @returns A function that schedules a call to `callback` with the given arguments.
    */
    batchCalls: (callback) => {
      return (...args) => {
        schedule(() => {
          callback(...args);
        });
      };
    },
    /**
    * Schedules a function to be run on the next batch.
    * By default, the batch is run with a `setTimeout`, but this can be configured via `setScheduler`.
    */
    schedule,
    /**
    * Use this method to set a custom notify function.
    * This can be used to for example wrap notifications with `React.act` while running tests.
    * @param fn - Receives each notification callback and must call it.
    */
    setNotifyFunction: (fn) => {
      notifyFn = fn;
    },
    /**
    * Use this method to set a custom function to batch notifications together into a single tick.
    * Framework adapters use this to plug in their own batching primitive, so that a single query
    * update only triggers one re-render instead of one per subscriber.
    * @param fn - Receives a function that runs a batch of notifications and must call it.
    * @example
    * ```ts
    * import { notifyManager } from '@tanstack/query-core'
    * import { batch } from 'solid-js'
    *
    * notifyManager.setBatchNotifyFunction(batch)
    * ```
    */
    setBatchNotifyFunction: (fn) => {
      batchNotifyFn = fn;
    },
    /**
    * Configures a custom callback that schedules when the next batch runs.
    * The default behavior is `setTimeout(callback, 0)`.
    * @param fn - Receives a callback that runs the next batch, and schedules it.
    * @example
    * ```ts
    * import { notifyManager } from '@tanstack/query-core'
    *
    * // Schedule batches in the next microtask
    * notifyManager.setScheduler(queueMicrotask)
    *
    * // Schedule batches before the next frame is rendered
    * notifyManager.setScheduler(requestAnimationFrame)
    *
    * // Schedule batches some time in the future
    * notifyManager.setScheduler((cb) => setTimeout(cb, 10))
    * ```
    */
    setScheduler: (fn) => {
      scheduleFn = fn;
    }
  };
}
var defaultScheduler, notifyManager;
var init_notifyManager = __esm({
  "node_modules/@tanstack/query-core/build/modern/notifyManager.js"() {
    init_timeoutManager();
    defaultScheduler = systemSetTimeoutZero;
    notifyManager = createNotifyManager();
  }
});

// node_modules/@tanstack/query-core/build/modern/onlineManager.js
var OnlineManager, onlineManager;
var init_onlineManager = __esm({
  "node_modules/@tanstack/query-core/build/modern/onlineManager.js"() {
    init_subscribable();
    OnlineManager = class extends Subscribable {
      #online = true;
      #cleanup;
      #setup;
      constructor() {
        super();
        this.#setup = (onOnline) => {
          if (typeof window !== "undefined" && window.addEventListener) {
            const onlineListener = () => onOnline(true);
            const offlineListener = () => onOnline(false);
            window.addEventListener("online", onlineListener, false);
            window.addEventListener("offline", offlineListener, false);
            return () => {
              window.removeEventListener("online", onlineListener);
              window.removeEventListener("offline", offlineListener);
            };
          }
        };
      }
      onSubscribe() {
        if (!this.#cleanup) this.setEventListener(this.#setup);
      }
      onUnsubscribe() {
        if (!this.hasListeners()) {
          this.#cleanup?.();
          this.#cleanup = void 0;
        }
      }
      /**
      * `setEventListener` can be used to set a custom event listener that will
      * be used to determine the online state. The provided `setup` function
      * receives a `setOnline` callback that should be called with a `boolean`
      * whenever the online state changes.
      * @param setup - Receives the `setOnline` callback, registers the event listener, and may return
      * a cleanup function that is called when the listener is replaced or no longer needed.
      * @example
      * ```ts
      * import NetInfo from '@react-native-community/netinfo'
      * import { onlineManager } from '@tanstack/query-core'
      *
      * onlineManager.setEventListener((setOnline) => {
      *   return NetInfo.addEventListener((state) => {
      *     setOnline(!!state.isConnected)
      *   })
      * })
      * ```
      */
      setEventListener(setup) {
        this.#setup = setup;
        this.#cleanup?.();
        this.#cleanup = setup(this.setOnline.bind(this));
      }
      /**
      * `setOnline` can be used to manually set the online state.
      * @param online - The online state.
      * @example
      * ```ts
      * import { onlineManager } from '@tanstack/query-core'
      *
      * // Set to online
      * onlineManager.setOnline(true)
      *
      * // Set to offline
      * onlineManager.setOnline(false)
      * ```
      */
      setOnline(online) {
        if (this.#online !== online) {
          this.#online = online;
          this.listeners.forEach((listener) => {
            listener(online);
          });
        }
      }
      /**
      * `isOnline` can be used to get the current online state.
      * @returns `true` if online.
      */
      isOnline() {
        return this.#online;
      }
    };
    onlineManager = new OnlineManager();
  }
});

// node_modules/@tanstack/query-core/build/modern/retryer.js
function defaultRetryDelay(failureCount) {
  return Math.min(1e3 * 2 ** failureCount, 3e4);
}
function canFetch(networkMode) {
  return (networkMode ?? "online") === "online" ? onlineManager.isOnline() : true;
}
function createRetryer(config) {
  let isRetryCancelled = false;
  let failureCount = 0;
  let continueFn;
  let status = "pending";
  let promiseResolve;
  let promiseReject;
  const promise = new Promise((resolve2, reject2) => {
    promiseResolve = resolve2;
    promiseReject = reject2;
  });
  promise.catch(noop);
  const isResolved = () => status !== "pending";
  const cancel = (cancelOptions) => {
    if (!isResolved()) {
      const error = new CancelledError(cancelOptions);
      reject(error);
      config.onCancel?.(error);
    }
  };
  const cancelRetry = () => {
    isRetryCancelled = true;
  };
  const continueRetry = () => {
    isRetryCancelled = false;
  };
  const canContinue = () => focusManager.isFocused() && (config.networkMode === "always" || onlineManager.isOnline()) && config.canRun();
  const canStart = () => canFetch(config.networkMode) && config.canRun();
  const resolve = (value) => {
    if (!isResolved()) {
      continueFn?.();
      status = "resolved";
      promiseResolve(value);
    }
  };
  const reject = (value) => {
    if (!isResolved()) {
      continueFn?.();
      status = "rejected";
      promiseReject(value);
    }
  };
  const pause = (canResume) => {
    return new Promise((continueResolve) => {
      continueFn = (value) => {
        if (isResolved() || canResume()) continueResolve(value);
      };
      config.onPause?.();
    }).then(() => {
      continueFn = void 0;
      if (!isResolved()) config.onContinue?.();
    });
  };
  const run = () => {
    if (isResolved()) return;
    let promiseOrValue;
    const initialPromise = failureCount === 0 ? config.initialPromise : void 0;
    try {
      promiseOrValue = initialPromise ?? config.fn();
    } catch (error) {
      promiseOrValue = Promise.reject(error);
    }
    Promise.resolve(promiseOrValue).then(resolve).catch((error) => {
      if (isResolved()) return;
      const retry = config.retry ?? (isServer2() ? 0 : 3);
      const retryDelay = config.retryDelay ?? defaultRetryDelay;
      const delay = typeof retryDelay === "function" ? retryDelay(failureCount, error) : retryDelay;
      const shouldRetry = retry === true || typeof retry === "number" && failureCount < retry || typeof retry === "function" && retry(failureCount, error);
      if (isRetryCancelled || !shouldRetry) {
        reject(error);
        return;
      }
      failureCount++;
      config.onFail?.(failureCount, error);
      sleep(delay).then(() => {
        return canContinue() ? void 0 : pause(canContinue);
      }).then(() => {
        if (isRetryCancelled) reject(error);
        else run();
      });
    });
  };
  return {
    promise,
    status: () => status,
    cancel,
    continue: () => {
      continueFn?.();
      return promise;
    },
    cancelRetry,
    continueRetry,
    canStart,
    start: () => {
      if (canStart()) run();
      else pause(canStart).then(run);
      return promise;
    }
  };
}
var CancelledError;
var init_retryer = __esm({
  "node_modules/@tanstack/query-core/build/modern/retryer.js"() {
    init_utils();
    init_environmentManager();
    init_focusManager();
    init_onlineManager();
    CancelledError = class extends Error {
      constructor(options) {
        super("CancelledError");
        this.revert = options?.revert;
        this.silent = options?.silent;
      }
    };
  }
});

// node_modules/@tanstack/query-core/build/modern/removable.js
var Removable;
var init_removable = __esm({
  "node_modules/@tanstack/query-core/build/modern/removable.js"() {
    init_timeoutManager();
    init_utils();
    init_environmentManager();
    Removable = class {
      #gcTimeout;
      /**
      * Clears the pending garbage collection timeout, so the entry is no longer scheduled for removal.
      * A subclass may override this to release what it holds on to as well — `Query` also cancels any
      * in-flight fetch.
      */
      destroy() {
        this.clearGcTimeout();
      }
      /**
      * Schedules the entry to be removed from its cache after `gcTime`, replacing any timeout scheduled
      * before. Nothing is scheduled if `gcTime` is `Infinity`.
      */
      scheduleGc() {
        this.clearGcTimeout();
        if (isValidTimeout(this.gcTime)) this.#gcTimeout = timeoutManager.setTimeout(() => {
          this.optionalRemove();
        }, this.gcTime);
      }
      /**
      * Updates `gcTime`, keeping the longest one seen so far. Without a value, it defaults to 5 minutes
      * on the client and `Infinity` on the server.
      * @param newGcTime - The `gcTime` from the latest options, if any.
      */
      updateGcTime(newGcTime) {
        this.gcTime = Math.max(this.gcTime || 0, newGcTime ?? (isServer2() ? Infinity : 3e5));
      }
      /**
      * Cancels the scheduled removal, if there is one.
      */
      clearGcTimeout() {
        if (this.#gcTimeout !== void 0) {
          timeoutManager.clearTimeout(this.#gcTimeout);
          this.#gcTimeout = void 0;
        }
      }
    };
  }
});

// node_modules/@tanstack/query-core/build/modern/infiniteQueryBehavior.js
function infiniteQueryBehavior(pages) {
  return { onFetch: (context, query) => {
    const options = context.options;
    const direction = context.fetchOptions?.meta?.fetchMore?.direction;
    const oldPages = context.state.data?.pages || [];
    const oldPageParams = context.state.data?.pageParams || [];
    let result = {
      pages: [],
      pageParams: []
    };
    let currentPage = 0;
    const fetchFn = async () => {
      let cancelled = false;
      const addSignalProperty = (object) => {
        addConsumeAwareSignal(object, () => context.signal, () => cancelled = true);
      };
      const queryFn = ensureQueryFn(context.options, context.fetchOptions);
      const fetchPage = async (data, param, previous) => {
        if (cancelled) return Promise.reject(context.signal.reason);
        if (param == null && data.pages.length) return Promise.resolve(data);
        const createQueryFnContext = () => {
          const queryFnContext2 = {
            client: context.client,
            queryKey: context.queryKey,
            pageParam: param,
            direction: previous ? "backward" : "forward",
            meta: context.options.meta
          };
          addSignalProperty(queryFnContext2);
          return queryFnContext2;
        };
        const queryFnContext = createQueryFnContext();
        const page = await queryFn(queryFnContext);
        const { maxPages } = context.options;
        const addTo = previous ? addToStart : addToEnd;
        return {
          pages: addTo(data.pages, page, maxPages),
          pageParams: addTo(data.pageParams, param, maxPages)
        };
      };
      if (direction && oldPages.length) {
        const previous = direction === "backward";
        const pageParamFn = previous ? getPreviousPageParam : getNextPageParam;
        const oldData = {
          pages: oldPages,
          pageParams: oldPageParams
        };
        result = await fetchPage(oldData, pageParamFn(options, oldData), previous);
      } else {
        const remainingPages = pages ?? oldPages.length;
        do {
          const param = currentPage === 0 ? oldPageParams[0] === void 0 ? options.initialPageParam : oldPageParams[0] : getNextPageParam(options, result);
          if (currentPage > 0 && param == null) break;
          result = await fetchPage(result, param);
          currentPage++;
        } while (currentPage < remainingPages);
      }
      return result;
    };
    if (context.options.persister) context.fetchFn = () => {
      return context.options.persister?.(fetchFn, {
        client: context.client,
        queryKey: context.queryKey,
        meta: context.options.meta,
        signal: context.signal
      }, query);
    };
    else context.fetchFn = fetchFn;
  } };
}
function getNextPageParam(options, { pages, pageParams }) {
  const lastIndex = pages.length - 1;
  return pages.length > 0 ? options.getNextPageParam(pages[lastIndex], pages, pageParams[lastIndex], pageParams) : void 0;
}
function getPreviousPageParam(options, { pages, pageParams }) {
  return pages.length > 0 ? options.getPreviousPageParam?.(pages[0], pages, pageParams[0], pageParams) : void 0;
}
function hasNextPage(options, data) {
  if (!data) return false;
  return getNextPageParam(options, data) != null;
}
function hasPreviousPage(options, data) {
  if (!data || !options.getPreviousPageParam) return false;
  return getPreviousPageParam(options, data) != null;
}
var init_infiniteQueryBehavior = __esm({
  "node_modules/@tanstack/query-core/build/modern/infiniteQueryBehavior.js"() {
    init_utils();
  }
});

// node_modules/@tanstack/query-core/build/modern/query.js
function fetchState(data, options) {
  return {
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchStatus: canFetch(options.networkMode) ? "fetching" : "paused",
    ...data === void 0 && {
      error: null,
      status: "pending"
    }
  };
}
function successState(data, dataUpdatedAt) {
  return {
    data,
    dataUpdatedAt: dataUpdatedAt ?? Date.now(),
    error: null,
    isInvalidated: false,
    status: "success"
  };
}
function getDefaultState(options) {
  const data = typeof options.initialData === "function" ? options.initialData() : options.initialData;
  const hasData = data !== void 0;
  const initialDataUpdatedAt = hasData ? typeof options.initialDataUpdatedAt === "function" ? options.initialDataUpdatedAt() : options.initialDataUpdatedAt : 0;
  return {
    data,
    dataUpdateCount: 0,
    dataUpdatedAt: hasData ? initialDataUpdatedAt ?? Date.now() : 0,
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: 0,
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchMeta: null,
    isInvalidated: false,
    status: hasData ? "success" : "pending",
    fetchStatus: "idle"
  };
}
var Query;
var init_query = __esm({
  "node_modules/@tanstack/query-core/build/modern/query.js"() {
    init_utils();
    init_notifyManager();
    init_retryer();
    init_removable();
    init_infiniteQueryBehavior();
    Query = class extends Removable {
      #queryType;
      #initialState;
      #revertState;
      #cache;
      #client;
      #retryer;
      #defaultOptions;
      #abortSignalConsumed;
      constructor(config) {
        super();
        this.#abortSignalConsumed = false;
        this.#defaultOptions = config.defaultOptions;
        this.setOptions(config.options);
        this.observers = [];
        this.#client = config.client;
        this.#cache = this.#client.getQueryCache();
        this.queryKey = config.queryKey;
        this.queryHash = config.queryHash;
        this.#initialState = getDefaultState(this.options);
        this.state = config.state ?? this.#initialState;
        this.scheduleGc();
      }
      /**
      * The `meta` object passed in the query's options, if any.
      * @returns The query's `meta`, or `undefined` if none was set.
      */
      get meta() {
        return this.options.meta;
      }
      /**
      * `'infinite'` for an infinite query, otherwise `undefined`.
      * @internal
      * @returns The type of the query, set from the `_type` option (e.g. `'infinite'`).
      */
      get queryType() {
        return this.#queryType;
      }
      /**
      * The promise for the currently in-flight fetch, if the query is fetching.
      * `undefined` when the query is not fetching.
      * @returns The promise of the in-flight fetch, or `undefined`.
      */
      get promise() {
        return this.#retryer?.promise;
      }
      /**
      * Replaces the query's options and applies their `gcTime`. If the query has no data yet, it gets
      * the `initialData` from the new options, if any.
      * @internal
      * @param options - The new query options, merged on top of the query's default options.
      */
      setOptions(options) {
        this.options = {
          ...this.#defaultOptions,
          ...options
        };
        if (options?._type) this.#queryType = options._type;
        this.updateGcTime(this.options.gcTime);
        if (this.state && this.state.data === void 0) {
          const defaultState = getDefaultState(this.options);
          if (defaultState.data !== void 0) {
            this.setState(successState(defaultState.data, defaultState.dataUpdatedAt));
            this.#initialState = defaultState;
          }
        }
      }
      optionalRemove() {
        if (!this.observers.length && this.state.fetchStatus === "idle") this.#cache.remove(this);
      }
      /**
      * Writes new data to the query and marks it as successfully fetched.
      * @internal
      * @param newData - The data to write. Structural sharing with the current data is applied.
      * @param options - Set `updatedAt` to override the timestamp, and `manual` to mark the write as
      * manual (e.g. from `queryClient.setQueryData`).
      * @returns The data that was written.
      */
      setData(newData, options) {
        const data = replaceData(this.state.data, newData, this.options);
        this.#dispatch({
          data,
          type: "success",
          dataUpdatedAt: options?.updatedAt,
          manual: options?.manual
        });
        return data;
      }
      /**
      * Merges the given partial state directly into this query's state, notifying observers. Used
      * by persistence and broadcast plugins to restore a state snapshot, and by devtools to let a
      * user manually trigger a loading/error state or edit the cached data.
      * @param state - The partial state to merge into the query's state.
      */
      setState(state) {
        this.#dispatch({
          type: "setState",
          state
        });
      }
      /**
      * Cancels the query's currently in-flight fetch, if any.
      * - Returns a promise that resolves once the cancellation has settled.
      * - If no fetch is in progress, resolves immediately.
      * @param options - Set `revert` to restore the state from before the fetch started, and `silent`
      * to suppress the cancellation error when a new fetch replaces the cancelled one.
      * @returns A promise that resolves once the cancellation has settled.
      * @example
      * ```ts
      * await query.cancel()
      * ```
      */
      cancel(options) {
        const promise = this.#retryer?.promise;
        this.#retryer?.cancel(options);
        return promise ? promise.then(noop).catch(noop) : Promise.resolve();
      }
      /**
      * Clears the query's garbage collection timeout and silently cancels any
      * in-flight fetch. Called by `QueryCache` when the query is removed from
      * the cache.
      * @see {@link Query#cancel}
      */
      destroy() {
        super.destroy();
        this.cancel({ silent: true });
      }
      /**
      * The state the query was created with.
      * @internal
      * @returns The state the query had when it was first created, used by {@link Query#reset}.
      */
      get resetState() {
        return this.#initialState;
      }
      /**
      * Resets the query back to its initial state (the state it had when it was
      * first created, e.g. any `initialData`), destroying it first to cancel any
      * in-flight fetch.
      */
      reset() {
        this.destroy();
        this.setState(this.resetState);
      }
      /**
      * Returns `true` if the query has at least one observer for which `enabled`
      * does not resolve to `false`.
      * @returns `true` if the query has an enabled observer.
      */
      isActive() {
        return this.observers.some((observer) => resolveQueryValue(observer.options.enabled, this) !== false);
      }
      /**
      * Returns `true` if the query is disabled, meaning it will not fetch
      * automatically.
      * - If the query has observers, it is disabled when none of them are active
      *   (see `isActive`).
      * - If the query has no observers, it is disabled when its `queryFn` is
      *   `skipToken` or it has never been fetched.
      * @returns `true` if the query is disabled.
      */
      isDisabled() {
        if (this.getObserversCount() > 0) return !this.isActive();
        return this.options.queryFn === skipToken || !this.isFetched();
      }
      /**
      * Returns `true` if the query has been fetched, i.e. it has resolved with
      * either data or an error at least once.
      * @returns `true` if the query has been fetched.
      */
      isFetched() {
        return this.state.dataUpdateCount + this.state.errorUpdateCount > 0;
      }
      /**
      * Returns `true` if the query has at least one observer configured with
      * `staleTime: 'static'`, meaning it is treated as never stale.
      * @returns `true` if the query is static.
      */
      isStatic() {
        if (this.getObserversCount() > 0) return this.observers.some((observer) => resolveQueryValue(observer.options.staleTime, this) === "static");
        return false;
      }
      /**
      * Returns `true` if the query is stale.
      * - If the query has observers, defers to whether any observer's current
      *   result reports `isStale` (which accounts for each observer's own
      *   `staleTime` and `enabled` state).
      * - If the query has no observers, it is considered stale when it has no
      *   data or has been invalidated.
      * @returns `true` if the query is stale.
      * @see {@link Query#isStaleByTime}
      * @example
      * ```ts
      * if (query.isStale()) {
      *   // refetch or otherwise treat the cached data as outdated
      * }
      * ```
      */
      isStale() {
        if (this.getObserversCount() > 0) return this.observers.some((observer) => observer.getCurrentResult().isStale);
        return this.state.data === void 0 || this.state.isInvalidated;
      }
      /**
      * Returns `true` if the query's data is stale relative to the given
      * `staleTime` (defaults to `0`).
      * - A query with no data is always stale.
      * - `staleTime: 'static'` is never stale.
      * - An invalidated query is always stale.
      * - Otherwise, staleness is based on elapsed time since `dataUpdatedAt`.
      * @param staleTime - The time, in milliseconds, after which data is considered stale, or
      * `'static'` to never treat existing data as stale. A query without data is stale either way.
      * @returns `true` if the query's data is stale.
      * @see {@link Query#isStale}
      * @example
      * ```ts
      * const isStale = query.isStaleByTime(60 * 1000)
      * ```
      */
      isStaleByTime(staleTime = 0) {
        if (this.state.data === void 0) return true;
        if (staleTime === "static") return false;
        if (this.state.isInvalidated) return true;
        return !timeUntilStale(this.state.dataUpdatedAt, staleTime);
      }
      /**
      * Refetches the query when the window regains focus, if an observer wants that, and continues a
      * paused fetch.
      * @internal
      */
      onFocus() {
        this.observers.find((x) => x.shouldFetchOnWindowFocus())?.refetch({ cancelRefetch: false });
        this.#retryer?.continue();
      }
      /**
      * Refetches the query when the app reconnects, if an observer wants that, and continues a paused
      * fetch.
      * @internal
      */
      onOnline() {
        this.observers.find((x) => x.shouldFetchOnReconnect())?.refetch({ cancelRefetch: false });
        this.#retryer?.continue();
      }
      /**
      * Subscribes an observer to the query and stops its garbage collection.
      * @internal
      * @param observer - The observer to add. Adding an observer that is already subscribed does
      * nothing.
      */
      addObserver(observer) {
        if (!this.observers.includes(observer)) {
          this.observers.push(observer);
          this.clearGcTimeout();
          this.#cache.notify({
            type: "observerAdded",
            query: this,
            observer
          });
        }
      }
      /**
      * Unsubscribes an observer from the query.
      * @internal
      * @param observer - The observer to remove. When the last observer is removed, the in-flight
      * fetch is cancelled if its abort signal was consumed (otherwise only its retries are stopped),
      * and garbage collection is scheduled.
      */
      removeObserver(observer) {
        const index = this.observers.indexOf(observer);
        if (index !== -1) {
          this.observers.splice(index, 1);
          if (!this.observers.length) {
            if (this.#retryer) {
              if (this.#abortSignalConsumed || this.state.fetchStatus === "paused" && this.state.status === "pending") this.#retryer.cancel({ revert: true });
              else this.#retryer.cancelRetry();
            }
            this.scheduleGc();
          }
          this.#cache.notify({
            type: "observerRemoved",
            query: this,
            observer
          });
        }
      }
      /**
      * Returns the number of observers currently subscribed to this query.
      * @returns The number of observers.
      * @example
      * ```ts
      * if (query.getObserversCount() === 0) {
      *   // no component is currently watching this query
      * }
      * ```
      */
      getObserversCount() {
        return this.observers.length;
      }
      /**
      * Marks the query as invalidated, unless it is already invalidated. This
      * updates `state.isInvalidated` and notifies observers, but does not by
      * itself trigger a refetch.
      * @example
      * ```ts
      * query.invalidate()
      * ```
      */
      invalidate() {
        if (!this.state.isInvalidated) this.#dispatch({ type: "invalidate" });
      }
      /**
      * Fetches the query, i.e. runs its `queryFn` (through any configured
      * retryer/behavior) and updates the query's state with the result.
      * - If a fetch is already in flight, returns its promise instead of
      *   starting a new one, unless `fetchOptions.cancelRefetch` is set and the
      *   query already has data, in which case the current fetch is silently
      *   cancelled first.
      * - If `options` is passed, it replaces the query's current options
      *   before fetching.
      * @param options - Query options that replace the query's current options before fetching. They
      * are not applied when an in-flight fetch is reused.
      * @param fetchOptions - Set `cancelRefetch` to cancel an in-flight fetch first (only if the query
      * already has data), and `meta` to pass extra information to the query's behavior.
      * @returns A promise that resolves with the fetched data, or rejects with the fetch error. If the
      * fetch is cancelled with `revert` while the query has data, it resolves with the restored data
      * instead.
      */
      async fetch(options, fetchOptions) {
        if (this.state.fetchStatus !== "idle" && this.#retryer?.status() !== "rejected") {
          if (this.state.data !== void 0 && fetchOptions?.cancelRefetch) this.cancel({ silent: true });
          else if (this.#retryer) {
            this.#retryer.continueRetry();
            return this.#retryer.promise;
          }
        }
        if (options) this.setOptions(options);
        if (!this.options.queryFn) {
          const observer = this.observers.find((x) => x.options.queryFn);
          if (observer) this.setOptions(observer.options);
        }
        if (false) {
          if (!Array.isArray(this.options.queryKey)) console.error(`As of v4, queryKey needs to be an Array. If you are using a string like 'repoData', please change it to an Array, e.g. ['repoData']`);
        }
        const abortController = new AbortController();
        const addSignalProperty = (object) => {
          Object.defineProperty(object, "signal", {
            enumerable: true,
            get: () => {
              this.#abortSignalConsumed = true;
              return abortController.signal;
            }
          });
        };
        const fetchFn = () => {
          const queryFn = ensureQueryFn(this.options, fetchOptions);
          const createQueryFnContext = () => {
            const queryFnContext2 = {
              client: this.#client,
              queryKey: this.queryKey,
              meta: this.meta
            };
            addSignalProperty(queryFnContext2);
            return queryFnContext2;
          };
          const queryFnContext = createQueryFnContext();
          this.#abortSignalConsumed = false;
          if (this.options.persister) return this.options.persister(queryFn, queryFnContext, this);
          return queryFn(queryFnContext);
        };
        const createFetchContext = () => {
          const context2 = {
            fetchOptions,
            options: this.options,
            queryKey: this.queryKey,
            client: this.#client,
            state: this.state,
            fetchFn
          };
          addSignalProperty(context2);
          return context2;
        };
        const context = createFetchContext();
        (this.#queryType === "infinite" ? infiniteQueryBehavior(this.options.pages) : this.options.behavior)?.onFetch(context, this);
        this.#revertState = this.state;
        if (this.state.fetchStatus === "idle" || this.state.fetchMeta !== context.fetchOptions?.meta) this.#dispatch({
          type: "fetch",
          meta: context.fetchOptions?.meta
        });
        const retryer = this.#retryer = createRetryer({
          initialPromise: fetchOptions?.initialPromise,
          fn: context.fetchFn,
          onCancel: (error) => {
            if (error instanceof CancelledError && error.revert) this.setState({
              ...this.#revertState,
              fetchStatus: "idle"
            });
            abortController.abort();
          },
          onFail: (failureCount, error) => {
            this.#dispatch({
              type: "failed",
              failureCount,
              error
            });
          },
          onPause: () => {
            this.#dispatch({ type: "pause" });
          },
          onContinue: () => {
            this.#dispatch({ type: "continue" });
          },
          retry: context.options.retry,
          retryDelay: context.options.retryDelay,
          networkMode: context.options.networkMode,
          canRun: () => true
        });
        try {
          const data = await retryer.start();
          if (data === void 0) {
            if (false) console.error(`Query data cannot be undefined. Please make sure to return a value other than undefined from your query function. Affected query key: ${this.queryHash}`);
            throw new Error(`${this.queryHash} data is undefined`);
          }
          this.setData(data);
          this.#cache.config.onSuccess?.(data, this);
          this.#cache.config.onSettled?.(data, this.state.error, this);
          return data;
        } catch (error) {
          if (error instanceof CancelledError) {
            if (error.silent) return this.#retryer.promise;
            else if (error.revert) {
              if (this.state.data === void 0) throw error;
              return this.state.data;
            }
          }
          this.#dispatch({
            type: "error",
            error
          });
          this.#cache.config.onError?.(error, this);
          this.#cache.config.onSettled?.(this.state.data, error, this);
          throw error;
        } finally {
          if (this.#retryer === retryer) this.#retryer = void 0;
          this.scheduleGc();
        }
      }
      #dispatch(action) {
        const reducer = (state) => {
          switch (action.type) {
            case "failed":
              return {
                ...state,
                fetchFailureCount: action.failureCount,
                fetchFailureReason: action.error
              };
            case "pause":
              return {
                ...state,
                fetchStatus: "paused"
              };
            case "continue":
              return {
                ...state,
                fetchStatus: "fetching"
              };
            case "fetch":
              return {
                ...state,
                ...fetchState(state.data, this.options),
                fetchMeta: action.meta ?? null
              };
            case "success":
              const newState = {
                ...state,
                ...successState(action.data, action.dataUpdatedAt),
                dataUpdateCount: state.dataUpdateCount + 1,
                ...!action.manual && {
                  fetchStatus: "idle",
                  fetchFailureCount: 0,
                  fetchFailureReason: null
                }
              };
              this.#revertState = action.manual ? newState : void 0;
              return newState;
            case "error":
              const error = action.error;
              return {
                ...state,
                error,
                errorUpdateCount: state.errorUpdateCount + 1,
                errorUpdatedAt: Date.now(),
                fetchFailureCount: state.fetchFailureCount + 1,
                fetchFailureReason: error,
                fetchStatus: "idle",
                status: "error",
                isInvalidated: true
              };
            case "invalidate":
              return {
                ...state,
                isInvalidated: true
              };
            case "setState":
              return {
                ...state,
                ...action.state
              };
          }
        };
        this.state = reducer(this.state);
        notifyManager.batch(() => {
          this.observers.slice().forEach((observer) => {
            observer.onQueryUpdate();
          });
          this.#cache.notify({
            query: this,
            type: "updated",
            action
          });
        });
      }
    };
  }
});

// node_modules/@tanstack/query-core/build/modern/queryObserver.js
function shouldLoadOnMount(query, options) {
  return resolveQueryValue(options.enabled, query) !== false && query.state.data === void 0 && !(query.state.status === "error" && resolveQueryValue(options.retryOnMount, query) === false);
}
function shouldFetchOnMount(query, options) {
  return shouldLoadOnMount(query, options) || query.state.data !== void 0 && shouldFetchOn(query, options, options.refetchOnMount);
}
function shouldFetchOn(query, options, field) {
  if (resolveQueryValue(options.enabled, query) !== false && resolveQueryValue(options.staleTime, query) !== "static") {
    const value = resolveQueryValue(field, query);
    return value === "always" || value !== false && isStale(query, options);
  }
  return false;
}
function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
  return (query !== prevQuery || resolveQueryValue(prevOptions.enabled, query) === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
}
function isStale(query, options) {
  return resolveQueryValue(options.enabled, query) !== false && query.isStaleByTime(resolveQueryValue(options.staleTime, query));
}
var QueryObserver;
var init_queryObserver = __esm({
  "node_modules/@tanstack/query-core/build/modern/queryObserver.js"() {
    init_timeoutManager();
    init_utils();
    init_environmentManager();
    init_subscribable();
    init_focusManager();
    init_notifyManager();
    init_query();
    QueryObserver = class extends Subscribable {
      #client;
      #currentQuery = void 0;
      #currentQueryInitialState = void 0;
      #currentResult = void 0;
      #currentResultState;
      #currentResultOptions;
      #selectError;
      #selectFn;
      #selectResult;
      #lastQueryWithDefinedData;
      #staleTimeoutId;
      #refetchIntervalId;
      #currentRefetchInterval;
      #trackedProps = /* @__PURE__ */ new Set();
      constructor(client, options) {
        super();
        this.options = options;
        this.#client = client;
        this.#selectError = null;
        this.bindMethods();
        this.setOptions(options);
      }
      /**
      * Binds the methods of the result (`refetch`) to the observer, so they keep working when destructured
      * from it. Subclasses override it to bind their own result methods as well.
      */
      bindMethods() {
        this.refetch = this.refetch.bind(this);
      }
      onSubscribe() {
        if (this.listeners.size === 1) {
          this.#currentQuery.addObserver(this);
          if (shouldFetchOnMount(this.#currentQuery, this.options)) this.#executeFetch();
          else this.updateResult();
          this.#updateTimers();
        }
      }
      onUnsubscribe() {
        if (!this.hasListeners()) this.destroy();
      }
      /**
      * Returns whether the observed query is currently stale and configured
      * (via the `refetchOnReconnect` option) to refetch when the network
      * reconnects.
      * @returns `true` if the observer should refetch the query on reconnect.
      */
      shouldFetchOnReconnect() {
        return shouldFetchOn(this.#currentQuery, this.options, this.options.refetchOnReconnect);
      }
      /**
      * Returns whether the observed query is currently stale and configured
      * (via the `refetchOnWindowFocus` option) to refetch when the window
      * regains focus.
      * @returns `true` if the observer should refetch the query on window focus.
      */
      shouldFetchOnWindowFocus() {
        return shouldFetchOn(this.#currentQuery, this.options, this.options.refetchOnWindowFocus);
      }
      /**
      * Stops observing the current query: clears all listeners, cancels the
      * stale and refetch-interval timers, and removes this observer from the
      * query it was observing.
      */
      destroy() {
        this.listeners = /* @__PURE__ */ new Set();
        this.#clearStaleTimeout();
        this.#clearRefetchInterval();
        this.#currentQuery.removeObserver(this);
      }
      /**
      * Updates the observer's options. This will re-resolve the query being
      * observed (switching to a different query if the `queryKey` changed),
      * trigger a fetch if the new options require one and the observer has
      * subscribers, recompute the current result, and reschedule the stale and
      * refetch-interval timers as needed.
      * @param options - The new observer options. They are defaulted with {@link
      * QueryClient#defaultQueryOptions} before being applied.
      * @throws {Error} If `enabled` is neither a boolean nor a function.
      * @example
      * ```ts
      * observer.setOptions({ queryKey: ['posts', 1], queryFn: () => fetchPost(1) })
      * // later: switch to a different query, reusing the same observer
      * observer.setOptions({ queryKey: ['posts', 2], queryFn: () => fetchPost(2) })
      * ```
      */
      setOptions(options) {
        const prevOptions = this.options;
        const prevQuery = this.#currentQuery;
        this.options = this.#client.defaultQueryOptions(options);
        if (this.options.enabled !== void 0 && typeof this.options.enabled !== "boolean" && typeof this.options.enabled !== "function" && typeof resolveQueryValue(this.options.enabled, this.#currentQuery) !== "boolean") throw new Error("Expected enabled to be a boolean or a callback that returns a boolean");
        this.#updateQuery();
        this.#currentQuery.setOptions(this.options);
        if (prevOptions._defaulted && !shallowEqualObjects(this.options, prevOptions)) this.#client.getQueryCache().notify({
          type: "observerOptionsUpdated",
          query: this.#currentQuery,
          observer: this
        });
        const mounted = this.hasListeners();
        if (mounted && shouldFetchOptionally(this.#currentQuery, prevQuery, this.options, prevOptions)) this.#executeFetch();
        this.updateResult();
        if (mounted && (this.#currentQuery !== prevQuery || resolveQueryValue(this.options.enabled, this.#currentQuery) !== resolveQueryValue(prevOptions.enabled, this.#currentQuery) || resolveQueryValue(this.options.staleTime, this.#currentQuery) !== resolveQueryValue(prevOptions.staleTime, this.#currentQuery))) this.#updateStaleTimeout();
        const nextRefetchInterval = this.#computeRefetchInterval();
        if (mounted && (this.#currentQuery !== prevQuery || resolveQueryValue(this.options.enabled, this.#currentQuery) !== resolveQueryValue(prevOptions.enabled, this.#currentQuery) || nextRefetchInterval !== this.#currentRefetchInterval)) this.#updateRefetchInterval(nextRefetchInterval);
      }
      /**
      * Computes the result the observer would produce for the given (already-defaulted) options
      * right now, building the underlying `Query` if it doesn't exist yet, without waiting for a
      * subscription callback. Called by framework adapters on every render (e.g. `useQuery`) so the
      * returned value is available synchronously, ahead of `setOptions` triggering an actual fetch.
      * @param options - The defaulted observer options to compute the result for.
      * @returns The result for the given options.
      */
      getOptimisticResult(options) {
        const query = this.#client.getQueryCache().build(this.#client, options);
        const result = this.createResult(query, options);
        if (!shallowEqualObjects(this.getCurrentResult(), result)) {
          this.#currentResult = result;
          this.#currentResultOptions = this.options;
          this.#currentResultState = this.#currentQuery.state;
        }
        return result;
      }
      /**
      * Returns the most recently computed `QueryObserverResult` for the
      * observed query. This is a point-in-time read; to be notified of updates
      * as they happen, subscribe to the observer instead (its inherited
      * `subscribe` method).
      * @returns The observer's latest result.
      * @example
      * ```ts
      * const result = observer.getCurrentResult()
      * console.log(result.status, result.data)
      * ```
      */
      getCurrentResult() {
        return this.#currentResult;
      }
      /**
      * Wraps a `QueryObserverResult` in a `Proxy` that records which properties are read, via
      * {@link QueryObserver#trackProp} (and an optional `onPropTracked` callback). Used by framework
      * adapters when `notifyOnChangeProps` is not set, to implement its default "only re-render on
      * properties you actually read" behavior.
      * @param result - The result to wrap.
      * @param onPropTracked - Called with the name of each property that is read.
      * @returns A proxy of `result` that tracks property reads.
      */
      trackResult(result, onPropTracked) {
        return new Proxy(result, { get: (target, key) => {
          this.trackProp(key);
          onPropTracked?.(key);
          return Reflect.get(target, key);
        } });
      }
      /**
      * Records that the given `QueryObserverResult` property was read, so a subsequent update only
      * notifies this observer if a tracked property actually changed. Normally called indirectly via
      * {@link QueryObserver#trackResult}'s proxy; exposed directly for adapters that track property
      * access themselves (e.g. through their own reactivity system) instead of via the proxy.
      * @param key - The name of the property that was read.
      */
      trackProp(key) {
        this.#trackedProps.add(key);
      }
      /**
      * Returns the `Query` instance this observer is currently observing.
      * @returns The observed query.
      */
      getCurrentQuery() {
        return this.#currentQuery;
      }
      /**
      * Refetches the observed query and returns a promise that resolves with
      * the resulting `QueryObserverResult`.
      * @param options - Set `cancelRefetch` to `false` to keep a running fetch instead of cancelling
      * it, and `throwOnError` to `true` to reject when the refetch fails.
      * @returns A promise that resolves with the result after the refetch.
      * @example
      * ```ts
      * const result = await observer.refetch({ cancelRefetch: false })
      * console.log(result.data)
      * ```
      */
      refetch({ ...options } = {}) {
        return this.fetch({ ...options });
      }
      /**
      * Fetches a query defined by the given options without affecting this
      * observer's own tracked query or result, and returns a promise that
      * resolves with the `QueryObserverResult` for that fetch. This is useful
      * for prefetching data that another observer (e.g. a query about to be
      * navigated to) will need, ahead of time.
      * @param options - The observer options of the query to fetch.
      * @returns A promise that resolves with the result for the fetched query.
      * @example
      * ```ts
      * const result = await observer.fetchOptimistic({
      *   queryKey: ['posts', 2],
      *   queryFn: () => fetchPost(2),
      * })
      * console.log(result.data)
      * ```
      */
      fetchOptimistic(options) {
        const defaultedOptions = this.#client.defaultQueryOptions(options);
        const query = this.#client.getQueryCache().build(this.#client, defaultedOptions);
        let unsubscribe = () => {
        };
        let resolveEarly;
        const cachePromise = new Promise((resolve) => {
          resolveEarly = resolve;
          unsubscribe = this.#client.getQueryCache().subscribe((event) => {
            if (event.type === "updated" && event.query.queryHash === query.queryHash && query.state.data !== void 0) {
              unsubscribe();
              resolve(this.createResult(query, defaultedOptions));
            }
          });
        });
        return Promise.race([query.fetch(defaultedOptions).then(() => {
          const result = this.createResult(query, defaultedOptions);
          resolveEarly?.(result);
          return result;
        }).finally(() => {
          unsubscribe();
        }), cachePromise]);
      }
      /**
      * Fetches the observed query and updates the result once the fetch settles. Used by `refetch` and,
      * in `InfiniteQueryObserver`, to fetch more pages.
      * @param fetchOptions - Options for this fetch. `cancelRefetch` defaults to `true`.
      * @returns A promise that resolves with the updated result.
      */
      fetch(fetchOptions) {
        return this.#executeFetch({
          ...fetchOptions,
          cancelRefetch: fetchOptions.cancelRefetch ?? true
        }).then(() => {
          this.updateResult();
          return this.#currentResult;
        });
      }
      #executeFetch(fetchOptions) {
        this.#updateQuery();
        let promise = this.#currentQuery.fetch(this.options, fetchOptions);
        if (!fetchOptions?.throwOnError) promise = promise.catch(noop);
        return promise;
      }
      #shouldScheduleTimer(timeout) {
        return !isServer2() && resolveQueryValue(this.options.enabled, this.#currentQuery) !== false && isValidTimeout(timeout);
      }
      #updateStaleTimeout() {
        this.#clearStaleTimeout();
        const staleTime = resolveQueryValue(this.options.staleTime, this.#currentQuery);
        if (this.#currentResult.isStale || !this.#shouldScheduleTimer(staleTime)) return;
        const timeout = timeUntilStale(this.#currentResult.dataUpdatedAt, staleTime) + 1;
        this.#staleTimeoutId = timeoutManager.setTimeout(() => {
          if (!this.#currentResult.isStale) this.updateResult();
        }, timeout);
      }
      #computeRefetchInterval() {
        return resolveQueryValue(this.options.refetchInterval, this.#currentQuery) ?? false;
      }
      #updateRefetchInterval(nextInterval) {
        this.#clearRefetchInterval();
        this.#currentRefetchInterval = nextInterval;
        if (this.#currentRefetchInterval === 0 || !this.#shouldScheduleTimer(this.#currentRefetchInterval)) return;
        this.#refetchIntervalId = timeoutManager.setInterval(() => {
          if (this.options.refetchIntervalInBackground || focusManager.isFocused()) this.#executeFetch();
        }, this.#currentRefetchInterval);
      }
      #updateTimers() {
        this.#updateStaleTimeout();
        this.#updateRefetchInterval(this.#computeRefetchInterval());
      }
      #clearStaleTimeout() {
        if (this.#staleTimeoutId !== void 0) {
          timeoutManager.clearTimeout(this.#staleTimeoutId);
          this.#staleTimeoutId = void 0;
        }
      }
      #clearRefetchInterval() {
        if (this.#refetchIntervalId !== void 0) {
          timeoutManager.clearInterval(this.#refetchIntervalId);
          this.#refetchIntervalId = void 0;
        }
      }
      /**
      * Computes the result for a query and options from the query's state, applying `select`,
      * `placeholderData`, and the derived flags. Subclasses override it to add their own fields.
      * @param query - The query to compute the result for.
      * @param options - The observer options to compute the result with.
      * @returns The computed result.
      */
      createResult(query, options) {
        const prevQuery = this.#currentQuery;
        const prevOptions = this.options;
        const prevResult = this.#currentResult;
        const prevResultState = this.#currentResultState;
        const prevResultOptions = this.#currentResultOptions;
        const queryInitialState = query !== prevQuery ? query.state : this.#currentQueryInitialState;
        const { state } = query;
        let newState = { ...state };
        let isPlaceholderData = false;
        let data;
        if (options._optimisticResults) {
          const mounted = this.hasListeners();
          const fetchOnMount = !mounted && shouldFetchOnMount(query, options);
          const fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);
          if (fetchOnMount || fetchOptionally) newState = {
            ...newState,
            ...fetchState(state.data, query.options)
          };
          if (options._optimisticResults === "isRestoring") newState.fetchStatus = "idle";
        }
        let { error, errorUpdatedAt, status } = newState;
        data = newState.data;
        let skipSelect = false;
        if (options.placeholderData !== void 0 && data === void 0 && status === "pending") {
          let placeholderData;
          if (prevResult?.isPlaceholderData && options.placeholderData === prevResultOptions?.placeholderData) {
            placeholderData = prevResult.data;
            skipSelect = true;
          } else placeholderData = typeof options.placeholderData === "function" ? options.placeholderData(this.#lastQueryWithDefinedData?.state.data, this.#lastQueryWithDefinedData) : options.placeholderData;
          if (placeholderData !== void 0) {
            status = "success";
            data = replaceData(prevResult?.data, placeholderData, options);
            isPlaceholderData = true;
          }
        }
        if (options.select && data !== void 0 && !skipSelect) {
          if (prevResult && data === prevResultState?.data && options.select === this.#selectFn) data = this.#selectResult;
          else try {
            this.#selectFn = options.select;
            data = options.select(data);
            data = replaceData(prevResult?.data, data, options);
            this.#selectResult = data;
            this.#selectError = null;
          } catch (selectError) {
            this.#selectError = selectError;
          }
        } else if (data === void 0) this.#selectError = null;
        if (this.#selectError) {
          error = this.#selectError;
          data = this.#selectResult;
          errorUpdatedAt = Date.now();
          status = "error";
          isPlaceholderData = false;
        }
        const isFetching = newState.fetchStatus === "fetching";
        const isPending = status === "pending";
        const isError = status === "error";
        const isLoading = isPending && isFetching;
        const hasData = data !== void 0;
        return {
          status,
          fetchStatus: newState.fetchStatus,
          isPending,
          isSuccess: status === "success",
          isError,
          isInitialLoading: isLoading,
          isLoading,
          data,
          dataUpdatedAt: newState.dataUpdatedAt,
          error,
          errorUpdatedAt,
          failureCount: newState.fetchFailureCount,
          failureReason: newState.fetchFailureReason,
          errorUpdateCount: newState.errorUpdateCount,
          isFetched: query.isFetched(),
          isFetchedAfterMount: newState.dataUpdateCount > queryInitialState.dataUpdateCount || newState.errorUpdateCount > queryInitialState.errorUpdateCount,
          isFetching,
          isRefetching: isFetching && !isPending,
          isLoadingError: isError && !hasData,
          isPaused: newState.fetchStatus === "paused",
          isPlaceholderData,
          isRefetchError: isError && hasData,
          isStale: isStale(query, options),
          refetch: this.refetch,
          isEnabled: resolveQueryValue(options.enabled, query) !== false
        };
      }
      /**
      * Recomputes and stores the current result from the current query/options, notifying listeners
      * if it changed. Framework adapters call this right after subscribing to make sure no query
      * update was missed in the gap between creating the observer and subscribing to it.
      */
      updateResult() {
        const prevResult = this.#currentResult;
        const nextResult = this.createResult(this.#currentQuery, this.options);
        this.#currentResultState = this.#currentQuery.state;
        this.#currentResultOptions = this.options;
        if (this.#currentResultState.data !== void 0) this.#lastQueryWithDefinedData = this.#currentQuery;
        if (shallowEqualObjects(nextResult, prevResult)) return;
        this.#currentResult = nextResult;
        const shouldNotifyListeners = () => {
          if (!prevResult) return true;
          const { notifyOnChangeProps } = this.options;
          const notifyOnChangePropsValue = typeof notifyOnChangeProps === "function" ? notifyOnChangeProps() : notifyOnChangeProps;
          if (notifyOnChangePropsValue === "all" || !notifyOnChangePropsValue && !this.#trackedProps.size) return true;
          if (this.options.throwOnError && this.#currentResult.error !== prevResult.error) return true;
          for (const key of notifyOnChangePropsValue ?? this.#trackedProps) if (this.#currentResult[key] !== prevResult[key]) return true;
          return false;
        };
        const notifyListeners = shouldNotifyListeners();
        notifyManager.batch(() => {
          if (notifyListeners) this.listeners.forEach((listener) => {
            listener(this.#currentResult);
          });
          this.#client.getQueryCache().notify({
            query: this.#currentQuery,
            type: "observerResultsUpdated"
          });
        });
      }
      #updateQuery() {
        const query = this.#client.getQueryCache().build(this.#client, this.options);
        if (query === this.#currentQuery) return;
        const prevQuery = this.#currentQuery;
        this.#currentQuery = query;
        this.#currentQueryInitialState = query.state;
        if (this.hasListeners()) {
          prevQuery?.removeObserver(this);
          query.addObserver(this);
        }
      }
      /**
      * Updates the observer's result when the observed query changes, and reschedules its timers if it
      * has listeners.
      * @internal
      */
      onQueryUpdate() {
        this.updateResult();
        if (this.hasListeners()) this.#updateTimers();
      }
    };
  }
});

// node_modules/@tanstack/query-core/build/modern/infiniteQueryObserver.js
var InfiniteQueryObserver;
var init_infiniteQueryObserver = __esm({
  "node_modules/@tanstack/query-core/build/modern/infiniteQueryObserver.js"() {
    init_infiniteQueryBehavior();
    init_queryObserver();
    InfiniteQueryObserver = class extends QueryObserver {
      constructor(client, options) {
        super(client, options);
      }
      bindMethods() {
        super.bindMethods();
        this.fetchNextPage = this.fetchNextPage.bind(this);
        this.fetchPreviousPage = this.fetchPreviousPage.bind(this);
      }
      /**
      * Updates the observer's options. Behaves the same as
      * `QueryObserver.setOptions`, additionally marking the options as
      * belonging to an infinite query before delegating to the base
      * implementation.
      * @param options - The new infinite query observer options.
      */
      setOptions(options) {
        options._type = "infinite";
        super.setOptions(options);
      }
      /**
      * The infinite-query counterpart of {@link QueryObserver#getOptimisticResult}, marking the
      * options as an infinite query before delegating to it. Called by framework adapters (e.g.
      * `useInfiniteQuery`) ahead of subscribing, to compute the current `InfiniteQueryObserverResult`
      * synchronously.
      * @param options - The defaulted infinite query observer options to compute the result for.
      * @returns The result for the given options.
      */
      getOptimisticResult(options) {
        options._type = "infinite";
        return super.getOptimisticResult(options);
      }
      /**
      * Fetches the next page of the infinite query and returns a promise that
      * resolves with the resulting `InfiniteQueryObserverResult`. The page
      * param used for the fetch is determined by `getNextPageParam`, which
      * receives the current pages/page params and whose result also determines
      * `hasNextPage`.
      * @param options - Set `cancelRefetch` to `false` to ignore the call while a fetch is running,
      * and `throwOnError` to `true` to reject when the fetch fails.
      * @returns A promise that resolves with the result after the next page is fetched. With
      * `cancelRefetch: false`, a running fetch is reused instead, so the next page may not be fetched.
      * @see {@link InfiniteQueryObserver#fetchPreviousPage}
      * @example
      * ```ts
      * const { hasNextPage } = observer.getCurrentResult()
      *
      * if (hasNextPage) {
      *   await observer.fetchNextPage()
      * }
      * ```
      */
      fetchNextPage(options) {
        return this.fetch({
          ...options,
          meta: { fetchMore: { direction: "forward" } }
        });
      }
      /**
      * Fetches the previous page of the infinite query and returns a promise
      * that resolves with the resulting `InfiniteQueryObserverResult`. The page
      * param used for the fetch is determined by `getPreviousPageParam`, which
      * receives the current pages/page params and whose result also determines
      * `hasPreviousPage`.
      * @param options - Set `cancelRefetch` to `false` to ignore the call while a fetch is running,
      * and `throwOnError` to `true` to reject when the fetch fails.
      * @returns A promise that resolves with the result after the previous page is fetched. With
      * `cancelRefetch: false`, a running fetch is reused instead, so the previous page may not be fetched.
      * @see {@link InfiniteQueryObserver#fetchNextPage}
      * @example
      * ```ts
      * const { hasPreviousPage } = observer.getCurrentResult()
      *
      * if (hasPreviousPage) {
      *   await observer.fetchPreviousPage()
      * }
      * ```
      */
      fetchPreviousPage(options) {
        return this.fetch({
          ...options,
          meta: { fetchMore: { direction: "backward" } }
        });
      }
      createResult(query, options) {
        const { state } = query;
        const parentResult = super.createResult(query, options);
        const { isFetching, isRefetching, isError, isRefetchError } = parentResult;
        const fetchDirection = state.fetchMeta?.fetchMore?.direction;
        const isFetchNextPageError = isError && fetchDirection === "forward";
        const isFetchingNextPage = isFetching && fetchDirection === "forward";
        const isFetchPreviousPageError = isError && fetchDirection === "backward";
        const isFetchingPreviousPage = isFetching && fetchDirection === "backward";
        return {
          ...parentResult,
          fetchNextPage: this.fetchNextPage,
          fetchPreviousPage: this.fetchPreviousPage,
          hasNextPage: hasNextPage(options, state.data),
          hasPreviousPage: hasPreviousPage(options, state.data),
          isFetchNextPageError,
          isFetchingNextPage,
          isFetchPreviousPageError,
          isFetchingPreviousPage,
          isRefetchError: isRefetchError && !isFetchNextPageError && !isFetchPreviousPageError,
          isRefetching: isRefetching && !isFetchingNextPage && !isFetchingPreviousPage
        };
      }
    };
  }
});

// node_modules/@tanstack/query-core/build/modern/mutation.js
function getDefaultState2() {
  return {
    context: void 0,
    data: void 0,
    error: null,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    status: "idle",
    variables: void 0,
    submittedAt: 0
  };
}
var Mutation;
var init_mutation = __esm({
  "node_modules/@tanstack/query-core/build/modern/mutation.js"() {
    init_notifyManager();
    init_retryer();
    init_removable();
    Mutation = class extends Removable {
      #client;
      #observers;
      #mutationCache;
      #retryer;
      constructor(config) {
        super();
        this.#client = config.client;
        this.mutationId = config.mutationId;
        this.#mutationCache = config.mutationCache;
        this.#observers = [];
        this.state = config.state || getDefaultState2();
        this.setOptions(config.options);
        this.scheduleGc();
      }
      /**
      * Replaces the mutation's options and applies their `gcTime`.
      * @internal
      * @param options - The new mutation options.
      */
      setOptions(options) {
        this.options = options;
        this.updateGcTime(this.options.gcTime);
      }
      /**
      * The `meta` object passed in the mutation's options, if any.
      * @returns The mutation's `meta`, or `undefined` if none was set.
      */
      get meta() {
        return this.options.meta;
      }
      /**
      * Subscribes an observer to the mutation and stops its garbage collection.
      * @internal
      * @param observer - The observer to add. Adding an observer that is already subscribed does
      * nothing.
      */
      addObserver(observer) {
        if (!this.#observers.includes(observer)) {
          this.#observers.push(observer);
          this.clearGcTimeout();
          this.#mutationCache.notify({
            type: "observerAdded",
            mutation: this,
            observer
          });
        }
      }
      /**
      * Unsubscribes an observer from the mutation.
      * @internal
      * @param observer - The observer to remove. Garbage collection is scheduled afterwards.
      */
      removeObserver(observer) {
        this.#observers = this.#observers.filter((x) => x !== observer);
        this.scheduleGc();
        this.#mutationCache.notify({
          type: "observerRemoved",
          mutation: this,
          observer
        });
      }
      optionalRemove() {
        if (!this.#observers.length) {
          if (this.state.status === "pending") this.scheduleGc();
          else this.#mutationCache.remove(this);
        }
      }
      /**
      * Resumes a mutation that is currently paused or was restored from a
      * dehydrated, still-`pending` state.
      *
      * - If this mutation has an active retryer (it paused mid-attempt, e.g. due
      *   to the network mode or scope-based queuing), its retryer is resumed.
      * - Otherwise, if the mutation's status is still `pending` (e.g. it was
      *   dehydrated while an attempt was in flight and never got a retryer in
      *   this instance), `execute` is called again with the last known variables.
      * - Otherwise the mutation has already settled and this resolves immediately
      *   without running anything again.
      * @returns A promise that settles with the resumed mutation: it rejects if the mutation fails.
      * It resolves immediately if the mutation has already settled.
      * @see {@link Mutation#execute}
      * @example
      * ```ts
      * // typically driven by reconnect handling, e.g. queryClient.resumePausedMutations()
      * const mutation = mutationCache.find({ mutationKey: ['addPost'] })
      * await mutation?.continue()
      * ```
      */
      continue() {
        return this.#retryer?.continue() ?? (this.state.status === "pending" ? this.execute(this.state.variables) : Promise.resolve());
      }
      /**
      * Runs the mutation function for the given variables through a retryer, and
      * drives the mutation's state and lifecycle callbacks through to settlement.
      *
      * If this mutation's state is already `pending` when `execute` is called
      * (i.e. it was restored, still in-flight, from a dehydrated state), the
      * `onMutate` step is skipped and a `continue` action is dispatched to
      * unpause it; otherwise a `pending` action is dispatched first, then the
      * mutation cache's `onMutate` and the mutation's own `onMutate` option are
      * awaited in that order, and the resulting context is stored.
      *
      * The mutation function is then run (subject to `retry`/`retryDelay`/
      * `networkMode`, and to the mutation cache's scope-based serialization).
      * On success, the cache's `onSuccess`/`onSettled` callbacks run before the
      * mutation's own `onSuccess`/`onSettled` options, a `success` action is
      * dispatched, and the resolved data is returned. On failure, the same
      * cache-then-option ordering is used for `onError`/`onSettled`, but each of
      * those four callbacks is individually caught so that a throwing callback
      * cannot mask the original error; an `error` action is then dispatched and
      * the original error is re-thrown.
      * @param variables - The variables passed to the `mutationFn`.
      * @returns A promise that resolves with the mutation's data, or rejects with its error.
      * @see {@link Mutation#continue}
      * @example
      * ```ts
      * // Called internally by `MutationObserver.mutate` and `Mutation.continue` —
      * // applications normally trigger mutations through those, not this method.
      * const data = await mutation.execute(variables)
      * ```
      */
      async execute(variables) {
        const onContinue = () => {
          this.#dispatch({ type: "continue" });
        };
        const mutationFnContext = {
          client: this.#client,
          meta: this.options.meta,
          mutationKey: this.options.mutationKey
        };
        const retryer = this.#retryer = createRetryer({
          fn: () => {
            if (!this.options.mutationFn) return Promise.reject(/* @__PURE__ */ new Error("No mutationFn found"));
            return this.options.mutationFn(variables, mutationFnContext);
          },
          onFail: (failureCount, error) => {
            this.#dispatch({
              type: "failed",
              failureCount,
              error
            });
          },
          onPause: () => {
            this.#dispatch({ type: "pause" });
          },
          onContinue,
          retry: this.options.retry ?? 0,
          retryDelay: this.options.retryDelay,
          networkMode: this.options.networkMode,
          canRun: () => this.#mutationCache.canRun(this)
        });
        const restored = this.state.status === "pending";
        const isPaused = !retryer.canStart();
        try {
          if (restored) onContinue();
          else {
            this.#dispatch({
              type: "pending",
              variables,
              isPaused
            });
            if (this.#mutationCache.config.onMutate) await this.#mutationCache.config.onMutate(variables, this, mutationFnContext);
            const context = await this.options.onMutate?.(variables, mutationFnContext);
            if (context !== this.state.context) this.#dispatch({
              type: "pending",
              context,
              variables,
              isPaused
            });
          }
          const data = await retryer.start();
          await this.#mutationCache.config.onSuccess?.(data, variables, this.state.context, this, mutationFnContext);
          await this.options.onSuccess?.(data, variables, this.state.context, mutationFnContext);
          await this.#mutationCache.config.onSettled?.(data, null, this.state.variables, this.state.context, this, mutationFnContext);
          await this.options.onSettled?.(data, null, variables, this.state.context, mutationFnContext);
          this.#dispatch({
            type: "success",
            data
          });
          return data;
        } catch (error) {
          try {
            await this.#mutationCache.config.onError?.(error, variables, this.state.context, this, mutationFnContext);
          } catch (e) {
            Promise.reject(e);
          }
          try {
            await this.options.onError?.(error, variables, this.state.context, mutationFnContext);
          } catch (e) {
            Promise.reject(e);
          }
          try {
            await this.#mutationCache.config.onSettled?.(void 0, error, this.state.variables, this.state.context, this, mutationFnContext);
          } catch (e) {
            Promise.reject(e);
          }
          try {
            await this.options.onSettled?.(void 0, error, variables, this.state.context, mutationFnContext);
          } catch (e) {
            Promise.reject(e);
          }
          this.#dispatch({
            type: "error",
            error
          });
          throw error;
        } finally {
          if (this.#retryer === retryer) this.#retryer = void 0;
          this.#mutationCache.runNext(this);
        }
      }
      #dispatch(action) {
        const reducer = (state) => {
          switch (action.type) {
            case "failed":
              return {
                ...state,
                failureCount: action.failureCount,
                failureReason: action.error
              };
            case "pause":
              return {
                ...state,
                isPaused: true
              };
            case "continue":
              return {
                ...state,
                isPaused: false
              };
            case "pending":
              return {
                ...state,
                context: action.context,
                data: void 0,
                failureCount: 0,
                failureReason: null,
                error: null,
                isPaused: action.isPaused,
                status: "pending",
                variables: action.variables,
                submittedAt: Date.now()
              };
            case "success":
              return {
                ...state,
                data: action.data,
                failureCount: 0,
                failureReason: null,
                error: null,
                status: "success",
                isPaused: false
              };
            case "error":
              return {
                ...state,
                data: void 0,
                error: action.error,
                failureCount: state.failureCount + 1,
                failureReason: action.error,
                isPaused: false,
                status: "error"
              };
          }
        };
        this.state = reducer(this.state);
        notifyManager.batch(() => {
          this.#observers.forEach((observer) => {
            observer.onMutationUpdate(action);
          });
          this.#mutationCache.notify({
            mutation: this,
            type: "updated",
            action
          });
        });
      }
    };
  }
});

// node_modules/@tanstack/query-core/build/modern/mutationCache.js
function scopeFor(mutation) {
  return mutation.options.scope?.id;
}
var MutationCache;
var init_mutationCache = __esm({
  "node_modules/@tanstack/query-core/build/modern/mutationCache.js"() {
    init_utils();
    init_subscribable();
    init_notifyManager();
    init_mutation();
    MutationCache = class extends Subscribable {
      #mutations;
      #scopes;
      #mutationId;
      constructor(config = {}) {
        super();
        this.config = config;
        this.#mutations = /* @__PURE__ */ new Set();
        this.#scopes = /* @__PURE__ */ new Map();
        this.#mutationId = 0;
      }
      /**
      * Creates a mutation and adds it to the cache.
      * @internal
      * @param client - The client the mutation belongs to, used to default its options.
      * @param options - The mutation options. They are defaulted with {@link
      * QueryClient#defaultMutationOptions}.
      * @param state - The initial state of the mutation, e.g. when restoring a dehydrated mutation.
      * @returns The new mutation, already added to the cache.
      */
      build(client, options, state) {
        const mutation = new Mutation({
          client,
          mutationCache: this,
          mutationId: ++this.#mutationId,
          options: client.defaultMutationOptions(options),
          state
        });
        this.add(mutation);
        return mutation;
      }
      /**
      * Adds a mutation to the cache.
      * @internal
      * @param mutation - The mutation to add. If it has a `scope`, it is queued in that scope.
      */
      add(mutation) {
        this.#mutations.add(mutation);
        const scope = scopeFor(mutation);
        if (typeof scope === "string") {
          const scopedMutations = this.#scopes.get(scope);
          if (scopedMutations) scopedMutations.push(mutation);
          else this.#scopes.set(scope, [mutation]);
        }
        this.notify({
          type: "added",
          mutation
        });
      }
      /**
      * Removes a mutation from the cache.
      * @internal
      * @param mutation - The mutation to remove, also from its scope's queue.
      */
      remove(mutation) {
        if (this.#mutations.delete(mutation)) {
          const scope = scopeFor(mutation);
          if (typeof scope === "string") {
            const scopedMutations = this.#scopes.get(scope);
            if (scopedMutations) {
              if (scopedMutations.length > 1) {
                const index = scopedMutations.indexOf(mutation);
                if (index !== -1) scopedMutations.splice(index, 1);
              } else if (scopedMutations[0] === mutation) this.#scopes.delete(scope);
            }
          }
        }
        this.notify({
          type: "removed",
          mutation
        });
      }
      /**
      * Checks whether a mutation can run now, given the other mutations in its `scope`.
      * @internal
      * @param mutation - The mutation to check.
      * @returns `true` if the mutation has no `scope`, or no other mutation in its scope is pending
      * ahead of it.
      */
      canRun(mutation) {
        const scope = scopeFor(mutation);
        if (typeof scope === "string") {
          const firstPendingMutation = this.#scopes.get(scope)?.find((m) => m.state.status === "pending");
          return !firstPendingMutation || firstPendingMutation === mutation;
        } else return true;
      }
      /**
      * Continues the next paused mutation in the same `scope` after a mutation finishes.
      * @internal
      * @param mutation - The mutation that finished.
      * @returns A promise that resolves once the next paused mutation in the same scope has continued,
      * or immediately if there is none.
      */
      runNext(mutation) {
        const scope = scopeFor(mutation);
        if (typeof scope === "string") return this.#scopes.get(scope)?.find((m) => m !== mutation && m.state.isPaused)?.continue() ?? Promise.resolve();
        else return Promise.resolve();
      }
      /**
      * Removes all mutations from the cache.
      * @example
      * ```ts
      * const mutationCache = queryClient.getMutationCache()
      *
      * mutationCache.clear()
      * ```
      */
      clear() {
        notifyManager.batch(() => {
          const mutations = this.getAll();
          this.#mutations.clear();
          this.#scopes.clear();
          mutations.forEach((mutation) => {
            this.notify({
              type: "removed",
              mutation
            });
          });
        });
      }
      /**
      * Returns all mutations within the cache.
      *
      * This is not typically needed for most applications, but can come in handy when needing more
      * information about a mutation in rare scenarios.
      * @returns Every mutation in the cache.
      * @example
      * ```ts
      * const mutationCache = queryClient.getMutationCache()
      *
      * const mutations = mutationCache.getAll()
      * ```
      */
      getAll() {
        return Array.from(this.#mutations);
      }
      /**
      * A slightly more advanced method that can be used to get an existing mutation instance from
      * the cache. If the mutation does not exist, `undefined` is returned.
      *
      * This is not typically needed for most applications, but can come in handy when needing more
      * information about a mutation in rare scenarios.
      * @param filters - The filters to match. `exact` defaults to `true`.
      * @returns The first matching mutation, or `undefined`.
      * @see {@link MutationCache#findAll}
      * @example
      * ```ts
      * const mutationCache = queryClient.getMutationCache()
      *
      * const mutation = mutationCache.find({ mutationKey: ['addPost'] })
      * ```
      */
      find(filters) {
        const defaultedFilters = {
          exact: true,
          ...filters
        };
        return this.getAll().find((mutation) => matchMutation(defaultedFilters, mutation));
      }
      /**
      * An even more advanced method that can be used to get existing mutation instances from the
      * cache that match the given filters. If no mutations match, an empty array is returned.
      *
      * This is not typically needed for most applications, but can come in handy when needing more
      * information about mutations in rare scenarios.
      * @param filters - The filters to match. Without filters, every mutation is returned.
      * @returns The matching mutations.
      * @see {@link MutationCache#find}
      * @example
      * ```ts
      * const mutationCache = queryClient.getMutationCache()
      *
      * const mutations = mutationCache.findAll({ mutationKey: ['addPost'] })
      * ```
      */
      findAll(filters = {}) {
        return this.getAll().filter((mutation) => matchMutation(filters, mutation));
      }
      /**
      * Notifies every cache listener of an event, in one batch.
      * @internal
      * @param event - The event passed to every listener.
      */
      notify(event) {
        notifyManager.batch(() => {
          this.listeners.forEach((listener) => {
            listener(event);
          });
        });
      }
      /**
      * Continues every paused mutation, e.g. when the app comes back online.
      * @internal
      * @returns A promise that resolves once every paused mutation has continued and settled.
      */
      resumePausedMutations() {
        const pausedMutations = this.getAll().filter((x) => x.state.isPaused);
        return notifyManager.batch(() => Promise.all(pausedMutations.map((mutation) => mutation.continue().catch(noop))));
      }
    };
  }
});

// node_modules/@tanstack/query-core/build/modern/queryCache.js
var QueryCache;
var init_queryCache = __esm({
  "node_modules/@tanstack/query-core/build/modern/queryCache.js"() {
    init_utils();
    init_subscribable();
    init_notifyManager();
    init_query();
    QueryCache = class extends Subscribable {
      #queries;
      constructor(config = {}) {
        super();
        this.config = config;
        this.#queries = /* @__PURE__ */ new Map();
      }
      /**
      * Returns the existing `Query` instance for the given options' `queryKey`/`queryHash`, or
      * builds and adds a new one to the cache if none exists yet. Used by framework adapters and
      * plugins (e.g. broadcast/persistence) that need to get-or-create a `Query` directly, bypassing
      * the reactive `QueryObserver` machinery.
      * @param client - The client the query belongs to, used to default its options.
      * @param options - The query options, including the `queryKey`. A new query is created with the
      * options defaulted by {@link QueryClient#defaultQueryOptions}.
      * @param state - The initial state of a newly created query, e.g. when hydrating. Ignored if the
      * query already exists.
      * @returns The existing or newly created query.
      * @example
      * ```ts
      * const queryCache = queryClient.getQueryCache()
      *
      * const query = queryCache.build(queryClient, {
      *   queryKey: ['posts'],
      *   queryFn: fetchPosts,
      * })
      * ```
      */
      build(client, options, state) {
        const queryKey = options.queryKey;
        const queryHash = options.queryHash ?? hashQueryKeyByOptions(queryKey, options);
        let query = this.get(queryHash);
        if (!query) {
          query = new Query({
            client,
            queryKey,
            queryHash,
            options: client.defaultQueryOptions(options),
            state,
            defaultOptions: client.getQueryDefaults(queryKey)
          });
          this.add(query);
        }
        return query;
      }
      /**
      * Adds a query to the cache.
      * @internal
      * @param query - The query to add. If a query with the same hash is already cached, nothing
      * happens.
      */
      add(query) {
        if (!this.#queries.has(query.queryHash)) {
          this.#queries.set(query.queryHash, query);
          this.notify({
            type: "added",
            query
          });
        }
      }
      /**
      * Destroys the given `Query` and removes it from the cache, notifying subscribers with a
      * `'removed'` event. A no-op if the query is no longer the one currently stored under its hash
      * (e.g. it was already replaced). Used by plugins (e.g. the broadcast client) that mirror
      * removals across `QueryCache` instances.
      * @param query - The query to remove.
      * @example
      * ```ts
      * const queryCache = queryClient.getQueryCache()
      * const query = queryCache.find({ queryKey: ['posts'] })
      *
      * if (query) {
      *   queryCache.remove(query)
      * }
      * ```
      */
      remove(query) {
        if (this.#queries.get(query.queryHash) === query) {
          query.destroy();
          this.#queries.delete(query.queryHash);
          this.notify({
            type: "removed",
            query
          });
        }
      }
      /**
      * Removes all queries from the cache.
      * @example
      * ```ts
      * const queryCache = queryClient.getQueryCache()
      *
      * queryCache.clear()
      * ```
      */
      clear() {
        notifyManager.batch(() => {
          this.getAll().forEach((query) => {
            this.remove(query);
          });
        });
      }
      /**
      * Returns the `Query` instance stored under the given `queryHash`, or `undefined` if none
      * exists. Unlike {@link QueryCache#find}, this looks up by the already-computed hash rather
      * than by `QueryFilters`. Used by plugins (e.g. broadcast/hydration) that already have a hash
      * to look up directly.
      * @param queryHash - The hash of the query to look up.
      * @returns The query stored under the hash, or `undefined`.
      * @example
      * ```ts
      * const queryCache = queryClient.getQueryCache()
      * const queryHash = hashKey(['posts'])
      *
      * const query = queryCache.get(queryHash)
      * ```
      */
      get(queryHash) {
        return this.#queries.get(queryHash);
      }
      /**
      * Returns all queries within the cache.
      * @returns Every query in the cache.
      * @example
      * ```ts
      * const queryCache = queryClient.getQueryCache()
      *
      * const queries = queryCache.getAll()
      * ```
      */
      getAll() {
        return [...this.#queries.values()];
      }
      /**
      * A slightly more advanced method that can be used to get an existing query instance from the
      * cache. This instance not only contains all the state for the query, but all of the instances,
      * and underlying guts of the query as well. If the query does not exist, `undefined` is
      * returned.
      *
      * This is not typically needed for most applications, but can come in handy when needing more
      * information about a query in rare scenarios (e.g. looking at `query.state.dataUpdatedAt` to
      * decide whether a query is fresh enough to be used as an initial value).
      * @param filters - The filters to match, including the required `queryKey`. `exact` defaults to
      * `true`.
      * @returns The first matching query, or `undefined`.
      * @see {@link QueryCache#findAll}
      * @example
      * ```ts
      * const queryCache = queryClient.getQueryCache()
      *
      * const query = queryCache.find({ queryKey: ['posts'] })
      * ```
      */
      find(filters) {
        const defaultedFilters = {
          exact: true,
          ...filters
        };
        return this.getAll().find((query) => matchQuery(defaultedFilters, query));
      }
      /**
      * An even more advanced method that can be used to get existing query instances from the cache
      * that partially match a query key. If no queries match, an empty array is returned.
      *
      * This is not typically needed for most applications, but can come in handy when needing more
      * information about queries in rare scenarios.
      * @param filters - The filters to match. Without filters, every query is returned.
      * @returns The matching queries.
      * @see {@link QueryCache#find}
      * @example
      * ```ts
      * const queryCache = queryClient.getQueryCache()
      *
      * const queries = queryCache.findAll({ queryKey: ['posts'] })
      * ```
      */
      findAll(filters = {}) {
        const queries = this.getAll();
        return Object.keys(filters).length > 0 ? queries.filter((query) => matchQuery(filters, query)) : queries;
      }
      /**
      * Notifies every cache listener of an event, in one batch.
      * @internal
      * @param event - The event passed to every listener.
      */
      notify(event) {
        notifyManager.batch(() => {
          this.listeners.forEach((listener) => {
            listener(event);
          });
        });
      }
      /**
      * Calls {@link Query#onFocus} on every cached query, in one batch.
      * @internal
      */
      onFocus() {
        notifyManager.batch(() => {
          this.getAll().forEach((query) => {
            query.onFocus();
          });
        });
      }
      /**
      * Calls {@link Query#onOnline} on every cached query, in one batch.
      * @internal
      */
      onOnline() {
        notifyManager.batch(() => {
          this.getAll().forEach((query) => {
            query.onOnline();
          });
        });
      }
    };
  }
});

// node_modules/@tanstack/query-core/build/modern/queryClient.js
var QueryClient;
var init_queryClient = __esm({
  "node_modules/@tanstack/query-core/build/modern/queryClient.js"() {
    init_utils();
    init_focusManager();
    init_notifyManager();
    init_onlineManager();
    init_mutationCache();
    init_queryCache();
    QueryClient = class {
      #queryCache;
      #mutationCache;
      #defaultOptions;
      #queryDefaults;
      #mutationDefaults;
      #mountCount;
      #unsubscribeFocus;
      #unsubscribeOnline;
      constructor(config = {}) {
        this.#queryCache = config.queryCache || new QueryCache();
        this.#mutationCache = config.mutationCache || new MutationCache();
        this.#defaultOptions = config.defaultOptions || {};
        this.#queryDefaults = /* @__PURE__ */ new Map();
        this.#mutationDefaults = /* @__PURE__ */ new Map();
        this.#mountCount = 0;
      }
      /**
      * Called by a framework adapter's `QueryClientProvider`-equivalent when it mounts, to start
      * listening for focus/online events and resume paused mutations. Ref-counted via an internal
      * mount count, so nested or multiple providers sharing the same `QueryClient` don't tear down
      * the shared listeners until the last one unmounts.
      */
      mount() {
        this.#mountCount++;
        if (this.#mountCount !== 1) return;
        this.#unsubscribeFocus = focusManager.subscribe(async (focused) => {
          if (focused) {
            await this.resumePausedMutations();
            this.#queryCache.onFocus();
          }
        });
        this.#unsubscribeOnline = onlineManager.subscribe(async (online) => {
          if (online) {
            await this.resumePausedMutations();
            this.#queryCache.onOnline();
          }
        });
      }
      /**
      * The inverse of {@link QueryClient#mount} — called by a framework adapter's
      * `QueryClientProvider`-equivalent when it unmounts. Only tears down the focus/online
      * listeners once the mount count returns to `0`.
      */
      unmount() {
        this.#mountCount--;
        if (this.#mountCount !== 0) return;
        this.#unsubscribeFocus?.();
        this.#unsubscribeFocus = void 0;
        this.#unsubscribeOnline?.();
        this.#unsubscribeOnline = void 0;
      }
      /**
      * Returns the number of queries in the cache that are currently fetching, optionally
      * matching a set of filters. This includes background-fetching, loading new pages, and
      * loading more infinite query results.
      * @param filters - Narrows down which fetching queries are counted. Without filters, every
      * fetching query is counted.
      * @returns The number of matching queries whose `fetchStatus` is `'fetching'`.
      * @example
      * ```ts
      * if (queryClient.isFetching()) {
      *   console.log('At least one query is fetching!')
      * }
      * ```
      */
      isFetching(filters) {
        return this.#queryCache.findAll({
          ...filters,
          fetchStatus: "fetching"
        }).length;
      }
      /**
      * Returns the number of mutations in the cache that are currently pending, optionally
      * matching a set of filters.
      * @param filters - Narrows down which pending mutations are counted. Without filters, every
      * pending mutation is counted.
      * @returns The number of matching mutations whose `status` is `'pending'`.
      * @example
      * ```ts
      * if (queryClient.isMutating()) {
      *   console.log('At least one mutation is pending!')
      * }
      * ```
      */
      isMutating(filters) {
        return this.#mutationCache.findAll({
          ...filters,
          status: "pending"
        }).length;
      }
      /**
      * Imperative (non-reactive) way to retrieve data for a QueryKey.
      * Should only be used in callbacks or functions where reading the latest data is necessary, e.g. for optimistic updates.
      *
      * Hint: Do not use this function inside a component, because it won't receive updates.
      * Use `useQuery` to create a `QueryObserver` that subscribes to changes.
      * @param queryKey - The query key of the query to read.
      * @returns The cached data for the query, or `undefined` if no query with this key has been observed yet.
      * @see {@link QueryClient#getQueriesData}
      */
      getQueryData(queryKey) {
        const options = this.defaultQueryOptions({ queryKey });
        return this.#queryCache.get(options.queryHash)?.state.data;
      }
      /**
      * Returns the cached data of a query, or fetches it if there is none. With `revalidateIfStale`,
      * stale cached data is also refetched in the background.
      * @param options - The query options. If the query has no cached data yet, it is fetched with
      * these options.
      * @returns A promise that resolves to the cached data, or to the fetched data if nothing was
      * cached yet.
      * @deprecated Use queryClient.query({ ...options, staleTime: 'static' }) instead. This method will be removed in the next major version.
      */
      ensureQueryData(options) {
        const defaultedOptions = this.defaultQueryOptions(options);
        const query = this.#queryCache.build(this, defaultedOptions);
        const cachedData = query.state.data;
        if (cachedData === void 0) return this.fetchQuery(options);
        if (options.revalidateIfStale && query.isStaleByTime(resolveQueryValue(defaultedOptions.staleTime, query))) this.prefetchQuery(defaultedOptions);
        return Promise.resolve(cachedData);
      }
      /**
      * Imperative (non-reactive) way to retrieve the cached data of multiple queries at once.
      * Only queries matching the given filters are returned; if none match, an empty array is
      * returned.
      *
      * Because the matched queries can hold data of different shapes (e.g. a broad filter can match
      * queries with unrelated data types), the `TQueryFnData` generic defaults to `unknown` rather
      * than being inferred. Passing a more specific type is a convenience for call sites that know
      * every matched query holds the same shape — it is not checked against the actual cache
      * contents.
      * @param filters - The filters that select which queries to read.
      * @returns An array of query key and data pairs. The data is `undefined` for a query with no cached data.
      * @see {@link QueryClient#getQueryData}
      * @example
      * ```ts
      * const data = queryClient.getQueriesData({ queryKey: ['posts'] })
      * ```
      */
      getQueriesData(filters) {
        return this.#queryCache.findAll(filters).map(({ queryKey, state }) => {
          return [queryKey, state.data];
        });
      }
      /**
      * Synchronous way to immediately update a query's cached data. If the updater (or the value
      * passed) resolves to `undefined`, the cache is left untouched and no query is created;
      * otherwise, if the query does not exist yet, it will be created. To update multiple queries
      * at once by partially matching query keys, use {@link QueryClient#setQueriesData} instead.
      *
      * Updates must be performed immutably: do not mutate `oldData`, or data previously retrieved
      * via {@link QueryClient#getQueryData}, in place.
      * @param queryKey - The query key to set data for.
      * @param updater - Either the new data, or a function that receives the current data (which
      * may be `undefined`) and returns the new data.
      * @param options - Set `updatedAt` to override the timestamp the written data is recorded with.
      * @returns The data that was written, or `undefined` if the updater returned `undefined` — in that case
      * the write is skipped and the cache is left unchanged.
      * @example
      * ```ts
      * queryClient.setQueryData(['posts'], newPosts)
      *
      * // Or, using an updater function that receives the current data:
      * queryClient.setQueryData(['posts'], (oldPosts) => [...oldPosts, newPost])
      * ```
      */
      setQueryData(queryKey, updater, options) {
        const defaultedOptions = this.defaultQueryOptions({ queryKey });
        const prevData = this.#queryCache.get(defaultedOptions.queryHash)?.state.data;
        const data = functionalUpdate(updater, prevData);
        if (data === void 0) return;
        return this.#queryCache.build(this, defaultedOptions).setData(data, {
          ...options,
          manual: true
        });
      }
      /**
      * Synchronous way to immediately update the cached data of multiple queries at once, using
      * filters or partial query key matching. Only queries that already exist and match the given
      * filters are updated; no new cache entries are created. Internally this calls
      * {@link QueryClient#setQueryData} for each matching query.
      * @param filters - The filters that select which existing queries to update.
      * @param updater - Either the new data, or a function that receives each matched query's current
      * data (which may be `undefined`) and returns the new data.
      * @param options - Set `updatedAt` to override the timestamp the written data is recorded with.
      * @returns One `[queryKey, data]` tuple per matched query, in the same shape and with the same
      * `undefined` case as {@link QueryClient#setQueryData}.
      * @example
      * ```ts
      * queryClient.setQueriesData({ queryKey: ['posts'] }, (oldPosts) =>
      *   oldPosts ? oldPosts.filter((post) => post.id !== deletedId) : oldPosts,
      * )
      * ```
      */
      setQueriesData(filters, updater, options) {
        return notifyManager.batch(() => this.#queryCache.findAll(filters).map(({ queryKey }) => [queryKey, this.setQueryData(queryKey, updater, options)]));
      }
      /**
      * Imperative (non-reactive) way to retrieve an existing query's state. If the query does not
      * exist, `undefined` is returned.
      * @param queryKey - The query key of the query to read.
      * @returns The query's state, or `undefined` if no query with this key exists.
      * @example
      * ```ts
      * const state = queryClient.getQueryState(['posts'])
      * console.log(state?.dataUpdatedAt)
      * ```
      */
      getQueryState(queryKey) {
        const options = this.defaultQueryOptions({ queryKey });
        return this.#queryCache.get(options.queryHash)?.state;
      }
      /**
      * Removes queries from the cache that match the given filters. Unlike
      * {@link QueryClient#invalidateQueries} or {@link QueryClient#refetchQueries}, this removes
      * matching queries from the cache instead of refetching them. Without filters, every query in
      * the cache is removed.
      * @param filters - The filters that select which queries to remove. Without filters, every query
      * is removed.
      * @example
      * ```ts
      * queryClient.removeQueries({ queryKey: ['posts'], exact: true })
      * ```
      */
      removeQueries(filters) {
        const queryCache = this.#queryCache;
        notifyManager.batch(() => {
          queryCache.findAll(filters).forEach((query) => {
            queryCache.remove(query);
          });
        });
      }
      /**
      * Resets queries matching the given filters back to their initial state (e.g. any
      * `initialData`), notifying subscribers rather than removing them. Active queries among the
      * matched set are then refetched, and the returned promise resolves once that refetch settles.
      * @param filters - The filters that select which queries to reset. Without filters, every query
      * is reset.
      * @param options - Passed to the refetch of the active matched queries, e.g. `cancelRefetch` and
      * `throwOnError`.
      * @returns A promise that resolves once the refetch of the active matched queries settles.
      * @example
      * ```ts
      * await queryClient.resetQueries({ queryKey: ['posts'], exact: true })
      * ```
      */
      resetQueries(filters, options) {
        const queryCache = this.#queryCache;
        return notifyManager.batch(() => {
          const matched = queryCache.findAll(filters);
          const queriesToRefetch = new Set(matched);
          matched.forEach((query) => {
            query.reset();
          });
          return this.refetchQueries({
            type: "active",
            predicate: (query) => queriesToRefetch.has(query)
          }, options);
        });
      }
      /**
      * Cancels outgoing fetches for queries matching the given filters. Most useful when performing
      * optimistic updates, since any outgoing refetch that resolves afterwards would otherwise
      * overwrite the optimistic update. By default (`revert: true`), a cancelled query's data is
      * reverted to its state before the outgoing fetch started.
      *
      * The returned promise never rejects, even if individual cancellations fail.
      * @param filters - The filters that select which queries to cancel. Without filters, every query
      * is cancelled.
      * @param cancelOptions - Passed to each matched query's cancellation. `revert` defaults to
      * `true`.
      * @returns A promise that resolves once every cancellation has settled.
      * @example
      * ```ts
      * await queryClient.cancelQueries({ queryKey: ['posts'], exact: true })
      * ```
      */
      cancelQueries(filters, cancelOptions = {}) {
        const defaultedCancelOptions = {
          revert: true,
          ...cancelOptions
        };
        const promises = notifyManager.batch(() => this.#queryCache.findAll(filters).map((query) => query.cancel(defaultedCancelOptions)));
        return Promise.all(promises).then(noop).catch(noop);
      }
      /**
      * Marks queries matching the given filters as invalidated. Unlike
      * {@link QueryClient#removeQueries}, invalidated queries stay in the cache.
      *
      * Unless `filters.refetchType` is `'none'`, matching queries are then refetched via
      * {@link QueryClient#refetchQueries}, using `filters.refetchType` if set, otherwise
      * `filters.type`, otherwise `'active'`.
      * @param filters - The filters that select which queries to invalidate, plus `refetchType` to
      * control which of them to refetch afterwards. Without filters, every query is invalidated.
      * @param options - Passed to {@link QueryClient#refetchQueries}, e.g. `cancelRefetch` and
      * `throwOnError`.
      * @returns A promise that resolves once the refetch settles, or immediately if `refetchType` is
      * `'none'`.
      * @example
      * ```ts
      * await queryClient.invalidateQueries({ queryKey: ['posts'], refetchType: 'active' })
      * ```
      */
      invalidateQueries(filters, options = {}) {
        return notifyManager.batch(() => {
          this.#queryCache.findAll(filters).forEach((query) => {
            query.invalidate();
          });
          if (filters?.refetchType === "none") return Promise.resolve();
          return this.refetchQueries({
            ...filters,
            type: filters?.refetchType ?? filters?.type ?? "active"
          }, options);
        });
      }
      /**
      * Refetches queries matching the given filters, regardless of whether they are stale. Without
      * filters, every query in the cache is refetched. Queries that are disabled, or static (only
      * have observers with a static `staleTime`), are never refetched.
      *
      * By default (`cancelRefetch: true`), a currently running fetch is cancelled before the new
      * one starts. The returned promise resolves once all matching queries have settled; it does
      * not reject on individual query failures unless `throwOnError` is set.
      * @param filters - The filters that select which queries to refetch. Without filters, every query
      * in the cache is included.
      * @param options - Set `cancelRefetch` to `false` to keep a running fetch instead of cancelling
      * it, and `throwOnError` to `true` to reject when a refetch fails.
      * @returns A promise that resolves once every matched query has settled.
      * @example
      * ```ts
      * // refetch all active queries partially matching a query key:
      * await queryClient.refetchQueries({ queryKey: ['posts'], type: 'active' })
      * ```
      */
      refetchQueries(filters, options = {}) {
        const fetchOptions = {
          ...options,
          cancelRefetch: options.cancelRefetch ?? true
        };
        const promises = notifyManager.batch(() => this.#queryCache.findAll(filters).filter((query) => !query.isDisabled() && !query.isStatic()).map((query) => {
          let promise = query.fetch(void 0, fetchOptions);
          if (!fetchOptions.throwOnError) promise = promise.catch(noop);
          return query.state.fetchStatus === "paused" ? Promise.resolve() : promise;
        }));
        return Promise.all(promises).then(noop);
      }
      /**
      * Asynchronous method to fetch and cache a query, resolving with the data or throwing with
      * the error.
      *
      * If the query already exists in the cache and its data is not stale (per the given
      * `staleTime`), the cached data is returned without fetching. Otherwise, the query is fetched
      * and the promise resolves once the fetch settles. If a `select` function is provided, it is
      * applied to the data in both cases (cached or freshly fetched) before it is returned.
      *
      * Unlike a reactive observer, retries are disabled by default here (`retry: false`) unless
      * explicitly configured, since there is no component to catch a thrown error and retry through
      * re-render.
      *
      * The accepted options are `QueryObserverOptions` minus the fields that only make sense for a
      * reactive observer — `enabled`, `refetchInterval`, `refetchIntervalInBackground`,
      * `refetchOnWindowFocus`, `refetchOnReconnect`, `refetchOnMount`, `retryOnMount`,
      * `notifyOnChangeProps`, `throwOnError`, `suspense`, and `placeholderData` are not part of this
      * method's options.
      *
      * This method replaces the deprecated `fetchQuery`, and — combined with
      * `{ staleTime: 'static' }` — the deprecated `ensureQueryData`.
      * @param options - The query options, including the `queryKey` and the `queryFn` used if the
      * query needs to fetch.
      * @returns A promise that resolves to the data, or to the result of `select` if provided. It
      * rejects with the error from the fetch or from `select`.
      * @example
      * ```ts
      * try {
      *   const data = await queryClient.query({ queryKey, queryFn, staleTime: 10000 })
      * } catch (error) {
      *   console.log(error)
      * }
      * ```
      */
      async query(options) {
        const defaultedOptions = this.defaultQueryOptions(options);
        if (defaultedOptions.retry === void 0) defaultedOptions.retry = false;
        const query = this.#queryCache.build(this, defaultedOptions);
        const queryData = query.isStaleByTime(resolveQueryValue(defaultedOptions.staleTime, query)) ? await query.fetch(defaultedOptions) : query.state.data;
        const select = defaultedOptions.select;
        if (select) return select(queryData);
        return queryData;
      }
      /**
      * Fetches and caches a query, or returns its cached data if it isn't stale. Unlike in observers,
      * the fetch isn't retried unless `retry` is set.
      * @param options - The query options, including the `queryKey` and the `queryFn` used if the
      * query needs to fetch.
      * @returns A promise that resolves to the cached or fetched data, or rejects with the fetch
      * error.
      * @deprecated Use queryClient.query(options) instead. This method will be removed in the next major version.
      */
      fetchQuery(options) {
        const defaultedOptions = this.defaultQueryOptions(options);
        if (defaultedOptions.retry === void 0) defaultedOptions.retry = false;
        const query = this.#queryCache.build(this, defaultedOptions);
        return query.isStaleByTime(resolveQueryValue(defaultedOptions.staleTime, query)) ? query.fetch(defaultedOptions) : Promise.resolve(query.state.data);
      }
      /**
      * Fetches and caches a query like {@link QueryClient#fetchQuery}, but ignores the result and any
      * error.
      * @param options - The query options, including the `queryKey` and the `queryFn` used if the
      * query needs to fetch.
      * @returns A promise that resolves once the fetch settles. It never rejects.
      * @deprecated Use queryClient.query(options) instead. You can swallow errors with `.catch(noop)`. This method will be removed in the next major version.
      */
      prefetchQuery(options) {
        return this.fetchQuery(options).then(noop).catch(noop);
      }
      /**
      * Asynchronous method to fetch and cache an infinite query, resolving with an
      * {@link InfiniteData} object or throwing with the error.
      *
      * Behaves like {@link QueryClient#query}, accepting the same options (minus
      * `initialPageParam`), plus the required `initialPageParam`, and an optional `pages` /
      * `getNextPageParam` pair used to refetch a fixed number of pages from the start.
      *
      * This method replaces the deprecated `fetchInfiniteQuery`, and — combined with
      * `{ staleTime: 'static' }` — the deprecated `ensureInfiniteQueryData`.
      * @param options - The infinite query options, including the `queryKey`, the `queryFn`, and the
      * `initialPageParam`.
      * @returns A promise that resolves to the {@link InfiniteData}, or to the result of `select` if
      * provided. It rejects with the error from the fetch or from `select`.
      * @example
      * ```ts
      * try {
      *   const data = await queryClient.infiniteQuery({ queryKey, queryFn, initialPageParam: 0 })
      *   console.log(data.pages)
      * } catch (error) {
      *   console.log(error)
      * }
      * ```
      */
      infiniteQuery(options) {
        options._type = "infinite";
        return this.query(options);
      }
      /**
      * Fetches and caches an infinite query, or returns its cached data if it isn't stale.
      * @param options - The infinite query options, including the `queryKey`, the `queryFn`, and the
      * `initialPageParam`.
      * @returns A promise that resolves to the cached or fetched {@link InfiniteData}, or rejects with
      * the fetch error.
      * @deprecated Use queryClient.infiniteQuery(options) instead. This method will be removed in the next major version.
      */
      fetchInfiniteQuery(options) {
        options._type = "infinite";
        return this.fetchQuery(options);
      }
      /**
      * Fetches and caches an infinite query like {@link QueryClient#fetchInfiniteQuery}, but ignores
      * the result and any error.
      * @param options - The infinite query options, including the `queryKey`, the `queryFn`, and the
      * `initialPageParam`.
      * @returns A promise that resolves once the fetch settles. It never rejects.
      * @deprecated Use queryClient.infiniteQuery(options) instead. You can swallow errors with `.catch(noop)`. This method will be removed in the next major version.
      */
      prefetchInfiniteQuery(options) {
        return this.fetchInfiniteQuery(options).then(noop).catch(noop);
      }
      /**
      * Returns the cached data of an infinite query, or fetches it if there is none. With
      * `revalidateIfStale`, stale cached data is also refetched in the background.
      * @param options - The infinite query options. If the query has no cached data yet, it is fetched
      * with these options.
      * @returns A promise that resolves to the cached {@link InfiniteData}, or to the fetched data if
      * nothing was cached yet.
      * @deprecated Use queryClient.infiniteQuery({ ...options, staleTime: 'static' }) instead. This method will be removed in the next major version.
      */
      ensureInfiniteQueryData(options) {
        options._type = "infinite";
        return this.ensureQueryData(options);
      }
      /**
      * Resumes mutations that were paused because there was no network connection. Does nothing
      * (resolving immediately) if the client is currently offline.
      * @returns A promise that resolves once the resumed mutations have settled.
      * @example
      * ```ts
      * import { QueryClient } from '@tanstack/query-core'
      *
      * const queryClient = new QueryClient()
      * await queryClient.resumePausedMutations()
      * ```
      */
      resumePausedMutations() {
        if (onlineManager.isOnline()) return this.#mutationCache.resumePausedMutations();
        return Promise.resolve();
      }
      /**
      * Returns the query cache this client is connected to.
      * @returns The {@link QueryCache} instance.
      * @example
      * ```ts
      * import { QueryClient } from '@tanstack/query-core'
      *
      * const queryClient = new QueryClient()
      * const queryCache = queryClient.getQueryCache()
      * const queries = queryCache.findAll({ queryKey: ['posts'] })
      * ```
      */
      getQueryCache() {
        return this.#queryCache;
      }
      /**
      * Returns the mutation cache this client is connected to.
      * @returns The {@link MutationCache} instance.
      * @example
      * ```ts
      * import { QueryClient } from '@tanstack/query-core'
      *
      * const queryClient = new QueryClient()
      * const mutationCache = queryClient.getMutationCache()
      * const mutations = mutationCache.findAll({ status: 'pending' })
      * ```
      */
      getMutationCache() {
        return this.#mutationCache;
      }
      /**
      * Returns the default options that were set when creating the client, or via
      * {@link QueryClient#setDefaultOptions}.
      * @returns The client's current default options.
      * @example
      * ```ts
      * import { QueryClient } from '@tanstack/query-core'
      *
      * const queryClient = new QueryClient()
      * const defaultOptions = queryClient.getDefaultOptions()
      * ```
      */
      getDefaultOptions() {
        return this.#defaultOptions;
      }
      /**
      * Dynamically sets the default options for this client, overwriting any previously defined
      * default options.
      * @param options - The new default options for queries and mutations.
      * @see {@link QueryClient#getDefaultOptions}
      * @example
      * ```ts
      * import { QueryClient } from '@tanstack/query-core'
      *
      * const queryClient = new QueryClient()
      * queryClient.setDefaultOptions({
      *   queries: {
      *     staleTime: Infinity,
      *   },
      * })
      * ```
      */
      setDefaultOptions(options) {
        this.#defaultOptions = options;
      }
      /**
      * Sets default options for queries whose query key partially matches the given `queryKey`.
      *
      * If several registered query defaults match a given query key, they are merged together in
      * registration order by {@link QueryClient#getQueryDefaults}, so register defaults from the
      * most generic key to the least generic one — more specific defaults should be registered
      * after more generic ones so they take precedence.
      * @param queryKey - The query key that query keys are partially matched against.
      * @param options - The default options applied to matching queries.
      * @example
      * ```ts
      * queryClient.setQueryDefaults(['posts'], { queryFn: fetchPosts })
      *
      * await queryClient.query({ queryKey: ['posts'] })
      * ```
      */
      setQueryDefaults(queryKey, options) {
        this.#queryDefaults.set(hashKey(queryKey), {
          queryKey,
          defaultOptions: options
        });
      }
      /**
      * Returns the default options registered for queries whose query key partially matches the
      * given `queryKey`, via {@link QueryClient#setQueryDefaults}. If multiple registered defaults
      * match, they are merged together in registration order.
      * @param queryKey - The query key to look up registered defaults for.
      * @returns The merged default options of every registration that matches, or an empty object if
      * none match.
      * @example
      * ```ts
      * const defaultOptions = queryClient.getQueryDefaults(['posts'])
      * ```
      */
      getQueryDefaults(queryKey) {
        const defaults = [...this.#queryDefaults.values()];
        const result = {};
        defaults.forEach((queryDefault) => {
          if (partialMatchKey(queryKey, queryDefault.queryKey)) Object.assign(result, queryDefault.defaultOptions);
        });
        return result;
      }
      /**
      * Sets default options for mutations whose mutation key partially matches the given
      * `mutationKey`. As with {@link QueryClient#setQueryDefaults}, the order of registration
      * matters when several registered defaults match the same mutation key.
      * @param mutationKey - The mutation key that mutation keys are partially matched against.
      * @param options - The default options applied to matching mutations.
      * @see {@link QueryClient#getMutationDefaults}
      * @example
      * ```ts
      * queryClient.setMutationDefaults(['addPost'], { mutationFn: addPost })
      * ```
      */
      setMutationDefaults(mutationKey, options) {
        this.#mutationDefaults.set(hashKey(mutationKey), {
          mutationKey,
          defaultOptions: options
        });
      }
      /**
      * Returns the default options registered for mutations whose mutation key partially matches
      * the given `mutationKey`, via {@link QueryClient#setMutationDefaults}. If multiple registered
      * defaults match, they are merged together in registration order.
      * @param mutationKey - The mutation key to look up registered defaults for.
      * @returns The merged default options of every registration that matches, or an empty object if
      * none match.
      * @example
      * ```ts
      * const defaultOptions = queryClient.getMutationDefaults(['addPost'])
      * ```
      */
      getMutationDefaults(mutationKey) {
        const defaults = [...this.#mutationDefaults.values()];
        const result = {};
        defaults.forEach((queryDefault) => {
          if (partialMatchKey(mutationKey, queryDefault.mutationKey)) Object.assign(result, queryDefault.defaultOptions);
        });
        return result;
      }
      /**
      * Called by framework adapters (e.g. inside `useQuery`) to resolve the options passed by the
      * caller into their final, defaulted form: merging the client's own `defaultOptions.queries`,
      * then `queryClient.setQueryDefaults` for the given `queryKey`, then the caller's options on
      * top. A no-op if the options are already defaulted (`_defaulted: true`).
      * @param options - The query options passed by the caller.
      * @returns The defaulted options, with `queryHash` and dependent defaults (e.g.
      * `refetchOnReconnect`) filled in.
      */
      defaultQueryOptions(options) {
        if (options._defaulted) return options;
        const defaultedOptions = {
          ...this.#defaultOptions.queries,
          ...this.getQueryDefaults(options.queryKey),
          ...options,
          _defaulted: true
        };
        if (!defaultedOptions.queryHash) defaultedOptions.queryHash = hashQueryKeyByOptions(defaultedOptions.queryKey, defaultedOptions);
        if (defaultedOptions.refetchOnReconnect === void 0) defaultedOptions.refetchOnReconnect = defaultedOptions.networkMode !== "always";
        if (defaultedOptions.throwOnError === void 0) defaultedOptions.throwOnError = !!defaultedOptions.suspense;
        if (!defaultedOptions.networkMode && defaultedOptions.persister) defaultedOptions.networkMode = "offlineFirst";
        if (defaultedOptions.queryFn === skipToken) defaultedOptions.enabled = false;
        return defaultedOptions;
      }
      /**
      * The mutation counterpart of {@link QueryClient#defaultQueryOptions}. Called by framework
      * adapters (e.g. inside `useMutation`) to merge the client's `defaultOptions.mutations`, then
      * `queryClient.setMutationDefaults` for the given `mutationKey`, then the caller's options on
      * top. A no-op if the options are already defaulted (`_defaulted: true`).
      * @param options - The mutation options passed by the caller.
      * @returns The defaulted options.
      */
      defaultMutationOptions(options) {
        if (options?._defaulted) return options;
        return {
          ...this.#defaultOptions.mutations,
          ...options?.mutationKey && this.getMutationDefaults(options.mutationKey),
          ...options,
          _defaulted: true
        };
      }
      /**
      * Clears both the query cache and the mutation cache this client is connected to.
      * @example
      * ```ts
      * import { QueryClient } from '@tanstack/query-core'
      *
      * const queryClient = new QueryClient()
      * queryClient.clear()
      * ```
      */
      clear() {
        this.#queryCache.clear();
        this.#mutationCache.clear();
      }
    };
  }
});

// node_modules/@tanstack/query-core/build/modern/index.js
var init_modern = __esm({
  "node_modules/@tanstack/query-core/build/modern/index.js"() {
    init_utils();
    init_notifyManager();
    init_queryObserver();
    init_infiniteQueryObserver();
    init_queryClient();
  }
});

// node_modules/@tanstack/react-query/build/modern/IsRestoringProvider.js
var React2, IsRestoringContext, useIsRestoring, IsRestoringProvider;
var init_IsRestoringProvider = __esm({
  "node_modules/@tanstack/react-query/build/modern/IsRestoringProvider.js"() {
    "use client";
    React2 = __toESM(require("react"), 1);
    IsRestoringContext = React2.createContext(false);
    useIsRestoring = () => React2.useContext(IsRestoringContext);
    IsRestoringProvider = IsRestoringContext.Provider;
  }
});

// node_modules/@tanstack/react-query/build/modern/QueryErrorResetBoundary.js
function createValue() {
  let isReset = false;
  return {
    /**
    * Clears the reset state, so queries know not to try again until the boundary is reset again.
    */
    clearReset: () => {
      isReset = false;
    },
    /**
    * Resets any query errors within the boundary, so queries know they can try again.
    */
    reset: () => {
      isReset = true;
    },
    /**
    * Returns whether the boundary has been reset and not yet cleared.
    * @returns `true` if the boundary has been reset and not yet cleared.
    */
    isReset: () => {
      return isReset;
    }
  };
}
var React3, import_jsx_runtime2, QueryErrorResetBoundaryContext, useQueryErrorResetBoundary;
var init_QueryErrorResetBoundary = __esm({
  "node_modules/@tanstack/react-query/build/modern/QueryErrorResetBoundary.js"() {
    "use client";
    React3 = __toESM(require("react"), 1);
    import_jsx_runtime2 = require("react/jsx-runtime");
    QueryErrorResetBoundaryContext = React3.createContext(createValue());
    useQueryErrorResetBoundary = () => React3.useContext(QueryErrorResetBoundaryContext);
  }
});

// node_modules/@tanstack/react-query/build/modern/errorBoundaryUtils.js
var React4, ensurePreventErrorBoundaryRetry, useClearResetErrorBoundary, getHasError;
var init_errorBoundaryUtils = __esm({
  "node_modules/@tanstack/react-query/build/modern/errorBoundaryUtils.js"() {
    "use client";
    React4 = __toESM(require("react"), 1);
    init_modern();
    ensurePreventErrorBoundaryRetry = (options, errorResetBoundary, query) => {
      const throwOnError = query?.state.status === "error" && typeof options.throwOnError === "function" ? shouldThrowError(options.throwOnError, [query.state.error, query]) : options.throwOnError;
      if (options.suspense || throwOnError) {
        if (!errorResetBoundary.isReset()) options.retryOnMount = false;
      }
    };
    useClearResetErrorBoundary = (errorResetBoundary) => {
      React4.useEffect(() => {
        errorResetBoundary.clearReset();
      }, [errorResetBoundary]);
    };
    getHasError = ({ result, errorResetBoundary, throwOnError, query, suspense }) => {
      return result.isError && !errorResetBoundary.isReset() && !result.isFetching && query && (suspense && result.data === void 0 || shouldThrowError(throwOnError, [result.error, query]));
    };
  }
});

// node_modules/@tanstack/react-query/build/modern/suspense.js
var ensureSuspenseTimers, shouldSuspend, fetchOptimistic;
var init_suspense = __esm({
  "node_modules/@tanstack/react-query/build/modern/suspense.js"() {
    ensureSuspenseTimers = (defaultedOptions) => {
      if (defaultedOptions.suspense) {
        const MIN_SUSPENSE_TIME_MS = 1e3;
        const clamp = (value) => value === "static" ? value : Math.max(value ?? MIN_SUSPENSE_TIME_MS, MIN_SUSPENSE_TIME_MS);
        const originalStaleTime = defaultedOptions.staleTime;
        defaultedOptions.staleTime = typeof originalStaleTime === "function" ? (...args) => clamp(originalStaleTime(...args)) : clamp(originalStaleTime);
        if (typeof defaultedOptions.gcTime === "number") defaultedOptions.gcTime = Math.max(defaultedOptions.gcTime, MIN_SUSPENSE_TIME_MS);
      }
    };
    shouldSuspend = (defaultedOptions, result) => defaultedOptions?.suspense && result.isPending;
    fetchOptimistic = (defaultedOptions, observer, errorResetBoundary) => observer.fetchOptimistic(defaultedOptions).catch(() => {
      errorResetBoundary.clearReset();
    });
  }
});

// node_modules/@tanstack/react-query/build/modern/useBaseQuery.js
function useBaseQuery(options, Observer, queryClient2) {
  if (false) {
    if (typeof options !== "object" || Array.isArray(options)) throw new Error('Bad argument type. Starting with v5, only the "Object" form is allowed when calling query related functions. Please use the error stack to find the culprit call. More info here: https://tanstack.com/query/latest/docs/react/guides/migrating-to-v5#supports-a-single-signature-one-object');
  }
  const isRestoring = useIsRestoring();
  const errorResetBoundary = useQueryErrorResetBoundary();
  const client = useQueryClient(queryClient2);
  const defaultedOptions = client.defaultQueryOptions(options);
  const query = client.getQueryCache().get(defaultedOptions.queryHash);
  if (false) {
    if (!defaultedOptions.queryFn) console.error(`[${defaultedOptions.queryHash}]: No queryFn was passed as an option, and no default queryFn was found. The queryFn parameter is only optional when using a default queryFn. More info here: https://tanstack.com/query/latest/docs/framework/react/guides/default-query-function`);
  }
  const subscribed = options.subscribed !== false;
  defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : subscribed ? "optimistic" : void 0;
  ensureSuspenseTimers(defaultedOptions);
  ensurePreventErrorBoundaryRetry(defaultedOptions, errorResetBoundary, query);
  useClearResetErrorBoundary(errorResetBoundary);
  const [observer] = React5.useState(() => new Observer(client, defaultedOptions));
  const result = observer.getOptimisticResult(defaultedOptions);
  const shouldSubscribe = !isRestoring && subscribed;
  React5.useSyncExternalStore(React5.useCallback((onStoreChange) => {
    const unsubscribe = shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop;
    observer.updateResult();
    return unsubscribe;
  }, [observer, shouldSubscribe]), () => observer.getCurrentResult(), () => observer.getCurrentResult());
  React5.useEffect(() => {
    observer.setOptions(defaultedOptions);
  }, [defaultedOptions, observer]);
  if (shouldSuspend(defaultedOptions, result)) throw fetchOptimistic(defaultedOptions, observer, errorResetBoundary);
  if (getHasError({
    result,
    errorResetBoundary,
    throwOnError: defaultedOptions.throwOnError,
    query,
    suspense: defaultedOptions.suspense
  })) throw result.error;
  return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}
var React5;
var init_useBaseQuery = __esm({
  "node_modules/@tanstack/react-query/build/modern/useBaseQuery.js"() {
    "use client";
    init_QueryClientProvider();
    init_IsRestoringProvider();
    init_QueryErrorResetBoundary();
    init_errorBoundaryUtils();
    init_suspense();
    React5 = __toESM(require("react"), 1);
    init_modern();
  }
});

// node_modules/@tanstack/react-query/build/modern/useQuery.js
function useQuery(options, queryClient2) {
  return useBaseQuery(options, QueryObserver, queryClient2);
}
var init_useQuery = __esm({
  "node_modules/@tanstack/react-query/build/modern/useQuery.js"() {
    "use client";
    init_useBaseQuery();
    init_modern();
  }
});

// node_modules/@tanstack/react-query/build/modern/useInfiniteQuery.js
function useInfiniteQuery(options, queryClient2) {
  return useBaseQuery(options, InfiniteQueryObserver, queryClient2);
}
var init_useInfiniteQuery = __esm({
  "node_modules/@tanstack/react-query/build/modern/useInfiniteQuery.js"() {
    "use client";
    init_useBaseQuery();
    init_modern();
  }
});

// node_modules/@tanstack/react-query/build/modern/index.js
var init_modern2 = __esm({
  "node_modules/@tanstack/react-query/build/modern/index.js"() {
    init_QueryClientProvider();
    init_useQuery();
    init_useInfiniteQuery();
    init_modern();
  }
});

// src/client/i18n.ts
var i18n_exports = {};
__export(i18n_exports, {
  formatDate: () => formatDate,
  language: () => language,
  setLanguage: () => setLanguage,
  t: () => t,
  useLanguage: () => useLanguage
});
function detect() {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === "en" || stored === "zh") return stored;
  } catch {
  }
  return typeof navigator !== "undefined" && /^zh/i.test(navigator.language) ? "zh" : "en";
}
function language() {
  return current;
}
function setLanguage(next) {
  current = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
  }
  listeners.forEach((listener) => listener());
}
function useLanguage() {
  return (0, import_react.useSyncExternalStore)(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
    () => current
  );
}
function t(text, params) {
  const value = current === "zh" ? ZH[text] ?? text : text;
  if (!params) return value;
  return value.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? ""));
}
function formatDate(value, mode = "short") {
  if (value === void 0 || value === "") return "";
  const date = new Date(typeof value === "number" ? value < 1e12 ? value * 1e3 : value : value);
  if (Number.isNaN(date.getTime())) return "";
  const locale = current === "zh" ? "zh-CN" : "en-US";
  if (mode === "long") return date.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
  return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
}
var import_react, KEY, listeners, current, ZH;
var init_i18n = __esm({
  "src/client/i18n.ts"() {
    "use strict";
    import_react = require("react");
    KEY = "dsh-gitlab-panel.lang";
    listeners = /* @__PURE__ */ new Set();
    current = detect();
    ZH = {
      "GitLab": "GitLab",
      "Changes": "\u53D8\u66F4",
      "History": "\u5386\u53F2",
      "Merge requests": "\u5408\u5E76\u8BF7\u6C42",
      "Issues": "\u8BAE\u9898",
      "Branches": "\u5206\u652F",
      "Activity": "\u6D3B\u52A8",
      "Inbox": "\u6536\u4EF6\u7BB1",
      "Pipelines": "\u6D41\u6C34\u7EBF",
      "Settings": "\u8BBE\u7F6E",
      "Refresh": "\u5237\u65B0",
      "Fetch": "\u83B7\u53D6",
      "Pull": "\u62C9\u53D6",
      "Push": "\u63A8\u9001",
      "Publish": "\u53D1\u5E03",
      "Commit": "\u63D0\u4EA4",
      "Commit all": "\u63D0\u4EA4\u5168\u90E8",
      "Commit & push": "\u63D0\u4EA4\u5E76\u63A8\u9001",
      "Amend": "\u4FEE\u8865",
      "Stage": "\u6682\u5B58",
      "Unstage": "\u53D6\u6D88\u6682\u5B58",
      "Discard": "\u4E22\u5F03",
      "Discard\u2026": "\u4E22\u5F03\u2026",
      "Stash": "\u6682\u5B58\u5DE5\u4F5C\u533A",
      "Pop stash": "\u6062\u590D\u6682\u5B58\u5DE5\u4F5C\u533A",
      "New branch": "\u65B0\u5EFA\u5206\u652F",
      "Create merge request": "\u521B\u5EFA\u5408\u5E76\u8BF7\u6C42",
      "Force push": "\u5F3A\u5236\u63A8\u9001",
      "Open on GitLab": "\u5728 GitLab \u6253\u5F00",
      "New issue": "\u65B0\u5EFA\u8BAE\u9898",
      "Copy hash": "\u590D\u5236\u54C8\u5E0C",
      "Checkout": "\u68C0\u51FA",
      "New branch from here": "\u4ECE\u6B64\u5904\u65B0\u5EFA\u5206\u652F",
      "Cherry-pick": "\u62E3\u9009",
      "Revert": "\u8FD8\u539F",
      "Merge into current": "\u5408\u5E76\u5230\u5F53\u524D\u5206\u652F",
      "Rebase onto": "\u53D8\u57FA\u5230\u6B64\u5206\u652F",
      "Delete": "\u5220\u9664",
      "Clean up\u2026": "\u6E05\u7406\u2026",
      "Search": "\u641C\u7D22",
      "Filter": "\u7B5B\u9009",
      "Sort": "\u6392\u5E8F",
      "Saved searches": "\u5DF2\u4FDD\u5B58\u7684\u641C\u7D22",
      "Save search": "\u4FDD\u5B58\u641C\u7D22",
      "Forget a saved search": "\u5220\u9664\u5DF2\u4FDD\u5B58\u7684\u641C\u7D22",
      "Saved replies": "\u5E38\u7528\u56DE\u590D",
      "All open": "\u5168\u90E8\u672A\u5173\u95ED",
      "Assigned to me": "\u5206\u914D\u7ED9\u6211",
      "Created by me": "\u6211\u521B\u5EFA\u7684",
      "Review requested": "\u5F85\u6211\u8BC4\u5BA1",
      "Drafts": "\u8349\u7A3F",
      "Recently merged": "\u6700\u8FD1\u5408\u5E76",
      "Unassigned": "\u672A\u5206\u914D",
      "Recently closed": "\u6700\u8FD1\u5173\u95ED",
      "Newest": "\u6700\u65B0",
      "Oldest": "\u6700\u65E9",
      "Recently updated": "\u6700\u8FD1\u66F4\u65B0",
      "Most commented": "\u8BC4\u8BBA\u6700\u591A",
      "Clear filters": "\u6E05\u9664\u7B5B\u9009",
      "Close": "\u5173\u95ED",
      "Close with a comment": "\u5E26\u8BC4\u8BBA\u5173\u95ED",
      "Reopen": "\u91CD\u65B0\u6253\u5F00",
      "Comment": "\u8BC4\u8BBA",
      "Comment\u2026": "\u8BC4\u8BBA\u2026",
      "Approve": "\u6279\u51C6",
      "Request changes": "\u8BF7\u6C42\u4FEE\u6539",
      "Submit review": "\u63D0\u4EA4\u8BC4\u5BA1",
      "Add to chat": "\u6DFB\u52A0\u5230\u5BF9\u8BDD",
      "Start working": "\u5F00\u59CB\u5904\u7406",
      "Ask agent": "\u8BE2\u95EE Agent",
      "Ask agent about these": "\u5C31\u6B64\u8BE2\u95EE Agent",
      "Triage with agent": "Agent \u6279\u91CF\u5206\u8BCA",
      "Pre-review with agent": "Agent \u9884\u8BC4\u5BA1",
      "Files": "\u6587\u4EF6",
      "Checks": "\u68C0\u67E5",
      "Checks & pipelines": "\u68C0\u67E5\u4E0E\u6D41\u6C34\u7EBF",
      "Overview": "\u6982\u89C8",
      "Description": "\u63CF\u8FF0",
      "Comments": "\u8BC4\u8BBA",
      "Commits": "\u63D0\u4EA4",
      "Unpushed commits": "\u672A\u63A8\u9001\u63D0\u4EA4",
      "Undo last commit": "\u64A4\u9500\u4E0A\u6B21\u63D0\u4EA4",
      "Continue": "\u7EE7\u7EED",
      "Abort": "\u4E2D\u6B62",
      "Retry": "\u91CD\u8BD5",
      "Cancel": "\u53D6\u6D88",
      "Run": "\u8FD0\u884C",
      "Jobs": "\u4F5C\u4E1A",
      "Log": "\u65E5\u5FD7",
      "Failed first": "\u5931\u8D25\u4F18\u5148",
      "Mark all read": "\u5168\u90E8\u6807\u4E3A\u5DF2\u8BFB",
      "Group by project": "\u6309\u9879\u76EE\u5206\u7EC4",
      "No changes": "\u6CA1\u6709\u53D8\u66F4",
      "No merge requests": "\u6CA1\u6709\u5408\u5E76\u8BF7\u6C42",
      "No issues": "\u6CA1\u6709\u8BAE\u9898",
      "No commits": "\u6CA1\u6709\u63D0\u4EA4",
      "Loading\u2026": "\u52A0\u8F7D\u4E2D\u2026",
      "Approve all": "\u5168\u90E8\u6279\u51C6",
      "Skip": "\u8DF3\u8FC7",
      "Edit": "\u7F16\u8F91",
      "Save": "\u4FDD\u5B58",
      "Undo": "\u64A4\u9500",
      "Auto-run": "\u81EA\u52A8\u6267\u884C",
      // AgentStatus is lowercase; t(action.status) in Agent activity reads these, not the words above.
      "proposed": "\u5F85\u6279\u51C6",
      "approved": "\u5DF2\u6279\u51C6",
      "done": "\u5DF2\u5B8C\u6210",
      "undone": "\u5DF2\u64A4\u9500",
      "Draft review": "\u8BC4\u5BA1\u8349\u7A3F",
      "Discard draft": "\u4E22\u5F03\u8349\u7A3F",
      "Submit": "\u63D0\u4EA4",
      "Approve and submit": "\u6279\u51C6\u5E76\u63D0\u4EA4",
      "Add comment": "\u6DFB\u52A0\u8BC4\u8BBA",
      "Resolve": "\u89E3\u51B3",
      "Resolved": "\u5DF2\u89E3\u51B3",
      "Outdated": "\u5DF2\u8FC7\u671F",
      "Reply\u2026": "\u56DE\u590D\u2026",
      "Viewed": "\u5DF2\u67E5\u770B",
      "Collapse all": "\u5168\u90E8\u6298\u53E0",
      "Unfold all": "\u5168\u90E8\u5C55\u5F00",
      "Fold long content": "\u6298\u53E0\u957F\u5185\u5BB9",
      "Show more": "\u5C55\u5F00",
      "Show less": "\u6536\u8D77",
      "Compact rows": "\u7D27\u51D1\u884C",
      "Comfortable rows": "\u8212\u9002\u884C",
      "Header chip": "\u4F1A\u8BDD\u5934\u6807\u7B7E",
      "Default branch": "\u9ED8\u8BA4\u5206\u652F",
      "Base branch": "\u76EE\u6807\u5206\u652F",
      "Branch name": "\u5206\u652F\u540D",
      "Title": "\u6807\u9898",
      "Body": "\u6B63\u6587",
      "Labels": "\u6807\u7B7E",
      "Assignees": "\u8D1F\u8D23\u4EBA",
      "Reviewers": "\u8BC4\u5BA1\u4EBA",
      "Milestone": "\u91CC\u7A0B\u7891",
      "None": "\u65E0",
      "Apply": "\u5E94\u7528",
      "Remove": "\u79FB\u9664",
      "Add": "\u6DFB\u52A0",
      "Create": "\u521B\u5EFA",
      "Start": "\u5F00\u59CB",
      "Rules": "\u89C4\u5219",
      "Batch size": "\u6BCF\u6279\u6570\u91CF",
      "New worktree": "\u65B0\u5DE5\u4F5C\u6811",
      "This checkout": "\u5F53\u524D\u68C0\u51FA",
      "Where": "\u4F4D\u7F6E",
      "Open settings": "\u6253\u5F00\u8BBE\u7F6E",
      "Glab token or glab login is required": "\u9700\u8981 GitLab Token \u6216 glab \u767B\u5F55",
      "No GitLab remote found for this repository.": "\u8BE5\u4ED3\u5E93\u672A\u627E\u5230 GitLab \u8FDC\u7A0B\u5730\u5740\u3002",
      "This session has no working directory.": "\u8BE5\u4F1A\u8BDD\u6CA1\u6709\u5DE5\u4F5C\u76EE\u5F55\u3002",
      "Working\u2026": "\u5904\u7406\u4E2D\u2026",
      "Copy": "\u590D\u5236",
      "Copied": "\u5DF2\u590D\u5236",
      "Loading diff\u2026": "\u52A0\u8F7D\u5DEE\u5F02\u2026",
      "No diff": "\u65E0\u5DEE\u5F02",
      "Pull request": "\u5408\u5E76\u8BF7\u6C42",
      "Issue": "\u8BAE\u9898",
      "Merged": "\u5DF2\u5408\u5E76",
      "Closed": "\u5DF2\u5173\u95ED",
      "Open": "\u5F00\u542F",
      "Draft": "\u8349\u7A3F",
      "Pipeline": "\u6D41\u6C34\u7EBF",
      "Canceled": "\u5DF2\u53D6\u6D88",
      "Skipped": "\u5DF2\u8DF3\u8FC7",
      // GitLab hands back pipeline and job statuses lowercased, and t(run.status) looks them up as they arrive.
      "created": "\u5DF2\u521B\u5EFA",
      "waiting_for_resource": "\u7B49\u5F85\u8D44\u6E90",
      "preparing": "\u51C6\u5907\u4E2D",
      "pending": "\u7B49\u5F85\u4E2D",
      "running": "\u8FD0\u884C\u4E2D",
      "success": "\u6210\u529F",
      "failed": "\u5931\u8D25",
      "canceled": "\u5DF2\u53D6\u6D88",
      "cancelled": "\u5DF2\u53D6\u6D88",
      "scheduled": "\u5DF2\u6392\u671F",
      "manual": "\u624B\u52A8",
      "skipped": "\u5DF2\u8DF3\u8FC7",
      "Summary": "\u6458\u8981",
      "Verdict": "\u7ED3\u8BBA",
      "Approve MR": "\u6279\u51C6 MR",
      "Request changes on MR": "\u8BF7\u6C42\u4FEE\u6539 MR",
      "Comment only": "\u4EC5\u8BC4\u8BBA",
      "Submit anyway": "\u4ECD\u7136\u63D0\u4EA4",
      "Lines moved": "\u884C\u4F4D\u7F6E\u5DF2\u53D8\u5316",
      "New commits since drafted": "\u8D77\u8349\u540E\u5DF2\u6709\u65B0\u63D0\u4EA4",
      "Your review draft is stored until you submit it.": "\u8BC4\u5BA1\u8349\u7A3F\u4F1A\u4FDD\u5B58\u5230\u4F60\u63D0\u4EA4\u4E3A\u6B62\u3002",
      "Agent actions": "Agent \u64CD\u4F5C",
      "Nothing waiting": "\u6CA1\u6709\u5F85\u5904\u7406\u9879",
      "Triage": "\u5206\u8BCA",
      "Review": "\u8BC4\u5BA1",
      "Ask": "\u8BE2\u95EE",
      "About this repository": "\u5173\u4E8E\u6B64\u4ED3\u5E93",
      "Token & requirements": "Token \u4E0E\u4F9D\u8D56",
      "The panel needs git on the host. GitLab data needs GITLAB_TOKEN or glab auth login.": "\u9762\u677F\u9700\u8981\u5BBF\u4E3B\u673A\u4E0A\u7684 git\u3002GitLab \u6570\u636E\u9700\u8981 GITLAB_TOKEN \u6216\u6267\u884C glab auth login\u3002",
      "Language": "\u8BED\u8A00",
      "Appearance": "\u5916\u89C2",
      "Search issues and merge requests\u2026": "\u641C\u7D22\u8BAE\u9898\u548C\u5408\u5E76\u8BF7\u6C42\u2026",
      "Type / for qualifiers": "\u8F93\u5165 / \u67E5\u770B\u9650\u5B9A\u7B26",
      "Review requested from you": "\u8BF7\u6C42\u4F60\u8BC4\u5BA1",
      "Assigned to you": "\u5206\u914D\u7ED9\u4F60",
      "Created by you": "\u7531\u4F60\u521B\u5EFA",
      "Notifications": "\u901A\u77E5",
      "Todos": "\u5F85\u529E",
      "Mark read": "\u6807\u4E3A\u5DF2\u8BFB",
      "All todos": "\u5168\u90E8\u5F85\u529E",
      "No notifications": "\u6CA1\u6709\u901A\u77E5",
      "Approve pending proposals": "\u6279\u51C6\u5F85\u5904\u7406\u63D0\u8BAE",
      "Agent proposed changes": "Agent \u63D0\u8BAE\u4E86\u66F4\u6539",
      "Files changed": "\u53D8\u66F4\u6587\u4EF6",
      "Additions": "\u65B0\u589E",
      "Deletions": "\u5220\u9664",
      "Merge": "\u5408\u5E76",
      "Squash": "\u538B\u7F29\u5408\u5E76",
      "Delete source branch": "\u5220\u9664\u6E90\u5206\u652F",
      "Checking out\u2026": "\u6B63\u5728\u68C0\u51FA\u2026",
      "Start a session with this issue": "\u4EE5\u6B64\u8BAE\u9898\u542F\u52A8\u4F1A\u8BDD",
      "Quoted from GitLab": "\u5F15\u7528\u81EA GitLab",
      "Session started": "\u4F1A\u8BDD\u5DF2\u542F\u52A8",
      "Open session": "\u6253\u5F00\u4F1A\u8BDD",
      "No project selected": "\u672A\u9009\u62E9\u9879\u76EE",
      "This project is read-only": "\u8BE5\u9879\u76EE\u53EA\u8BFB",
      "Show in GitLab": "\u5728 GitLab \u67E5\u770B",
      "Copy link": "\u590D\u5236\u94FE\u63A5",
      "Copy reference": "\u590D\u5236\u5F15\u7528",
      "The review was submitted": "\u8BC4\u5BA1\u5DF2\u63D0\u4EA4",
      "Review submitted": "\u8BC4\u5BA1\u5DF2\u63D0\u4EA4",
      "You wrote this merge request, so GitLab will not record a verdict from you.": "\u8FD9\u4E2A\u5408\u5E76\u8BF7\u6C42\u662F\u4F60\u521B\u5EFA\u7684\uFF0CGitLab \u4E0D\u4F1A\u8BB0\u5F55\u4F60\u81EA\u5DF1\u7684\u7ED3\u8BBA\u3002",
      "Changes requested": "\u5DF2\u8BF7\u6C42\u4FEE\u6539",
      "Approved": "\u5DF2\u6279\u51C6",
      "Refresh failed": "\u5237\u65B0\u5931\u8D25",
      "Error": "\u51FA\u9519\u4E86",
      "Confirm": "\u786E\u8BA4",
      "More": "\u66F4\u591A",
      "Back": "\u8FD4\u56DE",
      "Dismiss": "\u5FFD\u7565",
      "All": "\u5168\u90E8",
      "Auto": "\u81EA\u52A8",
      "Name": "\u540D\u79F0",
      "Reason": "\u539F\u56E0",
      "State": "\u72B6\u6001",
      "Source": "\u6765\u6E90",
      "Label": "\u6807\u7B7E",
      "Assign": "\u5206\u914D",
      "Select": "\u9009\u62E9",
      "Reply": "\u56DE\u590D",
      "Saved": "\u5DF2\u4FDD\u5B58",
      "Not found": "\u672A\u627E\u5230",
      "Missing": "\u7F3A\u5931",
      "Connected": "\u5DF2\u8FDE\u63A5",
      "Compact": "\u7D27\u51D1",
      "Current": "\u5F53\u524D",
      "Local": "\u672C\u5730",
      "Remote": "\u8FDC\u7A0B",
      "Recent": "\u6700\u8FD1",
      "Detached": "\u6E38\u79BB HEAD",
      "Conflicts": "\u51B2\u7A81",
      "Untracked": "\u672A\u8DDF\u8E2A",
      "ahead": "\u9886\u5148",
      "gone": "\u5DF2\u5220\u9664",
      "no upstream": "\u65E0\u4E0A\u6E38\u5206\u652F",
      "on": "\u5F00",
      "off": "\u5173",
      "you": "\u4F60",
      "shell": "\u547D\u4EE4",
      "close": "\u5173\u95ED",
      "edited": "\u5DF2\u7F16\u8F91",
      "edited by you": "\u4F60\u5DF2\u7F16\u8F91",
      "selected": "\u5DF2\u9009\u62E9",
      "unread": "\u672A\u8BFB",
      "commits": "\u63D0\u4EA4",
      "issues": "\u8BAE\u9898",
      "issue": "\u8BAE\u9898",
      "merge requests": "\u5408\u5E76\u8BF7\u6C42",
      "merge request": "\u5408\u5E76\u8BF7\u6C42",
      "MRs": "\u5408\u5E76\u8BF7\u6C42",
      "files changed": "\u4E2A\u6587\u4EF6\u53D8\u66F4",
      "inline comments": "\u6761\u884C\u5185\u8BC4\u8BBA",
      "to approve": "\u5F85\u6279\u51C6",
      "reviewed": "\u5DF2\u8BC4\u5BA1",
      "nothing to change": "\u65E0\u9700\u53D8\u66F4",
      "{count} items": "{count} \u9879",
      "completed": "\u5DF2\u5B8C\u6210",
      "not_planned": "\u4E0D\u4E88\u5904\u7406",
      "duplicate": "\u91CD\u590D",
      "merge": "\u5408\u5E76",
      "rebase": "\u53D8\u57FA",
      "am": "\u5E94\u7528\u8865\u4E01",
      "cherry-pick": "\u62E3\u9009",
      "revert": "\u8FD8\u539F",
      "{operation} in progress": "{operation}\u8FDB\u884C\u4E2D",
      "Abort the operation?": "\u8981\u4E2D\u6B62\u8BE5\u64CD\u4F5C\u5417\uFF1F",
      "Ready to merge": "\u53EF\u4EE5\u5408\u5E76",
      "Merge conflicts": "\u5B58\u5728\u5408\u5E76\u51B2\u7A81",
      "Waiting on the pipeline": "\u7B49\u5F85\u6D41\u6C34\u7EBF",
      "Discussions to resolve": "\u6709\u8BA8\u8BBA\u5F85\u89E3\u51B3",
      "Still a draft": "\u4ECD\u662F\u8349\u7A3F",
      "Needs approval": "\u9700\u8981\u6279\u51C6",
      "Blocked": "\u5DF2\u88AB\u963B\u6B62",
      "Checking mergeability": "\u6B63\u5728\u68C0\u67E5\u53EF\u5408\u5E76\u6027",
      "Least recently updated": "\u6700\u4E45\u672A\u66F4\u65B0",
      "Priority": "\u4F18\u5148\u7EA7",
      "Branch created": "\u5206\u652F\u5DF2\u521B\u5EFA",
      "Start point": "\u8D77\u70B9",
      "Checkout after creating": "\u521B\u5EFA\u540E\u68C0\u51FA",
      "Merge request created": "\u5408\u5E76\u8BF7\u6C42\u5DF2\u521B\u5EFA",
      "Pull request template is available": "\u6709\u53EF\u7528\u7684\u5408\u5E76\u8BF7\u6C42\u6A21\u677F",
      "Create as draft": "\u521B\u5EFA\u4E3A\u8349\u7A3F",
      "Insert template": "\u63D2\u5165\u6A21\u677F",
      "Issue created": "\u8BAE\u9898\u5DF2\u521B\u5EFA",
      "Close {count} items": "\u5173\u95ED {count} \u9879",
      "Close {item}": "\u5173\u95ED {item}",
      "Queued {count} close actions": "\u5DF2\u6392\u961F {count} \u4E2A\u5173\u95ED\u64CD\u4F5C",
      "Skipped {count}": "\u5DF2\u8DF3\u8FC7 {count} \u9879",
      "Closing {count} items asks first and runs one at a time; each can be undone from Agent activity.": "\u5173\u95ED {count} \u9879\u4F1A\u5148\u5F81\u6C42\u786E\u8BA4\u5E76\u9010\u4E2A\u6267\u884C\uFF1B\u6BCF\u4E00\u9879\u90FD\u53EF\u4EE5\u5728 Agent \u6D3B\u52A8\u4E2D\u64A4\u9500\u3002",
      "Completed": "\u5DF2\u5B8C\u6210",
      "Not planned": "\u4E0D\u4E88\u5904\u7406",
      "Duplicate": "\u91CD\u590D",
      "Duplicate of": "\u91CD\u590D\u4E8E",
      "Add labels": "\u6DFB\u52A0\u6807\u7B7E",
      "Remove labels": "\u79FB\u9664\u6807\u7B7E",
      "Add assignees": "\u6DFB\u52A0\u8D1F\u8D23\u4EBA",
      "Remove assignees": "\u79FB\u9664\u8D1F\u8D23\u4EBA",
      "Comma-separated": "\u4EE5\u9017\u53F7\u5206\u9694",
      "Comment (optional)": "\u8BC4\u8BBA\uFF08\u53EF\u9009\uFF09",
      "Saved replies\u2026": "\u5E38\u7528\u56DE\u590D\u2026",
      "GitLab closes without a reason; a duplicate link is added as a comment, and your comment is posted first.": "GitLab \u5173\u95ED\u65F6\u4E0D\u5E26\u539F\u56E0\uFF1B\u91CD\u590D\u9879\u4F1A\u4F5C\u4E3A\u8BC4\u8BBA\u9644\u4E0A\u94FE\u63A5\uFF0C\u4F60\u7684\u8BC4\u8BBA\u4F1A\u5148\u53D1\u51FA\u3002",
      "Comment on {count} items": "\u8BC4\u8BBA {count} \u9879",
      "Queued {count} comments": "\u5DF2\u6392\u961F {count} \u6761\u8BC4\u8BBA",
      "Comment posted": "\u8BC4\u8BBA\u5DF2\u53D1\u5E03",
      "Markdown is supported.": "\u652F\u6301 Markdown\u3002",
      "Markdown is supported. \u2318\u23CE posts.": "\u652F\u6301 Markdown\u3002\u2318\u23CE \u53D1\u5E03\u3002",
      "Save as reply": "\u4FDD\u5B58\u4E3A\u5E38\u7528\u56DE\u590D",
      "Add assignee\u2026": "\u6DFB\u52A0\u8D1F\u8D23\u4EBA\u2026",
      "Add reviewer\u2026": "\u6DFB\u52A0\u8BC4\u5BA1\u4EBA\u2026",
      "Merge !{number}?": "\u5408\u5E76 !{number}\uFF1F",
      "Merge\u2026": "\u5408\u5E76\u2026",
      "Squash commits": "\u538B\u7F29\u63D0\u4EA4",
      "GitLab merges with the project's merge method; the pipeline must pass unless the project allows otherwise.": "GitLab \u6309\u9879\u76EE\u7684\u5408\u5E76\u65B9\u5F0F\u6267\u884C\uFF1B\u9664\u975E\u9879\u76EE\u53E6\u6709\u5141\u8BB8\uFF0C\u6D41\u6C34\u7EBF\u5FC5\u987B\u901A\u8FC7\u3002",
      "Branch created, but the session did not start": "\u5206\u652F\u5DF2\u521B\u5EFA\uFF0C\u4F46\u4F1A\u8BDD\u672A\u80FD\u542F\u52A8",
      "The prompt is on the clipboard.": "\u63D0\u793A\u8BCD\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F\u3002",
      "This branch is already checked out in another work tree; the agent starts there.": "\u8BE5\u5206\u652F\u5DF2\u5728\u53E6\u4E00\u4E2A\u5DE5\u4F5C\u6811\u4E2D\u68C0\u51FA\uFF1BAgent \u4F1A\u5728\u90A3\u91CC\u542F\u52A8\u3002",
      "This is the current branch; the agent starts in this checkout.": "\u8FD9\u662F\u5F53\u524D\u5206\u652F\uFF1BAgent \u4F1A\u5728\u8FD9\u4E2A\u68C0\u51FA\u4E2D\u542F\u52A8\u3002",
      "Start from": "\u8D77\u59CB\u4E8E",
      "Current HEAD": "\u5F53\u524D HEAD",
      "A separate folder; this checkout and its changes stay as they are": "\u5355\u72EC\u7684\u6587\u4EF6\u5939\uFF1B\u5F53\u524D\u68C0\u51FA\u53CA\u5176\u53D8\u66F4\u4FDD\u6301\u539F\u6837",
      "Switch here, stashing your changes first": "\u5728\u6B64\u5207\u6362\uFF0C\u5E76\u5148\u50A8\u85CF\u4F60\u7684\u53D8\u66F4",
      "This branch already exists and is reused.": "\u8BE5\u5206\u652F\u5DF2\u5B58\u5728\uFF0C\u5C06\u88AB\u590D\u7528\u3002",
      "A new worktree is created next to this repository and the agent starts there.": "\u4F1A\u5728\u672C\u4ED3\u5E93\u65C1\u521B\u5EFA\u4E00\u4E2A\u65B0\u7684\u5DE5\u4F5C\u6811\uFF0CAgent \u5728\u90A3\u91CC\u542F\u52A8\u3002",
      "Your changes are stashed before switching. The agent starts in this checkout.": "\u5207\u6362\u524D\u4F1A\u5148\u50A8\u85CF\u4F60\u7684\u53D8\u66F4\u3002Agent \u5728\u8FD9\u4E2A\u68C0\u51FA\u4E2D\u542F\u52A8\u3002",
      "Triage started": "\u5206\u8BCA\u5DF2\u542F\u52A8",
      "For example: close spam as not planned; label crashes with bug; ask for reproduction steps when the report has none.": "\u4F8B\u5982\uFF1A\u628A\u5783\u573E\u5185\u5BB9\u6309\u300C\u4E0D\u4E88\u5904\u7406\u300D\u5173\u95ED\uFF1B\u7ED9\u5D29\u6E83\u95EE\u9898\u6253\u4E0A bug \u6807\u7B7E\uFF1B\u5BF9\u7F3A\u5C11\u590D\u73B0\u6B65\u9AA4\u7684\u62A5\u544A\u7D22\u53D6\u590D\u73B0\u6B65\u9AA4\u3002",
      "Saved replies to use": "\u8981\u4F7F\u7528\u7684\u5E38\u7528\u56DE\u590D",
      "A new session starts with these rules. Every proposed change waits for your approval; use Agent activity to approve or skip in batches.": "\u4F1A\u4EE5\u8FD9\u4E9B\u89C4\u5219\u542F\u52A8\u4E00\u4E2A\u65B0\u4F1A\u8BDD\u3002\u6BCF\u4E2A\u63D0\u8BAE\u7684\u66F4\u6539\u90FD\u4F1A\u7B49\u5F85\u4F60\u6279\u51C6\uFF1B\u5728 Agent \u6D3B\u52A8\u4E2D\u53EF\u4EE5\u6279\u91CF\u6279\u51C6\u6216\u8DF3\u8FC7\u3002",
      "No saved replies for this repository yet.": "\u8BE5\u4ED3\u5E93\u8FD8\u6CA1\u6709\u5E38\u7528\u56DE\u590D\u3002",
      "New reply": "\u65B0\u5EFA\u56DE\u590D",
      "MR merged": "\u5408\u5E76\u8BF7\u6C42\u5DF2\u5408\u5E76",
      "MR closed": "\u5408\u5E76\u8BF7\u6C42\u5DF2\u5173\u95ED",
      "upstream gone": "\u4E0A\u6E38\u5DF2\u5220\u9664",
      "Finish worktree": "\u6536\u5C3E\u5E76\u79FB\u9664\u5DE5\u4F5C\u6811",
      "Finish and switch to {base}": "\u6536\u5C3E\u5E76\u5207\u6362\u5230 {base}",
      "Switch to {base}, pull it, then delete {branch}?": "\u5207\u6362\u5230 {base}\u3001\u62C9\u53D6\u66F4\u65B0\uFF0C\u7136\u540E\u5220\u9664 {branch}\uFF1F",
      "Remove the worktree at {cwd} and delete {branch}?": "\u79FB\u9664\u4F4D\u4E8E {cwd} \u7684\u5DE5\u4F5C\u6811\u5E76\u5220\u9664 {branch}\uFF1F",
      "{cwd} still has local changes. Remove it anyway? They are lost.": "{cwd} \u4ECD\u6709\u672C\u5730\u53D8\u66F4\u3002\u4ECD\u8981\u79FB\u9664\u5417\uFF1F\u8FD9\u4E9B\u53D8\u66F4\u5C06\u4F1A\u4E22\u5931\u3002",
      "Delete {branch} anyway? !{number} merged, but this branch has commits that are not part of it.": "\u4ECD\u8981\u5220\u9664 {branch} \u5417\uFF1F!{number} \u5DF2\u5408\u5E76\uFF0C\u4F46\u8BE5\u5206\u652F\u4E0A\u8FD8\u6709\u4E0D\u5C5E\u4E8E\u5B83\u7684\u63D0\u4EA4\u3002",
      "Finished {branch}": "{branch} \u5DF2\u6536\u5C3E",
      "Worktree removed": "\u5DE5\u4F5C\u6811\u5DF2\u79FB\u9664",
      "Open the project root": "\u6253\u5F00\u9879\u76EE\u6839\u76EE\u5F55",
      "Mark ready": "\u6807\u8BB0\u4E3A\u5C31\u7EEA",
      "Marked ready": "\u5DF2\u6807\u8BB0\u4E3A\u5C31\u7EEA",
      "closed by this merge": "\u5DF2\u7531\u672C\u6B21\u5408\u5E76\u5173\u95ED",
      "merged into {base}": "\u5DF2\u5408\u5E76\u5230 {base}",
      "unpushed commits": "\u6709\u672A\u63A8\u9001\u7684\u63D0\u4EA4",
      "moved past its MR": "\u5DF2\u8D85\u51FA\u5176\u5408\u5E76\u8BF7\u6C42",
      "not merged": "\u672A\u5408\u5E76",
      "Committed": "\u5DF2\u63D0\u4EA4",
      "Committed and pushed": "\u5DF2\u63D0\u4EA4\u5E76\u63A8\u9001",
      "Clean up branches": "\u6E05\u7406\u5206\u652F",
      "Deleted {count} branches": "\u5DF2\u5220\u9664 {count} \u4E2A\u5206\u652F",
      "Delete {count}": "\u5220\u9664 {count} \u4E2A",
      "No branches look done with.": "\u6CA1\u6709\u770B\u8D77\u6765\u5DF2\u7528\u5B8C\u7684\u5206\u652F\u3002",
      "Branches with unpushed work start unchecked. Branches checked out in a worktree are not listed.": "\u6709\u672A\u63A8\u9001\u63D0\u4EA4\u7684\u5206\u652F\u9ED8\u8BA4\u4E0D\u52FE\u9009\uFF1B\u5DF2\u5728\u67D0\u4E2A\u5DE5\u4F5C\u6811\u4E2D\u68C0\u51FA\u7684\u5206\u652F\u4E0D\u4F1A\u5217\u51FA\u3002",
      "Reopen {count}": "\u91CD\u65B0\u6253\u5F00 {count} \u9879",
      "Reopen {count} items?": "\u91CD\u65B0\u6253\u5F00 {count} \u9879\uFF1F",
      "Queued {count} reopen actions": "\u5DF2\u6392\u961F {count} \u4E2A\u91CD\u65B0\u6253\u5F00\u64CD\u4F5C",
      "Triage these {count} with agent": "\u8BA9 Agent \u5206\u8BCA\u8FD9 {count} \u9879",
      "Took back": "\u5DF2\u6536\u56DE",
      "Undoing\u2026": "\u6B63\u5728\u64A4\u9500\u2026",
      "Retrying.": "\u6B63\u5728\u91CD\u8BD5\u3002",
      "Agent activity": "Agent \u6D3B\u52A8",
      "Run writes at once instead of waiting for approval": "\u7ACB\u5373\u6267\u884C\u5199\u64CD\u4F5C\uFF0C\u800C\u4E0D\u662F\u7B49\u5F85\u6279\u51C6",
      "Auto-run on.": "\u81EA\u52A8\u6267\u884C\u5DF2\u5F00\u542F\u3002",
      "Auto-run off.": "\u81EA\u52A8\u6267\u884C\u5DF2\u5173\u95ED\u3002",
      "batch {count}": "\u7B2C {count} \u6279",
      "Agent writes and your bulk actions appear here. Auto-run is {state}.": "Agent \u7684\u5199\u64CD\u4F5C\u548C\u4F60\u7684\u6279\u91CF\u64CD\u4F5C\u4F1A\u663E\u793A\u5728\u8FD9\u91CC\u3002\u81EA\u52A8\u6267\u884C\uFF1A{state}\u3002",
      "Keys: j/k move \xB7 y approve \xB7 n skip \xB7 e edit \xB7 u undo \xB7 o open \xB7 a approve all": "\u6309\u952E\uFF1Aj/k \u79FB\u52A8 \xB7 y \u6279\u51C6 \xB7 n \u8DF3\u8FC7 \xB7 e \u7F16\u8F91 \xB7 u \u64A4\u9500 \xB7 o \u6253\u5F00 \xB7 a \u5168\u90E8\u6279\u51C6",
      "Added to chat": "\u5DF2\u6DFB\u52A0\u5230\u5BF9\u8BDD",
      "No pipelines": "\u6CA1\u6709\u6D41\u6C34\u7EBF",
      "Retried": "\u5DF2\u91CD\u8BD5",
      "Marked all read": "\u5DF2\u5168\u90E8\u6807\u4E3A\u5DF2\u8BFB",
      "Notifications come from GitLab todos. Opening one marks it read.": "\u901A\u77E5\u6765\u81EA GitLab \u5F85\u529E\u3002\u6253\u5F00\u4E00\u6761\u5373\u6807\u8BB0\u4E3A\u5DF2\u8BFB\u3002",
      "Could not open the GitLab panel": "\u65E0\u6CD5\u6253\u5F00 GitLab \u9762\u677F",
      "Git, merge requests, issues and pipelines": "Git\u3001\u5408\u5E76\u8BF7\u6C42\u3001\u8BAE\u9898\u4E0E\u6D41\u6C34\u7EBF",
      "Open GitLab panel": "\u6253\u5F00 GitLab \u9762\u677F",
      "GitLab panel": "GitLab \u9762\u677F",
      "Git, merge requests, issues and pipelines for this repository": "\u6B64\u4ED3\u5E93\u7684 Git\u3001\u5408\u5E76\u8BF7\u6C42\u3001\u8BAE\u9898\u4E0E\u6D41\u6C34\u7EBF",
      "No item selected.": "\u672A\u9009\u62E9\u6761\u76EE\u3002",
      "No pipeline selected.": "\u672A\u9009\u62E9\u6D41\u6C34\u7EBF\u3002",
      "No commit selected.": "\u672A\u9009\u62E9\u63D0\u4EA4\u3002",
      "A Git and GitLab side panel: branch changes, commit graph, merge requests, issues, pipelines, reviews and agent actions.": "Git \u4E0E GitLab \u4FA7\u8FB9\u9762\u677F\uFF1A\u5206\u652F\u53D8\u66F4\u3001\u63D0\u4EA4\u56FE\u3001\u5408\u5E76\u8BF7\u6C42\u3001\u8BAE\u9898\u3001\u6D41\u6C34\u7EBF\u3001\u8BC4\u5BA1\u4E0E Agent \u64CD\u4F5C\u3002",
      "The host needs git. For GitLab data, set GITLAB_TOKEN to a personal access token with api scope, or run glab auth login on the host.": "\u5BBF\u4E3B\u673A\u9700\u8981 git\u3002\u82E5\u8981\u83B7\u53D6 GitLab \u6570\u636E\uFF0C\u8BF7\u628A GITLAB_TOKEN \u8BBE\u4E3A\u5177\u6709 api \u6743\u9650\u7684\u4E2A\u4EBA\u8BBF\u95EE\u4EE4\u724C\uFF0C\u6216\u5728\u5BBF\u4E3B\u673A\u4E0A\u6267\u884C glab auth login\u3002",
      "Open it from the right sidebar\u2019s + guide, the session header chip, \u2318\u21E7G, or /gitlab.": "\u53EF\u4ECE\u53F3\u4FA7\u8FB9\u680F\u7684 + \u5F15\u5BFC\u3001\u4F1A\u8BDD\u5934\u6807\u7B7E\u3001\u2318\u21E7G \u6216 /gitlab \u6253\u5F00\u3002",
      "Reopened": "\u5DF2\u91CD\u65B0\u6253\u5F00",
      "Checked out": "\u5DF2\u68C0\u51FA",
      "opened {date}": "\u521B\u5EFA\u4E8E {date}",
      "updated {date}": "\u66F4\u65B0\u4E8E {date}",
      "Review required": "\u9700\u8981\u8BC4\u5BA1",
      "No description.": "\u6CA1\u6709\u63CF\u8FF0\u3002",
      "Closes": "\u5C06\u5173\u95ED",
      "Linked merge requests": "\u5173\u8054\u7684\u5408\u5E76\u8BF7\u6C42",
      "Fold all": "\u5168\u90E8\u6298\u53E0",
      "Expand all": "\u5168\u90E8\u5C55\u5F00",
      "No comments yet.": "\u8FD8\u6CA1\u6709\u8BC4\u8BBA\u3002",
      "Edit proposal": "\u7F16\u8F91\u63D0\u8BAE",
      "yours in this session": "\u6765\u81EA\u672C\u4F1A\u8BDD",
      "from another session": "\u6765\u81EA\u5176\u4ED6\u4F1A\u8BDD",
      "Added to the review draft": "\u5DF2\u52A0\u5165\u8BC4\u5BA1\u8349\u7A3F",
      "Click a line's number to start a review draft. Nothing is posted until you submit.": "\u70B9\u51FB\u884C\u53F7\u5373\u53EF\u5F00\u59CB\u8BC4\u5BA1\u8349\u7A3F\u3002\u63D0\u4EA4\u4E4B\u524D\u4E0D\u4F1A\u53D1\u5E03\u4EFB\u4F55\u5185\u5BB9\u3002",
      "New review comment": "\u65B0\u7684\u8BC4\u5BA1\u8BC4\u8BBA",
      "What should change?": "\u5E94\u8BE5\u6539\u4EC0\u4E48\uFF1F",
      "Line {line}": "\u7B2C {line} \u884C",
      "Draft review discarded.": "\u8BC4\u5BA1\u8349\u7A3F\u5DF2\u4E22\u5F03\u3002",
      "Unresolve": "\u6807\u8BB0\u4E3A\u672A\u89E3\u51B3",
      "No pipeline for this merge request.": "\u6B64\u5408\u5E76\u8BF7\u6C42\u6CA1\u6709\u6D41\u6C34\u7EBF\u3002",
      "Pipeline checks come from the MR's head pipeline.": "\u6D41\u6C34\u7EBF\u68C0\u67E5\u6765\u81EA\u8BE5\u5408\u5E76\u8BF7\u6C42\u7684 head \u6D41\u6C34\u7EBF\u3002",
      "Retry this pipeline?": "\u91CD\u8BD5\u8FD9\u6761\u6D41\u6C34\u7EBF\uFF1F",
      "Cancel this pipeline?": "\u53D6\u6D88\u8FD9\u6761\u6D41\u6C34\u7EBF\uFF1F",
      "Click to open in the GitLab panel": "\u70B9\u51FB\u5728 GitLab \u9762\u677F\u4E2D\u6253\u5F00",
      "Help me with this {kind}:": "\u5E2E\u6211\u5904\u7406\u8FD9\u4E2A{kind}\uFF1A",
      "Look at these {count} items:": "\u770B\u770B\u8FD9 {count} \u9879\uFF1A",
      "Not a git repository": "\u4E0D\u662F git \u4ED3\u5E93",
      "GitLab data is available through GITLAB_TOKEN or glab auth login.": "GitLab \u6570\u636E\u901A\u8FC7 GITLAB_TOKEN \u6216 glab auth login \u63D0\u4F9B\u3002",
      "Force push {branch} with --force-with-lease? Commits it replaces are lost.": "\u4F7F\u7528 --force-with-lease \u5F3A\u5236\u63A8\u9001 {branch}\uFF1F\u88AB\u5B83\u66FF\u6362\u7684\u63D0\u4EA4\u5C06\u4F1A\u4E22\u5931\u3002",
      "Stashed": "\u5DF2\u50A8\u85CF",
      "Pop stash ({count})": "\u6062\u590D\u50A8\u85CF\uFF08{count}\uFF09",
      "Stash restored": "\u50A8\u85CF\u5DF2\u6062\u590D",
      "Switch branch": "\u5207\u6362\u5206\u652F",
      "No merge request": "\u6CA1\u6709\u5408\u5E76\u8BF7\u6C42",
      "Resolve the conflicts first": "\u8BF7\u5148\u89E3\u51B3\u51B2\u7A81",
      "Write a commit message first": "\u8BF7\u5148\u586B\u5199\u63D0\u4EA4\u4FE1\u606F",
      "Amending a pushed commit rewrites history. Continue?": "\u4FEE\u8865\u5DF2\u63A8\u9001\u7684\u63D0\u4EA4\u4F1A\u91CD\u5199\u5386\u53F2\u3002\u7EE7\u7EED\u5417\uFF1F",
      "Mark resolved": "\u6807\u8BB0\u4E3A\u5DF2\u89E3\u51B3",
      "Marked resolved": "\u5DF2\u6807\u8BB0\u4E3A\u5DF2\u89E3\u51B3",
      "Mark all resolved": "\u5168\u90E8\u6807\u8BB0\u4E3A\u5DF2\u89E3\u51B3",
      "Mark every conflict resolved to commit.": "\u8BF7\u5148\u89E3\u51B3\u6240\u6709\u51B2\u7A81\u518D\u63D0\u4EA4\u3002",
      "Discard the changes in {path}? This cannot be undone.": "\u4E22\u5F03 {path} \u4E2D\u7684\u53D8\u66F4\uFF1F\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002",
      "Discard the changes in {count} files? This cannot be undone.": "\u4E22\u5F03 {count} \u4E2A\u6587\u4EF6\u4E2D\u7684\u53D8\u66F4\uFF1F\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002",
      "Discarded": "\u5DF2\u4E22\u5F03",
      "The working tree is clean.": "\u5DE5\u4F5C\u533A\u662F\u5E72\u51C0\u7684\u3002",
      "Staged": "\u5DF2\u6682\u5B58",
      "Stage all": "\u5168\u90E8\u6682\u5B58",
      "Unstage all": "\u5168\u90E8\u53D6\u6D88\u6682\u5B58",
      "Discard all": "\u5168\u90E8\u4E22\u5F03",
      "Commit message": "\u63D0\u4EA4\u4FE1\u606F",
      "Pushed": "\u5DF2\u63A8\u9001",
      "Amend is on; write a message or leave it empty to keep the last one.": "\u4FEE\u8865\u5DF2\u5F00\u542F\uFF1B\u586B\u5199\u65B0\u4FE1\u606F\uFF0C\u6216\u7559\u7A7A\u4EE5\u4FDD\u7559\u4E0A\u4E00\u6B21\u7684\u63D0\u4EA4\u4FE1\u606F\u3002",
      "Undo the last commit and keep its changes unstaged?": "\u64A4\u9500\u4E0A\u6B21\u63D0\u4EA4\u5E76\u4FDD\u7559\u5176\u672A\u6682\u5B58\u7684\u53D8\u66F4\uFF1F",
      "Last commit undone": "\u5DF2\u64A4\u9500\u4E0A\u6B21\u63D0\u4EA4",
      "Cherry-picked": "\u5DF2\u62E3\u9009",
      "Reverted": "\u5DF2\u8FD8\u539F",
      "Rebased": "\u5DF2\u53D8\u57FA",
      "Checked out {branch}": "\u5DF2\u68C0\u51FA {branch}",
      "Delete the local branch {branch}?": "\u5220\u9664\u672C\u5730\u5206\u652F {branch}\uFF1F",
      "Deleted": "\u5DF2\u5220\u9664",
      "Delete on remote": "\u5220\u9664\u8FDC\u7A0B\u5206\u652F",
      "Delete {branch} on {remote}?": "\u5220\u9664 {remote} \u4E0A\u7684 {branch}\uFF1F",
      "Only this branch": "\u4EC5\u6B64\u5206\u652F",
      "Local branches and their upstreams": "\u672C\u5730\u5206\u652F\u53CA\u5176\u4E0A\u6E38",
      "Every ref": "\u6240\u6709\u5F15\u7528",
      "Search branches\u2026": "\u641C\u7D22\u5206\u652F\u2026",
      "With an open merge request": "\u6709\u672A\u5408\u5E76\u7684\u5408\u5E76\u8BF7\u6C42",
      "No branches match.": "\u6CA1\u6709\u5339\u914D\u7684\u5206\u652F\u3002",
      "A branch checked out in another worktree opens a session in that folder instead of checking out here.": "\u5DF2\u5728\u5176\u4ED6\u5DE5\u4F5C\u6811\u4E2D\u68C0\u51FA\u7684\u5206\u652F\u4F1A\u5728\u8BE5\u6587\u4EF6\u5939\u4E2D\u6253\u5F00\u4F1A\u8BDD\uFF0C\u800C\u4E0D\u662F\u5728\u6B64\u5904\u68C0\u51FA\u3002",
      "Open item": "\u6253\u5F00",
      "Search {kind}\u2026": "\u641C\u7D22{kind}\u2026",
      "{count} results": "{count} \u6761\u7ED3\u679C",
      "No results": "\u6CA1\u6709\u7ED3\u679C",
      "\u2191\u2193 or j/k \xB7 Enter \xB7 / search \xB7 x select \xB7 a ask \xB7 Esc clear": "\u2191\u2193 \u6216 j/k \u79FB\u52A8 \xB7 Enter \u6253\u5F00 \xB7 / \u641C\u7D22 \xB7 x \u9009\u62E9 \xB7 a \u8BE2\u95EE \xB7 Esc \u6E05\u9664",
      "Label {count} items": "\u4E3A {count} \u9879\u6253\u6807\u7B7E",
      "Queued {count} label actions": "\u5DF2\u6392\u961F {count} \u4E2A\u6253\u6807\u7B7E\u64CD\u4F5C",
      "Assign {count} items": "\u5206\u914D {count} \u9879",
      "Queued {count} assign actions": "\u5DF2\u6392\u961F {count} \u4E2A\u5206\u914D\u64CD\u4F5C",
      "Assign (comma-separated usernames)": "\u5206\u914D\uFF08\u7528\u6237\u540D\u4EE5\u9017\u53F7\u5206\u9694\uFF09",
      "Unassign (comma-separated usernames)": "\u53D6\u6D88\u5206\u914D\uFF08\u7528\u6237\u540D\u4EE5\u9017\u53F7\u5206\u9694\uFF09"
    };
  }
});

// src/client/api.ts
var api_exports = {};
__export(api_exports, {
  api: () => api,
  dismissToast: () => dismissToast,
  errorText: () => errorText,
  getPrefs: () => getPrefs,
  keys: () => keys,
  openSessionAt: () => openSessionAt,
  pluginCtx: () => pluginCtx,
  queryClient: () => queryClient,
  quoteToChat: () => quoteToChat,
  rememberSeen: () => rememberSeen,
  rpc: () => rpc,
  sendToChat: () => sendToChat,
  setPluginCtx: () => setPluginCtx,
  startAgentSession: () => startAgentSession,
  startEvents: () => startEvents,
  stopEvents: () => stopEvents,
  toast: () => toast,
  updatePrefs: () => updatePrefs,
  useAgent: () => useAgent,
  useBranches: () => useBranches,
  useCommit: () => useCommit,
  useCwd: () => useCwd,
  useDiff: () => useDiff,
  useDrafts: () => useDrafts,
  useFiles: () => useFiles,
  useInbox: () => useInbox,
  useInvalidate: () => useInvalidate,
  useItem: () => useItem,
  useJobLog: () => useJobLog,
  useLog: () => useLog,
  useMeta: () => useMeta,
  useMrs: () => useMrs,
  useOverview: () => useOverview,
  usePrefs: () => usePrefs,
  useReviews: () => useReviews,
  useRun: () => useRun,
  useRuns: () => useRuns,
  useSearch: () => useSearch,
  useSessionId: () => useSessionId,
  useToasts: () => useToasts
});
function setPluginCtx(ctx) {
  plugin.ctx = ctx;
}
function pluginCtx() {
  if (!plugin.ctx) throw new Error("The GitLab panel is not ready.");
  return plugin.ctx;
}
function url(path) {
  return new URL(path, document.baseURI).toString();
}
async function rpc(method, params = {}) {
  const response = await fetch(url("gitlab-panel/api"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ method, params })
  });
  const text = await response.text();
  let parsed = {};
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`The GitLab panel returned invalid JSON (HTTP ${response.status}).`);
  }
  if (!response.ok) throw new Error(parsed.error || `Request failed (HTTP ${response.status}).`);
  if (parsed.ok !== true) throw new Error(parsed.error || "The GitLab panel request failed.");
  return parsed.value;
}
function useOverview(cwd, options = {}) {
  return useQuery({
    queryKey: keys.overview(cwd),
    queryFn: () => api.overview(cwd),
    enabled: !!cwd && (options.enabled ?? true),
    staleTime: 2e3,
    refetchInterval: options.poll ?? false
  });
}
function useBranches(cwd, enabled = true) {
  return useQuery({ queryKey: keys.branches(cwd), queryFn: () => api.branches(cwd), enabled: !!cwd && enabled, staleTime: 5e3 });
}
function useLog(cwd, scope, limit = 200) {
  return useQuery({ queryKey: keys.log(cwd, scope), queryFn: () => api.log(cwd, scope, limit), enabled: !!cwd, staleTime: 5e3 });
}
function useCommit(cwd, hash) {
  return useQuery({ queryKey: keys.show(cwd, hash ?? ""), queryFn: () => api.show(cwd, hash ?? ""), enabled: !!cwd && !!hash, staleTime: Infinity });
}
function useDiff(cwd, path, staged, untracked, enabled = true) {
  return useQuery({ queryKey: keys.diff(cwd, path, staged, untracked), queryFn: () => api.diff(cwd, path, staged, untracked), enabled: !!cwd && enabled, staleTime: 2e3 });
}
function useMrs(cwd, enabled = true) {
  return useQuery({ queryKey: keys.mrs(cwd), queryFn: () => api.mrs(cwd, queryClient.getQueryData(keys.mrs(cwd)) !== void 0), enabled: !!cwd && enabled, staleTime: 6e4 });
}
function useItem(repo, number, kind, enabled = true) {
  return useQuery({ queryKey: keys.item(repo, number, kind), queryFn: () => api.item(repo, number, kind), enabled: enabled && !!repo && number > 0, staleTime: 3e4 });
}
function useFiles(repo, number, head) {
  return useQuery({ queryKey: keys.files(repo, number, head ?? ""), queryFn: () => api.files(repo, number, head), enabled: !!repo && !!number && !!head, staleTime: Infinity });
}
function useReviews(repo, number, enabled = true) {
  return useQuery({ queryKey: keys.reviews(repo, number), queryFn: () => api.reviews(repo, number), enabled: enabled && !!repo && number > 0, staleTime: 15e3 });
}
function useSearch(repo, kind, query, enabled = true) {
  return useInfiniteQuery({
    queryKey: keys.search(repo, kind, query),
    queryFn: ({ pageParam }) => api.search(repo, kind, query, pageParam),
    initialPageParam: null,
    getNextPageParam: (page) => page.cursor,
    enabled: enabled && !!repo,
    staleTime: 6e4
  });
}
function useMeta(repo, enabled = true) {
  return useQuery({ queryKey: keys.meta(repo), queryFn: () => api.meta(repo), enabled: enabled && !!repo, staleTime: 5 * 6e4 });
}
function useInbox(enabled = true, poll = 12e4) {
  return useQuery({ queryKey: keys.inbox(), queryFn: () => api.inbox(queryClient.getQueryData(keys.inbox()) !== void 0), enabled, staleTime: 6e4, refetchInterval: poll });
}
function useAgent(sessionID) {
  return useQuery({
    queryKey: keys.agent(sessionID),
    queryFn: () => api.agent(sessionID),
    enabled: !!sessionID,
    staleTime: 1e4,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.actions.some((action) => action.status === "approved" || action.status === "running") ? 3e3 : false;
    }
  });
}
function useRuns(repo, branch, enabled = true) {
  return useQuery({ queryKey: keys.runs(repo, branch), queryFn: () => api.runs(repo, branch), enabled: enabled && !!repo, staleTime: 15e3 });
}
function useRun(repo, id, enabled = true) {
  return useQuery({ queryKey: keys.run(repo, id), queryFn: () => api.run(repo, id), enabled: enabled && !!repo && id > 0, staleTime: 5e3, refetchInterval: (query) => query.state.data?.run.status === "running" ? 5e3 : false });
}
function useJobLog(repo, job, done, enabled = true) {
  return useQuery({ queryKey: keys.job(repo, job), queryFn: () => api.jobLog(repo, job), enabled: enabled && job > 0, staleTime: done ? Infinity : 5e3 });
}
function useDrafts(repo, number, sessionID, enabled = true) {
  return useQuery({ queryKey: keys.drafts(repo, number, sessionID), queryFn: () => api.drafts(repo, number, sessionID), enabled: enabled && !!repo && number > 0, staleTime: 5e3 });
}
function useCwd(props) {
  const hook = props?.useSessions ?? (() => void 0);
  const selected = hook((state) => state?.byId?.[props?.sessionId]?.cwd);
  const session = props?.session;
  return selected || session?.cwd || session?.directory || session?.header?.cwd || "";
}
function useSessionId(props) {
  return String(props?.sessionId ?? props?.session?.sessionId ?? "");
}
function startEvents() {
  if (events) return;
  events = new EventSource(url("gitlab-panel/events"));
  events.addEventListener("message", (message) => {
    let event;
    try {
      event = JSON.parse(message.data);
    } catch {
      return;
    }
    if (event.type === "hello") {
      void queryClient.invalidateQueries();
      return;
    }
    if (event.type === "changed") {
      void queryClient.invalidateQueries({ queryKey: ["overview", event.cwd] });
      void queryClient.invalidateQueries({ queryKey: ["branches", event.cwd] });
      void queryClient.invalidateQueries({ queryKey: ["log", event.cwd] });
      void queryClient.invalidateQueries({ queryKey: ["outgoing", event.cwd] });
      void queryClient.invalidateQueries({ queryKey: ["mrs", event.cwd] });
      if (event.remote) {
        void queryClient.invalidateQueries({ queryKey: ["runs"] });
        void queryClient.invalidateQueries({ queryKey: ["search"] });
      }
      return;
    }
    if (event.type === "item") {
      void queryClient.invalidateQueries({ queryKey: ["item", event.repo, event.number] });
      void queryClient.invalidateQueries({ queryKey: ["search"] });
      void queryClient.invalidateQueries({ queryKey: ["mrs"] });
      void queryClient.invalidateQueries({ queryKey: ["reviews", event.repo, event.number] });
      void queryClient.invalidateQueries({ queryKey: ["inbox"] });
      return;
    }
    if (event.type === "run") {
      void queryClient.invalidateQueries({ queryKey: ["runs", event.repo] });
      void queryClient.invalidateQueries({ queryKey: ["run", event.repo, event.id] });
      return;
    }
    if (event.type === "inbox") {
      void queryClient.invalidateQueries({ queryKey: ["inbox"] });
      return;
    }
    if (event.type === "agent") {
      void queryClient.invalidateQueries({ queryKey: ["agent", event.sessionID] });
      return;
    }
    if (event.type === "review") {
      void queryClient.invalidateQueries({ queryKey: ["drafts", event.repo, event.number] });
    }
  });
}
function stopEvents() {
  events?.close();
  events = void 0;
}
function readPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}
function getPrefs() {
  return prefs;
}
function updatePrefs(change) {
  const next = structuredClone(prefs);
  change(next);
  prefs = next;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
  }
  prefsListeners.forEach((listener) => listener());
}
function usePrefs() {
  const snapshot = (0, import_react2.useSyncExternalStore)(
    (listener) => {
      prefsListeners.add(listener);
      return () => prefsListeners.delete(listener);
    },
    () => prefs,
    () => prefs
  );
  return [snapshot, updatePrefs];
}
function rememberSeen(repo, kind) {
  updatePrefs((draft) => {
    draft.seen[`${repo}:${kind}`] = Date.now();
  });
}
function toast(input) {
  const entry = { id: ++toastId, ...input };
  toasts = [...toasts.slice(-3), entry];
  toastListeners.forEach((listener) => listener());
  const duration = input.duration ?? (input.tone === "error" ? 1e4 : 5e3);
  setTimeout(() => dismissToast(entry.id), duration);
}
function dismissToast(id) {
  toasts = toasts.filter((entry) => entry.id !== id);
  toastListeners.forEach((listener) => listener());
}
function useToasts() {
  return (0, import_react2.useSyncExternalStore)(
    (listener) => {
      toastListeners.add(listener);
      return () => toastListeners.delete(listener);
    },
    () => toasts,
    () => toasts
  );
}
function errorText(error) {
  return error instanceof Error ? error.message : String(error);
}
function useInvalidate() {
  const client = useQueryClient();
  return (0, import_react2.useCallback)((key) => key ? client.invalidateQueries({ queryKey: key }) : client.invalidateQueries(), [client]);
}
async function startAgentSession(input) {
  const session = sessionRemote();
  const created = await session.create({ cwd: input.cwd });
  if (!created?.ok) throw new Error(created?.error?.message ?? "Could not create the session.");
  const sessionID = created.value.sessionId;
  if (input.before) await input.before(sessionID);
  const sent = await session.prompt({
    requestId: crypto.randomUUID(),
    sessionId: sessionID,
    mode: "queue",
    content: [{ type: "text", text: input.prompt }],
    clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  if (!sent?.ok) throw new Error(sent?.error?.message ?? "Could not send the first prompt.");
  if (input.open !== false) openSession(sessionID);
  return sessionID;
}
async function openSessionAt(cwd) {
  const session = sessionRemote();
  const created = await session.create({ cwd });
  if (!created?.ok) throw new Error(created?.error?.message ?? "Could not create the session.");
  openSession(created.value.sessionId);
  return created.value.sessionId;
}
function sessionRemote() {
  const remote = pluginCtx().remote?.session;
  if (!remote?.create || !remote?.prompt) throw new Error("This DeepSeek Harness build cannot create sessions from a plugin.");
  return remote;
}
function openSession(sessionID) {
  try {
    pluginCtx().uiWorkspace?.openSession?.(sessionID);
  } catch {
  }
}
function composerOf(sessionID) {
  try {
    const scope = pluginCtx().sessions?.scope?.(sessionID);
    if (!scope) return void 0;
    return scope.get?.("conversation")?.input?.for(scope);
  } catch {
    return void 0;
  }
}
async function sendToChat(sessionID, text) {
  const scope = pluginCtx().sessions?.scope?.(sessionID);
  const conversation = scope?.get?.("conversation");
  if (conversation?.send) {
    try {
      await conversation.send(text);
      return true;
    } catch {
      return false;
    }
  }
  try {
    const sent = await sessionRemote().prompt({
      requestId: crypto.randomUUID(),
      sessionId: sessionID,
      mode: "queue",
      content: [{ type: "text", text }]
    });
    return !!sent?.ok;
  } catch {
    return false;
  }
}
function quoteIntoComposer(sessionID, text) {
  const composer = composerOf(sessionID);
  if (!composer?.insertQuote) return false;
  try {
    if (composer.insertQuote(text) !== true) return false;
    composer.focus?.();
    return true;
  } catch {
    return false;
  }
}
async function quoteToChat(sessionID, cwd, text) {
  if (quoteIntoComposer(sessionID, text) || await sendToChat(sessionID, text)) {
    toast({ tone: "success", title: t("Added to chat") });
    return;
  }
  await startAgentSession({ cwd, prompt: text });
}
var import_react2, queryClient, plugin, api, keys, events, PREFS_KEY, DEFAULT_PREFS, prefs, prefsListeners, toasts, toastId, toastListeners;
var init_api = __esm({
  "src/client/api.ts"() {
    "use strict";
    import_react2 = require("react");
    init_modern2();
    init_i18n();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { staleTime: 15e3, gcTime: 10 * 6e4, retry: 1, refetchOnWindowFocus: false }
      }
    });
    plugin = {};
    api = {
      overview: (cwd) => rpc("overview", { cwd }),
      branches: (cwd) => rpc("branches", { cwd }),
      log: (cwd, scope, limit) => rpc("log", { cwd, scope, limit }),
      show: (cwd, hash) => rpc("show", { cwd, hash }),
      diff: (cwd, path, staged, untracked) => rpc("diff", { cwd, path, staged, untracked }),
      mrs: (cwd, fresh = false) => rpc("mrs", { cwd, fresh }),
      branchMrs: (cwd, names) => rpc("branchMrs", { cwd, names, fresh: false }),
      mergedBranches: (cwd) => rpc("mergedBranches", { cwd }),
      outgoing: (cwd) => rpc("outgoing", { cwd }),
      search: (repo, kind, query, cursor) => rpc("search", { repo, kind, query, cursor }),
      item: (repo, number, kind) => rpc("item", { repo, number, kind }),
      files: (repo, number, head) => rpc("files", { repo, number, head }),
      reviews: (repo, number) => rpc("reviews", { repo, number }),
      meta: (repo) => rpc("repoMeta", { repo }),
      inbox: (fresh = false) => rpc("inbox", { fresh }),
      agent: (sessionID) => rpc("agentActions", { sessionID, repo: null }),
      runs: (repo, branch) => rpc("runs", { repo, branch, fresh: false }),
      run: (repo, id) => rpc("run", { repo, id }),
      jobLog: (repo, job) => rpc("jobLog", { repo, job }),
      remoteCommit: (repo, sha) => rpc("remoteCommit", { repo, sha }),
      mrDefaults: (cwd, base) => rpc("mrDefaults", { cwd, base }),
      drafts: (repo, number, sessionID) => rpc("reviewDrafts", { repo, number, sessionID })
    };
    keys = {
      overview: (cwd) => ["overview", cwd],
      branches: (cwd) => ["branches", cwd],
      log: (cwd, scope) => ["log", cwd, scope],
      show: (cwd, hash) => ["show", cwd, hash],
      diff: (cwd, path, staged, untracked) => ["diff", cwd, path, staged, untracked],
      outgoing: (cwd) => ["outgoing", cwd],
      merged: (cwd) => ["merged", cwd],
      mrs: (cwd) => ["mrs", cwd],
      item: (repo, number, kind) => ["item", repo, number, kind],
      files: (repo, number, head) => ["files", repo, number, head],
      reviews: (repo, number) => ["reviews", repo, number],
      search: (repo, kind, query) => ["search", repo, kind, query],
      meta: (repo) => ["meta", repo],
      inbox: () => ["inbox"],
      agent: (sessionID) => ["agent", sessionID],
      runs: (repo, branch) => ["runs", repo, branch ?? ""],
      run: (repo, id) => ["run", repo, id],
      job: (repo, job) => ["job", repo, job],
      drafts: (repo, number, sessionID) => ["drafts", repo, number, sessionID]
    };
    PREFS_KEY = "dsh-gitlab-panel.prefs";
    DEFAULT_PREFS = {
      view: "changes",
      graphScope: "local",
      compactRows: false,
      foldItems: true,
      headerChip: true,
      prDraft: false,
      seen: {},
      savedSearches: [],
      savedReplies: [],
      listSort: {},
      triageRules: {},
      issueBranches: {}
    };
    prefs = readPrefs();
    prefsListeners = /* @__PURE__ */ new Set();
    toasts = [];
    toastId = 0;
    toastListeners = /* @__PURE__ */ new Set();
  }
});

// src/host/plan.ts
var plan_exports = {};
__export(plan_exports, {
  MAX_BATCH: () => MAX_BATCH,
  MAX_BODY: () => MAX_BODY,
  STALE: () => STALE,
  backoff: () => backoff,
  blocker: () => blocker,
  checkRepo: () => checkRepo,
  counts: () => counts,
  describe: () => describe,
  edits: () => edits,
  expand: () => expand,
  parseShell: () => parseShell,
  parseWrite: () => parseWrite,
  settle: () => settle,
  toggleRange: () => toggleRange,
  triageProgress: () => triageProgress,
  triagePrompt: () => triagePrompt,
  undoFor: () => undoFor
});
function parseWrite(kind, input) {
  if (typeof input !== "object" || input === null) throw new Error("Pass the arguments as an object.");
  const value = input;
  const repo = value.repo === void 0 || value.repo === null || value.repo === "" ? null : checkRepo(value.repo);
  const numbers = checkNumbers(value.numbers);
  const note = typeof value.note === "string" ? value.note.trim() : "";
  if (!note) throw new Error("`note` is required: one short sentence telling the user why, shown next to the action.");
  const itemKind = value.kind === "issue" || value.kind === "mr" ? value.kind : void 0;
  return { repo, numbers, kind, payload: payloadOf(kind, value, numbers), note: note.slice(0, MAX_NOTE), ...itemKind ? { itemKind } : {} };
}
function payloadOf(kind, value, numbers) {
  if (kind === "comment") return { body: checkBody(value.body, "body", true) };
  if (kind === "reopen") return optionalBody(value.comment);
  if (kind === "close") {
    const duplicateOf = value.duplicate_of === void 0 || value.duplicate_of === null ? void 0 : checkNumber(value.duplicate_of, "duplicate_of");
    const reason = value.reason === void 0 || value.reason === null ? duplicateOf ? "duplicate" : "completed" : checkReason(value.reason);
    if (reason === "duplicate" && !duplicateOf) throw new Error('`duplicate_of` is required when `reason` is "duplicate": the number of the issue to keep.');
    if (reason !== "duplicate" && duplicateOf) throw new Error('`duplicate_of` only goes with `reason` "duplicate".');
    if (duplicateOf && numbers.includes(duplicateOf)) throw new Error(`#${duplicateOf} cannot be closed as a duplicate of itself.`);
    return { reason, ...duplicateOf ? { duplicateOf } : {}, ...optionalBody(value.comment) };
  }
  const add = checkNames(value.add, "add", kind);
  const remove = checkNames(value.remove, "remove", kind);
  if (add.length === 0 && remove.length === 0) throw new Error("Pass `add`, `remove` or both, with at least one name.");
  const both = add.filter((name2) => remove.includes(name2));
  if (both.length > 0) throw new Error(`${both.join(", ")} cannot be both added and removed.`);
  return { add, remove };
}
function optionalBody(body) {
  const text = checkBody(body, "comment", false);
  return text ? { body: text } : {};
}
function checkRepo(repo) {
  if (typeof repo !== "string" || !/^[\w.-]+(?:\/[\w.-]+)+$/.test(repo.trim()) || /(^|\/)\.\.?($|\/)/.test(repo.trim()))
    throw new Error("`repo` must look like group/project (subgroups allowed), such as gitlab-org/gitlab.");
  return repo.trim();
}
function checkNumbers(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) throw new Error("`numbers` must list at least one issue or merge request number.");
  const unique = [...new Set(numbers.map((number) => checkNumber(number, "numbers")))];
  if (unique.length > MAX_BATCH) throw new Error(`At most ${MAX_BATCH} numbers per call; split the rest into another call.`);
  return unique;
}
function checkNumber(number, field) {
  const parsed = typeof number === "string" && /^[#!]?\d+$/.test(number.trim()) ? Number(number.trim().replace(/^[#!]/, "")) : number;
  if (typeof parsed !== "number" || !Number.isSafeInteger(parsed) || parsed <= 0) throw new Error(`\`${field}\` takes positive whole numbers, not ${JSON.stringify(number)}.`);
  return parsed;
}
function checkReason(reason) {
  const text = typeof reason === "string" ? reason.trim().toLowerCase().replace(/[\s-]+/g, "_") : "";
  if (text === "completed" || text === "not_planned" || text === "duplicate") return text;
  throw new Error('`reason` must be "completed", "not_planned" or "duplicate".');
}
function checkBody(body, field, required) {
  if (body === void 0 || body === null) {
    if (required) throw new Error(`\`${field}\` is required.`);
    return "";
  }
  if (typeof body !== "string") throw new Error(`\`${field}\` must be text.`);
  if (required && !body.trim()) throw new Error(`\`${field}\` must not be empty.`);
  if (body.length > MAX_BODY) throw new Error(`\`${field}\` is ${body.length} characters; GitLab allows ${MAX_BODY}.`);
  return body.trim() ? body : "";
}
function checkNames(names, field, kind) {
  if (names === void 0 || names === null) return [];
  if (!Array.isArray(names)) throw new Error(`\`${field}\` must be a list of ${kind === "label" ? "label names" : "GitLab usernames"}.`);
  const checked = names.map((name2) => {
    if (typeof name2 !== "string" || !name2.trim()) throw new Error(`\`${field}\` has an empty name.`);
    if (kind === "label") return name2.trim();
    const login = name2.trim() === "@me" ? "@me" : name2.trim().replace(/^@/, "");
    if (login !== "@me" && !/^[A-Za-z0-9_](?:[A-Za-z0-9_.-]*[A-Za-z0-9_-])?$/.test(login)) throw new Error(`"${name2}" is not a GitLab username.`);
    return login;
  });
  return [...new Set(checked)];
}
function expand(proposal, input) {
  return proposal.numbers.map((number) => ({
    id: input.id(),
    sessionID: input.sessionID,
    batch: input.batch,
    repo: input.repo,
    number,
    item: input.items.get(number)?.item ?? null,
    title: input.items.get(number)?.title ?? "",
    kind: proposal.kind,
    payload: proposal.payload,
    note: input.source === "user" ? "" : proposal.note,
    status: input.status,
    error: null,
    result: null,
    source: input.source ?? "tool",
    undoOf: null,
    undoneBy: null,
    ...input.round === void 0 ? {} : { round: input.round },
    createdAt: input.now,
    updatedAt: input.now
  }));
}
function blocker(kind, info, same) {
  if (!info) return "does not exist or cannot be read";
  if (kind === "close" && info.state !== "OPEN") return `already ${info.state.toLowerCase()}`;
  if (kind === "reopen" && info.state === "MERGED") return "merged; it cannot be reopened";
  if (kind === "reopen" && info.state === "OPEN") return "already open";
  if (same) return `already ${same.status === "proposed" ? "proposed and waiting for the user" : "approved and running"}`;
  return void 0;
}
function edits(action) {
  if (!action.edited) return void 0;
  const original = action.original;
  if (!original) return "edited by the user";
  const before = describe({ ...action, payload: original });
  const after = describe(action);
  const body = (original.body ?? "") !== (action.payload.body ?? "");
  const same = describe({ ...action, payload: { ...original, body: void 0 } }) === describe({ ...action, payload: { ...action.payload, body: void 0 } });
  const changed = same ? body ? "the user rewrote the comment" : "the user saved it unchanged" : `the user changed it to ${after}`;
  const comments = body ? ` Your comment: "${oneLine(original.body ?? "", 300)}"; the user's: "${oneLine(action.payload.body ?? "", 300)}".` : "";
  return `edited by the user: you proposed ${before}; ${changed}.${comments}`;
}
function triageProgress(triage, actions) {
  const mine = actions.filter((action) => action.round !== void 0 && action.source === "tool");
  const reviewed = (/* @__PURE__ */ new Set([...triage.reviewed, ...mine.map((action) => action.number)])).size;
  const of = (...statuses) => mine.filter((action) => statuses.includes(action.status)).length;
  return {
    reviewed,
    total: Math.max(triage.total, reviewed),
    approved: of("approved", "running", "done", "failed", "undone"),
    skipped: of("skipped"),
    waiting: of("proposed")
  };
}
function toggleRange(selected, numbers, index, anchor, range) {
  const number = numbers[index];
  if (number === void 0) return new Set(selected);
  const on = !selected.has(number);
  const from = range && anchor !== void 0 ? Math.min(anchor, index) : index;
  const to = range && anchor !== void 0 ? Math.max(anchor, index) : index;
  const span = numbers.slice(from, to + 1);
  return on ? /* @__PURE__ */ new Set([...selected, ...span]) : new Set([...selected].filter((item) => !span.includes(item)));
}
function triagePrompt(input) {
  const noun = input.kind === "mr" ? "merge requests" : "issues";
  const what = input.query ? [
    `The ${input.total} ${noun} matching this search, in this order:`,
    "",
    "```",
    input.query,
    "```",
    "",
    `First list them all: call the gitlab_panel_search tool with repo "${input.repo}", kind "${input.kind}", exactly this query and limit 100, and follow its cursor to the last page. Work through that fixed list; don't search again between batches, since items the user closes drop out of the results and would shift the pages.`
  ] : [`These ${input.numbers.length} ${noun}: ${input.numbers.map((number) => (input.kind === "mr" ? "!" : "#") + number).join(", ")}.`];
  const replies = input.replies.length > 0 ? [
    "",
    "## Saved replies",
    "",
    "Use these replies, word for word, where the rules call for them (fill in only what a reply leaves for you to fill in):",
    ...input.replies.flatMap((reply) => ["", `### ${reply.name}`, "", reply.body.trim()])
  ] : [];
  return [
    `Triage ${noun} in ${input.repo} with me, using the gitlab_panel tools. I review every change you propose in the GitLab panel.`,
    "",
    "## What to go through",
    "",
    ...what,
    "",
    "## My rules",
    "",
    input.rules.trim() || "(No rules given: propose only what is clearly right, such as labels that fit and duplicates.)",
    ...replies,
    "",
    "## How to work",
    "",
    `- Work in batches of ${input.batch} items. Read each item's search line, and call \`gitlab_panel_view\` when the title and labels are not enough to decide.`,
    "- Only propose. Use the gitlab_panel_comment, gitlab_panel_close, gitlab_panel_reopen, gitlab_panel_label and gitlab_panel_assign tools: each queues proposals that I approve, edit or skip. Never write to GitLab any other way: no glab in the shell, no API calls.",
    `- GitLab numbers issues and merge requests separately. Every write tool takes kind: "${input.kind}" here; pass it so a number never lands on the other kind.`,
    "- Give every proposal a short `note` saying why; I see it next to the action.",
    "- Put identical actions in one tool call: all the numbers that get the same close reason and reply, or the same labels, go together.",
    "- When no rule applies or you are not sure, leave the item alone and mention it in the batch summary instead of guessing.",
    `- After each batch, call the \`gitlab_panel_actions\` tool with \`wait: true\` and \`reviewed\` set to every number you looked at in the batch, including the ones you left alone. It returns once I have decided, with what I approved, skipped and edited. If it returns while proposals still wait, call it again the same way. Don't stop to ask me between batches.`,
    "- Learn from my skips and edits before the next batch: follow how I changed your proposals, and don't propose what I skipped again.",
    "- When every item is done, stop and summarize: what I approved, what I skipped, and the items you left alone with the reason for each."
  ].join("\n");
}
function describe(action) {
  const payload = action.payload;
  const comment = payload.body ? ", with a comment" : "";
  if (action.kind === "comment") return `comment "${oneLine(payload.body ?? "", 60)}"`;
  if (action.kind === "close") {
    if (action.item === "mr") return `close merge request${comment}`;
    if (payload.reason === "duplicate") return `close as duplicate of #${payload.duplicateOf}${comment}`;
    return `close as ${payload.reason === "not_planned" ? "not planned" : "completed"}${comment}`;
  }
  if (action.kind === "reopen") return `reopen${comment}`;
  if (action.kind === "uncomment") return "delete a comment";
  if (action.kind === "approve") return "approve";
  if (action.kind === "unapprove") return "remove approval";
  if (action.kind === "other") return `ran \`${oneLine(payload.command ?? "", 80)}\``;
  const noun = action.kind === "label" ? "label" : "assignee";
  const mark = action.kind === "label" ? "" : "@";
  const list = (names) => (names ?? []).map((name2) => name2 === "@me" ? name2 : `${mark}${name2}`).join(", ");
  const parts = [
    payload.add?.length ? `add ${noun}${payload.add.length > 1 ? "s" : ""} ${list(payload.add)}` : "",
    payload.remove?.length ? `remove ${noun}${payload.remove.length > 1 ? "s" : ""} ${list(payload.remove)}` : ""
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : `ran \`${oneLine(payload.command ?? "", 80)}\``;
}
function undoFor(action) {
  if (action.status !== "done" || action.undoOf || action.undoneBy || action.result?.noop) return void 0;
  const result = action.result ?? {};
  const comment = result.commentId ? { commentId: result.commentId } : {};
  if (action.kind === "close") return { kind: "reopen", payload: comment };
  if (action.source === "shell") return void 0;
  if (action.kind === "reopen") return { kind: "close", payload: { reason: result.reason === "not_planned" ? "not_planned" : "completed", ...comment } };
  if (action.kind === "comment") return result.commentId ? { kind: "uncomment", payload: { commentId: result.commentId } } : void 0;
  if (action.kind !== "label" && action.kind !== "assign") return void 0;
  const add = result.removed ?? [];
  const remove = result.added ?? [];
  if (add.length === 0 && remove.length === 0) return void 0;
  return { kind: action.kind, payload: { add, remove } };
}
function backoff(message, attempt) {
  const after = /retry[- ]after:?\s*(\d+)/i.exec(message);
  const limited = !!after || /rate limit|too many requests|HTTP 429/i.test(message);
  if (!limited || attempt >= RETRIES) return void 0;
  if (after) return Math.min(Number(after[1]), 600) * 1e3;
  return 6e4 * 2 ** attempt;
}
function settle(actions, now) {
  return actions.map(
    (action) => action.status === "running" && now - action.updatedAt > STALE ? { ...action, status: "failed", error: "Interrupted before it finished; check the item, then retry or skip it.", updatedAt: now } : action
  );
}
function counts(actions) {
  const of = (status) => actions.filter((action) => action.status === status).length;
  return { proposed: of("proposed"), running: of("running") + of("approved"), done: of("done"), failed: of("failed") };
}
function parseShell(command) {
  const where = { cd: null };
  return segments(command).flatMap((tokens) => {
    if (tokens[0] === "cd" || tokens[0] === "pushd") {
      const target2 = tokens[1] ?? "~";
      where.cd = where.cd === "?" || /[$`*?]/.test(target2) || target2 === "-" ? "?" : where.cd && !/^[~/]/.test(target2) ? `${where.cd}/${target2}` : target2;
      return [];
    }
    const env = tokens.findIndex((token) => !/^[A-Za-z_][A-Za-z0-9_]*=/.test(token));
    if (env === -1) return [];
    const glab = tokens[env] ?? "";
    if (glab !== "glab" && !glab.endsWith("/glab")) return [];
    const envRepo = tokens.slice(0, env).map((token) => /^GITLAB_REPO=(.+)$/.exec(token)?.[1]).filter(Boolean).at(-1);
    const args = tokens.slice(env + 1);
    const flags = /* @__PURE__ */ new Map();
    const positional = [];
    const verbAt = { group: "", verb: "" };
    for (let index = 0; index < args.length; index++) {
      const entry = args[index] ?? "";
      const [flag, inline2] = entry.startsWith("--") && entry.includes("=") ? [entry.slice(0, entry.indexOf("=")), entry.slice(entry.indexOf("=") + 1)] : [entry, void 0];
      const takes = flag === "-R" || flag === "--repo" || (VALUE_FLAGS[verbAt.verb] ?? []).includes(flag);
      if (flag.startsWith("-") && flag !== "-") {
        const value = inline2 ?? (takes ? args[++index] : "");
        flags.set(flag, [...flags.get(flag) ?? [], value ?? ""]);
        continue;
      }
      if (!verbAt.group) {
        if (entry !== "issue" && entry !== "mr") return [];
        verbAt.group = entry;
        continue;
      }
      if (!verbAt.verb) {
        if (!VERBS.has(entry)) return [];
        verbAt.verb = entry;
        continue;
      }
      positional.push(entry);
    }
    if (!verbAt.verb) return [];
    const target = targetOf(positional[0] ?? "");
    if (!target) return [];
    const flagRepo = flags.get("-R")?.at(-1) ?? flags.get("--repo")?.at(-1);
    const repo = target.repo ?? repoName(flagRepo) ?? repoName(envRepo);
    const group = verbAt.group === "mr" ? "mr" : "issue";
    const line = tokens.map((token) => /^[\w@%+=:,./#!-]+$/.test(token) ? token : JSON.stringify(token)).join(" ");
    return [{ group, verb: verbAt.verb, number: target.number, repo, cd: where.cd, ...shellKind(verbAt.verb, flags, line) }];
  });
}
function shellKind(verb, flags, command) {
  const values = (...names) => names.flatMap((name2) => flags.get(name2) ?? []).flatMap((value) => value.split(",")).map((value) => value.trim()).filter(Boolean);
  const line = { command: oneLine(command, 500) };
  if (verb === "close") {
    const reason = values("-r", "--reason")[0]?.toLowerCase().replace(/[\s-]+/g, "_");
    return { kind: "close", payload: { ...line, reason: reason === "not_planned" ? "not_planned" : "completed" } };
  }
  if (verb === "reopen") return { kind: "reopen", payload: line };
  if (verb === "note" || verb === "comment") return { kind: "comment", payload: line };
  if (verb === "approve") return { kind: "approve", payload: line };
  if (verb === "unapprove") return { kind: "unapprove", payload: line };
  if (verb !== "update") return { kind: "other", payload: line };
  const labels = { add: values("--add-label", "-l", "--label"), remove: values("--remove-label") };
  const unassigned = (flags.get("--unassign") ?? []).length > 0;
  const people = { add: values("-a", "--assignee"), remove: values("--unassign") };
  const reviewers = { add: values("--reviewer") };
  const other = [...flags.keys()].some((flag) => !["-R", "--repo", "--add-label", "--remove-label", "-l", "--label", "-a", "--assignee", "--unassign", "--reviewer"].includes(flag));
  if (!other && labels.add.length + labels.remove.length > 0 && people.add.length + people.remove.length === 0 && !unassigned) return { kind: "label", payload: { ...line, ...labels } };
  if (!other && (people.add.length + people.remove.length > 0 || unassigned) && labels.add.length + labels.remove.length === 0) return { kind: "assign", payload: { ...line, ...people } };
  if (!other && reviewers.add.length > 0) return { kind: "assign", payload: { ...line, add: reviewers.add } };
  return { kind: "other", payload: line };
}
function targetOf(value) {
  const url2 = /^https?:\/\/[^/]+\/(.+?)\/-\/(?:issues|merge_requests)\/(\d+)(?:[/?#].*)?$/.exec(value);
  if (url2?.[1] && url2[2]) return { repo: url2[1], number: Number(url2[2]) };
  const number = /^[#!]?(\d+)$/.exec(value)?.[1];
  if (!number || !Number.isSafeInteger(Number(number)) || Number(number) <= 0) return void 0;
  return { repo: null, number: Number(number) };
}
function repoName(value) {
  const parts = value?.replace(/^https?:\/\//, "").replace(/\.git$/, "").split("/").filter(Boolean) ?? [];
  const name2 = parts.slice(-2).join("/");
  return parts.length >= 2 && /^[\w.-]+\/[\w.-]+$/.test(name2) ? name2 : null;
}
function segments(command) {
  const all = [[]];
  const state = { word: "", started: false, quote: "" };
  const push = () => {
    if (state.started) all.at(-1)?.push(state.word);
    state.word = "";
    state.started = false;
  };
  const split = () => {
    push();
    all.push([]);
  };
  for (let index = 0; index < command.length; index++) {
    const char = command[index] ?? "";
    if (state.quote === "'") {
      if (char === "'") state.quote = "";
      else state.word += char;
      continue;
    }
    if (state.quote === '"') {
      if (char === '"') state.quote = "";
      else if (char === "\\" && /["\\$`]/.test(command[index + 1] ?? "")) state.word += command[++index];
      else state.word += char;
      continue;
    }
    if (char === "'" || char === '"') {
      state.quote = char;
      state.started = true;
      continue;
    }
    if (char === "\\") {
      if (command[index + 1] === "\n") index++;
      else {
        state.word += command[++index] ?? "";
        state.started = true;
      }
      continue;
    }
    if (char === ";" || char === "|" || char === "&" || char === "\n" || char === "(" || char === ")") {
      split();
      continue;
    }
    if (/\s/.test(char)) {
      push();
      continue;
    }
    state.word += char;
    state.started = true;
  }
  push();
  return all.filter((tokens) => tokens.length > 0);
}
function oneLine(text, limit) {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > limit ? `${flat.slice(0, limit)}\u2026` : flat;
}
var MAX_BATCH, MAX_BODY, MAX_NOTE, RETRIES, STALE, VERBS, VALUE_FLAGS;
var init_plan = __esm({
  "src/host/plan.ts"() {
    "use strict";
    MAX_BATCH = 100;
    MAX_BODY = 65536;
    MAX_NOTE = 1e3;
    RETRIES = 3;
    STALE = 15 * 6e4;
    VERBS = /* @__PURE__ */ new Set(["close", "reopen", "note", "comment", "update", "merge", "approve", "unapprove", "delete"]);
    VALUE_FLAGS = {
      close: ["-r", "--reason"],
      reopen: [],
      note: ["-m", "--message", "-F", "--file"],
      comment: ["-m", "--message", "-F", "--file"],
      update: [
        "-t",
        "--title",
        "-d",
        "--description",
        "-m",
        "--milestone",
        "-a",
        "--assignee",
        "--add-label",
        "--remove-label",
        "--reviewer",
        "--target-branch",
        "--source-branch"
      ],
      merge: ["-m", "--message", "-b", "--branch", "--sha"],
      approve: [],
      unapprove: [],
      delete: []
    };
  }
});

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  default: () => index_default,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);
init_modern2();
var import_react13 = require("react");
var import_client = require("react-dom/client");
init_api();

// src/client/chip.tsx
var import_react4 = require("react");

// src/shared/core.ts
var LOG_FORMAT = ["%H", "%P", "%an", "%ae", "%at", "%s", "%D"].join("%x1f") + "%x1e";
var BRANCH_FORMAT = [
  "%(refname)",
  "%(objectname:short)",
  "%(upstream:short)",
  "%(upstream:track,nobracket)",
  "%(committerdate:unix)",
  "%(contents:subject)",
  "%(HEAD)"
].join("%1f");
var REF_PATTERN = /(?<![\w/#&.!-])(?:((?:[\w.-]+\/)+[\w.-]+))?([#!])(\d{1,7})\b/g;
function findRefs(text) {
  return [...text.matchAll(REF_PATTERN)].map((match) => ({
    index: match.index ?? 0,
    length: match[0].length,
    repo: match[1],
    number: Number(match[3]),
    kind: match[2] === "!" ? "mr" : "issue"
  }));
}
function parseGitLabLink(href) {
  const whole = /^https?:\/\/[^/]+\/(.+)$/.exec(href);
  if (!whole?.[1]) return void 0;
  const path = whole[1].split(/[?#]/)[0] ?? "";
  let repo = "";
  let rest = "";
  const marker = path.indexOf("/-/");
  if (marker !== -1) {
    repo = path.slice(0, marker);
    rest = path.slice(marker + 3);
  } else {
    const legacy = /^((?:[\w.-]+\/)+[\w.-]+?)\/(issues|merge_requests|commit|pipelines)\/(.*)$/.exec(path);
    if (!legacy?.[1] || !legacy[2] || legacy[3] === void 0) return void 0;
    repo = legacy[1];
    rest = `${legacy[2]}/${legacy[3]}`;
  }
  if (!repo) return void 0;
  const item = /^(issues|merge_requests)\/(\d+)(\/diffs)?/.exec(rest);
  if (item?.[2]) return { kind: "item", repo, number: Number(item[2]), item: item[1] === "merge_requests" ? "mr" : "issue", files: !!item[3] };
  const commit = /^(?:commit|merge_requests\/\d+\/commits)\/([0-9a-f]{7,40})/.exec(rest);
  if (commit?.[1]) return { kind: "commit", repo, sha: commit[1] };
  const run = /^pipelines\/(\d+)(?:\/(?:jobs|builds)\/(\d+))?/.exec(rest);
  if (run?.[1]) return { kind: "run", repo, id: Number(run[1]), job: run[2] ? Number(run[2]) : null };
  return void 0;
}
function issueFromBranch(branch) {
  const name2 = branch.slice(branch.lastIndexOf("/") + 1);
  const match = /^(\d{1,7})(?:[-_]|$)/.exec(name2) ?? /(?:^|[-_])(?:issues?|fix|gl)[-_]?(\d{1,7})(?:[-_]|$)/i.exec(name2);
  const number = Number(match?.[1]);
  return number > 0 ? number : void 0;
}
function issueBranchName(number, title) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").split("-").slice(0, 6).join("-");
  return slug ? `${number}-${slug}` : String(number);
}
var CLOSING = /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?):?\s+(?:((?:[\w.-]+\/)+[\w.-]+)?#(\d{1,7})\b|https?:\/\/[^\s]+\/((?:[\w.-]+\/)+[\w.-]+)\/-\/(?:issues|merge_requests)\/(\d{1,7})\b)/gi;
function closingRefs(body) {
  return [...body.replace(/<!--[\s\S]*?-->/g, "").matchAll(CLOSING)].map((match) => ({
    repo: match[1] ?? match[3],
    number: Number(match[2] ?? match[4])
  }));
}
var PLACEHOLDER = /\b((?:close[sd]?|fix(?:e[sd])?|resolve[sd]?):?\s*)#(?![\w#])/i;
function withClosing(body, number) {
  if (closingRefs(body).some((ref) => !ref.repo && ref.number === number)) return body;
  const parts = body.split(/(<!--[\s\S]*?-->)/);
  const at = parts.findIndex((part, index) => index % 2 === 0 && PLACEHOLDER.test(part));
  if (at !== -1) return parts.map((part, index) => index === at ? part.replace(PLACEHOLDER, `$1#${number}`) : part).join("");
  const trimmed = body.trimEnd();
  return trimmed ? `${trimmed}

Closes #${number}` : `Closes #${number}`;
}
function parsePatch(patch) {
  const lines = [];
  const at = { old: 0, new: 0 };
  let inHunk = false;
  for (const text of patch.split("\n")) {
    const hunk = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(text);
    if (hunk) {
      at.old = Number(hunk[1]);
      at.new = Number(hunk[2]);
      inHunk = true;
      lines.push({ kind: "hunk", text, old: null, new: null });
      continue;
    }
    if (text.startsWith("diff --git ") || text.startsWith("Binary files ")) {
      inHunk = false;
      lines.push({ kind: "hunk", text, old: null, new: null });
      continue;
    }
    if (!inHunk) continue;
    if (text.startsWith("\\") || text === "") continue;
    if (text.startsWith("+")) {
      lines.push({ kind: "add", text: text.slice(1), old: null, new: at.new++ });
      continue;
    }
    if (text.startsWith("-")) {
      lines.push({ kind: "del", text: text.slice(1), old: at.old++, new: null });
      continue;
    }
    lines.push({ kind: "context", text: text.slice(1), old: at.old++, new: at.new++ });
  }
  return lines;
}
function mrFor(mrs, branch, tip, defaultBranch) {
  if (!mrs || !branch) return void 0;
  const matching = mrs.items.filter((item) => item.head === branch && !item.cross);
  const open = matching.find((item) => item.state === "OPEN");
  if (open) return open;
  if (branch === defaultBranch) return void 0;
  const done = matching[0];
  if (!done || !tip || !done.sha) return done;
  return done.sha === tip ? done : void 0;
}
function mergeability(status) {
  switch (status) {
    case "can_be_merged":
    case "mergeable":
      return { tone: "success", label: "Ready to merge" };
    case "cannot_be_merged":
      return { tone: "danger", label: "Merge conflicts" };
    case "ci_must_pass":
    case "ci_still_running":
      return { tone: "warn", label: "Waiting on the pipeline" };
    case "discussions_not_resolved":
      return { tone: "warn", label: "Discussions to resolve" };
    case "draft_status":
      return { tone: "warn", label: "Still a draft" };
    case "not_approved":
      return { tone: "warn", label: "Needs approval" };
    case "blocked_status":
    case "external_status_check":
      return { tone: "warn", label: "Blocked" };
    case "checking":
    case "unchecked":
      return { tone: void 0, label: "Checking mergeability" };
    default:
      return { tone: void 0, label: status ? status.replace(/_/g, " ") : "" };
  }
}
function relativeAge(date, now = Date.now()) {
  if (!date) return "";
  const value = typeof date === "number" ? date < 1e12 ? date * 1e3 : date : Date.parse(date);
  if (!Number.isFinite(value)) return "";
  const seconds = Math.floor((now - value) / 1e3);
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
}
function initials(name2) {
  const parts = name2.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return (parts[0] ?? "?").slice(0, 2).toUpperCase();
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}
function colorFor(name2) {
  let hash = 0;
  for (let i = 0; i < name2.length; i++) hash = hash * 31 + name2.charCodeAt(i) | 0;
  const colors = ["#e5484d", "#f76b15", "#ffb224", "#46a758", "#12a594", "#0091ff", "#6e56cf", "#e93d82", "#8e4ec6", "#3e63dd"];
  return colors[Math.abs(hash) % colors.length] ?? "#8b8d98";
}

// src/client/chip.tsx
init_api();
init_i18n();

// src/client/nav.ts
var nav = {
  openMain(_params = {}) {
  },
  openItem(_input) {
  },
  openRun(_input) {
  },
  openCommit(_input) {
  },
  openActivity() {
  },
  openInbox() {
  },
  openRuns() {
  }
};

// src/client/mentions.ts
init_api();
init_i18n();
var currentRepo;
function setCurrentRepo(repo) {
  currentRepo = repo;
}
var SKIP = "a, pre, code, textarea, input, select, script, style, [contenteditable='true'], [data-glp], .glp-mention-overlay, .glp-portal";
function installMentions() {
  const layer = document.createElement("div");
  layer.dataset.glp = "";
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147482998";
  document.body.appendChild(layer);
  let card;
  let timer = 0;
  const clear = () => {
    layer.textContent = "";
  };
  const rebuild = () => {
    clear();
    if (!currentRepo) return;
    if (!document.body) return;
    const roots = [...document.querySelectorAll("[data-chat-flow], [data-trajectory]")];
    let count = 0;
    for (const root of roots) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node2) {
          const text = node2.nodeValue;
          if (!text || text.length < 3 || !/[#!]\d/.test(text)) return NodeFilter.FILTER_REJECT;
          const parent = node2.parentElement;
          if (!parent || parent.closest(SKIP)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      let node;
      while ((node = walker.nextNode()) && count < 200) {
        const text = node.nodeValue ?? "";
        for (const ref of findRefs(text)) {
          if (count >= 200) break;
          const repo = ref.repo ?? currentRepo;
          if (ref.repo && currentRepo && ref.repo.toLowerCase() !== currentRepo.toLowerCase()) continue;
          if (!repo) continue;
          const range = document.createRange();
          try {
            range.setStart(node, ref.index);
            range.setEnd(node, ref.index + ref.length);
          } catch {
            continue;
          }
          for (const rect of range.getClientRects()) {
            if (rect.width < 2 || rect.height < 2) continue;
            if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
            const spot = document.createElement("a");
            spot.className = "glp-mention-overlay";
            spot.dataset.glp = "";
            spot.style.position = "fixed";
            spot.style.left = `${rect.left}px`;
            spot.style.top = `${rect.top}px`;
            spot.style.width = `${rect.width}px`;
            spot.style.height = `${rect.height}px`;
            spot.style.cursor = "pointer";
            spot.style.pointerEvents = "auto";
            spot.style.background = "transparent";
            spot.style.borderBottom = "1px dotted var(--dsw-alias-link, #3e63dd)";
            spot.style.borderRadius = "2px";
            spot.setAttribute("aria-label", `${repo}${ref.kind === "mr" ? "!" : "#"}${ref.number}`);
            spot.dataset.kind = ref.kind;
            spot.addEventListener("pointerenter", (event) => showCard(event, repo, ref.number, ref.kind));
            spot.addEventListener("pointerleave", () => hideCard());
            spot.addEventListener("click", (event) => {
              event.preventDefault();
              event.stopPropagation();
              void open(repo, ref.number, ref.kind);
            });
            layer.appendChild(spot);
            count++;
          }
        }
      }
      if (count >= 200) break;
    }
  };
  const schedule = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(rebuild, 250);
  };
  const hideCard = () => {
    card?.remove();
    card = void 0;
  };
  const showCard = (event, repo, number, hintKind) => {
    if (!window.matchMedia("(any-hover: hover)").matches) return;
    hideCard();
    const anchor = event.currentTarget;
    void api.item(repo, number, hintKind).then((item) => {
      const element = document.createElement("div");
      element.dataset.glp = "";
      element.className = "glp-portal";
      element.style.cssText = "position:fixed;z-index:2147483050;pointer-events:none";
      const box = document.createElement("div");
      box.className = "glp-hover-card";
      box.style.pointerEvents = "auto";
      box.style.position = "static";
      const title = document.createElement("div");
      title.style.cssText = "font-weight:600;line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical";
      title.textContent = `${item.kind === "mr" ? "!" : "#"}${item.number} ${item.title}`;
      const meta = document.createElement("div");
      meta.style.cssText = "font-size:11px;color:var(--glp-text-3);display:flex;gap:6px;align-items:center";
      meta.textContent = `${item.state.toLowerCase()} \xB7 @${item.author}${item.draft ? " \xB7 draft" : ""}`;
      const hint = document.createElement("div");
      hint.style.cssText = "font-size:10px;color:var(--glp-text-3)";
      hint.textContent = t("Click to open in the GitLab panel");
      box.append(title, meta, hint);
      box.addEventListener("click", () => void open(repo, number, item.kind));
      element.appendChild(box);
      const rect = anchor.getBoundingClientRect();
      const top = rect.bottom + 6 + 120 > window.innerHeight ? Math.max(6, rect.top - 130) : rect.bottom + 6;
      const left = Math.min(window.innerWidth - 310, Math.max(6, rect.left));
      element.style.left = `${left}px`;
      element.style.top = `${top}px`;
      card = element;
      document.body.appendChild(element);
    }).catch(() => void 0);
  };
  const open = async (repo, number, kind) => {
    let resolved = kind;
    if (!resolved) {
      try {
        resolved = (await api.item(repo, number)).kind;
      } catch {
        resolved = "issue";
      }
    }
    nav.openItem({ repo, kind: resolved, number });
    hideCard();
  };
  const click = (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target;
    if (!target) return;
    if (target.closest("[data-glp]")) return;
    const anchor = target.closest("a");
    if (anchor instanceof HTMLAnchorElement && anchor.href) {
      const link = parseGitLabLink(anchor.href);
      if (!link) return;
      event.preventDefault();
      event.stopPropagation();
      if (link.kind === "item") void open(link.repo, link.number, link.item);
      else if (link.kind === "commit") nav.openCommit({ repo: link.repo, sha: link.sha });
      else if (link.kind === "run") nav.openRun({ repo: link.repo, id: link.id });
      return;
    }
    const ref = target.closest(".glp-mention");
    if (ref instanceof HTMLElement) {
      const repo = ref.dataset.repo;
      const number = Number(ref.dataset.number);
      if (repo && number) void open(repo, number, ref.dataset.kind === "mr" ? "mr" : ref.dataset.kind === "issue" ? "issue" : void 0);
    }
  };
  const onScroll = () => schedule();
  const observer = new MutationObserver((records) => {
    if (records.every((record) => record.target instanceof Element && record.target.closest("[data-glp]"))) return;
    schedule();
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", onScroll, { capture: true, passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  document.addEventListener("click", click, true);
  schedule();
  return () => {
    observer.disconnect();
    window.removeEventListener("scroll", onScroll, true);
    window.removeEventListener("resize", onScroll);
    document.removeEventListener("click", click, true);
    window.clearTimeout(timer);
    hideCard();
    layer.remove();
  };
}

// src/client/ui.tsx
var import_react3 = require("react");
var import_react_dom = require("react-dom");
init_api();
init_i18n();
var import_jsx_runtime3 = require("react/jsx-runtime");
function Icon(props) {
  const size = props.size ?? 14;
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.35,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: props.className,
    style: props.style,
    "aria-hidden": true
  };
  const path = () => {
    switch (props.name) {
      case "gitlab":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { fill: "currentColor", stroke: "none", d: "M8 14.2 3.1 10.7a.45.45 0 0 1-.16-.5l.9-2.75L5.9 1.9a.3.3 0 0 1 .57 0L8 5.55l1.53-3.65a.3.3 0 0 1 .57 0l2.06 5.55.9 2.75a.45.45 0 0 1-.16.5Z" });
      case "branch":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "4.2", cy: "3.4", r: "1.6" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "4.2", cy: "12.6", r: "1.6" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "11.8", cy: "5.2", r: "1.6" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M4.2 5v6M11.8 6.8c0 2.2-1.8 3-4 3.4-1.6.3-2.6.8-3.2 1.3" })
        ] });
      case "chevron-down":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "m4.5 6.2 3.5 3.6 3.5-3.6" });
      case "chevron-right":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "m6.2 4.5 3.6 3.5-3.6 3.5" });
      case "chevron-left":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "m9.8 4.5-3.6 3.5 3.6 3.5" });
      case "chevron-up":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "m4.5 9.8 3.5-3.6 3.5 3.6" });
      case "dots":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "3.2", cy: "8", r: "1", fill: "currentColor", stroke: "none" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "8", cy: "8", r: "1", fill: "currentColor", stroke: "none" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "12.8", cy: "8", r: "1", fill: "currentColor", stroke: "none" })
        ] });
      case "bell":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M4 11h8l-1-1.6V6.7A3 3 0 0 0 8 3.7a3 3 0 0 0-3 3v2.7Z" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M6.7 11a1.35 1.35 0 0 0 2.6 0" })
        ] });
      case "checklist":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M3 4.6l1.15 1.15L6.4 3.5" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M3 11.1l1.15 1.15L6.4 10" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M8.3 5h4.7M8.3 11.5h4.7" })
        ] });
      case "refresh":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M12.7 6.1A5 5 0 1 0 13 9.3" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M12.8 2.9v3.4H9.4" })
        ] });
      case "download":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M8 2.8v7.4" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "m5.2 7.5 2.8 2.8 2.8-2.8" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M3 12.9h10" })
        ] });
      case "upload":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M8 10.4V3" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M5.2 5.8 8 3l2.8 2.8" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M3 12.9h10" })
        ] });
      case "plus":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M8 3.2v9.6M3.2 8h9.6" });
      case "close":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "m4.2 4.2 7.6 7.6M11.8 4.2l-7.6 7.6" });
      case "check":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "m3.4 8.2 3 3 6.2-6.4" });
      case "warning":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M8 2.7 14 13H2Z" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M8 6.3v3.2M8 11.4v.1" })
        ] });
      case "search":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "7", cy: "7", r: "4.4" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "m10.3 10.3 2.5 2.5" })
        ] });
      case "filter":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M2.7 3.4h10.6L9.2 8v4.1l-2.4 1V8Z" });
      case "sort":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M4.5 3v10M2.3 10.8 4.5 13l2.2-2.2" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M11.5 13V3M9.3 5.2 11.5 3l2.2 2.2" })
        ] });
      case "copy":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("rect", { x: "5.2", y: "5.2", width: "8", height: "8.3", rx: "1.2" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M10.8 5.2V3.7A1.2 1.2 0 0 0 9.6 2.5H3.7A1.2 1.2 0 0 0 2.5 3.7v5.9a1.2 1.2 0 0 0 1.2 1.2h1.5" })
        ] });
      case "external":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M9 2.8h4.2v4.2" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "m13 3-5.6 5.6" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M6.7 3.2H3.5a.7.7 0 0 0-.7.7v8.6c0 .4.3.7.7.7h8.6a.7.7 0 0 0 .7-.7v-3.2" })
        ] });
      case "comment":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M13 8.6c0 2.1-2.2 3.8-5 3.8-.6 0-1.2 0-1.7-.2L3.4 13.3l.8-2.2A3.6 3.6 0 0 1 3 8.6c0-2.1 2.2-3.8 5-3.8s5 1.7 5 3.8Z" });
      case "folder":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M2.5 4.3c0-.6.4-1 1-1h2.4l1.2 1.2h7.4c.6 0 1 .4 1 1v6.2c0 .6-.4 1-1 1H3.5c-.6 0-1-.4-1-1Z" });
      case "file":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M4 2.5h5l3 3v8H4Z" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M9 2.7v3.2h3" })
        ] });
      case "play":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M5.2 3.4 12 8l-6.8 4.6Z" });
      case "stop":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("rect", { x: "4.2", y: "4.2", width: "7.6", height: "7.6", rx: "1" });
      case "clock":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "8", cy: "8", r: "5.5" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M8 4.8V8l2.1 1.3" })
        ] });
      case "sparkles":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M8 2.4 9 5.4l3 1-3 1-1 3-1-3-3-1 3-1Z" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M12.8 9.6l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5Z" })
        ] });
      case "settings":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "8", cy: "8", r: "2.1" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M8 1.8v1.3M8 12.9v1.3M1.8 8h1.3M12.9 8h1.3M3.6 3.6l.9.9M11.5 11.5l.9.9M12.4 3.6l-.9.9M4.5 11.5l-.9.9" })
        ] });
      case "arrow-left":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M12.8 8H3.2" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M6.7 4.5 3.2 8l3.5 3.5" })
        ] });
      case "inbox":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M2.5 9.4 4.2 3.5h7.6l1.7 5.9v3.1H2.5Z" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M2.6 9.4h3.1l.8 1.5h3l.8-1.5h3.1" })
        ] });
      case "pipeline":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "4", cy: "3.4", r: "1.2" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "8", cy: "8", r: "1.2" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "12", cy: "12.6", r: "1.2" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M5.1 3.7 7.1 7M8.9 9 11 12" })
        ] });
      case "issue":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "8", cy: "8", r: "5.4" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "8", cy: "8", r: "1.2", fill: "currentColor", stroke: "none" })
        ] });
      case "mr":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "4.4", cy: "3.7", r: "1.4" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "4.4", cy: "12.2", r: "1.4" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "11.6", cy: "8", r: "1.4" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M4.4 5.2v5.6M11.5 6.6c0 2-1.9 1.4-3.6 1.6-1 .1-1.9.4-2.5 1" })
        ] });
      case "link":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M6.3 9.6 9.7 6.2" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M7.4 4.7 8.7 3.4a2.5 2.5 0 0 1 3.5 3.5l-1.3 1.3" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M8.6 11.3 7.3 12.6a2.5 2.5 0 0 1-3.5-3.5l1.3-1.3" })
        ] });
      case "eye":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M1.8 8S4.1 4.2 8 4.2 14.2 8 14.2 8 11.9 11.8 8 11.8 1.8 8 1.8 8Z" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "8", cy: "8", r: "1.7" })
        ] });
      case "undo":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M3.2 7.8h6.4a3.1 3.1 0 0 1 0 6.2H6.5" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M5.7 4.8 2.7 7.8l3 3" })
        ] });
      case "archive":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("rect", { x: "2.5", y: "3", width: "11", height: "3", rx: "0.8" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M3.5 6v6c0 .6.4 1 1 1h7c.6 0 1-.4 1-1V6" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M6.3 8.7h3.4" })
        ] });
      case "cloud-upload":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M5.1 11.6a2.8 2.8 0 0 1-.2-5.6A3.8 3.8 0 0 1 12 7a2.3 2.3 0 0 1-.3 4.6" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M8 13V7.8M5.9 9.5 8 7.4l2.1 2.1" })
        ] });
      case "check-circle":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "8", cy: "8", r: "5.5" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "m5.3 8.1 1.9 1.9 3.6-3.8" })
        ] });
      case "x-circle":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "8", cy: "8", r: "5.5" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "m5.9 5.9 4.2 4.2M10.1 5.9 5.9 10.1" })
        ] });
      case "dot":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "8", cy: "8", r: "2.2", fill: "currentColor", stroke: "none" });
      case "circle":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "8", cy: "8", r: "5.3" });
      case "return":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M12.5 4.3v4.1H4.3" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M7 6 4.3 8.4 7 10.8" })
        ] });
      case "shield":
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M8 2.2 13 4v3.4c0 3-2.1 5.3-5 6.4-2.9-1.1-5-3.4-5-6.4V4Z" });
      default:
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "8", cy: "8", r: "5.5" });
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { ...common, children: path() });
}
function Button(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "button",
    {
      type: props.type ?? "button",
      className: `glp-btn ${props.className ?? ""}`,
      "data-variant": props.variant ?? void 0,
      "data-size": props.size ?? void 0,
      disabled: props.disabled || props.busy,
      title: props.title,
      onClick: props.onClick,
      children: [
        props.busy ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "glp-spinner", style: { width: 11, height: 11, borderWidth: 1.5 } }) : props.icon ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: props.icon, size: 12 }) : null,
        props.children
      ]
    }
  );
}
function IconButton(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "button",
    {
      type: "button",
      className: `glp-icon-btn ${props.className ?? ""}`,
      "aria-label": props.label,
      title: props.label,
      "aria-pressed": props.pressed,
      "data-pressed": props.pressed ? "" : void 0,
      disabled: props.disabled,
      onClick: props.onClick,
      children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: props.icon, size: props.size ?? 14 })
    }
  );
}
function Menu(props) {
  const [open, setOpen] = (0, import_react3.useState)(false);
  const trigger = (0, import_react3.useRef)(null);
  const menu = (0, import_react3.useRef)(null);
  const [pos, setPos] = (0, import_react3.useState)({ top: 0, left: 0 });
  (0, import_react3.useLayoutEffect)(() => {
    if (!open || !trigger.current) return;
    const rect = trigger.current.getBoundingClientRect();
    const width = 220;
    const left = props.align === "end" ? Math.max(6, rect.right - width) : Math.min(window.innerWidth - width - 6, rect.left);
    const top = rect.bottom + 4;
    setPos({ top: Math.min(top, window.innerHeight - 40), left });
  }, [open, props.align]);
  (0, import_react3.useEffect)(() => {
    if (!open) return;
    const away = (event) => {
      if (menu.current?.contains(event.target) || trigger.current?.contains(event.target)) return;
      setOpen(false);
    };
    const key = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", key);
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", key);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { ref: trigger, className: props.className, children: props.trigger === "text" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Button, { size: "sm", icon: props.icon, disabled: props.disabled, onClick: () => setOpen((value) => !value), children: props.label }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IconButton, { icon: props.icon ?? "dots", label: props.label ?? "Menu", disabled: props.disabled, pressed: open, onClick: () => setOpen((value) => !value) }) }),
    open ? (0, import_react_dom.createPortal)(
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "glp-portal", style: { inset: 0, pointerEvents: "none" }, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { ref: menu, className: "glp-menu", role: "menu", style: { position: "fixed", top: pos.top, left: pos.left, pointerEvents: "auto" }, children: props.items.map(
        (item, index) => item.type === "separator" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "glp-menu-sep" }, index) : item.type === "header" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "glp-menu-item", style: { opacity: 0.55, cursor: "default", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.04em" }, children: item.label }, index) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "button",
          {
            type: "button",
            className: "glp-menu-item",
            role: "menuitem",
            disabled: item.disabled,
            style: item.danger ? { color: "var(--glp-danger)" } : void 0,
            onClick: () => {
              setOpen(false);
              item.onSelect();
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: { width: 14, display: "inline-flex", justifyContent: "center" }, children: item.checked ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "check", size: 12 }) : item.icon ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: item.icon, size: 12 }) : null }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "glp-ellipsis", style: { flex: 1 }, children: item.label }),
              item.hint ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "glp-kbd", children: item.hint }) : null
            ]
          },
          index
        )
      ) }) }),
      document.body
    ) : null
  ] });
}
function Modal(props) {
  (0, import_react3.useEffect)(() => {
    if (!props.open) return;
    const key = (event) => {
      if (event.key === "Escape") props.onClose();
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [props.open, props.onClose]);
  if (!props.open) return null;
  return (0, import_react_dom.createPortal)(
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "glp-portal", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "glp-mask", onMouseDown: props.onClose }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "glp-dialog", role: "dialog", "aria-modal": "true", style: { width: props.width }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "glp-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { style: { flex: 1 }, children: props.title }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(IconButton, { icon: "close", label: t("Close"), onClick: props.onClose })
        ] }),
        props.children,
        props.footer ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "glp-dialog-actions", children: props.footer }) : null
      ] })
    ] }),
    document.body
  );
}
function Toasts() {
  const toasts2 = useToasts();
  if (toasts2.length === 0) return null;
  return (0, import_react_dom.createPortal)(
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "glp-portal", style: { inset: 0, pointerEvents: "none" }, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "glp-toasts", children: toasts2.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "glp-toast", "data-tone": entry.tone, role: "status", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: entry.title }),
      entry.description ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("small", { children: entry.description }) : null,
      entry.action ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "button",
        {
          type: "button",
          onClick: () => {
            entry.action?.run();
            dismissToast(entry.id);
          },
          children: entry.action.label
        }
      ) : null,
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", onClick: () => dismissToast(entry.id), style: { opacity: 0.65 }, children: t("Dismiss") })
    ] }, entry.id)) }) }),
    document.body
  );
}
function Markdown(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: `glp-md ${props.className ?? ""}`, children: renderMarkdown(props.text ?? "", props.repo, props.onOpenItem) });
}
function renderMarkdown(text, repo, open) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let index = 0;
  let key = 0;
  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (line.startsWith("```")) {
      const language2 = line.slice(3).trim();
      const body = [];
      index++;
      while (index < lines.length && !(lines[index] ?? "").startsWith("```")) {
        body.push(lines[index] ?? "");
        index++;
      }
      index++;
      blocks.push(
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("pre", { "data-language": language2 || void 0, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("code", { children: body.join("\n") }) }, key++)
      );
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const level = Math.min(4, (heading[1] ?? "#").length);
      const content = inline(heading[2] ?? "", repo, open);
      blocks.push(level === 1 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h1", { children: content }, key++) : level === 2 ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { children: content }, key++) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { children: content }, key++));
      index++;
      continue;
    }
    if (/^\s*([-*_])\s*\1\s*\1\s*$/.test(line)) {
      blocks.push(/* @__PURE__ */ (0, import_jsx_runtime3.jsx)("hr", {}, key++));
      index++;
      continue;
    }
    if (/^>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^>\s?/.test(lines[index] ?? "")) {
        quote.push((lines[index] ?? "").replace(/^>\s?/, ""));
        index++;
      }
      blocks.push(/* @__PURE__ */ (0, import_jsx_runtime3.jsx)("blockquote", { children: renderMarkdown(quote.join("\n"), repo, open) }, key++));
      continue;
    }
    const listMatch = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(line);
    if (listMatch) {
      const ordered = /\d/.test(listMatch[2] ?? "-");
      const items = [];
      while (index < lines.length) {
        const current2 = lines[index] ?? "";
        const match = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(current2);
        if (!match) break;
        const raw = match[3] ?? "";
        const task = /^\[([ xX])]\s+(.*)$/.exec(raw);
        items.push({ text: task ? task[2] ?? "" : raw, task: !!task, done: task ? (task[1] ?? "").toLowerCase() === "x" : void 0 });
        index++;
      }
      const content = items.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("li", { style: item.task ? { listStyle: "none", marginLeft: -16 } : void 0, children: [
        item.task ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { type: "checkbox", checked: !!item.done, readOnly: true, style: { marginRight: 6 } }) : null,
        inline(item.text, repo, open)
      ] }, i));
      blocks.push(ordered ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ol", { children: content }, key++) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("ul", { children: content }, key++));
      continue;
    }
    if (line.trim() === "") {
      index++;
      continue;
    }
    const paragraph = [line];
    index++;
    while (index < lines.length) {
      const next = lines[index] ?? "";
      if (next.trim() === "" || next.startsWith("```") || /^#{1,6}\s/.test(next) || /^>\s?/.test(next) || /^(\s*)([-*+]|\d+[.)])\s+/.test(next) || /^\s*([-*_])\s*\1\s*\1\s*$/.test(next)) break;
      paragraph.push(next);
      index++;
    }
    blocks.push(/* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { children: inline(paragraph.join("\n"), repo, open) }, key++));
  }
  return blocks;
}
var INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(__[^_]+__)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))|(https?:\/\/[^\s<>()]+)|(((?:[\w.-]+\/)+[\w.-]+)?[#!]\d{1,7}\b)/g;
function inline(text, repo, open) {
  const nodes = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(INLINE)) {
    const at = match.index ?? 0;
    if (at > last) nodes.push(text.slice(last, at));
    const token = match[0];
    if (token.startsWith("`")) nodes.push(/* @__PURE__ */ (0, import_jsx_runtime3.jsx)("code", { children: token.slice(1, -1) }, key++));
    else if (token.startsWith("**") || token.startsWith("__")) nodes.push(/* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: token.slice(2, -2) }, key++));
    else if (token.startsWith("*") && token.endsWith("*")) nodes.push(/* @__PURE__ */ (0, import_jsx_runtime3.jsx)("em", { children: token.slice(1, -1) }, key++));
    else if (token.startsWith("[")) {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      const href = link ? safeHref(link[2] ?? "") : void 0;
      if (link && href) nodes.push(/* @__PURE__ */ (0, import_jsx_runtime3.jsx)("a", { href, target: "_blank", rel: "noreferrer", children: link[1] }, key++));
      else nodes.push(link?.[1] ?? token);
    } else if (token.startsWith("http")) {
      const href = token.replace(/[.,;:!?]+$/, "");
      const safe2 = safeHref(href);
      if (safe2) nodes.push(/* @__PURE__ */ (0, import_jsx_runtime3.jsx)("a", { href: safe2, target: "_blank", rel: "noreferrer", children: href }, key++));
      else nodes.push(href);
      if (href !== token) nodes.push(token.slice(href.length));
    } else {
      const ref = /^(?:((?:[\w.-]+\/)+[\w.-]+))?([#!])(\d{1,7})$/.exec(token);
      if (ref && open) {
        const number = Number(ref[3]);
        const target = ref[1] ?? repo;
        const kind = ref[2] === "!" ? "mr" : "issue";
        nodes.push(
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "a",
            {
              href: target ? `${kind === "mr" ? "!" : "#"}${ref[3]}` : void 0,
              className: "glp-mention",
              onClick: (event) => {
                event.preventDefault();
                if (target) open(kind, number);
              },
              title: target ?? "",
              children: token
            },
            key++
          )
        );
      } else nodes.push(token);
    }
    last = at + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
function safeHref(value) {
  try {
    const url2 = new URL(value, document.baseURI);
    return url2.protocol === "http:" || url2.protocol === "https:" || url2.protocol === "mailto:" ? value : void 0;
  } catch {
    return void 0;
  }
}
function LabelChip(props) {
  const color = `#${(props.label.color || "888888").replace(/^#/, "")}`;
  const rgb = color.length === 7 ? [1, 3, 5].map((at) => parseInt(color.slice(at, at + 2), 16)) : [136, 136, 136];
  const luminance = (0.299 * (rgb[0] ?? 0) + 0.587 * (rgb[1] ?? 0) + 0.114 * (rgb[2] ?? 0)) / 255;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "glp-label", style: { background: `${color}22`, color: luminance > 0.6 ? "var(--glp-text-2)" : color, borderColor: `${color}55` }, title: props.label.description, children: props.label.name });
}
function Avatar(props) {
  const size = props.size ?? 18;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "glp-avatar", style: { width: size, height: size, background: colorFor(props.name), fontSize: Math.max(7, Math.round(size / 2.3)) }, title: props.name, children: initials(props.name) });
}
function StateIcon(props) {
  if (props.kind === "mr") {
    if (props.draft && props.state === "OPEN") return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "glp-state", "data-state": "DRAFT", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "circle", size: 13 }) });
    if (props.state === "MERGED") return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "glp-state", "data-state": "MERGED", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "check-circle", size: 13 }) });
    if (props.state === "CLOSED") return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "glp-state", "data-state": "CLOSED", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "x-circle", size: 13 }) });
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "glp-state", "data-state": "OPEN", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "mr", size: 13 }) });
  }
  if (props.state === "CLOSED") return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "glp-state", "data-state": "CLOSED", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "check-circle", size: 13 }) });
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "glp-state", "data-state": "OPEN", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "issue", size: 13 }) });
}
function CheckDot(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "glp-check-dot", "data-state": props.state, title: `Checks: ${props.state}` });
}
function StatusPill(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "glp-status-pill", "data-status": props.status, children: props.children ?? props.status });
}
function Pill(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "glp-pill", "data-tone": props.tone, title: props.title, children: props.children });
}
function Spinner() {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "glp-spinner" });
}
function TextArea(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "textarea",
    {
      className: `glp-textarea ${props.className ?? ""}`,
      rows: props.rows ?? 4,
      value: props.value,
      placeholder: props.placeholder,
      autoFocus: props.autoFocus,
      "data-mono": props.mono ? "" : void 0,
      onChange: props.onChange,
      onKeyDown: props.onKeyDown
    }
  );
}
function Empty(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "glp-empty", "data-inline": props.inline ? "" : void 0, children: [
    props.icon ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: props.icon, size: 20 }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: props.children })
  ] });
}
function Age(props) {
  const label = relativeAge(props.date);
  if (!label) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { title: props.title ? new Date(typeof props.date === "number" ? props.date * 1e3 : String(props.date)).toLocaleString() : void 0, children: label });
}
function Clamp(props) {
  const [own, setOwn] = (0, import_react3.useState)(false);
  const [clamps, setClamps] = (0, import_react3.useState)(false);
  const ref = (0, import_react3.useRef)(null);
  const lines = props.lines ?? 8;
  const open = props.open ?? own;
  (0, import_react3.useLayoutEffect)(() => {
    const element = ref.current;
    if (!element || lines <= 0) {
      setClamps(false);
      return;
    }
    const measure = () => {
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight) || 18;
      setClamps(element.scrollHeight > lineHeight * (lines + 2));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [lines, props.children]);
  if (lines <= 0) return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "glp-clamp", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "glp-clamp-box", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { children: props.children }) }) });
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "glp-clamp", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "glp-clamp-box", style: { maxHeight: clamps && !open ? `${lines * 1.6}em` : void 0 }, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { ref, children: props.children }) }),
    clamps ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "button",
      {
        type: "button",
        className: "glp-clamp-toggle",
        onClick: () => {
          setOwn(!open);
          props.onOpen?.(!open);
        },
        children: open ? t("Show less") : t("Show more")
      }
    ) : null
  ] });
}
function copyText(text) {
  void navigator.clipboard?.writeText(text).catch(() => void 0);
}
function Segmented(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "glp-row", style: { gap: 2 }, children: props.options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "button",
    {
      type: "button",
      className: "glp-tab",
      "data-selected": props.value === option.value ? "" : void 0,
      title: option.title,
      onClick: () => props.onChange(option.value),
      children: option.label
    },
    option.value
  )) });
}
function InlineError(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "glp-error", role: "alert", children: props.error instanceof Error ? props.error.message : String(props.error) });
}
function Checkbox(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { className: "glp-checkbox", title: props.label, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "input",
      {
        type: "checkbox",
        checked: props.checked,
        ref: (element) => {
          if (element) element.indeterminate = !!props.indeterminate;
        },
        onChange: (event) => props.onChange(event.target.checked)
      }
    ),
    props.label ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: props.label }) : null
  ] });
}

// src/client/chip.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
function HeaderChip(props) {
  const cwd = useCwd(props);
  const [prefs2] = usePrefs();
  const overview = useOverview(cwd, { poll: 15e3, enabled: !!cwd });
  const mrs = useMrs(cwd, !!overview.data?.remote);
  const data = overview.data;
  (0, import_react4.useEffect)(() => {
    if (data?.remote) setCurrentRepo(data.remote.path);
  }, [data?.remote?.path]);
  if (!prefs2.headerChip || !data) return null;
  const mr = mrFor(mrs.data, data.branch, data.head, data.defaultBranch);
  const dirty = data.files.length > 0;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { "data-glp": "", style: { display: "inline-flex", alignItems: "center", gap: 4, minWidth: 0, maxWidth: 280 }, title: data.root, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
      "button",
      {
        type: "button",
        className: "glp-btn",
        "data-variant": "ghost",
        "data-size": "sm",
        style: { maxWidth: 160, gap: 4 },
        onClick: () => nav.openMain(),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, { name: "branch", size: 11 }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "glp-ellipsis", children: data.branch ?? data.head?.slice(0, 7) ?? "" }),
          dirty ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "var(--glp-warn)", fontSize: 8 }, children: "\u25CF" }) : null,
          data.operation ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, { name: "warning", size: 10 }) : null
        ]
      }
    ),
    mr ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
      "button",
      {
        type: "button",
        className: "glp-btn",
        "data-variant": "ghost",
        "data-size": "sm",
        style: { maxWidth: 190, gap: 4 },
        title: mr.title,
        onClick: () => {
          nav.openMain();
          if (data.remote) nav.openItem({ repo: data.remote.path, kind: "mr", number: mr.number });
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(CheckDot, { state: mr.checks }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "glp-ellipsis", children: [
            "!",
            mr.number,
            " ",
            mr.title
          ] })
        ]
      }
    ) : null
  ] });
}
function ComposerPill(props) {
  const sessionId = String(props?.sessionId ?? props?.session?.sessionId ?? "");
  const agent = useAgent(sessionId);
  if (!agent.data) return null;
  const proposed = agent.data.actions.filter((action) => action.status === "proposed").length;
  const running = agent.data.actions.filter((action) => action.status === "approved" || action.status === "running").length;
  const done = agent.data.actions.filter((action) => action.status === "done").length;
  if (proposed + running + done === 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { "data-glp": "", style: { display: "inline-flex", alignItems: "center", gap: 6 }, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("button", { type: "button", className: "glp-btn", "data-size": "sm", "data-variant": proposed > 0 ? "primary" : "ghost", onClick: () => nav.openMain({ show: "activity" }), title: t("Agent proposed changes"), children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, { name: "gitlab", size: 11 }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: "GitLab" }),
    proposed > 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
      proposed,
      " ",
      t("to approve")
    ] }) : running > 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
      running,
      " ",
      t("running")
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
      done,
      " ",
      t("done")
    ] })
  ] }) });
}

// src/client/ci.tsx
var import_react6 = require("react");
init_api();

// src/client/actions.tsx
var import_react5 = require("react");
init_api();
init_i18n();
var import_jsx_runtime5 = require("react/jsx-runtime");
function errorToast(error, title = "Error") {
  toast({ tone: "error", title: t(title), description: errorText(error) });
}
function openExternal(url2) {
  const ctx = pluginCtx();
  try {
    if (ctx.system?.openExternal) return ctx.system.openExternal(url2);
  } catch {
  }
  window.open(url2, "_blank", "noopener");
}
function savedRepliesFor(repo) {
  return getPrefs().savedReplies.filter((reply) => reply.repo === repo);
}
function rememberReply(repo, name2, body) {
  updatePrefs((draft) => {
    draft.savedReplies = [...draft.savedReplies.filter((reply) => !(reply.repo === repo && reply.name === name2)), { id: crypto.randomUUID(), repo, name: name2, body }];
  });
}
function rememberSavedSearch(repo, kind, name2, query) {
  updatePrefs((draft) => {
    draft.savedSearches = [...draft.savedSearches.filter((entry) => !(entry.repo === repo && entry.kind === kind && entry.name === name2)), { id: crypto.randomUUID(), repo, kind, name: name2, query }];
  });
}
function forgetSavedSearch(id) {
  updatePrefs((draft) => {
    draft.savedSearches = draft.savedSearches.filter((entry) => entry.id !== id);
  });
}
function rememberIssueBranch(repo, branch, number) {
  updatePrefs((draft) => {
    draft.issueBranches[`${repo}:${branch}`] = number;
  });
}
function branchForIssue(repo, number) {
  return Object.entries(getPrefs().issueBranches).find(([key, value]) => value === number && key.startsWith(`${repo}:`))?.[0].slice(repo.length + 1);
}
function forgetIssueBranch(repo, branch) {
  updatePrefs((draft) => {
    delete draft.issueBranches[`${repo}:${branch}`];
  });
}
function refreshGit(cwd) {
  for (const key of [keys.overview(cwd), keys.branches(cwd), keys.outgoing(cwd), keys.mrs(cwd), keys.merged(cwd)]) {
    void queryClient.invalidateQueries({ queryKey: key });
  }
  void queryClient.invalidateQueries({ queryKey: ["log", cwd] });
}
async function dropMerged(cwd, branch, tip, mr) {
  const force = !!tip && !!mr.sha && mr.sha.startsWith(tip);
  try {
    await rpc("deleteBranch", { cwd, name: branch, force });
    return true;
  } catch (error) {
    if (!/not fully merged/i.test(errorText(error))) {
      errorToast(error);
      return false;
    }
    const sure = window.confirm(
      t("Delete {branch} anyway? !{number} merged, but this branch has commits that are not part of it.", { branch, number: mr.number })
    );
    if (!sure) return false;
    try {
      await rpc("deleteBranch", { cwd, name: branch, force: true });
      return true;
    } catch (retry) {
      errorToast(retry);
      return false;
    }
  }
}
async function finishBranch(cwd, overview, mr) {
  const branch = overview.branch;
  const base = overview.defaultBranch;
  if (!branch || !base) return false;
  if (!window.confirm(t("Switch to {base}, pull it, then delete {branch}?", { base, branch }))) return false;
  const listed = await api.branches(cwd).catch(() => []);
  const locals = listed.filter((entry) => !entry.remote).map((entry) => entry.name);
  const has = locals.includes(base);
  try {
    await rpc("checkout", { cwd, ref: base, track: has ? null : `${overview.remote?.name ?? "origin"}/${base}` });
  } catch (error) {
    errorToast(error);
    return false;
  }
  if (has && overview.remote) await rpc("pull", { cwd }).catch((error) => errorToast(error));
  const tip = listed.find((entry) => !entry.remote && entry.name === branch)?.sha;
  const dropped = await dropMerged(cwd, branch, tip, mr);
  if (dropped && overview.remote) forgetIssueBranch(overview.remote.path, branch);
  refreshGit(cwd);
  if (dropped) toast({ tone: "success", title: t("Finished {branch}", { branch }) });
  return dropped;
}
async function finishWorktree(cwd, overview, mr, root) {
  const branch = overview.branch;
  if (!branch) return false;
  if (!window.confirm(t("Remove the worktree at {cwd} and delete {branch}?", { cwd: overview.root, branch }))) return false;
  const remove = (force) => rpc("worktreeRemove", { cwd, path: overview.root, force });
  try {
    await remove(false);
  } catch (error) {
    if (!/modified or untracked|--force/i.test(errorText(error))) {
      errorToast(error);
      return false;
    }
    if (!window.confirm(t("{cwd} still has local changes. Remove it anyway? They are lost.", { cwd: overview.root }))) return false;
    try {
      await remove(true);
    } catch (retry) {
      errorToast(retry);
      return false;
    }
  }
  const tip = (await api.branches(root).catch(() => [])).find((entry) => !entry.remote && entry.name === branch)?.sha;
  const openRoot = { label: t("Open the project root"), run: () => void openSessionAt(root) };
  const dropped = await dropMerged(root, branch, tip, mr);
  if (dropped && overview.remote) forgetIssueBranch(overview.remote.path, branch);
  refreshGit(root);
  toast(
    dropped ? { tone: "success", title: t("Finished {branch}", { branch }), action: openRoot } : { tone: "info", title: t("Worktree removed"), action: openRoot }
  );
  return dropped;
}
function itemQuote(item) {
  const head = `${item.kind === "mr" ? "Merge request" : "Issue"} ${item.repo}${item.kind === "mr" ? "!" : "#"}${item.number}: ${item.title}`;
  return [`> ${head}`, `> ${item.url}`, "", item.body.slice(0, 3e3)].join("\n");
}
async function askAboutItems(sessionID, cwd, label, items) {
  const text = [
    label,
    "",
    // GitLab numbers issues and merge requests separately, so the agent needs the mark to tell them apart.
    ...items.map((item) => `- ${item.kind === "mr" ? "!" : "#"}${item.number} (${item.state.toLowerCase()}) ${item.title} \u2014 ${item.url}`),
    "",
    "Help me decide what to do with them."
  ].join("\n");
  const { quoteToChat: quoteToChat2 } = await Promise.resolve().then(() => (init_api(), api_exports));
  await quoteToChat2(sessionID, cwd, text);
}
function itemWorkingPrompt(item, base) {
  return [
    `Work on this ${item.kind === "mr" ? "merge request" : "issue"} in ${item.repo}. The branch ${base} was created for it.`,
    "",
    itemQuote(item),
    "",
    "Read the code, make the change, and run the relevant checks. Use the gitlab_panel tools to comment on or update the issue if something needs the user's attention; writes wait for their approval."
  ].join("\n");
}
function reviewPrompt(item) {
  return [
    `Review merge request ${item.repo}!${item.number} for me.`,
    "",
    `Start with gitlab_panel_diff (repo "${item.repo}", number ${item.number}); pass path to read one file in full.`,
    "Then draft the review with gitlab_panel_review: a concise summary, a verdict (COMMENT, APPROVE or REQUEST_CHANGES), and inline comments on precise lines of the diff. Only mention real problems; skip style nits unless they matter.",
    "Nothing is posted until I submit the draft in the GitLab panel. Stop after drafting."
  ].join("\n");
}
function PromptDialog(props) {
  const [value, setValue] = (0, import_react5.useState)(props.initial ?? "");
  const [busy, setBusy] = (0, import_react5.useState)(false);
  (0, import_react5.useEffect)(() => {
    if (props.open) setValue(props.initial ?? "");
  }, [props.open, props.initial]);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    Modal,
    {
      open: props.open,
      title: props.title,
      onClose: props.onClose,
      footer: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { variant: "ghost", onClick: props.onClose, children: t("Cancel") }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          Button,
          {
            variant: "primary",
            busy,
            disabled: !value.trim(),
            onClick: async () => {
              setBusy(true);
              try {
                await props.onSubmit(value);
                props.onClose();
              } catch (error) {
                errorToast(error);
              } finally {
                setBusy(false);
              }
            },
            children: props.confirm ?? t("Submit")
          }
        )
      ] }),
      children: props.multiline ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(TextArea, { rows: 6, autoFocus: true, value, placeholder: props.placeholder, onChange: (event) => setValue(event.target.value) }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { className: "glp-input", autoFocus: true, value, placeholder: props.placeholder, onChange: (event) => setValue(event.target.value) })
    }
  );
}
function NewBranchDialog(props) {
  const [name2, setName] = (0, import_react5.useState)(props.branch ?? "");
  const [start, setStart] = (0, import_react5.useState)(props.start ?? "");
  const [checkout, setCheckout] = (0, import_react5.useState)(true);
  const [busy, setBusy] = (0, import_react5.useState)(false);
  (0, import_react5.useEffect)(() => {
    if (props.open) {
      setName(props.branch ?? "");
      setStart(props.start ?? "");
    }
  }, [props.open, props.branch, props.start]);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    Modal,
    {
      open: props.open,
      title: t("New branch"),
      onClose: props.onClose,
      footer: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { variant: "ghost", onClick: props.onClose, children: t("Cancel") }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          Button,
          {
            variant: "primary",
            busy,
            disabled: !name2.trim(),
            onClick: async () => {
              setBusy(true);
              try {
                await rpc("createBranch", { cwd: props.cwd, name: name2.trim(), start: start.trim() || null, checkout });
                toast({ tone: "success", title: t("Branch created") });
                props.onClose();
                props.onDone();
              } catch (error) {
                errorToast(error);
              } finally {
                setBusy(false);
              }
            },
            children: t("Create")
          }
        )
      ] }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Branch name") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { className: "glp-input", autoFocus: true, value: name2, onChange: (event) => setName(event.target.value), placeholder: "feat/my-change" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Start point") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { className: "glp-input", value: start, onChange: (event) => setStart(event.target.value), placeholder: "origin/main (defaults to HEAD)" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Checkbox, { checked: checkout, onChange: setCheckout, label: t("Checkout after creating") })
      ]
    }
  );
}
function CreateMrDialog(props) {
  const [title, setTitle] = (0, import_react5.useState)("");
  const [body, setBody] = (0, import_react5.useState)("");
  const [base, setBase] = (0, import_react5.useState)(props.defaultBranch ?? "main");
  const [draft, setDraft] = (0, import_react5.useState)(getPrefs().prDraft);
  const [template, setTemplate] = (0, import_react5.useState)();
  const [busy, setBusy] = (0, import_react5.useState)(false);
  const [loading, setLoading] = (0, import_react5.useState)(false);
  const [error, setError] = (0, import_react5.useState)();
  (0, import_react5.useEffect)(() => {
    if (!props.open) return;
    setBase(props.defaultBranch ?? "main");
    setDraft(getPrefs().prDraft);
    setLoading(true);
    setError(void 0);
    api.mrDefaults(props.cwd, props.defaultBranch ?? "main").then((defaults) => {
      setTitle(defaults.title);
      setBody(defaults.body);
      setTemplate(defaults.template);
    }).catch((reason) => setError(errorText(reason))).finally(() => setLoading(false));
  }, [props.open, props.cwd, props.defaultBranch]);
  const baseOptions = (0, import_react5.useMemo)(() => {
    const names = props.branches.filter((branch) => !branch.remote).map((branch) => branch.name);
    return [.../* @__PURE__ */ new Set([props.defaultBranch ?? "main", ...names])];
  }, [props.branches, props.defaultBranch]);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    Modal,
    {
      open: props.open,
      title: t("Create merge request"),
      onClose: props.onClose,
      width: 620,
      footer: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { variant: "ghost", onClick: props.onClose, children: t("Cancel") }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          Button,
          {
            variant: "primary",
            busy,
            disabled: !title.trim(),
            onClick: async () => {
              setBusy(true);
              try {
                const finalBody = props.issueNumber ? withClosing(body.trim() ? body : template ?? "", props.issueNumber) : body;
                const url2 = await rpc("createMr", { cwd: props.cwd, title: title.trim(), body: finalBody, base, draft });
                updatePrefs((prefs2) => {
                  prefs2.prDraft = draft;
                });
                toast({ tone: "success", title: t("Merge request created"), description: url2, action: url2 ? { label: t("Open on GitLab"), run: () => openExternal(url2) } : void 0 });
                props.onClose();
                props.onDone();
              } catch (reason) {
                errorToast(reason);
              } finally {
                setBusy(false);
              }
            },
            children: t("Create")
          }
        )
      ] }),
      children: loading ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "glp-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Spinner, {}),
        " ",
        t("Loading\u2026")
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
        error ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(InlineError, { error }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "glp-split", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Source") }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { className: "glp-input", value: props.branch ?? "", readOnly: true })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Base branch") }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("select", { className: "glp-select", value: base, onChange: (event) => setBase(event.target.value), children: baseOptions.map((name2) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: name2, children: name2 }, name2)) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Title") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { className: "glp-input", value: title, onChange: (event) => setTitle(event.target.value) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Description") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(TextArea, { rows: 8, value: body, onChange: (event) => setBody(event.target.value), placeholder: template ? t("Pull request template is available") : void 0 })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "glp-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Checkbox, { checked: draft, onChange: setDraft, label: t("Create as draft") }),
          template ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            Button,
            {
              size: "sm",
              variant: "ghost",
              onClick: () => {
                setBody((current2) => current2.trim() ? `${current2.trimEnd()}

${template}` : template);
              },
              children: t("Insert template")
            }
          ) : null
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "glp-faint", style: { fontSize: 11 }, children: "Title, body and template are filled from the commits and the repository's merge request template. Pushing happens first if the branch is not on the remote." })
      ] })
    }
  );
}
function CreateIssueDialog(props) {
  const [title, setTitle] = (0, import_react5.useState)("");
  const [body, setBody] = (0, import_react5.useState)("");
  const [busy, setBusy] = (0, import_react5.useState)(false);
  (0, import_react5.useEffect)(() => {
    if (props.open) {
      setTitle("");
      setBody("");
    }
  }, [props.open]);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    Modal,
    {
      open: props.open,
      title: t("New issue"),
      onClose: props.onClose,
      width: 600,
      footer: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { variant: "ghost", onClick: props.onClose, children: t("Cancel") }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          Button,
          {
            variant: "primary",
            busy,
            disabled: !title.trim(),
            onClick: async () => {
              setBusy(true);
              try {
                const url2 = await rpc("createIssue", { cwd: props.cwd, title: title.trim(), body });
                toast({ tone: "success", title: t("Issue created"), description: url2, action: url2 ? { label: t("Open on GitLab"), run: () => openExternal(url2) } : void 0 });
                props.onClose();
                props.onDone();
              } catch (error) {
                errorToast(error);
              } finally {
                setBusy(false);
              }
            },
            children: t("Create")
          }
        )
      ] }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Title") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { className: "glp-input", autoFocus: true, value: title, onChange: (event) => setTitle(event.target.value) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Description") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(TextArea, { rows: 8, value: body, onChange: (event) => setBody(event.target.value) })
        ] })
      ]
    }
  );
}
function CloseDialog(props) {
  const [reason, setReason] = (0, import_react5.useState)("completed");
  const [duplicateOf, setDuplicateOf] = (0, import_react5.useState)("");
  const [comment, setComment] = (0, import_react5.useState)("");
  const [busy, setBusy] = (0, import_react5.useState)(false);
  const replies = savedRepliesFor(props.repo);
  (0, import_react5.useEffect)(() => {
    if (props.open) {
      setReason("completed");
      setDuplicateOf("");
      setComment("");
    }
  }, [props.open]);
  const many = props.numbers.length > 1;
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    Modal,
    {
      open: props.open,
      title: props.mode === "bulk" ? t("Close {count} items", { count: props.numbers.length }) : t("Close {item}", { item: `${props.kind === "mr" ? "!" : "#"}${props.numbers[0]}` }),
      onClose: props.onClose,
      footer: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { variant: "ghost", onClick: props.onClose, children: t("Cancel") }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          Button,
          {
            variant: "danger",
            busy,
            onClick: async () => {
              setBusy(true);
              try {
                if (props.mode === "bulk") {
                  const result = await rpc("agentQueue", {
                    sessionID: props.sessionID,
                    repo: props.repo,
                    kind: "close",
                    itemKind: props.kind,
                    numbers: props.numbers,
                    body: comment || void 0,
                    reason,
                    duplicateOf: reason === "duplicate" && duplicateOf ? Number(duplicateOf) : void 0
                  });
                  toast({ tone: "success", title: t("Queued {count} close actions", { count: result.queued.length }), description: result.skipped.length ? t("Skipped {count}", { count: result.skipped.length }) : void 0 });
                } else {
                  for (const number of props.numbers) {
                    await rpc("setState", { repo: props.repo, number, kind: props.kind, open: false, reason, duplicateOf: reason === "duplicate" && duplicateOf ? Number(duplicateOf) : void 0, comment: comment || void 0 });
                  }
                  toast({ tone: "success", title: t("Closed") });
                }
                props.onClose();
                props.onDone();
              } catch (error) {
                errorToast(error);
              } finally {
                setBusy(false);
              }
            },
            children: t("Close")
          }
        )
      ] }),
      children: [
        many ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "glp-dim", children: t("Closing {count} items asks first and runs one at a time; each can be undone from Agent activity.", { count: props.numbers.length }) }) : null,
        props.kind === "issue" ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Reason") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("select", { className: "glp-select", value: reason, onChange: (event) => setReason(event.target.value), children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "completed", children: t("Completed") }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "not_planned", children: t("Not planned") }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "duplicate", children: t("Duplicate") })
          ] })
        ] }) : null,
        reason === "duplicate" && props.kind === "issue" ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Duplicate of") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { className: "glp-input", value: duplicateOf, onChange: (event) => setDuplicateOf(event.target.value.replace(/[^0-9]/g, "")), placeholder: "#123" })
        ] }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "glp-row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", style: { flex: 1 }, children: t("Comment (optional)") }),
            replies.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("select", { className: "glp-select", style: { width: "auto", maxWidth: 170 }, defaultValue: "", onChange: (event) => {
              const reply = replies.find((entry) => entry.id === event.target.value);
              if (reply) setComment(reply.body);
              event.target.value = "";
            }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "", children: t("Saved replies\u2026") }),
              replies.map((reply) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: reply.id, children: reply.name }, reply.id))
            ] }) : null
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(TextArea, { rows: 5, value: comment, onChange: (event) => setComment(event.target.value) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "glp-faint", style: { fontSize: 11 }, children: t("GitLab closes without a reason; a duplicate link is added as a comment, and your comment is posted first.") })
      ]
    }
  );
}
function CommentDialog(props) {
  const [body, setBody] = (0, import_react5.useState)("");
  const [busy, setBusy] = (0, import_react5.useState)(false);
  const replies = savedRepliesFor(props.repo);
  (0, import_react5.useEffect)(() => {
    if (props.open) setBody("");
  }, [props.open]);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    Modal,
    {
      open: props.open,
      title: props.numbers.length > 1 ? t("Comment on {count} items", { count: props.numbers.length }) : t("Comment"),
      onClose: props.onClose,
      footer: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { variant: "ghost", onClick: props.onClose, children: t("Cancel") }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          Button,
          {
            variant: "primary",
            busy,
            disabled: !body.trim(),
            onClick: async () => {
              setBusy(true);
              try {
                if (props.mode === "bulk") {
                  const result = await rpc("agentQueue", { sessionID: props.sessionID, repo: props.repo, kind: "comment", itemKind: props.kind, numbers: props.numbers, body });
                  toast({ tone: "success", title: t("Queued {count} comments", { count: result.queued.length }) });
                } else {
                  for (const number of props.numbers) await rpc("comment", { repo: props.repo, number, kind: props.kind, body });
                  toast({ tone: "success", title: t("Comment posted") });
                }
                props.onClose();
                props.onDone();
              } catch (error) {
                errorToast(error);
              } finally {
                setBusy(false);
              }
            },
            children: t("Comment")
          }
        )
      ] }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "glp-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", style: { flex: 1 }, children: t("Markdown is supported.") }),
          replies.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("select", { className: "glp-select", style: { width: "auto", maxWidth: 180 }, defaultValue: "", onChange: (event) => {
            const reply = replies.find((entry) => entry.id === event.target.value);
            if (reply) setBody(reply.body);
            event.target.value = "";
          }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "", children: t("Saved replies\u2026") }),
            replies.map((reply) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: reply.id, children: reply.name }, reply.id))
          ] }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => {
            const name2 = window.prompt(t("Name"));
            if (name2 && body.trim()) rememberReply(props.repo, name2, body);
          }, children: t("Save as reply") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(TextArea, { rows: 7, autoFocus: true, value: body, onChange: (event) => setBody(event.target.value) }),
        body.trim() ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "glp-md", style: { border: "0.5px solid var(--glp-border)", borderRadius: 6, padding: 8, maxHeight: 180, overflow: "auto" }, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Markdown, { text: body, repo: props.repo }) }) : null
      ]
    }
  );
}
function EditItemDialog(props) {
  const [title, setTitle] = (0, import_react5.useState)("");
  const [body, setBody] = (0, import_react5.useState)("");
  const [labels, setLabels] = (0, import_react5.useState)([]);
  const [assignees, setAssignees] = (0, import_react5.useState)([]);
  const [reviewers, setReviewers] = (0, import_react5.useState)([]);
  const [milestone, setMilestone] = (0, import_react5.useState)("");
  const [draft, setDraft] = (0, import_react5.useState)(false);
  const [busy, setBusy] = (0, import_react5.useState)(false);
  const meta = useMeta(props.item.repo, props.open);
  (0, import_react5.useEffect)(() => {
    if (!props.open) return;
    setTitle(props.item.title);
    setBody(props.item.body);
    setLabels(props.item.labels.map((label) => label.name));
    setAssignees(props.item.assignees);
    setReviewers(props.item.pr?.requested ?? []);
    setMilestone(props.item.milestone ?? "");
    setDraft(props.item.draft);
  }, [props.open, props.item]);
  const metaData = meta.data ?? { labels: [], people: [], milestones: [] };
  const toggle = (list, value) => list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    Modal,
    {
      open: props.open,
      title: t("Edit"),
      onClose: props.onClose,
      width: 600,
      footer: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { variant: "ghost", onClick: props.onClose, children: t("Cancel") }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          Button,
          {
            variant: "primary",
            busy,
            onClick: async () => {
              setBusy(true);
              try {
                const original = props.item;
                await rpc("edit", {
                  repo: original.repo,
                  number: original.number,
                  kind: original.kind,
                  ...title !== original.title ? { title } : {},
                  ...body !== original.body ? { body } : {},
                  addLabels: labels.filter((label) => !original.labels.some((entry) => entry.name === label)),
                  removeLabels: original.labels.map((entry) => entry.name).filter((label) => !labels.includes(label)),
                  addAssignees: assignees.filter((name2) => !original.assignees.includes(name2)),
                  removeAssignees: original.assignees.filter((name2) => !assignees.includes(name2)),
                  addReviewers: reviewers.filter((name2) => !(original.pr?.requested ?? []).includes(name2)),
                  removeReviewers: (original.pr?.requested ?? []).filter((name2) => !reviewers.includes(name2)),
                  milestone: milestone === (original.milestone ?? "") ? void 0 : milestone || null
                });
                if (original.kind === "mr" && draft !== original.draft) await rpc("setDraft", { repo: original.repo, number: original.number, draft });
                toast({ tone: "success", title: t("Saved") });
                props.onClose();
                props.onDone();
              } catch (error) {
                errorToast(error);
              } finally {
                setBusy(false);
              }
            },
            children: t("Save")
          }
        )
      ] }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Title") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { className: "glp-input", value: title, onChange: (event) => setTitle(event.target.value) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Body") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(TextArea, { rows: 6, value: body, onChange: (event) => setBody(event.target.value) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "glp-split", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "glp-col", style: { gap: 4 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Labels") }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 }, children: meta.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Spinner, {}) : metaData.labels.map((label) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", style: { border: labels.includes(label.name) ? "1px solid var(--glp-accent)" : "1px solid transparent", background: "transparent", borderRadius: 999, padding: 0, cursor: "pointer" }, onClick: () => setLabels(toggle(labels, label.name)), children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(LabelChip, { label }) }, label.name)) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "glp-col", style: { gap: 4 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Milestone") }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("select", { className: "glp-select", value: milestone, onChange: (event) => setMilestone(event.target.value), children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "", children: t("None") }),
              metaData.milestones.map((name2) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: name2, children: name2 }, name2))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "glp-split", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Assignees") }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("select", { className: "glp-select", value: "", onChange: (event) => {
              if (event.target.value) setAssignees(toggle(assignees, event.target.value));
              event.target.value = "";
            }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "", children: t("Add assignee\u2026") }),
              metaData.people.filter((name2) => !assignees.includes(name2)).map((name2) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: name2, children: name2 }, name2))
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "glp-row", style: { flexWrap: "wrap" }, children: assignees.map((name2) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("button", { type: "button", className: "glp-chip", onClick: () => setAssignees(assignees.filter((entry) => entry !== name2)), children: [
              "@",
              name2,
              " ",
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { name: "close", size: 9 })
            ] }, name2)) })
          ] }),
          props.item.kind === "mr" ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Reviewers") }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("select", { className: "glp-select", value: "", onChange: (event) => {
              if (event.target.value) setReviewers(toggle(reviewers, event.target.value));
              event.target.value = "";
            }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "", children: t("Add reviewer\u2026") }),
              metaData.people.filter((name2) => !reviewers.includes(name2)).map((name2) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: name2, children: name2 }, name2))
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "glp-row", style: { flexWrap: "wrap" }, children: reviewers.map((name2) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("button", { type: "button", className: "glp-chip", onClick: () => setReviewers(reviewers.filter((entry) => entry !== name2)), children: [
              "@",
              name2,
              " ",
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { name: "close", size: 9 })
            ] }, name2)) })
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", {})
        ] }),
        props.item.kind === "mr" ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Checkbox, { checked: draft, onChange: setDraft, label: t("Draft") }) : null
      ]
    }
  );
}
function MergeDialog(props) {
  const [squash, setSquash] = (0, import_react5.useState)(false);
  const [deleteBranch, setDeleteBranch] = (0, import_react5.useState)(false);
  const [busy, setBusy] = (0, import_react5.useState)(false);
  (0, import_react5.useEffect)(() => {
    if (props.open) {
      setSquash(false);
      setDeleteBranch(false);
    }
  }, [props.open]);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    Modal,
    {
      open: props.open,
      title: t("Merge !{number}?", { number: props.number }),
      onClose: props.onClose,
      footer: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { variant: "ghost", onClick: props.onClose, children: t("Cancel") }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          Button,
          {
            variant: "primary",
            busy,
            onClick: async () => {
              setBusy(true);
              try {
                await rpc("mergeMr", { repo: props.repo, number: props.number, squash, deleteBranch });
                toast({ tone: "success", title: t("Merged") });
                props.onClose();
                props.onDone();
              } catch (error) {
                errorToast(error);
              } finally {
                setBusy(false);
              }
            },
            children: t("Merge")
          }
        )
      ] }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Checkbox, { checked: squash, onChange: setSquash, label: t("Squash commits") }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Checkbox, { checked: deleteBranch, onChange: setDeleteBranch, label: t("Delete source branch") }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "glp-faint", style: { fontSize: 11 }, children: t("GitLab merges with the project's merge method; the pipeline must pass unless the project allows otherwise.") })
      ]
    }
  );
}
function StartWorkDialog(props) {
  const local = useBranches(props.cwd, props.open).data ?? [];
  const [branch, setBranch] = (0, import_react5.useState)("");
  const [base, setBase] = (0, import_react5.useState)(props.defaultBranch ?? "main");
  const [where, setWhere] = (0, import_react5.useState)("worktree");
  const [busy, setBusy] = (0, import_react5.useState)(false);
  const [error, setError] = (0, import_react5.useState)();
  const linked = (0, import_react5.useMemo)(() => branchForIssue(props.item.repo, props.item.number), [props.item]);
  (0, import_react5.useEffect)(() => {
    if (props.open) {
      setBranch(linked ?? issueBranchName(props.item.number, props.item.title));
      setBase(props.defaultBranch ?? "main");
      setWhere("worktree");
      setError(void 0);
    }
  }, [props.open, props.item, props.defaultBranch, linked]);
  const name2 = branch.trim();
  const existing = local.find((row) => !row.remote && row.name === name2);
  const elsewhere = existing && !existing.current && existing.worktree ? existing.worktree : void 0;
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    Modal,
    {
      open: props.open,
      title: t("Start working"),
      onClose: props.onClose,
      footer: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { variant: "ghost", onClick: props.onClose, children: t("Cancel") }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          Button,
          {
            variant: "primary",
            busy,
            disabled: !name2,
            onClick: async () => {
              setBusy(true);
              setError(void 0);
              const prompt = itemWorkingPrompt(props.item, name2);
              let stashed = false;
              let switched = false;
              try {
                let target = props.cwd;
                if (elsewhere || existing?.current) {
                  target = elsewhere ?? props.cwd;
                } else {
                  if (!existing) await rpc("fetch", { cwd: props.cwd });
                  if (where === "worktree") {
                    target = (await rpc("worktreeAdd", { cwd: props.cwd, branch: name2, base })).path;
                    switched = true;
                  } else {
                    const overview = await api.overview(props.cwd);
                    if (overview && overview.files.length > 0) {
                      await rpc("stash", { cwd: props.cwd });
                      stashed = true;
                    }
                    if (existing) await rpc("checkout", { cwd: props.cwd, ref: name2, track: null });
                    else await rpc("createBranch", { cwd: props.cwd, name: name2, start: base, checkout: true });
                    switched = true;
                  }
                }
                rememberIssueBranch(props.item.repo, name2, props.item.number);
                try {
                  await startAgentSession({ cwd: target, prompt });
                  toast({ tone: "success", title: t("Session started"), description: `${props.item.repo}${props.item.kind === "mr" ? "!" : "#"}${props.item.number}` });
                } catch (reason) {
                  await navigator.clipboard?.writeText(prompt).catch(() => void 0);
                  toast({ tone: "error", title: t("Branch created, but the session did not start"), description: `${errorText(reason)} ${t("The prompt is on the clipboard.")}` });
                }
                props.onClose();
                props.onDone();
              } catch (reason) {
                if (stashed && !switched) await rpc("stashPop", { cwd: props.cwd }).catch(() => void 0);
                setError(errorText(reason));
              } finally {
                setBusy(false);
              }
            },
            children: t("Start")
          }
        )
      ] }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "glp-md", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("strong", { children: props.item.title }) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("p", { className: "glp-faint", children: [
            props.item.repo,
            props.item.kind === "mr" ? "!" : "#",
            props.item.number
          ] })
        ] }),
        error ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(InlineError, { error }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Branch name") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { className: "glp-input", value: branch, onChange: (event) => setBranch(event.target.value) })
        ] }),
        elsewhere ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "glp-faint", style: { fontSize: 11.5 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { name: "warning", size: 12 }),
          " ",
          t("This branch is already checked out in another work tree; the agent starts there."),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { wordBreak: "break-all" }, children: elsewhere })
        ] }) : existing?.current ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "glp-faint", style: { fontSize: 11.5 }, children: t("This is the current branch; the agent starts in this checkout.") }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Start from") }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("select", { className: "glp-select", value: base, onChange: (event) => setBase(event.target.value), disabled: !!existing, children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: props.defaultBranch ?? "main", children: props.defaultBranch ?? "main" }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "HEAD", children: t("Current HEAD") })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "glp-col", style: { gap: 4 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Where") }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              Segmented,
              {
                value: where,
                onChange: setWhere,
                options: [
                  { value: "worktree", label: t("New worktree"), title: t("A separate folder; this checkout and its changes stay as they are") },
                  { value: "checkout", label: t("This checkout"), title: t("Switch here, stashing your changes first") }
                ]
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "glp-faint", style: { fontSize: 11 }, children: existing ? t("This branch already exists and is reused.") : where === "worktree" ? t("A new worktree is created next to this repository and the agent starts there.") : t("Your changes are stashed before switching. The agent starts in this checkout.") })
        ] })
      ]
    }
  );
}
function TriageDialog(props) {
  const [rules, setRules] = (0, import_react5.useState)("");
  const [batch, setBatch] = (0, import_react5.useState)(10);
  const [busy, setBusy] = (0, import_react5.useState)(false);
  const [error, setError] = (0, import_react5.useState)();
  const replies = savedRepliesFor(props.repo);
  const [picked, setPicked] = (0, import_react5.useState)([]);
  const prefs2 = usePrefs()[0];
  (0, import_react5.useEffect)(() => {
    if (props.open) {
      setRules(prefs2.triageRules[props.repo] ?? "");
      setBatch(10);
      setPicked(replies.map((reply) => reply.id));
      setError(void 0);
    }
  }, [props.open, props.repo]);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    Modal,
    {
      open: props.open,
      title: t("Triage with agent"),
      onClose: props.onClose,
      width: 600,
      footer: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { variant: "ghost", onClick: props.onClose, children: t("Cancel") }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          Button,
          {
            variant: "primary",
            busy,
            onClick: async () => {
              setBusy(true);
              setError(void 0);
              try {
                const chosen = replies.filter((reply) => picked.includes(reply.id)).map((reply) => ({ name: reply.name, body: reply.body }));
                const triage = {
                  repo: props.repo,
                  kind: props.kind,
                  query: props.query,
                  numbers: props.numbers,
                  rules,
                  replies: chosen,
                  batch: Math.max(1, batch),
                  total: props.total
                };
                const { triagePrompt: triagePrompt2 } = await Promise.resolve().then(() => (init_plan(), plan_exports));
                const prompt = triagePrompt2({ ...triage, numbers: props.numbers });
                const sessionID = await startAgentSession({
                  cwd: props.cwd,
                  prompt,
                  open: false,
                  before: (created) => rpc("agentTriage", { sessionID: created, triage })
                });
                pluginCtx().uiWorkspace?.openSession?.(sessionID);
                updatePrefs((draft) => {
                  draft.triageRules[props.repo] = rules;
                });
                toast({ tone: "success", title: t("Triage started"), description: t("{count} items", { count: props.total }) });
                props.onClose();
                props.onDone();
              } catch (reason) {
                setError(errorText(reason));
              } finally {
                setBusy(false);
              }
            },
            children: t("Start")
          }
        )
      ] }),
      children: [
        error ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(InlineError, { error }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "glp-dim", children: [
          props.query ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
            t("Search"),
            ": ",
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("code", { children: props.query })
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
            props.numbers.length,
            " ",
            props.kind === "mr" ? t("merge requests") : t("issues")
          ] }),
          " \xB7 ",
          t("{count} items", { count: props.total })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Rules") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(TextArea, { rows: 6, value: rules, onChange: (event) => setRules(event.target.value), placeholder: t("For example: close spam as not planned; label crashes with bug; ask for reproduction steps when the report has none.") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Batch size") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { className: "glp-input", type: "number", min: 1, max: 50, value: batch, onChange: (event) => setBatch(Number(event.target.value) || 1) })
        ] }),
        replies.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("Saved replies to use") }),
          replies.map((reply) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Checkbox, { checked: picked.includes(reply.id), onChange: (value) => setPicked(value ? [...picked, reply.id] : picked.filter((id) => id !== reply.id)), label: reply.name }, reply.id))
        ] }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "glp-faint", style: { fontSize: 11 }, children: t("A new session starts with these rules. Every proposed change waits for your approval; use Agent activity to approve or skip in batches.") })
      ]
    }
  );
}
function SavedRepliesDialog(props) {
  const [prefs2, setPrefs] = usePrefs();
  const replies = prefs2.savedReplies.filter((reply) => reply.repo === props.repo);
  const [name2, setName] = (0, import_react5.useState)("");
  const [body, setBody] = (0, import_react5.useState)("");
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(Modal, { open: props.open, title: t("Saved replies"), onClose: props.onClose, footer: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { variant: "ghost", onClick: props.onClose, children: t("Close") }), children: [
    replies.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "glp-faint", children: t("No saved replies for this repository yet.") }) : null,
    replies.map((reply) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "glp-col", style: { gap: 4, border: "0.5px solid var(--glp-border)", borderRadius: 6, padding: 8 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "glp-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("strong", { style: { flex: 1 }, children: reply.name }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => {
          setName(reply.name);
          setBody(reply.body);
        }, children: t("Edit") }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => setPrefs((draft) => {
          draft.savedReplies = draft.savedReplies.filter((entry) => entry.id !== reply.id);
        }), children: t("Delete") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "glp-faint glp-wrap", style: { maxHeight: 70, overflow: "auto", whiteSpace: "pre-wrap" }, children: reply.body })
    ] }, reply.id)),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "glp-col", style: { gap: 4, marginTop: 6 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-dim", children: t("New reply") }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { className: "glp-input", placeholder: t("Name"), value: name2, onChange: (event) => setName(event.target.value) }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(TextArea, { rows: 4, placeholder: t("Body"), value: body, onChange: (event) => setBody(event.target.value) }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        Button,
        {
          size: "sm",
          variant: "primary",
          disabled: !name2.trim() || !body.trim(),
          onClick: () => {
            rememberReply(props.repo, name2.trim(), body);
            setName("");
            setBody("");
          },
          children: t("Save")
        }
      )
    ] })
  ] });
}
function CleanupDialog(props) {
  const [picked, setPicked] = (0, import_react5.useState)([]);
  const [busy, setBusy] = (0, import_react5.useState)(false);
  (0, import_react5.useEffect)(() => {
    if (props.open) setPicked(props.candidates.filter((candidate) => !candidate.risk).map((candidate) => candidate.name));
  }, [props.open, props.candidates]);
  const reasonText = (candidate) => candidate.reasons.map(
    (reason) => reason.kind === "merged-mr" || reason.kind === "closed-mr" ? `${reason.kind === "merged-mr" ? t("MR merged") : t("MR closed")} !${reason.number}` : reason.kind === "gone" ? t("upstream gone") : t("merged into {base}", { base: reason.base ?? "" })
  ).join(", ");
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    Modal,
    {
      open: props.open,
      title: t("Clean up branches"),
      onClose: props.onClose,
      width: 600,
      footer: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { variant: "ghost", onClick: props.onClose, children: t("Cancel") }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          Button,
          {
            variant: "danger",
            busy,
            disabled: picked.length === 0,
            onClick: async () => {
              setBusy(true);
              try {
                const result = await rpc("deleteBranches", { cwd: props.cwd, names: picked, force: true });
                const failed = result.filter((entry) => entry.error);
                toast({ tone: failed.length ? "error" : "success", title: t("Deleted {count} branches", { count: result.length - failed.length }), description: failed[0]?.error ?? void 0 });
                props.onClose();
                props.onDone();
              } catch (error) {
                errorToast(error);
              } finally {
                setBusy(false);
              }
            },
            children: t("Delete {count}", { count: picked.length })
          }
        )
      ] }),
      children: [
        props.candidates.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "glp-faint", children: t("No branches look done with.") }) : null,
        props.candidates.map((candidate) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "glp-row", style: { padding: "4px 0", alignItems: "flex-start" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Checkbox, { checked: picked.includes(candidate.name), onChange: (value) => setPicked(value ? [...picked, candidate.name] : picked.filter((name2) => name2 !== candidate.name)) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "glp-col", style: { flex: 1 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { fontFamily: "var(--glp-mono)", fontSize: 11.5 }, children: candidate.name }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-faint", style: { fontSize: 10.5 }, children: reasonText(candidate) }),
            candidate.risk ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "glp-pill", "data-tone": "warn", style: { alignSelf: "flex-start" }, children: t(candidate.risk === "unpushed" ? "unpushed commits" : candidate.risk === "moved" ? "moved past its MR" : "not merged") }) : null
          ] })
        ] }, candidate.name)),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "glp-faint", style: { fontSize: 11 }, children: t("Branches with unpushed work start unchecked. Branches checked out in a worktree are not listed.") })
      ]
    }
  );
}
function SavedSearchDialog(props) {
  const [name2, setName] = (0, import_react5.useState)("");
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    Modal,
    {
      open: props.open,
      title: t("Save search"),
      onClose: props.onClose,
      footer: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Button, { variant: "ghost", onClick: props.onClose, children: t("Cancel") }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          Button,
          {
            variant: "primary",
            disabled: !name2.trim(),
            onClick: () => {
              rememberSavedSearch(props.repo, props.kind, name2.trim(), props.query);
              const search = getPrefs().savedSearches.find((entry) => entry.repo === props.repo && entry.kind === props.kind && entry.name === name2.trim());
              if (search) props.onSaved(search);
              props.onClose();
            },
            children: t("Save")
          }
        )
      ] }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "glp-dim", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("code", { children: props.query }) }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { className: "glp-input", autoFocus: true, placeholder: t("Name"), value: name2, onChange: (event) => setName(event.target.value) })
      ]
    }
  );
}
function BulkMenu(props) {
  const entries = [
    { label: t("Reopen {count}", { count: props.numbers.length }), icon: "undo", onSelect: async () => {
      if (props.numbers.length > 1 && !window.confirm(t("Reopen {count} items?", { count: props.numbers.length }))) return;
      try {
        const result = await rpc("agentQueue", { sessionID: props.sessionID, repo: props.repo, kind: "reopen", itemKind: props.kind, numbers: props.numbers });
        toast({ tone: "success", title: t("Queued {count} reopen actions", { count: result.queued.length }) });
        props.onDone();
        props.onCloseSelection();
      } catch (error) {
        errorToast(error);
      }
    } },
    { label: t("Ask agent about these"), icon: "sparkles", onSelect: props.onAsk },
    { label: t("Triage these {count} with agent", { count: props.numbers.length }), icon: "checklist", onSelect: props.onTriage }
  ];
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Menu, { label: t("More"), icon: "dots", trigger: "icon", items: entries });
}

// src/client/ci.tsx
init_i18n();
var import_jsx_runtime6 = require("react/jsx-runtime");
function RunsView(props) {
  const [all, setAll] = (0, import_react6.useState)(!props.branch);
  const runs = useRuns(props.repo, all ? null : props.branch, true);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "glp-row", style: { padding: "6px 10px", borderBottom: "0.5px solid var(--glp-border)" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("strong", { style: { flex: 1 }, children: t("Pipelines") }),
      props.branch ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { size: "sm", variant: all ? "ghost" : "primary", onClick: () => setAll(false), children: props.branch }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { size: "sm", variant: all ? "primary" : "ghost", onClick: () => setAll(true), children: t("All") }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconButton, { icon: "refresh", label: t("Refresh"), onClick: () => void runs.refetch() })
    ] }),
    runs.isLoading && !runs.data ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "glp-empty", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Spinner, {}),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("Loading\u2026") })
    ] }) : null,
    runs.error ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "glp-alert", "data-tone": "error", children: errorText(runs.error) }) : null,
    runs.data && runs.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Empty, { icon: "pipeline", children: t("No pipelines") }) : null,
    (runs.data ?? []).map((run) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "glp-row-item", "data-compact": true, onClick: () => nav.openRun({ repo: props.repo, id: run.id }), children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(CheckDot, { state: run.status === "failed" ? "failure" : run.status === "success" ? "success" : ["running", "pending", "created", "waiting_for_resource", "preparing"].includes(run.status) ? "pending" : "none" }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "glp-row-content", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "glp-row-title", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { className: "glp-num", children: [
            "#",
            run.id
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "glp-ellipsis", children: run.title })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "glp-row-meta", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "glp-mono", children: run.sha.slice(0, 7) }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: run.branch }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: run.event }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Age, { date: run.created, title: true })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "glp-row-end", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Pill, { tone: run.status === "success" ? "success" : run.status === "failed" ? "danger" : ["running", "pending"].includes(run.status) ? "warn" : void 0, children: t(run.status) }) })
    ] }, run.id)),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { height: 40 } })
  ] });
}
function RunPage(props) {
  const run = useRun(props.repo, props.id, true);
  const [job, setJob] = (0, import_react6.useState)();
  const [busy, setBusy] = (0, import_react6.useState)();
  const data = run.data;
  const act = async (id, work, success) => {
    setBusy(id);
    try {
      await work();
      if (success) toast({ tone: "success", title: success });
      void queryClient.invalidateQueries({ queryKey: ["run", props.repo, props.id] });
    } catch (error) {
      errorToast(error);
    } finally {
      setBusy(void 0);
    }
  };
  const weight = (job2) => job2.conclusion === "failed" ? 0 : ["running", "pending", "created"].includes(job2.conclusion) ? 1 : job2.conclusion === "success" ? 2 : 3;
  const orderedJobs = [...data?.jobs ?? []].sort((a, b) => weight(a) - weight(b));
  const stages = /* @__PURE__ */ new Map();
  for (const entry of orderedJobs) {
    const list = stages.get(entry.stage ?? "") ?? [];
    list.push(entry);
    stages.set(entry.stage ?? "", list);
  }
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "glp-root", "data-glp": "", children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "glp-topbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Icon, { name: "pipeline", size: 13 }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { className: "glp-repo glp-ellipsis", style: { flex: 1 }, children: [
        "#",
        props.id,
        " ",
        data?.run.title ?? ""
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "glp-topbar-actions", children: [
        data ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Pill, { tone: data.run.status === "success" ? "success" : data.run.status === "failed" ? "danger" : "warn", children: t(data.run.status) }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconButton, { icon: "external", label: t("Open on GitLab"), onClick: () => data && openExternal(data.run.url) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconButton, { icon: "refresh", label: t("Refresh"), onClick: () => void run.refetch() }),
        props.onClose ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(IconButton, { icon: "close", label: t("Close"), onClick: props.onClose }) : null
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "glp-body", children: [
      run.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "glp-empty", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Spinner, {}),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("Loading\u2026") })
      ] }) : null,
      run.error ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "glp-alert", "data-tone": "error", children: errorText(run.error) }) : null,
      data ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "glp-item", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "glp-item-head", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "glp-col", style: { flex: 1 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "glp-item-title", children: data.run.title }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "glp-item-meta", children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "glp-mono", children: data.run.sha.slice(0, 7) }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: data.run.branch }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: data.run.event }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: formatDate(data.run.created, "long") })
          ] })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "glp-item-actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { size: "sm", variant: "ghost", icon: "undo", busy: busy === "retry", onClick: () => void act("retry", async () => {
            await rpc("rerun", { repo: props.repo, id: props.id });
          }, t("Retried")), children: t("Retry") }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { size: "sm", variant: "ghost", icon: "stop", busy: busy === "cancel", onClick: () => void act("cancel", async () => {
            await rpc("cancelRun", { repo: props.repo, id: props.id });
          }, t("Canceled")), children: t("Cancel") })
        ] }),
        [...stages.entries()].map(([stage, jobs]) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "glp-group-title", style: { fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.03em" }, children: stage || t("Jobs") }),
          jobs.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "glp-check-row", "data-state": entry.conclusion === "failed" ? "failure" : void 0, onClick: () => setJob(job?.id === entry.id ? void 0 : entry), children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(CheckDot, { state: entry.conclusion === "failed" ? "failure" : entry.conclusion === "success" ? "success" : ["running", "pending", "created"].includes(entry.conclusion) ? "pending" : "none" }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "glp-ellipsis", style: { flex: 1 }, children: entry.name }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "glp-faint", style: { fontSize: 10.5 }, children: t(entry.status || entry.conclusion) }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Icon, { name: job?.id === entry.id ? "chevron-down" : "chevron-right", size: 10 })
          ] }, entry.id))
        ] }, stage)),
        job ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(RunJobPanel, { repo: props.repo, job, onClose: () => setJob(void 0) }) : null
      ] }) : null
    ] })
  ] });
}
function RunJobPanel(props) {
  const log = useJobLog(props.repo, props.job.id, ["success", "failed", "canceled"].includes(props.job.conclusion), true);
  const [busy, setBusy] = (0, import_react6.useState)();
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { border: "0.5px solid var(--glp-border)", borderRadius: 6, overflow: "hidden", marginTop: 6 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "glp-row", style: { padding: "4px 8px", background: "var(--glp-panel-2)" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Icon, { name: "file", size: 11 }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("strong", { style: { flex: 1 }, children: props.job.name }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => {
        if (log.data) {
          navigator.clipboard?.writeText(log.data);
          toast({ tone: "success", title: t("Copied") });
        }
      }, children: t("Copy") }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { size: "sm", variant: "ghost", busy: busy === "retry", onClick: async () => {
        setBusy("retry");
        try {
          await rpc("retryJob", { repo: props.repo, job: props.job.id });
          toast({ tone: "success", title: t("Retried") });
        } catch (error) {
          errorToast(error);
        } finally {
          setBusy(void 0);
        }
      }, children: t("Retry") }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { size: "sm", variant: "ghost", busy: busy === "cancel", onClick: async () => {
        setBusy("cancel");
        try {
          await rpc("cancelJob", { repo: props.repo, job: props.job.id });
          toast({ tone: "success", title: t("Canceled") });
        } catch (error) {
          errorToast(error);
        } finally {
          setBusy(void 0);
        }
      }, children: t("Cancel") }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Button, { size: "sm", variant: "ghost", onClick: props.onClose, children: t("Close") })
    ] }),
    log.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "glp-empty", "data-inline": true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Spinner, {}),
      " ",
      t("Loading\u2026")
    ] }) : null,
    log.error ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "glp-alert", "data-tone": "error", children: errorText(log.error) }) : null,
    log.data ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("pre", { className: "glp-mono", style: { margin: 0, padding: 8, maxHeight: 460, overflow: "auto", fontSize: 10.5, whiteSpace: "pre-wrap", background: "var(--glp-panel)" }, children: log.data }) : null
  ] });
}

// src/client/index.tsx
init_i18n();

// src/client/tabs.ts
var KEY2 = "dsh-gitlab-panel.tabs.v1";
var LIMIT = 200;
function read() {
  try {
    const raw = localStorage.getItem(KEY2);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((entry) => typeof entry?.id === "string" && !!entry.params) : [];
  } catch {
    return [];
  }
}
function write(entries) {
  try {
    localStorage.setItem(KEY2, JSON.stringify(entries.slice(-LIMIT)));
  } catch {
  }
}
function rememberTab(id, params) {
  if (!id) return;
  const entries = read();
  const previous = entries.find((entry) => entry.id === id);
  if (previous && JSON.stringify(previous.params) === JSON.stringify(params)) return;
  write([...entries.filter((entry) => entry.id !== id), { id, params, at: Date.now() }]);
}
function forgetTab(id) {
  if (!id) return;
  write(read().filter((entry) => entry.id !== id));
}
function paramsForTab(id) {
  if (!id) return void 0;
  return read().find((entry) => entry.id === id)?.params;
}

// src/client/panel.tsx
var import_react12 = require("react");

// src/shared/cleanup.ts
function cleanupCandidates(input) {
  return input.branches.flatMap((branch) => {
    if (branch.remote || branch.current || branch.worktree || branch.name === input.current || branch.name === input.base) return [];
    const mr = input.mrFor(branch.name);
    if (mr?.state === "OPEN") return [];
    const merged = input.merged.includes(branch.name);
    const reasons = [
      ...mr ? [{ kind: mr.state === "MERGED" ? "merged-mr" : "closed-mr", number: mr.number }] : [],
      ...branch.gone ? [{ kind: "gone" }] : [],
      ...merged && input.base ? [{ kind: "merged", base: input.base }] : []
    ];
    if (reasons.length === 0) return [];
    return [{ name: branch.name, reasons, risk: merged ? null : risk(branch, mr) }];
  });
}
function risk(branch, mr) {
  if (branch.ahead > 0) return "unpushed";
  const published = !!branch.upstream && !branch.gone;
  if (mr) return !published && mr.sha && !mr.sha.startsWith(branch.sha) ? "moved" : null;
  return published ? null : "unmerged";
}

// src/shared/graph.ts
function layout(nodes) {
  const lanes = [];
  const colors = [];
  const counter = { next: 0 };
  return nodes.map((node) => {
    const before = lanes.slice();
    const beforeColors = colors.slice();
    const found = lanes.indexOf(node.hash);
    const col = found === -1 ? free(lanes) : found;
    if (found === -1) {
      lanes[col] = node.hash;
      colors[col] = counter.next++;
    }
    const color = colors[col] ?? 0;
    const edges = [];
    before.forEach((hash, lane) => {
      if (hash === node.hash) edges.push({ kind: "in", from: lane, to: col, color: beforeColors[lane] ?? 0 });
    });
    lanes.forEach((hash, lane) => {
      if (hash === node.hash) lanes[lane] = null;
    });
    node.parents.forEach((parent, index) => {
      const existing = lanes.indexOf(parent);
      if (index === 0 && existing > col && lanes[col] === null) {
        edges.push({ kind: "pass", from: existing, to: col, color: colors[existing] ?? 0 });
        edges.push({ kind: "out", from: col, to: col, color });
        lanes[existing] = null;
        lanes[col] = parent;
        return;
      }
      if (existing !== -1) {
        edges.push({ kind: "out", from: col, to: existing, color: index === 0 ? color : colors[existing] ?? 0 });
        return;
      }
      const lane = index === 0 && lanes[col] === null ? col : free(lanes);
      lanes[lane] = parent;
      colors[lane] = index === 0 ? color : counter.next++;
      edges.push({ kind: "out", from: col, to: lane, color: colors[lane] ?? 0 });
    });
    before.forEach((hash, lane) => {
      if (hash !== null && hash !== node.hash && lanes[lane] === hash) edges.push({ kind: "pass", from: lane, to: lane, color: beforeColors[lane] ?? 0 });
    });
    while (lanes.length > 0 && lanes[lanes.length - 1] === null) {
      lanes.pop();
      colors.pop();
    }
    return {
      col,
      color,
      edges,
      below: lanes.flatMap((hash, lane) => hash === null ? [] : [{ lane, color: colors[lane] ?? 0 }]),
      width: Math.max(before.length, lanes.length, col + 1)
    };
  });
}
function free(lanes) {
  const index = lanes.indexOf(null);
  if (index !== -1) return index;
  lanes.push(null);
  return lanes.length - 1;
}

// src/client/panel.tsx
init_api();

// src/client/diff.tsx
var import_react7 = require("react");
init_i18n();
var import_jsx_runtime7 = require("react/jsx-runtime");
function DiffView(props) {
  const lines = (0, import_react7.useMemo)(() => parsePatch((props.patch ?? "").replace(/\r\n/g, "\n")), [props.patch]);
  if (props.loading) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "glp-diff", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "glp-diff-empty glp-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Spinner, {}),
      " ",
      t("Loading diff\u2026")
    ] }) });
  }
  if (props.error) return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "glp-diff", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "glp-diff-empty glp-error", children: props.error }) });
  if (!props.patch) return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "glp-diff", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "glp-diff-empty", children: props.emptyText ?? t("No diff") }) });
  if (lines.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "glp-diff", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "glp-diff-empty", children: t("No diff") }) });
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "glp-diff", style: props.maxHeight ? { maxHeight: props.maxHeight } : void 0, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("table", { className: "glp-diff-table", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("tbody", { children: lines.map(
    (line, index) => line.kind === "hunk" ? /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("tr", { className: "glp-diff-line", "data-kind": "hunk", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("td", { className: "glp-diff-num" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("td", { className: "glp-diff-num" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("td", { className: "glp-diff-marker" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("td", { className: "glp-diff-text", children: line.text })
    ] }, index) : /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("tr", { className: "glp-diff-line", "data-kind": line.kind, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        "td",
        {
          className: "glp-diff-num",
          title: props.onComment && line.old !== null ? t("Add comment") : void 0,
          onClick: props.onComment && line.old !== null ? () => props.onComment?.("LEFT", line.old ?? 0) : void 0,
          children: line.old ?? ""
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        "td",
        {
          className: "glp-diff-num",
          title: props.onComment && line.new !== null ? t("Add comment") : void 0,
          onClick: props.onComment && line.new !== null ? () => props.onComment?.("RIGHT", line.new ?? 0) : void 0,
          children: line.new ?? ""
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("td", { className: "glp-diff-marker", children: line.kind === "add" ? "+" : line.kind === "del" ? "-" : " " }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("td", { className: "glp-diff-text", children: line.text })
    ] }, index)
  ) }) }) });
}
function FileBlock(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("section", { className: "glp-file-block", children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "glp-file-block-head", onClick: props.onToggle, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Icon, { name: props.open ? "chevron-down" : "chevron-right", size: 11 }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "glp-file-status", "data-code": statusCode(props.file.status), children: statusCode(props.file.status) }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "glp-file-name", style: { maxWidth: "60%" }, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: props.file.previous && props.file.previous !== props.file.path ? `${props.file.previous} \u2192 ${props.file.path}` : props.file.path }) }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "glp-faint", style: { marginLeft: "auto", fontFamily: "var(--glp-mono)", fontSize: 10.5 }, children: [
        "+",
        props.file.additions,
        " \u2212",
        props.file.deletions
      ] }),
      props.onViewed ? /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("label", { className: "glp-faint", style: { fontSize: 10.5, display: "flex", alignItems: "center", gap: 3 }, onClick: (event) => event.stopPropagation(), children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("input", { type: "checkbox", checked: !!props.viewed, onChange: (event) => props.onViewed?.(event.target.checked) }),
        t("Viewed")
      ] }) : null
    ] }),
    props.open ? props.children : null
  ] });
}
function statusCode(status) {
  if (status === "added" || status === "A") return "A";
  if (status === "removed" || status === "deleted" || status === "D") return "D";
  if (status === "renamed" || status === "R") return "R";
  if (status === "copied" || status === "C") return "C";
  if (status === "modified" || status === "M") return "M";
  return "M";
}

// src/client/panel.tsx
init_i18n();

// src/client/search.tsx
var import_react8 = require("react");
init_api();
init_i18n();
var import_jsx_runtime8 = require("react/jsx-runtime");
var MR_PRESETS = [
  { id: "assigned", label: "Assigned to me", query: "is:open assignee:@me" },
  { id: "review", label: "Review requested", query: "is:open reviewer:@me" },
  { id: "authored", label: "Created by me", query: "is:open author:@me" },
  { id: "open", label: "All open", query: "is:open" },
  { id: "drafts", label: "Drafts", query: "is:open draft:true" },
  { id: "merged", label: "Recently merged", query: "is:merged sort:updated-desc" }
];
var ISSUE_PRESETS = [
  { id: "assigned", label: "Assigned to me", query: "is:open assignee:@me" },
  { id: "authored", label: "Created by me", query: "is:open author:@me" },
  { id: "open", label: "All open", query: "is:open" },
  { id: "unassigned", label: "Unassigned", query: "is:open no:assignee" },
  { id: "closed", label: "Recently closed", query: "is:closed sort:updated-desc" }
];
var QUALIFIERS = [
  "is:open",
  "is:closed",
  "is:merged",
  "is:issue",
  "is:mr",
  "is:draft",
  "label:",
  "author:@me",
  "assignee:@me",
  "reviewer:@me",
  "milestone:",
  "no:assignee",
  "sort:created-desc",
  "sort:updated-desc",
  "sort:updated-asc"
];
var SORTS = [
  { label: "Newest", value: "sort:created-desc" },
  { label: "Oldest", value: "sort:created-asc" },
  { label: "Recently updated", value: "sort:updated-desc" },
  { label: "Least recently updated", value: "sort:updated-asc" },
  { label: "Priority", value: "sort:priority-desc" }
];
function SearchView(props) {
  const presets = props.kind === "mr" ? MR_PRESETS : ISSUE_PRESETS;
  const [prefs2, setPrefs] = usePrefs();
  const saved = prefs2.savedSearches.filter((entry) => entry.repo === props.repo && entry.kind === props.kind);
  const initialQuery = props.kind === "mr" ? prefs2.savedSearches.find((entry) => entry.repo === props.repo && entry.kind === "mr")?.query : void 0;
  const [query, setQuery] = (0, import_react8.useState)(initialQuery ?? "is:open");
  const [applied, setApplied] = (0, import_react8.useState)(initialQuery ?? "is:open");
  const [preset, setPreset] = (0, import_react8.useState)(initialQuery ? "" : "open");
  const [active, setActive] = (0, import_react8.useState)(0);
  const [selected, setSelected] = (0, import_react8.useState)(/* @__PURE__ */ new Set());
  const [anchor, setAnchor] = (0, import_react8.useState)(void 0);
  const lastClicked = (0, import_react8.useRef)(void 0);
  const [dialog, setDialog] = (0, import_react8.useState)();
  const [rowActions, setRowActions] = (0, import_react8.useState)();
  const [startItem, setStartItem] = (0, import_react8.useState)();
  const [focusSearch, setFocusSearch] = (0, import_react8.useState)(false);
  const input = (0, import_react8.useRef)(null);
  const container = (0, import_react8.useRef)(null);
  const sentinel = (0, import_react8.useRef)(null);
  const meta = useMeta(props.repo, true);
  const agent = useAgent(props.sessionId);
  const agentActions = agent.data?.actions ?? [];
  const search = useSearch(props.repo, props.kind, applied, !!props.repo);
  const items = (0, import_react8.useMemo)(() => search.data?.pages.flatMap((page) => page.items) ?? [], [search.data]);
  const total = search.data?.pages[0]?.total ?? 0;
  const seen = (0, import_react8.useRef)(prefs2.seen[`${props.repo}:${props.kind}`] ?? 0).current;
  (0, import_react8.useEffect)(() => {
    const timer = setTimeout(() => rememberSeen(props.repo, props.kind), 4e3);
    return () => clearTimeout(timer);
  }, [props.repo, props.kind]);
  (0, import_react8.useEffect)(() => {
    const node = sentinel.current;
    if (!node || !search.hasNextPage || search.isFetchingNextPage) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void search.fetchNextPage();
    }, { root: null, rootMargin: "240px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [search.hasNextPage, search.isFetchingNextPage, search.fetchNextPage, items.length]);
  (0, import_react8.useEffect)(() => {
    setActive((value) => Math.min(value, Math.max(0, items.length - 1)));
  }, [items.length]);
  (0, import_react8.useEffect)(() => {
    if (focusSearch) {
      input.current?.focus();
      setFocusSearch(false);
    }
  }, [focusSearch]);
  const apply2 = (next, presetId = "") => {
    setQuery(next);
    setApplied(next);
    setPreset(presetId);
    setSelected(/* @__PURE__ */ new Set());
    setAnchor(void 0);
    void queryClient.invalidateQueries({ queryKey: ["search", props.repo, props.kind] });
  };
  const insertToken = (token) => {
    const parts = query.split(/\s+/).filter(Boolean);
    const last = parts[parts.length - 1] ?? "";
    if (last && !last.includes(":")) parts[parts.length - 1] = token;
    else parts.push(token);
    const next = parts.join(" ");
    setQuery(`${next} `);
    input.current?.focus();
  };
  const removeToken = (token) => apply2(query.split(/\s+/).filter((part) => part !== token).join(" "), "");
  const filtered = (0, import_react8.useMemo)(() => {
    const tokens2 = query.split(/\s+/).filter(Boolean);
    const typing = tokens2[tokens2.length - 1] ?? "";
    if (!typing || /^is:(open|closed|merged)$/.test(typing)) return [];
    if (typing.includes(":")) {
      const [key, value] = typing.split(":", 2);
      if (key === "label") return (meta.data?.labels ?? []).filter((label) => label.name.toLowerCase().includes((value ?? "").toLowerCase())).slice(0, 8).map((label) => ({ value: `label:${label.name}`, hint: "" }));
      if (key === "assignee" || key === "reviewer" || key === "author") return (meta.data?.people ?? []).filter((name2) => name2.toLowerCase().includes((value ?? "").toLowerCase())).slice(0, 8).map((name2) => ({ value: `${key}:${name2}`, hint: "" }));
      if (key === "milestone") return (meta.data?.milestones ?? []).filter((name2) => name2.toLowerCase().includes((value ?? "").toLowerCase())).slice(0, 8).map((name2) => ({ value: `milestone:${name2}`, hint: "" }));
    }
    return QUALIFIERS.filter((entry) => entry.startsWith(typing) || entry.includes(typing)).slice(0, 8).map((entry) => ({ value: entry, hint: "" }));
  }, [query, meta.data]);
  const tokens = (0, import_react8.useMemo)(() => query.split(/\s+/).filter((token) => token.includes(":")), [query]);
  const sortToken = tokens.find((token) => token.startsWith("sort:"))?.slice(5) ?? "created-desc";
  const move = (delta) => {
    const next = Math.max(0, Math.min(items.length - 1, active + delta));
    setActive(next);
    container.current?.querySelector(`[data-index="${next}"]`)?.scrollIntoView({ block: "nearest" });
  };
  const toggle = (number, range = false) => {
    const index = items.findIndex((item) => item.number === number);
    setSelected((current2) => {
      if (!range || lastClicked.current === void 0) {
        const next = new Set(current2);
        if (next.has(number)) next.delete(number);
        else next.add(number);
        setAnchor(index);
        return next;
      }
      const from = Math.min(lastClicked.current, index);
      const to = Math.max(lastClicked.current, index);
      const span = items.slice(from, to + 1).map((item) => item.number);
      const on = !current2.has(number);
      return on ? /* @__PURE__ */ new Set([...current2, ...span]) : new Set([...current2].filter((entry) => !span.includes(entry)));
    });
    lastClicked.current = index;
  };
  const openRow = (item) => props.onOpenItem(item.kind, item.number);
  const copyRef = (item) => {
    navigator.clipboard?.writeText(`${props.repo}${item.kind === "mr" ? "!" : "#"}${item.number}`);
    toast({ tone: "success", title: t("Copied") });
  };
  const rowMenu = (item) => [
    { label: t("Open item"), icon: "arrow-left", onSelect: () => openRow(item) },
    { label: t("Add to chat"), icon: "comment", onSelect: () => void quote(item) },
    { label: t("Ask agent"), icon: "sparkles", onSelect: () => void ask(item) },
    { type: "separator" },
    { label: t("Copy link"), icon: "copy", onSelect: () => {
      navigator.clipboard?.writeText(item.url);
      toast({ tone: "success", title: t("Copied") });
    } },
    { label: t("Copy reference"), icon: "link", onSelect: () => copyRef(item) },
    { label: t("Open on GitLab"), icon: "external", onSelect: () => openExternal(item.url) },
    { type: "separator" },
    ...item.state === "OPEN" ? [{ label: t("Close"), icon: "close", danger: true, onSelect: () => {
      setSelected(/* @__PURE__ */ new Set([item.number]));
      setDialog("close");
    } }] : item.state !== "MERGED" ? [{ label: t("Reopen"), icon: "undo", onSelect: () => void reopen(item.number) }] : [],
    ...item.kind === "issue" ? [{ label: t("Start working"), icon: "play", onSelect: () => void startWorking(item) }] : [
      { label: t("Checkout"), icon: "download", onSelect: () => void checkout(item) },
      { label: t("Pre-review with agent"), icon: "sparkles", onSelect: () => void preReview(item) }
    ]
  ];
  const quote = async (item) => {
    try {
      const full = await api.item(props.repo, item.number, item.kind);
      const { quoteToChat: quoteToChat2 } = await Promise.resolve().then(() => (init_api(), api_exports));
      await quoteToChat2(props.sessionId, props.cwd, itemQuote(full));
    } catch (error) {
      errorToast(error);
    }
  };
  const ask = async (item) => {
    await askAboutItems(props.sessionId, props.cwd, t("Help me with this {kind}:", { kind: item.kind === "mr" ? t("merge request") : t("issue") }), [item]);
  };
  const reopen = async (number) => {
    try {
      const result = await rpc("agentQueue", { sessionID: props.sessionId, repo: props.repo, kind: "reopen", itemKind: props.kind, numbers: [number] });
      toast({ tone: "success", title: t("Queued {count} reopen actions", { count: result.queued.length }) });
      void queryClient.invalidateQueries({ queryKey: ["search"] });
    } catch (error) {
      errorToast(error);
    }
  };
  const startWorking = async (item) => {
    try {
      setStartItem(await api.item(props.repo, item.number, item.kind));
    } catch (error) {
      errorToast(error);
    }
  };
  const checkout = async (item) => {
    try {
      await rpc("checkoutMr", { cwd: props.cwd, repo: props.repo, number: item.number });
      toast({ tone: "success", title: t("Checked out") });
      void queryClient.invalidateQueries({ queryKey: ["overview", props.cwd] });
    } catch (error) {
      errorToast(error);
    }
  };
  const preReview = async (item) => {
    try {
      const full = await api.item(props.repo, item.number, item.kind);
      await startAgentSession({ cwd: props.cwd, prompt: reviewPrompt(full) });
      toast({ tone: "success", title: t("Session started") });
    } catch (error) {
      errorToast(error);
    }
  };
  const bulkAsk = () => {
    const picked = items.filter((item) => selected.has(item.number));
    void askAboutItems(props.sessionId, props.cwd, t("Look at these {count} items:", { count: picked.length }), picked);
  };
  const setSort = (value) => {
    const cleaned = query.split(/\s+/).filter((token) => !token.startsWith("sort:")).join(" ");
    apply2(`${cleaned} sort:${value}`.trim(), "");
  };
  const stateFilter = () => {
    const token = tokens.find((entry) => /^is:(open|closed|merged)$/.test(entry));
    return token?.slice(3) ?? "open";
  };
  const setStateFilter = (state) => {
    const cleaned = query.split(/\s+/).filter((token) => !/^is:(open|closed|merged)$/.test(token)).join(" ");
    apply2(`${cleaned} is:${state}`.trim(), "");
  };
  const toggleMine = (key) => {
    const has = tokens.includes(`${key}:@me`);
    const cleaned = query.split(/\s+/).filter((token) => token !== `${key}:@me`).join(" ");
    apply2(has ? cleaned : `${cleaned} ${key}:@me`.trim(), "");
  };
  const toggleLabel = (name2) => {
    const token = `label:${name2}`;
    const has = tokens.includes(token);
    const cleaned = query.split(/\s+/).filter((entry) => entry !== token).join(" ");
    apply2(has ? cleaned : `${cleaned} ${token}`.trim(), "");
  };
  const filterItems = [
    { type: "header", label: t("State") },
    ...["open", "closed", ...props.kind === "mr" ? ["merged"] : [], "all"].map((state) => ({
      label: state === "open" ? t("Open") : state === "closed" ? t("Closed") : state === "merged" ? t("Merged") : t("All"),
      checked: stateFilter() === state,
      onSelect: () => setStateFilter(state)
    })),
    { type: "separator" },
    { label: t("Assigned to me"), checked: tokens.includes("assignee:@me"), onSelect: () => toggleMine("assignee") },
    { label: t("Created by me"), checked: tokens.includes("author:@me"), onSelect: () => toggleMine("author") },
    ...props.kind === "mr" ? [{ label: t("Review requested"), checked: tokens.includes("reviewer:@me"), onSelect: () => toggleMine("reviewer") }] : [],
    ...meta.data?.labels.length ? [{ type: "separator" }, { type: "header", label: t("Labels") }, ...meta.data.labels.slice(0, 12).map((label) => ({ label: label.name, checked: tokens.includes(`label:${label.name}`), onSelect: () => toggleLabel(label.name) }))] : [],
    { type: "separator" },
    { label: t("Clear filters"), onSelect: () => apply2(`is:open sort:${sortToken}`, "open") }
  ];
  const sortItems = SORTS.map((entry) => ({
    label: t(entry.label),
    checked: sortToken === entry.value.slice(5),
    onSelect: () => setSort(entry.value.slice(5))
  }));
  const bulkMenu = selected.size > 0 ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "glp-bulkbar", onClick: (event) => event.stopPropagation(), children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Checkbox, { checked: selected.size === items.length && items.length > 0, indeterminate: selected.size > 0 && selected.size < items.length, onChange: (checked) => setSelected(checked ? new Set(items.map((item) => item.number)) : /* @__PURE__ */ new Set()) }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("strong", { children: selected.size }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "glp-faint", children: t("selected") }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "glp-spacer" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Button, { size: "sm", variant: "ghost", icon: "close", onClick: () => setDialog("close"), children: t("Close") }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Button, { size: "sm", variant: "ghost", icon: "comment", onClick: () => setDialog("comment"), children: t("Comment") }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => setDialog("label"), children: t("Label") }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => setDialog("assign"), children: t("Assign") }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      BulkMenu,
      {
        repo: props.repo,
        kind: props.kind,
        numbers: [...selected],
        sessionID: props.sessionId,
        cwd: props.cwd,
        items: items.filter((item) => selected.has(item.number)).map((item) => ({ number: item.number, title: item.title, state: item.state, url: item.url })),
        onCloseSelection: () => setSelected(/* @__PURE__ */ new Set()),
        onDone: () => void queryClient.invalidateQueries({ queryKey: ["search"] }),
        onAsk: bulkAsk,
        onTriage: () => setDialog("triage")
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(IconButton, { icon: "close", label: t("Clear filters"), onClick: () => setSelected(/* @__PURE__ */ new Set()) })
  ] }) : null;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
    "div",
    {
      ref: container,
      tabIndex: 0,
      style: { outline: "none", minHeight: "100%" },
      onKeyDown: (event) => {
        const target = event.target;
        const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
        if (event.key === "/" && !typing) {
          event.preventDefault();
          setFocusSearch(true);
        } else if ((event.key === "j" || event.key === "ArrowDown") && !typing) {
          event.preventDefault();
          move(1);
        } else if ((event.key === "k" || event.key === "ArrowUp") && !typing) {
          event.preventDefault();
          move(-1);
        } else if (event.key === "Enter" && !typing && items[active]) {
          event.preventDefault();
          openRow(items[active]);
        } else if (event.key === "x" && !typing && items[active]) {
          event.preventDefault();
          toggle(items[active].number);
        } else if (event.key === "a" && !typing && !event.metaKey && !event.ctrlKey && selected.size > 0) {
          event.preventDefault();
          bulkAsk();
        } else if (event.key === "." && !typing && items[active]) {
          event.preventDefault();
          setRowActions(items[active]);
        } else if (event.key === "Escape") {
          setSelected(/* @__PURE__ */ new Set());
        } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a" && !typing && items.length > 0) {
          event.preventDefault();
          setSelected(new Set(items.map((item) => item.number)));
        }
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "glp-search-head", style: { position: "sticky" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "glp-search-box", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "search", size: 13, className: "glp-faint" }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
              "input",
              {
                ref: input,
                value: query,
                placeholder: t("Search {kind}\u2026", { kind: props.kind === "mr" ? t("merge requests") : t("issues") }),
                onChange: (event) => setQuery(event.target.value),
                onKeyDown: (event) => {
                  if (event.key === "Enter") apply2(query, "");
                  if (event.key === "Escape") {
                    setQuery(applied);
                    input.current?.blur();
                  }
                }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "glp-kbd", children: "/" })
          ] }),
          filtered.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "glp-suggestions", style: { position: "relative", left: 0, right: 0, top: 0, boxShadow: "none" }, children: filtered.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "glp-suggestion", onMouseDown: (event) => {
            event.preventDefault();
            insertToken(entry.value);
          }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: { fontFamily: "var(--glp-mono)", fontSize: 11 }, children: entry.value }),
            entry.hint ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("small", { children: entry.hint }) : null
          ] }, entry.value)) }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "glp-presets", children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Menu, { label: t("Filter"), icon: "filter", trigger: "text", items: filterItems }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Menu, { label: t("Sort"), icon: "sort", trigger: "text", items: sortItems }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
              Menu,
              {
                label: t("Saved searches"),
                icon: "archive",
                trigger: "text",
                items: [
                  ...saved.map((entry) => ({ label: entry.name, icon: "search", onSelect: () => apply2(entry.query, ""), hint: "" })),
                  ...saved.length ? [{ type: "separator" }, { type: "header", label: t("Forget a saved search") }] : [],
                  ...saved.map((entry) => ({ label: entry.name, icon: "close", danger: true, onSelect: () => forgetSavedSearch(entry.id), hint: "" })),
                  ...saved.length ? [{ type: "separator" }] : [],
                  { label: t("Save search"), icon: "plus", onSelect: () => setDialog("save") }
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Button, { size: "sm", variant: "ghost", icon: "sparkles", onClick: () => {
              setSelected(/* @__PURE__ */ new Set());
              setDialog("triage");
            }, children: t("Triage") }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "glp-spacer" }),
            presets.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { type: "button", className: "glp-preset", "data-selected": preset === entry.id ? "" : void 0, onClick: () => apply2(entry.query, entry.id), children: t(entry.label) }, entry.id))
          ] }),
          tokens.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "glp-chip-row", children: [
            tokens.map((token) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: "glp-chip", children: [
              token,
              /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { type: "button", onClick: () => removeToken(token), "aria-label": t("Remove"), children: "\xD7" })
            ] }, token)),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "glp-spacer" }),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { type: "button", className: "glp-preset", "data-selected": prefs2.compactRows ? "" : void 0, onClick: () => setPrefs((draft) => {
              draft.compactRows = !draft.compactRows;
            }), children: t("Compact") })
          ] }) : null
        ] }),
        selected.size > 0 ? bulkMenu : /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "glp-results-line", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { children: total > 0 ? t("{count} results", { count: total }) : search.isLoading ? t("Loading\u2026") : t("No results") }),
          search.isFetching && !search.isFetchingNextPage ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Spinner, {}) : null,
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "glp-spacer" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "glp-faint", children: t("\u2191\u2193 or j/k \xB7 Enter \xB7 / search \xB7 x select \xB7 a ask \xB7 Esc clear") })
        ] }),
        search.error ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "glp-alert", "data-tone": "error", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "warning", size: 13 }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: { flex: 1 }, children: errorText(search.error) }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Button, { size: "sm", onClick: () => void search.refetch(), children: t("Retry") })
        ] }) : null,
        selected.size === 0 && search.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "glp-empty", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Spinner, {}),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { children: t("Loading\u2026") })
        ] }) : null,
        selected.size === 0 && !search.isLoading && items.length === 0 && !search.error ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Empty, { icon: props.kind === "mr" ? "mr" : "issue", children: props.kind === "mr" ? t("No merge requests") : t("No issues") }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "glp-list", children: items.map((item, index) => {
          const isNew = seen > 0 && Date.parse(item.created) > seen;
          const isUpdated = seen > 0 && !isNew && Date.parse(item.updated) > seen;
          const isSelected = selected.has(item.number);
          const rowActionsForAgent = agentActions.filter((action) => action.repo === props.repo && action.number === item.number && action.item === props.kind);
          const pendingForRow = rowActionsForAgent.filter((action) => action.status === "proposed").length;
          const runningForRow = rowActionsForAgent.filter((action) => action.status === "approved" || action.status === "running").length;
          return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
            "div",
            {
              "data-index": index,
              className: "glp-row-item",
              "data-compact": prefs2.compactRows ? "" : void 0,
              "data-active": active === index ? "" : void 0,
              "data-new": isNew ? "" : void 0,
              "data-updated": isUpdated ? "" : void 0,
              style: { background: active === index ? "var(--glp-hover)" : void 0 },
              onClick: (event) => {
                if (event.target.closest(".glp-icon-btn, .glp-menu, button, input, label")) return;
                if (event.shiftKey) {
                  event.preventDefault();
                  toggle(item.number, true);
                  return;
                }
                if (event.metaKey || event.ctrlKey) {
                  event.preventDefault();
                  toggle(item.number);
                  return;
                }
                setActive(index);
                openRow(item);
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "glp-row-check", onClick: (event) => event.stopPropagation(), style: { opacity: isSelected || active === index ? 1 : void 0 }, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("input", { type: "checkbox", checked: isSelected, onChange: () => toggle(item.number), "aria-label": t("Select") }) }),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(StateIcon, { kind: item.kind, state: item.state, draft: item.draft }),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "glp-row-content", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "glp-row-title", title: item.title, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: "glp-num", children: [
                      item.kind === "mr" ? "!" : "#",
                      item.number
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "glp-ellipsis", children: item.title }),
                    item.draft && item.state === "OPEN" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Pill, { tone: "draft", children: t("Draft") }) : null
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "glp-row-meta", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { children: [
                      "@",
                      item.author
                    ] }),
                    item.labels.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: "glp-labels", children: [
                      item.labels.slice(0, 3).map((label) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(LabelChip, { label }, label.name)),
                      item.labels.length > 3 ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: "glp-faint", children: [
                        "+",
                        item.labels.length - 3
                      ] }) : null
                    ] }) : null,
                    item.kind === "mr" && item.head ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "glp-mono", style: { fontSize: 10 }, children: item.head }) : null,
                    prefs2.compactRows ? null : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Age, { date: item.updated, title: true }),
                    item.comments > 0 ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: "glp-row", style: { gap: 2 }, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Icon, { name: "comment", size: 10 }),
                      item.comments
                    ] }) : null
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "glp-row-end", children: [
                  item.kind === "mr" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(CheckDot, { state: item.checks }) : null,
                  item.assignees && item.assignees.length > 0 ? item.assignees.slice(0, 2).map((name2) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Avatar, { name: name2, size: 16 }, name2)) : null,
                  rowActionsForAgent.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Pill, { tone: pendingForRow > 0 ? "warn" : runningForRow > 0 ? "accent" : "success", title: rowActionsForAgent.map((action) => `${action.kind}: ${action.status}`).join("\n"), children: pendingForRow > 0 ? `${pendingForRow} ${t("to approve")}` : runningForRow > 0 ? t("running") : t("done") }) : null,
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { style: { minWidth: 26, textAlign: "right" }, children: (item.kind === "mr" ? "!" : "#") + item.number }),
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Menu, { label: t("More"), icon: "dots", trigger: "icon", items: rowMenu(item) })
                ] })
              ]
            },
            `${item.repo}#${item.number}`
          );
        }) }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { ref: sentinel, style: { height: 1 } }),
        search.isFetchingNextPage ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "glp-empty", "data-inline": true, children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Spinner, {}),
          " ",
          t("Loading\u2026")
        ] }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(CloseDialog, { open: dialog === "close", repo: props.repo, kind: props.kind, numbers: [...selected], sessionID: props.sessionId, mode: "bulk", onClose: () => setDialog(void 0), onDone: () => {
          setSelected(/* @__PURE__ */ new Set());
          void queryClient.invalidateQueries({ queryKey: ["search"] });
        } }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(CommentDialog, { open: dialog === "comment", repo: props.repo, kind: props.kind, numbers: [...selected], sessionID: props.sessionId, mode: "bulk", onClose: () => setDialog(void 0), onDone: () => {
          setSelected(/* @__PURE__ */ new Set());
          void queryClient.invalidateQueries({ queryKey: ["search"] });
        } }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(BulkLabelDialog, { open: dialog === "label", repo: props.repo, kind: props.kind, numbers: [...selected], sessionID: props.sessionId, onClose: () => setDialog(void 0), onDone: () => {
          setSelected(/* @__PURE__ */ new Set());
          void queryClient.invalidateQueries({ queryKey: ["search"] });
        } }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(BulkAssignDialog, { open: dialog === "assign", repo: props.repo, kind: props.kind, numbers: [...selected], sessionID: props.sessionId, onClose: () => setDialog(void 0), onDone: () => {
          setSelected(/* @__PURE__ */ new Set());
          void queryClient.invalidateQueries({ queryKey: ["search"] });
        } }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(SavedSearchDialog, { open: dialog === "save", repo: props.repo, kind: props.kind, query, onClose: () => setDialog(void 0), onSaved: (entry) => apply2(entry.query, "") }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          TriageDialog,
          {
            open: dialog === "triage",
            repo: props.repo,
            kind: props.kind,
            cwd: props.cwd,
            query: selected.size > 0 ? null : applied,
            numbers: selected.size > 0 ? [...selected] : [],
            total: selected.size > 0 ? selected.size : total,
            sessionID: props.sessionId,
            onClose: () => setDialog(void 0),
            onDone: () => setSelected(/* @__PURE__ */ new Set())
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(RowActions, { open: !!rowActions, item: rowActions, menu: rowActions ? rowMenu(rowActions) : [], onClose: () => setRowActions(void 0) }),
        startItem ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(StartWorkDialog, { open: true, item: startItem, cwd: props.cwd, defaultBranch: props.overview.defaultBranch, onClose: () => setStartItem(void 0), onDone: () => void queryClient.invalidateQueries({ queryKey: ["search"] }) }) : null
      ]
    }
  );
}
function RowActions(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Modal, { open: props.open, title: props.item ? `${props.item.kind === "mr" ? "!" : "#"}${props.item.number} ${props.item.title}` : "", onClose: props.onClose, footer: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Button, { variant: "ghost", onClick: props.onClose, children: t("Close") }), children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "glp-col", children: props.menu.map(
    (entry, index) => entry.type === "separator" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "glp-menu-sep" }, index) : entry.type === "header" ? null : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Button, { variant: entry.danger ? "danger" : "ghost", icon: entry.icon, onClick: () => {
      props.onClose();
      entry.onSelect();
    }, children: entry.label }, index)
  ) }) });
}
function BulkLabelDialog(props) {
  const meta = useMeta(props.repo, props.open);
  const [add, setAdd] = (0, import_react8.useState)([]);
  const [remove, setRemove] = (0, import_react8.useState)([]);
  const [busy, setBusy] = (0, import_react8.useState)(false);
  (0, import_react8.useEffect)(() => {
    if (props.open) {
      setAdd([]);
      setRemove([]);
    }
  }, [props.open]);
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
    Modal,
    {
      open: props.open,
      title: t("Label {count} items", { count: props.numbers.length }),
      onClose: props.onClose,
      footer: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Button, { variant: "ghost", onClick: props.onClose, children: t("Cancel") }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          Button,
          {
            variant: "primary",
            busy,
            disabled: add.length === 0 && remove.length === 0,
            onClick: async () => {
              setBusy(true);
              try {
                const result = await rpc("agentQueue", { sessionID: props.sessionID, repo: props.repo, kind: "label", itemKind: props.kind, numbers: props.numbers, add, remove });
                toast({ tone: "success", title: t("Queued {count} label actions", { count: result.queued.length }) });
                props.onClose();
                props.onDone();
              } catch (error) {
                errorToast(error);
              } finally {
                setBusy(false);
              }
            },
            children: t("Apply")
          }
        )
      ] }),
      children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "glp-split", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "glp-dim", children: t("Add") }),
          meta.data?.labels.map((label) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Checkbox, { checked: add.includes(label.name), onChange: (value) => setAdd(value ? [...add, label.name] : add.filter((name2) => name2 !== label.name)), label: label.name }, label.name))
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "glp-dim", children: t("Remove") }),
          meta.data?.labels.map((label) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Checkbox, { checked: remove.includes(label.name), onChange: (value) => setRemove(value ? [...remove, label.name] : remove.filter((name2) => name2 !== label.name)), label: label.name }, label.name))
        ] })
      ] })
    }
  );
}
function BulkAssignDialog(props) {
  const [add, setAdd] = (0, import_react8.useState)("");
  const [remove, setRemove] = (0, import_react8.useState)("");
  const [busy, setBusy] = (0, import_react8.useState)(false);
  (0, import_react8.useEffect)(() => {
    if (props.open) {
      setAdd("");
      setRemove("");
    }
  }, [props.open]);
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
    Modal,
    {
      open: props.open,
      title: t("Assign {count} items", { count: props.numbers.length }),
      onClose: props.onClose,
      footer: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Button, { variant: "ghost", onClick: props.onClose, children: t("Cancel") }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          Button,
          {
            variant: "primary",
            busy,
            onClick: async () => {
              setBusy(true);
              try {
                const result = await rpc("agentQueue", {
                  sessionID: props.sessionID,
                  repo: props.repo,
                  kind: "assign",
                  itemKind: props.kind,
                  numbers: props.numbers,
                  add: add.split(",").map((name2) => name2.trim()).filter(Boolean),
                  remove: remove.split(",").map((name2) => name2.trim()).filter(Boolean)
                });
                toast({ tone: "success", title: t("Queued {count} assign actions", { count: result.queued.length }) });
                props.onClose();
                props.onDone();
              } catch (error) {
                errorToast(error);
              } finally {
                setBusy(false);
              }
            },
            children: t("Apply")
          }
        )
      ] }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "glp-dim", children: t("Assign (comma-separated usernames)") }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("input", { className: "glp-input", value: add, onChange: (event) => setAdd(event.target.value), placeholder: "@me, alice" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "glp-dim", children: t("Unassign (comma-separated usernames)") }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("input", { className: "glp-input", value: remove, onChange: (event) => setRemove(event.target.value) })
        ] })
      ]
    }
  );
}

// src/client/activity.tsx
var import_react10 = require("react");
init_api();

// src/client/item.tsx
var import_react9 = require("react");
init_api();
init_i18n();
var import_jsx_runtime9 = require("react/jsx-runtime");
function ItemPage(props) {
  const item = useItem(props.repo, props.number, props.kind);
  const [tab, setTab] = (0, import_react9.useState)("overview");
  const [dialog, setDialog] = (0, import_react9.useState)();
  const [comment, setComment] = (0, import_react9.useState)("");
  const [busy, setBusy] = (0, import_react9.useState)();
  const [editingProposal, setEditingProposal] = (0, import_react9.useState)();
  const [foldAll, setFoldAll] = (0, import_react9.useState)(void 0);
  const agent = useAgent(props.sessionId);
  const prefs2 = usePrefs()[0];
  const overview = useOverview(props.cwd, { enabled: !!props.cwd });
  const drafts = useDrafts(props.repo, props.number, props.sessionId);
  const reviews = useReviews(props.repo, props.number, item.data?.kind === "mr" && item.data?.state === "OPEN");
  const data = item.data;
  (0, import_react9.useEffect)(() => {
    setCurrentRepo(props.repo);
  }, [props.repo]);
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["item", props.repo, props.number] });
    void queryClient.invalidateQueries({ queryKey: ["reviews", props.repo, props.number] });
    void queryClient.invalidateQueries({ queryKey: ["drafts", props.repo, props.number] });
  };
  const act = async (id, work, success) => {
    if (busy) return;
    setBusy(id);
    try {
      await work();
      if (success) toast({ tone: "success", title: success });
      refresh();
    } catch (error) {
      errorToast(error);
    } finally {
      setBusy(void 0);
    }
  };
  const postComment = async () => {
    if (!comment.trim()) return;
    await act("comment", async () => {
      await rpc("comment", { repo: props.repo, number: props.number, kind: data?.kind ?? props.kind, body: comment });
      setComment("");
      toast({ tone: "success", title: t("Comment posted") });
    });
  };
  const sendReview = (event) => {
    const typed = comment;
    if (!typed.trim() && event !== "APPROVE") return;
    void act(
      "comment",
      async () => {
        await rpc("submitReview", { repo: props.repo, number: props.number, event, body: typed });
        setComment((current2) => current2 === typed ? "" : current2);
      },
      event === "APPROVE" ? t("Approved") : event === "REQUEST_CHANGES" ? t("Changes requested") : t("Review submitted")
    );
  };
  const composerKey = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void postComment();
    }
  };
  const reopen = () => void act("reopen", async () => {
    await rpc("setState", { repo: props.repo, number: props.number, kind: data?.kind ?? props.kind, open: true });
  }, t("Reopened"));
  const quote = async () => {
    if (!data) return;
    const { quoteToChat: quoteToChat2 } = await Promise.resolve().then(() => (init_api(), api_exports));
    await quoteToChat2(props.sessionId, props.cwd, itemQuote(data));
  };
  const checkout = () => void act("checkout", async () => {
    await rpc("checkoutMr", { cwd: props.cwd, repo: props.repo, number: props.number });
    toast({ tone: "success", title: t("Checked out") });
  });
  const preReview = async () => {
    if (!data) return;
    await act("review", async () => {
      await startAgentSession({ cwd: props.cwd, prompt: reviewPrompt(data) });
      toast({ tone: "success", title: t("Session started") });
    });
  };
  if (item.isLoading && !data) {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "glp-root", "data-glp": "", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-empty", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Spinner, {}),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: t("Loading\u2026") })
    ] }) });
  }
  if (item.error || !data) {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "glp-root", "data-glp": "", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-empty", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Icon, { name: "warning", size: 20 }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: item.error ? errorText(item.error) : t("Not found") }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", onClick: () => void item.refetch(), children: t("Retry") })
    ] }) });
  }
  const state = data.draft && data.state === "OPEN" ? "DRAFT" : data.state;
  const pending = (agent.data?.actions ?? []).filter((action) => action.repo === props.repo && action.number === props.number && action.item === data.kind && (action.status === "proposed" || action.status === "approved" || action.status === "running"));
  const currentDraft = drafts.data?.find((draft) => draft.sessionID === props.sessionId) ?? void 0;
  const otherDraft = drafts.data?.find((draft) => draft.sessionID !== props.sessionId);
  const mine = reviews.data?.mine ?? false;
  const menu = [
    { label: t("Edit"), icon: "settings", onSelect: () => setDialog("edit") },
    { label: t("Add to chat"), icon: "comment", onSelect: () => void quote() },
    { label: t("Copy link"), icon: "copy", onSelect: () => {
      navigator.clipboard?.writeText(data.url);
      toast({ tone: "success", title: t("Copied") });
    } },
    { label: t("Open on GitLab"), icon: "external", onSelect: () => openExternal(data.url) },
    { type: "separator" },
    ...data.kind === "issue" ? [{ label: t("Start working"), icon: "play", onSelect: () => setDialog("start") }] : [
      { label: t("Pre-review with agent"), icon: "sparkles", onSelect: () => void preReview() },
      { label: t("Checkout"), icon: "download", onSelect: () => checkout() },
      { label: t("Merge\u2026"), icon: "mr", disabled: data.state !== "OPEN", onSelect: () => setDialog("merge") }
    ]
  ];
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-root", "data-glp": "", "data-item-page": true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-topbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(StateIcon, { kind: data.kind, state: data.state, draft: data.draft }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "glp-repo glp-ellipsis", style: { maxWidth: "none", flex: 1 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "glp-faint", children: [
          data.repo,
          data.kind === "mr" ? "!" : "#"
        ] }),
        data.number,
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { style: { fontWeight: 400, marginLeft: 6 }, children: data.title })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-topbar-actions", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(IconButton, { icon: "refresh", label: t("Refresh"), onClick: refresh }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Menu, { items: menu, label: t("More"), icon: "dots" }),
        props.onClose ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(IconButton, { icon: "close", label: t("Close"), onClick: props.onClose }) : null
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-item-tabs", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("button", { type: "button", className: "glp-item-tab", "data-selected": tab === "overview" ? "" : void 0, onClick: () => setTab("overview"), children: t("Overview") }),
      data.kind === "mr" ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("button", { type: "button", className: "glp-item-tab", "data-selected": tab === "files" ? "" : void 0, onClick: () => setTab("files"), children: [
          t("Files"),
          data.pr?.files ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-tab-count", style: { marginLeft: 4 }, children: data.pr.files }) : null
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("button", { type: "button", className: "glp-item-tab", "data-selected": tab === "checks" ? "" : void 0, onClick: () => setTab("checks"), children: t("Checks") })
      ] }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-spacer" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-faint", style: { fontSize: 10.5 }, children: state === "DRAFT" ? t("Draft") : t(state === "MERGED" ? "Merged" : state === "CLOSED" ? "Closed" : "Open") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-body", children: [
      tab === "overview" ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-item", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "glp-item-head", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-col", style: { flex: 1, gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "glp-item-title", children: data.title }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-item-meta", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Avatar, { name: data.author, size: 16 }),
            " @",
            data.author,
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { children: [
              "\xB7 ",
              t("opened {date}", { date: formatDate(data.created) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { children: [
              "\xB7 ",
              t("updated {date}", { date: formatDate(data.updated) })
            ] }),
            data.pr ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: "\xB7" }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "glp-mono", children: [
                data.pr.head,
                " \u2192 ",
                data.pr.base
              ] })
            ] }) : null
          ] })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-item-actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", icon: "comment", onClick: () => setDialog("comment"), children: t("Comment") }),
          data.state === "OPEN" ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", icon: "close", onClick: () => setDialog("close"), children: t("Close") }) : data.state !== "MERGED" ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", icon: "undo", busy: busy === "reopen", onClick: reopen, children: t("Reopen") }) : null,
          data.kind === "issue" ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", icon: "play", onClick: () => setDialog("start"), children: t("Start working") }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", icon: "comment", onClick: () => void quote(), children: t("Add to chat") }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-spacer" }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", icon: "external", onClick: () => openExternal(data.url), children: t("Open on GitLab") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-row", style: { flexWrap: "wrap", gap: 4 }, children: [
          data.labels.map((label) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(LabelChip, { label }, label.name)),
          data.assignees.map((name2) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "glp-chip", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Avatar, { name: name2, size: 12 }),
            " ",
            name2
          ] }, name2)),
          data.milestone ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(Pill, { children: [
            t("Milestone"),
            ": ",
            data.milestone
          ] }) : null,
          data.pr?.review ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Pill, { tone: data.pr.review === "APPROVED" ? "success" : "accent", children: data.pr.review === "APPROVED" ? t("Approved") : t("Review required") }) : null,
          data.pr?.mergeable ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Pill, { tone: mergeability(data.pr.mergeable).tone, children: t(mergeability(data.pr.mergeable).label) }) : null
        ] }),
        pending.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(AgentBanner, { actions: pending, onEdit: setEditingProposal, onDone: refresh }) : null,
        currentDraft || otherDraft ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(DraftBanner, { draft: currentDraft ?? otherDraft, own: !!currentDraft, onReview: () => setTab("files") }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Clamp, { lines: prefs2.foldItems ? 12 : 0, open: foldAll, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Markdown, { text: data.body || `_${t("No description.")}_`, repo: data.repo, onOpenItem: (kind, number) => nav.openItem({ repo: data.repo, kind, number }) }) }),
        data.links && data.links.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-col", style: { gap: 3 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("strong", { style: { fontSize: 11.5 }, children: data.kind === "mr" ? t("Closes") : t("Linked merge requests") }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "glp-row", style: { flexWrap: "wrap" }, children: data.links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("button", { type: "button", className: "glp-chip", style: { border: 0, cursor: "pointer" }, onClick: () => nav.openItem({ repo: link.repo, kind: data.kind === "mr" ? "issue" : "mr", number: link.number }), children: [
            link.repo === data.repo ? "" : `${link.repo} `,
            data.kind === "mr" ? "#" : "!",
            link.number
          ] }, `${link.repo}#${link.number}`)) })
        ] }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-col", style: { gap: 6 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("strong", { style: { flex: 1 }, children: [
              t("Comments"),
              " ",
              data.comments.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-faint", children: data.comments.length }) : null
            ] }),
            prefs2.foldItems ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => setFoldAll(true), children: t("Fold all") }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => setFoldAll(false), children: t("Unfold all") })
            ] }) : null
          ] }),
          data.comments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "glp-faint", children: t("No comments yet.") }) : null,
          data.comments.map((entry, index) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-comment", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-comment-head", children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Avatar, { name: entry.author, size: 14 }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("strong", { style: { color: "var(--glp-text-2)" }, children: [
                "@",
                entry.author
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { children: [
                "\xB7 ",
                formatDate(entry.created, "long")
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-spacer" }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("button", { type: "button", className: "glp-chip", style: { border: 0, cursor: "pointer" }, onClick: async () => {
                const text = `> @${entry.author} in ${data.repo}${data.kind === "mr" ? "!" : "#"}${data.number}:

${entry.body}`;
                const { quoteToChat: quoteToChat2 } = await Promise.resolve().then(() => (init_api(), api_exports));
                await quoteToChat2(props.sessionId, props.cwd, text);
              }, children: t("Add to chat") })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "glp-comment-body", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Clamp, { lines: prefs2.foldItems ? 10 : 0, open: foldAll, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Markdown, { text: entry.body, repo: data.repo, onOpenItem: (kind, number) => nav.openItem({ repo: data.repo, kind, number }) }) }) })
          ] }, entry.id ?? index))
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-col", style: { gap: 5, borderTop: "0.5px solid var(--glp-border)", paddingTop: 10 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(TextArea, { rows: 4, value: comment, onChange: (event) => setComment(event.target.value), onKeyDown: composerKey, placeholder: t("Comment\u2026") }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-faint", style: { fontSize: 10.5 }, children: t("Markdown is supported. \u2318\u23CE posts.") }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-spacer" }),
            data.kind === "mr" && data.state === "OPEN" ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              Menu,
              {
                trigger: "text",
                icon: "eye",
                align: "end",
                label: t("Submit review"),
                disabled: !!busy,
                items: [
                  { label: t("Approve"), icon: "check-circle", disabled: mine || !!busy, onSelect: () => sendReview("APPROVE") },
                  { label: t("Request changes"), icon: "warning", disabled: mine || !!busy || !comment.trim(), onSelect: () => sendReview("REQUEST_CHANGES") },
                  { type: "separator" },
                  { label: t("Comment"), icon: "comment", disabled: !!busy || !comment.trim(), onSelect: () => sendReview("COMMENT") }
                ]
              }
            ) : null,
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "primary", busy: busy === "comment", disabled: !comment.trim(), onClick: () => void postComment(), children: t("Comment") })
          ] }),
          mine ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "glp-faint", style: { fontSize: 10.5 }, children: t("You wrote this merge request, so GitLab will not record a verdict from you.") }) : null
        ] })
      ] }) : null,
      tab === "files" ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        FilesView,
        {
          repo: props.repo,
          number: props.number,
          item: data,
          draft: currentDraft,
          sessionId: props.sessionId,
          cwd: props.cwd,
          onRefresh: refresh
        }
      ) : null,
      tab === "checks" ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ChecksView, { repo: props.repo, item: data }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(CommentDialog, { open: dialog === "comment", repo: props.repo, kind: data.kind, numbers: [props.number], sessionID: props.sessionId, mode: "item", onClose: () => setDialog(void 0), onDone: refresh }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(CloseDialog, { open: dialog === "close", repo: props.repo, kind: data.kind, numbers: [props.number], sessionID: props.sessionId, mode: "item", onClose: () => setDialog(void 0), onDone: refresh }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(EditItemDialog, { open: dialog === "edit", item: data, onClose: () => setDialog(void 0), onDone: refresh }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(MergeDialog, { open: dialog === "merge", repo: props.repo, number: props.number, onClose: () => setDialog(void 0), onDone: refresh }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(StartWorkDialog, { open: dialog === "start", item: data, cwd: props.cwd, defaultBranch: overview.data?.defaultBranch ?? null, onClose: () => setDialog(void 0), onDone: () => void queryClient.invalidateQueries({ queryKey: ["item", props.repo, props.number] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(EditProposalDialog, { action: editingProposal, onClose: () => setEditingProposal(void 0), onDone: refresh })
  ] });
}
function AgentBanner(props) {
  const [busy, setBusy] = (0, import_react9.useState)();
  const decide = async (action, decision) => {
    setBusy(action.id + decision);
    try {
      await rpc("agentDecide", { sessionID: action.sessionID, ids: [action.id], batch: null, decision });
      toast({ tone: "success", title: decision === "approve" ? t("Approved") : t("Skipped") });
      props.onDone();
    } catch (error) {
      errorToast(error);
    } finally {
      setBusy(void 0);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-review-bar", children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Icon, { name: "sparkles", size: 13 }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("strong", { style: { flex: 1 }, children: t("Agent proposed changes") }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-faint", children: props.actions.length })
    ] }),
    props.actions.map((action) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-col", style: { gap: 3, borderTop: "0.5px solid var(--glp-border)", paddingTop: 5 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-status-pill", "data-status": action.status, children: t(action.status) }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-ellipsis", style: { flex: 1 }, children: describeAction(action) })
      ] }),
      action.note ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "glp-faint glp-wrap", style: { fontSize: 11 }, children: action.note }) : null,
      action.edited ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Pill, { tone: "accent", children: t("edited by you") }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "primary", busy: busy === action.id + "approve", disabled: action.status !== "proposed", onClick: () => void decide(action, "approve"), children: t("Approve") }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", disabled: action.status !== "proposed", onClick: () => props.onEdit(action), children: t("Edit") }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", busy: busy === action.id + "skip", disabled: action.status !== "proposed", onClick: () => void decide(action, "skip"), children: t("Skip") })
      ] })
    ] }, action.id))
  ] });
}
function describeAction(action) {
  const payload = action.payload;
  if (action.kind === "comment") return `comment \u201C${(payload.body ?? "").slice(0, 80)}\u201D`;
  if (action.kind === "close") return action.item === "mr" ? t("close") : `close (${t(payload.reason ?? "completed")})`;
  if (action.kind === "reopen") return t("Reopen");
  if (action.kind === "label") return `${t("Labels")}: +${(payload.add ?? []).join(", ")} \u2212${(payload.remove ?? []).join(", ")}`;
  if (action.kind === "assign") return `${t("Assignees")}: +${(payload.add ?? []).join(", ")} \u2212${(payload.remove ?? []).join(", ")}`;
  return action.kind;
}
function EditProposalDialog(props) {
  const [body, setBody] = (0, import_react9.useState)("");
  const [reason, setReason] = (0, import_react9.useState)("completed");
  const [duplicateOf, setDuplicateOf] = (0, import_react9.useState)("");
  const [add, setAdd] = (0, import_react9.useState)("");
  const [remove, setRemove] = (0, import_react9.useState)("");
  const [busy, setBusy] = (0, import_react9.useState)(false);
  const [error, setError] = (0, import_react9.useState)();
  const kind = props.action?.kind;
  (0, import_react9.useEffect)(() => {
    if (!props.action) return;
    const payload = props.action.payload;
    setBody(payload.body ?? "");
    setReason(payload.reason ?? "completed");
    setDuplicateOf(payload.duplicateOf ? String(payload.duplicateOf) : "");
    setAdd((payload.add ?? []).join(", "));
    setRemove((payload.remove ?? []).join(", "));
    setError(void 0);
  }, [props.action]);
  const names = (text) => text.split(",").map((name2) => name2.trim()).filter(Boolean);
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
    Modal,
    {
      open: !!props.action,
      title: t("Edit proposal"),
      onClose: props.onClose,
      footer: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { variant: "ghost", onClick: props.onClose, children: t("Cancel") }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
          Button,
          {
            variant: "primary",
            busy,
            onClick: async () => {
              const action = props.action;
              if (!action || busy) return;
              setBusy(true);
              setError(void 0);
              try {
                const edit = action.kind === "label" || action.kind === "assign" ? { add: names(add), remove: names(remove) } : action.kind === "close" ? { body, reason, duplicateOf: reason === "duplicate" ? Number(duplicateOf.replace("#", "")) || null : null } : { body };
                await rpc("agentEdit", { sessionID: action.sessionID, id: action.id, ...edit });
                toast({ tone: "success", title: t("Saved") });
                props.onClose();
                props.onDone();
              } catch (caught) {
                setError(errorText(caught));
              } finally {
                setBusy(false);
              }
            },
            children: t("Save")
          }
        )
      ] }),
      children: [
        props.action ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-dim", children: [
          props.action.repo,
          props.action.item === "mr" ? "!" : "#",
          props.action.number,
          " \xB7 ",
          props.action.title
        ] }) : null,
        error ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(InlineError, { error }) : null,
        kind === "close" && props.action?.item === "issue" ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-dim", children: t("Reason") }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("select", { className: "glp-select", value: reason, onChange: (event) => setReason(event.target.value), children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("option", { value: "completed", children: t("Completed") }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("option", { value: "not_planned", children: t("Not planned") }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("option", { value: "duplicate", children: t("Duplicate") })
          ] })
        ] }) : null,
        kind === "close" && reason === "duplicate" && props.action?.item === "issue" ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-dim", children: t("Duplicate of") }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("input", { className: "glp-input", value: duplicateOf, onChange: (event) => setDuplicateOf(event.target.value), placeholder: "#" })
        ] }) : null,
        kind === "comment" || kind === "close" || kind === "reopen" ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-dim", children: t("Comment") }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(TextArea, { rows: 6, value: body, onChange: (event) => setBody(event.target.value) })
        ] }) : null,
        kind === "label" || kind === "assign" ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-dim", children: kind === "label" ? t("Add labels") : t("Add assignees") }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("input", { className: "glp-input", value: add, onChange: (event) => setAdd(event.target.value), placeholder: t("Comma-separated") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("label", { className: "glp-col", style: { gap: 4 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-dim", children: kind === "label" ? t("Remove labels") : t("Remove assignees") }),
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("input", { className: "glp-input", value: remove, onChange: (event) => setRemove(event.target.value), placeholder: t("Comma-separated") })
          ] })
        ] }) : null
      ]
    }
  );
}
function DraftBanner(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-review-bar", children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Icon, { name: "sparkles", size: 13 }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("strong", { style: { flex: 1 }, children: t("Draft review") }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Pill, { tone: "accent", children: t(props.draft.event === "APPROVE" ? "Approve" : props.draft.event === "REQUEST_CHANGES" ? "Request changes" : "Comment only") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "glp-faint glp-wrap", style: { fontSize: 11 }, children: props.draft.summary || props.draft.note }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "glp-faint", style: { fontSize: 10.5 }, children: [
        props.draft.comments.length,
        " ",
        t("inline comments"),
        " \xB7 ",
        props.own ? t("yours in this session") : t("from another session")
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-spacer" }),
      props.own ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "primary", onClick: props.onReview, children: t("Review") }) : null
    ] })
  ] });
}
function FilesView(props) {
  const head = props.item.pr?.sha;
  const files = useFiles(props.repo, props.number, head);
  const reviews = useReviews(props.repo, props.number, true);
  const [collapsed, setCollapsed] = (0, import_react9.useState)(/* @__PURE__ */ new Set());
  const [viewed, setViewed] = (0, import_react9.useState)(() => {
    try {
      const raw = localStorage.getItem(`dsh-gitlab-panel.viewed:${props.repo}!${props.number}@${head ?? ""}`);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return /* @__PURE__ */ new Set();
    }
  });
  const [commentTarget, setCommentTarget] = (0, import_react9.useState)();
  const [commentBody, setCommentBody] = (0, import_react9.useState)("");
  const [busy, setBusy] = (0, import_react9.useState)(false);
  const draft = props.draft;
  const prefs2 = usePrefs()[0];
  const threads = reviews.data?.threads ?? [];
  (0, import_react9.useEffect)(() => {
    try {
      localStorage.setItem(`dsh-gitlab-panel.viewed:${props.repo}!${props.number}@${head ?? ""}`, JSON.stringify([...viewed]));
    } catch {
    }
  }, [viewed, props.repo, props.number, head]);
  const saveViewed = (path, value) => setViewed((current2) => {
    const next = new Set(current2);
    if (value) next.add(path);
    else next.delete(path);
    return next;
  });
  const addComment = async () => {
    if (!commentTarget || !commentBody.trim() || !head) return;
    setBusy(true);
    try {
      await rpc("reviewEdit", {
        sessionID: props.sessionId,
        repo: props.repo,
        number: props.number,
        sha: head,
        add: { path: commentTarget.path, line: commentTarget.line, side: commentTarget.side, startLine: null, body: commentBody }
      });
      setCommentTarget(void 0);
      setCommentBody("");
      props.onRefresh();
      toast({ tone: "success", title: t("Added to the review draft") });
    } catch (error) {
      errorToast(error);
    } finally {
      setBusy(false);
    }
  };
  const draftFor = (path) => (draft?.comments ?? []).filter((comment) => comment.path === path);
  const threadsFor = (path) => threads.filter((thread) => thread.path === path);
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-files-toolbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "glp-faint", style: { fontSize: 11 }, children: [
        files.data?.length ?? 0,
        " ",
        t("files changed")
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-spacer" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => setCollapsed(collapsed.size > 0 ? /* @__PURE__ */ new Set() : new Set((files.data ?? []).map((file) => file.path))), children: collapsed.size > 0 ? t("Expand all") : t("Collapse all") })
    ] }),
    draft ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ReviewBar, { repo: props.repo, number: props.number, item: props.item, draft, onDone: props.onRefresh }) : null,
    !draft ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-alert", "data-tone": "info", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Icon, { name: "comment", size: 13 }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { style: { flex: 1 }, children: t("Click a line's number to start a review draft. Nothing is posted until you submit.") }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", icon: "sparkles", onClick: async () => {
        try {
          await startAgentSession({ cwd: props.cwd, prompt: reviewPrompt(props.item) });
        } catch (error) {
          errorToast(error);
        }
      }, children: t("Pre-review with agent") })
    ] }) : null,
    files.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-empty", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Spinner, {}),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: t("Loading\u2026") })
    ] }) : null,
    files.error ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "glp-alert", "data-tone": "error", children: errorText(files.error) }) : null,
    files.data && files.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Empty, { icon: "file", children: t("No changes") }) : null,
    (files.data ?? []).map((file) => {
      const open = !collapsed.has(file.path);
      const fileThreads = threadsFor(file.path);
      const fileDrafts = draftFor(file.path);
      return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
        FileBlock,
        {
          file,
          open,
          onToggle: () => setCollapsed((current2) => {
            const next = new Set(current2);
            if (next.has(file.path)) next.delete(file.path);
            else next.add(file.path);
            return next;
          }),
          viewed: viewed.has(file.path),
          onViewed: (value) => saveViewed(file.path, value),
          onComment: (side, line) => {
            if (!head) return;
            setCommentTarget({ path: file.path, line, side });
            setCommentBody("");
          },
          children: [
            fileThreads.map((thread) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ThreadCard, { repo: props.repo, number: props.number, thread, onDone: props.onRefresh }, thread.id)),
            fileDrafts.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(DraftCommentCard, { repo: props.repo, number: props.number, sessionId: props.sessionId, comment, onDone: props.onRefresh }, comment.id)),
            commentTarget?.path === file.path ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { style: { padding: 8, background: "var(--glp-panel-2)", borderBottom: "0.5px solid var(--glp-border)" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-faint", style: { fontSize: 11, marginBottom: 4 }, children: [
                file.path,
                ":",
                commentTarget.line,
                " (",
                commentTarget.side,
                ") \xB7 ",
                t("New review comment")
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(TextArea, { rows: 3, autoFocus: true, value: commentBody, onChange: (event) => setCommentBody(event.target.value), placeholder: t("What should change?") }),
              /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-row", style: { marginTop: 4 }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "primary", busy, disabled: !commentBody.trim(), onClick: () => void addComment(), children: t("Add comment") }),
                /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => setCommentTarget(void 0), children: t("Cancel") }),
                file.patch ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-faint", style: { fontSize: 10.5 }, children: t("Line {line}", { line: commentTarget.line }) }) : null
              ] })
            ] }) : null,
            /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
              DiffView,
              {
                patch: file.patch,
                maxHeight: prefs2.foldItems ? 420 : 800,
                emptyText: t("No diff"),
                onComment: head ? (side, line) => {
                  setCommentTarget({ path: file.path, line, side });
                  setCommentBody("");
                } : void 0
              }
            )
          ]
        },
        file.path
      );
    })
  ] });
}
function DraftCommentCard(props) {
  const [editing, setEditing] = (0, import_react9.useState)(false);
  const [body, setBody] = (0, import_react9.useState)(props.comment.body);
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-thread", style: { margin: 8 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-thread-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Icon, { name: "comment", size: 11 }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "glp-mono", children: [
        props.comment.path,
        ":",
        props.comment.line,
        " (",
        props.comment.side,
        ")"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-spacer" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Pill, { tone: "accent", children: t("Draft") }),
      props.comment.edited ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Pill, { children: t("edited") }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "glp-thread-note", children: editing ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(TextArea, { rows: 4, value: body, onChange: (event) => setBody(event.target.value) }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-row", style: { marginTop: 4 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "primary", onClick: async () => {
          try {
            await rpc("reviewEdit", { sessionID: props.sessionId, repo: props.repo, number: props.number, update: { id: props.comment.id, body } });
            setEditing(false);
            props.onDone();
          } catch (error) {
            errorToast(error);
          }
        }, children: t("Save") }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => setEditing(false), children: t("Cancel") })
      ] })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Markdown, { text: props.comment.body, repo: props.repo }) }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-thread-actions", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => setEditing(true), children: t("Edit") }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", onClick: async () => {
        try {
          await rpc("reviewEdit", { sessionID: props.sessionId, repo: props.repo, number: props.number, remove: props.comment.id });
          props.onDone();
        } catch (error) {
          errorToast(error);
        }
      }, children: t("Delete") })
    ] })
  ] });
}
function ReviewBar(props) {
  const [summary, setSummary] = (0, import_react9.useState)(props.draft.summary);
  const [event, setEvent] = (0, import_react9.useState)(props.draft.event);
  const [busy, setBusy] = (0, import_react9.useState)(false);
  const [drift, setDrift] = (0, import_react9.useState)();
  (0, import_react9.useEffect)(() => {
    setSummary(props.draft.summary);
    setEvent(props.draft.event);
  }, [props.draft.updatedAt, props.draft.summary, props.draft.event]);
  const submit = async (force) => {
    setBusy(true);
    try {
      await rpc("reviewEdit", { sessionID: props.draft.sessionID, repo: props.repo, number: props.number, summary, event });
      const result = await rpc("reviewSubmit", { sessionID: props.draft.sessionID, repo: props.repo, number: props.number, force });
      if (!result.submitted) {
        setDrift({ moved: result.moved, message: result.message });
        return;
      }
      toast({ tone: "success", title: t("The review was submitted"), description: result.message });
      setDrift(void 0);
      props.onDone();
    } catch (error) {
      errorToast(error);
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-review-bar", style: { margin: 10 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Icon, { name: "sparkles", size: 13 }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("strong", { style: { flex: 1 }, children: t("Draft review") }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "glp-faint", children: [
        props.draft.comments.length,
        " ",
        t("inline comments")
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", onClick: async () => {
        try {
          await rpc("reviewDiscard", { sessionID: props.draft.sessionID, repo: props.repo, number: props.number });
          toast({ tone: "success", title: t("Draft review discarded.") });
          props.onDone();
        } catch (error) {
          errorToast(error);
        }
      }, children: t("Discard draft") })
    ] }),
    props.draft.note ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "glp-faint glp-wrap", style: { fontSize: 11 }, children: props.draft.note }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(TextArea, { rows: 4, value: summary, onChange: (event2) => setSummary(event2.target.value), placeholder: t("Summary") }),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-row", style: { flexWrap: "wrap" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("select", { className: "glp-select", style: { width: "auto" }, value: event, onChange: (e) => setEvent(e.target.value), children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("option", { value: "COMMENT", children: t("Comment only") }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("option", { value: "APPROVE", children: t("Approve MR") }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("option", { value: "REQUEST_CHANGES", children: t("Request changes on MR") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-spacer" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "primary", busy, onClick: () => void submit(false), children: t("Submit review") })
    ] }),
    drift ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-alert", "data-tone": "info", style: { margin: 0 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { style: { flex: 1 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("strong", { children: t("New commits since drafted") }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "glp-faint glp-wrap", style: { fontSize: 11 }, children: drift.message })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "primary", busy, onClick: () => void submit(true), children: t("Submit anyway") })
    ] }) : null
  ] });
}
function ThreadCard(props) {
  const [reply, setReply] = (0, import_react9.useState)("");
  const [busy, setBusy] = (0, import_react9.useState)(false);
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-thread", style: { margin: 8 }, "data-resolved": props.thread.resolved ? "" : void 0, children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-thread-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "glp-mono", children: [
        props.thread.path,
        props.thread.line ? `:${props.thread.line}` : ""
      ] }),
      props.thread.outdated ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Pill, { tone: "warn", children: t("Outdated") }) : null,
      props.thread.resolved ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Pill, { tone: "success", children: t("Resolved") }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-spacer" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", onClick: async () => {
        try {
          await rpc("resolveThread", { repo: props.repo, number: props.number, thread: props.thread.id, resolved: !props.thread.resolved });
          props.onDone();
        } catch (error) {
          errorToast(error);
        }
      }, children: props.thread.resolved ? t("Unresolve") : t("Resolve") })
    ] }),
    props.thread.comments[0]?.hunk ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "glp-thread-hunk", children: props.thread.comments[0].hunk }) : null,
    props.thread.comments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-thread-note", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-row", style: { marginBottom: 2 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Avatar, { name: comment.author, size: 13 }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("strong", { style: { fontSize: 11 }, children: [
          "@",
          comment.author
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-faint", style: { fontSize: 10 }, children: formatDate(comment.created) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Markdown, { text: comment.body, repo: props.repo })
    ] }, comment.id)),
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-thread-actions", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("input", { className: "glp-input", placeholder: t("Reply\u2026"), value: reply, onChange: (event) => setReply(event.target.value), style: { flex: 1 } }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", busy, disabled: !reply.trim(), onClick: async () => {
        setBusy(true);
        try {
          await rpc("replyThread", { repo: props.repo, number: props.number, thread: props.thread.id, body: reply });
          setReply("");
          props.onDone();
        } catch (error) {
          errorToast(error);
        } finally {
          setBusy(false);
        }
      }, children: t("Reply") })
    ] })
  ] });
}
function ChecksView(props) {
  const pipeline = props.item.pr?.checks[0];
  const run = useRun(props.repo, pipeline?.id ?? 0, !!pipeline?.id);
  const [job, setJob] = (0, import_react9.useState)();
  if (!pipeline) {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(Empty, { icon: "pipeline", children: [
      t("No pipeline for this merge request."),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "glp-faint", style: { fontSize: 11 }, children: t("Pipeline checks come from the MR's head pipeline.") })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-checks", children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Icon, { name: "pipeline", size: 13 }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("strong", { style: { flex: 1 }, children: pipeline.name ?? t("Pipeline") }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(CheckDot, { state: pipeline.state }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", icon: "external", onClick: () => pipeline.url && openExternal(pipeline.url), children: t("Open on GitLab") }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", disabled: props.item.state !== "OPEN" || !pipeline.id, onClick: async () => {
        try {
          if (!window.confirm(t("Retry this pipeline?"))) return;
          await rpc("rerun", { repo: props.repo, id: pipeline.id });
          toast({ tone: "success", title: t("Retried") });
        } catch (error) {
          errorToast(error);
        }
      }, children: t("Retry") }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", onClick: async () => {
        try {
          if (!pipeline.id || !window.confirm(t("Cancel this pipeline?"))) return;
          await rpc("cancelRun", { repo: props.repo, id: pipeline.id });
          toast({ tone: "success", title: t("Canceled") });
        } catch (error) {
          errorToast(error);
        }
      }, children: t("Cancel") })
    ] }),
    run.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Spinner, {}),
      " ",
      t("Loading\u2026")
    ] }) : null,
    run.error ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "glp-error", children: errorText(run.error) }) : null,
    sortJobs(run.data?.jobs ?? []).map((entry) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-check-row", "data-state": entry.conclusion === "failed" ? "failure" : void 0, onClick: () => setJob(job === entry.id ? void 0 : entry.id), children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(CheckDot, { state: entry.conclusion === "failed" ? "failure" : entry.conclusion === "success" ? "success" : ["running", "pending", "created"].includes(entry.conclusion) ? "pending" : "none" }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-ellipsis", style: { flex: 1 }, children: entry.name }),
      entry.stage ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Pill, { children: entry.stage }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "glp-faint", style: { fontSize: 10.5 }, children: entry.conclusion || entry.status }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Icon, { name: job === entry.id ? "chevron-down" : "chevron-right", size: 10 })
    ] }, entry.id)),
    job ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(JobPanel, { repo: props.repo, job, onClose: () => setJob(void 0) }) : null
  ] });
}
function sortJobs(jobs) {
  const weight = (job) => job.conclusion === "failed" ? 0 : ["running", "pending", "created"].includes(job.conclusion) ? 1 : job.conclusion === "success" ? 2 : 3;
  return [...jobs].sort((a, b) => weight(a) - weight(b));
}
function JobPanel(props) {
  const log = useJobLog(props.repo, props.job, false);
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { style: { border: "0.5px solid var(--glp-border)", borderRadius: 6, overflow: "hidden", marginTop: 4 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-row", style: { padding: "4px 8px", background: "var(--glp-panel-2)" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Icon, { name: "file", size: 11 }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("strong", { style: { flex: 1 }, children: t("Log") }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => {
        if (log.data) {
          navigator.clipboard?.writeText(log.data);
          toast({ tone: "success", title: t("Copied") });
        }
      }, children: t("Copy") }),
      props.onClose ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Button, { size: "sm", variant: "ghost", onClick: props.onClose, children: t("Close") }) : null
    ] }),
    log.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "glp-empty", "data-inline": true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Spinner, {}),
      " ",
      t("Loading\u2026")
    ] }) : null,
    log.error ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "glp-alert", "data-tone": "error", children: errorText(log.error) }) : null,
    log.data ? /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("pre", { className: "glp-mono", style: { margin: 0, padding: 8, maxHeight: 420, overflow: "auto", fontSize: 10.5, whiteSpace: "pre-wrap", background: "var(--glp-panel)" }, children: log.data }) : null
  ] });
}

// src/client/activity.tsx
init_i18n();
var import_jsx_runtime10 = require("react/jsx-runtime");
function ActivityView(props) {
  const agent = useAgent(props.sessionId);
  const [active, setActive] = (0, import_react10.useState)(0);
  const [busy, setBusy] = (0, import_react10.useState)();
  const [editing, setEditing] = (0, import_react10.useState)();
  const container = (0, import_react10.useRef)(null);
  const queue = agent.data;
  const actions = queue?.actions ?? [];
  const ordered = (0, import_react10.useMemo)(() => [...actions].reverse(), [actions]);
  const proposed = actions.filter((action) => action.status === "proposed");
  const triage = queue?.triage;
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["agent", props.sessionId] });
  const act = async (id, work, success) => {
    if (busy) return;
    setBusy(id);
    try {
      await work();
      if (success) toast({ tone: "success", title: success });
      refresh();
    } catch (error) {
      errorToast(error);
    } finally {
      setBusy(void 0);
    }
  };
  const decide = (action, decision) => act(action.id + decision, async () => {
    await rpc("agentDecide", { sessionID: props.sessionId, ids: [action.id], batch: null, decision });
  }, decision === "approve" ? t("Approved") : decision === "skip" ? t("Skipped") : t("Took back"));
  const approveBatch = (batch) => act("batch" + batch, async () => {
    await rpc("agentDecide", { sessionID: props.sessionId, ids: null, batch, decision: "approve" });
  }, t("Approved"));
  const undo = (action) => act(action.id + "undo", async () => {
    await rpc("agentUndo", { sessionID: props.sessionId, id: action.id });
  }, t("Undoing\u2026"));
  const retry = (action) => act(action.id + "retry", async () => {
    await rpc("agentRetry", { sessionID: props.sessionId, ids: [action.id] });
  }, t("Retrying."));
  const edit = (action) => setEditing(action);
  (0, import_react10.useEffect)(() => {
    setActive((value) => Math.min(value, Math.max(0, ordered.length - 1)));
  }, [ordered.length]);
  const batches = (0, import_react10.useMemo)(() => {
    const map = /* @__PURE__ */ new Map();
    for (const action of actions) {
      const list = map.get(action.batch) ?? [];
      list.push(action);
      map.set(action.batch, list);
    }
    return [...map.entries()].reverse();
  }, [actions]);
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
    "div",
    {
      ref: container,
      tabIndex: 0,
      style: { outline: "none", minHeight: "100%" },
      onKeyDown: (event) => {
        const target = event.target;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;
        const action = ordered[active];
        if ((event.key === "j" || event.key === "ArrowDown") && !event.metaKey) {
          event.preventDefault();
          setActive(Math.min(ordered.length - 1, active + 1));
        } else if ((event.key === "k" || event.key === "ArrowUp") && !event.metaKey) {
          event.preventDefault();
          setActive(Math.max(0, active - 1));
        } else if (event.key === "y" && action?.status === "proposed") {
          void decide(action, "approve");
        } else if (event.key === "n" && action?.status === "proposed") {
          void decide(action, "skip");
        } else if (event.key === "e" && action?.status === "proposed") {
          edit(action);
        } else if (event.key === "u" && action?.status === "done") {
          void undo(action);
        } else if (event.key === "o" && action) {
          props.onOpenItem(action.item === "issue" ? "issue" : "mr", action.number);
        } else if (event.key === "a" && proposed.length > 0) {
          void act("all", async () => {
            await rpc("agentDecide", { sessionID: props.sessionId, ids: null, batch: null, decision: "approve" });
          }, t("Approved"));
        }
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "glp-row", style: { padding: "6px 10px", borderBottom: "0.5px solid var(--glp-border)" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("strong", { style: { flex: 1 }, children: t("Agent activity") }),
          proposed.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(Pill, { tone: "warn", children: [
            proposed.length,
            " ",
            t("to approve")
          ] }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("label", { className: "glp-checkbox", title: t("Run writes at once instead of waiting for approval"), children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("input", { type: "checkbox", checked: !!queue?.auto, onChange: (event) => void act("auto", async () => {
              await rpc("agentAuto", { sessionID: props.sessionId, auto: event.target.checked });
            }, event.target.checked ? t("Auto-run on.") : t("Auto-run off.")) }),
            t("Auto-run")
          ] }),
          proposed.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Button, { size: "sm", variant: "primary", busy: busy === "all", onClick: () => void act("all", async () => {
            await rpc("agentDecide", { sessionID: props.sessionId, ids: null, batch: null, decision: "approve" });
          }, t("Approved")), children: t("Approve all") }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(IconButton, { icon: "refresh", label: t("Refresh"), onClick: refresh })
        ] }),
        triage ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "glp-activity-card", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "glp-activity-head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Icon, { name: "checklist", size: 12 }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { style: { flex: 1 }, children: [
              t("Triage"),
              " \xB7 ",
              triage.repo
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { children: [
              triage.reviewed.length,
              " / ",
              triage.total
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "glp-activity-body", children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "glp-triage-progress", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { style: { width: `${Math.min(100, Math.max(triage.reviewed.length, actions.filter((action) => action.round !== void 0).length) / Math.max(1, triage.total) * 100)}%` } }) }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "glp-faint", style: { fontSize: 11 }, children: [
              triage.reviewed.length,
              " ",
              t("reviewed"),
              " \xB7 ",
              actions.filter((action) => action.source === "tool" && ["approved", "running", "done"].includes(action.status)).length,
              " ",
              t("approved"),
              " \xB7 ",
              actions.filter((action) => action.status === "skipped").length,
              " ",
              t("skipped"),
              " \xB7 ",
              t("batch {count}", { count: triage.round })
            ] }),
            triage.rules ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "glp-faint glp-wrap", style: { fontSize: 11 }, children: [
              t("Rules"),
              ": ",
              triage.rules
            ] }) : null
          ] })
        ] }) : null,
        agent.isLoading && !queue ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "glp-empty", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Spinner, {}),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { children: t("Loading\u2026") })
        ] }) : null,
        agent.error ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "glp-alert", "data-tone": "error", children: errorText(agent.error) }) : null,
        queue && actions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(Empty, { icon: "checklist", children: [
          t("Nothing waiting"),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "glp-faint", style: { fontSize: 11 }, children: t("Agent writes and your bulk actions appear here. Auto-run is {state}.", { state: queue.auto ? t("on") : t("off") }) })
        ] }) : null,
        batches.map(([batch, list]) => {
          const pending = list.filter((action) => action.status === "proposed");
          return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "glp-activity-card", children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "glp-activity-head", children: [
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Icon, { name: "sparkles", size: 12 }),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { style: { flex: 1 }, children: [
                batch,
                " \xB7 ",
                list[0] ? formatDate(list[0].createdAt, "long") : ""
              ] }),
              pending.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Button, { size: "sm", variant: "ghost", busy: busy === "batch" + batch, onClick: () => approveBatch(batch), children: t("Approve all") }) : null
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "glp-activity-body", children: list.map((action) => {
              const index = ordered.indexOf(action);
              return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { style: { borderTop: "0.5px solid var(--glp-border-soft)", paddingTop: 5, background: active === index ? "var(--glp-hover)" : void 0 }, onClick: () => setActive(index), children: [
                /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "glp-row", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(StatusPill, { status: action.status, children: t(action.status) }),
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("button", { type: "button", style: { border: 0, background: "transparent", padding: 0, cursor: "pointer", color: "inherit", flex: 1, textAlign: "left" }, className: "glp-ellipsis", onClick: () => props.onOpenItem(action.item === "issue" ? "issue" : "mr", action.number), children: [
                    /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "glp-faint", children: [
                      action.repo,
                      action.item === "issue" ? "#" : "!",
                      action.number
                    ] }),
                    " ",
                    action.title
                  ] }),
                  action.source === "shell" ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Pill, { children: t("shell") }) : action.source === "user" ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Pill, { children: t("you") }) : null
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "glp-dim glp-wrap", style: { fontSize: 11.5, margin: "2px 0 3px" }, children: describeAction(action) }),
                action.note ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "glp-faint glp-wrap", style: { fontSize: 11 }, children: action.note }) : null,
                action.edited ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "glp-faint", style: { fontSize: 11 }, children: t("edited by you") }) : null,
                action.status === "failed" && action.error ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "glp-error glp-wrap", style: { fontSize: 11 }, children: action.error }) : null,
                action.status === "running" && action.error ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "glp-faint", style: { fontSize: 11 }, children: action.error }) : null,
                action.result?.noop ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "glp-faint", style: { fontSize: 11 }, children: t("nothing to change") }) : null,
                /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "glp-activity-actions", children: [
                  action.status === "proposed" ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Button, { size: "sm", variant: "primary", busy: busy === action.id + "approve", onClick: () => void decide(action, "approve"), children: t("Approve") }),
                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => edit(action), children: t("Edit") }),
                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Button, { size: "sm", variant: "ghost", busy: busy === action.id + "skip", onClick: () => void decide(action, "skip"), children: t("Skip") })
                  ] }) : null,
                  action.status === "approved" ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Button, { size: "sm", variant: "ghost", busy: busy === action.id + "reset", onClick: () => void decide(action, "reset"), children: t("Took back") }) : null,
                  action.status === "done" && !action.undoOf && !action.undoneBy && !action.result?.noop ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Button, { size: "sm", variant: "ghost", icon: "undo", busy: busy === action.id + "undo", onClick: () => void undo(action), children: t("Undo") }) : null,
                  action.status === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Button, { size: "sm", variant: "ghost", busy: busy === action.id + "retry", onClick: () => retry(action), children: t("Retry") }) : null,
                  action.status === "skipped" && action.source === "tool" ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => void decide(action, "reset"), children: t("Took back") }) : null,
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "glp-spacer" }),
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "glp-faint", style: { fontSize: 10 }, children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Age, { date: action.createdAt }) })
                ] })
              ] }, action.id);
            }) })
          ] }, batch);
        }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "glp-footer-note", children: t("Keys: j/k move \xB7 y approve \xB7 n skip \xB7 e edit \xB7 u undo \xB7 o open \xB7 a approve all") }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(EditProposalDialog, { action: editing, onClose: () => setEditing(void 0), onDone: refresh })
      ]
    }
  );
}

// src/client/inbox.tsx
var import_react11 = require("react");
init_api();
init_i18n();
var import_jsx_runtime11 = require("react/jsx-runtime");
function InboxView(props) {
  const inbox = useInbox(true, 6e4);
  const [busy, setBusy] = (0, import_react11.useState)(false);
  const data = inbox.data;
  const groups = (0, import_react11.useMemo)(() => {
    const map = /* @__PURE__ */ new Map();
    for (const entry of data?.notifications ?? []) {
      const list = map.get(entry.repo) ?? [];
      list.push(entry);
      map.set(entry.repo, list);
    }
    return [...map.entries()];
  }, [data]);
  const open = async (entry) => {
    if (entry.number) props.onOpenItem(entry.kind === "mr" ? "mr" : "issue", entry.number, entry.repo || void 0);
    if (entry.thread) {
      try {
        await rpc("markRead", { thread: entry.thread });
        void queryClient.invalidateQueries({ queryKey: ["inbox"] });
      } catch {
      }
    }
  };
  const row = (entry) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "glp-row-item", "data-compact": true, onClick: () => void open(entry), style: { opacity: entry.unread && entry.thread ? 1 : void 0 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(StateIcon, { kind: entry.kind === "mr" ? "mr" : "issue", state: "OPEN" }),
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "glp-row-content", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "glp-row-title", children: [
        entry.number ? /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("span", { className: "glp-num", children: [
          entry.kind === "mr" ? "!" : "#",
          entry.number
        ] }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "glp-ellipsis", children: entry.title }),
        entry.unread && entry.thread ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { style: { width: 6, height: 6, borderRadius: "50%", background: "var(--glp-accent)", flex: "none" } }) : null
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "glp-row-meta", children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { children: entry.reason }),
        entry.repo ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "glp-faint", children: entry.repo }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Age, { date: entry.updated, title: true })
      ] })
    ] })
  ] }, `${entry.thread ?? entry.url}-${entry.number ?? entry.title}`);
  return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "glp-row", style: { padding: "6px 10px", borderBottom: "0.5px solid var(--glp-border)" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("strong", { style: { flex: 1 }, children: t("Inbox") }),
      data && data.notifications.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(Pill, { tone: "accent", children: [
        data.notifications.filter((entry) => entry.unread).length,
        " ",
        t("unread")
      ] }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Button, { size: "sm", variant: "ghost", busy, onClick: async () => {
        setBusy(true);
        try {
          await rpc("markRead", { thread: null });
          toast({ tone: "success", title: t("Marked all read") });
          void queryClient.invalidateQueries({ queryKey: ["inbox"] });
        } catch (error) {
          errorToast(error);
        } finally {
          setBusy(false);
        }
      }, children: t("Mark all read") }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(IconButton, { icon: "refresh", label: t("Refresh"), onClick: () => void inbox.refetch() })
    ] }),
    inbox.isLoading && !data ? /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "glp-empty", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Spinner, {}),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { children: t("Loading\u2026") })
    ] }) : null,
    data?.error ? /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "glp-alert", "data-tone": "error", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Icon, { name: "warning", size: 13 }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { style: { flex: 1 }, children: data.error }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Button, { size: "sm", onClick: () => void inbox.refetch(), children: t("Retry") })
    ] }) : null,
    data && data.notifications.length === 0 && data.reviews.length === 0 && data.assigned.length === 0 && data.authored.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Empty, { icon: "bell", children: t("No notifications") }) : null,
    groups.map(([repo, entries]) => /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("section", { className: "glp-inbox-group", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "glp-inbox-head", children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Icon, { name: "gitlab", size: 12 }),
        " ",
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "glp-ellipsis", style: { flex: 1 }, children: repo }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "glp-faint", children: entries.length })
      ] }),
      entries.map(row)
    ] }, repo)),
    data && data.reviews.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("section", { className: "glp-inbox-group", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "glp-inbox-head", children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Icon, { name: "eye", size: 12 }),
        " ",
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { style: { flex: 1 }, children: t("Review requested from you") }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "glp-faint", children: data.reviews.length })
      ] }),
      data.reviews.map(row)
    ] }) : null,
    data && data.assigned.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("section", { className: "glp-inbox-group", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "glp-inbox-head", children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Icon, { name: "issue", size: 12 }),
        " ",
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { style: { flex: 1 }, children: t("Assigned to you") }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "glp-faint", children: data.assigned.length })
      ] }),
      data.assigned.map(row)
    ] }) : null,
    data && data.authored.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("section", { className: "glp-inbox-group", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "glp-inbox-head", children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(Icon, { name: "mr", size: 12 }),
        " ",
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { style: { flex: 1 }, children: t("Created by you") }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "glp-faint", children: data.authored.length })
      ] }),
      data.authored.map(row)
    ] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "glp-footer-note", children: t("Notifications come from GitLab todos. Opening one marks it read.") })
  ] });
}

// src/client/panel.tsx
var import_jsx_runtime12 = require("react/jsx-runtime");
function MainPanel(props) {
  const [prefs2, setPrefs] = usePrefs();
  const overview = useOverview(props.cwd, { poll: 4e3 });
  const overviewData = overview.data;
  const [page, setPage] = (0, import_react12.useState)(props.params?.show);
  const [view, setView] = (0, import_react12.useState)(props.params?.view ?? prefs2.view);
  const [branchOpen, setBranchOpen] = (0, import_react12.useState)(false);
  const [dialog, setDialog] = (0, import_react12.useState)();
  const [mergeMr, setMergeMr] = (0, import_react12.useState)();
  const [busy, setBusy] = (0, import_react12.useState)();
  const [cleanup, setCleanup] = (0, import_react12.useState)([]);
  const [prompt, setPrompt] = (0, import_react12.useState)();
  (0, import_react12.useEffect)(() => {
    if (props.params?.show) setPage(props.params.show);
    if (props.params?.view) setView(props.params.view);
  }, [props.params?.show, props.params?.view]);
  (0, import_react12.useEffect)(() => {
    if (!overviewData?.remote && (view === "mrs" || view === "issues")) setView("changes");
  }, [overviewData?.remote, view]);
  (0, import_react12.useEffect)(() => {
    setCurrentRepo(overviewData?.remote?.path);
  }, [overviewData?.remote?.path]);
  const agent = useAgent(props.sessionId);
  const inbox = useInbox(true);
  const mrs = useMrs(props.cwd, !!overviewData?.remote);
  const unread = inbox.data?.notifications.filter((entry) => entry.unread).length ?? 0;
  const proposed = agent.data?.actions.filter((action) => action.status === "proposed").length ?? 0;
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["overview", props.cwd] });
    void queryClient.invalidateQueries({ queryKey: ["branches", props.cwd] });
    void queryClient.invalidateQueries({ queryKey: ["log", props.cwd] });
    void queryClient.invalidateQueries({ queryKey: ["outgoing", props.cwd] });
    void queryClient.invalidateQueries({ queryKey: ["mrs", props.cwd] });
  };
  const run = async (id, work) => {
    if (busy) return;
    setBusy(id);
    try {
      await work();
    } catch (error) {
      errorToast(error);
    } finally {
      setBusy(void 0);
      refresh();
    }
  };
  const repo = overviewData?.remote?.path;
  const branches = useBranches(props.cwd, branchOpen || dialog === "cleanup" || dialog === "createMr");
  const merged = useMerged(props.cwd, dialog === "cleanup" || branchOpen);
  const mergedData = merged.data ?? [];
  const branchMrs = useBranchMrs(props.cwd, (branches.data ?? []).filter((branch) => !branch.remote).map((branch) => branch.name), branchOpen);
  const openCleanup = () => {
    const candidates = cleanupCandidates({
      branches: branches.data ?? [],
      current: overviewData?.branch ?? null,
      base: overviewData?.defaultBranch ?? null,
      merged: mergedData,
      mrFor: (name2) => branchMrs.data?.items.find((item) => item.head === name2 && item.state !== "CLOSED") ?? branchMrs.data?.items.find((item) => item.head === name2)
    });
    setCleanup(candidates);
    setDialog("cleanup");
  };
  const topItems = [
    { label: t("Fetch"), icon: "download", disabled: !!busy, onSelect: () => void run("fetch", async () => {
      await rpc("fetch", { cwd: props.cwd });
      refresh();
    }) },
    { label: t("Refresh"), icon: "refresh", onSelect: refresh },
    { type: "separator" },
    { label: t("Pipelines"), icon: "pipeline", disabled: !overviewData?.remote, onSelect: () => {
      setPage(page === "runs" ? void 0 : "runs");
    } },
    { label: t("Inbox"), icon: "inbox", onSelect: () => setPage(page === "inbox" ? void 0 : "inbox") },
    { label: t("Activity"), icon: "checklist", onSelect: () => setPage(page === "activity" ? void 0 : "activity") },
    { type: "separator" },
    { label: t("Open on GitLab"), icon: "external", disabled: !overviewData?.remote, onSelect: () => overviewData?.remote && openExternal(overviewData.remote.web) },
    { label: t("New issue"), icon: "plus", disabled: !overviewData?.remote, onSelect: () => setDialog("createIssue") },
    { label: t("Saved replies"), icon: "comment", disabled: !overviewData?.remote, onSelect: () => setDialog("replies") },
    { type: "separator" },
    { label: t("Header chip"), icon: "branch", checked: prefs2.headerChip, onSelect: () => setPrefs((draft) => {
      draft.headerChip = !draft.headerChip;
    }) },
    { label: t("Settings"), icon: "settings", onSelect: () => setDialog("settings") }
  ];
  if (overview.isLoading && !overviewData) {
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-empty", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Spinner, {}),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { children: t("Loading\u2026") })
    ] }) });
  }
  if (overview.error) {
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-empty", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { name: "warning", size: 20 }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { children: errorText(overview.error) }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", onClick: refresh, children: t("Retry") })
    ] }) });
  }
  if (!overviewData) {
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-empty", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { name: "branch", size: 22 }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { children: t("Not a git repository") })
    ] }) });
  }
  const current2 = overviewData;
  const currentIssue = current2.remote && current2.branch ? getPrefs().issueBranches[`${current2.remote.path}:${current2.branch}`] ?? issueFromBranch(current2.branch) : void 0;
  const openItem = (kind, number, repo2) => {
    const target = repo2 ?? current2.remote?.path;
    if (target) nav.openItem({ repo: target, kind, number });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-root", "data-glp": "", "data-glp-root": true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-topbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-repo glp-ellipsis", title: current2.root, children: current2.remote ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "glp-faint", children: [
          current2.remote.owner,
          "/"
        ] }),
        current2.remote.repo
      ] }) : current2.name }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-tabs", role: "tablist", children: ["changes", "history", ...current2.remote ? ["mrs", "issues"] : []].map((id) => {
        const labels = { changes: t("Changes"), history: t("History"), mrs: t("MRs"), issues: t("Issues") };
        const selected = !page && view === id;
        return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("button", { type: "button", role: "tab", className: "glp-tab", "aria-selected": selected, "data-selected": selected ? "" : void 0, title: id === "mrs" ? t("Merge requests") : labels[id], onClick: () => {
          setPage(void 0);
          setView(id);
          setPrefs((draft) => {
            draft.view = id;
          });
        }, children: [
          labels[id],
          id === "changes" && current2.files.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-tab-count", children: current2.files.length }) : null
        ] }, id);
      }) }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-topbar-actions", children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "glp-bell", children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(IconButton, { icon: "checklist", label: t("Activity"), pressed: page === "activity", onClick: () => setPage(page === "activity" ? void 0 : "activity") }),
          proposed > 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-count-badge", "data-tone": "warn", children: proposed > 99 ? "99+" : proposed }) : null
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "glp-bell", children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(IconButton, { icon: "bell", label: t("Inbox"), pressed: page === "inbox", onClick: () => setPage(page === "inbox" ? void 0 : "inbox") }),
          unread > 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-count-badge", children: unread > 99 ? "99+" : unread }) : null
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Menu, { items: topItems, label: t("More"), icon: "dots" })
      ] })
    ] }),
    page ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-branchbar", style: { padding: 0 }, children: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-row", style: { padding: "3px 8px" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(IconButton, { icon: "arrow-left", label: t("Back"), onClick: () => setPage(void 0) }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: { fontWeight: 600 }, children: page === "inbox" ? t("Inbox") : page === "activity" ? t("Activity") : t("Pipelines") }),
      page === "runs" && current2.branch ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-faint glp-ellipsis", children: current2.branch }) : null
    ] }) }) : view === "changes" || view === "history" ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      BranchBar,
      {
        overview: current2,
        cwd: props.cwd,
        mrs: mrs.data,
        busy,
        onOpenItem: openItem,
        onPickBranch: () => setBranchOpen(true),
        onRun: run,
        onDialog: setDialog,
        onMerge: setMergeMr,
        onCleanup: openCleanup,
        onRefresh: refresh
      }
    ) : null,
    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-body", children: [
      page === "inbox" ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(InboxView, { repo: current2.remote?.path ?? "", cwd: props.cwd, sessionId: props.sessionId, onOpenItem: openItem }) : null,
      page === "activity" ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(ActivityView, { sessionId: props.sessionId, repo: current2.remote?.path ?? "", cwd: props.cwd, onOpenItem: openItem }) : null,
      page === "runs" && current2.remote ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(RunsView, { repo: current2.remote.path, branch: current2.branch, cwd: props.cwd }) : null,
      !page && view === "changes" ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(ChangesView, { overview: current2, cwd: props.cwd, onOpenItem: openItem, onPrompt: (input) => setPrompt(input) }) : null,
      !page && view === "history" ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(HistoryView, { overview: current2, cwd: props.cwd, onOpenItem: openItem, onOpenCommit: (sha) => current2.remote && nav.openCommit({ repo: current2.remote.path, sha }), onPrompt: (input) => setPrompt(input) }) : null,
      !page && view === "mrs" && current2.remote ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(SearchView, { kind: "mr", repo: current2.remote.path, cwd: props.cwd, sessionId: props.sessionId, overview: current2, onOpenItem: openItem }) : null,
      !page && view === "issues" && current2.remote ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(SearchView, { kind: "issue", repo: current2.remote.path, cwd: props.cwd, sessionId: props.sessionId, overview: current2, onOpenItem: openItem }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(CreateMrDialog, { open: dialog === "createMr", cwd: props.cwd, branch: current2.branch, defaultBranch: current2.defaultBranch, branches: branches.data ?? [], issueNumber: currentIssue, onClose: () => setDialog(void 0), onDone: refresh }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(CreateIssueDialog, { open: dialog === "createIssue", cwd: props.cwd, onClose: () => setDialog(void 0), onDone: refresh }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(MergeDialog, { open: !!mergeMr, repo: current2.remote?.path ?? "", number: mergeMr?.number ?? 0, onClose: () => setMergeMr(void 0), onDone: refresh }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(NewBranchDialog, { open: dialog === "newBranch", cwd: props.cwd, start: current2.defaultBranch ?? void 0, onClose: () => setDialog(void 0), onDone: refresh }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(CriticalCleanup, { open: dialog === "cleanup", candidates: cleanup, cwd: props.cwd, onClose: () => setDialog(void 0), onDone: refresh }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(SavedRepliesDialog, { open: dialog === "replies", repo: current2.remote?.path ?? "", onClose: () => setDialog(void 0) }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(SettingsDialog, { open: dialog === "settings", overview: current2, onClose: () => setDialog(void 0) }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      BranchPicker,
      {
        open: branchOpen,
        cwd: props.cwd,
        overview: current2,
        branches: branches.data ?? [],
        branchMrs: branchMrs.data?.items ?? [],
        busy,
        onClose: () => setBranchOpen(false),
        onRefresh: refresh,
        onRun: run,
        onNewBranch: () => {
          setBranchOpen(false);
          setDialog("newBranch");
        },
        onCleanup: () => {
          setBranchOpen(false);
          openCleanup();
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(PromptDialog, { open: !!prompt, title: prompt?.title ?? "", placeholder: prompt?.placeholder, initial: prompt?.initial, onClose: () => setPrompt(void 0), onSubmit: async (value) => {
      await prompt?.onSubmit(value);
    } })
  ] });
}
function useMerged(cwd, enabled) {
  return useCommitLikeQuery(["merged", cwd], () => rpc("mergedBranches", { cwd }), enabled);
}
function useBranchMrs(cwd, names, enabled) {
  return useCommitLikeQuery(["branchMrs", cwd, names.join(",")], () => rpc("branchMrs", { cwd, names, fresh: false }), enabled && names.length > 0);
}
function useCommitLikeQuery(key, work, enabled) {
  const [state, setState] = (0, import_react12.useState)({ loading: false });
  const [tick, setTick] = (0, import_react12.useState)(0);
  (0, import_react12.useEffect)(() => {
    if (!enabled) return;
    let alive = true;
    setState((current2) => ({ ...current2, loading: true }));
    work().then((data) => alive && setState({ data, loading: false })).catch((error) => alive && setState({ loading: false, error: errorText(error) }));
    return () => {
      alive = false;
    };
  }, [enabled, tick, key.join("|")]);
  return { data: state.data, isLoading: state.loading, error: state.error, refetch: () => setTick((value) => value + 1) };
}
function Shell(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-root", "data-glp": "", children: props.children });
}
function SettingsDialog(props) {
  const [prefs2, setPrefs] = usePrefs();
  const [lang, setLang] = (0, import_react12.useState)(getPrefs() ? localStorage.getItem("dsh-gitlab-panel.lang") ?? "auto" : "auto");
  const importLang = async (value) => {
    setLang(value);
    const i18n = await Promise.resolve().then(() => (init_i18n(), i18n_exports));
    if (value === "auto") {
      localStorage.removeItem("dsh-gitlab-panel.lang");
      i18n.setLanguage(/^zh/i.test(navigator.language) ? "zh" : "en");
    } else i18n.setLanguage(value);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
    Modal,
    {
      open: props.open,
      title: t("Settings"),
      onClose: props.onClose,
      width: 520,
      footer: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { variant: "ghost", onClick: props.onClose, children: t("Close") }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-settings-card", style: { margin: 0 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("strong", { style: { flex: 1 }, children: t("Token & requirements") }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Pill, { tone: props.overview.gitlab ? "danger" : "success", children: props.overview.gitlab ? t("Missing") : t("Connected") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-dim glp-wrap", children: props.overview.gitlab ?? t("GitLab data is available through GITLAB_TOKEN or glab auth login.") }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-faint", style: { fontSize: 11 }, children: [
            t("The panel needs git on the host. GitLab data needs GITLAB_TOKEN or glab auth login."),
            " ",
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("code", { children: "GITLAB_TOKEN" }),
            ", ",
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("code", { children: "GITLAB_HOST" }),
            ", ",
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("code", { children: "GITLAB_PROJECT" }),
            "."
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-settings-card", style: { margin: 0 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-row", children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("strong", { style: { flex: 1 }, children: t("Appearance") }) }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("label", { className: "glp-row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: { flex: 1 }, children: t("Header chip") }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("input", { type: "checkbox", checked: prefs2.headerChip, onChange: (event) => setPrefs((draft) => {
              draft.headerChip = event.target.checked;
            }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("label", { className: "glp-row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: { flex: 1 }, children: t("Compact rows") }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("input", { type: "checkbox", checked: prefs2.compactRows, onChange: (event) => setPrefs((draft) => {
              draft.compactRows = event.target.checked;
            }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("label", { className: "glp-row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: { flex: 1 }, children: t("Fold long content") }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("input", { type: "checkbox", checked: prefs2.foldItems, onChange: (event) => setPrefs((draft) => {
              draft.foldItems = event.target.checked;
            }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("label", { className: "glp-row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: { flex: 1 }, children: t("Language") }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("select", { className: "glp-select", style: { width: 130 }, value: lang, onChange: (event) => void importLang(event.target.value), children: [
              /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("option", { value: "auto", children: t("Auto") }),
              /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("option", { value: "en", children: "English" }),
              /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("option", { value: "zh", children: "\u4E2D\u6587" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-faint", style: { fontSize: 11 }, children: props.overview.remote ? `${props.overview.remote.host} \xB7 ${props.overview.remote.path}` : t("No project selected") })
      ]
    }
  );
}
function CriticalCleanup(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(CleanupDialog, { open: props.open, candidates: props.candidates, cwd: props.cwd, onClose: props.onClose, onDone: props.onDone });
}
function BranchBar(props) {
  const o = props.overview;
  const upstreamNote = () => {
    if (!o.branch) return void 0;
    if (!o.upstream) return t("no upstream");
    return o.upstream.endsWith(`/${o.branch}`) ? void 0 : `\u2192 ${o.upstream}`;
  };
  const mr = mrFor(props.mrs, o.branch, o.head, o.defaultBranch);
  const issueNumber = issueFromBranch(o.branch ?? "");
  const linked = o.remote ? getPrefs().issueBranches[`${o.remote.path}:${o.branch}`] ?? issueNumber : issueNumber;
  const issue = useItem(o.remote?.path ?? "", linked ?? 0, "issue");
  const inWorktree = !!o.worktreeRoot && o.worktreeRoot !== o.root;
  const repo = o.remote?.path ?? "";
  const next = () => {
    if (!mr || !repo) return void 0;
    if (mr.state === "MERGED" && inWorktree) {
      return { label: t("Finish worktree"), icon: "branch", id: "finish", run: () => void props.onRun("finish", async () => {
        await finishWorktree(props.cwd, o, mr, o.worktreeRoot);
      }) };
    }
    if (mr.state === "MERGED" && o.defaultBranch) {
      return { label: t("Finish and switch to {base}", { base: o.defaultBranch }), icon: "branch", id: "finish", run: () => void props.onRun("finish", async () => {
        await finishBranch(props.cwd, o, mr);
      }) };
    }
    if (o.upstream && o.ahead > 0) {
      return { label: t("Push"), icon: "cloud-upload", id: "push", run: () => void props.onRun("push", async () => {
        await rpc("push", { cwd: props.cwd, force: false });
      }) };
    }
    if (mr.state !== "OPEN") return void 0;
    if (mr.draft) {
      return { label: t("Mark ready"), icon: "eye", id: "ready", run: () => void props.onRun("ready", async () => {
        await rpc("setDraft", { repo, number: mr.number, draft: false });
        toast({ tone: "success", title: t("Marked ready") });
      }) };
    }
    if (mr.review !== "REVIEW_REQUIRED" && mr.checks !== "failure" && mr.checks !== "pending") {
      return { label: t("Merge\u2026"), icon: "mr", id: "merge", run: () => props.onMerge(mr) };
    }
    return void 0;
  };
  const step = next();
  const linkedIssue = issue.data?.kind === "issue" && issue.data.number === linked ? issue.data : void 0;
  const closedByMerge = mr?.state === "MERGED" && linkedIssue?.state === "CLOSED";
  (0, import_react12.useEffect)(() => {
    if (mr?.state !== "MERGED" || !linked || !repo) return;
    void queryClient.invalidateQueries({ queryKey: keys.item(repo, linked, "issue") });
  }, [mr?.state, linked, repo]);
  const menu = [
    { label: t("New branch"), icon: "plus", onSelect: () => props.onDialog("newBranch") },
    { label: t("Create merge request"), icon: "mr", disabled: !o.branch || !o.remote, onSelect: () => props.onDialog("createMr") },
    { label: t("Force push"), icon: "cloud-upload", disabled: !o.branch || !!props.busy, onSelect: () => {
      if (!window.confirm(t("Force push {branch} with --force-with-lease? Commits it replaces are lost.", { branch: o.branch ?? "" }))) return;
      void props.onRun("push", async () => {
        await rpc("push", { cwd: props.cwd, force: true });
      });
    } },
    { type: "separator" },
    { label: t("Stash"), icon: "archive", disabled: o.files.length === 0 || !!props.busy, onSelect: () => void props.onRun("stash", async () => {
      await rpc("stash", { cwd: props.cwd });
      toast({ tone: "success", title: t("Stashed") });
    }) },
    { label: t("Pop stash ({count})", { count: o.stashes }), icon: "undo", disabled: o.stashes === 0 || !!props.busy, onSelect: () => void props.onRun("stashPop", async () => {
      await rpc("stashPop", { cwd: props.cwd });
      toast({ tone: "success", title: t("Stash restored") });
    }) },
    { type: "separator" },
    { label: t("Clean up\u2026"), icon: "archive", onSelect: props.onCleanup }
  ];
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-branchbar", children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-branch-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("button", { type: "button", className: "glp-branch-button glp-ellipsis", title: t("Switch branch"), onClick: props.onPickBranch, children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { name: "branch", size: 13 }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-ellipsis", children: o.branch ?? `${t("Detached")} ${o.head?.slice(0, 7) ?? ""}` }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { name: "chevron-down", size: 11, className: "glp-faint" })
      ] }),
      upstreamNote() ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-upstream glp-ellipsis", children: upstreamNote() }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-spacer" }),
      o.upstream || !o.branch ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("button", { type: "button", className: "glp-icon-btn", title: t("Pull"), disabled: !!props.busy || !o.upstream, onClick: () => void props.onRun("pull", async () => {
          await rpc("pull", { cwd: props.cwd });
        }), children: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "glp-ahead-behind", "data-active": o.behind > 0 ? "" : void 0, children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { name: "download", size: 13 }),
          o.behind
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("button", { type: "button", className: "glp-icon-btn", title: t("Push"), disabled: !!props.busy, onClick: () => void props.onRun("push", async () => {
          await rpc("push", { cwd: props.cwd, force: false });
        }), children: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "glp-ahead-behind", "data-active": o.ahead > 0 ? "" : void 0, children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { name: "upload", size: 13 }),
          o.ahead
        ] }) })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", icon: "upload", disabled: !!props.busy, onClick: () => void props.onRun("push", async () => {
        await rpc("push", { cwd: props.cwd, force: false });
      }), children: t("Publish") }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(IconButton, { icon: "refresh", label: t("Fetch"), disabled: !!props.busy, onClick: () => void props.onRun("fetch", async () => {
        await rpc("fetch", { cwd: props.cwd });
        props.onRefresh();
      }) }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Menu, { items: menu, label: t("More"), icon: "dots" })
    ] }),
    o.operation ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-alert", "data-tone": "info", style: { margin: 0 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { name: "warning", size: 13 }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { style: { flex: 1 }, children: t("{operation} in progress", { operation: t(o.operation) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", disabled: !!props.busy, onClick: () => {
        if (window.confirm(t("Abort the operation?"))) void props.onRun("abort", async () => {
          await rpc("abort", { cwd: props.cwd });
        });
      }, children: t("Abort") }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", disabled: !!props.busy, onClick: () => void props.onRun("continue", async () => {
        await rpc("continue", { cwd: props.cwd });
      }), children: t("Continue") })
    ] }) : null,
    o.branch && o.remote && o.branch !== o.defaultBranch ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-branch-strip", "data-tone": mr?.state === "MERGED" ? "success" : mr?.checks === "failure" ? "danger" : mr?.checks === "pending" ? "warn" : void 0, children: [
      mr ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(StateIcon, { kind: "mr", state: mr.state, draft: mr.draft }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("button", { type: "button", style: { border: 0, background: "transparent", padding: 0, cursor: "pointer", color: "inherit", flex: 1, minWidth: 0, textAlign: "left" }, className: "glp-ellipsis", onClick: () => props.onOpenItem("mr", mr.number), children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "glp-faint", children: [
            "!",
            mr.number
          ] }),
          " ",
          mr.title
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(CheckDot, { state: mr.checks }),
        mr.review ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Pill, { tone: mr.review === "APPROVED" ? "success" : "accent", children: mr.review === "APPROVED" ? t("Approved") : t("Review required") }) : null,
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Pill, { tone: mr.state === "MERGED" ? "success" : void 0, children: mr.state === "MERGED" ? t("Merged") : mr.draft ? t("Draft") : t("Open") })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { name: "mr", size: 12 }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "glp-faint", style: { flex: 1 }, children: [
          t("No merge request"),
          " \xB7 ",
          o.ahead,
          " ",
          t("ahead")
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => props.onDialog("createMr"), children: t("Create merge request") })
      ] }),
      linked && o.remote ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("button", { type: "button", className: "glp-chip glp-ellipsis", style: { border: 0, cursor: "pointer", maxWidth: 240 }, title: linkedIssue?.title, onClick: () => props.onOpenItem("issue", linked), children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(StateIcon, { kind: "issue", state: linkedIssue?.state ?? "OPEN" }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "glp-faint", children: [
          "#",
          linked
        ] }),
        closedByMerge ? t("closed by this merge") : linkedIssue?.title ?? ""
      ] }) : null,
      step ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", icon: step.icon, busy: props.busy === step.id, disabled: !!props.busy, onClick: step.run, children: step.label }) : null
    ] }) : null
  ] });
}
function groupFiles(files) {
  return {
    conflicts: files.filter((file) => file.conflicted),
    staged: files.filter((file) => !file.conflicted && !file.untracked && file.index !== "."),
    changes: files.filter((file) => !file.conflicted && !file.untracked && file.worktree !== "." && file.index === "."),
    untracked: files.filter((file) => file.untracked),
    partially: files.filter((file) => !file.conflicted && !file.untracked && file.worktree !== "." && file.index !== ".")
  };
}
function ChangesView(props) {
  const o = props.overview;
  const groups = groupFiles(o.files);
  const [open, setOpen] = (0, import_react12.useState)({ conflicts: true, staged: true, changes: true, untracked: true });
  const [expanded, setExpanded] = (0, import_react12.useState)({});
  const [message, setMessage] = (0, import_react12.useState)("");
  const [busy, setBusy] = (0, import_react12.useState)();
  const [amend, setAmend] = (0, import_react12.useState)(false);
  const outgoing = useOutgoing(props.cwd);
  const staged = groups.staged.length + groups.partially.length > 0;
  const any = o.files.length > 0;
  const act = async (id, work, success) => {
    if (busy) return;
    setBusy(id);
    try {
      await work();
      if (success) toast({ tone: "success", title: success });
      void queryClient.invalidateQueries({ queryKey: ["overview", props.cwd] });
      void queryClient.invalidateQueries({ queryKey: ["outgoing", props.cwd] });
      void queryClient.invalidateQueries({ queryKey: ["log", props.cwd] });
    } catch (error) {
      errorToast(error);
    } finally {
      setBusy(void 0);
    }
  };
  const commit = async (push) => {
    if (groups.conflicts.length > 0) {
      toast({ tone: "error", title: t("Resolve the conflicts first") });
      return;
    }
    if (!message.trim() && !amend) {
      toast({ tone: "error", title: t("Write a commit message first") });
      return;
    }
    if (amend && o.upstream && o.ahead === 0 && !window.confirm(t("Amending a pushed commit rewrites history. Continue?"))) return;
    await act("commit", async () => {
      await rpc("commit", { cwd: props.cwd, message: message.trim(), amend, all: !amend && !staged });
      if (push) await rpc("push", { cwd: props.cwd, force: amend });
      setMessage("");
      setAmend(false);
      toast({ tone: "success", title: t(push ? "Committed and pushed" : "Committed") });
    });
  };
  const fileRow = (file, group) => {
    const key = `${group}:${file.path}`;
    const code = file.conflicted ? "U" : file.untracked ? "?" : group === "staged" ? file.index : file.worktree;
    const canStage = group !== "staged";
    const canUnstage = group === "staged" || group === "changes" && file.index !== ".";
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-file", "data-selected": expanded[key] ? "" : void 0, onClick: () => setExpanded((current2) => ({ ...current2, [key]: !current2[key] })), children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { name: expanded[key] ? "chevron-down" : "chevron-right", size: 10 }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-file-status", "data-code": code, children: code }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-file-name", title: file.origPath ? `${file.origPath} \u2192 ${file.path}` : file.path, children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { children: file.origPath ? `${file.origPath} \u2192 ${file.path}` : file.path }) }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "glp-file-actions", children: [
          canStage ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(IconButton, { icon: "plus", label: file.conflicted ? t("Mark resolved") : t("Stage"), onClick: (event) => {
            event.stopPropagation();
            void act("stage", () => rpc("stage", { cwd: props.cwd, paths: [file.path] }));
          } }) : null,
          canUnstage ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(IconButton, { icon: "undo", label: t("Unstage"), onClick: (event) => {
            event.stopPropagation();
            void act("unstage", () => rpc("unstage", { cwd: props.cwd, paths: [file.path] }));
          } }) : null,
          file.conflicted ? null : /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
            IconButton,
            {
              icon: "close",
              label: t("Discard"),
              onClick: (event) => {
                event.stopPropagation();
                if (!window.confirm(t("Discard the changes in {path}? This cannot be undone.", { path: file.path }))) return;
                void act("discard", () => rpc("discard", { cwd: props.cwd, tracked: file.untracked ? [] : [file.path], untracked: file.untracked ? [file.path] : [] }), t("Discarded"));
              }
            }
          )
        ] })
      ] }),
      expanded[key] ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(FileDiff, { cwd: props.cwd, path: file.path, staged: group === "staged", untracked: file.untracked }) : null
    ] }, key);
  };
  const discardAll = (files, what) => {
    if (files.length === 0) return;
    if (!window.confirm(t("Discard the changes in {count} files? This cannot be undone.", { count: files.length }))) return;
    void act("discard", () => rpc("discard", {
      cwd: props.cwd,
      tracked: files.filter((file) => !file.untracked).map((file) => file.path),
      untracked: files.filter((file) => file.untracked).map((file) => file.path)
    }), what);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { children: [
    !any ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(Empty, { icon: "check-circle", children: [
      t("No changes"),
      o.head ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-faint", style: { fontSize: 11 }, children: t("The working tree is clean.") }) : null
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
      groups.conflicts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
        FileGroup,
        {
          title: t("Conflicts"),
          open: !!open.conflicts,
          onToggle: () => setOpen((current2) => ({ ...current2, conflicts: !current2.conflicts })),
          count: groups.conflicts.length,
          icon: "warning",
          extra: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", onClick: (event) => {
            event.stopPropagation();
            void act("stage", () => rpc("stage", { cwd: props.cwd, paths: groups.conflicts.map((file) => file.path) }), t("Marked resolved"));
          }, children: t("Mark all resolved") }),
          children: groups.conflicts.map((file) => fileRow(file, "conflicts"))
        }
      ) : null,
      groups.staged.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
        FileGroup,
        {
          title: t("Staged"),
          open: !!open.staged,
          onToggle: () => setOpen((current2) => ({ ...current2, staged: !current2.staged })),
          count: groups.staged.length,
          extra: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", onClick: (event) => {
            event.stopPropagation();
            void act("unstage", () => rpc("unstage", { cwd: props.cwd, paths: groups.staged.map((file) => file.path) }));
          }, children: t("Unstage all") }),
          children: groups.staged.map((file) => fileRow(file, "staged"))
        }
      ) : null,
      groups.changes.length + groups.partially.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
        FileGroup,
        {
          title: t("Changes"),
          open: !!open.changes,
          onToggle: () => setOpen((current2) => ({ ...current2, changes: !current2.changes })),
          count: groups.changes.length + groups.partially.length,
          extra: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "glp-row", style: { gap: 2 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", onClick: (event) => {
              event.stopPropagation();
              discardAll([...groups.changes, ...groups.partially], t("Discarded"));
            }, children: t("Discard all") }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", onClick: (event) => {
              event.stopPropagation();
              void act("stage", () => rpc("stage", { cwd: props.cwd, paths: [...groups.changes, ...groups.partially].map((file) => file.path) }));
            }, children: t("Stage all") })
          ] }),
          children: [...groups.changes, ...groups.partially].map((file) => fileRow(file, "changes"))
        }
      ) : null,
      groups.untracked.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
        FileGroup,
        {
          title: t("Untracked"),
          open: !!open.untracked,
          onToggle: () => setOpen((current2) => ({ ...current2, untracked: !current2.untracked })),
          count: groups.untracked.length,
          extra: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "glp-row", style: { gap: 2 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", onClick: (event) => {
              event.stopPropagation();
              discardAll(groups.untracked, t("Discarded"));
            }, children: t("Discard all") }),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", onClick: (event) => {
              event.stopPropagation();
              void act("stage", () => rpc("stage", { cwd: props.cwd, paths: groups.untracked.map((file) => file.path) }));
            }, children: t("Stage all") })
          ] }),
          children: groups.untracked.map((file) => fileRow(file, "untracked"))
        }
      ) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-commit-box", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
        "textarea",
        {
          className: "glp-textarea",
          rows: 3,
          value: message,
          placeholder: t("Commit message"),
          onChange: (event) => setMessage(event.target.value),
          onKeyDown: (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault();
              void commit(false);
            }
          }
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-commit-actions", children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "primary", icon: "check", disabled: !staged && !any || !!busy || groups.conflicts.length > 0, busy: busy === "commit", onClick: () => void commit(false), children: staged ? t("Commit") : t("Commit all") }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", disabled: !staged && !any || !!busy || groups.conflicts.length > 0, onClick: () => void commit(true), children: t("Commit & push") }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", disabled: !staged && !any || !!busy, onClick: () => setAmend((value) => !value), "data-variant": amend ? "primary" : "ghost", children: t("Amend") }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-spacer" }),
        groups.conflicts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-faint", style: { fontSize: 10.5 }, children: t("Mark every conflict resolved to commit.") }) : /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "glp-faint", style: { fontSize: 10.5 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-kbd", children: "\u2318\u23CE" }),
          " ",
          t("commits")
        ] })
      ] })
    ] }),
    outgoing.data && (outgoing.data.unpushed.length > 0 || outgoing.data.ahead > 0) ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-unpushed", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-row", style: { marginBottom: 4 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { name: "upload", size: 12 }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("strong", { style: { flex: 1 }, children: t("Unpushed commits") }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Pill, { tone: "warn", children: outgoing.data.unpushed.length }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => void act("push", async () => {
          await rpc("push", { cwd: props.cwd, force: false });
        }, t("Pushed")), children: t("Push") }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => {
          setAmend(true);
          toast({ tone: "info", title: t("Amend is on; write a message or leave it empty to keep the last one.") });
        }, children: t("Amend") }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => {
          if (!window.confirm(t("Undo the last commit and keep its changes unstaged?"))) return;
          void act("undo", async () => {
            await rpc("undoCommit", { cwd: props.cwd });
            toast({ tone: "success", title: t("Last commit undone") });
          });
        }, children: t("Undo last commit") })
      ] }),
      outgoing.data.unpushed.slice(0, 8).map((commit2) => /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-unpushed-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-hash", children: commit2.hash.slice(0, 7) }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-ellipsis", style: { flex: 1 }, children: commit2.subject }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Age, { date: commit2.date })
      ] }, commit2.hash))
    ] }) : null
  ] });
}
function FileGroup(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("section", { className: "glp-group", children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-group-head", role: "button", tabIndex: 0, onClick: props.onToggle, onKeyDown: (event) => {
      if (event.key === "Enter" || event.key === " ") props.onToggle();
    }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { name: props.open ? "chevron-down" : "chevron-right", size: 12 }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-group-title", children: props.title }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-tab-count", children: props.count }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-spacer" }),
      props.extra
    ] }),
    props.open ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-group-body", children: props.children }) : null
  ] });
}
function FileDiff(props) {
  const diff = useDiff(props.cwd, props.path, props.staged, props.untracked);
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-file-diff", children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(DiffView, { patch: diff.data, loading: diff.isLoading, error: diff.error ? errorText(diff.error) : void 0, maxHeight: 320 }) });
}
function useOutgoing(cwd) {
  const [state, setState] = (0, import_react12.useState)({});
  const [tick, setTick] = (0, import_react12.useState)(0);
  (0, import_react12.useEffect)(() => {
    let alive = true;
    const load = () => rpc("outgoing", { cwd }).then((data) => alive && setState({ data }), () => void 0);
    void load();
    const timer = setInterval(load, 1e4);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [cwd, tick]);
  return state;
}
var LANE = 14;
var ROW = 28;
var PAD = 8;
var LANE_COLORS = ["#4b5bd7", "#2f9e44", "#f76b15", "#e5484d", "#8e4ec6", "#12a594", "#ffb224", "#e93d82", "#3e63dd", "#46a758"];
function HistoryView(props) {
  const [scope, setScope] = (0, import_react12.useState)(getPrefs().graphScope);
  const log = useLog(props.cwd, scope, 300);
  const rows = (0, import_react12.useMemo)(() => layout((log.data ?? []).map((commit) => ({ hash: commit.hash, parents: commit.parents }))), [log.data]);
  const [selected, setSelected] = (0, import_react12.useState)();
  const [busy, setBusy] = (0, import_react12.useState)();
  const [message, setMessage] = (0, import_react12.useState)("");
  const remote = props.overview.remote;
  const act = async (id, work, success) => {
    if (busy) return;
    setBusy(id);
    try {
      await work();
      if (success) toast({ tone: "success", title: success });
      void queryClient.invalidateQueries({ queryKey: ["overview", props.cwd] });
      void queryClient.invalidateQueries({ queryKey: ["log", props.cwd] });
      void queryClient.invalidateQueries({ queryKey: ["branches", props.cwd] });
    } catch (error) {
      errorToast(error);
    } finally {
      setBusy(void 0);
    }
  };
  if (log.isLoading && !log.data) return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-empty", children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Spinner, {}),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { children: t("Loading\u2026") })
  ] });
  if (log.error) return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-empty", children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { name: "warning" }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { children: errorText(log.error) })
  ] });
  if (!log.data || log.data.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Empty, { icon: "branch", children: t("No commits") });
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-graph-scope", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
        Segmented,
        {
          value: scope,
          onChange: (value) => {
            setScope(value);
            updatePrefs((draft) => {
              draft.graphScope = value;
            });
          },
          options: [
            { value: "current", label: t("Current"), title: t("Only this branch") },
            { value: "local", label: t("Local"), title: t("Local branches and their upstreams") },
            { value: "all", label: t("All"), title: t("Every ref") }
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-spacer" }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "glp-faint", style: { fontSize: 10.5 }, children: [
        log.data.length,
        " ",
        t("commits")
      ] })
    ] }),
    log.data.map((commit, index) => /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-graph-row", "data-selected": selected === commit.hash ? "" : void 0, onClick: () => setSelected(selected === commit.hash ? void 0 : commit.hash), children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(GraphCell, { row: rows[index] }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-graph-main", children: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-col", style: { flex: 1, minWidth: 0 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-row", style: { minWidth: 0 }, children: [
            commit.refs.filter((ref) => ref.kind !== "head" || ref.name === "HEAD").slice(0, 2).map((ref) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(RefTag, { name: ref.name, kind: ref.kind }, ref.name + ref.kind)),
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-graph-subject", title: commit.subject, children: commit.subject })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-graph-meta", children: [
            commit.author,
            " \xB7 ",
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Age, { date: commit.date, title: true }),
            " \xB7 ",
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-mono", children: commit.hash.slice(0, 7) })
          ] })
        ] }) })
      ] }),
      selected === commit.hash ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
        CommitDetail,
        {
          commit,
          cwd: props.cwd,
          remote: remote?.web,
          busy,
          message,
          setMessage,
          onAct: act,
          onOpenCommit: props.onOpenCommit
        }
      ) : null
    ] }, commit.hash)),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { style: { height: 60 } })
  ] });
}
function GraphCell(props) {
  const row = props.row;
  if (!row) return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-graph-svg", style: { width: PAD * 2 + LANE } });
  const lanes = Math.min(8, Math.max(1, row.width));
  const width = PAD * 2 + lanes * LANE;
  const x = (lane) => PAD + lane * LANE;
  const y = ROW / 2;
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("svg", { className: "glp-graph-svg", width, height: ROW, viewBox: `0 0 ${width} ${ROW}`, "aria-hidden": true, children: [
    row.below.map((lane) => lane.lane < lanes ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("line", { x1: x(lane.lane), y1: y, x2: x(lane.lane), y2: ROW, stroke: LANE_COLORS[lane.color % LANE_COLORS.length], strokeWidth: 1.3, opacity: 0.7 }, `below-${lane.lane}`) : null),
    row.edges.map((edge, index) => {
      if (edge.from >= lanes && edge.to >= lanes) return null;
      const from = x(Math.min(edge.from, lanes - 1));
      const to = x(Math.min(edge.to, lanes - 1));
      if (edge.kind === "pass" && edge.from === edge.to) return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("line", { x1: from, y1: 0, x2: from, y2: ROW, stroke: LANE_COLORS[edge.color % LANE_COLORS.length], strokeWidth: 1.3, opacity: 0.7 }, index);
      if (edge.kind === "in") return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: `M ${to} ${y} C ${to} ${y - 8}, ${from} ${y - 8}, ${from} 0`, stroke: LANE_COLORS[edge.color % LANE_COLORS.length], strokeWidth: 1.3, fill: "none", opacity: 0.85 }, index);
      return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("path", { d: `M ${from} ${y} C ${from} ${y + 8}, ${to} ${y + 8}, ${to} ${ROW}`, stroke: LANE_COLORS[edge.color % LANE_COLORS.length], strokeWidth: 1.3, fill: "none", opacity: 0.85 }, index);
    }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("circle", { cx: x(Math.min(row.col, lanes - 1)), cy: y, r: 3.6, fill: LANE_COLORS[row.color % LANE_COLORS.length], stroke: "var(--glp-bg)", strokeWidth: 1.5 })
  ] });
}
function RefTag(props) {
  const label = props.name.replace(/^origin\//, "origin/");
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-ref", "data-kind": props.kind, title: props.name, children: label });
}
function CommitDetail(props) {
  const details = useCommit(props.cwd, props.commit.hash);
  const [openFile, setOpenFile] = (0, import_react12.useState)();
  const diff = useDiff(props.cwd, openFile ?? "", false, false, !!openFile);
  const file = details.data?.files.find((entry) => entry.path === openFile);
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-commit-detail", children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-commit-detail-actions", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", icon: "copy", onClick: () => {
        copyText(props.commit.hash);
        toast({ tone: "success", title: t("Copied") });
      }, children: t("Copy hash") }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", icon: "branch", onClick: () => void props.onAct("checkout", async () => {
        await rpc("checkout", { cwd: props.cwd, ref: props.commit.hash, track: null });
        toast({ tone: "success", title: t("Checked out") });
      }), children: t("Checkout") }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", icon: "plus", onClick: () => {
        const name2 = window.prompt(t("New branch from here"), `fix/${props.commit.hash.slice(0, 7)}`);
        if (name2) void props.onAct("branch", async () => {
          await rpc("createBranch", { cwd: props.cwd, name: name2, start: props.commit.hash, checkout: true });
          toast({ tone: "success", title: t("Branch created") });
        });
      }, children: t("New branch from here") }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => void props.onAct("cherry", async () => {
        await rpc("cherryPick", { cwd: props.cwd, hash: props.commit.hash });
        toast({ tone: "success", title: t("Cherry-picked") });
      }), children: t("Cherry-pick") }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => void props.onAct("revert", async () => {
        await rpc("revert", { cwd: props.cwd, hash: props.commit.hash });
        toast({ tone: "success", title: t("Reverted") });
      }), children: t("Revert") }),
      props.remote ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", icon: "external", onClick: () => openExternal(`${props.remote}/-/commit/${props.commit.hash}`), children: t("Open on GitLab") }) : null
    ] }),
    details.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Spinner, {}),
      " ",
      t("Loading\u2026")
    ] }) : null,
    details.data ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-md glp-wrap", style: { fontSize: 12 }, children: details.data.body }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-faint", style: { fontSize: 11 }, children: [
        details.data.author,
        " <",
        details.data.email,
        ">"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-commit-files", children: details.data.files.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-commit-file", onClick: () => setOpenFile(openFile === entry.path ? void 0 : entry.path), children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-file-status", "data-code": entry.status, children: entry.status }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-ellipsis glp-mono", style: { flex: 1 }, children: entry.path }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { name: openFile === entry.path ? "chevron-down" : "chevron-right", size: 10 })
      ] }, entry.path)) }),
      openFile ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(DiffView, { patch: file ? diff.data : void 0, loading: diff.isLoading, error: diff.error ? errorText(diff.error) : void 0, maxHeight: 300, emptyText: t("No diff") }) : null
    ] }) : null
  ] });
}
function BranchPicker(props) {
  const [search, setSearch] = (0, import_react12.useState)("");
  const query = search.trim().toLowerCase();
  const match = (branch) => !query || branch.name.toLowerCase().includes(query) || (branch.worktree ?? "").toLowerCase().includes(query);
  const local = props.branches.filter((branch) => !branch.remote && match(branch));
  const taken = new Set(props.branches.filter((branch) => !branch.remote).map((branch) => branch.name));
  const remote = props.branches.filter((branch) => {
    if (!branch.remote || !match(branch)) return false;
    const name2 = branch.name.replace(/^[^/]+\//, "");
    if (taken.has(name2)) return false;
    taken.add(name2);
    return true;
  });
  const mrOf = (branch) => props.branchMrs.find((mr) => mr.head === branch.name);
  const recent = [...local].sort((a, b) => b.date - a.date).slice(0, 5);
  const withMr = local.filter((branch) => mrOf(branch));
  const checkout = async (branch) => {
    if (branch.current) return props.onClose();
    if (branch.worktree) {
      try {
        await openSessionAt(branch.worktree);
        props.onClose();
      } catch (error) {
        errorToast(error);
      }
      return;
    }
    await props.onRun("checkout", async () => {
      await rpc("checkout", { cwd: props.cwd, ref: branch.remote ? branch.name.replace(/^[^/]+\//, "") : branch.name, track: branch.remote ? branch.name : null });
      toast({ tone: "success", title: t("Checked out {branch}", { branch: branch.name }) });
    });
    props.onClose();
    props.onRefresh();
  };
  const row = (branch) => {
    const mr = mrOf(branch);
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-picker-row", onClick: () => void checkout(branch), children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { name: branch.current ? "check" : "branch", size: 12 }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "glp-ellipsis", style: { flex: 1, fontFamily: "var(--glp-mono)", fontSize: 11.5 }, title: branch.worktree ? `${branch.name} \u2014 ${branch.worktree}` : branch.name, children: [
        branch.name,
        branch.worktree ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "glp-faint", style: { fontFamily: "inherit", fontSize: 10 }, children: [
          " \xB7 ",
          branch.worktree
        ] }) : null
      ] }),
      mr ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("button", { type: "button", className: "glp-chip", style: { border: 0, cursor: "pointer" }, onClick: (event) => {
        event.stopPropagation();
        nav.openItem({ repo: props.overview.remote?.path ?? "", kind: "mr", number: mr.number });
      }, children: [
        "!",
        mr.number
      ] }) : null,
      branch.ahead > 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "glp-faint", style: { fontSize: 10 }, children: [
        "\u2191",
        branch.ahead
      ] }) : null,
      branch.behind > 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("span", { className: "glp-faint", style: { fontSize: 10 }, children: [
        "\u2193",
        branch.behind
      ] }) : null,
      branch.gone ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Pill, { tone: "warn", children: t("gone") }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-faint glp-ellipsis", style: { maxWidth: "30%", fontSize: 10.5 }, children: branch.subject }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
        Menu,
        {
          label: t("More"),
          icon: "dots",
          trigger: "icon",
          items: [
            { label: t("Checkout"), icon: "check", disabled: branch.current, onSelect: () => void checkout(branch) },
            { label: t("Merge into current"), icon: "mr", disabled: branch.current, onSelect: () => void props.onRun("merge", async () => {
              await rpc("merge", { cwd: props.cwd, ref: branch.name });
              toast({ tone: "success", title: t("Merged") });
            }) },
            { label: t("Rebase onto"), icon: "branch", disabled: branch.current, onSelect: () => void props.onRun("rebase", async () => {
              await rpc("rebase", { cwd: props.cwd, ref: branch.name });
              toast({ tone: "success", title: t("Rebased") });
            }) },
            { label: t("Push"), icon: "upload", disabled: branch.remote, onSelect: () => void props.onRun("pushBranch", async () => {
              await rpc("pushBranch", { cwd: props.cwd, name: branch.name });
              toast({ tone: "success", title: t("Pushed") });
            }) },
            { type: "separator" },
            { label: t("Delete"), icon: "close", danger: true, disabled: branch.current || !!branch.worktree, onSelect: () => {
              if (!window.confirm(t("Delete the local branch {branch}?", { branch: branch.name }))) return;
              void props.onRun("delete", async () => {
                await rpc("deleteBranch", { cwd: props.cwd, name: branch.name, force: false });
                toast({ tone: "success", title: t("Deleted") });
              });
              props.onRefresh();
            } },
            ...branch.remote ? [{ label: t("Delete on remote"), icon: "cloud-upload", danger: true, onSelect: () => {
              const name2 = branch.name.replace(/^[^/]+\//, "");
              const remoteName = branch.name.split("/")[0] ?? "origin";
              if (!window.confirm(t("Delete {branch} on {remote}?", { branch: name2, remote: remoteName }))) return;
              void props.onRun("deleteRemote", async () => {
                await rpc("deleteRemoteBranch", { cwd: props.cwd, remote: remoteName, name: name2 });
                toast({ tone: "success", title: t("Deleted") });
              });
              props.onRefresh();
            } }] : []
          ]
        }
      )
    ] }, `${branch.remote ? "r" : "l"}:${branch.name}`);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(
    Modal,
    {
      open: props.open,
      title: t("Branches"),
      onClose: props.onClose,
      width: 640,
      footer: /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", onClick: props.onNewBranch, children: t("New branch") }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", onClick: props.onCleanup, children: t("Clean up\u2026") }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-spacer" }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { variant: "ghost", onClick: props.onClose, children: t("Close") })
      ] }),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("input", { className: "glp-input", autoFocus: true, placeholder: t("Search branches\u2026"), value: search, onChange: (event) => setSearch(event.target.value) }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-picker-list", children: [
          props.overview.branch ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-picker-group", children: t("Current") }),
            local.filter((branch) => branch.current).map(row)
          ] }) : null,
          recent.filter((branch) => !branch.current).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-picker-group", children: t("Recent") }),
            recent.filter((branch) => !branch.current).map(row)
          ] }) : null,
          withMr.filter((branch) => !branch.current && !recent.includes(branch)).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-picker-group", children: t("With an open merge request") }),
            withMr.filter((branch) => !branch.current && !recent.includes(branch)).map(row)
          ] }) : null,
          local.filter((branch) => !branch.current && !recent.includes(branch)).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-picker-group", children: t("Local") }),
            local.filter((branch) => !branch.current && !recent.includes(branch)).map(row)
          ] }) : null,
          remote.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)(import_jsx_runtime12.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-picker-group", children: t("Remote") }),
            remote.map(row)
          ] }) : null,
          local.length + remote.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-faint", style: { padding: 12 }, children: t("No branches match.") }) : null
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-faint", style: { fontSize: 11 }, children: t("A branch checked out in another worktree opens a session in that folder instead of checking out here.") })
      ]
    }
  );
}
function CommitPage(props) {
  const details = useCommit(props.cwd, props.sha);
  const overview = useOverview(props.cwd);
  const [openFile, setOpenFile] = (0, import_react12.useState)();
  const diff = useDiff(props.cwd, openFile ?? "", false, false, !!openFile);
  const data = details.data;
  const remote = overview.data?.remote?.web;
  const action = async (work, success) => {
    try {
      await work();
      toast({ tone: "success", title: t(success) });
      void queryClient.invalidateQueries({ queryKey: ["overview", props.cwd] });
    } catch (error) {
      errorToast(error);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-root", "data-glp": "", children: [
    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-topbar", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { name: "branch", size: 13 }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-repo glp-mono", style: { flex: 1 }, children: props.sha.slice(0, 12) }),
      /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-topbar-actions", children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(IconButton, { icon: "copy", label: t("Copy hash"), onClick: () => {
          copyText(props.sha);
          toast({ tone: "success", title: t("Copied") });
        } }),
        remote ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(IconButton, { icon: "external", label: t("Open on GitLab"), onClick: () => openExternal(`${remote}/-/commit/${props.sha}`) }) : null,
        props.onClose ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(IconButton, { icon: "close", label: t("Close"), onClick: props.onClose }) : null
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-body", children: [
      details.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-empty", children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Spinner, {}),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { children: t("Loading\u2026") })
      ] }) : null,
      details.error ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-alert", "data-tone": "error", children: errorText(details.error) }) : null,
      data ? /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-item", children: [
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-md glp-wrap", style: { whiteSpace: "pre-wrap" }, children: data.body }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-faint", style: { fontSize: 11 }, children: [
          data.author,
          " <",
          data.email,
          "> \xB7 ",
          new Date(data.date * 1e3).toLocaleString()
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-item-actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => {
            const name2 = window.prompt(t("New branch from here"), `fix/${props.sha.slice(0, 7)}`);
            if (name2) void action(() => rpc("createBranch", { cwd: props.cwd, name: name2, start: props.sha, checkout: true }), "Branch created");
          }, children: t("New branch from here") }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => void action(() => rpc("cherryPick", { cwd: props.cwd, hash: props.sha }), "Cherry-picked"), children: t("Cherry-pick") }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => void action(() => rpc("revert", { cwd: props.cwd, hash: props.sha }), "Reverted"), children: t("Revert") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("div", { className: "glp-commit-files", children: data.files.map((file) => /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "glp-commit-file", onClick: () => setOpenFile(openFile === file.path ? void 0 : file.path), children: [
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-file-status", "data-code": file.status, children: file.status }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)("span", { className: "glp-ellipsis glp-mono", style: { flex: 1 }, children: file.path }),
          /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(Icon, { name: openFile === file.path ? "chevron-down" : "chevron-right", size: 10 })
        ] }, file.path)) }),
        openFile ? /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(DiffView, { patch: diff.data, loading: diff.isLoading, error: diff.error ? errorText(diff.error) : void 0, maxHeight: 520 }) : null
      ] }) : null
    ] })
  ] });
}

// src/client/styles.ts
var styles = String.raw`
[data-glp] {
  --glp-bg: var(--dsw-alias-bg-base, #ffffff);
  --glp-panel: var(--dsw-alias-bg-layer-1, #ffffff);
  --glp-panel-2: var(--dsw-alias-bg-layer-2, #f7f7f8);
  --glp-panel-3: var(--dsw-alias-bg-layer-3, #efeff1);
  --glp-border: var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.11));
  --glp-border-soft: var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.07));
  --glp-text: var(--dsw-alias-label-primary, #1f2023);
  --glp-text-2: var(--dsw-alias-label-secondary, #60646c);
  --glp-text-3: var(--dsw-alias-label-tertiary, #8b8d98);
  --glp-hover: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.045));
  --glp-active: var(--dsw-alias-interactive-bg-active, rgba(0, 0, 0, 0.07));
  --glp-accent: var(--dsw-alias-brand-primary, #4b5bd7);
  --glp-accent-soft: var(--dsw-alias-interactive-bg-hover-accent, rgba(75, 91, 215, 0.12));
  --glp-success: var(--dsw-alias-state-success-primary, #2f9e44);
  --glp-danger: var(--dsw-alias-state-error-primary, #e5484d);
  --glp-warn: var(--dsw-alias-state-warn-primary, #f76b15);
  --glp-link: var(--dsw-alias-link, #3e63dd);
  --glp-code: var(--dsw-alias-markdown-code-block, #f1f1f3);
  --glp-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  color: var(--glp-text);
  font-size: 12.5px;
  line-height: 1.45;
}
.glp-root {
  --glp-bg: var(--dsw-alias-bg-base, #ffffff);
  --glp-panel: var(--dsw-alias-bg-layer-1, #ffffff);
  --glp-panel-2: var(--dsw-alias-bg-layer-2, #f7f7f8);
  --glp-panel-3: var(--dsw-alias-bg-layer-3, #efeff1);
  --glp-border: var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.11));
  --glp-border-soft: var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.07));
  --glp-text: var(--dsw-alias-label-primary, #1f2023);
  --glp-text-2: var(--dsw-alias-label-secondary, #60646c);
  --glp-text-3: var(--dsw-alias-label-tertiary, #8b8d98);
  --glp-hover: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.045));
  --glp-active: var(--dsw-alias-interactive-bg-active, rgba(0, 0, 0, 0.07));
  --glp-accent: var(--dsw-alias-brand-primary, #4b5bd7);
  --glp-accent-soft: var(--dsw-alias-interactive-bg-hover-accent, rgba(75, 91, 215, 0.12));
  --glp-success: var(--dsw-alias-state-success-primary, #2f9e44);
  --glp-danger: var(--dsw-alias-state-error-primary, #e5484d);
  --glp-warn: var(--dsw-alias-state-warn-primary, #f76b15);
  --glp-link: var(--dsw-alias-link, #3e63dd);
  --glp-code: var(--dsw-alias-markdown-code-block, #f1f1f3);
  --glp-radius: 8px;
  --glp-radius-sm: 6px;
  --glp-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--glp-bg);
  color: var(--glp-text);
  font-size: 12.5px;
  line-height: 1.45;
  overflow: hidden;
  position: relative;
}
.glp-portal {
  --glp-bg: var(--dsw-alias-bg-base, #ffffff);
  --glp-panel: var(--dsw-alias-bg-layer-1, #ffffff);
  --glp-panel-2: var(--dsw-alias-bg-layer-2, #f7f7f8);
  --glp-panel-3: var(--dsw-alias-bg-layer-3, #efeff1);
  --glp-border: var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.11));
  --glp-border-soft: var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.07));
  --glp-text: var(--dsw-alias-label-primary, #1f2023);
  --glp-text-2: var(--dsw-alias-label-secondary, #60646c);
  --glp-text-3: var(--dsw-alias-label-tertiary, #8b8d98);
  --glp-hover: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.045));
  --glp-active: var(--dsw-alias-interactive-bg-active, rgba(0, 0, 0, 0.07));
  --glp-accent: var(--dsw-alias-brand-primary, #4b5bd7);
  --glp-accent-soft: var(--dsw-alias-interactive-bg-hover-accent, rgba(75, 91, 215, 0.12));
  --glp-success: var(--dsw-alias-state-success-primary, #2f9e44);
  --glp-danger: var(--dsw-alias-state-error-primary, #e5484d);
  --glp-warn: var(--dsw-alias-state-warn-primary, #f76b15);
  --glp-link: var(--dsw-alias-link, #3e63dd);
  --glp-code: var(--dsw-alias-markdown-code-block, #f1f1f3);
  --glp-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  color: var(--glp-text);
  font-size: 12.5px;
  line-height: 1.45;
}
.glp-root *, .glp-portal * { box-sizing: border-box; }
.glp-root button, .glp-portal button, .glp-root input, .glp-root textarea, .glp-portal input, .glp-portal textarea { font: inherit; color: inherit; }
.glp-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.glp-faint { color: var(--glp-text-3); }
.glp-dim { color: var(--glp-text-2); }
.glp-spacer { flex: 1; }
.glp-mono { font-family: var(--glp-mono); }
.glp-row { display: flex; align-items: center; gap: 6px; min-width: 0; }
.glp-col { display: flex; flex-direction: column; min-width: 0; }
.glp-wrap { white-space: pre-wrap; overflow-wrap: anywhere; }
.glp-hidden { display: none !important; }

/* Top bar */
.glp-topbar { display: flex; align-items: center; gap: 4px; height: 38px; padding: 0 6px 0 10px; border-bottom: 0.5px solid var(--glp-border); flex: none; background: var(--glp-panel); }
.glp-repo { font-weight: 600; font-size: 12.5px; max-width: 34%; }
.glp-tabs { display: flex; align-items: center; gap: 1px; margin-left: 4px; min-width: 0; overflow: hidden; }
.glp-tab { border: 0; background: transparent; color: var(--glp-text-2); padding: 5px 7px; border-radius: var(--glp-radius-sm); cursor: pointer; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; position: relative; }
.glp-tab[data-selected] { color: var(--glp-text); background: var(--glp-active); }
.glp-tab-count { font-size: 10.5px; color: var(--glp-text-2); background: var(--glp-panel-3); border-radius: 999px; padding: 0 5px; min-width: 16px; text-align: center; line-height: 16px; }
.glp-topbar-actions { display: flex; align-items: center; gap: 2px; margin-left: auto; }
.glp-bell { position: relative; }
.glp-count-badge { position: absolute; top: -4px; right: -4px; min-width: 14px; height: 14px; padding: 0 3px; border-radius: 999px; background: var(--glp-accent); color: #fff; font-size: 9px; line-height: 14px; text-align: center; }
.glp-count-badge[data-tone="warn"] { background: var(--glp-warn); }

/* Buttons and inputs */
.glp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 4px; border: 0.5px solid var(--glp-border); background: var(--glp-panel); color: var(--glp-text); border-radius: 6px; padding: 3px 8px; min-height: 24px; cursor: pointer; white-space: nowrap; font-size: 12px; }
.glp-btn:hover { background: var(--glp-hover); }
.glp-btn:disabled { opacity: 0.5; cursor: default; }
.glp-btn[data-variant="primary"] { background: var(--glp-accent); border-color: transparent; color: #fff; }
.glp-btn[data-variant="primary"]:hover { filter: brightness(1.06); }
.glp-btn[data-variant="ghost"] { background: transparent; border-color: transparent; color: var(--glp-text-2); }
.glp-btn[data-variant="ghost"]:hover { background: var(--glp-hover); color: var(--glp-text); }
.glp-btn[data-variant="danger"] { color: var(--glp-danger); }
.glp-btn[data-size="sm"] { min-height: 21px; padding: 1px 6px; font-size: 11.5px; }
.glp-icon-btn { border: 0; background: transparent; color: var(--glp-text-2); width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; cursor: pointer; padding: 0; flex: none; }
.glp-icon-btn:hover { background: var(--glp-hover); color: var(--glp-text); }
.glp-icon-btn:disabled { opacity: 0.45; cursor: default; }
.glp-icon-btn[data-pressed] { background: var(--glp-active); color: var(--glp-text); }
.glp-input, .glp-textarea, .glp-select { width: 100%; border: 0.5px solid var(--glp-border); background: var(--glp-panel); border-radius: 6px; padding: 5px 8px; min-width: 0; outline: none; }
.glp-input:focus, .glp-textarea:focus, .glp-select:focus { border-color: var(--glp-accent); box-shadow: 0 0 0 2px var(--glp-accent-soft); }
.glp-textarea { resize: vertical; min-height: 70px; font-family: inherit; }
.glp-textarea[data-mono] { font-family: var(--glp-mono); font-size: 11.5px; }
.glp-checkbox { display: inline-flex; align-items: center; gap: 6px; user-select: none; cursor: pointer; }
.glp-checkbox input { accent-color: var(--glp-accent); }

/* Layout */
.glp-body { flex: 1; min-height: 0; overflow: auto; overscroll-behavior: contain; }
.glp-body-inner { padding: 8px 10px 40px; }
.glp-section { padding: 8px 10px; border-bottom: 0.5px solid var(--glp-border-soft); }
.glp-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 40px 24px; color: var(--glp-text-2); text-align: center; }
.glp-empty[data-inline] { padding: 14px; flex-direction: row; text-align: left; }
.glp-error { color: var(--glp-danger); }
.glp-alert { border: 1px solid color-mix(in oklab, var(--glp-warn) 40%, transparent); background: color-mix(in oklab, var(--glp-warn) 10%, var(--glp-panel)); color: var(--glp-text); padding: 8px 10px; border-radius: var(--glp-radius-sm); display: flex; gap: 8px; align-items: flex-start; margin: 8px 10px; }
.glp-alert[data-tone="error"] { border-color: color-mix(in oklab, var(--glp-danger) 40%, transparent); background: color-mix(in oklab, var(--glp-danger) 9%, var(--glp-panel)); }
.glp-alert[data-tone="info"] { border-color: var(--glp-border); background: var(--glp-panel-2); }
.glp-spinner { width: 14px; height: 14px; border: 2px solid var(--glp-border); border-top-color: var(--glp-accent); border-radius: 50%; animation: glp-spin 0.8s linear infinite; flex: none; }
@keyframes glp-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .glp-spinner { animation-duration: 2.5s; } }

/* Branch bar */
.glp-branchbar { flex: none; border-bottom: 0.5px solid var(--glp-border); background: var(--glp-panel); padding: 5px 8px; display: flex; flex-direction: column; gap: 4px; }
.glp-branch-row { display: flex; align-items: center; gap: 4px; min-width: 0; }
.glp-branch-button { display: flex; align-items: center; gap: 5px; max-width: 55%; border: 0; background: transparent; padding: 3px 5px; border-radius: 6px; cursor: pointer; font-weight: 550; min-width: 0; }
.glp-branch-button:hover { background: var(--glp-hover); }
.glp-upstream { font-size: 11px; color: var(--glp-text-3); max-width: 30%; }
.glp-ahead-behind { display: inline-flex; align-items: center; gap: 1px; font-size: 10.5px; color: var(--glp-text-2); }
.glp-ahead-behind[data-active] { color: var(--glp-text); font-weight: 600; }
.glp-branch-strip { display: flex; align-items: center; gap: 6px; padding: 4px 5px; border-radius: 6px; background: var(--glp-panel-2); min-height: 26px; font-size: 11.5px; overflow: hidden; }
.glp-branch-strip[data-tone="success"] { background: color-mix(in oklab, var(--glp-success) 10%, var(--glp-panel)); }
.glp-branch-strip[data-tone="danger"] { background: color-mix(in oklab, var(--glp-danger) 9%, var(--glp-panel)); }
.glp-branch-strip[data-tone="warn"] { background: color-mix(in oklab, var(--glp-warn) 10%, var(--glp-panel)); }
.glp-pill { display: inline-flex; align-items: center; gap: 3px; border-radius: 999px; padding: 0 6px; height: 18px; font-size: 10.5px; background: var(--glp-panel-3); color: var(--glp-text-2); white-space: nowrap; }
.glp-pill[data-tone="success"] { background: color-mix(in oklab, var(--glp-success) 16%, var(--glp-panel)); color: var(--glp-success); }
.glp-pill[data-tone="danger"] { background: color-mix(in oklab, var(--glp-danger) 16%, var(--glp-panel)); color: var(--glp-danger); }
.glp-pill[data-tone="warn"] { background: color-mix(in oklab, var(--glp-warn) 16%, var(--glp-panel)); color: var(--glp-warn); }
.glp-pill[data-tone="accent"] { background: var(--glp-accent-soft); color: var(--glp-accent); }
.glp-pill[data-tone="draft"] { border: 1px dashed var(--glp-border); background: transparent; color: var(--glp-text-2); }

/* Lists */
.glp-list { display: flex; flex-direction: column; }
.glp-row-item { display: flex; align-items: flex-start; gap: 8px; padding: 8px 10px; border-bottom: 0.5px solid var(--glp-border-soft); cursor: pointer; position: relative; min-height: 44px; }
.glp-row-item[data-compact] { padding: 5px 10px; min-height: 30px; align-items: center; }
.glp-row-item[data-active] { background: var(--glp-active); }
.glp-row-item[data-new]::before { content: ""; position: absolute; left: 3px; top: 12px; width: 3px; height: 3px; border-radius: 50%; background: var(--glp-accent); }
.glp-row-item[data-updated]::before { content: ""; position: absolute; left: 2px; top: 10px; width: 5px; height: 5px; border: 1px solid var(--glp-accent); border-radius: 50%; }
.glp-row-check { width: 16px; height: 16px; margin-top: 2px; flex: none; display: flex; align-items: center; justify-content: center; }
.glp-row-check input { accent-color: var(--glp-accent); margin: 0; }
.glp-row-content { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px; }
.glp-row-title { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; align-items: center; gap: 5px; }
.glp-row-title .glp-num { color: var(--glp-text-3); font-weight: 400; flex: none; }
.glp-row-meta { display: flex; align-items: center; gap: 6px; color: var(--glp-text-3); font-size: 11px; overflow: hidden; white-space: nowrap; flex-wrap: wrap; }
.glp-row-end { flex: none; display: flex; align-items: center; gap: 6px; color: var(--glp-text-3); font-size: 11px; }
.glp-labels { display: flex; align-items: center; gap: 3px; overflow: hidden; flex-wrap: wrap; }
.glp-label { display: inline-flex; align-items: center; height: 16px; padding: 0 6px; border-radius: 999px; font-size: 10px; line-height: 1; white-space: nowrap; border: 1px solid currentColor; font-weight: 500; }
.glp-avatar { width: 18px; height: 18px; border-radius: 50%; corner-shape: round; display: inline-flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: #fff; flex: none; text-transform: uppercase; }
.glp-state { width: 16px; height: 16px; flex: none; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; }
.glp-state[data-state="OPEN"] { color: var(--glp-success); }
.glp-state[data-state="MERGED"] { color: #8250df; }
.glp-state[data-state="CLOSED"] { color: var(--glp-danger); }
.glp-state[data-state="DRAFT"] { color: var(--glp-text-2); }
.glp-check-dot { width: 7px; height: 7px; border-radius: 50%; corner-shape: round; display: inline-block; flex: none; }
.glp-check-dot[data-state="success"] { background: var(--glp-success); }
.glp-check-dot[data-state="failure"] { background: var(--glp-danger); }
.glp-check-dot[data-state="pending"] { background: var(--glp-warn); }
.glp-check-dot[data-state="none"] { display: none; }

/* Search header */
.glp-search-head { position: sticky; top: 0; z-index: 3; background: var(--glp-panel); border-bottom: 0.5px solid var(--glp-border); padding: 6px 8px 5px; display: flex; flex-direction: column; gap: 5px; }
.glp-search-box { display: flex; align-items: center; gap: 5px; border: 0.5px solid var(--glp-border); border-radius: 7px; padding: 0 6px; background: var(--glp-bg); }
.glp-search-box:focus-within { border-color: var(--glp-accent); box-shadow: 0 0 0 2px var(--glp-accent-soft); }
.glp-search-box input { border: 0; background: transparent; outline: none; height: 26px; min-width: 0; flex: 1; }
.glp-presets { display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; }
.glp-presets::-webkit-scrollbar { display: none; }
.glp-preset { border: 0.5px solid var(--glp-border); background: var(--glp-panel); color: var(--glp-text-2); border-radius: 999px; padding: 1px 8px; font-size: 11px; cursor: pointer; white-space: nowrap; }
.glp-preset[data-selected] { background: var(--glp-accent-soft); color: var(--glp-accent); border-color: transparent; }
.glp-chip-row { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; font-size: 11px; }
.glp-chip { display: inline-flex; align-items: center; gap: 3px; background: var(--glp-panel-2); border-radius: 999px; padding: 1px 7px; color: var(--glp-text-2); }
.glp-chip button { border: 0; background: transparent; cursor: pointer; color: var(--glp-text-3); padding: 0; line-height: 1; }
.glp-suggestions { position: absolute; left: 8px; right: 8px; top: 100%; background: var(--glp-panel); border: 0.5px solid var(--glp-border); box-shadow: var(--dsw-elevation-panel, 0 8px 24px rgba(0,0,0,0.16)); border-radius: 8px; z-index: 20; padding: 4px; max-height: 220px; overflow: auto; }
.glp-suggestion { display: flex; align-items: center; gap: 6px; padding: 4px 7px; border-radius: 5px; cursor: pointer; font-size: 11.5px; }
.glp-suggestion[data-active] { background: var(--glp-active); }
.glp-suggestion small { color: var(--glp-text-3); margin-left: auto; }
.glp-results-line { display: flex; align-items: center; gap: 6px; padding: 4px 10px; color: var(--glp-text-3); font-size: 11px; border-bottom: 0.5px solid var(--glp-border-soft); min-height: 25px; position: sticky; top: 0; background: var(--glp-bg); z-index: 2; }
.glp-bulkbar { display: flex; align-items: center; gap: 4px; padding: 3px 8px; min-height: 28px; border-bottom: 0.5px solid var(--glp-border); background: var(--glp-accent-soft); position: sticky; top: 0; z-index: 4; }
.glp-bulkbar .glp-btn { background: var(--glp-panel); }

/* Changes */
.glp-group { border-bottom: 0.5px solid var(--glp-border-soft); }
.glp-group-head { display: flex; align-items: center; gap: 4px; width: 100%; padding: 4px 8px; border: 0; background: transparent; color: var(--glp-text-2); cursor: pointer; font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em; }
.glp-group-head:hover { background: var(--glp-hover); }
.glp-group-title { font-weight: 600; }
.glp-group-body { display: flex; flex-direction: column; }
.glp-file { display: flex; align-items: center; gap: 5px; padding: 2px 8px 2px 20px; min-height: 24px; cursor: pointer; position: relative; }
.glp-file:hover { background: var(--glp-hover); }
.glp-file[data-selected] { background: var(--glp-active); }
.glp-file-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; direction: rtl; text-align: left; font-size: 11.5px; }
.glp-file-name span { direction: ltr; unicode-bidi: embed; }
.glp-file-actions { display: none; gap: 1px; flex: none; }
.glp-file:hover .glp-file-actions, .glp-file:focus-within .glp-file-actions { display: flex; }
.glp-file-status { width: 14px; text-align: center; font-size: 10px; font-weight: 700; flex: none; }
.glp-file-status[data-code="M"] { color: var(--glp-warn); }
.glp-file-status[data-code="A"], .glp-file-status[data-code="?"] { color: var(--glp-success); }
.glp-file-status[data-code="D"] { color: var(--glp-danger); }
.glp-file-status[data-code="R"], .glp-file-status[data-code="C"] { color: var(--glp-accent); }
.glp-file-status[data-code="U"] { color: var(--glp-danger); }
.glp-file-diff { border-top: 0.5px solid var(--glp-border-soft); border-bottom: 0.5px solid var(--glp-border-soft); background: var(--glp-panel-2); }
.glp-commit-box { padding: 8px 10px 12px; display: flex; flex-direction: column; gap: 6px; }
.glp-commit-actions { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.glp-unpushed { border-top: 0.5px solid var(--glp-border); padding: 6px 10px 14px; }
.glp-unpushed-row { display: flex; align-items: center; gap: 6px; padding: 3px 0; font-size: 11.5px; }
.glp-hash { font-family: var(--glp-mono); font-size: 10.5px; color: var(--glp-text-3); flex: none; }

/* Diff */
.glp-diff { font-family: var(--glp-mono); font-size: 11.5px; line-height: 1.5; overflow: auto; max-height: 460px; background: var(--glp-panel); }
.glp-diff-table { min-width: 100%; border-collapse: collapse; }
.glp-diff-line { white-space: pre; }
.glp-diff-line[data-kind="add"] { background: var(--dsw-alias-file-diff-added-bg, rgba(46, 160, 67, 0.12)); }
.glp-diff-line[data-kind="del"] { background: var(--dsw-alias-file-diff-deleted-bg, rgba(248, 81, 73, 0.12)); }
.glp-diff-line[data-kind="hunk"] { background: var(--glp-panel-3); color: var(--glp-text-2); }
.glp-diff-num { width: 1%; min-width: 30px; text-align: right; padding: 0 5px; color: var(--glp-text-3); user-select: none; border-right: 0.5px solid var(--glp-border-soft); cursor: pointer; }
.glp-diff-num:hover { color: var(--glp-accent); background: var(--glp-accent-soft); }
.glp-diff-text { padding: 0 8px 0 6px; white-space: pre; }
.glp-diff-marker { width: 12px; user-select: none; padding-left: 4px; color: var(--glp-text-3); }
.glp-diff-empty { padding: 10px; color: var(--glp-text-3); font-family: inherit; }

/* Graph */
.glp-graph-scope { display: flex; align-items: center; gap: 2px; padding: 5px 8px; border-bottom: 0.5px solid var(--glp-border-soft); position: sticky; top: 0; background: var(--glp-bg); z-index: 2; }
.glp-graph-row { display: flex; align-items: stretch; border-bottom: 0.5px solid var(--glp-border-soft); cursor: pointer; min-height: 28px; }
.glp-graph-row:hover { background: var(--glp-hover); }
.glp-graph-row[data-selected] { background: var(--glp-active); }
.glp-graph-svg { flex: none; }
.glp-graph-main { flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px; padding: 3px 8px 3px 0; }
.glp-graph-subject { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.glp-graph-meta { color: var(--glp-text-3); font-size: 10.5px; white-space: nowrap; flex: none; max-width: 40%; overflow: hidden; text-overflow: ellipsis; }
.glp-ref { display: inline-flex; align-items: center; height: 15px; padding: 0 5px; border-radius: 3px; font-size: 9.5px; line-height: 1; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: none; }
.glp-ref[data-kind="head"] { background: var(--glp-accent); color: #fff; }
.glp-ref[data-kind="local"] { background: var(--glp-accent-soft); color: var(--glp-accent); }
.glp-ref[data-kind="remote"] { background: var(--glp-panel-3); color: var(--glp-text-2); }
.glp-ref[data-kind="tag"] { background: color-mix(in oklab, var(--glp-warn) 18%, var(--glp-panel)); color: var(--glp-warn); }
.glp-commit-detail { padding: 8px 10px; background: var(--glp-panel-2); border-bottom: 0.5px solid var(--glp-border); display: flex; flex-direction: column; gap: 6px; }
.glp-commit-detail-actions { display: flex; gap: 4px; flex-wrap: wrap; }
.glp-commit-files { display: flex; flex-direction: column; gap: 1px; }
.glp-commit-file { display: flex; align-items: center; gap: 6px; padding: 2px 4px; border-radius: 4px; font-size: 11.5px; cursor: pointer; }
.glp-commit-file:hover { background: var(--glp-hover); }

/* Item detail */
.glp-item { padding: 10px 12px 40px; display: flex; flex-direction: column; gap: 10px; }
.glp-item-head { display: flex; align-items: flex-start; gap: 8px; }
.glp-item-title { font-size: 14px; font-weight: 600; line-height: 1.35; overflow-wrap: anywhere; }
.glp-item-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; color: var(--glp-text-3); font-size: 11.5px; }
.glp-item-actions { display: flex; gap: 4px; flex-wrap: wrap; }
.glp-item-tabs { display: flex; align-items: center; gap: 1px; border-bottom: 0.5px solid var(--glp-border); padding: 0 12px; position: sticky; top: 0; background: var(--glp-bg); z-index: 3; }
.glp-item-tab { border: 0; border-bottom: 2px solid transparent; background: transparent; padding: 6px 8px; color: var(--glp-text-2); cursor: pointer; font-size: 12px; margin-bottom: -0.5px; }
.glp-item-tab[data-selected] { color: var(--glp-text); border-bottom-color: var(--glp-accent); }
.glp-md { font-size: 12.5px; line-height: 1.6; overflow-wrap: anywhere; }
.glp-md h1, .glp-md h2, .glp-md h3, .glp-md h4 { font-size: 13.5px; margin: 12px 0 5px; line-height: 1.35; }
.glp-md h1 { font-size: 15px; }
.glp-md p { margin: 5px 0; }
.glp-md ul, .glp-md ol { margin: 5px 0; padding-left: 20px; }
.glp-md li { margin: 2px 0; }
.glp-md code { font-family: var(--glp-mono); font-size: 11.5px; background: var(--glp-code); border-radius: 4px; padding: 1px 4px; }
.glp-md pre { background: var(--glp-code); border-radius: 6px; padding: 8px; overflow: auto; margin: 6px 0; }
.glp-md pre code { background: transparent; padding: 0; }
.glp-md blockquote { border-left: 3px solid var(--glp-border); margin: 6px 0; padding: 0 10px; color: var(--glp-text-2); }
.glp-md a { color: var(--glp-link); text-decoration: none; font-weight: 500; }
.glp-md a:hover { text-decoration: underline dotted; }
.glp-md hr { border: 0; border-top: 0.5px solid var(--glp-border); margin: 10px 0; }
.glp-md table { border-collapse: collapse; display: block; overflow: auto; max-width: 100%; }
.glp-md th, .glp-md td { border: 0.5px solid var(--glp-border); padding: 3px 6px; }
.glp-md img { max-width: 100%; }
.glp-comment { border: 0.5px solid var(--glp-border); border-radius: var(--glp-radius); overflow: hidden; background: var(--glp-panel); }
.glp-comment-head { display: flex; align-items: center; gap: 6px; padding: 5px 8px; background: var(--glp-panel-2); border-bottom: 0.5px solid var(--glp-border-soft); color: var(--glp-text-3); font-size: 11px; }
.glp-comment-body { padding: 8px 10px; }
.glp-clamp { position: relative; }
.glp-clamp-box { overflow: hidden; }
.glp-clamp-toggle { margin-top: 3px; border: 0; background: transparent; color: var(--glp-link); cursor: pointer; padding: 0; font-size: 11.5px; }
.glp-thread { border: 0.5px solid var(--glp-border); border-radius: 6px; margin: 6px 0; overflow: hidden; background: var(--glp-panel); }
.glp-thread[data-resolved] { opacity: 0.72; }
.glp-thread-hunk { background: var(--glp-code); font-family: var(--glp-mono); font-size: 10.5px; white-space: pre; overflow: auto; padding: 5px 8px; border-bottom: 0.5px solid var(--glp-border-soft); max-height: 130px; }
.glp-thread-head { display: flex; align-items: center; gap: 6px; padding: 4px 8px; font-size: 11px; color: var(--glp-text-3); border-bottom: 0.5px solid var(--glp-border-soft); }
.glp-thread-note { padding: 6px 8px; border-top: 0.5px solid var(--glp-border-soft); }
.glp-thread-note:first-child { border-top: 0; }
.glp-thread-actions { display: flex; gap: 4px; align-items: center; padding: 4px 8px; border-top: 0.5px solid var(--glp-border-soft); }
.glp-review-bar { border: 1px solid var(--glp-accent); background: var(--glp-accent-soft); border-radius: var(--glp-radius); padding: 8px 10px; display: flex; flex-direction: column; gap: 6px; }
.glp-files-toolbar { display: flex; align-items: center; gap: 4px; padding: 5px 10px; border-bottom: 0.5px solid var(--glp-border-soft); position: sticky; top: 0; background: var(--glp-bg); z-index: 2; }
.glp-file-block { border-bottom: 0.5px solid var(--glp-border); }
.glp-file-block-head { display: flex; align-items: center; gap: 6px; padding: 5px 10px; background: var(--glp-panel-2); cursor: pointer; font-size: 11.5px; position: sticky; top: 25px; z-index: 1; }
.glp-file-block-head .glp-file-name { direction: ltr; }
.glp-checks { padding: 8px 10px; display: flex; flex-direction: column; gap: 6px; }
.glp-check-row { display: flex; align-items: center; gap: 7px; padding: 5px 8px; border: 0.5px solid var(--glp-border); border-radius: 6px; cursor: pointer; background: var(--glp-panel); }
.glp-check-row:hover { background: var(--glp-hover); }
.glp-check-row[data-state="failure"] { border-color: color-mix(in oklab, var(--glp-danger) 40%, transparent); }

/* Menus, dialogs, toasts, hover cards */
.glp-portal { position: fixed; inset: 0; z-index: 2147483000; }
.glp-mask { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.42); }
.glp-dialog { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: min(520px, calc(100vw - 32px)); max-height: calc(100vh - 60px); overflow: auto; background: var(--glp-panel, #fff); border: 0; border-radius: 12px; box-shadow: var(--dsw-elevation-prominent, 0 18px 60px rgba(0,0,0,0.28)); color: var(--glp-text, #1f2023); padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.glp-dialog h2 { margin: 0; font-size: 15px; font-weight: 600; }
.glp-dialog-actions { display: flex; justify-content: flex-end; gap: 6px; margin-top: 2px; }
.glp-menu { position: absolute; min-width: 190px; max-width: 300px; background: var(--glp-panel, #fff); border: 0; border-radius: 8px; box-shadow: var(--dsw-elevation-panel, 0 10px 34px rgba(0,0,0,0.2)); padding: 4px; color: var(--glp-text, #1f2023); z-index: 2147483001; max-height: 420px; overflow: auto; }
.glp-menu-item { display: flex; align-items: center; gap: 7px; width: 100%; border: 0; background: transparent; padding: 5px 7px; border-radius: 5px; cursor: pointer; text-align: left; font-size: 12px; color: inherit; }
.glp-menu-item:hover:not(:disabled) { background: var(--glp-hover, rgba(0,0,0,0.05)); }
.glp-menu-item:disabled { opacity: 0.45; cursor: default; }
.glp-menu-sep { height: 1px; background: var(--glp-border, rgba(0,0,0,0.1)); margin: 4px 2px; }
.glp-toasts { position: fixed; right: 16px; bottom: 16px; z-index: 2147483100; display: flex; flex-direction: column; gap: 8px; max-width: min(380px, calc(100vw - 32px)); pointer-events: none; }
.glp-toast { pointer-events: auto; background: var(--dsw-alias-bg-overlay, #202124); color: #fff; border-radius: 9px; padding: 9px 12px; box-shadow: 0 10px 32px rgba(0,0,0,0.25); display: flex; flex-direction: column; gap: 2px; font-size: 12px; }
.glp-toast[data-tone="error"] { background: color-mix(in oklab, var(--glp-danger) 85%, #000); }
.glp-toast[data-tone="success"] { background: color-mix(in oklab, var(--glp-success) 80%, #000); }
.glp-toast strong { font-weight: 600; }
.glp-toast small { opacity: 0.8; }
.glp-toast button { align-self: flex-start; border: 0; background: transparent; color: inherit; text-decoration: underline; cursor: pointer; padding: 0; margin-top: 2px; font-size: 11px; }
.glp-hover-card { position: fixed; z-index: 2147483050; width: 300px; background: var(--glp-panel, #fff); color: var(--glp-text, #1f2023); border: 0; border-radius: 9px; box-shadow: var(--dsw-elevation-panel, 0 12px 36px rgba(0,0,0,0.22)); padding: 9px 11px; display: flex; flex-direction: column; gap: 5px; font-size: 12px; pointer-events: auto; }
.glp-mention { color: var(--glp-link, #3e63dd); border-bottom: 1px dotted currentColor; cursor: pointer; }
.glp-quote { position: fixed; z-index: 2147483060; border: 0; background: var(--glp-accent, #4b5bd7); color: #fff; border-radius: 999px; padding: 4px 9px; font-size: 11px; box-shadow: 0 4px 16px rgba(0,0,0,0.2); cursor: pointer; }

/* Inbox & activity */
.glp-inbox-group { border-bottom: 0.5px solid var(--glp-border); }
.glp-inbox-head { display: flex; align-items: center; gap: 6px; padding: 5px 10px; background: var(--glp-panel-2); font-weight: 600; font-size: 11.5px; position: sticky; top: 0; z-index: 1; }
.glp-activity-card { border: 0.5px solid var(--glp-border); border-radius: var(--glp-radius); margin: 6px 10px; overflow: hidden; background: var(--glp-panel); }
.glp-activity-head { display: flex; align-items: center; gap: 6px; padding: 6px 8px; background: var(--glp-panel-2); font-size: 11px; color: var(--glp-text-3); }
.glp-activity-body { padding: 7px 9px; display: flex; flex-direction: column; gap: 5px; }
.glp-activity-actions { display: flex; gap: 4px; flex-wrap: wrap; }
.glp-triage-progress { height: 4px; border-radius: 999px; background: var(--glp-panel-3); overflow: hidden; }
.glp-triage-progress > div { height: 100%; background: var(--glp-accent); }
.glp-status-pill { display: inline-flex; align-items: center; height: 17px; padding: 0 6px; border-radius: 999px; font-size: 10px; background: var(--glp-panel-3); color: var(--glp-text-2); white-space: nowrap; }
.glp-status-pill[data-status="proposed"] { background: color-mix(in oklab, var(--glp-warn) 16%, var(--glp-panel)); color: var(--glp-warn); }
.glp-status-pill[data-status="approved"], .glp-status-pill[data-status="running"] { background: var(--glp-accent-soft); color: var(--glp-accent); }
.glp-status-pill[data-status="done"] { background: color-mix(in oklab, var(--glp-success) 16%, var(--glp-panel)); color: var(--glp-success); }
.glp-status-pill[data-status="failed"] { background: color-mix(in oklab, var(--glp-danger) 16%, var(--glp-panel)); color: var(--glp-danger); }

/* Branch picker and misc */
.glp-picker { display: flex; flex-direction: column; gap: 6px; min-height: 0; }
.glp-picker-list { max-height: 58vh; overflow: auto; border: 0.5px solid var(--glp-border); border-radius: var(--glp-radius-sm); }
.glp-picker-row { display: flex; align-items: center; gap: 6px; padding: 5px 8px; border-bottom: 0.5px solid var(--glp-border-soft); cursor: pointer; font-size: 12px; }
.glp-picker-row:hover { background: var(--glp-hover); }
.glp-picker-group { padding: 4px 8px; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--glp-text-3); background: var(--glp-panel-2); position: sticky; top: 0; z-index: 1; }
.glp-footer-note { padding: 8px 10px; color: var(--glp-text-3); font-size: 11px; }
.glp-split { display: flex; gap: 10px; }
.glp-split > * { flex: 1; min-width: 0; }
.glp-kbd { font-family: var(--glp-mono); font-size: 10px; border: 0.5px solid var(--glp-border); border-bottom-width: 2px; border-radius: 4px; padding: 0 4px; color: var(--glp-text-2); background: var(--glp-panel); }
.glp-settings-card { border: 0.5px solid var(--glp-border); border-radius: var(--glp-radius); padding: 12px; margin: 10px; display: flex; flex-direction: column; gap: 8px; }
.glp-quote-text { border-left: 3px solid var(--glp-accent); padding-left: 8px; color: var(--glp-text-2); white-space: pre-wrap; }

@media (max-width: 640px) {
  .glp-repo { max-width: 28%; }
  .glp-row-end { display: none; }
  .glp-diff-num { min-width: 24px; padding: 0 3px; }
  .glp-dialog { padding: 12px; }
}

@media (hover: hover) {
  .glp-row-item:hover { background: var(--glp-hover); }
}

.glp-root :focus-visible, .glp-portal :focus-visible { outline: 2px solid var(--glp-accent); outline-offset: 1px; }
.glp-root ::-webkit-scrollbar, .glp-portal ::-webkit-scrollbar { width: 8px; height: 8px; }
.glp-root ::-webkit-scrollbar-thumb, .glp-portal ::-webkit-scrollbar-thumb { background: var(--dsw-alias-scrollbar-bg-l2, rgba(0,0,0,0.18)); border-radius: 8px; }
.glp-root ::-webkit-scrollbar-track, .glp-portal ::-webkit-scrollbar-track { background: transparent; }
`;

// src/client/index.tsx
var import_jsx_runtime13 = require("react/jsx-runtime");
var name = "gitlab-panel";
var inject = ["slots", "sidebarRightTabs", "sidebarRight", "uiWorkspace"];
var MAIN_ID = "dsh-gitlab-panel/main";
var ITEM_ID = "dsh-gitlab-panel/item";
var RUN_ID = "dsh-gitlab-panel/run";
var COMMIT_ID = "dsh-gitlab-panel/commit";
var MAIN_KIND = "gitlab";
var ITEM_KIND = "gitlab-item";
var RUN_KIND = "gitlab-run";
var COMMIT_KIND = "gitlab-commit";
function contentKey(params) {
  if (!params) return void 0;
  if (params.page === "item") return `item:${params.repo}:${params.kind}:${params.number}`;
  if (params.page === "run") return `run:${params.repo}:${params.id}`;
  if (params.page === "commit") return `commit:${params.repo}:${params.sha}`;
  return "main";
}
function apply(ctx) {
  setPluginCtx(ctx);
  ctx.effect(() => {
    const element = document.createElement("style");
    element.dataset.glp = "";
    element.dataset.plugin = "dsh-gitlab-panel";
    element.textContent = styles;
    document.head.appendChild(element);
    return () => element.remove();
  }, "gitlab-panel: styles");
  ctx.effect(() => {
    const host = document.createElement("div");
    host.dataset.glp = "";
    host.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    document.body.appendChild(host);
    const root = (0, import_client.createRoot)(host);
    root.render(/* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Toasts, {}));
    return () => {
      root.unmount();
      host.remove();
    };
  }, "gitlab-panel: toast host");
  const openPage = (kind, params) => {
    const sidebar = ctx.sidebarRight;
    const wanted = contentKey(params);
    const session = sidebar.mounted?.getSnapshot?.();
    if (wanted !== void 0 && session !== void 0) {
      for (const tab of sidebar.openTabs?.getSnapshot?.() ?? []) {
        if (tab.kind !== kind || tab.sessionId !== session) continue;
        if (contentKey(paramsForTab(tab.tabId)) === wanted) {
          sidebar.focus(tab.tabId);
          return;
        }
      }
    }
    sidebar.openTab(kind, { params });
    rememberTab(sidebar.active()?.id, params);
  };
  const open = (what, run) => {
    try {
      run();
    } catch (error) {
      toast({ tone: "error", title: t("Could not open the GitLab panel"), description: `${what}: ${errorText(error)}` });
    }
  };
  nav.openMain = (params = {}) => open("main", () => openPage(MAIN_KIND, { page: "main", ...params }));
  nav.openItem = (input) => open("item", () => openPage(ITEM_KIND, { page: "item", ...input }));
  nav.openRun = (input) => open("pipeline", () => openPage(RUN_KIND, { page: "run", ...input }));
  nav.openCommit = (input) => open("commit", () => openPage(COMMIT_KIND, { page: "commit", ...input }));
  nav.openActivity = () => nav.openMain({ show: "activity" });
  nav.openInbox = () => nav.openMain({ show: "inbox" });
  nav.openRuns = () => nav.openMain({ show: "runs" });
  safe(
    ctx,
    "tab types",
    () => ctx.effect(() => {
      const stops = [
        ctx.sidebarRightTabs.register({
          id: MAIN_ID,
          kind: MAIN_KIND,
          keepMounted: true,
          title: () => t("GitLab"),
          guide: [{ id: "open", order: 45, title: () => t("GitLab"), description: () => t("Git, merge requests, issues and pipelines") }]
        }),
        ctx.sidebarRightTabs.register({ id: ITEM_ID, kind: ITEM_KIND, multiple: true, keepMounted: true, title: () => t("GitLab") }),
        ctx.sidebarRightTabs.register({ id: RUN_ID, kind: RUN_KIND, multiple: true, title: () => t("Pipelines") }),
        ctx.sidebarRightTabs.register({ id: COMMIT_ID, kind: COMMIT_KIND, multiple: true, title: () => t("History") })
      ];
      return () => stops.forEach((stop) => stop());
    }, "gitlab-panel: tab types")
  );
  registerBody(ctx, "sidebar.right.pane.tab", MAIN_ID, MainBody);
  registerBody(ctx, "sidebar.right.pane.tab", ITEM_ID, ItemBody);
  registerBody(ctx, "sidebar.right.pane.tab", RUN_ID, RunBody);
  registerBody(ctx, "sidebar.right.pane.tab", COMMIT_ID, CommitBody);
  registerBody(ctx, "sidebar.right.pane.tab.title", ITEM_ID, ItemTitle);
  registerBody(ctx, "sidebar.right.pane.tab.title", RUN_ID, RunTitle);
  registerBody(ctx, "sidebar.right.pane.tab.title", COMMIT_ID, CommitTitle);
  safe(
    ctx,
    "header chip",
    () => ctx.slots.inject(
      "conversation.session.header.utilities",
      () => ctx.slots.register({ name: "conversation.session.header.utilities", id: "gitlab-panel", order: -8 }, HeaderChipSlot)
    )
  );
  safe(
    ctx,
    "composer pill",
    () => ctx.slots.inject(
      "conversation.composer.dock",
      () => ctx.slots.register({ name: "conversation.composer.dock", id: "gitlab-panel", order: 20 }, ComposerPillSlot)
    )
  );
  safe(
    ctx,
    "settings card",
    () => ctx.slots.inject(
      "settings.section",
      () => ctx.slots.register({ name: "settings.section", id: "gitlab-panel", order: 80, label: () => "GitLab" }, SettingsCard)
    )
  );
  safe(ctx, "shortcut", () => {
    const shortcuts = ctx.get?.("shortcuts");
    if (!shortcuts?.register) return;
    ctx.effect(
      () => shortcuts.register({
        id: "gitlab-panel.open",
        label: () => t("Open GitLab panel"),
        aliases: ["gitlab", "git"],
        // Only desktop defaults: the registry skips a runtime or platform a
        // command declares none for, and a Web binding would have to clear its
        // own browser-reservation rules.
        defaults: {
          "desktop:windows": { code: "KeyG", modifiers: ["primary", "shift"] },
          "desktop:macos": { code: "KeyG", modifiers: ["primary", "shift"] },
          "desktop:linux": { code: "KeyG", modifiers: ["primary", "shift"] }
        },
        regions: ["page", "editable"],
        modals: [],
        resolve: () => ({ status: "handled", run: () => nav.openMain() })
      }),
      "gitlab-panel: shortcut"
    );
  });
  safe(ctx, "slash command", () => {
    const commandUi = ctx.get?.("commandUi");
    if (!commandUi?.register) return;
    ctx.effect(
      () => commandUi.register({
        name: "gitlab",
        label: () => t("GitLab panel"),
        description: () => t("Git, merge requests, issues and pipelines for this repository"),
        available: () => true,
        ui: { kind: "action", run: () => nav.openMain() }
      }),
      "gitlab-panel: slash command"
    );
  });
  ctx.effect(() => {
    startEvents();
    const stopMentions = installMentions();
    return () => {
      stopEvents();
      stopMentions();
      setCurrentRepo(void 0);
    };
  }, "gitlab-panel: events and timeline links");
}
function safe(ctx, what, register) {
  try {
    register();
  } catch (error) {
    console.warn(`[gitlab-panel] could not register ${what}`, error);
  }
}
function registerBody(ctx, slot, key, component) {
  safe(
    ctx,
    slot,
    () => ctx.slots.inject(
      slot,
      () => ctx.slots.register({ name: slot, key }, component)
    )
  );
}
function Provider(props) {
  useLanguage();
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(QueryClientProvider, { client: queryClient, children: props.children });
}
function HeaderChipSlot(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Provider, { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(HeaderChip, { ...props }) });
}
function ComposerPillSlot(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Provider, { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(ComposerPill, { ...props }) });
}
function MainBody(props) {
  const info = props.useTabInfo?.();
  const params = info?.tab?.navigation?.params;
  const cwd = useCwd(props);
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Provider, { children: cwd ? /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(MainPanel, { sessionId: String(props.sessionId ?? ""), cwd, params }, info?.tab?.navigation?.revision ?? 0) : /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(MissingCwd, {}) });
}
function tabParams(info) {
  const live = info?.tab?.navigation?.params;
  if (live) {
    rememberTab(info?.tab?.id, live);
    return live;
  }
  return paramsForTab(info?.tab?.id);
}
function ItemBody(props) {
  const info = props.useTabInfo?.();
  const params = tabParams(info);
  const cwd = useCwd(props);
  if (!params || params.page !== "item") return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Provider, { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(Empty, { icon: "mr", children: [
    t("No item selected."),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { size: "sm", onClick: () => {
      forgetTab(info?.tab?.id);
      info?.tab?.actions?.close?.();
    }, children: t("Close") }) })
  ] }) });
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Provider, { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
    ItemPage,
    {
      repo: params.repo,
      kind: params.kind,
      number: params.number,
      sessionId: String(props.sessionId ?? ""),
      cwd,
      onClose: () => {
        forgetTab(info?.tab?.id);
        info?.tab?.actions?.close?.();
      }
    }
  ) });
}
function RunBody(props) {
  const info = props.useTabInfo?.();
  const params = tabParams(info);
  if (!params || params.page !== "run") return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Provider, { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(Empty, { icon: "pipeline", children: [
    t("No pipeline selected."),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { size: "sm", onClick: () => {
      forgetTab(info?.tab?.id);
      info?.tab?.actions?.close?.();
    }, children: t("Close") }) })
  ] }) });
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Provider, { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(RunPage, { repo: params.repo, id: params.id, onClose: () => {
    forgetTab(info?.tab?.id);
    info?.tab?.actions?.close?.();
  } }) });
}
function CommitBody(props) {
  const info = props.useTabInfo?.();
  const params = tabParams(info);
  const cwd = useCwd(props);
  if (!params || params.page !== "commit") return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Provider, { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)(Empty, { icon: "branch", children: [
    t("No commit selected."),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { size: "sm", onClick: () => {
      forgetTab(info?.tab?.id);
      info?.tab?.actions?.close?.();
    }, children: t("Close") }) })
  ] }) });
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Provider, { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(CommitPage, { sha: params.sha, cwd, onClose: () => {
    forgetTab(info?.tab?.id);
    info?.tab?.actions?.close?.();
  } }) });
}
function ItemTitle(props) {
  const info = props.useTabInfo?.();
  const params = tabParams(info);
  if (!params || params.page !== "item") return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { children: "GitLab" });
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Provider, { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(ItemTitleInner, { repo: params.repo, number: params.number, kind: params.kind }) });
}
function ItemTitleInner(props) {
  const item = useItem(props.repo, props.number, props.kind);
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("span", { className: "glp-row", style: { gap: 3 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(StateIcon, { kind: props.kind, state: item.data?.state ?? "OPEN", draft: item.data?.draft }),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("span", { children: [
      props.kind === "mr" ? "!" : "#",
      props.number
    ] })
  ] });
}
function RunTitle(props) {
  const info = props.useTabInfo?.();
  const params = tabParams(info);
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("span", { className: "glp-row", style: { gap: 3 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Icon, { name: "pipeline", size: 11 }),
    "#",
    params?.page === "run" ? params.id : ""
  ] });
}
function CommitTitle(props) {
  const info = props.useTabInfo?.();
  const params = tabParams(info);
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("span", { className: "glp-row", style: { gap: 3 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Icon, { name: "branch", size: 11 }),
    params?.page === "commit" ? params.sha.slice(0, 7) : ""
  ] });
}
function MissingCwd() {
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "glp-root", "data-glp": "", children: [
    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { className: "glp-empty", children: [
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Icon, { name: "warning", size: 20 }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("span", { children: t("This session has no working directory.") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Toasts, {})
  ] });
}
function SettingsCard(_props) {
  const [open, setOpen] = (0, import_react13.useState)(false);
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { "data-glp": "", style: { border: "0.5px solid var(--dsw-alias-border-l2, rgba(0,0,0,0.11))", borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 6 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Icon, { name: "gitlab", size: 14 }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("strong", { style: { flex: 1 }, children: "GitLab panel" }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { size: "sm", variant: "ghost", onClick: () => setOpen((value) => !value), children: open ? t("Show less") : t("Show more") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { style: { fontSize: 11.5, color: "var(--dsw-alias-label-secondary, #60646c)" }, children: t("A Git and GitLab side panel: branch changes, commit graph, merge requests, issues, pipelines, reviews and agent actions.") }),
    open ? /* @__PURE__ */ (0, import_jsx_runtime13.jsxs)("div", { style: { fontSize: 11.5, color: "var(--dsw-alias-label-secondary, #60646c)", display: "flex", flexDirection: "column", gap: 4 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { children: t("The host needs git. For GitLab data, set GITLAB_TOKEN to a personal access token with api scope, or run glab auth login on the host.") }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { children: t("Open it from the right sidebar\u2019s + guide, the session header chip, \u2318\u21E7G, or /gitlab.") }),
      /* @__PURE__ */ (0, import_jsx_runtime13.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Button, { size: "sm", onClick: () => nav.openMain(), children: t("Open GitLab panel") }) })
    ] }) : null
  ] });
}
var index_default = { name, inject, apply };
return module.exports; } });
