import { pool } from "../utilities/db_connection";
import moment from "moment-timezone";

class Event {
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
            data: { detail: "Error updating event" },
          };
        }
      }
      delete validation.is_valid;
      return validation;
    } else {
      return event;
    }
  }

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
