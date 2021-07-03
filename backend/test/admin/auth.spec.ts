import { FastifyInstance } from "fastify";
import { startApp } from "../../src/app";
import pino from "pino";
import supertest from "supertest";
import { dynamoEndpoint, dynamoRegion, testTableName } from "../config";
import { clearTable, createTable } from "../table";
import { ServiceInstances } from "../../src/typings/service";

jest.setTimeout(120_000);

// prefix to allow jest parallel executions
const TEST_PREFIX = "authorization";

const tableName = `${TEST_PREFIX}_${testTableName}`;

describe("Authorization handling", () => {
    let app: FastifyInstance;
    let services: ServiceInstances;
    let authToken;
    const logger = pino().child({ module: "Test E2E" });

    beforeAll(async () => {
        try {
            await createTable(tableName, dynamoRegion, dynamoEndpoint);
            const resultStart = await startApp({
                http: {
                    port: 4100,
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
            app = resultStart[0];
            services = resultStart[1];
        } catch (err) {
            console.error(err);
        }
    });
    afterAll(async () => {
        app && (await app.close());
    });
    beforeEach(async () => {
        await clearTable(tableName, dynamoRegion, dynamoEndpoint);

        const dynamoDB = services.dynamoDB;
        const admin = await dynamoDB.createUser({
            userName: "myadmin",
            name: "Mirco",
            surname: "Cipriani",
            bornDate: "1978-07-06",
            fiscalCode: "ABCDED12A11A123A",
            telephone: "390012345",
        });
        const { token } = await dynamoDB.updateUserLogin(admin);
        authToken = token;
    });
    test("Get error when not authenticated", async () => {
        const result = await supertest(app.server)
            .post("/api/v1/admin/user")
            .send({
                userName: "mircocip",
                name: "Mirco",
                surname: "Cipriani",
                bornDate: "1978-07-06",
                fiscalCode: "ABCDEF12A11A123A",
                telephone: "392012345",
            })
            .set("Authorization", `Bearer fakeToken`)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(401);

        //console.log("result.body", result.body);
        expect(result.body).toHaveProperty("code", "INVALID_TOKEN_ERROR");
    });

    test("Works with right authorization token", async () => {
        const result = await supertest(app.server)
            .post("/api/v1/admin/user")
            .send({
                userName: "mircocip",
                name: "Mirco",
                surname: "Cipriani",
                bornDate: "1978-07-06",
                fiscalCode: "ABCDEF12A11A123A",
                telephone: "392012345",
            })
            .set("Authorization", `Bearer ${authToken}`)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        //console.log("result.body", result.body);
        expect(result.body).toHaveProperty("name", "Mirco");
    });

    test("Log-in a valid user", async () => {
        await services.dynamoDB.resetUserPassword("myadmin", "testPass");
        const result = await supertest(app.server)
            .post("/api/v1/login")
            .send({
                username: "myadmin",
                password: "testPass",
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        //console.log("result.body", result.body);
        expect(result.body).toHaveProperty("token");

        const token = result.body.token;

        const result2 = await supertest(app.server)
            .post("/api/v1/admin/user")
            .send({
                userName: "mircocip",
                name: "Mirco",
                surname: "Cipriani",
                bornDate: "1978-07-06",
                fiscalCode: "ABCDEF12A11A123A",
                telephone: "392012345",
            })
            .set("Authorization", `Bearer ${token}`)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        //console.log("result.body", result.body);
        expect(result2.body).toHaveProperty("name", "Mirco");
    });

    test("Forbid Log-in an invalid user", async () => {
        await services.dynamoDB.resetUserPassword("myadmin", "testPass");
        const result = await supertest(app.server)
            .post("/api/v1/login")
            .send({
                username: "pippo",
                password: "testPass",
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400);

        //console.log("result.body", result.body);
        expect(result.body).toHaveProperty("error", true);
    });

    test("Forbid Log-in an invalid user password", async () => {
        const result = await supertest(app.server)
            .post("/api/v1/login")
            .send({
                username: "myadmin",
                password: " ",
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(400);

        //console.log("result.body", result.body);
        expect(result.body).toHaveProperty("error", true);
    });

    test("Log-out a valid user", async () => {
        await services.dynamoDB.resetUserPassword("myadmin", "testPass");
        const result = await supertest(app.server)
            .post("/api/v1/login")
            .send({
                username: "myadmin",
                password: "testPass",
            })
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        expect(result.body).toHaveProperty("token");

        const token = result.body.token;

        const result2 = await supertest(app.server)
            .post("/api/v1/admin/user")
            .send({
                userName: "mircocip",
                name: "Mirco",
                surname: "Cipriani",
                bornDate: "1978-07-06",
                fiscalCode: "ABCDEF12A11A123A",
                telephone: "392012345",
            })
            .set("Authorization", `Bearer ${token}`)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        expect(result2.body).toHaveProperty("name", "Mirco");


        const result3 = await supertest(app.server)
            .post("/api/v1/logout")
            .set("Authorization", `Bearer ${token}`)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        expect(result3.body).toHaveProperty("success", true);

        const result4 = await supertest(app.server)
            .post("/api/v1/admin/user")
            .send({
                userName: "mircocip",
                name: "Mirco",
                surname: "Cipriani",
                bornDate: "1978-07-06",
                fiscalCode: "ABCDEF12A11A123A",
                telephone: "392012345",
            })
            .set("Authorization", `Bearer ${token}`)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(401);

        expect(result4.body).toHaveProperty("code", "INVALID_TOKEN_ERROR");
    });
});
