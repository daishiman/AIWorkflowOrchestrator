# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| Phase      | 9                                                       |
| タスクID   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001 |
| タスク名   | auth regression coverage realignment                    |
| タスク種別 | NON_VISUAL                                              |
| ステータス | 未実施                                                  |
| 作成日     | 2026-04-19                                              |
| 前Phase    | 8: リファクタリング                                     |
| 次Phase    | 10: 最終レビュー                                        |

---

## 目的

lint / typecheck / テスト実行の最終確認を行い、CI シミュレーションを含む品質基準を
全て満たしていることを保証する。
既存テストへの回帰がないことと、新規追加テストケース（rapid click / rerender 条件）が
安定して PASS することを確認する。

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

### タスク3: 対象テストファイルの全 PASS 確認

**目的**: `SkillLifecyclePanel.auth-regression.test.tsx` の全テストケースが PASS することを確認する

**実行手順**:

1. 以下のコマンドを実行する（verbose レポーターで個別テスト結果を出力）

```bash
pnpm --filter @repo/desktop exec vitest run --reporter=verbose src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

2. 全テストが PASS していることを確認する
3. 失敗したテストがある場合は原因を特定し修正する
4. テスト名・PASS 件数・FAIL 件数・実行時間を記録する

**合格基準**: FAIL 件数が 0 件であること

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` のテスト実行セクション（テスト名一覧・PASS 件数・実行時間）

---

### タスク4: CI シミュレーション（全テストスイート）

**目的**: auth-regression テスト追加による既存テストへの回帰がないことを確認する

**実行手順**:

1. `@repo/desktop` パッケージの全テストを実行する

```bash
pnpm --filter @repo/desktop exec vitest run --reporter=verbose
```

2. 新規追加テスト以外のテストが PASS であることを確認する
3. CI 実行時間への影響を評価する（追加分 < 30 秒を目安とする）
4. 以下の評価基準に照らして判定する

| 評価項目                         | 基準値    | 実測値 | 判定 |
| -------------------------------- | --------- | ------ | ---- |
| 対象テストファイルの実行時間     | 30 秒以内 |        |      |
| 既存テストの FAIL 件数           | 0 件      |        |      |
| 全テストスイートの実行時間増加分 | 30 秒以内 |        |      |

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` の CI シミュレーションセクション

---

### タスク5: 品質ゲートの最終判定

**目的**: タスク1〜4の結果を集約し、Phase 10 への進行可否を判定する

**実行手順**:

1. 以下の品質ゲートチェックリストを記入する

**品質ゲートチェックリスト**:

#### コード品質

- [ ] `pnpm --filter @repo/desktop typecheck` でエラーゼロ
- [ ] `pnpm --filter @repo/desktop lint` でエラーゼロ

#### テスト品質

- [ ] 対象テストファイルの全テストケースが PASS
- [ ] 既存テストへの回帰がない（FAIL 件数: 0 件）

#### CI 時間

- [ ] 対象テストファイルの実行時間が 30 秒以内
- [ ] 全テストスイートの実行時間増加分が 30 秒以内

2. 全項目がチェックされた場合のみ Phase 10 へ進む
3. 未達項目がある場合は原因と対処方針を記録し、修正後に再実行する

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` の品質ゲート判定セクション

---

## 参照資料

| 参照資料           | パス                                                                                                | 内容                     |
| ------------------ | --------------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 8 成果物     | `outputs/phase-8/`                                                                                  | リファクタリング結果     |
| テスト対象ファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | 品質確認対象テスト       |
| コンポーネント本体 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | テスト対象コンポーネント |
| 品質基準           | `.claude/skills/task-specification-creator/references/quality-standards.md`                         | 品質ゲート基準           |

### システム仕様（aiworkflow-requirements）

> 品質保証時に必ず以下のシステム仕様を確認し、仕様に準拠した実装であることを最終確認してください。

| 参照資料   | パス                                                                   | 内容                 |
| ---------- | ---------------------------------------------------------------------- | -------------------- |
| 記述ガイド | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md` | 仕様記述・命名の基準 |

---

## 成果物

| 成果物           | パス                                      | 内容                                                   |
| ---------------- | ----------------------------------------- | ------------------------------------------------------ |
| 品質チェック結果 | `outputs/phase-9/quality-check-result.md` | typecheck・lint・テスト・CI シミュレーションの結果集約 |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 9 の統合テスト連携アクション**:

- typecheck / lint / vitest run の全結果が品質基準を満たすことを最終確認する
- CI シミュレーションにより、auth-regression テスト追加が既存テストスイートへ悪影響を与えないことを保証する
- 品質ゲートの全項目チェックを以って、Phase 10 への進行判定とする
- 未達項目がある場合は原因 Phase（8: リファクタリング、7: テスト追加等）に戻る

---

## 多角的チェック観点（AIが判断）

| 観点                 | チェック内容                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| typecheck の対象範囲 | `@repo/desktop` 全体（テストファイルを含む）がチェック対象になっているか                             |
| lint の対象範囲      | テストファイル・helpers ファイルも lint 対象に含まれているか                                         |
| テスト実行の再現性   | 同じコマンドを複数回実行しても結果が安定しているか（flaky test がないか）                            |
| 回帰影響の評価粒度   | auth-regression テスト追加による既存テスト（他の describe ブロック）への影響が個別に確認されているか |
| 品質ゲートの網羅性   | AC-001〜AC-006 のうち本 Phase で検証できる項目を全てカバーしているか                                 |
| CI 時間評価の適切さ  | 対象テストファイル単体と全スイートの両方で時間評価しているか                                         |

---

## サブタスク管理

| サブタスクID | 内容                              | ステータス |
| ------------ | --------------------------------- | ---------- |
| ST-9-01      | TypeScript 型チェック実行         | 未実施     |
| ST-9-02      | ESLint 静的解析実行               | 未実施     |
| ST-9-03      | 対象テストファイル全 PASS 確認    | 未実施     |
| ST-9-04      | CI シミュレーション（全スイート） | 未実施     |
| ST-9-05      | 品質ゲート最終判定                | 未実施     |

---

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` でエラーゼロを確認している
- [ ] `pnpm --filter @repo/desktop lint` でエラーゼロを確認している
- [ ] 対象テストファイルの全テストケースが PASS している
- [ ] 既存テストへの回帰がない（FAIL 件数: 0 件）
- [ ] CI 実行時間影響評価が完了し、許容範囲内であることが確認されている
- [ ] `outputs/phase-9/quality-check-result.md` が生成されている
- [ ] 品質ゲートの全項目がチェックされている

---

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001/phase-10-final-review.md`
