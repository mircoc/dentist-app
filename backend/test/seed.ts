import { startApp } from "../src/app";
import pino from "pino";
import { dynamoEndpoint, dynamoRegion } from "./config";
import { createTable } from "./table";
import { getConfigString } from "../src/utils/config";
import dotenv from "dotenv";

dotenv.config();

const logger = pino().child({ module: "Data Seeder" });
const tableName = `${getConfigString("DYNAMODB_PREFIX_TABLE")}dentist`;

(async function () {
    await createTable(tableName, dynamoRegion, dynamoEndpoint);
    const resultStart = await startApp({
        http: {
            port: 4900,
            host: "localhost",
        },
        logger,
        dynamoDB: {
            region: dynamoRegion,
            endpoint: dynamoEndpoint,
            tableName,
            jwtSecret: "testSecret",
        },
    });
    const app = resultStart[0];
    const services = resultStart[1];

    const dynamoDB = services.dynamoDB;
    let adminUserName = "admin";
    try {
        await dynamoDB.createUser({
            userName: adminUserName,
            name: "Mirco",
            surname: "Cipriani",
            bornDate: "1999-12-12",
            fiscalCode: "ABCDED12A11A123A",
            telephone: "390012345",
        });
    } catch (err) {}
    await dynamoDB.resetUserPassword(adminUserName, "test");

    await app.close();
})();
