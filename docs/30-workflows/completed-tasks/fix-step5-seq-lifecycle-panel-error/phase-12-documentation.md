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

修正内容を実装ガイドに記録し、Phase 12 の必須 5 タスクを current facts で閉じる。インターフェース変更なしのため Step 2 のドメイン仕様追加は不要だが、Step 1-A〜1-C の台帳・ログ・教訓・インデックス同期は必須とする。

## 実行タスク

1. `implementation-guide.md` の作成（Part 1: 初学者向け、Part 2: 技術者向け）
2. `task-workflow-completed.md` / `task-workflow-backlog.md` / `LOGS.md` / lessons / generated index の same-wave sync
3. `documentation-changelog.md` の作成
4. `unassigned-task-detection.md` の作成（0件でも必須）
5. `skill-feedback-report.md` の作成（改善点なしでも必須）

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                           | 内容           |
| ------------------ | ------------------------------------------------------------------------------ | -------------- |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   | システム全体像 |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | 完了タスク記録 |

## 統合テスト連携

- 前 Phase の成果物を確認したうえで、`SkillLifecyclePanel.tsx` と `SkillLifecyclePanel.error-persistence.test.tsx` の入力・出力の対応を崩さない。
- `currentPhase` 判定と `handoffBundle` 処理が独立していることを次 Phase に引き継ぐ。
- Phase 2 の成果物 design-topology.md、Phase 5 の修正結果、Phase 6 の成果物、Phase 7 の成果物、Phase 8 の成果物、Phase 9 の成果物、Phase 10 の成果物、Phase 11 の成果物を前提にドキュメントを更新する。

## 実行手順

### ステップ 1: implementation-guide.md の作成

**ファイル**: `outputs/phase-12/implementation-guide.md`

#### Part 1: 初学者向け — 中学生レベルの例え話

**例え話: 消えてしまうエラーメッセージ**

ゲームでボスを倒そうとして失敗したとき、「失敗しました！もう一度やり直してください」というメッセージが出るとします。ところが、このメッセージを閉じる前に、ゲームが自動的に「メッセージを消す」という命令を実行してしまうと、メッセージが即座に消えてしまいます。

これが今回のバグです。スキル生成（AIを使って作業ツールを作る機能）が失敗したとき、エラーメッセージが画面に表示されます。しかし、バックグラウンドで「状態が変わった」という信号が届くたびに、プログラムがエラーメッセージを自動的に消していました。

修正後は、`currentPhase: 'handoff'` の信号が届いたときだけ、エラーメッセージを消す命令を実行しないようにしました。成功中・完了したときの信号が届いたときは、今まで通りエラーメッセージを消します。

**ビフォー・アフター**:

- 修正前: 「失敗」信号が届く → エラー表示 → 即座にエラーを消す（バグ）
- 修正後: 「失敗」信号が届く → エラー表示 → エラーはそのまま残る（正しい動作）

#### Part 2: 技術者向け

**問題箇所**:

```
SkillLifecyclePanel.tsx:539
setWorkflowError(null);  ← 'handoff' フェーズでもエラーを消去する
```

`onWorkflowStateChanged` コールバックは `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` チャンネルのイベントを受信するたびに呼び出される。`currentPhase: 'handoff'` のスナップショットを受信した後も、このコールバックが再度呼ばれると `setWorkflowError(null)` でエラーがクリアされてしまう。

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
  if (snapshot.currentPhase !== "handoff") {
    setWorkflowError(null); // 'handoff' 以外のフェーズでのみエラーをクリア
  }
  if (snapshot.handoffBundle) {
    setHandoffGuidance(toHandoffGuidance(snapshot.handoffBundle));
  }
});
```

**技術的ポイント**:

- 変更量: 最小（2 行追加・0 行削除）
- `handoffBundle` 処理は `currentPhase` 判定の影響を受けない（独立した `if` ブロック）
- React hooks deps（`useEffect` 依存配列）の変更なし
- インターフェース変更なし（Props・型定義・IPC チャンネルは全て変更なし）

### ステップ 2: システム仕様書の same-wave sync

**ファイル**: `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`

以下を同一ターンで更新する（`must` 優先度）:

```markdown
- `task-workflow-backlog.md`: 旧 row（`phase: 'failed'` / 旧 path）を completed 扱いへ更新
- `task-workflow-completed.md`: TASK-FIX-LIFECYCLE-PANEL-ERROR-001 の completed record を追加
- `LOGS.md` x2: close-out sync を追加
- lessons learned: `handoff` / stale vocabulary / NON_VISUAL evidence の教訓を追加
- generated index: `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
```

### ステップ 3: ドキュメント更新履歴

**ファイル**: `outputs/phase-12/documentation-changelog.md`

Task 1〜5 の結果、Step 1-A〜1-C の更新先、テスト環境ブロッカーの有無を 1 ファイルへ要約する。

### ステップ 4: 未タスク検出レポート

**ファイル**: `outputs/phase-12/unassigned-task-detection.md`

対象:

- Phase 3 / 10 のレビュー指摘
- Phase 11 の blocker / スコープ外課題
- コードコメントの TODO/FIXME/HACK/XXX

0件でも「確認した範囲」「0件である理由」「既知の環境問題を新規未タスク化しない理由」を明記する。

### ステップ 5: スキルフィードバックレポート

**ファイル**: `outputs/phase-12/skill-feedback-report.md`

対象:

- `task-specification-creator` 側: NON_VISUAL task に placeholder PNG を残さないルール、manual-test-result に blocker を必須記録するルール
- `aiworkflow-requirements` 側: `handoff` を current vocabulary とする close-out sync の徹底

## 多角的チェック観点

- `implementation-guide.md` の Part 1（初学者向け）が技術用語なしで説明されているか確認したか
- Step 1-A〜1-C の台帳同期が changelog で代替されていないか確認したか
- `NON_VISUAL` task の Phase 11 証跡が placeholder ではなく blocker / 実測 / 代替事実で構成されているか確認したか
- `unassigned-task-detection.md` と `skill-feedback-report.md` が 0件・改善済みでも出力されているか確認したか

## 成果物

| 成果物               | パス                                            | 説明                                             |
| -------------------- | ----------------------------------------------- | ------------------------------------------------ |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1 初学者向け例え話 + Part 2 技術詳細        |
| ドキュメント変更履歴 | `outputs/phase-12/documentation-changelog.md`   | Task 1〜5 と Step 1-A〜1-C の更新結果            |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md` | 0件でも必須。確認範囲と判断理由を記録            |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | スキル改善点の反映有無と current wave の処理結果 |

## 完了条件

- [ ] `implementation-guide.md` の Part 1（初学者向け例え話）が完成している
- [ ] `implementation-guide.md` の Part 2（技術詳細）が完成している
- [ ] `task-workflow-completed.md` に TASK-FIX-LIFECYCLE-PANEL-ERROR-001 の完了が記録されている
- [ ] `task-workflow-backlog.md` の旧 row が current facts へ同期されている
- [ ] `documentation-changelog.md` に Task 1〜5 と Step 1-A〜1-C の結果が記録されている
- [ ] `unassigned-task-detection.md` と `skill-feedback-report.md` が存在する

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（4 ファイル）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 13: PR作成 へ進む（ユーザーの明示承認後のみ）
