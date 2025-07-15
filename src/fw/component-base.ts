import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Inject } from './di';
import { route } from './router';

export {
    html,
    css,
    customElement,
    property,
    state,
    Inject,
    route
};

export class ComponentBase extends LitElement {
    protected static useShadowDom = false;
    // Override createRenderRoot to respect the `useShadowDom` setting
    createRenderRoot() {
        if ((this.constructor as typeof ComponentBase).useShadowDom) {
            return super.createRenderRoot(); // Shadow DOM
        } else {
            return this; // Light DOM
        }
    }
}