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

export default class BytefieldPlugin extends Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor('bytefield', (source, el, ctx) => {
      const lines = source.split('\n');

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

            let colspan: number, rowspan: number | null = null;
            if (st.curWidth === 1 && width >= st.maxWidth) {
              colspan = st.maxWidth - 1;
              rowspan = Math.floor(width / colspan);
              width -= rowspan * colspan;
            } else {
              colspan = Math.min(width, st.maxWidth - st.curWidth);
              width -= colspan;
            }

            st.curTr?.createEl('td', {
              attr: { colspan, rowspan },
              text: (parts[0] !== null ? parts[0] as string : '') + (width > 0 ? '...' : '')
            });
            st.curWidth += colspan;

            while (rowspan !== null && rowspan > 0) {
              nextRow(st);
              rowspan--;
            }
          }
        }
      }
    });
  }
}