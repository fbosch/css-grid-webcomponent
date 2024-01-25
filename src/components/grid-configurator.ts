function Row({ row }: { row: number }) {
  return `
    <div class="row" data-row="${row}" style="grid-row: ${row + 1};">
     <input type="text" value="1fr" name="row-${row}"/>
    </div>
  `;
}
function Column({ col }: { col: number; rows: number }) {
  return `
    <div class="col" data-col="${col}">
      <input type="text" value="1fr" name="col-${col}"/>
    </div>
  `;
}

class GridConfigurator extends HTMLElement {
  constructor() {
    super();
  }

  static get observedAttributes() {
    return ["cols"];
  }

  getInputFraction(name: string) {
    const input: HTMLInputElement = this.shadowRoot?.querySelector(
      `input[name="${name}"]`,
    ) as unknown as HTMLInputElement;
    return input?.value ?? "1fr";
  }

  getTemplateColumns(cols: number) {
    return Array.from({ length: cols })
      .map((_, i) => this.getInputFraction(`col-${i}`))
      .join(" ");
  }

  getTemplateRows(rows: number) {
    return Array.from({ length: rows })
      .map((_, i) => this.getInputFraction(`row-${i}`))
      .join(" ");
  }

  renderStyles(
    { cols, rows }: { cols: number; rows: number } = {
      cols: Number(this.getAttribute("cols")),
      rows: Number(this.getAttribute("rows")),
    },
  ) {
    const css = `
        :host {
          display: grid;
          position: relative;
        }

       .grid, .overlay {
         display: grid;
         grid-template-columns: ${this.getTemplateColumns(cols)};
         grid-template-rows: ${this.getTemplateRows(rows)};
       }

      .grid {
         grid-gap: 1rem;
       }

      .overlay {
        position: absolute;
        height: 100%;
        width: 100%;
      }

      .overlay .col {
        display: flex;
        height: 100%;
        justify-content: center;
        align-items: baseline;
       }

       .overlay .row {
        display: flex;
        align-items: center;
      }

      .overlay .col button { 
        position: absolute;
        justify-self: center;
      }

      .overlay input {
        position: relative;
        width: 30px;
        height: 30px;
        font-size: 17px;
        text-align: center;
        border-radius: 100%;
        border: none;
        z-index: 99;
      }

      .overlay .col input {
        transform: translateY(10px);
      }
      .overlay .row input { 
        transform: translate(10px, -5px);
      }
   `;

    const style = this.shadowRoot?.querySelector("style");
    if (style) {
      style.innerHTML = css;
    }
    return css;
  }

  onInputChanged() {
    this.renderStyles();
  }

  attributeChangedCallback(attributeName: string) {
    switch (attributeName) {
      case "cols":
        this.renderStyles();
        break;
    }
  }

  connectedCallback() {
    const template = document.createElement("template");
    const cols = Number(this.getAttribute("cols"));
    const rows = Number(this.getAttribute("rows"));

    template.innerHTML = `
      <style>${this.renderStyles({ rows, cols })}</style>
      <div class="overlay cols">
        ${Array.from({ length: cols })
          .map((_, i) => Column({ col: i, rows }))
          .join("")}
      </div>
      <div class="overlay rows">
        ${Array.from({ length: rows })
          .map((_, i) => Row({ row: i }))
          .join("")}
      </div>
      <div class="grid">
        <slot></slot>
      </div>
    `;

    this.attachShadow({ mode: "open" }).appendChild(
      template.content.cloneNode(true),
    );

    this.renderStyles();

    this.shadowRoot
      ?.querySelectorAll("input")
      .forEach((input) =>
        input.addEventListener("blur", () => this.onInputChanged()),
      );
  }
}

customElements.define("grid-configurator", GridConfigurator);
