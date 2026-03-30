# Phase 1: 要件定義 - esbuild darwin アーキテクチャ不整合修正

## メタ情報

| 項目       | 値                                 |
| ---------- | ---------------------------------- |
| Phase      | 1                                  |
| フェーズ名 | 要件定義                           |
| 前Phase    | -                                  |
| 次Phase    | Phase 2                            |
| 機能名     | esbuild-arch-mismatch-fix          |
| 作成日     | 2026-03-30                         |
| タスクID   | UT-RT-06-ESBUILD-ARCH-MISMATCH-001 |
| ステータス | 未実施                             |

## 目的

esbuild darwin アーキテクチャ不整合修正のスコープ、受け入れ基準、および対象リソースの棚卸しを定義する。

## 背景

RT-06 の vitest 実行において、esbuild のプラットフォーム不整合エラーが発生しテスト実行が完全にブロックされている。Apple Silicon Mac で Rosetta 2（x86_64 エミュレーション）経由の Node.js で `pnpm install` を実行した結果、`node_modules/@esbuild/darwin-x64` のみがインストールされ、native arm64 Node.js に切り替えた際に `@esbuild/darwin-arm64` が見つからずロードに失敗する。

## タスク分類

| 項目   | 内容                                               |
| ------ | -------------------------------------------------- |
| 分類   | 環境修正（Environment fix）                        |
| 種別   | UI タスクではない / ドキュメントのみタスクではない |
| 規模   | 小規模                                             |
| 優先度 | 高（RT-06 テスト実行がブロックされている）         |

## 実行タスク

### T-01: 環境診断 - 現在のアーキテクチャ状態確認

以下のコマンドで現在の環境状態を記録する。

```bash
# Node.js アーキテクチャ確認
node -e "console.log(process.arch)"

# OS アーキテクチャ確認
uname -m

# 現在インストールされている esbuild バイナリ確認
ls node_modules/@esbuild/

# Node.js バイナリのパスと種類
which node
file $(which node)
```

**期待**: `process.arch` が `x64` を返し、`node_modules/@esbuild/` に `darwin-x64` のみが存在する不整合状態を確認する。

### T-02: スコープ定義

#### スコープに含む

- arm64 Node.js への統一（nvm / nodenv / volta 等での切り替え）
- `node_modules` の完全再構築（`rm -rf node_modules` + `pnpm install`）
- vitest 起動確認（esbuild エラーなし）
- 再発防止ドキュメントの作成

#### スコープに含まない

- esbuild バージョンアップグレード
- テストコンテンツの変更（テストケース追加・修正）
- CI/CD パイプラインの全面見直し
- pnpm バージョンアップグレード

### T-03: 受け入れ基準定義

| ID   | 受け入れ基準                                             | 検証方法                                              |
| ---- | -------------------------------------------------------- | ----------------------------------------------------- |
| AC-1 | `node -e "console.log(process.arch)"` が `arm64` を返す  | コマンド実行結果の確認                                |
| AC-2 | `node_modules/@esbuild/darwin-arm64` が存在する          | `ls node_modules/@esbuild/` で確認                    |
| AC-3 | `pnpm vitest run` が esbuild エラーなく起動する          | vitest 起動時のエラーログがないことを確認             |
| AC-4 | RT-06 対象テストが PASS/FAIL の判定結果を返す            | `pnpm --filter @repo/desktop test:run` の実行結果確認 |
| AC-5 | 再発防止手順が `docs/` または CLAUDE.md に記録されている | ドキュメントの存在確認                                |

### T-04: 成果物命名規則（artifacts.json 用）

| 成果物ID   | 成果物名         | 配置先                                     |
| ---------- | ---------------- | ------------------------------------------ |
| P1-REQ     | 要件定義書       | `phase-1-requirements.md`（本ファイル）    |
| P1-AC      | 受け入れ基準一覧 | `outputs/phase-1/acceptance-criteria.md`   |
| P1-SUM     | 要件サマリー     | `outputs/phase-1/requirements-summary.md`  |
| P2-DES     | 設計書           | `phase-2-design.md`                        |
| P2-RISK    | リスク評価書     | `outputs/phase-2/risk-assessment.md`       |
| P3-REV     | 設計レビュー結果 | `phase-3-design-review.md`                 |
| P5-EXEC    | 実行結果レポート | `outputs/phase-5/execution-result.md`      |
| P5-PREVENT | 再発防止手順書   | `outputs/phase-5/prevention-procedure.md`  |
| P12-DOC    | 実装ガイド       | `outputs/phase-12/implementation-guide.md` |

## 参照資料

| 資料名                | パス                                                                          | 内容                       |
| --------------------- | ----------------------------------------------------------------------------- | -------------------------- |
| 技術コア仕様          | `.claude/skills/aiworkflow-requirements/references/technology-core.md`        | Node.js 22.x LTS 仕様      |
| DevOps コア仕様       | `.claude/skills/aiworkflow-requirements/references/technology-devops-core.md` | pnpm / tsup / esbuild 構成 |
| デプロイメント仕様    | `.claude/skills/aiworkflow-requirements/references/deployment-core.md`        | CI パイプライン仕様        |
| タスク仕様書（index） | `docs/30-workflows/esbuild-arch-mismatch-fix/index.md`                        | タスク全体概要             |

## 統合テスト連携【必須】

esbuild バイナリの接続要件（arm64/x64 判定ロジック）を要件に明記する。具体的には:

- esbuild は `process.arch` と `process.platform` の組み合わせで optional dependency を解決する
- arm64 Node.js 環境では `@esbuild/darwin-arm64` が必須
- x64 Node.js 環境では `@esbuild/darwin-x64` が必須
- 混在環境（install 時と実行時で arch が異なる）ではバイナリ不在エラーが発生する

## 成果物

| 成果物     | パス                                    | 説明              |
| ---------- | --------------------------------------- | ----------------- |
| 要件定義書 | `phase-1-requirements.md`（本ファイル） | スコープ・AC 定義 |

## 出力ファイル

- `outputs/phase-1/requirements-summary.md` - 要件サマリー
- `outputs/phase-1/acceptance-criteria.md` - 受け入れ基準詳細

## 完了条件

- [ ] 環境診断コマンドが定義されている
- [ ] スコープの含む/含まないが明確に区分されている
- [ ] 受け入れ基準が検証可能な形式で定義されている
- [ ] 成果物命名規則が定義されている
- [ ] 統合テスト連携アクションが記載されている

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 次のPhase

Phase 2: 設計
