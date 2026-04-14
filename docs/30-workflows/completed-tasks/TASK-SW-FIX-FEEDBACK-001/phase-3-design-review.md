# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 3                        |
| Phase名    | 設計レビューゲート       |
| 対象機能   | TASK-SW-FIX-FEEDBACK-001 |
| 前提Phase  | Phase 2: 設計            |
| 次Phase    | Phase 4: テスト作成      |
| ステータス | pending                  |
| 作成日     | 2026-04-14               |

## 目的

Phase 2 の設計が AC-1〜AC-5 の全受入条件を current facts として満たし、docs-only のまま進めるべきか、follow-up を別タスク化すべきかを判定する。

## 実行タスク

### Task 1: AC網羅確認

各ACに対応する設計要素が存在するかを確認する。

| AC   | 受入条件                                                                               | 対応する設計要素                                                         | 確認結果 |
| ---- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------- |
| AC-1 | LLMモード成功パスで `fetchSkills()` が 1 回呼ばれ、その後 `selectSkillByName()` が続く | Task 1: current facts の current flow を仕様化                           | [ ]      |
| AC-2 | `terminal_handoff` 時は `fetchSkills()` / `selectSkillByName()` が呼ばれない           | Task 2: 早期リターンの evidence 化                                       | [ ]      |
| AC-3 | `skillPath = null` でエラーメッセージが表示される                                      | Task 3: アーリーリターン方式でエラーUI表示                               | [ ]      |
| AC-4 | `skillPath = null` で成功ヘッダーが表示されない                                        | Task 3: アーリーリターンにより成功ヘッダーのレンダリングパスに到達しない | [ ]      |
| AC-5 | `skillPath` が正常値の場合、成功ヘッダーと完了画面が表示される                         | Task 3: nullガード通過後の通常パスは既存UIのまま                         | [ ]      |

### Task 2: docs-only と follow-up の分離確認

- current task は docs-only を既定としていることを確認する
- issue 8 の非ブロッキング化は follow-up 候補として独立していることを確認する
- follow-up が必要な場合の変更範囲が `SkillLifecyclePanel` とそのテストに限定されることを確認する

### Task 3: CompleteStep current contract 確認

- `CompleteStepProps` の `skillPath?: string | null` が current contract として妥当であることを確認する
- `onRetry?: () => void` がオプショナルであることを確認する
- `skillPath === null` のみがエラー UI に入ることを確認する
- `skillPath !== null` の通常パスでは成功ヘッダーが表示されることを確認する

### Task 4: 既存テスト evidence の妥当性確認

- `SkillLifecyclePanel.llm-generation.test.tsx` が AC-1 / AC-2 を担保することを確認する
- `CompleteStep.test.tsx` が AC-3 / AC-4 / AC-5 を担保することを確認する
- docs-only であるため、新規テスト作成ではなく既存テストの証跡固定を優先することを確認する

## レビュー結果判定テーブル

| 判定     | 条件                                                           | アクション                       |
| -------- | -------------------------------------------------------------- | -------------------------------- |
| PASS     | AC-1〜AC-5の全てに設計要素が対応し、docs-only 方針が維持される | Phase 4 へ進む                   |
| MINOR    | 軽微な設計調整（文言・表現等）が必要                           | Phase 2 へ差し戻し、調整後再判定 |
| MAJOR    | 設計方針の見直しが必要（follow-up 分離、props 設計変更等）     | Phase 2 へ差し戻し、再設計       |
| CRITICAL | 要件定義の見直しが必要（ACの定義変更、scope 変更等）           | Phase 1 へ差し戻し、要件再定義   |

## 戻り先決定基準テーブル

| 検出された問題                                        | 戻り先  | 理由                             |
| ----------------------------------------------------- | ------- | -------------------------------- |
| AC-1〜AC-5 のいずれかに対応する設計要素が存在しない   | Phase 2 | 設計の追加・修正で対応可能       |
| docs-only 方針と docs の記述が食い違う                | Phase 1 | 要件定義の再整理が必要           |
| follow-up 候補の分離が不十分                          | Phase 2 | 設計の切り出しで対応可能         |
| `CompleteStep` の current contract が不適切           | Phase 2 | props / 分岐設計の修正で対応可能 |
| ACの定義自体に不備がある（検証不能、曖昧等）          | Phase 1 | 要件定義の修正が必要             |
| スコープ外の変更が必要と判明した（IPC Handler変更等） | Phase 1 | スコープ境界の再定義が必要       |

## 参照資料

| 資料名               | パス                                                                                               | 説明                                |
| -------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 設計書               | `phase-2-design.md`                                                                                | レビュー対象                        |
| 要件定義             | `phase-1-requirements.md`                                                                          | AC-1〜AC-5の照合基準                |
| current facts        | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | current flow の正本                 |
| current facts        | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`                               | current contract の正本             |
| existing tests       | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | success / terminal_handoff evidence |
| existing tests       | `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`                | null guard / success UI evidence    |
| UIコンポーネント設計 | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                          | UIスタイルの整合性確認              |
| 状態管理設計         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                       | fetchSkills パターンの確認          |

## 統合テスト連携

- AC-1〜AC-5 の各 AC に対応する evidence が既存テストで追えることを確認する
- docs-only の場合は current facts を優先し、follow-up 候補を別タスクへ逃がす
- `fetchSkills()` の非ブロッキング化はこの Phase では採用しない

## 成果物

| 成果物           | パス                               | 説明                         |
| ---------------- | ---------------------------------- | ---------------------------- |
| 設計レビュー結果 | `outputs/phase-3/review-result.md` | AC網羅確認・方針判定・残論点 |

## 完了条件

- [ ] AC-1〜AC-5 の全てに対応する設計要素の存在が確認されている
- [ ] docs-only 方針が維持されている
- [ ] follow-up 候補が別タスクとして分離されている
- [ ] `CompleteStep` の current contract が確認されている
- [ ] gate判定（PASS / MINOR / MAJOR / CRITICAL）が明示されている
- [ ] 判定結果に基づく次のアクションが明確である
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 4: テスト作成](./phase-4-test-creation.md)
