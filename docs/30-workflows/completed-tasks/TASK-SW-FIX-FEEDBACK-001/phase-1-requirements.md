# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 1                        |
| Phase名    | 要件定義                 |
| 対象機能   | TASK-SW-FIX-FEEDBACK-001 |
| 前提Phase  | -                        |
| 次Phase    | Phase 2: 設計            |
| ステータス | pending                  |
| 作成日     | 2026-04-14               |

## 目的

current facts と skill 定義の差分を、解消済み / follow-up候補 / 未解決に分けて固定する。
この Phase では code delta を前提にせず、既存実装と既存テストを evidence として current contract を確定する。

## 実行タスク

### Task 1: 既知論点の固定

以下の論点を current facts に照らして整理する。

| 論点番号 | 内容                                                                 | 判定          |
| -------- | -------------------------------------------------------------------- | ------------- |
| 論点6    | LLMモードの生成完了後に一覧更新と選択処理が必要かどうか              | 解消済み      |
| 論点8    | `fetchSkills()` 失敗時の非ブロッキング扱いを current task に含めるか | follow-up候補 |
| 論点14   | `skillPath = null` のまま CompleteStep に到達した際のエラー表示      | 解消済み      |
| 論点20   | CompleteStep の成功ヘッダーが `skillPath` に応じて条件表示されるか   | 解消済み      |

### Task 2: 対象ファイル調査

以下の current facts を確認する。

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` の `executePlan → loadVerifyDetail → fetchSkills → selectSkillByName` シーケンス
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` の `terminal_handoff` 早期リターンと `fetchSkills` スキップ
- `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` の `skillPath === null` ガード
- `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` の成功ヘッダー条件表示
- `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` の `skillPath?: string | null` と `onRetry?: () => void`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` と `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx` の既存 evidence

### Task 3: 受入条件の確定

以下の AC-1〜AC-5 を current facts に基づいて定義する。

| AC   | 条件                                                                                             | 検証方法                                                              |
| ---- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| AC-1 | LLMモード成功時、`fetchSkills()` が 1 回呼ばれ、その後 `selectSkillByName()` が続く              | `SkillLifecyclePanel` の既存テストで呼び出し順を検証する              |
| AC-2 | `terminal_handoff` 時は `fetchSkills()` / `selectSkillByName()` が呼ばれず、handoff が維持される | `SkillLifecyclePanel` の既存テストで早期リターンを検証する            |
| AC-3 | `skillPath = null` の場合、`CompleteStep` にエラーメッセージが表示される                         | `CompleteStep` に `skillPath={null}` を渡して DOM を検証する          |
| AC-4 | `skillPath = null` の場合、成功ヘッダーが表示されない                                            | `CompleteStep` に `skillPath={null}` を渡して成功ヘッダー非存在を検証 |
| AC-5 | `skillPath` が正常値の場合、成功ヘッダーと完了画面が表示される                                   | `CompleteStep` に正常値を渡して DOM と action cards を検証する        |

### Task 4: スコープ境界

#### 含む

- current facts と skill 定義の parity 判定
- `SkillLifecyclePanel.tsx` / `CompleteStep.tsx` / existing tests の current facts 参照
- issue 8 を follow-up 候補として切り分ける判断
- docs-only で current contract を固定する作業

#### 含まない

- `SkillCreateWizard` を中心とした旧 bugfix 物語への回帰
- parity gap がない状態での code delta
- IPC Handler の変更（Main Process 側は対象外）
- コミット・PR作成（Phase 13 で実施）

## 参照資料

| 資料名               | パス                                                                                               | 説明                                   |
| -------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------- |
| current facts        | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | executePlan の現行挙動                 |
| current facts        | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`                               | 問題14・20の current contract          |
| existing tests       | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | LLM/terminal_handoff evidence          |
| existing tests       | `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`                | null guard / success header evidence   |
| UIコンポーネント設計 | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                          | Wizard系コンポーネントのアーキテクチャ |
| 状態管理設計         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                       | スキルウィザードの状態管理パターン     |
| タスクindex          | `docs/30-workflows/TASK-SW-FIX-FEEDBACK-001/index.md`                                              | 本タスクの全体仕様                     |

## 統合テスト連携

- `SkillLifecyclePanel` 側の既存テストが AC-1 / AC-2 を満たすことを確認する
- `CompleteStep` の null ガードと成功ヘッダー条件が AC-3 / AC-4 / AC-5 に対応していることを確認する
- docs-only の場合は existing tests の証跡で current facts を固定する

## 成果物

| 成果物     | パス                                         | 説明                                       |
| ---------- | -------------------------------------------- | ------------------------------------------ |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | 問題定義、受入条件、スコープ境界、調査結果 |

## 完了条件

- [ ] 論点6・8・14・20 が current facts で解消済み / follow-up候補 / 未解決に分類されている
- [ ] 対象ファイルの現状調査が完了している
- [ ] AC-1〜AC-5 が検証方法付きで定義されている
- [ ] スコープ境界（含む/含まない）が明確に記述されている
- [ ] 統合テスト連携の要件が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 2: 設計](./phase-2-design.md)
