# Phase 5: 実装

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 5                                     |
| 機能名     | task-043b-ui-ux-import-list-design    |
| タスク名   | TASK-10A-E-B UI/UX インポート一覧設計 |
| 前提Phase  | Phase 4                               |
| 後続Phase  | Phase 6                               |
| 作成日     | 2026-03-06                            |
| ステータス | completed                             |
| 担当       | SubAgent-B                            |

## 目的

実装者が `SkillManagementPanel` list view を安全に拡張できるよう、コンポーネント境界、selector / action 配線、dialog 導線、成功後フォーカス移動を実装手順へ変換する。

## 背景

このタスクは仕様書作成専用であり、ここでは実装を行わない。実装時に必要な UI 構成、Store 参照、非スコープ、変更対象ファイルだけを固定する。

## Atent Team 編成

| SubAgent | 関心ごと       | 主担当内容                                      |
| -------- | -------------- | ----------------------------------------------- |
| B1       | コンポーネント | imported card と available row の境界定義       |
| B2       | Store配線      | 個別selector / action と state 更新順序         |
| B3       | フォーカス制御 | dialog open / close / success 後の focus return |
| B4       | 実装順序       | ファイル更新順序と rollback しやすい差分分割    |

## 実行タスク

- 実装計画化: 変更対象ファイルと更新順序を固定する
- 境界定義: existing editor / analysis / create view を壊さない分岐条件を定義する
- Store 配線定義: `useAvailableSkillsMetadata`、`useImportedSkills`、`useSkillError`、`useIsLoadingSkills`、`useIsImportingSkill`、`useImportingSkillName`、`useFetchSkills`、`useImportSkill`、`useClearSkillError` の使い分けを定義する
- 確認導線定義: list row の `追加する` から dialog confirm までの遷移を定義する

## 参照資料

### 親タスク・コード

| 資料名                      | パス                                                                  | 用途                        |
| --------------------------- | --------------------------------------------------------------------- | --------------------------- |
| 親タスク仕様                | `../task-043b-ui-ux-import-list-design.md`                            | 実装対象と非スコープ        |
| 依存Phase 1 仕様            | `phase-1-requirements.md`                                             | FR / NFR 再確認             |
| 依存Phase 2 仕様            | `phase-2-design.md`                                                   | UI / A11y 契約再確認        |
| 依存Phase 3 仕様            | `phase-3-design-review.md`                                            | 差戻し条件確認              |
| 依存Phase 4 仕様            | `phase-4-test-creation.md`                                            | Red 条件確認                |
| 現行パネル                  | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` | 実装起点                    |
| 確認ダイアログ              | `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`    | dialog 再利用               |
| Store公開Hook               | `apps/desktop/src/renderer/store/index.ts`                            | selector / action 名称固定  |
| agentSlice                  | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                | import / fetch / error 契約 |
| テスト仕様                  | `outputs/phase-4/test-specification.md`                               | Phase 4 成果物              |
| テストケース                | `outputs/phase-4/test-cases.md`                                       | Phase 4 成果物              |
| アクセシビリティテスト計画  | `outputs/phase-4/accessibility-test-plan.md`                          | Phase 4 成果物              |
| interactionテストマトリクス | `outputs/phase-4/interaction-test-matrix.md`                          | Phase 4 成果物              |

### システム仕様（aiworkflow-requirements）

| 資料名             | パス                                                                                        | 用途                                        |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------- |
| UIアーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   | 責務境界                                    |
| 状態管理           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | P31対策、idempotent import                  |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | `skill.id/name` 混同防止と境界変換固定      |
| Skill管理I/F       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | `import(skillName)` と `getImported()` 契約 |
| UIデザインシステム | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | 状態色と animation token                    |
| エラー仕様         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | error alert 方針                            |

## 実行手順

1. `SkillManagementPanel.tsx` の list branch に imported / available の2セクションを追加し、editor / analysis / create branch には変更を入れない。
2. list branch では既存個別selectorを優先し、global な合成 hook や新規 Store slice は追加しない。local UI state が増えた場合だけ、`useSkillCenter` 型の view 専用 hook を許容する。
3. available row の primary CTA は dialog open に限定し、confirm でだけ `importSkill(skill.name)` を実行する。
4. import 中は `importingSkillName` と一致する row だけを disabled にし、ほかの row は操作可能なままにする。
5. `description ?? ""`、欠損配列、正規化検索で nullish を吸収し、一覧描画と検索が落ちないようにする。
6. success 後は available から imported へ移動した項目へフォーカスを戻し、`useClearSkillError` で stale error を残さない。
7. success 判定は `importedCount` ではなく imported 一覧反映、error 未残置、対象 row 非表示で行う。

## 統合テスト連携

- 実装順序は component -> dialog hook-up -> focus control -> tests の順に固定する。
- Phase 4 の test case と 1対1で対応する状態名を code comment へ残す。
- `SkillImportDialog` 既存テストと競合しないよう、dialog 単体責務は維持する。

## 実装不変条件

- 新規IPC、Preload API、Main service、Store state は追加しない。
- `SkillManagementPanel` の list branch のみを更新し、`currentView` の既存 `editor/analysis/create` 分岐は変更しない。
- success 判定は `importedCount` 単独で行わず、imported 一覧反映、error 未残置、対象 row 非表示で判定する。
- `description ?? ""`、配列 nullish 吸収、duplicate import 防止、focus return、stale error クリアを実装必須条件にする。

## 実装依存境界

| 依存先         | 本Phaseで守る境界                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `TASK-10A-E-A` | `skill:list` / `skill:getImported` / `skill:import` は既存契約を呼ぶだけに留める                  |
| `TASK-10A-E-C` | `agentSlice` の既存 selector / action / idempotent import 契約を再利用し、新規 state を要求しない |
| `TASK-10A-D`   | list branch の差分だけで完結させ、他 view 統合ロジックを変更しない                                |

## 多角的チェック観点

| 観点               | 本Phaseで確認する内容                                                                       | 仕様参照先                                                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 新規IPC/Preload/API追加なしを維持し、Renderer実装に閉じる                                   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`, `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                      |
| UI/UX              | 2セクション、状態表示、文言、フォーカス、ライブリージョン、44pxターゲットを実装へ落とし込む | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`      |
| アーキテクチャ     | `SkillManagementPanel` の責務境界と既存 `editor/analysis/create` view 非侵食を維持する      | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                  |
| API/IPC            | `skill:list` / `skill:getImported` / `skill:import` の既存契約再利用に限定する              | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`, `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                  |
| エラーハンドリング | 擬似失敗、二重追加、stale error、再試行導線を実装条件へ含める                               | `.claude/skills/aiworkflow-requirements/references/error-handling.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                      |
| テスタビリティ     | TC-ID、selector、fixture、manual evidence の対応を壊さない実装分割にする                    | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`, `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md` |

### Electronデスクトップアプリ観点

| 層       | 本Phaseで確認する内容                                         | 仕様参照先                                                                                                                                                      |
| -------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renderer | list view / dialog / live region / focus contract を実装する  | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                                                         |
| Main     | 新規サービス追加なし、既存 handler 契約を変えない             | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| IPC通信  | 既存 `skill:*` channel を再利用し、新規 channel を追加しない  | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                            |
| Preload  | 新規公開API追加なしを確認する                                 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                                                    |
| Store    | `agentSlice` 個別selector と idempotent import 契約を維持する | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                    |

## 成果物

| 成果物                   | パス                                        | 説明                                 |
| ------------------------ | ------------------------------------------- | ------------------------------------ |
| 実装計画                 | `outputs/phase-5/implementation-plan.md`    | 変更対象ファイルと更新順序           |
| コンポーネント境界図     | `outputs/phase-5/component-boundary-map.md` | imported card / available row の境界 |
| selector / action マップ | `outputs/phase-5/selector-action-map.md`    | 利用する個別selectorと action 一覧   |
| 追加導線ワイヤー         | `outputs/phase-5/import-flow-wireframe.md`  | list -> dialog -> success の流れ     |

## 完了条件

- [x] 変更対象ファイルと非変更ファイルが定義されている
- [x] selector / action の利用境界が定義されている
- [x] dialog を介した追加導線が定義されている
- [x] success 後のフォーカス復帰と stale error クリアが定義されている
- [x] local hook 許容条件、nullish metadata 防御、`importedCount` 非依存の成功判定が定義されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 変更対象整理
2. selector / action 整理
3. dialog 導線定義
4. focus 制御定義
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブルの全ファイルを出力
- [x] 完了条件を全件確認

## 次のPhase

Phase 6: テスト拡充
