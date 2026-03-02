# Phase 6: テスト拡充 — Phase 11 Worktree環境テストプロトコル標準化

## メタ情報

| 項目       | 内容                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001                                                              |
| Phase      | 6                                                                                                 |
| タスク名   | Phase 11 Worktree環境テストプロトコル標準化                                                       |
| 機能名     | ut-imp-phase11-worktree-protocol                                                                  |
| Issue      | #853                                                                                              |
| 作成日     | 2026-03-01                                                                                        |
| 前提Phase  | Phase 5（実装: TDD Green）完了済み                                                                |
| 次Phase    | Phase 7（テストカバレッジ確認）                                                                   |
| 依存成果物 | Phase 5 で作成した全実装ファイル（3ユーティリティ + 2 E2Eテスト + playwright.config.ts + CI更新） |

## 目的

Phase 5 で実装したプロダクションコード（Worktree環境判定ユーティリティ、deferred-testsパーサー、Layer分類判定ロジック）と E2E テストのカバレッジを分析し、カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を達成するためのテストを追加する。Phase 4 で作成した基本テスト（18ユニットテスト + 10 E2Eテスト）に対し、境界値テスト、異常系テスト、組合せテストを拡充する。

## 実行タスク

- Task 1: 現行カバレッジの測定と分析
- Task 2: Worktree 環境判定ロジックのテスト拡充（境界値・異常系）
- Task 3: deferred-tests パーサーのテスト拡充（境界値・異常系）
- Task 4: Layer 分類判定ロジックのテスト拡充（組合せ・境界値）
- Task 5: E2E テストの拡充（全 IPC チャンネル対応・異常系強化）
- Task 6: プロトコル検証テスト追加（Layer 1-3 実行フロー全パターン）

## 参照資料

| 資料                                                   | 用途                                                    |
| ------------------------------------------------------ | ------------------------------------------------------- |
| `outputs/phase-4/test-case-design.md`                  | Phase 4 テストケース一覧（基本テストの参照）            |
| `outputs/phase-5/implementation-summary.md`            | Phase 5 実装サマリー（実装内容の把握）                  |
| `.claude/rules/02-code-quality.md`                     | カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+） |
| `.claude/rules/06-known-pitfalls.md`                   | P9, P42, P44 等のテスト設計注意点                       |
| `apps/desktop/src/main/utils/worktree-detector.ts`     | テスト対象: Worktree 環境判定ユーティリティ             |
| `apps/desktop/src/main/utils/deferred-tests-parser.ts` | テスト対象: deferred-tests パーサー                     |
| `apps/desktop/src/main/utils/test-layer-classifier.ts` | テスト対象: Layer 分類判定ロジック                      |

## 実行手順

### Task 1: 現行カバレッジの測定と分析

**目的**: Phase 5 完了時点のカバレッジを測定し、基準未達の箇所を特定する。

**実行コマンド**:

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/utils/__tests__/worktree-detector.test.ts src/main/utils/__tests__/deferred-tests-parser.test.ts src/main/utils/__tests__/test-layer-classifier.test.ts
```

**分析観点**:

| 分析項目           | 確認内容                                                  |
| ------------------ | --------------------------------------------------------- |
| Line Coverage      | 各ファイルの未実行行を特定する                            |
| Branch Coverage    | if/else, try/catch, 三項演算子の未到達ブランチを特定する  |
| Function Coverage  | 未呼び出し関数を特定する                                  |
| 境界値未テスト箇所 | 空配列、null、undefined、最大長等の未テスト入力を特定する |

**期待成果物**: `outputs/phase-6/coverage-report.md` に現行カバレッジと未達箇所の分析結果を記録する

### Task 2: Worktree 環境判定ロジックのテスト拡充

**テストファイル**: `apps/desktop/src/main/utils/__tests__/worktree-detector.test.ts`

**追加テストケース**:

| TC-ID    | テスト内容                                                               | 期待結果                         | テスト種別 |
| -------- | ------------------------------------------------------------------------ | -------------------------------- | ---------- |
| UT-WD-06 | `projectRoot` に空文字列を指定した場合、`process.cwd()` をフォールバック | `false` を返す（通常リポジトリ） | 境界値     |
| UT-WD-07 | `.git` ファイルの内容が `gitdir:` のみ（パスなし）の場合                 | `true` を返す                    | 境界値     |
| UT-WD-08 | `.git` ファイルの内容が空白のみの場合                                    | `false` を返す                   | 境界値     |
| UT-WD-09 | `fs.readFileSync` がエラーを throw した場合                              | `false` を返す                   | 異常系     |
| UT-WD-10 | `.git` ファイルの内容に改行が含まれる場合                                | `true` を返す（trim で正規化）   | 境界値     |
| UT-WD-11 | `projectRoot` が存在しないディレクトリの場合                             | `false` を返す                   | 異常系     |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/utils/__tests__/worktree-detector.test.ts
```

**期待結果**: 11テスト全て PASS（既存5 + 追加6）

### Task 3: deferred-tests パーサーのテスト拡充

**テストファイル**: `apps/desktop/src/main/utils/__tests__/deferred-tests-parser.test.ts`

**追加テストケース**:

| TC-ID    | テスト内容                                                     | 期待結果                                             | テスト種別         |
| -------- | -------------------------------------------------------------- | ---------------------------------------------------- | ------------------ | ------ |
| UT-DP-07 | テーブルにヘッダー行のみ（データ行なし）の場合                 | 空配列を返し、`allResolved === true`                 | 境界値             |
| UT-DP-08 | テーブルのカラム数が6未満（5カラム）の行が含まれる場合         | `ParseError` を throw                                | 異常系             |
| UT-DP-09 | ステータスが「完了」「未実施」以外の値（「実施中」）を含む場合 | `allResolved === false`                              | 境界値             |
| UT-DP-10 | テーブル行の前後に余計な空白行が含まれる場合                   | 正常にパースされる                                   | 境界値             |
| UT-DP-11 | 100行のテスト項目を含む大規模テーブルの場合                    | 全項目が正常にパースされる（`items.length === 100`） | 大規模データ       |
| UT-DP-12 | テーブルセルに `                                               | ` 文字がエスケープされている場合                     | 正常にパースされる | 境界値 |
| UT-DP-13 | `undefined` を引数に渡した場合                                 | `DeferredTestsNotFoundError` を throw                | 異常系             |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/utils/__tests__/deferred-tests-parser.test.ts
```

**期待結果**: 13テスト全て PASS（既存6 + 追加7）

### Task 4: Layer 分類判定ロジックのテスト拡充

**テストファイル**: `apps/desktop/src/main/utils/__tests__/test-layer-classifier.test.ts`

**追加テストケース**:

| TC-ID    | テスト内容                                                      | 期待結果                   | テスト種別 |
| -------- | --------------------------------------------------------------- | -------------------------- | ---------- |
| UT-LC-08 | `integration-test` タイプで Electron 不要の場合                 | `layer === 1`              | 組合せ     |
| UT-LC-09 | `integration-test` タイプで Electron 必要の場合                 | `layer === 3`              | 組合せ     |
| UT-LC-10 | `requiresElectron === true` かつ `requiresUI === false` の場合  | `layer === 3`              | 組合せ     |
| UT-LC-11 | `requiresElectron === false` かつ `requiresUI === true` の場合  | `layer === 3`              | 組合せ     |
| UT-LC-12 | `canRunInWorktree` に不正な値（0 や 4）を渡した場合の動作       | `false` を返す             | 境界値     |
| UT-LC-13 | 全 TestItem type と runner の組合せで分類が正しいことを確認する | 各組合せで期待通りの Layer | 網羅性     |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/utils/__tests__/test-layer-classifier.test.ts
```

**期待結果**: 13テスト全て PASS（既存7 + 追加6）

### Task 5: E2E テストの拡充

**テストファイル**:

- `apps/desktop/e2e/ipc-skill-remove.spec.ts`
- `apps/desktop/e2e/ipc-skill-import.spec.ts`

**追加テストケース（skill:remove）**:

| TC-ID     | テスト内容                                   | 期待結果                             | テスト種別 |
| --------- | -------------------------------------------- | ------------------------------------ | ---------- |
| E2E-SR-06 | 特殊文字を含むスキル名（`test/skill`）の削除 | バリデーションまたはエラーレスポンス | 境界値     |
| E2E-SR-07 | 非常に長いスキル名（256文字）の削除          | バリデーションエラーまたは成功       | 境界値     |
| E2E-SR-08 | 連続して同じスキルを2回削除した場合          | 2回目はエラーレスポンスを返す        | 異常系     |

**追加テストケース（skill:import）**:

| TC-ID     | テスト内容                                         | 期待結果                             | テスト種別 |
| --------- | -------------------------------------------------- | ------------------------------------ | ---------- |
| E2E-SI-06 | 特殊文字を含むスキル名（`test/skill`）のインポート | バリデーションまたはエラーレスポンス | 境界値     |
| E2E-SI-07 | 非常に長いスキル名（256文字）のインポート          | バリデーションエラーまたは成功       | 境界値     |
| E2E-SI-08 | 同じスキルを2回インポートした場合                  | 2回目は重複エラーまたは冪等成功      | 異常系     |

**確認コマンド**:

```bash
cd apps/desktop && pnpm build && npx playwright test e2e/
```

**期待結果**: 16 E2E テスト全て PASS（既存10 + 追加6）

### Task 6: プロトコル検証テスト追加

**目的**: Layer 1-3 の実行フロー全パターンをテストで検証する。

**テストファイル**: `apps/desktop/src/main/utils/__tests__/worktree-protocol-flow.test.ts`（新規作成）

**テストケース**:

| TC-ID    | テスト内容                                                          | 期待結果                                                   | テスト種別 |
| -------- | ------------------------------------------------------------------- | ---------------------------------------------------------- | ---------- |
| UT-PF-01 | Worktree 環境で Layer 1 テスト実行フローが正しく動作する            | Layer 1 テスト一覧が取得でき、全件「実行可能」と判定される | 統合       |
| UT-PF-02 | Worktree 環境で Layer 2 テスト実行フローが正しく動作する            | Layer 2 テスト一覧が取得でき、全件「実行可能」と判定される | 統合       |
| UT-PF-03 | Worktree 環境で Layer 3 テストが deferred-tests に記録される        | deferred-tests パーサーの入力形式が正しい                  | 統合       |
| UT-PF-04 | メインリポジトリ環境で全 Layer のテストが実行可能と判定される       | Layer 1, 2, 3 全てで `canRun === true`                     | 統合       |
| UT-PF-05 | deferred-tests の全項目が完了の場合、プロトコル完了と判定される     | `protocolComplete === true`                                | 統合       |
| UT-PF-06 | deferred-tests に未完了項目がある場合、プロトコル未完了と判定される | `protocolComplete === false`                               | 統合       |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/utils/__tests__/worktree-protocol-flow.test.ts
```

**期待結果**: 6テスト全て PASS

---

## 統合テスト連携

### Phase 6 テスト拡充の全体像

| テストファイル                   | Phase 4 基本テスト | Phase 6 追加テスト | 合計   |
| -------------------------------- | ------------------ | ------------------ | ------ |
| `worktree-detector.test.ts`      | 5                  | 6                  | 11     |
| `deferred-tests-parser.test.ts`  | 6                  | 7                  | 13     |
| `test-layer-classifier.test.ts`  | 7                  | 6                  | 13     |
| `worktree-protocol-flow.test.ts` | 0                  | 6                  | 6      |
| `ipc-skill-remove.spec.ts`       | 5                  | 3                  | 8      |
| `ipc-skill-import.spec.ts`       | 5                  | 3                  | 8      |
| **合計**                         | **28**             | **31**             | **59** |

### テスト種別の分布

| テスト種別   | ケース数 | 割合  |
| ------------ | -------- | ----- |
| 正常系       | 18       | 30.5% |
| 境界値       | 20       | 33.9% |
| 異常系       | 13       | 22.0% |
| 組合せ       | 5        | 8.5%  |
| 統合         | 6        | 10.2% |
| 大規模データ | 1        | 1.7%  |

注: 一部テストケースが複数種別に該当するため、合計は59件を超える場合がある。

### API 接続テストカバレッジ

| IPC チャンネル | 正常系 | 異常系（バリデーション） | 異常系（ビジネスロジック） | 境界値 | 合計 |
| -------------- | ------ | ------------------------ | -------------------------- | ------ | ---- |
| `skill:remove` | 2      | 2                        | 2                          | 2      | 8    |
| `skill:import` | 2      | 2                        | 2                          | 2      | 8    |

---

## 多角的チェック観点

### セキュリティ観点

- [ ] 追加したテストケースにハードコードされたシークレットが含まれていない
- [ ] 境界値テストのテストデータに本番環境のパターンが使用されていない
- [ ] パストラバーサル攻撃パターン（`../`, `..\\`）がテストに含まれている（E2E テストの特殊文字テスト）

### パフォーマンス観点

- [ ] 大規模データテスト（UT-DP-11: 100行テーブル）の実行時間が1秒以内に収まる
- [ ] テスト追加後のユニットテストスイート全体の実行時間が30秒以内に収まる
- [ ] E2E テスト追加後の E2E テストスイート全体の実行時間が60秒以内に収まる（NFR-2）

### 既知の落とし穴（Pitfall）対策

- [ ] P9 対策: 追加テストが既存テストと状態を共有していない（`beforeEach` でリセット）
- [ ] P42 対策: 空文字列テストとスペースのみテストの両方が含まれている
- [ ] P41 対策: v8 カバレッジプロバイダのインライン関数カウントを考慮したテスト設計
- [ ] P40 対策: テスト実行コマンドが `apps/desktop/` ディレクトリからの実行を前提としている

### コード品質観点

- [ ] 追加テストコード内に `any` 型が使用されていない
- [ ] テストケース ID が一意であり、既存テストと重複していない
- [ ] 各テストケースのアサーションが具体的な値で検証されている
- [ ] テストの説明文（`it` / `test` の第一引数）にテストケース ID が含まれている

---

## サブタスク管理

| サブタスク | 担当 | ステータス | 成果物                                                                               |
| ---------- | ---- | ---------- | ------------------------------------------------------------------------------------ |
| Task 1     | 自動 | 未着手     | `outputs/phase-6/coverage-report.md`（現行カバレッジ分析）                           |
| Task 2     | 自動 | 未着手     | `worktree-detector.test.ts`（6テスト追加）                                           |
| Task 3     | 自動 | 未着手     | `deferred-tests-parser.test.ts`（7テスト追加）                                       |
| Task 4     | 自動 | 未着手     | `test-layer-classifier.test.ts`（6テスト追加）                                       |
| Task 5     | 自動 | 未着手     | `ipc-skill-remove.spec.ts`（3テスト追加）, `ipc-skill-import.spec.ts`（3テスト追加） |
| Task 6     | 自動 | 未着手     | `worktree-protocol-flow.test.ts`（新規: 6テスト）                                    |

---

## タスク100%実行確認

Phase 6 完了時に以下の全項目を確認する:

- [ ] Task 1〜6 の全サブタスクが完了している
- [ ] `outputs/phase-6/coverage-report.md` に現行カバレッジ分析が記録されている
- [ ] ユニットテスト合計 43 ケース（既存18 + 追加19 + 新規6）が全て PASS
  ```bash
  cd apps/desktop && pnpm vitest run src/main/utils/__tests__/
  ```
- [ ] E2E テスト合計 16 ケース（既存10 + 追加6）のテストコードが完成している
- [ ] テスト種別の分布が偏っていない（境界値・異常系が合計の50%以上）
- [ ] 追加テストコード内に `any` 型が使用されていない
- [ ] 追加テスト間で状態を共有していない（`beforeEach` でリセット）
- [ ] `outputs/phase-6/integration-test.md` に統合テスト拡充結果が記録されている

---

## 成果物

| #   | 成果物                                | 配置先                                                                 | 種別         |
| --- | ------------------------------------- | ---------------------------------------------------------------------- | ------------ |
| 1   | カバレッジ分析レポート                | `outputs/phase-6/coverage-report.md`                                   | ドキュメント |
| 2   | 統合テスト拡充レポート                | `outputs/phase-6/integration-test.md`                                  | ドキュメント |
| 3   | Worktree 環境判定テスト（拡充）       | `apps/desktop/src/main/utils/__tests__/worktree-detector.test.ts`      | テストコード |
| 4   | deferred-tests パーサーテスト（拡充） | `apps/desktop/src/main/utils/__tests__/deferred-tests-parser.test.ts`  | テストコード |
| 5   | Layer 分類判定テスト（拡充）          | `apps/desktop/src/main/utils/__tests__/test-layer-classifier.test.ts`  | テストコード |
| 6   | プロトコル検証テスト（新規）          | `apps/desktop/src/main/utils/__tests__/worktree-protocol-flow.test.ts` | テストコード |
| 7   | skill:remove E2E テスト（拡充）       | `apps/desktop/e2e/ipc-skill-remove.spec.ts`                            | テストコード |
| 8   | skill:import E2E テスト（拡充）       | `apps/desktop/e2e/ipc-skill-import.spec.ts`                            | テストコード |

注: コード成果物（#3〜#8）はソースコードリポジトリの該当ディレクトリに直接配置する。`outputs/` には配置しない。

## 完了条件

- [ ] `outputs/phase-6/coverage-report.md` に Phase 5 完了時点のカバレッジと Phase 6 拡充後のカバレッジが記録されている
- [ ] ユニットテスト合計 43 ケースが全て PASS している
- [ ] E2E テスト合計 16 ケースのテストコードが完成している
- [ ] テスト種別の分布: 境界値テスト 20 件以上、異常系テスト 13 件以上
- [ ] 各テストファイルの Line Coverage が 80% 以上に到達している（未達の場合は具体的な未カバー行を `outputs/phase-6/coverage-report.md` に記録）
- [ ] 追加テストコード内に `any` 型が使用されていない
- [ ] 全テストケース ID が一意である
- [ ] `outputs/phase-6/integration-test.md` に API 接続テストカバレッジが記録されている
- [ ] プロトコル検証テスト（UT-PF-01〜06）が全て PASS している

## 次のPhase

Phase 7: テストカバレッジ確認 — Phase 6 で拡充したテストのカバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を確認する。未達の場合は Phase 6 に戻る。
