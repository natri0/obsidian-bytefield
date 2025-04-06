import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface SettingsData {
  bytesPerRow: number;
  offsetsInHex: boolean;
};

const DEFAULT_SETTINGS: Partial<SettingsData> = {
  bytesPerRow: 8,
  offsetsInHex: true
};

type TableState = {
  maxWidth: number;
  curOffset: number;
  curWidth: number;
  tbody: HTMLElement;
  curTr: HTMLElement | null;
  offsetsHex: boolean;
};

const nextRow = (st: TableState) => {
  st.curWidth = 1;
  if (st.curTr != null) st.curOffset += (st.maxWidth - 1);
  st.curTr = st.tbody.createEl('tr');
  st.curTr.createEl('td', { text: st.curOffset.toString(st.offsetsHex ? 16 : 10) });
};

export default class BytefieldPlugin extends Plugin {
  settings: SettingsData;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new BytefieldSettingTab(this.app, this));

    this.registerMarkdownCodeBlockProcessor('bytefield', (source, el, ctx) => {
      const lines = source.split('\n');

      const table = el.createEl('table');

      const headRow = table.createTHead().createEl('tr');
      headRow.createEl('td'); // empty td for the large offset
      for (let i = 0; i < this.settings.bytesPerRow; i++) {
        headRow.createEl('td', { text: i.toString(this.settings.offsetsInHex ? 16 : 10) });
      }

      const tbody = table.createTBody();
      let st: TableState = { maxWidth: this.settings.bytesPerRow + 1, curOffset: 0, curWidth: 1, tbody, curTr: null, offsetsHex: this.settings.offsetsInHex };
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

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class BytefieldSettingTab extends PluginSettingTab {
  plugin: BytefieldPlugin;

  constructor(app: App, plugin: BytefieldPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    let { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Bytes per table row")
      .setDesc("How many bytes each row of the table will contain.")
      .addText(text => {
        text.inputEl.type = 'number';
        text
          .setValue('' + this.plugin.settings.bytesPerRow)
          .onChange(async val => {
            this.plugin.settings.bytesPerRow = parseInt(val);
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Hex offsets")
      .setDesc("If set, the offsets to the left will be in hex; decimal otherwise.")
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.offsetsInHex)
          .onChange(async val => {
            this.plugin.settings.offsetsInHex = val;
            await this.plugin.saveSettings();
          }));
  }
}