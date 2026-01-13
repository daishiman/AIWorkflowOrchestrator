# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 5                  |
| Phase名    | 実装               |
| 前提Phase  | Phase 4            |
| 後続Phase  | Phase 6            |
| ステータス | 未実施             |
| 作成日     | 2026-01-13         |
| 機能名     | fix-macos-build-ci |

---

## 目的

Phase 2の設計に基づき、`entitlements.mac.plist` ファイルを作成し、macOS CIビルドエラーを修正する（TDD: Green状態）。

## 背景

設計レビュー完了後、実際のファイル作成を実装する。テストが通る最小限の実装を目指す。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: buildディレクトリの作成

**目的**: entitlements.mac.plistを配置するディレクトリを作成

**実行手順**:

1. `apps/desktop/` ディレクトリに移動
2. `build/` ディレクトリが存在しない場合は作成

```bash
mkdir -p apps/desktop/build
```

**期待される成果物**:

- `apps/desktop/build/` ディレクトリ

---

### タスク2: entitlements.mac.plistの作成

**目的**: macOS Hardened Runtimeに必要なentitlementsファイルを作成

**実行手順**:

1. `apps/desktop/build/entitlements.mac.plist` を作成
2. Phase 2で設計した内容を記述

**ファイル内容**:

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

- `apps/desktop/build/entitlements.mac.plist`

---

### タスク3: plistファイルの構文検証

**目的**: 作成したplistファイルが有効なXML/plist形式であることを確認

**実行手順**:

1. `plutil -lint` コマンドで構文検証

```bash
plutil -lint apps/desktop/build/entitlements.mac.plist
```

**期待される出力**:

```
apps/desktop/build/entitlements.mac.plist: OK
```

**期待される成果物**:

- 構文検証結果（`outputs/phase-5/plist-validation-result.md`）

---

### タスク4: ローカルでのビルド検証

**目的**: 修正がローカル環境で正常に動作することを確認

**実行手順**:

1. 依存関係をインストール

```bash
pnpm install
```

2. sharedパッケージをビルド

```bash
pnpm --filter @repo/shared build
```

3. desktopアプリをビルド

```bash
pnpm --filter @repo/desktop build
```

4. macOS向けにパッケージング

```bash
pnpm --filter @repo/desktop package:mac
```

5. 成果物の生成を確認

```bash
ls -la apps/desktop/dist/*.zip
```

**期待される成果物**:

- ローカルビルド検証結果（`outputs/phase-5/local-build-result.md`）

---

### タスク5: 実装サマリーの作成

**目的**: 実装内容を文書化する

**実行手順**:

1. 変更したファイル一覧を記録
2. 変更内容の詳細を記録
3. 変更理由を記録
4. 注意点・制約を記録

**変更ファイル一覧**:

| ファイル                                    | 変更内容 |
| ------------------------------------------- | -------- |
| `apps/desktop/build/entitlements.mac.plist` | 新規作成 |

**期待される成果物**:

- 実装サマリー（`outputs/phase-5/implementation-summary.md`）

---

## 参照資料

| 参照資料             | パス                                        | 内容         |
| -------------------- | ------------------------------------------- | ------------ |
| plist構造設計書      | `outputs/phase-2/plist-structure-design.md` | XML構造設計  |
| 権限分析書           | `outputs/phase-2/entitlements-analysis.md`  | 権限選定理由 |
| テスト計画書         | `outputs/phase-4/test-plan.md`              | テスト方法   |
| electron-builder設定 | `apps/desktop/electron-builder.yml`         | ビルド設定   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                       | 内容                 |
| -------------------- | -------------------------------------------------------------------------- | -------------------- |
| Electronデプロイ仕様 | `.claude/skills/aiworkflow-requirements/references/deployment-electron.md` | コードサイニング要件 |

---

## 成果物

| 成果物                 | パス                                         | 内容             |
| ---------------------- | -------------------------------------------- | ---------------- |
| entitlements.mac.plist | `apps/desktop/build/entitlements.mac.plist`  | 新規作成ファイル |
| plist検証結果          | `outputs/phase-5/plist-validation-result.md` | 構文検証結果     |
| ローカルビルド検証結果 | `outputs/phase-5/local-build-result.md`      | 検証結果         |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`  | 変更内容         |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 5での統合テスト連携アクション

- [ ] entitlements.mac.plistが作成されている
- [ ] plistファイルの構文が有効である
- [ ] ローカルでのmacOSビルドが成功している
- [ ] electron-builder.ymlとの整合性が確認されている

---

## 完了条件

- [ ] `apps/desktop/build/` ディレクトリが作成されている
- [ ] `apps/desktop/build/entitlements.mac.plist` が作成されている
- [ ] plistファイルの構文が有効である（plutil -lint OK）
- [ ] ローカルでのビルドが成功している
- [ ] 実装サマリーが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` の Phase 5 を更新

---

## TDD検証

### TDD サイクル確認

```bash
# plist構文検証
plutil -lint apps/desktop/build/entitlements.mac.plist

# ローカルビルド検証
pnpm install
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop build
pnpm --filter @repo/desktop package:mac

# 成果物確認
ls -la apps/desktop/dist/*.zip
```

**確認項目**:

- [ ] plist構文検証が成功することを確認
- [ ] ローカルビルドが成功することを確認（Green状態への移行）
- [ ] .zipファイルが生成されることを確認

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/fix-macos-build-ci/phase-6-test-expansion.md`
