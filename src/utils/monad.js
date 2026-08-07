'use strict';

/**
 * Monad utilities for Promise-based async operations.
 *
 * JavaScript's Promise is a Monad. This module provides named
 * aliases that make the monadic structure explicit, improving
 * code readability and serving as living documentation of the
 * functional programming patterns used in this project.
 *
 * Monad definition:
 *   A monad wraps a value in a computational context and
 *   provides:
 *   - unit (of): wraps a plain value → M<A>
 *   - bind (chain): applies A → M<B> to M<A>, returning M<B>
 *     (flattening, not nesting)
 *
 * Monad laws satisfied by Promise:
 *   1. Left identity:  of(a).chain(f)  ≡ f(a)
 *   2. Right identity: m.chain(of)     ≡ m
 *   3. Associativity:  m.chain(f).chain(g) ≡
 *                      m.chain(x => f(x).chain(g))
 */

/**
 * unit / of — wraps a plain value in a Promise (monadic context).
 * Equivalent to Promise.resolve(value).
 * Named 'of' following the Fantasy Land specification convention.
 *
 * @template A
 * @param {A} value - The value to wrap.
 * @returns {Promise<A>}
 */
const of = (value) => Promise.resolve(value);

/**
 * chain — applies a function returning a Promise to a Promise,
 * flattening the result (monadic bind / flatMap).
 * This is what distinguishes a Monad from a Functor:
 * chain(f)(m) does NOT produce Promise<Promise<B>>.
 *
 * @template A, B
 * @param {function(A): Promise<B>} fn - Function to apply.
 * @returns {function(Promise<A>): Promise<B>}
 */
const chain = (fn) => (promise) => promise.then(fn);

/**
 * map — applies a plain (non-Promise-returning) function to
 * the value inside a Promise. This is Functor behavior —
 * included here to show the distinction: map wraps the result
 * automatically, chain expects fn to wrap it itself.
 *
 * @template A, B
 * @param {function(A): B} fn - Pure transformation function.
 * @returns {function(Promise<A>): Promise<B>}
 */
const map = (fn) => (promise) => promise.then(fn);

/**
 * tryCatch — lifts a potentially-throwing async function into
 * a Promise monad, catching synchronous throws and converting
 * them to rejected Promises. Ensures the monadic context is
 * never broken by an unexpected synchronous throw.
 *
 * @param {function(): Promise<A>} fn - Async function to lift.
 * @returns {Promise<A>}
 */
const tryCatch = (fn) => {
  try {
    return Promise.resolve(fn());
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * pipeAsync — composes async functions (each returning Promise)
 * left-to-right using monadic chaining. Each step receives the
 * resolved value of the previous Promise.
 *
 * This is function composition in the Promise monad:
 * pipeAsync(f, g, h)(x) ≡ of(x).then(f).then(g).then(h)
 *
 * @param {...function} fns - Async functions to compose.
 * @returns {function(*): Promise<*>}
 */
const pipeAsync = (...fns) => (x) =>
  fns.reduce((promise, fn) => promise.then(fn), Promise.resolve(x));

module.exports = { of, chain, map, tryCatch, pipeAsync };
