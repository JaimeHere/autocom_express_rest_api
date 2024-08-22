/**
 * Usualmente uso 3 entornos, un local, una beta y producción. 
 * La intención de este documento es, mediante el comando de inicio 
 * pasar una variable de entorno para así concatenar con el .env adecuado.
 * 
 * Los archivos de env los uso así
 * .env.test // LOCAL
 * .env.development // BETA
 * .env.production // PRODUCTION
 * 
 * Ejemplo: 
 * En el script start originalmente lo uso así
 * "start": "NODE_ENV=test nodemon src/server.js --require 'dotenv/config' src/init.js --exec babel-node --presets @babel/preset-env"
 * 
 * Esto indica que la variable NODE_ENV será 'test'
    const env = process.env.NODE_ENV || "development";
    const path = `./envs/.env.${env}`;
    // Aquí me estría conectando a .env.test (mi ambiente local)
 */

import dotenv from "dotenv";
const path = `src/envs/.env`;
dotenv.config({ path, silent: true, override: true });
