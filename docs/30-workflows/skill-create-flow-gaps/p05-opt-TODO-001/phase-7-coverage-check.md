# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 7                                    |
| タスクID   | TASK-SW-TODO-001                     |
| 機能名     | conversation-round-step-todo-cleanup |
| 前提Phase  | Phase 6                              |
| 後続Phase  | Phase 8                              |
| 作成日     | 2026-04-15                           |
| ステータス | 未実施                               |

## 目的

本タスクはコメント変更のみであり新規ロジックを追加しないため、カバレッジ計測の主目的は「既存のカバレッジが変更により低下していないこと」の確認である。`shouldShowMainToolBadge` 関数のカバレッジが維持されていることを確認する。

## 実行タスク

- カバレッジ計測の実施
- `shouldShowMainToolBadge` 関数のカバレッジ確認
- パターンA でのコード削除によるカバレッジへの影響確認
- カバレッジレポートの作成

## 参照資料

| 資料名           | パス                                                                                         | 用途           |
| ---------------- | -------------------------------------------------------------------------------------------- | -------------- |
| 変更済みファイル | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                | カバレッジ対象 |
| 既存テスト       | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | テスト実行     |
| Phase 5 成果物   | `outputs/phase-5/implementation-summary.md`                                                  | 変更内容確認   |

## 実行手順

### 1. カバレッジ計測コマンド

```bash
# ConversationRoundStep.tsx を対象にカバレッジ計測
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.include="src/renderer/components/skill/wizard/ConversationRoundStep.tsx" \
  src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

### 2. カバレッジ目標

本タスクはコメント変更のみのため、新規ロジックのカバレッジ追加は不要。目標は**変更前と同等以上のカバレッジを維持すること**。

| 計測対象                                 | Line                         | Branch | Function |
| ---------------------------------------- | ---------------------------- | ------ | -------- |
| `shouldShowMainToolBadge` 関数           | 80%+                         | 60%+   | 80%+     |
| `ConversationRoundStep.tsx` 変更箇所周辺 | 変化なし（コメントのみ変更） | -      | -        |

### 3. 計測結果記録（実行時に記入）

| 計測対象                         | Line | Branch | Function | 判定 |
| -------------------------------- | ---- | ------ | -------- | ---- |
| `shouldShowMainToolBadge` 関数   | -    | -      | -        | -    |
| `ConversationRoundStep.tsx` 全体 | -    | -      | -        | -    |

### 4. パターンA でのカバレッジ影響確認

パターンA（TODOコメント削除 + `MAIN_TOOL_BADGE_ENABLED` フラグ整理）を採用した場合：

```bash
# フラグ削除後のカバレッジを確認
# MAIN_TOOL_BADGE_ENABLED が削除された場合、該当行のカバレッジ計測対象が減る可能性がある
grep -n "MAIN_TOOL_BADGE_ENABLED" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
```

- `MAIN_TOOL_BADGE_ENABLED = true` の行が削除された場合、その行のカバレッジ対象が減るが全体カバレッジには軽微な影響のみ
- `shouldShowMainToolBadge` 関数のブランチカバレッジが既存テストで維持されていることを確認する

### 5. カバレッジ未達時の対応

本タスクのカバレッジ目標は維持（低下しないこと）であるため：

- カバレッジが低下した場合: Phase 6 へ戻り、テスト追加を検討する
- カバレッジが維持または向上した場合: Phase 8 へ進む

## 統合テスト連携【必須】

| 判定項目                                   | 基準     | 結果 |
| ------------------------------------------ | -------- | ---- |
| `shouldShowMainToolBadge` カバレッジ維持   | 低下なし | -    |
| `ConversationRoundStep.tsx` カバレッジ維持 | 低下なし | -    |

## 多角的チェック観点

| 観点   | 確認内容                                                              |
| ------ | --------------------------------------------------------------------- |
| 矛盾   | カバレッジ計測対象と実際の変更箇所が整合しているか                    |
| 漏れ   | パターンA のフラグ削除によりカバレッジ対象行が減少していないか        |
| 整合性 | 既存テストが `shouldShowMainToolBadge` の全ブランチをカバーしているか |

## 成果物

| 成果物             | パス                                 | 説明                     |
| ------------------ | ------------------------------------ | ------------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果・維持確認・判定 |

## 完了条件

- [ ] カバレッジ計測コマンドを実行済み
- [ ] `shouldShowMainToolBadge` 関数のカバレッジが低下していないことを確認
- [ ] `ConversationRoundStep.tsx` 全体のカバレッジが低下していないことを確認
- [ ] カバレッジレポートが作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. カバレッジ計測コマンド実行
2. 計測結果の記録
3. パターンA でのフラグ削除影響確認
4. カバレッジ維持の判定
5. カバレッジレポート作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 8: リファクタリング
