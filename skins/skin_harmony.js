(function() {
    chrome.storage.sync.get(["selectedSkin", "selectedFontSize"], (data) => {
      // 선택된 스킨이 "skin_harmony.js"가 아닐 경우 실행 중단
      if (data.selectedSkin !== "skin_harmony.js") return;
      
      // 폰트 크기, 기본값 14px
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
    
            /* 채팅 버블 기본 스타일: 말풍선 효과 제거, 투명 배경, 평면적 레이아웃 */
            .bg-primary-300,
            .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 {
              background-color: transparent !important;
              border: none !important;
              box-shadow: none !important;
              padding: 4px 8px !important;
              border-radius: 0 !important;
            }
            .bg-primary-300 * ,
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
              background-color: #2F3136 !important;
            }
            nav, nav * {
              color: #FFFFFF !important;
            }
            nav .title16.text-white {
              color: #FFFFFF !important;
            }
            .bg-gray-main {
              background-color: #36393F !important;
            }
    
            /* 메시지 입력 영역 컨테이너 스타일 */
            div.flex.flex-1.flex-row.items-center.gap-1.rounded-\\[20px\\].bg-\\[rgba\\(62,62,65,0\\.90\\)\\].px-1\\.5 {
              background-color: #202225 !important;
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
    
            /* --- 채팅 헤더 및 메시지 영역 레이아웃 --- */
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
  