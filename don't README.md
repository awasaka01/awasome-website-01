# commands



`build` - Quickly build the project with minimal build steps for a working build, skipping minimization, full rollup, etc.

`start` - Live development server, integrates Vite's dev server into Eleventy's

`buildfull` - Full build for production, including everything

`startfull` - Runs `buildfull` when changes in src folder, also hosts the site for easy preview

<br>

The build process runs as follows:  
`src` --- 11ty --> `temp` --- Vite --> `production/dev`


---
### folder structure

`/src/` - Contains all source files, including HTML, CSS, JS, and assets  

`/____temp/` - Used as an intermediary folder, for Vite to be able to run on 11ty's output  

`/__dev/` - Final output folder when using `build` or `start`

` /__production/` - Final output folder when using `buildfull` or `startfull`

---