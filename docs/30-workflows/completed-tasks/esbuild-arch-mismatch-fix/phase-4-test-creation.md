# Phase 4: テスト作成 - esbuild darwin アーキテクチャ不整合の解消

## メタ情報

| 項目         | 値                                 |
| ------------ | ---------------------------------- |
| Phase        | 4                                  |
| 機能名       | テスト作成                         |
| 前Phase      | Phase 3 (設計レビューゲート)       |
| 次Phase      | Phase 5 (実装)                     |
| 作成日       | 2026-03-30                         |
| タスクID     | UT-RT-06-ESBUILD-ARCH-MISMATCH-001 |
| ワークフロー | esbuild-arch-mismatch-fix          |
| ステータス   | 未実施                             |

## 目的

環境修正タスクの検証コマンドスイートを定義する。本タスクはコード変更ではなく環境修正であるため、ユニットテストではなく環境検証コマンド群を「テスト」として扱う。

## TDD 状態

| 項目         | 値    |
| ------------ | ----- |
| IS_TDD_PHASE | true  |
| IS_RED       | true  |
| IS_GREEN     | false |

> **Red フェーズ**: 現在の壊れた状態（Rosetta 2 x64 Node による esbuild x64 バイナリ）では、以下のコマンドの多くが期待結果と不一致になるはずである。

## 実行タスク

- T-04-1: 環境検証コマンドスイートを定義する
- T-04-2: vitest 検証コマンドを定義する
- T-04-3: 品質ゲートコマンドを定義する

### T-04-1: 環境検証コマンドスイートの作成

環境のアーキテクチャ整合性を確認するためのコマンド群を定義する。

| #   | コマンド                              | 期待結果                  | Red 状態での予想              |
| --- | ------------------------------------- | ------------------------- | ----------------------------- |
| 1   | `node -e "console.log(process.arch)"` | `arm64`                   | `x64`（Rosetta 2 経由の場合） |
| 2   | `uname -m`                            | `arm64`                   | `arm64`（カーネルは native）  |
| 3   | `ls node_modules/@esbuild/`           | `darwin-arm64` が含まれる | `darwin-x64` のみ             |
| 4   | `file $(which node)`                  | `arm64` バイナリ          | `x86_64` バイナリ             |

### T-04-2: vitest 検証コマンドの作成

esbuild エラーなくテストが実行できることを確認するコマンド群を定義する。

| #   | コマンド                                                                                                                          | 期待結果                       | Red 状態での予想                                                |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------- |
| 1   | `pnpm vitest run --reporter=verbose 2>&1 \| head -20`                                                                             | esbuild エラーなし             | `Error: The package "@esbuild/darwin-arm64" could not be found` |
| 2   | `pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts` | PASS/FAIL の判定結果が得られる | esbuild ロードエラーで実行不可                                  |

### T-04-3: 品質ゲートコマンドの作成

プロジェクト全体の品質を確認するコマンド群を定義する。

| #   | コマンド         | 期待結果    | Red 状態での予想                                   |
| --- | ---------------- | ----------- | -------------------------------------------------- |
| 1   | `pnpm typecheck` | エラー 0 件 | esbuild 依存で失敗の可能性あり                     |
| 2   | `pnpm lint`      | エラー 0 件 | lint 自体は esbuild 非依存のため PASS の可能性あり |

## 統合テスト連携【必須】

環境検証コマンドスイートを作成し、全コマンドの期待結果・Red 状態での予想結果を文書化する。Phase 5 の実装後に Green 状態への遷移を確認する基準となる。

## 参照資料

| 参照資料         | パス                                                                          | 内容                         |
| ---------------- | ----------------------------------------------------------------------------- | ---------------------------- |
| Node.js 技術仕様 | `.claude/skills/aiworkflow-requirements/references/technology-core.md`        | Node.js 22.x LTS / pnpm 仕様 |
| DevOps 技術仕様  | `.claude/skills/aiworkflow-requirements/references/technology-devops-core.md` | esbuild / tsup 構成          |
| 元タスク定義     | `docs/30-workflows/completed-tasks/UT-RT-06-ESBUILD-ARCH-MISMATCH-001.md`     | esbuild arch 不整合タスク    |

## 成果物

| 成果物           | パス                                       | 説明                             |
| ---------------- | ------------------------------------------ | -------------------------------- |
| 検証コマンド一覧 | `outputs/phase-4/verification-commands.md` | 全検証コマンドと期待結果のまとめ |

## 完了条件

- [ ] 環境検証コマンド（T-04-1）が全件定義されている
- [ ] vitest 検証コマンド（T-04-2）が全件定義されている
- [ ] 品質ゲートコマンド（T-04-3）が全件定義されている
- [ ] 各コマンドに期待結果と Red 状態での予想結果が記載されている
- [ ] `outputs/phase-4/verification-commands.md` が生成されている

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 次の Phase

Phase 5: 実装（環境修正実行）
