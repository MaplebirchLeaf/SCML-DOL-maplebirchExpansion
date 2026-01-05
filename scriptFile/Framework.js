(() => {
  maplebirch.tool.framework.addTo('HintMobile', 'maplebirchModHintMobile');
  maplebirch.tool.framework.addTo('MenuBig', 'maplebirchModHintDesktop');
  maplebirch.tool.framework.addTo('Options', 'maplebirch-Expansion-Options');
  Object.assign(maplebirch.tool.framework.widgetPassage, {
    'Widgets Wardrobe': [
        { src: ')<</if>>\n\t\t<br>', applyafter: '\n\t\t<<lanSwitch "Search: " "搜索：">><<textbox "$maplebirchEx.wardrobeSearch" $maplebirchEx.wardrobeSearch>><div class="outfitContainer no-numberify" style="display: inline-block;"><<lanButton "confirm" "capitalize">><<run Dynamic.render()>><</lanButton>></div><br>' },
        { src: '<</if>>\n\t\t\t<div class="wardrobeItem wardrobe-action no-numberify">', to: '<</if>>\n\t\t\t<<if $maplebirchEx.wardrobeSearch isnot "">><<run $maplebirchEx.wardrobeSearch.toLowerCase()>><<language>><<option "CN">><<if !_itemData.cn_name_cap.toLowerCase().includes($maplebirchEx.wardrobeSearch)>><<continue>><</if>><<option "EN">><<if !_itemData.name_cap.toLowerCase().includes($maplebirchEx.wardrobeSearch)>><<continue>><</if>><</language>><</if>>\n\t\t\t<div class="wardrobeItem wardrobe-action no-numberify">'}
      ]
    });
  maplebirch.tool.framework.widgetPassage['Widgets Mirror'].push({ src: '</div>\n\t\t</div>\n\t\t<div class="settingsToggleItemWide">', to: '</div>\n\t\t</div>\n\t\t<<maplebirchBodyWriting>>\n\t\t<div class="settingsToggleItemWide">' });

  maplebirch.once(':storyready', () => {
    setup.maplebirch.content.push(`
      <div id='ConsoleCheat'>
        <details class='cheat-section' open>
          <summary class='cheat-section'><span class='gold'><<lanSwitch 'Cheating Collection' '作弊集'>></span></summary>
          <div id='maplebirch-cheat-panel' class='searchButtons'><<= maplebirch.Expansion.cheat.panel>></div>
          <div id='maplebirch-cheat-search' class='searchButtons'><<= maplebirch.Expansion.cheat.search>></div>
          <div id='maplebirch-cheat-status' class=''></div><div id='maplebirch-cheat-content' class='settingsGrid'><<= maplebirch.Expansion.cheat.content>></div>
        </details>
      </div><<maplebirch-playback 'maplebirchEx'>>
    `);
  });

  $(document).on('change', 'input[name="radiobutton--maplebirchbodywritingcolor"]', function () {
    if (!maplebirch.modules.initPhase.preInitCompleted) return;
    if (T.maplebirchBodywriting.color === 'custom') {
      $.wiki('<<replace "#maplebirchBodyWriting">><br><<lanSwitch "Custom Color" "自定义颜色">>: <<textbox "_maplebirchBodywriting.custom" "#FFFFFF">><span id="colorPreviewBox" style="display: inline-block;width: 20px;height: 20px;border:1px solid #ccc;margin-left:5px;background-color: #FFFFFF;"></span><</replace>>');
    } else {
      $.wiki('<<replace "#maplebirchBodyWriting">><</replace>>');
    }
  });

  $(document).on('input', 'input[name="textbox--maplebirchbodywritingcustom"]', function () {
    if (!maplebirch.modules.initPhase.preInitCompleted) return;
    let color = this.value;
    if (!color.startsWith('#')) color = '#' + color;
    let preview = document.getElementById('colorPreviewBox');
    if (preview && /^#[0-9A-F]{3,6}$/i.test(color)) preview.style.backgroundColor = color;
  });
})();