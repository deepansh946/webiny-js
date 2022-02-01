const path = require("path");
const fs = require("fs");

let postTelemetryData;
let localData;
let handler;

const pathToProjectUtilsRoot = path.join(__dirname, "../../../bundling/function");

const handlerPath = pathToProjectUtilsRoot + "/_handler.js";

function waitForMilliSeconds(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

beforeEach(() => {
    fs.writeFileSync(handlerPath, "");

    const telemetry = require("../../../bundling/function/telemetryFunction");
    postTelemetryData = telemetry.postTelemetryData;
    localData = telemetry.localData;
    handler = telemetry.handler;
});

afterEach(() => {
    fs.unlinkSync(handlerPath);
});

describe("Telemetry functions", () => {
    describe("postTelemetryData()", () => {
        test("Can post telemetry data", async () => {
            const now = Date.now();
            const validApiKey = "beb3f14e-141f-427d-9923-755112e35eef";
            const mockSchema = {
                apiKey: validApiKey,
                version: "5.20.0",
                logs: [
                    {
                        error: false,
                        executionDuration: 200,
                        functionName: "testtest",
                        createdOn: now
                    }
                ]
            };

            const result = await postTelemetryData(mockSchema);

            expect(result).toEqual({ message: "Success" });
        });

        test("Fails with an invalid api key", async () => {
            const now = Date.now();
            const invalidApiKey = "I AM NOT VALID AS AN API KEY";
            const mockSchema = {
                apiKey: invalidApiKey,
                version: "5.20.0",
                logs: [
                    {
                        error: false,
                        executionDuration: 200,
                        functionName: "testtest",
                        createdOn: now
                    }
                ]
            };

            const result = await postTelemetryData(mockSchema);

            const { message } = result.error;
            expect(message).toEqual('project.env "undefined" not found.');
        });
    });

    describe("handler()", () => {
        test("Posts telemetry if there are 1000 logs", async () => {
            const thousandHandlerFunctions = Array.from({ length: 1000 }).map(() => handler());

            await Promise.all(thousandHandlerFunctions);

            expect(localData.logs.length).toEqual(0);
        });

        test("Posts telemetry if it has been more than 5 minutes since data was sent", async () => {
            const thousandHandlerFunctions = Array.from({ length: 5 }).map(() => handler());

            // Load 5 logs into the telemetry data
            await Promise.all(thousandHandlerFunctions);

            expect(localData.logs.length).toEqual(5);

            const minutesToFireRequest = 5;
            const timeInFiveMinutes = Date.now() + minutesToFireRequest * 60000;

            // Set time forward 5 minutes
            Date.now = jest.fn(() => timeInFiveMinutes);

            // Wait a second to let the function check if 5 minutes have passed
            await waitForMilliSeconds(1000);

            // Fire a normal handler
            await handler();

            // The timer should have fired, clears the logs and only one should be in the logs now
            expect(localData.logs.length).toEqual(1);

            jest.clearAllMocks();
        });
    });
});
