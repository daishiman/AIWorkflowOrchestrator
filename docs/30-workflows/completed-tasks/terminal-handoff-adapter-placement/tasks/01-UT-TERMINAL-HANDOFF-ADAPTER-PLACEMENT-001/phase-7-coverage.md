# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| 機能名   | terminal-handoff-adapter-placement        |
| Phase    | 7 - カバレッジ確認                        |
| 作成日   | 2026-03-22                                |
| 前Phase  | Phase 6（テスト拡充）                     |
| 次Phase  | Phase 8（リファクタリング）               |
| タスクID | UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001 |

## 目的

Phase 4-6 で作成・拡充したテストが、プロジェクトのカバレッジ基準を満たしていることを定量的に確認する。未達の場合は Phase 6 に差し戻し、テストを追加する。

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 判定 |
| ----------------- | -------- | -------- | ---- |
| Line Coverage     | 90%      | 95%      | -    |
| Branch Coverage   | 60%      | 70%      | -    |
| Function Coverage | 90%      | 95%      | -    |

## 実行手順

### Task 1: カバレッジ測定

1. 以下のコマンドでカバレッジを測定する:

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/handoff/__tests__/ --coverage
```

2. 測定対象ファイル:
   - `apps/desktop/src/main/adapters/handoff/toHandoffGuidance.ts`
   - `apps/desktop/src/main/adapters/handoff/index.ts`（存在する場合）

3. テストファイル:
   - `apps/desktop/src/main/adapters/handoff/__tests__/toHandoffGuidance.test.ts`

### Task 2: カバレッジ結果の記録

測定結果を以下の形式で `outputs/phase-7/coverage-report.md` に記録する:

```markdown
# カバレッジレポート

## 測定日時

YYYY-MM-DD HH:MM

## 測定対象

- toHandoffGuidance.ts

## 結果

| ファイル             | Line    | Branch  | Function |
| -------------------- | ------- | ------- | -------- |
| toHandoffGuidance.ts | \_\_\_% | \_\_\_% | \_\_\_%  |
| 合計                 | \_\_\_% | \_\_\_% | \_\_\_%  |

## 判定

- [ ] Line Coverage >= 90%
- [ ] Branch Coverage >= 60%
- [ ] Function Coverage >= 90%

## 結論

PASS / FAIL（Phase 6 差し戻し）
```

### Task 3: 未カバー箇所の分析（未達の場合）

カバレッジ基準未達の場合、以下を分析する:

1. **未カバー行の特定**: カバレッジレポートから未テスト行を列挙
2. **未カバー分岐の特定**: 未通過の条件分岐を列挙
3. **未カバー関数の特定**: 未呼出しの関数を列挙
4. **テスト追加計画**: Phase 6 で追加すべきテストケースを具体的に記載

### Task 4: 統合テスト連携確認

1. adapters/handoff/ 配下のテストが単体で全 PASS することを確認:

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/handoff/__tests__/toHandoffGuidance.test.ts
```

2. 既存の TerminalHandoffBuilder 関連テストとの共存を確認:

```bash
cd apps/desktop && pnpm vitest run --reporter=verbose 2>&1 | grep -i "handoff"
```

3. 統合テスト連携の確認項目:
   - [ ] toHandoffGuidance のテストが単独で PASS
   - [ ] 既存 TerminalHandoffBuilder テストが影響を受けていない
   - [ ] import パスの整合性が保たれている

## 判定フロー

```
カバレッジ測定
  ├── 全基準達成 → Phase 8 へ
  └── 基準未達 → 未カバー箇所分析 → Phase 6 へ差し戻し
```

## 成果物

| 成果物             | パス                                 |
| ------------------ | ------------------------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                   | 仕様参照先                                          |
| -------------- | -------------------------- | --------------------------------------------------- |
| アーキテクチャ | カバレッジ計測対象が正しい | `aiworkflow-requirements: architecture-overview.md` |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                             | 仕様参照先                                          |
| -------------------- | ------------------------------------ | --------------------------------------------------- |
| バックエンド（Main） | adapter カバレッジは Main Process 層 | `aiworkflow-requirements: architecture-overview.md` |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. カバレッジ測定の実行
3. 基準達成の判定
4. 未達の場合のPhase 6差し戻し判断
5. カバレッジレポートの作成
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/terminal-handoff-adapter-placement --phase 7
```

## 完了条件

- [ ] カバレッジ測定コマンドが正常に実行完了した
- [ ] Line Coverage が 90% 以上を達成した
- [ ] Branch Coverage が 60% 以上を達成した
- [ ] Function Coverage が 90% 以上を達成した
- [ ] カバレッジレポートが `outputs/phase-7/coverage-report.md` に記録された
- [ ] 統合テスト連携確認が全項目 PASS した
- [ ] 既存 TerminalHandoffBuilder テストに影響がないことを確認した
- [ ] 未達の場合は Phase 6 差し戻し理由が明記された

## 次Phase

Phase 8: リファクタリング（`phase-8-refactoring.md`）
