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
        console.log(`🔀 Router: hashchange event, hash='${hash}'`);
        // Remove leading '#' and ensure leading '/'
        let path = hash ? hash.substring(1) : '';
        // Separate path and query string
        const [routePath] = path.split('?');
        let normalizedPath = routePath;
        if (!normalizedPath.startsWith('/')) normalizedPath = '/' + normalizedPath;
        console.log(`🔀 Router: normalized path='${normalizedPath}'`);
        this.currentPath = normalizedPath;
        this.requestUpdate();
    };


    connectedCallback() {
        super.connectedCallback();
        console.log(`🔀 Router: connectedCallback, current hash='${window.location.hash}'`);
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
        console.log(`🔀 Router: rendering, currentPath='${this.currentPath}', registered routes=${routeRegistry.size}`);
        console.log(`🔀 Router: registered route paths: ${Array.from(routeRegistry.keys()).join(', ')}`);
        
        // Find matching route
            for (const [path, routeInfo] of routeRegistry.entries()) {
                const routeParts = path.split('/').filter(Boolean); // e.g. ['preview', ':playableId?']
                const currentParts = this.currentPath.split('/').filter(Boolean); // e.g. ['preview', '123']

                console.log(`🔀 Router: checking path='${path}' -> routeParts=${JSON.stringify(routeParts)} currentParts=${JSON.stringify(currentParts)}`);

                const params: string[] = [];
                let rpIdx = 0; // index for routeParts
                let cpIdx = 0; // index for currentParts
                let matched = true;

                while (rpIdx < routeParts.length) {
                    const rp = routeParts[rpIdx];

                    // parameter segment
                    if (rp.startsWith(':')) {
                        const isOptional = rp.endsWith('?');
                        // paramName available if needed: rp.replace(/^:|\?$/g, '')

                        if (cpIdx < currentParts.length) {
                            // consume current part as parameter value
                            params.push(currentParts[cpIdx]);
                            cpIdx++;
                        } else if (isOptional) {
                            // optional param not provided -> push empty string placeholder
                            params.push('');
                        } else {
                            // required param missing -> no match
                            matched = false;
                            break;
                        }
                    } else {
                        // static segment - must equal current segment
                        if (cpIdx >= currentParts.length || currentParts[cpIdx] !== rp) {
                            matched = false;
                            break;
                        }
                        cpIdx++;
                    }

                    rpIdx++;
                }

                // If there are remaining current parts that weren't matched, this route doesn't match
                if (matched && cpIdx < currentParts.length) matched = false;

                console.log(`🔀 Router: checking path='${path}' -> matched=${matched} params=${JSON.stringify(params)}`);

                if (matched) {
                    console.log(`✅ Router: matched path='${path}', params=${JSON.stringify(params)}`);
                if (routeInfo.metadata) {
                    metadataService.update(routeInfo.metadata);
                } else {
                    metadataService.update({ title: "PlayableTools" });
                }

                // Normalize params (strip leading slashes if any and remove empty placeholders)
                const normalizedParams = params.map(p => p ? p.replace(/^\//, '') : '').filter(p => p !== '');
                const instance = new routeInfo.component() as any;
                instance.routeParams = normalizedParams;
                return this.renderContentWithLayout(() => html`<div>${instance}</div>`);
            }
        }

        console.log(`❌ Router: no route matched for path='${this.currentPath}'`);
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