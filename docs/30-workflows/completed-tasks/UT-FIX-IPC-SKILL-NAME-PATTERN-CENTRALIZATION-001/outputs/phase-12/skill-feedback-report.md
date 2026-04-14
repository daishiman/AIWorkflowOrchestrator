# Phase 12: スキルフィードバック

## 良かった点

- shared 定数の単一信頼源化で、desktop と skill-creator の整合を取りやすくなった。
- runtime fallback を入れたことで、`.claude` / `.agents` どちらでも動くようになった。

## 改善点

- phase 2 の設計時点で `claude-cli/constants.ts` の再エクスポート層まで明示すると、後続の漏れが減る。
