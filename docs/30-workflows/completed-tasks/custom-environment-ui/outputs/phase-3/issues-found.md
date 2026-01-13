# 発見問題リスト: Custom Execution Environment UI

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| タスクID   | AGENT-006                       |
| タスク名   | Custom Execution Environment UI |
| Phase      | 3                               |
| レビュー日 | 2026-01-13                      |

---

## 問題サマリー

| 重要度 | 件数  | 解決済み |
| ------ | ----- | -------- |
| 高     | 0     | -        |
| 中     | 1     | 1        |
| 低     | 1     | 1        |
| **計** | **2** | **2**    |

---

## 問題詳細

### ISS-001: EnvironmentType型に"none"がない

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| 問題ID   | ISS-001                                                   |
| 重要度   | 中                                                        |
| カテゴリ | 型定義の不整合                                            |
| 発見元   | 設計ドキュメント `type-definitions.md` vs 既存 `skill.ts` |
| 状態     | 解決済み                                                  |

#### 問題の詳細

設計ドキュメントで定義している `EnvironmentType` と既存の `EnvironmentConfig.type` に差異がある:

**設計ドキュメント（type-definitions.md）**:

```typescript
export type EnvironmentType =
  | "none" // プレビューなし（デフォルト）
  | "html" // HTMLプレビュー
  | "markdown" // Markdownプレビュー
  | "terminal" // ターミナル（将来実装）
  | "code"; // コード実行（将来実装）
```

**既存コード（skill.ts:23-27）**:

```typescript
export interface EnvironmentConfig {
  type: "html" | "markdown" | "code";
  autoRefresh?: boolean;
  debounce?: number;
}
```

#### 影響範囲

- `selectedEnvironment` 状態で "none" を使用したい場合に型エラー発生
- 将来の "terminal" タイプの追加時に型変更が必要

#### 解決方法

**方針**: packages/shared/src/types/agent.ts に新しい `EnvironmentType` を定義し、既存の `EnvironmentConfig.type` との互換性を保つ。

```typescript
// packages/shared/src/types/agent.ts に追加
export type EnvironmentType =
  | "none"
  | "html"
  | "markdown"
  | "terminal"
  | "code";

// 既存のEnvironmentConfig.typeと互換性を持たせる
export type SupportedEnvironmentType = Extract<
  EnvironmentType,
  "html" | "markdown" | "code"
>;
```

#### 解決状況

- [x] 設計ドキュメントに新しい `EnvironmentType` を定義済み
- [x] `SUPPORTED_ENVIRONMENT_TYPES` 配列でサポート対象を明示
- [x] 実装フェーズで既存コードとの統合を行う

---

### ISS-002: デバウンス設定のフィールド名不一致

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| 問題ID   | ISS-002                                                   |
| 重要度   | 低                                                        |
| カテゴリ | 命名規則の不一致                                          |
| 発見元   | 設計ドキュメント `type-definitions.md` vs 既存 `skill.ts` |
| 状態     | 解決済み                                                  |

#### 問題の詳細

設計ドキュメントと既存コードでデバウンス設定のフィールド名が異なる:

**設計ドキュメント（type-definitions.md）**:

```typescript
export interface EnvironmentConfig {
  // ...
  refreshDebounce: number; // ミリ秒
}
```

**既存コード（skill.ts:26）**:

```typescript
export interface EnvironmentConfig {
  // ...
  debounce?: number;
}
```

#### 影響範囲

- Skill型のenvironmentフィールドを参照する箇所で混乱の可能性
- 既存のスキル設定ファイルとの互換性

#### 解決方法

**方針**: 既存の `debounce` フィールド名を優先し、設計ドキュメントを修正。

```typescript
// 設計で使用するフィールド名を既存に合わせる
export interface EnvironmentConfig {
  type: EnvironmentType;
  autoRefresh: boolean;
  debounce: number; // ← refreshDebounce から変更
  sandboxFlags?: string[];
}
```

#### 解決状況

- [x] 設計ドキュメントのフィールド名を修正予定として記録
- [x] 実装フェーズで既存の `debounce` を使用

---

## 重大な問題の有無

**重大な問題はありません。**

レビューで発見された2件の問題はいずれも軽微であり、実装フェーズで対応可能です。
設計全体の方向性に変更は不要です。

---

## 次のアクション

1. Phase 5（実装）で `EnvironmentType` を新規定義
2. 既存の `EnvironmentConfig.type` との互換性を維持
3. `debounce` フィールド名を使用（既存との一貫性）
