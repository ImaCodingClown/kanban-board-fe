import { setupServer } from "msw/native";
import { http, HttpResponse } from "msw";

export const server = setupServer(
  http.get("http://127.0.0.1:8080/board", () => {
    return HttpResponse.json(
      {
        name: "Mock Board",
        columns: ["To Do", "In Progress", "Done"],
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }),
);
