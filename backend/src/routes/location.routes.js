import express from 'express';
import { getLocations, getPopularCities } from '../controllers/location.controller.js';

const router = express.Router();

router.get('/', getLocations);
router.get('/popular-cities', getPopularCities);

export default router;
