# Phase 1 受け入れ基準

- タスクID: UT-FIX-SKILL-EXECUTE-INTERFACE-001
- フェーズ: 1
- ステータス: 完了（implementation_and_spec_sync）

## 受け入れ基準

### AC-01: 契約統一方針

- `skill:execute` ハンドラのユニオン型 `SkillExecutionRequest | { skillId: string; params?: Record<string, unknown> }` の正規契約が定義されていること
- `isSkillNameRequest` 型ガードの判定ロジック（`typeof === "object" && !== null && "skillName" in payload`）が文書化されていること
- Preload層が `SkillExecutionRequest` を正規入力として使用し、Main Handlerが受理する流れが整合していること

### AC-02: P44/P45/P42対策

- P44: ユニオン型による2パス構造の設計意図と、各パスの使用条件が文書化されていること
  - skillNameパス: Preload/Renderer経由の正規呼び出し
  - skillIdパス: テスト・デバッグ・内部直接呼び出し
- P45: `skillName`（外部: Preload/Renderer由来） / `skillId`（内部: Service/Executor由来）の命名規約と変換境界が定義されていること
  - 変換境界: Main Handler内（`skillHandlers.ts:259-263`）
  - 変換方法: `scanAvailableSkills()` → `find(name)` → `skill.id`
- P42: skillNameパス・skillIdパス両方で3段バリデーション（typeof → 空文字列 → trim空文字列）が維持されていることが確認されていること
  - skillNameバリデーション: `skillHandlers.ts:240-248`
  - skillIdバリデーション: `skillHandlers.ts:249-254`

### AC-03: implementation_and_spec_sync運用

- 本仕様群が計画文書であり、実装作業を含まないことが明示されていること
- 既存実装が動作中（3ファイル90テスト全PASS）であることが前提として記録されていること

### AC-04: 成果物配置

- `outputs/phase-1/` に以下の3成果物が存在すること:
  - `requirements-definition.md`
  - `acceptance-criteria.md`
  - `contract-gap-summary.md`

## 検証証跡（実コードとの対応）

| 観測対象       | ファイル                                                                                                             | 確認ポイント                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Shared型定義   | `packages/shared/src/types/skill.ts:306-315`                                                                         | `SkillExecutionRequest` = `{ skillName, prompt, workingDirectory? }`                 |
| Preload実装    | `apps/desktop/src/preload/skill-api.ts:224-225`                                                                      | `execute(request)` → `safeInvokeUnwrap(SKILL_EXECUTE, request)`                      |
| Main Handler   | `apps/desktop/src/main/ipc/skillHandlers.ts:217-283`                                                                 | ユニオン型受理 + `isSkillNameRequest` 型ガード + 2パス分岐                           |
| 型ガード       | `apps/desktop/src/main/ipc/skillHandlers.ts:231-236`                                                                 | `typeof === "object" && !== null && "skillName" in payload`                          |
| バリデーション | `apps/desktop/src/main/ipc/skillHandlers.ts:239-254`                                                                 | skillName/skillId 両パスでP42準拠3段バリデーション                                   |
| 名前解決       | `apps/desktop/src/main/ipc/skillHandlers.ts:259-263`                                                                 | `scanAvailableSkills()` → `find(name === skillName)` → `executeSkill(skill.id, ...)` |
| テスト         | `skillHandlers.execute.test.ts` (23), `skillHandlers.validation.test.ts` (55), `skillHandlers.delegate.test.ts` (12) | 3ファイル90テスト全PASS                                                              |

## 要件-テストIDトレーサビリティ

| 要件ID | テストID                     | テストファイル                     |
| ------ | ---------------------------- | ---------------------------------- |
| FR-01  | SH-EXE-REG-01                | `skillHandlers.execute.test.ts`    |
| FR-02  | TC-4-005 (skillName解決)     | `skillHandlers.execute.test.ts`    |
| FR-03  | SH-EXE-V00〜V06, SH-BV-\*    | `skillHandlers.validation.test.ts` |
| FR-04  | SH-EXE-V00 (skillName契約)   | `skillHandlers.validation.test.ts` |
| NFR-01 | TC-4-007, TC-6-008, TC-6-009 | `skillHandlers.execute.test.ts`    |
| NFR-03 | IT-002 (委譲テスト)          | `skillHandlers.delegate.test.ts`   |

## 判定

- [x] 受け入れ基準を定義済み
- [x] 検証証跡を実コード行番号付きで紐付け済み
- [x] 要件-テストIDトレーサビリティを確立
- [x] Phase 1成果物3件を出力済み
