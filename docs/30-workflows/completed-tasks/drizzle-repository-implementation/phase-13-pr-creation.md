# Phase 13: PR作成・CI確認 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 13                                |
| Phase名    | PR作成・CI確認                    |
| 前提Phase  | Phase 12                          |
| 後続Phase  | なし（タスク完了）                |
| ステータス | 未実施                            |
| 作成日     | 2026-01-22                        |
| 機能名     | drizzle-repository-implementation |

---

## 目的

`/ai:diff-to-pr` スキルを使用して、コミット・PR作成・CI確認を行い、タスクを完了する。

## 背景

全Phase（1〜12）の作業が完了し、マージ準備が整った。本Phaseでは、変更をコミットし、PRを作成し、CI/CDパイプラインが成功することを確認する。

---

## 重要な注意事項

⚠️ **PR作成は自動実行しない**

PR作成は必ずユーザーの明示的な許可を得てから実行すること。

| 禁止事項                                     | 理由                                           |
| -------------------------------------------- | ---------------------------------------------- |
| 勝手にPRを作成する                           | レビュー前の変更がリモートに反映されてしまう   |
| ユーザー確認なしで`/ai:diff-to-pr`を実行する | 意図しないブランチやコミットが作成される可能性 |
| ローカル確認をスキップする                   | 動作確認されていないコードがPRに含まれる       |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル確認（PR作成前に必須）

**目的**: PR作成前に全ての品質チェックをローカルで確認する

**実行手順**:

1. ビルド確認:
   ```bash
   pnpm build
   ```
2. 全テスト実行:
   ```bash
   pnpm test
   ```
3. 型チェック:
   ```bash
   pnpm typecheck
   ```
4. Lint:
   ```bash
   pnpm lint
   ```
5. 全てパスすることを確認

**期待される成果物**:

- ローカル確認完了（全チェックPASS）

---

### タスク2: 変更内容の確認

**目的**: コミット対象の変更内容を確認する

**実行手順**:

1. 変更ファイル一覧確認:
   ```bash
   git status
   ```
2. 差分確認:
   ```bash
   git diff
   ```
3. 変更内容が意図通りであることを確認:
   - 新規作成ファイル
   - 更新ファイル
   - 削除ファイル（あれば）
4. コミット対象外のファイル（.env等）がないことを確認

**期待される成果物**:

- 変更内容の確認完了

---

### タスク3: ユーザー確認・PR作成許可

**目的**: ユーザーにPR作成の許可を求める

**実行手順**:

1. 変更サマリーをユーザーに提示:

   ```
   ## 変更サマリー

   ### 新規ファイル
   - DrizzleChatSessionRepository.ts
   - DrizzleChatMessageRepository.ts
   - テストファイル（2ファイル）
   - Phase 1〜12の出力ファイル

   ### 更新ファイル
   - index.ts（エクスポート追加）
   - システム仕様書（aiworkflow-requirements）

   ### ローカル確認結果
   - ビルド: PASS
   - テスト: PASS
   - 型チェック: PASS
   - Lint: PASS
   ```

2. ユーザーに確認:

   ```
   上記の変更内容でPRを作成してよろしいですか？
   ```

3. **ユーザーの明示的な許可を待つ**

**期待される成果物**:

- ユーザーからのPR作成許可

---

### タスク4: `/ai:diff-to-pr` 実行

**目的**: PR作成スキルを使用してコミット・PR作成を行う

**実行手順**:

1. ユーザーの許可を得た後、`/ai:diff-to-pr` を実行
2. スキルが以下を自動実行:
   - リモートmain同期・コンフリクト解消
   - 品質検証（typecheck, lint, test）
   - 差分分析・ブランチ作成・コミット
   - PR本文生成・PR作成
   - 補足コメント投稿
   - CI/CD完了確認
3. PR URLを記録

**期待される成果物**:

- GitHub Pull Request

---

### タスク5: CI/CD確認

**目的**: PRのCI/CDパイプラインが成功することを確認する

**実行手順**:

1. GitHub ActionsのCI実行を確認:
   - Build ステップ
   - Test ステップ
   - Typecheck ステップ
   - Lint ステップ
2. 全ステップがPASSすることを確認
3. 失敗がある場合は修正してコミット追加

**期待される成果物**:

- CI/CD全ステップPASS

---

### タスク6: タスク完了報告

**目的**: タスク完了をユーザーに報告する

**実行手順**:

1. PR情報を報告:

   ```
   ## PR作成完了

   - PR URL: https://github.com/.../pull/XXX
   - ブランチ: feature/drizzle-repository-implementation
   - CI/CD: PASS

   ## 完了した成果物

   1. DrizzleChatSessionRepository.ts
   2. DrizzleChatMessageRepository.ts
   3. テストファイル（カバレッジ: XX%）
   4. 実装ガイド
   5. システム仕様書更新

   ## 次のステップ

   PRレビュー後、マージをお願いします。
   ```

2. マージはユーザーがGitHub UIで手動実行することを案内

**期待される成果物**:

- `outputs/phase-13/completion-report.md`: タスク完了報告

---

## 参照資料

### スキル

| 参照資料         | パス                            | 内容         |
| ---------------- | ------------------------------- | ------------ |
| diff-to-prスキル | `.claude/skills/ai:diff-to-pr/` | PR作成スキル |

### Phase 12成果物

| 参照資料             | パス                                     | 内容     |
| -------------------- | ---------------------------------------- | -------- |
| ドキュメント更新履歴 | `outputs/phase-12/document-changelog.md` | 変更一覧 |

---

## 成果物

| 成果物              | パス                                    | 内容         |
| ------------------- | --------------------------------------- | ------------ |
| タスク完了報告      | `outputs/phase-13/completion-report.md` | 完了サマリー |
| GitHub Pull Request | GitHub UI                               | PR           |

---

## 完了条件

- [ ] ローカル確認（ビルド、テスト、型チェック、Lint）が全てPASSしている
- [ ] 変更内容が確認されている
- [ ] ユーザーからPR作成の許可を得ている
- [ ] `/ai:diff-to-pr` が正常に完了している
- [ ] CI/CDが全てPASSしている
- [ ] タスク完了報告が作成されている
- [ ] タスクディレクトリがcompleted-tasksに移動されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（6タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] PRが作成されていること（ユーザー許可後）
- [ ] タスク完了処理（completed-tasks移動）が完了していること

---

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/drizzle-repository-implementation/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep drizzle-repository-implementation

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): drizzle-repository-implementationをcompleted-tasksに移動"
git push
```

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: なし（タスク完了）

---

## タスク完了

本Phaseの完了をもって、**drizzle-repository-implementation** タスクは完了となります。

マージはユーザーがGitHub UIで手動実行してください。

---

## 関連Issue

本タスク完了後、関連Issue（#400）をクローズしてください。
