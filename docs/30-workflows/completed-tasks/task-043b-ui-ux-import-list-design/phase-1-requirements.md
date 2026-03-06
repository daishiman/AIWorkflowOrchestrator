# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 1                                     |
| 機能名     | task-043b-ui-ux-import-list-design    |
| タスク名   | TASK-10A-E-B UI/UX インポート一覧設計 |
| 前提Phase  | -                                     |
| 後続Phase  | Phase 2                               |
| 作成日     | 2026-03-06                            |
| ステータス | completed                             |
| 担当       | SubAgent-B                            |

## 目的

`SkillManagementPanel` の list view に imported / available の2セクションを追加し、検索、追加確認、空状態、失敗表示、アクセシビリティを同じ基準で扱うための要件を固定する。

## 背景

現行の `SkillManagementPanel` はインポート済みスキルの検索と編集導線を提供しているが、`availableSkillsMetadata` と `importSkill` を使った追加導線は list view に統合されていない。`SkillSelector` には2セクション表示の先行実装があり、Store には idempotent import と個別selectorが揃っている。

## Atent Team 編成

| SubAgent | 関心ごと         | 主担当内容                                           |
| -------- | ---------------- | ---------------------------------------------------- |
| B1       | 情報設計         | 2セクション順序、件数表示、検索適用範囲              |
| B2       | 状態と文言       | loading / empty / no-result / error / success の整理 |
| B3       | アクセシビリティ | aria属性、Tab順、ダイアログ復帰フォーカス            |
| B4       | テスト統合       | Phase 4 以降に渡す観点の統合                         |

## 実行タスク

- 要件抽出: 現行 UI、Store、既存テスト、システム仕様から機能要件と非機能要件を抽出する
- 受け入れ基準化: セクション表示、検索、追加導線、状態優先順位、A11y要件を検証可能な条件へ分解する
- スコープ定義: 実装対象、非対象、A/C/D タスクへの引き渡し境界を固定する
- ギャップ整理: 現行 `SkillManagementPanel` の imported 偏重実装と新仕様との差分を一覧化する
- 防御要件抽出: duplicate import、欠損メタデータ、偽失敗、focus drift を要件へ取り込む

## 参照資料

### 親タスク・コード

| 資料名            | パス                                                                                             | 用途                                 |
| ----------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------ |
| 親タスク仕様      | `../task-043b-ui-ux-import-list-design.md`                                                       | スコープと完了条件                   |
| 現行パネル        | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                            | 現在の list / search / delete UI     |
| 先行2セクションUI | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`                                   | imported / available 表示パターン    |
| 確認ダイアログ    | `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`                               | 追加前確認とフォーカス管理           |
| 単体テスト        | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx`             | 既存 list view の保証範囲            |
| 統合テスト        | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx` | currentView 遷移の保証範囲           |
| Store公開Hook     | `apps/desktop/src/renderer/store/index.ts`                                                       | 個別selector / action の存在確認     |
| agentSlice        | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                           | available/imported/import の状態契約 |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                                        | 用途                                          |
| -------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------- |
| resource-map         | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 読み込む正本仕様の特定                        |
| quick-reference      | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                         | P31対策、Result、IPC境界の先行固定            |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | empty/loading/error と Organisms 基準         |
| UI設計原則           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | 文言、フォーカス、ライブリージョン            |
| UI機能仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SearchFilterList / CardGrid の整合            |
| UIアーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   | SkillManagementPanel の責務境界               |
| 状態管理             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | `availableSkillsMetadata` / idempotent import |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | `skill.id/name` 混同防止と境界変換の固定      |
| Skill管理I/F         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | `skill:list` / `skill:getImported` / `import` |
| エラー仕様           | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラー表示と再試行方針                        |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | coverage と a11y 品質基準                     |
| タスク運用           | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                  | Phase品質ゲート                               |

## 実行手順

1. 現行 `SkillManagementPanel`、`SkillSelector`、`SkillImportDialog`、`agentSlice` を読み、既存 UI と state 契約を列挙する。
2. imported / available 2セクション、検索、追加導線、状態表示、A11y の機能要件を FR と NFR に分解する。
3. 見出し、CTA、空状態、失敗表示の文言方針を `ui-ux-design-principles.md` に合わせて固定する。
4. `TASK-10A-E-A` と `TASK-10A-E-C` が扱う IPC / Store 境界を侵食しない非スコープ条件を記録する。
5. `SkillCenterView` の nullish 防御契約と `skill:import` の idempotent 成功条件を task-043b の要件へ落とし込む。

## 統合テスト連携

- `useAvailableSkillsMetadata` と `useImportedSkills` の組み合わせで mixed state を再現できることを要件に含める。
- `useImportSkill` の idempotent guard と `useImportingSkillName` の row disabled 条件を Phase 4 の統合観点へ引き渡す。
- 既存の `SkillManagementPanel.integration.test.tsx` が担う currentView 遷移を壊さない条件を明記する。
- `description ?? ""` を前提にした検索と描画継続条件を Phase 4 / 6 のテスト観点へ引き渡す。

## 多角的チェック観点

| 観点               | 本Phaseで確認する内容                                                                  | 仕様参照先                                                                                                                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 新規IPC/Preload/API追加なしを維持し、Renderer内のUI設計に閉じること                    | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`, `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                      |
| UI/UX              | 2セクション、状態表示、文言、フォーカス、ライブリージョン、44pxターゲットを確認する    | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`      |
| アーキテクチャ     | `SkillManagementPanel` の責務境界と既存 `editor/analysis/create` view 非侵食を確認する | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                  |
| API/IPC            | `skill:list` / `skill:getImported` / `skill:import` の既存契約再利用に限定する         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`, `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                  |
| エラーハンドリング | 擬似失敗、二重追加、stale error、再試行導線を確認する                                  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                      |
| テスタビリティ     | TC-ID、selector、fixture、manual evidence の対応を維持する                             | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`, `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md` |

### Electronデスクトップアプリ観点

| 層       | 本Phaseで確認する内容                                                  | 仕様参照先                                                                                                                                                      |
| -------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renderer | list view / dialog / live region / focus contract を定義または検証する | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                                                         |
| Main     | 新規サービス追加なし、既存 handler 契約を変えない                      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| IPC通信  | 既存 `skill:*` channel を再利用し、新規 channel を追加しない           | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                                            |
| Preload  | 新規公開API追加なしを確認する                                          | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                                                    |
| Store    | `agentSlice` 個別selector と idempotent import 契約を維持する          | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                    |

## 成果物

| 成果物       | パス                                         | 説明                           |
| ------------ | -------------------------------------------- | ------------------------------ |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | FR / NFR 一覧                  |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証条件と判定方法             |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象 / 非対象 / 依存境界       |
| 状態棚卸し   | `outputs/phase-1/ui-state-inventory.md`      | 現行 state と追加 state の整理 |

## 完了条件

- [x] imported / available の2セクション要件が明文化されている
- [x] 検索、追加導線、loading、empty、no-result、error、success の要件が分離されている
- [x] `SkillSelector` 再利用元と `SkillManagementPanel` 差分が明記されている
- [x] 欠損メタデータ防御と `importedCount` 非依存の成功判定が要件化されている
- [x] IPC追加なし、Store state追加なしの非スコープ条件が明記されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 現行コード確認
2. aiworkflow仕様抽出
3. FR/NFR整理
4. スコープ固定
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブルの全ファイルを出力
- [x] 完了条件を全件確認

## 次のPhase

Phase 2: 設計
