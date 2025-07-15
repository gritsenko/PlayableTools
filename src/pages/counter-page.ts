import { ComponentBase, customElement, html, route, state } from 'fw';

@customElement('counter-page')
@route('/counter')
export class CounterPage extends ComponentBase {
    @state() count = 0;
    render() {
        return html`
            <h1>Counter</h1>
            <p>Current count: ${this.count}</p>
            <button class="btn btn-success" @click=${() => this.count++}>Increment</button>
        `;
    }
}