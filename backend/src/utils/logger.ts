import pino from "pino";


const pinoLogger = pino({
    hooks: {
        // logMethod: function logMethod(args, method) {
        //     debugger
        //     if (args.length === 2) {
        //         args[0] = `${args[0]} %j`;
        //     }
        //     method.apply(this, args as [msg: string, ...args: any[]]);
        // }
    }
});

export function getLogger(module: string): pino.Logger {
    return pinoLogger.child({
        module,
        service: process.env["npm_package_name"],
        version: process.env["npm_package_version"],
    });
}
