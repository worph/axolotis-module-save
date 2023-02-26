import {AxModule} from "axolotis-module-definition";
import {ContainerModule, interfaces} from "inversify";
import {SaveServiceID} from "./Identifier";
import {SaveManager} from "./services/save/SaveManager";

export * from "./services/save/SaveManager";

export * from "./Identifier";

export class AxBasicModule implements AxModule{
    getModule(): ContainerModule {
        console.log("AxBasicModule installed 2");
        return new ContainerModule((bind: interfaces.Bind) => {
            bind(SaveManager.name).to(SaveManager).inSingletonScope();
            bind(SaveServiceID).to(SaveManager).inSingletonScope();

        });
    }

}
