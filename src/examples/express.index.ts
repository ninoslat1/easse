import express from "express";
import { createSSEResponse } from "../../dist/easse.cjs";

const app = express();

app.get("/sse/express", async (req, res) => {
  await createSSEResponse(
    async () => {
      return {
        status: "success",
        data: Math.random(),
        message: "Streaming from Express",
      };
    },
    {
      res,
      interval: 1000,
      minify: true,
    },
  );
});

app.listen(3000, () => console.log("Express SSE: http://localhost:3000/sse/express"));
