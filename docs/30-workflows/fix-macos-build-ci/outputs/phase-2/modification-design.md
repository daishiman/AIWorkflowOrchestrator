# 修正設計書

## 概要

macOS CI ビルドの `hdiutil` エラーを解決するための詳細設計。

---

## 変更対象ファイル

| ファイルパス                        | 変更種別 | 変更内容                     |
| ----------------------------------- | -------- | ---------------------------- |
| `apps/desktop/electron-builder.yml` | 修正     | `mac.target` から DMG を除外 |

---

## 変更詳細

### apps/desktop/electron-builder.yml

#### 変更箇所

`mac.target` セクション（行 36-44）

#### Before

```yaml
mac:
  category: public.app-category.productivity
  artifactName: ${productName}-${version}-${arch}.${ext}
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
  # カスタムプロトコル aiworkflow:// を登録
  extendInfo:
    CFBundleURLTypes:
      - CFBundleURLSchemes:
          - aiworkflow
        CFBundleURLName: com.aiworkflow.auth
        CFBundleTypeRole: Viewer
  target:
    - target: dmg
      arch:
        - x64
        - arm64
    - target: zip
      arch:
        - x64
        - arm64
```

#### After

```yaml
mac:
  category: public.app-category.productivity
  artifactName: ${productName}-${version}-${arch}.${ext}
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
  # カスタムプロトコル aiworkflow:// を登録
  extendInfo:
    CFBundleURLTypes:
      - CFBundleURLSchemes:
          - aiworkflow
        CFBundleURLName: com.aiworkflow.auth
        CFBundleTypeRole: Viewer
  target:
    - target: zip
      arch:
        - x64
        - arm64
```

#### 変更点の説明

| 項目           | 内容                                       |
| -------------- | ------------------------------------------ |
| 削除する行     | `- target: dmg` 以下4行                    |
| 残す行         | `- target: zip` 以下4行                    |
| 削除しない設定 | `dmg` セクション（将来のリリース用に残す） |

---

## 設定値の根拠

### zip ターゲットを残す理由

1. **CI環境での安定性**: `zip` は `hdiutil` を使用しないため、CI環境で確実に動作
2. **配布可能性**: macOS ユーザーは ZIP からアプリをインストール可能
3. **ファイルサイズ**: 圧縮効率は DMG と同等

### dmg セクションを残す理由

1. **将来の拡張性**: リリースワークフローで DMG 生成を再有効化できる
2. **設定の保全**: DMG のカスタマイズ設定を失わない
3. **互換性**: ターゲットを変更するだけで再有効化可能

### アーキテクチャ（arch）の設定

```yaml
arch:
  - x64
  - arm64
```

- **x64**: Intel Mac 向け
- **arm64**: Apple Silicon (M1/M2/M3) Mac 向け
- 両アーキテクチャをサポートすることで、全ての macOS ユーザーに対応

---

## ワークフローへの影響

### .github/workflows/build-electron.yml

**変更不要**

現在のワークフローは以下のように設定されている:

```yaml
- name: Upload artifact
  uses: actions/upload-artifact@v4
  with:
    name: electron-macos-arm64
    path: |
      apps/desktop/dist/*.dmg
      apps/desktop/dist/*.zip
    if-no-files-found: warn
```

- `*.zip` がパスに含まれているため、ZIP のみの場合も正常に動作
- `if-no-files-found: warn` により、DMG がなくてもエラーにならない
- アーティファクト名 `electron-macos-arm64` はそのまま使用

---

## ビルド出力の変更

### Before（DMG + ZIP）

```
apps/desktop/dist/
├── AI Workflow Orchestrator-1.0.0-arm64.dmg
├── AI Workflow Orchestrator-1.0.0-arm64.zip
├── AI Workflow Orchestrator-1.0.0-x64.dmg
└── AI Workflow Orchestrator-1.0.0-x64.zip
```

### After（ZIPのみ）

```
apps/desktop/dist/
├── AI Workflow Orchestrator-1.0.0-arm64.zip
└── AI Workflow Orchestrator-1.0.0-x64.zip
```

---

## ロールバック手順

修正をロールバックする場合:

1. `mac.target` に DMG ターゲットを追加

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
```

2. ローカルでのみビルドする（CI ではエラーになる可能性あり）

---

## 完了確認

- [x] 修正対象ファイルの変更内容を設計した
- [x] 設定値の根拠を明記した
- [x] ワークフローへの影響を確認した
- [x] ロールバック手順を設計した
