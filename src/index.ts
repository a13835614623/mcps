#!/usr/bin/env node
import { Command } from 'commander';
import { registerServerCommands } from './commands/server.js';
import { registerToolsCommand } from './commands/tools.js';
import { registerCallCommand } from './commands/call.js';
import { registerConfigCommand } from './commands/config.js';

const program = new Command();

program
  .name('mcpp')
  .description('A CLI to manage and use MCP servers')
  .version('1.0.0');

registerServerCommands(program);
registerToolsCommand(program);
registerCallCommand(program);
registerConfigCommand(program);

program.parse(process.argv);
