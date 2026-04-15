# CI キャッシュミス時 Slack / メールアラート設定 - タスク指示書

## メタ情報

```yaml
issue_number: 2194
```

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-CI-FUTURE-010                             |
| タスク名     | CI キャッシュミス時 Slack / メールアラート設定 |
| 分類         | 通知 / アラート                                |
| 対象機能     | GitHub Actions CI                              |
| 優先度       | 低                                             |
| 見積もり規模 | 小規模                                         |
| ステータス   | 未実施                                         |
| 発見元       | TASK-CI-FUTURE-003 Phase 12 (FT-002)           |
| 発見日       | 2026-04-15                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-CI-FUTURE-003 にて GitHub Actions Summary にキャッシュ状態が出力されるようになった。
キャッシュミス発生時には `::warning::` アノテーションが出力されるが、
この通知は「GitHub Actions のジョブページを開いた開発者のみ」が受け取れるものに留まる。

チームメンバーが GitHub Actions のページを能動的に確認しない場合、
キャッシュ劣化を見落とす可能性がある。

### 1.2 問題点・課題

- `::warning::` アノテーションは GitHub Actions ページを開かなければ認識できない
- CI に触れていない開発者（レビュアーや PM など）にキャッシュ問題を共有できない
- キャッシュミスの多発が検知されてもプッシュ通知が届かないため対応が遅れる可能性がある

### 1.3 放置した場合の影響

- キャッシュが劣化しても気づかず、CI 実行時間が増加し続ける可能性がある
- `::warning::` アノテーションが大量に出ても誰も対処しない「狼少年」状態になるリスクがある

---

## 2. 何を達成するか（What）

### 2.1 目的

CI キャッシュミスが発生した場合に、Slack または メール経由でチームメンバーに自動通知する
仕組みを整備し、キャッシュ劣化への対応速度を向上させる。

### 2.2 最終ゴール

1. キャッシュミス（`cache-kind=miss`）が発生した CI 実行後に、指定チャンネルへ Slack 通知が送信される
2. 通知にはキャッシュ状態・ジョブ名・CI 実行 URL が含まれる
3. フォールバックヒット（`cache-kind=fallback`）は任意でメール通知または Slack notice を送信する
4. 完全ヒット（`cache-kind=exact`）時は通知しない（ノイズを避ける）

### 2.3 スコープ

#### 含むもの

- GitHub Actions ワークフロー内から Slack Incoming Webhook を呼び出す実装
- 通知メッセージのフォーマット定義（キャッシュ状態・ジョブ名・実行 URL を含む）
- GitHub Actions Secrets を使った Webhook URL の安全な管理

#### 含まないもの

- 外部モニタリングサービス（Datadog、PagerDuty 等）との連携（→ TASK-CI-FUTURE-011）
- キャッシュヒット率の長期トレンド通知（→ TASK-CI-FUTURE-009）
- メール通知の実装（Slack を優先し、メールは任意対応）

### 2.4 成果物

- `.github/actions/pnpm-install-retry/action.yml` または `ci.yml` への通知ステップ追加
- Slack Incoming Webhook URL の設定手順ドキュメント

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-CI-FUTURE-003 が完了しており、`cache-kind` output が利用可能であること
- Slack ワークスペースに Incoming Webhook App が設定済みであること
- GitHub リポジトリの Secrets に `SLACK_CACHE_ALERT_WEBHOOK_URL` が設定されていること

### 3.2 依存タスク

- TASK-CI-FUTURE-003（完了済み）: `cache-kind` output の実装

### 3.3 必要な知識

- Slack Incoming Webhook の呼び出し方法（`curl` による POST リクエスト）
- GitHub Actions Secrets の参照方法（`${{ secrets.XXX }}`）
- GitHub Actions の `if:` 条件式による条件付き実行

### 3.4 推奨アプローチ

```yaml
# .github/actions/pnpm-install-retry/action.yml 内に追加
- name: Slack通知（キャッシュミス時のみ）
  if: steps.cache-status-check.outputs.cache-kind == 'miss' && env.SLACK_WEBHOOK_URL != ''
  shell: bash
  env:
    SLACK_WEBHOOK_URL: ${{ inputs.slack-webhook-url }}
    CACHE_STATUS: ${{ steps.cache-status-check.outputs.cache-status }}
    RUN_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
  run: |
    curl -s -X POST "$SLACK_WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{\"text\": \":warning: CI キャッシュミス検出\n状態: ${CACHE_STATUS}\nURL: ${RUN_URL}\"}"
```

Slack Webhook URL は action の `input` として受け取り、`ci.yml` から secrets 経由で渡す設計とする。
これにより webhook URL がハードコードされるリスクを避ける。

---

## 4. 実行手順

### Phase 1: Slack Incoming Webhook の設定

#### 目的

Slack ワークスペースに Incoming Webhook を設定し、GitHub Secrets に登録する。

#### 手順

1. Slack ワークスペース管理者が Incoming Webhook App を設定する
2. 通知先チャンネル（例: `#ci-alerts`）を指定して Webhook URL を発行する
3. GitHub リポジトリ設定 > Secrets > Actions に `SLACK_CACHE_ALERT_WEBHOOK_URL` を登録する
4. テスト用に `curl` で Webhook URL に POST してメッセージが届くことを確認する

#### 完了条件

- Webhook URL が発行されている
- GitHub Secrets に登録されている
- テスト POST でメッセージが届いている

---

### Phase 2: 通知ステップの実装

#### 目的

`.github/actions/pnpm-install-retry/action.yml` に Slack 通知ステップを追加する。

#### 手順

1. `action.yml` に `slack-webhook-url` input を追加する
2. キャッシュミス時のみ通知する条件付きステップを追加する（上記サンプル参照）
3. フォールバックヒット時の通知（オプション）を検討・実装する
4. `ci.yml` の呼び出し元から `secrets.SLACK_CACHE_ALERT_WEBHOOK_URL` を渡す修正を行う

#### 完了条件

- キャッシュミス時に Slack 通知が届く
- 完全ヒット時は通知されない

---

### Phase 3: 動作確認

#### 目的

実際の CI 環境で通知が正しく動作することを確認する。

#### 手順

1. キャッシュミスを意図的に発生させる（pnpm-lock.yaml を変更してキャッシュキーを変える）
2. CI を実行し、Slack チャンネルに通知が届くことを確認する
3. キャッシュヒット時に通知が来ないことを確認する
4. フォールバックヒット時の動作を確認する

#### 完了条件

- 3状態それぞれで期待通りの通知動作が確認されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] キャッシュミス発生時に Slack 通知が自動送信される
- [ ] 通知にキャッシュ状態・ジョブ名・CI 実行 URL が含まれる
- [ ] 完全ヒット時は通知されない
- [ ] Webhook URL が Secrets で管理されており、ログに露出しない

### 品質要件

- [ ] 通知ステップが失敗しても CI 全体はブロックされない（`continue-on-error: true`）
- [ ] Secrets が未設定の場合はスキップされる（`env.SLACK_WEBHOOK_URL != ''` の条件確認）

### ドキュメント要件

- [ ] Slack Webhook URL の設定手順が記述されている
- [ ] 本タスク仕様書が `docs/30-workflows/unassigned-task/` に保存されている

---

## 6. 検証方法

### テストケース

| Case | 操作                   | 期待結果                                  |
| ---- | ---------------------- | ----------------------------------------- |
| 1    | キャッシュミス発生時   | Slack に通知が届く                        |
| 2    | 完全ヒット時           | Slack 通知なし                            |
| 3    | フォールバックヒット時 | 設定に応じて notice または通知なし        |
| 4    | Secrets 未設定時       | ステップがスキップされ、CI は正常完了する |

---

## 7. リスクと対策

| リスク                                                              | 影響度 | 発生確率 | 対策                                                                                             |
| ------------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------ |
| Webhook URL が有効期限切れになり通知が届かなくなる                  | 中     | 低       | Webhook URL のローテーション手順を README に記載する                                             |
| キャッシュミスが頻発する場合にアラート疲弊（alert fatigue）が起きる | 中     | 中       | フォールバックヒットの通知は任意オプション化し、ミスのみをデフォルト通知とする                   |
| Slack API の一時障害で curl が失敗し CI がブロックされる            | 高     | 低       | `continue-on-error: true` を設定し、通知失敗が CI をブロックしないようにする                     |
| 通知ステップ内で Webhook URL が誤ってログに出力される               | 高     | 低       | `curl` コマンドに `--silent` を付け、URL を変数経由でのみ渡す。`echo` でのデバッグ出力を禁止する |

---

## 8. 参照情報

### 関連タスク

- TASK-CI-FUTURE-003（完了済み）: キャッシュヒット率判定ステップの実装
- TASK-CI-FUTURE-009（未実施）: 長期トレンド可視化ダッシュボード
- TASK-CI-FUTURE-011（未実施）: 外部モニタリングサービス導入

### 関連ドキュメント

- `.github/actions/pnpm-install-retry/action.yml`（通知ステップの追加先）
- [Slack Incoming Webhooks 公式ドキュメント](https://api.slack.com/messaging/webhooks)
- [GitHub Actions Secrets の使い方](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions)

---

## 9. 備考

### 苦戦箇所【記入必須】

TASK-CI-FUTURE-003 の実装から引き継ぐ知見：

| 症状                                                         | 原因                                                                                             | 対応                                                                       | 再発防止                                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `::warning::` アノテーションのみではチームへのリーチが限定的 | GitHub Actions のアノテーションは GitHub UI を開いた人しか確認できず、プッシュ通知がない         | Slack Webhook や GitHub の通知設定と組み合わせてチームへのリーチを確保する | CI アラートは必ずプッシュ通知可能な手段（Slack 等）と組み合わせる設計にする |
| TASK-CI-FUTURE-003 のフェーズで意図的にスコープ外とした理由  | Slack Webhook URL の設定はチーム内合意と外部設定が必要なため、個人の実装タスクとして完結できない | チームとの合意形成後に本タスクを実施する                                   | 外部サービス連携を含むタスクは、チームへの確認を Phase 1 に組み込む         |

### 補足事項

- 優先度「低」の理由: `::warning::` アノテーションと GitHub の通知設定で当面は対応可能なため
- GitHub Actions の「ワークフロー失敗通知」を有効にしている場合、ミス時の警告アノテーションは
  UI 上で十分目立つため、Slack 通知はチーム規模が拡大してから導入を検討する
- メール通知は Slack と比較して対応速度が遅い傾向があるため、まず Slack を優先実装する
