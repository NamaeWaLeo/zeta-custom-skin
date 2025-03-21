(function() {
    chrome.storage.sync.get(["selectedSkin", "selectedFontSize"], function(data) {
      // 선택된 스킨이 "skin_instagramDM.js"가 아닐 경우 실행 중단
      if (data.selectedSkin !== "skin_insta.js") {
        return;
      }
    
      (function() {
        const STYLE_ID = 'skinStyle';
        const fs = data.selectedFontSize || 14;
    
        // 스타일 태그를 삽입하는 함수 (애니메이션 CSS 포함)
        function injectStyle(root) {
          if (!root) return;
          const existing = root.getElementById(STYLE_ID);
          if (existing) return; // 이미 존재하면 재삽입하지 않음
    
          const styleEl = document.createElement('style');
          styleEl.id = STYLE_ID;
          styleEl.textContent = `
            /* --- Instagram DM Style --- */
    
            /* 발신 메시지 (보내는 메시지): 보라색→파란색 그라데이션 배경 */
            .bg-primary-300 {
              background-image: linear-gradient(90deg, #9D00FF, #0095F6) !important;
              border: 1px solid #DBDBDB !important;
              border-radius: 16px !important;
              padding: 10px 14px !important;
              box-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
            }
            .bg-primary-300 * {
              color: #FEFEFE !important;
              font-size: ${fs}px !important;
              line-height: 1.4 !important;
            }
            .bg-primary-300 em {
              color: #8E8E8E !important;
              font-style: italic;
            }
    
            /* 수신 메시지 (받는 메시지): 옅은 회색 배경 */
            .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 {
              background-color: #F2F2F2 !important;
              border: 1px solid #DBDBDB !important;
              border-radius: 16px !important;
              padding: 10px 14px !important;
              box-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
            }
            .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 * {
              color: #262626 !important;
              font-size: ${fs}px !important;
              line-height: 1.4 !important;
            }
            .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 em {
              color: #8E8E8E !important;
              font-style: italic;
            }
    
            /* 전체 배경과 nav 영역 */
            body {
              background-color: #FAFAFA !important;
            }
            nav, nav * {
              color: #262626 !important;
            }
            nav .title16.text-white {
              color: #262626 !important;
            }
            .bg-gray-main {
              background-color: #FFFFFF !important;
            }
    
            /* 메시지 입력 영역 컨테이너 */
            div.flex.flex-1.flex-row.items-center.gap-1.rounded-\\[20px\\].bg-\\[rgba\\(62,62,65,0\\.90\\)\\].px-1\\.5 {
              background-color: #FFFFFF !important;
              border: 1px solid #DBDBDB !important;
              border-radius: 20px !important;
              padding: 8px 10px !important;
            }
    
            /* 버튼: 인스타그램 DM 느낌의 파란색 버튼 */
            button.bg-primary-400 {
              background-color: #0095F6 !important;
              border: none !important;
              border-radius: 8px !important;
              padding: 6px 10px !important;
            }
            button.bg-primary-400:hover,
            button.bg-primary-400:active {
              background-color: #007AC1 !important;
            }
            button.bg-primary-400 svg {
              color: #FFFFFF !important;
            }
    
            /* textarea placeholder */
            textarea[name="message"]::placeholder {
              color: #999999 !important;
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
    
        // 지정한 root와 내부의 모든 Shadow DOM에 스타일 적용 함수
        function applyStyles(root) {
          injectStyle(root);
          root.querySelectorAll('*').forEach(el => {
            if (el.shadowRoot) {
              injectStyle(el.shadowRoot);
            }
          });
        }
    
        // 최초 적용: 메인 문서에 적용
        applyStyles(document);
    
        // MutationObserver: 동적으로 추가되는 요소(및 Shadow DOM)에 스타일 적용
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
    
        // 발신 메시지 중 맨 아래에 있는 버블에만 슬라이드 애니메이션 적용
        function animateLatestSentBubble() {
          // 모든 발신 버블을 선택 (.bg-primary-300)
          const bubbles = document.querySelectorAll('.bg-primary-300');
          if (bubbles.length) {
            const lastBubble = bubbles[bubbles.length - 1];
            // 이미 애니메이션 적용된 경우 건너뛰기
            if (!lastBubble.classList.contains('slide-in')) {
              lastBubble.classList.add('slide-in');
              // 애니메이션이 끝나면 클래스 제거 (0.5초 후)
              setTimeout(() => {
                lastBubble.classList.remove('slide-in');
              }, 500);
            }
          }
        }
    
        // 새 발신 버블이 추가될 때 animateLatestSentBubble 호출
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
    
      })();
    });
  })();
  