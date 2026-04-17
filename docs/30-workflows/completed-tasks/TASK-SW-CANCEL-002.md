# Preload skillCreatorAPI に cancelGeneration メソッド追加 - タスク指示書

## メタ情報

```yaml
issue_number: 2210
task_id: TASK-SW-CANCEL-002
status: open
priority: high
scale: small
task_type: FEATURE
```

| 項目         | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| タスクID     | TASK-SW-CANCEL-002                                      |
| タスク名     | cancel-002-add-preload-cancel-generation-method         |
| 分類         | 機能追加                                                |
| 対象機能     | Preload skillCreatorAPI - cancelGeneration メソッド追加 |
| 優先度       | 高（`priority:high`）                                   |
| 見積もり規模 | 小規模（`scale:small`）                                 |
| ステータス   | 未実施（`status:open`）                                 |
| 依存タスク   | TASK-SW-CANCEL-001（`SKILL_CREATOR_CANCEL` 定数が前提） |
| 発見元       | skill-create-flow-gaps 分析（2026-04-16）               |
| 発見日       | 2026-04-16                                              |
| タスク分類   | FEATURE タスク（Preload API 拡張）                      |
| 仕様書       | docs/30-workflows/p05-par-CANCEL-002/                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SW-CANCEL-001 で Main プロセス側に `SKILL_CREATOR_CANCEL` チャンネルハンドラーが実装されたが、Preload 側の `skillCreatorAPI` に `cancelGeneration` メソッドが存在しないため、Renderer から型安全に呼び出せない。

### 1.2 問題点・課題

`window.skillCreatorAPI.cancelGeneration()` を呼び出すと TypeScript の型エラーが発生する。また `ALLOWED_INVOKE_CHANNELS` に `SKILL_CREATOR_CANCEL` が含まれていないと `safeInvoke` によるセキュリティチェックが失敗する。

Preload の `SkillCreatorAPI` インターフェースと実装の両方に追加が必要。

### 1.3 放置した場合の影響

- Renderer から `cancelGeneration()` を呼び出すと型エラーで実行できない
- `safeInvoke` のホワイトリストに含まれないため、IPC 呼び出しがセキュリティガードでブロックされる

---

## 2. 何を達成するか（What）

### 2.1 目的

`apps/desktop/src/preload/skill-creator-api.ts` の `SkillCreatorAPI` インターフェースおよび実装に `cancelGeneration: () => Promise<IpcResult<void>>` メソッドを追加する。

### 2.2 最終ゴール

- `SkillCreatorAPI` インターフェースに `cancelGeneration: () => Promise<IpcResult<void>>` が追加されている
- 実装が `safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL)` を使用している
- `ALLOWED_INVOKE_CHANNELS` に `SKILL_CREATOR_CANCEL` が追加されている
- `window.skillCreatorAPI.cancelGeneration()` が型エラーなく呼び出せる
- 既存の Preload API テストが全てパスし続ける

### 2.3 スコープ

**含むもの**:

- `apps/desktop/src/preload/skill-creator-api.ts`（インターフェース + 実装追加）
- `apps/desktop/src/preload/channels.ts`（`ALLOWED_INVOKE_CHANNELS` 追加）
- 対応するユニットテスト追加

**含まないもの**:

- `SKILL_CREATOR_CANCEL` チャンネル定数定義（TASK-SW-CANCEL-001 の担当）
- Main プロセスのハンドラー実装（別タスク）
- Renderer 側の `useCancelGeneration.ts` 修正

### 2.4 成果物

- `apps/desktop/src/preload/skill-creator-api.ts`（cancelGeneration 追加）
- `apps/desktop/src/preload/channels.ts`（ALLOWED_INVOKE_CHANNELS 追加）
- 対応するテストファイル

---

## 3. 苦戦箇所（Lessons Learned）

### 3.1 Preload の 3 箇所修正（インターフェース・実装・ホワイトリスト）

Preload に新しい invoke メソッドを追加するには、①インターフェース定義、②実装、③`ALLOWED_INVOKE_CHANNELS` ホワイトリストの3箇所を同時に修正する必要がある。どれか1つでも漏れると型エラーまたはセキュリティエラーになる。

**対処法**: Preload への invoke 追加は「インターフェース → 実装 → ホワイトリスト」の3点セットとして記憶し、PRレビューのチェックリストに含める。

### 3.2 `safeInvoke` の型推論

`safeInvoke` の戻り値型が `Promise<IpcResult<void>>` になるよう型引数を明示する必要がある。暗黙の型推論に頼ると `unknown` になることがある。

**対処法**: `safeInvoke<void>(IPC_CHANNELS.SKILL_CREATOR_CANCEL)` のように型引数を明示する。
