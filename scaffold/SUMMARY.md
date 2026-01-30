# Portfolio Site Scaffold - Summary

## What This Is

A CLI tool that generates a new portfolio site from a template. Perfect for creating multiple portfolio sites (like `jameymcelveen.com` and `sethmcelveen.com`) with the same codebase but different data.

## File Structure

```
scaffold/
├── bin/
│   └── create-portfolio-site.js    # Main CLI script
├── template/                        # Template files (copied to new projects)
│   ├── src/                        # All source code
│   ├── public/                     # Public assets
│   ├── package.json                # Template package.json
│   └── ...                        # All config files
├── package.json                    # Scaffold package config
├── copy-template.sh               # Script to update template from main site
├── README.md                       # Full documentation
├── QUICKSTART.md                   # Quick start guide
└── USAGE.md                        # Usage examples
```

## How It Works

1. **Template**: All site files are in `scaffold/template/`
2. **CLI Script**: `bin/create-portfolio-site.js` prompts for info and creates a new project
3. **Data-Driven**: All content comes from `profile.json` - no code changes needed

## Usage

### Quick Start (After Publishing to npm)

```bash
npx create-portfolio-site
```

### Local Development

```bash
cd scaffold
npm install
node bin/create-portfolio-site.js
```

## Publishing to npm

1. Update version in `scaffold/package.json`
2. Run `./copy-template.sh` to update template
3. `npm login` (if needed)
4. `npm publish`

## Updating Template

When you improve the main site:

```bash
cd scaffold
./copy-template.sh
```

This copies all files from the parent directory to `template/`.

## Key Features

- ✅ One-liner to create new sites
- ✅ Interactive prompts for basic info
- ✅ All content in `profile.json` (no code changes)
- ✅ Can be published to npm
- ✅ Easy to update template

## Example: Creating sethmcelveen.com

```bash
# Run generator
npx create-portfolio-site

# Answer prompts:
# - Project: sethmcelveen
# - Name: Seth McElveen
# - Title: Software Engineer
# - Domain: sethmcelveen.com
# ... etc

# Then:
cd sethmcelveen
pnpm install
# Edit src/data/profile.json with complete info
pnpm dev
```

That's it! The site is ready to customize.
