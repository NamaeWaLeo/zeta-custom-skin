(function () {
  // (1) 스토리지에서 스킨/폰트/설정 불러오기
  chrome.storage.sync.get(
    [
      "selectedSkin",
      "selectedFontSize",
      "useCustomFont",
      "selectedFont",
      "hideProfileImage",
    ],
    function (d) {
      // (2) 선택된 스킨이 "skin_insta.js"가 아니면 실행 중단
      if (d.selectedSkin !== "skin_insta.js") return;

      // fs가 문자열일 수 있으므로 parseInt 변환
      const fs = parseInt(d.selectedFontSize || 14, 10);

      (function () {
        const STYLE_ID = "skinStyle";

        // (3) 스타일 태그 삽입 함수
        function injectStyle(root) {
          if (!root || root.getElementById(STYLE_ID)) return;

          const styleEl = document.createElement("style");
          styleEl.id = STYLE_ID;
          styleEl.textContent = `
/* ======================================
   Instagram DM Dark Mode Style
   (skin_insta.js)
   ====================================== */

/* 배경: 인스타 다크 모드 느낌 (#121212 ~ #1E1E1E) */
body,
nav,
.bg-gray-main {
  background: linear-gradient(180deg, #121212, #1E1E1E) !important;
}

/* 발신 메시지 (.bg-primary-300):
   인스타 DM처럼 그라데이션(보라→파랑)을 살짝 어둡게 */
.bg-primary-300 {
  background: linear-gradient(90deg, #6F00FB, #005CEA) !important;
  border-radius: 16px !important;
  margin: 4px 0 !important;
  padding: 8px 12px !important;
  box-shadow: 0 2px 3px rgba(0,0,0,0.3) !important;
}
.bg-primary-300 * {
  color: #FEFEFE !important;
  font-size: ${fs}px !important;
  line-height: 1.4 !important;
}

/* 수신 메시지 (.bg-gray-sub1):
   인스타 DM 다크 모드에서 상대방 메시지: 옅은 어두운 회색 */
.rounded-r-xl.rounded-bl-xl.bg-gray-sub1 {
  background-color: #2F2F2F !important;
  border-radius: 16px !important;
  margin: 4px 0 !important;
  padding: 8px 12px !important;
  box-shadow: 0 2px 3px rgba(0,0,0,0.3) !important;
}
.rounded-r-xl.rounded-bl-xl.bg-gray-sub1 * {
  color: #E0E0E0 !important;
  font-size: ${fs}px !important;
  line-height: 1.4 !important;
}

/* 전송 버튼 (.bg-primary-400):
   인스타의 파랑/보라 계열을 더 어둡게 */
button.bg-primary-400 {
  background-color: #2E5FED !important;
  border: none !important;
  border-radius: 8px !important;
  padding: 6px 10px !important;
}
button.bg-primary-400:hover,
button.bg-primary-400:active {
  background-color: #224BBE !important;
}
button.bg-primary-400 svg {
  color: #FFFFFF !important;
}

/* 카드 느낌:
   중앙 정렬된 다크 톤 박스 */
div.flex.w-full.min-w-0.flex-col > div.relative.flex.flex-col[draggable="false"] {
  background-color: #2A2A2A !important;
  border-radius: 12px !important;
  margin: 10px auto !important;
  width: 90% !important;
  text-align: left !important;
  padding: 12px !important;
  box-shadow: 0 2px 6px rgba(0,0,0,0.4) !important;
}
div.flex.w-full.min-w-0.flex-col > div.relative.flex.flex-col[draggable="false"] * {
  color: #EFEFEF !important;
}

/* 특정 버튼 숨김 
   (class="flex w-[72px] flex-col items-center justify-center gap-2.5") */
.flex.w-\\[72px\\].flex-col.items-center.justify-center.gap-2\\.5 {
  display: none !important;
}

/* span.body14.text-gray-50 => 조금 더 밝게 */
span.body14.text-gray-50 {
  font-weight: bold !important;
  color: #FFFFFF !important;
}

/* text-white/50 => 회색 톤 */
.break-all.text-white em[class*="text-white\\/50"],
.body16.text-white em[class*="text-white\\/50"],
em[class*="text-white\\/50"] {
  color: rgb(160,160,160) !important;
}
          `;
          (root.head || root.documentElement).appendChild(styleEl);
        }

        // (4) root + shadowDOM에 스타일 적용
        function applyAll(root) {
          injectStyle(root);
          root.querySelectorAll("*").forEach((el) => {
            if (el.shadowRoot) injectStyle(el.shadowRoot);
          });
        }

        // (5) 문서 전체 적용
        applyAll(document);

        // (6) MutationObserver - 동적 요소도 스타일 유지
        new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) {
                if (node.shadowRoot) injectStyle(node.shadowRoot);
                node.querySelectorAll("*").forEach((c) => {
                  if (c.shadowRoot) injectStyle(c.shadowRoot);
                });
              }
            });
          });
        }).observe(document.body, { childList: true, subtree: true });

        // (7) 일정 간격으로 스타일 태그 재확인
        setInterval(() => {
          if (!document.getElementById(STYLE_ID)) {
            applyAll(document);
          }
        }, 500);

        // (8) 커스텀 폰트 로직 (skin_cocoa.js와 동일)
        function applyFont(f) {
          removeFont();
          const s = document.createElement("style");
          s.id = "customFontStyle";
          const fontUrl = chrome.runtime.getURL("fonts/" + f);
          s.textContent = `
@font-face {
  font-family: "MyCustomFont";
  src: url("${fontUrl}") format("truetype");
}
body, * {
  font-family: "MyCustomFont", sans-serif !important;
}
          `;
          document.head.appendChild(s);
        }

        function removeFont() {
          const ex = document.getElementById("customFontStyle");
          if (ex) ex.remove();
        }

        // (8)-b 선택적 커스텀 폰트 적용
        if (d.useCustomFont && d.selectedFont && d.selectedFont !== "none") {
          applyFont(d.selectedFont);
        } else {
          removeFont();
        }
      })();

      // (9) hideProfileImage 처리
      if (d.hideProfileImage) {
        let st = document.getElementById("hideProfileImageStyle");
        if (!st) {
          st = document.createElement("style");
          st.id = "hideProfileImageStyle";
          st.textContent = `
a[href*="/ko/characters/"] img[alt="캐릭터 프로필 이미지"] {
  display: none !important;
}
          `;
          (document.head || document.documentElement).appendChild(st);
        }
      } else {
        let st = document.getElementById("hideProfileImageStyle");
        if (st) st.remove();
      }
    }
  );
})();
