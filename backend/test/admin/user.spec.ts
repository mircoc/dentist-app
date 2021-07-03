import { FastifyInstance } from "fastify";
import { startApp } from "../../src/app";
import pino from "pino";
import supertest from "supertest";
import { dynamoEndpoint, dynamoRegion, testTableName } from "../config";
import { clearTable, createTable } from "../table";
import { ServiceInstances } from "../../src/typings/service";

jest.setTimeout(120_000);

// prefix to allow jest parallel executions
const TEST_PREFIX = "admin-user";

const tableName = `${TEST_PREFIX}_${testTableName}`;

describe("Admin user handling", () => {
    let app: FastifyInstance;
    let services: ServiceInstances;
    let authToken;
    const logger = pino().child({ module: "Test E2E" });

    beforeAll(async () => {
        try {
            await createTable(tableName, dynamoRegion, dynamoEndpoint);
            const resultStart = await startApp({
                http: {
                    port: 4200,
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
        // await dynamoDB.resetUserPassword(admin, "testPass");
        const { token } = await dynamoDB.updateUserLogin(admin);
        authToken = token;
    });
    test("Successfully create an user", async () => {
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

    test("Prevent duplicated username", async () => {
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

        const result2 = await supertest(app.server)
            .post("/api/v1/admin/user")
            .send({
                userName: "mircocip",
                name: "Pippo",
                surname: "Baudo",
                bornDate: "1938-07-06",
                fiscalCode: "ABCDEF12A11A123A",
                telephone: "392012345",
            })
            .set("Authorization", `Bearer ${authToken}`)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(409);

        console.log("result.body", result2.body);
        //expect(result2.body).toHaveProperty("name", "Mirco");
    });

    test("Successfully update a user field", async () => {
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

        const result2 = await supertest(app.server)
            .put(`/api/v1/admin/user/mircocip`)
            .send({
                name: "Pippo",
                surname: "Baudo",
                bornDate: "1938-07-06",
                fiscalCode: "XBCDEF12A11A123A",
                telephone: "399012345",
            })
            .set("Authorization", `Bearer ${authToken}`)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        // console.log("result.body", result2.body);
        expect(result2.body).toHaveProperty("name", "Pippo");
        expect(result2.body).toHaveProperty("surname", "Baudo");
        expect(result2.body).toHaveProperty("bornDate", "1938-07-06");
        expect(result2.body).toHaveProperty("fiscalCode", "XBCDEF12A11A123A");
        expect(result2.body).toHaveProperty("telephone", "399012345");
    });

    test("Cannot update a not existing user", async () => {
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

        const result2 = await supertest(app.server)
            .put(`/api/v1/admin/user/nonce`)
            .send({
                name: "Pippo",
                surname: "Baudo",
                bornDate: "1938-07-06",
                fiscalCode: "XBCDEF12A11A123A",
                telephone: "399012345",
            })
            .set("Authorization", `Bearer ${authToken}`)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(404);

        // console.log("result.body", result2.body);
    });

    test("Successfully list created users", async () => {
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

        const result2 = await supertest(app.server)
            .post(`/api/v1/admin/user`)
            .send({
                userName: "pippobaudo",
                name: "Pippo",
                surname: "Baudo",
                bornDate: "1938-07-06",
                fiscalCode: "XBCDEF12A11A123A",
                telephone: "399012345",
            })
            .set("Authorization", `Bearer ${authToken}`)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        // console.log("result.body", result2.body);
        expect(result2.body).toHaveProperty("name", "Pippo");
        expect(result2.body).toHaveProperty("surname", "Baudo");
        expect(result2.body).toHaveProperty("bornDate", "1938-07-06");
        expect(result2.body).toHaveProperty("fiscalCode", "XBCDEF12A11A123A");
        expect(result2.body).toHaveProperty("telephone", "399012345");

        const result3 = await supertest(app.server)
            .get(`/api/v1/admin/user`)
            .set("Authorization", `Bearer ${authToken}`)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        console.log("result3.body", result3.body);
        expect(result3.body.count).toBe("3");
        expect(result3.body.data).toHaveLength(3);
        expect(result3.body.data).toMatchSnapshot();
    });
});
