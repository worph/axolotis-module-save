import { AxModule } from 'axolotis-module-definition';
import { ContainerModule } from 'inversify';
import { SerializerEngine } from '@aptero/axolotis-module-serializer';

interface SaveAbstractionLevel {
    getItem(key: string): Promise<string>;
    setItem(key: string, value: string): Promise<string>;
    removeItem(key: string): Promise<void>;
    keys(): Promise<string[]>;
}

interface SaveMeta {
    name: string;
    date: Date;
    id: string;
}
interface Savable<T> {
    save(): T;
    load(json: T): void;
}
interface SaveStructure {
    id: string;
    version: string;
    name: string;
    date: string;
    zgame: Record<string, any>;
}
declare class SaveManager {
    private serializeEngine;
    dataToSave: {
        key: string;
        data: Savable<any>;
    }[];
    saveApi: SaveAbstractionLevel;
    constructor(serializeEngine: SerializerEngine);
    registerSavable(key: string, data: Savable<any>): void;
    isCreateNew(): Promise<boolean>;
    saveAsFile(id: string): Promise<void>;
    loadFromFile(file: File): Promise<string>;
    loadFromString(data: string): Promise<string>;
    load(id: string): Promise<void>;
    save(id?: string, name?: string): Promise<string>;
    listSaves(): Promise<SaveMeta[]>;
    fetchLastSave(): Promise<void>;
    saveLast(): Promise<void>;
    loadLast(): Promise<void>;
    setLastSave(id: string): Promise<void>;
    delete(id: string): Promise<void>;
}

declare const SaveManagerName: unique symbol;

declare class LocalStorageSave implements SaveAbstractionLevel {
    getItem(key: string): Promise<string>;
    setItem(key: string, value: string): Promise<string>;
    removeItem(key: string): Promise<void>;
    keys(): Promise<string[]>;
}

declare class LocalForageSave implements SaveAbstractionLevel {
    private localforage;
    constructor();
    getItem(key: string): Promise<string>;
    setItem(key: string, value: string): Promise<string>;
    removeItem(key: string): Promise<void>;
    keys(): Promise<string[]>;
}

declare class AxSaveModule implements AxModule {
    getModule(): ContainerModule;
}

export { AxSaveModule, LocalForageSave, LocalStorageSave, Savable, SaveAbstractionLevel, SaveManager, SaveManagerName, SaveMeta, SaveStructure };
