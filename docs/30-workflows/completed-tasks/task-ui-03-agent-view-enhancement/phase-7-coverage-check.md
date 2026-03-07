# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 7                      |
| 機能名 | agent-view-enhancement |
| 作成日 | 2026-03-07             |

## 目的

Phase 6 で拡充したテスト結果を検証し、カバレッジ基準を満たすことを確認する。基準未達の場合は Phase 6 に戻ってテストを追加する。

## 実行タスク

- カバレッジ再測定: 全対象ファイルのテストカバレッジを再計測
- 基準判定: カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）との照合
- 未達時の対応: 基準未達の場合は Phase 6 に戻りテスト追加

## 参照資料

| 資料名                     | パス                                                                                                     | 説明                     |
| -------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 5 実装仕様書         | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/phase-5-implementation.md`          | 依存Phase 5の仕様        |
| Phase 6 テスト拡充         | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/phase-6-test-expansion.md`          | 追加テストケース定義     |
| Phase 6 カバレッジレポート | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-6/coverage-report.md` | Phase 6 のカバレッジ結果 |
| UIコンポーネント仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                  | UIコンポーネント設計仕様 |
| 機能コンポーネント仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                          | 機能コンポーネント仕様   |
| UIアーキテクチャ仕様       | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                | UIアーキテクチャ設計     |
| 状態管理仕様               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                             | Zustand状態管理設計      |
| テスト戦略仕様             | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                        | コンポーネントテスト方針 |

## 依存Phase成果物参照

依存の正本は `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/requirements-traceability-matrix.md` の「依存関係トレース」を参照する。

## 実行手順

### ステップ1: カバレッジ再測定

```bash
# コンポーネントテストのカバレッジ（P40対策: 対象パッケージのディレクトリから実行）
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/organisms/AgentView/

# レイアウトテストのカバレッジ
cd apps/desktop && pnpm vitest run --coverage src/renderer/views/AgentView/

# agentSlice テストのカバレッジ
cd apps/desktop && pnpm vitest run --coverage src/renderer/store/slices/agentSlice.ts
```

### ステップ2: ファイル別カバレッジ確認

以下の各ファイルについてカバレッジを確認する:

| 対象ファイル                                                                         | Line | Branch | Function | 判定 |
| ------------------------------------------------------------------------------------ | ---- | ------ | -------- | ---- |
| `apps/desktop/src/renderer/components/organisms/AgentView/SkillChip.tsx`             | ?%   | ?%     | ?%       | -    |
| `apps/desktop/src/renderer/components/organisms/AgentView/ExecuteButton.tsx`         | ?%   | ?%     | ?%       | -    |
| `apps/desktop/src/renderer/components/organisms/AgentView/FloatingExecutionBar.tsx`  | ?%   | ?%     | ?%       | -    |
| `apps/desktop/src/renderer/components/organisms/AgentView/AdvancedSettingsPanel.tsx` | ?%   | ?%     | ?%       | -    |
| `apps/desktop/src/renderer/components/organisms/AgentView/RecentExecutionList.tsx`   | ?%   | ?%     | ?%       | -    |
| `apps/desktop/src/renderer/views/AgentView/index.tsx`                                | ?%   | ?%     | ?%       | -    |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`（拡張部分）                   | ?%   | ?%     | ?%       | -    |

### ステップ3: カバレッジ基準判定

#### ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 実測値 | 判定 |
| ----------------- | -------- | -------- | ------ | ---- |
| Line Coverage     | 80%      | 90%      | ?%     | -    |
| Branch Coverage   | 60%      | 70%      | ?%     | -    |
| Function Coverage | 80%      | 90%      | ?%     | -    |

#### 判定ルール

| 判定  | 条件                         | 対応                     |
| ----- | ---------------------------- | ------------------------ |
| PASS  | 全指標が最低基準以上         | Phase 8 へ進行           |
| RETRY | いずれかの指標が最低基準未満 | Phase 6 に戻りテスト追加 |

### ステップ4: 未達時の対応（Phase 6 へ戻る場合）

カバレッジが未達の場合、以下の手順で Phase 6 に戻る:

1. 未到達行/分岐/関数をリストアップ
2. Phase 6 のテスト追加手順に従い、不足テストを作成
3. 再度 Phase 7 のステップ1からカバレッジ再測定を実施
4. 基準を満たすまで繰り返す

### ステップ5: 全テスト実行確認

カバレッジ基準を満たした上で、全テストが PASS であることを最終確認する。

```bash
# 全テスト実行
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/AgentView/__tests__/
cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/__tests__/

# 型チェック
pnpm --filter @repo/desktop typecheck

# リント
pnpm --filter @repo/desktop lint
```

## 統合テスト連携

統合テストの再実行とゲート判定:

| 判定項目                   | 基準 | 実測値 | 判定 |
| -------------------------- | ---- | ------ | ---- |
| ユニットテスト Line        | 80%+ | ?%     | -    |
| ユニットテスト Branch      | 60%+ | ?%     | -    |
| ユニットテスト Function    | 80%+ | ?%     | -    |
| コンポーネント間連携テスト | 100% | ?%     | -    |
| 状態管理連携テスト         | 100% | ?%     | -    |
| IPC 連携テスト（モック）   | 100% | ?%     | -    |

## 多角的チェック観点

| 観点             | 適用判断                       | チェック内容                                     |
| ---------------- | ------------------------------ | ------------------------------------------------ |
| UI/UX            | フロントエンドテストのため適用 | 全コンポーネントの表示状態テストが網羅されている |
| アクセシビリティ | UIテストのため適用             | ARIA属性・キーボード操作テストのカバレッジ確認   |
| 状態管理         | Zustand テストのため適用       | agentSlice 拡張部分のカバレッジ確認              |

### Electron デスクトップアプリ観点

| 層                         | チェック内容                                     |
| -------------------------- | ------------------------------------------------ |
| フロントエンド（Renderer） | 全コンポーネントのカバレッジが基準を満たしている |

## 成果物

| 成果物             | パス                                                                                                     | 説明             |
| ------------------ | -------------------------------------------------------------------------------------------------------- | ---------------- |
| カバレッジレポート | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-7/coverage-report.md` | 再測定結果・判定 |

## 完了条件

- [ ] 全対象ファイルのカバレッジが測定されている
- [ ] Line Coverage が 80% 以上
- [ ] Branch Coverage が 60% 以上
- [ ] Function Coverage が 80% 以上
- [ ] コンポーネント間連携テストが全て PASS
- [ ] 状態管理連携テストが全て PASS
- [ ] 全テストが PASS（Red なし）
- [ ] `pnpm --filter @repo/desktop typecheck` が通る
- [ ] `pnpm --filter @repo/desktop lint` が通る
- [ ] カバレッジレポートが `outputs/phase-7/coverage-report.md` に出力されている
- [ ] カバレッジ未達の場合は Phase 6 に戻りテスト追加済み
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. カバレッジ再測定（全対象ファイル）
2. ファイル別カバレッジ確認
3. カバレッジ基準判定（Line/Branch/Function）
4. 未達時の対応（該当する場合: Phase 6 に戻り → 再測定）
5. 全テスト実行確認
6. カバレッジレポート作成
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement --phase 7
```

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）
