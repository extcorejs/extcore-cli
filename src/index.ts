#!/usr/bin/env node
import { Command } from 'commander';
import createProject from './commands/create-project';

const program = new Command();

program.version('1.0.0');

program.command('create [project-name]').description('Create a new project from scratch').action(createProject);

program.parse(process.argv);
