# GitHub Actions CI/CD パイプライン

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

**親ドキュメント**: [deployment.md](./deployment.md)

## 概要

本ドキュメントは、AIWorkflowOrchestratorプロジェクトのGitHub Actions CI/CDパイプライン設定を定義する。

### 目的

- PR時の品質ゲート（Lint・型チェック・テスト・ビルド）を自動化
- mainブランチへのマージ時のCD（自動デプロイ・通知）を実行
- テスト並列実行による高速フィードバックを実現

### スコープ

| 対象 | 説明 |
| ---- | ---- |
| CI | PRトリガーの品質検証（ci.yml） |
| CD | mainマージ時の自動デプロイ（backend-cd.yml、web-cd.yml） |
| 最適化 | テストシャーディング、キャッシュ戦略、並列実行 |

### 設計原則

| 原則 | 説明 |
| ---- | ---- |
| 高速フィードバック | シャード分割とキャッシュで実行時間を最小化 |
| 品質ゲート | テスト・カバレッジ未達でマージをブロック |
| コスト効率 | 条件分岐でPR時は軽量実行、main時のみフル計測 |

---

## ワークフロー構成

| ファイル         | 用途                                                |
| ---------------- | --------------------------------------------------- |
| `ci.yml`         | PR時のCI（Lint・型チェック・テスト・ビルド）        |
| `backend-cd.yml` | バックエンドCD（Railway自動デプロイ + Discord通知） |
| `web-cd.yml`     | WebアプリCD（Railway自動デプロイ + Discord通知）    |

---

## CI ワークフロー要件（PR時）

### トリガー条件

- PRがmainブランチに対して作成されたとき
- PRに新しいコミットがプッシュされたとき

### 実行ステップ

1. リポジトリコードの取得
2. pnpmのセットアップ（バージョン: 9.x）
3. Node.jsのセットアップ（バージョン: 22.x LTS）
4. pnpmキャッシュの有効化
5. 依存関係のインストール（frozen-lockfileモード）
6. TypeScript型チェックの実行
7. ESLintによるコード品質チェック
8. Next.jsビルドの確認
9. Vitestによるユニットテストの実行
10. **カバレッジチェックとCodecov連携**（実装済み 2026-01-05）
    - testジョブ完了後にカバレッジを収集
    - Codecovにレポートをアップロード
    - 閾値80%未達でCI失敗
11. **Electron E2Eテスト実行**（実装済み 2026-03-01）
    - `e2e-desktop` ジョブで Playwright + Chromium を起動
    - `xvfb-run` で headless GUI 環境を提供
    - `apps/desktop/playwright-report/` を artifact 保存

### 品質ゲート

- すべてのステップが成功しない限りPRをマージできないようにする
- テストは前のステップが失敗しても必ず実行する
- **カバレッジが80%未満の場合、CIを失敗させる**（実装済み 2026-01-05）
  - Project coverage: 80%以上
  - Patch coverage: 80%以上
  - 設定ファイル: `codecov.yml`
- `e2e-desktop` が失敗した場合はCI全体を失敗とする（IPC実環境回帰の防止）

### 追加品質ゲート候補: IPC Contract Drift Audit（UT-TASK06-007）

desktop IPC / preload surface を変更するPRでは、以下の静的監査を typecheck と対象テストの後段に置く。

```bash
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --strict
```

- exit code `1` は error レベル drift を意味し、CI fail 条件として扱える
- `--report-only --format json` は triage や artifact 保存向け
- この節は「CI に組み込むときの正本順序」を定義するものであり、全 workflow がすでに wiring 済みであることまでは主張しない

---

## キャッシュ戦略

### キャッシュAction

| 項目 | 設定 |
| ---- | ---- |
| 使用Action | actions/cache@v4 |
| 特徴 | 高速なキャッシュ復元、圧縮対応、並列ダウンロード |
| フォールバック | restore-keysで部分マッチ対応 |

### pnpm キャッシュ

| 項目           | 設定                                  |
| -------------- | ------------------------------------- |
| 対象           | pnpmストア、node_modules              |
| キャッシュキー | OS + pnpm-lock.yamlのハッシュ         |
| フォールバック | OS のみでマッチ                       |
| 効果           | 初回3-5分 → キャッシュヒット時30-60秒 |

### ビルドキャッシュ

| 項目           | 設定                               |
| -------------- | ---------------------------------- |
| 対象           | `.next/cache`、`.tsbuildinfo`      |
| キャッシュキー | OS + Git SHA                       |
| フォールバック | OS + ブランチ名                    |
| 注意点         | ブランチごとにキャッシュを分離する |

---

## 並列実行の活用

### 並列実行可能なジョブ

- lintとtypecheckは依存関係がないため並列実行可能
- 複数パッケージのテストは`--filter`で分離して並列実行

### 順次実行必須なジョブ

- build → test（テストはビルド成果物が必要）
- test → deploy（品質ゲート通過後のみデプロイ）

### GitHub Actions無料枠

- パブリックリポジトリ：無制限
- プライベートリポジトリ：月2,000分

### テストシャード戦略（TASK-OPT-CI-TEST-PARALLEL-001 2026-02-02実装）

テスト実行時間を短縮するため、GitHub Actions matrixでシャード分割を行う。

| 項目 | 設定値 | 効果 |
| ---- | ------ | ---- |
| シャード数 | 16 | 各シャード約25ファイル |
| 分散方式 | Vitest --shard=N/M | ファイルハッシュベースで均等分配 |
| 並列度 | maxForks=4 (CI) | I/O待ち時間活用 |
| ファイル並列化 | fileParallelism=true (CI) | 複数ファイル同時実行 |

**ジョブ依存グラフ**:

| ジョブ | 依存関係 | 並列実行 |
| ------ | -------- | -------- |
| lint | なし | 可 |
| build-shared | なし | 可 |
| typecheck | build-shared | 条件付き |
| test-shared | build-shared | 条件付き |
| test-desktop[shard 1-16] | build-shared | 16並列 |
| coverage | test-desktop全完了 | 順次 |

**shared packageビルドキャッシュ**:

| 項目 | 設定 |
| ---- | ---- |
| キャッシュパス | packages/shared/dist |
| キャッシュキー | OS + packages/shared/src/** + pnpm-lock.yaml ハッシュ |
| フォールバック | OS のみでマッチ |
| 効果 | sharedパッケージ未変更時ビルドスキップ |

**カバレッジ条件分岐**:

| イベント | カバレッジ計測 | 理由 |
| -------- | -------------- | ---- |
| pull_request | なし | 高速フィードバック優先 |
| push (main) | あり | 品質メトリクス収集 |

### Vitest並列化設定（CI環境）

| 設定項目 | CI値 | ローカル値 | 理由 |
| -------- | ---- | ---------- | ---- |
| maxForks | 4 | CPUコア数/2 | CIは2コアだがI/O活用で4並列 |
| fileParallelism | true | 環境変数制御可 | CI高速化、ローカルは安定性重視 |
| testTimeout | 10秒 | 10秒 | 両環境共通 |
| pool | forks | forks | プロセス分離で安定性確保 |

**環境変数による制御**:

| 環境変数 | 用途 |
| -------- | ---- |
| VITEST_MAX_FORKS | ローカルでのfork数上書き |
| VITEST_FILE_PARALLELISM | falseでファイル並列化無効化 |

### Electron E2Eジョブ設計（UT-IMP-PHASE11-WORKTREE-PROTOCOL-001 2026-03-01）

`ci.yml` に `e2e-desktop` ジョブを追加し、Worktreeで代替していたLayer 3（実環境E2E）をCIで自動実行する。

| 項目 | 設定 |
| ---- | ---- |
| ジョブ名 | `e2e-desktop` |
| 依存関係 | `build-shared` |
| 実行環境 | `ubuntu-latest` + `CI=true` |
| ブラウザ | `playwright install --with-deps chromium` |
| 実行コマンド | `xvfb-run --auto-servernum pnpm --filter @repo/desktop exec playwright test` |
| 成果物 | `apps/desktop/playwright-report/`（retention 7日） |
| キャッシュ | `~/.cache/ms-playwright`（`actions/cache@v4`） |

---

## CD ワークフロー要件（mainマージ時）

### トリガー条件

- mainブランチへのプッシュ（PRマージ時）

### 実行内容

1. Railwayの自動デプロイが開始されたことを確認
2. ヘルスチェックエンドポイントで正常性を確認
3. Discord Webhookへの通知を送信

### 通知要件

| 項目           | 説明                                         |
| -------------- | -------------------------------------------- |
| 形式           | Discord Embed形式で視認性を向上              |
| 内容           | コミットハッシュ、ブランチ名、作成者を含める |
| タイムスタンプ | 付与する                                     |
| 成功時         | 緑色のEmbedでデプロイ完了を通知              |
| 失敗時         | 赤色のEmbedでエラー内容を通知                |

---

## モニタリングとアラート

### ヘルスチェックエンドポイント設計

**基本ヘルスチェック（`/api/health`）**

| 項目             | 仕様                                 |
| ---------------- | ------------------------------------ |
| ステータスコード | 200                                  |
| レスポンス       | ステータスとタイムスタンプを含むJSON |
| 実行時間         | 100ms以内                            |
| 内容             | サーバー稼働状況のみ                 |

**詳細ヘルスチェック（`/api/health/detailed`）**

| チェック項目     | 説明                   |
| ---------------- | ---------------------- |
| データベース接続 | Tursoへの接続確認      |
| 外部API疎通      | 依存サービスの応答確認 |
| メモリ使用量     | 閾値超過の検出         |

### 監視すべきメトリクス（ゴールデンシグナル）

| シグナル         | 測定項目          | 目標値           |
| ---------------- | ----------------- | ---------------- |
| レイテンシ       | p50, p95, p99     | p95 < 500ms      |
| トラフィック     | リクエスト数/分   | ベースライン把握 |
| エラー           | エラー率          | < 1%             |
| サチュレーション | CPU、メモリ使用率 | < 80%            |

### Discord通知

**通知レベル**

| レベル   | トリガー                           | 対応期限   |
| -------- | ---------------------------------- | ---------- |
| Critical | サービスダウン、エラー率>10%       | 即座に対応 |
| Warning  | エラー率5-10%、パフォーマンス劣化  | 24時間以内 |
| Info     | デプロイ成功、定期バックアップ完了 | 記録のみ   |

**通知抑制**

- 同じアラートの連続送信を防止（5分間隔）
- メンテナンスモード時は通知を停止

---

## GitHub Secrets の要件

| Secret名              | 用途                          | 必須 |
| --------------------- | ----------------------------- | ---- |
| `RAILWAY_TOKEN`       | Railway CLIデプロイ認証       | Yes  |
| `RAILWAY_DOMAIN`      | バックエンドヘルスチェックURL | Yes  |
| `DISCORD_WEBHOOK_URL` | Discord通知用WebhookURL       | No   |

### セキュリティ要件

| 要件       | 説明                               |
| ---------- | ---------------------------------- |
| 設定場所   | GitHubリポジトリのSettingsから設定 |
| 注入方法   | 環境変数として安全に注入           |
| マスク処理 | ログに出力されないようマスク処理   |

---

## 関連ドキュメント

- [デプロイメント概要](./deployment.md)
- [Railwayデプロイ](./deployment-railway.md)
- [Electronリリース](./deployment-electron.md)

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-03-01 | 1.2.0      | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001: `ci.yml` に `e2e-desktop` ジョブを追加（Playwright browser cache, chromium install, `xvfb-run` 実行, E2Eレポートartifact保存）。品質ゲートへE2E成功条件を追加 |
| 2026-02-02 | 1.1.0      | TASK-OPT-CI-TEST-PARALLEL-001: テストシャード戦略（16シャード）、shared packageビルドキャッシュ、カバレッジ条件分岐、Vitest並列化設定、環境変数制御、actions/cache@v4明記追加 |
| 2026-01-05 | 1.0.0      | 初版作成（カバレッジチェック・Codecov連携追加） |
