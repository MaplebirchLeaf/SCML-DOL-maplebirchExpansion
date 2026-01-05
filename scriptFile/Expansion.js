(async () => {
  // 模块提示系统 - 用于显示和搜索模块提示信息
  class modhint {
    /** @param {{ (message: string, level?: string, ...objects: any[]): void; (msg: string, level?: string, ...objs: any[]): void; }} logger */
    constructor(logger) {
      this.log = logger;
    }

    /** @param {any} newElement @param {{ parentNode: { insertBefore: (arg0: any, arg1: any) => void; }; }} targetElement */
    #insertBefore(newElement, targetElement) {
      if (targetElement && targetElement.parentNode) {
        targetElement.parentNode.insertBefore(newElement, targetElement);
      }
    }

    hintClicked() {
      if ($?.wiki) {
        $.wiki('<<maplebirchReplace "maplebirchModHint" "title">>');
        maplebirch.trigger('characterRender');
      } else {
        const overlay = document.getElementById("maplebirchModHint");
        if (overlay) overlay.style.display = "block";
      }
    }

    searchButtonClicked() {
      this.clearButtonClicked();

      const value = T.maplebirchModHintTextbox;
      if (!value || value.trim() === "") return;

      const keyword = value.trim();
      /** @type {any} */
      const contentEl = document.getElementById("maplebirchModHintContent");
      if (!contentEl) return;

      const regex = new RegExp(keyword, 'gi');
      const originalHtml = contentEl.innerHTML;

      const highlightedHtml = originalHtml.replace(
        regex,
        (/**@type {any}*/match) => `<span class="gold searchResult">${match}</span>`
      );

      contentEl.innerHTML = highlightedHtml;

      const results = contentEl.getElementsByClassName('searchResult');
      if (results.length > 0) {
        results[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const noResultEl = document.createElement('div');
        noResultEl.style.color = "gold";
        noResultEl.style.marginTop = "10px";
        noResultEl.id = "noSearchResult";
        noResultEl.textContent = "无结果";
        this.#insertBefore(noResultEl, contentEl);
      }
    }

    clearButtonClicked() {
      const noResultEl = document.getElementById("noSearchResult");
      if (noResultEl) noResultEl.remove();

      const contentEl = document.getElementById("maplebirchModHintContent");
      if (contentEl) {
        const results = contentEl.querySelectorAll('.searchResult');
        results.forEach(el => {
          /** @type {any} */const parent = el.parentNode;
          while (el.firstChild) parent.insertBefore(el.firstChild, el);
          parent.removeChild(el);
        });
      }
    }
  }

  class cheat {
    constructor() {
      /** @type {any[]} */ this.cache = [];
      /** @type {number} */ this.sortOrder = 0;
      maplebirch.once(':IndexedDB', async() => await this.initDB());
    }

    escapeCode(code) {
      return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\$/g, '&#36;').replace(/\\\$/g, '&#36;');
    }

    async initDB() {
      maplebirch.idb.register('cheats', { keyPath: 'name' });
      await this.refreshCache();
    }

    async refreshCache() {
      this.cache = await maplebirch.idb.withTransaction(['cheats'], 'readonly', async (tx) => {
        const store = tx.objectStore('cheats');
        return await store.getAll();
      });
    }

    updateContainer(containerId, content) {
      if (!containerId) return;
      new maplebirch.SugarCube.Wikifier(null, `<<replace "#${containerId}">>${content}<</replace>>`);
    }

    get panel() {
      T.maplebirchModCheatNamebox ??= '';
      T.maplebirchModCheatCodebox ??= '';
      let html = `<div class='input-row'>`;
      html += `<span class='gold'><<lanSwitch 'NAME' '命名'>></span><<textbox '_maplebirchModCheatNamebox' _maplebirchModCheatNamebox>>`;
      html += `<span class='gold'><<lanSwitch 'CODE' '编码'>></span><<textbox '_maplebirchModCheatCodebox' _maplebirchModCheatCodebox>>`;
      const isExisting = this.cache.find(item => item.name === T.maplebirchModCheatNamebox);
      if (isExisting) { html += `<<lanButton 'modify' 'capitalize'>><<run maplebirch.Expansion.cheat.modifyForm()>><</lanButton>>`; }
      else { html += `<<lanButton 'create' 'capitalize'>><<run maplebirch.Expansion.cheat.createForm()>><</lanButton>>`; }
      html += `</div>`;
      return html;
    }

    get search() {
      T.maplebirchCheatSearch ??= '';
      let html = `<div class='input-row'><<textbox '_maplebirchCheatSearch' _maplebirchCheatSearch>>`;
      html += `<<lanButton 'search' 'capitalize'>><<run maplebirch.Expansion.cheat.searchForm()>><</lanButton>>`;
      html += `<<lanButton 'sort' 'capitalize'>><<run maplebirch.Expansion.cheat.sortForm()>><</lanButton>>`;
      html += `<<lanButton 'clear' 'capitalize' 'class:red'>><<run maplebirch.Expansion.cheat.clearForm()>><</lanButton>>`;
      html += `</div>`;
      return html;
    }

    get content() {
      if (this.cache.length === 0) return '';
      return this.cache.map(item => {
        const itemId = `cheat-item-${this.stringDJB2Hash(item.name)}`;
        const rawCode = item.code.length > 50 ? item.code.substring(0, 50) + '...' : item.code;
        const escapedCode = this.escapeCode(rawCode);
        return `
        <div id='${itemId}' class='settingsToggleItem'>
          <<lanLink '${item.name}' 'class:strawberry'>><<run maplebirch.Expansion.cheat.updateForm('${item.name}')>><</lanLink>><br>
          <span class='cheat-code' data-type="${item.type === 'javascript' ? 'JS' : 'Twine'}">${escapedCode}</span>
          <<lanLink 'execute' 'capitalize' 'class:teal'>><<run maplebirch.Expansion.cheat.executeForm('${item.name}')>><</lanLink>>|
          <<lanLink 'delete' 'capitalize' 'class:red'>><<run maplebirch.Expansion.cheat.deleteForm('${item.name}')>><</lanLink>>
        </div>`;
      }).join('');
    }

    updateForm(name) {
      if (T.maplebirchModCheatNamebox === name) {
        T.maplebirchModCheatNamebox = '';
        T.maplebirchModCheatCodebox = '';
      } else {
        const item = this.cache.find(c => c.name === name);
        if (!item) return;
        T.maplebirchModCheatNamebox = item.name;
        T.maplebirchModCheatCodebox = item.code;
      }
      this.updateContainer('maplebirch-cheat-panel', this.panel);
    }

    async createForm() {
      const name = T.maplebirchModCheatNamebox?.trim();
      const code = T.maplebirchModCheatCodebox?.trim();
      if (!name || !code) return false;
      if (this.cache.find(c => c.name === name)) return false;
      const type = code.startsWith('<<') ? 'twine' : 'javascript';
      await maplebirch.idb.withTransaction(['cheats'], 'readwrite', async (tx) => {
        const store = tx.objectStore('cheats');
        await store.put({ name: name, code: code, type: type, });
      });
      await this.refreshCache();
      T.maplebirchModCheatNamebox = T.maplebirchModCheatCodebox = '';
      this.updateContainer('maplebirch-cheat-panel', this.panel);
      this.updateDisplay();
      return true;
    }

    async modifyForm() {
      const newName = T.maplebirchModCheatNamebox?.trim();
      const newCode = T.maplebirchModCheatCodebox?.trim();
      if (!newName || !newCode) return false;
      const oldItem = this.cache.find(item => item.name === T.maplebirchModCheatNamebox);
      if (!oldItem) return false;
      const oldName = oldItem.name;
      if (oldName !== newName) if (this.cache.find(item => item.name === newName)) return false;
      const type = newCode.startsWith('<<') ? 'twine' : 'javascript';
      await maplebirch.idb.withTransaction(['cheats'], 'readwrite', async (tx) => {
        const store = tx.objectStore('cheats');
        await store.delete(oldName);
        await store.put({ name: newName, code: newCode, type: type, });
      });
      await this.refreshCache();
      T.maplebirchModCheatNamebox = T.maplebirchModCheatCodebox = '';
      this.updateContainer('maplebirch-cheat-panel', this.panel);
      this.updateDisplay();
      return true;
    }

    searchForm() {
      const term = T.maplebirchCheatSearch?.trim().toLowerCase();
      if (!term) { this.updateDisplay(); return; }
      let results = this.cache.filter(item => item.name.toLowerCase().includes(term) || item.code.toLowerCase().includes(term));
      if (results.length === 0) { this.updateContainer('maplebirch-cheat-content', ''); return; }
      if (this.sortOrder === 1) {
        results.sort((a, b) => a.name.localeCompare(b.name));
      } else if (this.sortOrder === 2) {
        results.sort((a, b) => b.name.localeCompare(a.name));
      } else if (this.sortOrder === 3) {
        results.sort((a, b) => a.type.localeCompare(b.type));
      } else if (this.sortOrder === 4) {
        results.sort((a, b) => b.type.localeCompare(a.type));
      }
      const html = results.map(item => {
        const itemId = `cheat-item-${this.stringDJB2Hash(item.name)}`;
        const rawCode = item.code.length > 50 ? item.code.substring(0, 50) + '...' : item.code;
        const escapedCode = this.escapeCode(rawCode);
        return `<div id='${itemId}' class='settingsToggleItem'>
          <<lanLink '${item.name}' 'class:strawberry'>><<run maplebirch.Expansion.cheat.updateForm('${item.name}')>><</lanLink>><br>
          <span class='cheat-code' data-type="${item.type === 'javascript' ? 'JS' : 'Twine'}">${escapedCode}</span>
          <<lanLink 'execute' 'capitalize' 'class:teal'>><<run maplebirch.Expansion.cheat.executeForm('${item.name}')>><</lanLink>>|
          <<lanLink 'delete' 'capitalize' 'class:red'>><<run maplebirch.Expansion.cheat.deleteForm('${item.name}')>><</lanLink>>
        </div>`;
      }).join('');
      this.updateContainer('maplebirch-cheat-content', html);
    }

    async executeForm(name) {
      const item = this.cache.find(c => c.name === name);
      if (!item) return false;
      if (item.type === 'javascript') { T.maplebirchJSCheatConsole = item.code; }
      else { T.maplebirchTwineCheatConsole = item.code; }
      const result = maplebirch.tool.console.execute(item.type);
      const isSuccess = result?.success ?? false;
      const statusClass = isSuccess ? 'success' : 'error';
      const statusText = isSuccess ? '<<lanSwitch "Execution successful" "执行成功">>' : '<<lanSwitch "Execution failed" "执行失败">>';
      this.updateContainer('maplebirch-cheat-status', `<div class="cheat-status ${statusClass} visible">${statusText}</div>`);
      if (isSuccess) {
        try {
          await maplebirch.idb.withTransaction(['cheats'], 'readwrite', async (tx) => {
            const store = tx.objectStore('cheats');
            await store.put(item);
          });
        } catch (err) {}
      }
      setTimeout(() => this.updateContainer('maplebirch-cheat-status', ''), 3000);
      return isSuccess;
    }

    deleteForm(name) {
      const item = this.cache.find(c => c.name === name);
      if (!item) return;
      const itemId = `cheat-item-${this.stringDJB2Hash(item.name)}`;
      const rawCode = item.code.length > 50 ? item.code.substring(0, 50) + '...' : item.code;
      const escapedCode = this.escapeCode(rawCode);
      const confirmHtml = `
        <span class='red'><<lanSwitch 'Confirm to delete: ' '确认删除：'>>"${item.name}"?</span><br>
        <span class='cheat-code' data-type="${item.type === 'javascript' ? 'JS' : 'Twine'}">${escapedCode}</span>
        <<lanLink 'confirm' 'capitalize' 'class:teal'>><<run maplebirch.Expansion.cheat.removeForm('${item.name}')>><</lanLink>>|
        <<lanLink 'cancel' 'capitalize' 'class:blue'>><<run maplebirch.Expansion.cheat.cancelDelete('${item.name}')>><</lanLink>>
      `;
      this.updateContainer(itemId, confirmHtml);
    }

    async removeForm(name) {
      const item = this.cache.find(c => c.name === name);
      if (!item) return false;
      await maplebirch.idb.withTransaction(['cheats'], 'readwrite', async (tx) => {
        const store = tx.objectStore('cheats');
        await store.delete(name);
      });
      await this.refreshCache();
      if (T.maplebirchModCheatNamebox === name) T.maplebirchModCheatNamebox = T.maplebirchModCheatCodebox = '';
      this.updateDisplay();
      return true;
    }

    cancelDelete(name) {
      const item = this.cache.find(c => c.name === name);
      if (!item) return;
      const itemId = `cheat-item-${this.stringDJB2Hash(item.name)}`;
      const rawCode = item.code.length > 50 ? item.code.substring(0, 50) + '...' : item.code;
      const escapedCode = this.escapeCode(rawCode);
      const normalHtml = `
        <<lanLink '${item.name}' 'class:strawberry'>><<run maplebirch.Expansion.cheat.updateForm('${item.name}')>><</lanLink>><br>
        <span class='cheat-code' data-type="${item.type === 'javascript' ? 'JS' : 'Twine'}">${escapedCode}</span>
        <<lanLink 'execute' 'capitalize' 'class:teal'>><<run maplebirch.Expansion.cheat.executeForm('${item.name}')>><</lanLink>>|
        <<lanLink 'delete' 'capitalize' 'class:red'>><<run maplebirch.Expansion.cheat.deleteForm('${item.name}')>><</lanLink>>
      `;
      this.updateContainer(itemId, normalHtml);
    }

    sortForm() {
      this.sortOrder = (this.sortOrder + 1) % 5;
      if (this.sortOrder === 0) {
        this.refreshCache().then(() => this.updateDisplay());
      } else if (this.sortOrder === 1) {
        this.cache.sort((a, b) => a.name.localeCompare(b.name));
        this.updateDisplay();
      } else if (this.sortOrder === 2) {
        this.cache.sort((a, b) => b.name.localeCompare(a.name));
        this.updateDisplay();
      } else if (this.sortOrder === 3) {
        this.cache.sort((a, b) => a.type.localeCompare(b.type));
        this.updateDisplay();
      } else if (this.sortOrder === 4) {
        this.cache.sort((a, b) => b.type.localeCompare(a.type));
        this.updateDisplay();
      }
    }

    clearForm(action) {
      if (this.cache.length === 0 && !action) return;
      if (action === 'confirm') {
        this.confirmClear();
      } else if (action === 'cancel') {
        this.updateContainer('maplebirch-cheat-content', this.content);
      } else {
        const confirmHtml = `
        <div class='settingsToggleItem'>
          <span class='red'><<lanSwitch 'Are you sure to clear' '确认清空'>> ${this.cache.length} <<lanSwitch 'codes' '个命令'>>?</span><br>
          <<lanLink 'confirm' 'capitalize' 'class:teal'>><<run maplebirch.Expansion.cheat.clearForm('confirm')>>
          <</lanLink>>|<<lanLink 'cancel' 'capitalize' 'class:blue'>><<run maplebirch.Expansion.cheat.clearForm('cancel')>><</lanLink>>
        </div>`;
        this.updateContainer('maplebirch-cheat-content', confirmHtml);
      }
    }

    async confirmClear() {
      await maplebirch.idb.clearStore('cheats');
      this.cache = [];
      T.maplebirchModCheatNamebox = T.maplebirchModCheatCodebox = '';
      T.maplebirchCheatSearch = '';
      this.updateContainer('maplebirch-cheat-panel', this.panel);
      this.updateContainer('maplebirch-cheat-search', this.search);
      this.updateContainer('maplebirch-cheat-content', this.content);
    }

    updateDisplay() {
      if (T.maplebirchCheatSearch?.trim()) {
        this.searchForm();
      } else {
        this.updateContainer('maplebirch-cheat-content', this.content);
      }
    }

    stringDJB2Hash(str) {
      let hash = 5381;
      for (let i = 0; i < str.length; i++) hash = (hash * 33) ^ str.charCodeAt(i);
      return (hash >>> 0).toString(16);
    }
  }

  class Expansion {
    static options = {
      modHint: 'disable',
      solarEclipse: true,
      bodywriting: false,
    }

    /** @param {MaplebirchCore} core */
    constructor(core) {
      this.core = core;
      this.version = '1.0.0';
      this.migration = new this.core.tool.migration();
      this.modhint = new modhint(this.core.tool.createLog('modhit'));
      this.cheat = new cheat();
      this.core.once(':passageend', () => this.optionsCheck());
      this.core.on(':dataInit', () => {
        this.optionsCheck();
        this.migration.run(V.maplebirchEx, this.version);
      });
    }

    optionsCheck() {
      V.maplebirchEx ??= {};
      if (typeof V.options?.maplebirch !== 'object' || V.options?.maplebirch == null) {
        V.options.maplebirch = clone(Expansion.options);
      } else {
        for (const key in Expansion.options) if (!(key in V.options.maplebirch)) V.options.maplebirch[key] = clone(Expansion.options[key]);
      }
    }
  }

  await maplebirch.register('Expansion', new Expansion(maplebirch), ['combat'], true);
})();