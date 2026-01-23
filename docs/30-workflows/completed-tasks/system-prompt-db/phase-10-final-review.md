# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 10                                     |
| Phase名    | 最終レビューゲート                     |
| 前提Phase  | Phase 9                                |
| 後続Phase  | Phase 11                               |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-22                             |
| 機能名     | システムプロンプトのデータベース永続化 |

---

## 目的

Phase 4〜9の実装・テスト・品質が総合的に基準を満たしているかを最終検証し、手動テストフェーズへ進む判定を行う。

## 背景

最終レビューゲートは、自動化されたテスト・品質チェックの総括として、人間による手動テストへ進む前の最後のチェックポイントとなる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装完了確認

**目的**: すべての機能が実装されていることを確認する

**実行手順**:

1. Phase 1の機能要件（FR）一覧を取得する
   - `outputs/phase-1/requirements-functional.md`
2. 各FRの実装状況を確認する
   - FR-001（CRUD）: Repository実装確認
   - FR-002（ユーザー認証連動）: 認可チェック確認
   - FR-003（プリセット保護）: 保護ロジック確認
   - FR-004（マイグレーション）: 移行処理確認
3. 未実装の機能があれば問題リストに追加する
4. 成果物を `outputs/phase-10/implementation-verification.md` に出力する

**期待される成果物**:

- `outputs/phase-10/implementation-verification.md`

---

### タスク2: テストカバレッジ最終確認

**目的**: テストカバレッジが基準を満たしていることを確認する

**実行手順**:

1. ユニットテストカバレッジを確認する
   - Line Coverage: 80%以上
   - Branch Coverage: 60%以上
   - Function Coverage: 80%以上
2. 結合テストカバレッジを確認する
   - CRUD操作: 100%
   - エラーケース: 80%以上
3. Phase 7の結果と比較する
4. 成果物を `outputs/phase-10/coverage-final-verification.md` に出力する

**期待される成果物**:

- `outputs/phase-10/coverage-final-verification.md`

---

### タスク3: 品質チェック最終確認

**目的**: すべての品質チェックがパスしていることを確認する

**実行手順**:

1. Phase 9の結果を確認する
   - TypeScript型チェック: OK
   - ESLint: OK
   - Prettier: OK
   - セキュリティスキャン: OK
2. 追加の品質問題がないか確認する
3. 成果物を `outputs/phase-10/quality-final-verification.md` に出力する

**期待される成果物**:

- `outputs/phase-10/quality-final-verification.md`

---

### タスク4: 設計整合性最終確認

**目的**: 実装が設計に従っていることを確認する

**実行手順**:

1. Phase 2の設計書と実装を比較する
   - DBスキーマ: 設計通りか
   - Repository: インターフェース設計通りか
   - IPC: 設計通りか
   - Slice: 設計通りか
2. 設計からの乖離があれば記録する
   - 意図的な変更: 理由を記録
   - 意図しない変更: 修正または設計更新
3. 成果物を `outputs/phase-10/design-conformance.md` に出力する

**期待される成果物**:

- `outputs/phase-10/design-conformance.md`

---

### タスク5: 最終判定

**目的**: 手動テストフェーズへ進む判定を行う

**実行手順**:

1. 全確認結果を統合する
   - 実装完了確認結果
   - カバレッジ確認結果
   - 品質確認結果
   - 設計整合性確認結果
2. 問題の重要度を分類する
   - CRITICAL: 致命的な問題
   - MAJOR: 重大な問題
   - MINOR: 軽微な問題
3. 判定を下す
   - PASS: 問題なし → Phase 11へ
   - MINOR: 軽微な指摘あり → 対応後Phase 11へ
   - MAJOR: 重大な問題 → 該当Phaseへ戻る
   - CRITICAL: 致命的な問題 → Phase 4へ戻る
4. 成果物を `outputs/phase-10/final-judgment.md` に出力する

**期待される成果物**:

- `outputs/phase-10/final-judgment.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                                        | 内容     |
| -------- | --------------------------------------------------------------------------- | -------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質基準 |

### 前Phaseの成果物

| 参照資料       | パス                                      | 内容         |
| -------------- | ----------------------------------------- | ------------ |
| 型チェック結果 | `outputs/phase-9/typecheck-result.md`     | 型検証       |
| Lint結果       | `outputs/phase-9/lint-result.md`          | Lint検証     |
| セキュリティ   | `outputs/phase-9/security-scan-result.md` | セキュリティ |
| 品質メトリクス | `outputs/phase-9/quality-metrics.md`      | 品質指標     |

---

## 成果物

| 成果物         | パス                                              | 内容       |
| -------------- | ------------------------------------------------- | ---------- |
| 実装完了確認   | `outputs/phase-10/implementation-verification.md` | 実装確認   |
| カバレッジ確認 | `outputs/phase-10/coverage-final-verification.md` | カバレッジ |
| 品質確認       | `outputs/phase-10/quality-final-verification.md`  | 品質確認   |
| 設計整合性確認 | `outputs/phase-10/design-conformance.md`          | 設計適合   |
| 最終判定       | `outputs/phase-10/final-judgment.md`              | 判定結果   |

---

## 統合テスト連携（Phase 1〜11は必須）

本Phaseでは以下の統合テスト連携アクションを実施すること：

- 統合テスト結果の最終確認
- E2Eテストシナリオの準備状況確認

---

## 完了条件

- [ ] 実装完了確認が完了している
- [ ] テストカバレッジ最終確認が完了している
- [ ] 品質チェック最終確認が完了している
- [ ] 設計整合性最終確認が完了している
- [ ] 最終判定結果が出ている
- [ ] すべての成果物が出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## レビューゲート

### 最終判定基準

| 判定     | 条件             | 次のアクション       |
| -------- | ---------------- | -------------------- |
| PASS     | 全項目で問題なし | Phase 11へ進行       |
| MINOR    | 軽微な指摘あり   | 対応後、Phase 11へ   |
| MAJOR    | 重大な問題あり   | 影響範囲に応じて戻る |
| CRITICAL | 致命的な問題あり | Phase 4へ戻る        |

### 戻り先決定基準

| 問題の種類       | 戻り先             |
| ---------------- | ------------------ |
| テストの問題     | Phase 4 or Phase 6 |
| 実装の問題       | Phase 5            |
| リファクタの問題 | Phase 8            |
| 品質の問題       | Phase 9            |

---

## 依存関係

- **前提**: Phase 9（品質確認）が完了していること
- **後続**: Phase 11（手動テスト）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/system-prompt-db/phase-11-manual-test.md`
