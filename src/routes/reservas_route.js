import express from "express";
const router = express.Router();

/**
 * Controllers
 */
import { reservation } from "../controllers/reservas_controller";

router.get("/", async (req, res) => {
  const response = await reservation.list(req.query);
  if (response.status_code) {
    res.status(response.status_code).send(response.data);
  } else {
    res.status(200).send(response.data);
  }
});
router.get("/:reservation_id", async (req, res) => {
  req.query.reservation_id = req.params.reservation_id;
  const response = await reservation.detail(req.query);
  if (response.status_code) {
    res.status(response.status_code).send(response.data);
  } else {
    res.status(200).send(response.data);
  }
});
router.post("/", async (req, res) => {
  const response = await reservation.create(req.body);
  if (response.status_code) {
    res.status(response.status_code).send(response.data);
  } else {
    res.status(200).send(response.data);
  }
});
router.put("/:reservation_id", async (req, res) => {
  req.body.reservation_id = req.params.reservation_id;
  const response = await reservation.update(req.body);
  if (response.status_code) {
    res.status(response.status_code).send(response.data);
  } else {
    res.status(200).send(response.data);
  }
});
router.delete("/:reservation_id", async (req, res) => {
  req.query.reservation_id = req.params.reservation_id;
  const response = await reservation.delete(req.query);
  if (response.status_code) {
    res.status(response.status_code).send(response.data);
  } else {
    res.status(200).send(response.data);
  }
});

export default router;
