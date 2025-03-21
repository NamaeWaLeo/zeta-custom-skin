(function() {
  chrome.storage.sync.get(["selectedSkin", "selectedFontSize", "useCustomFont", "selectedFont"], (data) => {
    // 선택된 스킨이 "skin_harmony.js"가 아닐 경우 실행 중단
    if (data.selectedSkin !== "skin_harmony.js") return;

    // 폰트 크기: 기본값 14px
    const fs = data.selectedFontSize || 14;

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
          /* --- Discord/IRC 느낌 채팅 인터페이스 스타일 --- */

          /* 
             수신/발신 모두 왼쪽 정렬
             .bg-primary-300: 발신, .bg-gray-sub1: 수신
             Discord에서는 사실상 모든 메시지가 왼쪽에 쌓이는 구조이므로
             margin, text-align 등을 동일하게 통일 
          */
          .bg-primary-300,
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 {
            text-align: left !important;
            margin-left: 0 !important;
            margin-right: auto !important; 
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
            padding: 4px 8px !important;
            display: inline-block !important; /* 필요한 경우 inline-block으로 배치 */
          }

          /* 발신 쪽(예: .bg-primary-300) 색상 */
          .bg-primary-300 {
            background-color: #3C3F45 !important;
          }
          /* 수신 쪽(예: .bg-gray-sub1) 색상 */
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 {
            background-color: #2F3136 !important;
          }

          /* 메시지 텍스트 색상 통일 & 폰트 크기 적용 */
          .bg-primary-300 *,
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 * {
            color: #FFFFFF !important;
            font-size: ${fs}px !important;
            line-height: 1.4 !important;
          }
          .bg-primary-300 em,
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 em {
            color: #B9BBBE !important;
            font-style: italic !important;
          }

          /* 전체 배경과 nav 영역 */
          body {
            background-color: #202225 !important; /* Discord 느낌 어두운 배경 */
          }
          nav, nav * {
            color: #FFFFFF !important;
          }
          nav .title16.text-white {
            color: #FFFFFF !important;
          }
          .bg-gray-main {
            background-color: #2F3136 !important; 
          }

          /* 메시지 입력 영역 */
          div.flex.flex-1.flex-row.items-center.gap-1.rounded-\\[20px\\].bg-\\[rgba\\(62,62,65,0\\.90\\)\\].px-1\\.5 {
            background-color: #36393F !important;
            border: none !important;
            border-radius: 4px !important;
            padding: 4px 6px !important;
          }

          /* 버튼 스타일 (bg-primary-400) */
          button.bg-primary-400 {
            background-color: #7289DA !important;
            border: none !important;
            border-radius: 4px !important;
            padding: 6px 8px !important;
          }
          button.bg-primary-400:hover,
          button.bg-primary-400:active {
            background-color: #677BC4 !important;
          }
          button.bg-primary-400 svg {
            color: #FFFFFF !important;
          }

          /* textarea placeholder 스타일 */
          textarea[name="message"]::placeholder {
            color: #CCCCCC !important;
            font-style: italic !important;
          }

          /* --- 채팅 헤더 및 메시지 영역 레이아웃 (IRC 비슷하게 평면적 배치) --- */
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

      // 지정한 root와 내부의 모든 Shadow DOM에도 스타일 적용하는 함수
      function applyStyles(root) {
        injectStyle(root);
        root.querySelectorAll('*').forEach((el) => {
          if (el.shadowRoot) {
            injectStyle(el.shadowRoot);
          }
        });
      }

      // 최초 적용: 메인 문서에 적용
      applyStyles(document);

      // MutationObserver: 동적으로 추가되는 요소(및 Shadow DOM)에도 스타일 적용
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.shadowRoot) injectStyle(node.shadowRoot);
              node.querySelectorAll('*').forEach((child) => {
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



      // useCustomFont, selectedFont 체크 후 적용
      if (data.useCustomFont && data.selectedFont && data.selectedFont !== "none") {
        applyCustomFont(data.selectedFont);
      } else {
        removeCustomFont();
      }
      // ======================================
    })();
  });
    // 커스텀 폰트 적용
    chrome.storage.sync.get(["useCustomFont", "selectedFont", "selectedFontSize"], function(fontData) {
      if (fontData.useCustomFont && fontData.selectedFont && fontData.selectedFont !== "none") {
        const fontUrl = chrome.runtime.getURL("fonts/" + fontData.selectedFont);
        let customFontStyle = document.getElementById("customFontStyle");
        if (!customFontStyle) {
          customFontStyle = document.createElement("style");
          customFontStyle.id = "customFontStyle";
          customFontStyle.innerHTML = `
            @font-face {
              font-family: 'MyCustomFont';
              src: url(${fontUrl}) format('truetype');
              font-weight: normal;
              font-style: normal;
            }
            body, * {
              font-family: 'MyCustomFont' !important;
              font-size: ${fontData.selectedFontSize || 16}px !important;
            }
          `;
          (document.head || document.documentElement).appendChild(customFontStyle);
        }
      } else {
        // custom font 사용 비활성 시 기존 custom font 스타일 제거
        const oldStyle = document.getElementById("customFontStyle");
        if (oldStyle) {
          oldStyle.remove();
        }
      }
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
