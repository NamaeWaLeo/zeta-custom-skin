(function() {
    chrome.storage.sync.get(["selectedSkin", "selectedFontSize"], function(data) {
      // 선택된 스킨이 "skin_telnet.js"가 아닐 경우 실행 중단
      if (data.selectedSkin !== "skin_telnet.js") {
        return;
      }
      
      (function() {
        const STYLE_ID = 'skinStyle';
        const fs = data.selectedFontSize || 14;
        
        // 모든 root(문서 및 Shadow DOM)에 스타일 태그를 삽입하는 함수
        function injectStyle(root) {
          if (!root) return;
          const existing = root.getElementById(STYLE_ID);
          if (existing) return;
          
          const styleEl = document.createElement('style');
          styleEl.id = STYLE_ID;
          styleEl.textContent = `
            /* --- Telnet/CLI Style --- */
            
            /* 전체 배경: 선명한 파란색, CLI 폰트 설정 */
            body {
              background-color: #0000FF !important; /* 파란색 배경 */
              color:rgb(0, 160, 0) !important; /* 녹색 텍스트 */
            }
            
            /* 내비게이션 영역: 모든 텍스트 녹색으로 */
            nav, nav * {
              color: #00FF00 !important;
            }rgb(0, 144, 0)
            nav .title16.text-white {
              color:rgb(0, 155, 0) !important;
            }
            .bg-gray-main {
              background-color:rgb(0, 0, 145) !important; /* 어두운 파란색 느낌 */
            }
            
            /* 발신 메시지 (사용자 메시지) */
            .bg-primary-300 {
              background-color: rgb(36, 74, 181) !important;
              border: 1px solidrgb(0, 178, 0) !important;
              border-radius: 0 !important;
              padding: 8px 10px !important;
              max-width: 120%;
              align-self: flex-end;
            }
            .bg-primary-300 * {
              color:rgb(207, 207, 207) !important;
              font-size: ${fs}px !important;
              line-height: 1.5 !important;
            }
            .bg-primary-300 em {
              color: #99FF99 !important;
              font-style: italic !important;
            }
            
            /* 수신 메시지 (어시스턴트 메시지) */
            .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 {
              background-color: transparent !important;
              border: 1px solid #00FF00 !important;
              border-radius: 0 !important;
              padding: 8px 10px !important;
              max-width: 120%;
              align-self: flex-start;
            }
            .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 * {
              color: #00FF00 !important;
              font-size: ${fs}px !important;
              line-height: 1.5 !important;
            }
            .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 em {
              color: #99FF99 !important;
              font-style: italic !important;
            }
            
            /* 메시지 입력 영역: 어두운 파란색 입력창 */
            div.flex.flex-1.flex-row.items-center.gap-1.rounded-\\[20px\\].bg-\\[rgba\\(62,62,65,0\\.90\\)\\].px-1\\.5 {
              background-color:rgb(0, 0, 159) !important;
              border: 1px solid #00FF00 !important;
              border-radius: 0 !important;
              padding: 8px 10px !important;
            }
            
            /* 보내기 버튼: 흰색 배경, 내부 svg는 검은색 */
            button.bg-primary-400 {
              background-color: #FFFFFF !important;
              border: none !important;
              border-radius: 4px !important;
              padding: 8px 12px !important;
            }
            button.bg-primary-400:hover,
            button.bg-primary-400:active {
              background-color: #F0F0F0 !important;
            }
            button.bg-primary-400 svg {
              color: #000000 !important;
            }
            
            /* textarea placeholder */
            textarea[name="message"]::placeholder {
              color: #CCCCCC !important;
              font-style: italic !important;
            }
            
            /* 채팅 헤더 및 메시지 영역 레이아웃 */
            .chat-header {
              display: flex !important;
              align-items: center !important;
              gap: 12px !important;
              margin-bottom: 16px !important;
            }
            .chat-message {
              margin-top: 12px !important;
            }
            
            /* 애니메이션: 오른쪽에서 슬라이드 인 */
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
          `;
          (root.head || root.documentElement).appendChild(styleEl);
        }
        
        // 모든 root 및 Shadow DOM에 스타일 적용
        function applyStyles(root) {
          injectStyle(root);
          root.querySelectorAll('*').forEach(el => {
            if (el.shadowRoot) {
              injectStyle(el.shadowRoot);
            }
          });
        }
        
        applyStyles(document);
        
        // MutationObserver: 동적으로 추가되는 요소에도 스타일 적용
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
        
        // 0.5초마다 스타일 태그 존재 여부 확인 후 재삽입
        setInterval(() => {
          if (!document.getElementById(STYLE_ID)) {
            injectStyle(document);
          }
        }, 500);
        
        // 발신 메시지 중 마지막 버블에만 slide-in 애니메이션 적용
        function animateLatestSentBubble() {
          const bubbles = document.querySelectorAll('.bg-primary-300');
          if (bubbles.length) {
            const lastBubble = bubbles[bubbles.length - 1];
            if (!lastBubble.classList.contains('slide-in')) {
              lastBubble.classList.add('slide-in');
              setTimeout(() => {
                lastBubble.classList.remove('slide-in');
              }, 500);
            }
          }
        }
        
        const bubbleObserver = new MutationObserver(mutations => {
          mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('bg-primary-300')) {
                setTimeout(animateLatestSentBubble, 50);
              }
            });
          });
        });
        bubbleObserver.observe(document.body, { childList: true, subtree: true });
        
        // 프로필 이미지 숨김 처리 (hideProfileImage 설정에 따라)
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
  