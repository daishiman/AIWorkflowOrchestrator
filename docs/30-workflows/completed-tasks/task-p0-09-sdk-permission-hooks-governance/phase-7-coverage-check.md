# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 7                                |
| 名称       | カバレッジ確認                   |
| タスクID   | TASK-P0-09                       |
| ステータス | 未実施                           |
| 依存       | Phase 6 完了                     |
| 完了条件   | カバレッジ目標を達成していること |

---

## 目的

Phase 5〜6 で実装・拡充したテストのカバレッジを測定し、目標値を達成していることを確認する。
未達の場合は Phase 6 へ戻ってテストを追加する。

---

## カバレッジ目標（変更対象ファイルのみ）

> **[Feedback BEFORE-QUIT-002 準拠]**: カバレッジ目標は変更したファイルを対象とし、
> 全体一律指定ではなく変更ブロック単位で実測する。

| ファイル                                          | Line Coverage | Branch Coverage | 備考                                                                                            |
| ------------------------------------------------- | ------------- | --------------- | ----------------------------------------------------------------------------------------------- |
| `SkillCreatorPermissionPolicy.ts`                 | 90%以上       | 80%以上         | policy テーブル評価ロジック全体                                                                 |
| `SkillCreatorHooksFactory.ts`                     | 90%以上       | 80%以上         | 全 4 lifecycle hooks                                                                            |
| `SkillCreatorAuditSink.ts`                        | 90%以上       | 80%以上         | ring buffer の境界値含む                                                                        |
| `RuntimeSkillCreatorFacade.ts`（governance 部分） | 80%以上       | 70%以上         | `createGovernanceHooks`, `getGovernanceState`, `createExecuteGovernanceCanUseTool` の各ブロック |

---

## 実行タスク

### T-07-1: カバレッジ計測の実行

```bash
# governance 対象ファイルのカバレッジ計測
pnpm --filter @repo/desktop test -- --run --coverage \
  --coverage.include="apps/desktop/src/main/services/runtime/governance/**" \
  --coverage.include="apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts"
```

**計測対象ブロック**（Feedback RT-03 準拠: 変更した関数/ブロックを明示）:

| 関数/ブロック                             | ファイル                          | カバレッジ目標         |
| ----------------------------------------- | --------------------------------- | ---------------------- |
| `getPolicy()`                             | `SkillCreatorPermissionPolicy.ts` | line 100%, branch 100% |
| `canUseTool()`                            | `SkillCreatorPermissionPolicy.ts` | line 90%, branch 80%   |
| `evaluateContextPolicy()`                 | `SkillCreatorPermissionPolicy.ts` | line 85%, branch 80%   |
| `getAllPolicies()`                        | `SkillCreatorPermissionPolicy.ts` | line 100%              |
| `createHooks()`                           | `SkillCreatorHooksFactory.ts`     | line 90%, branch 80%   |
| `onPreToolUse` handler                    | `SkillCreatorHooksFactory.ts`     | line 100%, branch 100% |
| `SkillCreatorAuditSink.record()`          | `SkillCreatorAuditSink.ts`        | line 100%, branch 100% |
| `SkillCreatorAuditSink.recordEvent()`     | `SkillCreatorAuditSink.ts`        | line 100%              |
| `SkillCreatorAuditSink.getDenialEvents()` | `SkillCreatorAuditSink.ts`        | line 100%, branch 80%  |
| `createGovernanceHooks()`                 | `RuntimeSkillCreatorFacade.ts`    | line 100%              |
| `getGovernanceState()`                    | `RuntimeSkillCreatorFacade.ts`    | line 90%               |
| `createExecuteGovernanceCanUseTool()`     | `RuntimeSkillCreatorFacade.ts`    | line 80%, branch 70%   |

**完了条件**:

- [ ] 計測が完了している
- [ ] 計測結果が `outputs/phase-7/coverage-report.md` に記録されている

---

### T-07-2: カバレッジ目標の達成確認

各ファイル・関数のカバレッジを確認し、目標値を達成しているかを判定する。

**判定**:

- ✅ PASS: 全ファイルで目標値を達成している
- ❌ FAIL: 未達のファイルがある → Phase 6 へ戻りテストを追加する

**特に重点確認**:

- `SkillCreatorAuditSink.record()` の ring buffer 境界（`this.events.length > this.maxEvents` の branch）
- `evaluateContextPolicy()` の `targetPath` / `allowedSkillRoot` 両方が存在する場合と不存在の場合
- `createExecuteGovernanceCanUseTool()` の allow/deny 両パス

**完了条件**:

- [ ] 全対象ファイルでカバレッジ目標を達成している
- [ ] 未達の場合は Phase 6 へ戻り追加テストを実施している

---

### T-07-3: カバレッジレポートの成果物化

```bash
# カバレッジレポートの出力
pnpm --filter @repo/desktop test -- --run --coverage --reporter=json \
  > outputs/phase-7/coverage-raw.json 2>/dev/null || true
```

**成果物に記録する内容**:

- 計測日時
- 各ファイルの Line / Branch / Function Coverage 実測値
- 目標値との差分（超過 or 不足）
- Phase 6 への差し戻し有無（PASS/FAIL）

**完了条件**:

- [ ] `outputs/phase-7/coverage-report.md` が作成されている
- [ ] 全項目が PASS 判定である

---

## 参照資料

- `phase-6-test-expansion.md`
- `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

---

## 成果物

| 成果物名           | パス                                 | 必須 |
| ------------------ | ------------------------------------ | ---- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | ✅   |

---

## 完了条件チェックリスト

- [ ] governance ファイルのカバレッジ計測が完了している
- [ ] `SkillCreatorPermissionPolicy.ts`: Line 90%以上 / Branch 80%以上
- [ ] `SkillCreatorHooksFactory.ts`: Line 90%以上 / Branch 80%以上
- [ ] `SkillCreatorAuditSink.ts`: Line 90%以上 / Branch 80%以上（ring buffer 境界値含む）
- [ ] `RuntimeSkillCreatorFacade.ts`（governance 部分）: Line 80%以上 / Branch 70%以上
- [ ] 全項目が PASS 判定（FAIL の場合は Phase 6 へ戻る）
- [ ] `outputs/phase-7/coverage-report.md` に実測値が記録されている
