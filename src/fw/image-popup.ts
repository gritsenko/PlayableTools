import { ComponentBase, customElement, html, property } from "fw";

@customElement("image-popup")
export class ImagePopup extends ComponentBase {
  @property({ type: Boolean }) open = false;
  @property({ type: String }) src = "";
  @property({ type: String }) alt = "";
  @property({ type: String }) thumbWidth = "500px";

  private openPopup = () => { this.open = true; this.requestUpdate(); };
  private closePopup = () => { this.open = false; this.requestUpdate(); };

  render() {
    return html`
      <img
        src="${this.src}"
        alt="${this.alt}"
        style="max-width: ${this.thumbWidth}; display: block; margin: 1em auto; border: 1px solid #ccc; border-radius: 8px; cursor: zoom-in;"
        @click=${this.openPopup}
      />
      ${this.open ? html`
        <div
          style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;"
          @click=${this.closePopup}
        >
          <img
            src="${this.src}"
            alt="${this.alt} full size"
            style="max-width:90vw;max-height:90vh;box-shadow:0 0 32px #000;border-radius:12px;"
            @click=${(e:any)=>e.stopPropagation()}
          />
          <button
            style="position:absolute;top:32px;right:48px;font-size:2rem;background:rgba(0,0,0,0.5);color:#fff;border:none;border-radius:50%;width:48px;height:48px;cursor:pointer;"
            @click=${this.closePopup}
            aria-label="Close preview"
          >×</button>
        </div>
      ` : ""}
    `;
  }
}
