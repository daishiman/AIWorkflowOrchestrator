# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 3                                 |
| Phase名    | 設計レビューゲート                |
| 前提Phase  | Phase 2                           |
| 後続Phase  | Phase 4                           |
| ステータス | 未実施                            |
| 作成日     | 2026-01-22                        |
| 機能名     | chat-history-provider-integration |

---

## 目的

Phase 1（要件定義）とPhase 2（設計）の成果物をレビューし、実装に進む前に設計の妥当性を検証する。

## 背景

設計レビューゲートは、実装前に設計の問題を発見し、手戻りを防止するための重要なチェックポイントである。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 要件トレーサビリティ確認

**目的**: 要件と設計の対応関係を確認する

**実行手順**:

1. Phase 1で定義された機能要件を列挙する
2. 各要件に対応する設計要素を特定する
3. 対応漏れがないことを確認する
4. トレーサビリティマトリクスを `outputs/phase-3/traceability-matrix.md` に出力する

**期待される成果物**:

- `outputs/phase-3/traceability-matrix.md`

---

### タスク2: アーキテクチャ適合性レビュー

**目的**: 設計がClean Architectureに適合しているか確認する

**実行手順**:

1. 設計がシステム仕様（architecture-chat-history.md）に適合しているか確認する
2. 依存関係ルールが守られているか確認する:
   - Domain → なし
   - Application → Domain
   - Infrastructure → Domain, Application
   - UI → Application, Domain
3. レビュー結果を `outputs/phase-3/architecture-review.md` に出力する

**期待される成果物**:

- `outputs/phase-3/architecture-review.md`

---

### タスク3: 統合テスト観点レビュー

**目的**: 統合テスト設計の妥当性を確認する

**実行手順**:

1. Phase 2のテスト設計を確認する
2. 以下の観点でレビューする:
   - Provider統合テストの網羅性
   - Repository注入テストの妥当性
   - Context伝播テストの妥当性
3. レビュー結果を `outputs/phase-3/integration-test-review.md` に出力する

**期待される成果物**:

- `outputs/phase-3/integration-test-review.md`

---

### タスク4: リスク評価

**目的**: 実装リスクを評価し、対策を確認する

**実行手順**:

1. 以下のリスクを評価する:
   - DB初期化タイミング問題
   - 循環依存
   - パフォーマンス低下
   - 既存機能への影響
2. 各リスクに対する対策が設計に含まれているか確認する
3. リスク評価結果を `outputs/phase-3/risk-assessment.md` に出力する

**期待される成果物**:

- `outputs/phase-3/risk-assessment.md`

---

### タスク5: レビューゲート判定

**目的**: レビュー結果に基づきゲート判定を行う

**実行手順**:

1. タスク1〜4のレビュー結果を統合する
2. 以下の判定基準に基づき判定する:
   - **PASS**: 全レビュー観点で問題なし → Phase 4へ進行
   - **MINOR**: 軽微な指摘あり → 指摘対応後、Phase 4へ
   - **MAJOR**: 重大な問題あり → Phase 2または Phase 1へ戻る
   - **CRITICAL**: 致命的な問題あり → Phase 1へ戻りユーザー確認
3. 判定結果を `outputs/phase-3/gate-decision.md` に出力する

**期待される成果物**:

- `outputs/phase-3/gate-decision.md`

---

## 参照資料

| 参照資料           | パス                                                                             | 内容                           |
| ------------------ | -------------------------------------------------------------------------------- | ------------------------------ |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | Clean Architectureレイヤー構成 |
| Phase 1成果物      | `outputs/phase-1/`                                                               | 要件定義成果物                 |
| Phase 2成果物      | `outputs/phase-2/`                                                               | 設計成果物                     |
| レビューゲート基準 | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`   | レビュー判定基準               |

---

## 成果物

| 成果物                     | パス                                         | 内容                 |
| -------------------------- | -------------------------------------------- | -------------------- |
| トレーサビリティマトリクス | `outputs/phase-3/traceability-matrix.md`     | 要件-設計対応表      |
| アーキテクチャレビュー     | `outputs/phase-3/architecture-review.md`     | アーキテクチャ適合性 |
| 統合テストレビュー         | `outputs/phase-3/integration-test-review.md` | 統合テスト設計妥当性 |
| リスク評価                 | `outputs/phase-3/risk-assessment.md`         | リスク評価結果       |
| ゲート判定                 | `outputs/phase-3/gate-decision.md`           | レビューゲート判定   |

---

## 統合テスト連携（Phase 1〜11は必須）

統合テスト観点のレビューゲートを実施する:

- テストシナリオの網羅性確認
- テストデータ・モック設計の妥当性確認
- 境界条件テストの設計確認

---

## 完了条件

- [ ] トレーサビリティマトリクスが作成されている
- [ ] アーキテクチャ適合性レビューが完了している
- [ ] 統合テスト観点レビューが完了している
- [ ] リスク評価が完了している
- [ ] ゲート判定がPASSまたはMINOR（対応済み）である

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜5）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## レビューゲート判定

### レビュー結果判定

| 判定     | 条件                     | 次のアクション            |
| -------- | ------------------------ | ------------------------- |
| PASS     | 全レビュー観点で問題なし | 次のPhaseへ進行           |
| MINOR    | 軽微な指摘あり           | 指摘対応後、次のPhaseへ   |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻る      |
| CRITICAL | 致命的な問題あり         | Phase 1へ戻りユーザー確認 |

### 戻り先決定基準

| 問題の種類 | 戻り先              |
| ---------- | ------------------- |
| 要件の問題 | Phase 1（要件定義） |
| 設計の問題 | Phase 2（設計）     |

---

## 依存関係

- **前提**: Phase 2（設計）が完了していること
- **後続**: Phase 4（テスト作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/chat-history-provider-integration/phase-4-test-creation.md`
