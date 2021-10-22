export class MapData {
    public id: number | null;
    public name: string;
    public coordinates: string;
    public type: string;

    constructor(obj?: any) {
        this.id = obj.id ?? null;
        this.name = obj.name;
        this.coordinates = obj.coordinates;
        this.type = obj.type;
    }
}