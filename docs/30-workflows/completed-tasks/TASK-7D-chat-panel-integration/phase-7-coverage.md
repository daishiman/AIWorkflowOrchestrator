# Phase 7: テストカバレッジ確認 - タスク仕様書

## メタ情報

| 項目      | 内容                           |
| --------- | ------------------------------ |
| Phase     | 7                              |
| Phase名   | テストカバレッジ確認           |
| カテゴリ  | 品質                           |
| 機能名    | TASK-7D-chat-panel-integration |
| 作成日    | 2026-01-30                     |
| 前提Phase | Phase 6                        |
| 後続Phase | Phase 8                        |

## 目的

Phase 6 までに作成されたテストのカバレッジを計測し、プロジェクト基準を満たしているか検証する。基準未達の場合は Phase 6 に戻り追加テストを作成する。

## 実行タスク

### タスク1: テストカバレッジ計測

**目的**: 実装ファイルに対するテストカバレッジを計測する。

**手順**:

1. 以下のコマンドでカバレッジを計測する:

```bash
pnpm --filter @repo/desktop vitest run --coverage apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx
pnpm --filter @repo/desktop vitest run --coverage apps/desktop/src/renderer/components/chat/ChatPanel.tsx
```

2. 計測対象ファイル:
   - `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`
   - `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`

3. カバレッジ結果を記録する

**期待される成果物**:

- カバレッジ計測結果レポート（`outputs/phase-7/coverage-report.md`）

### タスク2: カバレッジ基準判定

**目的**: カバレッジ結果がプロジェクト基準を満たしているか判定する。

**手順**:

1. 以下の基準と比較する:

| メトリクス        | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

2. 各ファイルの判定結果を記録する:

| ファイル               | Line | Branch | Function | 判定 |
| ---------------------- | ---- | ------ | -------- | ---- |
| SkillStreamingView.tsx | ?%   | ?%     | ?%       | ?    |
| ChatPanel.tsx          | ?%   | ?%     | ?%       | ?    |

3. 判定結果:
   - **PASS**: 全メトリクスが最低基準以上 → Phase 8 へ進む
   - **FAIL**: いずれかのメトリクスが基準未達 → Phase 6 に戻り追加テスト作成

**期待される成果物**:

- カバレッジ判定結果（`outputs/phase-7/coverage-decision.md`）

### タスク3: カバレッジ改善指針（FAIL 時のみ）

**目的**: カバレッジ基準未達の場合、改善が必要な箇所を特定する。

**手順**:

1. カバレッジレポートから未カバーの行・ブランチを特定する
2. 未カバー箇所に対応するテストケースを列挙する
3. Phase 6 に戻る際の具体的な追加テスト内容を記載する

**期待される成果物**:

- カバレッジ改善指針書（`outputs/phase-7/coverage-improvement.md`）（FAIL 時のみ）

## 参照資料

| 参照資料               | パス                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------- |
| テストカバレッジ基準   | `.claude/skills/task-specification-creator/references/coverage-standards.md`       |
| Phase 6 テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx` |
| Phase 6 テストファイル | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`           |

## 統合テスト連携

### このフェーズで確認すべき統合テスト観点

| カテゴリ           | 確認項目                                                       |
| ------------------ | -------------------------------------------------------------- |
| カバレッジ網羅性   | コンポーネント間連携パスが全てテストされているか               |
| ブランチカバレッジ | 条件分岐（isExecuting && selectedSkillName）が網羅されているか |

## 多角的観点チェック

### Renderer（フロントエンド）層

| 観点             | 確認項目                                                           |
| ---------------- | ------------------------------------------------------------------ |
| カバレッジ網羅性 | 全コンポーネントの Line/Branch/Function が基準を満たしているか     |
| 未カバー分析     | 未テストのブランチがビジネスロジック上重要でないか確認されているか |

## 成果物

| 成果物             | パス                                      | 種別     |
| ------------------ | ----------------------------------------- | -------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`      | document |
| カバレッジ判定結果 | `outputs/phase-7/coverage-decision.md`    | document |
| カバレッジ改善指針 | `outputs/phase-7/coverage-improvement.md` | document |

## 完了条件

- [ ] 全対象ファイルのカバレッジが計測されている
- [ ] Line Coverage が 80% 以上である
- [ ] Branch Coverage が 60% 以上である
- [ ] Function Coverage が 80% 以上である
- [ ] カバレッジ判定結果（PASS/FAIL）が記録されている
- [ ] FAIL の場合、改善指針が具体的に記載されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: テストカバレッジ計測
3. タスク2: カバレッジ基準判定
4. タスク3: カバレッジ改善指針（FAIL 時のみ）
5. 統合テスト連携の実施
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-7D-chat-panel-integration --phase 7
```

## 次のPhase

Phase 8: リファクタリング → [phase-8-refactoring.md](phase-8-refactoring.md)
