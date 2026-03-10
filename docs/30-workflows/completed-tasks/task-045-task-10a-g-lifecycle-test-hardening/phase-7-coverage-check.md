# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| Phase      | 7                                   |
| タスクID   | TASK-10A-G                          |
| 機能名     | task-10a-g-lifecycle-test-hardening |
| 作成日     | 2026-03-10                          |
| 前提Phase  | Phase 6 完了                        |
| 次Phase    | Phase 8                             |
| 差し戻し先 | Phase 6                             |

## 目的

Phase 6 の追加テストを含め、coverage 基準の充足を最終確認する。G1 は `skill:create` に対する handler-scope coverage を主判定とし、G2/G3 は targeted suite と file coverage を組み合わせて判定する。`skillHandlers.ts` 全体 coverage を TASK-10A-G 全体の達成値として誤読しないことを明記する。

## 実行タスク

- Task 1: coverage を最終測定する
- Task 2: 基準充足を判定する
- Task 3: 未達時の差し戻し情報を記録する
- Task 4: 最終レポートを保存する

### Task 1: 最終測定

```bash
cd apps/desktop && pnpm vitest run --coverage --reporter=verbose \
  src/main/ipc/__tests__/skillHandlers.create.test.ts \
  src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx

cd apps/desktop && pnpm exec tsx scripts/coverage-by-handler.ts \
  --file src/main/ipc/skillHandlers.ts \
  --target skill:create \
  --coverage coverage/coverage-final.json
```

### Task 2: 基準判定

| 対象 | 主判定                                              | 補助判定                          | 合格基準                                   |
| ---- | --------------------------------------------------- | --------------------------------- | ------------------------------------------ |
| G1   | `skill:create` handler-scope coverage               | `skillHandlers.ts` 参考値         | Line >= 80 / Branch >= 60 / Function >= 80 |
| G2   | `SkillLifecycle.integration.test.tsx` 対象 coverage | 関連 file coverage                | Line >= 80 / Branch >= 60 / Function >= 80 |
| G3   | `ChatPanel.skill-management.test.tsx` 対象 coverage | `ChatPanel.tsx` 該当導線 coverage | Line >= 80 / Branch >= 60 / Function >= 80 |

| 判定 | 条件                              | 次アクション       |
| ---- | --------------------------------- | ------------------ |
| PASS | G1/G2/G3 の主判定がすべて基準以上 | Phase 8 へ進む     |
| FAIL | 1つでも未達                       | Phase 6 へ差し戻し |

### Task 3: 未達時の対応

差し戻し時は以下を記録する。

1. 未達対象
2. 未カバー箇所
3. handler-scope か file-scope か
4. 追加テスト候補

#### 差し戻しテンプレート

```markdown
## Phase 7 → Phase 6 差し戻し記録

### 未達対象

- G1/G2/G3:

### 未カバー箇所

| 対象           | 行番号 | 種別   | 内容                |
| -------------- | ------ | ------ | ------------------- |
| `skill:create` | Lx     | Branch | sender invalid path |

### 追加テスト候補

| テストID | 対象 | 内容                           |
| -------- | ---- | ------------------------------ |
| ADD-01   | G1   | sender invalid callback window |
```

### Task 4: レポート保存

```bash
mkdir -p outputs/phase-7

cd apps/desktop && pnpm vitest run --coverage --reporter=verbose \
  src/main/ipc/__tests__/skillHandlers.create.test.ts \
  src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx \
  2>&1 | tee ../../outputs/phase-7/coverage-final-report.md

cd apps/desktop && pnpm exec tsx scripts/coverage-by-handler.ts \
  --file src/main/ipc/skillHandlers.ts \
  --target skill:create \
  --coverage coverage/coverage-final.json \
  | tee -a ../../outputs/phase-7/coverage-final-report.md
```

## 参照資料

| 参照資料               | パス                                                                        | 使用目的                    |
| ---------------------- | --------------------------------------------------------------------------- | --------------------------- |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | coverage 基準               |
| タスク運用台帳         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        | gate 判定基準               |
| 教訓                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | handler-scope coverage 教訓 |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                        | P41 参照                    |
| Phase 6                | `phase-6-test-expansion.md`                                                 | 差し戻し参照                |
| Phase 5 Green レポート | `outputs/phase-5/g1-g2-g3-green-report.md`                                  | coverage 判定の前提実装     |

## 成果物

| 成果物                | パス                                       | 説明                  |
| --------------------- | ------------------------------------------ | --------------------- |
| coverage 最終レポート | `outputs/phase-7/coverage-final-report.md` | suite / file coverage |
| 判定記録              | `outputs/phase-7/gate-decision.md`         | PASS / FAIL と根拠    |

## 既知の落とし穴チェックリスト

- [ ] P40: `cd apps/desktop &&` で実行した
- [ ] P41: v8 coverage の見かけ上の低下を誤読していない
- [ ] feature 全体 coverage と handler-scope coverage を混同していない
- [ ] レポート保存後に判定記録を作成した

## 統合テスト連携

| SubAgent | 主判定                  | 補助判定      |
| -------- | ----------------------- | ------------- |
| G1       | handler-scope coverage  | file coverage |
| G2       | targeted suite coverage | file coverage |
| G3       | targeted suite coverage | file coverage |

## 完了条件

- [ ] G1 handler-scope coverage が基準以上
- [ ] G2/G3 の coverage が基準以上
- [ ] coverage レポートが保存されている
- [ ] 未達時は差し戻し記録がある
- [ ] coverage の scope を誤読しない記録になっている

## 次Phase

- 基準充足時: Phase 8
- 基準未達時: Phase 6
