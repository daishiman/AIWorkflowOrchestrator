# Phase 6: テスト拡充 — IPCハンドラ単位カバレッジ測定基盤構築

## メタ情報

| 項目               | 値                                                                          |
| ------------------ | --------------------------------------------------------------------------- |
| タスクID           | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001                                    |
| Phase              | 6（テスト拡充）                                                             |
| 機能名             | IPCハンドラ単位カバレッジ測定基盤構築                                       |
| 作成日             | 2026-02-28                                                                  |
| Issue              | #854                                                                        |
| 前提Phase          | phase-5-implementation.md                                                   |
| 目的               | Phase 5の実装に対してテストを拡充しカバレッジ目標を達成する                 |
| 成果物ディレクトリ | docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001/outputs/phase-6/ |

## 目的

Phase 5 で実装した `coverage-by-handler.ts` のカバレッジを計測し、カバレッジ基準（Lines 80%以上、Functions 80%以上、Branches 60%以上）に不足する箇所を特定してテストを追加する。境界値テスト、エラーパスの網羅、P41 関連のエッジケースに重点を置く。

## 実行タスク

### Task 6-1: カバレッジ分析

`coverage-by-handler.ts` 自体のカバレッジを計測し、未カバー箇所を特定する。

**実行コマンド:**

```bash
cd apps/desktop && pnpm vitest run scripts/coverage-by-handler.test.ts --coverage --coverage.include='scripts/coverage-by-handler.ts'
```

**分析対象:**

- 未カバーの行（Line Coverage）
- 未カバーの分岐（Branch Coverage）: if/else, switch/case, 三項演算子
- 未カバーの関数（Function Coverage）

### Task 6-2: 境界値テスト追加

以下の境界値パターンに対するテストを追加する。

| テストケース               | 入力                                        | 期待結果                         |
| -------------------------- | ------------------------------------------- | -------------------------------- |
| 空ファイル（0バイト）      | ハンドラが0個のファイル                     | 空配列を返し、エラーは発生しない |
| ハンドラ1個のファイル      | `ipcMain.handle` が1つだけのファイル        | 1個のハンドラ情報を返す          |
| 特殊文字を含むチャンネル名 | `skill:get-detail` のようなハイフン含む名前 | チャンネル名が正しく抽出される   |
| 行範囲の境界               | ハンドラの開始行・終了行がファイル末尾      | 正しい行範囲が返される           |
| カバレッジ率の境界値       | Lines 79.9% / 80.0% / 80.1%                 | PASS/FAIL 判定が正しく分岐する   |

### Task 6-3: エラーパス網羅

以下のエラーパスに対するテストを追加する。

| テストケース                     | 入力                                      | 期待結果                                                 |
| -------------------------------- | ----------------------------------------- | -------------------------------------------------------- |
| 無効な JSON（構文エラー）        | `{ invalid json`                          | エラーメッセージに「JSON」が含まれる                     |
| 空の JSON オブジェクト           | `{}`                                      | エラーメッセージに「カバレッジデータ」が含まれる         |
| 対象ファイルのカバレッジが無い   | 別ファイルのカバレッジデータのみ含む JSON | エラーメッセージにファイル名が含まれる                   |
| ファイル読み込み権限エラー       | 読み取り不可のファイルパス                | エラーメッセージに「アクセス」が含まれる                 |
| AST 解析対象ファイルが存在しない | 存在しないパスを指定                      | エラーメッセージに「ファイルが見つかりません」が含まれる |

### Task 6-4: P41 関連テスト

P41（v8 インライン関数カウント）に特化したテストを追加する。

| テストケース                             | 検証内容                                               | 期待結果                               |
| ---------------------------------------- | ------------------------------------------------------ | -------------------------------------- |
| インラインアロー関数を含むハンドラ       | `getAllowedWindows: () => [mainWindow]` パターンを含む | `inlineFunctions` に関数名が記録される |
| インラインアロー関数が無いハンドラ       | シンプルなハンドラ構造                                 | `inlineFunctions` が空配列             |
| 複数のインラインアロー関数を含むハンドラ | オプションオブジェクト内に複数の arrow function がある | 全てのインライン関数が検出される       |
| ネストしたアロー関数                     | `arr.map(() => ...)` のような処理内アロー関数          | 処理ロジック内のアロー関数は除外される |

## 参照資料

### タスク固有参照

| 参照資料           | パス                                                                                        | 内容                          |
| ------------------ | ------------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 1 要件定義   | `docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001/phase-1-requirements.md`        | FR/NFR/受け入れ基準           |
| Phase 4 テスト仕様 | `docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001/phase-4-test-creation.md`       | テストケース設計              |
| Phase 5 実装       | `docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001/phase-5-implementation.md`      | 実装サマリー                  |
| テストコード       | `apps/desktop/scripts/coverage-by-handler.test.ts`                                          | Phase 4/5 で作成したテスト    |
| 集計スクリプト     | `apps/desktop/scripts/coverage-by-handler.ts`                                               | Phase 5 で作成した実装        |
| カバレッジ基準     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジ閾値の定義          |
| P41 記録           | `.claude/rules/06-known-pitfalls.md#P41`                                                    | v8 インライン関数カウント問題 |
| P9 記録            | `.claude/rules/06-known-pitfalls.md#P9`                                                     | テスト間状態リーク防止        |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | テスト設計パターンの参考      |

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 | Phase 5 時点（予測） | Phase 6 目標 |
| ----------------- | -------- | -------- | -------------------- | ------------ |
| Line Coverage     | 80%      | 90%      | 60-70%               | 90%以上      |
| Branch Coverage   | 60%      | 70%      | 40-50%               | 70%以上      |
| Function Coverage | 80%      | 90%      | 70-80%               | 90%以上      |

## 統合テスト連携

- Phase 7 でカバレッジ基準の最終確認を行う
- 追加したテストケースは `coverage-by-handler.test.ts` の既存テスト構造に統合する
- テスト間で状態を共有しない（P9 対策: `beforeEach` でリセット）

## 多角的チェック観点

| 観点               | 適用判断                 | 仕様参照先                                          |
| ------------------ | ------------------------ | --------------------------------------------------- |
| セキュリティ       | 非該当（内部スクリプト） | `.claude/rules/04-electron-security.md`             |
| UI/UX              | 非該当                   | —                                                   |
| エラーハンドリング | 必須（エラーパス網羅）   | `.claude/rules/02-code-quality.md`                  |
| テスタビリティ     | 必須                     | `.claude/rules/02-code-quality.md#テスト設計の注意` |

## 実行手順

1. Phase 5 実装の `coverage-by-handler.ts` に対してカバレッジ計測を実行する
2. 未カバー箇所を特定し、追加テストケースを設計する
3. 境界値テスト（Task 6-2）を `coverage-by-handler.test.ts` に追加する
4. エラーパステスト（Task 6-3）を `coverage-by-handler.test.ts` に追加する
5. P41 関連テスト（Task 6-4）を `coverage-by-handler.test.ts` に追加する
6. 全テストを実行し、全 PASS かつカバレッジ基準を満たすことを確認する

**テスト実行コマンド:**

```bash
cd apps/desktop && pnpm vitest run scripts/coverage-by-handler.test.ts --coverage --coverage.include='scripts/coverage-by-handler.ts'
```

## 成果物

| 成果物             | パス                                  | 説明                           |
| ------------------ | ------------------------------------- | ------------------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`  | Phase 6 実行後のカバレッジ数値 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md` | 追加テストケースの結果記録     |

## 完了条件

- [ ] `coverage-by-handler.ts` の Line Coverage が80%以上（推奨: 90%以上）
- [ ] `coverage-by-handler.ts` の Branch Coverage が60%以上（推奨: 70%以上）
- [ ] `coverage-by-handler.ts` の Function Coverage が80%以上（推奨: 90%以上）
- [ ] 境界値テスト（Task 6-2）が全て追加・PASS している
- [ ] エラーパステスト（Task 6-3）が全て追加・PASS している
- [ ] P41 関連テスト（Task 6-4）が全て追加・PASS している
- [ ] テスト間で状態の共有が発生していない（P9 対策確認）
- [ ] カバレッジレポートが成果物ディレクトリに作成されている

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスク（Task 6-1〜6-4）を100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了状態を明記している

## 次のPhase

→ [Phase 7: テストカバレッジ確認](./phase-7-coverage-check.md)
