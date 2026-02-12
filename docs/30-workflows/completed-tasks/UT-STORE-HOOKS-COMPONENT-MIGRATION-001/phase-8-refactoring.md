# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 8                                      |
| タスクID | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 |
| タスク名 | Store Hooks コンポーネント移行         |
| 機能名   | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 |
| 作成日   | 2026-02-12                             |

## 目的

動作を変えずにコード品質を改善し、Store Hooks移行後のコードをクリーンで保守しやすい状態に整理する。

## 実行タスク

- リファクタリング: コード構造の改善（重複排除、命名改善、構造整理）
- コードスメル検出: 問題のあるコードパターンの特定と修正
- SOLID原則適用: 設計原則に基づくコード改善
- 一貫性確保: Store Hooks使用パターンの統一

## 参照資料

| 資料名                     | パス                                       | 説明                      |
| -------------------------- | ------------------------------------------ | ------------------------- |
| Phase 7 カバレッジレポート | `outputs/phase-7/coverage-report.md`       | Phase 7成果物             |
| Phase 7 統合テスト結果     | `outputs/phase-7/integration-test.md`      | Phase 7成果物             |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`       | P31 Zustand無限ループ対策 |
| 状態管理ルール             | `.claude/rules/03-state-management.md`     | Zustand設計原則           |
| Store index.ts             | `apps/desktop/src/renderer/store/index.ts` | Store定義・セレクタ実装   |

## 実行手順

### ステップ1: コードスメル検出

移行後のコードを分析し、以下のパターンを検出・修正する:

```bash
# 未使用のimportを検出
pnpm --filter @repo/desktop lint -- --rule '@typescript-eslint/no-unused-vars: error'

# 残存する旧パターンを検出
grep -rn "useAuthModeStore()" apps/desktop/src/renderer/
grep -rn "useLLMStore()" apps/desktop/src/renderer/
grep -rn "useSkillStore()" apps/desktop/src/renderer/
```

検出対象のコードスメル:

| スメル種別           | 検出方法                      | 修正方針                   |
| -------------------- | ----------------------------- | -------------------------- |
| 未使用import         | ESLint `no-unused-vars`       | 削除                       |
| 重複セレクタ呼び出し | コードレビュー                | 共通化/メモ化              |
| 不適切な依存配列     | `useEffect`依存配列の静的解析 | P31対策パターン適用        |
| 型アサーション過多   | `as`キーワードのgrep          | 適切な型定義に置換         |
| コンポーネント肥大化 | 行数カウント（200行超）       | 責務分離/カスタムHooks抽出 |

### ステップ2: 命名改善

セレクタとアクションの命名規則を統一:

| カテゴリ           | 命名規則              | 例                                   |
| ------------------ | --------------------- | ------------------------------------ |
| 状態セレクタ       | `use{Domain}{State}`  | `useAuthMode`, `useAuthModeStatus`   |
| アクションセレクタ | `use{Action}{Domain}` | `useSetAuthMode`, `useFetchAuthMode` |
| ローディング状態   | `use{Domain}Loading`  | `useAuthModeLoading`                 |
| エラー状態         | `use{Domain}Error`    | `useAuthModeError`                   |
| 複合状態（非推奨） | `use{Domain}Store`    | 移行対象、使用しない                 |

### ステップ3: 重複排除

重複しているロジックを共通化:

1. **カスタムHooks抽出**

   複数コンポーネントで同じパターンが使用されている場合、カスタムHooksに抽出:

   ```typescript
   // 重複パターン例
   // SettingsView, AgentView などで同じ初期化ロジック

   // 抽出後: hooks/useAuthModeInit.ts
   export const useAuthModeInit = () => {
     const fetchMode = useFetchAuthMode();
     const initRef = useRef(false);

     useEffect(() => {
       if (!initRef.current) {
         initRef.current = true;
         fetchMode();
       }
     }, []);
   };
   ```

2. **エラーハンドリング共通化**

   エラー表示パターンを共通コンポーネントに抽出:

   ```typescript
   // 共通エラー表示コンポーネント
   // components/atoms/ErrorDisplay.tsx
   ```

### ステップ4: 構造整理

ファイル・ディレクトリ構造の改善:

```
apps/desktop/src/renderer/store/
├── index.ts                    # Store定義・エクスポート
├── slices/
│   ├── authModeSlice.ts       # 認証方式Slice
│   └── ...
├── selectors/                  # 【新規】専用セレクタディレクトリ
│   ├── authMode.ts            # 認証方式セレクタ群
│   ├── llm.ts                 # LLMセレクタ群
│   └── skill.ts               # スキルセレクタ群
└── hooks/                      # 【新規】ドメイン別カスタムHooks
    ├── useAuthModeInit.ts
    ├── useLLMInit.ts
    └── useSkillInit.ts
```

### ステップ5: SOLID原則適用

| 原則 | 適用箇所                      | 改善内容                                      |
| ---- | ----------------------------- | --------------------------------------------- |
| SRP  | 各セレクタ                    | 1セレクタ1責務（状態取得のみ/アクションのみ） |
| OCP  | Sliceインターフェース         | 拡張に開き、修正に閉じる                      |
| LSP  | -                             | 本タスクでは該当なし                          |
| ISP  | 合成Store Hook → 個別セレクタ | インターフェース分離                          |
| DIP  | -                             | 本タスクでは該当なし                          |

### ステップ6: リファクタリング後のテスト実行

```bash
# ユニットテスト
pnpm --filter @repo/desktop test

# 統合テスト
pnpm --filter @repo/desktop test:integration

# E2Eテスト（実行可能な場合）
pnpm --filter @repo/desktop test:e2e
```

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test:integration
```

| テスト種別        | 実行コマンド                                   | 期待結果     |
| ----------------- | ---------------------------------------------- | ------------ |
| ユニットテスト    | `pnpm --filter @repo/desktop test`             | 全テスト成功 |
| 統合テスト        | `pnpm --filter @repo/desktop test:integration` | 全テスト成功 |
| Store Hooksテスト | `pnpm --filter @repo/desktop test -- store`    | 全テスト成功 |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断 | 確認内容                               |
| -------------- | -------- | -------------------------------------- |
| 状態管理       | ✅ 適用  | Zustand設計原則との整合性              |
| セキュリティ   | ✅ 適用  | 認証情報がRendererに漏洩していないか   |
| パフォーマンス | ✅ 適用  | 不要な再レンダリングが発生していないか |
| 保守性         | ✅ 適用  | コードの可読性・拡張性                 |

## 成果物

| 成果物               | パス                                     | 説明                       |
| -------------------- | ---------------------------------------- | -------------------------- |
| リファクタリング結果 | `outputs/phase-8/refactoring-result.md`  | 改善内容と変更箇所の記録   |
| コード品質レポート   | `outputs/phase-8/code-quality-report.md` | コードスメル検出・修正結果 |

## 完了条件

- [ ] テストが継続成功
- [ ] コード品質が改善されている
- [ ] 重複が排除されている
- [ ] 命名規則が統一されている
- [ ] 合成Store Hook（`useAuthModeStore`, `useLLMStore`, `useSkillStore`）の使用箇所がゼロ
- [ ] 統合テストが継続成功
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. コードスメル検出と分析
2. 命名改善の実施
3. 重複排除（カスタムHooks抽出）
4. 構造整理（ディレクトリ再編成）
5. SOLID原則適用確認
6. リファクタリング後テスト実行
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 9: 品質保証
