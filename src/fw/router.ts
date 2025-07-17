import { LitElement, html } from 'lit';
import type { TemplateResult } from 'lit-html';
import { customElement, property, state } from 'lit/decorators.js';
import { metadataService, type PageMetadata } from '../services/MetadataService';

@customElement('router-outlet')
export class RouterOutlet extends LitElement {

    @property({ attribute: false }) defaultLayout?: typeof LitElement;

    @state() private currentPath = '';

    private handleNavigation = () => {
        // Use hash-based routing for static hosting
        const hash = window.location.hash;
        // Remove leading '#' and ensure leading '/'
        let path = hash ? hash.substring(1) : '';
        if (!path.startsWith('/')) path = '/' + path;
        this.currentPath = path;
        this.requestUpdate();
    };


    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('hashchange', this.handleNavigation);
        this.handleNavigation();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('hashchange', this.handleNavigation);
    }

    createRenderRoot() {
        return this;
    }
    render() {
        // Find matching route
        for (const [path, routeInfo] of routeRegistry.entries()) {
            const pattern = new RegExp('^' + path.replace(/:[^\s/]+/g, '([\\w-]+)') + '$');
            const match = this.currentPath.match(pattern);

            if (match) {
                if (routeInfo.metadata) {
                    metadataService.update(routeInfo.metadata);
                } else {
                    metadataService.update({ title: "PlayableTools" });
                }

                const params = match.slice(1);
                const instance = new routeInfo.component() as any;
                instance.routeParams = params;
                return this.renderContentWithLayout(() => html`<div>${instance}</div>`);
            }
        }

        metadataService.update({ title: "Page Not Found" });
        return this.renderContentWithLayout(() => html`<h1>404 Not Found</h1>`);
    }

    renderContentWithLayout(content: () => TemplateResult) {
        if (!this.defaultLayout)
            return content();

        const layout = new this.defaultLayout() as any;
        layout.body = content();
        return html`
            <div>${layout}</div>
        `;
    }
}

export const routeRegistry = new Map<string, { component: typeof LitElement, metadata?: PageMetadata }>();
export function route(path: string, metadata?: PageMetadata) {
    return function <T extends typeof LitElement>(constructor: T) {
        routeRegistry.set(path, { component: constructor, metadata });
        return constructor;
    };
}