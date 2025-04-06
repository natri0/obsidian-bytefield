import { Plugin } from 'obsidian';

const headings = ['', '0', '1', '2', '3', '4', '5', '6', '7'];

type TableState = {
  maxWidth: number;
  curOffset: number;
  curWidth: number;
  tbody: HTMLElement;
  curTr: HTMLElement | null;
};

const nextRow = (st: TableState) => {
  st.curWidth = 1;
  if (st.curTr != null) st.curOffset += (st.maxWidth - 1);
  st.curTr = st.tbody.createEl('tr');
  st.curTr.createEl('td', { text: st.curOffset.toString(16) });
};

export default class BytediagPlugin extends Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor('bytediag', (source, el, ctx) => {
      const lines = source.split('\n');
      const parts = source.split('\n').map(line => line.split(': '));

      const table = el.createEl('table');

      const headRow = table.createTHead().createEl('tr');
      headings.forEach(text => headRow.createEl('td', { text }));

      const tbody = table.createTBody();
      let st: TableState = { maxWidth: headings.length, curOffset: 0, curWidth: 1, tbody, curTr: null };
      for (let line of lines) {
        if (!line.contains(': ')) continue;
        const parts = line.split(': ');

        if (line.startsWith('!')) {
          st[parts[0].substring(1)] = parseInt(parts[1]);
        } else {
          let width = parseInt(parts[1]);
          while (width > 0) {
            if (st.curTr == null || st.curWidth >= st.maxWidth) nextRow(st);
            const w = Math.min(width, st.maxWidth - st.curWidth);
            width -= w;
            st.curTr?.createEl('td', { attr: { colspan: '' + w }, text: (parts[0] !== null ? parts[0] as string : '') + (width > 0 ? '...' : '') });
            st.curWidth += w;
          }
        }
      }
    });
  }
}