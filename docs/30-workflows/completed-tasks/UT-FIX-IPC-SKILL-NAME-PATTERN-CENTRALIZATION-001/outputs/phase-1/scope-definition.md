# Phase 1: スコープ定義書

## タスク分類: NON_VISUAL

本タスクはリファクタリングタスクであり、NON_VISUALに分類される。

## 変更範囲（含む）

| ファイル                                             | 変更種別                         |
| ---------------------------------------------------- | -------------------------------- |
| `packages/shared/src/constants/skillName.ts`         | 新規作成                         |
| `packages/shared/src/constants/index.ts`             | 修正（export追加）               |
| `apps/desktop/src/main/claude-cli/SkillScanner.ts`   | 修正（import追加・参照更新）     |
| `.claude/skills/skill-creator/scripts/init_skill.js` | 修正（import追加・リテラル置換） |
| `packages/shared/src/constants/skillName.test.ts`    | 新規作成（テスト）               |

## 対象外範囲（含まない）

- UI コンポーネントの変更
- IPC チャンネルの変更
- API エンドポイントの変更
- バリデーションルール自体の変更（同一の正規表現を維持）
- データベーススキーマの変更

## 依存関係

```
init_skill.js  ─── import ──→  @repo/shared/constants
                                    ↑
SkillScanner.ts ── import ──→  packages/shared/src/constants/skillName.ts
```

依存の方向: `apps/desktop` → `packages/shared` ← `.claude/skills`

## リスク

| リスク              | 影響                     | 対策                                  |
| ------------------- | ------------------------ | ------------------------------------- |
| ESM import 解決失敗 | init_skill.js が動作不能 | ビルド後に dist ファイル存在確認      |
| 循環依存            | ビルドエラー             | shared → desktop の逆方向依存なし確認 |
| 型不整合            | TypeScript エラー        | `RegExp` 型明示でカバー               |
