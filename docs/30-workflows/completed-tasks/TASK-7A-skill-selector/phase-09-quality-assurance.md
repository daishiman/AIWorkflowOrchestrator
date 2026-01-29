# Phase 9: 品質保証

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 9                      |
| 機能名 | TASK-7A-skill-selector |
| 作成日 | 2026-01-30             |

## 目的

定義された品質基準をすべて満たすことを検証する。

## 品質ゲート

| 品質項目           | 確認内容                                              | 結果       |
| ------------------ | ----------------------------------------------------- | ---------- |
| 機能検証           | 全自動テスト成功                                      | {{RESULT}} |
| コード品質         | ESLint エラー 0件                                     | {{RESULT}} |
| 型安全性           | TypeScript型チェッククリア                            | {{RESULT}} |
| テスト網羅性       | Line 80%+, Branch 60%+, Function 80%+                 | {{RESULT}} |
| アクセシビリティ   | ARIA属性・キーボードナビゲーション実装                | {{RESULT}} |
| スタイリング       | Prettier フォーマット準拠                             | {{RESULT}} |
| セキュリティ       | XSS脆弱性なし、Renderer Processのみで完結             | {{RESULT}} |
| パフォーマンス     | useCallback/useMemo適切使用、不要な再レンダリングなし | {{RESULT}} |
| エラーハンドリング | rescanSkills失敗時のエラー表示が実装されている        | {{RESULT}} |

## 実行手順

### ステップ1: 全自動テスト実行

```bash
pnpm --filter @repo/desktop test -- --run apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx
```

### ステップ2: Lint チェック

```bash
pnpm --filter @repo/desktop lint
```

### ステップ3: 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

### ステップ4: フォーマットチェック

```bash
pnpm prettier --check "apps/desktop/src/renderer/components/skill/**/*"
```

### ステップ5: カバレッジ最終確認

```bash
pnpm --filter @repo/desktop test -- --coverage --run apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx
```

### ステップ6: セキュリティ検証

- Renderer Process のみで完結し、Main Process / IPC への直接依存がないことを確認
- スキル名・説明文の表示でXSS脆弱性がないことを確認
- `window.electronAPI` の直接使用がないことを確認

## 統合テスト連携【必須】

品質保証で統合テスト結果を確認:

| 品質項目         | 確認内容             | 結果       |
| ---------------- | -------------------- | ---------- |
| 機能検証         | 全自動テスト成功     | {{RESULT}} |
| コード品質       | ESLint クリア        | {{RESULT}} |
| 型安全性         | TypeScript クリア    | {{RESULT}} |
| アクセシビリティ | ARIA属性テスト全通過 | {{RESULT}} |

## 参照資料

| 資料名             | パス                                 | 説明          |
| ------------------ | ------------------------------------ | ------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | Phase 7成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                                 |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------------------ |
| UI/UXデザインシステム  | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`   | デザイントークン・コンポーネント規約 |
| LLMセレクター仕様      | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`    | 既存セレクターUI仕様                 |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | skillSlice定義・Zustandパターン      |
| UIコンポーネント設計   | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`    | コンポーネント階層                   |

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

| 成果物       | パス                                | 説明         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質検証結果 |

## 完了条件

- [ ] 全品質ゲートをクリア
- [ ] ESLint エラー 0件
- [ ] TypeScript 型エラー 0件
- [ ] Prettier フォーマット準拠
- [ ] テストカバレッジ基準達成
- [ ] アクセシビリティテスト全通過
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 全自動テスト実行
2. Lint チェック
3. 型チェック
4. フォーマットチェック
5. カバレッジ最終確認
6. 品質レポート作成
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7A-skill-selector --phase 9
```

## 次のPhase

Phase 10: 最終レビューゲート
