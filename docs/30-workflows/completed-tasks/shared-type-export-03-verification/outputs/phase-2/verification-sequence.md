# 検証順序設計書

## 作成日

2026-01-23

## Phase 2 - Task 2-1: 検証実行順序の設計

---

## 1. 検証順序概要

```
Step 1: @repo/shared 単体検証
├── 1.1 型チェック (typecheck)
└── 1.2 ビルド (build)
        ↓
Step 2: @repo/desktop 単体検証
├── 2.1 型チェック (typecheck)
└── 2.2 ビルド (build)
        ↓
Step 3: 全体検証
├── 3.1 全体型チェック (pnpm typecheck)
├── 3.2 全体ビルド (pnpm build)
└── 3.3 pre-push hook検証 (git push --dry-run)
```

---

## 2. 詳細手順

### Step 1: @repo/shared 単体検証

#### 1.1 型チェック

```bash
pnpm --filter @repo/shared typecheck
```

**期待結果**: エラー0件
**失敗時対応**: エラー内容を記録し、Phase 5で修正

#### 1.2 ビルド

```bash
pnpm --filter @repo/shared build
```

**期待結果**: ビルド成功
**失敗時対応**: エラー内容を記録し、Phase 5で修正

### Step 2: @repo/desktop 単体検証

#### 2.1 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

**期待結果**: エラー0件（Community型関連）
**失敗時対応**:

- Community型関連エラー → Phase 5で修正
- 既存問題 → 記録して除外

#### 2.2 ビルド

```bash
pnpm --filter @repo/desktop build
```

**期待結果**: ビルド成功（既存のRenderer問題を除く）
**失敗時対応**: エラー内容を分析し、本タスク範囲の問題のみ修正

### Step 3: 全体検証

#### 3.1 全体型チェック

```bash
pnpm typecheck
```

**期待結果**: エラー0件
**失敗時対応**: Step 1, 2で検出されなかったエラーを分析

#### 3.2 全体ビルド

```bash
pnpm build
```

**期待結果**: ビルド成功
**失敗時対応**: ビルド順序・依存関係を確認

#### 3.3 pre-push hook検証

```bash
git push --dry-run
```

**期待結果**: hook通過
**失敗時対応**: hookエラーの原因を特定し修正

---

## 3. 検証順序の理由

| 順序                | 理由                                             |
| ------------------- | ------------------------------------------------ |
| shared → desktop    | 依存関係の方向（shared が desktop に依存される） |
| 型チェック → ビルド | 型エラーを早期発見してビルド時間を節約           |
| 単体 → 全体         | 問題の切り分けを容易にする                       |

---

## 4. 依存関係

```
@repo/shared (型定義提供元)
    ↓
@repo/desktop (型定義利用先)
    ↓
全体検証 (統合確認)
```

---

## 5. 完了確認

- [x] 検証順序が明確に定義されている
- [x] 各ステップの依存関係が明記されている
- [x] 順序の理由が説明されている
- [x] 失敗時の対応が記載されている
