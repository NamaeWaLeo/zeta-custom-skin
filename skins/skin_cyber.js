(function() {
  chrome.storage.sync.get(["selectedSkin", "selectedFontSize"], function(data) {
    // 선택된 스킨이 "skin_cyber.js"가 아니라면 실행 중단
    if (data.selectedSkin !== "skin_cyber.js") {
      return;
    }
    // 선택된 폰트 크기, 기본값 13px
    const fs = data.selectedFontSize || 13;
  
    (function() {
      const STYLE_ID = 'skinStyle';
  
      // 지정한 root(문서 또는 shadowRoot)에 스타일 태그를 삽입하는 함수
      function injectStyle(root) {
        if (!root) return;
        const existing = root.getElementById(STYLE_ID);
        if (existing) return; // 이미 존재하면 재삽입하지 않음
  
        const styleEl = document.createElement('style');
        styleEl.id = STYLE_ID;
        styleEl.textContent = `
          /* --- Cyberpunk 스타일: 네온 보라색 효과 --- */
  
          /* 전체 배경: 완전 검정 */
          body {
            background-color: #000000 !important;
          }
  
          /* 채팅 버블 기본 스타일: 
             - 배경: 완전 검정
             - 테두리: 네온 보라색 (#9D00FF)
             - 박스 그림자: 0 2px 4px rgba(157,0,255,0.5)
             - 평면적 레이아웃, 약간의 패딩 */
          .bg-primary-300,
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 {
            background-color: #000000 !important;
            border: 1px solid #9D00FF !important;
            border-radius: 4px !important;
            padding: 6px 10px !important;
            box-shadow: 0 2px 4px rgba(157,0,255,0.5) !important;
          }
          .bg-primary-300 * ,
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 * {
            color: #C5C8C6 !important;
            font-size: ${fs}px !important;
            line-height: 1.5 !important;
          }
          .bg-primary-300 em,
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 em {
            color: #8ABEB7 !important;
            font-style: italic !important;
          }
  
          /* nav 영역: 채널 제목 등은 네온 보라색 느낌 */
          nav, nav * {
            color: #9D00FF !important;
          }
          nav .title16.text-white {
            color: #9D00FF !important;
          }
  
          /* .bg-gray-main: 어두운 회색 (#111111) */
          .bg-gray-main {
            background-color: #111111 !important;
          }
  
          /* 메시지 입력 영역 컨테이너:
             - 배경: 완전 검정
             - 테두리: 네온 보라색
             - 평면적 스타일 */
          div.flex.flex-1.flex-row.items-center.gap-1.rounded-\\[20px\\].bg-\\[rgba\\(62,62,65,0\\.90\\)\\].px-1\\.5 {
            background-color: #000000 !important;
            border: 1px solid #9D00FF !important;
            border-radius: 4px !important;
            padding: 6px 8px !important;
          }
  
          /* 버튼 (bg-primary-400): 네온 보라색 → 매직 핑크 그라데이션, 내부 svg는 흰색 */
          button.bg-primary-400 {
            background-image: linear-gradient(90deg, #9D00FF, #E100FF) !important;
            background-color: transparent !important;
            border: none !important;
            border-radius: 4px !important;
            padding: 6px 8px !important;
          }
          button.bg-primary-400:hover,
          button.bg-primary-400:active {
            background-image: linear-gradient(90deg, #8C00E0, #C300E6) !important;
          }
          button.bg-primary-400 svg {
            color: #FFFFFF !important;
          }
  
          /* textarea placeholder: 밝은 회색 이탤릭체 */
          textarea[name="message"]::placeholder {
            color: #888888 !important;
            font-style: italic !important;
          }
  
          /* 채팅 헤더 및 메시지 영역 레이아웃 */
          .chat-header {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            margin-bottom: 12px !important;
          }
          .chat-message {
            margin-top: 12px !important;
          }
        `;
        (root.head || root.documentElement).appendChild(styleEl);
      }
  
      // 지정한 root와 내부의 모든 Shadow DOM에도 스타일 적용 함수
      function applyStyles(root) {
        injectStyle(root);
        root.querySelectorAll('*').forEach(el => {
          if (el.shadowRoot) {
            injectStyle(el.shadowRoot);
          }
        });
      }
  
      // 초기 적용: 메인 문서에 적용
      applyStyles(document);
  
      // MutationObserver: 동적으로 추가되는 요소(및 Shadow DOM)에도 스타일 적용
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.shadowRoot) injectStyle(node.shadowRoot);
              node.querySelectorAll('*').forEach(child => {
                if (child.shadowRoot) injectStyle(child.shadowRoot);
              });
            }
          });
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
  
      // setInterval: 0.5초마다 스타일 태그 존재 여부 확인 및 재삽입
      setInterval(() => {
        if (!document.getElementById(STYLE_ID)) {
          injectStyle(document);
        }
      }, 500);
  
    })();
  });
  // 저장된 hideProfileImage 값에 따라 프로필 이미지 숨김 처리
chrome.storage.sync.get("hideProfileImage", function(result) {
  if (result.hideProfileImage) {
    let style = document.getElementById("hideProfileImageStyle");
    if (!style) {
      style = document.createElement("style");
      style.id = "hideProfileImageStyle";
      style.textContent = `
        a[href*="/ko/characters/"] img[alt="캐릭터 프로필 이미지"] {
          display: none !important;
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }
  } else {
    let style = document.getElementById("hideProfileImageStyle");
    if (style) {
      style.remove();
    }
  }
});

})();
