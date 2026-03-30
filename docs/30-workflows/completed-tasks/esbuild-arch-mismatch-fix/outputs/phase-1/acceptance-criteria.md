# Phase 1: 受け入れ基準詳細

## 受け入れ基準一覧

| ID   | 受け入れ基準                                                | 検証方法                                                     | 優先度 |
| ---- | ----------------------------------------------------------- | ------------------------------------------------------------ | ------ |
| AC-1 | Node.js アーキテクチャが一貫していること                    | `node -e "console.log(process.arch)"` でアーキテクチャを確認 | 必須   |
| AC-2 | esbuild バイナリが Node.js アーキテクチャと一致していること | `ls node_modules/@esbuild/` で確認                           | 必須   |
| AC-3 | `pnpm vitest run` が esbuild エラーなく起動すること         | vitest 起動時のエラーログがないことを確認                    | 必須   |
| AC-4 | RT-06 対象テストが PASS/FAIL の判定結果を返すこと           | `pnpm --filter @repo/desktop test:run` の実行結果確認        | 必須   |
| AC-5 | 再発防止手順が文書化されていること                          | ドキュメントの存在確認                                       | 必須   |

## 各 AC の詳細

### AC-1: Node.js アーキテクチャの一貫性

**背景**: 問題の根本原因は install 時と実行時の `process.arch` の不一致。

**検証コマンド**:

```bash
node -e "console.log(process.arch)"
```

**期待結果**: `x64` または `arm64` のいずれかが一貫して返される

**注意**: 現在の環境では Volta が x64 Node をインストールしているため、`x64` が期待値。
arm64 への完全移行は再発防止ドキュメントに手順を記載する。

### AC-2: esbuild バイナリの一致

**検証コマンド**:

```bash
ls node_modules/@esbuild/
```

**期待結果**: `process.arch` が `x64` の場合は `darwin-x64`、`arm64` の場合は `darwin-arm64` が存在

### AC-3: vitest 起動確認

**検証コマンド**:

```bash
pnpm vitest run --reporter=verbose 2>&1 | head -20
```

**期待結果**: esbuild 関連のエラーメッセージが出力されないこと

**NG パターン**:

- `Error: The package "@esbuild/darwin-arm64" could not be found`
- `Error: The package "@esbuild/darwin-x64" could not be found`

### AC-4: RT-06 対象テスト実行

**検証コマンド**:

```bash
pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts
```

**期待結果**: テストが実行され PASS/FAIL の判定が返される（esbuild ロードエラーではない）

### AC-5: 再発防止手順の文書化

**検証方法**: 以下のいずれかにドキュメントが存在すること

- `outputs/phase-5/prevention-procedure.md`
- CLAUDE.md 内の該当セクション

**必須記載内容**:

- アーキテクチャ不整合の診断方法
- 修正手順
- 予防策
