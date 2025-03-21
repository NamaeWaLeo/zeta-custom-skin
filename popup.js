document.addEventListener('DOMContentLoaded', async function() {
  const fontDropdown = document.getElementById('fontDropdown');
  const fontSizeDropdown = document.getElementById('fontSizeDropdown');
  const skinDropdown = document.getElementById('skinDropdown');
  const useCustomFont = document.getElementById('useCustomFont');
  const useCustomSkin = document.getElementById('useCustomSkin');
  const hideProfileImage = document.getElementById('hideProfileImage');
  const applyButton = document.getElementById('applyButton');

  // 1. 폰트 크기 드롭다운 채우기 (8 ~ 64)
  for (let size = 8; size <= 64; size++) {
    const opt = document.createElement('option');
    opt.value = size;
    opt.textContent = size + "px";
    fontSizeDropdown.appendChild(opt);
  }
  fontSizeDropdown.value = 16;

  // 2. 기본 옵션 추가
  const defaultFontOption = document.createElement('option');
  defaultFontOption.value = "none";
  defaultFontOption.textContent = "기본 설정 (사이트 기본 폰트)";
  fontDropdown.insertBefore(defaultFontOption, fontDropdown.firstChild);

  const defaultSkinOption = document.createElement('option');
  defaultSkinOption.value = "none";
  defaultSkinOption.textContent = "비활성화 (원래 스킨)";
  skinDropdown.insertBefore(defaultSkinOption, skinDropdown.firstChild);

  // 3. 미리 정의한 스킨 닉네임 매핑 객체
  const skinNicknames = {
    "skin_cocoa.js": "KaTalk-Like Style",
    "skin_harmony.js": "Discord-Like Style",
    "skin_gpt.js": "GPT-Like Style",
    "skin_insta.js": "Insta-Like Style",
    "skin_tele.js": "Telegram-Like Style",
    "skin_cyber.js": "Cyberpunk Style",
    "skin_medieval.js" : "Medieval Style",
    "skin_win98.js" : "Win98-Like Style",
    "skin_telnet.js" : "Telnet(혹은 PC통신) Style",
    "skin_lovegame.js" : "미연시 Style",
    "skin_military.js" : "군사 관련 기계 Style"
  };

  // 4. 폰트 폴더에서 파일 목록을 불러와 드롭다운에 추가하는 함수
  function populateFontDropdown() {
    return new Promise((resolve, reject) => {
      chrome.runtime.getPackageDirectoryEntry(function(root) {
        root.getDirectory('fonts', {}, function(dirEntry) {
          const reader = dirEntry.createReader();
          reader.readEntries(function(entries) {
            entries.forEach(function(entry) {
              if (entry.isFile && entry.name.match(/\.(ttf|woff|woff2)$/i)) {
                const opt = document.createElement('option');
                opt.value = entry.name;
                opt.textContent = entry.name;
                fontDropdown.appendChild(opt);
              }
            });
            resolve();
          }, reject);
        }, reject);
      });
    });
  }
    
  // 5. 스킨 폴더에서 파일 목록을 불러와 드롭다운에 추가하는 함수  
  // 각 옵션에 "파일명 - 닉네임" 형식으로 표시함
  function populateSkinDropdown() {
    return new Promise((resolve, reject) => {
      chrome.runtime.getPackageDirectoryEntry(function(root) {
        root.getDirectory('skins', {}, function(dirEntry) {
          const reader = dirEntry.createReader();
          reader.readEntries(function(entries) {
            entries.forEach(function(entry) {
              if (entry.isFile && entry.name.match(/\.js$/i)) {
                const opt = document.createElement('option');
                opt.value = entry.name;
                // 미리 정의한 매핑에 해당 파일명이 있으면 닉네임을 붙이고, 없으면 파일명만 표시
                const nickname = skinNicknames[entry.name] ? " - " + skinNicknames[entry.name] : "";
                opt.textContent = entry.name + nickname;
                skinDropdown.appendChild(opt);
              }
            });
            resolve();
          }, reject);
        }, reject);
      });
    });
  }
    
  // 6. 드롭다운 옵션 채우기 완료 대기
  await Promise.all([populateFontDropdown(), populateSkinDropdown()]);
    
  // 7. 저장된 설정 적용 (hideProfileImage 포함)
  chrome.storage.sync.get(
    ["selectedFont", "selectedFontSize", "selectedSkin", "useCustomFont", "useCustomSkin", "hideProfileImage"],
    function(data) {
      if (data.useCustomFont !== undefined) {
        useCustomFont.checked = data.useCustomFont;
      }
      if (data.useCustomSkin !== undefined) {
        useCustomSkin.checked = data.useCustomSkin;
      }
      if (data.hideProfileImage !== undefined) {
        hideProfileImage.checked = data.hideProfileImage;
      }
      if (data.selectedFont) {
        fontDropdown.value = data.selectedFont;
      }
      if (data.selectedFontSize) {
        fontSizeDropdown.value = data.selectedFontSize;
      }
      if (data.selectedSkin) {
        skinDropdown.value = data.selectedSkin;
      }
      // 팝업에서는 커스텀 폰트 미리보기만 적용 (스킨 미리보기는 생략)
      if (useCustomFont.checked && data.selectedFont && data.selectedFont !== "none") {
        applyCustomFont(data.selectedFont, data.selectedFontSize);
      } else {
        removeCustomFont();
      }
    }
  );
    
  // 8. "적용" 버튼 클릭 시 설정 저장 및 적용 (hideProfileImage 포함)
  applyButton.addEventListener('click', function() {
    const selectedFont = fontDropdown.value;
    const selectedFontSize = fontSizeDropdown.value;
    const selectedSkin = skinDropdown.value;
    const customFontEnabled = useCustomFont.checked;
    const customSkinEnabled = useCustomSkin.checked;
    const hideProfile = hideProfileImage.checked;
    
    chrome.storage.sync.set({
      selectedFont: selectedFont,
      selectedFontSize: selectedFontSize,
      selectedSkin: selectedSkin,
      useCustomFont: customFontEnabled,
      useCustomSkin: customSkinEnabled,
      hideProfileImage: hideProfile
    }, function() {
      alert("설정이 적용되었습니다.");
      if (customFontEnabled && selectedFont !== "none") {
        applyCustomFont(selectedFont, selectedFontSize);
      } else {
        removeCustomFont();
      }
      // 스킨 미리보기는 팝업 내에서 생략합니다.
    });
  });
    
  // 9. 커스텀 폰트 미리보기 함수 (팝업 내)
  function applyCustomFont(fontFile, fontSize) {
    if (!fontFile || fontFile === "none") return;
    const fontUrl = chrome.runtime.getURL("fonts/" + fontFile);
    const oldStyle = document.getElementById('customFontStyle');
    if (oldStyle) oldStyle.remove();
    const styleEl = document.createElement('style');
    styleEl.id = 'customFontStyle';
    styleEl.innerHTML = `
      @font-face {
        font-family: 'MyCustomFont';
        src: url(${fontUrl}) format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      body {
        font-family: 'MyCustomFont' !important;
        font-size: ${fontSize || 16}px !important;
      }
    `;
    document.head.appendChild(styleEl);
  }
    
  // 10. 커스텀 폰트 제거 함수
  function removeCustomFont() {
    const oldStyle = document.getElementById('customFontStyle');
    if (oldStyle) oldStyle.remove();
  }
});
