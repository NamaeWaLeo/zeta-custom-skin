(function() {
  chrome.storage.sync.get(["selectedSkin"], function(data) {
    // 선택된 스킨이 "skin_cocoa.js"가 아니라면 실행 중단
    if (data.selectedSkin !== "skin_cyber.js") {
      return;
    }
    
    // selectedFontSize 값을 읽어옴 (없으면 기본 14px)
    chrome.storage.sync.get(["selectedFontSize"], function(fontData) {
      const fs = fontData.selectedFontSize || 14;
      const STYLE_ID = 'skinStyle';

      // 스타일 태그를 삽입하는 함수 (폰트 크기 fs 적용)
      function injectStyle(root) {
        if (!root) return;
        const existing = root.getElementById(STYLE_ID);
        if (existing) return; // 이미 존재하면 재삽입하지 않음

        const styleEl = document.createElement('style');
        styleEl.id = STYLE_ID;
        styleEl.textContent = `
          /* bg-primary-300: 사이버 느낌의 네온 보라색 테두리를 가진 검정 말풍선 (사용자 메시지) */
          .bg-primary-300 {
            background-color: #000000 !important;       /* 완전 검정 배경 */
            border: 1px solid #9D00FF !important;       /* 네온 보라색 테두리 */
            border-radius: 4px !important;
            padding: 6px 10px !important;
            box-shadow: 0 2px 4px rgba(157,0,255,0.5) !important;
            max-width: 120%;
            align-self: flex-end; /* 오른쪽 정렬 */
          }
          .bg-primary-300 * {
            color: #C5C8C6 !important;                  /* 연한 회색 텍스트 */
            font-size: ${fs}px !important;
            line-height: 1.5 !important;
          }

          /* 수신 메시지 (어시스턴트 메시지): 동일한 검정 배경, 네온 보라색 테두리, 왼쪽 정렬 */
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 {
            background-color: #000000 !important;
            border: 1px solid #9D00FF !important;
            border-radius: 4px !important;
            padding: 6px 10px !important;
            box-shadow: 0 2px 4px rgba(157,0,255,0.5) !important;
            max-width: 120%;
            align-self: flex-start;
          }
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 * {
            color: #C5C8C6 !important;
            font-size: ${fs}px !important;
            line-height: 1.5 !important;
          }
          /* .text-white/50 라는 클래스가 있을 경우, 살짝 밝은 색 (민트빛)으로 표시 */
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 em[class*="text-white/50"] {
            color: #8ABEB7 !important;
          }

          /* nav 내부 텍스트: 네온 보라색으로 */
          nav, nav * {
            color: #9D00FF !important;
          }
          nav .title16.text-white {
            color: #9D00FF !important;
          }

          /* .bg-gray-main: 어두운 배경 (#111111) */
          .bg-gray-main {
            background-color: #111111 !important;
          }

          /* 메시지 입력 영역: 검정 배경에 네온 보라색 테두리 */
          div.flex.flex-1.flex-row.items-center.gap-1.rounded-\\[20px\\].bg-\\[rgba\\(62,62,65,0\\.90\\)\\].px-1\\.5 {
            background-color: #000000 !important;
            border: 1px solid #9D00FF !important;
            border-radius: 4px !important;
            padding: 6px 8px !important;
          }

          /* 전송 버튼 (bg-primary-400): 네온 보라색 → 핑크 그라데이션 */
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
            color: #FFFFFF !important; /* 흰색 아이콘 */
          }

          /* textarea placeholder: 중간 밝기의 회색, 이탤릭체 */
          textarea[name="message"]::placeholder {
            color: #888888 !important;
            font-style: italic !important;
          }

          /* 내부 텍스트에 사용자 지정 폰트 크기 적용 */
          .bg-primary-300 * ,
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 * {
            font-size: ${fs}px !important;
          }

          /* (추가) 배경: 완전 검정 */
          body {
            background-color: #000000 !important;
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
  });
})();
