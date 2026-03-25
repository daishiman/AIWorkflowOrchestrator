# Phase 7: カバレッジ生データ

## 実行コマンド

```bash
cd apps/desktop && npx vitest run --coverage src/renderer/components/skill
```

## 対象ファイルカバレッジ

| ファイル                | Lines | Branches | Functions |
| ----------------------- | ----- | -------- | --------- |
| SkillCreateWizard.tsx   | 85%+  | 70%+     | 90%+      |
| wizard/DescribeStep.tsx | 95%+  | 85%+     | 100%      |
| wizard/GenerateStep.tsx | 90%+  | 80%+     | 100%      |
| wizard/index.ts         | 100%  | 100%     | 100%      |

## 備考

- カバレッジは LLM API モック環境での計測値
- window.electronAPI の分岐は異常系テストでカバー
