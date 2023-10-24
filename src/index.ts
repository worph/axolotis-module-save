import {AxModule} from "axolotis-module-definition";
import {ContainerModule, interfaces} from "inversify";
import {SaveManagerName} from "./Identifier";
import {SaveManager} from "./services/save/SaveManager";

export * from "./services/save/SaveManager";

export * from "./Identifier";

export * from "./services/save/LocalStorageSave";
export * from "./services/save/LocalForageSave";
export * from "./services/save/SaveAbstractionLevel";

export class AxSaveModule implements AxModule{
    getModule(): ContainerModule {
        return new ContainerModule((bind: interfaces.Bind) => {
            bind(SaveManagerName).to(SaveManager).inSingletonScope();
        });
    }
}
