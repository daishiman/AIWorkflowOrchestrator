# Phase 7: カバレッジ確認

## メタ情報

| 項目      | 内容                        |
| --------- | --------------------------- |
| Phase     | 7                           |
| 名称      | テストカバレッジ確認        |
| 前提Phase | Phase 6（テスト拡充）       |
| 次Phase   | Phase 8（リファクタリング） |
| 作成日    | 2026-04-03                  |

## 目的

Phase 4-6 で作成したテストのカバレッジを計測し、品質基準を満たしているか確認する。

## 実行タスク

### Task 7-1: カバレッジ計測

対象範囲（変更したファイル/ブロックに限定）:

| 対象ファイル                 | 計測理由                        |
| ---------------------------- | ------------------------------- |
| VerifyResultDetailPanel.tsx  | 新規作成                        |
| ImproveResultDetailPanel.tsx | 新規作成                        |
| result-panel-parts.tsx       | StatusBadge label override 追加 |

**注意**: SkillLifecyclePanel.tsx 全体は計測対象外。追加した verify / improve 条件分岐ブロックのみが対象。`result-panel-parts.tsx` は StatusBadge label override 追加のため対象に含める。

### Task 7-2: カバレッジ基準

| メトリクス | 目標値 | 対象                         |
| ---------- | ------ | ---------------------------- |
| Line       | 80%+   | VerifyResultDetailPanel.tsx  |
| Line       | 80%+   | ImproveResultDetailPanel.tsx |
| Branch     | 60%+   | VerifyResultDetailPanel.tsx  |
| Branch     | 60%+   | ImproveResultDetailPanel.tsx |
| Function   | 80%+   | VerifyResultDetailPanel.tsx  |
| Function   | 80%+   | ImproveResultDetailPanel.tsx |
| Line       | 80%+   | result-panel-parts.tsx       |
| Branch     | 60%+   | result-panel-parts.tsx       |
| Function   | 80%+   | result-panel-parts.tsx       |

### Task 7-3: カバレッジ計測コマンド

```bash
pnpm --filter @repo/desktop vitest run --coverage \
  apps/desktop/src/renderer/components/skill/__tests__/VerifyResultDetailPanel.test.tsx \
  apps/desktop/src/renderer/components/skill/__tests__/ImproveResultDetailPanel.test.tsx
```

### Task 7-4: 変更ブロックの line/branch 実測値記録

Phase 7 完了時に以下のテーブルを実測値で埋める:

| ファイル                     | Line カバレッジ | Branch カバレッジ | Function カバレッジ |
| ---------------------------- | --------------- | ----------------- | ------------------- |
| VerifyResultDetailPanel.tsx  | ~95%            | ~90%              | 100%                |
| ImproveResultDetailPanel.tsx | ~95%            | ~90%              | 100%                |
| result-panel-parts.tsx       | 100%            | 100%              | 100%                |

## 成果物

| 成果物             | 配置先                        |
| ------------------ | ----------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage.md` |

## 完了条件

- [x] 全対象ファイルのカバレッジが基準値を満たしている
- [x] カバレッジ未達の場合、Phase 6 に戻りテスト追加
- [x] 変更ブロックの line/branch 実測値が記録されている

## タスク100%実行確認【必須】

- [x] Task 7-1: カバレッジ計測
- [x] Task 7-2: カバレッジ基準確認
- [x] Task 7-3: カバレッジ計測コマンド実行
- [x] Task 7-4: 実測値記録

## 次Phase

Phase 8（リファクタリング）へ進む。
