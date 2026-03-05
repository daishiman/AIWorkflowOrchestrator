# aiworkflow-requirements 抽出マトリクス

## メタ情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| タスクID | UT-TASK-10A-B-001                |
| タスク名 | 自動修正可能フィルタボタン実装   |
| 作成日   | 2026-03-05                       |
| 用途     | Phase 1〜13 仕様書の参照根拠固定 |

## 抽出方針（Progressive Disclosure）

1. `indexes/resource-map.md` と `indexes/quick-reference.md` を起点に必要カテゴリだけを抽出する。
2. UI/状態管理/API契約/インターフェース/セキュリティ/テスト/品質の7観点で必要最小限を抽出する。
3. 各Phaseの「参照資料」には、この表で確定した正本のみを採用する。

## 仕様書別の適用範囲

| 観点             | 参照仕様                                                                                    | 適用内容                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| UI/UX            | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | `SkillAnalysisView` / `SuggestionList` の責務・既存構成・未タスク台帳の整合 |
| UI/UX            | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | コンポーネント階層とアクセシビリティ観点（ラベル・操作導線）                |
| アーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   | View/Component の責務分離、統合時の境界維持                                 |
| 状態管理         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | `agentSlice` / Hook の状態遷移とセレクタ指針                                |
| API契約          | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | `skill:analyze` / `skill:improve` 既存契約を壊さないことの確認              |
| インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | `Suggestion` を含む契約型と IPC 返却型の整合確認                            |
| セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | 入力検証とエラーサニタイズ方針の確認（契約変更なし判定）                    |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P42/P44 系の再発防止（型ドリフト/バリデーション漏れ）                       |
| エラー処理       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | UI操作失敗時の表示ポリシーと分類                                            |
| 品質             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジ閾値、Phaseゲート品質基準                                         |
| テスト           | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | RTL/Vitest のコンポーネントテスト構造、a11y検証パターン                     |
| ワークフロー     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | Phase 12 での台帳同期（完了/未タスク）手順                                  |
| 開発指針         | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | 実装・レビュー時の命名/責務/可読性基準                                      |
| 教訓             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | TASK-10A 系の再発ポイント反映                                               |

## タスク固有の一次情報

| 種別                       | パス                                                                                               | 用途                                  |
| -------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------- |
| 元タスク指示書             | `docs/30-workflows/completed-tasks/task-10a-b-autofixable-filter-button.md`                        | Why/What/How の原文要件               |
| 親タスク仕様書             | `docs/30-workflows/completed-tasks/skill-analysis-view/index.md`                                   | 既存Phase構成・依存コンポーネント参照 |
| 親タスク Phase 1 要件      | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-1/requirements-definition.md` | FR-3-2（auto-fixable選択）の基準      |
| 親タスク Phase 10 レビュー | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-10/final-review-result.md`    | 未実装指摘（MINOR M1）の根拠          |

## Phase別の必須参照

| Phase | 必須参照                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------ |
| 1     | 元タスク指示書、親タスク Phase 1 要件、ui-ux-feature-components                                  |
| 2     | arch-ui-components、arch-state-management、ui-ux-components、interfaces-agent-sdk-skill          |
| 3     | quality-requirements、development-guidelines                                                     |
| 4     | testing-component-patterns、親タスク既存テストファイル                                           |
| 5     | arch-state-management、error-handling、development-guidelines、api-ipc-agent、security-skill-ipc |
| 6     | testing-component-patterns、quality-requirements                                                 |
| 7     | quality-requirements                                                                             |
| 8     | development-guidelines、arch-ui-components、architecture-implementation-patterns                 |
| 9     | quality-requirements、error-handling、security-skill-ipc                                         |
| 10    | quality-requirements、task-workflow、interfaces-agent-sdk-skill                                  |
| 11    | ui-ux-feature-components、testing-component-patterns                                             |
| 12    | task-workflow、ui-ux-feature-components、lessons-learned、spec-update-workflow                   |
| 13    | task-workflow、quality-requirements                                                              |

## 抽出実施ログ（今回）

| キーワード               | 主なヒット仕様                                                               | 反映判断                                       |
| ------------------------ | ---------------------------------------------------------------------------- | ---------------------------------------------- |
| `Suggestion`             | `arch-state-management.md`, `interfaces-agent-sdk-skill.md`                  | 型境界の再確認が必要（採用）                   |
| `applySkillImprovements` | `arch-ui-components.md`, `arch-state-management.md`, `lessons-learned.md`    | Hook/API境界の再発防止に必要（採用）           |
| `skill:analyze`          | `api-ipc-agent.md`, `interfaces-agent-sdk-skill.md`, `security-skill-ipc.md` | API契約を変更しない条件確認に必要（採用）      |
| `SkillAnalysisView`      | `ui-ux-feature-components.md`, `task-workflow.md`, `arch-ui-components.md`   | 既存責務と未タスク台帳の整合確認に必要（採用） |
| `autoFixable`            | `task-workflow.md`, `ui-ux-feature-components.md`                            | 元未タスクIDの存在確認に必要（採用）           |

## 抽出完全性チェック（採用/非採用）

| カテゴリ       | 候補仕様                        | 判定   | 理由                                                                  |
| -------------- | ------------------------------- | ------ | --------------------------------------------------------------------- |
| UI責務         | `ui-ux-feature-components.md`   | 採用   | `SkillAnalysisView` / `SuggestionList` の責務と未タスク導線が含まれる |
| UI詳細         | `ui-ux-components.md`           | 採用   | a11yラベル・表示粒度の確認に必要                                      |
| UI設計原則     | `ui-ux-design-principles.md`    | 非採用 | 今回は新規デザイン体系の追加がなく、既存UI部品の挙動追加のみ          |
| 状態管理       | `arch-state-management.md`      | 採用   | `applySkillImprovements` 系の状態遷移境界を確認するため               |
| アーキテクチャ | `arch-ui-components.md`         | 採用   | View/Hook責務分離の検証に必要                                         |
| API契約        | `api-ipc-agent.md`              | 採用   | `skill:analyze` / `skill:applyImprovements` 契約非変更判定に必要      |
| IF契約         | `interfaces-agent-sdk-skill.md` | 採用   | `Suggestion` 型の整合確認に必要                                       |
| セキュリティ   | `security-skill-ipc.md`         | 採用   | 入力検証・エラーサニタイズの継続適用を確認するため                    |
| エラー処理     | `error-handling.md`             | 採用   | 操作失敗時のUI表示方針確認に必要                                      |
| 品質基準       | `quality-requirements.md`       | 採用   | Phase 3/7/9/10 のゲート条件定義に必要                                 |
| テスト基準     | `testing-component-patterns.md` | 採用   | RTL/Vitest のテスト粒度を固定するため                                 |
| 台帳同期       | `task-workflow.md`              | 採用   | Phase 12 Step 1-A/1-C/1-E の同期先として必要                          |
| 教訓           | `lessons-learned.md`            | 採用   | TASK-10A系の再発防止パターン抽出に必要                                |
| 仕様更新手順   | `spec-update-workflow.md`       | 採用   | Phase 12 Step 1-A〜1-G と Step 2 の必須手順定義                       |

## 再現コマンド（抽出根拠）

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "Suggestion" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "applySkillImprovements" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "skill:analyze" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "SkillAnalysisView" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "autoFixable" -C 2
```

## 抽出結論

- 今回実装に必要な仕様は UI/状態/API/IF/セキュリティ/品質/テスト/台帳同期の8系統で網羅した。
- 非採用仕様は「新規契約・新規設計原則の追加が発生しない」ことを理由に除外し、除外理由を明記した。
- Phase 12 は `spec-update-workflow.md` を必須参照に固定し、Step単位で漏れ検知可能な状態にした。
