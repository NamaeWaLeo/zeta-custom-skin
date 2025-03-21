(function() {
  chrome.storage.sync.get(["selectedSkin"], function(data) {
    // 선택된 스킨이 "skin_cocoa.js"가 아니라면 실행 중단
    if (data.selectedSkin !== "skin_cocoa.js") {
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
          /* bg-primary-300: 배경 노란색, 그림자 효과, 내부 텍스트 검정 */
          .bg-primary-300 {
            background-color: #FFEB33 !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
          }
          .bg-primary-300 * {
            color: black !important;
          }
  
          /* 둥근 말풍선 (rounded-r-xl, rounded-bl-xl, bg-gray-sub1):
             흰색 배경, 그림자 효과, 내부 텍스트 검정 */
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 {
            background-color: #FFFFFF !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
          }
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 * {
            color: black !important;
          }
          /* 둥근 말풍선 내부의 <em> 태그 중, 클래스에 "text-white/50"이 포함된 경우 회색 적용 */
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 em[class*="text-white/50"] {
            color: #B3B3B3 !important;
          }

          .rounded-l-xl.rounded-br-xl.bg-primary-300 em[class*="text-white/50"] {
            color: #B3B3B3 !important;
          }
  
          /* nav 내부 텍스트: 강제로 검정색 적용 */
          nav, nav * {
            color: #000000 !important;
          }
          nav .title16.text-white {
            color: #000000 !important;
          }
  
          /* .bg-gray-main: 배경 색을 #BACEE0으로 */
          .bg-gray-main {
            background-color: #BACEE0 !important;
          }
  
          /* 메시지 입력 영역 컨테이너:
             Tailwind 클래스: flex flex-1 flex-row items-center gap-1 rounded-[20px] bg-[rgba(62,62,65,0.90)] px-1.5
             강제 배경색: rgb(200,200,200) */
          div.flex.flex-1.flex-row.items-center.gap-1.rounded-\\[20px\\].bg-\\[rgba\\(62,62,65,0\\.90\\)\\].px-1\\.5 {
            background-color: rgb(200,200,200) !important;
          }
  
          /* 버튼 (bg-primary-400): 노란색→주황색 그라데이션, 내부 svg는 짙은 회색 */
          button.bg-primary-400 {
            background-image: linear-gradient(90deg, #FFEB33, #FFA500) !important;
            background-color: transparent !important;
          }
          button.bg-primary-400:hover,
          button.bg-primary-400:active {
            background-image: linear-gradient(90deg, #FFEB33, #FFA500) !important;
          }
          button.bg-primary-400 svg {
            color: #444444 !important;
          }
  
          /* textarea placeholder: 짙은 회색 이탤릭체 */
          textarea[name="message"]::placeholder {
            color: #444444 !important;
            font-style: italic !important;
          }
  
          /* 내부 텍스트에 사용자 지정 폰트 크기 적용 */
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
