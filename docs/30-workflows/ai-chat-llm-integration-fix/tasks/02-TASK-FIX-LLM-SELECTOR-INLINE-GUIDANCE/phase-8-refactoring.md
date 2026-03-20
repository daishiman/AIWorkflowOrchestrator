# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                                                    |
| ---------- | ----------------------------------------------------- |
| Phase番号  | 8                                                     |
| 機能名     | LLMモデル選択インラインガイダンス追加                 |
| タスクID   | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE                 |
| 作成日     | 2026-03-20                                            |
| ステータス | 作成済み                                              |
| 依存       | [Phase 7 カバレッジ確認](./phase-7-coverage-check.md) |

## 目的

Phase 5 の実装をレビューし、コード品質を改善する。機能は変えず、可読性・保守性・型安全性を向上させる。全テストが引き続き PASS することを確認する。

## 実行タスク

### Task 1: コードレビューチェックリスト

実装ファイル全体を以下の観点でレビューする:

#### 1-1: 型安全性

| チェック項目                                      | 対象ファイル                         |
| ------------------------------------------------- | ------------------------------------ |
| `any` 型が使用されていない                        | LLMGuidanceBanner.tsx                |
| non-null assertion (`!`) が不必要に使われていない | 全変更ファイル（P48/P52チェック）    |
| Props 型が HTML 標準属性と衝突していない          | LLMGuidanceBanner.tsx（P46チェック） |

#### 1-2: 状態管理

| チェック項目                                       | 対象ファイル           |
| -------------------------------------------------- | ---------------------- |
| 合成 Hook を使用していない（P31対策）              | LLMGuidanceBanner.tsx  |
| 派生セレクタに `useShallow` が適切に適用されている | llmSlice.ts（P48対策） |

#### 1-3: 命名規則

| チェック項目                                         | 対象ファイル   |
| ---------------------------------------------------- | -------------- |
| boolean 変数名が `is` / `has` / `can` プレフィックス | 全変更ファイル |
| 未使用の `import` がない                             | 全変更ファイル |

#### 1-4: コンポーネント設計

| チェック項目                                        | 対象ファイル           |
| --------------------------------------------------- | ---------------------- |
| LLMGuidanceBanner が単一責務（表示判定 + 表示のみ） | LLMGuidanceBanner.tsx  |
| GuidanceBlock の Props 拡張が後退互換である         | WorkspaceChatPanel.tsx |

### Task 2: リファクタリング実施

Task 1 で発見した問題点を修正する。修正後は必ずテストを実行して PASS を確認する。

```bash
# リファクタリング後のテスト実行
cd apps/desktop && pnpm vitest run \
  src/renderer/views/ChatView/__tests__/ \
  src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.guidance.test.tsx
```

### Task 3: 不要なコードの削除

- デバッグ用 `console.log` の削除
- コメントアウトされたコードの削除
- 未使用の変数・インポートの削除

## 参照資料

| ファイル                                 | 用途                                         |
| ---------------------------------------- | -------------------------------------------- |
| `.claude/rules/02-code-quality.md`       | コーディング規約                             |
| `.claude/rules/06-known-pitfalls.md#P31` | Zustand合成Hook無限ループ防止                |
| `.claude/rules/06-known-pitfalls.md#P46` | HTMLAttributes Props型衝突パターン           |
| `.claude/rules/06-known-pitfalls.md#P48` | non-null assertion 禁止                      |
| `.claude/rules/06-known-pitfalls.md#P52` | 同ファイル内 non-null assertion 残存チェック |

## 実行手順

### Step 1: コードレビュー（Task 1）

### Step 2: 問題点修正（Task 2）

### Step 3: 不要コード削除（Task 3）

### Step 4: テスト再実行確認

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                         | パス                       |
| ------------------------------ | -------------------------- |
| リファクタリング済みファイル群 | Phase 5 成果物（更新済み） |

## 完了条件

- [ ] `any` 型が使用されていない
- [ ] non-null assertion (`!`) が不必要に使われていない（P48対策）
- [ ] 未使用 import がない
- [ ] デバッグ用 console.log がない
- [ ] 全テストが PASS している（カバレッジ基準を維持）

## 次Phase

[Phase 9: 品質検証](./phase-9-quality-assurance.md)
