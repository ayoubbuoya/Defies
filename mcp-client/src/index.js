import { createHttpServer } from "./server/httpServer.js";

const PORT = Number(process.env.PORT || 5001);

createHttpServer().listen(PORT, () =>
  console.log(`✅ API ready at http://localhost:${PORT}/ask`)
);
