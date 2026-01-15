const request = require("supertest");
const { app, transactions } = require("./server");

describe("Transactions API", () => {
  beforeEach(() => {
    transactions.length = 0; // reset in-memory store
  });

  test("POST /transactions saves transaction and returns it", async () => {
    const payload = { amount: 99.5, description: "Lunch" };

    const postRes = await request(app).post("/transactions").send(payload);
    expect(postRes.status).toBe(201);
    expect(postRes.body).toHaveProperty("id");
    expect(postRes.body.amount).toBe(99.5);
    expect(postRes.body.description).toBe("Lunch");

    const getRes = await request(app).get("/transactions");
    expect(getRes.status).toBe(200);
    expect(getRes.body).toHaveLength(1);
    expect(getRes.body[0].description).toBe("Lunch");
  });

  test("POST /transactions rejects invalid input", async () => {
    const res = await request(app).post("/transactions").send({ amount: -1, description: "" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });
});