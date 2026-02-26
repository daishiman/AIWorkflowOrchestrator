---
id: UT-FIX-SKILL-EXECUTE-INTERFACE-001
title: "skill:execute IPCハンドラ・Preloadインターフェース不整合修正"
tier: 2
depends_on: []
status: completed
priority: high
estimated_complexity: medium
tags: [backend, ipc, preload, bug-fix, P44, P45, P42, skill-execution]
---

# skill:execute IPCハンドラ・Preloadインターフェース不整合修正

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| タスクID   | UT-FIX-SKILL-EXECUTE-INTERFACE-001 |
| ステータス | 完了（Phase 1-12）                 |
| 完了日     | 2026-02-25                         |
| タスク種別 | 実装 + テスト + 仕様同期           |

## 1. なぜこのタスクが必要か（Why）

`skill:execute` は Preload では `SkillExecutionRequest`（`skillName`）を送信する一方、Main ハンドラは `{ skillId, params }` を前提としており、契約ドリフト（P44/P45）が発生していた。

## 2. 何を達成したか（What）

- Main ハンドラで `skillName` 正式契約と `skillId` 後方互換契約を同時受理
- `skillName -> skill.id` 変換を Main 境界で実装（Service API 破壊なし）
- execute/validation/delegate の3テストで新旧契約を回帰保証
- aiworkflow-requirements / task-specification-creator の台帳・仕様・履歴を同期

## 3. どのように実施したか（How）

- `apps/desktop/src/main/ipc/skillHandlers.ts`
  - 引数を `SkillExecutionRequest | { skillId: string; params?: Record<string, unknown> }` に変更
  - `isSkillNameRequest` 型ガード追加
  - `scanAvailableSkills()` で `name -> id` 解決
- テスト更新
  - `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`
  - `apps/desktop/src/main/ipc/__tests__/skillHandlers.validation.test.ts`
  - `apps/desktop/src/main/ipc/__tests__/skillHandlers.delegate.test.ts`

## 4. 実行手順（再現用）

1. `skillHandlers.ts` の `skill:execute` ハンドラで新旧契約を受理
2. `skillName` 経路で `scanAvailableSkills()` による解決を実施
3. 3ファイルのテストを更新
4. 仕様書（interfaces/security/task-workflow/lessons-learned）を更新
5. リンク監査・仕様監査を実行

## 5. 完了条件チェックリスト

- [x] `skillName` 正式契約が動作する
- [x] `{ skillId, params }` 後方互換が維持される
- [x] `VALIDATION_ERROR`（P42準拠）で空文字/空白を拒否
- [x] テスト3ファイル（計90テスト）PASS
- [x] システム仕様書・タスク台帳の同期完了

## 6. 検証方法

```bash
# 対象テスト
cd apps/desktop
pnpm exec vitest run \
  src/main/ipc/__tests__/skillHandlers.execute.test.ts \
  src/main/ipc/__tests__/skillHandlers.validation.test.ts \
  src/main/ipc/__tests__/skillHandlers.delegate.test.ts

# 型チェック
pnpm --filter @repo/desktop typecheck

# 仕様リンク監査
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

## 7. リスクと対策

| リスク                              | 対策                                  |
| ----------------------------------- | ------------------------------------- |
| `skillName` と `skillId` の混同再発 | 正式契約 + 後方互換契約を仕様書に併記 |
| Service API の破壊的変更            | Main 境界で `name -> id` 変換         |
| 契約変更時の回帰漏れ                | 新旧2経路を同時テスト                 |

## 8. 参照情報

- `apps/desktop/src/main/ipc/skillHandlers.ts`
- `apps/desktop/src/preload/skill-api.ts`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `docs/30-workflows/ut-fix-skill-execute-interface-001/outputs/phase-12/`

## 9. 備考

- `prompt` 内容制約（非空必須化）は本タスク範囲外。Open Item として管理。
- PR/コミットは本タスクでは未実施（Phase 13 pending）。
