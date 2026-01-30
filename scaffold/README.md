# Portfolio Site Scaffold Generator

A CLI tool to quickly scaffold a new portfolio site from this template.

## Quick Start

### Option 1: Use locally (without publishing to npm)

```bash
# From the scaffold directory
cd scaffold
npm install
node bin/create-portfolio-site.js
```

### Option 2: Publish to npm (recommended)

1. **Publish the package:**
   ```bash
   cd scaffold
   npm login  # if not already logged in
   npm publish
   ```

2. **Use from anywhere:**
   ```bash
   npx create-portfolio-site
   ```

### Option 3: Link locally for development

```bash
cd scaffold
npm install
npm link
# Now you can use: create-portfolio-site from anywhere
```

## Usage

Run the generator:

```bash
npx create-portfolio-site
# or
create-portfolio-site
```

The CLI will prompt you for:
- Project name
- Full name
- Professional title
- Email
- Phone
- Location
- Domain name

It will then:
1. Create a new directory with your project name
2. Copy all template files
3. Initialize `profile.json` with your basic information
4. Set up the project structure

## After Generation

1. **Install dependencies:**
   ```bash
   cd your-project-name
   pnpm install  # or npm install
   ```

2. **Update profile.json:**
   - Add your complete work experience
   - Update skills
   - Add your photo to `public/` and update the path
   - Customize cover letter templates
   - Adjust branding colors

3. **Run development server:**
   ```bash
   pnpm dev
   ```

## Updating the Template

If you make changes to the main site and want to update the template:

```bash
cd scaffold
./copy-template.sh
```

This will copy all current files from the parent directory to the template folder.

## Publishing to npm

1. Update version in `scaffold/package.json`
2. Make sure template is up to date: `./copy-template.sh`
3. Test locally: `npm link` and try it
4. Publish: `npm publish`

## File Structure

```
scaffold/
├── bin/
│   └── create-portfolio-site.js  # CLI script
├── template/                      # Template files (copied to new projects)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── package.json                   # Scaffold package config
├── copy-template.sh              # Script to update template
└── README.md                      # This file
```

## Notes

- The template excludes personal photos and node_modules
- All user-specific data should be in `src/data/profile.json`
- The generator creates a basic profile.json that you'll need to complete
