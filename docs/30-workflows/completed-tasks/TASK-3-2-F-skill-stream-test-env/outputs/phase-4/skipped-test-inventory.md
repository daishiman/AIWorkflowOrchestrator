# スキップテスト棚卸し - TASK-3-2-F Phase 4

## スキップテスト一覧

| #   | ファイル                                     | 行番号 | テストブロック名                                | テスト件数 | 依存API                                        |
| --- | -------------------------------------------- | ------ | ----------------------------------------------- | ---------- | ---------------------------------------------- |
| 1   | SkillStreamDisplay.test.tsx                  | L973   | SkillStreamDisplay - Clipboard Copy (R3)        | 7          | navigator.clipboard.writeText                  |
| 2   | SkillStreamDisplay.test.tsx                  | L1426  | SkillStreamDisplay - Clipboard Copy Edge Cases  | 6          | navigator.clipboard.writeText                  |
| 3   | SkillStreamDisplay.test.tsx                  | L1610  | SkillStreamDisplay - Integration Scenarios      | 4          | navigator.clipboard.writeText, concurrent mode |
| 4   | SkillStreamDisplay.i18n.test.tsx             | L248   | SkillStreamDisplay - CopyButton feedback        | 4          | navigator.clipboard.writeText                  |
| 5   | SkillStreamDisplay.i18n.integration.test.tsx | L64    | SkillStreamDisplay - i18n Integration (Phase 6) | 22         | React concurrent mode, i18n.changeLanguage()   |

**合計: 5ブロック / 43テスト**

## 依存API分析

| 依存API                       | 影響ブロック数 | 影響テスト数 | 解決方法                                    |
| ----------------------------- | -------------- | ------------ | ------------------------------------------- |
| navigator.clipboard.writeText | 4              | 21           | setup.tsにClipboard APIグローバルモック追加 |
| React concurrent mode         | 2              | 26           | jsdom環境切り替え                           |
| i18n.changeLanguage()         | 1              | 22           | jsdom環境でのconcurrent mode対応により解決  |
