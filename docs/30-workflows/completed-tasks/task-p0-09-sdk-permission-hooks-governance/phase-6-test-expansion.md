# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 6                                          |
| 名称       | テスト拡充                                 |
| タスクID   | TASK-P0-09                                 |
| ステータス | 未実施                                     |
| 依存       | Phase 5 完了                               |
| 完了条件   | 追加テストが全て PASS し、カバレッジが向上 |

---

## 目的

Phase 4 で定義した基本テストに加え、fail path・edge case・回帰ガードのテストを追加する。
特に `SkillCreatorAuditSink` の branch coverage を向上させる。

---

## 実行タスク

### T-06-1: fail path テストの追加

**追加テストケース一覧**:

| TC-ID     | テスト名                                                                             | 検証内容                                                             |
| --------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| TC-PP-E01 | canUseTool: allowedTools が空の場合は全ツールを許可する                              | allowedTools が空配列の場合、allowedTools チェックをスキップ         |
| TC-PP-E02 | canUseTool: context が渡された場合に evaluateContextPolicy が呼ばれる                | context 引数付きで canUseTool を呼ぶと、context 依存判定が実行される |
| TC-PP-E03 | evaluateContextPolicy: execute phase で targetPath が allowedSkillRoot 外なら denied | `targetPath: "/outside"`, `allowedSkillRoot: "/skill"` → denied      |
| TC-PP-E04 | evaluateContextPolicy: improve phase で targetPath が allowedSkillRoot 外なら denied | improve phase でも同様                                               |
| TC-PP-E05 | evaluateContextPolicy: context.targetPath が undefined の場合は基本判定に委ねる      | targetPath なしの場合は null を返す                                  |
| TC-AS-E01 | record: maxEvents=1 で 2 件目を追加すると最初のイベントが消える                      | 最小 ring buffer のテスト                                            |
| TC-AS-E02 | getEventsBySession: 存在しない sessionId で空配列を返す                              | フィルタリング結果が空の場合                                         |
| TC-AS-E03 | getDenialEvents: decision がない（onSessionStart 等）イベントは除外される            | session_start イベントは denial リストに含まれない                   |
| TC-FG-E01 | execute(): llmAdapter が未注入でも onSessionEnd が呼ばれる                           | エラーパスでも audit が記録される                                    |
| TC-FG-E02 | improve(): 失敗時に onSessionEnd が呼ばれる                                          | エラーパスでも audit が記録される                                    |
| TC-FG-E03 | verifyAndImproveLoop: improve phase での audit イベントが記録される                  | ループ内の governance 記録の確認                                     |

**完了条件**:

- [ ] TC-PP-E01〜TC-PP-E05 が全て実装・PASS している
- [ ] TC-AS-E01〜TC-AS-E03 が全て実装・PASS している
- [ ] TC-FG-E01〜TC-FG-E03 が全て実装・PASS している

---

### T-06-2: ring buffer の境界値テスト強化

```bash
# SkillCreatorAuditSink の branch coverage 確認
pnpm --filter @repo/desktop test -- --grep "SkillCreatorAuditSink" --run --coverage
```

**追加確認テスト**:

- maxEvents=500（デフォルト）で 501 件追加後の size === 500 検証
- 空の sink での getRecentEvents(10) の動作

**完了条件**:

- [ ] ring buffer の全 branch が網羅されている
- [ ] `SkillCreatorAuditSink` の branch coverage が 70% 以上（Phase 7 で 80% 達成が目標）

---

### T-06-3: 回帰ガードテストの追加

**意図**: Phase 8 のリファクタリング後にも同じ動作が保証されること。

```typescript
// 回帰ガードの観点
// 1. policy テーブルが変更されても、全 phase で DESTRUCTIVE_TOOLS が拒否されること
// 2. hooks の lifecycle 順序（onSessionStart → onPreToolUse → onPostToolUse → onSessionEnd）が守られること
// 3. audit sink の ring buffer が破壊されないこと
```

**追加テスト**:

- [ ] TC-RG-01: POLICY_TABLE の freeze により実行時改変が不可能なこと（readonly チェック）
- [ ] TC-RG-02: createHooks の返り値が新しいオブジェクト（参照ではない）であること

**完了条件**:

- [ ] 回帰ガードテストが追加・PASS している

---

### T-06-4: 全テスト実行確認

```bash
# governance 関連全テスト実行
pnpm --filter @repo/desktop test -- --grep "governance|SkillCreatorPermission|SkillCreatorHooks|SkillCreatorAudit" --run

# 型チェック・lint 再確認
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

**完了条件**:

- [ ] 全テスト（Phase 4 + Phase 6 追加分）が PASS している
- [ ] typecheck / lint がエラーなし

---

## 参照資料

- `phase-5-implementation.md`
- `.claude/skills/aiworkflow-requirements/references/governance-hooks-factory-audit-sink.md`
- `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md`

---

## 成果物

| 成果物名                   | パス                                         | 必須 |
| -------------------------- | -------------------------------------------- | ---- |
| 拡充テスト実行結果         | `outputs/phase-6/test-expansion-result.md`   | ✅   |
| カバレッジレポート（中間） | `outputs/phase-6/coverage-report-interim.md` | ✅   |

---

## 完了条件チェックリスト

- [ ] TC-PP-E01〜TC-PP-E05 が実装・PASS している
- [ ] TC-AS-E01〜TC-AS-E03 が実装・PASS している
- [ ] TC-FG-E01〜TC-FG-E03 が実装・PASS している
- [ ] 回帰ガードテスト（TC-RG-01〜TC-RG-02）が実装・PASS している
- [ ] `SkillCreatorAuditSink` の branch coverage が 70% 以上
- [ ] typecheck / lint がエラーなし
- [ ] `outputs/phase-6/` に成果物が配置されている
