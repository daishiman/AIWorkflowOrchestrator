# Phase 5: 環境修正結果 — 成果物

## メタ情報

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| Phase      | 5                                       |
| 機能名     | step-ut-rt-06-esbuild-arch-mismatch-001 |
| 作成日     | 2026-03-29                              |
| ステータス | 完了                                    |

## Step 1: 環境診断

```
$ node -e "console.log('arch:', process.arch)"
arch: arm64

$ file "$(which node)"
/opt/homebrew/opt/node@22/bin/node: Mach-O 64-bit executable arm64

$ EXPECTED_PLATFORM="darwin-$(node -p process.arch)"
$ echo "$EXPECTED_PLATFORM"
darwin-arm64

$ find node_modules/.pnpm -maxdepth 1 -name "@esbuild+darwin-arm64@*" -type d
node_modules/.pnpm/@esbuild+darwin-arm64@0.18.20
node_modules/.pnpm/@esbuild+darwin-arm64@0.21.5
node_modules/.pnpm/@esbuild+darwin-arm64@0.25.12
node_modules/.pnpm/@esbuild+darwin-arm64@0.27.2
```

**診断結果**: Node arm64 + esbuild darwin-arm64 — 整合済み

## Step 2: 環境修正

worktree で `pnpm install` が既に正しいアーキテクチャで実行されていたため、追加修正は不要。

**注記**: `node_modules/@esbuild/` ディレクトリが空に見えるのは pnpm の仮想ストア構造が原因。実際のバイナリは `node_modules/.pnpm/@esbuild+darwin-arm64@*/` に配置されている。

## Step 3: テスト検証

```
$ pnpm --filter @repo/desktop exec -- npx vitest run \
    src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts

 ✓ src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts (27 tests) 8ms

 Test Files  1 passed (1)
      Tests  27 passed (27)
   Duration  2.38s
```

**テスト結果**: 全 27 テスト PASS, exit 0

## Step 4: ガイド作成

- 作成ファイル: `docs/40-guides/esbuild-arch-mismatch-prevention.md`
- 必須セクション:
  - [x] 概要（mismatch の発生条件）
  - [x] 診断方法（`process.arch` と `EXPECTED_PLATFORM` の確認）
  - [x] 修正手順（`pnpm install --force` を主経路にした復旧）
  - [x] 再発防止（worktree 作成後の preflight）
  - [x] トラブルシューティング（mismatch error と対処法）

## AC 充足確認

| AC   | 基準                                 | 結果                                                          | 判定 |
| ---- | ------------------------------------ | ------------------------------------------------------------- | ---- |
| AC-1 | target test が exit 0                | 27 passed, exit 0                                             | PASS |
| AC-2 | `@esbuild/$EXPECTED_PLATFORM` が存在 | darwin-arm64 が4バージョン存在                                | PASS |
| AC-3 | mismatch エラーなし                  | テスト出力にエラーなし                                        | PASS |
| AC-4 | ガイドが存在                         | `docs/40-guides/esbuild-arch-mismatch-prevention.md` 作成済み | PASS |
| AC-5 | ガイドに必須項目あり                 | `process.arch` / `pnpm install --force` / preflight 記載あり  | PASS |

## 完了条件

- [x] 環境診断を実行し記録
- [x] 環境整合の確認（追加修正不要）
- [x] AC-1: target test が exit 0 で完走
- [x] AC-2: esbuild platform package が存在
- [x] AC-3: mismatch エラーなし
- [x] AC-4: ガイドが存在
- [x] AC-5: ガイドに必須項目あり
- [x] 本Phase内の全タスクを100%実行完了
