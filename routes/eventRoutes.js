import express from 'express';
import { cancelRegistration, createEvent, eventDetails, eventStats, registerForEvent, upcomingEvent } from '../Controller/eventController.js';

const router = express.Router();

router.post("/createevent",createEvent);
router.get("/eventdetails/:eventId", eventDetails)
router.post("/createuser",registerForEvent);
router.post("/cancel",cancelRegistration);
router.get("/upevents",upcomingEvent);
router.get("/eventstats/:id",eventStats);

export default router;