# Phase 6: テスト拡充 - esbuild darwin アーキテクチャ不整合の解消

## メタ情報

| 項目         | 値                                 |
| ------------ | ---------------------------------- |
| Phase        | 6                                  |
| 機能名       | テスト拡充                         |
| 前Phase      | Phase 5 (実装)                     |
| 次Phase      | Phase 7 (カバレッジ確認)           |
| 作成日       | 2026-03-30                         |
| タスクID     | UT-RT-06-ESBUILD-ARCH-MISMATCH-001 |
| ワークフロー | esbuild-arch-mismatch-fix          |
| ステータス   | 未実施                             |

## 目的

Phase 5 で実施した環境修正に対し、エッジケースの検証シナリオと CI 環境での考慮事項を追加する。再発防止のための追加検証を網羅する。

## 実行タスク

- T-06-1: pnpm store キャッシュを検証する
- T-06-2: CI 再現シナリオを文書化する
- T-06-3: 複数 worktree の注意点を整理する
- T-06-4: Node バージョン管理ファイルの整合を確認する

### T-06-1: pnpm store キャッシュ検証

pnpm store のキャッシュが原因で古い x64 バイナリが再インストールされないことを確認する。

```bash
# pnpm store をクリーンアップ
pnpm store prune

# 再インストール
pnpm install

# esbuild バイナリが依然として darwin-arm64 であることを確認
ls node_modules/@esbuild/
```

### T-06-2: CI 環境再現シナリオの文書化

GitHub Actions `macos-latest` でのアーキテクチャ動作を文書化する。

**確認事項:**

| 項目                                      | 内容                                                            |
| ----------------------------------------- | --------------------------------------------------------------- |
| `macos-latest` のデフォルトアーキテクチャ | Apple Silicon (arm64) ランナーへ移行済み（2024年後半以降）      |
| `arch -arm64` の CI での必要性            | GitHub Actions arm64 ランナーでは不要（native arm64）           |
| `setup-node` アクションのアーキテクチャ   | ランナーの native アーキテクチャに従う                          |
| Rosetta 2 混入リスク                      | CI では低い（一貫した環境）。ローカル開発環境でのみ発生しやすい |

**CI ワークフローでの推奨事項:**

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

### T-06-3: 複数 worktree での検証

新しい worktree を作成した場合でも、`pnpm install` が正しい arm64 バイナリを生成することを確認する。

```bash
# 現在の worktree で確認
ls node_modules/@esbuild/

# 別の worktree が存在する場合の注意点:
# - 各 worktree で個別に node_modules が存在する
# - pnpm install は実行時の Node.js アーキテクチャに依存する
# - worktree 作成後は必ず arm64 環境で pnpm install を実行すること
```

### T-06-4: .nvmrc / .node-version 整合性チェック

Node.js バージョン管理ファイルの存在と内容を確認する。

```bash
# バージョンファイルの確認
cat .nvmrc 2>/dev/null || echo ".nvmrc not found"
cat .node-version 2>/dev/null || echo ".node-version not found"

# Node.js バージョン確認
node --version  # 22.x であること
```

**検討事項:**

- `.nvmrc` または `.node-version` に Node 22.x が指定されていることを確認
- アーキテクチャはバージョンファイルでは制御できないため、開発環境セットアップ手順（CLAUDE.md または CONTRIBUTING.md）にアーキテクチャ統一の注意事項を記載することを検討

## 統合テスト連携【必須】

CI 環境（GitHub Actions `macos-latest`）での再現シナリオを文書化し、ローカル開発環境との差異を明確にする。

## 参照資料

| 参照資料         | パス                                                                          | 内容                         |
| ---------------- | ----------------------------------------------------------------------------- | ---------------------------- |
| Node.js 技術仕様 | `.claude/skills/aiworkflow-requirements/references/technology-core.md`        | Node.js 22.x LTS / pnpm 仕様 |
| DevOps 技術仕様  | `.claude/skills/aiworkflow-requirements/references/technology-devops-core.md` | esbuild / tsup 構成          |
| 元タスク定義     | `docs/30-workflows/completed-tasks/UT-RT-06-ESBUILD-ARCH-MISMATCH-001.md`     | esbuild arch 不整合タスク    |

## 成果物

| 成果物                   | パス                                        | 説明                                               |
| ------------------------ | ------------------------------------------- | -------------------------------------------------- |
| エッジケース検証レポート | `outputs/phase-6/edge-case-verification.md` | 各エッジケースの検証結果と CI 環境考慮事項のまとめ |

## 完了条件

- [ ] pnpm store prune 後の再インストールで darwin-arm64 バイナリが取得されることを確認
- [ ] CI 環境（GitHub Actions `macos-latest`）でのアーキテクチャ動作が文書化されている
- [ ] 複数 worktree でのインストール注意点が文書化されている
- [ ] `.nvmrc` / `.node-version` の内容が確認され、Node 22.x が指定されている
- [ ] `outputs/phase-6/edge-case-verification.md` が生成されている

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 次の Phase

Phase 7: カバレッジ確認（全検証コマンド PASS 確認）
