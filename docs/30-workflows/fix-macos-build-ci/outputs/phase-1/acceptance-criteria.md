# 受け入れ基準書

## 作成日

2026-01-13

## 受け入れ基準一覧

| ID    | 受け入れ基準                                          | 検証方法                                                 | 期待結果           |
| ----- | ----------------------------------------------------- | -------------------------------------------------------- | ------------------ |
| AC-01 | `apps/desktop/build/entitlements.mac.plist`が存在する | `test -f apps/desktop/build/entitlements.mac.plist`      | ファイルが存在する |
| AC-02 | plistファイルが有効なXML/plist形式である              | `plutil -lint apps/desktop/build/entitlements.mac.plist` | "OK"が返される     |
| AC-03 | GitHub Actions `build-electron.yml`が成功する         | PRでCI実行                                               | ジョブがグリーン   |
| AC-04 | ビルド成果物（.zip）が生成される                      | アーティファクト確認                                     | ZIPファイルが存在  |
| AC-05 | 生成されたアプリがmacOSで起動できる                   | 手動テスト                                               | アプリが起動する   |

## 検証手順

### AC-01: ファイル存在確認

```bash
test -f apps/desktop/build/entitlements.mac.plist && echo "✅ exists" || echo "❌ not found"
```

### AC-02: plist構文検証

```bash
plutil -lint apps/desktop/build/entitlements.mac.plist
# 期待結果: apps/desktop/build/entitlements.mac.plist: OK
```

### AC-03: CIビルド成功確認

1. 修正をブランチにコミット
2. PRを作成
3. GitHub Actionsの`build-electron.yml`ワークフローが成功することを確認
4. `build-macos-arm64`ジョブがグリーンであることを確認

### AC-04: 成果物生成確認

1. GitHub Actionsのアーティファクトを確認
2. `electron-macos-arm64`アーティファクトが存在することを確認
3. 以下のファイルが含まれることを確認:
   - `*.zip`ファイル

### AC-05: アプリ起動確認

1. アーティファクトをダウンロード
2. ZIPファイルを展開
3. アプリを起動
4. エラーなく起動することを確認

## 完了判定

すべての受け入れ基準（AC-01〜AC-05）が満たされた場合、本タスクは完了とする。
