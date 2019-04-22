import request from "supertest";
import app from "../src/app";
import { cleanUpMetadata } from "inversify-express-utils";

describe("GET /random-url", () => {
  beforeEach(() => {
    cleanUpMetadata();
  });

  it("should return 404", (done) => {
    request(app).get("/reset")
      .expect(404, done);
  });
});
