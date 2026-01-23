# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 3                                      |
| Phase名    | 設計レビューゲート                     |
| 前提Phase  | Phase 2                                |
| 後続Phase  | Phase 4                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-22                             |
| 機能名     | システムプロンプトのデータベース永続化 |

---

## 目的

Phase 1〜2の要件・設計が実装可能な品質であるかを検証し、問題があれば該当Phaseに戻して修正する。

## 背景

設計レビューゲートは、実装開始前の最後のチェックポイントとして、要件の抜け漏れや設計の不整合を検出し、手戻りを最小化する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 要件充足性レビュー

**目的**: Phase 1の要件がすべて設計でカバーされているか検証する

**実行手順**:

1. Phase 1の機能要件（FR）一覧を取得する
   - `outputs/phase-1/requirements-functional.md` を読み込む
2. 各FRに対応する設計成果物を確認する
   - FR-001（CRUD）→ Repository設計
   - FR-002（ユーザー認証連動）→ Repository認可設計
   - FR-003（プリセット保護）→ Repository設計
   - FR-004（マイグレーション）→ マイグレーション設計
3. 非機能要件（NFR）の設計カバレッジを確認する
   - パフォーマンス要件への対応
   - セキュリティ要件への対応
   - 可用性要件への対応
4. 未カバーの要件があれば問題リストに追加する
5. 成果物を `outputs/phase-3/requirements-coverage-review.md` に出力する

**期待される成果物**:

- `outputs/phase-3/requirements-coverage-review.md`

---

### タスク2: 設計整合性レビュー

**目的**: 設計成果物間の整合性を検証する

**実行手順**:

1. インターフェース整合性を検証する
   - Repository型とSlice型の整合性
   - IPC通信の入出力型整合性
   - DB型とドメイン型の変換整合性
2. データフロー整合性を検証する
   - Renderer → IPC → Main → Repository → DB
   - エラー伝播パスの整合性
3. 既存システムとの整合性を検証する
   - 既存のデータベーススキーマとの整合性
   - 既存のRepositoryパターンとの一貫性
4. 問題があれば問題リストに追加する
5. 成果物を `outputs/phase-3/design-consistency-review.md` に出力する

**期待される成果物**:

- `outputs/phase-3/design-consistency-review.md`

---

### タスク3: 技術的実現可能性レビュー

**目的**: 設計が技術的に実装可能であるか検証する

**実行手順**:

1. 依存ライブラリの確認
   - Drizzle ORMの機能で実現可能か
   - Turso/libSQLの制約に違反していないか
2. パフォーマンス実現可能性
   - インデックス設計がクエリパターンに適切か
   - N+1問題のリスクがないか
3. セキュリティ実現可能性
   - 認可チェックが適切に設計されているか
   - プリセット保護が実現可能か
4. マイグレーション実現可能性
   - electron-storeからのデータ読み込みが可能か
   - フォールバック処理が実現可能か
5. 成果物を `outputs/phase-3/feasibility-review.md` に出力する

**期待される成果物**:

- `outputs/phase-3/feasibility-review.md`

---

### タスク4: 統合テスト観点レビュー

**目的**: 統合テストの観点から設計を検証する

**実行手順**:

1. IPC通信のテスト可能性を確認する
   - モック化が容易な設計か
   - エラーケースがテスト可能か
2. Repository層のテスト可能性を確認する
   - インメモリDBでのテストが可能か
   - トランザクション境界が明確か
3. マイグレーション処理のテスト可能性を確認する
   - テストデータの準備が容易か
   - ロールバックがテスト可能か
4. E2Eテストの観点を確認する
   - ユーザーシナリオがカバーされているか
   - オフライン動作のテスト方針
5. 成果物を `outputs/phase-3/integration-test-review.md` に出力する

**期待される成果物**:

- `outputs/phase-3/integration-test-review.md`

---

### タスク5: レビュー結果判定

**目的**: レビュー結果を総合判定し、次のアクションを決定する

**実行手順**:

1. 全レビュー結果を統合する
   - 要件充足性レビュー結果
   - 設計整合性レビュー結果
   - 技術的実現可能性レビュー結果
   - 統合テスト観点レビュー結果
2. 問題の重要度を分類する
   - CRITICAL: 要件レベルの問題
   - MAJOR: 設計レベルの問題
   - MINOR: 軽微な問題
3. 判定を下す
   - PASS: 問題なし → Phase 4へ
   - MINOR: 軽微な指摘あり → 対応後Phase 4へ
   - MAJOR: 重大な問題 → 該当Phaseへ戻る
   - CRITICAL: 致命的な問題 → Phase 1へ戻る
4. 成果物を `outputs/phase-3/review-judgment.md` に出力する

**期待される成果物**:

- `outputs/phase-3/review-judgment.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容             |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------- |
| データベーススキーマ   | `.claude/skills/aiworkflow-requirements/references/database-schema.md`       | 既存テーブル設計 |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | 設計パターン     |

### 前Phaseの成果物

| 参照資料               | パス                                             | 内容             |
| ---------------------- | ------------------------------------------------ | ---------------- |
| 機能要件定義書         | `outputs/phase-1/requirements-functional.md`     | 機能要件         |
| 非機能要件定義書       | `outputs/phase-1/requirements-non-functional.md` | 非機能要件       |
| DBスキーマ設計書       | `outputs/phase-2/database-schema-design.md`      | DB設計           |
| Repository設計書       | `outputs/phase-2/repository-interface-design.md` | Repository設計   |
| マイグレーション設計書 | `outputs/phase-2/migration-design.md`            | マイグレーション |
| Slice更新設計書        | `outputs/phase-2/slice-update-design.md`         | Slice設計        |
| IPCハンドラー設計書    | `outputs/phase-2/ipc-handler-design.md`          | IPC設計          |

---

## 成果物

| 成果物                 | パス                                              | 内容         |
| ---------------------- | ------------------------------------------------- | ------------ |
| 要件カバレッジレビュー | `outputs/phase-3/requirements-coverage-review.md` | 要件充足性   |
| 設計整合性レビュー     | `outputs/phase-3/design-consistency-review.md`    | 整合性検証   |
| 実現可能性レビュー     | `outputs/phase-3/feasibility-review.md`           | 技術的実現性 |
| 統合テストレビュー     | `outputs/phase-3/integration-test-review.md`      | テスト観点   |
| レビュー判定           | `outputs/phase-3/review-judgment.md`              | 最終判定     |

---

## 統合テスト連携（Phase 1〜11は必須）

本Phaseでは以下の統合テスト連携アクションを実施すること：

- 統合テスト観点のレビューゲートを実施する
- テスト可能性の観点から設計を検証する
- E2Eシナリオの観点を含める

---

## 完了条件

- [ ] 要件充足性レビューが完了している
- [ ] 設計整合性レビューが完了している
- [ ] 技術的実現可能性レビューが完了している
- [ ] 統合テスト観点レビューが完了している
- [ ] レビュー判定結果が出ている
- [ ] 全ての成果物が `outputs/phase-3/` に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## レビューゲート

### レビュー結果判定

| 判定     | 条件                     | 次のアクション            |
| -------- | ------------------------ | ------------------------- |
| PASS     | 全レビュー観点で問題なし | Phase 4へ進行             |
| MINOR    | 軽微な指摘あり           | 指摘対応後、Phase 4へ     |
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

`docs/30-workflows/system-prompt-db/phase-4-test-creation.md`
