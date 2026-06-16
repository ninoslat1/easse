import http from "k6/http";

export const options = {
  scenarios: {
    sse: {
      executor: "constant-vus",
      vus: 1000,
      duration: "1m",
    },
  },
};

export default function () {
  http.get(
    "http://host.docker.internal:3000/sse/json",
    {
      headers: {
        Accept: "text/event-stream",
      },
      timeout: "30s",
    }
  );
}