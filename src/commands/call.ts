import { Command } from 'commander';
import chalk from 'chalk';
import { configManager } from '../core/config.js';
import { DaemonClient } from '../core/daemon-client.js';

function printResult(result: any) {
    if (result.content) {
        (result.content as any[]).forEach((item: any) => {
            if (item.type === 'text') {
                console.log(item.text);
            } else if (item.type === 'image') {
                console.log(`[Image: ${item.mimeType}]`);
            } else if (item.type === 'resource') {
                console.log(`[Resource: ${item.resource.uri}]`);
            }
        });
    } else {
            console.log(JSON.stringify(result, null, 2));
    }
}

export const registerCallCommand = (program: Command) => {
  program.command('call <server> <tool> [args...]')
    .description('Call a tool on a server. Arguments format: key=value')
    .addHelpText('after', `
Examples:
  $ mcps call my-server echo message="Hello World"
  $ mcps call my-server add a=10 b=20
  $ mcps call my-server config debug=true
  $ mcps call my-server createUser user='{"name":"Alice","age":30}'

Notes:
  - Arguments are parsed as key=value pairs.
  - Values are automatically parsed as JSON if possible (numbers, booleans, objects).
  - If JSON parsing fails, the value is treated as a string.
  - For strings with spaces, wrap the value in quotes (e.g., msg="hello world").
`)
    .action(async (serverName, toolName, args) => {
      const params: Record<string, any> = {};
      if (args) {
          args.forEach((arg: string) => {
              const eqIndex = arg.indexOf('=');
              if (eqIndex > 0) {
                  const key = arg.slice(0, eqIndex);
                  const valStr = arg.slice(eqIndex + 1);
                  try {
                      params[key] = JSON.parse(valStr);
                  } catch {
                      params[key] = valStr;
                  }
              }
          });
      }

      // Check if server exists in config first
      const serverConfig = configManager.getServer(serverName);
      if (!serverConfig) {
        console.error(chalk.red(`Server "${serverName}" not found in config.`));
        process.exit(1);
      }

      try {
        // Auto-start daemon if needed
        await DaemonClient.ensureDaemon();
        
        // Execute via daemon
        const result = await DaemonClient.executeTool(serverName, toolName, params);
        console.log(chalk.green('Tool execution successful:'));
        printResult(result);

      } catch (error: any) {
         console.error(chalk.red(`Execution failed: ${error.message}`));
         process.exit(1);
      }
    });
};

