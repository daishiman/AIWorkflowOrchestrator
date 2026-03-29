# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 8                               |
| 機能名 | verify-execution-engine-layer12 |
| 作成日 | 2026-03-29                      |

## 目的

共通バリデーションユーティリティの抽出、命名の統一、チェック ID 体系の整理を行う。

## 実行タスク

- 共通バリデーションユーティリティを抽出する
- validator 間の共通パターンを統一する
- チェック ID と severity の命名規約を統一する

## 参照資料

| 資料名              | パス                                     | 説明             |
| ------------------- | ---------------------------------------- | ---------------- |
| Phase 2 設計        | `phase-2-design.md`                      | 元設計           |
| Phase 5 実装        | `phase-5-implementation.md`              | 実装対象         |
| Phase 6 テスト拡充  | `phase-6-test-expansion.md`              | edge case 命名   |
| layer check catalog | `outputs/phase-2/layer-check-catalog.md` | チェック ID 体系 |
| Phase 7 coverage    | `phase-7-coverage-check.md`              | coverage 用語    |

## 実行手順

### ステップ1: 共通ユーティリティを抽出する

- `fileExists(path: string): Promise<boolean>` — ファイル存在チェック
- `directoryExists(path: string): Promise<boolean>` — ディレクトリ存在チェック
- `readFileContent(path: string): Promise<string | null>` — graceful ファイル読み込み
- `hasMarkdownSection(content: string, heading: string): boolean` — Markdown セクション検出

上記を `verification-utils.ts` として engine と同ディレクトリに配置する候補とする。

### ステップ2: validator 共通パターンを統一する

- check result 生成を `createCheck(id, layer, severity, summary, evidence)` ヘルパーに統一する。
- `evidenceSummary` のフォーマットを `"path: {filePath}, reason: {reason}"` に統一する。
- error handling パターンを `try/catch + graceful fail check` に統一する。

### ステップ3: チェック ID 命名規約を統一する

- Layer 1: `L1-NNN`（3桁ゼロ埋め）
- Layer 2: `L2-NNN`（3桁ゼロ埋め）
- severity: `"error"` / `"warning"` / `"info"` の 3 値に限定（既存型に合わせる）
- summary: 英語、1 行、50 文字以内を推奨

## 統合テスト連携

- Phase 6 / 7 の test case 名とチェック ID を整合させる。
- Phase 9 で refactoring 後のテスト pass を確認する。

## 成果物

| 成果物           | パス                     | 説明                       |
| ---------------- | ------------------------ | -------------------------- |
| refactoring plan | `phase-8-refactoring.md` | ユーティリティ抽出方針本文 |

## 完了条件

- [ ] 共通ユーティリティが抽出候補として定義されている
- [ ] check result 生成パターンが統一されている
- [ ] チェック ID 命名規約が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
