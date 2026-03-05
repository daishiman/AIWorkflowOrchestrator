# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 1                                          |
| タスクID   | UT-TASK-10A-B-003                          |
| 機能名     | task-10a-b-improvement-result-breakdown-ui |
| タスク名   | 改善結果内訳表示実装                       |
| 作成日     | 2026-03-05                                 |
| 前提Phase  | なし                                       |
| 後続Phase  | Phase 2                                    |
| タスク種別 | completed（実装・テスト・文書化完了）      |

## 目的

SkillAnalysisView の改善実行結果（成功/失敗/スキップ）をユーザーが即時に判別できる要件を定義する。

## 背景

現状は ImprovementResult.errors が UI に露出せず、部分失敗時の再試行判断が難しいため、表示要件と受け入れ基準の先行確定が必要。

## 実行タスク

| Task     | 内容                  | 目的                                                     | 実行パターン |
| -------- | --------------------- | -------------------------------------------------------- | ------------ |
| Task 1-1 | 機能要件定義（FR）    | 表示対象（applied/skipped/errors）と表示条件を定義する。 | seq          |
| Task 1-2 | 非機能要件定義（NFR） | 可読性・アクセシビリティ・レスポンス要件を定義する。     | seq          |
| Task 1-3 | 受け入れ基準作成      | 部分失敗を含む検証可能なACを作成する。                   | seq          |
| Task 1-4 | スコープ境界確定      | UI表示対象と除外範囲（改善アルゴリズム本体）を分離する。 | seq          |

- タスク実行: 実行タスク表の項目を順に完了し、成果物へ反映する。

## Atent Team SubAgent分担（関心分離）

| SubAgent   | 関心ごと                        | 主成果物                     | 実行パターン |
| ---------- | ------------------------------- | ---------------------------- | ------------ |
| SubAgent-A | UI要件（表示構造・文言）        | 要件定義書のUI要件セクション | seq          |
| SubAgent-B | データ契約（ImprovementResult） | 受け入れ基準の入力データ定義 | seq          |
| SubAgent-C | 品質要件（a11y/テスト）         | NFRと検証観点                | seq          |

## 参照資料

| 参照資料         | パス                                                                                          | 内容                            |
| ---------------- | --------------------------------------------------------------------------------------------- | ------------------------------- |
| 入力タスク指示書 | docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui.md               | Why/What/How と完了条件の正本   |
| 親ワークフロー   | docs/30-workflows/completed-tasks/skill-analysis-view/                                        | TASK-10A-B 本体仕様と成果物参照 |
| 前Phase仕様      | -                                                                                             | 前提条件と引き継ぎ事項          |
| Phase 10 指摘元  | docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-10/final-review-result.md | MINOR M3 の原文確認             |

## システム仕様抽出（aiworkflow-requirements）

| 仕様               | パス                                                                                      | 適用内容                                         |
| ------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 抽出ナビ           | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                            | 対象仕様の選定漏れを防ぐ                         |
| 機能別UI           | .claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md             | SkillAnalysisView の責務と未タスク背景を確認する |
| UIコンポーネント   | .claude/skills/aiworkflow-requirements/references/ui-ux-components.md                     | 表示階層とUI整合を確認する                       |
| UI設計原則         | .claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md              | Apple HIG/WCAG観点の要件を定義する               |
| デザインシステム   | .claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md                  | トークン/配色/余白の要件を定義する               |
| UIアーキテクチャ   | .claude/skills/aiworkflow-requirements/references/arch-ui-components.md                   | view/molecule責務境界を要件化する                |
| 実装パターン       | .claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md | UI実装の再利用パターンを要件へ反映する           |
| 型契約             | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md           | ImprovementResult 契約を確認する                 |
| 状態管理           | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                | agentSlice の分析/改善状態を確認する             |
| IPC API            | .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md                        | skill:improve 契約を確認する                     |
| API一覧            | .claude/skills/aiworkflow-requirements/references/api-endpoints.md                        | IPC命名規則・契約整合ルールを要件化する          |
| セキュリティ境界   | .claude/skills/aiworkflow-requirements/references/security-api-electron.md                | Renderer-Preload-Main 境界を確認する             |
| IPCセキュリティ    | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md                | sender検証・sanitize方針を要件化する             |
| エラーハンドリング | .claude/skills/aiworkflow-requirements/references/error-handling.md                       | 失敗理由表示時のエラー表現を整合させる           |
| a11yテスト指針     | .claude/skills/aiworkflow-requirements/references/testing-accessibility.md                | a11y受け入れ基準を検証可能な粒度で定義する       |

## 実行手順

1. 参照資料を確認し、入力条件と制約を確定する（seq）。
2. SubAgentごとの成果物草案を作成する（par）。
3. SubAgent成果物を統合し、欠落観点を解消する（seq）。
4. 完了条件チェックを実施し、次Phaseへ引き継ぐ（seq）。

## 統合テスト連携（Phase 1〜11は必須）

Phase 4 のテスト設計で再利用するため、FR/AC を「入力状態（applied/skipped/errors）」単位で識別可能に定義する。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                     | 仕様参照先                                  |
| ------------------ | -------------------------------------------- | ------------------------------------------- |
| セキュリティ       | 入力検証・境界防御・エラー露出制御を扱う場合 | aiworkflow-requirements: security-\*.md     |
| UI/UX              | 表示構造・情報設計・操作性を扱う場合         | aiworkflow-requirements: ui-ux-\*.md        |
| アーキテクチャ     | 責務分離・状態遷移・依存関係を扱う場合       | aiworkflow-requirements: architecture-\*.md |
| API設計            | IPC契約・レスポンス形式を扱う場合            | aiworkflow-requirements: api-\*.md          |
| データ整合性       | 型契約・状態整合を扱う場合                   | aiworkflow-requirements: interfaces-\*.md   |
| エラーハンドリング | 失敗理由表示・回復導線を扱う場合             | aiworkflow-requirements: error-handling.md  |
| アクセシビリティ   | 読み上げ・キーボード操作を扱う場合           | aiworkflow-requirements: ui-ux-\*.md        |

## 成果物

| 成果物       | パス                                       | 内容                                       |
| ------------ | ------------------------------------------ | ------------------------------------------ |
| 要件定義書   | outputs/phase-1/requirements-definition.md | 表示対象・表示条件・禁止事項を明文化する   |
| 受け入れ基準 | outputs/phase-1/acceptance-criteria.md     | 正常系/異常系/部分失敗の検証項目を定義する |
| スコープ定義 | outputs/phase-1/scope-definition.md        | 実施対象と非対象を分離する                 |

## 完了条件

- [ ] applied/skipped/errors の表示要件が重複なく定義されている。
- [ ] 受け入れ基準がテストケースへ直接変換できる粒度である。
- [ ] 改善アルゴリズム変更がスコープ外であることが明記されている。
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料確認
2. 実行タスク実施
3. SubAgent成果物統合
4. 成果物配置確認
5. 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui --phase 1
```

## 次のPhase

Phase 2: 設計（phase-2-design.md）
