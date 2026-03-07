# Store mockテストパターン標準化ガード - タスク指示書

## メタ情報

```yaml
issue_number: 1040
```

## メタ情報

| 項目         | 内容                                              |
| ------------ | ------------------------------------------------- |
| タスクID     | UT-10A-F-STORE-MOCK-PATTERN-STANDARDIZATION-GUARD |
| タスク名     | Store mockテストパターン標準化ガード              |
| 分類         | 改善                                              |
| 対象機能     | テスト基盤（Store個別セレクタmock）               |
| 優先度       | 中                                                |
| 見積もり規模 | 小規模                                            |
| ステータス   | 未実施                                            |
| 発見元       | Phase 12（TASK-10A-F 苦戦箇所）                   |
| 発見日       | 2026-03-07                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-F の実装中、テスト変数名のタイポ（`mockCreateSkillSkill` vs `mockCreateSkill`）により11テストが `ReferenceError` で一斉失敗した。また、Store個別セレクタのmockパターンが State用（値返却）と Action用（関数返却）で異なるため、テストファイル間で不統一が発生しやすい。

### 1.2 問題点・課題

1. **変数名タイポ検出の遅れ**: `vi.mock` 内の変数定義とテスト本文の参照が不一致でも、TypeScriptの型チェックでは検出できない（vi.mock のファクトリ関数はスコープが分離されるため）
2. **mockパターン不統一**: テストファイルごとにmockの書き方が異なり、保守性が低下
3. **新規テスト作成時の混乱**: どのパターンが正しいか判断基準がない

### 1.3 放置した場合の影響

- Store移行が進むにつれ、同種のタイポ/不統一によるテスト失敗が繰り返される
- 新規開発者がStore mockの正しい書き方を見つけられず、開発速度が低下
- テスト追加のたびに既存テストとの不整合が発生

---

## 2. 何を達成するか（What）

### 2.1 目的

Store個別セレクタの標準mockパターンを共通テストユーティリティとして提供し、タイポや不統一を機械的に防止する。

### 2.2 最終ゴール

- Store mockの標準ヘルパー関数が `__tests__/helpers/` に配置されている
- 既存テストファイルが標準ヘルパーを使用している
- ESLint カスタムルールまたはテストユーティリティで不統一を検出可能

### 2.3 スコープ

#### 含むもの

- Store mock 標準ヘルパー関数の作成（`createStoreMock(overrides)`）
- 既存テスト3ファイルの標準ヘルパー移行（SkillCreateWizard/SkillAnalysisView/store-integration x2）
- 開発者向けドキュメント（テストガイド）

#### 含まないもの

- 全コンポーネントテストの一括移行（段階的に実施）
- ESLint カスタムルールの作成（将来検討）
- テストフレームワーク自体の変更

### 2.4 成果物

- `__tests__/helpers/store-mock.ts` - Store mock標準ヘルパー
- 更新済みテストファイル3件
- テストガイドドキュメント

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-10A-F の S26 パターン（architecture-implementation-patterns.md）が参照可能

### 3.2 依存タスク

| タスクID   | 内容                          | ステータス |
| ---------- | ----------------------------- | ---------- |
| TASK-10A-F | Store移行（mockパターン確立） | 完了       |

### 3.3 必要な知識

- Vitest の `vi.mock` ファクトリ関数のスコープルール
- Zustand Store 個別セレクタの設計（P31）
- TypeScript ジェネリクス（型安全なmockヘルパー設計）

### 3.4 推奨アプローチ

```typescript
// __tests__/helpers/store-mock.ts
type StoreMockOverrides = {
  // State selectors
  useCurrentAnalysis?: SkillAnalysis | null;
  useIsAnalyzingSkill?: boolean;
  useIsImprovingSkill?: boolean;
  useSkillError?: string | null;
  // Action selectors
  useAnalyzeSkill?: ReturnType<typeof vi.fn>;
  useApplySkillImprovements?: ReturnType<typeof vi.fn>;
  useAutoImproveSkill?: ReturnType<typeof vi.fn>;
  useCreateSkill?: ReturnType<typeof vi.fn>;
};

export function createStoreMock(overrides: Partial<StoreMockOverrides> = {}) {
  return {
    useCurrentAnalysis: () => overrides.useCurrentAnalysis ?? null,
    useIsAnalyzingSkill: () => overrides.useIsAnalyzingSkill ?? false,
    // ... State用は値返却、Action用は関数返却
  };
}
```

---

## 4. 実行手順

### Phase構成

小規模タスクのため Phase 4-5-9-12 の4フェーズ構成。

### Phase 4-5: テスト作成→実装

#### 目的

Store mock標準ヘルパーを作成し、既存テストを移行

#### 手順

1. `__tests__/helpers/store-mock.ts` を作成
2. `createStoreMock()` 関数を実装（State用:値返却 / Action用:関数返却）
3. SkillCreateWizard.test.tsx を標準ヘルパーに移行
4. SkillAnalysisView.test.tsx を標準ヘルパーに移行
5. store-integration テスト2件を標準ヘルパーに移行

#### 成果物

- `__tests__/helpers/store-mock.ts`
- 更新済みテスト3-4件

#### 完了条件

- 全テスト PASS
- mock変数名タイポが型チェックで検出可能

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `createStoreMock()` ヘルパーが型安全に動作
- [ ] 既存テスト3件以上が標準ヘルパーを使用
- [ ] State用/Action用の区別が明確

### 品質要件

- [ ] テスト全PASS
- [ ] TypeScript型チェック PASS
- [ ] any型使用0件

### ドキュメント要件

- [ ] テストガイドに標準mockパターンを記載
- [ ] lessons-learned.md に教訓追記

---

## 6. 検証方法

### テストケース

- `createStoreMock()` のデフォルト値テスト
- overridesでState値を変更するテスト
- overridesでAction関数を差し替えるテスト

### 検証手順

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/
```

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                                |
| ---------------------------- | ------ | -------- | ----------------------------------- |
| ヘルパー関数の型定義が複雑化 | 中     | 中       | 必要最小限の型定義に留める（YAGNI） |
| 既存テストとの互換性問題     | 中     | 低       | 段階的移行（1ファイルずつ）         |

---

## 8. 参照情報

### 関連ドキュメント

- `architecture-implementation-patterns.md` - S26（Store mockテスト標準パターン）
- `lessons-learned.md` - TASK-10A-F 苦戦箇所#5（テスト変数名タイポ）
- `06-known-pitfalls.md` - P9（テスト間状態リーク）、P39（happy-dom userEvent非互換）

### 参考資料

- TASK-10A-F テスト成果物: `SkillCreateWizard.test.tsx`, `SkillAnalysisView.test.tsx`

---

## 9. 備考

### TASK-10A-F からの教訓（苦戦箇所）

- `mockCreateSkillSkill` タイポで11テスト一斉失敗。vi.mockファクトリ関数のスコープ分離によりTypeScript型チェックでは検出不可
- State用セレクタ（値返却）とAction用セレクタ（関数返却）でmockパターンが異なるため、テストファイル間で不統一が発生しやすい
- `beforeEach` での `mockReset()` 漏れによるテスト間状態リーク（P9再発）

### 補足事項

- 本タスクは「予防的改善」であり、現時点で機能障害は発生していない
- Store移行が進むにつれ、標準ヘルパーの重要性が増す
