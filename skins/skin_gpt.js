(function() {
  chrome.storage.sync.get(["selectedSkin"], function(data) {
    // 선택된 스킨이 "skin_cocoa.js"가 아니라면 실행 중단
    if (data.selectedSkin !== "skin_gpt.js") {
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
        if (existing) return; // 이미 있으면 재삽입하지 않음

        const styleEl = document.createElement('style');
        styleEl.id = STYLE_ID;
        styleEl.textContent = `
          /* --- GPT-Like Dark Mode with a bit more flair --- */

          /* (1) 발신 메시지 (사용자) 말풍선: 파란색 그라데이션, 둥근 모서리, 그림자 */
          .bg-primary-300 {
            background: linear-gradient(90deg, #005AE7, #007AFF) !important; 
            border: 1px solid #005AE7 !important;
            border-radius: 16px !important;
            padding: 12px 16px !important;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4) !important;
            max-width: 120%;
            align-self: flex-end;
            transition: all 0.2s ease; /* 조금 더 부드러운 느낌 */
          }
          .bg-primary-300 * {
            color: #FFFFFF !important; 
            font-size: ${fs}px !important;
            line-height: 1.5 !important;
          }

          /* (2) 수신 메시지 (어시스턴트) 말풍선: 다크 그레이 그라데이션, 둥근 모서리, 그림자 */
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 {
            background: linear-gradient(180deg, #2F2F2F, #3A3A3A) !important; 
            border: none !important;
            border-radius: 16px !important;
            padding: 12px 16px !important;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4) !important;
            max-width: 120%;
            align-self: flex-start;
            transition: all 0.2s ease;
          }
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 * {
            color: #E5E5E5 !important;
            font-size: ${fs}px !important;
            line-height: 1.5 !important;
          }
          /* 특정 em 태그 (text-white/50)에는 연한 회색 적용 */
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 em[class*="text-white/50"] {
            color: #B3B3B3 !important;
          }

          .rounded-l-xl.rounded-br-xl.bg-primary-300 em[class*="text-white/50"] {
            color: #B3B3B3 !important;
          }

          /* (3) 전체 배경: 완전한 다크 모드 */
          body {
            background-color: #1A1A1A !important;
          }

          /* (4) nav 내부 텍스트: 연한 회색으로 */
          nav, nav * {
            color: #E5E5E5 !important;
          }
          nav .title16.text-white {
            color: #E5E5E5 !important;
          }
          .bg-gray-main {
            background-color: #2A2A2A !important;
          }

          /* (5) 메시지 입력 영역: 약간 더 진한 회색, 테두리 */
          div.flex.flex-1.flex-row.items-center.gap-1.rounded-\\[20px\\].bg-\\[rgba\\(62,62,65,0\\.90\\)\\].px-1\\.5 {
            background-color: #2A2A2A !important;
            border: 1px solid #444444 !important;
            border-radius: 20px !important;
            padding: 10px 14px !important;
          }

          /* (6) 전송 버튼: 흰색 배경, 호버 시 살짝 밝아지는 효과 */
          button.bg-primary-400 {
            background-color: #FFFFFF !important;
            border: none !important;
            border-radius: 8px !important;
            padding: 8px 12px !important;
          }
          button.bg-primary-400:hover,
          button.bg-primary-400:active {
            background-color: #F0F0F0 !important;
          }
          button.bg-primary-400 svg {
            color: #000000 !important;
          }

          /* (7) textarea placeholder: 연한 회색, 이탤릭체 */
          textarea[name="message"]::placeholder {
            color: #AAAAAA !important;
            font-style: italic !important;
          }

          /* (8) slide-in 애니메이션: 오른쪽에서 부드럽게 등장 */
          .slide-in {
            animation: slideInRight 0.5s forwards;
          }
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          /* (9) 사용자 지정 폰트 크기 (fs) 적용 */
          .bg-primary-300 * ,
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 * {
            font-size: ${fs}px !important;
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
