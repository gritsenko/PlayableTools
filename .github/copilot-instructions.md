<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This project uses Vite, TypeScript, and Lit for building modern web applications. Use best practices for Lit components and maintain a clean, modular structure.

styles for individual components are locaded in separate CSS files near the compoent files with name covention: `coponent-name.ts.css`. 

pages are located on src/pages folder and named with kebab-case, e.g. `home-page.ts`. 
default page structure: 
```typescript
import { ComponentBase, customElement, html, route as route } from "fw";

@customElement("name-page")
@route("/name")
export class HomePage extends ComponentBase {
  render() {
    return html` <div></div> `;
  }
}
```