# Phase 4: テスト要件リスト

## メタ情報

| 項目       | 内容          |
| ---------- | ------------- |
| タスクID   | SKILL-IPC-001 |
| Phase      | 4             |
| 実行日     | 2026-01-16    |
| ステータス | 完了          |

---

## 修正影響を受けるテスト

### skillHandlers.test.ts（27テスト）

| テストID    | テスト名                                            | 影響 | 備考         |
| ----------- | --------------------------------------------------- | ---- | ------------ |
| SH-REG-01   | should register skill:list-available handler        | なし | モックで動作 |
| SH-REG-02   | should register skill:list-imported handler         | なし | モックで動作 |
| SH-REG-03   | should register skill:import handler                | なし | モックで動作 |
| SH-REG-04   | should register skill:remove handler                | なし | モックで動作 |
| SH-REG-05   | should register skill:get-detail handler            | なし | モックで動作 |
| SH-LA-01    | should call skillService.scanAvailableSkills        | なし | モックで動作 |
| SH-LA-02    | should pass forceRefresh option                     | なし | モックで動作 |
| SH-LA-03    | should handle service error                         | なし | モックで動作 |
| SH-LI-01    | should call skillService.getImportedSkills          | なし | モックで動作 |
| SH-LI-02    | should return empty array when no skills imported   | なし | モックで動作 |
| SH-IMP-01   | should call skillService.importSkills with skillIds | なし | モックで動作 |
| SH-IMP-02   | should validate skillIds is an array                | なし | モックで動作 |
| SH-IMP-03   | should throw VALIDATION_ERROR for invalid skillIds  | なし | モックで動作 |
| SH-IMP-04   | should validate each skillId in array               | なし | モックで動作 |
| SH-IMP-05   | should validate skillId format                      | なし | モックで動作 |
| SH-IMP-06   | should validate skillId length (max 64 chars)       | なし | モックで動作 |
| SH-RM-01    | should call skillService.removeSkill with skillId   | なし | モックで動作 |
| SH-RM-02    | should validate skillId is a string                 | なし | モックで動作 |
| SH-RM-03    | should validate skillId is not empty                | なし | モックで動作 |
| SH-RM-04    | should handle non-existent skill gracefully         | なし | モックで動作 |
| SH-GD-01    | should call skillService.getSkillById with skillId  | なし | モックで動作 |
| SH-GD-02    | should return null for unknown skillId              | なし | モックで動作 |
| SH-GD-03    | should validate skillId                             | なし | モックで動作 |
| SH-VAL-01   | should validate IPC sender for all handlers         | なし | モックで動作 |
| SH-VAL-02   | should reject DevTools sender                       | なし | モックで動作 |
| SH-UNREG-01 | should remove all skill handlers                    | なし | モックで動作 |

### integration.test.ts（19テスト）

| テストID   | テスト名                                         | 影響 | 備考             |
| ---------- | ------------------------------------------------ | ---- | ---------------- |
| INT-IPC-01 | should respond to skill:list-available           | なし | サービス直接呼出 |
| INT-IPC-02 | should respond to skill:list-imported            | なし | サービス直接呼出 |
| INT-IPC-03 | should respond to skill:import                   | なし | サービス直接呼出 |
| INT-IPC-04 | should respond to skill:remove                   | なし | サービス直接呼出 |
| INT-IPC-05 | should respond to skill:get-detail               | なし | サービス直接呼出 |
| INT-DF-01  | should scan skills from file system              | なし | サービス直接呼出 |
| INT-DF-02  | should import skills and persist to store        | なし | サービス直接呼出 |
| INT-DF-03  | should remove skills and update store            | なし | サービス直接呼出 |
| INT-DF-04  | should parse SKILL.md correctly                  | なし | サービス直接呼出 |
| INT-DF-05  | should get skill detail by id                    | なし | サービス直接呼出 |
| INT-EH-01  | should return VALIDATION_ERROR for invalid input | なし | サービス直接呼出 |
| INT-EH-02  | should return NOT_FOUND for unknown skill        | なし | サービス直接呼出 |
| INT-EH-03  | should handle parse errors gracefully            | なし | サービス直接呼出 |
| INT-EH-04  | should collect multiple errors                   | なし | サービス直接呼出 |
| INT-SS-01  | should update cache after scan                   | なし | サービス直接呼出 |
| INT-SS-02  | should reflect import changes immediately        | なし | サービス直接呼出 |
| INT-SS-03  | should refresh cache with forceRefresh           | なし | サービス直接呼出 |
| INT-SS-04  | should handle concurrent operations              | なし | サービス直接呼出 |
| INT-SEC-01 | should ignore hidden directories                 | なし | サービス直接呼出 |
| INT-SEC-02 | should generate consistent IDs                   | なし | サービス直接呼出 |

---

## 追加テストの必要性

### 現時点で追加不要なテスト

既存テストがskillHandlers.tsとサービス層を十分にカバーしているため、Phase 4では新規テスト追加は不要。

### 将来的に検討すべきテスト

| テストタイプ         | 内容                                 | 優先度 |
| -------------------- | ------------------------------------ | ------ |
| index.ts登録テスト   | registerAllIpcHandlersでの登録確認   | 中     |
| E2Eテスト            | 実際のElectronアプリ経由での動作確認 | 低     |
| パフォーマンステスト | 大量スキルスキャン時の性能確認       | 低     |

---

## テスト実行手順

### 修正前（Red確認）

```bash
# 既存テストの実行（PASS確認）
pnpm --filter @repo/desktop test -- --run src/main/ipc/__tests__/skillHandlers.test.ts
pnpm --filter @repo/desktop test -- --run src/main/services/skill/__tests__/integration.test.ts
```

### 修正後（Green確認）

```bash
# 同じテストを再実行（引き続きPASS確認）
pnpm --filter @repo/desktop test -- --run src/main/ipc/__tests__/skillHandlers.test.ts
pnpm --filter @repo/desktop test -- --run src/main/services/skill/__tests__/integration.test.ts

# 型チェック（index.ts修正の型安全性確認）
pnpm --filter @repo/desktop typecheck
```

---

## 完了条件チェックリスト

- [x] 既存のスキル管理テストを確認した
- [x] Red状態（ハンドラー未登録）を確認した
- [x] 修正後に確認すべきテストケースを特定した
