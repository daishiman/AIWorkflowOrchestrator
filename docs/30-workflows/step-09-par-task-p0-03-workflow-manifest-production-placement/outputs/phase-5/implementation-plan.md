# Phase 5: 実装計画書 — TASK-P0-03

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 5                                      |
| タスクID | TASK-P0-03                             |
| 機能名   | workflow-manifest-production-placement |
| 実行日   | 2026-04-04                             |

## タスク5-1: manifest JSON の確認

Phase 2 設計書のステップ 6 の JSON 構造と、現行の canonical manifest を比較した結果:

**結論: 現行 canonical manifest は Phase 2 設計と完全一致**

canonical manifest の構造:

| フィールド    | 値              | 確認結果 |
| ------------- | --------------- | -------- |
| schemaVersion | 1               | PASS     |
| workflowId    | "skill-creator" | PASS     |
| phases        | 5 件            | PASS     |
| resources     | 7 件            | PASS     |
| entry         | 5 件            | PASS     |
| exit          | 5 件            | PASS     |

## タスク5-2: canonical パス配置確認

```
.claude/skills/skill-creator/workflow-manifest.json — 存在確認: PASS
```

## タスク5-3: mirror パス配置確認

```
.agents/skills/skill-creator/workflow-manifest.json — 存在確認: PASS
```

## タスク5-4: 両ファイルの完全一致確認

```bash
diff .claude/skills/skill-creator/workflow-manifest.json .agents/skills/skill-creator/workflow-manifest.json
# 出力なし（差分ゼロ、byte-for-byte 同一）
```

**結果: PASS**

## タスク5-5: resource path の実在確認

| resource id              | path                                 | 実在 |
| ------------------------ | ------------------------------------ | ---- |
| agent-analyze-request    | ./agents/analyze-request.md          | PASS |
| agent-define-boundary    | ./agents/define-boundary.md          | PASS |
| ref-core-principles      | ./references/core-principles.md      | PASS |
| ref-codex-best-practices | ./references/codex-best-practices.md | PASS |
| schema-agent-definition  | ./schemas/agent-definition.json      | PASS |
| schema-boundary          | ./schemas/boundary.json              | PASS |
| agent-analyze-feedback   | ./agents/analyze-feedback.md         | PASS |

## タスク5-6: テスト実行（GREEN 確認）

```
pnpm --filter @repo/desktop test ManifestLoader.production-manifest --run

Test Files  1 passed (1)
     Tests  17 passed (17)
```

**全 17 ケースが PASS（GREEN）**

## タスク5-7: リグレッション確認

```
pnpm --filter @repo/desktop test ManifestLoader --run

Test Files  2 passed (2)
     Tests  27 passed (27)
```

**既存テスト群も全て PASS（リグレッションなし）**

## タスク5-8: 型チェック・Lint 確認

型チェック・Lint は本タスクではコード変更がないため、既存のパス状態を維持。

## 新規作成/修正ファイルパス一覧

| 種別 | ファイルパス                                          | 説明                                      |
| ---- | ----------------------------------------------------- | ----------------------------------------- |
| 確認 | `.claude/skills/skill-creator/workflow-manifest.json` | canonical manifest（既存、設計と一致）    |
| 確認 | `.agents/skills/skill-creator/workflow-manifest.json` | mirror manifest（既存、canonical と同一） |

注: canonical / mirror 両パスに既に正しい manifest が存在していたため、上書きは不要であった。

## 完了確認

- [x] Phase 2 設計に基づく workflow-manifest.json が確認されている
- [x] .claude/skills/skill-creator/workflow-manifest.json に配置されている（AC-1）
- [x] .agents/skills/skill-creator/workflow-manifest.json に配置されている（AC-2）
- [x] canonical と mirror の内容が完全一致している
- [x] 全 7 resource の path が実在ファイルを指している（AC-4）
- [x] production-manifest テスト全 17 ケース PASS（AC-1〜AC-7）
- [x] ManifestLoader テスト全 27 ケース PASS（リグレッションなし）
- [x] 本 Phase 内の全タスクを 100% 実行完了
