# Node.js REST API con Express para Eventos y Reservaciones

Este proyecto es una API RESTful construida con Node.js y Express para gestionar recursos. La API permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre diversos recursos, proporcionando un punto de partida sólido para el desarrollo de aplicaciones web.

## Características

- **Express Framework**: Rápido y minimalista, ideal para construir APIs.
- **Operaciones CRUD**: Soporte completo para crear, leer, actualizar y eliminar eventos y reservaciones.
- **Módulo de Rutas**: Rutas organizadas en módulos para mayor mantenibilidad.
- **Configuración**: Fácilmente configurable mediante variables de entorno.

## Endpoints

### Eventos

- `GET /eventos/` - Listar todos los eventos.
- `GET /eventos/{id}/` - Obtener un evento específico por ID.
- `POST /eventos/` - Crear un nuevo evento.
- `PUT /eventos/{id}/` - Actualizar un evento existente.
- `DELETE /eventos/{id}/` - Eliminar un evento.

### Reservaciones

- `GET /reservas/` - Listar todas las reservaciones.
- `GET /reservas/{id}/` - Obtener una reservación específica por ID.
- `POST /reservas/` - Crear una nueva reservación.
- `PUT /reservas/{id}/` - Actualizar una reservación existente.
- `DELETE /reservas/{id}/` - Eliminar una reservación.

## Documentación de la API

Toda la documentación de la API, incluyendo ejemplos de solicitudes y respuestas para cada endpoint, está disponible en Postman. Puedes acceder a ella en el siguiente enlace:

[Documentación de la API en Postman](https://documenter.getpostman.com/view/10308727/2sAXjDdvAS#f007d188-d8fd-4569-ba75-bd369da1c27b)

## Requisitos

- Node.js 20.11.0
- npm 10.2.4
- MySQL

## Instalación

1. Clona este repositorio:
    ```bash
    git clone https://github.com/JaimeHere/autocom_express_rest_api
    cd autocom_express_rest_api
    ```

2. Instala las dependencias necesarias:
    ```bash
    npm install
    ```

3. Crea un archivo `.env` en la carpeta /envs y configura tus variables de entorno. Aquí hay un ejemplo básico:
    ```env
    MYSQL_SERVER="localhost"
    MYSQL_SCHEMA="autocom_restapi"
    MYSQL_USER="db_user"
    MYSQL_PASSWORD="12345678"
    ```

4. Inicia el servidor de desarrollo:
    ```bash
    npm run start
    ```

   El servidor estará corriendo en `http://localhost:3000`.

## Estructura del Proyecto

```bash
├── node_modules/
├── src/
│   ├── controllers/
│   ├── envs/
│   |   ├── .env 
│   ├── routes/
│   ├── utilities/
│   └── index.js
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Estructura de la Base de Datos

``` sql
create table `events` (
	id int auto_increment,
	nombre varchar(100) not null,
	fecha DATETIME not null,
	ubicacion varchar(250),
	PRIMARY KEY (id)
)

create table `reservations` (
	id int auto_increment,
	evento_id int not null,
	nombre_usuario varchar(100) not null,
	cantidad_boletos int not null default 1,
	fecha_reserva datetime not null,
	primary key (id),
	foreign key (evento_id) references events(id)
)
```
