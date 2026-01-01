(() => {
  maplebirch.tool.framework.addTo('HintMobile', 'maplebirchModHintMobile');
  maplebirch.tool.framework.addTo('MenuBig', 'maplebirchModHintDesktop');
  maplebirch.tool.framework.addTo('Options', 'maplebirch-Expansion-Options');
  Object.assign(maplebirch.tool.framework.widgetPassage,{
    'Widgets Wardrobe': [
        { src: ')<</if>>\n\t\t<br>', applyafter: '\n\t\t<<lanSwitch "Search: " "搜索：">><<textbox "$maplebirchEx.wardrobeSearch" $maplebirchEx.wardrobeSearch>><div class="outfitContainer no-numberify" style="display: inline-block;"><<lanButton "confirm" "capitalize">><<run Dynamic.render()>><</lanButton>></div><br>' },
        { src: '<</if>>\n\t\t\t<div class="wardrobeItem wardrobe-action no-numberify">', to: '<</if>>\n\t\t\t<<if $maplebirchEx.wardrobeSearch isnot "">><<run $maplebirchEx.wardrobeSearch.toLowerCase()>><<language>><<option "CN">><<if !_itemData.cn_name_cap.toLowerCase().includes($maplebirchEx.wardrobeSearch)>><<continue>><</if>><<option "EN">><<if !_itemData.name_cap.toLowerCase().includes($maplebirchEx.wardrobeSearch)>><<continue>><</if>><</language>><</if>>\n\t\t\t<div class="wardrobeItem wardrobe-action no-numberify">'}
      ]
    });

  maplebirch.once(':storyready', () => {
    setup.maplebirch.content.push(`
      <div id='ConsoleCheat'>
        <details class='cheat-section' open>
          <summary class='cheat-section'><span class='gold'><<lanSwitch 'Cheating Collection' '作弊集'>></span></summary>
          <div class='searchButtons'>
            <div class='input-row'>
              <span class='gold'><<lanSwitch 'NAME' '命名'>></span>
              <<textbox '_maplebirchModCheatNamebox' ''>>
              <span class='gold'><<lanSwitch 'CODE' '编码'>></span>
              <<textbox '_maplebirchModCheatCodebox' ''>>
              <<lanButton 'create' 'capitalize'>><<run maplebirch.tool?.cheat.createFromForm()>><</lanButton>>
            </div>
          </div>
          <div class='searchButtons'>
            <div class='input-row'><<textbox '_maplebirchCheatSearch' ''>>
              <<lanButton 'search' 'capitalize'>><<run maplebirch.tool?.cheat.searchAndDisplay()>><</lanButton>>
              <<lanButton 'all' 'capitalize'>><<run maplebirch.tool?.cheat.displayAll()>><</lanButton>>
              <<lanButton 'clear' 'capitalize'>><<run maplebirch.tool?.cheat.updateContainer('maplebirch-cheat-container', maplebirch.tool?.cheat.clearAll())>><</lanButton>>
            </div>
          </div>
          <div id='maplebirch-cheat-container' class='settingsGrid'><<= maplebirch.tool?.cheat.HTML()>></div>
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