// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/regenerator-runtime/runtime.js":[function(require,module,exports) {
var define;
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}],"src/pwa/Core.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// Simple Vanilla JS Event System
var Emitter = /*#__PURE__*/function () {
  function Emitter(obj) {
    _classCallCheck(this, Emitter);

    this.obj = obj;
    this.eventTarget = document.createDocumentFragment();
    ["addEventListener", "dispatchEvent", "removeEventListener"].forEach(this.delegate, this);
  }

  _createClass(Emitter, [{
    key: "delegate",
    value: function delegate(method) {
      this.obj[method] = this.eventTarget[method].bind(this.eventTarget);
    }
  }]);

  return Emitter;
}(); // Reusable Iterator class:


var Iterator = /*#__PURE__*/function () {
  function Iterator(o, key) {
    _classCallCheck(this, Iterator);

    this.index = [];
    this.i = 0;
    this.o = o;

    for (var x in o) {
      this.index.push({
        'key': x,
        'order': o[x][key]
      });
    }

    this.index.sort(function (a, b) {
      var as = a['order'],
          bs = b['order'];
      return as == bs ? 0 : as > bs ? 1 : -1;
    });
    this.len = this.index.length;
  }

  _createClass(Iterator, [{
    key: "next",
    value: function next() {
      return this.i < this.len ? this.o[this.index[this.i++]['key']] : null;
    }
  }]);

  return Iterator;
}();

var Core = /*#__PURE__*/function () {
  function Core() {
    _classCallCheck(this, Core);
  }

  _createClass(Core, null, [{
    key: "addEvents",
    value: function addEvents(obj) {
      new Emitter(obj);
    }
  }, {
    key: "getObjectValue",
    value: function getObjectValue(obj, path, def) {
      // Get the path as an array
      path = Core.stringToPath(path); // Cache the current object

      var current = obj; // For each item in the path, dig into the object

      for (var i = 0; i < path.length; i++) {
        // If the item isn't found, return the default (or null)
        if (_typeof(current[path[i]]) === undefined) return def; // Otherwise, update the current  value

        current = current[path[i]];
      }

      return current;
    }
  }, {
    key: "stringifyJs",
    value: function stringifyJs(o, replacer, indent) {
      var sfy = function sfy(o, replacer, indent, level) {
        var type = _typeof(o),
            tpl,
            tab = function tab(lvl) {
          return " ".repeat(indent * lvl);
        };

        if (type === "function") {
          return o.toString();
        }

        if (type !== "object") {
          return JSON.stringify(o, replacer);
        } else if (Array.isArray(o)) {
          var s = "[\n";
          var ar = [];
          level++;
          s += tab(level);
          o.forEach(function (i) {
            ar.push(sfy(i, replacer, indent, level));
          });
          s += ar.join(',');
          level--;
          s += "\n" + tab(level) + "]";
          return s;
        }

        var result = "";
        level++;
        result += "{\n" + tab(level);
        var props = Object.keys(o).filter(function (key) {
          return !key.startsWith("_");
        }).map(function (key) {
          return "".concat(key, ": ").concat(sfy(o[key], replacer, indent, level));
        }).join(',\n' + tab(level));
        result += props + "\n";
        level--;
        result += tab(level) + "}";
        return result;
      };

      var level = 0;
      return sfy(o, replacer, indent, level);
    }
  }, {
    key: "scopeEval",
    value: function scopeEval(scope, script) {
      return Function('"use strict";' + script).bind(scope)();
    }
  }, {
    key: "isUrl",
    value: function isUrl(txt) {
      try {
        if (typeof txt !== "string") return false;
        if (txt.indexOf("\n") !== -1 || txt.indexOf(" ") !== -1) return false;
        new URL(txt, window.location.origin);
        return true;
      } catch (_unused) {}

      return false;
    }
  }, {
    key: "setObjectValue",
    value: function setObjectValue(obj, path, value) {
      // Get the path as an array
      path = Core.stringToPath(path); // Cache the current object

      var current = obj; // For each item in the path, dig into the object

      for (var i = 0; i < path.length; i++) {
        current = current[path[i]];

        if (i === path.length - 2) {
          current[path[i + 1]] = value;
        }
      }
    }
  }, {
    key: "stringToPath",
    value: function stringToPath(path) {
      // If the path isn't a string, return it
      if (typeof path !== 'string') return path; // Create new array

      var output = []; // Split to an array with dot notation

      path.split('.').forEach(function (item) {
        // Split to an array with bracket notation
        item.split(/\[([^}]+)\]/g).forEach(function (key) {
          // Push to the new array
          if (key.length > 0) {
            output.push(key);
          }
        });
      });
      return output;
    }
  }, {
    key: "compare",
    value: function compare(operator, a, b) {
      return this.operatorTable[operator](a, b);
    } // get rid of circular references in objects 

  }, {
    key: "stringifyJSONWithCircularRefs",
    value: function stringifyJSONWithCircularRefs(json) {
      // Note: cache should not be re-used by repeated calls to JSON.stringify.
      var cache = [];
      var s = JSON.stringify(json, function (key, value) {
        if (_typeof(value) === 'object' && value !== null) {
          // Duplicate reference found, discard key
          if (cache.includes(value)) return; // Store value in our collection

          cache.push(value);
        }

        return value;
      }, 2);
      cache = null; // Enable garbage collection

      return s;
    }
  }, {
    key: "toPascalCase",
    value: function toPascalCase(s) {
      if (typeof s !== "string") return s;
      return s.replace(/(\w)(\w*)/g, function (g0, g1, g2) {
        return g1.toUpperCase() + g2.toLowerCase();
      });
    }
  }, {
    key: "prettyPrintJSON",
    value: function prettyPrintJSON(obj) {
      var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;

      var replacer = function replacer(match, pIndent, pKey, pVal, pEnd) {
        var key = '<span class="json-key" style="color: brown">',
            val = '<span class="json-value" style="color: navy">',
            str = '<span class="json-string" style="color: olive">',
            r = pIndent || '';
        if (pKey) r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
        if (pVal) r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
        return r + (pEnd || '');
      };

      return JSON.stringify(obj, null, 3).replace(/&/g, '&amp;').replace(/\\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(jsonLine, replacer);
    }
  }, {
    key: "guid",
    value: function guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
      });
    }
  }, {
    key: "waitFor",
    value: function () {
      var _waitFor = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(f, timeoutMs) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", new Promise(function (resolve, reject) {
                  var timeWas = new Date(),
                      wait = setInterval(function () {
                    var result = f();

                    if (result) {
                      clearInterval(wait);
                      resolve();
                    } else if (new Date() - timeWas > timeoutMs) {
                      // Timeout
                      clearInterval(wait);
                      reject();
                    }
                  }, 20);
                }));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function waitFor(_x, _x2) {
        return _waitFor.apply(this, arguments);
      }

      return waitFor;
    }()
  }, {
    key: "isValidUrl",
    value: function isValidUrl(urlString) {
      var url;

      try {
        url = new URL(urlString);
      } catch (_) {
        return false;
      }

      return url.protocol === "http:" || url.protocol === "https:";
    }
  }, {
    key: "toWords",
    value: function toWords(text) {
      var result = text.replace(/([A-Z])/g, " $1");
      return result.charAt(0).toUpperCase() + result.slice(1);
    }
  }]);

  return Core;
}();

_defineProperty(Core, "operatorTable", (_defineProperty2 = {
  '>': function _(a, b) {
    return a > b;
  },
  '<': function _(a, b) {
    return a < b;
  }
}, _defineProperty(_defineProperty2, ">", function _(a, b) {
  return a >= b;
}), _defineProperty(_defineProperty2, '<=', function _(a, b) {
  return a <= b;
}), _defineProperty(_defineProperty2, '===', function _(a, b) {
  return a === b;
}), _defineProperty(_defineProperty2, '!==', function _(a, b) {
  return a !== b;
}), _defineProperty(_defineProperty2, '==', function _(a, b) {
  return a == b;
}), _defineProperty(_defineProperty2, '!=', function _(a, b) {
  return a != b;
}), _defineProperty(_defineProperty2, '&', function _(a, b) {
  return a & b;
}), _defineProperty(_defineProperty2, '^', function _(a, b) {
  return a ^ b;
}), _defineProperty(_defineProperty2, '&&', function _(a, b) {
  return a && b;
}), _defineProperty2));

_defineProperty(Core, "Iterator", Iterator);

var _default = Core;
exports.default = _default;
},{}],"src/pwa/DOM.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Core = _interopRequireDefault(require("./Core"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var DragDropSorter = /*#__PURE__*/function () {
  function DragDropSorter(masterContainer, selector, childSelector) {
    _classCallCheck(this, DragDropSorter);

    _Core.default.addEvents(this); // add simple event system


    this.masterContainer = masterContainer;
    this.selector = selector;
    this.childSelector = childSelector;
    this.dragSortContainers = masterContainer.querySelectorAll(selector);
    console.debug("DragDropSorter: dragSortContainers selected for dragdrop sorting: " + this.dragSortContainers.length, ", selector: ", selector);
    this.enableDragList(masterContainer, childSelector);
  }

  _createClass(DragDropSorter, [{
    key: "triggerEvent",
    value: function triggerEvent(eventName, detail) {
      console.debug("DragDropSorter: triggering event", eventName, "detail: ", detail);
      var ev = new Event(eventName);
      ev.detail = detail;
      this.dispatchEvent(ev);
    }
  }, {
    key: "on",
    value: function on(eventName, func) {
      console.debug("DragDropSorter: listening to event", {
        name: eventName,
        f: func
      });
      this.addEventListener(eventName, func);
      return this;
    }
  }, {
    key: "enableDragList",
    value: function enableDragList(container, childSelector) {
      var _this = this;

      var elements = container.querySelectorAll(childSelector);
      console.debug("DragDropSorter: elements selected for dragdrop sorting: " + elements.length, ", childSelector: ", childSelector);
      elements.forEach(function (item) {
        _this.enableDragItem(item);
      });
    }
  }, {
    key: "enableDragItem",
    value: function enableDragItem(item) {
      var _this2 = this;

      item.setAttribute('draggable', true);

      item.ondrag = function (e) {
        _this2.handleDrag(e);
      };

      item.ondragend = function (e) {
        _this2.handleDrop(e);
      };
    }
  }, {
    key: "handleDrag",
    value: function handleDrag(event) {
      var selectedItem = event.target,
          list = selectedItem.closest(this.selector),
          x = event.clientX,
          y = event.clientY;
      selectedItem.classList.add('drag-sort-active');
      var sortContainer = selectedItem.closest(this.selector);

      if (sortContainer) {
        sortContainer.classList.add("drag-sort-in-process");
        console.debug("drag starts: " + selectedItem.class, ", container:", sortContainer.class);
      }

      var swapItem = document.elementFromPoint(x, y) === null ? selectedItem : document.elementFromPoint(x, y);

      if (list === swapItem.parentNode) {
        swapItem = swapItem !== selectedItem.nextSibling ? swapItem : swapItem.nextSibling;
        list.insertBefore(selectedItem, swapItem);
      }
    }
  }, {
    key: "handleDrop",
    value: function handleDrop(event) {
      event.target.classList.remove('drag-sort-active');
      console.debug("DragDropSorter: drag stopped: " + event.target.class);
      var sortContainer = event.target.closest(this.selector);

      if (sortContainer) {
        console.debug("DragDropSorter: Sort container: " + sortContainer.class);
        sortContainer.classList.remove("drag-sort-in-process");
      } else {//TODO
      }

      this.triggerEvent("sort", {
        order: this.getOrder()
      });
    }
  }, {
    key: "getOrder",
    value: function getOrder() {
      return [];
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.masterContainer.querySelectorAll("[draggable]").forEach(function (d) {
        d.draggable = false;
        d.ondrag = null;
        d.ondragend = null;
      });
    }
  }]);

  return DragDropSorter;
}();

var DOM = /*#__PURE__*/function () {
  function DOM() {
    _classCallCheck(this, DOM);
  }

  _createClass(DOM, null, [{
    key: "parseHTML",
    value: // static constructor
    function parseHTML(html) {
      var parser = new DOMParser(),
          doc = parser.parseFromString(html, 'text/html');
      return doc.body.firstChild;
    }
  }, {
    key: "getValue",
    value: function getValue(ctl) {
      DOM._checkNull('getValue', ctl);

      if (ctl.type === "select" || ctl.type === "select-one") {
        if (ctl.selectedIndex !== -1) return ctl.options[ctl.selectedIndex].value;else return undefined;
      }

      if (ctl.type === "radio") {
        var e = ctl.closest('[data-name="' + ctl.name + '"]').querySelector(":checked");
        return e ? e.value : undefined;
      }

      return ctl.value;
    }
  }, {
    key: "setValue",
    value: function setValue(ctl, value) {
      DOM._checkNull('setValue', ctl);

      ctl.value = value;
    }
  }, {
    key: "elementPath",
    value: function elementPath(e) {
      //e.path.join('/')
      return e.toString();
    } // returns string representation of HtmlElement 
    // using nodeName, id and classes

  }, {
    key: "elementToString",
    value: function elementToString(el) {
      DOM._checkNull('elementToString', el);

      var s = [];

      if (el && el.nodeName) {
        s.push(el.nodeName);
      }

      if (el.id) {
        s.push('#', el.id);
      }

      if (el.classList && el.classList.length) {
        s.push('.');
        s.push(Array(el.classList).join('.'));
      }

      return s.join('');
    }
  }, {
    key: "_checkNull",
    value: function _checkNull(fName, c) {// if (!c) {
      //     let s = "No element passed to " + fName + "()";
      //     console.error(s)
      //     throw s;
      // }
    }
  }, {
    key: "hide",
    value: function hide(ctl) {
      DOM._checkNull('hide', ctl);

      ctl.style.display = "none";
    }
  }, {
    key: "show",
    value: function show(ctl) {
      DOM._checkNull('show', ctl);

      ctl.style.display = "block";
    }
  }, {
    key: "enable",
    value: function enable(ctl) {
      DOM._checkNull('enable', ctl);

      ctl.removeAttribute("disabled");
    }
  }, {
    key: "disable",
    value: function disable(ctl) {
      DOM._checkNull('disable', ctl);

      ctl.setAttribute("disabled", "disabled");
    }
  }, {
    key: "trigger",
    value: function trigger(el, type, x) {
      DOM._checkNull('trigger', el);

      var ev = new Event(type);
      ev.detail = x;
      el.dispatchEvent(ev);
    }
  }, {
    key: "throttleResize",
    value: function throttleResize(elm, callback) {
      DOM._checkNull('throttleResize', elm);

      var _ = this;

      var delay = 100,
          timeout;
      callback();
      elm.addEventListener("resize", function (e) {
        clearTimeout(timeout);
        timeout = setTimeout(callback, delay);
      });
    }
  }, {
    key: "changeHash",
    value: function changeHash(anchor) {
      history.replaceState(null, null, document.location.pathname + '#' + anchor);
    }
  }, {
    key: "prettyPrintHTML",
    value: function prettyPrintHTML(str) {
      var div = document.createElement('div');
      div.innerHTML = str.trim();
      return DOM.formatHTMLNode(div, 0).innerHTML.trim();
    }
  }, {
    key: "formatHTMLNode",
    value: function formatHTMLNode(node, level) {
      var indentBefore = new Array(level++ + 1).join('  '),
          indentAfter = new Array(level - 1).join('  '),
          textNode;

      for (var i = 0; i < node.children.length; i++) {
        textNode = document.createTextNode('\n' + indentBefore);
        node.insertBefore(textNode, node.children[i]);
        DOM.formatHTMLNode(node.children[i], level);

        if (node.lastElementChild == node.children[i]) {
          textNode = document.createTextNode('\n' + indentAfter);
          node.appendChild(textNode);
        }
      }

      return node;
    }
  }, {
    key: "setupGrid",
    value: function setupGrid() {
      var html = document.querySelector("HTML");

      var setC = function setC(width, height) {
        var prefix = "nsp-",
            sizes = {
          "xs": 768,
          "sm": 992,
          "md": 1200,
          "lg": 1440,
          "xl": 1920,
          "uw": 2300
        };
        var cls = prefix + "xs";

        for (var i in sizes) {
          html.classList.remove(prefix + i);
          if (width > sizes[i]) cls = prefix + i;
        }

        ;
        html.classList.remove("nsp-portrait");
        html.classList.remove("nsp-landscape");
        html.classList.add(width > height ? "nsp-landscape" : "nsp-portrait");
        html.classList.add(cls);
      };

      DOM.throttleResize(window, function (e) {
        setC(window.innerWidth, window.innerHeight);
      });
    }
  }, {
    key: "parseCSS",
    value: function parseCSS(css) {
      var doc = document.implementation.createHTMLDocument(""),
          styleElement = document.createElement("style");
      styleElement.textContent = css; // the style will only be parsed once it is added to a document

      doc.body.appendChild(styleElement);
      return styleElement.sheet.cssRules;
    }
  }, {
    key: "waitFor",
    value: // Wait For an element in the DOM
    function waitFor(selector, limit) {
      if (!limit) limit = 1000;
      return _Core.default.waitFor(function () {
        return document.querySelector(selector);
      }, limit);
    }
  }, {
    key: "require",
    value: function require(src, c) {
      if (typeof src == "string") src = [src];
      var d = document;
      var loaded = 0;
      return new Promise(function (resolve, reject) {
        var check = function check() {
          if (loaded === src.length) {
            if (typeof c === "function") {
              c();
            }

            resolve();
          }
        };

        src.forEach(function (s) {
          var e = d.createElement('script');
          e.src = s;
          d.head.appendChild(e);

          e.onload = function (e) {
            loaded++;
            check();
          };
        });
      });
    }
  }, {
    key: "addStyleSheet",
    value: function addStyleSheet(src, attr) {
      var d = document;
      if (d.querySelector("head > link[rel=stylesheet][href='" + src + "']")) return;
      var e = d.createElement('link');
      e.rel = "stylesheet";
      e.href = src;

      if (attr) {
        for (var a in attr) {
          e.setAttribute(a, attr[a]);
        }
      }

      d.head.appendChild(e);
    }
  }, {
    key: "format",
    value: function format(template, data, settings) {
      settings = settings || {
        empty: ''
      }; // Check if the template is a string or a function

      template = typeof template === 'function' ? template() : template;
      if (['string', 'number'].indexOf(_typeof(template)) === -1) throw 'Placeholders: please provide a valid template'; // If no data, return template as-is

      if (!data) return template; // Replace our curly braces with data

      template = template.replace(/\{\{([^}]+)\}\}/g, function (match) {
        // Remove the wrapping curly braces
        match = match.slice(2, -2); // Get the value

        var val = _Core.default.getObjectValue(data, match.trim()); // Replace


        if (!val) return settings.empty !== undefined ? settings.empty : '{{' + match + '}}';
        return val;
      });
      return template;
    }
  }, {
    key: "replace",
    value: function replace(oldElm, newElm) {
      var dummy = oldElm;
      dummy.parentNode.insertBefore(newElm, dummy);
      dummy.remove();
      return newElm;
    }
  }, {
    key: "unwrap",
    value: function unwrap(el) {
      var parent = el.parentNode;

      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }

      parent.removeChild(el);
      return parent;
    }
  }, {
    key: "copyToClipboard",
    value: function copyToClipboard(elm) {
      var selection = window.getSelection();
      var range = document.createRange();
      range.selectNodeContents(elm);
      selection.removeAllRanges();
      selection.addRange(range);
      var successful = document.execCommand('copy');
      window.getSelection().removeAllRanges();
      return successful;
    }
  }, {
    key: "maskInput",
    value: function maskInput(input, options) {
      var pattern = options.pattern;
      var mask = options.mask;

      var doFormat = function doFormat(x, pattern, mask) {
        var strippedValue = x.replace(/[^0-9]/g, "");
        var chars = strippedValue.split('');
        var count = 0;
        var formatted = '';

        for (var i = 0; i < pattern.length; i++) {
          var c = pattern[i];

          if (chars[count]) {
            if (/\*/.test(c)) {
              formatted += chars[count];
              count++;
            } else {
              formatted += c;
            }
          } else if (mask) {
            if (mask.split('')[i]) formatted += mask.split('')[i];
          }
        }

        return formatted;
      };

      var format = function format(elem) {
        var val = doFormat(elem.value, elem.getAttribute('data-format'));
        elem.value = doFormat(elem.value, elem.getAttribute('data-format'), elem.getAttribute('data-mask'));

        if (elem.createTextRange) {
          var range = elem.createTextRange();
          range.move('character', val.length);
          range.select();
        } else if (elem.selectionStart) {
          elem.focus();
          elem.setSelectionRange(val.length, val.length);
        }
      };

      input.addEventListener('keyup', function () {
        format(input);
      });
      input.addEventListener('keydown', function () {
        format(input);
      });
      format(input);
    }
  }]);

  return DOM;
}();

_defineProperty(DOM, "DragDropSorter", DragDropSorter);

_defineProperty(DOM, "_staticConstructor", function () {
  DOM.setupGrid();
}());

var _default = DOM;
exports.default = _default;
},{"./Core":"src/pwa/Core.js"}],"src/exo/ExoFormDataBindingResolver.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Core = _interopRequireDefault(require("../pwa/Core"));

var _ExoFormFactory = _interopRequireDefault(require("./ExoFormFactory"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ExoFormDataBindingResolver = /*#__PURE__*/function () {
  function ExoFormDataBindingResolver(dataBinding) {
    _classCallCheck(this, ExoFormDataBindingResolver);

    this.dataBinding = dataBinding;
    this.exo = dataBinding.exo;
    this._boundControlState = [];
  }

  _createClass(ExoFormDataBindingResolver, [{
    key: "addBoundControl",
    value: function addBoundControl(settings) {
      this._boundControlState.push(settings);
    }
  }, {
    key: "resolve",
    value: function resolve() {
      this._checkSchemaLogic();

      this._replaceVars(this.exo.container);

      this._bindControlStateToUpdatedModel();
    }
  }, {
    key: "_resolveVars",
    value: function _resolveVars(str, cb, ar) {
      // https://regex101.com/r/aEsEq7/1 - Match @object.path, @object.path.subpath, @object.path.subpath etc.
      var result = str.replace(/(?:^|[\s/+*(-])[@]([A-Za-z_]+[A-Za-z_0-9.]*[A-Za-z_]+[A-Za-z_0-9]*)(?=[\s+/*,.?!)]|$)/gm, function (match, token) {
        ar.push(match);
        return " " + cb(token);
      });
      return result;
    }
  }, {
    key: "_replaceVars",
    value: function _replaceVars(node) {
      var _this = this;

      var ar = [];

      if (node.nodeType == 3) {
        var s = node.data;

        if (node.parentElement.data && node.parentElement.data.origData) {
          s = node.parentElement.data.origData;
        }

        s = this._resolveVars(s, function (e) {
          var value = _this.dataBinding.get(e, "");

          return value;
        }, ar);

        if (ar.length) {
          if (!node.parentElement.data || typeof node.parentElement.data.origData === "undefined") {
            node.parentElement.data = node.parentElement.data || {};
            node.parentElement.data.origData = node.data;
          }

          node.data = s;
        }
      }

      if (node.nodeType == 1 && node.nodeName != "SCRIPT") {
        for (var i = 0; i < node.childNodes.length; i++) {
          this._replaceVars(node.childNodes[i]);
        }
      }
    }
  }, {
    key: "_checkSchemaLogic",
    value: function _checkSchemaLogic() {
      var model = this.exo.dataBinding.model;

      if (model && model.logic) {
        if (typeof model.logic === "function") {
          this.applyJSLogic(model.logic, null, model);
        } else if (model.logic && model.logic.type === "JavaScript") {
          var script = this.assembleScript(model.logic);
          this.applyJSLogic(null, script, model);
        }
      }
    }
  }, {
    key: "assembleScript",
    value: function assembleScript(logic) {
      if (logic && Array.isArray(logic.lines)) {
        return "const context = {model: this.dataBinding.model, exo: this};\n" + logic.lines.join('\n');
      }

      return "";
    }
  }, {
    key: "applyJSLogic",
    value: function applyJSLogic(f, js, model) {
      var context = {
        model: model,
        exo: this.exo
      };

      try {
        if (f) {
          model.logic.bind(this.exo)(context);
        } else {
          _Core.default.scopeEval(this.exo, js);
        }
      } catch (ex) {
        console.error(ex);

        this.dataBinding._signalDataBindingError(ex);
      } finally {}
    }
  }, {
    key: "_bindControlStateToUpdatedModel",
    value: function _bindControlStateToUpdatedModel() {
      var _this2 = this;

      this._boundControlState.forEach(function (obj) {
        var value = _this2.dataBinding.get(obj.path);

        console.debug("Databinding: bindControlStateToUpdatedModel", obj.propertyName, "on", _ExoFormFactory.default.fieldToString(obj.field), "to", value, obj.path);
        obj.control[obj.propertyName] = value;
      });
    }
  }]);

  return ExoFormDataBindingResolver;
}();

var _default = ExoFormDataBindingResolver;
exports.default = _default;
},{"../pwa/Core":"src/pwa/Core.js","./ExoFormFactory":"src/exo/ExoFormFactory.js"}],"src/exo/ExoFormDataBinding.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ExoFormFactory = _interopRequireDefault(require("./ExoFormFactory"));

var _Core = _interopRequireDefault(require("../pwa/Core"));

var _ExoFormDataBindingResolver = _interopRequireDefault(require("./ExoFormDataBindingResolver"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ExoFormDataBinding = /*#__PURE__*/function () {
  function ExoFormDataBinding(exo, instance) {
    var _this = this;

    _classCallCheck(this, ExoFormDataBinding);

    _defineProperty(this, "_model", {
      instance: {},
      bindings: {}
    });

    this.exo = exo;

    _Core.default.addEvents(this); // add simple event system


    this._init(exo, instance);

    this._resolver = new _ExoFormDataBindingResolver.default(this);
    exo.on(_ExoFormFactory.default.events.renderStart, function (e) {
      // run logic for initial state of controls
      _this.resolver._checkSchemaLogic();
    });
    exo.on(_ExoFormFactory.default.events.renderReady, function (e) {
      exo.on(_ExoFormFactory.default.events.dataModelChange, function (e) {
        _this.resolver.resolve();
      });

      _this.resolver.resolve();
    });

    this._ready();
  }

  _createClass(ExoFormDataBinding, [{
    key: "resolver",
    get: function get() {
      return this._resolver;
    }
  }, {
    key: "_ready",
    value: function _ready() {
      var _this2 = this;

      var exo = this.exo;
      exo.on(_ExoFormFactory.default.events.schemaLoaded, function () {
        var data = {};
        var modelSetup = [ExoFormDataBinding.origins.bind, ExoFormDataBinding.origins.schema].includes(_this2._origin);
        console.log("Model set up: " + modelSetup);
        exo.query(function (f) {
          if (f.name) {
            if (!f.bind && !modelSetup) {
              f.bind = "instance.data." + f.name; // use default model binding if no binding is specified
            }

            if (f.bind) {
              // field uses databinding to model
              f.value = (modelSetup ? _this2.get(f.bind) : f.value) || "";
              console.debug("ExoFormDatabinding: applying instance." + f.name, f.bind, f.value);
              data[f.name] = f.value;
            }
          }
        }); // make sure we have a model if it wasn't passed in

        if (!modelSetup) {
          console.log("Fill initial model", data);
          _this2._model.instance.data = data;
        }

        console.log("Firing Model ready event ", _this2._model.instance);

        _this2._triggerEvent("ready", {
          model: _this2._model
        });
      }).on(_ExoFormFactory.default.events.interactive, function () {
        exo.form.addEventListener("change", function (e) {
          var field = _ExoFormFactory.default.getFieldFromElement(e.target, {
            master: true // lookup master if nested

          });

          if (field && field.bind) {
            var value = field._control.value;

            _Core.default.setObjectValue(_this2._model, field.bind, value);

            console.log("Model Instance changed", field.bind, value, _this2._model.instance);

            if (_this2._mapped) {
              // map back
              _this2._mapped = _this2._model.instance;
            }

            _this2._triggerEvent("change", {
              model: _this2._model,
              changed: field.bind,
              value: value
            });
          }
        });
      });
    }
  }, {
    key: "_triggerEvent",
    value: function _triggerEvent(eventName, detail, ev) {
      console.debug("ExoFormDatabinding: triggering event", eventName, "detail: ", detail);

      if (!ev) {
        ev = new Event(eventName, {
          bubbles: false,
          cancelable: true
        });
      }

      ev.detail = _objectSpread({
        app: this
      }, detail || {});
      return this.dispatchEvent(ev);
    }
  }, {
    key: "_signalDataBindingError",
    value: function _signalDataBindingError(ex) {
      this._triggerEvent("error", {
        exo: this.exo,
        error: ex
      });
    }
  }, {
    key: "get",
    value: function get(path, defaultValue) {
      var returnValue = null;

      try {
        returnValue = _Core.default.getObjectValue(this._model, path, defaultValue);
      } catch (ex) {
        this._signalDataBindingError(ex);
      }

      return returnValue;
    }
  }, {
    key: "on",
    value: function on(eventName, func) {
      console.debug("ExoFormDatabinding: listening to event", eventName, func);
      this.addEventListener(eventName, func);
      return this;
    }
  }, {
    key: "_init",
    value: function _init(exo, instance) {
      if (instance) {
        this._mapped = instance;
        this._model.instance = instance;
        this._origin = ExoFormDataBinding.origins.bind;
      } else if (exo.schema.model) {
        this._origin = ExoFormDataBinding.origins.schema;
        this._model = _objectSpread({}, exo.schema.model);
        this._model.bindings = this._model.bindings || {};
      } else {
        this._origin = ExoFormDataBinding.origins.none;
      }
    }
  }, {
    key: "toString",
    value: function toString() {
      return JSON.stringify(this.model, null, 2);
    }
  }, {
    key: "model",
    get: function get() {
      if (!this._instanceInitialized) {
        try {
          if (this._origin === ExoFormDataBinding.origins.none) {
            var obj = this.exo.getFormValues();
            this._model.instance = {
              data: obj
            };
          }
        } catch (_unused) {} finally {
          this._instanceInitialized = true;
          this._model.instance = this._model.instance || {
            data: {}
          };
        }
      }

      return this._model;
    }
  }, {
    key: "_processFieldProperty",
    value: function _processFieldProperty(control, name, value) {
      var returnValue = value;

      if (typeof value === "string" && value.startsWith("@")) {
        var path = value.substring(1);
        console.debug("ExoFormDatabinding: resolving databound control property", name, value, "path:", path);
        returnValue = this.get(path, undefined);

        if (returnValue === undefined) {
          returnValue = value; // return original string, don't resolve
        } else {
          console.debug("ExoFormDatabinding: resolved databound control property", name, value, returnValue);
          this.resolver.addBoundControl({
            control: control,
            field: control.context.field,
            path: path,
            propertyName: name,
            originalBoundValue: returnValue
          });
        }
      }

      return returnValue;
    }
  }]);

  return ExoFormDataBinding;
}();

_defineProperty(ExoFormDataBinding, "origins", {
  schema: "schema",
  bind: "bind",
  none: "none"
});

var _default = ExoFormDataBinding;
exports.default = _default;
},{"./ExoFormFactory":"src/exo/ExoFormFactory.js","../pwa/Core":"src/pwa/Core.js","./ExoFormDataBindingResolver":"src/exo/ExoFormDataBindingResolver.js"}],"src/exo/ExoForm.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Core = _interopRequireDefault(require("../pwa/Core"));

var _DOM = _interopRequireDefault(require("../pwa/DOM"));

var _ExoFormFactory = _interopRequireDefault(require("./ExoFormFactory"));

var _ExoFormDataBinding = _interopRequireDefault(require("./ExoFormDataBinding"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * ExoForm class. 
 * Created using ExoFormContext create() method
 * 
 * @hideconstructor
 */
var ExoForm = /*#__PURE__*/function () {
  // reserved for later  
  function ExoForm(context, opts) {
    _classCallCheck(this, ExoForm);

    _Core.default.addEvents(this); // add simple event system
    // Use const context = await ExoFormFactory.build() and context.createForm()


    if (!context || !(context instanceof _ExoFormFactory.default.Context)) throw "ExoForm: invalid instantiation of ExoForm: need ExoFormContext instance";
    this.context = context;
    opts = opts || {};
    var defOptions = {
      type: "form",
      customMethods: {}
    };
    this.options = _objectSpread(_objectSpread({}, defOptions), opts);
    this.form = document.createElement("form");
    this.form.setAttribute("method", "post");
    this.form.classList.add("exf-form");
    this.container = _DOM.default.parseHTML(ExoForm.meta.templates.exocontainer);
  }

  _createClass(ExoForm, [{
    key: "schema",
    get: function get() {
      return this._schema;
    }
    /**
     * load ExoForm schema (string or )
     * @param {any} schema - A JSON ExoForm Schema string or object, or URL to fetch it from.
     * @return {Promise} - A Promise returning the ExoForm Object with the loaded schema
     */

  }, {
    key: "load",
    value: function load(schema, options) {
      var _this = this;

      options = options || {
        mode: "async"
      };

      var _ = this;

      if (options.mode.startsWith("sync")) {
        return this.loadSchema(schema);
      }

      return new Promise(function (resolve, reject) {
        var loader = function loader(schema) {
          if (!schema) resolve(_);else {
            _this.loadSchema(schema);

            resolve(_);
          }
        };

        if (_Core.default.isUrl(schema)) {
          var url = new URL(schema, _this.context.baseUrl);

          try {
            if (url.toString().split(".").pop() === "js") {
              fetch(url).then(function (x) {
                return x.text();
              }).then(function (r) {
                loader(r);
              }).catch(function (ex) {
                reject(ex);
              });
            } else {
              fetch(url).then(function (x) {
                return x.json();
              }).then(function (r) {
                loader(r);
              }).catch(function (ex) {
                reject(ex);
              });
            }
          } catch (ex) {
            reject(ex);
          }
        } else {
          loader(schema);
        }
      });
    }
    /**
     * load ExoForm schema from object
     * @param {any} schema - A JSON ExoForm Schema object.
     * @return {any} - the loaded schema
     */

  }, {
    key: "loadSchema",
    value: function loadSchema(schema) {
      var _this2 = this;

      this._schema = this.context.createSchema();

      this._schema.parse(schema);

      this._dataBinding = new _ExoFormDataBinding.default(this, this._mappedInstance);
      this.dataBinding.on("change", function (e) {
        e.detail.state = "change";

        _this2.triggerEvent(_ExoFormFactory.default.events.dataModelChange, e.detail);
      }).on("ready", function (e) {
        e.detail.state = "ready";

        _this2.triggerEvent(_ExoFormFactory.default.events.dataModelChange, e.detail);
      }).on("error", function (e) {
        _this2.triggerEvent(_ExoFormFactory.default.events.error, e.detail);
      });
      this.triggerEvent(_ExoFormFactory.default.events.schemaLoaded);

      this._createComponents();

      if (this.schema.form) {
        var formClasses = this.schema.form.class ? this.schema.form.class.split(' ') : ["standard"];
        formClasses.forEach(function (c) {
          _this2.form.classList.add(c);
        });
      }
    }
    /**
    * Gets the data binding object
    * @return {object} - The ExoFormDataBinding instance associated with the form.
    */

  }, {
    key: "dataBinding",
    get: function get() {
      return this._dataBinding;
    }
  }, {
    key: "bind",
    value: function bind(instance) {
      //TODO
      this._mappedInstance = instance;
    }
  }, {
    key: "_createComponents",
    value: function _createComponents() {
      this.addins = {};

      for (var n in _ExoFormFactory.default.meta) {
        var cmp = _ExoFormFactory.default.meta[n];
        var tp = cmp.type.getType(this);
        console.debug("ExoForm:", n, "component used:", tp.name);
        this.addins[n] = new tp(this);
      }
    }
  }, {
    key: "triggerEvent",
    value: function triggerEvent(eventName, detail, ev) {
      console.debug("ExoForm: triggering event", eventName, "detail: ", detail);

      if (!ev) {
        ev = new Event(eventName, {
          bubbles: false,
          cancelable: true
        });
      }

      ev.detail = _objectSpread({
        exoForm: this
      }, detail || {});
      return this.dispatchEvent(ev);
    }
    /**
     * Render ExoForm schema into a form
     * Returns a Promise
     */

  }, {
    key: "renderForm",
    value: function renderForm() {
      var _ = this;

      _.triggerEvent(_ExoFormFactory.default.events.renderStart);

      _._cleanup();

      return new Promise(function (resolve, reject) {
        _.container.appendChild(_.form);

        try {
          _._renderPages().then(function () {
            _._finalizeForm();

            resolve(_);
          }).catch(function (ex) {
            reject("_renderPages() failed: " + ex.toString());
          });
        } catch (ex) {
          reject("Exception in _renderPages(): " + ex.toString());
        }
      });
    }
  }, {
    key: "_finalizeForm",
    value: function _finalizeForm() {
      var _this3 = this;

      this.addins.navigation.render();
      this.addins.progress.render();
      this.addins.theme.apply();
      this.form.addEventListener("submit", function (e) {
        e.preventDefault(); // preventing default behaviour

        e.stopPropagation();

        _this3.submitForm(e);
      }); // stop propagating events to above form 
      // in case for is embedded in another one (such as ExoFormBuilder)

      this.form.addEventListener("change", function (e) {
        e.stopPropagation();
      }); // TODO reimplement rules using model binding

      this.addins.rules.checkRules();
      this.addins.navigation.restart();
      this.triggerEvent(_ExoFormFactory.default.events.renderReady); // Test for fom becoming user-interactive 

      var observer = new IntersectionObserver(function (entries, observer) {
        if (_this3.container.offsetHeight) {
          observer = null;
          console.debug("ExoForm: interactive event");

          _this3.triggerEvent(_ExoFormFactory.default.events.interactive);
        }
      }, {
        root: document.documentElement
      });
      observer.observe(this.container);
    }
  }, {
    key: "_cleanup",
    value: function _cleanup() {
      if (this.addins && this.addins.navigation) this.addins.navigation.clear();
      if (this.container) this.container.innerHTML = "";
    }
    /**
    * Adds an event handler
    * @param {string} eventName - Name of the event to listen to - Use xo.form.factory.events as a reference
    * @param {function} func - function to attach 
    * @return {object} - The ExoForm instance
    */

  }, {
    key: "on",
    value: function on(eventName, func) {
      console.debug("ExoForm: added event listener", {
        name: eventName,
        f: func
      });
      this.addEventListener(eventName, func);
      return this;
    }
  }, {
    key: "_renderPages",
    value: function _renderPages() {
      var _this4 = this;

      var _ = this;

      return new Promise(function (resolve, reject) {
        var pageNr = 0;
        var totalFieldsRendered = 0;
        _.pageContainer = _DOM.default.parseHTML('<div class="exf-wrapper" />');

        _.schema.pages.forEach(function (p) {
          pageNr++;
          p = _._enrichPageSettings(p, pageNr);

          _.pageContainer.appendChild(p.dummy);

          _.createControl(p).then(function (page) {
            var pageFieldsRendered = 0;
            p.fields.forEach(function (f) {
              console.debug("ExoForm: rendering field", f.name, f);
              f.dummy = _DOM.default.parseHTML('<span/>');
              page.appendChild(f.dummy);

              _.createControl(f).then(function () {
                f._control.render().then(function (rendered) {
                  if (!rendered) throw "ExoForm: " + _ExoFormFactory.default.fieldToString(f) + " does not render an HTML element";
                  pageFieldsRendered = _this4._addRendered(f, rendered, pageFieldsRendered, p, page);
                }).catch(function (ex) {
                  var showError = !_this4.triggerEvent(_ExoFormFactory.default.events.error, {
                    error: ex
                  });
                  console.error(ex);

                  var rendered = _DOM.default.parseHTML(_DOM.default.format('<span class="exf-error exf-render-error" title="{{title}}">ERROR</span>', {
                    title: "ExoForm: error rendering field " + _ExoFormFactory.default.fieldToString(f) + ": " + ex.toString()
                  }));

                  pageFieldsRendered = _this4._addRendered(f, rendered, pageFieldsRendered, p, page);
                }).finally(function (r) {
                  totalFieldsRendered++;

                  if (totalFieldsRendered === _.schema.fieldCount) {
                    _.container.classList.add(pageNr > 1 ? "exf-multi-page" : "exf-single-page"); // check for custom container


                    if (_.schema.form.container) {
                      var cf = _._getFormContainerProps(_);

                      _.createControl(cf).then(function (cx) {
                        cx.render().then(function (x) {
                          x.appendChild(_.pageContainer);
                          _.pageContainer = _DOM.default.unwrap(_.pageContainer);
                          cx.finalize(_.pageContainer);

                          _.form.appendChild(x);

                          resolve();
                        });
                      });
                    } else {
                      _.form.appendChild(_.pageContainer);

                      resolve();
                    }
                  }
                });
              }).catch(function (ex) {
                reject("Exception in createControl() for control " + _ExoFormFactory.default.fieldToString(f) + ": " + ex.toString());
              });
            });
          }).catch(function (ex) {
            reject("Exception in createControl() for page container " + _ExoFormFactory.default.fieldToString(p) + ": " + ex.toString());
          });
        });
      });
    }
  }, {
    key: "_addRendered",
    value: function _addRendered(f, rendered, pageFieldsRendered, p, page) {
      _DOM.default.replace(f.dummy, rendered);

      delete f.dummy;
      pageFieldsRendered++;

      if (pageFieldsRendered === p.fields.length) {
        console.debug("ExoForm: page", p.index + "rendered with", pageFieldsRendered, " controls");
        page.render().then(function (pageElm) {
          _DOM.default.replace(p.dummy, pageElm);

          delete p.dummy;
        });
      }

      return pageFieldsRendered;
    }
  }, {
    key: "_getFormContainerProps",
    value: function _getFormContainerProps() {
      var p = _objectSpread(_objectSpread({
        type: "div",
        class: "exf-wrapper"
      }, this.schema.form.container), {
        pages: this.schema.pages && this.schema.pages.length ? this.schema.pages.map(function (y) {
          return {
            id: "page" + y.id,
            caption: y.legend
          };
        }) : []
      });

      return p;
    }
  }, {
    key: "_enrichPageSettings",
    value: function _enrichPageSettings(p, pageNr) {
      p.index = pageNr;
      p.isPage = true;
      p.type = p.type || "fieldset";
      p.class = "exf-cnt exf-page" + (p.class ? " " + p.class : "");
      p.dummy = document.createElement('span');
      return p;
    }
    /**
     * query all fields using matcher and return matches
     * @param {function} matcher - function to use to filter
     * @param {object} options - query options. e.g. {inScope: true} for querying only fields that are currenttly in scope.
     * @return {array} - All matched fields in the current ExoForm schema
     */

  }, {
    key: "query",
    value: function query(matcher, options) {
      var _this5 = this;

      if (matcher === undefined) matcher = function matcher() {
        return true;
      };
      options = options || {};
      return this.schema.query(function (item, data) {
        if (data.type === "page") {
          return !options.inScope || _this5.isPageInScope(data.pageIndex);
        }

        return matcher(item, data);
      });
    }
    /**
     * Returns true if the given page is in scope (not descoped by active rules)
     * @param {object} p - Page object (with index numeric property)
     * @returns {boolean} - true if page is in scope
     */

  }, {
    key: "isPageInScope",
    value: function isPageInScope(p) {
      var pageElm = this.form.querySelector(".exf-page[data-page='" + p.index + "']:not([data-skip='true'])");
      return pageElm !== null;
    }
    /**
     * Get field with given name
     * @param {string} name - name of field to get
     * @return {Object} - Field
     */

  }, {
    key: "get",
    value: function get(name) {
      var results = this.query(function (f) {
        return f.name === name;
      });
      return results.length ? results[0] : null;
    }
    /**
     * Map data to form, once schema is loaded
     * @param {function} mapper - a function that will return a value per field
     * @return {object} - the current ExoForm instance
     */

  }, {
    key: "map",
    value: function map(mapper) {
      this.query().forEach(function (f) {
        var value = mapper(f);

        if (value !== undefined) {
          f.value = value;
          f._control.value = value;
        }
      });
      return this;
    }
    /**
     * Submits the form
     * @param {event} ev - event object to pass onto the submit handler
     */

  }, {
    key: "submitForm",
    value: function submitForm(ev) {
      if (ev) ev.preventDefault();

      if (!this.addins.validation.checkValidity()) {
        console.debug("checkValidity - Form not valid");
        this.addins.validation.reportValidity();
        return;
      }

      var e = {
        target: this.form
      };
      var data = this.getFormValues(ev);
      this.triggerEvent(_ExoFormFactory.default.events.post, {
        postData: data
      });
      e.returnValue = false;
    }
    /**
     * Gets the current form's values
     * @return {object} - The typed data posted
     */

  }, {
    key: "getFormValues",
    value: function getFormValues() {
      var data = {};
      this.query().forEach(function (f) {
        if (f._control) {
          data[f.name] = f._control.value;
        }
      });
      return data;
    }
  }, {
    key: "getFieldValue",
    value: function getFieldValue(elementOrField) {
      if (elementOrField && elementOrField._control) return elementOrField._control.value;else if (elementOrField.form && elementOrField.name) {
        var field = _ExoFormFactory.default.getFieldFromElement(elementOrField);

        if (field) return field._control.value; //return DOM.getValue(this.form.querySelector("[name='" + f.name + "']"))
      }
      return undefined;
    }
    /**
     * Renders a single ExoForm control 
     * @param {object} field - field structure sub-schema. 
     * @return {promise} - A promise with the typed rendered element
     */

  }, {
    key: "renderSingleControl",
    value: function () {
      var _renderSingleControl = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(field) {
        var _, c, element;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _ = this;
                _context.next = 3;
                return this.createControl(field);

              case 3:
                c = _context.sent;
                field._control = c;
                _context.next = 7;
                return c.render();

              case 7:
                element = _context.sent;

                if (element) {
                  _context.next = 10;
                  break;
                }

                throw _ExoFormFactory.default.fieldToString(field) + " does not render an HTML element";

              case 10:
                return _context.abrupt("return", element);

              case 11:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function renderSingleControl(_x) {
        return _renderSingleControl.apply(this, arguments);
      }

      return renderSingleControl;
    }()
  }, {
    key: "createControl",
    value: function createControl(f) {
      var _ = this;

      return new Promise(function (resolve, reject) {
        var doResolve = function doResolve(f, c) {
          f._control = c;
          c.htmlElement.data = c.htmlElement.data || {};
          c.htmlElement.data.field = f; // keep field in element data

          c.htmlElement.setAttribute("data-exf", "1"); // mark as element holding data

          console.debug("ExoForm: resolving ", _ExoFormFactory.default.fieldToString(f));
          resolve(c);
        };

        try {
          if (!f || !f.type) throw "ExoForm: incorrect field options. Must be object with at least 'type' property. " + JSON.stringify(f);
          f.id = f.id || _._generateUniqueElementId();

          var field = _.context.get(f.type);

          if (!field) throw "ExoForm: " + f.type + " is not a registered ExoForm field type";
          var baseType = field.type;
          if (!baseType) throw "ExoForm: class for " + f.type + " not defined";
          if (!_.context.isExoFormControl(f)) throw "ExoForm: cannot create control: class for " + f.type + " is not derived from ExoControlBase";
          var control = null;
          var context = {
            exo: _,
            field: f
          };

          if (f.custom) {
            _ExoFormFactory.default.loadCustomControl(f, f.custom).then(function (x) {
              var customType = x.default;
              control = new customType(context);
              doResolve(f, control);
            });
          } else {
            control = new baseType(context);
            doResolve(f, control);
          }
        } catch (ex) {
          var _field = _.context.get("div");

          var _control = new _field.type({
            exo: _,
            field: _objectSpread({}, f)
          });

          var showError = !_.triggerEvent(_ExoFormFactory.default.events.error, {
            stage: "Create",
            error: ex
          });
          console.error(ex);

          _control.htmlElement.appendChild(_DOM.default.parseHTML(_DOM.default.format('<span class="exf-error exf-create-error" title="{{title}}">ERROR</span>', {
            title: "Error creating " + _ExoFormFactory.default.fieldToString(f) + ": " + ex.toString()
          })));

          doResolve(f, _control);
        }
      });
    }
  }, {
    key: "_generateUniqueElementId",
    value: function _generateUniqueElementId() {
      var gid = _Core.default.guid();

      gid = gid.split('-');
      gid = gid[gid.length - 1];
      return "exf" + gid;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.form.reset();
      this.form.querySelectorAll(".clearable").forEach(function (c) {
        c.innerHTML = "";
      });
    }
  }], [{
    key: "setup",
    value: function setup() {}
  }]);

  return ExoForm;
}();

_defineProperty(ExoForm, "meta", {
  properties: {
    all: ["accept", "alt", "autocomplete", "autofocus", "capture", "checked", "dirName", "disabled", "height", "list", "max", "maxLength", "min", "minLength", "multiple", "name", "pattern", "placeholder", "readOnly", "required", "size", "src", "step", "type", "value", "width", "className"],
    map: {
      "class": "className",
      "readonly": "readOnly",
      "dirname": "dirName",
      "minlength": "minLength",
      "maxlength": "maxLength"
    },
    reserved: ["caption", "template", "elm", "ctl", "tagname", "ispage", "bind"]
  },
  templates: {
    empty:
    /*html*/
    "<span data-replace=\"true\"></span>",
    exocontainer:
    /*html*/
    "<div class=\"exf-container\"></div>",
    legend:
    /*html*/
    "<legend class=\"exf-page-title\">{{legend}}</legend>",
    pageIntro:
    /*html*/
    "<p class=\"exf-page-intro\">{{intro}}</p>",
    datalist:
    /*html*/
    "<datalist id=\"{{id}}\"></datalist>",
    datalistItem:
    /*html*/
    "<option label=\"{{label}}\" value=\"{{value}}\" >",
    button:
    /*html*/
    "<button name=\"{{name}}\" type=\"{{type}}\" class=\"btn {{class}}\">{{caption}}</button>"
  }
});

_defineProperty(ExoForm, "_staticConstructor", function () {
  ExoForm.setup();
}());

var _default = ExoForm;
exports.default = _default;
},{"../pwa/Core":"src/pwa/Core.js","../pwa/DOM":"src/pwa/DOM.js","./ExoFormFactory":"src/exo/ExoFormFactory.js","./ExoFormDataBinding":"src/exo/ExoFormDataBinding.js"}],"src/exo/ExoBaseControls.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ExoRangeControl = exports.ExoNumberControl = exports.ExoListControl = exports.ExoDivControl = exports.ExoTextControl = exports.ExoInputControl = exports.ExoElementControl = void 0;

var _ExoFormFactory = _interopRequireDefault(require("./ExoFormFactory"));

var _ExoForm = _interopRequireDefault(require("./ExoForm"));

var _Core = _interopRequireDefault(require("../pwa/Core"));

var _DOM = _interopRequireDefault(require("../pwa/DOM"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function set(target, property, value, receiver) { if (typeof Reflect !== "undefined" && Reflect.set) { set = Reflect.set; } else { set = function set(target, property, value, receiver) { var base = _superPropBase(target, property); var desc; if (base) { desc = Object.getOwnPropertyDescriptor(base, property); if (desc.set) { desc.set.call(receiver, value); return true; } else if (!desc.writable) { return false; } } desc = Object.getOwnPropertyDescriptor(receiver, property); if (desc) { if (!desc.writable) { return false; } desc.value = value; Object.defineProperty(receiver, property, desc); } else { _defineProperty(receiver, property, value); } return true; }; } return set(target, property, value, receiver); }

function _set(target, property, value, receiver, isStrict) { var s = set(target, property, value, receiver || target); if (!s && isStrict) { throw new Error('failed to set property'); } return value; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//#region Controls
var ExoControlBase = /*#__PURE__*/function () {
  function ExoControlBase(context) {
    _classCallCheck(this, ExoControlBase);

    _defineProperty(this, "attributes", {});

    _defineProperty(this, "_visible", true);

    _defineProperty(this, "_disabled", false);

    _defineProperty(this, "_rendered", false);

    _defineProperty(this, "acceptedProperties", []);

    _defineProperty(this, "dataProps", {});

    if (this.constructor === ExoControlBase) throw new Error("Can't instantiate abstract class!");
    this.context = context;
    if (!context || !context.field || !context.exo) throw "Invalid instantiation of ExoControlBase";
    this.htmlElement = document.createElement('span');
    this.acceptProperties({
      name: "visible"
    }, {
      name: "disabled"
    });
  }

  _createClass(ExoControlBase, [{
    key: "_getContainerTemplate",
    value: function _getContainerTemplate(obj) {
      if (this.context.field.isPage) {
        return _DOM.default.format(
        /*html*/
        "<span data-replace=\"true\"></span>", this._getContainerAttributes());
      } else if (this.context.field.type === "button") {
        var tpl =
        /*html*/
        "<div data-id=\"{{id}}\" class=\"exf-ctl-cnt {{class}\"><span data-replace=\"true\"></span></div>";
        return _DOM.default.format(tpl, this._getContainerAttributes());
      }

      return (
        /*html*/
        "<div data-id=\"".concat(obj.id, "\" class=\"").concat(obj.class, "\" data-field-type=\"").concat(obj.type, "\">\n    <div class=\"exf-ctl\">\n        <label for=\"").concat(obj.id, "\" aria-hidden=\"true\" class=\"exf-label\" title=\"").concat(obj.caption, "\">").concat(obj.caption, "</label>\n        \n        <span data-replace=\"true\"></span>\n        \n    </div>\n    <div class=\"exf-fld-details\">\n        <div class=\"exf-help-wrapper\"></div>\n    </div>\n</div>")
      );
    }
  }, {
    key: "htmlElement",
    get: function get() {
      return this._htmlElement;
    },
    set: function set(el) {
      this._htmlElement = el;
      this.allowedAttributes = _ExoFormFactory.default.listNativeProps(this.htmlElement);
      this.isSelfClosing = ["area", "base", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"].includes(el.tagName.toLowerCase());
    }
  }, {
    key: "appendChild",
    value: function appendChild(elm) {
      this.htmlElement.appendChild(elm);
    }
  }, {
    key: "typeConvert",
    value: function typeConvert(value) {
      return _ExoFormFactory.default.checkTypeConversion(this.context.field.type, value);
    }
  }, {
    key: "value",
    get: function get() {
      var v = this.htmlElement.value;
      return this.typeConvert(v);
    },
    set: function set(data) {
      this.htmlElement.value = data;
    }
  }, {
    key: "triggerChange",
    value: function triggerChange(detail) {
      var evt = document.createEvent("HTMLEvents");
      evt.initEvent("change", true, true);
      evt.detail = detail;
      this.htmlElement.dispatchEvent(evt);
    }
  }, {
    key: "visible",
    get: function get() {
      return this._visible;
    },
    set: function set(value) {
      this._visible = value;

      if (this.rendered) {
        var elm = this.container || this.htmlElement;
        elm.style.display = value ? "block" : "none";
      }
    }
  }, {
    key: "disabled",
    get: function get() {
      return this._disabled;
    }
    /*
    * Tell system which properties to take from the configured field schema
    */
    ,
    set: function set(value) {
      this._disabled = value;

      if (this.rendered) {
        if (value) {
          this.htmlElement.setAttribute("disabled", "disabled");
          this.container.classList.add("exf-disabled");
        } else {
          this.htmlElement.removeAttribute("disabled");
          this.container.classList.remove("exf-disabled");
        }
      }
    }
  }, {
    key: "rendered",
    get: function get() {
      return this._rendered;
    }
  }, {
    key: "acceptProperties",
    value: function acceptProperties() {
      var _this = this;

      for (var _len = arguments.length, ar = new Array(_len), _key = 0; _key < _len; _key++) {
        ar[_key] = arguments[_key];
      }

      ar.forEach(function (p) {
        if (typeof p === "string") {
          p = {
            name: p
          };
        }

        var prop = _this.acceptedProperties.find(function (e) {
          return e.name === p.name;
        });

        if (!prop) {
          _this.acceptedProperties.push(p);

          if (_this.context.field[p.name] !== undefined) {
            _this[p.name] = _this._processProp(p.name, _this.context.field[p.name]);
          }
        }
      });
    }
  }, {
    key: "_scope",
    value: function _scope() {
      var f = this.context.field;
      return _objectSpread(_objectSpread({}, f), {}, {
        caption: f.caption || "",
        tooltip: f.tooltip || "",
        class: "",
        id: f.id
      });
    }
  }, {
    key: "_addContainerClasses",
    value: function _addContainerClasses() {
      var _this$container$class;

      (_this$container$class = this.container.classList).add.apply(_this$container$class, _toConsumableArray(this._getContainerClasses()));
    }
  }, {
    key: "_getContainerClasses",
    value: function _getContainerClasses() {
      var ar = [];
      if (!this.isPage) ar.push("exf-ctl-cnt");
      ar.push("exf-base-" + this._getBaseType());

      if (this.context.field.containerClass) {
        var cc = this.context.field.containerClass.trim().split(" ");
        cc.forEach(function (c) {
          ar.push(c);
        });
      }

      if (this.htmlElement.tagName === "INPUT" || this.htmlElement.tagName === "TEXTAREA") ar.push("exf-input");
      if (this.context.field.readOnly) ar.push("exf-readonly");
      if (this.context.field.disabled) ar.push("exf-disabled");
      return ar;
    }
  }, {
    key: "_getBaseType",
    value: function _getBaseType() {
      var returns = this.context.field.returnValueType ? this.context.field.returnValueType.name : "String";
      if (this.isTextInput) return "text";
      if (returns === "Boolean") return "bool";
      if (returns === "Array") return "multi";
      return "default";
    }
  }, {
    key: "render",
    value: function () {
      var _render = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var a, obj, toReplace;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.setProperties();
                _context.t0 = regeneratorRuntime.keys(this.attributes);

              case 2:
                if ((_context.t1 = _context.t0()).done) {
                  _context.next = 10;
                  break;
                }

                a = _context.t1.value;

                if (!(a === "required")) {
                  _context.next = 7;
                  break;
                }

                this._htmlElement.required = this.attributes[a];
                return _context.abrupt("continue", 2);

              case 7:
                this._htmlElement.setAttribute(a, this.attributes[a]);

                _context.next = 2;
                break;

              case 10:
                for (a in this.dataProps) {
                  this._htmlElement.setAttribute("data-" + a, this.dataProps[a]);
                }

                obj = this._scope();
                this.container = _DOM.default.parseHTML(this._getContainerTemplate(obj));

                if (!obj.caption || obj.caption.length === 0) {
                  this.container.classList.add("exf-lbl-empty");
                }

                if (this.container.getAttribute("data-replace") === "true") this.container = this.htmlElement;else {
                  toReplace = this.container.querySelector('[data-replace="true"]');
                  if (!toReplace) this.container = this.htmlElement;else _DOM.default.replace(toReplace, this.htmlElement);
                }
                this.addEventListeners();

                if (this.context.field.required) {
                  this.container.classList.add("exf-required");
                } // apply value if set in field


                if (this.context.field.value) {
                  this.value = this.context.field.value;
                  if (this.value) this.container.classList.add("exf-filled");
                }

                this._addContainerClasses();

                this._rendered = true;
                return _context.abrupt("return", this.container);

              case 21:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function render() {
        return _render.apply(this, arguments);
      }

      return render;
    }()
  }, {
    key: "addEventListeners",
    value: function addEventListeners() {
      var _ = this;

      var exo = _.context.exo;
      var f = _.context.field;

      _.htmlElement.addEventListener("invalid", function (e) {
        console.debug("check validity on ", e.target, "submitCheck", _.submitCheck);

        if (e.target.closest("[data-page]").getAttribute("data-skip") === "true") {
          console.debug("invalid event on skipped control", e.target.name);
          e.preventDefault();
          return false;
        } else return exo.addins.validation.testValidity(e, f);
      });

      _.htmlElement.addEventListener("change", function (e) {
        var isDirty = e.target.value != e.target.defaultValue;
        var el = e.target.closest(".exf-ctl-cnt");
        if (el) el.classList[isDirty ? "add" : "remove"]("exf-dirty");
      });
    }
  }, {
    key: "_getContainerAttributes",
    value: function _getContainerAttributes() {
      var f = this.context.field;
      return _objectSpread(_objectSpread({}, f), {}, {
        caption: f.caption || "",
        tooltip: f.tooltip || "",
        //class: (f.containerClass || ""), //+ this.isTextInput ? " exf-base-text" : "" ,
        id: this.id + "-container"
      });
    }
  }, {
    key: "setProperties",
    value: function setProperties() {
      var _this2 = this;

      var f = this.context.field;

      var _loop = function _loop() {
        var name = prop.toLowerCase();
        if (_ExoForm.default.meta.properties.reserved.includes(name)) return "continue";
        var value = f[name];
        var useName = prop; // ExoForm.meta.properties.map[prop] || prop;

        var isSet = _this2.acceptedProperties.find(function (e) {
          return e.name === useName;
        });

        if (isSet) return "continue";

        if (_this2.allowedAttributes.includes(useName)) {
          _this2.attributes[useName] = _this2._processProp(name, value);
        } else {
          if (_typeof(value) === "object") {
            _this2[useName] = value;
          } else {
            _this2.dataProps[useName] = _this2._processProp(name, value);
          }
        }
      };

      for (var prop in f) {
        var _ret = _loop();

        if (_ret === "continue") continue;
      }
    }
  }, {
    key: "_processProp",
    value: function _processProp(name, value) {
      // resolve bound state 
      var db = this.context.exo.dataBinding;

      if (db) {
        return db._processFieldProperty(this, name, value);
      }

      return value;
    } // returns valid state of the control - can be subclassed

  }, {
    key: "valid",
    get: function get() {
      var numInvalid = 0;

      var rv = function rv(el) {
        if (el.reportValidity) {
          try {
            if (!el.reportValidity()) {
              numInvalid++;
            }
          } catch (_unused) {}
        }
      };

      var elm = this.container || this.htmlElement;
      rv(elm);
      elm.querySelectorAll("*").forEach(rv);
      return numInvalid === 0;
    }
  }, {
    key: "validationMessage",
    get: function get() {
      var msg = "";
      this.container.querySelectorAll("*").forEach(function (el) {
        if (el.validationMessage) {
          msg = el.validationMessage;
        }
      });
      return msg;
    }
  }, {
    key: "showValidationError",
    value: function showValidationError() {
      if (this.htmlElement && this.htmlElement.reportValidity) return this.htmlElement.reportValidity();
      return true;
    }
    /**
     * Displays a help text to the user. Pass with empty @msg to hide.
     * @param {String} msg - The message to display
     * @param {Object} options - The options (type: "info|error|invalid")
     * @returns 
     */

  }, {
    key: "showHelp",
    value: function showHelp(msg, options) {
      if (!msg) {
        if (this._error != null) {
          this._error.parentNode.removeChild(this._error);

          this._error = null;
        }

        if (this.container) {
          this.container.removeAttribute('aria-invalid');
          this.container.classList.remove("exf-invalid");
        }

        return;
      }

      options = options || {
        type: "info"
      };

      if (this._error != null) {
        this._error.innerHTML = msg;
        return;
      }

      this._error = _DOM.default.parseHTML("<div class=\"exf-help exf-help-".concat(options.type, "\">").concat(msg, "</div>"));

      if (options.type === "invalid") {
        this.container.setAttribute('aria-invalid', 'true');
        this.container.classList.add('exf-invalid');
      }

      this.container.querySelector(".exf-help-wrapper").appendChild(this._error);
    }
  }]);

  return ExoControlBase;
}();

_defineProperty(ExoControlBase, "returnValueType", undefined);

var ExoElementControl = /*#__PURE__*/function (_ExoControlBase) {
  _inherits(ExoElementControl, _ExoControlBase);

  var _super = _createSuper(ExoElementControl);

  function ExoElementControl(context) {
    var _this3;

    _classCallCheck(this, ExoElementControl);

    _this3 = _super.call(this, context);

    if (context.field.tagName) {
      try {
        _this3.htmlElement = _DOM.default.parseHTML('<' + context.field.tagName + '/>');

        if (_this3.htmlElement.nodeName !== context.field.tagName.toUpperCase()) {
          throw "'" + context.field.tagName + "' is not a valid tagName";
        }

        if (!_this3.isSelfClosing) {
          _this3.acceptProperties({
            name: "html",
            type: String,
            description: "Inner HTML"
          });
        }

        if (_this3.html) {
          _this3.htmlElement.innerHTML = _this3.html;
        }
      } catch (ex) {
        throw "Could not generate '" + context.field.tagName + "' element: " + ex.toString();
      }
    }

    return _this3;
  }

  return ExoElementControl;
}(ExoControlBase);

exports.ExoElementControl = ExoElementControl;

_defineProperty(ExoElementControl, "returnValueType", undefined);

var ExoLinkControl = /*#__PURE__*/function (_ExoElementControl) {
  _inherits(ExoLinkControl, _ExoElementControl);

  var _super2 = _createSuper(ExoLinkControl);

  function ExoLinkControl(context) {
    var _this4;

    _classCallCheck(this, ExoLinkControl);

    _this4 = _super2.call(this, context);
    _this4.htmlElement = document.createElement("a");

    _this4.acceptProperties({
      name: "external",
      type: Boolean,
      description: "External to open in new tab"
    }, {
      name: "html",
      type: String
    });

    return _this4;
  }

  _createClass(ExoLinkControl, [{
    key: "render",
    value: function () {
      var _render2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (this.external) this.htmlElement.setAttribute("target", "_blank");
                return _context2.abrupt("return", _get(_getPrototypeOf(ExoLinkControl.prototype), "render", this).call(this));

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function render() {
        return _render2.apply(this, arguments);
      }

      return render;
    }()
  }]);

  return ExoLinkControl;
}(ExoElementControl);

var ExoInputControl = /*#__PURE__*/function (_ExoElementControl2) {
  _inherits(ExoInputControl, _ExoElementControl2);

  var _super3 = _createSuper(ExoInputControl);

  function ExoInputControl(context) {
    var _this5;

    _classCallCheck(this, ExoInputControl);

    _this5 = _super3.call(this, context);
    _this5.htmlElement = document.createElement('input');
    return _this5;
  }

  _createClass(ExoInputControl, [{
    key: "render",
    value: function () {
      var _render3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var f;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                f = this.context.field;

                if (f.type === "email") {
                  this.createEmailLookup();
                }

                _context3.next = 4;
                return _get(_getPrototypeOf(ExoInputControl.prototype), "render", this).call(this);

              case 4:
                this.testDataList();
                _context3.t0 = this.context.field.type;
                _context3.next = _context3.t0 === "color" ? 8 : _context3.t0 === "hidden" ? 9 : 11;
                break;

              case 8:
                this.container.classList.add("exf-std-lbl");

              case 9:
                this.container.classList.add("exf-hidden");
                return _context3.abrupt("break", 11);

              case 11:
                return _context3.abrupt("return", this.container);

              case 12:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function render() {
        return _render3.apply(this, arguments);
      }

      return render;
    }()
  }, {
    key: "createEmailLookup",
    value: function createEmailLookup() {
      var _ = this;

      _.htmlElement.addEventListener("keyup", function (e) {
        if (e.key !== "Enter") {
          console.log(e.key);
          var data = [];
          ["@gmail.com", "@outlook.com", "@live.nl", "@yahoo.com", "@hotmail.com"].forEach(function (a) {
            data.push(e.target.value.split('@')[0] + a);
          });

          if (data.length > 1) {
            _.createDataList(_.context.field, data);
          } else {
            _.destroyDataList();
          }
        } else {
          var dl = _.container.querySelector("datalist");

          if (dl) {
            dl.remove();
          }

          e.preventDefault();
        }
      });
    }
  }, {
    key: "destroyDataList",
    value: function destroyDataList() {
      var dl = this.container.querySelector("datalist");

      if (dl) {
        dl.remove();
      }
    }
  }, {
    key: "testDataList",
    value: function testDataList() {
      var _ = this;

      var f = _.context.field;

      if (f.lookup) {
        if (Array.isArray(f.lookup)) {
          _.createDataList(f, f.lookup);
        } else {
          var query = function query(q) {
            // TODO: query REST 
            var url = f.lookup.replace(".json", "_" + q + ".json");
            url = new URL(url, _.context.baseUrl);
            fetch(url).then(function (x) {
              return x.json();
            }).then(function (data) {
              1;

              _.createDataList(f, data);
            });
          };

          if (!_Core.default.isValidUrl(f.lookup)) {
            query = _.getFetchLookup(f);
          }

          this.htmlElement.addEventListener("keyup", function (e) {
            query(f._control.htmlElement.value);
          });
        }
      }
    }
  }, {
    key: "getFetchLookup",
    value: function getFetchLookup(f) {
      var _ = this;

      var exo = _.context.exo;
      var o = {
        field: f,
        type: "lookup",
        data: f.lookup,
        callback: function callback(field, data) {
          _.createDataList.call(_, field, data);
        }
      };

      if (o.data.type === "OpenData") {
        // TODO enhance
        return function (q) {
          q = q.substr(0, 1).toUpperCase() + q.substr(1);
          var url = o.data.url + "?$top=20&$filter=substring(" + o.data.field + ",0," + q.length + ") eq '" + q + "'";
          fetch(url).then(function (x) {
            return x.json();
          }).then(function (data) {
            if (data && data.value) {
              o.callback(o.field, data.value.map(function (e) {
                return e.Title;
              }));
            }
          });
        };
      }

      return exo.options.get(o);
    }
  }, {
    key: "createDataList",
    value: function createDataList(f, data) {
      var _ = this;

      var id = f.id;

      f._control.htmlElement.setAttribute("list", "list-" + id);

      var dl = f._control.container.querySelector("datalist");

      if (dl) dl.remove();

      var dataList = _DOM.default.parseHTML(_DOM.default.format(_ExoForm.default.meta.templates.datalist, {
        id: "list-" + id
      }));

      data.forEach(function (el) {
        var o = _objectSpread({
          value: el,
          label: el.name
        }, el);

        dataList.appendChild(_DOM.default.parseHTML(_DOM.default.format(_ExoForm.default.meta.templates.datalistItem, o)));
      });

      f._control.container.appendChild(dataList);
    }
  }]);

  return ExoInputControl;
}(ExoElementControl);

exports.ExoInputControl = ExoInputControl;

_defineProperty(ExoInputControl, "returnValueType", String);

var ExoTextControl = /*#__PURE__*/function (_ExoInputControl) {
  _inherits(ExoTextControl, _ExoInputControl);

  var _super4 = _createSuper(ExoTextControl);

  function ExoTextControl(context) {
    var _this6;

    _classCallCheck(this, ExoTextControl);

    _this6 = _super4.call(this, context);
    _this6.isTextInput = true;
    _this6.htmlElement = _DOM.default.parseHTML('<input type="text"/>');
    return _this6;
  }

  _createClass(ExoTextControl, [{
    key: "render",
    value: function () {
      var _render4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var f;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                f = this.context.field;
                if (!this.attributes.placeholder) this.attributes.placeholder = " "; // forces caption into text input until focus

                _context4.next = 4;
                return _get(_getPrototypeOf(ExoTextControl.prototype), "render", this).call(this);

              case 4:
                if (f.mask) {
                  _DOM.default.maskInput(this.htmlElement, {
                    mask: f.mask,
                    format: f.format
                  });
                }

                return _context4.abrupt("return", this.container);

              case 6:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function render() {
        return _render4.apply(this, arguments);
      }

      return render;
    }()
  }]);

  return ExoTextControl;
}(ExoInputControl);

exports.ExoTextControl = ExoTextControl;

var ExoFormControl = /*#__PURE__*/function (_ExoElementControl3) {
  _inherits(ExoFormControl, _ExoElementControl3);

  var _super5 = _createSuper(ExoFormControl);

  function ExoFormControl(context) {
    var _this7;

    _classCallCheck(this, ExoFormControl);

    _this7 = _super5.call(this, context);
    _this7.htmlElement = _DOM.default.parseHTML('<form />');
    return _this7;
  }

  return ExoFormControl;
}(ExoElementControl);

var ExoDivControl = /*#__PURE__*/function (_ExoElementControl4) {
  _inherits(ExoDivControl, _ExoElementControl4);

  var _super6 = _createSuper(ExoDivControl);

  function ExoDivControl(context) {
    var _this8;

    _classCallCheck(this, ExoDivControl);

    _this8 = _super6.call(this, context);

    _defineProperty(_assertThisInitialized(_this8), "html", "");

    _this8.htmlElement = document.createElement('div');

    _this8.acceptProperties({
      name: "html",
      type: String,
      description: "Inner HTML of the div"
    });

    return _this8;
  }

  _createClass(ExoDivControl, [{
    key: "render",
    value: function () {
      var _render5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (this.html) {
                  this.htmlElement.innerHTML = this.html;
                }

                _context5.next = 3;
                return _get(_getPrototypeOf(ExoDivControl.prototype), "render", this).call(this);

              case 3:
                return _context5.abrupt("return", _context5.sent);

              case 4:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function render() {
        return _render5.apply(this, arguments);
      }

      return render;
    }()
  }]);

  return ExoDivControl;
}(ExoElementControl);

exports.ExoDivControl = ExoDivControl;

var ExoTextAreaControl = /*#__PURE__*/function (_ExoTextControl) {
  _inherits(ExoTextAreaControl, _ExoTextControl);

  var _super7 = _createSuper(ExoTextAreaControl);

  function ExoTextAreaControl(context) {
    var _this9;

    _classCallCheck(this, ExoTextAreaControl);

    _this9 = _super7.call(this, context);

    _defineProperty(_assertThisInitialized(_this9), "autogrow", false);

    _this9.acceptProperties({
      name: "autogrow",
      type: Boolean,
      description: "Use to automatically expand the typing area as you add lines"
    });

    _this9.htmlElement = _DOM.default.parseHTML('<textarea/>');
    return _this9;
  }

  _createClass(ExoTextAreaControl, [{
    key: "setProperties",
    value: function setProperties() {
      _get(_getPrototypeOf(ExoTextAreaControl.prototype), "setProperties", this).call(this);

      if (this.attributes["value"]) {
        this.htmlElement.innerHTML = this.attributes["value"];
        delete this.attributes["value"];
      }
    }
  }, {
    key: "render",
    value: function () {
      var _render6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return _get(_getPrototypeOf(ExoTextAreaControl.prototype), "render", this).call(this);

              case 2:
                if (this.autogrow) {
                  this.htmlElement.setAttribute("onInput", "this.parentNode.dataset.replicatedValue = this.value");
                  this.htmlElement.parentNode.classList.add("autogrow");
                }

                return _context6.abrupt("return", this.container);

              case 4:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function render() {
        return _render6.apply(this, arguments);
      }

      return render;
    }()
  }]);

  return ExoTextAreaControl;
}(ExoTextControl);

var ExoListControl = /*#__PURE__*/function (_ExoElementControl5) {
  _inherits(ExoListControl, _ExoElementControl5);

  var _super8 = _createSuper(ExoListControl);

  //containerTemplate = ExoForm.meta.templates.default;
  function ExoListControl(context) {
    var _this10;

    _classCallCheck(this, ExoListControl);

    _this10 = _super8.call(this, context);

    _defineProperty(_assertThisInitialized(_this10), "isMultiSelect", false);

    _defineProperty(_assertThisInitialized(_this10), "view", "block");

    _this10.htmlElement = _DOM.default.parseHTML('<select></select>');

    _this10.acceptProperties({
      name: "view",
      type: String,
      description: "Set the view mode (list, tiles)"
    });

    return _this10;
  }

  _createClass(ExoListControl, [{
    key: "populateList",
    value: function () {
      var _populateList = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(containerElm, tpl) {
        var _, f, index;

        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _ = this;
                f = _.context.field;

                if (f.items && Array.isArray(f.items)) {
                  index = 0;
                  f.items.forEach(function (i) {
                    _.addListItem(f, i, tpl, containerElm, index);

                    index++;
                  });
                }

              case 3:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function populateList(_x, _x2) {
        return _populateList.apply(this, arguments);
      }

      return populateList;
    }()
  }, {
    key: "addListItem",
    value: function addListItem(f, i, tpl, container, index) {
      var _ = this;

      var dummy = _DOM.default.parseHTML('<span/>');

      container.appendChild(dummy);

      var item = _objectSpread(_objectSpread({}, i), {}, {
        name: typeof i.name === "string" ? i.name : i,
        value: i.value !== undefined ? i.value : i,
        type: _.optionType,
        inputname: f.name,
        checked: i.checked || i.selected ? "checked" : "",
        selected: i.checked || i.selected ? "selected" : "",
        tooltip: (i.tooltip || i.name || "").replace('{{field}}', ''),
        oid: f.id + "_" + index
      });

      var o = {
        field: f,
        control: _,
        item: item
      };

      if (item.element) {
        o.listElement = item.element;

        _DOM.default.replace(dummy, item.element);
      } else if (item.field) {
        // replace item.name with rendered ExoForm control
        this.renderFieldSync(item, tpl, container);
      } else if (item.html) {
        o.listElement = _DOM.default.parseHTML(item.html);

        _DOM.default.replace(dummy, o.listElement);
      } else {
        var s = _DOM.default.format(tpl, item);

        o.listElement = _DOM.default.parseHTML(s);

        _DOM.default.replace(dummy, o.listElement);
      }

      _.context.exo.triggerEvent(_ExoFormFactory.default.events.getListItem, o);
    } // use trick to run async stuff and wait for it.

  }, {
    key: "renderFieldSync",
    value: function renderFieldSync(item, tpl, container) {
      var _this11 = this;

      return function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(item, tpl) {
          var exoContext, e;
          return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
              switch (_context8.prev = _context8.next) {
                case 0:
                  if (item.name.indexOf('{{field}}') === -1) {
                    item.tooltip = item.tooltip || item.name;
                    item.name = item.name + '{{field}}';
                  }

                  exoContext = _this11.context.exo.context;
                  _context8.next = 4;
                  return exoContext.createForm().renderSingleControl(item.field);

                case 4:
                  e = _context8.sent;
                  item.name = _DOM.default.format(item.name, {
                    field: e.outerHTML
                  });
                  container.appendChild(_DOM.default.parseHTML(_DOM.default.format(tpl, item)));

                case 7:
                case "end":
                  return _context8.stop();
              }
            }
          }, _callee8);
        }));

        return function (_x3, _x4) {
          return _ref.apply(this, arguments);
        };
      }()(item, tpl); //So we defined and immediately called this async function.
    }
  }, {
    key: "render",
    value: function () {
      var _render7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
        var elm;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.next = 2;
                return _get(_getPrototypeOf(ExoListControl.prototype), "render", this).call(this);

              case 2:
                elm = _context9.sent;
                _context9.t0 = this.view;
                _context9.next = _context9.t0 === "tiles" ? 6 : _context9.t0 === "list" ? 8 : 10;
                break;

              case 6:
                elm.classList.add("tiles");
                return _context9.abrupt("break", 12);

              case 8:
                elm.classList.add("list");
                return _context9.abrupt("break", 12);

              case 10:
                elm.classList.add("block");
                return _context9.abrupt("break", 12);

              case 12:
                return _context9.abrupt("return", elm);

              case 13:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function render() {
        return _render7.apply(this, arguments);
      }

      return render;
    }()
  }]);

  return ExoListControl;
}(ExoElementControl);

exports.ExoListControl = ExoListControl;

var ExoDropdownListControl = /*#__PURE__*/function (_ExoListControl) {
  _inherits(ExoDropdownListControl, _ExoListControl);

  var _super9 = _createSuper(ExoDropdownListControl);

  function ExoDropdownListControl(context) {
    var _this12;

    _classCallCheck(this, ExoDropdownListControl);

    _this12 = _super9.call(this, context);
    var tpl = "<div class=\"{{class}}\" {{required}}>{{inner}}</div>";
    _this12.htmlElement = _DOM.default.parseHTML(
    /*html*/
    "<select size=\"1\"></select>");
    return _this12;
  }

  _createClass(ExoDropdownListControl, [{
    key: "render",
    value: function () {
      var _render8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
        var f, tpl;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                f = this.context.field;
                tpl =
                /*html*/
                "<option class=\"{{class}}\" {{selected}} value=\"{{value}}\">{{name}}</option>";
                _context10.next = 4;
                return this.populateList(this.htmlElement, tpl);

              case 4:
                _context10.next = 6;
                return _get(_getPrototypeOf(ExoDropdownListControl.prototype), "render", this).call(this);

              case 6:
                this.container.classList.add("exf-input-group", "exf-std-lbl");
                return _context10.abrupt("return", this.container);

              case 8:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function render() {
        return _render8.apply(this, arguments);
      }

      return render;
    }()
  }]);

  return ExoDropdownListControl;
}(ExoListControl);

var ExoInputListControl = /*#__PURE__*/function (_ExoListControl2) {
  _inherits(ExoInputListControl, _ExoListControl2);

  var _super10 = _createSuper(ExoInputListControl);

  function ExoInputListControl(context) {
    var _this13;

    _classCallCheck(this, ExoInputListControl);

    _this13 = _super10.call(this, context);
    var tpl = "<div data-evtarget=\"true\" class=\"{{class}}\" {{required}}>{{inner}}</div>";
    _this13.htmlElement = _DOM.default.parseHTML(_DOM.default.format(tpl, {
      class: [_this13.context.field.class || ""].join(' ')
    }));
    return _this13;
  }

  _createClass(ExoInputListControl, [{
    key: "render",
    value: function () {
      var _render9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
        var f, tpl;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                f = this.context.field;
                tpl =
                /*html*/
                "<div class=\"exf-ilc-cnt\" title=\"{{tooltip}}\">\n            <input class=\"{{class}}\" {{checked}} name=\"{{inputname}}\" value=\"{{value}}\" type=\"{{type}}\" id=\"{{oid}}\" />\n            <label for=\"{{oid}}\" class=\"exf-caption\">\n                <div class=\"exf-caption-main\">{{name}}</div>\n                <div title=\"{{description}}\" class=\"exf-caption-description\">{{description}}</div>\n            </label>\n        </div>";
                _context11.next = 4;
                return this.populateList(this.htmlElement, tpl);

              case 4:
                _context11.next = 6;
                return _get(_getPrototypeOf(ExoInputListControl.prototype), "render", this).call(this);

              case 6:
                this.container.classList.add("exf-input-group", "exf-std-lbl");
                return _context11.abrupt("return", this.container);

              case 8:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function render() {
        return _render9.apply(this, arguments);
      }

      return render;
    }()
  }, {
    key: "valid",
    get: function get() {
      if (this.context.field.required) {
        var numChecked = this.container.querySelectorAll("input:checked").length;

        if (numChecked === 0) {
          var inp = this.container.querySelector("input");

          try {
            inp.setCustomValidity(this.getValidationMessage());
            inp.reportValidity();
          } catch (_unused2) {}

          ;
          return false;
        }
      }

      return true;
    }
  }, {
    key: "value",
    get: function get() {
      return _DOM.default.getValue(this.htmlElement.querySelector("[name]"));
    },
    set: function set(data) {
      var inp = this.htmlElement.querySelector("[name]");
      if (inp) inp.value = data;
    } // Used to get localized standard validation message 

  }, {
    key: "getValidationMessage",
    value: function getValidationMessage() {
      var msg = "You must select a value",
          testFrm = _DOM.default.parseHTML('<form><input name="test" required /></form');

      testFrm.querySelector("input").addEventListener("invalid", function (e) {
        msg = e.validationMessage;
        e.preventDefault();
      });
      testFrm.submit();
      return msg;
    }
  }, {
    key: "showValidationError",
    value: function showValidationError() {
      this.htmlElement.querySelector("input").setCustomValidity('This cannot be empty');
    }
  }, {
    key: "validationMessage",
    get: function get() {
      return this.htmlElement.querySelector("input").validationMessage;
    }
  }]);

  return ExoInputListControl;
}(ExoListControl);

var ExoRadioButtonListControl = /*#__PURE__*/function (_ExoInputListControl) {
  _inherits(ExoRadioButtonListControl, _ExoInputListControl);

  var _super11 = _createSuper(ExoRadioButtonListControl);

  function ExoRadioButtonListControl(context) {
    var _this14;

    _classCallCheck(this, ExoRadioButtonListControl);

    _this14 = _super11.call(this, context);

    _defineProperty(_assertThisInitialized(_this14), "optionType", "radio");

    return _this14;
  }

  _createClass(ExoRadioButtonListControl, [{
    key: "value",
    get: function get() {
      var inp = this.htmlElement.querySelector("[name]:checked");
      return inp ? inp.value : "";
    },
    set: function set(data) {
      var inp = this.htmlElement.querySelectorAll("[name]").forEach(function (el) {
        if (el.value == data) el.checked = true;
      });
    }
  }]);

  return ExoRadioButtonListControl;
}(ExoInputListControl);

var ExoCheckboxListControl = /*#__PURE__*/function (_ExoInputListControl2) {
  _inherits(ExoCheckboxListControl, _ExoInputListControl2);

  var _super12 = _createSuper(ExoCheckboxListControl);

  function ExoCheckboxListControl() {
    var _this15;

    _classCallCheck(this, ExoCheckboxListControl);

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    _this15 = _super12.call.apply(_super12, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this15), "optionType", "checkbox");

    return _this15;
  }

  _createClass(ExoCheckboxListControl, [{
    key: "value",
    get: function get() {
      var ar = [];
      this.container.querySelectorAll(":checked").forEach(function (i) {
        ar.push(i.value);
      });
      return ar;
    } //TODO
    ,
    set: function set(data) {
      //debugger;
      this.container.querySelectorAll("[name]").forEach(function (i) {});
    }
  }]);

  return ExoCheckboxListControl;
}(ExoInputListControl);

_defineProperty(ExoCheckboxListControl, "returnValueType", Array);

var ExoCheckboxControl = /*#__PURE__*/function (_ExoCheckboxListContr) {
  _inherits(ExoCheckboxControl, _ExoCheckboxListContr);

  var _super13 = _createSuper(ExoCheckboxControl);

  function ExoCheckboxControl(context) {
    var _this16;

    _classCallCheck(this, ExoCheckboxControl);

    _this16 = _super13.call(this, context);

    _defineProperty(_assertThisInitialized(_this16), "text", "");

    _this16.acceptProperties({
      name: "text",
      description: "Text to display on checkbox label"
    });

    context.field.items = [{
      name: _this16.text || context.field.caption,
      value: true,
      checked: context.field.value,
      tooltip: context.field.tooltip || ""
    }];
    return _this16;
  }

  _createClass(ExoCheckboxControl, [{
    key: "render",
    value: function () {
      var _render10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                if (!this.text) {
                  this.context.field.caption = "";
                } else {
                  this.context.field.class = ((this.context.field.class || "") + " exf-std-lbl").trim();
                }

                _context12.next = 3;
                return _get(_getPrototypeOf(ExoCheckboxControl.prototype), "render", this).call(this);

              case 3:
                return _context12.abrupt("return", this.container);

              case 4:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function render() {
        return _render10.apply(this, arguments);
      }

      return render;
    }()
  }, {
    key: "value",
    get: function get() {
      return this.container.querySelector(":checked") ? true : false;
    },
    set: function set(data) {
      this.container.querySelector("[name]").checked = data;
    }
  }]);

  return ExoCheckboxControl;
}(ExoCheckboxListControl);

_defineProperty(ExoCheckboxControl, "returnValueType", Boolean);

var ExoButtonControl = /*#__PURE__*/function (_ExoElementControl6) {
  _inherits(ExoButtonControl, _ExoElementControl6);

  var _super14 = _createSuper(ExoButtonControl);

  function ExoButtonControl(context) {
    var _this17;

    _classCallCheck(this, ExoButtonControl);

    _this17 = _super14.call(this, context);
    _this17.iconHtml = "";
    _this17.htmlElement = _DOM.default.parseHTML('<button class="exf-btn" />');

    _this17.acceptProperties({
      name: "icon",
      description: "Icon class to be used (using a span)"
    }, {
      name: "click",
      description: "Click method"
    }, {
      name: "action",
      description: "Possible values: \n                    - 'next' (next page in Wizard)\n                    - 'reset' (back to first page)\n                    - 'goto:[page]' (jump to given page)\n                "
    });

    return _this17;
  }

  _createClass(ExoButtonControl, [{
    key: "render",
    value: function () {
      var _render11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
        var _, elm;

        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                _ = this;
                _context13.next = 3;
                return _get(_getPrototypeOf(ExoButtonControl.prototype), "render", this).call(this);

              case 3:
                if (_.icon) {
                  _.htmlElement.appendChild(_DOM.default.parseHTML('<span class="' + _.icon + '"></span>'));

                  this.htmlElement.appendChild(document.createTextNode(' '));
                }

                _.htmlElement.appendChild(_DOM.default.parseHTML("<span class=\"exf-caption\">".concat(this.context.field.caption, "</span>")));

                _context13.next = 7;
                return _get(_getPrototypeOf(ExoButtonControl.prototype), "render", this).call(this);

              case 7:
                elm = _context13.sent;

                _.htmlElement.addEventListener("click", function (e) {
                  if (_.click) {
                    var data = _.context.exo.getFormValues();

                    var f = _.click;

                    if (typeof f !== "function") {
                      f = _.context.exo.options.customMethods[f];
                    }

                    if (typeof f !== "function") {
                      if (_.context.exo.options.host) {
                        if (typeof _.context.exo.options.host[_.click] === "function") {
                          f = _.context.exo.options.host[_.click];
                          f.apply(_.context.exo.options.host, [data, e]);
                          return;
                        }
                      } else {
                        throw "Not a valid function: " + _.click;
                      }
                    }

                    f.apply(_, [data, e]);
                  } else if (_.action) {
                    var actionParts = _.action.split(":");

                    switch (actionParts[0]) {
                      case "next":
                        _.context.exo.addins.navigation.nextPage();

                        break;

                      case "reset":
                        _.context.exo.addins.navigation.goto(1);

                        break;

                      case "goto":
                        _.context.exo.addins.navigation.goto(parseInt(actionParts[1]));

                        break;
                    }
                  }
                });

                this.container.classList.add("exf-btn-cnt");
                this.htmlElement.classList.add("exf-btn");
                return _context13.abrupt("return", this.container);

              case 12:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function render() {
        return _render11.apply(this, arguments);
      }

      return render;
    }()
  }, {
    key: "icon",
    get: function get() {
      return this._icon;
    },
    set: function set(value) {
      this._icon = value;
    }
  }]);

  return ExoButtonControl;
}(ExoElementControl);

var ExoNumberControl = /*#__PURE__*/function (_ExoInputControl2) {
  _inherits(ExoNumberControl, _ExoInputControl2);

  var _super15 = _createSuper(ExoNumberControl);

  function ExoNumberControl(context) {
    var _this18;

    _classCallCheck(this, ExoNumberControl);

    _this18 = _super15.call(this, context);

    _defineProperty(_assertThisInitialized(_this18), "buttons", false);

    _this18.context.field.type = "number";

    _this18.acceptProperties({
      name: "buttons",
      description: "Add plus and minus buttons",
      type: Boolean
    });

    return _this18;
  }

  _createClass(ExoNumberControl, [{
    key: "render",
    value: function () {
      var _render12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
        var _this19 = this;

        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                _context14.next = 2;
                return _get(_getPrototypeOf(ExoNumberControl.prototype), "render", this).call(this);

              case 2:
                if (this.buttons) {
                  this.minusButton = document.createElement("button");
                  this.minusButton.innerText = "-";
                  this.minusButton.classList.add("nmbr-m");
                  this.plusButton = document.createElement("button");
                  this.plusButton.innerText = "+";
                  this.plusButton.classList.add("nmbr-p");
                  this.htmlElement.parentNode.insertBefore(this.minusButton, this.htmlElement);
                  this.htmlElement.parentNode.insertBefore(this.plusButton, this.htmlElement.nextSibling);
                  this.container.classList.add("exf-nmbr-btns");
                  this.container.classList.add("exf-std-lbl");
                  this.container.addEventListener("click", function (e) {
                    e.cancelBubble = true;
                    e.preventDefault();
                    var step = parseInt("0" + _this19.htmlElement.step) || 1;

                    if (e.target === _this19.plusButton) {
                      if (_this19.htmlElement.max === "" || parseInt(_this19.htmlElement.value) < parseInt(_this19.htmlElement.max)) {
                        _this19.htmlElement.value = parseInt("0" + (_this19.htmlElement.value || (_this19.htmlElement.min != "" ? _this19.htmlElement.min - 1 : -1))) + step;
                      }
                    } else if (e.target === _this19.minusButton) {
                      if (_this19.htmlElement.min === "" || parseInt(_this19.htmlElement.value) > parseInt(_this19.htmlElement.min)) {
                        _this19.htmlElement.value = parseInt("0" + (_this19.htmlElement.value || (_this19.htmlElement.max != "" ? _this19.htmlElement.max - 1 : 1))) - step;
                      }
                    }

                    _this19.triggerChange();
                  });
                }

                return _context14.abrupt("return", this.container);

              case 4:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function render() {
        return _render12.apply(this, arguments);
      }

      return render;
    }()
  }]);

  return ExoNumberControl;
}(ExoInputControl);

exports.ExoNumberControl = ExoNumberControl;

_defineProperty(ExoNumberControl, "returnValueType", Number);

var ExoRangeControl = /*#__PURE__*/function (_ExoNumberControl) {
  _inherits(ExoRangeControl, _ExoNumberControl);

  var _super16 = _createSuper(ExoRangeControl);

  function ExoRangeControl(context) {
    var _this20;

    _classCallCheck(this, ExoRangeControl);

    _this20 = _super16.call(this, context);

    _defineProperty(_assertThisInitialized(_this20), "showoutput", false);

    _this20.context.field.type = "range";

    _this20.acceptProperties({
      name: "showoutput",
      type: Boolean
    });

    return _this20;
  }

  _createClass(ExoRangeControl, [{
    key: "render",
    value: function () {
      var _render13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                _context15.next = 2;
                return _get(_getPrototypeOf(ExoRangeControl.prototype), "render", this).call(this);

              case 2:
                if (this.showoutput) {
                  this.output = document.createElement("output");
                  this.htmlElement.parentNode.insertBefore(this.output, this.htmlElement.nextSibling);
                  this.htmlElement.addEventListener("input", this._sync);

                  this._sync();

                  this.container.classList.add("exf-rng-output");
                } // force outside label rendering


                this.container.classList.add("exf-std-lbl");
                return _context15.abrupt("return", this.container);

              case 5:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function render() {
        return _render13.apply(this, arguments);
      }

      return render;
    }()
  }, {
    key: "_sync",
    value: function _sync() {
      if (this.output && this.htmlElement) this.output.value = this.htmlElement.value;
    }
  }, {
    key: "value",
    set: function set(data) {
      _set(_getPrototypeOf(ExoRangeControl.prototype), "value", data, this, true);

      if (this.showoutput) this._sync();
    }
  }]);

  return ExoRangeControl;
}(ExoNumberControl);

exports.ExoRangeControl = ExoRangeControl;

_defineProperty(ExoRangeControl, "returnValueType", Number);

var ExoProgressControl = /*#__PURE__*/function (_ExoElementControl7) {
  _inherits(ExoProgressControl, _ExoElementControl7);

  var _super17 = _createSuper(ExoProgressControl);

  function ExoProgressControl(context) {
    var _this21;

    _classCallCheck(this, ExoProgressControl);

    _this21 = _super17.call(this, context);
    _this21.htmlElement = _DOM.default.parseHTML('<progress />');
    return _this21;
  }

  return ExoProgressControl;
}(ExoElementControl);

var ExoFormPageControl = /*#__PURE__*/function (_ExoDivControl) {
  _inherits(ExoFormPageControl, _ExoDivControl);

  var _super18 = _createSuper(ExoFormPageControl);

  function ExoFormPageControl(context) {
    var _this22;

    _classCallCheck(this, ExoFormPageControl);

    _this22 = _super18.call(this, context);
    _this22._relevant = true;
    _this22._previouslyRelevant = true;

    _this22.acceptProperties({
      name: "relevant",
      description: "Specifies whether the page is currently relevant/in scope",
      type: Boolean
    });

    return _this22;
  }

  _createClass(ExoFormPageControl, [{
    key: "render",
    value: function () {
      var _render14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16() {
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                _context16.next = 2;
                return _get(_getPrototypeOf(ExoFormPageControl.prototype), "render", this).call(this);

              case 2:
                this._setRelevantState();

                return _context16.abrupt("return", this.container);

              case 4:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function render() {
        return _render14.apply(this, arguments);
      }

      return render;
    }()
  }, {
    key: "relevant",
    get: function get() {
      return this._relevant;
    },
    set: function set(value) {
      if (value !== this._previouslyRelevant) {
        this._relevant = value;

        if (this.container) {
          this._setRelevantState();
        }

        this._previouslyRelevant = this._relevant;
      }
    }
  }, {
    key: "_setRelevantState",
    value: function _setRelevantState() {
      if (this.relevant) {
        this.container.removeAttribute("data-skip");
      } else {
        console.debug("ExoFormBaseControls: page", this.index, "not relevant");
        this.container.setAttribute("data-skip", "true");
      }

      this.context.exo.triggerEvent(_ExoFormFactory.default.events.pageRelevancyChange, {
        index: this.index,
        relevant: this.relevant
      });
    }
  }, {
    key: "finalize",
    value: function finalize() {}
  }]);

  return ExoFormPageControl;
}(ExoDivControl);

var ExoFieldSetControl = /*#__PURE__*/function (_ExoFormPageControl) {
  _inherits(ExoFieldSetControl, _ExoFormPageControl);

  var _super19 = _createSuper(ExoFieldSetControl);

  function ExoFieldSetControl(context) {
    var _this23;

    _classCallCheck(this, ExoFieldSetControl);

    _this23 = _super19.call(this, context);
    _this23._index = context.field.index;

    _this23.acceptProperties({
      name: "legend",
      description: "The legend of the page",
      type: String
    }, {
      name: "intro",
      description: "The intro of the page",
      type: String
    }, {
      name: "index",
      description: "Number of the page (1-based)",
      type: Number
    });

    _this23.htmlElement = _DOM.default.parseHTML("<fieldset class=\"exf-cnt exf-page\"></fieldset>");

    if (_this23.legend) {
      _this23.appendChild(_DOM.default.parseHTML(_DOM.default.format(_ExoForm.default.meta.templates.legend, {
        legend: _this23.legend
      })));
    }

    if (_this23.intro) {
      _this23.appendChild(_DOM.default.parseHTML(_DOM.default.format(_ExoForm.default.meta.templates.pageIntro, {
        intro: _this23.intro
      })));
    }

    return _this23;
  }

  _createClass(ExoFieldSetControl, [{
    key: "index",
    get: function get() {
      return this._index;
    },
    set: function set(value) {
      if (typeof value !== "number") throw "Page index must be a number";
      if (value < 1 || value > this.context.exo.schema.pages.length) throw "Invalid page index";
      this._index = value;
    }
  }, {
    key: "render",
    value: function () {
      var _render15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17() {
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                _context17.next = 2;
                return _get(_getPrototypeOf(ExoFieldSetControl.prototype), "render", this).call(this);

              case 2:
                if (this.index === this.context.exo.addins.navigation.currentPage) {
                  this.htmlElement.classList.add("active");
                }

                this.htmlElement.setAttribute("data-page", this.index);
                return _context17.abrupt("return", this.container);

              case 5:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));

      function render() {
        return _render15.apply(this, arguments);
      }

      return render;
    }()
  }]);

  return ExoFieldSetControl;
}(ExoFormPageControl); //#endregion


var ExoBaseControls = function ExoBaseControls() {
  _classCallCheck(this, ExoBaseControls);
};

_defineProperty(ExoBaseControls, "controls", {
  base: {
    hidden: true,
    type: ExoControlBase
  },
  element: {
    type: ExoElementControl,
    note: "Any raw HTML Element",
    demo: {
      type: "element",
      tagName: "img",
      src: "https://source.unsplash.com/random/600x400"
    }
  },
  input: {
    hidden: true,
    type: ExoInputControl
  },
  div: {
    hidden: true,
    type: ExoDivControl,
    note: "A standard HTML div container element",
    demo: {
      html: "<h3>Wow!</h3>"
    }
  },
  form: {
    hidden: true,
    type: ExoFormControl
  },
  formpage: {
    hidden: true,
    type: ExoFormPageControl
  },
  fieldset: {
    hidden: true,
    for: "page",
    type: ExoFieldSetControl,
    note: "A fieldset for grouping controls in a form"
  },
  text: {
    caption: "Short text",
    type: ExoTextControl,
    note: "Standard text input"
  },
  url: {
    caption: "Website Address/URL",
    base: "text",
    note: "A text input that will accept URLs only"
  },
  tel: {
    caption: "Phone number",
    base: "input",
    note: "A text input that is used to input phone numbers",
    demo: {
      value: "06 23467899"
    }
  },
  number: {
    caption: "Numeric Control",
    type: ExoNumberControl,
    note: "A text input that is used to input phone numbers",
    demo: {
      min: 1,
      max: 99
    }
  },
  range: {
    caption: "Range Slider",
    type: ExoRangeControl,
    note: "A range slider input",
    demo: {
      min: 1,
      max: 10,
      value: 5
    }
  },
  color: {
    caption: "Color Input",
    base: "input",
    note: "A control to select a color",
    demo: {
      value: "#cc4433"
    }
  },
  checkbox: {
    type: ExoCheckboxControl,
    note: "A checkbox",
    demo: {
      checked: true
    }
  },
  email: {
    caption: "Email Address",
    base: "text",
    note: "A text input that validates email addresses",
    demo: {
      required: true
    }
  },
  date: {
    base: "input",
    note: "A date input that is used to input phone numbers"
  },
  month: {
    base: "input",
    note: "A month selector input"
  },
  "datetime-local": {
    caption: "Local Date &amp; Time selector",
    base: "input",
    note: "A date input that is used to input local date/time"
  },
  search: {
    base: "text",
    note: "A search text input with a clear button"
  },
  password: {
    base: "text",
    note: "A text input for password masking"
  },
  file: {
    caption: "File upload",
    base: "text",
    note: "A standard file upload control"
  },
  multiline: {
    caption: "Long text",
    type: ExoTextAreaControl,
    alias: "textarea",
    note: "A multi-line text input"
  },
  list: {
    hidden: true,
    type: ExoListControl
  },
  dropdown: {
    type: ExoDropdownListControl,
    alias: "select",
    note: "A dropdown list control",
    demo: {
      items: ["First", "Second"]
    }
  },
  checkboxlist: {
    caption: "Multiselect List (checkbox)",
    type: ExoCheckboxListControl,
    note: "A group of checkboxes to select multiple items",
    demo: {
      items: ["First", "Second"]
    }
  },
  radiobuttonlist: {
    caption: "Single select List (radio)",
    type: ExoRadioButtonListControl,
    note: "A group of radio buttons to select a single value from",
    demo: {
      items: ["First", "Second"]
    }
  },
  hidden: {
    base: "input",
    note: "A hidden input that is used to store variables"
  },
  custom: {
    hidden: true,
    base: "div",
    note: "A custom control that is used to render your own ExoFormControl classes"
  },
  button: {
    type: ExoButtonControl,
    note: "A button control",
    demo: {
      caption: "Click me"
    }
  },
  time: {
    caption: "Time selector",
    base: "text",
    note: "A time input control"
  },
  progressbar: {
    type: ExoProgressControl,
    alias: "progress",
    note: "A progress indicator control"
  },
  link: {
    type: ExoLinkControl,
    note: "HTML Anchor element"
  }
});

var _default = ExoBaseControls;
exports.default = _default;
},{"./ExoFormFactory":"src/exo/ExoFormFactory.js","./ExoForm":"src/exo/ExoForm.js","../pwa/Core":"src/pwa/Core.js","../pwa/DOM":"src/pwa/DOM.js"}],"src/exo/ExoExtendedControls.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ExoBaseControls = _interopRequireDefault(require("./ExoBaseControls"));

var _ExoFormFactory = _interopRequireDefault(require("./ExoFormFactory"));

var _ExoForm = _interopRequireDefault(require("./ExoForm"));

var _Core = _interopRequireDefault(require("../pwa/Core"));

var _DOM = _interopRequireDefault(require("../pwa/DOM"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ExoFileDropControl = /*#__PURE__*/function (_ExoBaseControls$cont) {
  _inherits(ExoFileDropControl, _ExoBaseControls$cont);

  var _super = _createSuper(ExoFileDropControl);

  function ExoFileDropControl(context) {
    var _this;

    _classCallCheck(this, ExoFileDropControl);

    _this = _super.call(this, context);

    _defineProperty(_assertThisInitialized(_this), "height", 120);

    _this.acceptProperties({
      name: "maxSize"
    }, {
      name: "max",
      type: Number,
      description: "Max number of files accepted"
    }, {
      name: "fileTypes",
      type: String | Array,
      description: 'Array of strings - example: ["image/"]'
    }, {
      name: "maxSize",
      type: Number,
      description: "Maximum filesize of files to be uploaded (in bytes) - example: 4096000"
    }, {
      name: "height",
      type: Number,
      description: "Height of drop area"
    });

    return _this;
  }

  _createClass(ExoFileDropControl, [{
    key: "render",
    value: function () {
      var _render = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _ = this;
                _.field = _.context.field;
                _.field.type = "file";
                _.field.data = this.field.data || [];
                _context.next = 6;
                return _get(_getPrototypeOf(ExoFileDropControl.prototype), "render", this).call(this);

              case 6:
                _.previewDiv = _DOM.default.parseHTML("<div class=\"file-preview clearable\"></div>");
                _.previewDiv.style.height = "".concat(this.height, "px");

                _.container.querySelector(".exf-ctl").appendChild(_.previewDiv);

                _.container.classList.add("exf-filedrop");

                _.bindEvents(function (data) {
                  if (!data.error) {
                    var thumb = _DOM.default.parseHTML('<div data-id="' + data.fileName + '" class="thumb ' + data.type.replace('/', ' ') + '"></div>');

                    var close = _DOM.default.parseHTML('<button title="Remove" type="button" class="close">x</button>');

                    close.addEventListener("click", function (e) {
                      var thumb = e.target.closest(".thumb");
                      var id = thumb.getAttribute("data-id");
                      var index = Array.from(_.previewDiv.children).indexOf(thumb);
                      thumb.remove();
                      _.field.data = _.field.data.filter(function (item) {
                        return item.fileName !== id;
                      });

                      _._change();
                    });
                    thumb.appendChild(close);
                    thumb.setAttribute("title", data.fileName);

                    var img = _DOM.default.parseHTML('<div class="thumb-data"></div>');

                    if (data.type.startsWith("image/")) {
                      thumb.classList.add("image");
                      img.style.backgroundImage = 'url("' + _.getDataUrl(data.b64, data.type) + '")';
                    } else {
                      thumb.classList.add("no-img");
                    }

                    thumb.appendChild(img);
                    thumb.appendChild(_DOM.default.parseHTML('<figcaption>' + data.fileName + '</figcaption>'));

                    _.previewDiv.appendChild(thumb);
                  } else {
                    _.showHelp(data.error, {
                      type: "error"
                    });
                  }
                });

                return _context.abrupt("return", _.container);

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function render() {
        return _render.apply(this, arguments);
      }

      return render;
    }()
  }, {
    key: "value",
    get: function get() {
      return this.context.field.data.sort();
    },
    set: function set(data) {// TODO 
    }
  }, {
    key: "_change",
    value: function _change() {
      _DOM.default.trigger(this.htmlElement, "change", {
        data: this.context.field.data
      });
    }
  }, {
    key: "bindEvents",
    value: function bindEvents(cb) {
      var _ = this;

      var loadFile = function loadFile(data) {
        var file = data.file;

        _.showHelp();

        var reader = new FileReader();

        reader.onload = function () {
          var returnValue = {
            error: "",
            fileName: data.file.name,
            type: data.file.type,
            size: data.file.size,
            date: data.file.lastModifiedDate
          };

          if (_.field.max) {
            if (_.field.data.length >= _.field.max) {
              returnValue.error = "Maximum number of attachements reached";
            }
          }

          if (_.field.fileTypes) {
            var found = false;

            _.field.fileTypes.forEach(function (t) {
              if (data.file.type.indexOf(t) === 0) found = true;
            });

            if (!found) {
              returnValue.error = "Invalid file type";
            }
          }

          if (!returnValue.error && _.field.maxSize) {
            if (data.file.size > _.field.maxSize) {
              returnValue.error = "Max size exceeded";
            }
          }

          if (!returnValue.error) {
            returnValue.b64 = btoa(reader.result);
          }

          if (!returnValue.error) {
            _.field.data.push(returnValue);

            _._change();
          }

          cb(returnValue);
        };

        try {
          reader.readAsBinaryString(file);
        } catch (_unused) {}
      };

      var dropArea = _.htmlElement.closest(".exf-ctl-cnt");

      var uf = function uf(e) {
        if (!e.detail) {
          e.stopImmediatePropagation();
          e.cancelBubble = true;
          e.preventDefault();
          e.stopPropagation();
          e.returnValue = false;
          dropArea.classList.remove("drag-over");

          for (var i in e.target.files) {
            loadFile({
              file: e.target.files[i]
            });
          }

          return false;
        }
      };

      _.htmlElement.addEventListener("change", uf);

      dropArea.addEventListener('dragover', function (e) {
        e.dataTransfer.dropEffect = 'copy';
        dropArea.classList.add("drag-over");
      });
      dropArea.addEventListener('drop', function (e) {
        e.dataTransfer.dropEffect = 'none';
        dropArea.classList.remove("drag-over");
      });
      dropArea.addEventListener('dragleave', function (e) {
        e.dataTransfer.dropEffect = 'none';
        dropArea.classList.remove("drag-over");
      });
    }
  }, {
    key: "getDataUrl",
    value: function getDataUrl(b64, fileType) {
      return "data:" + fileType + ";base64," + b64;
    }
  }, {
    key: "valid",
    get: function get() {
      return this.htmlElement, checkValidity();
    }
  }]);

  return ExoFileDropControl;
}(_ExoBaseControls.default.controls.input.type);

var ExoCKRichEditor = /*#__PURE__*/function (_ExoBaseControls$cont2) {
  _inherits(ExoCKRichEditor, _ExoBaseControls$cont2);

  var _super2 = _createSuper(ExoCKRichEditor);

  function ExoCKRichEditor(context) {
    var _this2;

    _classCallCheck(this, ExoCKRichEditor);

    _this2 = _super2.call(this, context);
    _this2.htmlElement.data = {};
    return _this2;
  }

  _createClass(ExoCKRichEditor, [{
    key: "value",
    get: function get() {
      return this.htmlElement.data.editor.getData();
    },
    set: function set(data) {
      this.htmlElement.data.editor.setData(data);
    }
  }, {
    key: "render",
    value: function () {
      var _render2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var _, me;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _ = this;
                _context2.next = 3;
                return _get(_getPrototypeOf(ExoCKRichEditor.prototype), "render", this).call(this);

              case 3:
                me = _.htmlElement;
                return _context2.abrupt("return", new Promise(function (resolve, reject) {
                  _DOM.default.require("https://cdn.ckeditor.com/ckeditor5/17.0.0/classic/ckeditor.js", function () {
                    ClassicEditor.create(_.htmlElement).catch(function (error) {
                      console.error(error);
                    }).then(function (ck) {
                      _.htmlElement.data["editor"] = ck;
                    });
                    resolve(_.container);
                  });
                }));

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function render() {
        return _render2.apply(this, arguments);
      }

      return render;
    }()
  }]);

  return ExoCKRichEditor;
}(_ExoBaseControls.default.controls.div.type);

var ExoSwitchControl = /*#__PURE__*/function (_ExoBaseControls$cont3) {
  _inherits(ExoSwitchControl, _ExoBaseControls$cont3);

  var _super3 = _createSuper(ExoSwitchControl);

  function ExoSwitchControl() {
    _classCallCheck(this, ExoSwitchControl);

    return _super3.apply(this, arguments);
  }

  _createClass(ExoSwitchControl, [{
    key: "setProperties",
    value: function setProperties() {
      this.context.field.min = 0;
      this.context.field.max = 1;
      this.context.field.value = this.context.field.value || 0;

      _get(_getPrototypeOf(ExoSwitchControl.prototype), "setProperties", this).call(this);

      this.context.field.type = "switch";
    }
  }, {
    key: "render",
    value: function () {
      var _render3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var _, e, check;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _ = this;
                _context3.next = 3;
                return _get(_getPrototypeOf(ExoSwitchControl.prototype), "render", this).call(this);

              case 3:
                e = _context3.sent;
                this.container.classList.add("exf-switch"); // force outside label rendering

                this.container.classList.add("exf-std-lbl");

                check = function check(e) {
                  var sw = e.target.closest(".exf-switch");
                  var range = sw.querySelector("[type='range']");
                  sw.classList[range.value === "1" ? "add" : "remove"]("on");

                  _.triggerChange();
                };

                check({
                  target: e
                }); // if (this.context.field.disabled)
                //     this.enabled = false;

                e.addEventListener("click", function (e) {
                  e.stopImmediatePropagation();
                  e.cancelBubble = true;
                  e.preventDefault();
                  e.stopPropagation();
                  e.returnValue = false;
                  var range = e.target.closest(".exf-switch").querySelector("[type='range']");

                  if (e.target.tagName != "INPUT") {
                    range.value = range.value == "0" ? 1 : 0;
                    check({
                      target: range
                    });
                  }

                  check({
                    target: range
                  });
                });
                return _context3.abrupt("return", this.container);

              case 10:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function render() {
        return _render3.apply(this, arguments);
      }

      return render;
    }()
  }]);

  return ExoSwitchControl;
}(_ExoBaseControls.default.controls.range.type);

_defineProperty(ExoSwitchControl, "returnValueType", Boolean);

var ExoTaggingControl = /*#__PURE__*/function (_ExoBaseControls$cont4) {
  _inherits(ExoTaggingControl, _ExoBaseControls$cont4);

  var _super4 = _createSuper(ExoTaggingControl);

  // Initialize elements
  function ExoTaggingControl(context) {
    var _this3;

    _classCallCheck(this, ExoTaggingControl);

    _this3 = _super4.call(this, context);

    _defineProperty(_assertThisInitialized(_this3), "max", null);

    _defineProperty(_assertThisInitialized(_this3), "duplicate", false);

    _defineProperty(_assertThisInitialized(_this3), "wrapperClass", 'exf-tags-input');

    _defineProperty(_assertThisInitialized(_this3), "tagClass", 'tag');

    _defineProperty(_assertThisInitialized(_this3), "arr", []);

    _this3.acceptProperties({
      name: "max",
      type: Number,
      description: "Maximum number of tags allowed"
    }, {
      name: "duplicate",
      type: Boolean,
      description: "Allow duplicates. Default false"
    }, {
      name: "tags",
      description: "Tag names to set (array)"
    });

    return _this3;
  }

  _createClass(ExoTaggingControl, [{
    key: "render",
    value: function () {
      var _render4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var _;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _ = this;
                _context4.next = 3;
                return _get(_getPrototypeOf(ExoTaggingControl.prototype), "render", this).call(this);

              case 3:
                _.wrapper = document.createElement('div');
                _.input = document.createElement('input');

                _.htmlElement.setAttribute('type', 'hidden');

                _.htmlElement.addEventListener("change", function (e) {
                  if (!e.detail) {
                    e.stopImmediatePropagation();
                    e.cancelBubble = true;
                    e.preventDefault();
                    e.stopPropagation();
                    e.returnValue = false;
                  }
                });

                _.wrapper.append(_.input);

                _.wrapper.classList.add(_.wrapperClass);

                _.htmlElement.parentNode.insertBefore(_.wrapper, _.htmlElement);

                _.wrapper.addEventListener('click', function () {
                  _.input.focus();
                });

                _.input.addEventListener('keydown', function (e) {
                  var str = _.input.value.trim();

                  if (!!~[9, 13, 188].indexOf(e.keyCode)) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.returnValue = false;
                    _.input.value = "";

                    if (str !== "") {
                      _.addTag(str);
                    }
                  } else if (e.key === 'Backspace') {
                    if (_.input.value === "") {
                      var tags = _.wrapper.querySelectorAll(".tag");

                      if (tags.length) {
                        var i = tags.length - 1;

                        _.deleteTag(tags[i], i);
                      }
                    }
                  }
                });

                if (_.tags) {
                  _.tags.forEach(function (t) {
                    _.addTag(t);
                  });
                }

                _.container.classList.add("exf-std-lbl");

                return _context4.abrupt("return", _.container);

              case 15:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function render() {
        return _render4.apply(this, arguments);
      }

      return render;
    }()
  }, {
    key: "value",
    get: function get() {
      return this.arr;
    } // Add Tag

  }, {
    key: "addTag",
    value: function addTag(string) {
      var _ = this;

      if (_.anyErrors(string)) return;

      _.arr.push(string);

      var tag = document.createElement('span');
      tag.className = this.tagClass;
      tag.textContent = string;
      var closeIcon = document.createElement('a');
      closeIcon.innerHTML = '&times;';
      closeIcon.addEventListener('click', function (event) {
        event.preventDefault();
        var tag = event.target.parentNode;

        for (var i = 0; i < _.wrapper.childNodes.length; i++) {
          if (_.wrapper.childNodes[i] == tag) _.deleteTag(tag, i);
        }
      });
      tag.appendChild(closeIcon);

      _.wrapper.insertBefore(tag, _.input);

      _.triggerChange();

      return _;
    } // Delete Tag

  }, {
    key: "deleteTag",
    value: function deleteTag(tag, i) {
      tag.remove();
      this.arr.splice(i, 1);
      this.triggerChange();
      return this;
    } // override ExoControlBase.triggerChange - dispatch event on htmlElement fails 
    // for some reason - disspatching on visual tag input

  }, {
    key: "triggerChange",
    value: function triggerChange() {
      var evt = document.createEvent("HTMLEvents");
      evt.initEvent("change", true, true);
      evt.detail = {
        field: "tags"
      };
      this.input.dispatchEvent(evt);
    } // Errors

  }, {
    key: "anyErrors",
    value: function anyErrors(string) {
      if (this.max != null && this.arr.length >= this.max) {
        return true;
      }

      if (!this.duplicate && this.arr.indexOf(string) != -1) {
        return true;
      }

      return false;
    }
  }, {
    key: "addData",
    value: function addData(array) {
      var plugin = this;
      array.forEach(function (string) {
        plugin.addTag(string);
      });
      return this;
    }
  }]);

  return ExoTaggingControl;
}(_ExoBaseControls.default.controls.text.type);

var ExoCaptchaControl = /*#__PURE__*/function (_ExoBaseControls$cont5) {
  _inherits(ExoCaptchaControl, _ExoBaseControls$cont5);

  var _super5 = _createSuper(ExoCaptchaControl);

  function ExoCaptchaControl(context) {
    var _this4;

    _classCallCheck(this, ExoCaptchaControl);

    _this4 = _super5.call(this, context);

    _DOM.default.require("https://www.google.com/recaptcha/api.js");

    _this4.acceptProperties({
      name: "sitekey",
      type: String,
      description: "Key for Google reCaptcha",
      more: "https://developers.google.com/recaptcha/intro"
    }, {
      name: "invisible",
      type: Boolean,
      description: "Use invisible Captcha method",
      more: "https://developers.google.com/recaptcha/docs/invisible"
    });

    return _this4;
  }

  _createClass(ExoCaptchaControl, [{
    key: "render",
    value: function () {
      var _render5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                this.htmlElement.classList.add("g-recaptcha");
                this.htmlElement.setAttribute("data-sitekey", this.sitekey);

                if (this.invisible) {
                  this.htmlElement.setAttribute("data-size", "invisible");
                }

                return _context5.abrupt("return", this.htmlElement);

              case 4:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function render() {
        return _render5.apply(this, arguments);
      }

      return render;
    }()
  }, {
    key: "sitekey",
    get: function get() {
      return this._sitekey;
    },
    set: function set(value) {
      this._sitekey = value;
    }
  }, {
    key: "invisible",
    get: function get() {
      return this._invisible === true;
    },
    set: function set(value) {
      this._invisible = value == true;
    }
  }]);

  return ExoCaptchaControl;
}(_ExoBaseControls.default.controls.div.type); // TODO finish


var DropDownButton = /*#__PURE__*/function (_ExoBaseControls$cont6) {
  _inherits(DropDownButton, _ExoBaseControls$cont6);

  var _super6 = _createSuper(DropDownButton);

  function DropDownButton(context) {
    var _this5;

    _classCallCheck(this, DropDownButton);

    _this5 = _super6.call(this, context);

    _defineProperty(_assertThisInitialized(_this5), "navTemplate",
    /*html*/
    "\n        <nav class=\"ul-drop\" role='navigation'>\n            <ul>\n                <li>\n                    <a class=\"user-icon\" href=\"#\"><span class=\"ti-user\"></span></a>\n                    <ul></ul>\n                </li>\n            </ul>\n        </nav>");

    _this5.context.field.type = "hidden";
    _this5.htmlElement = _DOM.default.parseHTML(_this5.navTemplate);
    return _this5;
  }

  _createClass(DropDownButton, [{
    key: "render",
    value: function () {
      var _render6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var f, tpl;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                f = this.context.field;
                tpl =
                /*html*/
                "<li title=\"{{tooltip}}\"><a class=\"{{class}}\" href=\"{{value}}\">{{name}}</a></li>";
                _context6.next = 4;
                return this.populateList(this.htmlElement.querySelector("ul > li > ul"), tpl);

              case 4:
                _context6.next = 6;
                return _get(_getPrototypeOf(DropDownButton.prototype), "render", this).call(this);

              case 6:
                return _context6.abrupt("return", _context6.sent);

              case 7:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function render() {
        return _render6.apply(this, arguments);
      }

      return render;
    }()
  }, {
    key: "setupButton",
    value: function setupButton() {
      var _ = this;

      document.querySelector("body").classList.add("signed-out");
      container.appendChild(_DOM.default.parseHTML(_DOM.default.format(tpl, data, {
        empty: undefined
      })));
    }
  }]);

  return DropDownButton;
}(_ExoBaseControls.default.controls.list.type);

var ExoEmbedControl = /*#__PURE__*/function (_ExoBaseControls$cont7) {
  _inherits(ExoEmbedControl, _ExoBaseControls$cont7);

  var _super7 = _createSuper(ExoEmbedControl);

  function ExoEmbedControl(context) {
    var _this6;

    _classCallCheck(this, ExoEmbedControl);

    _this6 = _super7.call(this, context);

    _defineProperty(_assertThisInitialized(_this6), "_width", "600px");

    _defineProperty(_assertThisInitialized(_this6), "_height", "400px");

    _this6.htmlElement = document.createElement("iframe");

    _this6.acceptProperties({
      name: "url",
      description: "Url of the page to embed"
    }, {
      name: "width"
    }, {
      name: "height"
    });

    return _this6;
  }

  _createClass(ExoEmbedControl, [{
    key: "render",
    value: function () {
      var _render7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        var wrapper;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                this.htmlElement.setAttribute("src", this.url);
                this.htmlElement.setAttribute("frameborder", "0");
                this.htmlElement.setAttribute("allowfullscreen", "true");
                this.htmlElement.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
                _context7.next = 6;
                return _get(_getPrototypeOf(ExoEmbedControl.prototype), "render", this).call(this);

              case 6:
                wrapper = document.createElement("div");
                wrapper.classList.add("exf-embed-container");
                wrapper.appendChild(this.htmlElement);
                this.container.querySelector(".exf-ctl").appendChild(wrapper);
                this.container.classList.add("exf-base-embed");
                return _context7.abrupt("return", this.container);

              case 12:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function render() {
        return _render7.apply(this, arguments);
      }

      return render;
    }()
  }, {
    key: "width",
    get: function get() {
      return this._width;
    },
    set: function set(value) {
      this._width = value;
      this.htmlElement.style.width = value;
    }
  }, {
    key: "height",
    get: function get() {
      return this._height;
    },
    set: function set(value) {
      this._height = value;
      this.htmlElement.style.height = value;
    }
  }]);

  return ExoEmbedControl;
}(_ExoBaseControls.default.controls.element.type);

var ExoVideoControl = /*#__PURE__*/function (_ExoEmbedControl) {
  _inherits(ExoVideoControl, _ExoEmbedControl);

  var _super8 = _createSuper(ExoVideoControl);

  function ExoVideoControl(context) {
    var _this7;

    _classCallCheck(this, ExoVideoControl);

    _this7 = _super8.call(this, context);

    _defineProperty(_assertThisInitialized(_this7), "mute", false);

    _defineProperty(_assertThisInitialized(_this7), "autoplay", true);

    _defineProperty(_assertThisInitialized(_this7), "player", "youtube");

    _defineProperty(_assertThisInitialized(_this7), "code", "abcdefghij");

    _this7.acceptProperties({
      name: "code",
      description: "Code of the video to embed"
    }, {
      name: "width"
    }, {
      name: "height"
    }, {
      name: "autoplay",
      type: Boolean,
      description: "Boolean indicating whether the video should immediately start playing"
    }, {
      name: "mute",
      type: Boolean,
      description: "Boolean indicating whether the video should be muted"
    }, {
      name: "player",
      type: String,
      description: "Player type. Currently implemented: youtube, vimeo"
    });

    return _this7;
  }

  _createClass(ExoVideoControl, [{
    key: "render",
    value: function () {
      var _render8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
        var player;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                player = ExoVideoControl.players[this.player];
                this.url = _DOM.default.format(player.url, this);
                _context8.next = 4;
                return _get(_getPrototypeOf(ExoVideoControl.prototype), "render", this).call(this);

              case 4:
                return _context8.abrupt("return", this.container);

              case 5:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function render() {
        return _render8.apply(this, arguments);
      }

      return render;
    }()
  }]);

  return ExoVideoControl;
}(ExoEmbedControl);

_defineProperty(ExoVideoControl, "players", {
  youtube: {
    url: "https://www.youtube.com/embed/{{code}}?autoplay={{autoplay}}&mute={{mute}}"
  },
  vimeo: {
    url: "https://player.vimeo.com/video/{{code}}?title=0&byline=0&portrait=0&background={{mute}}"
  }
});

var MultiInputControl = /*#__PURE__*/function (_ExoBaseControls$cont8) {
  _inherits(MultiInputControl, _ExoBaseControls$cont8);

  var _super9 = _createSuper(MultiInputControl);

  function MultiInputControl(context) {
    var _this8;

    _classCallCheck(this, MultiInputControl);

    _this8 = _super9.call(this, context);

    _defineProperty(_assertThisInitialized(_this8), "columns", "");

    _defineProperty(_assertThisInitialized(_this8), "areas", "");

    _defineProperty(_assertThisInitialized(_this8), "gap", "1rem");

    _this8.acceptProperties({
      name: "grid-template",
      description: "CSS3 grid template",
      more: "https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template"
    }, {
      name: "areas",
      description: "Grid template areas to set up on the containing div",
      example: "\"field1 field1 field2\"\n                \"field3 field4 field4\""
    }, {
      name: "columns",
      description: "Grid columns to set up on containing div",
      example: "10em 10em 1fr"
    }, {
      name: "gap",
      description: "Grid gap to set up on containing div",
      example: "16px"
    }, {
      name: "fields",
      type: Object,
      description: "Fields structure",
      example: {
        first: {
          caption: "First",
          type: "text",
          maxlength: 30
        },
        last: {
          caption: "Last",
          type: "text",
          maxlength: 50
        }
      }
    });

    return _this8;
  }

  _createClass(MultiInputControl, [{
    key: "render",
    value: function () {
      var _render9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
        var _, f, exo, rs, add, n, elm;

        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _context11.next = 2;
                return _get(_getPrototypeOf(MultiInputControl.prototype), "render", this).call(this);

              case 2:
                _ = this;
                f = _.context.field;
                exo = _.context.exo;
                this.htmlElement.classList.add("exf-cnt", "exf-ctl-group");

                if (this.areas && this.columns || this["grid-template"] || this.grid) {
                  this.htmlElement.classList.add("grid");
                }

                if (this.areas && this.columns) {
                  this.htmlElement.setAttribute("style", "display: grid; grid-template-areas: ".concat(this.areas, "; grid-template-columns: ").concat(this.columns, "; grid-gap: ").concat(this.gap));
                } else {
                  if (this["grid-template"]) {
                    this.htmlElement.setAttribute("style", "display: grid; grid-template: ".concat(this["grid-template"]));
                  } else if (this.grid) {
                    this.htmlElement.classList.add(this.grid);
                  }
                }

                rs = /*#__PURE__*/function () {
                  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(name, options) {
                    return regeneratorRuntime.wrap(function _callee9$(_context9) {
                      while (1) {
                        switch (_context9.prev = _context9.next) {
                          case 0:
                            return _context9.abrupt("return", _.context.exo.renderSingleControl(options));

                          case 1:
                          case "end":
                            return _context9.stop();
                        }
                      }
                    }, _callee9);
                  }));

                  return function rs(_x, _x2) {
                    return _ref.apply(this, arguments);
                  };
                }();

                _.inputs = {};

                add = /*#__PURE__*/function () {
                  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(n, options) {
                    var o, v;
                    return regeneratorRuntime.wrap(function _callee10$(_context10) {
                      while (1) {
                        switch (_context10.prev = _context10.next) {
                          case 0:
                            options = _objectSpread(_objectSpread({}, options), {}, {
                              name: f.name + "_" + n
                            });

                            for (o in options) {
                              v = options[o];
                              if (v === "inherit") options[o] = f[o];
                            }

                            _context10.next = 4;
                            return rs(n, options);

                          case 4:
                            _.inputs[n] = _context10.sent;

                            _.inputs[n].setAttribute("data-multi-name", options.name);

                            _.htmlElement.appendChild(_.inputs[n]);

                            return _context10.abrupt("return", _.inputs[n]);

                          case 8:
                          case "end":
                            return _context10.stop();
                        }
                      }
                    }, _callee10);
                  }));

                  return function add(_x3, _x4) {
                    return _ref2.apply(this, arguments);
                  };
                }();

                if (!this.fields && f.fields) {
                  this.fields = f.fields;
                }

                _context11.t0 = regeneratorRuntime.keys(this.fields);

              case 13:
                if ((_context11.t1 = _context11.t0()).done) {
                  _context11.next = 21;
                  break;
                }

                n = _context11.t1.value;
                _context11.next = 17;
                return add(n, this.fields[n]);

              case 17:
                elm = _context11.sent;
                if (this.areas) elm.setAttribute("style", "grid-area: ".concat(n));
                _context11.next = 13;
                break;

              case 21:
                ; // inform system that this is the master control 
                // See: ExoFormFactory.getFieldFromElement(... , {master: true})

                this.htmlElement.setAttribute("exf-data-master", "multiinput");
                return _context11.abrupt("return", this.container);

              case 24:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function render() {
        return _render9.apply(this, arguments);
      }

      return render;
    }()
  }, {
    key: "_qs",
    value: function _qs(name) {
      var f = this.context.field;

      if (this.htmlElement) {
        return this.htmlElement.querySelector('[data-multi-name="' + f.name + "_" + name + '"]');
      }

      return "";
    }
  }, {
    key: "value",
    get: function get() {
      var data = this.context.field.value || {};

      for (var n in this.fields) {
        var elm = this._qs(n);

        if (elm) {
          var fld = _ExoFormFactory.default.getFieldFromElement(elm);

          data[n] = fld._control.value;
        }
      }

      return data;
    },
    set: function set(data) {
      data = data || {};
      this.context.field.value = data;

      for (var n in this.fields) {
        data[n] = data[n] || "";
        this.fields[n].value = data[n];

        var elm = this._qs(n);

        if (elm) {
          var fld = _ExoFormFactory.default.getFieldFromElement(elm);

          fld._control.value = data[n];
        }
      }
    }
  }, {
    key: "valid",
    get: function get() {
      var v = true;

      for (var n in this.fields) {
        var elm = this._qs(n);

        var fld = _ExoFormFactory.default.getFieldFromElement(elm);

        if (!fld._control.valid) {
          v = false;
        }
      }

      return v;
    }
  }, {
    key: "showValidationError",
    value: function showValidationError() {
      for (var n in this.fields) {
        var elm = this.getFormElement(this._qs(n));
        console.log("Checking ", elm);

        if (!elm.checkValidity()) {
          console.log("Not valid: ", elm);
          if (elm.reportValidity) elm.reportValidity();
          return false;
        }
      }

      return true;
    }
  }, {
    key: "getFormElement",
    value: function getFormElement(elm) {
      if (elm.name && elm.form) return elm;
      return elm.querySelector("[name]") || elm;
    }
  }]);

  return MultiInputControl;
}(_ExoBaseControls.default.controls.div.type);

_defineProperty(MultiInputControl, "returnValueType", Object);

var ExoNameControl = /*#__PURE__*/function (_MultiInputControl) {
  _inherits(ExoNameControl, _MultiInputControl);

  var _super10 = _createSuper(ExoNameControl);

  function ExoNameControl() {
    var _this9;

    _classCallCheck(this, ExoNameControl);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this9 = _super10.call.apply(_super10, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this9), "columns", "10em 1fr");

    _defineProperty(_assertThisInitialized(_this9), "areas", "\"first last\"");

    _defineProperty(_assertThisInitialized(_this9), "fields", {
      first: {
        caption: "First",
        type: "text",
        maxlength: 30,
        required: "inherit"
      },
      last: {
        caption: "Last",
        type: "text",
        maxlength: 50,
        required: "inherit"
      }
    });

    return _this9;
  }

  return ExoNameControl;
}(MultiInputControl);

var ExoNLAddressControl = /*#__PURE__*/function (_MultiInputControl2) {
  _inherits(ExoNLAddressControl, _MultiInputControl2);

  var _super11 = _createSuper(ExoNLAddressControl);

  function ExoNLAddressControl() {
    var _this10;

    _classCallCheck(this, ExoNLAddressControl);

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    _this10 = _super11.call.apply(_super11, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this10), "columns", "4em 4em 10em 1fr");

    _defineProperty(_assertThisInitialized(_this10), "areas", "\n        \"code code nr fill\"\n        \"ext ext city city\"\n        \"street street street street\"");

    _defineProperty(_assertThisInitialized(_this10), "fields", {
      code: {
        caption: "Postcode",
        type: "text",
        size: 7,
        maxlength: 7,
        required: "inherit",
        pattern: "[1-9][0-9]{3}\s?[a-zA-Z]{2}",
        placeholder: "1234AB"
      },
      nr: {
        caption: "Huisnummer",
        type: "number",
        size: 6,
        maxlength: 6,
        required: "inherit",
        placeholder: "67"
      },
      ext: {
        caption: "Toevoeging",
        type: "text",
        size: 3,
        maxlength: 3,
        placeholder: "F"
      },
      city: {
        caption: "Plaats",
        type: "text",
        maxlength: 50,
        readonly: true,
        placeholder: "Den Helder"
      },
      street: {
        caption: "Straatnaam",
        type: "text",
        maxlength: 50,
        readonly: true,
        placeholder: "Dorpstraat"
      }
    });

    return _this10;
  }

  _createClass(ExoNLAddressControl, [{
    key: "render",
    value: function () {
      var _render10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
        var _this11 = this;

        var _, element, check;

        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                _ = this;
                _context12.next = 3;
                return _get(_getPrototypeOf(ExoNLAddressControl.prototype), "render", this).call(this);

              case 3:
                element = _context12.sent;

                check = function check() {
                  var data = _this11.value;

                  if (data.code && data.nr) {
                    fetch(_DOM.default.format(ExoNLAddressControl.APIUrl, {
                      nr: data.nr,
                      code: data.code
                    }), {
                      referer: "https://stasfpwawesteu.z6.web.core.windows.net/",
                      method: "GET"
                    }).then(function (x) {
                      return x.json();
                    }).then(function (j) {
                      var r = j.response;

                      if (r.numFound > 0) {
                        var d = r.docs[0];
                        _._qs("street").querySelector("[name]").value = d.straatnaam_verkort;

                        _._qs("street").classList.add("exf-filled");

                        _._qs("city").querySelector("[name]").value = d.woonplaatsnaam;

                        _._qs("city").classList.add("exf-filled");
                      }
                    });
                  }
                };

                _.inputs["nr"].addEventListener("change", check);

                _.inputs["code"].addEventListener("change", check);

                _.inputs["ext"].addEventListener("change", check);

                return _context12.abrupt("return", element);

              case 9:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function render() {
        return _render10.apply(this, arguments);
      }

      return render;
    }()
  }]);

  return ExoNLAddressControl;
}(MultiInputControl);

_defineProperty(ExoNLAddressControl, "APIUrl", "https://geodata.nationaalgeoregister.nl/locatieserver/v3/free?q=postcode:{{code}}&huisnummer:{{nr}}");

var ExoCreditCardControl = /*#__PURE__*/function (_MultiInputControl3) {
  _inherits(ExoCreditCardControl, _MultiInputControl3);

  var _super12 = _createSuper(ExoCreditCardControl);

  function ExoCreditCardControl() {
    var _this12;

    _classCallCheck(this, ExoCreditCardControl);

    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    _this12 = _super12.call.apply(_super12, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this12), "columns", "4em 4em 4em 1fr");

    _defineProperty(_assertThisInitialized(_this12), "areas", "\n        \"name name number number\"\n        \"expiry expiry cvv fill\"");

    _defineProperty(_assertThisInitialized(_this12), "fields", {
      name: {
        caption: "Name on Card",
        type: "text",
        maxlength: 50,
        required: "inherit",
        placeholder: ""
      },
      number: {
        caption: "Credit Card Number",
        type: "text",
        size: 16,
        required: "inherit",
        maxlength: 16,
        placeholder: "",
        pattern: "[0-9]{13,16}"
      },
      expiry: {
        caption: "Card Expires",
        class: "exf-label-sup",
        type: "month",
        required: "inherit",
        maxlength: 3,
        placeholder: "",
        min: new Date().getFullYear() + "-" + ('0' + (new Date().getMonth() + 1)).slice(-2)
      },
      cvv: {
        caption: "CVV",
        type: "number",
        required: "inherit",
        minlength: 3,
        maxlength: 3,
        size: 3,
        placeholder: "",
        min: "000"
      }
    });

    return _this12;
  }

  return ExoCreditCardControl;
}(MultiInputControl);

var ExoDateRangeControl = /*#__PURE__*/function (_MultiInputControl4) {
  _inherits(ExoDateRangeControl, _MultiInputControl4);

  var _super13 = _createSuper(ExoDateRangeControl);

  function ExoDateRangeControl() {
    var _this13;

    _classCallCheck(this, ExoDateRangeControl);

    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    _this13 = _super13.call.apply(_super13, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this13), "grid", "exf-cols-10em-10em");

    _defineProperty(_assertThisInitialized(_this13), "fields", {
      from: {
        caption: "From",
        type: "date"
      },
      to: {
        caption: "To",
        type: "date"
      }
    });

    return _this13;
  }

  _createClass(ExoDateRangeControl, [{
    key: "render",
    value: function () {
      var _render11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
        var _, element, _from, _to, check;

        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                _ = this;
                _context13.next = 3;
                return _get(_getPrototypeOf(ExoDateRangeControl.prototype), "render", this).call(this);

              case 3:
                element = _context13.sent;
                _from = _.inputs.from.querySelector("[name]");
                _to = _.inputs.to.querySelector("[name]");

                check = function check(e) {
                  if (e.target === _from) {
                    _to.setAttribute("min", _from.value);
                  } else if (e.target === _to) {
                    _from.setAttribute("max", _to.value);
                  }
                };

                _from.addEventListener("change", check);

                _to.addEventListener("change", check);

                return _context13.abrupt("return", element);

              case 10:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function render() {
        return _render11.apply(this, arguments);
      }

      return render;
    }()
  }]);

  return ExoDateRangeControl;
}(MultiInputControl);

var ExoDialogControl = /*#__PURE__*/function (_ExoBaseControls$cont9) {
  _inherits(ExoDialogControl, _ExoBaseControls$cont9);

  var _super14 = _createSuper(ExoDialogControl);

  function ExoDialogControl(context) {
    var _this14;

    _classCallCheck(this, ExoDialogControl);

    _this14 = _super14.call(this, context);

    _defineProperty(_assertThisInitialized(_this14), "title", "Dialog");

    _defineProperty(_assertThisInitialized(_this14), "_visible", false);

    _defineProperty(_assertThisInitialized(_this14), "confirmText", "OK");

    _defineProperty(_assertThisInitialized(_this14), "cancelText", "Cancel");

    _defineProperty(_assertThisInitialized(_this14), "cancelVisible", false);

    _defineProperty(_assertThisInitialized(_this14), "body", "The dialog body");

    _defineProperty(_assertThisInitialized(_this14), "modal", false);

    _defineProperty(_assertThisInitialized(_this14), "dlgTemplate",
    /*html*/
    "<div class=\"exf-dlg\" role=\"dialog\" id=\"{{dlgId}}\">\n<div class=\"exf-dlg-c\">\n    <div class=\"exf-dlg-h\">\n        <div class=\"exf-dlg-t\">{{title}}<button type=\"button\" class=\"dlg-bc dlg-x dismiss\" ><span>&times;</span></button></div>\n    </div>\n<div class=\"exf-dlg-b\">{{body}}</div>\n<div class=\"exf-dlg-f\">\n    <button type=\"button\" class=\"dlg-x btn exf-btn btn-default dismiss\" >{{cancelText}}</button>\n    <button type=\"button\" class=\"dlg-x btn exf-btn btn-primary confirm\" >{{confirmText}}</button>\n</div>\n</div>\n</div>");

    _this14.acceptProperties("title", "cancelText", "body", "confirmText", "cancelVisible", "modal");

    _this14.dlgId = 'dlg_' + _Core.default.guid().replace('-', '');
    return _this14;
  }

  _createClass(ExoDialogControl, [{
    key: "hide",
    value: function hide(button, e) {
      if (this.context.field.click) {
        this.context.field.click.apply(this, [button, e]);
      }
    }
  }, {
    key: "visible",
    set: function set(value) {
      this._visible = value;

      if (this.rendered) {
        if (value) {
          this.show();
        } else {
          this.hide();
        }
      }
    }
  }, {
    key: "show",
    value: function show() {
      var _ = this;

      var html = _DOM.default.format(_.dlgTemplate, _objectSpread({}, this));

      var dlg = _DOM.default.parseHTML(html);

      dlg.classList.add(this.cancelVisible ? "dlg-cv" : "dlg-ch");

      var c = function c(e, confirm) {
        //window.location.hash = "na";
        var btn = "cancel",
            b = e.target;

        if (confirm || b.classList.contains("confirm")) {
          btn = "confirm";
        }

        _.hide.apply(_, [btn, e]);

        if (!e.cancelBubble) {
          _.remove();
        }
      };

      dlg.querySelector(".dlg-x").addEventListener("click", c);
      document.body.appendChild(dlg);
      dlg.addEventListener("click", c);
      document.body.addEventListener("keydown", function (e) {
        if (e.keyCode === 27) c(e);
        if (e.keyCode === 13) c(e, true);
      }, {
        once: true
      });
      if (!this.modal) setTimeout(function () {
        document.body.addEventListener("click", c, {
          once: true
        });
      }, 10);
    }
  }, {
    key: "remove",
    value: function remove() {
      var dlg = document.querySelector("#" + this.dlgId);
      if (dlg) dlg.remove();
    }
  }]);

  return ExoDialogControl;
}(_ExoBaseControls.default.controls.div.type);

var ExoInfoControl = /*#__PURE__*/function (_ExoBaseControls$cont10) {
  _inherits(ExoInfoControl, _ExoBaseControls$cont10);

  var _super15 = _createSuper(ExoInfoControl);

  function ExoInfoControl(context) {
    var _this15;

    _classCallCheck(this, ExoInfoControl);

    _this15 = _super15.call(this, context);

    _defineProperty(_assertThisInitialized(_this15), "template", "<section class=\"exf-info {{class}}\">\n    <div class=\"exf-info-title\"><span class=\"exf-info-icon {{icon}}\"></span><span class=\"exf-info-title-text\">{{title}}</span></div>\n    <div class=\"exf-info-body\">{{body}}</div>\n    </section>");

    _defineProperty(_assertThisInitialized(_this15), "title", "");

    _defineProperty(_assertThisInitialized(_this15), "body", "");

    _defineProperty(_assertThisInitialized(_this15), "icon", "ti-info");

    _this15.acceptProperties("title", "icon", "body", "class");

    return _this15;
  }

  _createClass(ExoInfoControl, [{
    key: "render",
    value: function () {
      var _render12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
        var _, html;

        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                _ = this;
                html = _DOM.default.format(_.template, _objectSpread({}, this));

                _.htmlElement.appendChild(_DOM.default.parseHTML(_DOM.default.format(_.template, this)));

                return _context14.abrupt("return", _.htmlElement);

              case 4:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function render() {
        return _render12.apply(this, arguments);
      }

      return render;
    }()
  }]);

  return ExoInfoControl;
}(_ExoBaseControls.default.controls.div.type);

var ExoStarRatingControl = /*#__PURE__*/function (_ExoBaseControls$cont11) {
  _inherits(ExoStarRatingControl, _ExoBaseControls$cont11);

  var _super16 = _createSuper(ExoStarRatingControl);

  function ExoStarRatingControl() {
    var _this16;

    _classCallCheck(this, ExoStarRatingControl);

    for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    _this16 = _super16.call.apply(_super16, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this16), "svg",
    /*html*/
    "<svg>\n    <defs>\n      <path id=\"star\" d=\"M48.856,22.73c0.983-0.958,1.33-2.364,0.906-3.671c-0.425-1.307-1.532-2.24-2.892-2.438l-12.092-1.757c-0.515-0.075-0.96-0.398-1.19-0.865L28.182,3.043c-0.607-1.231-1.839-1.996-3.212-1.996c-1.372,0-2.604,0.765-3.211,1.996L16.352,14c-0.23,0.467-0.676,0.79-1.191,0.865L3.069,16.622c-1.359,0.197-2.467,1.131-2.892,2.438c-0.424,1.307-0.077,2.713,0.906,3.671l8.749,8.528c0.373,0.364,0.544,0.888,0.456,1.4L8.224,44.701c-0.183,1.06,0.095,2.091,0.781,2.904c1.066,1.267,2.927,1.653,4.415,0.871l10.814-5.686c0.452-0.237,1.021-0.235,1.472,0l10.815,5.686c0.526,0.277,1.087,0.417,1.666,0.417c1.057,0,2.059-0.47,2.748-1.288c0.687-0.813,0.964-1.846,0.781-2.904l-2.065-12.042c-0.088-0.513,0.083-1.036,0.456-1.4L48.856,22.73z\"></path>\n      <clipPath id=\"stars\">\n        <use xlink:href=\"#star\" x=\"0\"></use>\n        <use xlink:href=\"#star\" x=\"50\"></use>\n        <use xlink:href=\"#star\" x=\"100\"></use>\n        <use xlink:href=\"#star\" x=\"150\"></use>\n        <use xlink:href=\"#star\" x=\"200\"></use>\n      </clipPath>\n    </defs>\n  </svg>\n  <!-- for safari-->\n  <svg>\n    <clipPath id=\"allStars\">\n      <path d=\"M24.97,0.047 C26.343,0.047 27.575,0.812 28.182,2.043 L28.182,2.043 L33.588,12.999 C33.818,13.466 34.263,13.789 34.778,13.864 L34.778,13.864 L46.87,15.621 C48.23,15.819 49.337,16.752 49.762,18.059 C50.186,19.366 49.839,20.772 48.856,21.73 L48.856,21.73 L40.107,30.259 C39.734,30.623 39.563,31.146 39.651,31.659 L39.651,31.659 L41.716,43.701 C41.899,44.759 41.622,45.792 40.935,46.605 C40.246,47.423 39.244,47.893 38.187,47.893 C37.608,47.893 37.047,47.753 36.521,47.476 L36.521,47.476 L25.706,41.79 C25.255,41.555 24.686,41.553 24.234,41.79 L24.234,41.79 L13.42,47.476 C11.932,48.258 10.071,47.872 9.005,46.605 C8.319,45.792 8.041,44.761 8.224,43.701 L8.224,43.701 L10.288,31.659 C10.376,31.147 10.205,30.623 9.832,30.259 L9.832,30.259 L1.083,21.731 C0.1,20.773 -0.247,19.367 0.177,18.06 C0.602,16.753 1.71,15.819 3.069,15.622 L3.069,15.622 L15.161,13.865 C15.676,13.79 16.122,13.467 16.352,13 L16.352,13 L21.759,2.043 C22.366,0.812 23.598,0.047 24.97,0.047 Z M124.97,0.047 C126.343,0.047 127.575,0.812 128.182,2.043 L128.182,2.043 L133.588,12.999 C133.818,13.466 134.263,13.789 134.778,13.864 L134.778,13.864 L146.87,15.621 C148.23,15.819 149.337,16.752 149.762,18.059 C150.186,19.366 149.839,20.772 148.856,21.73 L148.856,21.73 L140.107,30.259 C139.734,30.623 139.563,31.146 139.651,31.659 L139.651,31.659 L141.716,43.701 C141.899,44.759 141.622,45.792 140.935,46.605 C140.246,47.423 139.244,47.893 138.187,47.893 C137.608,47.893 137.047,47.753 136.521,47.476 L136.521,47.476 L125.706,41.79 C125.255,41.555 124.686,41.553 124.234,41.79 L124.234,41.79 L113.42,47.476 C111.932,48.258 110.071,47.872 109.005,46.605 C108.319,45.792 108.041,44.761 108.224,43.701 L108.224,43.701 L110.288,31.659 C110.376,31.147 110.205,30.623 109.832,30.259 L109.832,30.259 L101.083,21.731 C100.1,20.773 99.753,19.367 100.177,18.06 C100.602,16.753 101.71,15.819 103.069,15.622 L103.069,15.622 L115.161,13.865 C115.676,13.79 116.122,13.467 116.352,13 L116.352,13 L121.759,2.043 C122.366,0.812 123.598,0.047 124.97,0.047 Z M174.97,0.047 C176.343,0.047 177.575,0.812 178.182,2.043 L178.182,2.043 L183.588,12.999 C183.818,13.466 184.263,13.789 184.778,13.864 L184.778,13.864 L196.87,15.621 C198.23,15.819 199.337,16.752 199.762,18.059 C200.186,19.366 199.839,20.772 198.856,21.73 L198.856,21.73 L190.107,30.259 C189.734,30.623 189.563,31.146 189.651,31.659 L189.651,31.659 L191.716,43.701 C191.899,44.759 191.622,45.792 190.935,46.605 C190.246,47.423 189.244,47.893 188.187,47.893 C187.608,47.893 187.047,47.753 186.521,47.476 L186.521,47.476 L175.706,41.79 C175.255,41.555 174.686,41.553 174.234,41.79 L174.234,41.79 L163.42,47.476 C161.932,48.258 160.071,47.872 159.005,46.605 C158.319,45.792 158.041,44.761 158.224,43.701 L158.224,43.701 L160.288,31.659 C160.376,31.147 160.205,30.623 159.832,30.259 L159.832,30.259 L151.083,21.731 C150.1,20.773 149.753,19.367 150.177,18.06 C150.602,16.753 151.71,15.819 153.069,15.622 L153.069,15.622 L165.161,13.865 C165.676,13.79 166.122,13.467 166.352,13 L166.352,13 L171.759,2.043 C172.366,0.812 173.598,0.047 174.97,0.047 Z M224.97,0.047 C226.343,0.047 227.575,0.812 228.182,2.043 L228.182,2.043 L233.588,12.999 C233.818,13.466 234.263,13.789 234.778,13.864 L234.778,13.864 L246.87,15.621 C248.23,15.819 249.337,16.752 249.762,18.059 C250.186,19.366 249.839,20.772 248.856,21.73 L248.856,21.73 L240.107,30.259 C239.734,30.623 239.563,31.146 239.651,31.659 L239.651,31.659 L241.716,43.701 C241.899,44.759 241.622,45.792 240.935,46.605 C240.246,47.423 239.244,47.893 238.187,47.893 C237.608,47.893 237.047,47.753 236.521,47.476 L236.521,47.476 L225.706,41.79 C225.255,41.555 224.686,41.553 224.234,41.79 L224.234,41.79 L213.42,47.476 C211.932,48.258 210.071,47.872 209.005,46.605 C208.319,45.792 208.041,44.761 208.224,43.701 L208.224,43.701 L210.288,31.659 C210.376,31.147 210.205,30.623 209.832,30.259 L209.832,30.259 L201.083,21.731 C200.1,20.773 199.753,19.367 200.177,18.06 C200.602,16.753 201.71,15.819 203.069,15.622 L203.069,15.622 L215.161,13.865 C215.676,13.79 216.122,13.467 216.352,13 L216.352,13 L221.759,2.043 C222.366,0.812 223.598,0.047 224.97,0.047 Z M74.97,0.047 C76.343,0.047 77.575,0.812 78.182,2.043 L78.182,2.043 L83.588,12.999 C83.818,13.466 84.263,13.789 84.778,13.864 L84.778,13.864 L96.87,15.621 C98.23,15.819 99.337,16.752 99.762,18.059 C100.186,19.366 99.839,20.772 98.856,21.73 L98.856,21.73 L90.107,30.259 C89.734,30.623 89.563,31.146 89.651,31.659 L89.651,31.659 L91.716,43.701 C91.899,44.759 91.622,45.792 90.935,46.605 C90.246,47.423 89.244,47.893 88.187,47.893 C87.608,47.893 87.047,47.753 86.521,47.476 L86.521,47.476 L75.706,41.79 C75.255,41.555 74.686,41.553 74.234,41.79 L74.234,41.79 L63.42,47.476 C61.932,48.258 60.071,47.872 59.005,46.605 C58.319,45.792 58.041,44.761 58.224,43.701 L58.224,43.701 L60.288,31.659 C60.376,31.147 60.205,30.623 59.832,30.259 L59.832,30.259 L51.083,21.731 C50.1,20.773 49.753,19.367 50.177,18.06 C50.602,16.753 51.71,15.819 53.069,15.622 L53.069,15.622 L65.161,13.865 C65.676,13.79 66.122,13.467 66.352,13 L66.352,13 L71.759,2.043 C72.366,0.812 73.598,0.047 74.97,0.047 Z\"></path>\n    </clipPath>\n  </svg>");

    return _this16;
  }

  _createClass(ExoStarRatingControl, [{
    key: "render",
    value: function () {
      var _render13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
        var e, wrapper, input;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                _context15.next = 2;
                return _get(_getPrototypeOf(ExoStarRatingControl.prototype), "render", this).call(this);

              case 2:
                e = _context15.sent;
                wrapper = document.createElement('div');
                e.appendChild(wrapper);
                input = e.querySelector("[type=range]");
                input.setAttribute("min", "0");
                input.setAttribute("max", "5");
                input.setAttribute("step", "any");
                wrapper.appendChild(input);
                e.insertBefore(_DOM.default.parseHTML(this.svg), wrapper);
                e.classList.add("exf-star-rating-cnt");
                wrapper.classList.add("exf-star-rating");
                throw "Not implemented";

              case 15:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function render() {
        return _render13.apply(this, arguments);
      }

      return render;
    }()
  }]);

  return ExoStarRatingControl;
}(_ExoBaseControls.default.controls.range.type);

_defineProperty(ExoStarRatingControl, "returnValueType", Number);

var ExoExtendedControls = function ExoExtendedControls() {
  _classCallCheck(this, ExoExtendedControls);
};

_defineProperty(ExoExtendedControls, "controls", {
  filedrop: {
    type: ExoFileDropControl,
    alias: "file",
    note: "An input for file uploading",
    demo: {
      max: 1,
      "fileTypes": ["image/"],
      maxSize: 4096000,
      caption: "Select your profile image",
      class: "image-upload"
    }
  },
  switch: {
    type: ExoSwitchControl
  },
  richtext: {
    type: ExoCKRichEditor,
    note: "A CKEditor wrapper for ExoForm"
  },
  tags: {
    caption: "Tags control",
    type: ExoTaggingControl,
    note: "A control for adding multiple tags",
    demo: {
      tags: ["JavaScript", "CSS", "HTML"]
    }
  },
  multiinput: {
    type: MultiInputControl
  },
  creditcard: {
    caption: "Credit Card",
    type: ExoCreditCardControl,
    note: "A credit card control"
  },
  name: {
    caption: "Name (first, last) group",
    type: ExoNameControl,
    note: "Person name control"
  },
  nladdress: {
    caption: "Dutch address",
    type: ExoNLAddressControl,
    note: "Nederlands adres"
  },
  //tabstrip: { for: "page", type: ExoTabStripControl, note: "A tabstrip control for grouping controls in a form" },
  daterange: {
    caption: "Date range",
    type: ExoDateRangeControl,
    note: "A date range control"
  },
  embed: {
    type: ExoEmbedControl,
    note: "Embed anything in an IFrame",
    demo: {
      url: "https://codepen.io/chriscoyier/embed/gfdDu"
    }
  },
  video: {
    type: ExoVideoControl,
    caption: "Embed video",
    note: "An embedded video from YouTube or Vimeo",
    demo: {
      player: "youtube",
      code: "85Nyi4Xb9PY"
    }
  },
  dropdownbutton: {
    hidden: true,
    type: DropDownButton,
    note: "A dropdown menu button"
  },
  captcha: {
    caption: "Google ReCaptcha Control",
    type: ExoCaptchaControl,
    note: "Captcha field",
    demo: {
      sitekey: "6Lel4Z4UAAAAAOa8LO1Q9mqKRUiMYl_00o5mXJrR"
    }
  },
  starrating: {
    type: ExoStarRatingControl,
    note: "An accessible star rating control",
    demo: {
      value: 2.5
    }
  },
  dialog: {
    type: ExoDialogControl,
    caption: "Dialog",
    note: "A simple dialog (modal or modeless)"
  },
  info: {
    type: ExoInfoControl,
    note: "An info panel",
    demo: {
      title: "Info",
      icon: "ti-info",
      body: "Your informational text"
    }
  }
});

var _default = ExoExtendedControls;
exports.default = _default;
},{"./ExoBaseControls":"src/exo/ExoBaseControls.js","./ExoFormFactory":"src/exo/ExoFormFactory.js","./ExoForm":"src/exo/ExoForm.js","../pwa/Core":"src/pwa/Core.js","../pwa/DOM":"src/pwa/DOM.js"}],"src/exo/ExoDevControls.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ExoBaseControls = _interopRequireDefault(require("./ExoBaseControls"));

var _Core = _interopRequireDefault(require("../pwa/Core"));

var _DOM = _interopRequireDefault(require("../pwa/DOM"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ExoAceCodeEditor = /*#__PURE__*/function (_ExoBaseControls$cont) {
  _inherits(ExoAceCodeEditor, _ExoBaseControls$cont);

  var _super = _createSuper(ExoAceCodeEditor);

  function ExoAceCodeEditor(context) {
    var _this;

    _classCallCheck(this, ExoAceCodeEditor);

    _this = _super.call(this, context);

    _defineProperty(_assertThisInitialized(_this), "_mode", "html");

    _defineProperty(_assertThisInitialized(_this), "defaultThemes", {
      dark: "ambiance",
      light: "chrome"
    });

    _defineProperty(_assertThisInitialized(_this), "_fontSize", 14);

    _this.htmlElement.data = {};

    _this.acceptProperties({
      name: "mode",
      type: String,
      description: "Ace Editor mode - refer to Ace documentation"
    }, {
      name: "theme",
      type: String,
      description: "Ace Editor theme - refer to Ace documentation"
    }, {
      name: "fontSize",
      type: Number
    });

    _this.theme = document.querySelector("html").classList.contains("theme-dark") ? _this.defaultThemes.dark : _this.defaultThemes.light;
    return _this;
  }

  _createClass(ExoAceCodeEditor, [{
    key: "render",
    value: function () {
      var _render = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _this2 = this;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _get(_getPrototypeOf(ExoAceCodeEditor.prototype), "render", this).call(this);

              case 2:
                return _context.abrupt("return", new Promise(function (resolve, reject) {
                  _DOM.default.require("https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js", function () {
                    var editor = ace.edit(_this2.htmlElement);
                    editor.setTheme("ace/theme/" + _this2.theme);
                    editor.session.setMode("ace/mode/" + _this2.mode);
                    _this2.htmlElement.style = "min-height: 200px; width: 100%; font-size: " + _this2.fontSize + "px;";

                    if (typeof _this2.value === "string" && _this2.value.length) {
                      editor.setValue(_this2.value, -1);
                    }

                    _this2.htmlElement.setAttribute('data-evtarget', "true"); // set div as event target 


                    // set div as event target 
                    editor.on("change", function (e) {
                      setTimeout(function () {
                        _DOM.default.trigger(_this2.htmlElement, "change", {
                          target: _this2.htmlElement
                        });
                      }, 10);
                    });
                    _this2.htmlElement.data.editor = editor;

                    if (_this2.htmlElement.classList.contains("full-height")) {
                      _this2.container.classList.add("full-height");

                      var cc = _this2.container.querySelector(".exf-ctl");

                      if (cc) cc.classList.add("full-height");
                    }

                    resolve(_this2.container);
                  });
                }));

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function render() {
        return _render.apply(this, arguments);
      }

      return render;
    }()
  }, {
    key: "mode",
    get: function get() {
      return this._mode;
    },
    set: function set(value) {
      this._mode = value;
      if (this.ace) this.ace.session.setMode("ace/mode/" + this._mode);
    }
  }, {
    key: "value",
    get: function get() {
      if (this.ace) return this.ace.getValue();
      return this.context.field.value;
    },
    set: function set(data) {
      data = data || "";
      this.context.field.value = data;
      if (this.ace) this.ace.setValue(data, -1);
    }
  }, {
    key: "fontSize",
    get: function get() {
      return this._fontSize;
    },
    set: function set(value) {
      this._fontSize = value;
      ace.config.set("fontSize", this._fontSize + "px;");
      this.htmlElement.style.fontSize = this._fontSize + "px;";
    }
  }, {
    key: "ace",
    get: function get() {
      if (this.htmlElement.data && this.htmlElement.data.editor) return this.htmlElement.data.editor;
      return null;
    }
  }, {
    key: "setProperties",
    value: function setProperties() {
      if (this.context.field.mode) {
        this.mode = this.context.field.mode;
        delete this.context.field.mode;
      }

      if (this.context.field.theme) {
        this.theme = this.context.field.theme;
        delete this.context.field.theme;
      } // if (this.context.field.value) {
      //     this.value = this.context.field.value;
      //     delete this.context.field.value;
      // }


      _get(_getPrototypeOf(ExoAceCodeEditor.prototype), "setProperties", this).call(this);
    }
  }]);

  return ExoAceCodeEditor;
}(_ExoBaseControls.default.controls.div.type);

_defineProperty(ExoAceCodeEditor, "returnValueType", String);

var ExoDevControls = function ExoDevControls() {
  _classCallCheck(this, ExoDevControls);
};

_defineProperty(ExoDevControls, "controls", {
  aceeditor: {
    type: ExoAceCodeEditor,
    note: "Ace code editor",
    demo: {
      mode: "html"
    }
  }
});

var _default = ExoDevControls;
exports.default = _default;
},{"./ExoBaseControls":"src/exo/ExoBaseControls.js","../pwa/Core":"src/pwa/Core.js","../pwa/DOM":"src/pwa/DOM.js"}],"src/exo/ExoChartControls.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ExoBaseControls = _interopRequireDefault(require("./ExoBaseControls"));

var _DOM = _interopRequireDefault(require("../pwa/DOM"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ExoCircularChart = /*#__PURE__*/function (_ExoBaseControls$cont) {
  _inherits(ExoCircularChart, _ExoBaseControls$cont);

  var _super = _createSuper(ExoCircularChart);

  function ExoCircularChart(context) {
    var _this;

    _classCallCheck(this, ExoCircularChart);

    _this = _super.call(this, context);

    _defineProperty(_assertThisInitialized(_this), "value", "0");

    _defineProperty(_assertThisInitialized(_this), "size", "200");

    _defineProperty(_assertThisInitialized(_this), "color", "#00acc1");

    _this.acceptProperties({
      name: "value",
      type: Number,
      description: "Percentual value of the chart (0-100)"
    }, {
      name: "size"
    }, {
      name: "color"
    }, {
      name: "backgroundColor"
    }, {
      name: "textColor"
    }, {
      name: "subLineColor"
    }, {
      name: "caption"
    });

    return _this;
  }

  _createClass(ExoCircularChart, [{
    key: "render",
    value: function () {
      var _render = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _, me, tpl;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _ = this;
                me = _.htmlElement;
                _context.next = 4;
                return _get(_getPrototypeOf(ExoCircularChart.prototype), "render", this).call(this);

              case 4:
                tpl =
                /*html*/
                "<svg class=\"circle-chart\" viewbox=\"0 0 33.83098862 33.83098862\" width=\"{{size}}\" height=\"{{size}}\" xmlns=\"http://www.w3.org/2000/svg\">\n            <circle class=\"circle-chart__background\" stroke=\"{{backgroundColor}}\" stroke-width=\"2\" fill=\"none\" cx=\"16.91549431\" cy=\"16.91549431\" r=\"15.91549431\" />\n            <circle class=\"circle-chart__circle\" stroke=\"{{color}}\" stroke-width=\"2\" stroke-dasharray=\"{{value}},100\" stroke-linecap=\"round\" fill=\"none\" cx=\"16.91549431\" cy=\"16.91549431\" r=\"15.91549431\" />\n            <g class=\"circle-chart__info\">\n              <text class=\"metric chart-pct\" x=\"16.91549431\" y=\"15.5\" alignment-baseline=\"central\" text-anchor=\"middle\" font-size=\"8\" >{{value}}%</text>\n              <text class=\"metric chart-sub\" x=\"16.91549431\" y=\"20.5\" alignment-baseline=\"central\" text-anchor=\"middle\" font-size=\"2\" >{{caption}}</text>\n            </g>\n          </svg>";
                me.appendChild(_DOM.default.parseHTML(_DOM.default.format(tpl, this)));
                this.container.classList.add("exf-std-lbl");
                return _context.abrupt("return", this.container);

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function render() {
        return _render.apply(this, arguments);
      }

      return render;
    }()
  }]);

  return ExoCircularChart;
}(_ExoBaseControls.default.controls.div.type);

var ExoChartControls = function ExoChartControls() {
  _classCallCheck(this, ExoChartControls);
};

_defineProperty(ExoChartControls, "controls", {
  circularchart: {
    type: ExoCircularChart,
    note: "Simple circular chart (SVG)",
    demo: {
      mode: "html"
    }
  }
});

var _default = ExoChartControls;
exports.default = _default;
},{"./ExoBaseControls":"src/exo/ExoBaseControls.js","../pwa/DOM":"src/pwa/DOM.js"}],"src/exo/ExoSchemaGenerator.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Core = _interopRequireDefault(require("../pwa/Core"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ExoSchemaGenerator = /*#__PURE__*/function () {
  function ExoSchemaGenerator() {
    _classCallCheck(this, ExoSchemaGenerator);

    _defineProperty(this, "typeMap", {
      string: "text",
      number: "number",
      boolean: "switch",
      "null": "text"
    });

    _defineProperty(this, "defaultSchema", {
      "pages": [{
        "label": "",
        "intro": "",
        "fields": []
      }]
    });
  }

  _createClass(ExoSchemaGenerator, [{
    key: "generateFormSchema",
    value: function generateFormSchema(DTO) {
      if (!DTO) throw "Missing DTO";
      if (typeof DTO === "string") DTO = JSON.parse(DTO);
      this.dto = DTO;

      var schema = _objectSpread({}, this.defaultSchema);

      for (var p in this.dto) {
        schema.pages[0].fields.push(_objectSpread({
          name: p,
          caption: p,
          value: this.dto[p]
        }, this.getMatchingFieldSettingsFuzzy(p, this.dto[p])));
      }

      return schema;
    }
  }, {
    key: "getMatchingFieldSettingsFuzzy",
    value: function getMatchingFieldSettingsFuzzy(name, value, metaData) {
      if (value === undefined) {
        value = this.getDefault(metaData);
      }

      var tp = this.typeMap[_typeof(value)];

      return {
        type: tp || "text",
        caption: _Core.default.toWords(name)
      };
    }
  }, {
    key: "getDefault",
    value: function getDefault(meta) {
      if (meta) {
        if (meta.type === "boolean") return false;else if (meta.type === "number") return 0;
      }

      return "";
    }
  }]);

  return ExoSchemaGenerator;
}();

var _default = ExoSchemaGenerator;
exports.default = _default;
},{"../pwa/Core":"src/pwa/Core.js"}],"src/exo/ExoFormThemes.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _DOM = _interopRequireDefault(require("../pwa/DOM"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ExoFormTheme = /*#__PURE__*/function () {
  function ExoFormTheme(exo) {
    _classCallCheck(this, ExoFormTheme);

    this.exo = exo;
  }

  _createClass(ExoFormTheme, [{
    key: "apply",
    value: function apply() {
      this.exo.container.classList.add("exf-theme-none");
      this.exo.form.addEventListener("focusin", function (e) {
        var cnt = e.target.closest(".exf-ctl-cnt");
        if (cnt) cnt.classList.add("exf-focus");
      });
      this.exo.form.addEventListener("focusout", function (e) {
        var cnt = e.target.closest(".exf-ctl-cnt");

        if (cnt) {
          cnt.classList.remove("exf-focus");

          if (e.target.value == '') {
            cnt.classList.remove('exf-filled');
          }
        }
      });
      this.exo.form.addEventListener("input", function (e) {
        var c = e.target;
        var cnt = c.closest(".exf-ctl-cnt");
        if (cnt) cnt.classList[c.value ? "add" : "remove"]("exf-filled");
      });
    }
  }]);

  return ExoFormTheme;
}();

var ExoFormFluentTheme = /*#__PURE__*/function (_ExoFormTheme) {
  _inherits(ExoFormFluentTheme, _ExoFormTheme);

  var _super = _createSuper(ExoFormFluentTheme);

  function ExoFormFluentTheme() {
    _classCallCheck(this, ExoFormFluentTheme);

    return _super.apply(this, arguments);
  }

  _createClass(ExoFormFluentTheme, [{
    key: "apply",
    value: function apply() {
      _get(_getPrototypeOf(ExoFormFluentTheme.prototype), "apply", this).call(this);

      this.exo.container.classList.add("exf-theme-fluent");
    }
  }]);

  return ExoFormFluentTheme;
}(ExoFormTheme);

var ExoFormMaterialTheme = /*#__PURE__*/function (_ExoFormTheme2) {
  _inherits(ExoFormMaterialTheme, _ExoFormTheme2);

  var _super2 = _createSuper(ExoFormMaterialTheme);

  function ExoFormMaterialTheme() {
    _classCallCheck(this, ExoFormMaterialTheme);

    return _super2.apply(this, arguments);
  }

  _createClass(ExoFormMaterialTheme, [{
    key: "apply",
    value: function apply() {
      _get(_getPrototypeOf(ExoFormMaterialTheme.prototype), "apply", this).call(this);

      this.exo.container.classList.add("exf-theme-material");
      this.exo.form.querySelectorAll("[name][placeholder]").forEach(function (elm) {
        elm.setAttribute("data-placeholder", elm.getAttribute("placeholder") || "");
        elm.removeAttribute("placeholder");
      });
      this.exo.form.addEventListener("focusin", function (e) {
        e.target.setAttribute("placeholder", e.target.getAttribute("data-placeholder") || "");
      });
      this.exo.form.addEventListener("focusout", function (e) {
        e.target.removeAttribute("placeholder");
      });
    }
  }]);

  return ExoFormMaterialTheme;
}(ExoFormTheme);

var ExoFormThemes = /*#__PURE__*/function () {
  function ExoFormThemes() {
    _classCallCheck(this, ExoFormThemes);
  }

  _createClass(ExoFormThemes, null, [{
    key: "getType",
    value: function getType(exo) {
      var type = exo.schema.theme;
      if (typeof type === "undefined" || type === "auto") type = ExoFormThemes.matchTheme(exo);
      var theme = ExoFormThemes.types[type];
      return theme || ExoFormTheme;
    }
  }, {
    key: "matchTheme",
    value: function matchTheme(exo) {
      return "material";
    }
  }]);

  return ExoFormThemes;
}();

_defineProperty(ExoFormThemes, "types", {
  auto: undefined,
  none: ExoFormTheme,
  fluent: ExoFormFluentTheme,
  material: ExoFormMaterialTheme
});

var _default = ExoFormThemes;
exports.default = _default;
},{"../pwa/DOM":"src/pwa/DOM.js"}],"src/exo/ExoFormValidation.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _DOM = _interopRequireDefault(require("../pwa/DOM"));

var _ExoFormFactory = _interopRequireDefault(require("./ExoFormFactory"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ExoFormDefaultValidation = /*#__PURE__*/function () {
  function ExoFormDefaultValidation(exo) {
    _classCallCheck(this, ExoFormDefaultValidation);

    this.exo = exo;
    exo.form.setAttribute('novalidate', true);
  }

  _createClass(ExoFormDefaultValidation, [{
    key: "checkValidity",
    value: function checkValidity() {
      var numInvalid = this.exo.query(function (f) {
        return !f._control.valid;
      }, {
        inScope: true
      }).length;
      return numInvalid === 0;
    }
  }, {
    key: "reportValidity",
    value: function reportValidity(page) {
      var invalidFields = this.exo.query(function (f) {
        return page === undefined ? !f._control.valid : page === f._page.index && !f._control.valid;
      }).map(function (f) {
        return {
          field: f,
          validationMessage: f._control.validationMessage
        };
      });

      if (invalidFields.length) {
        var returnValue = this.exo.triggerEvent(_ExoFormFactory.default.events.reportValidity, {
          invalid: invalidFields
        });

        if (returnValue !== false) {
          console.log(invalidFields);
          this.focus(invalidFields[0].field);
        }
      }
    }
  }, {
    key: "focus",
    value: function focus(field) {
      var element = field._control.htmlElement;

      var f = function f(field) {
        var element = field._control.htmlElement;

        field._control.showValidationError();

        if (!element.form) element = element.querySelector("[name]");
      };

      if (element.offsetParent === null) {
        // currently invisible
        var pgElm = element.closest('[data-page]');

        if (pgElm) {
          var page = parseInt(pgElm.getAttribute("data-page"));
          this.exo.addins.navigation.goto(page);
          setTimeout(function () {
            f(field);
          }, 20);
        }
      } else {
        f(field);
      }

      return true;
    }
  }, {
    key: "isPageValid",
    value: function isPageValid(index) {
      var hasInvalid = false;

      try {
        this.runValidCheck = true; // prevent reportValidity() showing messages on controls 

        hasInvalid = this.exo.schema.pages[index - 1].fields.filter(function (f) {
          return !f._control.valid;
        }).length > 0;
      } finally {
        this.runValidCheck = false;
      }

      return !hasInvalid;
    }
  }, {
    key: "testValidity",
    value: function testValidity(e, field) {
      if (this.runValidCheck) e.preventDefault();
    }
  }]);

  return ExoFormDefaultValidation;
}();

var InlineFieldValidator = /*#__PURE__*/function () {
  function InlineFieldValidator(field) {
    _classCallCheck(this, InlineFieldValidator);

    this._field = field;
    this._cnt = this._field._control.container || this._field._control.htmlElement;
    this._error = null;
    this._onInvalid = this._onInvalid.bind(this); //this._onInput = this._onInput.bind(this);

    this._onChange = this._onChange.bind(this);
    this.bindEventListeners();
  }

  _createClass(InlineFieldValidator, [{
    key: "bindEventListeners",
    value: function bindEventListeners() {
      var _this = this;

      if (this._cnt) {
        this._cnt.querySelectorAll("[name]").forEach(function (c) {
          c.addEventListener('invalid', _this._onInvalid);
        });

        this._cnt.addEventListener("change", this._onChange);
      }
    } // Displays an error message and adds error styles and aria attributes

  }, {
    key: "showError",
    value: function showError() {
      this._field._control.showHelp(this._field._control.validationMessage, {
        type: "invalid"
      });
    } // Hides an error message if one is being displayed
    // and removes error styles and aria attributes

  }, {
    key: "hideError",
    value: function hideError() {
      this._field._control.showHelp();
    } // Suppress the browsers default error messages

  }, {
    key: "_onInvalid",
    value: function _onInvalid(event) {
      event.preventDefault();
    }
  }, {
    key: "_onChange",
    value: function _onChange(event) {
      if (!this._field._control.valid) {
        this.showError();
      } else {
        this.hideError();
      }
    }
  }]);

  return InlineFieldValidator;
}();

var ExoFormInlineValidation = /*#__PURE__*/function (_ExoFormDefaultValida) {
  _inherits(ExoFormInlineValidation, _ExoFormDefaultValida);

  var _super = _createSuper(ExoFormInlineValidation);

  function ExoFormInlineValidation(exo) {
    var _this2;

    _classCallCheck(this, ExoFormInlineValidation);

    _this2 = _super.call(this, exo);
    var form = exo.form;
    exo.on(_ExoFormFactory.default.events.interactive, function (e) {
      exo.query().forEach(function (f) {
        f._control._validator = new InlineFieldValidator(f);
      }); // For some reason without setting the forms novalidate option
      // we are unable to focus on an input inside the form when handling
      // the 'submit' event

      form.setAttribute('novalidate', true);
    });
    return _this2;
  }

  _createClass(ExoFormInlineValidation, [{
    key: "reportValidity",
    value: function reportValidity(page) {
      var cb = page ? function (f) {
        return f._page.index === page && !f._control.valid; // only controls on given page
      } : function (f) {
        return !f._control.valid; // across all pages
      };
      var invalidFields = this.exo.query(cb);
      invalidFields.forEach(function (f) {
        f._control._validator.showError();
      });
    }
  }]);

  return ExoFormInlineValidation;
}(ExoFormDefaultValidation);

var ExoFormValidation = /*#__PURE__*/function () {
  function ExoFormValidation() {
    _classCallCheck(this, ExoFormValidation);
  }

  _createClass(ExoFormValidation, null, [{
    key: "getType",
    value: function getType(exo) {
      var type = exo.schema.validation;
      if (type === "auto" || typeof type === "undefined") type = ExoFormValidation.matchValidationType(exo);
      var tp = ExoFormValidation.types[type];
      return tp || ExoFormDefaultValidation;
    }
  }, {
    key: "matchValidationType",
    value: function matchValidationType(exo) {
      return "inline";
    }
  }]);

  return ExoFormValidation;
}();

_defineProperty(ExoFormValidation, "types", {
  auto: undefined,
  html5: ExoFormDefaultValidation,
  inline: ExoFormInlineValidation
});

var _default = ExoFormValidation;
exports.default = _default;
},{"../pwa/DOM":"src/pwa/DOM.js","./ExoFormFactory":"src/exo/ExoFormFactory.js"}],"src/exo/ExoFormNavigation.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _DOM = _interopRequireDefault(require("../pwa/DOM"));

var _ExoFormFactory = _interopRequireDefault(require("./ExoFormFactory"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ExoFormNavigationBase = /*#__PURE__*/function () {
  function ExoFormNavigationBase(exo) {
    _classCallCheck(this, ExoFormNavigationBase);

    _defineProperty(this, "buttons", {});

    this.exo = exo;
    this._visible = true;
    this._currentPage = 1;
    this.form = exo.form;
  }

  _createClass(ExoFormNavigationBase, [{
    key: "visible",
    get: function get() {
      return this._visible;
    },
    set: function set(value) {
      this._visible = value;
      var cnt = this.form.querySelector(".exf-nav-cnt");
      if (cnt) _DOM.default[this._visible ? "show" : "hide"]();
    }
  }, {
    key: "clear",
    value: function clear() {
      var cnt = this.form.querySelector(".exf-nav-cnt");
      if (cnt) cnt.remove();
    }
  }, {
    key: "render",
    value: function render() {
      var _this = this;

      var tpl =
      /*html*/
      "<fieldset class=\"exf-cnt exf-nav-cnt\"></fieldset>";
      this.container = _DOM.default.parseHTML(tpl);

      for (var b in this.buttons) {
        this.addButton(b, this.buttons[b]);
      }

      this.form.appendChild(this.container);
      this.form.setAttribute("data-current-page", this.currentPage);
      this.form.querySelector(".exf-cnt.exf-nav-cnt").addEventListener("click", function (e) {
        console.log("nav click: " + e.target.name);

        switch (e.target.name) {
          case "next":
            e.preventDefault();

            _this.next();

            break;

          case "prev":
            e.preventDefault();

            _this.back();

            break;
        }
      });
      this.exo.on(_ExoFormFactory.default.events.page, function (e) {
        _this.updateButtonStates();
      });
      this.exo.on(_ExoFormFactory.default.events.pageRelevancyChange, function (e) {
        _this._pageCount = _this.getLastPage();

        _this.updateButtonStates();
      });
      this.exo.on(_ExoFormFactory.default.events.interactive, this._ready.bind(this));
    }
  }, {
    key: "_ready",
    value: function _ready(e) {
      this._pageCount = this.getLastPage();
      this.updateButtonStates();
    }
  }, {
    key: "canMove",
    value: function canMove(fromPage, toPage) {
      // to be subclassed
      console.debug("Check navigation from", fromPage, "to", toPage);
      return true;
    }
  }, {
    key: "addButton",
    value: function addButton(name, options) {
      options = _objectSpread({
        class: "",
        type: "button",
        caption: name,
        name: name
      }, options || {});

      var btn = _DOM.default.parseHTML(
      /*html*/
      "<button name=\"".concat(options.name, "\" type=\"").concat(options.type, "\" class=\"exf-btn ").concat(options.class, "\">").concat(options.caption, "</button>"));

      this.buttons[name].element = btn;
      this.container.appendChild(btn);
    }
  }, {
    key: "_updateView",
    value: function _updateView(add, page) {
      var current = this.currentPage;

      if (add > 0 && current > 0) {
        if (!this.exo.addins.validation.isPageValid(this.currentPage)) {
          this.exo.addins.validation.reportValidity(this.currentPage);
          return;
        }
      }

      if (add !== 0) page = parseInt("0" + this.form.getAttribute("data-current-page")) || 1;
      console.log("updateview 1 -> ", add, page, "current", current);
      page = this._getNextPage(add, page);
      console.log("updateview 2 -> ", add, page, "current", current);
      this._pageCount = this.getLastPage();
      this._currentPage = page;

      if (current > 0) {
        if (!this.canMove(current, page)) return;
        var returnValue = this.exo.triggerEvent(_ExoFormFactory.default.events.beforePage, {
          from: current,
          page: page,
          pageCount: this.pageCount
        });
        if (returnValue === false) return;
      }

      this.form.setAttribute("data-current-page", this.currentPage);
      this.form.setAttribute("data-page-count", this.exo.schema.pages.length);
      this._currentPage = page;
      var i = 0;
      this.form.querySelectorAll('.exf-page[data-page]').forEach(function (p) {
        i++;
        p.classList[i === page ? "add" : "remove"]("active");
      });
      this.update();
      this.exo.triggerEvent(_ExoFormFactory.default.events.page, {
        from: current,
        page: page,
        pageCount: this.pageCount
      });
      return page;
    }
    /**
     * Moves to the next page in a multi-page form.
     */

  }, {
    key: "next",
    value: function next() {
      this._updateView(+1);
    }
    /**
     * Moves to the previous page in a multi-page form.
     */

  }, {
    key: "back",
    value: function back() {
      this._updateView(-1);
    }
    /**
     * Moves to the first page in a multi-page form.
     */

  }, {
    key: "restart",
    value: function restart() {
      this.goto(1);
    }
    /**
     * Moves to the given page in a multi-page form.
     */

  }, {
    key: "goto",
    value: function goto(page) {
      return this._updateView(0, page);
    }
  }, {
    key: "currentPage",
    get: function get() {
      if (!this._currentPage) this._currentPage = 1;
      return this._currentPage;
    }
  }, {
    key: "pageCount",
    get: function get() {
      if (!this._pageCount) this._pageCount = this.getLastPage();
      return this._pageCount;
    }
  }, {
    key: "_getNextPage",
    value: function _getNextPage(add, page) {
      var ok = false;
      var skip;

      do {
        page += add;

        if (page > this.exo.schema.pages.length) {
          return undefined;
        }

        ;
        var pgElm = this.form.querySelector('.exf-page[data-page="' + page + '"]');

        if (pgElm) {
          skip = pgElm.getAttribute("data-skip") === "true";
          console.debug("Wizard Page " + page + " currently " + (skip ? "OUT OF" : "in") + " scope");

          if (!skip) {
            ok = true;
          }
        } else {
          ok = true;
          return undefined;
        }

        if (add === 0) break;
      } while (!ok);

      if (page < 1) page = 1;
      return page;
    }
  }, {
    key: "getLastPage",
    value: function getLastPage() {
      var pageNr = parseInt("0" + this.form.getAttribute("data-current-page")) || 1;
      var lastPage = 0;
      var nextPage = -1;

      do {
        nextPage = this._getNextPage(+1, pageNr);

        if (nextPage) {
          lastPage = nextPage;
          pageNr = nextPage;
        }
      } while (nextPage);

      return lastPage || pageNr || 1;
    }
  }, {
    key: "updateButtonStates",
    value: function updateButtonStates() {
      var prev = this.buttons["prev"];
      if (prev && prev.element) _DOM.default[this.currentPage === 1 ? "disable" : "enable"](prev.element);
      var nxt = this.buttons["next"];
      if (nxt && nxt.element) _DOM.default[this.currentPage === this.pageCount ? "disable" : "enable"](nxt.element);
    }
  }, {
    key: "update",
    value: function update() {}
  }]);

  return ExoFormNavigationBase;
}();

var ExoFormNoNavigation = /*#__PURE__*/function (_ExoFormNavigationBas) {
  _inherits(ExoFormNoNavigation, _ExoFormNavigationBas);

  var _super = _createSuper(ExoFormNoNavigation);

  function ExoFormNoNavigation() {
    _classCallCheck(this, ExoFormNoNavigation);

    return _super.apply(this, arguments);
  }

  return ExoFormNoNavigation;
}(ExoFormNavigationBase);

var ExoFormStaticNavigation = /*#__PURE__*/function (_ExoFormNavigationBas2) {
  _inherits(ExoFormStaticNavigation, _ExoFormNavigationBas2);

  var _super2 = _createSuper(ExoFormStaticNavigation);

  function ExoFormStaticNavigation() {
    _classCallCheck(this, ExoFormStaticNavigation);

    return _super2.apply(this, arguments);
  }

  _createClass(ExoFormStaticNavigation, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      _get(_getPrototypeOf(ExoFormStaticNavigation.prototype), "render", this).call(this);

      this.exo.on(_ExoFormFactory.default.events.renderReady, function (e) {
        //TODO fix this 
        setTimeout(function () {
          _this2.form.querySelectorAll(".exf-page").forEach(function (elm) {
            elm.style.display = "block";
          });
        }, 1);
      });
    }
  }]);

  return ExoFormStaticNavigation;
}(ExoFormNavigationBase);

var ExoFormDefaultNavigation = /*#__PURE__*/function (_ExoFormNavigationBas3) {
  _inherits(ExoFormDefaultNavigation, _ExoFormNavigationBas3);

  var _super3 = _createSuper(ExoFormDefaultNavigation);

  function ExoFormDefaultNavigation() {
    var _this3;

    _classCallCheck(this, ExoFormDefaultNavigation);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this3 = _super3.call.apply(_super3, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this3), "buttons", {
      "send": {
        caption: "Submit",
        class: "form-post"
      }
    });

    return _this3;
  }

  _createClass(ExoFormDefaultNavigation, [{
    key: "render",
    value: function render() {
      var _this4 = this;

      _get(_getPrototypeOf(ExoFormDefaultNavigation.prototype), "render", this).call(this);

      this.buttons["send"].element.addEventListener("click", function (e) {
        e.preventDefault();

        _this4.exo.submitForm();
      });
    }
  }]);

  return ExoFormDefaultNavigation;
}(ExoFormNavigationBase);

var ExoFormWizardNavigation = /*#__PURE__*/function (_ExoFormDefaultNaviga) {
  _inherits(ExoFormWizardNavigation, _ExoFormDefaultNaviga);

  var _super4 = _createSuper(ExoFormWizardNavigation);

  function ExoFormWizardNavigation() {
    var _this5;

    _classCallCheck(this, ExoFormWizardNavigation);

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    _this5 = _super4.call.apply(_super4, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this5), "buttons", {
      prev: {
        "caption": "Back",
        "class": "form-prev"
      },
      next: {
        "caption": "Next ↵",
        "class": "form-next"
      },
      send: {
        caption: "Submit",
        class: "form-post"
      }
    });

    return _this5;
  }

  return ExoFormWizardNavigation;
}(ExoFormDefaultNavigation);

var ExoFormSurveyNavigation = /*#__PURE__*/function (_ExoFormWizardNavigat) {
  _inherits(ExoFormSurveyNavigation, _ExoFormWizardNavigat);

  var _super5 = _createSuper(ExoFormSurveyNavigation);

  function ExoFormSurveyNavigation() {
    var _this6;

    _classCallCheck(this, ExoFormSurveyNavigation);

    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    _this6 = _super5.call.apply(_super5, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this6), "multiValueFieldTypes", ["checkboxlist", "tags"]);

    return _this6;
  }

  _createClass(ExoFormSurveyNavigation, [{
    key: "render",
    value: // TODO better solution
    function render() {
      var _ = this;

      _get(_getPrototypeOf(ExoFormSurveyNavigation.prototype), "render", this).call(this);

      var check = function check(e) {
        var exf = e.target.closest("[data-exf]");

        if (exf && exf.data && exf.data.field) {
          _.checkForward(exf.data.field, "change", e);
        }
      };

      _.exo.form.querySelector(".exf-wrapper").addEventListener("change", check);

      _.exo.form.addEventListener("keydown", function (e) {
        if (e.keyCode === 8) {
          // backspace - TODO: Fix 
          if (e.target.value === "" && !e.target.selectionStart || e.target.selectionStart === 0) {
            _.this.back();

            e.preventDefault();
            e.returnValue = false;
          }
        } else if (e.keyCode === 13) {
          // enter
          if (e.target.type !== "textarea") {
            var exf = e.target.closest("[data-exf]");

            var field = _ExoFormFactory.default.getFieldFromElement(exf);

            _.checkForward(field, "enter", e);

            e.preventDefault();
            e.returnValue = false;
          }
        }
      });

      _.exo.on(_ExoFormFactory.default.events.page, function (e) {
        _.focusFirstControl();
      });

      var container = _.exo.form.closest(".exf-container");

      container.classList.add("exf-survey");

      _.exo.on(_ExoFormFactory.default.events.interactive, function (e) {
        _.exo.form.style.height = container.offsetHeight + "px";

        _.exo.form.querySelectorAll(".exf-page").forEach(function (p) {
          p.style.height = container.offsetHeight + "px";
        });
      });
    }
  }, {
    key: "focusFirstControl",
    value: function focusFirstControl() {
      var first = this.exo.form.querySelector(".exf-page.active .exf-ctl-cnt");

      if (first && first.offsetParent !== null) {
        first.closest(".exf-page").scrollIntoView();
        setTimeout(function (e) {
          var ctl = first.querySelector("[name]");
          if (ctl && ctl.offsetParent) ctl.focus();
        }, 20);
      }
    }
  }, {
    key: "checkForward",
    value: function checkForward(f, eventName, e) {
      if (!this.exo.container) {
        return;
      }

      this.exo.container.classList.remove("end-reached");
      this.exo.container.classList.remove("step-ready"); //var isValid = f._control.htmlElement.reportValidity ? f._control.htmlElement.reportValidity() : true;

      var isValid = f._control.valid;

      if (isValid || !this.multiValueFieldTypes.includes(f.type)) {
        if (this._currentPage == this.getLastPage()) {
          this.exo.container.classList.add("end-reached");
          this.form.appendChild(this.exo.container.querySelector(".exf-nav-cnt"));
        } else {
          // special case: detail.field included - workaround 
          var type = f.type;
          if (e.detail && e.detail.field) type = e.detail.field;

          if (!["checkboxlist", "tags"].includes(type)) {
            // need metadata from controls
            this.exo.addins.navigation.next();
          } else {
            this.exo.container.classList.add("step-ready");
          }

          f._control.container.appendChild(this.exo.container.querySelector(".exf-nav-cnt"));
        }
      }
    }
  }]);

  return ExoFormSurveyNavigation;
}(ExoFormWizardNavigation);

var ExoFormNavigation = /*#__PURE__*/function () {
  function ExoFormNavigation() {
    _classCallCheck(this, ExoFormNavigation);
  }

  _createClass(ExoFormNavigation, null, [{
    key: "getType",
    value: function getType(exo) {
      var type = exo.schema.navigation;
      if (typeof type === "undefined" || type === "auto") type = ExoFormNavigation.matchNavigationType(exo);
      return ExoFormNavigation.types[type];
    }
  }, {
    key: "matchNavigationType",
    value: function matchNavigationType(exo) {
      if (exo.schema.pages.length > 1) return "wizard";
      return "default";
    }
  }]);

  return ExoFormNavigation;
}();

_defineProperty(ExoFormNavigation, "types", {
  auto: undefined,
  none: ExoFormNoNavigation,
  static: ExoFormStaticNavigation,
  default: ExoFormDefaultNavigation,
  wizard: ExoFormWizardNavigation,
  survey: ExoFormSurveyNavigation
});

var _default = ExoFormNavigation;
exports.default = _default;
},{"../pwa/DOM":"src/pwa/DOM.js","./ExoFormFactory":"src/exo/ExoFormFactory.js"}],"src/exo/ExoFormProgress.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _DOM = _interopRequireDefault(require("../pwa/DOM"));

var _ExoFormFactory = _interopRequireDefault(require("./ExoFormFactory"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ExoFormNoProgress = /*#__PURE__*/function () {
  function ExoFormNoProgress(exo) {
    _classCallCheck(this, ExoFormNoProgress);

    this.exo = exo;
    this.nav = exo.addins.navigation;
  }

  _createClass(ExoFormNoProgress, [{
    key: "render",
    value: function render() {
      var _this = this;

      this.exo.on(_ExoFormFactory.default.events.page, function (e) {
        console.debug(_this, "Paging", e);
      });
    }
  }]);

  return ExoFormNoProgress;
}();

var ExoFormDefaultProgress = /*#__PURE__*/function (_ExoFormNoProgress) {
  _inherits(ExoFormDefaultProgress, _ExoFormNoProgress);

  var _super = _createSuper(ExoFormDefaultProgress);

  function ExoFormDefaultProgress() {
    _classCallCheck(this, ExoFormDefaultProgress);

    return _super.apply(this, arguments);
  }

  return ExoFormDefaultProgress;
}(ExoFormNoProgress);

var ExoFormPageProgress = /*#__PURE__*/function (_ExoFormDefaultProgre) {
  _inherits(ExoFormPageProgress, _ExoFormDefaultProgre);

  var _super2 = _createSuper(ExoFormPageProgress);

  function ExoFormPageProgress() {
    _classCallCheck(this, ExoFormPageProgress);

    return _super2.apply(this, arguments);
  }

  _createClass(ExoFormPageProgress, [{
    key: "render",
    value: function render() {
      _get(_getPrototypeOf(ExoFormPageProgress.prototype), "render", this).call(this);

      var elms = this.exo.form.querySelectorAll(".exf-page:not([data-skip='true']) > legend");
      var index = 1;

      if (elms.length > 1) {
        elms.forEach(function (l) {
          l.innerHTML += " <span class=\"exf-pg-prg\">(".concat(index, "/").concat(elms.length, ")</span>");
          index++;
        });
      }
    }
  }]);

  return ExoFormPageProgress;
}(ExoFormDefaultProgress);

var ExoFormStepsProgress = /*#__PURE__*/function (_ExoFormDefaultProgre2) {
  _inherits(ExoFormStepsProgress, _ExoFormDefaultProgre2);

  var _super3 = _createSuper(ExoFormStepsProgress);

  function ExoFormStepsProgress() {
    var _this2;

    _classCallCheck(this, ExoFormStepsProgress);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this2 = _super3.call.apply(_super3, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this2), "container", null);

    _defineProperty(_assertThisInitialized(_this2), "templates", {
      progressbar:
      /*html*/
      "\n            <nav class=\"exf-wiz-step-cnt\">\n                <div class=\"step-wizard\" role=\"navigation\">\n                <div class=\"progress\">\n                    <div class=\"progressbar empty\"></div>\n                    <div class=\"progressbar prog-pct\"></div>\n                </div>\n                <ul>\n                    {{inner}}\n                </ul>\n                </div>\n                \n            </nav>",
      progressstep:
      /*html*/
      "\n            <li class=\"\">\n                <button type=\"button\" id=\"step{{step}}\">\n                    <div class=\"step\">{{step}}</div>\n                    <div class=\"title\">{{pagetitle}}</div>\n                </button>\n            </li>"
    });

    return _this2;
  }

  _createClass(ExoFormStepsProgress, [{
    key: "render",
    value: function render() {
      var _this3 = this;

      _get(_getPrototypeOf(ExoFormStepsProgress.prototype), "render", this).call(this);

      var _ = this;

      _.container = _DOM.default.parseHTML(_.templates.progressbar.replace("{{inner}}", ""));
      _.ul = _.container.querySelector("ul");
      var nr = 0;

      _.exo.schema.pages.forEach(function (p) {
        nr++;

        _.ul.appendChild(_DOM.default.parseHTML(_DOM.default.format(_this3.templates.progressstep, {
          step: nr,
          pagetitle: p.legend
        })));
      });

      _.container.querySelectorAll(".step-wizard ul button").forEach(function (b) {
        b.addEventListener("click", function (e) {
          var step = parseInt(b.querySelector("div.step").innerText);

          _.exo.addins.navigation[step > 0 ? "next" : "back"]();
        });
      });

      _.exo.on(window.xo.form.factory.events.page, function (e) {
        _.setClasses();
      }); //return this.container;


      this.exo.container.insertBefore(this.container, this.exo.form);
    }
  }, {
    key: "setClasses",
    value: function setClasses() {
      var _ = this;

      var index = _.nav.currentPage;

      var steps = _.nav.getLastPage();

      if (!_.container) return;
      if (index < 0 || index > steps) return;
      var p = (index - 1) * (100 / steps);

      var pgb = _.container.querySelector(".progressbar.prog-pct");

      if (pgb) pgb.style.width = p + "%";
      var ix = 0;

      _.container.querySelectorAll("ul li").forEach(function (li) {
        ix++;
        li.classList[ix === index ? "add" : "remove"]("active");
        li.classList[_.exo.addins.validation.isPageValid(ix) ? "add" : "remove"]("done");
      });

      _.container.querySelectorAll(".exf-wiz-step-cnt .step-wizard li").forEach(function (li) {
        li.style.width = 100 / steps + "%";
      });
    }
  }]);

  return ExoFormStepsProgress;
}(ExoFormDefaultProgress);

var ExoFormSurveyProgress = /*#__PURE__*/function (_ExoFormDefaultProgre3) {
  _inherits(ExoFormSurveyProgress, _ExoFormDefaultProgre3);

  var _super4 = _createSuper(ExoFormSurveyProgress);

  function ExoFormSurveyProgress() {
    _classCallCheck(this, ExoFormSurveyProgress);

    return _super4.apply(this, arguments);
  }

  return ExoFormSurveyProgress;
}(ExoFormDefaultProgress);

var ExoFormProgress = /*#__PURE__*/function () {
  function ExoFormProgress() {
    _classCallCheck(this, ExoFormProgress);
  }

  _createClass(ExoFormProgress, null, [{
    key: "getType",
    value: function getType(exo) {
      var type = exo.schema.progress;
      if (typeof type === "undefined" || type === "auto") type = ExoFormProgress.matchProgressType(exo);
      return ExoFormProgress.types[type];
    }
  }, {
    key: "matchProgressType",
    value: function matchProgressType(exo) {
      if (exo.schema.pages.length > 1) {
        if (exo.schema.navigation === "static") return "none";
        return "page";
      }

      return "default";
    }
  }]);

  return ExoFormProgress;
}();

_defineProperty(ExoFormProgress, "types", {
  auto: undefined,
  none: ExoFormNoProgress,
  default: ExoFormDefaultProgress,
  page: ExoFormPageProgress,
  steps: ExoFormStepsProgress,
  survey: ExoFormSurveyProgress
});

var _default = ExoFormProgress;
exports.default = _default;
},{"../pwa/DOM":"src/pwa/DOM.js","./ExoFormFactory":"src/exo/ExoFormFactory.js"}],"src/exo/ExoFormRules.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ExoForm = _interopRequireDefault(require("./ExoForm"));

var _DOM = _interopRequireDefault(require("../pwa/DOM"));

var _Core = _interopRequireDefault(require("../pwa/Core"));

var _ExoFormFactory = _interopRequireDefault(require("./ExoFormFactory"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ExoRuleEngineBase = /*#__PURE__*/function () {
  function ExoRuleEngineBase(exo) {
    _classCallCheck(this, ExoRuleEngineBase);

    this.exo = exo;
  }

  _createClass(ExoRuleEngineBase, [{
    key: "checkRules",
    value: function checkRules() {} // for subclassing

  }]);

  return ExoRuleEngineBase;
}();

var ExoRuleEngine = /*#__PURE__*/function (_ExoRuleEngineBase) {
  _inherits(ExoRuleEngine, _ExoRuleEngineBase);

  var _super = _createSuper(ExoRuleEngine);

  function ExoRuleEngine() {
    var _this;

    _classCallCheck(this, ExoRuleEngine);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "ruleMethods", {
      visible: [Field.show, Field.hide],
      enabled: [Field.enable, Field.disable],
      scope: [Page.scope, Page.descope],
      customMethod: [Field.callCustomMethod, function () {}],
      goto: [Page.goto, function () {}],
      dialog: [Dialog.show, function () {}]
    });

    return _this;
  }

  _createClass(ExoRuleEngine, [{
    key: "interpretRule",
    value: // Interpret rules like "msg_about,change,value,!,''"
    function interpretRule(objType, f, rule) {
      var _ = this;

      var obj = _ExoFormFactory.default.fieldToString(f);

      console.debug("Rules: running rule on " + obj + " -> [", rule.expression.join(', ') + "]");

      if (rule.expression.length === 5) {
        var method = _.ruleMethods[rule.type];

        if (method) {
          var dependencyField = _.getRenderedControl(rule.expression[0]);

          if (dependencyField) {
            var dependencyControl = dependencyField.querySelector("[name]");
            if (!dependencyControl) dependencyControl = dependencyField;

            if (!dependencyControl) {
              console.error("Rules: dependency control for rule on '" + obj + "' not found");
            } else {
              console.debug("Rules: dependency control for rule on '" + obj + "': ", dependencyControl.name);

              var func = function func(e) {
                console.debug("Event '" + rule.expression[1] + "' fired on ", _DOM.default.elementPath(e));
                var ruleArgs = rule.expression.slice(2, 5);

                var expressionMatched = _.testRule.apply(_, [f, dependencyControl].concat(_toConsumableArray(ruleArgs)));

                console.debug("Rules: rule", ruleArgs, "matched: ", expressionMatched);
                var index = expressionMatched ? 0 : 1;
                var rf = method[index];
                console.debug("Rules: applying rule", rule.expression[1], obj);
                rf.apply(f._control.htmlElement, [{
                  event: e,
                  field: f,
                  exoForm: _.exo,
                  rule: rule,
                  dependency: dependencyControl
                }]);

                var host = _.getEventHost(dependencyControl);

                _.setupEventEventListener({
                  field: f,
                  host: host,
                  rule: rule,
                  eventType: rule.expression[1],
                  method: func
                });
              };

              func({
                target: dependencyControl
              });
            }

            ;
          } else {
            console.warn("Dependency field for", f, "not found with id '" + rule.expression[0] + "'");
          }
        } else {
          console.error("Rule method for rule type", rule.type, "on field", f);
        }
      }
    }
  }, {
    key: "setupEventEventListener",
    value: function setupEventEventListener(settings) {
      if (settings.eventType === "livechange") {
        settings.eventType = "input";
      }

      console.debug("Setting up event listener of type '" + settings.eventType + "' on ", _DOM.default.elementToString(settings.host));
      settings.host.addEventListener(settings.eventType, settings.method);
    }
  }, {
    key: "getRenderedControl",
    value: function getRenderedControl(id) {
      return this.exo.form.querySelector('[data-id="' + id + '"]');
    }
  }, {
    key: "checkRules",
    value: function checkRules() {
      var _ = this;

      _.exo.schema.pages.forEach(function (p) {
        if (Array.isArray(p.rules)) {
          console.debug("Checking page rules", p);
          p.rules.forEach(function (r) {
            if (Array.isArray(r.expression)) {
              _.interpretRule("page", p, r);
            }
          });
        }

        p.fields.forEach(function (f) {
          if (Array.isArray(f.rules)) {
            console.debug("Checking field rules", f);
            f.rules.forEach(function (r) {
              if (Array.isArray(r.expression)) {
                _.interpretRule("field", f, r);
              }
            });
          }
        });
      });
    }
  }, {
    key: "testRule",
    value: function testRule(f, control, value, compare, rawValue) {
      var t = undefined;
      var v = this.exo.getFieldValue(control);

      try {
        t = _Core.default.scopeEval(this, "return " + rawValue);
      } catch (ex) {
        console.error("Error evaluating rule control value for ", control, compare, v, rawValue, ex);
        throw "Error evaluating " + rawValue;
      }

      console.debug("Value of '" + control.name + "' =", v);
      return _Core.default.compare(compare, v, t);
    }
  }, {
    key: "getEventHost",
    value: function getEventHost(ctl) {
      var eh = ctl.closest('[data-evtarget="true"]');
      return eh || ctl;
    }
  }]);

  return ExoRuleEngine;
}(ExoRuleEngineBase);

var ExoFormRules = /*#__PURE__*/function () {
  function ExoFormRules() {
    _classCallCheck(this, ExoFormRules);
  }

  _createClass(ExoFormRules, null, [{
    key: "getType",
    value: function getType(exo) {
      var type = exo.schema.rules;
      if (typeof type === "undefined" || type === "auto") type = ExoFormRules.matchRuleEngineType(exo);
      return ExoFormRules.types[type];
    }
  }, {
    key: "matchRuleEngineType",
    value: function matchRuleEngineType(exo) {
      return "default";
    }
  }]);

  return ExoFormRules;
}();

_defineProperty(ExoFormRules, "types", {
  auto: undefined,
  none: ExoRuleEngineBase,
  default: ExoRuleEngine
});

var Field = /*#__PURE__*/function () {
  function Field() {
    _classCallCheck(this, Field);
  }

  _createClass(Field, null, [{
    key: "show",
    value: function show(obj) {
      _DOM.default.show(obj.field._control.container);
    }
  }, {
    key: "hide",
    value: function hide(obj) {
      _DOM.default.hide(obj.field._control.container);
    }
  }, {
    key: "enable",
    value: function enable(obj) {
      _DOM.default.enable(obj.field._control.htmlElement);
    }
  }, {
    key: "disable",
    value: function disable(obj) {
      _DOM.default.disable(obj.field._control.htmlElement);
    }
  }, {
    key: "callCustomMethod",
    value: function callCustomMethod(obj) {
      if (!obj || !obj.exoForm) throw "Invalid invocation of callCustomMethod";
      var method = obj.rule.method;

      if (method) {
        var f = obj.exoForm.options.customMethods[method];
        f.apply(obj.exoForm, [obj]);
      }
    }
  }]);

  return Field;
}();

var Page = /*#__PURE__*/function () {
  function Page() {
    _classCallCheck(this, Page);
  }

  _createClass(Page, null, [{
    key: "scope",
    value: function scope(obj) {
      obj.field._control.container.removeAttribute("data-skip");
    }
  }, {
    key: "descope",
    value: function descope(obj) {
      obj.field._control.container.setAttribute("data-skip", "true");
    }
  }, {
    key: "goto",
    value: function goto(obj) {
      return obj.exoForm.addins.navigation.goto(obj.rule.page);
    }
  }]);

  return Page;
}(); //TODO


var Dialog = /*#__PURE__*/function () {
  function Dialog() {
    _classCallCheck(this, Dialog);
  }

  _createClass(Dialog, null, [{
    key: "show",
    value: function show(obj) {//TODO
    }
  }]);

  return Dialog;
}();

var _default = ExoFormRules;
exports.default = _default;
},{"./ExoForm":"src/exo/ExoForm.js","../pwa/DOM":"src/pwa/DOM.js","../pwa/Core":"src/pwa/Core.js","./ExoFormFactory":"src/exo/ExoFormFactory.js"}],"src/exo/ExoFormSchema.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Core = _interopRequireDefault(require("../pwa/Core"));

var _ExoFormFactory = _interopRequireDefault(require("./ExoFormFactory"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ExoFormSchema = /*#__PURE__*/function () {
  function ExoFormSchema(options) {
    _classCallCheck(this, ExoFormSchema);

    _defineProperty(this, "types", {
      unknown: undefined,
      js: "javascript",
      json: "json"
    });

    _Core.default.addEvents(this); // add simple event system


    this._type = this.types.undefined;
    this.options = options || {};
  }

  _createClass(ExoFormSchema, [{
    key: "parse",
    value: function parse(schemaData) {
      if (_typeof(schemaData) !== "object") {
        var test = _ExoFormFactory.default.tryScriptLiteral(schemaData);

        if (test) {
          this._type = this.types.js;
          schemaData = test;
        } else {
          try {
            schemaData = JSON.parse(schemaData);
            this._type = this.types.json;
          } catch (ex) {
            throw "ExoFormSchema: could not convert string to ExoForm schema: " + ex.toString();
          }
        }
      }

      if (!schemaData || !schemaData.pages || !Array.isArray(schemaData.pages)) throw "ExoFormSchema: invalid ExoForm schema";
      this._schemaData = _objectSpread(_objectSpread({}, this.options.defaults || {}), schemaData);
      this._schemaData.form = this._schemaData.form || {};
      this._schemaData.pages = this._schemaData.pages || [];
      this._totalFieldCount = this.query().length;
    }
  }, {
    key: "triggerEvent",
    value: function triggerEvent(eventName, detail, ev) {
      console.debug("Triggering event", eventName, "detail: ", detail);

      if (!ev) {
        ev = new Event(eventName, {
          bubbles: false,
          cancelable: true
        });
      }

      ev.detail = _objectSpread({
        exoForm: this
      }, detail || {});
      return this.dispatchEvent(ev);
    }
  }, {
    key: "type",
    get: function get() {
      return this._type;
    }
    /**
    * Adds an event handler
    * @param {string} eventName - Name of the event to listen to - Use xo.form.factory.events as a reference
    * @param {function} func - function to attach 
    * @return {object} - The ExoForm instance
    */

  }, {
    key: "on",
    value: function on(eventName, func) {
      console.debug("ExoFormSchema: listening to event", {
        name: eventName,
        f: func
      });
      this.addEventListener(eventName, func);
      return this;
    }
  }, {
    key: "data",
    get: function get() {
      return this._schemaData;
    }
  }, {
    key: "navigation",
    get: function get() {
      return this._schemaData.navigation;
    }
  }, {
    key: "validation",
    get: function get() {
      return this._schemaData.validation;
    }
  }, {
    key: "progress",
    get: function get() {
      return this._schemaData.progress;
    }
  }, {
    key: "rules",
    get: function get() {
      return this._schemaData.rules;
    }
  }, {
    key: "theme",
    get: function get() {
      return this._schemaData.theme;
    }
  }, {
    key: "guessType",
    value: function guessType() {
      if (this.model && typeof this.model.logic === "function") {
        return this.types.js;
      }

      return this.types.json;
    }
  }, {
    key: "toString",
    value: function toString(mode) {
      if (typeof mode === "undefined") mode = this.type || this.guessType();

      switch (mode) {
        case "js":
        case "javascript":
          return this.toJSString();

        case "json":
          return this.toJSONString();
      }

      return _get(_getPrototypeOf(ExoFormSchema.prototype), "toString", this).call(this);
    }
  }, {
    key: "toJSONString",
    value: function toJSONString() {
      var data = _objectSpread({}, this._schemaData);

      this.logicToJson(data);
      var result = JSON.stringify(data, function (key, value) {
        if (key.startsWith("_")) return undefined;
        return value;
      }, 2);
      return result;
    }
  }, {
    key: "logicToJson",
    value: function logicToJson(data) {
      var logic;

      if (data.model && typeof data.model.logic === "function") {
        logic = data.model.logic;
        data.model.logic = {
          type: "JavaScript",
          lines: this.getFunctionBodyLines(logic)
        };
      }
    }
  }, {
    key: "logicToJs",
    value: function logicToJs(data) {
      if (data.model && _typeof(data.model.logic) === "object" && data.model.logic.type === "JavaScript" && Array.isArray(data.model.logic.lines)) {
        var body = data.model.logic.lines.map(function (l) {
          return '\t\t' + l.trim();
        }).join('\n');
        data.model.logic = new Function("context", body);
      }
    }
  }, {
    key: "getFunctionBodyLines",
    value: function getFunctionBodyLines(f) {
      var body = f.toString();
      var p = body.indexOf("{");

      if (p !== -1) {
        body = body.substring(p + 1);
        var parts = body.split('}');
        parts.length--;
        body = parts.join('}');
        var lines = body.split('\n');
        lines = lines.map(function (l) {
          return l.trim();
        }).filter(function (l) {
          return l.length > 0;
        });
        return lines;
      }

      return null;
    }
  }, {
    key: "toJSString",
    value: function toJSString() {
      var data = _objectSpread({}, this._schemaData);

      this.logicToJs(data);

      var str = _Core.default.stringifyJs(data, null, 2);

      str = str.replace("function anonymous(context\n) {", "context => {");
      return "const schema = " + str;
    }
  }, {
    key: "form",
    get: function get() {
      return this._schemaData.form;
    }
  }, {
    key: "pages",
    get: function get() {
      return this._schemaData.pages;
    }
  }, {
    key: "model",
    get: function get() {
      return this._schemaData.model;
    }
    /**
     * query all fields using matcher and return matches
     * @param {function} matcher - function to use to filter
     * @param {object} options - query options. e.g. {inScope: true} for querying only fields that are currenttly in scope.
     * @return {array} - All matched fields in the current ExoForm schema
     */

  }, {
    key: "query",
    value: function query(matcher, options) {
      if (matcher === undefined) matcher = function matcher() {
        return true;
      };
      options = options || {};
      var matches = [];
      if (!this._schemaData || !this._schemaData.pages || !Array.isArray(this._schemaData.pages)) return matches;
      var pageIndex = 0;
      var fieldIndex = 0;

      this._schemaData.pages.forEach(function (p) {
        fieldIndex = 0;

        if (matcher(p, {
          type: "page",
          pageIndex: pageIndex
        })) {
          if (Array.isArray(p.fields)) {
            p.fields.forEach(function (f) {
              f._page = {
                index: pageIndex
              };

              if (matcher(f, {
                type: "field",
                fieldIndex: fieldIndex
              })) {
                matches.push(f);
              }

              fieldIndex++;
            });
          }
        }
      });

      return matches;
    }
  }, {
    key: "fieldCount",
    get: function get() {
      return this._totalFieldCount;
    }
  }]);

  return ExoFormSchema;
}();

var _default = ExoFormSchema;
exports.default = _default;
},{"../pwa/Core":"src/pwa/Core.js","./ExoFormFactory":"src/exo/ExoFormFactory.js"}],"src/exo/ExoFormFactory.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ExoFormContext = void 0;

var _ExoForm = _interopRequireDefault(require("./ExoForm"));

var _ExoBaseControls = _interopRequireDefault(require("./ExoBaseControls"));

var _ExoExtendedControls = _interopRequireDefault(require("./ExoExtendedControls"));

var _ExoDevControls = _interopRequireDefault(require("./ExoDevControls"));

var _ExoChartControls = _interopRequireDefault(require("./ExoChartControls"));

var _ExoSchemaGenerator = _interopRequireDefault(require("./ExoSchemaGenerator"));

var _ExoFormThemes = _interopRequireDefault(require("./ExoFormThemes"));

var _ExoFormValidation = _interopRequireDefault(require("./ExoFormValidation"));

var _ExoFormNavigation = _interopRequireDefault(require("./ExoFormNavigation"));

var _ExoFormProgress = _interopRequireDefault(require("./ExoFormProgress"));

var _ExoFormRules = _interopRequireDefault(require("./ExoFormRules"));

var _ExoFormSchema = _interopRequireDefault(require("./ExoFormSchema"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Hosts an ExoForm context to create forms with.
 * Created using {ExoFormFactory}.build()
 * 
 * @hideconstructor
 */
var ExoFormContext = /*#__PURE__*/function () {
  function ExoFormContext(config) {
    _classCallCheck(this, ExoFormContext);

    this.config = config;
    this.baseUrl = document.location.origin;
    this.library = this._enrichMeta(config.library);
  }

  _createClass(ExoFormContext, [{
    key: "_enrichMeta",
    value: function _enrichMeta(library) {
      var form = this.createForm({
        internal: true
      });
      form.load({
        pages: [{}]
      });

      for (var name in library) {
        var field = library[name];
        var context = {
          exo: form,
          field: {
            name: name,
            type: name
          }
        };
        var control = name !== "base" ? new field.type(context) : {
          acceptedProperties: []
        };
        field.returns = field.returnValueType ? field.returnValueType.name : "None";
        field.element = control.htmlElement ? control.htmlElement.tagName.toLowerCase() : "none";
        field.properties = this._getProps(field, field.type, control);
        field._key = name;
      }

      return library;
    }
  }, {
    key: "_getProps",
    value: function _getProps(field, type, control) {
      var ar = {};

      if (field.returnValueType) {
        ar.name = {
          type: "string",
          description: "Name of the field. Determines posted value key"
        };
        ar.required = {
          type: "boolean",
          description: "Makes the field required. The form cannot be posted when the user has not entered a value in thisn field."
        };
      }

      ar.caption = {
        type: "string",
        description: "Caption text. Normally shown in a label element within the field container"
      };

      if (control && control.acceptedProperties.length) {
        control.acceptedProperties.forEach(function (p) {
          var name = p;

          if (_typeof(p) === "object") {
            name = p.name;
          }

          delete p.name;
          p.type = p.type || String;
          p.type = p.type.name;
          ar[name] = p;
        });
      }

      return ar;
    }
  }, {
    key: "createForm",
    value: function createForm(options) {
      // the only place where an ExoForm instance can be created       
      return new _ExoForm.default(this, options);
    }
  }, {
    key: "createSchema",
    value: function createSchema() {
      return new _ExoFormSchema.default(this);
    }
  }, {
    key: "get",
    value: function get(type) {
      return this.library[type];
    }
    /**
    * Searches the control library using @param {Function} callback.
    * @return {Array} - list of matched controls.
    */

  }, {
    key: "query",
    value: function query(callback) {
      for (var name in this.library) {
        var field = this.library[name];
        if (callback.apply(this, [field])) return field;
      }
    }
  }, {
    key: "isExoFormControl",
    value: function isExoFormControl(formSchemaField) {
      var field = this.get(formSchemaField.type);
      return field.type.prototype instanceof ExoFormFactory.library.base.type;
    }
  }, {
    key: "renderSingleControl",
    value: function renderSingleControl(field) {
      return this.createForm().renderSingleControl(field);
    }
  }, {
    key: "createGenerator",
    value: function createGenerator() {
      return new _ExoSchemaGenerator.default();
    }
  }]);

  return ExoFormContext;
}();
/**
 * Factory class for ExoForm - Used to create an ExoForm context.
 * Provides factory methods. Starting point for using ExoForm. 
 * 
 * @hideconstructor
 */


exports.ExoFormContext = ExoFormContext;

var ExoFormFactory = /*#__PURE__*/function () {
  function ExoFormFactory() {
    _classCallCheck(this, ExoFormFactory);
  }

  _createClass(ExoFormFactory, null, [{
    key: "build",
    value: //TODO: add all relevant classes

    /**
     * Build {ExoFormContext} instance.
     * 
     */
    function build(options) {
      var _this = this;

      options = options || {};
      return new Promise(function (resolve, reject) {
        var promises = [];
        options = _objectSpread(_objectSpread({}, _this.defaults), options); //options.imports = options.imports || this.defaults.imports;
        // add standard controls from Base Libraries

        _this.add(_ExoBaseControls.default.controls);

        _this.add(_ExoExtendedControls.default.controls);

        _this.add(_ExoDevControls.default.controls);

        _this.add(_ExoChartControls.default.controls);

        if (options.add) {
          var _options$imports;

          (_options$imports = options.imports).push.apply(_options$imports, _toConsumableArray(options.add));
        }

        options.imports.forEach(function (imp) {
          promises.push(ExoFormFactory.loadLib(imp));
        });
        Promise.all(promises).then(function () {
          var lib = ExoFormFactory.buildLibrary();
          console.debug("ExoFormFactory: loaded library", lib, "from", options.imports);
          resolve(new ExoFormContext(_objectSpread(_objectSpread({}, options), {}, {
            library: lib
          })));
        });
      });
    }
  }, {
    key: "buildLibrary",
    value: function buildLibrary() {
      for (var name in ExoFormFactory.library) {
        var field = ExoFormFactory.library[name];
        field.typeName = name;
        field.returnValueType = String;
        field.type = this.lookupBaseType(name, field);
        field.isList = field.type.prototype instanceof ExoFormFactory.library.list.type;

        if (field.isList) {
          field.isMultiSelect = field.type.isMultiSelect;
        }

        field.returnValueType = field.type.returnValueType;

        if (["date"].includes(field.typeName)) {
          field.returnValueType = Date;
        }
      }

      return ExoFormFactory.library;
    }
  }, {
    key: "lookupBaseType",
    value: function lookupBaseType(name, field) {
      var type = field.type;

      while (type === undefined) {
        if (field.base) {
          field = this.library[field.base];
          if (!field) console.error("Invalid base type", field.base);
          type = field.type;

          if (!(type.prototype instanceof ExoFormFactory.library.base.type)) {
            console.error("Class for " + name + " is not derived from ExoControlBase");
          }
        } else {
          break;
        }
      }

      return type;
    }
  }, {
    key: "loadLib",
    value: function () {
      var _loadLib = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(src) {
        var lib, customType;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return import(src);

              case 2:
                lib = _context.sent;
                customType = lib.default;
                this.add(customType.controls);

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function loadLib(_x) {
        return _loadLib.apply(this, arguments);
      }

      return loadLib;
    }() // called from library implementations

  }, {
    key: "add",
    value: function add(lib) {
      for (var name in lib) {
        var field = lib[name];
        ExoFormFactory.library[name] = field;
      }
    }
  }, {
    key: "listNativeProps",
    value: function listNativeProps(ctl) {
      var type = ctl.__proto__;
      var list = Object.getOwnPropertyNames(type);
      var ar =
      /* id added 26 Apr 2021*/
      ["id", "style", "class", "accesskey", "contenteditable", "dir", "disabled", "hidefocus", "lang", "language", "tabindex", "title", "unselectable", " xml:lang"];
      list.forEach(function (p) {
        var d = Object.getOwnPropertyDescriptor(type, p);
        var hasSetter = d.set !== undefined;

        if (hasSetter) {
          ar.push(p.toLowerCase());
        }
      });
      return ar;
    }
  }, {
    key: "loadCustomControl",
    value: function loadCustomControl(f, src) {
      return ExoFormFactory.importType(src);
    }
  }, {
    key: "importType",
    value: function () {
      var _importType = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(src) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return import(src);

              case 2:
                return _context2.abrupt("return", _context2.sent);

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function importType(_x2) {
        return _importType.apply(this, arguments);
      }

      return importType;
    }()
  }, {
    key: "tryScriptLiteral",
    value: function tryScriptLiteral(scriptLiteral) {
      var schema;

      if (typeof scriptLiteral === "string" && scriptLiteral.trim().startsWith("const")) {
        try {
          var f = new Function("function s(){" + scriptLiteral + "; return schema};return s()");
          schema = f.call();
        } catch (ex) {//
        }

        ;
        return schema;
      }
    }
  }, {
    key: "checkTypeConversion",
    value: function checkTypeConversion(type, rawValue) {
      var fieldMeta = ExoFormFactory.library[type];
      var value = undefined;

      if (fieldMeta) {
        try {
          var parse = ExoFormFactory.getTypeParser(fieldMeta);
          value = parse(rawValue);
          if (value !== rawValue) console.debug("ExoFormFactory: value '", rawValue, "' for field", type, " converted to", value, _typeof(value));
        } catch (ex) {
          console.error("Error converting '" + value + "'to " + fieldMeta.returnValueType, ex);
        }
      }

      return value;
    }
  }, {
    key: "getTypeParser",
    value: function getTypeParser(fieldMeta) {
      var type = fieldMeta.returnValueType;

      switch (type) {
        case Number:
          return Number.parseFloat;

        case Date:
          return ExoFormFactory.parseDate;

        case Boolean:
          return ExoFormFactory.parseBoolean;

        default:
          return function (v) {
            return v;
          };
      }
    }
  }, {
    key: "parseDate",
    value: function parseDate(value) {
      var dateValue = Date.parse(value);
      if (!isNaN(dateValue)) return new Date(dateValue).toJSON();
      return dateValue;
    }
  }, {
    key: "parseBoolean",
    value: function parseBoolean(value) {
      return parseInt(value) > 0 || value === "1" || value === "true" || value === "on";
    }
  }, {
    key: "getFieldFromElement",
    value: function getFieldFromElement(e, options) {
      options = _objectSpread({
        master: false
      }, options || {});
      var field = null;

      if (e.getAttribute("data-exf")) {
        field = e.data["field"];
      } else if (e.classList.contains("exf-ctl-cnt")) {
        e = e.querySelector("[data-exf]");

        if (e) {
          field = e.data["field"];
        }
      } else {
        e = e.closest("[data-exf]");

        if (e) {
          field = e.data["field"];
        }
      }

      if (e && options.master) {
        var masterElement = e.closest("[exf-data-master]");

        if (masterElement) {
          e = masterElement;
          field = e.data["field"];
        }
      }

      return field;
    }
  }, {
    key: "fieldToString",
    value: function fieldToString(f) {
      if (f) {
        var type = f.type || "unknown type";
        if (f.isPage) return "Page " + f.index + " (" + type + ")";else if (f.name || f.id && f.elm) return "Field '" + (f.name || f.id) + "' (" + type + ")";
      }

      return "Unknown field";
    }
  }]);

  return ExoFormFactory;
}();

_defineProperty(ExoFormFactory, "_ev_pfx", "exf-ev-");

_defineProperty(ExoFormFactory, "events", {
  schemaLoaded: ExoFormFactory._ev_pfx + "form-loaded",
  // when loading the form schema is complete
  renderStart: ExoFormFactory._ev_pfx + "render-start",
  // when form rendering starts
  getListItem: ExoFormFactory._ev_pfx + "get-list-item",
  // 
  renderReady: ExoFormFactory._ev_pfx + "render-ready",
  // when form rendering is complete
  interactive: ExoFormFactory._ev_pfx + "form-interactive",
  // when form is actually shown to user
  reportValidity: ExoFormFactory._ev_pfx + "report-validity",
  // when form control validity is reported
  dataModelChange: ExoFormFactory._ev_pfx + "datamodel-change",
  // when the underlying datamodel to which the form is bound changes
  beforePage: ExoFormFactory._ev_pfx + "before-page",
  // cancellable - called just before paging
  page: ExoFormFactory._ev_pfx + "page",
  // after moving to other page
  pageRelevancyChange: ExoFormFactory._ev_pfx + "page-relevancy-change",
  // when a page's relevancy state changes (e.g. moves in/out of scope)
  post: ExoFormFactory._ev_pfx + "post",
  // on form post/submit
  error: ExoFormFactory._ev_pfx + "error" // when any error occurs

});

_defineProperty(ExoFormFactory, "meta", {
  navigation: {
    type: _ExoFormNavigation.default,
    description: "Navigation component"
  },
  validation: {
    type: _ExoFormValidation.default,
    description: "Validation component"
  },
  progress: {
    type: _ExoFormProgress.default,
    description: "Progress display component"
  },
  theme: {
    type: _ExoFormThemes.default,
    description: "Theme component"
  },
  rules: {
    type: _ExoFormRules.default,
    description: "Rules component"
  }
});

_defineProperty(ExoFormFactory, "Context", ExoFormContext);

_defineProperty(ExoFormFactory, "defaults", {
  imports: [],
  defaults: {
    navigation: "auto",
    validation: "default",
    progress: "auto",
    theme: "material"
  }
});

_defineProperty(ExoFormFactory, "html", {
  classes: {
    formContainer: "exf-container",
    pageContainer: "exf-page",
    elementContainer: "exf-ctl-cnt",
    groupContainer: "exf-input-group",
    groupElementCaption: "exf-caption"
  }
});

_defineProperty(ExoFormFactory, "library", {});

var _default = ExoFormFactory;
exports.default = _default;
},{"./ExoForm":"src/exo/ExoForm.js","./ExoBaseControls":"src/exo/ExoBaseControls.js","./ExoExtendedControls":"src/exo/ExoExtendedControls.js","./ExoDevControls":"src/exo/ExoDevControls.js","./ExoChartControls":"src/exo/ExoChartControls.js","./ExoSchemaGenerator":"src/exo/ExoSchemaGenerator.js","./ExoFormThemes":"src/exo/ExoFormThemes.js","./ExoFormValidation":"src/exo/ExoFormValidation.js","./ExoFormNavigation":"src/exo/ExoFormNavigation.js","./ExoFormProgress":"src/exo/ExoFormProgress.js","./ExoFormRules":"src/exo/ExoFormRules.js","./ExoFormSchema":"src/exo/ExoFormSchema.js"}],"src/pwa/RouteModule.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var RouteModule = /*#__PURE__*/function () {
  function RouteModule(app, route, path) {
    _classCallCheck(this, RouteModule);

    _defineProperty(this, "title", "Module");

    _defineProperty(this, "menuIcon", "ti-test");

    this.route = route;
    this.app = app;
    this.path = path;
    if (!app) throw "RouteModule constructor parameter 'app' not defined";
    if (!app.config) throw "app.config not defined";
  }

  _createClass(RouteModule, [{
    key: "init",
    value: function init() {} // called just after instantiation. To be subclassed

  }, {
    key: "_unload",
    value: function _unload() {
      document.head.querySelectorAll("[data-pwa]").forEach(function (e) {
        e.remove();
      });
      this.unload();
    }
  }, {
    key: "unload",
    value: function unload() {// to be implemented by subclasser
    } // subclass this if you need async stuff to be initialized

  }, {
    key: "asyncInit",
    value: function () {
      var _asyncInit = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", Promise.resolve());

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function asyncInit() {
        return _asyncInit.apply(this, arguments);
      }

      return asyncInit;
    }()
  }, {
    key: "execute",
    value: function execute() {
      var _arguments = arguments;

      var _ = this;

      _.asyncInit().then(function () {
        _._beforeRender();

        if (_.app.UI.areas.title) _.app.UI.areas.title.set(_.title);

        _.render.apply(_, _toConsumableArray(_arguments));
      });
    }
  }, {
    key: "render",
    value: function render() {}
  }, {
    key: "_beforeRender",
    value: function _beforeRender() {
      var _ = this;

      for (var a in _.app.UI.areas) {
        _.app.UI.areas[a].empty = false;
      }
    }
  }]);

  return RouteModule;
}();

var _default = RouteModule;
exports.default = _default;
},{}],"src/pwa/Router.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _DOM = _interopRequireDefault(require("./DOM"));

var _Core = _interopRequireDefault(require("./Core"));

var _RouteModule = _interopRequireDefault(require("./RouteModule"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Router = /*#__PURE__*/function () {
  function Router(app, routes, settings) {
    _classCallCheck(this, Router);

    _defineProperty(this, "modules", []);

    var _ = this;

    _Core.default.addEvents(this); // add simple event system


    _.app = app;
    _.routes = routes;

    _.setupHashListener(settings.onRoute);

    console.debug("Loading Route modules");

    _.loadModules().then(function () {
      console.debug("Loaded Route modules", _.modules);

      _DOM.default.trigger(window, 'hashchange');
    }).then(function () {
      console.debug("Router Ready");
      settings.ready();
    });
  }

  _createClass(Router, [{
    key: "_triggerEvent",
    value: function _triggerEvent(eventName, detail, ev) {
      console.debug("Triggering event", eventName, "detail: ", detail);

      if (!ev) {
        ev = new Event(eventName, {
          "bubbles": false,
          "cancelable": false
        });
      }

      ev.detail = _objectSpread({
        router: this
      }, detail || {});
      return this.dispatchEvent(ev);
    }
  }, {
    key: "on",
    value: function on(eventName, func) {
      console.debug("Listening to event", eventName, func);
      this.addEventListener(eventName, func);
      return this;
    }
  }, {
    key: "setupHashListener",
    value: function setupHashListener(callback) {
      var _this = this;

      this.routeCallback = function (m, p) {
        _this._triggerEvent(Router.events.route, {
          module: m,
          path: p
        });

        callback(m, p);
      };

      var _ = this;

      window.addEventListener('hashchange', function () {
        _.hashChanged();
      });
    }
  }, {
    key: "hashChanged",
    value: function hashChanged() {
      var _ = this;

      var W = window;
      var h = W.location.hash.substr(1);

      if (h.startsWith("/")) {
        var id = "/" + h.substr(1).split('/')[0];
        var path = h.substr(id.length);
        var route = _.routes[id];
        console.debug(W.location.hash, "RouteModule: ", route);

        if (route) {
          var m = _.findByRoute(route);

          if (m && m.module) {
            _._route = id;
            var html = document.querySelector("html");
            html.classList.forEach(function (c) {
              if (c.startsWith("route-")) {
                html.classList.remove(c);
              }
            });
            document.querySelector("html").classList.add("route-" + m.module.constructor.name);

            if (_.current) {
              _.current.module._unload();
            }

            _.current = m;

            _.routeCallback(m.module, path);
          }
        } else if (!h.startsWith("dlg-")) {
          _.home();
        }
      } else {
        _.home();
      }
    }
  }, {
    key: "route",
    get: function get() {
      return this._route;
    },
    set: function set(routePath) {
      if (!routePath.startsWith("/")) throw "Invalid route";
      var routeParts = routePath.substring(1).split('/');

      if (this.routes["/" + routeParts[0]]) {
        Router.changeHash(routePath); // update history, prevent endless redirects back to home router

        this.hashChanged();
      } else throw "Unknown route: " + routePath;
    }
  }, {
    key: "findByRoute",
    value: function findByRoute(route) {
      return this.modules.find(function (x) {
        return x.route === route;
      });
    }
  }, {
    key: "findById",
    value: function findById(id) {
      return this.modules.find(function (x) {
        return x.path === id;
      });
    }
  }, {
    key: "loadModules",
    value: function loadModules() {
      var _ = this;

      var promises = [];
      var homeRouteFound = false;

      var _loop = function _loop() {
        if (r === "/") homeRouteFound = true;
        var route = _.routes[r];
        if (!r.startsWith('/')) throw "Malformed route: " + r;
        promises.push(new Promise(function (resolve, reject) {
          if (route.prototype && route.prototype instanceof _RouteModule.default) {
            var o = new route(_.app, route, r);
            resolve(o);
          } else if (typeof route === "string") {
            _.loadES6Module(route, _.app, route, r).then(function (o) {
              resolve(o);
            });
          }
        }));
      };

      for (var r in _.routes) {
        _loop();
      }

      if (!homeRouteFound) {
        throw "Router misconfiguration: no home (/) route found";
      }

      return Promise.all(promises).then(function (e) {
        e.forEach(function (o) {
          _.modules.push(_objectSpread(_objectSpread({}, o), {}, {
            route: o.route,
            url: "#" + o.path,
            module: o
          }));
        });
      });
    }
  }, {
    key: "loadES6Module",
    value: function loadES6Module(src) {
      var _ = this;

      src = new URL(src, this.app.config.baseUrl);
      var args = Array.prototype.slice.call(arguments, 1);

      var imp = /*#__PURE__*/function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(src) {
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.prev = 0;
                  _context.next = 3;
                  return import(
                  /* webpackMode: "eager" */
                  src);

                case 3:
                  return _context.abrupt("return", _context.sent);

                case 6:
                  _context.prev = 6;
                  _context.t0 = _context["catch"](0);
                  throw "Could not load " + src + ": " + _context.t0;

                case 9:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, null, [[0, 6]]);
        }));

        return function imp(_x) {
          return _ref.apply(this, arguments);
        };
      }();

      return imp(src).then(function (x) {
        var h = x.default;

        var mod = _construct(h, _toConsumableArray(args));

        mod.init();
        return mod;
      });
    }
  }, {
    key: "home",
    value: function home() {
      this.route = "/";
    }
  }, {
    key: "generateMenu",
    value: function generateMenu(menu) {
      var _this2 = this;

      var _ = this;

      var menuTpl =
      /*html*/
      "<nav class=\"main-menu\"><ul>{{inner}}</ul></nav>";
      var menuItemTpl =
      /*html*/
      "<li class=\"{{class}}\" data-module=\"{{name}}\" title=\"{{title}}\"><a href=\"{{url}}\"><span class=\"{{menuIcon}}\"></span> <span class=\"name\">{{menuTitle}}</span></a></li>";
      var ar = [];

      _.modules.forEach(function (m) {
        if (!m.hidden) {
          var o = _objectSpread(_objectSpread({}, m), {}, {
            name: m.module.constructor.name
          });

          o.menuTitle = o.menuTitle || m.title;

          var s = _DOM.default.format(menuItemTpl, o);

          ar.push(s);
        }
      });

      var ul = _DOM.default.format(menuTpl, {
        inner: ar.join('')
      });

      menu.add(_DOM.default.parseHTML(ul));
      menu.element.addEventListener("click", function (e) {
        var _ = _this2;

        if (e.target.closest("li")) {
          _.app.UI.areas.menu.element.classList.add("clicked");

          if (!_this2.touchStarted) {
            setTimeout(function () {
              _.app.UI.areas.menu.element.classList.remove("clicked");

              _.touchStarted = false;
            }, 1500);
          }
        }
      }); // handle special mobile case to prevent menu from opening 
      // when mouse

      menu.element.addEventListener("touchstart", function (e) {
        _this2.touchStarted = true;

        if (_.config.areas.menu) {
          var _menu = e.target.closest(_.config.areas.menu);

          if (_menu) {
            if (e.target.closest("li")) {
              _menu.classList.add("clicked");
            } else {
              _menu.classList.remove("clicked");
            }
          }
        }
      });
      return menu;
    }
  }], [{
    key: "changeHash",
    value: function changeHash(anchor) {
      history.replaceState(null, null, document.location.pathname + '#' + anchor);
    }
  }]);

  return Router;
}();

_defineProperty(Router, "_ev_pfx", "pwa-ev-");

_defineProperty(Router, "events", {
  route: Router._ev_pfx + "route"
});

var _default = Router;
exports.default = _default;
},{"./DOM":"src/pwa/DOM.js","./Core":"src/pwa/Core.js","./RouteModule":"src/pwa/RouteModule.js"}],"src/pwa/PWA_Notifications.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _DOM = _interopRequireDefault(require("./DOM"));

var _Core = _interopRequireDefault(require("./Core"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PWA_Notifications = /*#__PURE__*/function () {
  function PWA_Notifications(ui) {
    _classCallCheck(this, PWA_Notifications);

    this.UI = ui;
  }

  _createClass(PWA_Notifications, [{
    key: "add",
    value: function add(msg, options) {
      options = options || {
        type: "info"
      };
      if (!msg) msg = "An unknown error has occurred";else if (typeof msg !== "string") msg = msg.toString();
      var tpl =
      /*html*/
      "\n            <div class=\"pwa-notif pwa-{{type}}\">\n                <div class=\"pwa-cnt\">\n                    <span>{{msg}}</span>\n                    <div class=\"pwa-notif-btns\"></div>\n                    <progress value=\"100\" max=\"100\"></progress>\n                </div>\n            </div>\n        ";

      var notif = _DOM.default.parseHTML(_DOM.default.format(tpl, {
        type: options.type,
        msg: msg
      }));

      if (options.buttons) {
        var notifBtn = notif.querySelector(".pwa-notif-btns");

        var _loop = function _loop() {
          var btn = options.buttons[b];

          var btnHtml = _DOM.default.parseHTML(_DOM.default.format("<button class=\"exf-btn\">{{caption}}</button>", btn));

          notifBtn.appendChild(btnHtml);
          btnHtml.addEventListener("click", function (e) {
            e.stopPropagation();
            btn.click(e);
          });
        };

        for (var b in options.buttons) {
          _loop();
        }
      }

      notif.addEventListener("click", function () {
        notif.remove();
      });
      var timeout = options.timeout || 2000 + msg.split(' ').length * 200;
      document.body.appendChild(notif);
      var prog = notif.querySelector("progress");
      prog.setAttribute("value", "100");
      var i = 100,
          countDown;
      countDown = setInterval(function () {
        i--;
        prog.setAttribute("value", i.toString());
        if (i <= 0) clearInterval(countDown);
      }, timeout / 100);
      setTimeout(function () {
        notif.classList.add("move-out");
        setTimeout(function () {
          notif.remove();
        }, 2000);
      }, timeout);
    }
  }]);

  return PWA_Notifications;
}();

var _default = PWA_Notifications;
exports.default = _default;
},{"./DOM":"src/pwa/DOM.js","./Core":"src/pwa/Core.js"}],"src/pwa/PWA_Area.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _DOM = _interopRequireDefault(require("./DOM"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PWA_Area = /*#__PURE__*/function () {
  function PWA_Area(name, element) {
    _classCallCheck(this, PWA_Area);

    this.name = name;

    var _ = this;

    _.element = element;

    _.checkPinnable();
  }

  _createClass(PWA_Area, [{
    key: "add",
    value: function add(e) {
      if (!e) return;

      try {
        if (typeof e == "string") {
          if (e.indexOf('<') === -1) e = _DOM.default.parseHTML('<span>' + e + '</span>');else e = _DOM.default.parseHTML(e);
        }

        this.element.appendChild(e);
      } catch (ex) {
        throw "Area.add failed for " + e + ". " + ex.toString();
      }
    }
  }, {
    key: "set",
    value: function set(s) {
      this.element.innerHTML = s;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.set("");
    }
  }, {
    key: "checkPinnable",
    value: function checkPinnable() {
      var _ = this;

      if (_.element.classList.contains("pwa-pinnable")) {
        // check hover over pin icon (cannot be done using CSS, since it's a pseudo-element - :before )
        _.element.addEventListener("mouseover", function (e) {
          var overPin = e.offsetX > _.element.offsetWidth - 70 && e.offsetY < 70;

          if (overPin) {
            _.pinActive = true;

            _.element.classList.add("pin-active");
          } else if (_.pinActive) {
            _.pinActive = false;

            _.element.classList.remove("pin-active");
          }
        });

        _.element.addEventListener("click", function (e) {
          if (_.pinActive) {
            _.pinned = !_.pinned;
          }
        });
      }
    }
  }, {
    key: "pinned",
    get: function get() {
      return this.element.classList.contains("pinned");
    },
    set: function set(value) {
      this.element.classList[value ? "add" : "remove"]("pinned");

      if (!value) {
        this.element.classList.remove("pin-active");
      }
    } // bosy state

  }, {
    key: "busy",
    get: function get() {
      this.element.classList.add("pwa-loading");
    } // empty state
    ,
    set: function set(value) {
      if (value) {
        this.element.classList.add("pwa-loading");
      } else {
        this.element.classList.remove("pwa-loading");
      }
    }
  }, {
    key: "empty",
    get: function get() {
      return this.element.classList.includes("pwa-empty-state");
    },
    set: function set(value) {
      var _this = this;

      clearTimeout(this.rtimer);
      clearTimeout(this.atimer);

      if (value) {
        this.element.classList.remove("remove");
        this.rtimer = setTimeout(function () {
          _this.element.classList.remove("add");
        }, 100);
        this.element.classList.add("pwa-empty-state", "add");
      } else {
        this.element.classList.add("remove");
        this.rtimer = setTimeout(function () {
          _this.element.classList.remove("pwa-empty-state", "remove");
        }, 500);
      }
    }
  }]);

  return PWA_Area;
}();

var _default = PWA_Area;
exports.default = _default;
},{"./DOM":"src/pwa/DOM.js"}],"src/pwa/PWA_UI.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _PWA_Notifications = _interopRequireDefault(require("./PWA_Notifications"));

var _PWA_Area = _interopRequireDefault(require("./PWA_Area"));

var _DOM = _interopRequireDefault(require("../pwa/DOM"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var PWA_UI = /*#__PURE__*/function () {
  function PWA_UI(pwa) {
    _classCallCheck(this, PWA_UI);

    _defineProperty(this, "_dirtyMessage", 'If you continue your changes will not be saved.');

    _defineProperty(this, "_dirty", false);

    _defineProperty(this, "areas", {});

    _defineProperty(this, "notifications", new _PWA_Notifications.default(this));

    var _ = this;

    this.pwa = pwa;
    this.html = document.querySelector("html");

    if (this.pwa.id) {
      this.html.setAttribute("id", this.pwa.id);
    }

    this.pwa.config.UI.user = {
      prefersDarkScheme: window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)").matches : false,
      currentTheme: localStorage.getItem("theme") || "light"
    };

    if (!this.pwa.config.UI.allowUserSelection) {
      this.html.classList.add("no-user-select");
    }

    if ('ontouchstart' in window) {
      this.html.classList.add('pwa-touch');
    }

    if (this.forceTheme) {
      this.theme = this.forceTheme;
    } else {
      if (this.pwa.config.UI.user.currentTheme === undefined) {
        this.theme = this.pwa.config.UI.user.prefersDarkScheme ? "dark" : "light";
      } else {
        this.theme = this.pwa.config.UI.user.currentTheme;
      }
    }

    window.addEventListener("beforeunload", function (event) {
      // Cancel the event as stated by the standard.
      event.preventDefault(); // Chrome requires returnValue to be set.

      if (!_.dirty) delete event['returnValue'];else {
        event.returnValue = '';
      }
    });

    this._setAreas();
  }

  _createClass(PWA_UI, [{
    key: "dirty",
    get: function get() {
      return this._dirty;
    },
    set: function set(value) {
      this._dirty = true;
    }
  }, {
    key: "_setAreas",
    value: function _setAreas() {
      var _this = this;

      var ar = document.querySelectorAll("[data-pwa-area]");
      if (!ar.length) throw "No PWA areas defined";
      ar.forEach(function (element) {
        var areaName = element.getAttribute("data-pwa-area");
        _this.areas[areaName] = new _PWA_Area.default(areaName, element);
      });
    }
  }, {
    key: "theme",
    get: function get() {
      return this._theme || "light";
    },
    set: function set(value) {
      this._theme = value;
      var schemes = document.querySelector("head > meta[name='color-scheme']");

      if (schemes) {
        schemes.setAttribute("content", value);
        localStorage.setItem("theme", value);
        document.querySelector("html").classList.remove("theme-dark", "theme-light");
        document.querySelector("html").classList.add("theme-" + value);
      } else {
        console.warn("Theming depends on meta[name='color-scheme']");
      }

      this.pwa._triggerEvent("pwa.theme", {
        theme: value
      });
    }
  }, {
    key: "addStyleSheet",
    value: function addStyleSheet(url) {
      _DOM.default.addStyleSheet(url, {
        "data-pwa": this.pwa.router.current.path
      });
    }
  }, {
    key: "showDialog",
    value: function () {
      var _showDialog = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(options) {
        var ctx, frm;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return window.xo.form.factory.build();

              case 2:
                ctx = _context.sent;
                frm = ctx.createForm();
                frm.renderSingleControl(_objectSpread(_objectSpread({}, options || {}), {}, {
                  type: "dialog"
                })).then(function (r) {
                  var f = window.xo.form.factory.getFieldFromElement(r);

                  f._control.show();
                });

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function showDialog(_x) {
        return _showDialog.apply(this, arguments);
      }

      return showDialog;
    }()
  }]);

  return PWA_UI;
}();

var _default = PWA_UI;
exports.default = _default;
},{"./PWA_Notifications":"src/pwa/PWA_Notifications.js","./PWA_Area":"src/pwa/PWA_Area.js","../pwa/DOM":"src/pwa/DOM.js"}],"src/pwa/PWA_EventHub.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _DOM = _interopRequireDefault(require("./DOM"));

var _Core = _interopRequireDefault(require("./Core"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PWA_EventHub = /*#__PURE__*/function () {
  function PWA_EventHub(app) {
    _classCallCheck(this, PWA_EventHub);

    this.app = app;

    _Core.default.addEvents(this); // add simple event system

  }

  _createClass(PWA_EventHub, [{
    key: "init",
    value: function () {
      var _init = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _this = this;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", new Promise(function (resolve, reject) {
                  var sr = _this.app.config.signalR;
                  var reactiveData = {
                    isConnected: false
                  };

                  if (sr && sr.enabled) {
                    _DOM.default.require("https://cdn.jsdelivr.net/npm/@aspnet/signalr@1.1.2/dist/browser/signalr.js", function () {
                      var signalRConnection = new signalR.HubConnectionBuilder().withUrl(sr.notificationServiceUrl + "/api").configureLogging(signalR.LogLevel[sr.logLevel]) //don't use in production
                      . //don't use in production
                      build();
                      signalRConnection.on('newMessage', function (msg) {
                        console.debug("signalR", msg);

                        _this._triggerEvent(msg.notificationDTO.useCase, _objectSpread({}, msg.notificationDTO));
                      });
                      signalRConnection.onclose(function () {
                        return console.log('disconnected');
                      });
                      console.log("Starting signalR connection ", sr.notificationServiceUrl);
                      signalRConnection.start().then(function () {
                        return reactiveData.isConnected = true;
                      }).catch(console.error);
                      resolve();
                    });
                  } else {
                    resolve();
                  }
                }));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function init() {
        return _init.apply(this, arguments);
      }

      return init;
    }()
  }, {
    key: "on",
    value: function on(eventName, func) {
      console.debug("PWA_EventHub: listening to event", {
        name: eventName,
        f: func
      });
      this.addEventListener(eventName, func);
      return this;
    }
  }, {
    key: "_triggerEvent",
    value: function _triggerEvent(eventName, detail, ev) {
      console.debug("PWA_EventHub: triggering event", eventName, "detail: ", detail);

      if (!ev) {
        ev = new Event(eventName, {
          bubbles: false,
          cancelable: true
        });
      }

      ev.detail = _objectSpread({
        eventHub: this
      }, detail || {});
      return this.dispatchEvent(ev);
    }
  }]);

  return PWA_EventHub;
}();

var _default = PWA_EventHub;
exports.default = _default;
},{"./DOM":"src/pwa/DOM.js","./Core":"src/pwa/Core.js"}],"src/pwa/PWA_RESTService.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PWA_RESTService = /*#__PURE__*/function () {
  function PWA_RESTService(app) {
    _classCallCheck(this, PWA_RESTService);

    this.app = app;
  }

  _createClass(PWA_RESTService, [{
    key: "send",
    value: function send(endpoint, options) {
      var _ = this;

      var headers = new Headers();
      options = options || {};
      endpoint = new URL(endpoint, this.app.config.baseUrl);

      var fetchOptions = _objectSpread({
        method: "GET"
      }, options);

      var tokenAcquirer = function tokenAcquirer(scope) {
        return Promise.resolve();
      };

      if (!options.isAnonymous) {
        tokenAcquirer = function tokenAcquirer() {
          return _.app.getToken.apply(_.app);
        };
      }

      return tokenAcquirer().then(function (r) {
        if (r && r.accessToken) {
          headers.append("Authorization", "Bearer " + r.accessToken);
        } else {
          console.warn("No JWT Token provided. Continuing anonymously");
        }

        if (options.headers) {
          for (var h in options.headers) {
            headers.append(h, options.headers[h]);
          }
        }

        fetchOptions.headers = headers;

        if (fetchOptions.method === "DELETE") {
          return fetch(endpoint, fetchOptions);
        }

        return fetch(endpoint, fetchOptions).then(function (x) {
          return x.json();
        });
      });
    }
  }, {
    key: "get",
    value: function get(endpoint, options) {
      options = _objectSpread(_objectSpread({}, options || {}), {}, {
        method: "GET"
      });
      return this.send(endpoint, options);
    }
  }, {
    key: "post",
    value: function post(endpoint, options) {
      options = _objectSpread(_objectSpread({}, options || {}), {}, {
        method: "POST"
      });
      return this.send(endpoint, options);
    }
  }, {
    key: "put",
    value: function put(endpoint, options) {
      options = _objectSpread(_objectSpread({}, options || {}), {}, {
        method: "PUT"
      });
      return this.send(endpoint, options);
    }
  }, {
    key: "delete",
    value: function _delete(endpoint, options) {
      options = _objectSpread(_objectSpread({}, options || {}), {}, {
        method: "DELETE"
      });
      return this.send(endpoint, options);
    }
  }]);

  return PWA_RESTService;
}();

var _default = PWA_RESTService;
exports.default = _default;
},{}],"src/pwa/PWA.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Core = _interopRequireDefault(require("./Core"));

var _Router = _interopRequireDefault(require("./Router"));

var _RouteModule = _interopRequireDefault(require("./RouteModule"));

var _PWA_UI = _interopRequireDefault(require("./PWA_UI"));

var _PWA_EventHub = _interopRequireDefault(require("./PWA_EventHub"));

var _PWA_RESTService = _interopRequireDefault(require("./PWA_RESTService"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var PWA = /*#__PURE__*/function () {
  function PWA(options) {
    var _this = this;

    _classCallCheck(this, PWA);

    _defineProperty(this, "defaults", {
      UI: {
        allowUserSelection: false
      },
      serviceWorker: {
        src: null
      }
    });

    var _ = this;

    _Core.default.addEvents(this); // add simple event system


    document.querySelector("html").classList.add("pwa-signin-pending");
    this.config = _objectSpread(_objectSpread({}, this.defaults), options || {});
    this.config.baseUrl = document.location.origin;
    this.config.environment = ["localhost", "127.0.0.1"].includes(document.location.hostname) ? "debug" : "prod";
    console.debug("Checking for serviceWorker in config: serviceWorker.src");

    if (_.config.serviceWorker.src) {
      _._registerWorker(_.config.serviceWorker);
    }

    console.debug("PWA Config", this.config);
    this.restService = new _PWA_RESTService.default(this);
    this.eventHub = new _PWA_EventHub.default(this);
    this.eventHub.init().then(function () {
      _this.asyncInit().then(function () {
        _this.UI = new _PWA_UI.default(_this);

        _.init();

        _.execute();
      });
    });
    var cl = document.querySelector("html").classList;
    this.forceTheme = cl.contains("theme-dark") ? "dark" : cl.contains("theme-light") ? "light" : undefined;
    cl.add("pwa-env-" + this.config.environment);
  }

  _createClass(PWA, [{
    key: "_triggerEvent",
    value: function _triggerEvent(eventName, detail, ev) {
      console.debug("Triggering event", eventName, "detail: ", detail);

      if (!ev) {
        ev = new Event(eventName, {
          "bubbles": false,
          "cancelable": true
        });
      }

      ev.detail = _objectSpread({
        app: this
      }, detail || {});
      return this.dispatchEvent(ev);
    }
  }, {
    key: "on",
    value: function on(eventName, func) {
      console.debug("PWA: listening to event", {
        name: eventName,
        f: func
      });
      this.addEventListener(eventName, func);
      return this;
    }
  }, {
    key: "_registerWorker",
    value: function _registerWorker(serviceWorker) {
      console.debug("Register PWA ServiceWoker..." + serviceWorker.src);

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(serviceWorker.src).then(function (registration) {
          console.debug('Registration successful, scope is:', registration.scope);
          /*
          registration.sync.register('myFirstSync');
          
          _.addEventListener('sync', function(event) {
              if (event.tag == 'myFirstSync') {
                  event.waitUntil(doSomeStuff());
              }
          });
          */
        }).catch(function (error) {
          console.log('Service worker registration failed, error:', error);
        });
      }
    }
  }, {
    key: "init",
    value: function init() {// to subclass
    }
  }, {
    key: "asyncInit",
    value: function asyncInit() {
      return Promise.resolve();
    }
  }, {
    key: "execute",
    value: function execute(async) {
      var _this2 = this;

      var _ = this;

      this.setupUI();
      _.router = new _Router.default(_, this.config.routes, {
        onRoute: function onRoute(mod, path) {
          console.debug("PWA Executes Route", mod, path);

          if (!_this2._triggerEvent("pwa.route", {
            module: mod,
            path: path
          })) {
            return;
          }

          mod.execute(path);
        },
        ready: function ready() {
          console.debug("PWA Router Ready");

          _.routerReady();
        }
      });
    }
  }, {
    key: "rest",
    value: function rest(endpoint, options) {
      return this.restService.send(endpoint, options);
    }
  }, {
    key: "signedIn",
    get: function get() {
      return window.account != null;
    }
  }, {
    key: "getToken",
    value: function getToken() {
      // to be subclassed
      return Promise.resolve();
    }
  }, {
    key: "setupUI",
    value: function setupUI() {} // to be subclassed

  }, {
    key: "routerReady",
    value: function routerReady() {} // to be subclassed

  }]);

  return PWA;
}();

_defineProperty(PWA, "RouteModule", _RouteModule.default);

_defineProperty(PWA, "Router", _Router.default);

var _default = PWA;
exports.default = _default;
},{"./Core":"src/pwa/Core.js","./Router":"src/pwa/Router.js","./RouteModule":"src/pwa/RouteModule.js","./PWA_UI":"src/pwa/PWA_UI.js","./PWA_EventHub":"src/pwa/PWA_EventHub.js","./PWA_RESTService":"src/pwa/PWA_RESTService.js"}],"src/exo/ExoRouteModule.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _PWA = _interopRequireDefault(require("../pwa/PWA"));

var _ExoFormFactory = _interopRequireDefault(require("./ExoFormFactory"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var ExoRouteModule = /*#__PURE__*/function (_PWA$RouteModule) {
  _inherits(ExoRouteModule, _PWA$RouteModule);

  var _super = _createSuper(ExoRouteModule);

  function ExoRouteModule() {
    _classCallCheck(this, ExoRouteModule);

    return _super.apply(this, arguments);
  }

  _createClass(ExoRouteModule, [{
    key: "asyncInit",
    value: // subclass PWA.RouteModule for modules to
    // get an ExoFormContext to create ExoForms
    function () {
      var _asyncInit = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _ExoFormFactory.default.build();

              case 2:
                this.exoContext = _context.sent;

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function asyncInit() {
        return _asyncInit.apply(this, arguments);
      }

      return asyncInit;
    }()
  }]);

  return ExoRouteModule;
}(_PWA.default.RouteModule);

var _default = ExoRouteModule;
exports.default = _default;
},{"../pwa/PWA":"src/pwa/PWA.js","./ExoFormFactory":"src/exo/ExoFormFactory.js"}],"src/exo/ExoWizardRouteModule.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ExoFormFactory = _interopRequireDefault(require("./ExoFormFactory"));

var _DOM = _interopRequireDefault(require("../pwa/DOM"));

var _ExoRouteModule2 = _interopRequireDefault(require("./ExoRouteModule"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ExoWizardRouteModule = /*#__PURE__*/function (_ExoRouteModule) {
  _inherits(ExoWizardRouteModule, _ExoRouteModule);

  var _super = _createSuper(ExoWizardRouteModule);

  function ExoWizardRouteModule() {
    var _this;

    _classCallCheck(this, ExoWizardRouteModule);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "title", "Wizard");

    _defineProperty(_assertThisInitialized(_this), "menuIcon", "ti-wand");

    return _this;
  }

  _createClass(ExoWizardRouteModule, [{
    key: "formLoaded",
    value: function formLoaded() {} // for subclassing

  }, {
    key: "wizardRendered",
    value: function wizardRendered() {} // for subclassing

  }, {
    key: "post",
    value: function post(obj) {///alert(JSON.stringify(obj, null, 2))
    }
  }, {
    key: "event",
    value: function event(e) {}
  }, {
    key: "unload",
    value: function unload() {
      this.app.UI.areas.main.clear(); // clean up wizard progress

      var wp = document.querySelector(".exf-wiz-step-cnt");
      if (wp) wp.remove();
      document.body.classList.remove("exf-fs-progress");
    }
  }, {
    key: "render",
    value: function render() {
      var _ = this;

      _.engine = _.exoContext.createForm({
        host: _
      }).on(_ExoFormFactory.default.events.post, function (e) {
        _.post(e.detail.postData);
      });
      var u = null;
      if (_.wizardSettings.url) u = new URL(_.wizardSettings.url, _.app.config.baseUrl).toString();else {
        u = _.wizardSettings.schema;
      }

      _.engine.load(u).then(function (x) {
        _.formLoaded();

        x.addEventListener(_ExoFormFactory.default.events.page, function (e) {
          _DOM.default.changeHash(_.path + "/page/" + e.detail.page);
        });
        x.renderForm().then(function (x) {
          _.app.UI.areas.main.clear();

          _.app.UI.areas.main.add(x.container);

          _.wizardRendered(x);
        });
      });
    }
  }]);

  return ExoWizardRouteModule;
}(_ExoRouteModule2.default);

var _default = ExoWizardRouteModule;
exports.default = _default;
},{"./ExoFormFactory":"src/exo/ExoFormFactory.js","../pwa/DOM":"src/pwa/DOM.js","./ExoRouteModule":"src/exo/ExoRouteModule.js"}],"src/pwa/MsIdentity.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var MsIdentity = /*#__PURE__*/function () {
  function MsIdentity(options) {
    _classCallCheck(this, MsIdentity);

    _defineProperty(this, "options", {
      mode: "redirect",
      libUrl: "https://alcdn.msauth.net/browser/2.7.0/js/msal-browser.js",
      msal: {
        auth: {
          clientId: "<clientid>",
          authority: "<authority>",
          redirectUri: document.URL.split("#")[0]
        },
        cache: {
          //cacheLocation: "sessionStorage", // This configures where your cache will be stored
          cacheLocation: 'localStorage',
          storeAuthStateInCookie: false // Set this to "true" if you are having issues on IE11 or Edge

        },
        system: {
          loggerOptions: {
            loggerCallback: function loggerCallback(level, message, containsPii) {
              if (containsPii) {
                return;
              }

              switch (level) {
                case msal.LogLevel.Error:
                  console.error(message);
                  return;

                case msal.LogLevel.Info:
                  console.info(message);
                  return;

                case msal.LogLevel.Verbose:
                  console.debug(message);
                  return;

                case msal.LogLevel.Warning:
                  console.warn(message);
                  return;
              }
            }
          }
        },
        loginRequest: {
          scopes: ["User.Read"]
        },
        tokenRequest: {
          scopes: ["User.Read"],
          forceRefresh: false // Set this to "true" to skip a cached token and go to the server to get a new token

        }
      }
    });

    var _ = this;

    options = options || {};
    _.options = _objectSpread(_objectSpread({}, this.options), options);
  } // Loads lib and initializes MSAL


  _createClass(MsIdentity, [{
    key: "load",
    value: function () {
      var _load = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _this = this;

        var _;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _ = this;
                _context.next = 3;
                return new Promise(function (resolve, reject) {
                  _.require(_.options.libUrl, function (e) {
                    console.debug(_.options.libUrl, "loaded");

                    _.init();

                    resolve(_this);
                  });
                });

              case 3:
                return _context.abrupt("return", _context.sent);

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function load() {
        return _load.apply(this, arguments);
      }

      return load;
    }()
  }, {
    key: "require",
    value: function require(src, c) {
      var d = document;
      d.querySelectorAll("head");
      var e = d.createElement('script');
      e.src = src;
      d.head.appendChild(e);
      e.onload = c;
    }
  }, {
    key: "init",
    value: function init() {
      var _ = this;

      _.myMSALObj = new msal.PublicClientApplication(_.options.msal);

      if (_.options.mode !== "popup") {
        _.myMSALObj.handleRedirectPromise().then(function (r) {
          _.handleResponse(r);
        }).catch(function (error) {
          console.error(error);
        });
      }

      _.getAccount();
    }
  }, {
    key: "signIn",
    value: function signIn(email) {
      var _ = this;

      var account = _.getAccount();

      if (!account) {
        if (_.options.mode === "popup") {
          _.myMSALObj.loginPopup(_.options.msal.loginRequest).then(function (response) {
            if (response !== null) {
              _.account = response.account;

              _.signedIn();
            }
          }).catch(function (error) {
            console.error(error);
          });
        } else {
          _.myMSALObj.loginRedirect(_.options.msal.loginRequest);
        }
      }
    }
  }, {
    key: "signedIn",
    value: function signedIn() {
      var _ = this;

      MsIdentity.trigger({
        type: "signedIn",
        account: _.account,
        mode: _.options.mode
      });
    }
  }, {
    key: "signOut",
    value: function signOut() {
      var _ = this;

      if (_.account) {
        _.myMSALObj.logout({
          account: _.myMSALObj.getAccountByUsername(_.account.username)
        }).then(function () {
          MsIdentity.trigger({
            type: "signedOut",
            account: _.account,
            mode: _.options.mode
          });
        });
      }
    }
  }, {
    key: "getAccount",
    value: function getAccount() {
      var _ = this;

      var currentAccounts = _.myMSALObj.getAllAccounts();

      if (currentAccounts.length === 0) {
        return null;
      } else if (currentAccounts.length > 1) {
        throw "Multiple accounts detected.";
      } else if (currentAccounts.length === 1) {
        _.account = currentAccounts[0];

        _.signedIn();
      }
    } // https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md

  }, {
    key: "getJWT",
    value: function getJWT(username) {
      var _ = this;

      var request = _.options.msal.tokenRequest;
      return _.waitForInit().then(function () {
        if (!username) throw "No user signed in";
        request.account = _.myMSALObj.getAccountByUsername(username);
        return _.myMSALObj.acquireTokenSilent(request).catch(function (error) {
          if (error instanceof msal.InteractionRequiredAuthError) {
            // fallback to interaction when silent call fails
            // if (_.options.mode === "popup") {
            //     return _.myMSALObj.acquireTokenPopup(request)
            //         .then(tokenReinteractionsponse => {
            //             console.log(tokenResponse);
            //             return tokenResponse;
            //         }).catch(error => {
            //             console.error(error);
            //         });
            // }
            // else {
            return _.myMSALObj.acquireTokenRedirect(request); //}
          } else {
            console.warn(error);
          }
        });
      });
    } // TODO improve - loading MSAL is async, we have to wait until it is fully loaded

  }, {
    key: "waitForInit",
    value: function waitForInit() {
      var _ = this;

      var delay = function delay(t) {
        return new Promise(function (resolve) {
          return setTimeout(resolve, t);
        });
      };

      if (!_.myMSALObj) {
        return delay(200);
      }

      return delay(1);
    }
  }, {
    key: "handleResponse",
    value: function handleResponse(response) {
      var _ = this;

      if (response !== null) {
        _.account = response.account;
        if (!_.isBusy()) _.signedIn();
      }
    }
  }, {
    key: "isBusy",
    value: function isBusy() {
      return this.myMSALObj.interactionInProgress();
    }
  }], [{
    key: "trigger",
    value: function trigger(x) {
      var ev = new Event("msid");
      ev.detail = x;
      document.body.dispatchEvent(ev);
    }
  }]);

  return MsIdentity;
}();

var _default = MsIdentity;
exports.default = _default;
},{}],"src/exo/xo.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("regenerator-runtime/runtime");

var _ExoFormFactory = _interopRequireDefault(require("./ExoFormFactory"));

var _ExoRouteModule = _interopRequireDefault(require("./ExoRouteModule"));

var _ExoWizardRouteModule = _interopRequireDefault(require("./ExoWizardRouteModule"));

var _ExoBaseControls = _interopRequireDefault(require("./ExoBaseControls"));

var _DOM = _interopRequireDefault(require("../pwa/DOM"));

var _PWA = _interopRequireDefault(require("../pwa/PWA"));

var _Core = _interopRequireDefault(require("../pwa/Core"));

var _MsIdentity = _interopRequireDefault(require("../pwa/MsIdentity"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var xo = {
  core: _Core.default,
  dom: _DOM.default,
  pwa: _PWA.default,
  route: _ExoRouteModule.default,
  form: {
    factory: _ExoFormFactory.default,
    fields: {
      base: _ExoBaseControls.default
    },
    wizard: _ExoWizardRouteModule.default
  },
  identity: {
    msal: _MsIdentity.default
  }
};
window.xo = xo;
var _default = xo;
exports.default = _default;
},{"regenerator-runtime/runtime":"node_modules/regenerator-runtime/runtime.js","./ExoFormFactory":"src/exo/ExoFormFactory.js","./ExoRouteModule":"src/exo/ExoRouteModule.js","./ExoWizardRouteModule":"src/exo/ExoWizardRouteModule.js","./ExoBaseControls":"src/exo/ExoBaseControls.js","../pwa/DOM":"src/pwa/DOM.js","../pwa/PWA":"src/pwa/PWA.js","../pwa/Core":"src/pwa/Core.js","../pwa/MsIdentity":"src/pwa/MsIdentity.js"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "64987" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/exo/xo.js"], null)
//# sourceMappingURL=/xo.16f16980.js.map