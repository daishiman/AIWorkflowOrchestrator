# GitHub Actions 通知統合 基礎知識

> **相対パス**: `references/basics.md`
> **原典**: GitHub Actions Documentation, Slack/Discord/Teams API Documentation

---

## 通知統合の概要

GitHub Actionsから外部サービスへ通知を送信する仕組み。
ビルド・デプロイの状態をリアルタイムでチームに共有し、迅速なフィードバックループを実現する。

---

## サポートプラットフォーム

| プラットフォーム | 統合方法               | 特徴              |
| ---------------- | ---------------------- | ----------------- |
| Slack            | Webhook / Bot Token    | Block Kit対応     |
| Discord          | Webhook                | Embed形式対応     |
| MS Teams         | Incoming Webhook       | Adaptive Card対応 |
| Email            | sendmail / SMTP Action | 汎用性が高い      |

---

## 共通要素

### GitHub Secrets

認証情報を安全に保存する仕組み。

```yaml
# リポジトリの Settings → Secrets and variables → Actions
# から設定

# ワークフローでの参照
env:
  WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 条件付き実行

```yaml
# 成功時のみ
- if: success()

# 失敗時のみ
- if: failure()

# 常に実行（キャンセル時も）
- if: always()

# 特定ブランチのみ
- if: github.ref == 'refs/heads/main'
```

### 共通メッセージ情報

通知メッセージに含めるべき情報:

| 情報           | 変数                                                                                  | 例                    |
| -------------- | ------------------------------------------------------------------------------------- | --------------------- |
| リポジトリ名   | `${{ github.repository }}`                                                            | `owner/repo`          |
| ブランチ名     | `${{ github.ref_name }}`                                                              | `main`                |
| コミットSHA    | `${{ github.sha }}`                                                                   | `abc123...`           |
| コミット作者   | `${{ github.actor }}`                                                                 | `username`            |
| ワークフロー名 | `${{ github.workflow }}`                                                              | `CI`                  |
| ジョブ状態     | `${{ job.status }}`                                                                   | `success` / `failure` |
| 実行URL        | `${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}` |                       |

---

## Webhook基本形

### cURLを使用した送信

```yaml
- name: Send notification
  run: |
    curl -X POST \
      -H "Content-Type: application/json" \
      -d '{"text": "Build completed!"}' \
      ${{ secrets.WEBHOOK_URL }}
```

### Actionを使用した送信（Slack例）

```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1.24.0
  with:
    channel-id: "C0123456789"
    slack-message: "Build ${{ job.status }}"
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```

---

## セキュリティ考慮事項

| 項目                   | 推奨事項                            |
| ---------------------- | ----------------------------------- |
| Webhook URL保存        | 必ずGitHub Secretsを使用            |
| トークンローテーション | 定期的に再生成                      |
| 権限最小化             | 必要最小限のスコープ                |
| 機密情報の除外         | パスワード、APIキーを通知に含めない |

---

## 関連リソース

- **Slack詳細**: See [slack-integration.md](slack-integration.md)
- **Discord/Teams詳細**: See [discord-teams.md](discord-teams.md)
