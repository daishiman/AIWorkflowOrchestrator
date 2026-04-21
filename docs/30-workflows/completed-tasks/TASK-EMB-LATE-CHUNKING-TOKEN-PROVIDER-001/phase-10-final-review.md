# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 10                                        |
| タスクID   | TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 |
| ステータス | pending                                   |
| 作成日     | 2026-04-20                                |
| 前Phase    | 9: 品質保証                               |
| 次Phase    | 11: 手動テスト                            |

---

## 目的

Phase 2 の設計事項1〜5が実装に反映されているかを証跡付きで照合し、
TP-01〜TP-05 の全 PASS と既存 `IEmbeddingClient` 実装クラスの型エラーなしを確認したうえで、
Phase 11（手動テスト）への進行判定を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Phase 2 設計事項1〜5 の照合

**目的**: Phase 2 で定義した設計事項が実装に漏れなく反映されていることを証跡付きで確認する

**実行手順**:

1. `docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/phase-2-design.md`（または相当ファイル）の設計事項1〜5を確認する
2. 以下の照合マトリクスを記入する

**照合マトリクス**:

| ID   | 設計事項 | 達成状況 | 証跡                                  |
| ---- | -------- | -------- | ------------------------------------- |
| D-01 |          | 未確認   | `outputs/phase-5/` または実装ファイル |
| D-02 |          | 未確認   | `outputs/phase-5/` または実装ファイル |
| D-03 |          | 未確認   | `outputs/phase-5/` または実装ファイル |
| D-04 |          | 未確認   | `outputs/phase-5/` または実装ファイル |
| D-05 |          | 未確認   | `outputs/phase-5/` または実装ファイル |

3. 各設計事項について「達成」「未達」「一部達成」のいずれかを記録する
4. 未達・一部達成の設計事項がある場合は原因を特定する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の設計事項照合セクション

---

### タスク2: TP-01〜TP-05 全 PASS の最終確認

**目的**: 完了条件として定義された全テストケースが PASS していることを最終確認する

**実行手順**:

1. Phase 7 のカバレッジレポート（`outputs/phase-7/coverage-report.md`）で TP-01〜TP-05 の PASS 状況を確認する
2. Phase 9 の品質チェック結果（`outputs/phase-9/quality-check-result.md`）でテスト全件 PASS を確認する
3. 以下の確認表を記入する

**テストケース最終確認表**:

| テストID | テスト名（概要） | PASS/FAIL | 証跡ファイル                         |
| -------- | ---------------- | --------- | ------------------------------------ |
| TP-01    |                  |           | `outputs/phase-7/coverage-report.md` |
| TP-02    |                  |           | `outputs/phase-7/coverage-report.md` |
| TP-03    |                  |           | `outputs/phase-7/coverage-report.md` |
| TP-04    |                  |           | `outputs/phase-7/coverage-report.md` |
| TP-05    |                  |           | `outputs/phase-7/coverage-report.md` |

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の TP 確認セクション

---

### タスク3: 既存 `IEmbeddingClient` 実装クラスの型エラー確認

**目的**: `IEmbeddingClient` に `getTokenEmbeddings?()` を追加したことで、既存の実装クラスに型エラーが発生していないことを確認する

**実行手順**:

1. `packages/shared/src/services/embedding/` 配下の `IEmbeddingClient` 実装クラスを列挙する
2. 型チェックを実行し、型エラーがゼロであることを確認する

```bash
pnpm --filter @repo/shared typecheck
```

3. 型エラーが発生している場合は原因を特定する
   - `getTokenEmbeddings?()` がオプショナルになっているか確認する
   - 既存クラスが新しいインターフェースを満たしているか確認する
4. 確認結果を記録する

**既存実装クラス確認表**:

| クラス名 | ファイルパス | 型エラー有無 | 備考 |
| -------- | ------------ | ------------ | ---- |
|          |              |              |      |

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の既存実装クラス型確認セクション

---

### タスク4: 最終レビュー判定と Phase 11 進行承認

**目的**: タスク1〜3 の結果を集約し、Phase 11（手動テスト）への進行可否を判定する

**実行手順**:

1. タスク1〜3 の結果を集約する
2. 以下の判定基準に基づいて最終判定を行う

**判定基準**:

| 判定  | 条件                                                                          | 次のアクション           |
| ----- | ----------------------------------------------------------------------------- | ------------------------ |
| PASS  | 設計事項D-01〜D-05 が全て「達成」かつ TP-01〜TP-05 が全 PASS かつ型エラーなし | Phase 11 へ進行          |
| MINOR | 未達が1件以下かつ TP-01〜TP-05 が全 PASS かつ型エラーなし                     | 修正後に Phase 11 へ進行 |
| MAJOR | 未達が2件以上、または TP-01〜TP-05 に FAIL あり、または型エラーあり           | 未達原因の Phase へ戻る  |

**戻り先決定基準**:

| 問題の種類                     | 戻り先    |
| ------------------------------ | --------- |
| 設計事項未達（実装漏れ）       | Phase 5   |
| TP FAIL（テスト失敗）          | Phase 5/6 |
| 型エラー（既存実装クラス）     | Phase 5   |
| リファクタリング起因の型エラー | Phase 8   |

3. 判定結果と根拠を `final-review-result.md` に記録する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md` の最終判定セクション（判定結果・根拠・次アクション）

---

## 参照資料

| 参照資料                   | パス                                                                            | 内容                      |
| -------------------------- | ------------------------------------------------------------------------------- | ------------------------- |
| 設計事項（Phase 2）        | `docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/phase-2-design.md` | 設計事項1〜5 の定義       |
| Phase 7 カバレッジレポート | `outputs/phase-7/coverage-report.md`                                            | TP-01〜TP-05 の PASS/FAIL |
| Phase 9 品質チェック結果   | `outputs/phase-9/quality-check-result.md`                                       | lint/typecheck/test 結果  |
| IEmbeddingClient 実装群    | `packages/shared/src/services/embedding/`                                       | 既存実装クラス一覧        |

---

## 成果物

| 成果物           | パス                                      | 内容                               |
| ---------------- | ----------------------------------------- | ---------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 設計照合・TP確認・型確認・最終判定 |

---

## 統合テスト連携【必須】

**Phase 10 の統合テスト連携アクション**:

- Phase 2 設計事項との照合により、実装と設計の整合性を最終確認する
- TP-01〜TP-05 の全 PASS 確認と既存実装クラスの型エラーなしを以って、統合品質を担保する
- 最終判定が PASS/MINOR の場合にのみ Phase 11（手動テスト）へ進行する
- MAJOR の場合は原因 Phase へ戻り、統合品質を担保してから再照合する

---

## 完了条件

- [ ] Phase 2 の設計事項1〜5 が証跡付きで照合されている
- [ ] TP-01〜TP-05 が全て PASS していることが確認されている
- [ ] 既存 `IEmbeddingClient` 実装クラスで型エラーがゼロであることが確認されている
- [ ] `outputs/phase-10/final-review-result.md` が生成されている
- [ ] 最終判定が PASS または MINOR であり、Phase 11 への進行が承認されている

---

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/phase-11-manual-test.md`
