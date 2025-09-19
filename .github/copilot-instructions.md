<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# PlayableTools Project Architecture Guide

## Tech Stack
- **Build Tool**: Vite 7.x with TypeScript 5.8
- **Frontend Framework**: Lit 3.x web components
- **CSS Framework**: Pico CSS 2.x for styling
- **PWA**: Vite PWA plugin for service worker and offline support
- **Dependencies**: JSZip for archive handling, Pako for compression, Marked for markdown parsing

## Project Structure

### Core Framework (`src/fw/`)
This project uses a custom lightweight framework built on Lit:
- **ComponentBase**: Light DOM Lit components (no shadow DOM by default)
- **LayoutComponentBase**: Base class for layout components  
- **Dependency Injection**: Custom DI container with `@injectable` and `@inject` decorators
- **Router**: Hash-based routing with `@route` decorator and metadata support
- **Service Lifetimes**: Singleton (default), Scoped, Transient

### Import Pattern
Always import from the `fw` alias:
```typescript
import { ComponentBase, customElement, html, route, inject, injectable, ServiceLifetime } from "fw";
```

### Component Conventions

#### Pages (`src/pages/`)
- Location: `src/pages/` folder
- Naming: kebab-case files (e.g., `home-page.ts`)
- Structure:
```typescript
import { ComponentBase, customElement, html, route } from "fw";

@customElement("page-name")
@route("/path", {
  title: "Page Title for SEO",
  description: "Page description for SEO"
})
export class PageName extends ComponentBase {
  render() {
    return html`<div>Content</div>`;
  }
}
```

#### Reusable Components
- Co-located CSS files: `component-name.ts.css`
- Light DOM by default (no shadow DOM)
- Use `@property` for public component APIs (data passed from parent) and `@state` for internal component state (data managed by the component itself).

#### Layout Components (`src/Layout/`)
- Use `LayoutComponentBase` for layouts
- Main layout: `main-layout.ts` with sidebar, navigation
- Components: `nav-menu.ts`, `site-logo.ts`

### Services (`src/services/`)
Use dependency injection for all services:

```typescript
import { injectable, ServiceLifetime, inject } from "fw";

@injectable(ServiceLifetime.Singleton) // or omit for default Singleton
export class MyService {
  constructor() {}
  
  async doSomething(): Promise<void> {
    // Service logic
  }
}

// In components/other services:
export class MyComponent extends ComponentBase {
  @inject()
  private myService!: MyService;
}
```

**Available Services:**
- `PlayablePublishService` - Publishing to ad networks
- `ImbaPackerService` - HTML compression with Pako
- `Base64ConverterService` - File to base64 conversion
- `PreviewService` - Playable preview functionality
- `PortfolioService` - GitHub portfolio integration
- `VersionService` - App version checking
- `MetadataService` - SEO metadata management

### Routing & Navigation
- **Hash-based routing** for static hosting compatibility
- Routes defined with `@route("/path", { title, description })`
- Automatic page loading via `import.meta.glob("./pages/**/*.ts", { eager: true })`
- Navigation handled by `nav-menu.ts`

### File Organization
```
src/
├── fw/                    # Custom framework
├── Layout/               # Layout components  
├── pages/               # Page components
│   ├── publish/         # Publish-related pages
│   ├── preview/         # Preview-related pages
│   └── portfolio/       # Portfolio-related pages
├── services/            # Business logic services
├── utils/               # Utility functions (framework-agnostic helpers)
└── assets/              # Static assets
```

### Styling Guidelines
- Use Pico CSS utility classes and CSS custom properties
- Component-specific styles in co-located `.ts.css` files
- Global styles in `app-root.css`
- CSS custom properties pattern: `var(--pico-*)`

### Build & Development
- **Dev server**: `npm run dev` (Vite task available)
- **Build**: `npm run build` (TypeScript compilation + Vite build)
- **Base path**: `/` for dev, `/PlayableTools/` for production
- **PWA**: Auto-update service worker with version checking. The `VersionService` fetches `/version.json` to detect new builds and prompt the user to update.

## README / Landing page guidelines
This repository doubles as a small landing page for users who come to the project looking for tools to run locally. To keep the README helpful and welcoming to non-developers, follow these guidelines when editing `README.md`:

- Place a small project logo and primary hero visuals (screenshots / PWA badge) immediately under the main H1/title. This creates a visual landing section so users can quickly see the app and install it.
- Prefer 1–2 centered screenshots (max width ~600px) and a compact PWA badge (around 200px) beneath them. Keep the visuals near the top — before long introductory text or lists.
- Keep image files inside `media/` or `public/` and reference them with relative paths (e.g., `media/app-screenshots/previewer.jpg`).
- If the README grows long, move additional screenshots to a dedicated "Screenshots" section later in the file, but keep the hero visuals at the top.
- Use descriptive alt text for accessibility and SEO.

Example recommended header layout (Markdown):

```markdown
# <img src="./media/small-logo.jpg" width="28" style="border-radius:16px;"/> PlayableTools

<p align="center">
  <img src="media/app-screenshots/previewer.jpg" alt="Playable Previewer Screenshot" width="600"/>
</p>

<p align="center">
  <img src="media/app-screenshots/base64.png" alt="Base64 Converter Screenshot" width="600"/>
</p>

<p align="center">
  <a href="https://gritsenko.biz/PlayableTools/"><img src="./media/pwa.png" width="200" alt="PWA Badge"/></a>
</p>

PlayableTools is a web-based toolkit for preparing and publishing HTML5 playables... (continue intro)
```

Rationale:
- Many users land on the README first; presenting visuals up-front quickly communicates what the app does and reduces friction for new users who want to try the tools.
- Keeping a consistent, compact hero layout makes the repo friendly to both developers (who need the run instructions) and non-developers (who need quick visuals / install badge).

### Best Practices
1. Always use TypeScript with strict mode
2. Prefer dependency injection over direct instantiation
3. Use `@property` for public component APIs, `@state` for internal state
4. Implement proper error handling in services and display user-facing errors in the UI.
5. Use semantic HTML and accessible patterns
6. Leverage Pico CSS instead of custom CSS when possible
7. Keep components focused and single-responsibility
8. Use async/await for asynchronous operations

### Common Patterns
```typescript
// Service injection in components
@inject()
private publishService!: PlayablePublishService;

// File handling and error handling pattern
@state()
private errorMessage = '';

async handleFileSelect(files: FileList) {
  const file = files[0];
  if (file) {
    this.errorMessage = ''; // Clear previous errors
    try {
      const result = await this.someService.processFile(file);
      // Handle result
    } catch (error) {
      console.error('Processing failed:', error);
      this.errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    }
  }
}

// Progress reporting pattern
onProgress: (progress: number, platform?: string) => {
  this.progress = progress;
  this.currentPlatform = platform;
}
```