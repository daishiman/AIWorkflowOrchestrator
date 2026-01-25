# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容            |
| ---------- | --------------- |
| Phase      | 13              |
| Phase名    | PR作成          |
| 前提Phase  | Phase 12        |
| 後続Phase  | なし（完了）    |
| ステータス | 未実施          |
| 作成日     | 2026-01-25      |
| 機能名     | IPCチャネル定義 |

---

## 目的

`/ai:diff-to-pr` でコミット・PR作成・CI確認を行い、タスクを完了する。

## 背景

本タスクの成果物をmainブランチにマージするためのPRを作成する。
PR作成はユーザーの明示的な許可を得てから実行すること。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル確認チェックリスト

**目的**: PR作成前にローカルでの最終確認を行う

**実行手順**:

1. 以下のチェックリストを全て確認する
2. 全項目がPASSであることを確認する

**ローカル確認チェックリスト**:

| #   | 確認項目             | コマンド                                | 結果 |
| --- | -------------------- | --------------------------------------- | ---- |
| 1   | ビルドが成功する     | `pnpm --filter @repo/desktop build`     | [ ]  |
| 2   | 全テストがパスする   | `pnpm --filter @repo/desktop test`      | [ ]  |
| 3   | 型チェックがパスする | `pnpm --filter @repo/desktop typecheck` | [ ]  |
| 4   | Lintエラーがない     | `pnpm --filter @repo/desktop lint`      | [ ]  |

**期待される成果物**:

- ローカル確認完了

---

### タスク2: 変更内容の確認

**目的**: PR対象の変更内容を確認する

**実行手順**:

1. git statusで変更ファイルを確認する
2. git diffで変更内容を確認する
3. 変更が期待通りであることを確認する

**検証コマンド**:

```bash
# 変更ファイル確認
git status

# 変更内容確認
git diff
```

**確認項目**:

- [ ] 変更ファイルが `apps/desktop/src/preload/channels.ts` のみ
- [ ] 変更内容が設計通り
- [ ] 不要な変更が含まれていない

**期待される成果物**:

- 変更内容確認完了

---

### タスク3: ユーザー許可の取得

**目的**: PR作成の許可を得る

**重要**: PR作成は自動実行しない。必ずユーザーの明示的な許可を得ること。

**確認内容**:

1. 変更内容をユーザーに報告する
2. PR作成の許可を求める
3. 許可を得てからPhase 13タスク4を実行する

**禁止事項**:

- [ ] ユーザー確認なしでPRを作成しない
- [ ] ユーザー確認なしでpushしない
- [ ] ユーザー確認なしで`/ai:diff-to-pr`を実行しない

**期待される成果物**:

- ユーザー許可の記録

---

### タスク4: PR作成（ユーザー許可後）

**目的**: PRを作成する

**前提条件**: タスク3でユーザー許可を取得済み

**実行手順**:

1. `/ai:diff-to-pr` スキルを実行する
2. PRが作成されたことを確認する
3. CIが開始されたことを確認する

**PR作成コマンド**:

```bash
# /ai:diff-to-pr スキルを使用
# または手動で以下を実行

# コミット
git add apps/desktop/src/preload/channels.ts
git commit -m "feat(ipc): add skill management IPC channels (TASK-4-1)

- Add SKILL_SCAN, SKILL_UPDATE, SKILL_COMPLETE, SKILL_ERROR channels
- Add SKILL_PERMISSION_REQUEST, SKILL_PERMISSION_RESPONSE channels
- Register channels in ALLOWED_INVOKE_CHANNELS and ALLOWED_ON_CHANNELS

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# プッシュ
git push -u origin task/TASK-4-1-ipc-channels

# PR作成
gh pr create --title "feat(ipc): add skill management IPC channels (TASK-4-1)" --body "## Summary
- Add new IPC channels for skill management feature
- SKILL_SCAN: Re-scan skill directories
- SKILL_UPDATE: Update skill information
- SKILL_COMPLETE: Execution completion notification
- SKILL_ERROR: Error notification
- SKILL_PERMISSION_REQUEST: Permission request (Main → Renderer)
- SKILL_PERMISSION_RESPONSE: Permission response (Renderer → Main)

## Test plan
- [x] TypeScript compilation passes
- [x] ESLint passes
- [x] Unit tests pass
- [x] Manual verification of channel references

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

**期待される成果物**:

- 作成されたPR URL

---

### タスク5: CI確認

**目的**: CIが成功することを確認する

**実行手順**:

1. GitHub ActionsでCIが実行されていることを確認する
2. CIが成功することを確認する
3. 失敗した場合は修正する

**確認項目**:

- [ ] CIが開始された
- [ ] CIが成功した
- [ ] PRがマージ可能状態である

**期待される成果物**:

- CI成功確認

---

## 参照資料

| 参照資料             | パス                                          | 内容           |
| -------------------- | --------------------------------------------- | -------------- |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |
| 変更対象ファイル     | `apps/desktop/src/preload/channels.ts`        | PR対象         |

---

## 成果物

| 成果物 | パス/URL       | 内容         |
| ------ | -------------- | ------------ |
| PR     | GitHub PR URL  | 作成されたPR |
| CI結果 | GitHub Actions | CI実行結果   |

---

## 完了条件

- [ ] ローカル確認チェックリストを全て完了した
- [ ] 変更内容を確認した
- [ ] ユーザー許可を取得した
- [ ] PRを作成した
- [ ] CIが成功した
- [ ] PRがマージ可能状態である

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 重要な注意事項

### PR作成に関する禁止事項

| 禁止事項                                     | 理由                                           |
| -------------------------------------------- | ---------------------------------------------- |
| 勝手にPRを作成する                           | レビュー前の変更がリモートに反映されてしまう   |
| ユーザー確認なしで`/ai:diff-to-pr`を実行する | 意図しないブランチやコミットが作成される可能性 |
| ローカル確認をスキップする                   | 動作確認されていないコードがPRに含まれる       |

### マージに関する注意

**⚠️ マージはユーザーがGitHub UIで手動実行すること**

本Phaseではマージは実行しない。PRの作成とCIの確認までが対象。

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: なし（TASK-4-1完了）

---

## タスク完了

Phase 13完了後、TASK-4-1は完了となります。

後続タスク（ブロック解除）:

- TASK-4-2: IPC Handlers実装
- TASK-5-1: Preload API実装
