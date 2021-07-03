import pino from "pino";
import { FeatureDisableInTest, isInTestRunner } from "./jestHelper";


const pinoLogger = pino({
    hooks: {
        // logMethod: function logMethod(args, method) {
        //     debugger
        //     if (args.length === 2) {
        //         args[0] = `${args[0]} %j`;
        //     }
        //     method.apply(this, args as [msg: string, ...args: any[]]);
        // }
    },
    enabled: !isInTestRunner(FeatureDisableInTest.LOGGING),
});

export function getLogger(module: string): pino.Logger {
    return pinoLogger.child({
        module,
        service: process.env["npm_package_name"],
        version: process.env["npm_package_version"],
    });
}
