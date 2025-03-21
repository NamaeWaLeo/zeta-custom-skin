// skins/skin_lovegame.js
(function() {
    chrome.storage.sync.get(["selectedSkin", "selectedFontSize"], function(data) {
      // 선택된 스킨이 "skin_lovegame.js"가 아닐 경우 실행 중단
      if (data.selectedSkin !== "skin_lovegame.js") {
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
            /* --- LoveGame (미연시) Style --- */
  
            /* 전체 배경: 연한 핑크색 + 도트 느낌 내기 */
            body {
              background-color: #ffeaf1 !important; /* 전체 배경 연핑크 */
              background-image: radial-gradient(#ffdce7 2px, transparent 2px),
                                radial-gradient(#ffdce7 2px, transparent 2px);
              background-position: 0 0, 15px 15px;
              background-size: 30px 30px;
            }
  
            /* nav(상단바) 영역: 텍스트는 좀 더 진한 핑크/보라 계열 */
            nav, nav * {
              color: #a04474 !important;
            }
            nav .title16.text-white {
              color: #a04474 !important;
            }
            .bg-gray-main {
              background-color: #ffeaf1 !important;
            }
  
            /* 발신 메시지(사용자): 파스텔 핑크 톤 + 말풍선 */
            .bg-primary-300 {
              background-color: #ffcce0 !important; /* 파스텔 핑크 */
              border: 1px solid #ff99c8 !important;
              border-radius: 16px !important;
              padding: 10px 14px !important;
              box-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
              max-width: 120%; /* 좀 더 넓게 (원하시면 70%등으로 조정 가능) */
              align-self: flex-end;
            }
            .bg-primary-300 * {
              color: #6f0049 !important;
              font-size: ${fs}px !important;
              line-height: 1.5 !important;
            }
            .bg-primary-300 em {
              color: #ad006e !important;
              font-style: italic !important;
            }
  
            /* 수신 메시지(캐릭터): 파스텔 보라 톤 */
            .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 {
              background-color: #d9c2ff !important; /* 파스텔 보라 */
              border: 1px solid #b29be6 !important;
              border-radius: 16px !important;
              padding: 10px 14px !important;
              box-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
              max-width: 120%; /* 좀 더 넓게 */
              align-self: flex-start;
            }
            .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 * {
              color: #401e5c !important;
              font-size: ${fs}px !important;
              line-height: 1.5 !important;
            }
            .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 em {
              color: #6c3688 !important;
              font-style: italic !important;
            }
  
            /* 메시지 입력 영역: 연핑크 톤 */
            div.flex.flex-1.flex-row.items-center.gap-1.rounded-\\[20px\\].bg-\\[rgba\\(62,62,65,0\\.90\\)\\].px-1\\.5 {
              background-color: #ffd6e6 !important;
              border: 1px solid #ffbcd9 !important;
              border-radius: 20px !important;
              padding: 8px 10px !important;
            }
  
            /* 보내기 버튼: 파스텔 보라 → 호버 시 진해짐, 내부 svg는 하얀색 */
            button.bg-primary-400 {
              background-color: #bda0ff !important;
              border: none !important;
              border-radius: 8px !important;
              padding: 6px 10px !important;
            }
            button.bg-primary-400:hover,
            button.bg-primary-400:active {
              background-color: #a78ff6 !important;
            }
            button.bg-primary-400 svg {
              color: #ffffff !important;
            }
  
            /* textarea placeholder */
            textarea[name="message"]::placeholder {
              color:rgb(234, 168, 205) !important;
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
  