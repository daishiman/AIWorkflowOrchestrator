# 検証基準定義書

## 作成日

2026-01-23

## Phase 1 - Task 1-2: 検証基準の定義

---

## 1. 検証項目一覧

### 1.1 型チェック検証

| 検証項目          | コマンド                                | 期待結果  | 必須 | 優先度 |
| ----------------- | --------------------------------------- | --------- | ---- | ------ |
| shared型チェック  | `pnpm --filter @repo/shared typecheck`  | エラー0件 | ✅   | P0     |
| desktop型チェック | `pnpm --filter @repo/desktop typecheck` | エラー0件 | ✅   | P0     |
| 全体型チェック    | `pnpm typecheck`                        | エラー0件 | ✅   | P0     |

### 1.2 ビルド検証

| 検証項目      | コマンド                            | 期待結果                    | 必須 | 優先度 |
| ------------- | ----------------------------------- | --------------------------- | ---- | ------ |
| sharedビルド  | `pnpm --filter @repo/shared build`  | ビルド成功                  | ✅   | P0     |
| desktopビルド | `pnpm --filter @repo/desktop build` | ビルド成功（※既存問題除く） | ✅   | P1     |
| 全体ビルド    | `pnpm build`                        | ビルド成功                  | ✅   | P1     |

### 1.3 Push検証

| 検証項目      | コマンド   | 期待結果 | 必須 | 優先度 |
| ------------- | ---------- | -------- | ---- | ------ |
| pre-push hook | `git push` | hook通過 | ✅   | P1     |

---

## 2. 判定基準

### 2.1 PASS条件

以下の全条件を満たす場合、検証はPASSとする:

1. **型チェック**: 全パッケージで型エラーが0件
2. **ビルド**: 全パッケージのビルドが成功
3. **Hook**: pre-push hookが正常に通過

### 2.2 FAIL条件

以下のいずれかに該当する場合、検証はFAILとする:

1. **型チェックエラー**: Community関連の型解決エラーが発生
2. **ビルドエラー**: 型エクスポートに起因するビルドエラーが発生
3. **Hookエラー**: 型エラーによりpre-push hookが失敗

### 2.3 例外ケース（既存問題）

以下の既存問題は検証FAILとしてカウントしない:

| 問題                     | 対象          | 理由             |
| ------------------------ | ------------- | ---------------- |
| Renderer関連ビルドエラー | @repo/desktop | 本タスクの範囲外 |
| 既存の型定義の問題       | 全般          | 別タスクで対応   |

---

## 3. 検証手順

### 3.1 型チェック検証手順

```bash
# Step 1: @repo/shared の型チェック
pnpm --filter @repo/shared typecheck

# Step 2: @repo/desktop の型チェック
pnpm --filter @repo/desktop typecheck

# Step 3: 全体の型チェック
pnpm typecheck
```

### 3.2 ビルド検証手順

```bash
# Step 1: @repo/shared のビルド（先に実行）
pnpm --filter @repo/shared build

# Step 2: @repo/desktop のビルド
pnpm --filter @repo/desktop build

# Step 3: 全体ビルド
pnpm build
```

### 3.3 Push検証手順

```bash
# Step 1: 変更をコミット
git add .
git commit -m "feat: verify shared type exports"

# Step 2: プッシュ（pre-push hook実行）
git push
```

---

## 4. エラー分類と対応

### 4.1 エラー分類

| エラーコード | エラー内容                       | 対応方針                 |
| ------------ | -------------------------------- | ------------------------ |
| TS2305       | Module has no exported member    | エクスポート追加         |
| TS2307       | Cannot find module               | パス確認・ビルド順序確認 |
| TS2614       | Module has no default export     | named exportに変更       |
| TS2694       | Namespace has no exported member | 型定義確認               |

### 4.2 エラー発生時の対応フロー

```
エラー発生
    ↓
エラー内容確認
    ↓
┌─────────────────────────────────────┐
│ Community型関連エラー？             │
├──────────┬──────────────────────────┤
│   Yes    │          No             │
└────┬─────┴──────────────────────────┘
     ↓                   ↓
Phase 5で修正      既存問題として記録
```

---

## 5. 完了確認

- [x] 各検証項目の期待結果が定義されている
- [x] 必須/任意の区分が明確になっている
- [x] 例外ケース（既存問題）が明記されている
- [x] 検証手順が具体的に記載されている
- [x] エラー対応方針が明記されている
