# createSkill() にオプショナルな onProgress コールバック追加 - タスク指示書

## メタ情報

```yaml
issue_number: 2222
task_id: TASK-SW-STREAM-001
status: open
priority: high
scale: small
task_type: FEATURE
```

| 項目         | 内容                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| タスクID     | TASK-SW-STREAM-001                                                             |
| タスク名     | stream-001-add-progress-callback-to-create-skill                               |
| 分類         | 機能追加                                                                       |
| 対象機能     | SkillCreatorService - createSkill に onProgress コールバック引数追加・進捗通知 |
| 優先度       | 高（`priority:high`）                                                          |
| 見積もり規模 | 小規模（`scale:small`）                                                        |
| ステータス   | 未実施（`status:open`）                                                        |
| 依存タスク   | なし                                                                           |
| 発見元       | skill-create-flow-gaps 分析（2026-04-16）                                      |
| 発見日       | 2026-04-16                                                                     |
| タスク分類   | FEATURE タスク（進捗通知の実装）                                               |
| 仕様書       | docs/30-workflows/p02-par-STREAM-001/                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`skillCreatorHandlers.ts:692` の `sendSkillCreatorProgress()` は `mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, progress)` を呼び出す関数として正しく export されているが、呼び出し元が存在しない孤立状態にある。

### 1.2 問題点・課題

`SkillCreatorService.createSkill()` は進捗通知コールバック引数を持たないため、処理の各段階でフロントエンドへ進捗を伝達する手段がない。

フロント側の `useStreamingProgress` フックは IPC メッセージ `SKILL_CREATOR_PROGRESS` を待ち受けているが、メインプロセス側から送信されることがなく、プログレスバーが常に初期状態（`stage: idle`）のまま固定されている。

### 1.3 放置した場合の影響

- スキル作成中にユーザーがフリーズしているように見えるプログレスバーを見続ける
- `sendSkillCreatorProgress()` が永遠に呼ばれない死んだコードとして残存する

---

## 2. 何を達成するか（What）

### 2.1 目的

`createSkill()` にオプショナルな `onProgress` 引数を追加し、処理の5節目で呼び出す。

### 2.2 最終ゴール

- `createSkill()` のシグネチャが `onProgress?: (progress: { phase: string; percentage: number; message: string }) => void` を受け付ける
- 以下の5節目でコールバックが呼び出される:
  - planning（10%）: `runCreateWorkflow` 開始時
  - generating-skill（40%）: SKILL.md 生成開始時
  - generating-agents（70%）: エージェント定義生成時
  - validating（90%）: 検証開始時
  - done（100%）: 完了時
- 既存の呼び出し元への破壊的変更なし（オプショナル引数）
- ユニットテストで各段階のコールバック呼び出し順を検証

### 2.3 スコープ

**含むもの**:

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` の `createSkill()` シグネチャ修正
- 5節目でのコールバック呼び出し実装
- 対応するユニットテスト追加

**含まないもの**:

- `skillCreatorHandlers.ts` 側からのコールバック接続（TASK-SW-STREAM-002 の担当）
- IPC チャンネル定義の変更

### 2.4 成果物

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（onProgress 引数追加・コールバック呼び出し追加）
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`（進捗通知テスト追加）

---

## 3. 苦戦箇所（Lessons Learned）

### 3.1 「export されているが呼ばれない」パターンの発見困難性

`sendSkillCreatorProgress()` は型チェック・lint でエラーにならないため、静的解析のみではデッドコードと判断できない。呼び出し元を `grep` で追跡して初めて孤立状態を発見できた。

**対処法**: IPC 送信関数の export を追加した際は、その関数を実際に呼ぶコードが同一 PR に含まれているかをコードレビューで確認する。

### 3.2 コールバック引数をオプショナルにする設計判断

`onProgress` を必須引数にすると既存のテストケースやハンドラー全てに影響が出る。オプショナルにすることで後方互換性を維持しつつ段階的に接続できる。

**対処法**: 進捗通知のような観測系引数はオプショナルにし、インターフェース変更の影響範囲を最小化する。
