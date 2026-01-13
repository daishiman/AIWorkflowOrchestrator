# 解決策オプション一覧

## 作成日

2026-01-13

## 概要

`entitlements.mac.plist: cannot read entitlement data` エラーを解決するための選択肢を列挙し、各案のメリット・デメリットを整理する。

---

## 解決策一覧

### オプションA: entitlements.mac.plistファイルを新規作成（推奨）

**概要**: `apps/desktop/build/entitlements.mac.plist` ファイルを作成し、Electron/V8に必要な最小限の権限を定義する。

**実装方法**:

1. `apps/desktop/build/` ディレクトリを確認（存在しない場合は作成）
2. `entitlements.mac.plist` ファイルを作成
3. JITコンパイルに必要な権限を定義

**メリット**:
| メリット | 説明 |
|----------|------|
| 設定整合性 | electron-builder.ymlの既存設定と整合 |
| 最小変更 | 新規ファイル追加のみで他の変更不要 |
| Hardened Runtime対応 | macOS公証に必要な設定を維持 |
| 将来性 | 署名付きビルドへの移行が容易 |

**デメリット**:
| デメリット | 説明 |
|------------|------|
| ファイル管理 | 新規ファイルの追加が必要 |

**実現可能性**: ★★★★★ (高)
**実装コスト**: 低
**リスク**: 低

---

### オプションB: electron-builder.ymlからentitlements設定を削除

**概要**: `electron-builder.yml` の `entitlements` および `entitlementsInherit` 設定を削除し、Hardened Runtimeを無効化する。

**実装方法**:

1. `electron-builder.yml` から以下の行を削除:
   - `hardenedRuntime: true`
   - `entitlements: build/entitlements.mac.plist`
   - `entitlementsInherit: build/entitlements.mac.plist`

**メリット**:
| メリット | 説明 |
|----------|------|
| シンプル | 設定を削除するだけ |

**デメリット**:
| デメリット | 説明 |
|------------|------|
| 公証不可 | macOS公証にはHardened Runtimeが必須 |
| セキュリティ低下 | Hardened Runtime保護がなくなる |
| 将来の課題 | 署名付きビルド時に再設定が必要 |

**実現可能性**: ★★★☆☆ (中)
**実装コスト**: 低
**リスク**: 高（将来の公証対応が困難になる）

---

### オプションC: 環境変数でentitlementsパスを動的に設定

**概要**: 環境変数でentitlementsファイルのパスを制御し、CI環境では空または別のパスを指定する。

**実装方法**:

1. GitHub Actions ワークフローに環境変数を追加
2. `electron-builder.yml` を環境変数を参照する形式に変更

**メリット**:
| メリット | 説明 |
|----------|------|
| 柔軟性 | 環境に応じてentitlementsを切り替え可能 |

**デメリット**:
| デメリット | 説明 |
|------------|------|
| 複雑性 | 設定が複雑になる |
| 保守性 | 環境変数の管理が必要 |
| 一貫性欠如 | ローカルとCIで異なる動作 |

**実現可能性**: ★★☆☆☆ (低〜中)
**実装コスト**: 中
**リスク**: 中

---

## 比較表

| オプション                  | 実現可能性 | 実装コスト | リスク | 推奨度 |
| --------------------------- | ---------- | ---------- | ------ | ------ |
| A. ファイル新規作成（推奨） | ★★★★★      | 低         | 低     | ★★★★★  |
| B. 設定削除                 | ★★★☆☆      | 低         | 高     | ★★☆☆☆  |
| C. 環境変数制御             | ★★☆☆☆      | 中         | 中     | ★★☆☆☆  |

---

## 推奨する解決策

**オプションA: entitlements.mac.plistファイルを新規作成**

### 理由

1. **設定整合性**: electron-builder.ymlの既存設定を変更せずに対応
2. **最小変更**: 新規ファイル追加のみで他への影響なし
3. **Hardened Runtime維持**: macOS公証に必要な設定を保持
4. **将来対応**: 署名付きビルドへの移行が容易
5. **最小権限原則**: 必要最小限の権限のみを定義

### 実装内容

`apps/desktop/build/entitlements.mac.plist` を以下の内容で作成:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- JITコンパイル許可 (Electron/V8に必須) -->
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <!-- 署名なしの実行可能メモリ許可 (Electron/V8に必須) -->
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
</dict>
</plist>
```

## 完了確認

- [x] entitlements.mac.plistファイルを新規作成する案（推奨）
- [x] electron-builder.ymlからentitlements設定を削除する案
- [x] 環境変数でentitlementsを制御する案
- [x] 各案のメリット・デメリットを整理した
