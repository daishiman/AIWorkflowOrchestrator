# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 1                  |
| Phase名    | 要件定義           |
| 前提Phase  | -                  |
| 後続Phase  | Phase 2            |
| ステータス | 未実施             |
| 作成日     | 2026-01-13         |
| 機能名     | fix-macos-build-ci |

---

## 目的

GitHub Actions CI で macOS ビルドが失敗する問題（entitlements.mac.plist不足）の要件を明確化し、受け入れ基準を定義する。

## 背景

GitHub Actions の macOS runner (macos-14) で Electron アプリのコードサイニング時に `entitlements.mac.plist` ファイルが見つからずエラーが発生している。

**エラーメッセージ**:

```
⨯ Command failed: codesign --sign - --force --timestamp --options runtime
  --entitlements build/entitlements.mac.plist
  /path/to/app.asar.unpacked/node_modules/@anthropic-ai/claude-agent-sdk/vendor/ripgrep/arm64-darwin/rg
build/entitlements.mac.plist: cannot read entitlement data
```

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 問題の詳細分析

**目的**: エラーの根本原因を特定し、影響範囲を明確にする

**実行手順**:

1. GitHub Actions のビルドログを詳細に分析する
2. `codesign` エラーの発生箇所を特定する
3. `electron-builder.yml` の entitlements 設定を確認する
4. `apps/desktop/build/` ディレクトリの存在を確認する

**分析結果**:

| 項目           | 状況                                                                          |
| -------------- | ----------------------------------------------------------------------------- |
| エラー発生箇所 | codesign コマンド実行時                                                       |
| 設定ファイル   | `electron-builder.yml` で `entitlements: build/entitlements.mac.plist` が設定 |
| ファイル存在   | `apps/desktop/build/entitlements.mac.plist` が存在しない                      |
| 原因           | 設定で参照されているファイルが未作成                                          |

**期待される成果物**:

- 問題分析レポート（`outputs/phase-1/problem-analysis.md`）

---

### タスク2: 解決策の特定

**目的**: 問題解決のための方法を明確にする

**実行手順**:

1. entitlements.mac.plistファイルを新規作成する
2. macOS Hardened Runtimeに必要なentitlementsを定義する
3. electron-builder.ymlの既存設定との整合性を確認する

**解決策**:

| オプション      | 内容                                               | 採用                         |
| --------------- | -------------------------------------------------- | ---------------------------- |
| A: ファイル作成 | `apps/desktop/build/entitlements.mac.plist` を作成 | ✅                           |
| B: 設定変更     | electron-builder.ymlからentitlements設定を削除     | ❌（Hardened Runtimeに必要） |

**期待される成果物**:

- 解決策オプション一覧（`outputs/phase-1/solution-options.md`）

---

### タスク3: 要件定義書の作成

**目的**: 修正の要件と受け入れ基準を明確化する

**機能要件（FR）**:

| ID    | 要件                                                           | 優先度 |
| ----- | -------------------------------------------------------------- | ------ |
| FR-01 | `apps/desktop/build/entitlements.mac.plist` ファイルを作成する | 高     |
| FR-02 | entitlementsにmacOS Hardened Runtime必須権限を定義する         | 高     |
| FR-03 | GitHub Actions CI でmacOSビルドが成功すること                  | 高     |

**非機能要件（NFR）**:

| ID     | 要件                                               | 優先度 |
| ------ | -------------------------------------------------- | ------ |
| NFR-01 | electron-builder.yml設定との互換性を維持する       | 高     |
| NFR-02 | ローカル環境でもビルドが成功すること               | 中     |
| NFR-03 | 必要最小限のentitlementsのみを付与する（最小権限） | 高     |

**期待される成果物**:

- 要件定義書（`outputs/phase-1/requirements-definition.md`）

---

### タスク4: 受け入れ基準の定義

**目的**: 検証可能な基準を定義する

| ID   | 受け入れ基準                                       | 検証方法             |
| ---- | -------------------------------------------------- | -------------------- |
| AC-1 | `apps/desktop/build/entitlements.mac.plist` が存在 | ファイル確認         |
| AC-2 | plistファイルが有効なXML形式                       | xmllint検証          |
| AC-3 | GitHub Actions `build-electron.yml` が成功         | CI実行確認           |
| AC-4 | ビルド成果物（.zip）が生成される                   | アーティファクト確認 |
| AC-5 | 生成されたアプリがmacOSで起動できる                | 手動テスト           |

**期待される成果物**:

- 受け入れ基準書（`outputs/phase-1/acceptance-criteria.md`）

---

### タスク5: スコープ定義

**目的**: 修正対象と対象外を明確にする

**対象範囲**:

| 対象         | 説明                                        |
| ------------ | ------------------------------------------- |
| 新規ファイル | `apps/desktop/build/entitlements.mac.plist` |

**対象外**:

| 対象外                   | 理由                     |
| ------------------------ | ------------------------ |
| electron-builder.yml変更 | 既存設定は正しい         |
| build-electron.yml変更   | ワークフロー自体は正しい |
| コードサイニング証明書   | 別タスクで対応予定       |

**期待される成果物**:

- スコープ定義書（`outputs/phase-1/scope-definition.md`）

---

## 参照資料

| 参照資料             | パス                                                                       | 内容                    |
| -------------------- | -------------------------------------------------------------------------- | ----------------------- |
| Electronデプロイ仕様 | `.claude/skills/aiworkflow-requirements/references/deployment-electron.md` | Electronリリースの仕様  |
| GitHub Actions仕様   | `.claude/skills/aiworkflow-requirements/references/deployment-gha.md`      | CI/CDパイプラインの仕様 |
| ビルドワークフロー   | `.github/workflows/build-electron.yml`                                     | 現在のビルド設定        |
| electron-builder設定 | `apps/desktop/electron-builder.yml`                                        | パッケージング設定      |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                       | 内容                      |
| -------------------- | -------------------------------------------------------------------------- | ------------------------- |
| Electronデプロイ仕様 | `.claude/skills/aiworkflow-requirements/references/deployment-electron.md` | macOSコードサイニング要件 |

---

## 成果物

| 成果物           | パス                                         | 内容               |
| ---------------- | -------------------------------------------- | ------------------ |
| 問題分析レポート | `outputs/phase-1/problem-analysis.md`        | エラーの詳細分析   |
| 解決策オプション | `outputs/phase-1/solution-options.md`        | 解決策の選択肢一覧 |
| 要件定義書       | `outputs/phase-1/requirements-definition.md` | 要件と受け入れ基準 |
| 受け入れ基準書   | `outputs/phase-1/acceptance-criteria.md`     | AC定義             |
| スコープ定義書   | `outputs/phase-1/scope-definition.md`        | 対象範囲の定義     |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 1での統合テスト連携アクション

- [ ] CI/CDパイプラインの正常動作を要件に明記
- [ ] ビルド成果物の検証方法を要件に含める
- [ ] GitHub Actions ↔ electron-builder ↔ codesign の接続要件を確認

---

## 完了条件

- [ ] 問題分析レポートが作成されている
- [ ] 解決策オプションが列挙されている
- [ ] 要件定義書が作成されている
- [ ] 受け入れ基準が明確に定義されている
- [ ] スコープ定義書が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` の Phase 1 を更新

---

## 依存関係

- **前提**: なし（最初のPhase）
- **後続**: Phase 2 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/fix-macos-build-ci/phase-2-design.md`
