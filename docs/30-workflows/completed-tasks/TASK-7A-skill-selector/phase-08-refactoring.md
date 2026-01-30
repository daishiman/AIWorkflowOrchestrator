# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 8                      |
| 機能名 | TASK-7A-skill-selector |
| 作成日 | 2026-01-30             |

## 目的

動作を変えずにコード品質を改善する。

## 実行タスク

- コード重複排除: SkillOption / SkillOptionUnimported の共通ロジック抽出
- 命名改善: 変数・関数名の明確化
- 構造整理: コンポーネント内部構造の最適化
- カスタムHook抽出: 3箇所以上で同一ロジックが使われている場合にHookを抽出

## 参照資料

| 資料名        | パス                                                           | 説明          |
| ------------- | -------------------------------------------------------------- | ------------- |
| 実装コード    | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx` | Phase 5成果物 |
| ModelSelector | `apps/desktop/src/renderer/components/llm/ModelSelector.tsx`   | パターン参考  |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                                 |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------------------ |
| UI/UXデザインシステム  | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`   | デザイントークン・コンポーネント規約 |
| LLMセレクター仕様      | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`    | 既存セレクターUI仕様                 |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | skillSlice定義・Zustandパターン      |
| UIコンポーネント設計   | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`    | コンポーネント階層                   |

## 実行手順

### ステップ1: コードスメル検出

以下の観点でコードを分析:

| 観点                | 確認内容                                       |
| ------------------- | ---------------------------------------------- |
| 重複コード          | SkillOption / SkillOptionUnimported の共通部分 |
| 長い関数            | handleKeyDown の可読性                         |
| マジックストリング  | ARIA値・テキストのハードコード                 |
| 責務の分離          | コンポーネントの責務が単一か                   |
| useCallback/useMemo | 不要な再レンダリングの防止                     |

### ステップ2: リファクタリング実施

- 不要な再レンダリング防止（useCallback / useMemo 適切使用）
- Tailwind クラスの整理（長すぎるクラス文字列の分割）
- コメントの追加・整理（JSDoc準拠）
- ModelSelector との一貫性確認

### ステップ3: リファクタリング後のテスト実行

```bash
pnpm --filter @repo/desktop test -- --run apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx
```

## 統合テスト連携【必須】

リファクタ後の全テスト継続成功を確認:

```bash
pnpm --filter @repo/desktop test -- --run apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx
```

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                               | 仕様参照先                                   |
| ------------------ | -------------------------------------- | -------------------------------------------- |
| セキュリティ       | スキル名・説明文の表示時XSS防止        | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装のため適用           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | Renderer Process内完結の確認           | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | rescanSkills失敗時の表示・空リスト対応 | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 不要な再レンダリング防止               | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | WAI-ARIA Listboxパターン準拠           | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断               | 仕様参照先                            |
| -------------------------- | ---------------------- | ------------------------------------- |
| フロントエンド（Renderer） | UI/React実装のため適用 | `aiworkflow-requirements: ui-ux-*.md` |

## 成果物

| 成果物               | パス                                 | 説明           |
| -------------------- | ------------------------------------ | -------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | 改善内容の記録 |

## 完了条件

- [ ] テストが継続成功している
- [ ] ESLintエラー0件・TypeScript型エラー0件
- [ ] 重複コードが排除されている
- [ ] 変数・関数名がその役割を明確に表している
- [ ] useCallback/useMemoが適切に使用されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. コードスメル検出の実施
2. リファクタリングの実施
3. テスト継続成功の確認
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7A-skill-selector --phase 8
```

## 次のPhase

Phase 9: 品質保証
