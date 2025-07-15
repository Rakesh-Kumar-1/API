import express from 'express';
import { cancelRegistration, createEvent, eventDetails, eventStats, registerForEvent, upcomingEvent } from '../Controller/eventController';

const router = express.Router();

router.post("/createevent",createEvent);
router.get("/eventdetails",eventDetails);
router.post("/createuser",registerForEvent);
router.get("/cancel/:id",cancelRegistration);
router.get("/upevents",upcomingEvent);
router.get("/eventstats/:id",eventStats);

export default router;