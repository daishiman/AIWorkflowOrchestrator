# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 9                                         |
| タスクID   | TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001 |
| ステータス | pending                                   |
| 作成日     | 2026-04-20                                |
| 前Phase    | 8: リファクタリング                       |
| 次Phase    | 10: 最終レビュー                          |

---

## 目的

型チェック・Lint・テスト全件実行の最終確認を行い、
`@repo/shared` パッケージが CI 品質基準をすべて満たしていることを保証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: TypeScript 型チェックの実行

**目的**: `@repo/shared` パッケージ全体で TypeScript 型エラーがゼロであることを確認する

**実行手順**:

1. 以下のコマンドを実行する

```bash
pnpm --filter @repo/shared typecheck
```

2. エラーが出力された場合は内容を特定し修正する
3. エラーゼロを確認したら結果を記録する

**合格基準**: 出力に `error TS` を含まないこと

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` の型チェックセクション（実行ログと結果）

---

### タスク2: ESLint 静的解析の実行

**目的**: `@repo/shared` パッケージ全体で ESLint エラーがゼロであることを確認する

**実行手順**:

1. 以下のコマンドを実行する

```bash
pnpm --filter @repo/shared lint
```

2. エラー・警告が出力された場合は内容を特定し修正する
   - `error` レベルの指摘は全て修正する
   - `warning` レベルの指摘は内容を記録し、修正要否を判断する
3. エラーゼロを確認したら結果を記録する

**合格基準**: `0 errors` であること（warning は記録のうえで許容可）

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` の lint セクション（実行ログと結果）

---

### タスク3: テスト全件実行と PASS 確認

**目的**: `@repo/shared` パッケージの全テストが PASS することを確認する

**実行手順**:

1. 以下のコマンドでテスト全件を実行する

```bash
pnpm --filter @repo/shared test
```

2. 全テストが PASS していることを確認する
3. 失敗したテストがある場合は原因を特定し修正する
4. テスト名・PASS 件数・FAIL 件数・実行時間を記録する

**合格基準**: FAIL 件数が 0 件であること

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` のテスト実行セクション（テスト名一覧・PASS 件数・実行時間）

---

### タスク4: chunking-service 統合テストの実行

**目的**: `chunking-service.integration` テストが PASS することを確認する

**実行手順**:

1. 以下のコマンドで統合テストを実行する

```bash
pnpm --filter @repo/shared test -- chunking-service.integration
```

2. 統合テストの PASS/FAIL を確認する
3. 失敗した場合は原因を特定し、Phase 5/6 に戻り修正する
4. 実行結果を記録する

**合格基準**: 統合テストが全て PASS すること

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` の統合テストセクション

---

### タスク5: 品質ゲートの最終判定

**目的**: タスク1〜4 の結果を集約し、Phase 10 への進行可否を判定する

**実行手順**:

1. 以下の品質ゲートチェックリストを記入する

**品質ゲートチェックリスト**:

#### コード品質

- [ ] `pnpm --filter @repo/shared typecheck` でエラーゼロ
- [ ] `pnpm --filter @repo/shared lint` でエラーゼロ

#### テスト品質

- [ ] `pnpm --filter @repo/shared test` で全テストが PASS
- [ ] `pnpm --filter @repo/shared test -- chunking-service.integration` で統合テストが全 PASS
- [ ] TP-01〜TP-05 が全て PASS していることを Phase 7 レポートで確認済み

2. 全項目がチェックされた場合のみ Phase 10 へ進む
3. 未達項目がある場合は原因と対処方針を記録し、修正後に再実行する

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` の品質ゲート判定セクション

---

## 参照資料

| 参照資料           | パス                                                                        | 内容                 |
| ------------------ | --------------------------------------------------------------------------- | -------------------- |
| Phase 8 成果物     | `outputs/phase-8/`                                                          | リファクタリング結果 |
| Phase 7 カバレッジ | `outputs/phase-7/coverage-report.md`                                        | TP-01〜TP-05 結果    |
| 品質基準           | `.claude/skills/task-specification-creator/references/quality-standards.md` | 品質ゲート基準       |

### システム仕様（aiworkflow-requirements）

> 品質保証時に必ず以下のシステム仕様を確認し、仕様に準拠した実装であることを最終確認してください。

| 参照資料       | パス                                                                          | 内容                                  |
| -------------- | ----------------------------------------------------------------------------- | ------------------------------------- |
| Embedding 仕様 | `.claude/skills/aiworkflow-requirements/references/embedding-architecture.md` | IEmbeddingClient インターフェース仕様 |

---

## 成果物

| 成果物           | パス                                      | 内容                                          |
| ---------------- | ----------------------------------------- | --------------------------------------------- |
| 品質チェック結果 | `outputs/phase-9/quality-check-result.md` | typecheck・lint・テスト・統合テストの結果集約 |

---

## 統合テスト連携【必須】

**Phase 9 の統合テスト連携アクション**:

- typecheck / lint / test 全件の結果が品質基準を満たすことを最終確認する
- 統合テスト（`chunking-service.integration`）の PASS を以って、Late Chunking パイプラインの動作を保証する
- 品質ゲートの全項目チェックを以って、Phase 10 への進行判定とする
- 未達項目がある場合は原因 Phase（8: リファクタリング、6: テスト拡充等）に戻る

---

## 完了条件

- [ ] `pnpm --filter @repo/shared typecheck` でエラーゼロを確認している
- [ ] `pnpm --filter @repo/shared lint` でエラーゼロを確認している
- [ ] `pnpm --filter @repo/shared test` で全テストが PASS している
- [ ] `pnpm --filter @repo/shared test -- chunking-service.integration` で統合テストが PASS している
- [ ] `outputs/phase-9/quality-check-result.md` が生成されている
- [ ] 品質ゲートの全項目がチェックされている

---

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/phase-10-final-review.md`
