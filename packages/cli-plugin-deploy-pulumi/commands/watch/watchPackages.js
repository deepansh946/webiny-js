const path = require("path");
const fs = require("fs");
const { Worker } = require("worker_threads");
const chalk = require("chalk");
const execa = require("execa");
const { getRandomColorForString } = require("../../utils");

const parseMessage = message => {
    try {
        return JSON.parse(message);
    } catch (e) {
        return {
            type: "error",
            message: `Could not parse received watch result (JSON): ${message}`
        };
    }
};

module.exports = async ({ inputs, output, context }) => {
    const packages = await getPackages(inputs, context);

    if (inputs.debug) {
        context.debug("The following packages will be watched for changes:");
        packages.forEach(item => console.log("‣ " + item.name));
    }

    const { env, debug, logs } = inputs;
    const multipleWatches = packages.length > 1;
    if (multipleWatches) {
        output.log({
            type: "build",
            message: `Watching ${context.info.hl(packages.length)} packages...`
        });
    } else {
        output.log({
            type: "build",
            message: `Watching ${context.info.hl(packages[0].name)} package...`
        });
    }

    const log = (packageName, message) => {
        let prefix = "";
        if (multipleWatches) {
            prefix = chalk.hex(getRandomColorForString(packageName))(packageName) + ": ";
        }

        if (Array.isArray(message)) {
            message = message.filter(Boolean);
            if (message.length) {
                const [first, ...rest] = message;
                output.log({
                    type: "build",
                    message: prefix + first,
                    ...rest
                });
            }
        } else {
            output.log({
                type: "build",
                message: prefix + message
            });
        }
    };

    const promises = [];
    for (let i = 0; i < packages.length; i++) {
        const current = packages[i];
        const config = current.config;
        if (typeof config.commands.watch !== "function") {
            context.warning(
                `Skipping watch of ${context.warning.hl(
                    current.name
                )} package - ${context.warning.hl(
                    "watch"
                )} command missing. Check package's ${context.warning.hl("webiny.config.ts")} file.`
            );
            continue;
        }

        promises.push(
            new Promise(resolve => {
                const worker = new Worker(path.join(__dirname, "./worker.js"));
                worker.on("message", threadMessage => {
                    const { type, message } = parseMessage(threadMessage);

                    if (type === "error") {
                        context.error(current.name);
                        log(message);
                        log();
                        return resolve({
                            package: current,
                            error: message
                        });
                    }

                    log(current.name, message);
                });

                worker.on("error", () => {
                    context.error(
                        `An unknown error occurred while watching ${context.error.hl(
                            current.name
                        )}:`
                    );

                    resolve({
                        package: current,
                        result: {
                            message: `An unknown error occurred.`
                        }
                    });
                });

                worker.postMessage(
                    JSON.stringify({
                        options: { env, debug, logs },
                        package: current
                    })
                );
            })
        );
    }

    await Promise.all(promises);
};

const getPackages = async inputs => {
    let packagesList = [];
    if (inputs.package) {
        packagesList = Array.isArray(inputs.package) ? inputs.package : [inputs.package];
    } else {
        packagesList = await execa("yarn", [
            "webiny",
            "workspaces",
            "tree",
            "--json",
            "--depth",
            inputs.depth,
            "--distinct",
            "--folder",
            inputs.folder
        ]).then(({ stdout }) => JSON.parse(stdout));
    }

    const commandArgs = [
        "webiny",
        "workspaces",
        "list",
        "--json",
        "--withPath",
        ...packagesList.reduce((current, item) => {
            current.push("--scope", item);
            return current;
        }, [])
    ];

    if (inputs.env) {
        commandArgs.push("--env", inputs.env);
    }

    return execa("yarn", commandArgs).then(({ stdout }) => {
        const result = JSON.parse(stdout);
        const packages = [];
        for (const packageName in result) {
            const root = result[packageName];
            const configPath = fs.existsSync(path.join(root, "webiny.config.ts"))
                ? path.join(root, "webiny.config.ts")
                : path.join(root, "webiny.config.js");

            packages.push({
                name: packageName,
                config: require(configPath).default || require(configPath),
                paths: {
                    root,
                    config: configPath
                }
            });
        }

        return packages;
    });
};
