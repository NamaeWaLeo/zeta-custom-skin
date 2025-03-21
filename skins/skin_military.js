// skins/skin_military_khaki.js
(function() {
  chrome.storage.sync.get(["selectedSkin", "selectedFontSize"], function(data) {
    // 선택된 스킨이 "skin_military_khaki.js"가 아닐 경우 실행 중단
    if (data.selectedSkin !== "skin_military.js") {
      return;
    }

    (function() {
      const STYLE_ID = 'skinStyle';
      const fs = data.selectedFontSize || 14;

      // 스타일 태그 삽입 함수
      function injectStyle(root) {
        if (!root) return;
        const existing = root.getElementById(STYLE_ID);
        if (existing) return; // 이미 존재하면 재삽입하지 않음

        const styleEl = document.createElement('style');
        styleEl.id = STYLE_ID;
        styleEl.textContent = `
          /* --- Military Style (Khaki version) --- */

          /* 전체 배경: 카키색 */
          body {
            background-color: #4D5A40 !important; /* 짙은 카키 느낌 */
          }

          /* nav(상단바) 영역: 텍스트는 좀 더 밝은 카키 계열 or 흰색 계열 */
          nav, nav * {
            color: #F0EBD3 !important; /* 밝은 카키/베이지 계열 */
          }
          nav .title16.text-white {
            color: #F0EBD3 !important;
          }
          .bg-gray-main {
            background-color: #4D5A40 !important; /* 좀 더 진한 카키색 */
          }

          /* 발신 메시지 (사용자): 회색-카키 배경 + 주황 보더, width: 120% */
          .bg-primary-300 {
            background-color: #8A8052 !important; /* 약간 어두운 카키 톤 */
            border: 2px solid #E97F2D !important; /* 주황색 보더 */
            border-radius: 8px !important;
            padding: 10px 14px !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
            max-width: 120% !important;
            align-self: flex-end;
          }
          .bg-primary-300 * {
            color: #F5F3E7 !important;
            font-size: ${fs}px !important;
            line-height: 1.4 !important;
          }
          .bg-primary-300 em {
            color: #FFEAC7 !important;
            font-style: italic !important;
          }

          /* 수신 메시지 (캐릭터): 밝은 카키 배경 + 빨간색 보더 */
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 {
            background-color:rgb(112, 104, 77) !important; /* 밝은 카키 톤 */
            border: 2px solid #D8483E !important; /* 빨간색 보더 */
            border-radius: 8px !important;
            padding: 10px 14px !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
            max-width: 120% !important;
            align-self: flex-start;
          }
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 * {
            color: #FDFBE9 !important;
            font-size: ${fs}px !important;
            line-height: 1.4 !important;
          }
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 em {
            color: #FFECC2 !important;
            font-style: italic !important;
          }

          /* 메시지 입력 영역: 짙은 카키 + 검정 보더 */
          div.flex.flex-1.flex-row.items-center.gap-1.rounded-\\[20px\\].bg-\\[rgba\\(62,62,65,0\\.90\\)\\].px-1\\.5 {
            background-color: #69603F !important;
            border: 2px solid #000000 !important; /* 검정색 보더 */
            border-radius: 8px !important;
            padding: 8px 10px !important;
          }

          /* 보내기 버튼: 주황색 배경 + 내부 svg는 검정색 */
          button.bg-primary-400 {
            background-color: #E97F2D !important; /* 주황색 */
            border: none !important;
            border-radius: 4px !important;
            padding: 6px 10px !important;
          }
          button.bg-primary-400:hover,
          button.bg-primary-400:active {
            background-color: #D96914 !important; /* 더 어두운 주황 */
          }
          button.bg-primary-400 svg {
            color: #000000 !important; /* 검정색 아이콘 */
          }

          /* textarea placeholder */
          textarea[name="message"]::placeholder {
            color: #F6ECCB !important;
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

          /* 발신 메시지 애니메이션: slide-in 효과 (오른쪽에서 슬라이드 인) */
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
        (root.head || document.documentElement).appendChild(styleEl);
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

      // 초기 적용
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

      // 마지막 발신 버블에만 slide-in 애니메이션 적용
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
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              node.classList.contains('bg-primary-300')
            ) {
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
