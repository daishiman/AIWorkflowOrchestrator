# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 10                     |
| Phase名    | 最終レビューゲート     |
| 前提Phase  | Phase 9（品質保証）    |
| 後続Phase  | Phase 11（手動テスト） |
| ステータス | 未実施                 |
| 作成日     | 2026-01-24             |
| 機能名     | SkillImportStore       |

---

## 目的

全体品質・整合性を最終検証し、手動テストフェーズに進む前に品質を保証する。
要件から実装までの一貫性を確認する。

## 背景

最終レビューゲートは、開発フェーズ全体の成果物を確認する重要なチェックポイントである。
ここで問題が発見された場合は、適切なフェーズに戻って修正を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 要件トレーサビリティ確認

**目的**: 全ての要件が実装されていることを確認する

**実行手順**:

1. `outputs/phase-1/requirements-specification.md` を読み込む
2. 各要件が実装されているか確認する
3. 要件と実装の対応表を作成する
4. 未実装の要件があれば記録する

**トレーサビリティマトリクス**:

| 要件ID | 要件内容                 | 実装状況 | テスト状況 |
| ------ | ------------------------ | -------- | ---------- |
| REQ-01 | getImported              | -        | -          |
| REQ-02 | addImport                | -        | -          |
| REQ-03 | removeImport             | -        | -          |
| REQ-04 | exists                   | -        | -          |
| REQ-05 | updateLastUsed           | -        | -          |
| REQ-06 | getSettings              | -        | -          |
| REQ-07 | updateSettings           | -        | -          |
| REQ-08 | rememberPermission       | -        | -          |
| REQ-09 | getRememberedPermission  | -        | -          |
| REQ-10 | setCache                 | -        | -          |
| REQ-11 | getCache                 | -        | -          |
| REQ-12 | invalidateCache          | -        | -          |
| REQ-13 | スキーママイグレーション | -        | -          |

**期待される成果物**:

- `outputs/phase-10/traceability-matrix.md`

---

### タスク2: 設計整合性確認

**目的**: 設計と実装が整合していることを確認する

**実行手順**:

1. `outputs/phase-2/api-design.md` を読み込む
2. `apps/desktop/src/main/settings/skillImportStore.ts` と比較する
3. 設計と実装の差異を確認する
4. 差異がある場合は理由を記録する

**確認観点**:

| 観点               | 確認内容                       |
| ------------------ | ------------------------------ |
| API シグネチャ     | 設計通りのメソッドシグネチャか |
| スキーマ           | 設計通りのスキーマ構造か       |
| エラーハンドリング | 設計通りのエラー処理か         |
| 戻り値             | 設計通りの戻り値型か           |

**期待される成果物**:

- `outputs/phase-10/design-implementation-alignment.md`

---

### タスク3: テスト網羅性最終確認

**目的**: テストが全機能をカバーしていることを確認する

**実行手順**:

1. `outputs/phase-7/coverage-report.md` を読み込む
2. 全機能にテストがあることを確認する
3. エッジケースのテストを確認する
4. 統合テストのカバレッジを確認する

**テストカバレッジサマリー**:

| 指標              | 目標 | 実績 | 判定 |
| ----------------- | ---- | ---- | ---- |
| Line Coverage     | 80%  | -    | -    |
| Branch Coverage   | 60%  | -    | -    |
| Function Coverage | 80%  | -    | -    |

**期待される成果物**:

- `outputs/phase-10/test-coverage-summary.md`

---

### タスク4: ドキュメント完全性確認

**目的**: 必要なドキュメントが揃っていることを確認する

**実行手順**:

1. 各Phase の成果物を確認する
2. 必須ドキュメントの存在を確認する
3. ドキュメントの内容が最新であることを確認する
4. 不足があれば記録する

**ドキュメントチェックリスト**:

| Phase | 成果物                        | 存在 | 最新 |
| ----- | ----------------------------- | ---- | ---- |
| 1     | requirements-specification.md | -    | -    |
| 2     | api-design.md                 | -    | -    |
| 2     | schema-design.md              | -    | -    |
| 3     | review-summary.md             | -    | -    |
| 7     | coverage-report.md            | -    | -    |
| 8     | code-quality-analysis.md      | -    | -    |
| 9     | quality-gate-result.md        | -    | -    |

**期待される成果物**:

- `outputs/phase-10/documentation-checklist.md`

---

### タスク5: 最終判定

**目的**: 最終レビュー結果を判定する

**実行手順**:

1. タスク1〜4の結果を統合する
2. 問題を重要度別に分類する
3. 判定結果（PASS/MINOR/MAJOR/CRITICAL）を決定する
4. 問題がある場合は戻り先を決定する

**判定基準**:

| 判定     | 条件                     | 次のアクション          |
| -------- | ------------------------ | ----------------------- |
| PASS     | 全レビュー観点で問題なし | Phase 11 へ進行         |
| MINOR    | 軽微な指摘あり           | 指摘対応後、Phase 11 へ |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻る    |
| CRITICAL | 致命的な問題あり         | Phase 1 へ戻り要件確認  |

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`

---

## 参照資料

| 参照資料       | パス                                                                | 内容         |
| -------------- | ------------------------------------------------------------------- | ------------ |
| 要件仕様       | `outputs/phase-1/requirements-specification.md`                     | 要件         |
| API設計        | `outputs/phase-2/api-design.md`                                     | 設計         |
| 実装ファイル   | `apps/desktop/src/main/settings/skillImportStore.ts`                | 実装コード   |
| テストファイル | `apps/desktop/src/main/settings/__tests__/skillImportStore.test.ts` | テストコード |
| 品質ゲート     | `outputs/phase-9/quality-gate-result.md`                            | 品質結果     |

---

## 成果物

| 成果物           | パス                                                  | 内容               |
| ---------------- | ----------------------------------------------------- | ------------------ |
| トレーサビリティ | `outputs/phase-10/traceability-matrix.md`             | 要件追跡           |
| 設計整合性       | `outputs/phase-10/design-implementation-alignment.md` | 設計vs実装         |
| テストカバレッジ | `outputs/phase-10/test-coverage-summary.md`           | カバレッジサマリー |
| ドキュメント確認 | `outputs/phase-10/documentation-checklist.md`         | ドキュメント一覧   |
| 最終判定         | `outputs/phase-10/final-review-result.md`             | 判定結果           |

---

## 統合テスト連携

> 最終レビューで統合テスト結果を確認する

| 確認項目           | 基準                     |
| ------------------ | ------------------------ |
| 全統合テスト       | 100% パス                |
| IPC連携            | 正常動作確認済み         |
| エラーハンドリング | 適切なエラー処理確認済み |

---

## レビュー結果判定

### 戻り先決定基準

| 問題の種類       | 戻り先                |
| ---------------- | --------------------- |
| 要件の問題       | Phase 1（要件定義）   |
| 設計の問題       | Phase 2（設計）       |
| テスト設計の問題 | Phase 4（テスト）     |
| 実装の問題       | Phase 5（実装）       |
| 品質の問題       | Phase 8（リファクタ） |

---

## 完了条件

- [ ] トレーサビリティマトリクスで全要件がカバーされている
- [ ] 設計と実装が整合している
- [ ] テストカバレッジ目標を達成している
- [ ] 必要なドキュメントが全て揃っている
- [ ] 最終判定が PASS または MINOR である

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認
- [ ] 判定結果がPASS/MINORであることを確認

---

## 依存関係

- **前提**: Phase 9 が完了していること
- **後続**: Phase 11（手動テスト）へ進む（PASS/MINOR の場合）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/task-2b-skill-import-store/phase-11-manual-test.md`
