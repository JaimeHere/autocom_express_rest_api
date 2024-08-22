import "./set_env";

import mysql, { Connection, PoolConnection } from "mysql2/promise";

class DBConnection {
  async connect() {
    const pool = mysql.createPool({
      host: process.env.MYSQL_SERVER,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_SCHEMA,
      waitForConnections: true,
      connectionLimit: 20,
      maxIdle: 20,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      port: 3306,
      debug: false,
    });
    const connection = await pool.getConnection();
    return connection;
  }

  /**
   *
   * Exec the query you passed and use an existing connection.
   *
   * @param {string} query - A valid query
   * @param { Array } params - Any kind of array [], or [[]]
   * @param {PoolConnection} connection - A MySQL connection object
   * @param {boolean} [print_error] - Set true if you want to know more details about a possible error.
   * @returns
   */
  async query(query, params, connection, print_error) {
    let response;
    try {
      const [results] = await connection.query(query, params);
      response = results;
    } catch (error) {
      if (print_error) {
        console.error(error);
      }
    }
    return response;
  }
  /**
   *
   * This function creates a new Connection and release the connection.
   *
   * @param {string} query - A valid query
   * @param { Array } params - Any kind of array [], or [[]]
   * @param {boolean} [print_error] - Set true if you want to know more details about a possible error.
   * @returns
   */
  async query_connection(query, params, print_error) {
    const connection = await this.connect();

    let response;
    try {
      const [results] = await connection.query(query, params);
      response = results;
    } catch (error) {
      if (print_error) {
        console.error(error);
      }
      throw error;
    }
    connection.release();
    return response;
  }

  /**
   * Converts various types of input into arrays or matrices based on the provided parameters.
   * @param {any} object - The input object to convert.
   * @param {boolean} [is_matrix] - Indicates whether to return a matrix (array of arrays).
   * @returns {Array} - The converted array or matrix.
   *
   * @example
   * // Convert an array to a flat array
   * transformToMatrixOrArray([1, 2, 3], false); // Returns: [1, 2, 3]
   *
   * @example
   * // Convert an array to a matrix
   * transformToMatrixOrArray([1, 2, 3], true); // Returns: [[1, 2, 3]]
   *
   * @example
   * // Convert a string to a single-element array
   * transformToMatrixOrArray("hello", false); // Returns: ["hello"]
   *
   * @example
   * // Convert a number to a single-element array
   * transformToMatrixOrArray(42, false); // Returns: [42]
   *
   * @example
   * // Convert an object to an array of its values
   * transformToMatrixOrArray({ a: 1, b: 2 }, false); // Returns: [1, 2]
   *
   * @example
   * // Convert an object to a matrix of its values
   * transformToMatrixOrArray({ a: 1, b: 2 }, true); // Returns: [[1, 2]]
   */
  transformToMatrixOrArray(object, is_matrix) {
    if (Array.isArray(object)) {
      return is_matrix ? [[...object]] : [...object];
    }
    if (typeof object === "string") {
      return [object];
    }
    let array = new Array();
    if (typeof object === "number") {
      array.push(object);
    }
    if (typeof object === "object") {
      Object.keys(object).forEach((key) => {
        array.push(object[key]);
      });
    }
    return is_matrix ? [array] : array;
  }
}

export const pool = new DBConnection();
