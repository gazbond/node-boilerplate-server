const express = require("express");
const Request = express.request;
const { validationResult } = require("express-validator/check");

/**
 * Extract errors from req.
 *
 * @param {Request} req
 */
const validationErrors = req => {
  return validationResult(req).formatWith(error => {
    // Rename property 'mgs' to 'message'
    const message = error.msg;
    delete error.msg;
    error = Object.assign(
      {
        message: message
      },
      error
    );
    return error;
  });
};

/**
 * Bind this (ref) in methods.
 *
 * @param {Object} ref
 * @param {string[]} methods
 */
const bindMethods = (ref, methods) => {
  methods.forEach(method => {
    ref[method] = ref[method].bind(ref);
  });
};

/**
 * Wrap async functions to handle promise errors.
 *
 * @param {Function} func
 */
const wrapAsync = func => {
  return (req, res, next) => {
    const promise = func(req, res, next);
    if (promise.catch) {
      promise.catch(err => next(err));
    }
  };
};

/**
 * Extract param from req.query, req.param or default value.
 *
 * @param {Request} req
 * @param {string} name
 * @param {null|string|number|boolean} def
 */
const getParam = (req, name, def = "") => {
  if (req.query[name]) {
    return req.query[name].trim();
  }
  if (req.params[name]) {
    return req.params[name].trim();
  }
  return def;
};

/**
 * Extract param from req.body or default value.
 *
 * @param {Request} req
 * @param {string} name
 * @param {null|string|number|boolean} def
 */
const getField = (req, name, def = "") => {
  if (req.body[name]) {
    return req.body[name].trim();
  }
  return def;
};

/**
 * Extract params from req.body using model.fields if present
 * or model.jsonSchema.properties if not.
 *
 * @param {Request} req
 * @param {Object} model
 */
const getFields = (req, model) => {
  let fields = model.jsonSchema.properties;
  if (model.hasOwnProperty("fields")) fields = model.fields;
  const idColumn = model.idColumn;
  // Build data
  const data = {};
  Object.keys(fields).forEach(key => {
    // Ignore id column
    if (key !== idColumn) {
      let param = getField(req, key, null);
      // Ignore if not present
      if (param !== null) data[key] = param;
    }
  });
  return data;
};

/**
 * Block execution of all JavaScript by halting Node.js event loop.
 *
 * @param {number} ms
 */
const sleep = ms => {
  console.log("sleep...");
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  console.log("...resume");
};

module.exports = {
  validationErrors,
  bindMethods,
  wrapAsync,
  getParam,
  getField,
  getFields,
  sleep
};