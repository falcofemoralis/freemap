import Pool from "mysql2/typings/mysql/lib/Pool";
import MySQL from "mysql2";

export class DataBase {

    private static instance: DataBase | null = null;
    private pool: Pool; // Пул необходим для того чтобы не было частых подключений к базе
    private readonly CONNECTION_LIMIT = 5; // Лимит одновременных подключений к базе данных

    private constructor() {
        console.log(process.env.DB_PORT);

        this.pool = MySQL.createPool({
            connectionLimit: this.CONNECTION_LIMIT,
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true,
            waitForConnections: true,
            port: Number(process.env.DB_PORT)
        });
    }

    public static getDatabase(): DataBase {
        if (DataBase.instance == null)
            DataBase.instance = new DataBase();
        return DataBase.instance;
    }

    public getPool(): Pool {
        return this.pool;
    }
}