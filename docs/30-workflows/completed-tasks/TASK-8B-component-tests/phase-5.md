# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 5                            |
| タスク | TASK-8B コンポーネントテスト |
| 機能名 | skill-import-agent-system    |
| 作成日 | 2026-02-01                   |

## 目的

Phase 4で作成した55のテストケースを全てGreen（成功）状態にする。既存コンポーネントの実装が正しければそのまま成功するが、テストとコンポーネントの不整合がある場合はテスト側またはコンポーネント側を調整する。

## 実行タスク

- テスト実行・結果分析: 全55テストを実行し、失敗ケースを特定
- テスト調整: テストコードのセレクタ・期待値をコンポーネント実装に合わせる
- コンポーネント修正: テスト要件を満たすためのコンポーネント軽微修正（a11y属性追加等）
- 全テスト成功確認: 55テスト全てがGreen状態であることを確認

## 参照資料

| 資料名                 | パス                                                                | 説明          |
| ---------------------- | ------------------------------------------------------------------- | ------------- |
| テスト仕様書           | `outputs/phase-4/test-specification.md`                             | Phase 4成果物 |
| テストケース一覧       | `outputs/phase-4/test-cases.md`                                     | Phase 4成果物 |
| SkillSelector実装      | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`      | テスト対象    |
| SkillImportDialog実装  | `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`  | テスト対象    |
| PermissionDialog実装   | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`   | テスト対象    |
| SkillStreamingView実装 | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx` | テスト対象    |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                           | 内容                               |
| ---------------- | ------------------------------------------------------------------------------ | ---------------------------------- |
| UIコンポーネント | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`      | 実装パターン、テスト品質メトリクス |
| デザイン原則     | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | WCAG 2.1 AA基準、キーボード操作    |

## 実行手順

### ステップ1: 全テスト実行

```bash
# 全コンポーネントテスト実行
pnpm --filter @repo/desktop test -- --run src/renderer/components/skill/__tests__/
```

### ステップ2: 失敗テストの分析

失敗したテストケースを以下の分類で分析する:

| 失敗原因カテゴリ        | 対応方法                                             |
| ----------------------- | ---------------------------------------------------- |
| セレクタ不一致          | テスト側のセレクタを実装に合わせて修正               |
| テキスト不一致          | テスト側の期待テキストを実装に合わせて修正           |
| ARIA属性不足            | コンポーネント側にARIA属性を追加                     |
| Store接続パターン不一致 | モック方法をコンポーネントの実際の使用方法に合わせる |
| 非同期タイミング問題    | `waitFor`の追加、タイムアウト調整                    |

### ステップ3: テスト・コンポーネント調整

**調整の優先順位**:

1. **テスト側の調整**（優先）: セレクタ、期待値、モック設定の修正
2. **コンポーネント側の修正**（必要時のみ）: ARIA属性追加、テスト容易性の改善
   - ⚠️ コンポーネントの機能変更は行わない（テスト通過のための最小限の変更のみ）

### ステップ4: 全テスト成功確認

```bash
# 再実行で全テスト成功を確認
pnpm --filter @repo/desktop test -- --run src/renderer/components/skill/__tests__/

# 期待出力: Tests: 55 passed, 55 total
```

## 統合テスト連携【必須】

| 実装項目           | 内容                                                      |
| ------------------ | --------------------------------------------------------- |
| Store接続          | `vi.mock`によるStore完全モック（実際のStore呼び出しなし） |
| エラーハンドリング | インポート失敗時の`mockRejectedValue`パターン             |
| 状態同期           | `rerender` による状態変更シミュレーション                 |

## アーキテクチャ層別実装（Renderer Process）

| 層               | 実装観点                                     | 実装ファイル配置                                        |
| ---------------- | -------------------------------------------- | ------------------------------------------------------- |
| Renderer Process | テストコード調整、コンポーネントARIA属性追加 | `apps/desktop/src/renderer/components/skill/`           |
| Renderer Process | テストファイル修正                           | `apps/desktop/src/renderer/components/skill/__tests__/` |

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断                          | 確認項目                                 |
| ---------------- | --------------------------------- | ---------------------------------------- |
| UI/UX            | テスト調整でUI検証維持 → **適用** | テスト修正がUI仕様の検証を維持しているか |
| アクセシビリティ | a11yテストの品質 → **適用**       | WCAG基準のテストが維持されているか       |
| セキュリティ     | テストコードのみ → **適用外**     | -                                        |
| パフォーマンス   | テスト実行速度 → **限定的適用**   | テスト実行時間が10秒以内か               |

### Electronデスクトップアプリ観点

| 観点                       | 適用判断                          | 確認項目                                               |
| -------------------------- | --------------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UIコンポーネントテスト → **適用** | Renderer Process内のテスト・コンポーネント調整が適切か |
| バックエンド（Main）       | テスト対象外 → **適用外**         | -                                                      |
| IPC通信                    | Storeレベルでモック → **適用外**  | -                                                      |
| Preload/セキュリティ       | テスト対象外 → **適用外**         | -                                                      |
| ローカルストレージ         | テスト対象外 → **適用外**         | -                                                      |

## 成果物

| 成果物             | パス                                                              | 説明                          |
| ------------------ | ----------------------------------------------------------------- | ----------------------------- |
| テスト結果レポート | `outputs/phase-5/test-results.md`                                 | 55テスト実行結果              |
| 調整ログ           | `outputs/phase-5/adjustment-log.md`                               | テスト/コンポーネント調整内容 |
| テストファイル     | `apps/desktop/src/renderer/components/skill/__tests__/*.test.tsx` | 修正済みテストコード          |

## 完了条件

- [ ] 55テスト全てがGreen（成功）状態
- [ ] テスト結果レポートに全テストの合否が記載されている
- [ ] 調整内容が調整ログに記録されている
- [ ] コンポーネントへの変更は最小限（ARIA属性追加等）に留まっている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run src/renderer/components/skill/__tests__/

# 確認項目
# - [ ] テストが全て成功することを確認（Green状態）
# - [ ] Tests: 55 passed, 55 total（または既存テスト含む合計）
```

## サブタスク管理

1. 全テスト実行と結果分析
2. SkillSelector.test.tsx の調整（失敗ケースのみ）
3. SkillImportDialog.test.tsx の調整（失敗ケースのみ）
4. PermissionDialog.test.tsx の調整（失敗ケースのみ）
5. SkillStreamingView.test.tsx の調整（失敗ケースのみ）
6. コンポーネント側修正（必要な場合のみ）
7. 全テスト再実行と成功確認
8. 成果物の作成・配置

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/TASK-8B-component-tests --phase 5
```

## 次のPhase

Phase 6: テスト拡充
