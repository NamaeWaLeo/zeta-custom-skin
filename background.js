chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    // 설정이 바뀐 항목들을 확인합니다.
    if (
      changes.selectedSkin ||
      changes.useCustomSkin ||
      changes.hideProfileImage ||
      changes.selectedFont ||
      changes.selectedFontSize ||
      changes.useCustomFont
    ) {
      // zeta-ai.io 관련 탭들을 모두 찾은 후 새로고침
      chrome.tabs.query({ url: "https://zeta-ai.io/*" }, (tabs) => {
        tabs.forEach((tab) => {
          console.log("Reloading tab:", tab.id);
          chrome.tabs.reload(tab.id);
        });
      });
    }
  }
});
