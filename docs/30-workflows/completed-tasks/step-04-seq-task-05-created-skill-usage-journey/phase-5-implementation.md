# Phase 5: 実装

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 5                                                        |
| Phase名    | 実装                                                     |
| タスクID   | TASK-SKILL-LIFECYCLE-05                                  |
| タスク名   | 作成済みスキルを使う主導線                               |
| 機能名     | created-skill-usage-journey                              |
| 前提Phase  | [phase-4-test-creation.md](./phase-4-test-creation.md)   |
| 後続Phase  | [phase-6-test-expansion.md](./phase-6-test-expansion.md) |
| ステータス | not_started                                              |
| 作成日     | 2026-03-15                                               |

## 目的

設計タイプのタスクのため、「実装」は設計文書の outputs 精緻化・決定事項の確定を意味する。Phase 1〜4 の仕様書をレビューし、各 outputs ディレクトリに成果物ファイルを作成することで、Phase 5 完了後に設計の全決定事項が成果物として参照可能な状態にする。

## 実行タスク

- タスク1: outputs/phase-1/ の成果物4件を確定（要件定義書・スコープ定義・仕様抽出マップ・利用シナリオ表）
- タスク2: outputs/phase-2/ の成果物5件を確定（画面遷移設計・コンポーネント設計・状態管理設計・IPC連携設計・品質表示配置設計）
- タスク3: outputs/phase-3/ の成果物5件を確定（要件-設計突合マトリクス・依存契約適合レポート・UI/UXレビュー・技術妥当性レポート・ゲート判定記録）
- タスク4: outputs/phase-4/ の成果物6件を確定（Phase 4 テスト設計の全テストケース）
- タスク5: 全 outputs 間の整合性検証と最終確定

## 参照資料

| 参照資料             | パス                                                                                                                         | 説明                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Phase 1 要件定義     | [phase-1-requirements.md](./phase-1-requirements.md)                                                                         | 3シナリオ・導線比較・品質要件               |
| Phase 2 設計         | [phase-2-design.md](./phase-2-design.md)                                                                                     | 画面遷移・コンポーネント・状態管理・IPC設計 |
| Phase 3 設計レビュー | [phase-3-design-review.md](./phase-3-design-review.md)                                                                       | ゲート判定・指摘事項                        |
| Phase 4 テスト設計   | [phase-4-test-creation.md](./phase-4-test-creation.md)                                                                       | 設計検証テストケース全16+16+5+4+5=46件      |
| Task04 スコアモデル  | `../../../completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-2/scoring-gate-matrix.md`            | ScoringGate 型定義                          |
| Task04 ゲート遷移    | `../../../completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-2/gate-transition-design.md`         | EP-3/EP-4 フロー                            |
| Task01 画面責務      | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-2/surface-responsibility-matrix.md` | 画面別責務・禁止事項                        |
| Task01 依存契約      | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-2/dependency-contracts.md`          | Task05 への入力・出力・禁止事項             |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                           |
| -------------------------- | --------------------------------------------------------------------------------- | ------------------------------ |
| ui-ux-agent-execution      | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`      | Agent 実行画面の導線           |
| ui-ux-feature-components   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | Skill Center / Workspace       |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | スキル関連インターフェース契約 |
| arch-state-management      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | 状態管理・Store 設計           |

## 実行手順

### ステップ1: outputs/phase-1/ 成果物の確定（タスク1）

Phase 1 仕様書（`phase-1-requirements.md`）の実行手順・成果物セクションの内容を `outputs/phase-1/` 配下の各ファイルとして出力する。

#### 1-1: requirements-definition.md（要件定義書）

**出力先**: `outputs/phase-1/requirements-definition.md`

確定すべき内容:

- 3つの利用シナリオ（シナリオA/B/C）の詳細フロー（Phase 1 ステップ1 の全テーブル）
- 主利用導線の比較結果（Workspace vs Agent の比較テーブル + 二段構成方針の決定記録）
- 発見導線6経路の要件テーブル（Phase 1 ステップ3）
- 改善フィードバックループのフロー図（Phase 1 ステップ4）

#### 1-2: scope-definition.md（スコープ定義）

**出力先**: `outputs/phase-1/scope-definition.md`

確定すべき内容:

- 対象範囲: 利用導線（シナリオA/B/C）/ Skill Center UI / Agent 実行結果画面 / 品質表示コンポーネント
- 除外範囲: スキル作成本体（Task03 スコープ）/ 評価採点ロジック本体（Task04 スコープ）/ ナビゲーション設計全体（Task01 スコープ）
- Task01/03/04 との境界線定義

#### 1-3: spec-extraction-map.md（仕様抽出マップ）

**出力先**: `outputs/phase-1/spec-extraction-map.md`

確定すべき内容:

- Phase 1 ステップ6 の仕様抽出マップテーブル（7行）の確認ステータスを `確認済み` に更新
- 各参照先ファイルで確認した主要仕様の概要（1〜3行）

#### 1-4: usage-scenario-table.md（利用シナリオ表）

**出力先**: `outputs/phase-1/usage-scenario-table.md`

確定すべき内容:

- シナリオA/B/C の各フィールド（開始地点・前提条件・主アクション・完了地点・代替経路・ブロック条件）を統合した比較テーブル
- 3シナリオが収束する「Agent 実行完了」という共通ゴールの明記

---

### ステップ2: outputs/phase-2/ 成果物の確定（タスク2）

Phase 2 仕様書（`phase-2-design.md`）の設計内容を `outputs/phase-2/` 配下の各ファイルとして出力する。

#### 2-1: screen-transition-design.md（画面遷移設計）

**出力先**: `outputs/phase-2/screen-transition-design.md`

確定すべき内容:

- シナリオA の画面遷移フロー図（EP-1 採点完了 → Workspace → Agent → 結果）
- シナリオB の画面遷移フロー（Skill Center → SkillDetailPanel → Workspace → Agent）
- シナリオC の画面遷移フロー（Agent 履歴タブ → Agent 再実行 / 改善フロー）
- CTA 仕様テーブル（4種 × 表示条件 / 遷移先 / スタイル）
- PostExecutionActionBar の4アクション仕様

#### 2-2: component-design.md（コンポーネント設計）

**出力先**: `outputs/phase-2/component-design.md`

確定すべき内容:

- コンポーネントツリー全体（SkillCenterView / AgentView 拡張部分）
- SkillCard コンポーネント仕様テーブル（6要素）
- SkillDetailPanel セクション定義（5セクション）
- ScoreGateBadge の TypeScript インターフェース定義と GATE_BADGE_CONFIG マッピング
- PostExecutionActionBar の4ボタン定義
- Atomic Design レベル分類（atoms/molecules/organisms）

#### 2-3: state-management-design.md（状態管理設計）

**出力先**: `outputs/phase-2/state-management-design.md`

確定すべき内容:

- skillSlice 追加フィールド（`favoriteSkillNames: Set<string>` / `recentlyUsedSkills` の型定義）
- agentSlice 追加フィールド（`lastExecutionResult` / `postExecutionScore` の型定義）
- 個別セレクタの設計コード（`useFavoriteSkillNames` / `useRecentlyUsedSkills` with `useShallow` / `useLastExecutionResult` / `usePostExecutionScore`）
- P31/P48 準拠の根拠説明
- `recentlyUsedSkills` のリセットタイミング定義（上限20件、新規実行時に先頭追加）
- Zustand persist の `customStorage` Set 型対応実装方針

#### 2-4: ipc-integration-design.md（IPC 連携設計）

**出力先**: `outputs/phase-2/ipc-integration-design.md`

確定すべき内容:

- IPC チャネル利用計画テーブル（`skill:optimize:evaluate` 再利用 / `skill:list` 再利用 / お気に入り IPC 不要の根拠）
- EP-3（利用前評価）の呼び出し仕様（タイミング / 引数 / 戻り値 / P42 バリデーション設計）
- EP-4（利用後再評価）の呼び出し仕様（タイミング / 引数 / 戻り値 / EP-3 との区別）
- P42/P44/P45 準拠確認の根拠記録

#### 2-5: quality-display-placement.md（品質表示配置設計）

**出力先**: `outputs/phase-2/quality-display-placement.md`

確定すべき内容:

- 7地点 × コンポーネント × 配置場所 × 表示モードの設計テーブル（Phase 2 ステップ3 の配置表）
- ScoreGateBadge / ScoreDisplay / ScoreDelta / ScoringGateBanner の使い分け基準
- compact / full / banner / delta / inline の各モードの表示内容定義

---

### ステップ3: outputs/phase-3/ 成果物の確定（タスク3）

Phase 3 仕様書（`phase-3-design-review.md`）のレビュー結果を `outputs/phase-3/` 配下の各ファイルとして出力する。

#### 3-1: requirements-design-matrix.md（要件-設計突合マトリクス）

**出力先**: `outputs/phase-3/requirements-design-matrix.md`

確定すべき内容:

- Phase 3 ステップ1 の突合マトリクステーブル（10行）の突合結果を `PASS` / `GAP（内容）` で埋める
- GAP が存在する場合は設計補完事項として記録

#### 3-2: dependency-contract-report.md（依存契約適合レポート）

**出力先**: `outputs/phase-3/dependency-contract-report.md`

確定すべき内容:

- Task01 依存契約チェック（7項目）の適合結果（PASS / FAIL + 根拠）
- Task04 契約チェック（5項目）の適合結果（PASS / FAIL + 根拠）
- 全項目 PASS であることの確認または差異の記録

#### 3-3: ui-ux-review-report.md（UI/UX レビューレポート）

**出力先**: `outputs/phase-3/ui-ux-review-report.md`

確定すべき内容:

- Phase 3 ステップ3 の全チェック項目（CTA 視認性4項目 / 再利用入口4項目 / 改善戻り4項目 / A11y 4項目 / Apple HIG 4項目）の判定結果
- MINOR 以上の指摘事項の一覧（指摘テンプレート形式）

#### 3-4: technical-review-report.md（技術妥当性レポート）

**出力先**: `outputs/phase-3/technical-review-report.md`

確定すべき内容:

- Phase 3 ステップ4 の全チェック項目（IPC 5項目 / 状態管理 5項目 / コンポーネント 5項目）の判定結果
- P31/P48/P42/P44/P45/P46/P47 の各落とし穴への対処状況

#### 3-5: gate-decision.md（ゲート判定記録）

**出力先**: `outputs/phase-3/gate-decision.md`

確定すべき内容:

- ゲート判定結果（PASS / MINOR / MAJOR の判定）
- 指摘事項一覧（MAJOR 0件であることの確認）
- MINOR 指摘がある場合は対応済みの記録
- Phase 4 以降に進む承認記録

---

### ステップ4: outputs/phase-4/ 成果物の確定（タスク4）

Phase 4 テスト設計（`phase-4-test-creation.md`）の各テストケースを `outputs/phase-4/` 配下の各ファイルとして出力する。

#### 4-1: traceability-test-design.md

**出力先**: `outputs/phase-4/traceability-test-design.md`

確定すべき内容: TC-TRACE-01〜05 の全テストケース詳細（各テストの前提条件・手順・期待結果・合否基準）

#### 4-2: scoring-gate-cta-matrix.md

**出力先**: `outputs/phase-4/scoring-gate-cta-matrix.md`

確定すべき内容: TC-MATRIX-01〜16 の全16パターン（ScoringGate 4段階 × CTA 4種の制御マトリクス）

#### 4-3: flow-test-design.md

**出力先**: `outputs/phase-4/flow-test-design.md`

確定すべき内容: TC-FLOW-A01〜A05 / B01〜B06 / C01〜C05 の3シナリオ計16テストケース

#### 4-4: state-management-test-design.md

**出力先**: `outputs/phase-4/state-management-test-design.md`

確定すべき内容: TC-STATE-01〜04 の P31/P48 準拠セレクタ検証テストケース

#### 4-5: ipc-test-design.md

**出力先**: `outputs/phase-4/ipc-test-design.md`

確定すべき内容: TC-IPC-01〜04 の EP-3/EP-4 呼び分け・P42/P44/P45 準拠テストケース

#### 4-6: accessibility-test-design.md

**出力先**: `outputs/phase-4/accessibility-test-design.md`

確定すべき内容: TC-A11Y-01〜05 の A11y・Apple HIG 準拠テストケース

---

### ステップ5: 全 outputs 間の整合性検証（タスク5）

各 Phase の outputs が互いに整合しているかを以下の観点でクロスチェックする。

#### 整合性チェックリスト

| チェック観点                                                | 確認方法                                                                                                                                     |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 1 要件 → Phase 2 設計 → Phase 3 突合マトリクスの一致  | TC-TRACE-01〜05 の期待結果と requirements-design-matrix.md の判定が一致するか確認                                                            |
| Phase 2 CTA 仕様 → Phase 4 ScoringGate×CTA マトリクスの一致 | phase-2-design.md の CTA 仕様テーブルと scoring-gate-cta-matrix.md が矛盾しないか確認                                                        |
| Phase 2 状態管理設計 → Phase 4 状態管理テスト設計の一致     | state-management-design.md のセレクタ設計と state-management-test-design.md の期待設計が一致するか確認                                       |
| Phase 2 IPC 設計 → Phase 4 IPC テスト設計の一致             | ipc-integration-design.md の EP-3/EP-4 仕様と ipc-test-design.md の期待仕様が一致するか確認                                                  |
| Phase 3 指摘事項 → Phase 2 設計への反映確認                 | gate-decision.md の MINOR 指摘が Phase 2 成果物に反映されているか確認                                                                        |
| Phase 4 テストケース数 → Phase 7 カバレッジ確認との対応     | Phase 4 の全テストケース（計 TC-TRACE + TC-MATRIX + TC-FLOW + TC-STATE + TC-IPC + TC-A11Y）が Phase 7 のカバレッジ確認表に対応しているか確認 |

#### 整合性確認後の最終確定手順

1. 全 outputs ファイルの成果物パスが正しく設定されているか確認
2. outputs ファイル間の相互参照リンクが正しいか確認
3. artifacts.json の Phase 5 ステータスを `completed` に更新

## 統合テスト連携

| 観点         | 連携内容                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| outputs 一式 | 本Phaseで確定した outputs/phase-1〜4 を Phase 6 テスト拡充の入力とし、ケース追加時の正本として扱う         |
| 契約整合     | IPC/状態/UI の整合チェック結果を Phase 7 カバレッジマトリクスへ連動し、未検証導線の抽出根拠にする          |
| 回帰観点     | 重要な差分（ScoringGate, favorite/recentlyUsed, EP-3/EP-4）を Phase 9 品質保証の必須チェック項目へ引き継ぐ |
| 画面導線     | 確定した利用導線仕様を Phase 11 walkthrough の観察ポイントとして固定する                                   |

## 成果物

| 成果物                     | パス                                              | 説明                                        |
| -------------------------- | ------------------------------------------------- | ------------------------------------------- |
| 要件定義書                 | `outputs/phase-1/requirements-definition.md`      | 3シナリオ + 発見導線 + フィードバックループ |
| スコープ定義               | `outputs/phase-1/scope-definition.md`             | 対象範囲 / 除外範囲 / タスク境界線          |
| 仕様抽出マップ             | `outputs/phase-1/spec-extraction-map.md`          | 確認ステータス付き7件                       |
| 利用シナリオ表             | `outputs/phase-1/usage-scenario-table.md`         | 3シナリオ統合比較テーブル                   |
| 画面遷移設計               | `outputs/phase-2/screen-transition-design.md`     | 3シナリオフロー + CTA 仕様                  |
| コンポーネント設計         | `outputs/phase-2/component-design.md`             | SkillCard / ScoreGateBadge / ActionBar      |
| 状態管理設計               | `outputs/phase-2/state-management-design.md`      | Store 拡張 + P31/P48 準拠セレクタ           |
| IPC 連携設計               | `outputs/phase-2/ipc-integration-design.md`       | EP-3/EP-4 + P42/P44/P45 準拠                |
| 品質表示配置設計           | `outputs/phase-2/quality-display-placement.md`    | 7地点 × コンポーネント × 表示モード         |
| 要件-設計突合マトリクス    | `outputs/phase-3/requirements-design-matrix.md`   | 10要件 × 突合結果                           |
| 依存契約適合レポート       | `outputs/phase-3/dependency-contract-report.md`   | Task01/04 全項目の適合確認                  |
| UI/UX レビューレポート     | `outputs/phase-3/ui-ux-review-report.md`          | 20チェック項目の判定結果                    |
| 技術妥当性レポート         | `outputs/phase-3/technical-review-report.md`      | 15チェック項目の判定結果                    |
| ゲート判定記録             | `outputs/phase-3/gate-decision.md`                | PASS/MINOR/MAJOR 判定と承認記録             |
| トレーサビリティテスト     | `outputs/phase-4/traceability-test-design.md`     | TC-TRACE-01〜05                             |
| ScoringGate×CTA マトリクス | `outputs/phase-4/scoring-gate-cta-matrix.md`      | TC-MATRIX-01〜16                            |
| フローテスト設計           | `outputs/phase-4/flow-test-design.md`             | TC-FLOW-A01〜C05（16件）                    |
| 状態管理テスト設計         | `outputs/phase-4/state-management-test-design.md` | TC-STATE-01〜04                             |
| IPC テスト設計             | `outputs/phase-4/ipc-test-design.md`              | TC-IPC-01〜04                               |
| アクセシビリティテスト設計 | `outputs/phase-4/accessibility-test-design.md`    | TC-A11Y-01〜05                              |

## 完了条件

- [ ] outputs/phase-1/ の4件が作成・確定されている
- [ ] outputs/phase-2/ の5件が作成・確定されている
- [ ] outputs/phase-3/ の5件が作成・確定されている（ゲート判定 PASS の記録を含む）
- [ ] outputs/phase-4/ の6件が作成・確定されている
- [ ] 全 outputs 間の整合性チェックリスト（6項目）が PASS である
- [ ] artifacts.json の Phase 5 ステータスが `completed` に更新されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

- [ ] 参照資料確認（Phase 1〜4 仕様書 + Task01/04 成果物 + システム仕様）
- [ ] タスク1: outputs/phase-1/ 成果物4件の作成
- [ ] タスク2: outputs/phase-2/ 成果物5件の作成
- [ ] タスク3: outputs/phase-3/ 成果物5件の作成
- [ ] タスク4: outputs/phase-4/ 成果物6件の作成
- [ ] タスク5: 全 outputs 間の整合性検証
- [ ] artifacts.json 更新
- [ ] 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物（20件）が生成されている
- [ ] artifacts.json が更新されている

## 次のPhase

Phase 6: [phase-6-test-expansion.md](./phase-6-test-expansion.md)
