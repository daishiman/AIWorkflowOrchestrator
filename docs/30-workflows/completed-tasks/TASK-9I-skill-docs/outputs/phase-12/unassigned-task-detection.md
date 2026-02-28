# Phase 12: 未タスク検出レポート - TASK-9I

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | TASK-9I    |
| Phase    | 12         |
| 作成日   | 2026-02-28 |
| 検出件数 | **2件**    |

---

## 検出ソース確認結果

| ソース              | 確認結果                                                     | 未タスク数 |
| ------------------- | ------------------------------------------------------------ | ---------- |
| Phase 3 レビュー    | 確認済み -- MINOR 指摘なし                                   | 0          |
| Phase 10 レビュー   | 確認済み -- MINOR 指摘で未実装項目2件検出                    | 2          |
| Phase 11 手動テスト | 確認済み -- スコープ外発見なし（stubQueryFn は設計上の制約） | 0          |
| コードベース        | grep 確認済み -- TODO/FIXME/HACK/XXX なし                    | 0          |
| スコープ外項目      | ドキュメント生成UI / テンプレートカスタマイズUI は対象外     | 対象外     |

---

## 検出結果

### UT-9I-001: LLM プロバイダ連携の実装

| 項目       | 内容                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| 未タスクID | UT-9I-001                                                                                                         |
| 概要       | 現在 `stubQueryFn` を使用しているが、実際の LLM プロバイダ（GPT-4, Claude 等）との連携が未実装                    |
| 影響範囲   | `apps/desktop/src/main/ipc/index.ts` のスタブ関数                                                                 |
| 優先度     | Medium                                                                                                            |
| ステータス | 未着手                                                                                                            |
| 指示書パス | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` |

**詳細**:

`apps/desktop/src/main/ipc/index.ts` L591-593 で以下のスタブ実装が使用されている:

```typescript
const stubQueryFn = async (prompt: string) => ({
  content: `Generated content for: ${prompt.slice(0, 50)}`,
});
```

この実装は開発・テスト用のプレースホルダーであり、実際の LLM API（Anthropic Claude、OpenAI GPT-4 等）との連携が必要。LLM プロバイダの選択・認証・レート制限・エラーハンドリングの実装が含まれる。

**3ステップ管理（P3 対策）**:

1. 指示書: `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` を作成済み
2. 残課題テーブル: `task-workflow.md` に登録済み
3. 関連仕様書: `interfaces-agent-sdk-skill.md` の関連未タスクテーブルに登録済み

---

### UT-9I-002: テンプレート CRUD 機能の実装

| 項目       | 内容                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| 未タスクID | UT-9I-002                                                                                              |
| 概要       | 現在は読み取り専用（`DEFAULT_DOC_TEMPLATE` のみ）。カスタムテンプレートの作成・編集・削除が未実装      |
| 影響範囲   | `SkillDocGenerator`, `skillHandlers.ts`（templates チャネル）                                          |
| 優先度     | Low                                                                                                    |
| ステータス | 未着手                                                                                                 |
| 指示書パス | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-002-template-crud.md` |

**詳細**:

Phase 1 要件定義（FR-09, FR-10）ではテンプレート選択機能が要件に含まれているが、Phase 5 実装では「読み取り専用テンプレート」のみ実装した。具体的には:

- `skill:docs:templates` チャネルは `[DEFAULT_DOC_TEMPLATE]` を固定で返す
- カスタムテンプレートの作成（Create）、編集（Update）、削除（Delete）の IPC チャネルは未実装
- テンプレートの永続化ストレージ（electron-store 等）も未実装

**3ステップ管理（P3 対策）**:

1. 指示書: `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-002-template-crud.md` を作成済み
2. 残課題テーブル: `task-workflow.md` に登録済み
3. 関連仕様書: `interfaces-agent-sdk-skill.md` の関連未タスクテーブルに登録済み

---

## P38 対策: 配置先確認

未タスク指示書は以下のディレクトリに配置する（`tasks/` 直下には配置しない）:

```
docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md
docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-002-template-crud.md
```

---

## 3ステップ実施結果（完了）

| 未タスクID | 指示書作成 | task-workflow 登録 | 関連仕様書登録 |
| ---------- | ---------- | ------------------ | -------------- |
| UT-9I-001  | 完了       | 完了               | 完了           |
| UT-9I-002  | 完了       | 完了               | 完了           |
