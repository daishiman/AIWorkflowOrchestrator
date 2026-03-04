# Phase 7: カバレッジ確認

## メタ情報

| 項目      | 値                                    |
| --------- | ------------------------------------- |
| Phase     | 7                                     |
| 機能名    | TASK-10A-D スキルライフサイクルUI統合 |
| 作成日    | 2026-03-03                            |
| 状態      | 未着手                                |
| 前提Phase | Phase 6（テスト拡充）                 |

## 目的

Phase 5（実装）および Phase 6（テスト拡充）完了後の最終的なカバレッジを確認し、全指標が最低基準を満たしていることを検証する。基準未達の場合は Phase 6 に戻る。

## 実行タスク

- カバレッジ計測: 対象ファイルの Line/Branch/Function を計測する。
- 基準照合: 計測値を最低基準と推奨基準に照合する。
- 進行判定: 判定結果に基づき Phase 8 へ進むか Phase 6 へ戻すかを決定する。

## 参照資料

| 資料名               | パス                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| Phase 5 実装仕様     | `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/phase-5-implementation.md` |
| Phase 6 テスト拡充   | `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/phase-6-test-expansion.md` |
| 品質基準             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                             |
| テスト実装パターン   | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                       |
| アクセシビリティ試験 | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                            |

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 判定                        |
| ----------------- | -------- | -------- | --------------------------- |
| Line Coverage     | 80%      | 90%      | 最低基準未達 → Phase 6 戻り |
| Branch Coverage   | 60%      | 70%      | 最低基準未達 → Phase 6 戻り |
| Function Coverage | 80%      | 90%      | 最低基準未達 → Phase 6 戻り |

## 確認手順

### Step 1: カバレッジ計測の実行

以下のコマンドで TASK-10A-D の修正対象ファイルのカバレッジを計測する:

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/renderer/store/slices/agentSlice.ts \
  src/renderer/components/skill/SkillManagementPanel.tsx \
  src/renderer/components/chat/ChatPanel.tsx
```

### Step 2: 計測対象ファイル一覧

| #   | ファイル                                                              | 責務                                |
| --- | --------------------------------------------------------------------- | ----------------------------------- |
| 1   | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                | スキルライフサイクル状態管理        |
| 2   | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` | スキル管理パネルUI                  |
| 3   | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`             | チャットパネル + 管理パネルアクセス |

### Step 3: カバレッジ結果の記録

計測結果を以下のテーブル形式で記録する:

| ファイル                 | Line | Branch | Function | 最低基準達成 | 推奨基準達成 |
| ------------------------ | ---- | ------ | -------- | ------------ | ------------ |
| agentSlice.ts            | ?%   | ?%     | ?%       | ?            | ?            |
| SkillManagementPanel.tsx | ?%   | ?%     | ?%       | ?            | ?            |
| ChatPanel.tsx            | ?%   | ?%     | ?%       | ?            | ?            |

### Step 4: 判定

#### 合格判定（全項目 AND 条件）

以下の全条件を満たす場合、Phase 8 へ進む:

- agentSlice.ts: Line >= 80% AND Branch >= 60% AND Function >= 80%
- SkillManagementPanel.tsx: Line >= 80% AND Branch >= 60% AND Function >= 80%
- ChatPanel.tsx: Line >= 80% AND Branch >= 60% AND Function >= 80%

#### 不合格判定

いずれか1つでも最低基準未達の指標がある場合:

1. 未達のファイル・指標を Phase 6 のカバレッジ不足箇所として記録する
2. Phase 6 に戻り、不足箇所のテストを追加する
3. Phase 6 完了後に再度 Phase 7 を実施する

### Step 5: v8 カバレッジプロバイダの注意事項（P41 対策）

v8 カバレッジプロバイダはインライン arrow function を独立した関数としてカウントする。以下のパターンに注意:

- agentSlice 内のコールバック関数（`set((state) => ({ ... }))` のインラインアロー）
- SkillManagementPanel のイベントハンドラ内インラインアロー
- ChatPanel の `onClick` 内インラインアロー

Function Coverage が低い場合は、これらのインライン関数が未実行であることが原因の可能性がある。対処として:

1. インラインアロー関数が含まれるパスをテストでカバーする
2. コールバック内で使用される関数参照を明示的にテストで検証する

## 統合テスト連携

- カバレッジ計測は `cd apps/desktop && pnpm vitest run --coverage` で実行する（P40 対策: パッケージディレクトリから実行）
- カバレッジ結果は Phase 6 の追加テストを含む全テストの実行結果に基づく
- 既存テスト（TASK-10A-D 以前のテスト）が破損していないことも確認する

## 成果物

| 種類               | パス                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| カバレッジレポート | `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/outputs/phase-7/coverage-result.md` |

### カバレッジレポートの必須記載項目

1. 計測日時
2. 計測コマンド（実行したコマンド全文）
3. 対象ファイル別のカバレッジ結果テーブル
4. 判定結果（合格 / 不合格）
5. 不合格の場合: 未達指標の一覧と不足箇所の説明
6. 合格の場合: 推奨基準との差分（到達率）

## 完了条件

- [ ] 対象ファイル 3 本のカバレッジが計測されている
- [ ] 全ファイルの Line Coverage が 80% 以上である
- [ ] 全ファイルの Branch Coverage が 60% 以上である
- [ ] 全ファイルの Function Coverage が 80% 以上である
- [ ] カバレッジレポートが作成されている
- [ ] 既存テスト（TASK-10A-D 以前）にリグレッションがない
- [ ] 判定結果が「合格」であり、Phase 8 への進行が承認されている

## 次のPhase

### 合格の場合

Phase 8: リファクタリング → `phase-8-refactoring.md`

### 不合格の場合

Phase 6: テスト拡充 → `phase-6-test-expansion.md`（不足箇所を追加テストでカバーし、Phase 7 を再実施）
