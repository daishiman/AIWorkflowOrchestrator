# 保持期間とストレージ最適化

## 保持期間戦略

### デフォルト設定

GitHub Actionsのアーティファクトはデフォルトで**90日間保持**されます。
多くのケースで、これは過剰です。

### 推奨保持期間

| アーティファクトタイプ | 推奨期間 | 理由 |
|---------------------|---------|------|
| CI/CDビルド成果物 | 7-14日 | 通常はリリース後すぐに不要 |
| リリースパッケージ | 30-90日 | ロールバック用に長期保持 |
| テストレポート | 7-14日 | トレンド分析後は不要 |
| デバッグログ | 1-3日 | 問題解決後すぐに不要 |
| プレビュービルド（PR） | 3-7日 | PR マージ後は不要 |

### 設定方法

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: build-output
    path: dist/
    retention-days: 7  # 7日間保持
```

### ユースケース別設定例

#### CI/CDパイプライン

```yaml
jobs:
  build:
    steps:
      - uses: actions/upload-artifact@v4
        with:
          name: build-${{ github.sha }}
          path: dist/
          retention-days: 7  # 1週間後に自動削除
```

#### リリースビルド

```yaml
- name: Upload release build
  if: startsWith(github.ref, 'refs/tags/')
  uses: actions/upload-artifact@v4
  with:
    name: release-${{ github.ref_name }}
    path: dist/
    retention-days: 90  # リリースは長期保持
```

#### デバッグログ（失敗時のみ）

```yaml
- name: Upload debug logs
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: debug-${{ github.run_id }}
    path: logs/
    retention-days: 3  # 問題解決後すぐ削除
```

## ストレージコスト削減

### GitHub Actions ストレージ制限

| プラン | 無料枠 | 超過料金 |
|--------|--------|---------|
| Free | 500MB | - |
| Pro | 2GB | $0.25/GB/月 |
| Team | 2GB | $0.25/GB/月 |
| Enterprise | 50GB | $0.25/GB/月 |

### コスト削減戦略

#### 1. 不要ファイルの除外

```yaml
# 悪い例: すべてアップロード
- uses: actions/upload-artifact@v4
  with:
    name: build
    path: .

# 良い例: 必要なもののみ
- uses: actions/upload-artifact@v4
  with:
    name: build
    path: |
      dist/
      !dist/**/*.map
      !dist/**/*.test.js
      !dist/**/node_modules
```

#### 2. 圧縮最適化

```yaml
- name: Compress before upload
  run: tar czf build.tar.gz dist/

- uses: actions/upload-artifact@v4
  with:
    name: build-compressed
    path: build.tar.gz
    compression-level: 0  # 既に圧縮済み
    retention-days: 7
```

#### 3. サイズチェックと警告

```yaml
- name: Check artifact size
  run: |
    SIZE=$(du -sm dist/ | cut -f1)
    echo "Artifact size: ${SIZE}MB"

    if [ $SIZE -gt 100 ]; then
      echo "::warning::Artifact size exceeds 100MB"
      echo "Consider excluding unnecessary files"
    fi

- uses: actions/upload-artifact@v4
  with:
    name: build
    path: dist/
```

#### 4. 条件付きアップロード

```yaml
# mainブランチのみアップロード
- uses: actions/upload-artifact@v4
  if: github.ref == 'refs/heads/main'
  with:
    name: build
    path: dist/

# 失敗時のみデバッグ情報をアップロード
- uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: debug-logs
    path: logs/
    retention-days: 1
```

## 自動クリーンアップ

### GitHub CLI を使用したクリーンアップ

```yaml
- name: Cleanup old artifacts
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: |
    # 30日以上前のアーティファクトを削除
    gh api repos/${{ github.repository }}/actions/artifacts \
      --jq '.artifacts[] | select(.created_at < (now - 2592000 | strftime("%Y-%m-%dT%H:%M:%SZ"))) | .id' \
      | xargs -I {} gh api --method DELETE repos/${{ github.repository }}/actions/artifacts/{}
```

### スケジュールされたクリーンアップワークフロー

```yaml
# .github/workflows/cleanup-artifacts.yml
name: Cleanup Artifacts

on:
  schedule:
    - cron: '0 0 * * 0'  # 毎週日曜日 00:00
  workflow_dispatch:      # 手動実行も可能

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Delete old artifacts
        uses: actions/github-script@v7
        with:
          script: |
            const days = 30;
            const timestamp = Date.now() - (days * 24 * 60 * 60 * 1000);

            const { data: artifacts } = await github.rest.actions.listArtifactsForRepo({
              owner: context.repo.owner,
              repo: context.repo.repo,
            });

            for (const artifact of artifacts.artifacts) {
              if (new Date(artifact.created_at) < timestamp) {
                console.log(`Deleting ${artifact.name} (${artifact.created_at})`);
                await github.rest.actions.deleteArtifact({
                  owner: context.repo.owner,
                  repo: context.repo.repo,
                  artifact_id: artifact.id,
                });
              }
            }
```

### パターンベースクリーンアップ

```yaml
- name: Delete PR preview artifacts
  uses: actions/github-script@v7
  with:
    script: |
      const { data: artifacts } = await github.rest.actions.listArtifactsForRepo({
        owner: context.repo.owner,
        repo: context.repo.repo,
      });

      // "pr-preview-" で始まるアーティファクトを削除
      for (const artifact of artifacts.artifacts) {
        if (artifact.name.startsWith('pr-preview-')) {
          console.log(`Deleting ${artifact.name}`);
          await github.rest.actions.deleteArtifact({
            owner: context.repo.owner,
            repo: context.repo.repo,
            artifact_id: artifact.id,
          });
        }
      }
```

## モニタリング

### ストレージ使用量の確認

```yaml
- name: Check storage usage
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: |
    echo "Current artifacts:"
    gh api repos/${{ github.repository }}/actions/artifacts --jq '.artifacts[] | {name: .name, size_mb: (.size_in_bytes / 1048576 | floor), created_at: .created_at}'

    echo "Total storage:"
    gh api repos/${{ github.repository }}/actions/artifacts --jq '[.artifacts[].size_in_bytes] | add / 1048576 | floor'
```

### アラート設定

```yaml
- name: Alert on high storage usage
  run: |
    TOTAL_MB=$(gh api repos/${{ github.repository }}/actions/artifacts --jq '[.artifacts[].size_in_bytes] | add / 1048576 | floor')

    if [ $TOTAL_MB -gt 1000 ]; then
      echo "::error::Storage usage exceeds 1GB: ${TOTAL_MB}MB"
      echo "Consider running cleanup workflow"
    fi
```

## ベストプラクティス

### 保持期間設定のチェックリスト

- [ ] デフォルト90日を使用していないか？
- [ ] ユースケースに応じた適切な期間を設定しているか？
- [ ] リリースビルドは長期保持しているか？
- [ ] デバッグログは短期保持しているか？

### ストレージ最適化チェックリスト

- [ ] 不要なファイル（node_modules, .map）を除外しているか？
- [ ] 適切な圧縮レベルを設定しているか？
- [ ] サイズが大きいアーティファクトを監視しているか？
- [ ] 定期的なクリーンアップを自動化しているか？

### セキュリティチェックリスト

- [ ] センシティブ情報（.env, *.key）を除外しているか？
- [ ] アーティファクトへのアクセス権限は適切か？
- [ ] パブリックリポジトリでアーティファクトが公開されていないか？

## 参考リンク

- [About artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
- [Usage limits and billing](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions)
- [Removing workflow artifacts](https://docs.github.com/en/actions/managing-workflow-runs/removing-workflow-artifacts)
