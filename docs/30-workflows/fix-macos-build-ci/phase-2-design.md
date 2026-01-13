# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 2                  |
| Phase名    | 設計               |
| 前提Phase  | Phase 1            |
| 後続Phase  | Phase 3            |
| ステータス | 未実施             |
| 作成日     | 2026-01-13         |
| 機能名     | fix-macos-build-ci |

---

## 目的

Phase 1で定義した要件に基づき、`entitlements.mac.plist` ファイルの詳細設計を行う。

## 背景

macOS Hardened Runtimeを使用するElectronアプリには、適切なentitlements（権限）を定義したplistファイルが必要。electron-builder.ymlで参照されている `build/entitlements.mac.plist` を設計する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: entitlements.mac.plist の構造設計

**目的**: plistファイルのXML構造を設計する

**実行手順**:

1. Apple plistファイル形式を確認する
2. Electron/V8に必要なentitlementsを調査する
3. 最小権限原則に基づいて必要な権限を選定する

**設計仕様**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- JIT compilation for V8/Electron -->
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <!-- Unsigned executable memory for V8/Electron -->
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
</dict>
</plist>
```

**期待される成果物**:

- plist構造設計書（`outputs/phase-2/plist-structure-design.md`）

---

### タスク2: Entitlements権限分析

**目的**: 必要な権限を分析し、最小権限原則を適用する

**権限分析表**:

| Entitlement                                                | 説明                 | 必要性             | 採用 |
| ---------------------------------------------------------- | -------------------- | ------------------ | ---- |
| `com.apple.security.cs.allow-jit`                          | JITコンパイル許可    | 必須（V8エンジン） | ✅   |
| `com.apple.security.cs.allow-unsigned-executable-memory`   | 未署名実行メモリ許可 | 必須（V8 JIT）     | ✅   |
| `com.apple.security.cs.disable-library-validation`         | ライブラリ検証無効化 | オプション         | ❌   |
| `com.apple.security.automation.apple-events`               | Apple Events自動化   | オプション         | ❌   |
| `com.apple.security.cs.disable-executable-page-protection` | 実行ページ保護無効化 | オプション         | ❌   |

**設計根拠**:

| 採用権限                         | 根拠                                                 |
| -------------------------------- | ---------------------------------------------------- |
| allow-jit                        | Electron/V8エンジンはJITコンパイルを使用するため必須 |
| allow-unsigned-executable-memory | V8のJITコンパイル済みコードの実行に必須              |

**期待される成果物**:

- 権限分析書（`outputs/phase-2/entitlements-analysis.md`）

---

### タスク3: ファイル配置設計

**目的**: ファイルの配置場所とビルド設定との整合性を確認する

**配置設計**:

```
apps/desktop/
├── build/
│   └── entitlements.mac.plist    ← 新規作成
├── electron-builder.yml          ← 既存（変更不要）
└── ...
```

**electron-builder.yml との整合性確認**:

現在の設定（変更不要）:

```yaml
mac:
  hardenedRuntime: true
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
```

→ `build/entitlements.mac.plist` は `apps/desktop/` からの相対パスとして解釈される。

**期待される成果物**:

- 配置設計書（`outputs/phase-2/file-placement-design.md`）

---

### タスク4: テスト戦略の設計

**目的**: 修正を検証するためのテスト戦略を設計する

**テスト戦略**:

| テスト種別     | 内容                                   | 検証方法                                  |
| -------------- | -------------------------------------- | ----------------------------------------- |
| 構文検証       | plistファイルがXML/plist形式として有効 | `plutil -lint`                            |
| ローカルビルド | macOSでのローカルビルド成功            | `pnpm --filter @repo/desktop package:mac` |
| CI検証         | GitHub Actionsでのビルド成功           | PRでCI実行                                |
| 成果物確認     | .zipファイルが生成される               | アーティファクト確認                      |

**ロールバック手順**:

1. `apps/desktop/build/entitlements.mac.plist` を削除
2. electron-builder.ymlからentitlements設定を削除（必要に応じて）
3. CIを再実行

**期待される成果物**:

- テスト戦略書（`outputs/phase-2/test-strategy.md`）

---

## 参照資料

| 参照資料             | パス                                                                       | 内容                       |
| -------------------- | -------------------------------------------------------------------------- | -------------------------- |
| Phase 1成果物        | `outputs/phase-1/`                                                         | 要件定義と解決策オプション |
| Electronデプロイ仕様 | `.claude/skills/aiworkflow-requirements/references/deployment-electron.md` | Electronリリースの仕様     |
| electron-builder設定 | `apps/desktop/electron-builder.yml`                                        | 現在のビルド設定           |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                       | 内容                 |
| -------------------- | -------------------------------------------------------------------------- | -------------------- |
| Electronデプロイ仕様 | `.claude/skills/aiworkflow-requirements/references/deployment-electron.md` | コードサイニング要件 |

---

## 成果物

| 成果物          | パス                                        | 内容               |
| --------------- | ------------------------------------------- | ------------------ |
| plist構造設計書 | `outputs/phase-2/plist-structure-design.md` | XML構造設計        |
| 権限分析書      | `outputs/phase-2/entitlements-analysis.md`  | 権限選定理由       |
| 配置設計書      | `outputs/phase-2/file-placement-design.md`  | ファイル配置設計   |
| テスト戦略書    | `outputs/phase-2/test-strategy.md`          | 検証方法と判定基準 |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 2での統合テスト連携アクション

- [ ] CI/CDパイプラインの接続点を設計に反映
- [ ] electron-builder ↔ codesign ↔ entitlements の連携を設計に明記
- [ ] ビルド成果物の検証方法を設計に含める

---

## 完了条件

- [ ] plist構造が設計されている
- [ ] 権限分析が完了し、採用権限が決定されている
- [ ] ファイル配置が設計されている
- [ ] テスト戦略が設計されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` の Phase 2 を更新

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/fix-macos-build-ci/phase-3-design-review.md`
