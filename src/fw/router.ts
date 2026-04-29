import { LitElement, html } from 'lit';
import type { TemplateResult } from 'lit-html';
import { customElement, property, state } from 'lit/decorators.js';
import { metadataService, type PageMetadata } from '../services/MetadataService';
import { getSeoRouteEntry } from "../seo/route-manifest";

const NAVIGATION_EVENT = "playabletools:navigation";

interface NavigationDetail {
    oldUrl: string;
    newUrl: string;
}

function dispatchNavigationEvent(detail: NavigationDetail) {
    window.dispatchEvent(new CustomEvent<NavigationDetail>(NAVIGATION_EVENT, { detail }));
}

export function getNavigationEventName() {
    return NAVIGATION_EVENT;
}

export function getCurrentPath() {
    return window.location.pathname || "/";
}

export function getCurrentSearch() {
    return window.location.search || "";
}

export function navigate(path: string, options: { replace?: boolean } = {}) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const oldUrl = window.location.href;
    const method = options.replace ? "replaceState" : "pushState";
    window.history[method]({}, "", normalizedPath);
    dispatchNavigationEvent({ oldUrl, newUrl: window.location.href });
}

export function shouldHandleClientNavigation(anchor: HTMLAnchorElement, event: MouseEvent): boolean {
    const href = anchor.getAttribute("href");
    if (!href || href === "#" || anchor.hasAttribute("download")) {
        return false;
    }

    if (anchor.target && anchor.target !== "_self") {
        return false;
    }

    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return false;
    }

    const destination = new URL(anchor.href, window.location.origin);
    if (destination.origin !== window.location.origin) {
        return false;
    }

    const current = new URL(window.location.href);
    const isHashOnlyNavigation =
        destination.pathname === current.pathname &&
        destination.search === current.search &&
        destination.hash.length > 0;

    return !isHashOnlyNavigation;
}

@customElement('router-outlet')
export class RouterOutlet extends LitElement {

    @property({ attribute: false }) defaultLayout?: typeof LitElement;

    @state() private currentPath = '';

    private handleNavigation = () => {
        const normalizedPath = getCurrentPath();
        console.log(`🔀 Router: navigation event, path='${normalizedPath}'`);
        this.currentPath = normalizedPath;
        this.requestUpdate();
    };


    connectedCallback() {
        super.connectedCallback();
        console.log(`🔀 Router: connectedCallback, current path='${getCurrentPath()}'`);
        window.addEventListener('popstate', this.handleNavigation);
        window.addEventListener(NAVIGATION_EVENT, this.handleNavigation as EventListener);
        this.handleNavigation();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('popstate', this.handleNavigation);
        window.removeEventListener(NAVIGATION_EVENT, this.handleNavigation as EventListener);
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
                const seoRoute = getSeoRouteEntry(path);
                if (routeInfo.metadata) {
                    metadataService.update({
                        ...routeInfo.metadata,
                        canonicalPath: routeInfo.metadata.canonicalPath ?? seoRoute?.canonicalPath,
                        robots: routeInfo.metadata.robots ?? seoRoute?.robots,
                    }, {
                        currentPath: this.currentPath,
                    });
                } else {
                    metadataService.update({ title: "PlayableTools" }, {
                        currentPath: this.currentPath,
                    });
                }

                // Normalize params (strip leading slashes if any and remove empty placeholders)
                const normalizedParams = params.map(p => p ? p.replace(/^\//, '') : '').filter(p => p !== '');
                const instance = new routeInfo.component() as any;
                instance.routeParams = normalizedParams;
                return this.renderContentWithLayout(() => html`<div>${instance}</div>`, routeInfo?.metadata?.noLayout);
            }
        }

        console.log(`❌ Router: no route matched for path='${this.currentPath}'`);
        metadataService.update({ title: "Page Not Found", robots: "noindex,follow" }, {
            currentPath: this.currentPath,
        });
        return this.renderContentWithLayout(() => html`<h1>404 Not Found</h1>`);
    }

    renderContentWithLayout(content: () => TemplateResult, skipLayout: boolean = false) {
        if (skipLayout || !this.defaultLayout)
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
