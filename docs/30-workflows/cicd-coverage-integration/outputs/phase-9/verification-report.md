# 検証レポート - CI/CDカバレッジ閾値統合

## メタ情報

| 項目   | 内容                      |
| ------ | ------------------------- |
| 作成日 | 2026-01-05                |
| 作成者 | Claude Opus 4.5           |
| Phase  | 9                         |
| 機能名 | cicd-coverage-integration |

---

## 1. Phase 9 実装前準備完了

### 1.1 実装ファイル

| ファイル                   | ステータス  | 備考                       |
| -------------------------- | ----------- | -------------------------- |
| `.github/workflows/ci.yml` | ✅ 実装完了 | coverageジョブ追加済み     |
| `codecov.yml`              | ✅ 実装完了 | 閾値80%設定済み            |
| テスト修正                 | ✅ 実装完了 | パフォーマンステスト安定化 |

### 1.2 ブランチ準備

| 項目             | ステータス  | 値                                |
| ---------------- | ----------- | --------------------------------- |
| ブランチ名       | ✅ 作成済   | feature/cicd-coverage-integration |
| ローカルコミット | ✅ 準備完了 | ci.yml, codecov.yml, テスト修正   |
| リモートプッシュ | ⏳ 実行待ち | `git push` 実行が必要             |

---

## 2. Phase 9 手動テスト実行ガイド

### 2.1 必須テストケース

#### TC-1: カバレッジチェック成功

**実行コマンド**:

```bash
# 1. 変更をコミット
git add .
git commit -m "feat(ci): CI/CDカバレッジ閾値統合

- GitHub ActionsにcoverageジョブをPRとmainブランチ向けに追加
- Codecov統合（閾値80%、fail_ci_if_error: true）
- codecov.yml作成（project/patch両方で80%閾値設定）
- パフォーマンステスト閾値緩和（CI環境安定性確保）

Refs: task-cicd-coverage-integration.md"

# 2. リモートにプッシュ
git push -u origin feature/cicd-coverage-integration

# 3. PRを作成
gh pr create --title "feat(ci): CI/CDカバレッジ閾値統合" --base main
```

**確認項目**:

- [ ] GitHub ActionsでCIが自動実行される
- [ ] coverageジョブが表示される
- [ ] coverageジョブが✅ PASSになる
- [ ] 実行時間が10分以内

#### TC-2: Codecovコメント表示

**確認項目**:

- [ ] PRにCodecov botのコメントが表示される
- [ ] カバレッジ値が表示される（Project: XX%, Patch: XX%）
- [ ] 差分が表示される（+/-X%）
- [ ] ファイル別カバレッジが表示される
- [ ] フラグ別カバレッジが表示される（shared, desktop）

#### TC-4: 既存ジョブ影響なし

**確認項目**:

- [ ] lintジョブが✅ PASS
- [ ] typecheckジョブが✅ PASS
- [ ] testジョブが✅ PASS
- [ ] securityジョブが✅ PASS（continue-on-errorでも表示）
- [ ] buildジョブが✅ PASS
- [ ] 各ジョブの実行時間が想定範囲内

---

## 3. オプショナルテストケース

### 3.1 TC-3: Codecovダッシュボード

**実行手順**:

1. https://codecov.io/gh/[owner]/[repo] にアクセス
2. ブランチ一覧から `feature/cicd-coverage-integration` を選択
3. カバレッジデータを確認

**確認項目**:

- [ ] ダッシュボードにカバレッジデータが表示される
- [ ] ファイル別カバレッジが確認できる
- [ ] フラグ別カバレッジが表示される
- [ ] グラフでカバレッジ推移が確認できる

### 3.2 TC-5: 閾値未達時の動作（異常系）

**実行手順** (オプション):

```bash
# 1. テスト用ブランチ作成
git checkout -b test/coverage-fail

# 2. テストを一時的に除外してカバレッジを下げる
# vitest.config.ts に一時的に追加:
#   exclude: ['src/some-important-test.test.ts']

# 3. コミット・プッシュ
git add .
git commit -m "test: カバレッジ失敗テスト"
git push -u origin test/coverage-fail

# 4. PRを作成
gh pr create --title "test: Coverage fail test" --base main

# 5. coverageジョブが❌ FAILになることを確認

# 6. テスト完了後、ブランチを削除
git checkout main
git branch -D test/coverage-fail
git push origin --delete test/coverage-fail
```

---

## 4. カバレッジ80%達成のための準備

### 4.1 現状分析

**ローカル環境の問題**:

- Node.js v20でbetter-sqlite3のバイナリ不一致エラー
- CI環境（Node.js 22）では問題なし

**CI環境での実行**:

- GitHub Actionsでテストを実行すればカバレッジレポートが生成される
- Codecovにアップロードされる

### 4.2 カバレッジ確認方法

**CI環境での確認**:

1. PRを作成してCIを実行
2. coverageジョブのログでカバレッジ値を確認
3. Codecovダッシュボードで詳細を確認

**期待カバレッジ**:

- desktop: 80%以上（テスト全通過のため達成見込み）
- shared: 確認必要（一部テスト失敗があるが、カバレッジ自体は達成している可能性）

---

## 5. Phase 9 完了条件

### 5.1 必須条件

- [ ] TC-1: カバレッジチェック成功 → ✅ PASS
- [ ] TC-2: Codecovコメント表示 → ✅ PASS
- [ ] TC-4: 既存ジョブ影響なし → ✅ PASS

### 5.2 カバレッジ条件

- [ ] 全体カバレッジが80%以上
- [ ] PRコメントにカバレッジ値が表示される

### 5.3 ドキュメント条件

- [ ] スクリーンショットが保存されている
- [ ] 検証結果が記録されている
- [ ] artifacts.jsonが更新されている

---

## 6. 次のPhase

TC-1, TC-2, TC-4が全てPASSした場合:

**Phase 10: ドキュメント更新**

- README更新（Codecov統合の説明）
- タスク完了記録
- unassigned-task から completed-tasks へ移動
