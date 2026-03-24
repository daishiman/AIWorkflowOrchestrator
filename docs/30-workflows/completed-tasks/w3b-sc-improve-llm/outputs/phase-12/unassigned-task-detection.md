# 未タスク検出レポート: improve() LLM 統合

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| タスクID | TASK-SC-05-IMPROVE-LLM |
| 機能名   | w3b-sc-improve-llm     |
| 作成日   | 2026-03-23             |
| 検出件数 | 2件                    |

---

## 検出ソース

| #   | ソース                | 確認結果                                                |
| --- | --------------------- | ------------------------------------------------------- |
| 1   | Phase 3 レビュー結果  | MINOR 指摘なし                                          |
| 2   | Phase 10 レビュー結果 | MINOR-2 対応済み（IMPROVE_RESPONSE_SCHEMA_INSTRUCTION） |
| 3   | Phase 11 手動テスト   | スコープ外発見なし                                      |
| 4   | コードベース TODO     | 該当なし                                                |
| 5   | IPC wiring 調査       | 2件検出                                                 |

---

## 未タスク一覧

### UT-SC-05-IPC-DI-WIRING

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| 優先度   | High                                          |
| 影響範囲 | improve() LLM 統合パスが runtime で機能しない |
| 配置先   | `docs/30-workflows/unassigned-task/`          |

**概要**: `apps/desktop/src/main/ipc/index.ts` L898-902 の `RuntimeSkillCreatorFacade` コンストラクタに `skillFileManager`、`llmAdapter`、`resourceLoader` が注入されていない。現状では improve() は常に graceful degradation（空の suggestions 配列）を返す。

**現状コード**:

```typescript
const runtimeSkillCreatorService = skillExecutor
  ? new RuntimeSkillCreatorFacade({
      skillExecutor,
      authKeyService,
    })
  : undefined;
```

**修正方針**: 同ファイル L701 の `skillFileManager` インスタンスと、LLM アダプタ・リソースローダーのインスタンスをコンストラクタに渡す。

**3ステップ完了状況**:

- [x] 指示書作成: `docs/30-workflows/unassigned-task/UT-SC-05-IPC-DI-WIRING.md`
- [x] task-workflow.md 残課題テーブル登録: `task-workflow-backlog.md` L541
- [x] 関連仕様書リンク追加: 本タスクは既存チャンネルの実装拡充のため追加参照不要

---

### UT-SC-05-APPLY-IMPROVEMENT-UI

| 項目     | 値                                           |
| -------- | -------------------------------------------- |
| 優先度   | Medium                                       |
| 影響範囲 | ユーザーが改善提案を承認・適用する UI がない |
| 配置先   | `docs/30-workflows/unassigned-task/`         |

**概要**: `RuntimeSkillCreatorFacade.applyImprovement()` メソッドは Main Process に実装済みだが、Renderer 側で改善提案の一覧表示・個別承認・適用を行う UI コンポーネントが未実装。IPC ハンドラ `skill-creator:apply-improvement` も未登録。

**3ステップ完了状況**:

- [x] 指示書作成: `docs/30-workflows/unassigned-task/UT-SC-05-APPLY-IMPROVEMENT-UI.md`
- [x] task-workflow.md 残課題テーブル登録: `task-workflow-backlog.md` L542
- [x] 関連仕様書リンク追加: 本タスクは既存チャンネルの実装拡充のため追加参照不要
