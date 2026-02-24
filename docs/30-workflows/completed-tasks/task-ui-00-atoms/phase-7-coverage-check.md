# Phase 7: カバレッジ確認 — TASK-UI-00-ATOMS Atoms共通コンポーネント

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| Phase      | 7                                             |
| Phase名    | カバレッジ確認                                |
| タスクID   | TASK-UI-00-ATOMS                              |
| 作成日     | 2026-02-22                                    |
| 前提Phase  | Phase 6（テスト拡充完了）                     |
| 後続Phase  | Phase 8（リファクタリング）                   |
| ステータス | 未着手                                        |
| 依存タスク | TASK-UI-00-TOKENS（デザイントークン実装済み） |

## 目的

Phase 5-6 で実装・拡充した7コンポーネントのテストカバレッジを測定し、全コンポーネントがカバレッジ基準を満たしていることを確認する。基準未達のコンポーネントがある場合は、ギャップ分析を行い Phase 6 へのフィードバックを提供する。

## 背景

カバレッジ測定はテストの「量」ではなく「網羅性」を客観的に評価するために実施する。特に Branch Coverage（条件分岐のカバー率）は、エッジケースの見落としを検出する重要な指標である。全7コンポーネントで推奨基準（Line 90%+, Branch 70%+, Function 90%+）の達成を目標とする。

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### コンポーネント別カバレッジ目標

| コンポーネント   | Line目標 | Branch目標 | Function目標 | 備考                                |
| ---------------- | -------- | ---------- | ------------ | ----------------------------------- |
| StatusIndicator  | 90%+     | 70%+       | 90%+         | 6ステータス分岐あり                 |
| FilterChip       | 90%+     | 70%+       | 90%+         | disabled + onClick 分岐あり         |
| Badge            | 90%+     | 70%+       | 90%+         | variant 6種 + content/children 分岐 |
| SkeletonCard     | 90%+     | 70%+       | 90%+         | variant 3種 + animate 分岐          |
| SuggestionBubble | 90%+     | 70%+       | 90%+         | disabled + キーボード操作分岐       |
| EmptyState       | 90%+     | 70%+       | 90%+         | mood/compact/action型 分岐多数      |
| RelativeTime     | 90%+     | 70%+       | 90%+         | 時間閾値分岐 + format 3種           |

---

## 実行タスク

- 実行方針: 本Phaseで定義した Task セクションを上から順に100%実施する。

### Task 1: カバレッジ測定実行

**目的**: 7コンポーネントのカバレッジを個別に測定する

**実行コマンド**:

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/renderer/components/atoms/StatusIndicator/ \
  src/renderer/components/atoms/FilterChip/ \
  src/renderer/components/atoms/Badge/ \
  src/renderer/components/atoms/SkeletonCard/ \
  src/renderer/components/atoms/SuggestionBubble/ \
  src/renderer/components/atoms/EmptyState/ \
  src/renderer/components/atoms/RelativeTime/
```

**測定対象ファイル**:

| #   | コンポーネント   | 実装ファイル                                                            | テストファイル                                                                          |
| --- | ---------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | StatusIndicator  | `apps/desktop/src/renderer/components/atoms/StatusIndicator/index.tsx`  | `apps/desktop/src/renderer/components/atoms/StatusIndicator/StatusIndicator.test.tsx`   |
| 2   | FilterChip       | `apps/desktop/src/renderer/components/atoms/FilterChip/index.tsx`       | `apps/desktop/src/renderer/components/atoms/FilterChip/FilterChip.test.tsx`             |
| 3   | Badge            | `apps/desktop/src/renderer/components/atoms/Badge/index.tsx`            | `apps/desktop/src/renderer/components/atoms/Badge/Badge.test.tsx`                       |
| 4   | SkeletonCard     | `apps/desktop/src/renderer/components/atoms/SkeletonCard/index.tsx`     | `apps/desktop/src/renderer/components/atoms/SkeletonCard/SkeletonCard.test.tsx`         |
| 5   | SuggestionBubble | `apps/desktop/src/renderer/components/atoms/SuggestionBubble/index.tsx` | `apps/desktop/src/renderer/components/atoms/SuggestionBubble/SuggestionBubble.test.tsx` |
| 6   | EmptyState       | `apps/desktop/src/renderer/components/atoms/EmptyState/index.tsx`       | `apps/desktop/src/renderer/components/atoms/EmptyState/EmptyState.test.tsx`             |
| 7   | RelativeTime     | `apps/desktop/src/renderer/components/atoms/RelativeTime/index.tsx`     | `apps/desktop/src/renderer/components/atoms/RelativeTime/RelativeTime.test.tsx`         |

**出力**: カバレッジレポートの数値を `outputs/phase-7/coverage-report.md` に記録する

---

### Task 2: カバレッジギャップ分析

**目的**: 基準未達の場合に、未カバー行・分岐・関数を特定し原因を分析する

**実行手順**:

1. Task 1 のカバレッジレポートから、最低基準（Line 80%, Branch 60%, Function 80%）を下回るコンポーネントを抽出する
2. 各未達コンポーネントについて以下を分析する:

#### 2.1 Line Coverage ギャップ分析

| 分析項目                   | 確認方法                                                 |
| -------------------------- | -------------------------------------------------------- |
| 未カバー行の特定           | カバレッジレポートの Uncovered Lines を確認              |
| 未カバー行がエッジケースか | 条件分岐の else 節、エラーハンドリング、デフォルト値確認 |
| 未カバー行がデッドコードか | 到達不能なコードの有無を確認                             |

#### 2.2 Branch Coverage ギャップ分析

| 分析項目                 | 確認方法                                     |
| ------------------------ | -------------------------------------------- | --- | ----------------- |
| 未カバー分岐の特定       | `if/else`, `switch`, 三項演算子, `??`, `     |     | ` の分岐確認      |
| 未テストの条件組み合わせ | 複合条件（`&&`, `                            |     | `）の各パスを確認 |
| optional chaining の分岐 | `?.` の undefined パスが未テストでないか確認 |

#### 2.3 Function Coverage ギャップ分析

| 分析項目             | 確認方法                                                             |
| -------------------- | -------------------------------------------------------------------- |
| 未呼び出し関数の特定 | コンポーネント内のヘルパー関数、イベントハンドラー確認               |
| P41 対策             | インライン arrow function が独立関数としてカウントされていないか確認 |

**出力**: 分析結果を `outputs/phase-7/coverage-gap-analysis.md` に記録する

---

### Task 3: カバレッジ改善計画（基準未達時のみ実行）

**目的**: 基準未達コンポーネントのテスト追加方針を策定する

**実行条件**: Task 2 で最低基準（Line 80%, Branch 60%, Function 80%）を下回るコンポーネントが1つ以上ある場合のみ実行

**実行手順**:

1. 各未達コンポーネントについて、追加すべきテストケースを列挙する
2. テストケースの優先度を付ける（Branch > Line > Function の順で優先）
3. Phase 6 へフィードバックし、テストを追加する
4. テスト追加後に再度 Task 1 を実行し、基準達成を確認する

**判定基準**:

| 判定  | 条件                                  | アクション               |
| ----- | ------------------------------------- | ------------------------ |
| PASS  | 全7コンポーネントが最低基準を満たす   | Phase 8 へ進む           |
| RETRY | 1つ以上のコンポーネントが最低基準未達 | Phase 6 へ戻りテスト追加 |

---

## 参照資料

| 参照                         | パス                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------- | -------------- |
| Atoms仕様書                  | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md` |
| Phase 5 実装成果物           | `docs/30-workflows/completed-tasks/task-ui-00-atoms/phase-5-implementation.md`              |
| Phase 6 テスト拡充成果物     | `docs/30-workflows/completed-tasks/task-ui-00-atoms/phase-6-test-expansion.md`              |
| コンポーネントテストパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           |
| a11yテスト基準               | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                |
| カバレッジ基準               | `.claude/skills/task-specification-creator/references/coverage-standards.md`                |
| 品質要件                     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 |
| P41: v8インライン関数        | `.claude/rules/06-known-pitfalls.md#P41`                                                    |
| エッジケーステスト追加結果   | `outputs/phase-6/edge-case-tests.md`                                                        | Phase 6 成果物 |
| テーマ横断テスト結果         | `outputs/phase-6/theme-tests.md`                                                            | Phase 6 成果物 |
| アクセシビリティテスト結果   | `outputs/phase-6/accessibility-tests.md`                                                    | Phase 6 成果物 |

## 統合テスト連携

Phase 7 のカバレッジ測定は Phase 5-6 で作成した全テストを対象とする。カバレッジ改善でテストを追加した場合も、既存テスト（Badge 17件 + EmptyState 6件）が壊れないことを確認する。

## 成果物

| #   | 成果物                 | パス                                       |
| --- | ---------------------- | ------------------------------------------ |
| 1   | カバレッジレポート     | `outputs/phase-7/coverage-report.md`       |
| 2   | カバレッジギャップ分析 | `outputs/phase-7/coverage-gap-analysis.md` |

## 完了条件

- [ ] 全7コンポーネントのカバレッジ測定が完了している
- [ ] カバレッジレポート（`outputs/phase-7/coverage-report.md`）にコンポーネント別の Line/Branch/Function 数値が記録されている
- [ ] 全7コンポーネントが最低基準（Line 80%+, Branch 60%+, Function 80%+）を満たしている
- [ ] 基準未達のコンポーネントがある場合、ギャップ分析が完了し Phase 6 フィードバック済み
- [ ] P41（v8 インライン関数カウント）の影響を確認し、Function Coverage 低下の原因が v8 プロバイダ固有の問題でないか検証済み
- [ ] `cd apps/desktop && pnpm vitest run` で全テストがPASS

## Phase末端アクション【必須】

- [ ] 成果物ファイル（`outputs/phase-7/` 配下2ファイル）を作成
- [ ] `artifacts.json` の Phase 7 ステータスを `completed` に更新

## 依存関係

- **前提**: Phase 6（テスト拡充完了）
- **入力**: Phase 5-6 のテストファイル7個 + コンポーネント実装7個
- **出力**: カバレッジレポート + ギャップ分析
- **フィードバックループ**: 基準未達時は Phase 6 に戻る

## 次のPhase

Phase 8（リファクタリング）へ進む。Phase 8 では7コンポーネントのコード品質を分析し、共通パターンの抽出・重複コードの除去を行う。
