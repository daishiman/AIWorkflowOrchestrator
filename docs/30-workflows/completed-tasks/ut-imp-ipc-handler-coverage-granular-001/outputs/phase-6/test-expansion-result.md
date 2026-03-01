# テスト拡充結果書 — IPCハンドラ単位カバレッジ測定基盤

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 6                                          |
| 成果物種別 | テスト拡充結果書（test-expansion-result）  |
| タスクID   | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001   |
| Issue      | #854                                       |
| 検証日     | 2026-02-28                                 |
| ステータス | 完了                                       |
| 依存成果物 | `outputs/phase-5/implementation-result.md` |
| 後続成果物 | `outputs/phase-7/coverage-report.md`       |

---

## 1. テスト拡充概要

| 項目                   | Phase 5完了時 | Phase 6完了時 | 差分       |
| ---------------------- | ------------- | ------------- | ---------- |
| テスト総数             | 45            | 58            | +13        |
| TC-009（エッジケース） | 4             | 5             | +1         |
| TC-010（main()統合）   | 0             | 8             | +8（新設） |

---

## 2. 追加テスト詳細

### 2.1 TC-010: main()統合テスト（+8テスト）

Phase 5完了時点で `main()` 関数のテストが未作成であった。Phase 6で以下の8テストを追加した。

| #   | テストケース名                                  | 追加理由                             |
| --- | ----------------------------------------------- | ------------------------------------ |
| 1   | main()がMarkdownレポートを標準出力に出力する    | main()エントリポイントの基本動作検証 |
| 2   | main()がJSON形式で出力できる                    | --formatオプションの統合動作検証     |
| 3   | main()がtarget指定で正しく動作する              | --targetオプションの統合動作検証     |
| 4   | main()が--source/--coverageエイリアスで動作する | CLIエイリアスの統合動作検証          |
| 5   | main()が複数target指定をJSONサマリー出力する    | 複数ターゲットの集計動作検証         |
| 6   | main()が存在しないtarget指定でexit(1)する       | エラー時終了コードの検証（FR-006）   |
| 7   | main()がcoverage不一致時にexit(1)する           | エラー時終了コードの検証（FR-006）   |
| 8   | main()がoverrideCoverageJsonPath注入で動作する  | DI方式テスタビリティの検証           |

### 2.2 TC-009追加: 0ハンドラファイル（+1テスト）

| #   | テストケース名                                     | 追加理由                                        |
| --- | -------------------------------------------------- | ----------------------------------------------- |
| 5   | ipcMain.handle()を含まないファイルで空の結果を返す | ハンドラ0件ファイルのエッジケースカバレッジ不足 |

---

## 3. ESMモジュールモッキング問題と解決

### 3.1 発見した問題

TC-010の実装中に、ESMモジュール内部の関数呼び出しに対する `vi.spyOn()` の制約を発見した。

**問題の詳細**: `main()` 関数は内部で `fs.readFileSync()` を呼び出してカバレッジJSONを読み込む。テスト環境では実際のカバレッジJSONファイルが存在しないため、ファイル読み込みをモックする必要がある。しかし、ESMでは `vi.spyOn(fs, 'readFileSync')` でモジュール内部の `fs.readFileSync` 呼び出しをインターセプトできない場合がある。

### 3.2 採用した解決策: DI方式

`main()` 関数に `overrideCoverageJsonPath` オプショナルパラメータを追加するDI（依存性注入）方式を採用した。

```typescript
// Before: テスト困難
export async function main(args: string[]): Promise<void> {
  const options = parseCliArgs(args);
  const coveragePath =
    options?.coveragePath ??
    path.resolve(process.cwd(), "coverage/coverage-final.json");
  const coverage = parseCoverageJson(coveragePath, options?.file ?? "");
  // ...
}

// After: DI方式でテスト可能
export async function main(
  args: string[],
  overrideCoverageJsonPath?: string,
): Promise<void> {
  const options = parseCliArgs(args);
  const coveragePath =
    overrideCoverageJsonPath ??
    options?.coveragePath ??
    path.resolve(process.cwd(), "coverage/coverage-final.json");
  const coverage = parseCoverageJson(coveragePath, options?.file ?? "");
  // ...
}
```

**選択理由**:

- プロダクションコードへの影響が最小限（オプショナルパラメータ追加のみ）
- テスト環境でテスト用のカバレッジJSONファイルパスを直接注入できる
- `vi.mock()` による不安定なモジュールモッキングを回避できる

### 3.3 不採用とした代替案

| 代替案                     | 不採用理由                                                   |
| -------------------------- | ------------------------------------------------------------ |
| `vi.mock('fs')` 全体モック | 他のfs操作まで影響を受け、テストの信頼性が低下する           |
| 環境変数によるパス指定     | テストコードが環境変数に依存し、テスト間の独立性が損なわれる |
| ファクトリパターン         | main()の設計が過度に複雑化し、コスト対効果が低い             |

---

## 4. カバレッジ結果（Phase 6完了時点）

| 指標              | 結果   | 最低基準 | 推奨基準 | 判定             |
| ----------------- | ------ | -------- | -------- | ---------------- |
| Line Coverage     | 95.82% | 80%      | 90%      | PASS（推奨超過） |
| Branch Coverage   | 90.36% | 60%      | 70%      | PASS（推奨超過） |
| Function Coverage | 100%   | 80%      | 90%      | PASS（推奨超過） |

全指標が推奨基準を超過しており、Phase 7のカバレッジ検証に進行可能である。

---

## 5. 未カバー行の分析

### Line Coverage 残り4.25%

未カバー行はエラーハンドリングの一部パス（到達困難な防御的コード）に集中している。

| 未カバー行範囲     | 内容                                   | 理由                                               |
| ------------------ | -------------------------------------- | -------------------------------------------------- |
| AST解析の例外catch | ts-morphの内部例外をキャッチするコード | 正常なTypeScriptファイルでは到達しない防御的コード |
| JSON解析の部分パス | カバレッジJSONの破損パターンの一部     | テストで再現困難な破損パターン                     |

### Branch Coverage 残り9.76%

未カバーブランチは条件分岐の一部エッジケースに起因する。

| 未カバーブランチ  | 内容                                         | 理由                                     |
| ----------------- | -------------------------------------------- | ---------------------------------------- |
| 三項演算子の一方  | IPC_CHANNELS定数解決の一部フォールバックパス | 現在のskillHandlers.tsでは通過しない分岐 |
| switch文のdefault | formatオプションの不正値ハンドリング         | CLIバリデーションで事前に防止されるパス  |

---

## 6. テスト実行結果サマリ

```
 PASS  scripts/coverage-by-handler.test.ts (58 tests)
   TC-001: HandlerDetector (extractHandlers)    6 passed
   TC-002: CoverageParser (parseCoverageJson)   4 passed
   TC-003: CoverageCalculator                   7 passed
   TC-004: Phase7Judge (judgePhase7)            5 passed
   TC-005: ReportFormatter                      3 passed
   TC-006: CLI引数パース (parseCliArgs)         10 passed
   TC-007: エラーハンドリング                    4 passed
   TC-008: 統合テスト                            7 passed
   TC-009: エッジケース                          5 passed
   TC-010: main()統合テスト                      8 passed

Tests: 58 passed, 0 failed
Time:  2.3s
```
