#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer, configureMcpTools } from "./server-config.js";

const server = createMcpServer();

configureMcpTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("RSK MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});