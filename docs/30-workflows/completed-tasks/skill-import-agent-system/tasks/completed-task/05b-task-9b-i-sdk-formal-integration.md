# Agent SDK 正式統合 - タスク指示書

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| タスクID     | TASK-9B-I-SDK-FORMAL-INTEGRATION   |
| タスク名     | Claude Agent SDKの型安全な正式統合 |
| 分類         | リファクタリング（型安全性強化）   |
| 対象機能     | SkillExecutor SDK統合              |
| 優先度       | 中                                 |
| 見積もり規模 | 小規模                             |
| ステータス   | 完了                               |
| 実行順序     | 05b（並列可能 — 04完了後）         |
| 発見元       | skill-system-conflict-report #8    |
| 発見日       | 2026-02-05                         |
| 関連Phase    | Phase 3（Tier 2 機能接続）         |
| 関連Issue    | Issue #641                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`technical-decisions.md` §1 で Claude Agent SDK を正式採用。しかし現在の統合は `as any` による暫定措置であり、SDK の型情報が完全に失われている。

### 1.2 問題点・課題

| 問題                                   | 影響                         |
| -------------------------------------- | ---------------------------- |
| `as any` で SDK を動的 import          | 型安全性が完全に喪失         |
| コンパイル時の API 誤用検出が不可能    | ランタイムでのみエラーが判明 |
| SDK バージョンアップ時の互換性検証不可 | 破壊的変更を検出できない     |

**現在のコード** (`SkillExecutor.ts` L746):

```typescript
const { query } = (await import("@anthropic-ai/claude-agent-sdk")) as any;
```

### 1.3 放置した場合の影響

- SDK のメソッドシグネチャ変更時にコンパイルエラーにならない
- IDE の補完・型チェックが効かない
- リグレッションリスクの増大

---

## 2. 何を達成するか（What）

### 2.1 目的

`as any` を除去し、SDK の型定義を正式に利用した型安全な統合を実現する。

### 2.2 最終ゴール

1. `as any` が除去されている
2. SDK の型定義が正しく解決される
3. `query()` 呼び出しが型チェックされる

### 2.3 スコープ

#### 含むもの

- `as any` の除去
- SDK 型定義の正式参照
- 動的 import の型付け

#### 含まないもの

- SDK の機能追加
- SkillExecutor のロジック変更

### 2.4 成果物

| 成果物                         | 説明                           |
| ------------------------------ | ------------------------------ |
| 修正された SkillExecutor.ts    | `as any` 除去、型安全な import |
| 型定義ファイル（必要に応じて） | SDK の型補完                   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION 完了（E2E スモークテスト PASS）

### 3.2 依存タスク

- TASK-FIX-7-1（実行基盤が動作した状態で型安全化）

### 3.3 必要な知識

- Claude Agent SDK の TypeScript 型定義
- 動的 import の型付けパターン
- TypeScript conditional types

### 3.4 推奨アプローチ

1. SDK の `@types` または同梱型定義を確認
2. 動的 import を `import()` 型で型付け
3. `query()` の引数・戻り値型を適用
4. テストで型互換性を検証

---

## 4. 実行手順

### Step 1: SDK 型定義調査

#### 手順

1. `@anthropic-ai/claude-agent-sdk` パッケージの型定義を確認
2. `query()` のシグネチャを特定
3. 必要な型を import リストに追加

### Step 2: 型安全な import 実装

#### 手順

1. `as any` を除去
2. 型付きの動的 import に置き換え:

```typescript
const sdk = await import("@anthropic-ai/claude-agent-sdk");
const conversation = sdk.query({
  prompt,
  options: {
    /* 型チェック付き */
  },
});
```

### Step 3: テスト・検証

#### 手順

1. TypeScript コンパイルが通ることを確認
2. 既存テストが PASS
3. SDK メソッドの型チェックが IDE で効くことを確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [x] `as any` が除去されている
- [x] SDK の import が型安全
- [x] `query()` の引数・戻り値が型チェックされる

### 品質要件

- [x] 全テストが PASS
- [x] `@ts-expect-error` 等の型抑制が不要

---

## 6. 検証方法

### テストケース

1. TypeScript strict mode でコンパイル成功
2. 不正な引数を渡した場合にコンパイルエラー
3. 既存の実行フローが引き続き動作

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                              |
| -------------------------- | ------ | -------- | --------------------------------- |
| SDK の型定義が不完全       | 中     | 中       | 必要に応じて型補完ファイルを作成  |
| 動的 import の型解決が困難 | 中     | 中       | top-level import への切り替え検討 |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-import-agent-system/technical-decisions.md` §1（SDK採用）
- `apps/desktop/src/main/services/skill/SkillExecutor.ts` L746
- `@anthropic-ai/claude-agent-sdk` パッケージ

### 関連タスク

- Issue #641（SDK正式統合）
- TASK-FIX-11-1-SDK-TEST-ENABLEMENT（後続: テスト有効化）

---

## 9. 備考

### 暫定措置の経緯

`as any` は SDK 正式リリース前の暫定措置として導入された。SDK が正式リリースされ型定義が安定した現在、暫定措置を解消すべきタイミング。
