import {saveAs} from 'file-saver';
import {SerializerEngine, SerializerEngineName} from "@aptero/axolotis-module-serializer";
import {SaveAbstractionLevel} from "./SaveAbstractionLevel";
import {LocalForageSave} from "./LocalForageSave";
import {inject, injectable} from "inversify";
import {makeid} from "@aptero/axolotis-module-id-generator";

export interface SaveMeta {
    name: string,
    date: Date,
    id: string
}

export interface Savable<T> {
    save(): T,

    load(json: T): void,
}

export interface SaveStructure {
    id: string;
    version: string,
    name: string,
    date: string,
    zgame: { [id: string]: string }
}

const SAVE_PREFIX = "SAVE-";
const LAST_SAVE = "1-LAST-SAVE";
const LATEST_VERSION = "1.0.0";

@injectable()
export class SaveManager {
    dataToSave: { key: string, data: Savable<any> }[] = [];
    saveApi: SaveAbstractionLevel = new LocalForageSave();

    constructor(@inject(SerializerEngineName) private serializeEngine: SerializerEngine) {
    }

    registerSavable(key: string, data: Savable<any>) {
        if (!data) throw new Error();
        this.dataToSave.push({key, data});
    }

    async isCreateNew(): Promise<boolean> {
        return !await this.saveApi.getItem(LAST_SAVE);
    }

    async saveAsFile(id: string) {
        const item = await this.saveApi.getItem(SAVE_PREFIX + id);
        //Only simple deserialization with JSON parse since we only needs the meta data.
        const json = JSON.parse(item);
        const blob = new Blob([item], {type: "application/json"});
        //https://www.npmjs.com/package/file-saver
        saveAs(blob, json.name + ".json");
    }

    /**
     * Returns the save id (to be loaded) must call load(id: string) to load this save
     * @param file
     */
    async loadFromFile(file: File):Promise<string> {
        let text = await new Promise<string>(resolve => {
            const reader = new FileReader();
            reader.onload = function (evt) {
                resolve(evt.target.result as string);
            }
            reader.readAsText(file, "UTF-8");
        });
        return this.loadFromString(text);
    }

    /**
     * Returns the save id (to be loaded)
     * @param data
     */
    async loadFromString(data: string): Promise<string> {
        // Generate a unique ID for this save
        const id = makeid(10);
        // Store the parsed save data
        await this.saveApi.setItem(SAVE_PREFIX + id, data);
        const string = this.serializeEngine.deserializeFromString(data);//format checker only
        return id;
    }


    async load(id: string) {
        await this.setLastSave(id);
        let item: SaveStructure = this.serializeEngine.deserializeFromString<SaveStructure>(await this.saveApi.getItem(SAVE_PREFIX + id));
        if (item.version !== LATEST_VERSION) {
            throw new Error("Incompatibility between save version: " + item.version + "/" + LATEST_VERSION);
            //TODO implement version migrator
        }
        console.log("loading save : " + item.name + " / " + item.id);
        for (const data of this.dataToSave) {
            let storedData = item.zgame[data.key];
            data.data.load(storedData);
        }
    }

    async save(id: string = null, name: string = "New Save"): Promise<string> {
        await this.setLastSave(id);
        let save: SaveStructure;
        if (!id) {
            //create new save overwrite otherwise
            id = makeid(10);
            save = {
                version: LATEST_VERSION,
                name,
                id,
                date: new Date().toISOString(),
                zgame: {}
            }
        } else {
            //Only simple deserialization with JSON parse since we only needs the meta data.
            const previous = JSON.parse(await this.saveApi.getItem(SAVE_PREFIX + id));
            save = {
                version: LATEST_VERSION,
                name: previous.name,
                id,
                date: new Date().toISOString(),
                zgame: {}
            }
        }
        for (const data of this.dataToSave) {
            save.zgame[data.key] = data.data.save();
        }
        await this.saveApi.setItem(SAVE_PREFIX + id, this.serializeEngine.serializeToString(save));
        return id;
    }

    async listSaves(): Promise<SaveMeta[]> {
        let ret = [];
        for (const key of await this.saveApi.keys()) {
            if (key.startsWith(SAVE_PREFIX)) {
                //Only simple deserialization with JSON parse since we only needs the meta data.
                let save: SaveStructure = JSON.parse(await this.saveApi.getItem(key)) as any;
                ret.push({
                    id: save.id,
                    name: save.name,
                    date: new Date(save.date)
                })
            }
        }
        ret.sort(function (a, b) {
            return b.date - a.date;
        });
        return ret;
    }

    async fetchLastSave() {
        if (!await this.saveApi.getItem(LAST_SAVE)) {
            const saveMetas = await this.listSaves();
            if (saveMetas.length > 0) {
                //load the latest save in memory
                await this.setLastSave(saveMetas[0].id);
            } else {
                //create a new game on load it
                await this.setLastSave(await this.save(null));
            }
        }
    }

    async saveLast() {
        await this.fetchLastSave();
        await this.save(await this.saveApi.getItem(LAST_SAVE));
    }

    async loadLast() {
        await this.fetchLastSave();
        const saveId = await this.saveApi.getItem(LAST_SAVE);
        await this.load(saveId);
    }

    async setLastSave(id: string): Promise<void> {
        await this.saveApi.setItem(LAST_SAVE, id);
    }

    async delete(id: string) {
        console.log("delete : " + SAVE_PREFIX + id);
        await this.saveApi.removeItem(SAVE_PREFIX + id);
    }
}
