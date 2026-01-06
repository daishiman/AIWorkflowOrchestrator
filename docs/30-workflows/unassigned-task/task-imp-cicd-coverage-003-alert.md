# カバレッジ低下アラート - タスク指示書

## メタ情報

| 項目         | 内容                              |
| ------------ | --------------------------------- |
| タスクID     | task-imp-cicd-coverage-003        |
| タスク名     | カバレッジ低下アラート            |
| 分類         | 改善                              |
| 対象機能     | CI/CD、通知、監視                 |
| 優先度       | 中                                |
| 見積もり規模 | 中規模                            |
| ステータス   | 未実施                            |
| 発見元       | Phase 1（スコープ定義）           |
| 発見日       | 2026-01-05                        |
| 関連タスク   | cicd-coverage-integration（完了） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

CI/CDカバレッジ閾値統合（cicd-coverage-integration）が完了し、PRごとのカバレッジチェックが機能している。しかし、PRを経由しないコードのマージや、PRレビュー時の見落としにより、mainブランチのカバレッジが徐々に低下する可能性がある。

### 1.2 問題点・課題

- mainブランチのカバレッジ低下を能動的に確認しないと気づかない
- 手動レビュー（task-imp-cicd-coverage-002）だけでは見落としのリスクがある
- 技術的負債の蓄積を早期に検知できない
- チーム開発時、全員がカバレッジ推移を意識することが難しい

### 1.3 放置した場合の影響

- カバレッジの緩やかな低下に気づかない
- 気づいた時には大幅な改善が必要になる
- 品質文化の形骸化

---

## 2. 何を達成するか（What）

### 2.1 目的

mainブランチのカバレッジが閾値を下回った場合、または低下傾向を検知した場合に、自動的に通知を送信する仕組みを構築する。

### 2.2 最終ゴール

- カバレッジ低下時に自動通知が送信される
- 開発者がCodecovダッシュボードを確認しなくても低下に気づける
- 迅速な対応が可能になる

### 2.3 スコープ

#### 含むもの

- Codecov Webhookの設定
- 通知先の設定（Slack、Discord、またはGitHub Issues）
- アラート条件の定義

#### 含まないもの

- カスタムダッシュボードの構築
- 詳細なカバレッジ分析レポートの自動生成
- 自動修正機能

### 2.4 成果物

| 成果物               | 内容                                |
| -------------------- | ----------------------------------- |
| Webhook設定          | Codecov Webhook設定                 |
| 通知設定             | Slack/Discord/GitHub Issues連携設定 |
| 運用ガイドライン更新 | アラート対応手順の追記              |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Codecov統合が完了していること（cicd-coverage-integration）
- 通知先サービス（Slack/Discord）のアクセス権があること
- または、GitHub Issues作成権限があること

### 3.2 依存タスク

- cicd-coverage-integration（完了済み）
- task-imp-cicd-coverage-002（推奨: 運用ルールとの整合性のため）

### 3.3 必要な知識・スキル

- Codecov Webhook設定
- Slack/Discord Incoming Webhook設定
- GitHub Actions（代替手段として）

### 3.4 推奨アプローチ

2つの実装方法から選択:

**方法A: Codecov Webhook + Slack/Discord**

- Codecovのネイティブ機能を使用
- 設定が簡単
- リアルタイム通知

**方法B: GitHub Actions + 定期チェック**

- Codecov APIでカバレッジ取得
- 閾値チェック
- GitHub Issues作成または Slack通知
- より柔軟なカスタマイズが可能

---

## 4. 実行手順

### Phase構成

| Phase | 名称         | 目的                       |
| ----- | ------------ | -------------------------- |
| 1     | 方式選定     | 実装方法を決定             |
| 2     | 設定実装     | Webhook/GitHub Actions設定 |
| 3     | テスト検証   | アラート動作確認           |
| 4     | ドキュメント | 運用ガイドライン更新       |

### Phase 1: 方式選定

#### Claude Code スラッシュコマンド

```
/ai:design-architecture
```

#### 決定ポイント

| 観点           | 方法A（Codecov Webhook） | 方法B（GitHub Actions）      |
| -------------- | ------------------------ | ---------------------------- |
| 設定の容易さ   | ◎ 簡単                   | ○ 中程度                     |
| カスタマイズ性 | △ 限定的                 | ◎ 高い                       |
| 依存サービス   | Codecov + Slack/Discord  | GitHub Actions + Codecov API |
| メンテナンス性 | ◎ Codecov任せ            | ○ 自前管理                   |

### Phase 2: 設定実装

#### 方法A: Codecov Webhook設定

1. Codecovダッシュボード → Settings → Notifications
2. Slackを選択、Webhook URLを入力
3. トリガー条件を設定:
   - Coverage decreases by 2% or more
   - Coverage falls below 80%

#### 方法B: GitHub Actions設定

```yaml
# .github/workflows/coverage-alert.yml
name: Coverage Alert

on:
  schedule:
    - cron: "0 9 * * 1" # 毎週月曜9時
  workflow_dispatch:

jobs:
  check-coverage:
    runs-on: ubuntu-latest
    steps:
      - name: Get coverage from Codecov
        id: coverage
        run: |
          COVERAGE=$(curl -s "https://codecov.io/api/v2/github/[owner]/[repo]/branch/main" | jq '.totals.coverage')
          echo "coverage=$COVERAGE" >> $GITHUB_OUTPUT

      - name: Check threshold
        if: ${{ steps.coverage.outputs.coverage < 80 }}
        run: |
          echo "Coverage is below 80%: ${{ steps.coverage.outputs.coverage }}%"
          # Slack通知またはGitHub Issue作成
```

### Phase 3: テスト検証

1. テスト用に閾値を一時的に高く設定（例: 95%）
2. アラートが発火することを確認
3. 閾値を元に戻す（80%）

### Phase 4: ドキュメント更新

運用ガイドラインにアラート対応手順を追記:

```markdown
## カバレッジ低下アラート受信時の対応

1. Codecovダッシュボードで低下原因を特定
2. 該当PRまたはコミットを特定
3. テスト追加タスクを作成（優先度: 高）
4. 1週間以内に対応
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] カバレッジ80%未満でアラートが発火する
- [ ] カバレッジ2%以上低下でアラートが発火する
- [ ] 通知が指定の宛先に届く

### 品質要件

- [ ] 誤報（false positive）が発生しない
- [ ] アラートメッセージが明確で対応方法がわかる

### ドキュメント要件

- [ ] 設定手順が文書化されている
- [ ] アラート対応手順が文書化されている

---

## 6. 検証方法

### テストケース

| No  | テスト内容             | 期待結果                  |
| --- | ---------------------- | ------------------------- |
| 1   | 閾値を一時的に高く設定 | アラートが発火            |
| 2   | 通知が届くことを確認   | Slack/Discord/Issueに通知 |
| 3   | 元の閾値に戻す         | アラートが発火しない      |

### 検証手順

1. テスト環境または一時的な設定変更で検証
2. 実際のアラートを受信して内容を確認
3. 対応フローを模擬実行

---

## 7. リスクと対策

| リスク          | 影響度 | 発生確率 | 対策                                 |
| --------------- | ------ | -------- | ------------------------------------ |
| アラート疲れ    | 中     | 中       | 閾値を適切に設定、頻度制限           |
| 通知が届かない  | 中     | 低       | テスト時に動作確認                   |
| Codecov API制限 | 低     | 低       | GitHub Actionsの場合、キャッシュ活用 |

---

## 8. 参照情報

### 関連ドキュメント

- `codecov.yml` - Codecov設定
- `.github/workflows/ci.yml` - 既存CIワークフロー
- `docs/30-workflows/cicd-coverage-integration/outputs/phase-10/implementation-guide.md`

### 参考資料

- [Codecov Notifications Documentation](https://docs.codecov.com/docs/notifications)
- [Codecov API Documentation](https://docs.codecov.com/reference)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)

---

## 9. 備考

### 発見元の原文

Phase 1スコープ定義（outputs/phase-1/scope-definition.md）より:

```
2.2 将来のタスク候補
- カバレッジ低下アラート（Slack/Discord通知、閾値ベースの警告）
```

### 補足事項

- 個人開発の場合は優先度低め（手動確認で十分）
- チーム開発時は有効（見落とし防止）
- 方法Aを推奨（設定が簡単、メンテナンス不要）
- 将来的にはGitHub Actionsで拡張性を持たせることも検討
