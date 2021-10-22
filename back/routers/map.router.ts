import { MapController } from './../controllers/map.controller';
import express, { Router } from "express";

const mapRouter: Router = express.Router();
const mapController: MapController = new MapController();

mapRouter.get('/data', mapController.getMapData)
mapRouter.post('/data', mapController.addMapData)

export { mapRouter }