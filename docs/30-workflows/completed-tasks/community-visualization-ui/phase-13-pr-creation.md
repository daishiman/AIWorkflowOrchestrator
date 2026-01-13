# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 13                         |
| Phase名    | PR作成                     |
| 前提Phase  | Phase 12                   |
| 後続Phase  | -（完了）                  |
| ステータス | 未実施                     |
| 作成日     | 2026-01-13                 |
| 機能名     | community-visualization-ui |

---

## 目的

実装完了後、ローカル確認を経てユーザーの許可を得た上でPR作成、CI通過を確認し、タスクを完了状態にする。

## 背景

Phase 1〜12の全作業が完了した。最終的にコードをコミットし、Pull Requestを作成してCI/CDパイプラインを通過させる。

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

### タスク1: ローカル確認チェックリスト

**目的**: PR作成前にローカルで全ての品質チェックを実行する

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
4. Lintチェック確認:
   ```bash
   pnpm --filter @repo/desktop lint
   ```
5. 動作確認（該当する場合）:

   ```bash
   pnpm --filter @repo/desktop dev
   ```

   - コミュニティ可視化画面が表示されること
   - 基本機能が動作すること

**確認チェックリスト**:

| #   | 確認項目                       | コマンド                                     | 結果 |
| --- | ------------------------------ | -------------------------------------------- | ---- |
| 1   | ビルドが成功する               | `pnpm --filter @repo/desktop build`          | ⬜   |
| 2   | 全テストがパスする             | `pnpm --filter @repo/desktop test`           | ⬜   |
| 3   | 型チェックがパスする           | `pnpm --filter @repo/desktop typecheck`      | ⬜   |
| 4   | Lintエラーがない               | `pnpm --filter @repo/desktop lint`           | ⬜   |
| 5   | 実際の動作確認（該当する場合） | `pnpm --filter @repo/desktop dev` で手動確認 | ⬜   |

**期待される成果物**:

- ローカル確認完了

---

### タスク2: ユーザーへのPR作成許可確認

**目的**: PR作成の許可をユーザーから得る

**実行手順**:

1. ユーザーに以下を報告:
   - ローカル確認の結果
   - コミット予定の変更内容
   - PR作成の準備完了状態
2. ユーザーの明示的な許可を待つ
3. 許可を得てからタスク3へ進む

**確認メッセージ例**:

```
ローカル確認が全て完了しました。
- ビルド: ✅ 成功
- テスト: ✅ 全て成功
- 型チェック: ✅ エラーなし
- Lint: ✅ エラーなし

PR作成の準備が完了しています。
PR作成を実行してもよろしいですか？
```

**期待される成果物**:

- ユーザーからの許可

---

### タスク3: PR作成（ユーザー許可後）

**目的**: `/ai:diff-to-pr` スキルを使用してPRを作成する

**実行手順**:

1. `/ai:diff-to-pr` スキルを実行:
   ```
   /ai:diff-to-pr
   ```
2. スキルが実行する内容:
   - 変更差分の確認
   - コミットメッセージ生成
   - PR作成
   - CI結果確認

**PR情報（参考）**:

- **ブランチ名**: `task/conv-08-05-community-visualization-ui`
- **ベースブランチ**: `main`
- **タイトル**: `feat(ui): implement community visualization UI (CONV-08-05)`
- **概要**:
  - コミュニティ構造のグラフ/ツリー表示
  - コミュニティ詳細パネル（要約・メンバー表示）
  - レベルフィルタリング・検索機能
  - アクセシビリティ対応

**期待される成果物**:

- 作成されたPR

---

### タスク4: CI通過確認

**目的**: CIパイプラインが全て成功することを確認する

**実行手順**:

1. PRページでCIステータスを確認
2. 全CIジョブが成功することを確認:
   - lint
   - typecheck
   - test
   - build
3. 失敗がある場合は修正してコミット

**期待される成果物**:

- CI全成功

---

### タスク5: タスク完了処理

**目的**: タスクディレクトリを完了状態に移動する

**実行手順**:

1. タスクディレクトリを `completed-tasks/` に移動:
   ```bash
   mv docs/30-workflows/community-visualization-ui/ docs/30-workflows/completed-tasks/
   ```
2. 移動を確認:
   ```bash
   ls docs/30-workflows/completed-tasks/ | grep community-visualization-ui
   ```
3. 元の未タスク指示書を削除:
   ```bash
   rm docs/30-workflows/unassigned-task/task-08-05-community-visualization-ui.md
   ```
4. 変更をコミット:
   ```bash
   git add docs/30-workflows/
   git commit -m "docs(workflows): complete community-visualization-ui task (CONV-08-05)"
   git push
   ```

**期待される成果物**:

- 移動完了
- 未タスク指示書削除
- コミット・プッシュ完了

---

### タスク6: artifacts.json の最終更新

**目的**: 全Phase完了状態を記録する

**実行手順**:

1. `artifacts.json` を更新:
   ```json
   {
     "status": "completed",
     "completedAt": "{{ISO_TIMESTAMP}}",
     "phases": {
       "13": {
         "status": "completed",
         "completedAt": "{{ISO_TIMESTAMP}}",
         "artifacts": [
           {
             "type": "pr",
             "url": "{{PR_URL}}",
             "description": "Pull Request"
           }
         ]
       }
     }
   }
   ```

**期待される成果物**:

- 更新された artifacts.json

---

## 成果物

| 成果物           | パス                                     | 内容             |
| ---------------- | ---------------------------------------- | ---------------- |
| ローカル確認結果 | `outputs/phase-13/local-verification.md` | 確認チェック結果 |
| PR               | GitHub PR URL                            | Pull Request     |
| artifacts.json   | `artifacts.json`                         | 最終更新         |

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
| 7   | 未タスク指示書が削除済み                                 | ✅   |
| 8   | **本Phase内の全タスクを100%完了**                        | ✅   |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: なし（タスク完了）

---

## ワークフロー完了

全Phaseが完了し、PRがマージ準備完了状態になりました。
ユーザーがGitHub UIでマージを実行してください。
