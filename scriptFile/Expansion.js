(async () => {
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