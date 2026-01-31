import { McpClientService } from './client.js';
import { configManager } from './config.js';
import { ServerConfig } from '../types/config.js';

export class ConnectionPool {
  private clients: Map<string, McpClientService> = new Map();
  private initializing = false;
  private initialized = false;

  async getClient(serverName: string, options?: { timeoutMs?: number }): Promise<McpClientService> {
    if (this.clients.has(serverName)) {
      return this.clients.get(serverName)!;
    }

    const serverConfig = configManager.getServer(serverName);
    if (!serverConfig) {
      throw new Error(`Server "${serverName}" not found in config.`);
    }

    const client = new McpClientService();
    const connectPromise = client.connect(serverConfig);
    if (options?.timeoutMs) {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Connection timeout after ${options.timeoutMs}ms`)), options.timeoutMs);
      });
      await Promise.race([connectPromise, timeoutPromise]);
    } else {
      await connectPromise;
    }
    this.clients.set(serverName, client);
    return client;
  }

  async closeClient(serverName: string) {
    if (this.clients.has(serverName)) {
      console.log(`[Daemon] Closing connection to ${serverName}...`);
      try {
        await this.clients.get(serverName)!.close();
      } catch (e) {
        console.error(`[Daemon] Error closing ${serverName}:`, e);
      }
      this.clients.delete(serverName);
      return true;
    }
    return false;
  }

  async closeAll() {
    for (const [name, client] of this.clients) {
      console.log(`[Daemon] Closing connection to ${name}...`);
      try {
        await client.close();
      } catch (e) {
        console.error(`[Daemon] Error closing ${name}:`, e);
      }
    }
    this.clients.clear();
  }

  async initializeAll() {
    const servers = configManager.listServers();
    this.initializing = true;
    this.initialized = false;

    // 过滤掉 disabled 的服务器
    const enabledServers = servers.filter(server => {
      const disabled = (server as any).disabled === true;
      if (disabled) {
        console.log(`[Daemon] Skipping disabled server: ${server.name}`);
      }
      return !disabled;
    });

    if (enabledServers.length === 0) {
      console.log('[Daemon] No enabled servers to initialize.');
      this.initializing = false;
      this.initialized = true;
      return;
    }

    console.log(`[Daemon] Initializing ${enabledServers.length} connection(s)...`);
    for (const server of enabledServers) {
        try {
            console.log(`[Daemon] Connecting to server: ${server.name}...`);
            await this.getClient(server.name, { timeoutMs: 8000 });
            console.log(`[Daemon] ✓ Connected to ${server.name}`);
        } catch (error: any) {
            console.error(`[Daemon] ✗ Failed to connect to ${server.name}:`, error.message);
        }
    }
    this.initializing = false;
    this.initialized = true;
    console.log('[Daemon] Initialization complete.');
  }

  getInitStatus() {
    return { initializing: this.initializing, initialized: this.initialized };
  }

  async getActiveConnectionDetails(includeTools = true): Promise<{ name: string, toolsCount: number | null, status: string }[]> {
    const details = [];
    for (const [name, client] of this.clients) {
      let toolsCount = null;
      let status = 'connected';
      if (includeTools) {
        try {
          const result = await client.listTools();
          toolsCount = result.tools.length;
        } catch (e) {
          status = 'error';
        }
      }
      details.push({ name, toolsCount, status });
    }
    return details;
  }
}

export const connectionPool = new ConnectionPool();
