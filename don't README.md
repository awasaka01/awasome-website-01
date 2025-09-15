


## Languages
⌬ `html` - Treated as a Vento.vto template file  
⌬ `scss`, `css`, `js`, `ts`, `jsx`, `tsx`

<br>

## Folder structure
☰ `website` - Output folder, files to be served on the site  
☰ `source` - The uncompiled source files for the site  
☰ `source/pages` -   
☰ `source/_includes` -   
☰ `source/` -   
☰ `source/` -   
☰ `engine` - Build tools, plugins, etc.  
☰ `scripts` - Arbitrary scripts that aren't used in in builds  

<br>

## Commands
▷ `build` - Quick minimal working build of the site, no minifying etc.  
▷ `dev` - Launch a local server to view changes  
▷ `merge` - Helper to automatically merge the current git branch to main  
▷ `bot:build` - Build for production, used by github actions  
▷ `bot:buildneo` - Same but with the '--neocities' flag


You can also add certain flags to the build command ~ *example:* `pnpm build serve n cleardist` 

Flags | Description 
-|-
`f` / `fullbuild` | Enable unnecessary build features like minifying
`s` / `serve`     | Launch a local server to view changes instantly
`n` / `neocities` | Disable specific features limited by Neocities 
`c` / `cleardist` | Clear output folder before building
`p` / `production`| Overrides the other flags


<br><br><br><br><br><br><br><br><br>

---

# `build.js` Overview

`build.js` automates building the project and running Eleventy with environment variables and CLI flags.

### Steps:
1. **Compile `awa-util`**  
   - Output `dist/awa-util/core.js` (minimized & rolled up, no types)  
   - Output `awa-util/js` with `.d.ts` files (not minimized)  
   - Skip compilation if output would be identical  

2. **Parse CLI arguments**  
   - Set environment variables for: `FULLBUILD`, `SERVE`, `NEOCITIES`, `CLEARDIST`, `PRODUCTION`

3. **Clear output folder**  
   - If `--cleardist` flag is set, remove all files from `dist/`

4. **Run Eleventy**  
   - Pass along flags based on environment variables  

---





> **Note:** The `-` is optional. You can run `node build.js f` instead of `node build.js -f`.  


> **Note:** The `-` is optional. You can run `node build.js f` instead of `node build.js -f`.  

---

### Internal Features

- **Hash-based compilation**: Only recompiles `awa-util` if source files have changed  
- **File operations**: Uses `fast-glob` and `fs/promises` to manage files  
- **Environment handling**: Combines CLI flags into `env` object  
- **Eleventy integration**: Launches Eleventy with proper flags & environment  

---

### Example Usage

```bash
# Full build with cleared dist folder
node build.js --fullbuild --cleardist
# or without dashes
node build.js fullbuild cleardist

# Start dev server
node build.js --serve
# or
node build.js serve

# Production build (used in CI/CD)
node build.js --production
# or
node build.js production
