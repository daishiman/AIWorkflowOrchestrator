# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 13                     |
| Phase名    | PR作成                 |
| 前提Phase  | Phase 12               |
| 後続Phase  | なし                   |
| ステータス | 未実施                 |
| 作成日     | 2026-01-10             |
| 機能名     | history-ui-integration |

---

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 背景

Phase 12までで実装・テスト・ドキュメント化が完了。本フェーズでPRを作成し、CIを通過させ、タスクを完了させる。

---

## ⚠️ PR作成に関する重要な注意【必須確認】

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                                     | 理由                                           |
| -------------------------------------------- | ---------------------------------------------- |
| 勝手にPRを作成する                           | レビュー前の変更がリモートに反映されてしまう   |
| ユーザー確認なしで`/ai:diff-to-pr`を実行する | 意図しないブランチやコミットが作成される可能性 |
| ローカル確認をスキップする                   | 動作確認されていないコードがPRに含まれる       |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル確認【必須】

**目的**: PR作成前にローカルで動作確認

**確認チェックリスト**:

| #   | 確認項目             | コマンド                                     | 結果 |
| --- | -------------------- | -------------------------------------------- | ---- |
| 1   | ビルドが成功する     | `pnpm --filter @repo/desktop build`          |      |
| 2   | 全テストがパスする   | `pnpm --filter @repo/desktop test`           |      |
| 3   | 型チェックがパスする | `pnpm --filter @repo/desktop typecheck`      |      |
| 4   | Lintエラーがない     | `pnpm --filter @repo/desktop lint`           |      |
| 5   | 実際の動作確認       | `pnpm --filter @repo/desktop dev` で手動確認 |      |

**期待される成果物**:

- ローカル確認完了

---

### タスク2: 変更サマリー作成

**目的**: 変更内容をユーザーに提示

**変更サマリーテンプレート**:

```markdown
## 変更サマリー

### 追加ファイル

- `apps/desktop/src/main/ipc/historyHandlers.ts`: IPCハンドラー
- `apps/desktop/src/renderer/pages/HistoryPage.tsx`: 履歴ページ
- `apps/desktop/src/renderer/pages/__tests__/HistoryPage.test.tsx`: テスト

### 変更ファイル

- `apps/desktop/src/main/preload.ts`: historyAPI追加
- `apps/desktop/src/renderer/global.d.ts`: HistoryAPI型追加
- `apps/desktop/src/renderer/App.tsx`: ルーティング追加

### テスト結果

- ユニットテスト: 全パス
- 統合テスト: 全パス
- カバレッジ: Line XX%, Branch XX%, Function XX%

### 手動テスト結果

- 機能テスト: 全パス
- UI/UXテスト: 全パス
```

**期待される成果物**:

- 変更サマリー

---

### タスク3: ユーザー許可確認【必須】

**目的**: PR作成の許可を得る

**確認内容**:

- 変更サマリーをユーザーに提示
- PRを作成してよいか確認
- 明示的な許可を得る

**重要**: ユーザーから「はい」「OK」「進めて」等の明示的な許可を得るまで次のタスクに進まない。

---

### タスク4: PR作成

**目的**: `/ai:diff-to-pr`を使用してPRを作成

**実行手順**:

1. ユーザーの許可を確認済みであることを再確認
2. `/ai:diff-to-pr`を実行
3. PR URLを取得

**フォールバック**（`/ai:diff-to-pr`が使えない場合）:

```bash
# 変更をステージング
git add .

# コミット
git commit -m "feat(desktop): 履歴UIコンポーネントをアプリケーションに統合

- preloadスクリプトにhistoryAPIを追加
- IPCハンドラー（historyHandlers.ts）を実装
- HistoryPageコンポーネントを作成
- ルーティングを設定
- 統合テストを追加

Refs: task-req-history-integration-001

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# プッシュ
git push -u origin feature/history-ui-integration

# PR作成
gh pr create --title "feat(desktop): 履歴UIコンポーネントをアプリケーションに統合" --body "$(cat <<'EOF'
## Summary
- 履歴UIコンポーネント（CONV-05-03）をElectronアプリケーションに統合
- preloadスクリプト、IPCハンドラー、HistoryPage、ルーティングを実装
- 統合テストを追加し、カバレッジ基準を達成

## Test plan
- [ ] 履歴ページへの遷移を確認
- [ ] バージョン選択で詳細パネルが表示されることを確認
- [ ] ログフィルタが動作することを確認
- [ ] バージョン復元が正常に動作することを確認
- [ ] DevToolsにエラーがないことを確認

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**期待される成果物**:

- PR URL

---

### タスク5: CI確認

**目的**: CIが通過することを確認

**確認手順**:

1. PR URLにアクセス
2. CIステータスを確認
3. 全チェックがグリーンになることを確認

**期待される成果物**:

- CI通過確認

---

### タスク6: タスク完了処理

**目的**: タスクディレクトリをcompleted-tasksに移動

**実行手順**:

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/history-ui-integration/ docs/30-workflows/completed-tasks/

# 未タスク指示書を削除（該当する場合）
rm docs/30-workflows/unassigned-task/task-history-ui-integration.md

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep history-ui-integration

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): history-ui-integrationをcompleted-tasksに移動"
git push
```

**期待される成果物**:

- タスクディレクトリ移動完了

---

## 参照資料

| 参照資料             | パス                                           | 内容           |
| -------------------- | ---------------------------------------------- | -------------- |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-update-log.md` | Phase 12成果物 |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`       | Phase 11成果物 |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`      | Phase 10成果物 |

---

## 成果物

| 成果物 | パス                          | 内容     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

---

## 完了条件

- [ ] ローカルでビルド・テスト・型チェック・Lintが全てパス
- [ ] **ユーザーにPR作成の許可を確認済み**
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスクディレクトリが `completed-tasks/` に移動済み
- [ ] `artifacts.json` の `status` が `"completed"`
- [ ] 未タスク指示書が削除済み（該当する場合）
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonが更新されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. ローカルでの動作確認
2. ユーザーへのPR作成許可確認
3. PR作成（ユーザー許可後）
4. CI通過確認
5. タスクディレクトリ移動
6. 未タスク指示書削除（該当する場合）
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/history-ui-integration --phase 13
```

---

## タスク完了フロー

```
Phase 1〜12 完了
    ↓
【必須】ローカルでの動作確認
    ↓
【必須】ユーザーにPR作成の許可を確認
    ↓
ユーザー許可後: PR作成（/ai:diff-to-pr 使用）
    ↓
CI通過確認
    ↓
タスクディレクトリを completed-tasks/ に移動
    ↓
（該当する場合）未タスク指示書を削除
    ↓
変更をコミット・プッシュ
    ↓
ワークフロー完了
```

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（ワークフロー完了）

---

## 次のPhase

なし（ワークフロー完了）

タスク完了後、PRがマージされたら本タスクは完了です。
