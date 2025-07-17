# <img src="./media/small-logo.jpg" width="28" style="border-radius:16px;"/> PlayableTools 

Welcome to Playable Ads Tools!

This project is a modern web application built with Vite, TypeScript, and Lit components. It provides tools for publishing HTML5 playable ads across multiple platforms.

**Live Version & PWA:**
PlayableTools is available online at [https://gritsenko.biz/PlayableTools/](https://gritsenko.biz/PlayableTools/).

Join our Telegram group for updates and discussion:
 [![Telegram](https://img.shields.io/badge/-telegram-red?color=white&logo=telegram&logoColor=blue)](https://t.me/playable_html5)

You can install it as a Progressive Web App (PWA) for offline access and a native-like experience. Open the site in your browser and use the "Install App" option.

<a href="https://gritsenko.biz/PlayableTools/"><img src="./media/pwa.png" width="200" alt="PWA Badge"/></a>


# Build and run locally

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```

## Features
- Vite for fast development
- TypeScript for type safety
- Playable Ad Publishing Tool with support for multiple platforms
- Drag & drop HTML file upload
- Progress tracking during publishing
- Platform-specific CTA script injection
- ZIP packaging for platforms that require it

## Playable Publisher

The Playable Publisher tool allows you to:

1. **Upload HTML Files**: Drag and drop or select HTML playable ad files
2. **Configure Metadata**: Set playable title, app store URLs, and custom suffix
3. **Multi-Platform Publishing**: Automatically process your playable for all supported platforms
4. **Progress Tracking**: Visual progress bar shows publishing status
5. **File Downloads**: Automatically downloads processed files for each platform

### Supported Platforms

- Facebook (single HTML file)
- Moloco (single HTML file)  
- Facebook_Zip (ZIP package)
- Mintegral (ZIP package)
- IronSource (single HTML file)
- AdColony (single HTML file)
- Unity (single HTML file)
- Applovin (single HTML file)
- Vungle (ZIP package with extra files)
- TikTok (ZIP package with config)
- Google (ZIP package with multiple sizes)

### File Naming Convention

Output files follow the pattern: `{PlayableTitle}_{Platform}_{Suffix}.html`

Example: `GoH_PBCustomHero3D_Facebook_EN.html`

### Testing

A test playable file is available at `/public/test-playable.html` for testing the publishing workflow.
- Lit for web components
- Modern UI kit (to be added)
- Default layout
- Home page with a welcome message

## Project Structure
- `src/` - Main source code
- `index.html` - Main HTML file

## License
MIT
