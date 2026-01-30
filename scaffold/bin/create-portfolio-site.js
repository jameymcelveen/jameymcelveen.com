#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import inquirer from 'inquirer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateDir = path.join(__dirname, '..', 'template');

async function createPortfolioSite() {
  console.log(chalk.blue.bold('\n🚀 Create Portfolio Site\n'));

  // Get project name
  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is the project name?',
      default: 'my-portfolio',
      validate: (input) => {
        if (!input.trim()) {
          return 'Project name cannot be empty';
        }
        if (!/^[a-z0-9-]+$/.test(input)) {
          return 'Project name can only contain lowercase letters, numbers, and hyphens';
        }
        return true;
      },
    },
  ]);

  // Get basic info for profile.json
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Full name:',
      default: 'Your Name',
    },
    {
      type: 'input',
      name: 'title',
      message: 'Professional title:',
      default: 'Software Developer',
    },
    {
      type: 'input',
      name: 'email',
      message: 'Email:',
      default: 'your@email.com',
    },
    {
      type: 'input',
      name: 'phone',
      message: 'Phone:',
      default: '(555) 123-4567',
    },
    {
      type: 'input',
      name: 'location',
      message: 'Location:',
      default: 'City, State',
    },
    {
      type: 'input',
      name: 'domain',
      message: 'Domain (without www):',
      default: projectName + '.com',
    },
  ]);

  const targetDir = path.resolve(process.cwd(), projectName);

  // Check if directory exists
  if (await fs.pathExists(targetDir)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Directory ${projectName} already exists. Overwrite?`,
        default: false,
      },
    ]);
    if (!overwrite) {
      console.log(chalk.yellow('Cancelled.'));
      process.exit(0);
    }
    await fs.remove(targetDir);
  }

  console.log(chalk.blue(`\n📦 Creating project in ${targetDir}...\n`));

  // Copy template files
  await fs.copy(templateDir, targetDir);

  // Update package.json
  const packageJsonPath = path.join(targetDir, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);
  packageJson.name = projectName;
  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

  // Update profile.json with user input
  const profileJsonPath = path.join(targetDir, 'src', 'data', 'profile.json');
  const profileJson = await fs.readJson(profileJsonPath);

  // Update personal info
  profileJson.personal.name = answers.name;
  profileJson.personal.title = answers.title;
  profileJson.personal.location = answers.location;

  // Update contact info
  profileJson.contact.email = answers.email;
  profileJson.contact.phone = answers.phone;
  profileJson.contact.location = answers.location;

  // Update domain
  profileJson.site.domain.canonical = answers.domain;
  profileJson.site.domain.www = `www.${answers.domain}`;

  // Update metadata
  profileJson.site.metadata.title = `${answers.name} | ${answers.title}`;
  profileJson.site.metadata.author = answers.name;
  profileJson.site.metadata.openGraph.title = `${answers.name} | ${answers.title}`;

  await fs.writeJson(profileJsonPath, profileJson, { spaces: 2 });

  // Update next.config.ts with domain
  const nextConfigPath = path.join(targetDir, 'next.config.ts');
  let nextConfig = await fs.readFile(nextConfigPath, 'utf-8');
  // The config already reads from profile.json, so no changes needed
  await fs.writeFile(nextConfigPath, nextConfig);

  // Create .gitignore if it doesn't exist
  const gitignorePath = path.join(targetDir, '.gitignore');
  if (!(await fs.pathExists(gitignorePath))) {
    await fs.writeFile(
      gitignorePath,
      `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`
    );
  }

  console.log(chalk.green('\n✅ Project created successfully!\n'));
  console.log(chalk.cyan('Next steps:\n'));
  console.log(`  cd ${projectName}`);
  console.log('  pnpm install  # or npm install');
  console.log('  pnpm dev      # or npm run dev\n');
  console.log(chalk.yellow('📝 Don\'t forget to:'));
  console.log('  - Update src/data/profile.json with your complete information');
  console.log('  - Add your photo to public/ directory');
  console.log('  - Update branding colors in profile.json if needed');
  console.log('  - Customize cover letter templates\n');
}

createPortfolioSite().catch((error) => {
  console.error(chalk.red('Error:'), error);
  process.exit(1);
});
