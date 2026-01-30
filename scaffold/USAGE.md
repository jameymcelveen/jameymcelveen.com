# How to Use the Scaffold Generator

## For Creating sethmcelveen.com (or any new site)

### Method 1: Using npx (after publishing to npm)

```bash
npx create-portfolio-site
```

Follow the prompts, and it will create a new folder with your project.

### Method 2: Using locally (before publishing)

```bash
# Navigate to the scaffold directory
cd scaffold

# Install dependencies
npm install

# Run the generator
node bin/create-portfolio-site.js
```

### Method 3: Direct script execution

```bash
cd scaffold
npm install
./bin/create-portfolio-site.js
```

## Example Workflow

1. **Run the generator:**
   ```bash
   npx create-portfolio-site
   ```

2. **Answer the prompts:**
   - Project name: `sethmcelveen`
   - Full name: `Seth McElveen`
   - Professional title: `Software Engineer`
   - Email: `seth@example.com`
   - Phone: `(555) 123-4567`
   - Location: `City, State`
   - Domain: `sethmcelveen.com`

3. **Navigate to the new project:**
   ```bash
   cd sethmcelveen
   ```

4. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```

5. **Complete the profile.json:**
   - Open `src/data/profile.json`
   - Add work experience
   - Update skills
   - Add resume content
   - Customize cover letters
   - Update branding colors if needed

6. **Add your assets:**
   - Add your photo to `public/your-photo.jpg`
   - Add your logo to `public/your-logo.svg`
   - Update image paths in `profile.json`

7. **Start developing:**
   ```bash
   pnpm dev
   ```

## Publishing to npm

If you want to publish this as an npm package:

```bash
cd scaffold

# Make sure template is up to date
./copy-template.sh

# Update version in package.json if needed
# Then publish
npm login
npm publish
```

After publishing, anyone can use:
```bash
npx create-portfolio-site
```

## Updating the Template

When you make improvements to the main site and want to update the template:

```bash
cd scaffold
./copy-template.sh
```

This copies all current files to the template directory.
