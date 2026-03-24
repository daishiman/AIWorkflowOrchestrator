# UT-SLIDE-IMPL-001: Slide Modifier / agent-client 実装

## メタ情報

| 項目     | 値                                                                       |
| -------- | ------------------------------------------------------------------------ |
| タスクID | UT-SLIDE-IMPL-001                                                        |
| Issue    | [#1508](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1508) |
| 優先度   | HIGH                                                                     |
| 依存     | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 (Task08) 完了      |
| 検出元   | Task08 Phase 12 unassigned-task-detection                                |
| 作成日   | 2026-03-24                                                               |
| 機能名   | slide-impl-001                                                           |

## 概要

ModifierResponse 型拡張（`fallback_reason`, `suggested_action` optional フィールド追加）、
`agent-client.ts` の Agent SDK adapter 化、SlideCapabilityDTO の IPC channel 確定と
P42 準拠 3 段バリデーション実装を行う。

## スコープ

### 含むもの

1. **ModifierResponse 型拡張**: `packages/shared/src/slide/types.ts` に `fallback_reason` / `suggested_action` optional フィールドを追加
2. **agent-client.ts Agent SDK adapter 化**: `apps/desktop/src/main/slide/agent-client.ts` を Agent SDK adapter 経由に移行
3. **SlideCapabilityDTO 新規定義 + IPC**: 型定義、`slide:capability:get` IPC channel 登録、Preload allowlist 追加
4. **P42 準拠 3 段バリデーション**: 新規 IPC handler に型チェック → 空文字列 → trim 空文字列の 3 段バリデーション実装
5. **テスト**: 上記各変更に対応する単体テスト

### 含まないもの

- SlideWorkspace UI コンポーネント変更（UT-SLIDE-UI-001 のスコープ）
- Zustand SlideSlice のセレクタ追加（UT-SLIDE-P31-001 のスコープ）
- IPC namespace 統一 `slide:sync:*`（Task09 follow-up のスコープ）
- HandoffGuidance 重複解消（UT-SLIDE-HANDOFF-DUP-001 のスコープ）

## 主要ファイル

| ファイル       | パス                                            | 変更内容                                           |
| -------------- | ----------------------------------------------- | -------------------------------------------------- |
| 型定義         | `packages/shared/src/slide/types.ts`            | ModifierResponse 拡張、SlideCapabilityDTO 新規定義 |
| Agent Client   | `apps/desktop/src/main/slide/agent-client.ts`   | Agent SDK adapter 経由に移行                       |
| Modifier Skill | `apps/desktop/src/main/slide/modifier-skill.ts` | ModifierResponse 拡張フィールドのパース対応        |
| IPC Handlers   | `apps/desktop/src/main/slide/ipc-handlers.ts`   | `slide:capability:get` handler 追加                |
| IPC Channels   | `apps/desktop/src/preload/channels.ts`          | `SLIDE_CAPABILITY_GET` 定数追加、allowlist 登録    |
| Preload Index  | `apps/desktop/src/preload/index.ts`             | `slideApi.getCapability()` 追加                    |
| Preload Types  | `apps/desktop/src/preload/types.ts`             | SlideCapabilityDTO 型追加                          |

## Phase 構成

| Phase | 名称             | 成果物                       |
| ----- | ---------------- | ---------------------------- |
| 1     | 要件定義         | 要件定義書、受入基準         |
| 2     | 設計             | 型設計書、IPC 契約設計書     |
| 3     | 設計レビュー     | レビュー結果                 |
| 4     | テスト作成       | テストコード                 |
| 5     | 実装             | プロダクションコード         |
| 6     | テスト拡充       | エッジケーステスト           |
| 7     | カバレッジ確認   | カバレッジレポート           |
| 8     | リファクタリング | コード品質改善               |
| 9     | 品質検証         | lint / typecheck / test PASS |
| 10    | 最終レビュー     | レビュー結果                 |
| 11    | 手動テスト       | テスト結果                   |
| 12    | ドキュメント     | 実装ガイド、仕様書更新       |
| 13    | 完了・PR作成     | PR 準備                      |

## 参照資料

| 参照資料           | パス                                                                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 設計サマリー       | `docs/30-workflows/completed-tasks/step-05-par-task-08-slide-modifier-manual-fallback-alignment/outputs/phase-2/design-summary.md`        |
| 契約マトリクス     | `docs/30-workflows/completed-tasks/step-05-par-task-08-slide-modifier-manual-fallback-alignment/outputs/phase-2/contract-matrix.md`       |
| 実装ガイド         | `docs/30-workflows/completed-tasks/step-05-par-task-08-slide-modifier-manual-fallback-alignment/outputs/phase-12/implementation-guide.md` |
| IPC セキュリティ   | `.claude/rules/04-electron-security.md`                                                                                                   |
| P42 バリデーション | `.claude/rules/06-known-pitfalls.md#P42`                                                                                                  |
| Agent SDK skill    | `.claude/skills/claude-agent-sdk/SKILL.md`                                                                                                |
