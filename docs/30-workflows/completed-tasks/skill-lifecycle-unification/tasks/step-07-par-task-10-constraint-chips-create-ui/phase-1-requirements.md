# Phase 1: 要件定義 — ConstraintChips

## メタ情報

| 項目       | 値                                                                 |
| ---------- | ------------------------------------------------------------------ |
| タスクID   | TASK-IMP-LIFECYCLE-CONSTRAINT-CHIPS-001                            |
| Phase      | 1 / 13                                                             |
| 目的       | ConstraintChips コンポーネントの要件を明確化し、実装範囲を固定する |
| 前提成果物 | なし（本 Phase が起点）                                            |
| 成果物     | `outputs/phase-1/requirements-analysis.md`                         |

## 目的

`ui-ux-realization.md` L34–38 に定義された create ステップ必須UI「constraint chips」について、以下3点を明確化する。

1. constraint chips が受け持つ制約条件の定義（何を入力・表示するのか）
2. 既存 FilterChip と本コンポーネントの責務境界（再利用 vs 新規作成の判断根拠）
3. `SkillLifecyclePanel` の create ステップへの統合位置と状態管理方針

## 参照資料

| 資料                | パス                                                                               | 参照目的                                    |
| ------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------- |
| UI/UX 正本          | `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md` L34–38        | create ステップの必須UI仕様抽出             |
| UI/UX 図解          | `docs/30-workflows/skill-lifecycle-unification/ui-ux-diagrams.md` L56–71, L134–147 | ConstraintChips / ConstraintChipList の位置 |
| FilterChip atom     | `apps/desktop/src/renderer/components/atoms/FilterChip/index.tsx`                  | インターフェース・スタイルパターン調査      |
| FilterChip テスト   | `apps/desktop/src/renderer/components/atoms/FilterChip/FilterChip.test.tsx`        | 既存テストパターン確認                      |
| SkillChip organism  | `apps/desktop/src/renderer/components/organisms/AgentView/SkillChip.tsx`           | 類似 chip UIパターン調査                    |
| SkillLifecyclePanel | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`               | create フロー・状態・DOM構造確認            |
| shared 型定義       | `packages/shared/src/` 配下の関連ファイル                                          | SkillConstraint 型の配置先検討              |

**命名対応注記**: `ui-ux-diagrams.md` の Core Journey 図における `ConstraintChips` は atom（単一チップ: `ConstraintChip`）に、Skill Lifecycle Panel 図における `ConstraintChipList` は molecule（チップ一覧 + 入力フィールド）に対応する。

## 実行手順

### スコープ定義

- chip テキストのインライン編集（ダブルクリック等によるラベル変更）は本タスクのスコープ外とする。編集が必要な場合は削除→再追加で対応する。

### Task 1: ui-ux-realization.md から constraint chips 仕様要件を抽出する

対象: `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md` L34–38

抽出する内容:

- create ステップで「constraint chips」が担う役割（何を制約するのか）
- constraint chips が goal input / generate CTA と連携する順序・関係
- 状態マトリクス（L52–62）との対応（ready 状態での表示ルール）

記録形式: 箇条書き（曖昧表現を含まず、条件・基準を明示すること）

### Task 2: 既存 FilterChip のインターフェースを調査する

対象: `apps/desktop/src/renderer/components/atoms/FilterChip/index.tsx`

調査する内容:

- Props 定義: `label`, `isSelected`, `count`, `icon`, `onClick`, `disabled` の型・用途
- スタイル実装: `clsx` 使用パターン、CSS変数（`--status-primary`, `--bg-tertiary`）の使用箇所
- `role="checkbox"` と `aria-checked` による ARIA 設計

判定基準: FilterChip を constraint chip として再利用できるか否かを、Props の意味的ミスマッチ（`isSelected` の概念が「選択済みフィルター」vs「追加済み制約条件」で異なるか）で判定する。

### Task 3: SkillLifecyclePanel の create ステップの DOM 構造を確認する

対象: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

確認する内容:

- `request` state を入力する textarea の JSX 位置（行番号を記録する）
- `handlePrepare` が呼ばれる前後の UI フロー
- constraint chips を配置すべき位置（textarea の直下か、generate CTA の直上か）
- 既存 state 群（`request`, `detectedMode`, `createdSkillPath` 等）との競合有無

### Task 4: ConstraintChips に入力される制約条件のデータモデルを定義する

設計対象: `SkillConstraint` 型

要件:

- 各 chip を一意に識別できる `id: string` を持つこと（キー衝突防止）
- ユーザーが入力したテキストを保持する `label: string` を持つこと
- カテゴリ分類（任意）を保持する `category?: string` を持つこと（Phase 2 設計で必要性を確定する）
- 配置先の候補: `packages/shared/src/`（共有型）か `SkillLifecyclePanel.tsx` のローカル型か

判定基準: `SkillCreatorAPI` や他コンポーネントが `SkillConstraint` を参照する場合は `@repo/shared` に配置する。`SkillLifecyclePanel` のみが参照する場合はローカル型で足りる。

### Task 5: SkillCreatorAPI への制約条件受け渡しインターフェースを調査する

対象: `SkillLifecyclePanel.tsx` 内の `handleCreate` 関数、および `window.electronAPI?.skillCreator` の型定義

確認する内容:

- `createSkill`（`useCreateSkill`）が受け取る引数の型
- `constraints: SkillConstraint[]` を渡す経路が存在するか、または新規追加が必要か
- IPC ハンドラ側（`skill:create` チャンネル）の引数スキーマとの整合性

## 統合テスト連携

本 Phase は要件定義であり、統合テストコードは作成しない。ただし以下の点を `requirements-analysis.md` に明記し、Phase 4 のテスト設計に引き継ぐこと。

- constraint chips の追加・削除・最大件数超過の境界値ケース
- `SkillLifecyclePanel` の create フローにおける constraint chips 未入力時の挙動（エラーか無視か）
- キーボード操作（Tab / Enter / Delete）での chip 追加・削除の期待挙動

## 多角的チェック観点

| 観点               | チェック内容                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| 既存 UI 整合性     | FilterChip との Props 命名・意味的差異が明確に文書化されているか                                    |
| データモデル妥当性 | `SkillConstraint.id` が一意性を保証できるか（`crypto.randomUUID()` または `Date.now()` の採用根拠） |
| IPC 整合性         | `createSkill` の引数拡張が必要か否かの判定根拠が明示されているか                                    |
| アクセシビリティ   | chip の追加・削除操作がキーボードで完結できる仕様になっているか                                     |
| スコープ境界       | constraint chips の実装範囲が「SkillLifecyclePanel の create ステップのみ」に限定されているか       |

## 成果物

### 必須出力ファイル

パス: `docs/30-workflows/skill-lifecycle-unification/tasks/step-07-par-task-10-constraint-chips-create-ui/outputs/phase-1/requirements-analysis.md`

必須セクション:

1. **constraint chips 要件サマリー**: ui-ux-realization.md から抽出した制約条件の役割・表示ルール
2. **FilterChip との差異分析**: 再利用可否の判定と根拠
3. **DOM 配置位置**: `SkillLifecyclePanel.tsx` での統合位置（行番号を含む）
4. **SkillConstraint 型定義案**: `id`, `label`, `category?` のフィールド設計と配置先判定
5. **SkillCreatorAPI 整合性調査結果**: 引数拡張が必要か否かの判定
6. **Phase 4 テスト設計への引き継ぎ事項**: 境界値ケース・キーボード操作仕様

## 完了条件

- [ ] `outputs/phase-1/requirements-analysis.md` が作成されている
- [ ] create ステップで constraint chips が担う役割が、「何をどう制約するか」まで明記されている（「適切に」等の曖昧表現を含まない）
- [ ] FilterChip を再利用するか新規作成するかの判定が、Props の意味的差異に基づいて記載されている
- [ ] `SkillConstraint` 型の必須フィールドが確定し、配置先（shared か local か）の判定根拠が記載されている
- [ ] `SkillLifecyclePanel.tsx` において constraint chips を挿入すべき JSX の位置が行番号で特定されている
- [ ] IPC（`createSkill` 引数）への拡張要否が明記されている

## 次 Phase

Phase 2: 設計 — `phase-2-design.md`

移行条件: 本 Phase の完了条件を全て満たしていること。
