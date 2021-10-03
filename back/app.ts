import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import dotenv from 'dotenv';
import history from "connect-history-api-fallback";
dotenv.config();

export var root: string = __dirname;
export var storageRoot: string = __dirname + '/storage';

const app = express();
const PORT = process.env.PORT ?? 3000

app.use(cors())
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: __dirname + '/uploaded',
    limits: { fileSize: 500 * 1024 * 1024 }
}));

app.use(history())
app.use(express.static('images'));
app.use(express.static('front'));

app.listen(PORT, () => {
    console.log(`Server is listening port ${PORT}`);
});