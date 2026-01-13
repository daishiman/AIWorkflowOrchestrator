# 問題分析レポート

## 概要

GitHub Actions CI で macOS ビルドが `hdiutil: create failed - Device not configured` エラーで失敗する。

## エラー詳細

### エラーメッセージ

```
hdiutil: create failed - Device not configured
```

### 発生箇所

- **ワークフロー**: `.github/workflows/build-electron.yml`
- **ジョブ**: `build-macos-arm64`
- **ステップ**: `Package (without signing)`
- **コマンド**: `pnpm --filter @repo/desktop package:mac`
- **Runner**: `macos-14` (Apple Silicon)

### エラー発生の流れ

```
1. electron-builder 実行
2. DMG生成フェーズ開始
3. dmg-builder が hdiutil create を呼び出し
4. hdiutil が Device not configured エラーで失敗
5. ビルド全体が失敗
```

## 根本原因分析

### 1. hdiutil の制限

`hdiutil` コマンドは macOS の仮想化環境（GitHub Actions の macos-14 runner）で制限がある。特に DMG イメージの作成には `/dev/disk*` デバイスへのアクセスが必要だが、CI 環境ではこのアクセスが制限されている場合がある。

### 2. GitHub Actions macos-14 runner の特性

- macos-14 は Apple Silicon (M1/M2) ベースの runner
- 仮想化レイヤーが追加されている
- `hdiutil create` の一部機能が制限されている可能性

### 3. electron-builder v26 の DMG 生成

- electron-builder v26.0.0 を使用
- `dmg-builder` パッケージが DMG 生成を担当
- デフォルトで `hdiutil create` を使用

## 現在の設定

### electron-builder.yml (関連部分)

```yaml
mac:
  target:
    - target: dmg
      arch:
        - x64
        - arm64
    - target: zip
      arch:
        - x64
        - arm64

dmg:
  contents:
    - x: 130
      y: 220
    - x: 410
      y: 220
      type: link
      path: /Applications
```

### 影響範囲

| 項目                         | 影響                               |
| ---------------------------- | ---------------------------------- |
| macOS (Apple Silicon) ビルド | 失敗                               |
| macOS (Intel) ビルド         | 無効化中（同様の問題が予想される） |
| Windows ビルド               | 無効化中（影響なし）               |
| Linux ビルド                 | 無効化中（影響なし）               |
| ローカルビルド               | 影響なし（実機では動作する）       |

## 既知の問題調査

### GitHub Issues

- electron-builder の GitHub Issues で同様の報告あり
- GitHub Actions の macos-14 runner で DMG 生成に問題がある報告多数
- 回避策として ZIP のみの生成が推奨されている

### 関連技術情報

- hdiutil は macOS のディスクイメージユーティリティ
- CI 環境では `/dev/disk*` デバイスへのアクセスが制限
- 仮想化環境では DMG 作成に必要な権限が不足する場合がある

## 結論

GitHub Actions の macos-14 runner における仮想化制限により、`hdiutil create` コマンドが正常に動作しない。これは GitHub Actions 側の制限であり、electron-builder の設定変更で回避する必要がある。

## 完了確認

- [x] GitHub Actions のビルドログを詳細に分析した
- [x] `hdiutil` エラーの発生箇所を特定した
- [x] `dmg-builder` パッケージのバージョンと既知の問題を調査した
- [x] GitHub Actions macos-14 runner の制限事項を確認した
