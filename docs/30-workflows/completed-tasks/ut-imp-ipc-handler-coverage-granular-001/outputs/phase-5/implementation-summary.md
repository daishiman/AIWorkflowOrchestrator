# Phase 5: 実装サマリー

| 項目     | 値                                       |
| -------- | ---------------------------------------- |
| タスクID | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001 |
| Phase    | 5 — 実装                                 |
| 作成日   | 2026-02-28                               |
| Issue    | #854                                     |

---

## 1. 実装概要

IPC ハンドラ単位のカバレッジ計測スクリプトを実装した。ts-morph による AST 解析で `ipcMain.handle()` 呼び出しを検出し、Istanbul 形式のカバレッジ JSON と突き合わせてハンドラごとのカバレッジを算出する。

---

## 2. 実装ファイル

### 2.1 メインスクリプト

| ファイル                                      | 行数    | 説明                       |
| --------------------------------------------- | ------- | -------------------------- |
| `apps/desktop/scripts/coverage-by-handler.ts` | 約800行 | 5モジュール + CLI + 型定義 |

### 2.2 テストファイル

| ファイル                                           | テスト数 | 説明                            |
| -------------------------------------------------- | -------- | ------------------------------- |
| `apps/desktop/scripts/coverage-by-handler.test.ts` | 58       | 全モジュール + CLI + 統合テスト |

### 2.3 変更した設定ファイル

| ファイル                        | 変更内容                                                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/vitest.config.ts` | `include` に `scripts/**/*.test.ts` パターンを追加                                                                |
| `apps/desktop/vitest.config.ts` | `coverage.exclude` をワイルドカード（`scripts/**`）から個別ファイル指定（`scripts/coverage-by-handler.ts`）に変更 |

---

## 3. モジュール構成

### 3.1 HandlerDetector

- **責務**: ts-morph AST 解析で `ipcMain.handle()` 呼び出しを検出
- **主要関数**:
  - `extractHandlers(filePath: string): HandlerInfo[]` — ファイルから全ハンドラを抽出
  - `convertConstantToChannelName(constant: string): string` — `IPC_CHANNELS.XXX` 定数名をチャンネル名に変換
- **検出対象**: `ipcMain.handle()` の第1引数（文字列リテラルまたは `IPC_CHANNELS.XXX` 形式）

### 3.2 CoverageParser

- **責務**: Istanbul 形式の JSON カバレッジファイルを解析
- **主要関数**:
  - `parseCoverageJson(jsonPath: string, sourceFilePath: string): IstanbulFileCoverage \| null` — JSON ファイルをパースして対象ファイルを抽出
  - `getDefaultCoverageJsonPath(): string` — デフォルトのカバレッジ JSON パスを返す
- **対応形式**: Istanbul v8 / v2 形式

### 3.3 CoverageCalculator

- **責務**: ハンドラの行範囲に基づいてカバレッジ指標を算出
- **主要関数**:
  - `calculateHandlerCoverage(handler: HandlerInfo, fileCoverage: IstanbulFileCoverage): HandlerCoverage` — ハンドラ単位のカバレッジを算出
- **算出指標**: Line Coverage, Branch Coverage, Function Coverage
- **P41対応**: インライン arrow function を独立関数としてカウントし、注記を出力

### 3.4 Phase7Judge

- **責務**: カバレッジ基準に基づく Phase 7 ゲート判定
- **主要関数**:
  - `judgePhase7(coverage: HandlerCoverage): Phase7Judgment` — Rule-1〜Rule-4 の判定を実行
- **判定ルール**:
  - Rule-1: カバレッジ基準（推奨: Line≥90%, Branch≥70%, Function≥90% / 最低: Line≥80%, Branch≥60%, Function≥80%）
  - Rule-3: テストケース存在確認
  - Rule-4: 複数指標の複合判定

### 3.5 ReportFormatter

- **責務**: カバレッジレポートの整形出力
- **主要関数**:
  - `formatMarkdownReport(report: CoverageReport): string` — Markdown テーブル形式
  - `formatJsonReport(report: CoverageReport): string` — JSON 形式
- **出力形式**: Markdown テーブル（デフォルト）、JSON、`both`（Markdown + JSON）

---

## 4. CLI インターフェース

### 4.1 parseCliArgs()

```
使用方法: npx tsx scripts/coverage-by-handler.ts --file <path> [options]

オプション:
  --file <path>       対象ファイルパス（必須）
  --source <path>     --file のエイリアス
  --coverage <path>   coverage JSON パス（省略時: coverage/coverage-final.json）
  --target <name>     特定ハンドラ判定（複数指定可）
  --format <type>     出力形式: markdown（デフォルト）| json | both
```

### 4.2 main()

- `parseCliArgs()` でCLI引数を解析
- `extractHandlers()` でハンドラを検出
- `parseCoverageJson()` でカバレッジデータを読み込み
- `calculateHandlerCoverage()` で各ハンドラのカバレッジを算出
- `formatMarkdownReport()` / `formatJsonReport()` でレポートを生成
- `overrideCoverageJsonPath` パラメータでテスト時のカバレッジJSONパスを差し替え可能

---

## 5. 型定義（12インターフェース）

| 型名                       | 説明                                                       |
| -------------------------- | ---------------------------------------------------------- |
| `HandlerInfo`              | 検出されたハンドラの情報（チャンネル名、行範囲、登録関数） |
| `IstanbulLocation`         | Istanbul形式の位置情報（start/end）                        |
| `IstanbulStatementMap`     | statementMap のエントリ集合                                |
| `IstanbulFunctionMapEntry` | fnMap の単一エントリ                                       |
| `IstanbulBranchMapEntry`   | branchMap の単一エントリ                                   |
| `IstanbulFileCoverage`     | ファイル単位のカバレッジデータ                             |
| `IstanbulCoverageJson`     | Istanbul カバレッジ JSON 全体                              |
| `HandlerCoverage`          | ハンドラ単位のカバレッジ算出結果                           |
| `Phase7Judgment`           | Phase 7 ゲート判定結果                                     |
| `CoverageByHandlerOptions` | CLI 引数のパース結果                                       |
| `ReportOptions`            | レポート生成オプション                                     |
| `CoverageReport`           | 全体レポート構造                                           |

---

## 6. テスト結果

| 指標       | 結果             |
| ---------- | ---------------- |
| テスト総数 | 58               |
| PASS       | 58               |
| FAIL       | 0                |
| 実行時間   | Phase 5 完了時点 |

---

## 7. 完了条件

- [x] 5モジュールが全て実装済み
- [x] CLI インターフェースが動作する
- [x] 12の型定義が定義済み
- [x] 58テストが全て PASS
- [x] vitest.config.ts の設定変更が適用済み
