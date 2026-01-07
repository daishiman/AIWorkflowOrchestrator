# ワークフロー設計 - CI/CDカバレッジ閾値統合

## メタ情報

| 項目   | 内容                      |
| ------ | ------------------------- |
| 作成日 | 2026-01-05                |
| 作成者 | Claude Opus 4.5           |
| Phase  | 2                         |
| 機能名 | cicd-coverage-integration |

---

## 1. ワークフロー概要

### 1.1 全体構成

```
push/PR
    ↓
┌─────────┬───────────┬──────────┬──────────┐
│  lint   │ typecheck │   test   │ security │
└────┬────┴─────┬─────┴────┬─────┴──────────┘
     │          │          │
     │          │          └──────→ coverage
     └──────────┴────┬─────────────────┘
                     ↓
               ┌──────────┐
               │  build   │ (needs: lint, typecheck, test)
               └──────────┘
```

### 1.2 ジョブ依存関係

| ジョブ    | 依存先                | 説明                                 |
| --------- | --------------------- | ------------------------------------ |
| lint      | なし                  | 独立して実行                         |
| typecheck | なし                  | 独立して実行                         |
| test      | なし                  | 独立して実行                         |
| security  | なし                  | 独立して実行                         |
| coverage  | test                  | testジョブのカバレッジデータを再利用 |
| build     | lint, typecheck, test | 3ジョブ完了後に実行                  |

---

## 2. coverageジョブ詳細設計

### 2.1 ジョブ定義

```yaml
coverage:
  name: Coverage Check
  runs-on: ubuntu-latest
  timeout-minutes: 10
  needs: [test]
  if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'
  steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup pnpm
      uses: pnpm/action-setup@v4

    - name: Setup Node.js
      uses: actions/setup-node@v6
      with:
        node-version: "22"
        cache: "pnpm"

    - name: Configure git to use HTTPS instead of SSH
      run: git config --global url."https://github.com/".insteadOf "git@github.com:"

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Build shared package
      run: pnpm --filter @repo/shared build

    - name: Run tests with coverage
      run: pnpm test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v5
      with:
        token: ${{ secrets.CODECOV_TOKEN }}
        files: ./packages/shared/coverage/lcov.info,./apps/desktop/coverage/lcov.info
        flags: shared,desktop
        fail_ci_if_error: true
        verbose: true
```

### 2.2 ステップ詳細

| ステップ                   | 目的                                | 所要時間目安 |
| -------------------------- | ----------------------------------- | ------------ |
| Checkout                   | コードをチェックアウト              | ~10秒        |
| Setup pnpm                 | pnpmをセットアップ                  | ~5秒         |
| Setup Node.js              | Node.jsをセットアップ（キャッシュ） | ~30秒        |
| Configure git              | SSH→HTTPS変換                       | ~1秒         |
| Install dependencies       | 依存関係をインストール              | ~1分         |
| Build shared package       | sharedパッケージをビルド            | ~30秒        |
| Run tests with coverage    | テストを実行しカバレッジを収集      | ~2分         |
| Upload coverage to Codecov | Codecovにカバレッジを送信           | ~30秒        |

**合計所要時間**: 約5分以内（NFR-01準拠）

---

## 3. 条件分岐設計

### 3.1 実行条件

```yaml
if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'
```

| イベント     | ブランチ   | 実行 |
| ------------ | ---------- | ---- |
| pull_request | \*         | ✅   |
| push         | main       | ✅   |
| push         | feature/\* | ❌   |

### 3.2 理由

- PRでは必ずカバレッジをチェック（マージ前の品質ゲート）
- mainブランチへの直接pushでもチェック（ベースライン更新）
- featureブランチへの直接pushは不要（PRでチェックするため）

---

## 4. カバレッジファイル設計

### 4.1 出力ファイルパス

| パッケージ | カバレッジファイル                   |
| ---------- | ------------------------------------ |
| shared     | `packages/shared/coverage/lcov.info` |
| desktop    | `apps/desktop/coverage/lcov.info`    |

### 4.2 フラグ設計

```yaml
flags: shared,desktop
```

- `shared`: packages/sharedのカバレッジ
- `desktop`: apps/desktopのカバレッジ

Codecovダッシュボードでパッケージ別にカバレッジを確認可能。

---

## 5. エラーハンドリング設計

### 5.1 fail_ci_if_error

```yaml
fail_ci_if_error: true
```

| 状況                    | 動作   |
| ----------------------- | ------ |
| Codecovアップロード成功 | CI続行 |
| Codecovアップロード失敗 | CI失敗 |
| カバレッジ閾値未達      | CI失敗 |
| Codecovサービス障害     | CI失敗 |

### 5.2 タイムアウト

```yaml
timeout-minutes: 10
```

- 通常5分以内で完了
- 余裕を持って10分に設定
- タイムアウト時はCI失敗

---

## 6. 既存ワークフローとの整合性

### 6.1 変更点

| 項目                     | 変更前                  | 変更後                 |
| ------------------------ | ----------------------- | ---------------------- |
| coverageジョブ           | なし                    | 新規追加               |
| testジョブのcoverage実行 | continue-on-error: true | 維持（既存動作を保持） |
| buildジョブの依存        | lint, typecheck, test   | 変更なし               |

### 6.2 後方互換性

- 既存のlint, typecheck, test, security, buildジョブは変更なし
- coverageジョブは独立して追加
- buildジョブはcoverageを待たない（並列性維持）

---

## 7. パフォーマンス考慮

### 7.1 キャッシュ活用

```yaml
cache: "pnpm"
```

- pnpmの依存関係キャッシュを活用
- 初回実行後は高速化

### 7.2 並列実行

- lint, typecheck, test, securityは並列実行
- coverageはtestの後に実行（依存関係）
- buildはcoverageと並列可能
