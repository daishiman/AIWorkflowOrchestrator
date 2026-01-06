# 手動テスト準備ガイド - CI/CDカバレッジ閾値統合

## メタ情報

| 項目   | 内容                      |
| ------ | ------------------------- |
| 作成日 | 2026-01-05                |
| 作成者 | Claude Opus 4.5           |
| Phase  | 9                         |
| 機能名 | cicd-coverage-integration |

---

## 1. 事前準備チェックリスト

### 1.1 Codecovセットアップ

| No  | タスク                                    | 完了 | 備考 |
| --- | ----------------------------------------- | ---- | ---- |
| 1   | Codecov (https://codecov.io) にサインイン |      |      |
| 2   | GitHubアカウントで認証                    |      |      |
| 3   | リポジトリをCodecovに追加                 |      |      |
| 4   | CODECOV_TOKENを取得                       |      |      |

**手順詳細**:

1. https://codecov.io にアクセス
2. "Sign Up with GitHub" をクリック
3. リポジトリ一覧から対象リポジトリを選択
4. Settings → General → Repository Upload Token をコピー

### 1.2 GitHub Secrets設定

| No  | タスク                               | 完了 | 備考 |
| --- | ------------------------------------ | ---- | ---- |
| 1   | GitHubリポジトリのSettings → Secrets |      |      |
| 2   | New repository secret をクリック     |      |      |
| 3   | Name: CODECOV_TOKEN を入力           |      |      |
| 4   | Value: 取得したトークンを貼り付け    |      |      |
| 5   | Add secret をクリック                |      |      |

### 1.3 ブランチ・PR準備

| No  | タスク                                   | 完了 | コマンド                                               |
| --- | ---------------------------------------- | ---- | ------------------------------------------------------ |
| 1   | feature/cicd-coverage-integration を確認 |      | `git branch`                                           |
| 2   | 変更をコミット                           |      | `git add . && git commit -m "..."`                     |
| 3   | ブランチをリモートにプッシュ             |      | `git push -u origin feature/cicd-coverage-integration` |
| 4   | GitHubでPRを作成                         |      | Web UIまたは `gh pr create`                            |

---

## 2. テストケース実行計画

### 2.1 テストケース一覧

| TC ID | テストケース名         | 優先度 | 所要時間 |
| ----- | ---------------------- | ------ | -------- |
| TC-1  | カバレッジチェック成功 | 高     | 10分     |
| TC-2  | Codecovコメント表示    | 高     | 5分      |
| TC-3  | Codecovダッシュボード  | 中     | 5分      |
| TC-4  | 既存ジョブ影響なし     | 高     | 5分      |
| TC-5  | 閾値未達時の動作       | 低     | 10分     |

**推奨実行順序**: TC-1 → TC-2 → TC-3 → TC-4 （TC-5はオプション）

### 2.2 テスト環境

| 項目           | 値                                |
| -------------- | --------------------------------- |
| GitHub Actions | ubuntu-latest (CI環境)            |
| Node.js        | 22 (CI環境)                       |
| pnpm           | latest (CI環境)                   |
| ブランチ       | feature/cicd-coverage-integration |
| ベースブランチ | main                              |

---

## 3. テスト実行前の確認

### 3.1 ローカル環境での事前チェック

```bash
# 1. YAMLフォーマット確認
pnpm prettier --check .github/workflows/ci.yml codecov.yml

# 2. Git状態確認
git status

# 3. 変更ファイル確認
git diff main...HEAD --name-only
```

**期待結果**:

- Prettierフォーマットチェック: ✅ PASS
- 変更ファイル: ci.yml, codecov.yml, テスト修正ファイル

### 3.2 CI環境での実行シミュレーション

```bash
# ローカルでCI環境を再現（Node.js 22が必要）
# ※ローカルではNode.js 20のため、CI環境での実行を推奨
```

---

## 4. テスト実行ガイド

### 4.1 TC-1: カバレッジチェック成功

**実行手順**:

1. PR作成後、GitHub ActionsのUIを開く
   - URL: `https://github.com/[owner]/[repo]/actions`
2. 最新のCI runを選択
3. coverageジョブを確認
4. ジョブの各ステップを確認

**確認ポイント**:

| ステップ                   | 期待結果 | 確認方法                       |
| -------------------------- | -------- | ------------------------------ |
| Run tests with coverage    | ✅ PASS  | グリーンチェックマーク         |
| Upload coverage to Codecov | ✅ PASS  | "Coverage uploaded" メッセージ |
| ジョブ全体                 | ✅ PASS  | グリーン表示                   |
| 実行時間                   | 10分以内 | Durationを確認                 |

### 4.2 TC-2: Codecovコメント表示

**実行手順**:

1. PRページを開く
2. コメントセクションまでスクロール
3. Codecov botからのコメントを探す

**確認ポイント**:

| 項目                 | 期待内容                     |
| -------------------- | ---------------------------- |
| コメント投稿者       | codecov-bot                  |
| カバレッジ値表示     | Project: XX%, Patch: XX%     |
| 差分表示             | +/-X% の変化が表示される     |
| ファイル別カバレッジ | 変更ファイルのカバレッジ一覧 |
| フラグ別カバレッジ   | shared, desktop が表示される |

### 4.3 TC-3: Codecovダッシュボード

**実行手順**:

1. https://codecov.io/gh/[owner]/[repo] にアクセス
2. ブランチセレクターで `feature/cicd-coverage-integration` を選択
3. カバレッジレポートを確認

**確認ポイント**:

| 項目           | 期待内容                   |
| -------------- | -------------------------- |
| 全体カバレッジ | 80%以上                    |
| ファイル別表示 | 各ファイルのカバレッジ表示 |
| フラグ別表示   | shared, desktop フラグ表示 |
| グラフ表示     | カバレッジ推移グラフ       |

### 4.4 TC-4: 既存ジョブ影響なし

**実行手順**:

1. GitHub ActionsのUIで全ジョブを確認
2. 各ジョブのステータスを確認
3. 実行時間を前回と比較

**確認ポイント**:

| ジョブ    | 期待ステータス | 実行時間目安 |
| --------- | -------------- | ------------ |
| lint      | ✅ PASS        | ~2分         |
| typecheck | ✅ PASS        | ~3分         |
| test      | ✅ PASS        | ~5分         |
| security  | ✅ PASS        | ~2分         |
| coverage  | ✅ PASS        | ~5分         |
| build     | ✅ PASS        | ~5分         |

---

## 5. トラブルシューティング

### 5.1 coverageジョブが失敗する場合

**症状**: coverageジョブが赤色（FAIL）

**確認ポイント**:

1. カバレッジが80%未満
   - 対策: テストを追加してカバレッジを向上
2. CODECOV_TOKENが設定されていない
   - 対策: GitHub Secretsを確認・再設定
3. Codecovサービス障害
   - 対策: https://status.codecov.io で確認

### 5.2 Codecovコメントが表示されない場合

**症状**: PRにCodecov botのコメントがない

**確認ポイント**:

1. Codecov GitHub Appがインストールされているか
   - 対策: GitHubリポジトリ設定でApp確認・インストール
2. codecov.ymlのcomment設定が正しいか
   - 対策: require_changes, require_head 設定を確認
3. Codecovにレポートがアップロードされているか
   - 対策: coverageジョブのログでアップロード成功を確認

### 5.3 カバレッジが80%未満の場合

**対策手順**:

1. Codecovダッシュボードでカバレッジが低いファイルを特定
2. 該当ファイルのテストを追加
3. ローカルで `pnpm test:coverage` を実行して80%達成を確認
4. 変更をコミット・プッシュ
5. CIで再度確認

---

## 6. Phase 9完了判定基準

### 6.1 必須テストケース

| TC ID | テストケース           | 結果 |
| ----- | ---------------------- | ---- |
| TC-1  | カバレッジチェック成功 |      |
| TC-2  | Codecovコメント表示    |      |
| TC-4  | 既存ジョブ影響なし     |      |

**判定**: 上記3ケースが全てPASSでPhase 9完了

### 6.2 オプショナルテストケース

| TC ID | テストケース          | 備考                     |
| ----- | --------------------- | ------------------------ |
| TC-3  | Codecovダッシュボード | 推奨（可視化確認のため） |
| TC-5  | 閾値未達時の動作      | 任意（異常系確認のため） |

---

## 7. 次のPhase

TC-1, TC-2, TC-4が全てPASSした場合、Phase 10（ドキュメント更新）に進む。
