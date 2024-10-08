import { pool } from "../utilities/db_connection";
import moment from "moment-timezone";
import { event as event_ctrl } from "./eventos_controller";

class Reservation {
  /**
Retrieves a list of reservations from the database.
@param {Object} query - The query parameters for the reservation list.
@returns {Object} An object containing the status code and data.
@returns {number} status_code - The HTTP status code of the response.
@returns {Array} data - An array of reservation objects.
 */
  async list(query) {
    const response = await pool.query_connection(
      `select r.id, nombre_usuario, cantidad_boletos, fecha_reserva ,
e.nombre as evento
from reservations r
left join events e on e.id = r.evento_id`,
      [],
      true
    );
    return {
      status_code: 200,
      data: response,
    };
  }

  /**
Retrieves a single reservation from the database based on the provided reservation ID.
@param {Object} query - The query parameters for the reservation detail.
@param {number} query.reservation_id - The ID of the reservation to retrieve.
@returns {Object} An object containing the status code and data.
@returns {number} status_code - The HTTP status code of the response.
@returns {Object} data - The reservation object if found, or an error message if not.
@returns {Object} data.detail - The error message if the reservation is not found.
 */
  async detail(query) {
    const response = await pool
      .query_connection(
        `
select r.id, nombre_usuario, cantidad_boletos, fecha_reserva ,
e.nombre as evento
from reservations r
left join events e on e.id = r.evento_id 
where r.id = ?`,
        [query.reservation_id],
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
        data: { detail: "Reservación no encontrada" },
      };
    }
  }

    /**
Creates a new reservation in the database.
@param {Object} body - The request body containing the reservation data.
@param {number} body.evento_id - The id of the event which you are reserving.
@param {string} body.nombre_usuario - The nombre_usuario that made the reservation.
@param {number} body.cantidad_boletos - The quantity of tickets for the reservation.
@returns {Object} An object containing the status code and data.
@returns {number} status_code - The HTTP status code of the response.
@returns {Object} data - The reservation object if created successfully, or an error message if not.
@returns {Object} data.detail - The error message if the reservation creation fails.
 */
  async create(body) {
    const validation = this.validate_data(body);
    if (validation.is_valid) {
      const event = await event_ctrl.detail({
        event_id: body.evento_id,
      });
      if (event.status_code === 200) {
        const event_date = moment(event.data.fecha);
        if (event_date.isSameOrBefore(moment(), "minute")) {
          return {
            status_code: 400,
            data: { detail: "El evento ya ha pasado." },
          };
        }
        const data_obj = {
          event_id: body.evento_id,
          nombre_usuario: body.nombre_usuario,
          cantidad_boletos: body.cantidad_boletos,
          fecha_reserva: moment().toDate(),
        };
        const data = pool.transformToMatrixOrArray(data_obj, true);

        const response = await pool
          .query_connection(
            "insert into reservations (evento_id, nombre_usuario, cantidad_boletos, fecha_reserva) values (?)",
            data,
            true
          )
          .catch((error) => {
            console.error(error);
            return {
              status_code: 500,
              data: {
                detail: "Error al agregar la reservación.",
              },
            };
          });
        if (response.insertId) {
          const inserted_event = await this.detail({
            reservation_id: response.insertId,
          });
          return inserted_event;
        } else {
          return {
            status_code: 500,
            data: {
              detail: "Error al actualizar la reservación.",
            },
          };
        }
      } else {
        return event;
      }
    }
    delete validation.is_valid;
    return validation;
  }

  /**
Updates an existing reservation in the database.
@param {Object} body - The request body containing the updated reservation data.
@param {number} body.evento_id - The updated id of the event which you are reserving.
@param {string} body.nombre_usuario - The updated nombre_usuario that made the reservation.
@param {number} body.cantidad_boletos - The updated quantity of tickets for the reservation.
@param {number} body.reservation_id - The ID of the reservation to update.
@returns {Object} An object containing the status code and data.
@returns {number} status_code - The HTTP status code of the response.
@returns {Object} data - The updated event object if successful, or an error message if not.
@returns {Object} data.detail - The error message if the event update fails.
 */
  async update(body) {
    const reservation = await this.detail(body);
    if (reservation.status_code === 200) {
      const validation = this.validate_data(body, true);
      if (validation.is_valid) {
        const event = await event_ctrl.detail({
          event_id: body.evento_id,
        });
        if (event.status_code === 200) {
          const data_obj = {
            evento_id: body.evento_id,
            nombre_usuario: body.nombre_usuario,
            cantidad_boletos: body.cantidad_boletos,
            id: body.reservation_id,
          };
          const data = pool.transformToMatrixOrArray(data_obj);

          const response = await pool
            .query_connection(
              `
                  update reservations 
                  set evento_id = ?, 
                  nombre_usuario = ?,
                  cantidad_boletos = ?
                  where id = ?`,
              data,
              true
            )
            .catch((error) => {
              return {
                status_code: 500,
                data: {
                  detail: "Error al actualizar la reservación.",
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
              data: { detail: "Error actualizando la reservación" },
            };
          }
        } else {
          return event;
        }
      }
      delete validation.is_valid;
      return validation;
    } else {
      return reservation;
    }
  }

  /**
Deletes an reservation from the database based on the provided reservation ID.
@param {Object} query - The query parameters for the reservation deletion.
@param {number} query.reservation_id - The ID of the reservation to delete.
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
        id: query.reservation_id,
      };
      const data = pool.transformToMatrixOrArray(data_obj);
      const response = await pool
        .query_connection(`delete from reservations where id = ?`, data, true)
        .catch((error) => {
          return {
            status_code: 500,
            data: {
              detail: "Error al eliminar la reservación.",
            },
          };
        });

      if (response.affectedRows > 0) {
        return { status_code: 200, data: { detail: "Reservación eliminada" } };
      } else {
        if (response.status_code) {
          return response;
        }
        return {
          status_code: 500,
          data: { detail: "Error eliminando la reservación" },
        };
      }
    } else {
      return event;
    }
  }
/**
 * Validates the data for creating or updating a reservation.
 *
 * @param {Object} body - The request body containing the reservation data.
 * @param {number} body.evento_id - The id of the event which you are reserving.
 * @param {string} body.nombre_usuario - The nombre_usuario that made the reservation.
 * @param {number} body.cantidad_boletos - The quantity of tickets for the reservation.
 * @param {number} [body.reservation_id] - The ID of the reservation to update.
 * @param {boolean} [update=false] - Indicates whether the data is for updating a reservation.
 *
 * @returns {Object} An object containing the status code, validation result, and data.
 * @returns {number} status_code - The HTTP status code of the response.
 * @returns {boolean} is_valid - Indicates whether the data is valid.
 * @returns {Array} data - An array of error messages if the data is not valid.
 */
  validate_data(body, update = false) {
    const response = {
      status_code: 200,
      is_valid: true,
      data: [],
    };
    if (!body.evento_id) {
      response.status_code = 422;
      response.is_valid = false;
      response.data.push({ evento_id: "Es un campo obligatorio." });
    } else {
      const isNan = isNaN(body.evento_id);
      if (isNan) {
        response.status_code = 422;
        response.is_valid = false;
        response.data.push({ evento_id: "Debe ser un número." });
      } else if (body.evento_id <= 0) {
        response.status_code = 422;
        response.is_valid = false;
        response.data.push({ evento_id: "Debe ser mayor a 0." });
      }
    }
    if (!body.nombre_usuario) {
      response.status_code = 422;
      response.is_valid = false;
      response.data.push({ nombre_usuario: "Es un campo obligatorio." });
    } else {
      if (body.nombre_usuario.length > 100) {
        response.status_code = 422;
        response.is_valid = false;
        response.data.push({
          nombre_usuario: "No puede tener más de 100 caracteres.",
        });
      }
    }
    if (!body.cantidad_boletos) {
      response.status_code = 422;
      response.is_valid = false;
      response.data.push({ cantidad_boletos: "Es un campo obligatorio." });
    } else {
      const isNan = isNaN(body.cantidad_boletos);
      if (isNan) {
        response.status_code = 422;
        response.is_valid = false;
        response.data.push({ cantidad_boletos: "Debe ser un número." });
      } else if (body.cantidad_boletos <= 0) {
        response.status_code = 422;
        response.is_valid = false;
        response.data.push({ cantidad_boletos: "Debe ser mayor a 0." });
      }
    }
    if (update) {
      if (!body.reservation_id) {
        response.status_code = 422;
        response.is_valid = false;
        response.data.push({ id: "Es un campo obligatorio." });
      }
    }
    return response;
  }
}

export const reservation = new Reservation();
