(function() {
    chrome.storage.sync.get(["selectedSkin", "selectedFontSize"], function(data) {
      // 선택된 스킨이 "skin_gpt.js"가 아닐 경우 실행 중단
      if (data.selectedSkin !== "skin_gpt.js") {
        return;
      }
      
      (function() {
        const STYLE_ID = 'skinStyle';
        const fs = data.selectedFontSize || 14;
        
        // 스타일 태그를 삽입하는 함수 (모든 root 및 Shadow DOM에 적용)
        function injectStyle(root) {
          if (!root) return;
          const existing = root.getElementById(STYLE_ID);
          if (existing) return; // 이미 존재하면 재삽입하지 않음
          
          const styleEl = document.createElement('style');
          styleEl.id = STYLE_ID;
          styleEl.textContent = `
            /* --- Dark Mode ChatGPT-like Style --- */
            
            /* 전체 배경 및 기본 폰트 설정 */
            body {
              background-color: #1A1A1A !important;
            }
            
            /* 내비게이션 영역: 텍스트는 연한 회색 */
            nav, nav * {
              color: #E5E5E5 !important;
            }
            nav .title16.text-white {
              color: #E5E5E5 !important;
            }
            .bg-gray-main {
              background-color: #2A2A2A !important;
            }
            
            /* 발신 메시지 (사용자 메시지): 오른쪽 정렬, 파란색 계열 */
            .bg-primary-300 {
              background-color: #007AFF !important;
              border: none !important;
              border-radius: 16px !important;
              padding: 12px 16px !important;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
              max-width: 120%;
              align-self: flex-end;
            }
            .bg-primary-300 * {
              color: #FFFFFF !important;
              font-size: ${fs}px !important;
              line-height: 1.5 !important;
            }
            .bg-primary-300 em {
              color: #A1CFFF !important;
              font-style: italic !important;
            }
            
            /* 수신 메시지 (어시스턴트 메시지): 왼쪽 정렬, 다크 그레이 배경 */
            .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 {
              background-color: #333333 !important;
              border: none !important;
              border-radius: 16px !important;
              padding: 12px 16px !important;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
              max-width: 120%;
              align-self: flex-start;
            }
            .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 * {
              color: #E5E5E5 !important;
              font-size: ${fs}px !important;
              line-height: 1.5 !important;
            }
            .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 em {
              color: #B3B3B3 !important;
              font-style: italic !important;
            }
            
            /* 메시지 입력 영역: 어두운 회색 입력창 */
            div.flex.flex-1.flex-row.items-center.gap-1.rounded-\\[20px\\].bg-\\[rgba\\(62,62,65,0\\.90\\)\\].px-1\\.5 {
              background-color: #2A2A2A !important;
              border: 1px solid #444444 !important;
              border-radius: 20px !important;
              padding: 10px 14px !important;
            }
            
            /* 보내기 버튼: 흰색 배경, 내부 svg는 검은색 */
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
            
            /* textarea placeholder */
            textarea[name="message"]::placeholder {
              color: #AAAAAA !important;
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
            
            /* 애니메이션: slide-in 효과 (오른쪽에서 슬라이드 인) */
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
        
        // MutationObserver로 동적 추가 요소에 스타일 적용
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
  })();
  