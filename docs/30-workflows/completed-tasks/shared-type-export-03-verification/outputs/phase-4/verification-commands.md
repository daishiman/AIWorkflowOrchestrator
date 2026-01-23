# 検証コマンドリスト

## 作成日

2026-01-23

## Phase 4 - Task 4-1: 検証コマンドの整理

---

## 1. 検証コマンド一覧

| 順序 | コマンド                                | 目的              | 期待結果  | 必須 |
| ---- | --------------------------------------- | ----------------- | --------- | ---- |
| 1    | `pnpm --filter @repo/shared typecheck`  | shared型チェック  | エラー0件 | ✅   |
| 2    | `pnpm --filter @repo/shared build`      | sharedビルド      | 成功      | ✅   |
| 3    | `pnpm --filter @repo/desktop typecheck` | desktop型チェック | エラー0件 | ✅   |
| 4    | `pnpm --filter @repo/desktop build`     | desktopビルド     | 成功※     | ✅   |
| 5    | `pnpm typecheck`                        | 全体型チェック    | エラー0件 | ✅   |
| 6    | `pnpm build`                            | 全体ビルド        | 成功      | ✅   |
| 7    | `git push --dry-run`                    | pre-push hook検証 | hook通過  | ○    |

※ 既存のRenderer関連問題を除く

---

## 2. 実行順序の理由

### 2.1 依存関係

```
@repo/shared (先にビルド必要)
    ↓
@repo/desktop (sharedに依存)
    ↓
全体検証 (統合確認)
```

### 2.2 型チェック → ビルドの順序

- 型チェックは高速（通常数秒）
- ビルドは時間がかかる（数十秒〜数分）
- 型エラーを早期発見してビルド時間を節約

### 2.3 単体 → 全体の順序

- 問題の切り分けを容易にする
- エラー発生時に原因パッケージを特定しやすい

---

## 3. コマンド詳細

### 3.1 @repo/shared typecheck

```bash
pnpm --filter @repo/shared typecheck
```

**目的**: shared パッケージの型チェック
**成功条件**: Exit code 0
**確認項目**:

- Community型の定義が正しい
- エクスポートに型エラーがない

### 3.2 @repo/shared build

```bash
pnpm --filter @repo/shared build
```

**目的**: shared パッケージのビルド
**成功条件**: Exit code 0、dist/ 配下に成果物生成
**確認項目**:

- index.d.ts が生成される
- Community型が含まれている

### 3.3 @repo/desktop typecheck

```bash
pnpm --filter @repo/desktop typecheck
```

**目的**: desktop パッケージの型チェック
**成功条件**: Exit code 0（Community型関連エラーなし）
**確認項目**:

- `import type { Community } from "@repo/shared"` が解決される
- Community型を使用するコードに型エラーがない

### 3.4 @repo/desktop build

```bash
pnpm --filter @repo/desktop build
```

**目的**: desktop パッケージのビルド
**成功条件**: Exit code 0（既存問題を除く）
**確認項目**:

- ビルドが正常に完了する
- 型エクスポートに起因するエラーがない

### 3.5 全体 typecheck

```bash
pnpm typecheck
```

**目的**: 全パッケージの型チェック
**成功条件**: Exit code 0
**確認項目**:

- 全パッケージで型エラーがない

### 3.6 全体 build

```bash
pnpm build
```

**目的**: 全パッケージのビルド
**成功条件**: Exit code 0
**確認項目**:

- 全パッケージのビルドが成功

### 3.7 pre-push hook検証

```bash
git push --dry-run
```

**目的**: pre-push hookの動作確認
**成功条件**: hook通過
**確認項目**:

- lint、typecheck、testが全てパス

---

## 4. 完了確認

- [x] 全検証コマンドがリストアップされている
- [x] 実行順序が依存関係に基づいて正しく定義されている
- [x] 各コマンドの期待結果が明記されている
