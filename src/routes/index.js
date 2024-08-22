import express from "express";
const router = express.Router();
/**
 * Declaring routes
 */
import eventos_route from "./eventos_route";
import reservas_route from "./reservas_route";

router.use(`/eventos`, eventos_route);
router.use(`/reservas`, reservas_route);

export default router;
