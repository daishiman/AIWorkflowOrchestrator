# Phase 10: 是正計画

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| タスク ID  | TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001 |
| Phase      | 10 - 最終レビューゲート（是正計画）           |
| 作成日     | 2026-03-03                                    |
| 前提成果物 | outputs/phase-10/final-review-result.md       |

## 1. レビュー結果サマリ

| 判定     | 件数 | 対応                                           |
| -------- | ---- | ---------------------------------------------- |
| PASS     | -    | Phase 11 へ進行                                |
| MINOR    | 1    | 未タスク仕様書に変換後 Phase 11 へ（省略不可） |
| MAJOR    | 0    | -                                              |
| CRITICAL | 0    | -                                              |

## 2. MINOR 指摘の是正計画

### M-01: バレルファイル未エクスポート

| 項目        | 内容                                                                         |
| ----------- | ---------------------------------------------------------------------------- |
| 指摘 ID     | M-01                                                                         |
| 内容        | SkillChainStore/SkillChainExecutor が services/skill/index.ts 未エクスポート |
| 影響度      | 低（機能影響なし）                                                           |
| 是正方法    | Phase 12 Task 4 で未タスク仕様書に変換                                       |
| 未タスク ID | UT-FIX-SKILL-CHAIN-BARREL-EXPORT-001（予定）                                 |
| 是正期限    | Phase 12 完了時                                                              |

#### 是正内容（未タスク仕様書に記載予定）

`apps/desktop/src/main/services/skill/index.ts` に以下の export を追加:

```typescript
export { SkillChainStore } from "./skill-chain-store";
export { SkillChainExecutor } from "./skill-chain-executor";
```

#### 3ステップ管理（P3 対策）

1. `unassigned-task/` に指示書 `UT-FIX-SKILL-CHAIN-BARREL-EXPORT-001.md` を作成
2. `task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンク追加

## 3. 戻り Phase

**なし** — PASS 判定のため、戻り Phase は不要。

## 4. 進行指示

| 項目             | 内容                                       |
| ---------------- | ------------------------------------------ |
| 次 Phase         | Phase 11（手動テスト）                     |
| 前提条件         | なし（MINOR は未タスク化で Phase 12 対応） |
| ブロッキング事項 | なし                                       |
