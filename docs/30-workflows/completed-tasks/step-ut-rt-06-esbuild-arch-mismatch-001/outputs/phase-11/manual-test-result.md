# Phase 11: 手動テスト結果 — 成果物

## メタ情報

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| Phase      | 11                                      |
| 機能名     | step-ut-rt-06-esbuild-arch-mismatch-001 |
| 作成日     | 2026-03-29                              |
| ステータス | 完了                                    |
| テスト種別 | NON_VISUAL（UI 変更なし — 代替証跡）    |

## Step 1: Preflight

```
$ node -e "console.log(process.arch)"
arm64

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

**Preflight 判定**: PASS — arm64 Node と darwin-arm64 esbuild が整合

## Step 2: Target Test

```
$ pnpm --filter @repo/desktop exec -- npx vitest run \
    src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts

 ✓ src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts (27 tests) 7ms

 Test Files  1 passed (1)
      Tests  27 passed (27)
   Start at  23:32:33
   Duration  3.32s
```

**Target Test 判定**: PASS — 27 tests passed, exit 0

## Step 3: Guide Review

| 検証項目                              | 結果                              | 判定 |
| ------------------------------------- | --------------------------------- | ---- |
| `process.arch` の確認が書かれている   | 7 箇所に記載                      | PASS |
| `pnpm install --force` が書かれている | 4 箇所に記載                      | PASS |
| worktree preflight が書かれている     | Worktree Preflight セクションあり | PASS |

## Step 4: 発見事項

| 分類 | 内容                                                                                                                                           |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Note | pnpm の仮想ストア構造により `node_modules/@esbuild/` が空に見える。`.pnpm/` 内を確認する必要がある。ガイドのトラブルシューティングに記載済み。 |
| Info | worktree で `pnpm install` が正しく実行されていれば、mismatch は発生しない                                                                     |

**Blocker**: なし

## 完了条件

- [x] current `process.arch` を確認した
- [x] `node_modules/.pnpm/@esbuild+darwin-arm64@*` を確認した
- [x] target test を実行した
- [x] guide の必須記載を確認した
- [x] blocker がないことを確認した
- [x] 本Phase内の全タスクを100%実行完了
