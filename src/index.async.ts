import {AxModuleAsync} from "axolotis-module-definition";
import {AsyncContainerModule, interfaces} from "inversify";
import {SaveServiceID} from "./Identifier";
import {SaveManager} from "./services/save/SaveManager";

export * from "./Identifier";

export class AxBasicModule implements AxModuleAsync{
    getModule(): AsyncContainerModule {
        return new AsyncContainerModule(async (bind: interfaces.Bind) => {
            bind(SaveServiceID).to(SaveManager).inSingletonScope();

        });
    }

}
