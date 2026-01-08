# Phase 13: PR作成

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase番号  | 13                           |
| Phase名    | PR作成                       |
| 目的       | コミット・PR・CI確認         |
| 前提Phase  | Phase 12（ドキュメント更新） |
| 後続Phase  | マージ準備完了               |
| ステータス | 未実施                       |

---

## 目的

全ての変更をコミットし、Pull Requestを作成してCI通過を確認する。

---

## 使用スラッシュコマンド

| コマンド         | 説明                                 |
| ---------------- | ------------------------------------ |
| `/ai:diff-to-pr` | 差分確認・コミット・PR作成を一括実行 |

**実行方法**:

```
/ai:diff-to-pr
```

---

## 成果物

| 成果物       | 説明           | 配置先         |
| ------------ | -------------- | -------------- |
| Git コミット | 変更のコミット | Gitリポジトリ  |
| Pull Request | GitHub PR      | GitHub UI      |
| CI結果       | CI/CD実行結果  | GitHub Actions |

---

## 実行手順

### Step 1: 変更確認

```bash
# 変更ファイル確認
git status

# 差分確認
git diff
```

### Step 2: PR作成

`/ai:diff-to-pr` スラッシュコマンドを実行してPRを作成する。

このコマンドが自動的に以下を実行:

1. 変更差分の確認
2. コミットメッセージ生成
3. PR作成
4. CI結果確認

### Step 3: CI確認

CIが全て通過することを確認する。

**CI確認項目**:

| CI項目            | 期待結果 | 実績 |
| ----------------- | -------- | ---- |
| ESLint            | Pass     | TBD  |
| TypeScript        | Pass     | TBD  |
| Unit Tests        | Pass     | TBD  |
| Integration Tests | Pass     | TBD  |
| Build             | Pass     | TBD  |

### Step 4: タスク完了処理

CI通過後、タスクディレクトリを完了タスクフォルダに移動する。

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/agent-sdk-integration/ docs/30-workflows/completed-tasks/

# 2. artifacts.json のステータスを completed に更新
# (手動で編集)

# 3. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): agent-sdk-integrationをcompleted-tasksに移動"
git push
```

---

## 完了条件

- [ ] PRが作成されている
- [ ] CIが全て通過している
- [ ] タスクディレクトリが `completed-tasks/` に移動済み
- [ ] `artifacts.json` の `status` が `"completed"`
- [ ] （該当時）未タスク指示書が `docs/30-workflows/unassigned-task/` に作成済み
- [ ] **本Phase内の全作業を100%完了**

---

## PR情報

| 項目               | 内容                                        |
| ------------------ | ------------------------------------------- |
| PRタイトル         | feat(agent): Claude Agent SDK統合基盤の構築 |
| ターゲットブランチ | main                                        |
| ソースブランチ     | feat/agent-sdk-integration                  |

**PRサマリーテンプレート**:

```markdown
## Summary

- Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) をElectronアプリに統合
- IPC通信を介したRenderer ↔ Main プロセス間のSDK呼び出し基盤を構築
- セッション管理機能を実装

## Changes

- `packages/shared/src/agent/` - Agent SDKクライアント・セッションマネージャー
- `apps/desktop/src/main/agent/` - IPCハンドラー
- `apps/desktop/src/preload/` - プリロードAPI

## Test plan

- [ ] ユニットテスト: `pnpm --filter @repo/shared test:run`
- [ ] 統合テスト: `pnpm --filter @repo/desktop test:integration`
- [ ] 手動テスト: アプリ起動後、Agent SDK経由でクエリ送信

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## スキルフィードバック記録

| スキル/コマンド | 結果    | 備考              |
| --------------- | ------- | ----------------- |
| /ai:diff-to-pr  | pending | Phase完了後に記録 |

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 変更確認（git status/diff）
2. `/ai:diff-to-pr`の実行
3. PR作成の確認
4. CI結果の確認
5. タスク完了処理（completed-tasksへ移動）
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキル/コマンドを100%実行完了
- [ ] PRが作成されている
- [ ] CIが全て通過している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] artifacts.jsonのstatusがcompletedになっている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-sdk-integration --phase 13
```

---

## 備考

- CI失敗時は該当Phaseに戻って修正する
- PRレビューでの指摘は即座に対応する
- マージ後は元の未タスク指示書 (`docs/30-workflows/unassigned-task/task-agent-sdk-integration.md`) を削除する
