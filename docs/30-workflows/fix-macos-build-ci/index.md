# fix-macos-build-ci: GitHub Actions macOS ビルドエラー修正

## 概要

GitHub Actions CI で macOS (Apple Silicon) ビルドが失敗する問題を修正します。

### エラー内容

```
hdiutil: create failed - Device not configured
```

DMGファイルの作成時に `hdiutil` コマンドが失敗しています。これは GitHub Actions の macOS runner 環境での制限によるものです。

## タスク情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| タスクID   | fix-macos-build-ci     |
| 関連Issue  | #212, #230             |
| 関連PR     | -                      |
| 作成日     | 2026-01-13             |
| ステータス | 未開始                 |
| 優先度     | 高（CIが通らないため） |

---

## 問題分析

### 根本原因

1. **hdiutil の制限**: GitHub Actions の macOS runner では、仮想化環境のため `hdiutil create` コマンドが正常に動作しない場合がある
2. **DMG ビルダーの依存関係**: `dmg-builder` パッケージが `hdiutil` を使用してDMGファイルを作成しようとする
3. **権限の問題**: CI環境ではディスクイメージの作成に必要な権限が不足している可能性

### 影響範囲

- `.github/workflows/build-electron.yml`
- `apps/desktop/electron-builder.yml`

---

## Phase一覧

| Phase | 名称                 | ステータス | 完了日 |
| ----- | -------------------- | ---------- | ------ |
| 1     | 要件定義             | 未実施     | -      |
| 2     | 設計                 | 未実施     | -      |
| 3     | 設計レビューゲート   | 未実施     | -      |
| 4     | テスト作成           | 未実施     | -      |
| 5     | 実装                 | 未実施     | -      |
| 6     | テスト拡充           | 未実施     | -      |
| 7     | テストカバレッジ確認 | 未実施     | -      |
| 8     | リファクタリング     | 未実施     | -      |
| 9     | 品質保証             | 未実施     | -      |
| 10    | 最終レビューゲート   | 未実施     | -      |
| 11    | 手動テスト検証       | 未実施     | -      |
| 12    | ドキュメント更新     | 未実施     | -      |
| 13    | PR作成               | 未実施     | -      |

---

## 期待される成果

1. GitHub Actions CI で macOS ビルドが成功する
2. DMGファイルまたは代替配布形式（ZIP）が正常に生成される
3. CIパイプラインが安定して動作する

---

## 関連ドキュメント

- [build-electron.yml](/.github/workflows/build-electron.yml)
- [electron-builder.yml](/apps/desktop/electron-builder.yml)
- [デプロイメント仕様](/.claude/skills/aiworkflow-requirements/references/deployment-electron.md)
- [GitHub Actions仕様](/.claude/skills/aiworkflow-requirements/references/deployment-gha.md)
