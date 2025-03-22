(function () {
  chrome.storage.sync.get(
    [
      "selectedSkin",
      "selectedFontSize",
      "useCustomFont",
      "selectedFont",
      "hideProfileImage",
    ],
    function (d) {
      // (1) 스킨이 'skin_darkgpt.js'가 아니라면 실행 중단
      if (d.selectedSkin !== "skin_gpt.js") return;

      // (2) 폰트 크기: 문자열일 경우 parseInt로 변환
      const fs = parseInt(d.selectedFontSize || 14, 10);

      (function () {
        const STYLE_ID = "skinStyle";

        // (3) 스타일 태그 삽입 함수
        function injectStyle(root) {
          if (!root || root.getElementById(STYLE_ID)) return;

          const styleEl = document.createElement("style");
          styleEl.id = STYLE_ID;

          /* 
             색상톤 설명:
             - 전체 배경: #2e2e2e ~ #363636 그라데이션 (가벼운 음영 차)
             - 발신 버블 (.bg-primary-300): #484848 (짙은 회색)
             - 수신 버블 (.bg-gray-sub1): #3b3b3b (조금 더 어두운 회색)
             - 버튼 (.bg-primary-400): #555 → hover 시 #666
             - 카드 스타일: #404040
             - 텍스트: 약간 밝은 톤 (#ddd, #eee 등)
          */

          styleEl.textContent = `
/* ========================================
   DarkGPT Style (Desaturated, Gray Scale)
   ======================================== */

/* 전체 배경 (회색 그라데이션) */
body,
nav,
.bg-gray-main {
  background: linear-gradient(180deg, #2e2e2e, #363636) !important;
}

/* 발신 버블 (.bg-primary-300): 진한 회색 */
.bg-primary-300 {
  background-color: #484848 !important;
  border-radius: 8px !important;
  margin: 4px 0 !important;
  padding: 8px 12px !important;
}
.bg-primary-300 * {
  color: #dddddd !important;
  font-size: ${fs + 1}px !important;
  line-height: 1.4 !important;
}

/* 수신 버블 (.bg-gray-sub1): 더 어두운 회색 */
.rounded-r-xl.rounded-bl-xl.bg-gray-sub1 {
  background-color: #3b3b3b !important;
  border-radius: 8px !important;
  margin: 4px 0 !important;
  padding: 8px 12px !important;
}
.rounded-r-xl.rounded-bl-xl.bg-gray-sub1 * {
  color: #eeeeee !important;
  font-size: ${fs + 1}px !important;
  line-height: 1.4 !important;
}

/* 전송 버튼 (.bg-primary-400): 중간 톤의 회색 */
button.bg-primary-400 {
  background-color: #555555 !important;
  border: none !important;
  border-radius: 6px !important;
  padding: 6px 10px !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.25) !important;
}
button.bg-primary-400:hover,
button.bg-primary-400:active {
  background-color: #666666 !important;
}
button.bg-primary-400 svg {
  color: #ffffff !important;
}

/* 카드 스타일: 중앙 정렬된 옅은 회색 박스 */
div.flex.w-full.min-w-0.flex-col > div.relative.flex.flex-col[draggable="false"] {
  background-color: #404040 !important;
  border-radius: 10px !important;
  margin: 10px auto !important;
  width: 90% !important;
  text-align: left !important;
  padding: 12px !important;
  box-shadow: 0 2px 6px rgba(0,0,0,0.35) !important;
}
div.flex.w-full.min-w-0.flex-col > div.relative.flex.flex-col[draggable="false"] * {
  font-weight: bold !important;
  color: #cccccc !important;
}

/* 특정 버튼 숨김 */
.flex.w-\\[72px\\].flex-col.items-center.justify-center.gap-2\\.5 {
  display: none !important;
}

/* span.body14.text-gray-50: 약간 더 밝은 톤 */
span.body14.text-gray-50 {
  font-weight: bold !important;
  color: #f0f0f0 !important;
}

/* text-white/50 => 회색 톤 */
.break-all.text-white em[class*="text-white\\/50"],
.body16.text-white em[class*="text-white\\/50"],
em[class*="text-white\\/50"] {
  color: rgb(140,140,140) !important;
}
          `;
          (root.head || root.documentElement).appendChild(styleEl);
        }

        // (4) 지정 root + 내부 shadow DOM에 스타일 적용
        function applyAll(root) {
          injectStyle(root);
          root.querySelectorAll("*").forEach((el) => {
            if (el.shadowRoot) injectStyle(el.shadowRoot);
          });
        }

        // (5) 문서 전체에 스타일 적용
        applyAll(document);

        // (6) MutationObserver: 동적으로 추가되는 요소에도 스타일 유지
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

        // (7) 주기적으로 스타일 태그 재확인
        setInterval(() => {
          if (!document.getElementById(STYLE_ID)) applyAll(document);
        }, 500);

        // (8) 커스텀 폰트 적용
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
        if (d.useCustomFont && d.selectedFont && d.selectedFont !== "none") {
          applyFont(d.selectedFont);
        } else {
          removeFont();
        }
      })();

      // (9) 프로필 이미지 숨기기
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
