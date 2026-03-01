# Phase 5: 実装（TDD: Green） — IPCハンドラ単位カバレッジ測定基盤構築

## メタ情報

| 項目               | 値                                                                          |
| ------------------ | --------------------------------------------------------------------------- |
| タスクID           | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001                                    |
| Phase              | 5（実装）                                                                   |
| 機能名             | IPCハンドラ単位カバレッジ測定基盤構築                                       |
| 作成日             | 2026-02-28                                                                  |
| Issue              | #854                                                                        |
| 前提Phase          | phase-4-test-creation.md                                                    |
| 目的               | カバレッジ集計スクリプトを実装し、Phase 4のテストを全てGreen状態にする      |
| 成果物ディレクトリ | docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001/outputs/phase-5/ |

## 目的

Phase 4 で作成したテストケース（TC-001〜TC-008）を全て PASS させるために、カバレッジ集計スクリプト `coverage-by-handler.ts` を実装する。TDD の Green フェーズとして、最小限の実装でテストを通過させることを目標とする。

加えて、Phase 7 判定ルール（Rule-1〜Rule-4）を `quality-requirements.md` に追記し、Phase 7 テンプレートにハンドラ単位カバレッジレポートセクションを追加する。

## 実行タスク

### Task 5-1: スクリプトファイルの作成

`apps/desktop/scripts/coverage-by-handler.ts` を新規作成する。

**ファイル構成:**

```
coverage-by-handler.ts
├── extractHandlers(filePath: string): HandlerInfo[]
│   └── ts-morph で ipcMain.handle() のコールバック検出
├── loadCoverageData(coveragePath: string): V8CoverageData
│   └── v8 カバレッジ JSON の読み込み・バリデーション
├── calculateCoverage(handlers: HandlerInfo[], coverage: V8CoverageData): HandlerCoverage[]
│   └── ハンドラ行範囲でカバレッジデータをフィルタリング・算出
├── generateReport(coverages: HandlerCoverage[], options?: ReportOptions): Report
│   └── Markdown テーブル・JSON 形式でレポート生成
└── main(): void
    └── CLI エントリポイント（--file, --target オプション解析）
```

### Task 5-2: TypeScript AST 解析ロジックの実装

ts-morph を使用して `ipcMain.handle()` の呼び出しを検出する。

**検出ロジック:**

1. ソースファイルを ts-morph で解析する
2. `ipcMain.handle(channelName, callback)` パターンのコール式を検索する
3. 各コールバック関数の開始行・終了行を取得する
4. チャンネル名（第1引数の文字列リテラル）を抽出する

**P40 対策:**

- ファイルパスは入力パラメータとして受け取り、カレントディレクトリに依存しない
- ts-morph の `Project` 初期化時に `tsConfigFilePath` を明示指定しない（スタンドアロン解析）

### Task 5-3: v8 カバレッジ JSON 読み込みロジックの実装

Vitest が出力する v8 カバレッジ JSON を読み込み、パースする。

**処理フロー:**

1. `coverage/coverage-final.json` パスを解決する
2. ファイル存在チェック（NFR-002: 不存在時にエラーメッセージ出力）
3. JSON パース（NFR-002: 構文エラー時にエラーメッセージ出力）
4. 対象ファイルのカバレッジデータを抽出する

### Task 5-4: ハンドラ単位カバレッジ算出ロジックの実装

ハンドラの行範囲でカバレッジデータをフィルタリングし、各指標を算出する。

**算出指標:**

- **Line Coverage**: ハンドラ行範囲内の実行済み行数 / 全行数
- **Branch Coverage**: ハンドラ行範囲内のカバー済み分岐数 / 全分岐数
- **Function Coverage**: ハンドラ行範囲内の実行済み関数数 / 全関数数

**P41 対策:**

- インラインアロー関数（`getAllowedWindows: () => [mainWindow]` 等）を検出する
- 影響関数として `inlineFunctions` フィールドに記録する
- Function Coverage の算出時に影響関数を注記する

### Task 5-5: Markdown テーブル形式レポート出力ロジックの実装

**Markdown 出力形式:**

```markdown
| #   | チャンネル名 | 行範囲  | Line% | Branch% | Func% | 判定 |
| --- | ------------ | ------- | ----: | ------: | ----: | ---- |
| 1   | skill:remove | 206-224 | 100.0 |   100.0 | 100.0 | PASS |
| 2   | skill:list   | 93-118  |  92.3 |    75.0 |   0.0 | FAIL |
```

**JSON 出力形式:**

```json
{
  "filePath": "src/main/ipc/skillHandlers.ts",
  "handlers": [
    {
      "handler": {
        "channelName": "skill:remove",
        "startLine": 206,
        "endLine": 224,
        "registrationFunction": "registerSkillHandlers"
      },
      "lineCoverage": 100.0,
      "branchCoverage": 100.0,
      "functionCoverage": 100.0,
      "coveredLines": 25,
      "totalLines": 25
    }
  ],
  "summary": {
    "totalHandlers": 23,
    "coveredHandlers": 14,
    "averageLineCoverage": 27.7,
    "averageBranchCoverage": 20.7,
    "averageFunctionCoverage": 8.7
  },
  "p41Note": "注記 (P41): ..."
}
```

### Task 5-6: Phase 7 判定ルール文書化

`quality-requirements.md` に Phase 7 ハンドラ単位カバレッジ判定ルール（Rule-1〜Rule-4）を追記する。

**追記内容:**

| ルールID | ルール名                     | 条件                                                                      | 判定     |
| -------- | ---------------------------- | ------------------------------------------------------------------------- | -------- |
| Rule-1   | 修正対象ハンドラ基準充足     | 修正対象ハンドラの Line/Function/Branch が最低基準（80%/80%/60%）を満たす | PASS     |
| Rule-2   | ファイル全体基準未達の許容   | ファイル全体が未達でも、原因が修正対象外ハンドラに限定される場合          | PASS     |
| Rule-3   | 未カバーハンドラの未タスク化 | Rule-2 適用時、未カバーハンドラを Phase 12 で未タスクとして検出・登録する | 必須対応 |
| Rule-4   | Branch Coverage 全体基準     | ファイル全体の Branch Coverage が最低基準（60%）を満たす                  | 必須     |

### Task 5-7: テスト実行・全PASS確認

Phase 4 のテストを実行し、全テストが Green 状態であることを確認する。

**実行コマンド:**

```bash
cd apps/desktop && pnpm vitest run scripts/coverage-by-handler.test.ts
```

## 参照資料

### タスク固有参照

| 参照資料              | パス                                                                                  | 内容                          |
| --------------------- | ------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 1 要件定義      | `docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001/phase-1-requirements.md`  | FR/NFR/受け入れ基準           |
| Phase 4 テスト仕様    | `docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001/phase-4-test-creation.md` | テストケース設計              |
| テストコード          | `apps/desktop/scripts/coverage-by-handler.test.ts`                                    | Phase 4 で作成したテスト      |
| skillHandlers.ts      | `apps/desktop/src/main/ipc/skillHandlers.ts`                                          | AST解析の対象ファイル         |
| カバレッジ基準        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`           | カバレッジ閾値の定義          |
| P41 記録              | `.claude/rules/06-known-pitfalls.md#P41`                                              | v8 インライン関数カウント     |
| P40 記録              | `.claude/rules/06-known-pitfalls.md#P40`                                              | テスト実行ディレクトリ依存    |
| ts-morph ドキュメント | 外部参照                                                                              | TypeScript AST 解析ライブラリ |

## 実装時の注意事項

### P41 対策（v8 インライン関数カウント）

- `validateIpcSender` のオプションオブジェクト内の `getAllowedWindows: () => [mainWindow]` は v8 カバレッジプロバイダが独立関数としてカウントする
- `extractHandlers` で検出したハンドラブロック内のインラインアロー関数を `inlineFunctions` として記録する
- レポート出力時に影響関数を注記し、Function Coverage の判定精度を向上させる

### P40 対策（テスト実行ディレクトリ依存）

- ファイルパスの解決は `path.resolve()` を使用し、相対パスを絶対パスに変換する
- カレントディレクトリへの依存を排除し、任意のディレクトリから実行可能にする
- テストは `apps/desktop` ディレクトリから実行する（`vitest.config.ts` の設定読み込みのため）

### NFR-006 対策（型安全）

- `any` 型を使用せず、v8 カバレッジ JSON の型定義を明示する
- `strict: true` でコンパイルが通ることを確認する

### NFR-007 対策（依存関係の最小化）

- ts-morph は Phase 1 で承認済みの依存として使用する
- JSON パースは Node.js 標準の `JSON.parse()` を使用する
- CLI 引数解析は `process.argv` の手動パースで対応する（追加パッケージ不要）

## 設計変更記録

| 変更日           | 変更内容 | 理由 | 影響範囲 |
| ---------------- | -------- | ---- | -------- |
| （実装時に記録） | —        | —    | —        |

## 統合テスト連携

| 連携対象                   | 実施内容                                                                               | 検証コマンド                                                                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 4 テストコード       | TC-001〜TC-008 がGreen化していることを確認する                                         | `cd apps/desktop && pnpm vitest run scripts/coverage-by-handler.test.ts`                                                                |
| 既存IPCハンドラ回帰テスト  | 既存 `skillHandlers` の挙動を壊していないことを確認する                                | `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts`                                                       |
| カバレッジ計測パイプライン | `coverage-final.json` の生成からハンドラ単位レポート生成まで一連で実行可能かを確認する | `cd apps/desktop && pnpm vitest run scripts/coverage-by-handler.test.ts --coverage --coverage.include='scripts/coverage-by-handler.ts'` |
| 判定ルール運用             | `--target` 指定時に Rule-1〜Rule-4 の判定出力が期待通りに得られることを確認する        | `cd apps/desktop && npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts --target skill:remove`                  |

## 成果物

| 成果物         | パス                                          | 説明                         |
| -------------- | --------------------------------------------- | ---------------------------- |
| 実装サマリー   | `outputs/phase-5/implementation-summary.md`   | 実装内容と設計判断の記録     |
| 集計スクリプト | `apps/desktop/scripts/coverage-by-handler.ts` | カバレッジ集計スクリプト本体 |

## 完了条件

- [ ] `coverage-by-handler.ts` が `apps/desktop/scripts/` に作成されている
- [ ] Phase 4 のテスト（TC-001〜TC-008）が全て Green 状態（PASS）である
- [ ] `extractHandlers` が `skillHandlers.ts` の23ハンドラを正しく検出する
- [ ] `calculateCoverage` がハンドラ単位の Line/Branch/Function カバレッジを正しく算出する
- [ ] `generateReport` が Markdown テーブルと JSON の両形式で出力する
- [ ] Phase 7 判定ルール（Rule-1〜Rule-4）が `quality-requirements.md` に追記されている
- [ ] P41 対策としてインラインアロー関数が `inlineFunctions` に記録される
- [ ] `any` 型を使用していない（NFR-006）

## TDD検証

| 検証項目       | 期待状態 | 実行コマンド                                                             |
| -------------- | -------- | ------------------------------------------------------------------------ |
| テスト実行結果 | 全PASS   | `cd apps/desktop && pnpm vitest run scripts/coverage-by-handler.test.ts` |
| 型チェック     | エラー0  | `cd apps/desktop && pnpm tsc --noEmit scripts/coverage-by-handler.ts`    |
| Lint           | エラー0  | `cd apps/desktop && pnpm eslint scripts/coverage-by-handler.ts`          |

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスク（Task 5-1〜5-7）を100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了状態を明記している

## 次のPhase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
