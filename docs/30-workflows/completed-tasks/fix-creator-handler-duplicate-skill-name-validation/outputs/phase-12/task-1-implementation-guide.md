# タスク 1: 実装ガイド

## Part 1: 中学生向け説明

### Bug 1: 同じ受付番号を 2 回登録してしまう話

受付の列で、同じ整理券番号を 2 回配ってしまうとします。
2 回目で「もう使われています」と止まってしまうと、
後ろに並んでいた人たち全員が受付できません。

今回の修正は、同じ番号を 2 回並べないようにすることです。
最初の 1 回だけを残し、後ろの人たちがちゃんと進めるようにしました。

### Bug 2: 名前札をきれいな形にそろえる話

箱に貼る名前札に、ひらがなや大文字や記号が混ざっていると、
ラベル機械がうまく読めないことがあります。

そこで、まず小文字にそろえ、使えない記号は線に変え、
余計な線は 1 本にまとめ、端にだけ残った線は外します。
そうすると、機械が読める形に整います。

---

## Part 2: 開発者向け詳細

### Bug 1: `registerRuntimeSkillCreatorHandlers()` の重複登録

**ファイル**: `apps/desktop/src/main/ipc/creatorHandlers.ts`

`registerRuntimeSkillCreatorHandlers()` 内で
`IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS` の `ipcMain.handle()` が
2 回登録されていた。2 回目のブロック（約 35 行）を削除した。

影響整理:

- 影響を受けていたハンドラ数: 14（重複以降が全て未登録になっていた）
- 修正後の登録チャンネル数: 16（全て正常登録）
- `unregisterRuntimeSkillCreatorHandlers()` のシグネチャ変更: なし

### Bug 2: `toWizardSkillName()` と公開経路の一意化

**ファイル**: `apps/desktop/src/main/services/skill/SkillService.ts`

`toWizardSkillName()` を以下の順序で正規化するよう修正した。

1. 先頭 50 文字で切る
2. 前後の空白を除去する
3. 小文字化する
4. `/[^a-z0-9-]/g` で非許容文字を `-` に置換する
5. `/-+/g` で連続ハイフンを 1 本にする
6. `/^-+|-+$/g` で端のハイフンを除去する
7. 空文字なら `"new-skill"` を返す

公開経路 `createSkillFromWizard()` では、`resolveUniqueSkillName()` が
`new-skill` の衝突を検出した場合に `new-skill-2` を選ぶ。

### Phase 7 追加テスト

**ファイル**: `apps/desktop/src/main/ipc/__tests__/creatorHandlers.governanceState.test.ts`

新規テストファイル（12 テスト）を追加し、以下のカバレッジを確保した。

- `getGovernanceState` ハンドラ: success / null service / エラースロー
- `cleanupExpiredSessions`: null service パス
- `deleteSession`: null service パス
- `resumeSession`: null service / not_found / incompatible / expired / undefined パス
- `getSessionDetail`: null service パス

### Phase 8 リファクタリング

`toWizardSkillName()` に JSDoc を追加し、`init_skill.js` バリデーション仕様
`/^[a-z0-9]+(-[a-z0-9]+)*$/` との対応を明文化した。
