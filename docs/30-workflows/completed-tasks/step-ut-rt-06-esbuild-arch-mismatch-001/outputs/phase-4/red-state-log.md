# Phase 4: Red 状態記録 — 成果物

## メタ情報

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| Phase      | 4                                       |
| 機能名     | step-ut-rt-06-esbuild-arch-mismatch-001 |
| 作成日     | 2026-03-29                              |
| ステータス | 完了                                    |

## 環境状態（診断時点）

```
$ node -p "process.platform + '-' + process.arch"
darwin-arm64

$ file "$(which node)"
/opt/homebrew/opt/node@22/bin/node: Mach-O 64-bit executable arm64

$ ls node_modules/@esbuild/ 2>/dev/null
(空 — pnpm は hoisted @esbuild/ を作成しない)

$ find node_modules/.pnpm -path "*@esbuild+darwin-arm64*" -type d | head -5
node_modules/.pnpm/@esbuild+darwin-arm64@0.18.20/node_modules/@esbuild/darwin-arm64
node_modules/.pnpm/@esbuild+darwin-arm64@0.21.5/node_modules/@esbuild/darwin-arm64
node_modules/.pnpm/@esbuild+darwin-arm64@0.25.12/node_modules/@esbuild/darwin-arm64
node_modules/.pnpm/@esbuild+darwin-arm64@0.27.2/node_modules/@esbuild/darwin-arm64
```

## Red/Green 判定

| 項目            | 結果                                                        | 判定  |
| --------------- | ----------------------------------------------------------- | ----- |
| Node arch       | arm64 (native Apple Silicon)                                | Green |
| esbuild binary  | darwin-arm64 が pnpm 仮想ストアに存在（4バージョン）        | Green |
| target test     | 27 passed, 0 failed, exit 0                                 | Green |
| mismatch エラー | なし                                                        | Green |
| ドキュメント    | `docs/40-guides/esbuild-arch-mismatch-prevention.md` 未作成 | Red   |

## 結論

- **テスト実行環境**: Green — `pnpm install` が正しいアーキテクチャで実行済み
- **ドキュメント**: Red — 再発防止ガイドが未作成
- **方針**: Phase 5 でガイドを作成し、全 AC を満たす
