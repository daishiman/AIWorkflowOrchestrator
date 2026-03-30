# Phase 6: エッジケース検証レポート

## T-06-1: pnpm store キャッシュ検証

| 検証項目                    | コマンド                                 | 結果                                        |
| --------------------------- | ---------------------------------------- | ------------------------------------------- |
| pnpm store prune 実行       | `pnpm store prune`                       | Removed 0 files, 0 packages                 |
| prune 後の esbuild バイナリ | `ls node_modules/.pnpm/ \| grep esbuild` | darwin-arm64, darwin-x64 の全バージョン健在 |
| prune 後の vitest 起動      | `pnpm vitest run` (Phase 5 で確認済み)   | esbuild エラーなし                          |

**結論**: `pnpm store prune` は node_modules 内のバイナリに影響しない。安全に実行可能。

## T-06-2: CI 環境再現シナリオ

| 項目                                      | 内容                                                            |
| ----------------------------------------- | --------------------------------------------------------------- |
| `macos-latest` のデフォルトアーキテクチャ | Apple Silicon (arm64) ランナーへ移行済み（2024年後半以降）      |
| `arch -arm64` の CI での必要性            | GitHub Actions arm64 ランナーでは不要（native arm64）           |
| `setup-node` アクションのアーキテクチャ   | ランナーの native アーキテクチャに従う                          |
| Rosetta 2 混入リスク                      | CI では低い（一貫した環境）。ローカル開発環境でのみ発生しやすい |

**CI ワークフローでの推奨事項**:

```yaml
# .github/workflows/test.yml での推奨設定例
jobs:
  test:
    runs-on: macos-latest # arm64 ランナー
    steps:
      - name: Verify architecture
        run: |
          echo "Node arch: $(node -e 'console.log(process.arch)')"
          echo "OS arch: $(uname -m)"
```

**結論**: CI 環境は arm64 で一貫しており、本問題の再現リスクは低い。ローカル開発環境が主なリスク。

## T-06-3: 複数 worktree での注意点

| 確認項目                        | 結果                                                            |
| ------------------------------- | --------------------------------------------------------------- |
| 現在の worktree                 | `task-20260330-070816-wt-5`（独立した node_modules を構築済み） |
| worktree 間の node_modules 共有 | なし（各 worktree で独立）                                      |
| pnpm install の依存             | 実行時の Node.js アーキテクチャに依存                           |

**注意点**:

- 各 worktree で個別に `pnpm install` が必要
- worktree 作成後は必ずアーキテクチャを確認してから `pnpm install` を実行
- アーキテクチャを切り替えた場合は `rm -rf node_modules && pnpm install` が必須

## T-06-4: .nvmrc / .node-version 整合性チェック

| ファイル               | 存在 | 内容       |
| ---------------------- | ---- | ---------- |
| `.nvmrc`               | あり | `22.21.1`  |
| `.node-version`        | なし | -          |
| Node.js 実行バージョン | -    | `v22.21.1` |
| Node.js 期待バージョン | -    | 22.x       |

**結論**: `.nvmrc` に `22.21.1` が指定されており、実行中の Node.js バージョンと一致。
アーキテクチャはバージョンファイルでは制御できないため、開発環境セットアップ手順（CLAUDE.md）にアーキテクチャ統一の注意事項を記載する。

## 統合テスト連携

CI 環境（GitHub Actions `macos-latest`）での再現シナリオを文書化完了。
ローカル開発環境との差異（Rosetta 2 リスク）を明確にした。
