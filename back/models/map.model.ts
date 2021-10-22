import { MapData } from './../types/MapData';
import { QueryError, RowDataPacket } from "mysql2";
import Pool from "mysql2/typings/mysql/lib/Pool";
import { DataBase } from "../controllers/database";
import humps from 'humps';
import { resolve } from 'path';

export class MapModel {
    private pool: Pool;

    constructor() {
        this.pool = DataBase.getDatabase().getPool();
    }

    public async getMapData(): Promise<Array<MapData>> {
        return new Promise((resolve, reject) => {
            const query: string = "SELECT * FROM mapdata"

            console.log(query);

            this.pool.query(query, (err: QueryError, res: RowDataPacket[]) => {
                if (err) return reject(err);

                //  res = humps.camelizeKeys(res) as RowDataPacket[];
                let mapData: Array<MapData> = res.length != 0 ? JSON.parse(JSON.stringify(res)) : null;
                resolve(mapData);
            });
        })
    };

    public async addMapData(mapData: MapData): Promise<void> {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO mapdata(name, coordinates, type) VALUES (?, ?, ?)`;

            const data: Array<any> = [
                mapData.name,
                mapData.coordinates,
                mapData.type
            ];

            this.pool.query(query, data, (err: QueryError | null) => {
                if (err) return reject(err);
                else resolve();
            })
        })
    }
}