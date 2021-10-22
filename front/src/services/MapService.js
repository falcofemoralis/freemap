import { ServiceData } from "./ServiceData";

export const MapApi = {
    _api: `${ServiceData.DOMAIN}/api/map`,

    async addMapData(obj) {
        const formData = new FormData();

        formData.append('coordinates', JSON.stringify(obj.coordinates));
        formData.append('name', obj.name);
        formData.append('type', obj.type);

        await fetch(this._api + '/data', {
            method: "POST",
            body: formData
        })
    },

    async getMapData() {
        const res = await fetch(this._api + "/data")

        if (res.status == 200) {
            return res.json();
        }
    },
}