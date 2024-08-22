import express from "express";
const router = express.Router();

/**
 * Controllers
 */
import { event } from "../controllers/eventos_controller";

router.get("/", async (req, res) => {
  const response = await event.list(req.query);
  if (response.status_code) {
    res.status(response.status_code).send(response.data);
  } else {
    res.status(200).send(response.data);
  }
});
router.get("/:event_id", async (req, res) => {
  req.query.event_id = req.params.event_id;
  const response = await event.detail(req.query);
  if (response.status_code) {
    res.status(response.status_code).send(response.data);
  } else {
    res.status(200).send(response.data);
  }
});
router.post("/", async (req, res) => {
  const response = await event.create(req.body);
  if (response.status_code) {
    res.status(response.status_code).send(response.data);
  } else {
    res.status(200).send(response.data);
  }
});
router.put("/:event_id", async (req, res) => {
  req.body.event_id = req.params.event_id;
  const response = await event.update(req.body);
  if (response.status_code) {
    res.status(response.status_code).send(response.data);
  } else {
    res.status(200).send(response.data);
  }
});
router.delete("/:event_id", async (req, res) => {
  req.query.event_id = req.params.event_id;
  const response = await event.delete(req.query);
  if (response.status_code) {
    res.status(response.status_code).send(response.data);
  } else {
    res.status(200).send(response.data);
  }
});

export default router;
