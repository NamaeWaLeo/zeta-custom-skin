(function() {
  chrome.storage.sync.get(
    ["selectedSkin", "selectedFontSize", "useCustomFont", "selectedFont"],
    function(data) {
      // (1) 선택된 스킨이 "skin_insta.js"가 아닐 경우 실행 중단
      if (data.selectedSkin !== "skin_insta.js") {
        return;
      }

      // (2) 폰트 크기 설정 (기본값 14px)
      const fs = data.selectedFontSize || 14;

      (function() {
        const STYLE_ID = 'skinStyle';

        // (3) 지정한 root(문서 또는 shadowRoot)에 스타일 태그를 삽입하는 함수
        function injectStyle(root) {
          if (!root) return;
          const existing = root.getElementById(STYLE_ID);
          if (existing) return; // 이미 존재하면 재삽입하지 않음

          const styleEl = document.createElement('style');
          styleEl.id = STYLE_ID;
          styleEl.textContent = `
            /* ==============================
               Instagram Dark Mode DM Style
               ============================== */

            /* 
               발신 메시지: 인스타 그라데이션 (보라 → 파랑),
               수신 메시지: 짙은 회색
               배경: #121212 (다크 모드)
            */

            /* 배경 색상(본문/전체) */
            body {
              background-color: #121212 !important;
            }
            /* 상단 nav 영역 등에 흰색 텍스트 */
            nav, nav * {
              color: #FFFFFF !important;
            }
            nav .title16.text-white {
              color: #FFFFFF !important;
            }
            /* 일부 .bg-gray-main 요소도 어둡게 */
            .bg-gray-main {
              background-color: #1E1E1E !important;
            }

            /* 발신 메시지: .bg-primary-300 */
            .bg-primary-300 {
              background-image: linear-gradient(90deg, #405DE6, #C13584) !important;
              border: none !important;
              border-radius: 12px !important;
              padding: 8px 12px !important;
              margin: 4px 0 !important;
              display: inline-block !important;
              max-width: 120%;
              text-align: left !important;
            }
            .bg-primary-300 * {
              color: #FFFFFF !important;
              font-size: ${fs}px !important;
              line-height: 1.4 !important;
            }

            /* 수신 메시지: .bg-gray-sub1 */
            .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 {
              background-color: #2A2A2A !important;
              border: none !important;
              border-radius: 12px !important;
              padding: 8px 12px !important;
              margin: 4px 0 !important;
              display: inline-block !important;
              max-width: 120%;
              text-align: left !important;
            }
            .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 * {
              color: #EAEAEA !important;
              font-size: ${fs}px !important;
              line-height: 1.4 !important;
            }

            /* 메시지 입력 영역 (하단) */
            div.flex.flex-1.flex-row.items-center.gap-1.rounded-\\[20px\\].bg-\\[rgba\\(62,62,65,0\\.90\\)\\].px-1\\.5 {
              background-color: #2E2E2E !important;
              border: 1px solid #3A3A3A !important;
              border-radius: 20px !important;
              padding: 6px 10px !important;
            }

            /* 버튼 (bg-primary-400) - DM 환경에서 파란 버튼 느낌 */
            button.bg-primary-400 {
              background-color: #405DE6 !important; 
              border: none !important;
              border-radius: 6px !important;
              padding: 6px 10px !important;
            }
            button.bg-primary-400:hover,
            button.bg-primary-400:active {
              background-color: #2F49A7 !important;
            }
            button.bg-primary-400 svg {
              color: #FFFFFF !important;
            }

            /* placeholder */
            textarea[name="message"]::placeholder {
              color: #999999 !important;
              font-style: italic !important;
            }

            /* 헤더 및 메시지 레이아웃 */
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

        // (4) 지정한 root와 내부의 모든 Shadow DOM에도 스타일 적용
        function applyStyles(root) {
          injectStyle(root);
          root.querySelectorAll('*').forEach((el) => {
            if (el.shadowRoot) {
              injectStyle(el.shadowRoot);
            }
          });
        }

        // (5) 문서 전체에 즉시 스타일 적용
        applyStyles(document);

        // (6) MutationObserver: 동적으로 추가되는 요소(및 Shadow DOM)도 자동 적용
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

        // (7) setInterval: 0.5초마다 스타일 태그 존재 여부 확인 & 재삽입
        setInterval(() => {
          if (!document.getElementById(STYLE_ID)) {
            injectStyle(document);
          }
        }, 500);

        // (8) 커스텀 폰트 로직 (skin_cocoa.js와 동일)
        function applyCustomFont(fontFile) {
          removeCustomFont();
          const styleId = 'customFontStyle';
          const styleEl = document.createElement('style');
          styleEl.id = styleId;
          const fontUrl = chrome.runtime.getURL("fonts/" + fontFile);
          styleEl.textContent = `
            @font-face {
              font-family: "MyCustomFont";
              src: url("${fontUrl}") format("truetype");
              font-weight: normal;
              font-style: normal;
            }
            body, * {
              font-family: "MyCustomFont", sans-serif !important;
            }
          `;
          document.head.appendChild(styleEl);
        }

        function removeCustomFont() {
          const existing = document.getElementById('customFontStyle');
          if (existing) {
            existing.remove();
          }
        }

        // (9) useCustomFont, selectedFont 체크 후 적용
        if (data.useCustomFont && data.selectedFont && data.selectedFont !== "none") {
          applyCustomFont(data.selectedFont);
        } else {
          removeCustomFont();
        }
      })();
    }
  );

  // (10) 저장된 hideProfileImage 값에 따라 프로필 이미지 숨김 처리
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
