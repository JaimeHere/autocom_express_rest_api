import dotenv from "dotenv";
const path = `src/envs/.env`;
dotenv.config({ path, silent: true, override: true });
