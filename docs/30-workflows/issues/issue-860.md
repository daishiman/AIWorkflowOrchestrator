# [#860] "[UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001] skill:ハンドラIPCレスポンス形式統一"

## タスク概要

skillHandlers.ts内の14ハンドラのIPCレスポンス形式を統一し、Preload側の呼び出しパターンとの整合性を確保する。

## 背景

UT-FIX-SKILL-IMPORT-RETURN-TYPE-001でskill:importハンドラの戻り値型をImportedSkillに修正した際、ハンドラ間でIPCレスポンス形式が不統一であることが判明。

現在3パターンが混在:

- パターンA: `{ success: true, data: T }` ラッパー形式 + `safeInvokeUnwrap()`
- パターンB: 直接型 `T` を返す + `safeInvoke()`
- パターンC: 戻り値型が不明確

## メタ情報

| 項目     | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| タスクID | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001                  |
| 分類     | リファクタリング                                           |
| 優先度   | 中                                                         |
| 規模     | 中規模                                                     |
| 発見元   | Phase 12（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 コード調査） |

## 仕様書

`docs/30-workflows/completed-tasks/unassigned-task/task-skill-ipc-response-consistency.md`
