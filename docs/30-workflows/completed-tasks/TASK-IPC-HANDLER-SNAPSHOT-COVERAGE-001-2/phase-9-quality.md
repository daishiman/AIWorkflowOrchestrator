# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 9                                      |
| タスクID   | TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001 |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-19                             |
| 前Phase    | 8: リファクタリング                    |
| 次Phase    | 10: 最終レビュー                       |

---

## 目的

lint / typecheck / テスト実行の最終確認を行い、CI時間影響評価を含む品質基準を全て満たしていることを保証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: TypeScript型チェックの実行

**目的**: `@repo/desktop` パッケージ全体でTypeScript型エラーがゼロであることを確認する

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

### タスク2: ESLint静的解析の実行

**目的**: `@repo/desktop` パッケージ全体でESLintエラーがゼロであることを確認する

**実行手順**:

1. 以下のコマンドを実行する

```bash
pnpm --filter @repo/desktop lint
```

2. エラー・警告が出力された場合は内容を特定し、修正する
   - `error` レベルの指摘は全て修正する
   - `warning` レベルの指摘は内容を記録し、修正要否を判断する
3. エラーゼロを確認したら結果を記録する

**合格基準**: `0 errors` であること（warningは記録のうえで許容可）

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` のlintセクション（実行ログと結果）

---

### タスク3: 対象テストファイルの全PASS確認

**目的**: `apps/desktop/src/main/ipc/__tests__/` 配下の全スナップショットテストが `pnpm vitest run` でPASSすることを確認する

**実行手順**:

1. 以下のコマンドを実行する（verboseレポーターで個別テスト結果を出力）

```bash
pnpm vitest run --reporter=verbose apps/desktop/src/main/ipc/__tests__/
```

2. 全テストがPASSしていることを確認する
3. 失敗したテストがある場合は原因を特定し修正する
4. テスト名・PASS件数・FAIL件数・実行時間を記録する

**合格基準**: FAIL件数が0件であること

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` のテスト実行セクション（テスト名一覧・PASS件数・実行時間）

---

### タスク4: CI時間影響評価

**目的**: スナップショットテスト群の追加がCIパイプライン全体の実行時間に与える影響が許容範囲内であることを評価する

**実行手順**:

1. Phase 7で計測したCI実行時間（`outputs/phase-7/coverage-report.md`）を参照する
2. Phase 8のリファクタリング後の実行時間を再計測する

```bash
pnpm vitest run --reporter=verbose apps/desktop/src/main/ipc/__tests__/
```

3. 以下の評価基準に照らして判定する

| 評価項目                    | 基準値   | 実測値 | 判定 |
| --------------------------- | -------- | ------ | ---- |
| Wave当たりのテスト追加時間  | 30秒以内 |        |      |
| 全Waveの合計時間            | 90秒以内 |        |      |
| Phase 7から実行時間の増加分 | 10秒以内 |        |      |

4. 許容範囲を超えた場合は原因を特定し、対策（テストの並列化、不要なawait除去など）を検討して記録する

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` のCI時間評価セクション

---

### タスク5: IPC契約ドリフトのレポート確認

**目的**: registration snapshot 追加によって IPC 契約の命名・参照・整合性が崩れていないことを確認する

**実行手順**:

1. IPC 契約検証のレポートコマンドを実行する

```bash
pnpm --filter @repo/desktop exec tsx scripts/check-ipc-contracts.ts --report-only
```

2. 命名不一致、未使用チャンネル、参照切れがないことを確認する
3. 問題がある場合は原因を記録し、修正Phaseへ戻す

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` のIPC契約ドリフト確認セクション

---

### タスク6: 品質ゲートの最終判定

**目的**: タスク1〜4の結果を集約し、Phase 10への進行可否を判定する

**実行手順**:

1. 以下の品質ゲートチェックリストを記入する

**品質ゲートチェックリスト**:

#### コード品質

- [ ] `pnpm --filter @repo/desktop typecheck` でエラーゼロ
- [ ] `pnpm --filter @repo/desktop lint` でエラーゼロ

#### テスト品質

- [ ] `pnpm vitest run --reporter=verbose` で対象テストファイルの全テストがPASS
- [ ] スナップショットファイルがGitにコミットされている

#### CI時間

- [ ] Wave当たりの追加時間が30秒以内
- [ ] 全Waveの合計時間が90秒以内

2. 全項目がチェックされた場合のみ Phase 10 へ進む
3. 未達項目がある場合は原因と対処方針を記録し、修正後に再実行する

**期待される成果物**:

- `outputs/phase-9/quality-check-result.md` の品質ゲート判定セクション

---

## 参照資料

| 参照資料                  | パス                                                                        | 内容                 |
| ------------------------- | --------------------------------------------------------------------------- | -------------------- |
| Phase 8成果物             | `outputs/phase-8/`                                                          | リファクタリング結果 |
| Phase 7カバレッジレポート | `outputs/phase-7/coverage-report.md`                                        | CI時間基準値         |
| shared test utility       | `apps/desktop/src/main/ipc/__tests__/helpers/ipcMainMock.ts`                | 型定義確認対象       |
| 品質基準                  | `.claude/skills/task-specification-creator/references/quality-standards.md` | 品質ゲート基準       |

### システム仕様（aiworkflow-requirements）

> 品質保証時に必ず以下のシステム仕様を確認し、仕様に準拠した実装であることを最終確認してください。

| 参照資料            | パス                                                                         | 内容                      |
| ------------------- | ---------------------------------------------------------------------------- | ------------------------- |
| IPC Handler Pattern | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | IPCハンドラー登録パターン |

---

## 成果物

| 成果物           | パス                                      | 内容                                      |
| ---------------- | ----------------------------------------- | ----------------------------------------- |
| 品質チェック結果 | `outputs/phase-9/quality-check-result.md` | typecheck・lint・テスト・CI時間の結果集約 |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 9の統合テスト連携アクション**:

- typecheck / lint / vitest run の全結果が品質基準を満たすことを最終確認する
- CI時間評価により、wave分割がCIパイプラインの許容範囲内に収まることを保証する
- 品質ゲートの全項目チェックを以って、Phase 10への進行判定とする
- 未達項目がある場合は原因Phase（8: リファクタリング、6: テスト拡充等）に戻る

---

## 多角的チェック観点（AIが判断）

| 観点                 | チェック内容                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| typecheck の対象範囲 | `@repo/desktop` 全体（`apps/desktop/src/main/ipc/__tests__/` を含む）がチェック対象になっているか |
| lint の対象範囲      | テストファイル・helperファイルも lint 対象に含まれているか                                        |
| テスト実行の再現性   | 同じコマンドを複数回実行しても結果が安定しているか（flaky test がないか）                         |
| CI時間の評価粒度     | Wave単位と全体合計の両方で評価しているか                                                          |
| 品質ゲートの網羅性   | AC-001〜AC-008 のうち本Phaseで検証できる項目を全てカバーしているか                                |
| IPC契約ドリフト      | registration snapshot 追加により命名・参照・契約が崩れていないか                                  |

---

## サブタスク管理

| サブタスクID | 内容                         | ステータス |
| ------------ | ---------------------------- | ---------- |
| ST-9-01      | TypeScript型チェック実行     | 未実施     |
| ST-9-02      | ESLint静的解析実行           | 未実施     |
| ST-9-03      | 対象テストファイル全PASS確認 | 未実施     |
| ST-9-04      | CI時間影響評価               | 未実施     |
| ST-9-05      | IPC契約ドリフト確認          | 未実施     |
| ST-9-06      | 品質ゲート最終判定           | 未実施     |

---

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` でエラーゼロを確認している
- [ ] `pnpm --filter @repo/desktop lint` でエラーゼロを確認している
- [ ] `pnpm vitest run --reporter=verbose` で対象テストファイルの全テストがPASSしている
- [ ] CI時間影響評価が完了し、許容範囲内であることが確認されている
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

`docs/30-workflows/TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001/phase-10-final-review.md`
