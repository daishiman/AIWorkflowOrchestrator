# Phase 1: タスク分類記録

## タスク分類

| 項目       | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| タスク種別 | `feat`（セキュリティ境界の新規確立）                             |
| 分類理由   | SDK `query()` 実行前の permission/hooks 契約正規化は新機能の実装 |
| 影響範囲   | Main プロセス内の governance ロジック（非 UI）                   |

## 命名規則記録

| 種別              | 規則                 | 例                                                             |
| ----------------- | -------------------- | -------------------------------------------------------------- |
| TypeScript クラス | PascalCase           | `SkillCreatorAuditSink`, `SkillCreatorPermissionPolicy`        |
| 関数              | camelCase            | `getPolicy`, `canUseTool`, `createHooks`, `recordEvent`        |
| 定数              | SCREAMING_SNAKE_CASE | `READ_TOOLS`, `WRITE_TOOLS`, `DESTRUCTIVE_TOOLS`, `MAX_EVENTS` |
| テストファイル    | `*.test.ts`          | `SkillCreatorPermissionPolicy.test.ts`                         |
| インターフェース  | PascalCase           | `SkillCreatorHooks`, `CanUseToolContext`                       |

## P0-09 本体の実装スコープ（確定）

1. phase 別 permissionMode / allowedTools / disallowedTools の定義と SDK への適用
2. Skill Creator 実行専用 hooks の設定（lifecycle hooks の実装）
3. audit レコードの基本実装（in-memory ring buffer）
4. Facade 手前での permission / hooks 契約正規化レイヤー

## TASK-P0-09-U1 carry-forward 内容

- `createExecuteGovernanceCanUseTool()` の `_input` パラメータ（context-aware 判定の実配線）
- `targetPath` / `allowedSkillRoot` の SDK callback への接続
- execute / improve phase での context 引数を使ったパス検証

**作成日**: 2026-04-06
