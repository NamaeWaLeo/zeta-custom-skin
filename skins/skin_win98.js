(function() {
  chrome.storage.sync.get(["selectedSkin", "selectedFontSize"], function(data) {
    // 선택된 스킨이 "skin_win98.js"가 아닐 경우 실행 중단
    if (data.selectedSkin !== "skin_win98.js") {
      return;
    }

    (function() {
      // Windows 98 느낌의 스킨 닉네임
      const skinNickname = "Windows 98 Classic Style";
      const STYLE_ID = 'skinStyle';
      const fs = data.selectedFontSize || 14;

      // 스타일 태그를 삽입하는 함수
      function injectStyle(root) {
        if (!root) return;
        const existing = root.getElementById(STYLE_ID);
        if (existing) return; // 이미 존재하면 재삽입하지 않음

        const styleEl = document.createElement('style');
        styleEl.id = STYLE_ID;

        /* 
         * Windows 98 테마 컬러:
         *  - 전체 배경: 회색(#C0C0C0)
         *  - 제목 표시줄: 짙은 남색(또는 #000080) 
         *  - 버튼/창 테두리: 3D 입체감 (outset/inset) 
         *  - 메시지 배경: 연한 회색
         *  - 폰트: 작은 크기의 Sans-serif (Tahoma, MS Sans Serif 등)
         */
        styleEl.textContent = `
          /* --- Windows 98 Classic Style --- */

          /* 전체 배경: Windows 98 기본 그레이 */
          body {
            background-color: #C0C0C0 !important;
          }

          /* 상단 nav: Windows 98 제목 표시줄 느낌 (짙은 남색) */
          nav, nav * {
            color: #FFFFFF !important;
          }
          nav .title16.text-white {
            color: #FFFFFF !important;
          }
          .bg-gray-main {
            background-color: #000080 !important; /* Win98 제목 표시줄 */
            border-bottom: 2px solid #000060 !important;
          }

          /* 발신 메시지 (보내는 메시지) */
          .bg-primary-300 {
            /* Win98 창 내부 배경 느낌의 연회색, 약간 3D 테두리 */
            background-color: #E4E4E4 !important;
            border: 2px solid #B0B0B0 !important; 
            border-radius: 4px !important;
            padding: 8px 10px !important;
            box-shadow: 1px 1px 0px #FFFFFF, -1px -1px 0px #808080 !important; 
          }
          .bg-primary-300 * {
            color: #000000 !important;
            font-size: ${fs}px !important;
            line-height: 1.4 !important;
          }
          .bg-primary-300 em {
            color: #666666 !important;
            font-style: italic !important;
          }

          /* 수신 메시지 (받는 메시지) */
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 {
            background-color: #DDDDDD !important;
            border: 2px solid #B0B0B0 !important; 
            border-radius: 4px !important;
            padding: 8px 10px !important;
            box-shadow: 1px 1px 0px #FFFFFF, -1px -1px 0px #808080 !important;
          }
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 * {
            color: #000000 !important;
            font-size: ${fs}px !important;
            line-height: 1.4 !important;
          }
          .rounded-r-xl.rounded-bl-xl.bg-gray-sub1 em {
            color: #666666 !important;
            font-style: italic !important;
          }

          /* 메시지 입력 영역 컨테이너: Win98의 기본 회색 창 느낌 */
          div.flex.flex-1.flex-row.items-center.gap-1.rounded-\\[20px\\].bg-\\[rgba\\(62,62,65,0\\.90\\)\\].px-1\\.5 {
            background-color: #C0C0C0 !important;
            border: 2px solid #B0B0B0 !important;
            border-radius: 4px !important;
            padding: 6px 8px !important;
            box-shadow: inset 1px 1px 0px #FFFFFF, inset -1px -1px 0px #808080 !important;
          }

          /* 버튼: Windows 98의 3D 버튼 스타일 */
          button.bg-primary-400 {
            background-color: #C0C0C0 !important;
            border: 2px outset #FFF !important;
            border-radius: 3px !important;
            padding: 4px 8px !important;
            color: #000000 !important;
            box-shadow: none !important; /* 아웃셋 효과로 3D 느낌 */
          }
          button.bg-primary-400:hover {
            filter: brightness(0.95);
          }
          button.bg-primary-400:active {
            border: 2px inset #FFF !important; /* 눌렀을 때 3D 반전 */
            filter: brightness(0.9);
          }
          button.bg-primary-400 svg {
            color: #000000 !important; /* 아이콘 검정색 */
          }

          /* textarea placeholder */
          textarea[name="message"]::placeholder {
            color: #808080 !important;
            font-style: italic !important;
          }

          /* 애니메이션 (옵션): 발신 메시지 슬라이드 인 */
          .slide-in {
            animation: slideIn98 0.4s forwards;
          }
          @keyframes slideIn98 {
            from {
              transform: translateX(80%);
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

      // 지정한 root와 내부 Shadow DOM에도 스타일 적용 함수
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

      // setInterval: 0.5초마다 스타일 태그 존재 여부 확인
      setInterval(() => {
        if (!document.getElementById(STYLE_ID)) {
          applyStyles(document);
        }
      }, 500);

      // 발신 메시지에만 슬라이드 애니메이션 적용 (옵션)
      function animateLatestSentBubble() {
        const bubbles = document.querySelectorAll('.bg-primary-300');
        if (bubbles.length) {
          const lastBubble = bubbles[bubbles.length - 1];
          if (!lastBubble.classList.contains('slide-in')) {
            lastBubble.classList.add('slide-in');
            setTimeout(() => {
              lastBubble.classList.remove('slide-in');
            }, 400);
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
