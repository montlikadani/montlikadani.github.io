# TabList Editor

This is an online editor for the [TabList Bukkit plugin](https://github.com/montlikadani/TabList). With this you can preview specific texts with colour, formatting components that will append in the game too. Its current status is not complete, a lot of changes are still needed, especially to the style, as the page has a disgusting ugly look.

Site is avilable at https://montlikadani.github.io/

### Features
- Preview any text with the default [Minecraft's formatting](https://minecraft.fandom.com/wiki/Formatting_codes) (colours/formatting)
  - Can also display hexadecimal colours
- Parses and appends the TabList's `tablist.yml` file using the upload file button (appends header or footer)
- Dark/Light mode
- Basic text formatting buttons (pick color, bold, italic ...)
- Change the background behind the displayed text (tablist)

## Requirements
- [NodeJs](https://github.com/nodejs/node)
- [Yarn](https://github.com/yarnpkg/berry)
  - `corepack enable` (In case if yarn is unrecognized command)
  - `npm install --force` (install dependencies) `--force` to reinstall all dependency including `react-scripts`
  - `yarn start` (for local testing)

### Deploy/Publish site to Github pages
- `npm install react-scripts --force` (only run this if `react-scripts` dependency is missing from `node_modules`)
- `npm run deploy` (push new changes to `gh-pages` branch (from `main`) and publish site)
