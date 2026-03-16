# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 3                                      |
| Phase名    | 設計レビュー                           |
| 前提Phase  | Phase 2（設計）                        |
| 後続Phase  | Phase 4（テスト作成）                  |
| ステータス | 未実施                                 |
| 作成日     | 2026-03-16                             |
| 機能名     | ライフサイクル履歴・フィードバック統合 |
| タスクID   | TASK-SKILL-LIFECYCLE-07                |

---

## 目的

Phase 1（要件定義）と Phase 2（設計）の成果物を多角的にレビューし、履歴設計がノイズ蓄積ではなく再利用価値と改善判断に実際に繋がるかを検証する。PASS/MINOR/MAJOR の判定を行い、Phase 4 への進行可否を決定する。

## 背景

設計レビューは品質ゲートとして機能し、以下の観点で Phase 2 の設計を検証する: (1) 要件との整合性、(2) 技術的実現可能性、(3) Task05/08 との連携の妥当性、(4) パフォーマンスと拡張性、(5) セキュリティ。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 要件-設計整合性レビュー

**目的**: Phase 1 の要件が Phase 2 の設計で漏れなくカバーされているか検証する。

**実行手順**:

1. Phase 1 の受入基準 AC-1〜AC-4 に対して、Phase 2 の設計成果物を逆引き確認する:
   - AC-1（イベント定義） → `event-model-design.md` で全カテゴリがカバーされているか
   - AC-2（フィードバックデータ） → `feedback-loop-design.md` でスキーマが存在するか
   - AC-3（Task05連携） → `data-flow-design.md` でデータフローが存在するか
   - AC-4（Task08連携） → `publish-metrics-interface-design.md` でインターフェースが存在するか
2. Phase 1 のイベント一覧と Phase 2 の `SkillLifecycleEvent` 型の対応漏れを確認する
3. 検証結果を requirements-design-matrix として記録する

**期待される成果物**:

- 要件-設計マトリクス（AC と設計成果物の対応表、カバー率）

---

### タスク2: 技術的実現可能性レビュー

**目的**: 設計が既存アーキテクチャ内で実現可能か検証する。

**実行手順**:

1. Zustand Store 設計の検証:
   - lifecycleHistorySlice が既存の Store 設計パターン（P31/P48対策）に準拠しているか
   - 個別セレクタの設計が含まれているか
   - persist middleware との整合性
2. IPC 契約の検証:
   - 新規 IPC チャンネルが `IPC_CHANNELS` 定数で管理される設計か
   - P42 準拠の3段バリデーション（型チェック→空文字列→トリム空文字列）が設計に含まれるか
3. SQLite 永続化の検証:
   - イベントテーブルのスキーマが既存の database-schema と整合しているか
   - インデックス設計がクエリパフォーマンスを満たすか
4. Simpler Alternative の検討:
   - SQLite なしで Zustand persist のみで実現できないか検討する
   - イベントソーシングが本当に必要か、CRUD で十分でないか検討する

**期待される成果物**:

- 技術レビュー結果（実現可能性判定、リスク、Simpler Alternative の検討結果）

---

### タスク3: Task05/08 連携妥当性レビュー

**目的**: Task05（利用導線）と Task08（公開・互換性）との連携設計が実用的か検証する。

**実行手順**:

1. Task05 との連携検証:
   - ScoreGateBadge に表示するスコア履歴のデータソースが明確か
   - PostExecutionActionBar の導線分岐に使う実行履歴が正しく集約されるか
   - 「最近使ったスキル」リストのクエリが効率的か
2. Task08 との連携検証:
   - `PublishReadinessMetrics` インターフェースが Task08 の公開判断に十分か
   - 契約境界（データ提供 vs 判断ロジック）が明確か
   - メトリクス計算のタイミングと精度が要件を満たすか
3. 連携に伴う循環依存がないか確認する

**期待される成果物**:

- 連携妥当性レビュー結果（Task05/08 との契約検証結果）

---

### タスク4: レビュー結果判定

**目的**: 全レビュー結果を統合し、PASS/MINOR/MAJOR/CRITICAL の判定を行う。

**実行手順**:

1. 全レビュー結果を統合し、以下の判定基準で評価する:

| 判定     | 条件                     | 次のアクション             |
| -------- | ------------------------ | -------------------------- |
| PASS     | 全レビュー観点で問題なし | Phase 4 へ進行             |
| MINOR    | 軽微な指摘あり           | 指摘対応後、Phase 4 へ進行 |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻る       |
| CRITICAL | 致命的な問題あり         | Phase 1 へ戻りユーザー確認 |

2. MINOR 判定の場合、全指摘事項を未タスク仕様書に変換する（省略不可）
3. 戻り先決定基準:

| 問題の種類 | 戻り先              |
| ---------- | ------------------- |
| 要件の問題 | Phase 1（要件定義） |
| 設計の問題 | Phase 2（設計）     |

**期待される成果物**:

- ゲート判定書（判定結果、指摘事項一覧、対応方針）

---

## 参照資料

| 参照資料                   | パス                                                                             | 内容                   |
| -------------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| Phase 1 成果物             | `outputs/phase-1/`                                                               | 要件定義の全成果物     |
| Phase 2 成果物             | `outputs/phase-2/`                                                               | 設計の全成果物         |
| review-gate-criteria       | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`   | レビューゲート判定基準 |
| arch-state-management      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`     | Zustand Store 設計     |
| architecture-chat-history  | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | 履歴基盤アーキテクチャ |
| ライフサイクルイベント一覧 | `outputs/phase-1/lifecycle-event-catalog.md`                                     | Phase 1 成果物         |
| フィードバック収集要件     | `outputs/phase-1/feedback-collection-spec.md`                                    | Phase 1 成果物         |
| Task05連携要件             | `outputs/phase-1/task05-integration-contract.md`                                 | Phase 1 成果物         |
| Task08メトリクス定義       | `outputs/phase-1/task08-metrics-definition.md`                                   | Phase 1 成果物         |
| 受入基準検証マトリクス     | `outputs/phase-1/acceptance-criteria-matrix.md`                                  | Phase 1 成果物         |
| イベントモデル設計書       | `outputs/phase-2/event-model-design.md`                                          | Phase 2 成果物         |
| 集約ビュー設計書           | `outputs/phase-2/aggregate-view-design.md`                                       | Phase 2 成果物         |
| フィードバック還流設計書   | `outputs/phase-2/feedback-loop-design.md`                                        | Phase 2 成果物         |
| 公開メトリクスIF設計書     | `outputs/phase-2/publish-metrics-interface-design.md`                            | Phase 2 成果物         |
| データフロー設計書         | `outputs/phase-2/data-flow-design.md`                                            | Phase 2 成果物         |

### システム仕様（aiworkflow-requirements）

> レビュー時に以下のシステム仕様との整合性を確認してください。

| 参照資料                             | パス                                                                                        | 内容             |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------- |
| interfaces-agent-sdk-skill           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | スキル管理IF     |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集   |
| security-electron-ipc                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ |

---

## 成果物

| 成果物                 | パス                                            | 内容                                     |
| ---------------------- | ----------------------------------------------- | ---------------------------------------- |
| 要件-設計マトリクス    | `outputs/phase-3/requirements-design-matrix.md` | AC と設計成果物の対応表                  |
| 技術レビュー結果       | `outputs/phase-3/technical-review-report.md`    | 実現可能性、リスク、Simpler Alternative  |
| 連携妥当性レビュー結果 | `outputs/phase-3/integration-review-report.md`  | Task05/08 との契約検証結果               |
| ゲート判定書           | `outputs/phase-3/gate-decision.md`              | PASS/MINOR/MAJOR/CRITICAL 判定と対応方針 |

---

## 統合テスト連携

- PASS 判定の場合、Phase 4 のテスト設計の入力として Phase 2 の設計書を使用する
- MINOR 指摘は未タスク仕様書に変換し、Phase 12 で追跡する
- MAJOR 判定の場合、Phase 1 または Phase 2 に戻り再設計する

---

## レビューゲート

### レビュー結果判定

| 判定     | 条件                     | 次のアクション             |
| -------- | ------------------------ | -------------------------- |
| PASS     | 全レビュー観点で問題なし | Phase 4 へ進行             |
| MINOR    | 軽微な指摘あり           | 指摘対応後、Phase 4 へ     |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻る       |
| CRITICAL | 致命的な問題あり         | Phase 1 へ戻りユーザー確認 |

### 戻り先決定基準

| 問題の種類 | 戻り先              |
| ---------- | ------------------- |
| 要件の問題 | Phase 1（要件定義） |
| 設計の問題 | Phase 2（設計）     |

---

## 完了条件

- [ ] 要件-設計マトリクスで AC-1〜AC-4 の全カバレッジが確認されている
- [ ] 技術レビューで Zustand Store/IPC/SQLite の整合性が確認されている
- [ ] Simpler Alternative が検討され、結論が記録されている
- [ ] Task05/08 との連携に循環依存がないことが確認されている
- [ ] ゲート判定（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] MINOR 判定の場合、全指摘事項が未タスク仕様書に変換されている
- [ ] Phase 4 開始条件が明確に記録されている
- [ ] 全成果物が `outputs/phase-3/` に生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 2 が完了していること
- **後続**: PASS/MINOR 判定の場合 Phase 4 へ進む。MAJOR の場合 Phase 1 or 2 へ戻る

---

## 次のPhase

PASS/MINOR 判定後、以下のファイルを実行してください:

`docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-4-test-creation.md`
