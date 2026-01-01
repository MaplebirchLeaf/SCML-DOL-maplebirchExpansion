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