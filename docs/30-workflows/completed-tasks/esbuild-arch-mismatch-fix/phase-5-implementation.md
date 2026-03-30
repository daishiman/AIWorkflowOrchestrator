# Phase 5: 実装 - esbuild darwin アーキテクチャ不整合の解消

## メタ情報

| 項目         | 値                                 |
| ------------ | ---------------------------------- |
| Phase        | 5                                  |
| 機能名       | 実装                               |
| 前Phase      | Phase 4 (テスト作成)               |
| 次Phase      | Phase 6 (テスト拡充)               |
| 作成日       | 2026-03-30                         |
| タスクID     | UT-RT-06-ESBUILD-ARCH-MISMATCH-001 |
| ワークフロー | esbuild-arch-mismatch-fix          |
| ステータス   | 未実施                             |

## 目的

esbuild の darwin アーキテクチャ不整合を解消するための環境修正を実行する。arm64 Native Node.js 環境に統一し、`pnpm install` を再実行して正しいバイナリを取得する。

## TDD 状態

| 項目         | 値    |
| ------------ | ----- |
| IS_TDD_PHASE | true  |
| IS_GREEN     | true  |
| IS_RED       | false |

> **Green フェーズ**: Phase 4 で定義した検証コマンドが全件 PASS する状態に遷移させる。

## 実行タスク

- T-05-1: アーキテクチャ現状確認を行う
- T-05-2: arm64 環境へ切り替える
- T-05-3: クリーンインストールを行う
- T-05-4: esbuild バイナリを検証する
- T-05-5: RT-06 対象テストを実行する
- T-05-6: 実行結果を記録する

### T-05-1: アーキテクチャ現状確認

現在の Node.js と OS のアーキテクチャを確認する。

```bash
# 現在の Node.js アーキテクチャ確認
node -e "console.log(process.arch, process.platform)"

# OS カーネルのアーキテクチャ確認
uname -m

# 現在の esbuild バイナリ確認
ls node_modules/@esbuild/
```

### T-05-2: arm64 環境への切り替え

Rosetta 2 (x64) で動作している場合、native arm64 に切り替える。

```bash
# arm64 シェルに切り替え
arch -arm64 zsh

# Node.js が arm64 で動作していることを確認
node -e "console.log(process.arch)"  # 必ず arm64 であること

# which node で使用中の Node バイナリを確認
file $(which node)  # arm64 バイナリであること
```

> **注意**: nvm/fnm を使用している場合、arm64 シェルで `nvm use` / `fnm use` を再実行して arm64 版の Node.js を有効化する必要がある。

### T-05-3: クリーンインストール

既存の node_modules を削除し、arm64 環境で再インストールする。

```bash
# node_modules を完全削除
rm -rf node_modules

# arm64 環境で再インストール
pnpm install
```

### T-05-4: esbuild バイナリ検証

再インストール後、正しい esbuild バイナリが配置されていることを確認する。

```bash
# darwin-arm64 が含まれていること
ls node_modules/@esbuild/

# バイナリのアーキテクチャ確認
file node_modules/@esbuild/darwin-arm64/bin/esbuild
```

### T-05-5: RT-06 対象テスト実行

esbuild 修正後、RT-06 の対象テストを実行して PASS/FAIL の判定を得る。

```bash
# RT-06 対象テスト
pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts

# vitest 全体の起動確認（head で先頭のみ）
pnpm vitest run --reporter=verbose 2>&1 | head -20
```

### T-05-6: 実行結果の記録

全タスクの実行結果を成果物として記録する。

## 統合テスト連携【必須】

arm64 環境統一 + `pnpm install` 再実行の完全な手順を実行し、Phase 4 の検証コマンドが全件 PASS (Green) に遷移したことを確認する。

## 参照資料

| 参照資料         | パス                                                                          | 内容                         |
| ---------------- | ----------------------------------------------------------------------------- | ---------------------------- |
| Node.js 技術仕様 | `.claude/skills/aiworkflow-requirements/references/technology-core.md`        | Node.js 22.x LTS / pnpm 仕様 |
| DevOps 技術仕様  | `.claude/skills/aiworkflow-requirements/references/technology-devops-core.md` | esbuild / tsup 構成          |
| 元タスク定義     | `docs/30-workflows/completed-tasks/UT-RT-06-ESBUILD-ARCH-MISMATCH-001.md`     | esbuild arch 不整合タスク    |

## 成果物

| 成果物           | パス                                      | 説明                                           |
| ---------------- | ----------------------------------------- | ---------------------------------------------- |
| 実行結果レポート | `outputs/phase-5/execution-result.md`     | 各タスクの実行結果・コマンド出力の記録         |
| 再発防止手順書   | `outputs/phase-5/prevention-procedure.md` | 同問題が再発した場合の対処手順・予防策のまとめ |

## 完了条件

- [ ] `node -e "console.log(process.arch)"` が `arm64` を返す
- [ ] `ls node_modules/@esbuild/` に `darwin-arm64` が含まれる
- [ ] `pnpm vitest run` が esbuild エラーなく起動する
- [ ] RT-06 対象テストが PASS/FAIL の判定結果を返す（esbuild エラーではない）
- [ ] `outputs/phase-5/execution-result.md` が生成されている
- [ ] `outputs/phase-5/prevention-procedure.md` が生成されている

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 次の Phase

Phase 6: テスト拡充（追加検証シナリオ）
