# Phase 9: 手動テスト検証ガイド

## 概要

GitHub Actionsでの動作確認を行うための手順書。

## 前提条件

1. **CODECOV_TOKEN シークレットの設定**
   - GitHubリポジトリ → Settings → Secrets and variables → Actions
   - `CODECOV_TOKEN` という名前で Codecov のリポジトリトークンを設定

2. **Codecov リポジトリの設定**
   - https://codecov.io にログイン
   - リポジトリをアクティベート
   - リポジトリトークンを取得

## 検証手順

### Step 1: 変更をコミット

```bash
git add .
git commit -m "feat(ci): Add Codecov coverage integration

- Add coverage job to CI workflow
- Create codecov.yml configuration
- Fix flaky performance tests
- Add missing test mocks"
```

### Step 2: PRを作成

```bash
git push origin HEAD
gh pr create --title "feat(ci): Add Codecov coverage integration" --body "
## Summary
- CI/CDワークフローにCodecov連携を追加
- カバレッジしきい値: 80%
- shared, desktopパッケージのカバレッジを分離追跡

## Changes
- .github/workflows/ci.yml: coverageジョブ追加
- codecov.yml: Codecov設定ファイル新規作成
- テストファイル修正: フラッキーテスト対策

## Test Results
- テストカバレッジ: 83.83%
- テスト合格率: 100%
"
```

### Step 3: GitHub Actionsの確認

1. PRページのChecksタブを確認
2. 以下のジョブがすべて成功することを確認:
   - ✅ Lint
   - ✅ Type Check
   - ✅ Test
   - ✅ Security Audit
   - ✅ Coverage Check
   - ✅ Build Check

### Step 4: Codecovの確認

1. PRコメントにCodecovのカバレッジレポートが表示されることを確認
2. カバレッジが80%以上であることを確認
3. https://codecov.io/gh/[owner]/[repo] でダッシュボードを確認

## 期待される結果

### CI/CDジョブ

| ジョブ         | 期待される結果       |
| -------------- | -------------------- |
| Lint           | ✅ Pass              |
| Type Check     | ✅ Pass              |
| Test           | ✅ Pass              |
| Security Audit | ⚠️ Pass (警告は許容) |
| Coverage Check | ✅ Pass              |
| Build Check    | ✅ Pass              |

### Codecovレポート

- プロジェクトカバレッジ: ≥80%
- パッチカバレッジ: ≥80%
- PRコメントにレポート表示

## トラブルシューティング

### Coverage Checkが失敗する場合

1. `CODECOV_TOKEN`が正しく設定されているか確認
2. Codecovでリポジトリがアクティベートされているか確認
3. カバレッジファイルのパスが正しいか確認:
   - `./packages/shared/coverage/lcov.info`
   - `./apps/desktop/coverage/lcov.info`

### PRコメントが表示されない場合

1. `codecov.yml`の`comment`設定を確認
2. Codecovの通知設定を確認

## 検証完了チェックリスト

- [ ] CODECOV_TOKENシークレットが設定済み
- [ ] PRが作成済み
- [ ] すべてのCIジョブがパス
- [ ] CodecovのPRコメントが表示
- [ ] カバレッジが80%以上
- [ ] mainブランチにマージ準備完了

## 備考

Phase 9の完了は、上記チェックリストのすべての項目が確認された時点とします。
