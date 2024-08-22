import { pool } from "../utilities/db_connection";
import moment from "moment-timezone";

class Event {
  /**
Retrieves a list of events from the database.
@param {Object} query - The query parameters for the event list.
@returns {Object} An object containing the status code and data.
@returns {number} status_code - The HTTP status code of the response.
@returns {Array} data - An array of event objects.
 */
  async list(query) {
    const response = await pool.query_connection(
      "select * from events",
      [],
      true
    );
    return {
      status_code: 200,
      data: response,
    };
  }

  /**
Retrieves a single event from the database based on the provided event ID.
@param {Object} query - The query parameters for the event detail.
@param {number} query.event_id - The ID of the event to retrieve.
@returns {Object} An object containing the status code and data.
@returns {number} status_code - The HTTP status code of the response.
@returns {Object} data - The event object if found, or an error message if not.
@returns {Object} data.detail - The error message if the event is not found.
 */
  async detail(query) {
    const response = await pool
      .query_connection(
        "select * from events where id = ?",
        [query.event_id],
        true
      )
      .catch((error) => {
        console.error(error);
        return;
      });
    if (response.length > 0) {
      return {
        status_code: 200,
        data: response[0],
      };
    } else {
      return {
        status_code: 404,
        data: { detail: "Evento no encontrado" },
      };
    }
  }

  /**
Creates a new event in the database.
@param {Object} body - The request body containing the event data.
@param {string} body.nombre - The name of the event.
@param {string} body.fecha - The date and time of the event in the format "YYYY-MM-DD HH:mm".
@param {string} body.ubicacion - The location of the event.
@returns {Object} An object containing the status code and data.
@returns {number} status_code - The HTTP status code of the response.
@returns {Object} data - The event object if created successfully, or an error message if not.
@returns {Object} data.detail - The error message if the event creation fails.
 */
  async create(body) {
    const validation = this.validate_data(body);
    if (validation.is_valid) {
      const data_obj = {
        nombre: body.nombre,
        fecha: body.fecha,
        ubicacion: body.ubicacion,
      };
      const data = pool.transformToMatrixOrArray(data_obj, true);

      const response = await pool
        .query_connection(
          "insert into events (nombre, fecha, ubicacion) values (?)",
          data,
          true
        )
        .catch((error) => {
          console.error(error);
          return {
            status_code: 500,
            data: {
              detail: "Error al agregar el evento.",
            },
          };
        });
      if (response.insertId) {
        const inserted_event = await this.detail({
          event_id: response.insertId,
        });
        return inserted_event;
      } else {
        return {
          status_code: 500,
          data: {
            detail: "Error al actualizar el evento.",
          },
        };
      }
    }

    delete validation.is_valid;
    return validation;
  }

  /**
Updates an existing event in the database.
@param {Object} body - The request body containing the updated event data.
@param {string} body.nombre - The updated name of the event.
@param {string} body.fecha - The updated date and time of the event in the format "YYYY-MM-DD HH:mm".
@param {string} body.ubicacion - The updated location of the event.
@param {number} body.event_id - The ID of the event to update.
@returns {Object} An object containing the status code and data.
@returns {number} status_code - The HTTP status code of the response.
@returns {Object} data - The updated event object if successful, or an error message if not.
@returns {Object} data.detail - The error message if the event update fails.
 */
  async update(body) {
    const event = await this.detail(body);
    if (event.status_code === 200) {
      const validation = this.validate_data(body, true);
      if (validation.is_valid) {
        const data_obj = {
          nombre: body.nombre,
          fecha: body.fecha,
          ubicacion: body.ubicacion,
          id: body.event_id,
        };
        const data = pool.transformToMatrixOrArray(data_obj);

        const response = await pool
          .query_connection(
            `update events 
              set nombre = ?, 
              fecha = ?, 
              ubicacion = ?
              where id = ?`,
            data,
            true
          )
          .catch((error) => {
            return {
              status_code: 500,
              data: {
                detail: "Error al actualizar el evento.",
              },
            };
          });
        if (response.affectedRows > 0) {
          const update_event = await this.detail(body);
          return update_event;
        } else {
          if (response.status_code) {
            return response;
          }
          return {
            status_code: 500,
            data: { detail: "Error actualizando evento" },
          };
        }
      }
      delete validation.is_valid;
      return validation;
    } else {
      return event;
    }
  }

  /**
Deletes an event from the database based on the provided event ID.
@param {Object} query - The query parameters for the event deletion.
@param {number} query.event_id - The ID of the event to delete.
@returns {Object} An object containing the status code and data.
@returns {number} status_code - The HTTP status code of the response.
@returns {Object} data - The response data.
@returns {Object} data.detail - The detail message of the response.
@returns {Object} data.detail - The detail message of the response in case of conflict.
 */
  async delete(query) {
    const event = await this.detail(query);
    if (event.status_code === 200) {
      const data_obj = {
        id: query.event_id,
      };
      const data = pool.transformToMatrixOrArray(data_obj);
      const response = await pool
        .query_connection(`delete from events where id = ?`, data, true)
        .catch((error) => {
          if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return {
              status_code: 409,
              data: {
                detail: "Este evento tiene reservaciones.",
              },
            };
          }
          return {
            status_code: 500,
            data: {
              detail: "Error al eliminar el evento.",
            },
          };
        });

      if (response.affectedRows > 0) {
        return { status_code: 200, data: { detail: "Evento eliminado" } };
      } else {
        if (response.status_code) {
          return response;
        }
        return {
          status_code: 500,
          data: { detail: "Error eliminando evento" },
        };
      }
    } else {
      return event;
    }
  }

  /**
Validates the event data based on the provided parameters.
@param {Object} body - The request body containing the event data.
@param {string} body.nombre - The name of the event.
@param {string} body.fecha - The date and time of the event in the format "YYYY-MM-DD HH:mm".
@param {string} body.ubicacion - The location of the event.
@param {number} [body.event_id] - The ID of the event to update.
@param {boolean} [update=false] - Indicates whether the data is for updating an existing event.
@returns {Object} - An object containing the validation result and response data.
@returns {number} status_code - The HTTP status code of the response.
@returns {boolean} is_valid - Indicates whether the data is valid.
@returns {Array} data - An array of validation error messages.
 */
  validate_data(body, update = false) {
    const response = {
      status_code: 200,
      is_valid: true,
      data: [],
    };
    if (!body.nombre) {
      response.status_code = 422;
      response.is_valid = false;
      response.data.push({ nombre: "Es un campo obligatorio." });
    } else {
      if (body.nombre.length > 100) {
        response.status_code = 422;
        response.is_valid = false;
        response.data.push({ nombre: "No puede tener más de 100 caracteres." });
      }
    }
    if (!body.fecha) {
      response.status_code = 422;
      response.is_valid = false;
      response.data.push({ fecha: "Es un campo obligatorio." });
    } else {
      const moment_date = moment(body.fecha, "YYYY-MM-DD HH:mm", true);
      if (!moment_date.isValid()) {
        response.data.push({
          fecha: "Formato de fecha incorrecto [YYYY-MM-DD HH:mm].",
        });
      }
    }
    if (!body.ubicacion) {
      response.status_code = 422;
      response.is_valid = false;
      response.data.push({ ubicacion: "Es un campo obligatorio." });
    } else {
      if (body.ubicacion.length > 250) {
        response.status_code = 422;
        response.is_valid = false;
        response.data.push({
          ubicacion: "No puede tener más de 250 caracteres.",
        });
      }
    }
    if (update) {
      if (!body.event_id) {
        response.status_code = 422;
        response.is_valid = false;
        response.data.push({ id: "Es un campo obligatorio." });
      }
    }
    return response;
  }
}

export const event = new Event();
