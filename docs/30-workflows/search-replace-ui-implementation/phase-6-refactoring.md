# Phase 6: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 6                     |
| 機能名 | 検索・置換機能 UI実装 |
| 作成日 | 2026-01-05            |

## 目的

動作を変えずにコード品質を改善する（テスト継続Green）。

## 使用スキル

| スキル               | パス                                           | 選定理由                     |
| -------------------- | ---------------------------------------------- | ---------------------------- |
| refactoring-patterns | `.claude/skills/refactoring-patterns/SKILL.md` | リファクタリングパターン適用 |
| clean-code-practices | `.claude/skills/clean-code-practices/SKILL.md` | 命名改善、関数分割、重複排除 |

## 参照資料

| 資料名        | パス                                    | 説明       |
| ------------- | --------------------------------------- | ---------- |
| Phase 5成果物 | `apps/desktop/src/features/search/`     | 実装コード |
| テスト仕様書  | `outputs/phase-4/test-specification.md` | テスト設計 |

## 実行手順

### ステップ1: コードスメル検出

refactoring-patternsスキルを参照し、以下のコードスメルをチェック:

**検出項目**

- [x] 長すぎる関数（20行以上）
- [x] 重複コード
- [ ] 複雑な条件分岐
- [x] マジックナンバー/マジックストリング
- [ ] 深いネスト（3階層以上）
- [ ] 不適切な命名

### ステップ2: リファクタリング実施

clean-code-practicesスキルを参照し、以下を改善:

**改善項目**

1. **関数抽出**: 長い関数を意味のある単位に分割
2. **命名改善**: 意図が明確な名前に変更
3. **重複排除**: 共通処理をユーティリティに抽出
4. **定数化**: マジックナンバーを定数に置き換え
5. **型安全性強化**: 型定義の整理

### ステップ3: コンポーネント構造の最適化

```
features/search/
├── components/           # UIコンポーネント
│   ├── SearchInput.tsx
│   ├── SearchOptions.tsx
│   ├── ReplaceInput.tsx
│   ├── SearchResults.tsx
│   └── WorkspaceResults.tsx
├── hooks/               # カスタムフック
│   ├── useSearchKeyboardShortcuts.ts
│   ├── useSearchDebounce.ts
│   └── useSearchHighlight.ts
├── stores/              # 状態管理
│   └── useSearchStore.ts
├── utils/               # ユーティリティ
│   ├── searchUtils.ts
│   └── highlightUtils.ts
├── types.ts             # 型定義
├── SearchPanel.tsx      # メインコンポーネント
├── WorkspaceSearchPanel.tsx
└── index.ts
```

### ステップ4: テスト継続確認

```bash
# ユニットテスト実行（すべてGreenであること）
pnpm --filter @repo/desktop test:run src/features/search/

# E2Eテスト実行（すべてGreenであること）
pnpm --filter @repo/desktop test:e2e tests/e2e/search.spec.ts
```

### ステップ5: リファクタリング記録

リファクタリング内容を記録:

| リファクタリング種別 | 対象              | 内容                       |
| -------------------- | ----------------- | -------------------------- |
| 関数抽出             | SearchPanel.tsx   | 検索実行ロジックを分離     |
| 命名改善             | useSearchStore.ts | アクション名をより明確に   |
| 重複排除             | SearchOptions     | 共通ボタンコンポーネント化 |

## 成果物

| 成果物               | パス                                 | 説明               |
| -------------------- | ------------------------------------ | ------------------ |
| リファクタリング記録 | `outputs/phase-6/refactoring-log.md` | 変更内容の記録     |
| 更新されたコード     | `apps/desktop/src/features/search/`  | 品質改善後のコード |

## 完了条件

- [x] コードスメルが検出・修正されている
- [x] 全テストが継続してGreen状態
- [x] 命名が適切
- [x] 重複が排除されている
- [x] コンポーネント構造が整理されている
- [x] リファクタリング記録が出力されている

## スキルフィードバック記録

| スキル               | 結果    | 備考                                                                    |
| -------------------- | ------- | ----------------------------------------------------------------------- |
| refactoring-patterns | success | Extract Component, Extract Function, Replace Magic Number with Constant |
| clean-code-practices | success | DRY原則適用、型定義統合                                                 |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. コードスメル検出
2. 関数抽出リファクタリング
3. 命名改善リファクタリング
4. 重複排除リファクタリング
5. テスト継続Green確認
6. リファクタリング記録出力
7. スキルフィードバック記録

## 次のPhase

Phase 7: 品質保証
