import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import clone from 'git-clone';
import rimraf from 'rimraf';
import { exec } from 'child_process';

const TEMPLATE_REPO = 'https://github.com/extcorejs/template-base-server.git';

export default async (providedName: string) => {
  const projectName = providedName || (await askForProjectName());

  try {
    createDirectory(projectName);
    const directory = path.join(process.cwd(), projectName);
    await checkoutTemplate(directory);
    await createGitRepo(directory);
    await installNodeModules(directory);

    console.log(chalk.green("You're all set!"));
  } catch (e: any) {
    console.log(chalk.red('An error occurred!'));
    console.error(e?.message || e);
  }
};

const askForProjectName = async (): Promise<string> => {
  const answers = await inquirer.prompt([
    {
      name: 'projectName',
      type: 'input',
      message: 'Please enter a project name:',
      validate(input: any) {
        if (!input) {
          return 'Please enter a valid name.';
        }

        if (!/^[a-z0-9]+(?:[_\-a-z0-9]+)*$/.test(input)) {
          return 'Invalid chars provided. Name must not contain spaces or special chars, expect hyphens and underscores.';
        }

        return true;
      },
    },
  ]);

  return answers.projectName;
};

const createDirectory = (name: string) => {
  console.log(chalk.cyan('- Create new project directory...'));

  if (fs.existsSync(name)) {
    throw new Error('This directory already exists.');
  }

  fs.mkdirSync(name);
};

const checkoutTemplate = async (directory: string): Promise<void> => {
  console.log(chalk.cyan('- Loading project template...'));

  await clone(TEMPLATE_REPO, directory, {
    checkout: 'master',
  });

  await sleep(2000);

  rimraf.sync(path.join(directory, './.git'), {
    maxBusyTries: 100,
  });
};

const createGitRepo = (directory: string): Promise<void> => {
  console.log(chalk.cyan('- Creating new git repository...'));

  return new Promise((resolve, reject) => {
    exec(`cd ${directory} && git init`, (error, stdout, stderr) => {
      if (error) {
        console.log(chalk.red(error.message));
        reject();
      }
      if (stderr) {
        console.log(chalk.red(stderr));
        reject();
      }
      console.log(stdout);
      resolve();
    });
  });
};

const installNodeModules = (directory: string): Promise<void> => {
  console.log(chalk.cyan('- Installing node modules...'));

  return new Promise((resolve, reject) => {
    exec(`cd ${directory} && npm i`, (error, stdout, stderr) => {
      if (error) {
        console.log(chalk.red(error.message));
        reject();
      }
      if (stderr) {
        console.log(chalk.red(stderr));
        reject();
      }
      console.log(stdout);
      resolve();
    });
  });
};

export const sleep = async (delay = 1000): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};
