# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 13                           |
| Phase名    | PR作成                       |
| 前提Phase  | Phase 12（ドキュメント更新） |
| 後続Phase  | -（タスク完了）              |
| ステータス | 未実施                       |
| 作成日     | 2026-01-10                   |
| 機能名     | community-summarization      |

---

## 目的

`/ai:diff-to-pr` スキルを使用してコミット・PR作成・CI確認を行い、タスクを完了する。

## 背景

Phase 1〜12で実装・テスト・ドキュメント更新が完了したため、PRを作成してマージ準備を行う。

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

### タスク1: ローカル確認【PR作成前に必須】

**目的**: ローカルでビルド・テスト・型チェック・Lintが全てパスすることを確認

**実行手順**:

1. ビルド確認:
   ```bash
   pnpm --filter @repo/shared build
   ```
2. テスト確認:
   ```bash
   pnpm --filter @repo/shared test
   ```
3. 型チェック確認:
   ```bash
   pnpm --filter @repo/shared typecheck
   ```
4. Lint確認:
   ```bash
   pnpm --filter @repo/shared lint
   ```
5. 全てパスすることを確認

**期待される成果物**:

- 確認結果（全てパス）

---

### タスク2: ユーザー許可確認【必須】

**目的**: ユーザーにPR作成の許可を確認

**実行手順**:

1. ユーザーに以下を報告:
   - ローカル確認結果（全てパス）
   - 変更内容のサマリー
   - 作成予定のPRタイトル
2. ユーザーの明示的な許可を取得
3. 許可を得た場合のみタスク3へ進む

**期待される成果物**:

- ユーザーからの許可

---

### タスク3: PR作成（ユーザー許可後）

**目的**: `/ai:diff-to-pr` スキルを使用してPRを作成

**実行手順**:

1. `/ai:diff-to-pr` スキルを実行:
   - 変更差分の確認
   - コミットメッセージ生成
   - PR作成
2. PRタイトル例:
   ```
   feat(graph): implement community summarization service
   ```
3. PR本文に以下を含める:
   - 実装内容のサマリー
   - テスト結果
   - 関連タスクID（CONV-08-03）

**期待される成果物**:

- GitHub PR URL

---

### タスク4: CI確認

**目的**: CIが全てパスすることを確認

**実行手順**:

1. PR上でCIの実行を確認
2. 全CIジョブがパスすることを確認:
   - [ ] Build
   - [ ] Test
   - [ ] Lint
   - [ ] Type Check
3. 失敗がある場合は修正

**期待される成果物**:

- `outputs/phase-13/pr-info.md`

---

### タスク5: タスクディレクトリ移動

**目的**: タスクディレクトリをcompleted-tasksに移動

**実行手順**:

1. タスクディレクトリを移動:
   ```bash
   mv docs/30-workflows/community-summarization/ docs/30-workflows/completed-tasks/
   ```
2. 移動を確認:
   ```bash
   ls docs/30-workflows/completed-tasks/ | grep community-summarization
   ```
3. 未タスク指示書を削除（該当する場合）:
   ```bash
   rm docs/30-workflows/unassigned-task/task-08-03-community-summarization.md
   ```
4. 変更をコミット:
   ```bash
   git add docs/30-workflows/
   git commit -m "docs(workflows): community-summarizationをcompleted-tasksに移動"
   git push
   ```

**期待される成果物**:

- タスクディレクトリの移動完了

---

### タスク6: artifacts.json最終更新

**目的**: タスク完了ステータスを記録

**実行手順**:

1. `artifacts.json` を更新:
   ```json
   {
     "status": "completed",
     "completedAt": "2026-01-XX..."
   }
   ```
2. Phase 13のステータスを更新

**期待される成果物**:

- `artifacts.json` 更新完了

---

## 参照資料

| 参照資料       | パス                                            | 内容                 |
| -------------- | ----------------------------------------------- | -------------------- |
| Phase 12成果物 | `outputs/phase-12/`                             | ドキュメント更新記録 |
| 実装コード     | `packages/shared/src/services/graph/`           | 実装ファイル         |
| テストコード   | `packages/shared/src/services/graph/__tests__/` | テストファイル       |

---

## 成果物

| 成果物 | パス                          | 内容           |
| ------ | ----------------------------- | -------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL、CI結果 |

---

## 完了条件チェックリスト

| #   | 項目                                                     | 必須 |
| --- | -------------------------------------------------------- | ---- |
| 1   | **ローカルでビルド・テスト・型チェック・Lintが全てパス** | ✅   |
| 2   | **ユーザーにPR作成の許可を確認済み**                     | ✅   |
| 3   | PRが作成されている                                       | ✅   |
| 4   | CIが全て通過している                                     | ✅   |
| 5   | タスクディレクトリが `completed-tasks/` に移動済み       | ✅   |
| 6   | `artifacts.json` の `status` が `"completed"`            | ✅   |
| 7   | （該当時）未タスク指示書が削除済み                       | 条件 |
| 8   | **本Phase内の全タスクを100%完了**                        | ✅   |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` のPhase 13ステータスを更新
- [ ] タスク全体の `status` を `completed` に更新

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: なし（タスク完了）

---

## タスク完了

このPhaseが完了すると、CONV-08-03（コミュニティ要約生成）タスクは完了となります。

マージはユーザーがGitHub UIで手動で実行してください。
