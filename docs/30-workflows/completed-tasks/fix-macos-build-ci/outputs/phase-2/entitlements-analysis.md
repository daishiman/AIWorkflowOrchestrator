# Entitlements権限分析書

## 作成日

2026-01-13

## 概要

macOS Hardened Runtime用のentitlementsを分析し、Electron/V8アプリケーションに必要な最小限の権限を選定する。

---

## Hardened Runtime概要

### Hardened Runtimeとは

macOS 10.14以降で導入されたセキュリティ機能。アプリケーションの実行時に以下の保護を提供：

- ライブラリインジェクション防止
- 動的コード生成の制限
- メモリ保護の強化

### Entitlementsとは

Hardened Runtimeの制限を緩和するための権限宣言。アプリケーションが特定の機能にアクセスするために必要。

---

## 権限分析表

### 分析対象権限

| Entitlement                                                | 説明                     | V8/Electron必要性 | 採用 |
| ---------------------------------------------------------- | ------------------------ | ----------------- | ---- |
| `com.apple.security.cs.allow-jit`                          | JITコンパイル許可        | **必須**          | ✅   |
| `com.apple.security.cs.allow-unsigned-executable-memory`   | 未署名実行メモリ許可     | **必須**          | ✅   |
| `com.apple.security.cs.disable-library-validation`         | ライブラリ検証無効化     | 不要              | ❌   |
| `com.apple.security.cs.disable-executable-page-protection` | 実行ページ保護無効化     | 不要              | ❌   |
| `com.apple.security.cs.allow-dyld-environment-variables`   | DYLD環境変数許可         | 不要              | ❌   |
| `com.apple.security.automation.apple-events`               | Apple Events自動化       | 不要              | ❌   |
| `com.apple.security.device.audio-input`                    | マイクアクセス           | 不要              | ❌   |
| `com.apple.security.device.camera`                         | カメラアクセス           | 不要              | ❌   |
| `com.apple.security.network.client`                        | ネットワーククライアント | 不要\*            | ❌   |
| `com.apple.security.network.server`                        | ネットワークサーバー     | 不要\*            | ❌   |
| `com.apple.security.files.user-selected.read-write`        | ユーザー選択ファイルR/W  | 不要\*            | ❌   |

\*注: これらの権限はApp Store配布時やサンドボックス環境で必要になる場合があるが、現在のHardened Runtime + 署名なしビルドでは不要。

---

## 採用権限の詳細分析

### 1. com.apple.security.cs.allow-jit

| 項目                 | 内容                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| **権限名**           | allow-jit                                                                  |
| **正式キー**         | `com.apple.security.cs.allow-jit`                                          |
| **目的**             | JITコンパイルを許可                                                        |
| **必要理由**         | V8エンジンがJavaScriptをネイティブコードにコンパイルするため               |
| **セキュリティ影響** | メモリ上での動的コード生成を許可（Hardened Runtimeのデフォルト制限を緩和） |
| **採用判定**         | ✅ **必須**                                                                |

### 2. com.apple.security.cs.allow-unsigned-executable-memory

| 項目                 | 内容                                                     |
| -------------------- | -------------------------------------------------------- |
| **権限名**           | allow-unsigned-executable-memory                         |
| **正式キー**         | `com.apple.security.cs.allow-unsigned-executable-memory` |
| **目的**             | 署名なしの実行可能メモリを許可                           |
| **必要理由**         | V8のJITコンパイル済みコード（署名なし）の実行に必要      |
| **セキュリティ影響** | 署名されていないメモリ領域のコード実行を許可             |
| **採用判定**         | ✅ **必須**                                              |

---

## 不採用権限の理由

### disable-library-validation

| 項目                   | 内容                                                      |
| ---------------------- | --------------------------------------------------------- |
| **不採用理由**         | Electronはサードパーティのdylibを動的ロードしないため不要 |
| **セキュリティリスク** | ライブラリインジェクション攻撃のリスク増大                |

### disable-executable-page-protection

| 項目                   | 内容                         |
| ---------------------- | ---------------------------- |
| **不採用理由**         | allow-jitで十分にJIT動作可能 |
| **セキュリティリスク** | メモリ保護の大幅な低下       |

### ネットワーク・ファイル系権限

| 項目           | 内容                                                    |
| -------------- | ------------------------------------------------------- |
| **不採用理由** | App Sandbox環境では必要だが、現在は非サンドボックス環境 |
| **補足**       | 将来的にMac App Store配布時は追加検討が必要             |

---

## 最小権限原則の適用

### 原則

> アプリケーションに付与する権限は、動作に必要な最小限のものに限定する

### 適用結果

```
┌──────────────────────────────────────────────────────────┐
│                 権限選定フロー                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  全entitlements ──► Electron/V8に必要な権限を選別        │
│       │                      │                           │
│       │                      ▼                           │
│       │            ┌─────────────────────┐               │
│       │            │ allow-jit          │ ──► 採用 ✅   │
│       │            │ allow-unsigned-    │               │
│       │            │   executable-memory│ ──► 採用 ✅   │
│       │            └─────────────────────┘               │
│       │                                                  │
│       ▼                                                  │
│  その他全ての権限 ────────────────────────► 不採用 ❌    │
│                                                          │
└──────────────────────────────────────────────────────────┘

採用権限数: 2 / 分析対象: 11 = 最小限の権限のみ採用
```

---

## 結論

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| 採用権限数   | 2                                               |
| 採用権限     | `allow-jit`, `allow-unsigned-executable-memory` |
| 不採用権限数 | 9                                               |
| 最小権限原則 | 適用済み ✅                                     |

---

## 完了確認

- [x] Hardened Runtime用のentitlementsを調査した
- [x] 各権限の必要性を分析した
- [x] 採用/不採用の根拠を記録した
- [x] 最小権限原則を適用した
