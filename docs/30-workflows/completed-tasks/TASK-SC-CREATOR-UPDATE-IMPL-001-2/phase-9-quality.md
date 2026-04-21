# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 9                               |
| タスクID   | TASK-SC-CREATOR-UPDATE-IMPL-001 |
| ステータス | 未実施                          |
| 作成日     | 2026-04-21                      |
| 前Phase    | 8: リファクタリング             |
| 次Phase    | 10: 最終レビュー                |

---

## 目的

TypeScript 型チェック・ESLint・全テスト実行の最終確認を行い、
mirror parity（`.claude/skills` と `.agents/skills` の同期状態）を含む
品質基準を全て満たしていることを保証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: TypeScript 型チェックの実行

**目的**: `@repo/desktop` パッケージ全体で TypeScript 型エラーがゼロであることを確認する

**実行手順**:

1. 以下のコマンドを実行する

```bash
pnpm --filter @repo/desktop typecheck
```

2. エラーが出力された場合は内容を特定し、修正する
3. エラーゼロを確認したら結果を記録する

**合格基準**: 出力に `error TS` を含まないこと

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` の型チェックセクション（実行ログと結果）

---

### タスク2: ESLint 静的解析の実行

**目的**: `@repo/desktop` パッケージ全体で ESLint エラーがゼロであることを確認する

**実行手順**:

1. 以下のコマンドを実行する

```bash
pnpm --filter @repo/desktop lint
```

2. エラー・警告が出力された場合は内容を特定し、修正する
   - `error` レベルの指摘は全て修正する
   - `warning` レベルの指摘は内容を記録し、修正要否を判断する
3. エラーゼロを確認したら結果を記録する

**合格基準**: `0 errors` であること（warning は記録のうえで許容可）

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` の lint セクション（実行ログと結果）

---

### タスク3: 全テスト実行

**目的**: `@repo/desktop` の全テストが PASS することを確認する

**実行手順**:

1. 以下のコマンドを実行する

```bash
pnpm --filter @repo/desktop test
```

2. 全テストが PASS していることを確認する
3. 失敗したテストがある場合は原因を特定し修正する
4. テスト名・PASS 件数・FAIL 件数・実行時間を記録する

**合格基準**: FAIL 件数が 0 件であること

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` のテスト実行セクション（テスト名一覧・PASS 件数・実行時間）

---

### タスク4: mirror parity 確認

**目的**: `.claude/skills` と `.agents/skills` のファイルセットが一致していることを確認する

**実行手順**:

1. 以下の観点で `.claude/skills` と `.agents/skills` の同期状態を確認する
   - ファイル一覧が一致しているか
   - 内容（参照先・定義）が一致しているか
2. 差分がある場合は内容を記録し、同期が必要かどうか判断する
3. 同期が必要な場合は対象ファイルを更新し、再確認する
4. 結果を `quality-check-result.md` に記録する

**合格基準**: `.claude/skills` と `.agents/skills` のファイルセット・内容が一致していること

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` の mirror parity セクション

---

### タスク5: 品質ゲートの最終判定

**目的**: タスク1〜4 の結果を集約し、Phase 10 への進行可否を判定する

**実行手順**:

1. 以下の品質ゲートチェックリストを記入する

**品質ゲートチェックリスト**:

#### コード品質

- [ ] `pnpm --filter @repo/desktop typecheck` でエラーゼロ
- [ ] `pnpm --filter @repo/desktop lint` でエラーゼロ

#### テスト品質

- [ ] `pnpm --filter @repo/desktop test` で全テストが PASS

#### mirror parity

- [ ] `.claude/skills` と `.agents/skills` のファイルセット・内容が一致している

2. 全項目がチェックされた場合のみ Phase 10 へ進む
3. 未達項目がある場合は原因と対処方針を記録し、修正後に再実行する

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` の品質ゲート判定セクション

---

## 参照資料

| 参照資料         | パス                                                                        | 内容                  |
| ---------------- | --------------------------------------------------------------------------- | --------------------- |
| Phase 8 成果物   | `outputs/phase-8/`                                                          | リファクタリング結果  |
| 実装対象ファイル | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`               | 型チェック・lint 対象 |
| 品質基準         | `.claude/skills/task-specification-creator/references/quality-standards.md` | 品質ゲート基準        |

---

## 成果物

| 成果物           | パス                                      | 内容                                              |
| ---------------- | ----------------------------------------- | ------------------------------------------------- |
| 品質チェック結果 | `outputs/phase-9/quality-check-result.md` | typecheck・lint・テスト・mirror parity の結果集約 |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 9の統合テスト連携アクション**:

- typecheck / lint / テスト実行の全結果が品質基準を満たすことを最終確認する
- mirror parity 確認により、`.claude/skills` と `.agents/skills` の同期が取れていることを保証する
- 品質ゲートの全項目チェックを以って、Phase 10 への進行判定とする
- 未達項目がある場合は原因 Phase（8: リファクタリング、5: 実装等）に戻る

---

## 多角的チェック観点（AIが判断）

| 観点                   | チェック内容                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------- |
| typecheck の対象範囲   | `@repo/desktop` 全体（`SkillCreatorService.ts` を含む）がチェック対象になっているか   |
| lint の対象範囲        | テストファイルも lint 対象に含まれているか                                            |
| テスト実行の再現性     | 同じコマンドを複数回実行しても結果が安定しているか（flaky test がないか）             |
| mirror parity の正確性 | `.claude/skills` と `.agents/skills` の対応ファイルの内容が文字レベルで一致しているか |
| 品質ゲートの網羅性     | AC-001〜AC-005 のうち本 Phase で検証できる項目を全てカバーしているか                  |

---

## サブタスク管理

| サブタスクID | 内容                      | ステータス |
| ------------ | ------------------------- | ---------- |
| ST-9-01      | TypeScript 型チェック実行 | 未実施     |
| ST-9-02      | ESLint 静的解析実行       | 未実施     |
| ST-9-03      | 全テスト実行              | 未実施     |
| ST-9-04      | mirror parity 確認        | 未実施     |
| ST-9-05      | 品質ゲート最終判定        | 未実施     |

---

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` でエラーゼロを確認している
- [ ] `pnpm --filter @repo/desktop lint` でエラーゼロを確認している
- [ ] `pnpm --filter @repo/desktop test` で全テストが PASS している
- [ ] mirror parity 確認が完了し、`.claude/skills` と `.agents/skills` が一致している
- [ ] `outputs/phase-9/quality-check-result.md` が生成されている
- [ ] 品質ゲートの全項目がチェックされている

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-SC-CREATOR-UPDATE-IMPL-001/phase-10-final-review.md`
