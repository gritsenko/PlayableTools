
import { ComponentBase, html } from '../../fw/component-base';

export class PlayablePublisher extends ComponentBase {

  dragActive = false;
  loadedFile: File | null = null;

  render() {
    return html`
      <div class="playable-publisher">
        <div style="margin-bottom:1.5rem">
          <strong>Publish Playable Ad</strong><br />
          <small>
            Use this tool to upload your playable ad HTML file and prepare it for different platforms.<br />
            Drop your .html file below or select it manually.
          </small>
        </div>
        ${!this.loadedFile ? html`
          <div
            class="dropzone ${this.dragActive ? 'dragover' : ''}"
            @dragover=${this._onDragOver}
            @dragleave=${this._onDragLeave}
            @drop=${this._onDrop}
          >
            <p>Drop your .html file here or</p>
            <label>
              Select file
              <input type="file" accept=".html" @change=${this._onFileChange} />
            </label>
          </div>
        ` : html`
          <div style="margin-top:1rem;color:#0078d4">
            <strong>File loaded:</strong> ${this.loadedFile.name} (${(this.loadedFile.size/1024).toFixed(2)} KB)
            <button @click=${this._resetFile}>Cancel</button>
          </div>
        `}
      </div>
    `;
  }

  _onDragOver(e: DragEvent) {
    e.preventDefault();
    this.dragActive = true;
    this.requestUpdate();
  }

  _onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.dragActive = false;
    this.requestUpdate();
  }

  _onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragActive = false;
    this.requestUpdate();
    const files = e.dataTransfer?.files;
    if (files && files.length) {
      this._processFile(files[0]);
    }
  }

  _onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this._processFile(file);
    }
  }

  _processFile(file: File) {
    if (file && file.name.endsWith('.html')) {
      this.loadedFile = file;
      this.requestUpdate();
      const event = new CustomEvent('file-selected', { detail: file });
      this.dispatchEvent(event);
    } else {
      alert('Please select a valid .html file.');
    }
  }

  _resetFile() {
    this.loadedFile = null;
    this.requestUpdate();
  }
}

customElements.define('playable-publisher', PlayablePublisher);
