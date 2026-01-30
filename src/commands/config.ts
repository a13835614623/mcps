import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Command } from 'commander';
import { configManager } from '../core/config.js';
import { ServerConfig } from '../types/config.js';

export const registerConfigCommand = (program: Command) => {
  const configCmd = program.command('config')
    .description('Manage configuration');

  configCmd.command('import <file>')
    .description('Import servers from a JSON configuration file (e.g., mcporter.json)')
    .option('-f, --force', 'Overwrite existing servers with the same name', false)
    .action((file, options) => {
      try {
        const absolutePath = path.resolve(file);
        if (!fs.existsSync(absolutePath)) {
          console.error(chalk.red(`File not found: ${absolutePath}`));
          process.exit(1);
        }

        const content = fs.readFileSync(absolutePath, 'utf-8');
        let json;
        try {
            json = JSON.parse(content);
        } catch (e) {
             console.error(chalk.red('Invalid JSON file.'));
             process.exit(1);
        }

        let importedCount = 0;
        let skippedCount = 0;

        // Support standard MCP config format (mcpServers object)
        const serversMap = json.mcpServers || {};
        
        Object.entries(serversMap).forEach(([name, config]: [string, any]) => {
            // Skip disabled servers
            if (config.disabled === true) {
                skippedCount++;
                return;
            }

            const serverName = name;
            let newServer: ServerConfig;

            if (config.command) {
                 newServer = {
                    name: serverName,
                    type: 'stdio',
                    command: config.command,
                    args: config.args || [],
                    env: config.env,
                };
            } else if (config.url) {
                 newServer = {
                    name: serverName,
                    type: 'sse',
                    url: config.url
                };
            } else {
                console.warn(chalk.yellow(`Skipping invalid server config for "${serverName}": missing command or url`));
                return;
            }

            const existing = configManager.getServer(serverName);
            if (existing) {
                if (options.force) {
                    configManager.updateServer(serverName, newServer);
                    console.log(chalk.gray(`Updated existing server: ${serverName}`));
                    importedCount++;
                } else {
                    console.log(chalk.yellow(`Skipping existing server: ${serverName} (use --force to overwrite)`));
                    skippedCount++;
                }
            } else {
                configManager.addServer(newServer);
                console.log(chalk.green(`Imported server: ${serverName}`));
                importedCount++;
            }
        });

        console.log(chalk.bold(`\nImport complete. Imported: ${importedCount}, Skipped: ${skippedCount}`));

      } catch (error: any) {
        console.error(chalk.red(`Import failed: ${error.message}`));
      }
    });
};
