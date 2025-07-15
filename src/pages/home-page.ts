import { ComponentBase, customElement, html, route } from 'fw';

@customElement('home-page')
@route('/')
export class HomePage extends ComponentBase {
    render() {
        return html`
            <h1>Hello, world!</h1>

            Welcome to your new app.
        `;
    }
}
