import { MapData } from './../types/MapData';
import { HttpCodes } from './../constants/HttpCodes';
import { MapModel } from './../models/map.model';
import { Response } from "express";

export class MapController {
    mapModel: MapModel;

    constructor() {
        this.mapModel = new MapModel();
    }

    public getMapData = (request: any, response: Response): void => {
        this.mapModel.getMapData()
            .then((data) => {
                const features: Array<any> = new Array();
                for (const obj of data) {
                    features.push({
                        type: "Feature",
                        properties: {
                            name: obj.name
                        },
                        geometry: {
                            type: obj.type,
                            coordinates: JSON.parse(obj.coordinates)
                        }
                    })
                }

                const geojson = {
                    type: "FeatureCollection",
                    crs: {
                        type: "name",
                        properties: {
                            name: "EPSG:3857"
                        }
                    },
                    features: features
                }

                response.status(HttpCodes.OK).json(geojson);
            })
            .catch((err) => {
                response.status(HttpCodes.INTERNAL_SERVER_ERROR).send(err);
            })
    }

    public addMapData = (request: any, response: Response): void => {
        const mapData: MapData = new MapData(request.body);

        console.log(mapData);

        this.mapModel.addMapData(mapData)
            .then(() => {
                response.status(HttpCodes.OK).send();
            })
            .catch((err) => {
                response.status(HttpCodes.INTERNAL_SERVER_ERROR).send(err);
            })
    }
}