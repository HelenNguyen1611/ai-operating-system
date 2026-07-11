import { createApp, SERVICE_NAME, SERVICE_VERSION } from "./server.js";

const port = Number(process.env.PORT ?? 3000);

const app = createApp();

app.listen(port, () => {
  console.log(`${SERVICE_NAME} v${SERVICE_VERSION} listening on port ${port}`);
  console.log(`  MCP endpoint:  POST http://localhost:${port}/mcp`);
  console.log(`  Health check:  GET  http://localhost:${port}/health`);
});
