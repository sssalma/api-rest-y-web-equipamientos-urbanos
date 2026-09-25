# CityEquip — API REST y aplicación web de equipamientos urbanos

Sistema de dos capas para consultar y valorar los **equipamientos públicos de Tarragona**
(centros cívicos, instalaciones deportivas, oficinas administrativas…) a partir de los
datos abiertos del ayuntamiento.

> Práctica 1 de *Desenvolupament d'Aplicacions Web* — Grau en Enginyeria Informàtica, URV.

## Arquitectura

El proyecto está deliberadamente partido en dos servicios independientes que se
comunican por HTTP, en lugar de una sola aplicación monolítica:

```text
Navegador  ──►  web-app (:3000)  ──HTTP + API key──►  api-rest (:3001)  ──►  MongoDB Atlas
                    │                                                              ▲
                    └──────────── usuarios y valoraciones ─────────────────────────┘
```

- **`api-rest/`** — Servicio de datos. Es el único que conoce el catálogo de
  equipamientos. Expone un CRUD REST y protege las operaciones de escritura con una
  clave de API compartida.
- **`web-app/`** — Aplicación web con renderizado en servidor. Consume la API para los
  equipamientos y gestiona por su cuenta las cuentas de usuario, las valoraciones y los
  rankings.

Esta separación permite que la capa de datos y la de presentación evolucionen por
separado, y obliga a autenticar la comunicación entre ambas.

## API REST

Base: `/equipments`

| Método | Ruta | Auth | Descripción |
|---|---|:--:|---|
| `GET` | `/equipments` | — | Lista todos los equipamientos |
| `GET` | `/equipments/:id` | — | Detalle de un equipamiento |
| `POST` | `/equipments` | 🔑 | Crea un equipamiento |
| `PUT` | `/equipments/:id` | 🔑 | Actualiza un equipamiento |
| `DELETE` | `/equipments/:id` | 🔑 | Elimina un equipamiento |

Las lecturas son públicas; las escrituras exigen la cabecera de API key que valida el
middleware `api-rest/middleware/auth.js`.

## Aplicación web

- **Autenticación** con Passport (estrategia local) y sesiones con `express-session`.
- **Valoraciones**: cada usuario puntúa equipamientos; las valoraciones se guardan
  embebidas en su documento de usuario.
- **Rankings** (`services/ratingService.js`): agrega las valoraciones de todos los
  usuarios para calcular una media por equipamiento, y produce dos vistas — un
  **ranking global** y el **ranking personal** del usuario autenticado.
- **Vistas** en Pug, con layout compartido y mensajes flash.
- Soporte de `PUT`/`DELETE` desde formularios HTML mediante `method-override`.

## Puesta en marcha

Hacen falta Node.js y una base de datos MongoDB (local o Atlas).

**1. API REST**

```bash
cd api-rest
npm install
cp .env.example .env     # y rellena MONGODB_URI y API_SECRET_KEY
npm run dev
```

Para cargar el catálogo inicial desde el CSV de datos abiertos:

```bash
node scripts/importData.js
```

**2. Aplicación web** (en otra terminal)

```bash
cd web-app
npm install
cp .env.example .env     # API_SECRET_KEY debe coincidir con la de la API
npm run dev
```

La web queda en `http://localhost:3000` y la API en `http://localhost:3001`.

> Los ficheros `.env` están excluidos del repositorio. Usa los `.env.example` como
> plantilla y genera tus propias credenciales.

## Datos

`api-rest/data/equipamientos.csv` es el volcado de datos abiertos del Ajuntament de
Tarragona: nombre, horario, tipo, titularidad municipal, coordenadas, dirección,
teléfono y distrito de cada equipamiento.

## Stack

Node.js · Express · MongoDB / Mongoose · Pug · Passport · express-validator · axios
