# Phase 2: 設計 - esbuild darwin アーキテクチャ不整合修正

## メタ情報

| 項目       | 値                                 |
| ---------- | ---------------------------------- |
| Phase      | 2                                  |
| フェーズ名 | 設計                               |
| 前Phase    | Phase 1                            |
| 次Phase    | Phase 3                            |
| 機能名     | esbuild-arch-mismatch-fix          |
| 作成日     | 2026-03-30                         |
| タスクID   | UT-RT-06-ESBUILD-ARCH-MISMATCH-001 |
| ステータス | 未実施                             |

## 目的

Phase 1 で定義した要件に基づき、arm64 統一アプローチと再発防止策を設計する。

## 参照資料

| 資料名             | パス                                                                   | 内容                  |
| ------------------ | ---------------------------------------------------------------------- | --------------------- |
| 要件定義           | `phase-1-requirements.md`                                              | スコープ・AC 定義     |
| 技術コア仕様       | `.claude/skills/aiworkflow-requirements/references/technology-core.md` | Node.js 22.x LTS 仕様 |
| デプロイメント仕様 | `.claude/skills/aiworkflow-requirements/references/deployment-core.md` | CI パイプライン仕様   |

## 実行タスク

- T-02-1: 根本原因分析の設計
- T-02-2: 修正アプローチ設計
- T-02-3: 再発防止策の設計
- T-02-4: リスク評価

### T-01: 根本原因分析の設計

以下の因果連鎖を文書化する。

```
[原因]
Rosetta 2 (x86_64) 環境下の Node.js で pnpm install を実行
  ↓
[結果 1]
pnpm が process.arch = "x64" を検出
  ↓
[結果 2]
optional dependency として @esbuild/darwin-x64 のみをインストール
@esbuild/darwin-arm64 はインストールされない
  ↓
[結果 3]
native arm64 Node.js に切り替えて vitest を実行
  ↓
[結果 4]
esbuild が @esbuild/darwin-arm64 バイナリをロードしようとする
  ↓
[エラー]
バイナリが存在しないためロード失敗
"You installed esbuild for another platform" エラー発生
vitest 起動不可
```

**重要**: この問題は esbuild のバグではなく、Node.js のアーキテクチャ不一致が根本原因である。pnpm install 時と実行時の `process.arch` が一致していれば発生しない。

### T-02: 修正アプローチ設計

以下の手順を順序立てて実行する。

#### Step 1: 現在のアーキテクチャ診断

```bash
# 現在の Node.js アーキテクチャを確認
node -e "console.log(process.arch)"
# 期待: arm64（もし x64 なら Step 2 が必須）

# OS ネイティブアーキテクチャ確認
uname -m
# 期待: arm64

# 現在の esbuild バイナリを確認
ls node_modules/@esbuild/
# 問題状態: darwin-x64 のみが存在
```

#### Step 2: arm64 シェルへの切り替え

```bash
# arm64 ネイティブシェルを起動
arch -arm64 zsh

# 切り替え確認
arch
# 期待: arm64

# Node.js も arm64 であることを確認
node -e "console.log(process.arch)"
# 期待: arm64
```

**注意**: nvm / nodenv / volta を使用している場合、arm64 シェル内で改めて Node.js バージョンを選択する必要がある場合がある。

#### Step 3: node_modules の削除

```bash
# node_modules を完全削除（monorepo 全体）
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules

# pnpm store に x64 バイナリキャッシュが残存している場合はクリア
# （通常は不要だが、arm64 再インストール後も x64 バイナリがロードされる場合に実施）
# pnpm store prune
```

#### Step 4: arm64 環境での pnpm install

```bash
# arm64 環境で依存関係を再インストール
pnpm install

# インストール中の arch 確認（ログで確認可能）
```

#### Step 5: esbuild バイナリの存在確認

```bash
# arm64 バイナリが存在することを確認
ls node_modules/@esbuild/
# 期待: darwin-arm64 が含まれる

# バイナリの実行確認
node_modules/@esbuild/darwin-arm64/bin/esbuild --version
# 期待: バージョン番号が出力される
```

#### Step 6: vitest 実行確認

```bash
# vitest が esbuild エラーなく起動することを確認
pnpm vitest run --reporter=verbose 2>&1 | head -50

# RT-06 対象テストの実行
pnpm --filter @repo/desktop test:run
```

### T-03: 再発防止策の設計

#### 3-1: .nvmrc アーキテクチャコメント

```bash
# .nvmrc にアーキテクチャ注記を追加
# ファイル内容:
# 22
# NOTE: Apple Silicon Mac では必ず arm64 Node.js を使用すること
# arch -arm64 zsh で arm64 シェルに切り替えてから nvm use を実行
```

#### 3-2: CLAUDE.md worktree セクション更新

CLAUDE.md に以下のセクションを追加する。

```markdown
## Apple Silicon 環境での注意事項

### esbuild アーキテクチャ不整合の防止

Apple Silicon Mac で worktree を作成した場合、以下を確認すること:

1. `node -e "console.log(process.arch)"` が `arm64` を返すことを確認
2. `arm64` でない場合は `arch -arm64 zsh` で arm64 シェルに切り替え
3. `rm -rf node_modules && pnpm install` で依存関係を再構築
4. `ls node_modules/@esbuild/` で `darwin-arm64` が存在することを確認
```

#### 3-3: CI パイプラインアーキテクチャ指定の考慮

GitHub Actions の `macos-latest` ランナーが arm64（M1 以降）であることを前提とする。将来的に `runs-on: macos-latest-xlarge`（arm64 確定）への移行を検討する。

**設計判断**:

| 判断事項                  | 決定                     | 根拠                                        |
| ------------------------- | ------------------------ | ------------------------------------------- |
| CI でのアーキテクチャ固定 | 現時点では未実施         | macos-latest は既に arm64 の可能性が高い    |
| pnpm store prune の要否   | 通常不要、問題時のみ実施 | store は arch 別に管理されるため            |
| .nvmrc への arch 情報追加 | コメントとして追加       | .nvmrc 自体は arch を制御しないため注記のみ |
| CLAUDE.md への手順追加    | 必須                     | 開発者・AI エージェント双方への周知が目的   |

### T-04: リスク評価

| リスク                                              | 影響度 | 発生確率 | 対策                                                               |
| --------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------ |
| CI macos-latest ランナーの arch 変更                | 中     | 低       | CI ログで `process.arch` を出力するステップを追加検討              |
| pnpm store cache に x64 バイナリが残存              | 中     | 低       | `pnpm store prune` で対処可能。手順書に記載                        |
| nvm / nodenv が x64 Node.js を指している            | 高     | 中       | `arch -arm64 zsh` 後に `nvm use` を実行する手順を明記              |
| worktree 作成時に親リポジトリの node_modules を共有 | 中     | 中       | worktree ごとに独立した `pnpm install` を実行する手順を明記        |
| Rosetta 2 が暗黙的に有効なターミナル                | 高     | 中       | Terminal.app / iTerm2 の「Rosetta で開く」設定を確認する手順を追加 |

## 統合テスト連携【必須】

以下の依存チェーンを設計に反映する。

```
pnpm install (arm64 環境)
  ↓
@esbuild/darwin-arm64 バイナリがインストールされる
  ↓
tsup (内部で esbuild を使用) が @repo/shared をビルド可能
  ↓
vitest が esbuild 経由でテストファイルをトランスパイル
  ↓
テスト実行成功
```

この依存チェーンのいずれかが切れると vitest が起動できない。

## 成果物

| 成果物 | パス                              | 説明                       |
| ------ | --------------------------------- | -------------------------- |
| 設計書 | `phase-2-design.md`（本ファイル） | 修正アプローチ・防止策設計 |

## 出力ファイル

- `outputs/phase-2/design-document.md` - 設計書詳細
- `outputs/phase-2/risk-assessment.md` - リスク評価書

## 完了条件

- [ ] 根本原因の因果連鎖が文書化されている
- [ ] 修正手順が Step 1〜6 で順序立てて定義されている
- [ ] 再発防止策が 3 つ以上設計されている
- [ ] リスク評価と対策が定義されている
- [ ] 統合テスト連携（依存チェーン）が設計に反映されている

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 次のPhase

Phase 3: 設計レビューゲート
