# Phase 2: 設計

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 2                           |
| Phase名    | 設計                        |
| 対象機能   | TASK-SW-TODO-001            |
| 前提Phase  | Phase 1: 要件定義           |
| 次Phase    | Phase 3: 設計レビューゲート |
| ステータス | 未実施                      |
| 作成日     | 2026-04-16                  |

## 目的

TODOコメント整理の詳細設計を行う。
`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` の完了状況に基づき、
オプション A（推奨）またはオプション B を選択し、実装内容を確定する。

## 実行タスク

### Task 1: オプション選択の設計

**オプション A（推奨）**: TODOコメントを削除し、バッジを恒久的に維持する

Phase 1 で `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` が完了済みまたは不要と判断された場合、
以下の変更を行う。

**変更前**:

```typescript
// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001): 主ツールバッジ - resolveExternalIntegration の主ツール参照ロジック変更後に削除
const MAIN_TOOL_BADGE_ENABLED = true; // 行:116 付近
```

**変更後（オプション A）**:

```typescript
// 主ツールバッジを恒久的に表示する（UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001 完了により確定）
const MAIN_TOOL_BADGE_ENABLED = true; // 行:116 付近 — フラグを削除して直接 true に変更する場合はこちら
```

またはフラグ削除パターン:

```typescript
// MAIN_TOOL_BADGE_ENABLED フラグを削除し、参照箇所で直接 true を使用する
```

**オプション B**: TODOコメントを具体的な条件に書き換える

`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` が将来も必要な場合、
TODOコメントを具体的な条件に書き換えてトレーサビリティを確保する。

**変更前**:

```typescript
// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001): 主ツールバッジ - resolveExternalIntegration の主ツール参照ロジック変更後に削除
```

**変更後（オプション B）**:

```typescript
// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001): 主ツールバッジ表示フラグ
// - 条件: resolveExternalIntegration が外部統合の主ツール参照を返すよう変更された後に削除
// - 参照: docs/30-workflows/skill-create-flow-gaps/ の解決策設計を参照
// - 削除時は MAIN_TOOL_BADGE_ENABLED フラグごと除去し、shouldShowMainToolBadge を直接 false に変更する
```

### Task 2: オプション選択の判断基準

Phase 1 の調査結果に基づき、以下の基準でオプションを選択する。

| 条件                                                  | 採用オプション |
| ----------------------------------------------------- | -------------- |
| `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` が完了済み | オプション A   |
| `resolveExternalIntegration` の変更が不要と判断された | オプション A   |
| `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` が未完了   | オプション B   |
| `resolveExternalIntegration` の変更が将来必要         | オプション B   |

### Task 3: `MAIN_TOOL_BADGE_ENABLED` フラグの扱い設計

オプション A を採用した場合の `MAIN_TOOL_BADGE_ENABLED` フラグの扱いを設計する。

**方針 A-1（推奨）**: フラグを削除して参照箇所で直接 `true` を使用する

- `MAIN_TOOL_BADGE_ENABLED = true`（行:116）を削除する
- `shouldShowMainToolBadge` の計算式中の `MAIN_TOOL_BADGE_ENABLED` 参照を `true` に置き換える
- コードが簡潔になりフラグ管理の手間が減る

**方針 A-2**: フラグを維持しコメントのみ変更する

- `MAIN_TOOL_BADGE_ENABLED = true` は維持する
- TODOコメントのみ削除または書き換える
- 変更量が最小になる

**採用方針**: Phase 1 の調査結果と対象範囲に応じて Phase 2 実施時に確定する。

### Task 4: concern 数と設計書分割基準確認

- concern 数: 1（TODOコメント整理のみ）
- 単一 `phase-2-design.md` に記述する

### Task 5: IPC 4層整合性チェック

本タスクは `ConversationRoundStep.tsx` 内のコメント整理であり、IPC チャンネルの変更はない。
4層整合性チェックは不要。

## 参照資料

- `outputs/phase-1/TASK-SW-TODO-001-requirements.md` — 受入条件（AC-1〜AC-4）
- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` — 対象ファイル

## 統合テスト連携

- UIのバッジ表示機能（`shouldShowMainToolBadge`）の外部動作は変更しないため統合ポイントへの影響なし
- コメント整理後も `shouldShowMainToolBadge` が同じ値を返すことを確認する

## 成果物

| 成果物                     | パス                                         |
| -------------------------- | -------------------------------------------- |
| TASK-SW-TODO-001-design.md | `outputs/phase-2/TASK-SW-TODO-001-design.md` |

## 完了条件

- [ ] オプション A / B の選択基準が設計書に明記されている
- [ ] 採用オプションに基づく変更前/後のコードが設計書に明記されている
- [ ] `MAIN_TOOL_BADGE_ENABLED` フラグの扱い方針が確定している
- [ ] IPC 4層整合性チェックが不要と判断されている

## タスク100%実行確認【必須】

- [ ] Task 1（オプション選択の設計）を100%実行した
- [ ] Task 2（オプション選択の判断基準）を100%実行した
- [ ] Task 3（`MAIN_TOOL_BADGE_ENABLED` フラグの扱い設計）を100%実行した
- [ ] Task 4（concern 数と設計書分割基準確認）を100%実行した
- [ ] Task 5（IPC 4層整合性チェック）を100%実行した
- [ ] 成果物（TASK-SW-TODO-001-design.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 3: 設計レビューゲート](./phase-3-design-review.md)
