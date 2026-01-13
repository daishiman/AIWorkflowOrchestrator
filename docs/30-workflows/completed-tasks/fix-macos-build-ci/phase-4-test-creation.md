# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 4                  |
| Phase名    | テスト作成         |
| 前提Phase  | Phase 3            |
| 後続Phase  | Phase 5            |
| ステータス | 未実施             |
| 作成日     | 2026-01-13         |
| 機能名     | fix-macos-build-ci |

---

## 目的

`entitlements.mac.plist` ファイル作成による修正が正しく動作することを検証するためのテストを作成する（TDD: Red状態）。

## 背景

CI/CDの修正は、テストによる検証が重要。修正前にテスト基準を定義し、修正後に確実に検証できる状態を作る。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テストシナリオの作成

**目的**: 修正の検証に必要なテストシナリオを定義する

**実行手順**:

1. 正常系テストシナリオを定義
   - entitlements.mac.plistファイルが存在する
   - plistファイルの構文が有効である
   - CIビルドが成功する
   - 成果物（.zip）が生成される
2. 異常系テストシナリオを定義
   - ファイルが存在しない場合のエラー
   - 構文エラーがある場合のエラー
3. エッジケースを定義
   - 空のentitlementsファイル

**テストシナリオ**:

| ID   | シナリオ                         | 期待結果        | 検証方法       |
| ---- | -------------------------------- | --------------- | -------------- |
| T-01 | entitlements.mac.plistが存在する | ファイルが存在  | `test -f`      |
| T-02 | plist構文が有効                  | plutil -lint OK | `plutil -lint` |
| T-03 | CIビルドが成功                   | exit code 0     | GitHub Actions |
| T-04 | .zipファイルが生成される         | ファイルが存在  | `ls *.zip`     |

**期待される成果物**:

- テストシナリオ一覧（`outputs/phase-4/test-scenarios.md`）

---

### タスク2: CI検証スクリプトの作成

**目的**: CIビルドの成功を検証するスクリプトを作成する

**実行手順**:

1. plistファイル存在チェック

```bash
#!/bin/bash
# plist-check.sh
if [ -f "apps/desktop/build/entitlements.mac.plist" ]; then
    echo "✅ entitlements.mac.plist exists"
else
    echo "❌ entitlements.mac.plist not found"
    exit 1
fi
```

2. plist構文検証

```bash
#!/bin/bash
# plist-validate.sh
plutil -lint apps/desktop/build/entitlements.mac.plist
```

3. ビルド成果物確認

```bash
#!/bin/bash
# build-check.sh
if ls apps/desktop/dist/*.zip 1> /dev/null 2>&1; then
    echo "✅ ZIP files found"
else
    echo "❌ No ZIP files found"
    exit 1
fi
```

**期待される成果物**:

- CI検証スクリプト設計書（`outputs/phase-4/ci-verification-scripts.md`）

---

### タスク3: 統合テストシナリオの作成

**目的**: CI/CDパイプライン全体の統合テストを定義する

**実行手順**:

1. entitlements ↔ electron-builder ↔ codesign の連携テスト定義
2. ビルド成果物の整合性テスト定義
3. アーティファクトアップロードのテスト定義

**統合テストシナリオ**:

| シナリオ             | 接続点                                    | 検証内容                     |
| -------------------- | ----------------------------------------- | ---------------------------- |
| entitlements読み込み | electron-builder → entitlements.mac.plist | ファイルが正しく読み込まれる |
| codesign実行         | electron-builder → codesign               | エラーなしで完了             |
| 成果物生成           | electron-builder → dist/                  | .zipファイルが生成される     |
| アーティファクト     | GitHub Actions → artifacts                | アップロード成功             |

**期待される成果物**:

- 統合テスト設計書（`outputs/phase-4/integration-test-design.md`）

---

### タスク4: テスト計画書の作成

**目的**: テスト実行計画を文書化する

**実行手順**:

1. テスト実行環境を定義
2. テスト実行手順を定義
3. 成功/失敗の判定基準を定義
4. テストデータ（あれば）を準備

**テスト実行環境**:

| 環境              | 対象                  | 備考              |
| ----------------- | --------------------- | ----------------- |
| ローカル（macOS） | plist検証、ビルド検証 | Apple Silicon推奨 |
| GitHub Actions    | CI検証                | macos-14 runner   |

**成功/失敗判定基準**:

| テスト         | 成功条件                    |
| -------------- | --------------------------- |
| plist構文      | `plutil -lint` がOKを返す   |
| ローカルビルド | `package:mac` が成功        |
| CI             | `build-electron.yml` が成功 |
| 成果物         | `.zip` ファイルが存在       |

**期待される成果物**:

- テスト計画書（`outputs/phase-4/test-plan.md`）

---

## 参照資料

| 参照資料            | パス                               | 内容             |
| ------------------- | ---------------------------------- | ---------------- |
| Phase 2設計書       | `outputs/phase-2/`                 | 修正設計の詳細   |
| Phase 3レビュー結果 | `outputs/phase-3/`                 | レビュー指摘事項 |
| テスト戦略書        | `outputs/phase-2/test-strategy.md` | テスト戦略       |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                       | 内容       |
| -------------------- | -------------------------------------------------------------------------- | ---------- |
| Electronデプロイ仕様 | `.claude/skills/aiworkflow-requirements/references/deployment-electron.md` | ビルド要件 |

---

## 成果物

| 成果物                 | パス                                         | 内容               |
| ---------------------- | -------------------------------------------- | ------------------ |
| テストシナリオ一覧     | `outputs/phase-4/test-scenarios.md`          | 検証シナリオ       |
| CI検証スクリプト設計書 | `outputs/phase-4/ci-verification-scripts.md` | 検証スクリプト設計 |
| 統合テスト設計書       | `outputs/phase-4/integration-test-design.md` | 統合テスト定義     |
| テスト計画書           | `outputs/phase-4/test-plan.md`               | テスト実行計画     |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 4での統合テスト連携アクション

- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] CI/CDパイプラインの統合テストが含まれている
- [ ] entitlements ↔ codesign の連携テストが定義されている

### 統合テストシナリオカテゴリ

| シナリオカテゴリ   | 検証内容                                       |
| ------------------ | ---------------------------------------------- |
| ファイル存在テスト | entitlements.mac.plistファイルの存在確認       |
| 構文検証テスト     | plistファイルのXML構文検証                     |
| ビルドフローテスト | 依存関係インストール → ビルド → パッケージング |
| 成果物生成テスト   | .zipファイルの生成確認                         |

---

## 完了条件

- [ ] テストシナリオ一覧が作成されている
- [ ] CI検証スクリプト設計書が作成されている
- [ ] 統合テスト設計書が作成されている
- [ ] テスト計画書が作成されている
- [ ] 受け入れ基準ごとにテストシナリオが定義されている
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）であることを確認
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` の Phase 4 を更新

---

## TDD検証

### TDD サイクル確認

```bash
# 現在の状態確認（entitlements.mac.plistが存在しないことを確認）
test -f apps/desktop/build/entitlements.mac.plist && echo "exists" || echo "not exists"

# CI検証（修正前は失敗することを確認）
# GitHub Actionsのログで "build/entitlements.mac.plist: cannot read entitlement data" エラーを確認
```

**確認項目**:

- [ ] `apps/desktop/build/entitlements.mac.plist` が存在しないことを確認（Red状態）
- [ ] CIビルドが「cannot read entitlement data」エラーで失敗することを確認

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/fix-macos-build-ci/phase-5-implementation.md`
