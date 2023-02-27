import {AxModuleAsync} from "axolotis-module-definition";
import {AsyncContainerModule, interfaces} from "inversify";
import {SaveManagerName} from "./Identifier";
import {SaveManager} from "./services/save/SaveManager";

export * from "./Identifier";

export class AxSaveModule implements AxModuleAsync{
    getModule(): AsyncContainerModule {
        return new AsyncContainerModule(async (bind: interfaces.Bind) => {
            bind(SaveManagerName).to(SaveManager).inSingletonScope();

        });
    }

}
