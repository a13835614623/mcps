import { Command } from 'commander';
import chalk from 'chalk';
import { configManager } from '../core/config.js';
import { McpClientService } from '../core/client.js';

export const registerToolsCommand = (program: Command) => {
  program.command('tools <server>')
    .description('List available tools on a server')
    .action(async (serverName) => {
      const serverConfig = configManager.getServer(serverName);
      if (!serverConfig) {
        console.error(chalk.red(`Server "${serverName}" not found.`));
        process.exit(1);
      }

      const client = new McpClientService();
      try {
        // console.log(chalk.gray(`Connecting to ${serverName}...`));
        await client.connect(serverConfig);
        
        const tools = await client.listTools();
        
        console.log(chalk.bold(`\nAvailable Tools for ${serverName}:`));
        if (tools.tools.length === 0) {
            console.log(chalk.yellow('No tools found.'));
        } else {
            tools.tools.forEach(tool => {
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
      } catch (error: any) {
        console.error(chalk.red(`Failed to list tools: ${error.message}`));
      } finally {
        await client.close();
      }
    });
};
