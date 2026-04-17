# Phase 1: 要件定義

## メタ情報

| 項目       | 内容             |
| ---------- | ---------------- |
| Phase      | 1                |
| Phase名    | 要件定義         |
| 対象機能   | TASK-SW-TODO-001 |
| 前提Phase  | -（起点）        |
| 次Phase    | Phase 2: 設計    |
| ステータス | 未実施           |
| 作成日     | 2026-04-16       |

## 目的

`ConversationRoundStep.tsx:456-489` に存在するTODOコメントの内容と
トリガー条件タスク `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` の完了状況を確認し、
修正に必要な要件と受入条件を明確化する。

## 問題

`ConversationRoundStep.tsx:456-489` に以下のTODOコメントが存在する。

```typescript
// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001): 主ツールバッジ - resolveExternalIntegration の主ツール参照ロジック変更後に削除
```

TODOのトリガー条件「`resolveExternalIntegration` の主ツール参照ロジック変更」が未実施のため、
バッジ削除のタイミングが来ていない。ただしTODOの対象タスク
`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` の完了状況が不明であり、
以下の状況に応じた対応が必要となる。

- **`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` が完了済み / 不要と判断された場合**:
  TODOコメントを削除し、バッジを恒久的に維持する。
  `MAIN_TOOL_BADGE_ENABLED = true`（行:116）フラグも直接 `true` に置き換える。

- **`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` が将来も必要な場合**:
  TODOコメントを具体的な条件に書き換えてトレーサビリティを確保する。

## 実行タスク

### Step 0: P50チェック（必須）

実装状態を確認し、既実装コードの重複修正を防止する。

1. `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` の行 456-489 を読み込み現状確認
2. `MAIN_TOOL_BADGE_ENABLED`（行:116）フラグの定義と利用箇所を確認
3. `shouldShowMainToolBadge` の実装と利用箇所を確認
4. `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` タスクの存在・完了状況を確認

### Task 1: 問題特定と影響範囲調査

1. TODOコメントの全文と行範囲（456-489）を確認する
2. `MAIN_TOOL_BADGE_ENABLED` フラグの定義位置（行:116）と利用箇所を確認する
3. `shouldShowMainToolBadge` の動作に影響するコードを確認する
4. `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` の完了状況を調査する
5. TODOを削除した場合と書き換えた場合の影響範囲を整理する

### Task 2: 受入条件の策定

1. `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` の完了状況に応じた対応方針を整理する
2. TODOコメント整理後のコード状態を定義する
3. UIの機能（バッジ表示）が維持されることを確認する条件を策定する
4. 型エラーがないことを確認する条件を策定する
5. 受入条件を4件策定する

## 受入条件

| ID   | 条件                                                                        |
| ---- | --------------------------------------------------------------------------- |
| AC-1 | `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` の完了状況が確認・記録されている |
| AC-2 | TODOコメントが整理されている（削除または明確化）                            |
| AC-3 | `shouldShowMainToolBadge` の動作が変わらない（UIの機能は維持）              |
| AC-4 | TypeScriptの型エラーがない                                                  |

## 参照資料

- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` — 対象ファイル（行 456-489、行 116）
- `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-1-analysis.md` — 問題の現状分析
- `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-2-solution.md` — 解決策設計（オプションA/B）

## 統合テスト連携

- 本タスクは単一ファイル（`ConversationRoundStep.tsx`）のコメント整理であり、外部APIの変更はない
- UIのバッジ表示機能（`shouldShowMainToolBadge`）は変更しないため、IPC/Preload 層への影響はない
- `MAIN_TOOL_BADGE_ENABLED` フラグ変更（オプションA採用時）はコンポーネント内部の変更にとどまる

## 成果物

| 成果物                           | パス                                               |
| -------------------------------- | -------------------------------------------------- |
| TASK-SW-TODO-001-requirements.md | `outputs/phase-1/TASK-SW-TODO-001-requirements.md` |

## 完了条件

- [ ] TODOコメントの現状（行 456-489）が特定されている
- [ ] `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` の完了状況が調査されている
- [ ] `MAIN_TOOL_BADGE_ENABLED` フラグの影響範囲が確認されている
- [ ] 受入条件（AC-1〜AC-4）が全件策定されている

## タスク100%実行確認【必須】

- [ ] Step 0（P50チェック）を実行し、現状コードを確認した
- [ ] Task 1（問題特定と影響範囲調査）を100%実行した
- [ ] Task 2（受入条件の策定）を100%実行した
- [ ] 成果物（TASK-SW-TODO-001-requirements.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 2: 設計](./phase-2-design.md)
