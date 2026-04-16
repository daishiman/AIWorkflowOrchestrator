# ConversationRoundStep 主ツールバッジ TODOコメント整理 - タスク指示書

## メタ情報

```yaml
issue_number: 2225
task_id: TASK-SW-TODO-001
status: open
priority: low
scale: tiny
task_type: CLEANUP
```

| 項目         | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| タスクID     | TASK-SW-TODO-001                                        |
| タスク名     | todo-001-cleanup-main-tool-badge-todo-comment           |
| 分類         | クリーンアップ / コメント整理                           |
| 対象機能     | ConversationRoundStep - 主ツールバッジTODOコメント整理  |
| 優先度       | 低（`priority:low`）                                    |
| 見積もり規模 | 極小（`scale:tiny`）                                    |
| ステータス   | 未実施（`status:open`）                                 |
| 依存タスク   | なし（resolveExternalIntegration の完了状況確認が前提） |
| 発見元       | skill-create-flow-gaps 分析（2026-04-16）               |
| 発見日       | 2026-04-16                                              |
| タスク分類   | CLEANUP タスク（TODO コメント整理）                     |
| 仕様書       | docs/30-workflows/p09-par-TODO-001/                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`ConversationRoundStep.tsx:456-489` に以下の TODO コメントが存在する。

```typescript
// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001): 主ツールバッジ - resolveExternalIntegration の主ツール参照ロジック変更後に削除
```

このコメントのトリガー条件「`resolveExternalIntegration` の主ツール参照ロジック変更」が現時点で未実施か完了済みかが不明な状態になっている。

### 1.2 問題点・課題

`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` タスクの完了状況が不明なため、TODOを削除すべきか維持すべきかが判断できない。コメントが残存し続けることで将来の開発者が混乱する可能性がある。

### 1.3 放置した場合の影響

- 参照タスクの完了状況が曖昧なまま TODOコメントが残存し続ける
- 将来の開発者が「このTODOはまだ必要なのか」と調査に時間を費やす

---

## 2. 何を達成するか（What）

### 2.1 目的

`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` の完了状況を確認し、TODOコメントを整理する（削除または明確化）。

### 2.2 最終ゴール

いずれかのオプションを実施する:

**オプション A（推奨）**: `resolveExternalIntegration` の変更が不要と判断された場合

- TODOコメントを削除してバッジを恒久的に維持
- `MAIN_TOOL_BADGE_ENABLED = true`（行:116）フラグを削除して直接 `true` を埋め込む

**オプション B**: 将来の変更を前提にする場合

- TODOを具体的な条件に書き換えてトレーサビリティを確保

どちらのオプションでも:

- `shouldShowMainToolBadge` の動作は変わらない（UIの機能は維持）
- TypeScript の型エラーがない

### 2.3 スコープ

**含むもの**:

- `apps/desktop/src/renderer/components/skill-creator/steps/ConversationRoundStep.tsx` のTODOコメント整理
- `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` の完了状況確認・記録

**含まないもの**:

- バッジの表示ロジック変更
- 他コンポーネントの修正

### 2.4 成果物

- `apps/desktop/src/renderer/components/skill-creator/steps/ConversationRoundStep.tsx`（TODOコメント整理）
- 判断根拠のコメントまたはドキュメント

---

## 3. 苦戦箇所（Lessons Learned）

### 3.1 TODO コメントの「参照タスク」が完了済みか不明なケース

TODO に記載されたタスク ID（`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001`）が完了したかどうかを後から判断するのが難しい。タスク管理システム（GitHub Issues）と TODO コメントが連携していないと、コードと現実が乖離する。

**対処法**: TODO コメントには GitHub Issue 番号を含める（`// TODO(#2345):`）か、条件が明確な場合は TODO ではなく通常コメントとして記述する。

### 3.2 フラグ変数（MAIN_TOOL_BADGE_ENABLED）の意図が不明確

`MAIN_TOOL_BADGE_ENABLED = true` のようなフラグ変数は「将来 false に変える可能性がある」という意図を持つが、その条件が TODO コメントにしか記録されていない。

**対処法**: フラグを残す場合は上のコメントに「どの条件になったら変更すべきか」を明示する。フラグが不要なら定数化して直値で埋め込む。
