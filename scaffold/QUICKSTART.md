# Quick Start Guide

## Create a New Portfolio Site (e.g., sethmcelveen.com)

### Step 1: Install and Run the Generator

**Option A: If published to npm:**
```bash
npx create-portfolio-site
```

**Option B: If using locally:**
```bash
cd scaffold
npm install
node bin/create-portfolio-site.js
```

### Step 2: Answer the Prompts

The generator will ask for:
- Project name (e.g., `sethmcelveen`)
- Full name
- Professional title
- Email, phone, location
- Domain name (e.g., `sethmcelveen.com`)

### Step 3: Complete Your Profile

1. **Navigate to your new project:**
   ```bash
   cd sethmcelveen  # or your project name
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Edit `src/data/profile.json`:**
   - Add your complete work experience
   - Update skills and technologies
   - Customize cover letter templates
   - Add your resume content
   - Update branding colors if desired

4. **Add your assets:**
   - Add your photo: `public/your-photo.jpg`
   - Add your logo: `public/your-logo.svg`
   - Update image paths in `profile.json`

5. **Start developing:**
   ```bash
   pnpm dev
   ```

6. **Open in browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## Publishing to npm (One-Time Setup)

If you want to publish this as an npm package:

```bash
cd scaffold

# Make sure template is up to date
./copy-template.sh

# Login to npm (if not already)
npm login

# Publish
npm publish
```

After publishing, you can use:
```bash
npx create-portfolio-site
```

## Updating the Template

When you make improvements to the main site:

```bash
cd scaffold
./copy-template.sh
```

This updates the template with your latest changes.
