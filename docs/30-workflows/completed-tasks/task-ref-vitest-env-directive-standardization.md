# Vitest環境ディレクティブ標準化 - タスク指示書

## メタ情報

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | task-ref-vitest-env-directive-001                                          |
| タスク名     | Vitest環境ディレクティブ標準化（Store Hooksセレクタテスト）                |
| 分類         | リファクタリング                                                           |
| 対象機能     | Store Hooksセレクタテスト（authModeSlice / llmSlice）                      |
| 優先度       | 低                                                                         |
| 見積もり規模 | 小規模                                                                     |
| ステータス   | 未実施                                                                     |
| 発見元       | UT-STORE-HOOKS-TEST-REFACTOR-001 Phase 11（手動テスト スコープ外発見事項） |
| 発見日       | 2026-02-12                                                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-STORE-HOOKS-TEST-REFACTOR-001（agentSliceテストのrenderHookパターン移行）のPhase 11手動テストにおいて、3つのSliceセレクタテストファイル間でVitest環境ディレクティブの有無に差異があることが判明した。

agentSlice.selectors.test.tsはファイル先頭に `@vitest-environment happy-dom` ディレクティブとlocalStorageポリフィルを含んでいるが、authModeSlice.selectors.test.tsとllmSlice.selectors.test.tsにはこれらが欠落している。

### 1.2 問題点・課題

| 問題                   | 詳細                                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 実行方法依存の動作差異 | `cd apps/desktop && npx vitest run ...` ではPASSするが、`npx vitest run apps/desktop/...`（プロジェクトルートから実行）ではFAILする |
| 原因                   | vitest.config.tsのhappy-dom環境設定がルートから実行時に適用されず、localStorageが未定義になる                                       |
| 影響範囲               | authModeSlice.selectors.test.ts（49テスト）、llmSlice.selectors.test.ts（45テスト）の計94テスト                                     |
| 一貫性の欠如           | 同一ディレクトリ内の3ファイルで設定方式が異なり、新規テスト作成時に混乱を招く                                                       |

### 1.3 放置した場合の影響

- CI/CDパイプラインでのテスト実行パスがプロジェクトルートの場合、94テストが不明確に失敗する
- 新規開発者がテスト実行方法で混乱し、デバッグに不要な時間を費やす
- 将来のモノレポ構成変更（vitest.config.ts統合等）時にリグレッションが発生する

---

## 2. 何を達成するか（What）

### 2.1 目的

3つのSliceセレクタテストファイルのVitest環境ディレクティブを統一し、実行方法に依存しない安定したテスト環境を確立する。

### 2.2 最終ゴール

- 3ファイル全てに `@vitest-environment happy-dom` ディレクティブが存在する
- プロジェクトルートからの実行（`npx vitest run apps/desktop/...`）でも全208テストがPASSする
- localStorageポリフィルが必要な場合は全ファイルに含まれている

### 2.3 スコープ

#### 含むもの

- `authModeSlice.selectors.test.ts` への `@vitest-environment happy-dom` ディレクティブ追加
- `llmSlice.selectors.test.ts` への `@vitest-environment happy-dom` ディレクティブ追加
- localStorageポリフィルの必要性確認と追加（必要な場合）
- 全208テストのPASS確認

#### 含まないもの

- vitest.config.tsの変更
- テストロジックの変更
- agentSlice.selectors.test.ts（既にディレクティブあり）の変更
- セレクタテスト以外のテストファイルへの変更

### 2.4 成果物

| 成果物                      | パス                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------- |
| 修正済みauthModeSliceテスト | `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.selectors.test.ts` |
| 修正済みllmSliceテスト      | `apps/desktop/src/renderer/store/slices/__tests__/llmSlice.selectors.test.ts`      |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-STORE-HOOKS-TEST-REFACTOR-001が完了していること
- pnpm installが完了していること

### 3.2 依存タスク

| タスクID                         | タスク名                                | ステータス |
| -------------------------------- | --------------------------------------- | ---------- |
| UT-STORE-HOOKS-TEST-REFACTOR-001 | Store HooksテストrenderHookパターン移行 | 完了       |

### 3.3 必要な知識

- Vitest環境ディレクティブ（`@vitest-environment`）の仕組み
- happy-domの特性とlocalStorageポリフィルの必要性
- 参照: [testing-component-patterns.md#9](../../.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md) - Zustand Store Hooksテストパターン

### 3.4 推奨アプローチ

agentSlice.selectors.test.tsのファイル先頭パターンをそのまま適用する:

```typescript
// @vitest-environment happy-dom

// happy-dom環境でのlocalStorageポリフィル
if (typeof localStorage === "undefined") {
  const store: Record<string, string> = {};
  (globalThis as Record<string, unknown>).localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
}
```

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                              | 発見経緯                                                          | 解決策                                                               | 教訓                                                         |
| ------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------ |
| happy-dom環境ではlocalStorageが未定義の場合がある | UT-STORE-HOOKS-TEST-REFACTOR-001 Phase 5でcreateテスト失敗        | ファイル先頭でポリフィル追加                                         | テスト環境の前提条件を明示的に設定すること                   |
| electronAPIモックは3セクション全体が必要          | UT-STORE-HOOKS-TEST-REFACTOR-001 Phase 5でuseAppStore初期化エラー | createMockElectronAPI()で全3セクション（authMode+llm+skill）をモック | Zustand統合ストアの初期化には全SliceのAPIモックが必要        |
| 実行パスによるvitest.config適用差異               | UT-STORE-HOOKS-TEST-REFACTOR-001 Phase 11でルート実行テスト       | ファイルレベルディレクティブで環境を明示指定                         | configに依存せず、ファイル単体で完結するテスト設計が望ましい |

---

## 4. 実行手順

### Phase構成

小規模タスクのため、Phase 4-5-9の最小構成で実行。

### Phase 4: テスト作成（Red）

#### 目的

ディレクティブ追加前に、現状の問題を再現するテスト実行を行う。

#### 手順

1. プロジェクトルートから `npx vitest run apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.selectors.test.ts` を実行し、FAILすることを確認
2. 同様に `llmSlice.selectors.test.ts` でFAILを確認
3. 問題の再現を記録

#### 成果物

問題再現の記録

#### 完了条件

- ルートからの実行でFAILが再現される

### Phase 5: 実装（Green）

#### 目的

2ファイルにVitest環境ディレクティブとlocalStorageポリフィルを追加する。

#### 手順

1. `authModeSlice.selectors.test.ts` のファイル先頭（import文の前）に `// @vitest-environment happy-dom` コメントを追加
2. localStorageポリフィルブロックを追加（agentSlice.selectors.test.tsと同一コード）
3. `llmSlice.selectors.test.ts` にも同様の変更を適用
4. `cd apps/desktop && npx vitest run src/renderer/store/slices/__tests__/` で全3ファイル208テストがPASSすることを確認
5. プロジェクトルートから `npx vitest run apps/desktop/src/renderer/store/slices/__tests__/` で全208テストがPASSすることを確認

#### 成果物

修正済み2ファイル

#### 完了条件

- 全208テストがPASS（ルート実行・ディレクトリ実行の両方）

### Phase 9: 品質検証

#### 目的

Lint・型チェック・全テスト実行で品質を確認する。

#### 手順

1. `pnpm --filter @repo/desktop lint` でLintエラーなしを確認
2. `pnpm --filter @repo/desktop typecheck` で型エラーなしを確認
3. 関連テスト全体を実行してリグレッションなしを確認

#### 成果物

品質検証結果

#### 完了条件

- Lint: 0 errors
- TypeCheck: 0 errors（タスクスコープ内）
- 全テスト: PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] authModeSlice.selectors.test.tsに `@vitest-environment happy-dom` ディレクティブが存在する
- [ ] llmSlice.selectors.test.tsに `@vitest-environment happy-dom` ディレクティブが存在する
- [ ] localStorageポリフィルが全3ファイルで統一されている
- [ ] プロジェクトルートからの実行で全208テストがPASSする
- [ ] `cd apps/desktop` からの実行で全208テストがPASSする

### 品質要件

- [ ] ESLintエラー: 0件
- [ ] TypeScriptエラー: 0件（タスクスコープ内）
- [ ] テストロジックに変更がないこと

### ドキュメント要件

- [ ] Phase 12実装ガイド作成（テスト環境標準化の説明）
- [ ] documentation-changelog.md作成

---

## 6. 検証方法

### テストケース

| #   | テストケース                                                                                                             | 期待結果                         |
| --- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| 1   | `cd apps/desktop && npx vitest run src/renderer/store/slices/__tests__/`                                                 | 3 files passed, 208 tests passed |
| 2   | プロジェクトルートから `npx vitest run apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.selectors.test.ts` | 49 tests passed                  |
| 3   | プロジェクトルートから `npx vitest run apps/desktop/src/renderer/store/slices/__tests__/llmSlice.selectors.test.ts`      | 45 tests passed                  |
| 4   | プロジェクトルートから `npx vitest run apps/desktop/src/renderer/store/slices/__tests__/agentSlice.selectors.test.ts`    | 114 tests passed                 |

### 検証手順

1. 上記4つのテストケースを順次実行
2. 全てPASSすることを確認
3. `pnpm --filter @repo/desktop lint` でLintエラーなしを確認
4. `pnpm --filter @repo/desktop typecheck` で型エラーなしを確認

---

## 7. リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                                                               |
| ---------------------------------------- | ------ | -------- | ------------------------------------------------------------------ |
| localStorageポリフィルが既存テストと競合 | 中     | 低       | `typeof localStorage === "undefined"` の条件ガードで既存環境を保護 |
| ディレクティブ追加で他テストに影響       | 低     | 低       | ファイルレベルディレクティブはそのファイルのみに適用（Vitest仕様） |
| happy-dom環境でのelectronAPIモック不整合 | 中     | 低       | createMockElectronAPI()パターンが3ファイルで統一済み（P9対策）     |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント           | パス                                                               | 関連セクション                               |
| ---------------------- | ------------------------------------------------------------------ | -------------------------------------------- |
| テストパターン         | `aiworkflow-requirements/references/testing-component-patterns.md` | 9. Zustand Store Hooksテストパターン         |
| 開発ガイドライン       | `aiworkflow-requirements/references/development-guidelines.md`     | Zustand Hookテスト戦略（renderHookパターン） |
| 状態管理アーキテクチャ | `aiworkflow-requirements/references/arch-state-management.md`      | Store Hooksテスト実装ガイド                  |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                               | P9（テスト間状態リーク）、P31（無限ループ）  |

### 参考資料

| 資料                                       | 参照先                                                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| agentSlice実装例                           | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.selectors.test.ts` 1-17行        |
| Phase 11手動テスト結果                     | `docs/30-workflows/UT-STORE-HOOKS-TEST-REFACTOR-001/outputs/phase-11/manual-test-result.md`   |
| UT-STORE-HOOKS-TEST-REFACTOR-001実装ガイド | `docs/30-workflows/UT-STORE-HOOKS-TEST-REFACTOR-001/outputs/phase-12/implementation-guide.md` |

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 11手動テスト結果（UT-STORE-HOOKS-TEST-REFACTOR-001）より:

「環境依存に関する注意事項」セクション:
authModeSlice.selectors.test.tsとllmSlice.selectors.test.tsは、
happy-dom環境指定ディレクティブ（@vitest-environment happy-dom）が
ファイルレベルで記載されていない。

注記: agentSlice.selectors.test.tsはファイル内に @vitest-environment happy-dom
ディレクティブとlocalStorageポリフィルが含まれているため、
どちらの方法でもPASS。この差異はauthModeSlice/llmSliceの既存の仕様であり、
今回のタスクスコープ外。
```

### 補足事項

- このタスクはプロダクションコードに変更を加えない（テストファイルのみ）
- 変更量は各ファイル10-15行の追加のみ
- agentSlice.selectors.test.tsの実装パターンをそのまま適用するため、設計リスクは極めて低い
