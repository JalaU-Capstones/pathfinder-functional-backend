/**
 * compose(...fns) — right-to-left function composition.
 * compose(f, g, h)(x) === f(g(h(x)))
 * 
 * Function composition is a mathematical concept where the output of one 
 * function becomes the input to the next. This allows building complex 
 * behaviors from simple, single-purpose functions without using 
 * intermediate variables.
 * 
 * Used when building pipelines where the last function applied is written 
 * first (mathematical convention).
 * 
 * @param  {...Function} fns Functions to compose
 * @returns {Function} A function that processes an input through the composed functions
 */
const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);

/**
 * pipe(...fns) — left-to-right function composition.
 * pipe(f, g, h)(x) === h(g(f(x)))
 * 
 * Like compose, this builds a pipeline of functions. However, it applies 
 * them from left-to-right (top-to-bottom).
 * 
 * Preferred for readability when steps are read sequentially as a pipeline.
 * Used throughout this project for validation pipelines.
 * 
 * @param  {...Function} fns Functions to pipe
 * @returns {Function} A function that processes an input through the pipeline
 */
const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);

module.exports = { compose, pipe };
