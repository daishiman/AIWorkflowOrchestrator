# 状態セレクタのJSDoc追加 - タスク指示書

## メタ情報

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスクID     | UT-STORE-HOOKS-REFACTOR-002                          |
| タスク名     | 状態セレクタのJSDoc追加                              |
| 分類         | 改善                                                 |
| 対象機能     | Zustand Store 個別セレクタ                           |
| 優先度       | 低                                                   |
| 見積もり規模 | 小規模                                               |
| ステータス   | 未実施                                               |
| 発見元       | Phase 10（UT-STORE-HOOKS-REFACTOR-001 最終レビュー） |
| 発見日       | 2026-02-11                                           |
| issue_number | 782                                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-STORE-HOOKS-REFACTOR-001で53個の個別セレクタ（`useAuthMode()`, `useSetAuthMode()`, `useSelectedLLMId()` 等）を追加した。これらのセレクタはP31（無限ループ問題）を解決するための重要なAPIだが、現状ではJSDocコメントが不足しており、各セレクタの用途や戻り値の型がIDEで確認しづらい。

### 1.2 問題点・課題

- IDEのホバー表示で関数の目的が分からない
- 戻り値の型が`() => unknown`のように表示される場合がある
- 新規開発者が適切なセレクタを選択するのに時間がかかる
- `use*` プレフィックスのセレクタが多く、命名だけでは区別しにくい

### 1.3 放置した場合の影響

- 開発者体験（DX）の低下
- 誤ったセレクタの使用によるバグの可能性
- 合成Hook（`useAuthModeStore()`等）への回帰リスク
- コードレビュー時の確認コスト増加

---

## 2. 何を達成するか（What）

### 2.1 目的

全53個の個別セレクタにJSDocコメントを追加し、IDEでの補完体験と開発者の理解を向上させる。

### 2.2 最終ゴール

- 全セレクタにJSDocが追加されている
- IDEホバー時に関数の目的と戻り値の型が表示される
- TypeScript型チェック、ESLintが通る状態

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/renderer/store/index.ts` の53個の個別セレクタへのJSDoc追加
- AuthMode関連セレクタ（12個）
- LLM関連セレクタ（16個）
- Agent関連セレクタ（25個）

#### 含まないもの

- Slice内部の関数へのJSDoc追加
- 既存の合成Hook（`useAuthModeStore`等）へのJSDoc追加
- テストファイルへのJSDoc追加

### 2.4 成果物

| 成果物              | パス                                       |
| ------------------- | ------------------------------------------ |
| 更新されたStore定義 | `apps/desktop/src/renderer/store/index.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-STORE-HOOKS-REFACTOR-001が完了していること
- TypeScript環境が正常に動作すること

### 3.2 依存タスク

なし（単独で実行可能）

### 3.3 必要な知識

- TypeScript JSDoc構文
- Zustand セレクタパターン
- プロジェクトの状態管理アーキテクチャ

### 3.4 推奨アプローチ

1. セレクタをカテゴリ別（AuthMode/LLM/Agent）にグループ化
2. 各カテゴリのセレクタに一貫したJSDocフォーマットを適用
3. `@returns` で戻り値の型と説明を明記
4. 関連するセレクタ間の関係性をコメントで補足

### 3.5 実装課題と解決策（UT-STORE-HOOKS-REFACTOR-001からの学び）

> 親タスク UT-STORE-HOOKS-REFACTOR-001 実行時に遭遇した課題と解決策。同様の課題を簡潔に解決するための参照情報。

#### 課題1: セレクタのカテゴリ別整理の重要性

| 項目   | 内容                                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------------------------ |
| 問題   | 53個のセレクタが3カテゴリ（AuthMode 12個, LLM 16個, Agent 25個）に分かれており、命名だけでは用途が分かりにくい     |
| 解決策 | JSDoc追加時にカテゴリ別セクションコメント（`// ============ AuthMode Selectors ============` 等）も併せて追加する  |
| 参照   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`「実装済み個別セレクタ一覧」セクション |

#### 課題2: 戻り値の型が推論で不明確なケース

| 項目   | 内容                                                                                                                         |
| ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 問題   | Zustandセレクタの戻り値型がIDEで `() => unknown` と表示される場合がある                                                      |
| 解決策 | `@returns` に明示的な型情報と説明を記載する（例: `@returns {AuthMode} 現在の認証モード（'subscription' \| 'apikey'）`）      |
| 参照   | `.claude/skills/aiworkflow-requirements/references/patterns.md`「Zustand個別セレクタベース再設計パターン」の命名規則テーブル |

#### 課題3: ESLintキャッシュの誤検出

| 項目   | 内容                                                                                                                                            |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 問題   | JSDoc追加後もESLintが古い警告を表示し続ける場合がある                                                                                           |
| 解決策 | `pnpm lint --cache false` でキャッシュを無効化して実行する                                                                                      |
| 参照   | `.claude/rules/06-known-pitfalls.md`、`docs/30-workflows/UT-STORE-HOOKS-REFACTOR-001/outputs/phase-12/documentation-changelog.md` セクション5.2 |

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 目的                        |
| ----- | ---------------- | --------------------------- |
| 1     | AuthModeセレクタ | AuthMode関連12個のJSDoc追加 |
| 2     | LLMセレクタ      | LLM関連16個のJSDoc追加      |
| 3     | Agentセレクタ    | Agent関連25個のJSDoc追加    |
| 4     | 検証             | 品質チェックとテスト実行    |

### Phase 1: AuthModeセレクタ

#### 目的

認証モード関連のセレクタ12個にJSDocを追加

#### 手順

1. `useAuthMode`, `useSetAuthMode`, `useInitializeAuthMode` にJSDoc追加
2. `useIsSubscription`, `useIsApiKey` にJSDoc追加
3. API Key関連セレクタにJSDoc追加
4. Subscription関連セレクタにJSDoc追加

#### 成果物

AuthMode関連セレクタへのJSDoc追加完了

#### 完了条件

- [ ] 12個全てにJSDocが追加されている
- [ ] `@returns` が適切に記述されている

### Phase 2: LLMセレクタ

#### 目的

LLM関連のセレクタ16個にJSDocを追加

#### 手順

1. 選択状態セレクタ（`useSelectedLLMId`, `useSelectedLLM`）にJSDoc追加
2. 設定セレクタ（`useSetSelectedLLMId`, `useClearSelectedLLM`）にJSDoc追加
3. LLM一覧セレクタ（`useLLMList`, `useLLMById`）にJSDoc追加
4. 状態管理セレクタにJSDoc追加

#### 成果物

LLM関連セレクタへのJSDoc追加完了

#### 完了条件

- [ ] 16個全てにJSDocが追加されている
- [ ] 関連セレクタ間の関係性がコメントで説明されている

### Phase 3: Agentセレクタ

#### 目的

Agent関連のセレクタ25個にJSDocを追加

#### 手順

1. スキル選択セレクタにJSDoc追加
2. スキル一覧セレクタにJSDoc追加
3. 実行状態セレクタにJSDoc追加
4. 会話履歴セレクタにJSDoc追加

#### 成果物

Agent関連セレクタへのJSDoc追加完了

#### 完了条件

- [ ] 25個全てにJSDocが追加されている

### Phase 4: 検証

#### 目的

品質基準の充足確認

#### 手順

1. `pnpm typecheck` 実行
2. `pnpm lint` 実行
3. `pnpm --filter @repo/desktop test` 実行

#### 成果物

品質検証完了レポート

#### 完了条件

- [ ] 全品質チェックがPASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 53個全ての個別セレクタにJSDocが追加されている
- [ ] 各JSDocに `@returns` が含まれている
- [ ] 戻り値の型説明が正確である

### 品質要件

- [ ] TypeScript型チェックが通る
- [ ] ESLintエラーがない
- [ ] 全テストがPASS

### ドキュメント要件

- [ ] JSDocフォーマットが一貫している
- [ ] カテゴリ別のセクションコメントがある

---

## 6. 検証方法

### テストケース

| ケース | 検証内容                                    |
| ------ | ------------------------------------------- |
| TC-01  | IDEホバーでJSDocが表示される                |
| TC-02  | `@returns` の型がTypeScriptの推論と一致する |
| TC-03  | 全53セレクタにJSDocが存在する               |

### 検証手順

1. VSCodeで `store/index.ts` を開く
2. 各セレクタにホバーしてJSDocが表示されることを確認
3. `pnpm typecheck && pnpm lint && pnpm --filter @repo/desktop test` を実行

---

## 7. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                           |
| ------------------ | ------ | -------- | ------------------------------ |
| JSDoc構文エラー    | 低     | 低       | TypeScriptの型チェックで検出   |
| 型説明の不正確さ   | 中     | 中       | コードレビューで確認           |
| フォーマット不統一 | 低     | 中       | テンプレートを先に定義して適用 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                          | パス                                                                                     | 参照セクション                                              |
| ------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| UT-STORE-HOOKS-REFACTOR-001実装ガイド | `docs/30-workflows/UT-STORE-HOOKS-REFACTOR-001/outputs/phase-12/implementation-guide.md` | -                                                           |
| 状態管理仕様書                        | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`             | 「実装済み個別セレクタ一覧」セクション                      |
| P31説明                               | `.claude/rules/06-known-pitfalls.md#P31`                                                 | -                                                           |
| 設計パターン集                        | `.claude/skills/aiworkflow-requirements/references/patterns.md`                          | 「Zustand個別セレクタベース再設計パターン」命名規則テーブル |

### 参考資料

- [TypeScript JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 10最終レビュー改善提案:
「状態セレクタのJSDoc追加 - 優先度: 低」
個別セレクタにJSDocコメントを追加し、IDE補完と開発者体験を向上させることを推奨。
```

### 補足事項

- このタスクは緊急性が低いため、通常の改善サイクルで対応可能
- JSDoc追加は機能に影響しないため、リスクは最小限

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                 |
| ---------- | ---------- | -------------------------------------------------------- |
| 1.0.0      | 2026-02-11 | 初版作成                                                 |
| 1.1.0      | 2026-02-12 | テンプレート準拠形式に拡充                               |
| 1.2.0      | 2026-02-12 | 3.5 実装課題と解決策セクション追加、参照情報テーブル強化 |
