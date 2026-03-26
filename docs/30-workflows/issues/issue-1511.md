# [#1511] "[UT-SLIDE-HANDOFF-DUP-001] UT"

## メタ情報

```yaml
task_id: UT-SLIDE-HANDOFF-DUP-001
task_name: UT
category: -
target_feature: -
priority: MEDIUM
scale: -
status: 未実施
source_phase: -
created_date: 2026-03-23
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-SLIDE-HANDOFF-DUP-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | MEDIUM |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

SlideWorkspace と Task05 の terminal handoff 重複実装を解消し、Task05 の共有 HandoffGuidance DTO に統一する。cleanup 順序9として定義済み。

## 主要ファイル

- apps/desktop/src/renderer/slide/SlideWorkspace.tsx
- TerminalHandoffCard（Task05 共有コンポーネント）
- packages/shared/src/types/handoff.ts（HandoffGuidance 正本型定義）

## 要件

- TerminalHandoffCard が Slide と Task05 で重複している場合、Task05 の共有 DTO に統一
- HandoffGuidance 型の正本は `packages/shared/src/types/handoff.ts` を使用（P64 対策: 同名型の二重定義禁止）
- Slide 固有の追加フィールドが必要な場合は HandoffGuidance を extends する

## 受入基準

- [ ] SlideWorkspace が Task05 の共有 TerminalHandoffCard を使用している
- [ ] HandoffGuidance 型が正本から import されている（ローカル定義なし）
- [ ] Slide 固有フィールドがある場合は extends で型安全に拡張されている
- [ ] 型チェック（pnpm typecheck）PASS

## 苦戦箇所（設計タスクで発見）

1. **P64 再発リスク（同名インターフェースのシグネチャドリフト）**: `HandoffGuidance` が `src/types/handoff.ts` と `src/slide/types.ts` で二重定義されるパターンが過去に発生。正本からの import + re-export を徹底すること
2. **Task05 完了待ちの Gate 管理**: このタスクは Task05 の完了が Gate 条件。Task05 が未完了の場合は着手不可

## Gate 条件

- TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001（Task05）が完了していること
- cleanup 順序2（UI 4領域契約確定）が完了していること

## 参照

| 参照資料             | パス                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 契約マトリクス       | docs/30-workflows/step-05-par-task-08-slide-modifier-manual-fallback-alignment/outputs/phase-2/contract-matrix.md |
| P64 詳細             | .claude/rules/06-known-pitfalls.md#P64                                                                            |
| HandoffGuidance 正本 | packages/shared/src/types/handoff.ts                                                                              |
