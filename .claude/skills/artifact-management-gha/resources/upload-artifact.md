# Upload Artifact 詳細

## actions/upload-artifact@v4

### 基本構文

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: artifact-name # 必須: アーティファクト名
    path: path/to/files # 必須: アップロードするファイル/ディレクトリ
    retention-days: 7 # オプション: 保持期間（1-90日、デフォルト90）
    if-no-files-found: warn # オプション: warn, error, ignore
    compression-level: 6 # オプション: 0-9（デフォルト6）
```

## パス指定パターン

### 単一ファイル

```yaml
path: dist/app.js
```

### ディレクトリ全体

```yaml
path: dist/
```

### 複数パス（YAML multiline）

```yaml
path: |
  dist/
  build/
  *.log
```

### グロブパターン

```yaml
path: |
  **/*.js
  **/*.css
  !node_modules/**
```

### 除外パターン

```yaml
path: |
  dist/
  !dist/**/*.map
  !dist/**/*.test.js
```

## オプション詳細

### retention-days

保持期間を1-90日で指定。期間経過後、自動削除されます。

```yaml
retention-days: 7   # 7日間保持
retention-days: 1   # 1日間保持（デバッグ用）
retention-days: 90  # 90日間保持（最大）
```

**推奨設定**:

- CI/CDビルド: 7-14日
- リリースパッケージ: 30-90日
- デバッグログ: 1-3日

### if-no-files-found

ファイルが見つからない場合の動作を制御。

```yaml
if-no-files-found: warn   # 警告を出力（デフォルト）
if-no-files-found: error  # エラーでワークフロー失敗
if-no-files-found: ignore # 無視
```

**推奨設定**:

- 必須ビルド成果物: `error`
- オプショナルログ: `warn` または `ignore`

### compression-level

圧縮レベルを0-9で指定（0=無圧縮、9=最大圧縮）。

```yaml
compression-level: 0  # 高速、大容量
compression-level: 6  # バランス（デフォルト）
compression-level: 9  # 低速、小容量
```

**推奨設定**:

- 大きなバイナリ（既に圧縮済み）: 0-3
- テキストファイル、ログ: 6-9
- 一般的なビルド成果物: 6

## 実践例

### ビルド成果物アップロード

```yaml
- name: Upload build artifacts
  uses: actions/upload-artifact@v4
  with:
    name: build-${{ github.sha }}
    path: |
      dist/
      !dist/**/*.map
    retention-days: 14
    if-no-files-found: error
```

### テストレポートアップロード

```yaml
- name: Upload test reports
  uses: actions/upload-artifact@v4
  with:
    name: test-reports-${{ matrix.os }}
    path: |
      coverage/
      test-results/
    retention-days: 7
    if-no-files-found: warn
```

### デバッグログアップロード

```yaml
- name: Upload debug logs
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: debug-logs-${{ github.run_id }}
    path: |
      **/*.log
      !node_modules/**
    retention-days: 3
    compression-level: 9
```

### 複数プラットフォームビルド

```yaml
- name: Upload platform-specific build
  uses: actions/upload-artifact@v4
  with:
    name: app-${{ matrix.os }}-${{ matrix.arch }}
    path: build/
    retention-days: 30
```

## パフォーマンス最適化

### 大きなアーティファクトの分割

```yaml
# 悪い例: 1つの巨大アーティファクト
- uses: actions/upload-artifact@v4
  with:
    name: all-outputs
    path: . # すべてアップロード

# 良い例: 必要なものだけ分割
- uses: actions/upload-artifact@v4
  with:
    name: app-binaries
    path: bin/

- uses: actions/upload-artifact@v4
  with:
    name: documentation
    path: docs/
```

### 不要ファイル除外

```yaml
path: |
  dist/
  !dist/**/*.map          # ソースマップ除外
  !dist/**/*.test.js      # テストファイル除外
  !dist/**/node_modules   # 依存関係除外
```

### 圧縮前の最適化

```yaml
- name: Optimize before upload
  run: |
    # 不要ファイル削除
    find dist -name "*.map" -delete
    find dist -name "*.test.js" -delete

    # 既に圧縮
    tar czf app.tar.gz dist/

- name: Upload optimized artifact
  uses: actions/upload-artifact@v4
  with:
    name: app-optimized
    path: app.tar.gz
    compression-level: 0 # 既に圧縮済み
```

## トラブルシューティング

### エラー: "No files were found"

**原因**: pathで指定したファイルが存在しない

**解決策**:

1. ビルドステップが成功しているか確認
2. パスが正しいか確認（相対パスはワーキングディレクトリから）
3. `if-no-files-found: warn`に変更してデバッグ

```yaml
- name: Debug path
  run: ls -la dist/

- uses: actions/upload-artifact@v4
  with:
    name: build
    path: dist/
    if-no-files-found: warn # デバッグ用
```

### 警告: "Artifact size exceeds limit"

**原因**: アーティファクトサイズが大きすぎる

**解決策**:

1. 不要ファイルを除外
2. 圧縮レベルを上げる
3. 複数のアーティファクトに分割

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: build
    path: |
      dist/
      !dist/**/*.map
      !dist/**/node_modules
    compression-level: 9
```

## ベストプラクティス

### 命名規則

```yaml
# バージョン付き
name: app-v${{ github.ref_name }}

# コミットハッシュ付き
name: build-${{ github.sha }}

# ビルド番号付き
name: artifacts-${{ github.run_number }}

# マトリックス変数付き
name: app-${{ matrix.os }}-${{ matrix.node }}
```

### 条件付きアップロード

```yaml
# 失敗時のみ
- uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: failure-logs

# 特定ブランチのみ
- uses: actions/upload-artifact@v4
  if: github.ref == 'refs/heads/main'
  with:
    name: release-build

# PRのみ
- uses: actions/upload-artifact@v4
  if: github.event_name == 'pull_request'
  with:
    name: pr-preview
```

### セキュリティ考慮

```yaml
# センシティブ情報を除外
path: |
  dist/
  !dist/**/.env*
  !dist/**/*.key
  !dist/**/*secret*
```

## 参考リンク

- [actions/upload-artifact - GitHub Marketplace](https://github.com/marketplace/actions/upload-a-build-artifact)
- [GitHub Actions Artifacts documentation](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
