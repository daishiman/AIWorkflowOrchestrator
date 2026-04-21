# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 7                                         |
| タスクID   | TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 |
| ステータス | pending                                   |
| 作成日     | 2026-04-20                                |
| 前Phase    | 6: テスト拡充                             |
| 次Phase    | 8: リファクタリング                       |

---

## 目的

`getTokenEmbeddings()` の両分岐（クライアントあり / フォールバック）と
長さ整合バリデーションが
テストカバレッジで網羅されていることを可視化し、TP-01〜TP-05 の全 PASS を最終確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ計測の実行

**目的**: 対象モジュールのステートメント・ブランチ・関数カバレッジを数値で確認する

**実行手順**:

1. 以下のコマンドを実行する

```bash
pnpm --filter @repo/shared test --coverage -- chunking-service
```

2. `coverage/` レポートを開き、以下のファイルのカバレッジ数値を記録する
   - `packages/shared/src/services/chunking/chunking-service.ts`
   - `packages/shared/src/services/embedding/` 配下の関連ファイル
3. ブランチカバレッジが 80% 未満の場合は Phase 6 へ戻り追加テストを実装する

**カバレッジ集計表（記入例）**:

| ファイル            | Statements | Branches | Functions | Lines |
| ------------------- | ---------- | -------- | --------- | ----- |
| chunking-service.ts |            |          |           |       |
| （関連ファイル）    |            |          |           |       |

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` のカバレッジ数値セクション

---

### タスク2: `getTokenEmbeddings()` 両分岐のカバレッジ確認

**目的**: クライアントに `getTokenEmbeddings()` が存在する場合と存在しない（フォールバック）場合の両方がテストで網羅されていることを確認する

**実行手順**:

1. `packages/shared/src/services/chunking/chunking-service.ts` を開き、`getTokenEmbeddings()` の実装を確認する
2. 以下の2分岐がテストで呼び出されていることをカバレッジレポートで確認する
   - 分岐A: クライアントが `getTokenEmbeddings()` を持つ場合（正常パス）
   - 分岐B: クライアントが `getTokenEmbeddings()` を持たない場合（フォールバックパス）
3. 分岐の確認状況を以下の表に記録する

**分岐カバレッジ確認表**:

| 分岐ID  | 説明                                                               | テストID | カバー状況 |
| ------- | ------------------------------------------------------------------ | -------- | ---------- |
| B-GTE-1 | クライアントが `getTokenEmbeddings()` を持つ                       | TP-01    |            |
| B-GTE-2 | クライアントが `getTokenEmbeddings()` を持たない（フォールバック） | TP-02    |            |

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` の `getTokenEmbeddings()` 分岐確認セクション

---

### タスク3: 長さ整合バリデーションのカバレッジ確認

**目的**: `tokens.length !== embeddings.length` の異常系がテストで網羅されていることを確認する

**実行手順**:

1. `ChunkingService.getTokenEmbeddings()` 実装の検証分岐を確認する
2. 正常系と異常系がテストで呼び出されていることをカバレッジレポートで確認する
   - 正常系: `tokens.length === embeddings.length`
   - 異常系: `tokens.length !== embeddings.length`
3. 分岐の確認状況を以下の表に記録する

**分岐カバレッジ確認表**:

| 分岐ID  | 分岐内容                                      | テストID            | カバー状況 |
| ------- | --------------------------------------------- | ------------------- | ---------- |
| B-LEN-1 | 正常系: `tokens.length === embeddings.length` | TP-01, TP-02, TP-03 |            |
| B-LEN-2 | 異常系: `tokens.length !== embeddings.length` | TP-05               |            |

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` の長さ整合バリデーション確認セクション

---

### タスク4: TP-01〜TP-05 全 PASS 確認

**目的**: 完了条件として定義された全テストケースが PASS していることを確認する

**実行手順**:

1. 以下のコマンドでテストを実行し、各 TP の PASS/FAIL を確認する

```bash
pnpm --filter @repo/shared test -- chunking-service
```

2. TP-01〜TP-05 の PASS/FAIL ステータスを記録する

**テストケース確認表**:

| テストID | テスト名（概要） | PASS/FAIL |
| -------- | ---------------- | --------- |
| TP-01    |                  |           |
| TP-02    |                  |           |
| TP-03    |                  |           |
| TP-04    |                  |           |
| TP-05    |                  |           |

3. FAIL がある場合は原因を特定し Phase 5/6 へ戻る

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` の TP 確認テーブルセクション

---

## 参照資料

| 参照資料             | パス                                                                   | 内容                       |
| -------------------- | ---------------------------------------------------------------------- | -------------------------- |
| タスク全体仕様       | `docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/index.md` | 完了条件・テストケース定義 |
| Phase 6 成果物       | `outputs/phase-6/`                                                     | テスト拡充結果             |
| ChunkingService 実装 | `packages/shared/src/services/embedding/`                              | カバレッジ対象ソース       |
| Late Chunking 仕様   | `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/index.md`          | Late Chunking 全体仕様     |

### システム仕様（aiworkflow-requirements）

> カバレッジ確認時に必ず以下のシステム仕様を参照し、仕様に定義された機能が網羅されているか確認してください。

| 参照資料       | パス                                                                          | 内容                                  |
| -------------- | ----------------------------------------------------------------------------- | ------------------------------------- |
| Embedding 仕様 | `.claude/skills/aiworkflow-requirements/references/embedding-architecture.md` | IEmbeddingClient インターフェース仕様 |

---

## 成果物

| 成果物             | パス                                 | 内容                                                       |
| ------------------ | ------------------------------------ | ---------------------------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | カバレッジ数値・分岐確認表・TP-01〜TP-05 の PASS/FAIL 結果 |

---

## 統合テスト連携【必須】

**Phase 7 の統合テスト連携アクション**:

- カバレッジレポートにより `getTokenEmbeddings()` と長さ整合バリデーションの全分岐網羅を可視化する
- TP-01〜TP-05 の全 PASS 確認により、Phase 5/6 で実装したテストの健全性を担保する
- カバレッジが未達の場合は本 Phase から Phase 6 へ戻る（ゲート判定）
- 統合テストは以下コマンドで実行する

```bash
pnpm --filter @repo/shared test -- chunking-service.integration
```

---

## 完了条件

- [ ] `pnpm --filter @repo/shared test --coverage` でカバレッジレポートが生成されている
- [ ] `getTokenEmbeddings()` の両分岐（あり/フォールバック）がカバーされている
- [ ] 長さ整合バリデーションの正常系 / 異常系がカバーされている
- [ ] TP-01〜TP-05 が全て PASS している
- [ ] `outputs/phase-7/coverage-report.md` が生成されている

---

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/phase-8-refactoring.md`
