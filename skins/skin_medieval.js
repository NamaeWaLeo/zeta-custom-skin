(function() {
    chrome.storage.sync.get(["selectedSkin", "selectedFontSize"], function(data) {
      // 선택된 스킨이 "skin_medieval.js"가 아닐 경우 실행 중단
      if (data.selectedSkin !== "skin_medieval.js") {
        return;
      }
    
      // 폰트 크기, 기본값 14px
      const fs = data.selectedFontSize || 14;
    
      (function() {
        const STYLE_ID = 'medievalSkinStyle';
    
        // 지정한 root(문서 또는 shadowRoot)에 스타일 태그를 삽입하는 함수
        function injectStyle(root) {
          if (!root) return;
          const existing = root.getElementById(STYLE_ID);
          if (existing) return; // 이미 있으면 재삽입하지 않음
    
          const styleEl = document.createElement('style');
          styleEl.id = STYLE_ID;
          styleEl.textContent = `
            /* --- Medieval Theme --- */
    
            /* 전체 배경: 파치먼트 느낌의 연한 베이지 */
            body {
              background-color: #F8F4E3 !important;
            }
    
            /* 채팅 버블: 종이 느낌 배경과 금빛 테두리 */
            .bg-primary-300,
            .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 {
              background-color: #EDE2D9 !important;
              border: 2px solid #D4AF37 !important;
              border-radius: 6px !important;
              padding: 8px 12px !important;
              box-shadow: 0 2px 4px rgba(212,175,55,0.5) !important;
            }
            .bg-primary-300 * ,
            .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 * {
              color: #3E2723 !important;
              font-size: ${fs}px !important;
              line-height: 1.5 !important;
            }
            .bg-primary-300 em,
            .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 em {
              color: #795548 !important;
              font-style: italic;
            }
    
            /* nav 영역: 텍스트를 밝은 베이지 (#F8EBD7)로 */
            nav, nav * {
              color: #F8EBD7 !important;
            }
            nav .title16.text-white {
              color: #F8EBD7 !important;
            }
    
            /* .bg-gray-main: 중후한 다크 브라운 (#4E342E) */
            .bg-gray-main {
              background-color: #4E342E !important;
            }
    
            /* 메시지 입력 영역 컨테이너: 종이 느낌 배경과 금빛 테두리 */
            div.flex.flex-1.flex-row.items-center.gap-1.rounded-\\[20px\\].bg-\\[rgba\\(62,62,65,0\\.90\\)\\].px-1\\.5 {
              background-color: #EDE2D9 !important;
              border: 2px solid #D4AF37 !important;
              border-radius: 4px !important;
              padding: 6px 8px !important;
            }
    
            /* 버튼: 중세 느낌의 금빛 버튼 */
            button.bg-primary-400 {
              background-color: #D4AF37 !important;
              border: none !important;
              border-radius: 4px !important;
              padding: 6px 8px !important;
            }
            button.bg-primary-400:hover,
            button.bg-primary-400:active {
              background-color: #BFA06A !important;
            }
            button.bg-primary-400 svg {
              color: #FFFFFF !important;
            }
    
            /* textarea placeholder */
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
    
        // 지정한 root와 내부의 모든 Shadow DOM에도 스타일 적용하는 함수
        function applyStyles(root) {
          injectStyle(root);
          root.querySelectorAll('*').forEach((el) => {
            if (el.shadowRoot) {
              injectStyle(el.shadowRoot);
            }
          });
        }
    
        // 초기 적용: 메인 문서에 적용
        applyStyles(document);
    
        // MutationObserver: document.head 내 스타일 태그가 제거되면 재삽입
        const headObserver = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.removedNodes.forEach((node) => {
              if (node.id === STYLE_ID) {
                injectStyle(document);
              }
            });
          });
        });
        headObserver.observe(document.head, { childList: true });
    
        // 일반 MutationObserver: 동적으로 추가되는 요소 및 Shadow DOM에 스타일 적용
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                injectStyle(node);
                node.querySelectorAll('*').forEach((child) => {
                  if (child.shadowRoot) {
                    injectStyle(child.shadowRoot);
                  }
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
  