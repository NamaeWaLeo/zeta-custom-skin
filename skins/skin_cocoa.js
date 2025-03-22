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
      if (d.selectedSkin !== "skin_cocoa.js") return;

      // fs가 문자열로 들어올 수 있으므로 parseInt로 변환
      const fs = parseInt(d.selectedFontSize || 14, 10);

      (function () {
        const STYLE_ID = "skinStyle";

        function injectStyle(root) {
          if (!root || root.getElementById(STYLE_ID)) return;

          const styleEl = document.createElement("style");
          styleEl.id = STYLE_ID;
          styleEl.textContent = `
/* =====================================
   카카오톡 느낌 (Cocoa Style) - Dark BG
   ===================================== */

/* 전체 배경 (#222222 유지) */
body,
nav,
.bg-gray-main {
  background-color: #222222 !important;
}

/* 발신 (.bg-primary-300) */
.bg-primary-300 {
  background-color: #FFD804 !important;
}
.bg-primary-300 * {
  color: #333 !important;
  font-size: ${fs + 1}px !important;
  line-height: 1.4 !important;
}

/* 수신 (.bg-gray-sub1) */
.rounded-r-xl.rounded-bl-xl.bg-gray-sub1 {
  background-color: #FFF !important;
}
.rounded-r-xl.rounded-bl-xl.bg-gray-sub1 * {
  color: #333 !important;
  font-size: ${fs + 1}px !important;
  line-height: 1.4 !important;
}

/* 전송 버튼 (.bg-primary-400) */
button.bg-primary-400 {
  background-color: #FFD600 !important;
  border: none !important;
  border-radius: 4px !important;
  padding: 6px 8px !important;
}
button.bg-primary-400:hover,
button.bg-primary-400:active {
  background-color: #FFC800 !important;
}
button.bg-primary-400 svg {
  color: #333 !important;
}

/* 카드 느낌:
   div.flex.w-full.min-w-0.flex-col > div.relative.flex.flex-col[draggable="false"]
   - 밝은 회색 박스, 그림자, 중앙 정렬 */
div.flex.w-full.min-w-0.flex-col > div.relative.flex.flex-col[draggable="false"] {
  background-color: #DDD !important;
  border-radius: 12px !important;
  margin: 10px auto !important;
  width: 90% !important;
  text-align: left !important;
  padding: 12px !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
}
div.flex.w-full.min-w-0.flex-col > div.relative.flex.flex-col[draggable="false"] * {
  font-weight: !important;
  color: #222;
}

/* 특정 버튼 숨김
   .flex.w-[72px].flex-col.items-center.justify-center.gap-2.5 */
.flex.w-\\[72px\\].flex-col.items-center.justify-center.gap-2\\.5 {
  display: none !important;
}

/* span.body14.text-gray-50 */
span.body14.text-gray-50 {
  font-weight: bold !important;
  color: #111 !important;
}

/*
  text-white/50를 가진 em이 .text-white 스타일과 충돌해
  색이 바뀌지 않을 때, 더 높은 우선순위로 덮어씌우기
*/
.break-all.text-white em[class*="text-white\\/50"],
.body16.text-white em[class*="text-white\\/50"],
em[class*="text-white\\/50"] {
  color: rgb(125, 125, 125) !important;
}
          `;
          (root.head || root.documentElement).appendChild(styleEl);
        }

        function applyAll(root) {
          injectStyle(root);
          root.querySelectorAll("*").forEach((el) => {
            if (el.shadowRoot) injectStyle(el.shadowRoot);
          });
        }

        applyAll(document);

        // MutationObserver: 동적으로 추가되는 요소도 스타일 유지
        new MutationObserver((m) => {
          m.forEach((x) => {
            x.addedNodes.forEach((n) => {
              if (n.nodeType === 1) {
                if (n.shadowRoot) injectStyle(n.shadowRoot);
                n.querySelectorAll("*").forEach((c) => {
                  if (c.shadowRoot) injectStyle(c.shadowRoot);
                });
              }
            });
          });
        }).observe(document.body, { childList: true, subtree: true });

        // 일정 간격으로 스타일 태그 재확인
        setInterval(() => {
          if (!document.getElementById(STYLE_ID)) applyAll(document);
        }, 500);

        // 커스텀 폰트 적용 로직
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

        // 선택적 커스텀 폰트 적용
        if (d.useCustomFont && d.selectedFont && d.selectedFont !== "none") {
          applyFont(d.selectedFont);
        } else {
          removeFont();
        }
      })();

      // 프로필 이미지 숨기기 (hideProfileImage)
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
        if (st) {
          st.remove();
        }
      }
    }
  );
})();
