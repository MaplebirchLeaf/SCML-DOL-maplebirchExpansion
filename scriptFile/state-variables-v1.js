(() => {
  const migration = maplebirch.Expansion.migration;

  migration.add('0.0.0', '1.0.0', (data, utils) => {
    const defaults = {
      audio: {
        playlist: null,
        currentTrack: null,
        currentIndex: -1,
        loopMode: 'none',
        currentAudio: null,
        storage: {}
      },
      wardrobeSearch: '',
      hintlocation: 'maplebirchModHint'
    };
    if (!data || Object.keys(data).length === 0 || !data.version || data.version === '0.0.0') {
      Object.assign(data, defaults);
      data.version = '1.0.0';
      return;
    }
    try { utils.fill(data, defaults); } catch (e) {}
    data.version = '1.0.0';
  });
})();