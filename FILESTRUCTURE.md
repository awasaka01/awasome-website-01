# Project File Structure

#### dist/ :

#### src/ : Main source code for your site/app

- index.html : Main site HTML (built from src/index.html or templates)
- (other built assets) : CSS, JS, images, color preview, etc.
- **.**
- - index.html : Main HTML template for the homepage
  - App.jsx : Main React app entry/component
  - main.jsx : JS entry point (often imports React, mounts App)
  - main.scss : Main SCSS stylesheet
  - STRUCTURE.txt : (Optional) Notes about project structure
  - template-pages/ : 11ty JS templates (e.g. color-preview.11ty.js)
  - \_modules/ : Shared modules, utilities, and includes (underscore = not directly built by 11ty)
    - styles/ : SCSS partials (e.g. \_base.scss, \_colors.scss)
    - util.js : JS utility functions
    - \_bundled.scss : Bundled SCSS partial
    - \_includes/ : HTML partials for 11ty (head, logo, noscript, etc.)
    - template-pages/ : (Legacy location for color-preview.11ty.js, now moved)
  - assets/ : Static assets (fonts, images, favicon, etc.)
    - fonts/ : Font files used by the site
    - images/ : Image files (backgrounds, icons, cursors, etc.)
    - data/ : Data files (e.g. kaomoji.json)
- package.json : Project metadata, dependencies, scripts
- .eleventy.js : Eleventy configuration (input/output dirs, plugins, passthroughs)
- print-dist-tree.js : Script to print a colorized tree of the \_\_dist output
- stylelint.config.mjs : Stylelint config for SCSS/CSS linting
- eslint.config.mjs : ESLint config for JS/TS linting
- pnpm-lock.yaml : Lockfile for pnpm package manager
- REWORK.txt : Project notes, goals, and rework plans
- FILESTRUCTURE.MD : (This file) Markdown doc for file structure (can be auto-generated)
- data.txt : (Optional) Project or Vite config notes
