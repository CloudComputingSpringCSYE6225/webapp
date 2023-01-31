import request from "supertest";
import app from "../app.js";


describe('Health Endpoint', () => {
    it('should hit the health endpoint /healthz', async() => {
        const res = request(app).get('/healthz')
        console.log(res)
            // expect(res).toBe(200)
    })
})