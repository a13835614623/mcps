import { Command } from 'commander';
import chalk from 'chalk';
import { configManager } from '../core/config.js';
import { DaemonClient } from '../core/daemon-client.js';

function printTools(serverName: string, tools: any) {
    console.log(chalk.bold(`\nAvailable Tools for ${serverName}:`));
    if (!tools || tools.length === 0) {
        console.log(chalk.yellow('No tools found.'));
    } else {
        tools.forEach((tool: any) => {
            console.log(chalk.cyan(`\n- ${tool.name}`));
            if (tool.description) {
                console.log(`  ${tool.description}`);
            }
            console.log(chalk.gray('  Arguments:'));
            const schema = tool.inputSchema as any;
            if (schema.properties) {
                Object.entries(schema.properties).forEach(([key, value]: [string, any]) => {
                    const required = schema.required?.includes(key) ? chalk.red('*') : '';
                    console.log(`    ${key}${required}: ${value.type || 'any'} ${value.description ? `(${value.description})` : ''}`);
                });
            } else {
                console.log('    None');
            }
        });
    }
}

export const registerToolsCommand = (program: Command) => {
  program.command('tools <server>')
    .description('List available tools on a server')
    .option('-s, --simple', 'Show only tool names')
    .action(async (serverName, options) => {
      // Check if server exists in config first
      const serverConfig = configManager.getServer(serverName);
      if (!serverConfig) {
        console.error(chalk.red(`Server "${serverName}" not found in config.`));
        process.exit(1);
      }

      try {
        // Auto-start daemon if needed
        await DaemonClient.ensureDaemon();

        // List via daemon
        const tools = await DaemonClient.listTools(serverName);

        if (options.simple) {
          // Simple mode: only show tool names
          if (!tools || tools.length === 0) {
            console.log(chalk.yellow('No tools found.'));
          } else {
            tools.forEach((tool: any) => console.log(tool.name));
          }
          console.log(chalk.gray(`\nTotal: ${tools.length} tool(s)`));
        } else {
          // Detailed mode: show full tool information
          printTools(serverName, tools);
        }

      } catch (error: any) {
        console.error(chalk.red(`Failed to list tools: ${error.message}`));
        process.exit(1);
      }
    });
};
