# セキュリティ設計 - CI/CDカバレッジ閾値統合

## メタ情報

| 項目   | 内容                      |
| ------ | ------------------------- |
| 作成日 | 2026-01-05                |
| 作成者 | Claude Opus 4.5           |
| Phase  | 2                         |
| 機能名 | cicd-coverage-integration |

---

## 1. Secrets管理

### 1.1 必要なSecrets

| Secret名      | 用途                | 取得元                | 必須 |
| ------------- | ------------------- | --------------------- | ---- |
| CODECOV_TOKEN | Codecov認証トークン | Codecovダッシュボード | ✅   |

### 1.2 Secretsの設定方法

1. Codecov (https://codecov.io) にGitHubでサインイン
2. 対象リポジトリを追加
3. Settings → General → Repository Upload Token をコピー
4. GitHubリポジトリ → Settings → Secrets and variables → Actions
5. New repository secret → Name: `CODECOV_TOKEN`, Value: コピーしたトークン

### 1.3 Secretsの参照方法

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v5
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
```

**注意**: トークンは絶対にログに出力しない

---

## 2. 権限設計（最小権限の原則）

### 2.1 現行権限設定

```yaml
permissions:
  contents: read
  pull-requests: read
```

### 2.2 coverageジョブに必要な権限

| 権限          | レベル | 用途                          | 必要性 |
| ------------- | ------ | ----------------------------- | ------ |
| contents      | read   | コードのチェックアウト        | ✅     |
| pull-requests | read   | PR情報の読み取り              | ✅     |
| pull-requests | write  | PRへのコメント（Codecov経由） | ❌※    |

**※ Codecov Appが別途権限を持つため、workflowでは不要**

### 2.3 権限の追加不要

- Codecov GitHub Appがリポジトリにインストールされていれば、PRコメントはApp経由で行われる
- workflow側で`pull-requests: write`を追加する必要はない

---

## 3. サードパーティAction検証

### 3.1 使用するAction

| Action                 | バージョン | 発行元  | 検証状況 |
| ---------------------- | ---------- | ------- | -------- |
| actions/checkout       | v4         | GitHub  | ✅ 公式  |
| pnpm/action-setup      | v4         | pnpm    | ✅ 公式  |
| actions/setup-node     | v6         | GitHub  | ✅ 公式  |
| codecov/codecov-action | v5         | Codecov | ✅ 公式  |

### 3.2 バージョン固定の理由

```yaml
uses: codecov/codecov-action@v5 # メジャーバージョン固定
```

| 固定方法     | 例         | メリット             | デメリット           |
| ------------ | ---------- | -------------------- | -------------------- |
| SHA固定      | @abc123... | 完全固定、最も安全   | 更新が手動           |
| タグ固定     | @v5.0.0    | 特定バージョン固定   | セキュリティ修正なし |
| メジャー固定 | @v5        | 互換性維持しつつ更新 | バグの可能性         |

**選択**: メジャーバージョン固定（@v5）

- 理由: セキュリティ修正を自動的に受け取りつつ、破壊的変更を防ぐ

---

## 4. 情報漏洩対策

### 4.1 ログ出力の制御

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v5
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    verbose: true # デバッグ時のみ、本番ではfalse推奨
```

| 設定    | 値    | 説明                           |
| ------- | ----- | ------------------------------ |
| verbose | true  | 詳細ログ（トークンは含まない） |
| dry_run | false | 実際にアップロード             |

### 4.2 Secretsのマスキング

- GitHub Actionsは自動的にSecretsをログからマスク
- `***` として表示される
- 明示的なechoは避ける

```yaml
# ❌ 絶対にやらない
- run: echo ${{ secrets.CODECOV_TOKEN }}

# ✅ 正しい使用方法
- uses: codecov/codecov-action@v5
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
```

---

## 5. Fork PR対策

### 5.1 Forkからのプルリクエスト

| 状況                   | CODECOV_TOKEN | 対策             |
| ---------------------- | ------------- | ---------------- |
| 同一リポジトリからのPR | 利用可能      | 通常動作         |
| ForkからのPR           | 利用不可      | tokenless upload |

### 5.2 Codecov tokenless upload

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v5
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    fail_ci_if_error: true
```

- Public リポジトリではtokenなしでもアップロード可能
- Private リポジトリではForkからのPRはカバレッジ不可
- 現在のリポジトリ設定に応じて検討

---

## 6. セキュリティチェックリスト

### 6.1 実装前チェック

- [ ] CODECOV_TOKENがGitHub Secretsに設定されている
- [ ] Codecov GitHub Appがインストールされている
- [ ] リポジトリがCodecovに連携されている

### 6.2 実装後チェック

- [ ] ログにトークンが出力されていない
- [ ] PRにCodecovコメントが表示される
- [ ] カバレッジステータスが正しく表示される

### 6.3 定期チェック

- [ ] Codecov Actionのバージョンが最新か確認（月次）
- [ ] トークンのローテーション（必要に応じて）

---

## 7. インシデント対応

### 7.1 トークン漏洩時の対応

1. Codecovダッシュボードでトークンを再生成
2. GitHub Secretsを更新
3. 漏洩経路の調査・対策

### 7.2 Codecovサービス障害時

```yaml
fail_ci_if_error: true # 障害時はCIを失敗させる
```

- 一時的に`false`に変更してCI続行も可能
- 復旧後に`true`に戻す
