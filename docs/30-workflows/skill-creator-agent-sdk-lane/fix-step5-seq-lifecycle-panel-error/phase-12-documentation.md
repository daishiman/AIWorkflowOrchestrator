# Phase 12: ドキュメント更新

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| Phase        | 12                                 |
| タスクID     | TASK-FIX-LIFECYCLE-PANEL-ERROR-001 |
| ステータス   | 未実施                             |
| 担当         | 実装者                             |
| 見積もり時間 | 0.5h                               |

## 目的

修正内容を実装ガイドに記録する。インターフェース変更なしのため、システム仕様書の更新は最小限（完了タスク記録のみ）とする。

## 実行タスク

1. `implementation-guide.md` の作成（Part 1: 初学者向け、Part 2: 技術者向け）
2. `task-workflow-completed.md` への完了記録（must）
3. システム仕様書更新の確認（インターフェース変更なしのため更新不要）
4. 成果物一覧の記録

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                           | 内容           |
| ------------------ | ------------------------------------------------------------------------------ | -------------- |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   | システム全体像 |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | 完了タスク記録 |

## 実行手順

### ステップ 1: implementation-guide.md の作成

**ファイル**: `outputs/phase-12/implementation-guide.md`

#### Part 1: 初学者向け — 中学生レベルの例え話

**例え話: 消えてしまうエラーメッセージ**

ゲームでボスを倒そうとして失敗したとき、「失敗しました！もう一度やり直してください」というメッセージが出るとします。ところが、このメッセージを閉じる前に、ゲームが自動的に「メッセージを消す」という命令を実行してしまうと、メッセージが即座に消えてしまいます。

これが今回のバグです。スキル生成（AIを使って作業ツールを作る機能）が失敗したとき、エラーメッセージが画面に表示されます。しかし、バックグラウンドで「状態が変わった」という信号が届くたびに、プログラムがエラーメッセージを自動的に消していました。

修正後は、「失敗した（`phase: 'failed'`）」という信号が届いたときだけ、エラーメッセージを消す命令を実行しないようにしました。成功中・完了したときの信号が届いたときは、今まで通りエラーメッセージを消します。

**ビフォー・アフター**:

- 修正前: 「失敗」信号が届く → エラー表示 → 即座にエラーを消す（バグ）
- 修正後: 「失敗」信号が届く → エラー表示 → エラーはそのまま残る（正しい動作）

#### Part 2: 技術者向け

**問題箇所**:

```
SkillLifecyclePanel.tsx:539
setWorkflowError(null);  ← 'failed' フェーズでもエラーを消去する
```

`onWorkflowStateChanged` コールバックは `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` チャンネルのイベントを受信するたびに呼び出される。`phase: 'failed'` のスナップショットを受信した後も、このコールバックが再度呼ばれると `setWorkflowError(null)` でエラーがクリアされてしまう。

**修正内容**:

```typescript
// 修正前
return skillCreatorApi.onWorkflowStateChanged((snapshot) => {
  setWorkflowSnapshot(snapshot);
  setWorkflowError(null); // BUG: 無条件に呼ばれる
  if (snapshot.handoffBundle) {
    setHandoffGuidance(toHandoffGuidance(snapshot.handoffBundle));
  }
});

// 修正後
return skillCreatorApi.onWorkflowStateChanged((snapshot) => {
  setWorkflowSnapshot(snapshot);
  if (snapshot.phase !== "failed") {
    setWorkflowError(null); // 'failed' 以外のフェーズでのみエラーをクリア
  }
  if (snapshot.handoffBundle) {
    setHandoffGuidance(toHandoffGuidance(snapshot.handoffBundle));
  }
});
```

**技術的ポイント**:

- 変更量: 最小（2 行追加・0 行削除）
- `handoffBundle` 処理は `phase` 判定の影響を受けない（独立した `if` ブロック）
- React hooks deps（`useEffect` 依存配列）の変更なし
- インターフェース変更なし（Props・型定義・IPC チャンネルは全て変更なし）

### ステップ 2: task-workflow-completed.md への完了記録

**ファイル**: `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`

以下のエントリを追加する（`must` 優先度）:

```markdown
## TASK-FIX-LIFECYCLE-PANEL-ERROR-001

- **タスク名**: fix-step5-seq-lifecycle-panel-error
- **完了日**: 2026-04-01
- **内容**: SkillLifecyclePanel の `onWorkflowStateChanged` コールバックが `setWorkflowError(null)` を無条件に呼ぶバグを修正。`phase: 'failed'` 時のみエラーを保持するよう条件分岐を追加。
- **変更ファイル**: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`（+2 行）
- **テスト追加**: `SkillLifecyclePanel.error-persistence.test.tsx`（TC-EP-01〜10）
- **PR**: #XXXX
```

### ステップ 3: システム仕様書更新の確認

本タスクはインターフェース変更なし（Props・型定義・IPC チャンネルは全て変更なし）のため、以下の仕様書は更新不要:

| 仕様書                       | 更新要否 | 理由                                       |
| ---------------------------- | -------- | ------------------------------------------ |
| `security-electron-ipc.md`   | 不要     | IPC 変更なし                               |
| `architecture-overview.md`   | 不要     | アーキテクチャ変更なし（ロジック修正のみ） |
| `task-workflow-completed.md` | 必須     | タスク完了記録（ステップ 2 で実施）        |

### ステップ 4: 成果物一覧の記録

**ファイル**: `outputs/phase-12/documentation-changelog.md`

```markdown
## 2026-04-01

### TASK-FIX-LIFECYCLE-PANEL-ERROR-001: SkillLifecyclePanel エラー永続化バグ修正

**変更ファイル**:

- apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
  - `onWorkflowStateChanged` コールバック内の `setWorkflowError(null)` を `if (snapshot.phase !== 'failed')` で囲む

**追加テスト**:

- apps/desktop/src/renderer/components/skill/**tests**/SkillLifecyclePanel.error-persistence.test.tsx
  - TC-EP-01〜10: エラー永続化・エッジケース・回帰テスト

**修正内容**: phase: 'failed' 時にエラーが即座に消去されるバグの修正

**影響範囲**: SkillLifecyclePanel.tsx のみ（他コンポーネント・型定義・IPC 変更なし）

**PR**: #XXXX
```

## 多角的チェック観点

- `implementation-guide.md` の Part 1（初学者向け）が技術用語なしで説明されているか確認したか
- `task-workflow-completed.md` への記録が漏れていないか確認したか（must 優先度）
- システム仕様書の更新不要判断（インターフェース変更なし）が正しいか確認したか

## 成果物

| 成果物               | パス                                          | 説明                                      |
| -------------------- | --------------------------------------------- | ----------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | Part 1 初学者向け例え話 + Part 2 技術詳細 |
| ドキュメント変更履歴 | `outputs/phase-12/documentation-changelog.md` | 変更ファイル一覧と変更内容                |

## 完了条件

- [ ] `implementation-guide.md` の Part 1（初学者向け例え話）が完成している
- [ ] `implementation-guide.md` の Part 2（技術詳細）が完成している
- [ ] `task-workflow-completed.md` に TASK-FIX-LIFECYCLE-PANEL-ERROR-001 の完了が記録されている
- [ ] システム仕様書の更新不要判断（インターフェース変更なし）が `documentation-changelog.md` に明記されている

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（2 ファイル）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 13: PR作成 へ進む（ユーザーの明示承認後のみ）
