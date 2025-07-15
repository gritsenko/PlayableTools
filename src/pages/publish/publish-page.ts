import { ComponentBase, customElement, html, route as route } from "fw";

@customElement("publish-page")
@route("/publish")
export class HomePage extends ComponentBase {
  render() {
    return html` <playable-publisher></playable-publisher> `;
  }
}
