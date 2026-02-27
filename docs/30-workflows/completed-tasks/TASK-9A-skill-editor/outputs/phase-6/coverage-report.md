# Phase 6 カバレッジレポート

## 実行コマンド

`pnpm vitest run --coverage --coverage.include src/renderer/components/skill/SkillEditor.tsx --coverage.include src/renderer/components/skill/SkillCodeEditor.tsx ...`

## 結果

- Statements: 81.56%
- Branches: 72.84%
- Functions: 91.66%
- Lines: 81.56%

## ファイル別

- `SkillCodeEditor.tsx`: Lines 95.23%, Branch 80%, Func 100%
- `SkillEditor.tsx`: Lines 80.71%, Branch 72.6%, Func 90.47%

## 追加テストで補強した観点

- tree キーボード操作
- readonly時ボタン制御
- 未保存ダイアログ遷移
- backup restoreフロー

## 判定

PASS（閾値達成）
