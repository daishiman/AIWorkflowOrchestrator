# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 13                             |
| Phase名    | PR作成                         |
| 前提Phase  | Phase 12                       |
| 後続Phase  | -                              |
| ステータス | 未実施                         |
| 作成日     | 2026-01-12                     |
| 機能名     | history-service-db-integration |

---

## 目的

`/ai:diff-to-pr` を使用してコミット・PR作成・CI確認を行う。

## 背景

Phase 1〜12で実装・テスト・ドキュメント作成が完了した。最終段階として、変更をコミットしPRを作成する。

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

### タスク1: ローカル確認

**目的**: PR作成前にローカルでの動作を確認する

**実行手順**:

1. ビルド確認:
   ```bash
   pnpm --filter @repo/desktop build
   ```
2. テスト確認:
   ```bash
   pnpm --filter @repo/desktop test
   ```
3. 型チェック確認:
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```
4. Lint確認:
   ```bash
   pnpm --filter @repo/desktop lint
   ```

**チェックリスト**:

- [ ] ビルドが成功する
- [ ] 全テストがパスする
- [ ] 型チェックがパスする
- [ ] Lintエラーがない

**期待される成果物**:

- ローカル確認結果

---

### タスク2: ユーザー許可の確認

**目的**: PR作成の許可をユーザーから得る

**実行手順**:

1. ユーザーに以下を確認:
   - 「PR作成を進めてもよいですか？」
2. ユーザーの明示的な許可を待つ
3. 許可が得られたら次のタスクへ

**期待される成果物**:

- ユーザー許可の記録

---

### タスク3: PR作成

**目的**: `/ai:diff-to-pr` を使用してPRを作成する

**実行手順**:

1. ユーザー許可後に `/ai:diff-to-pr` を実行
2. コミットメッセージの確認:

   ```
   feat(history): HistoryService データベース統合

   - shared HistoryServiceとElectron HistoryServiceの統合
   - ConversionRepository経由でのDB接続実装
   - 型変換アダプターの実装
   - 全52件以上のテストがパス

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
   ```

3. PR本文の確認:

   ```markdown
   ## Summary

   - HistoryServiceのスタブ実装をDB統合実装に置換
   - shared HistoryServiceとの統合完了
   - 全4メソッド（getFileHistory, getVersionDetail, getConversionLogs, restoreVersion）が動作

   ## Test plan

   - [ ] 全ユニットテストがパス
   - [ ] 全統合テストがパス
   - [ ] GUI環境で履歴表示を確認
   - [ ] バージョン復元機能を確認
   ```

**期待される成果物**:

- PR URL

---

### タスク4: CI確認

**目的**: CIが通過することを確認する

**実行手順**:

1. PRページでCIの状態を確認
2. 全CIジョブがパスすることを確認
3. 失敗した場合は原因を特定し修正

**期待される成果物**:

- CI確認結果

---

### タスク5: タスク完了処理

**目的**: タスクディレクトリを完了タスクフォルダに移動する

**実行手順**:

1. タスクディレクトリを移動:
   ```bash
   mv docs/30-workflows/history-service-db-integration/ docs/30-workflows/completed-tasks/
   ```
2. 未タスク指示書を削除（該当する場合）:
   ```bash
   rm docs/30-workflows/unassigned-task/task-history-service-db-integration.md
   ```
3. 移動をコミット:
   ```bash
   git add docs/30-workflows/
   git commit -m "docs(workflows): history-service-db-integrationをcompleted-tasksに移動"
   git push
   ```

**期待される成果物**:

- タスク完了処理の記録

---

## 参照資料

### スキル

| 参照資料   | パス                            | 内容         |
| ---------- | ------------------------------- | ------------ |
| diff-to-pr | `.claude/skills/ai:diff-to-pr/` | PR作成スキル |

---

## 成果物

| 成果物 | パス                          | 内容           |
| ------ | ----------------------------- | -------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL・CI結果 |

---

## 完了条件チェックリスト

| #   | 項目                                                 | 必須 |
| --- | ---------------------------------------------------- | ---- |
| 1   | ローカルでビルド・テスト・型チェック・Lintが全てパス | ✅   |
| 2   | ユーザーにPR作成の許可を確認済み                     | ✅   |
| 3   | PRが作成されている                                   | ✅   |
| 4   | CIが全て通過している                                 | ✅   |
| 5   | タスクディレクトリが `completed-tasks/` に移動済み   | ✅   |
| 6   | `artifacts.json` の `status` が `"completed"`        | ✅   |
| 7   | 未タスク指示書が削除済み（該当時）                   | 条件 |
| 8   | **本Phase内の全タスクを100%実行完了**                | ✅   |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonを更新（status: "completed"）

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（タスク完了）

---

## タスク完了

PRがマージされたら、本タスクは完了です。
