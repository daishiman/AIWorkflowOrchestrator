# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 6                      |
| 機能名 | TASK-7A-skill-selector |
| 作成日 | 2026-01-30             |

## 目的

Phase 5 の実装に対してテストを拡充し、カバレッジ目標を達成する。

## 実行タスク

- カバレッジ分析: テストカバレッジの測定と不足領域の特定
- エッジケーステスト追加: 境界値・異常系テストの追加
- キーボードナビゲーション詳細テスト: 全キー操作の網羅テスト
- アクセシビリティ詳細テスト: ARIA属性の全パターン検証

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 結合テストカバレッジ基準

| 指標                         | 最低基準 |
| ---------------------------- | -------- |
| モジュール間インターフェース | 100%     |
| 正常系シナリオ               | 100%     |
| 異常系シナリオ               | 80%+     |

## 参照資料

| 資料名         | パス                                                                          | 説明          |
| -------------- | ----------------------------------------------------------------------------- | ------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`                                       | Phase 4成果物 |
| 実装コード     | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`                | Phase 5成果物 |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx` | Phase 4成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                                 |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------------------ |
| UI/UXデザインシステム  | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`   | デザイントークン・コンポーネント規約 |
| LLMセレクター仕様      | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`    | 既存セレクターUI仕様                 |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | skillSlice定義・Zustandパターン      |
| UIコンポーネント設計   | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`    | コンポーネント階層                   |

## 実行手順

### ステップ1: カバレッジ測定

```bash
pnpm --filter @repo/desktop test -- --coverage --run apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx
```

### ステップ2: ギャップ分析

- 未到達の行/分岐/関数を特定
- キーボードナビゲーションの未テスト分岐を特定
- エッジケースの不足を特定

### ステップ3: 追加テスト作成

**キーボード詳細テスト**:

| TC-ID  | テストケース名                             |
| ------ | ------------------------------------------ |
| TC-014 | Enter キーでドロップダウンが開く           |
| TC-015 | Space キーでドロップダウンが開く           |
| TC-016 | ArrowDown で次のオプションにフォーカス移動 |
| TC-017 | ArrowUp で前のオプションにフォーカス移動   |
| TC-018 | Home で最初のオプションにフォーカス移動    |
| TC-019 | End で最後のオプションにフォーカス移動     |
| TC-020 | Tab でドロップダウンが閉じる               |
| TC-021 | Enter でフォーカス中オプションが選択される |

**エッジケーステスト**:

| TC-ID  | テストケース名                                       |
| ------ | ---------------------------------------------------- |
| TC-022 | importedSkills が空の場合セクションヘッダーが非表示  |
| TC-023 | availableSkills が空の場合セクションヘッダーが非表示 |
| TC-024 | 全スキルがインポート済みの場合「利用可能」非表示     |
| TC-025 | isLoadingSkills が true の場合ローディング表示       |
| TC-026 | 連続クリックでドロップダウンが開閉する               |

**アクセシビリティ詳細テスト**:

| TC-ID  | テストケース名                                     |
| ------ | -------------------------------------------------- |
| TC-027 | aria-expanded が開閉に応じて true/false に変化する |
| TC-028 | aria-selected が選択状態に応じて設定される         |
| TC-029 | aria-activedescendant がフォーカス移動で更新される |
| TC-030 | role="option" が各オプションに設定されている       |

### ステップ4: カバレッジ再測定

```bash
pnpm --filter @repo/desktop test -- --coverage --run apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx
```

## 統合テスト連携【必須】

| テストカテゴリ     | 検証項目                                | 目標 |
| ------------------ | --------------------------------------- | ---- |
| Store連携テスト    | useAppStore 経由の全操作                | 100% |
| コンポーネント連携 | SkillOption / SkillOptionUnimported表示 | 100% |
| キーボード操作     | 全キーマッピング                        | 100% |

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

| 成果物             | パス                                                                          | 説明               |
| ------------------ | ----------------------------------------------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                                          | カバレッジ分析結果 |
| テストファイル     | `apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx` | 追加テストコード   |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] キーボードナビゲーション全キーのテストが追加されている
- [ ] エッジケーステストが追加されている
- [ ] アクセシビリティ詳細テストが追加されている
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. カバレッジ測定の実施
2. ギャップ分析の実施
3. キーボード詳細テスト追加
4. エッジケーステスト追加
5. アクセシビリティ詳細テスト追加
6. カバレッジ再測定の実施
7. 成果物の作成・配置
8. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7A-skill-selector --phase 6
```

## 次のPhase

Phase 7: テストカバレッジ確認
