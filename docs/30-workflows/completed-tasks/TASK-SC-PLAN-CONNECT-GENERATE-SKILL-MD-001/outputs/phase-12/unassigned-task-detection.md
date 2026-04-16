# Phase 12: 未タスク検出レポート

## 検出サマリー

| 項目         | 値                                     |
| ------------ | -------------------------------------- |
| スキャン対象 | `apps/desktop/src/main/services/skill` |
| スキャン日時 | 2026-04-16                             |
| 総ファイル数 | 108 ファイル                           |
| 検出件数     | **1 件**                               |
| 新規タスク化 | 不要（既存 TODO、スコープ外）          |

## 検出結果

| ファイル          | 行番号 | 種別 | 内容                                             | 優先度 | 判定                  |
| ----------------- | ------ | ---- | ------------------------------------------------ | ------ | --------------------- |
| `SkillService.ts` | 136    | TODO | 実際の更新ロジックを実装する（後続タスクで対応） | 中     | 既存 TODO・スコープ外 |

## 詳細

### [MEDIUM] SkillService.ts:136

```typescript
// TODO: 実際の更新ロジックを実装する（後続タスクで対応）
```

- **判定**: 本タスク（TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001）のスコープ外
- **理由**: `SkillService.ts` は `SkillCreatorService.ts` とは異なるファイル。本タスクは SkillCreatorService の `generateSkillMd` 接続のみをスコープとする
- **処置**: 別途タスクとして対応する場合は新規 issue を作成すること

## 本タスクスコープ内の未タスク

本タスクのスコープ（`SkillCreatorService.ts` の `generateSkillMd` 接続）において、
未対応の TODO・FIXME・HACK は **0 件** であることを確認した。

```bash
$ grep -n "TODO\|FIXME\|HACK" \
  apps/desktop/src/main/services/skill/SkillCreatorService.ts
（出力なし）
```

## 今後の候補タスク（低優先度）

| 候補                                     | 根拠                                             | 優先度 |
| ---------------------------------------- | ------------------------------------------------ | ------ |
| `SkillService.ts:136` の更新ロジック実装 | 既存 TODO に「後続タスクで対応」と明記されている | 中     |
| logger interface（ILogger）定義          | `discovered-issues.md` に記載の改善候補          | 低     |
