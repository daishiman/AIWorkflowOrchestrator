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

GitHub Actions CI で macOS ビルドが失敗する問題の要件を明確化し、受け入れ基準を定義する。

## 背景

GitHub Actions の macOS runner (macos-14) で Electron アプリの DMG パッケージングが失敗している。エラーメッセージ `hdiutil: create failed - Device not configured` は、CI環境での仮想化制限に起因すると考えられる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 問題の詳細分析

**目的**: エラーの根本原因を特定し、影響範囲を明確にする

**実行手順**:

1. GitHub Actions のビルドログを詳細に分析する
2. `hdiutil` エラーの発生箇所を特定する
3. `dmg-builder` パッケージのバージョンと既知の問題を調査する
4. GitHub Actions macos-14 runner の制限事項を確認する

**期待される成果物**:

- 問題分析レポート（`outputs/phase-1/problem-analysis.md`）

---

### タスク2: 解決策の選択肢を列挙

**目的**: 実行可能な解決策を洗い出す

**実行手順**:

1. DMG生成をスキップしてZIPのみにする案
2. dmg-builderの設定を調整する案
3. 別のDMG生成ツールを使用する案
4. ビルドマトリックスでDMG生成を分離する案
5. 各案のメリット・デメリットを整理する

**期待される成果物**:

- 解決策オプション一覧（`outputs/phase-1/solution-options.md`）

---

### タスク3: 要件定義書の作成

**目的**: 修正の要件と受け入れ基準を明確化する

**実行手順**:

1. 機能要件を定義する
   - CIビルドが成功すること
   - 配布可能な成果物が生成されること
2. 非機能要件を定義する
   - ビルド時間の許容範囲
   - 成果物のサイズ制限
3. 受け入れ基準を定義する

**期待される成果物**:

- 要件定義書（`outputs/phase-1/requirements-definition.md`）

---

### タスク4: スコープ定義

**目的**: 修正対象と対象外を明確にする

**実行手順**:

1. 修正対象ファイルを特定する
2. 修正対象外（スコープ外）を明記する
3. 前提条件と制約を整理する

**期待される成果物**:

- スコープ定義書（`outputs/phase-1/scope-definition.md`）

---

## 参照資料

| 参照資料             | パス                                                                       | 内容                    |
| -------------------- | -------------------------------------------------------------------------- | ----------------------- |
| デプロイメント仕様   | `.claude/skills/aiworkflow-requirements/references/deployment-electron.md` | Electronリリースの仕様  |
| GitHub Actions仕様   | `.claude/skills/aiworkflow-requirements/references/deployment-gha.md`      | CI/CDパイプラインの仕様 |
| ビルドワークフロー   | `.github/workflows/build-electron.yml`                                     | 現在のビルド設定        |
| electron-builder設定 | `apps/desktop/electron-builder.yml`                                        | パッケージング設定      |

---

## 成果物

| 成果物           | パス                                         | 内容               |
| ---------------- | -------------------------------------------- | ------------------ |
| 問題分析レポート | `outputs/phase-1/problem-analysis.md`        | エラーの詳細分析   |
| 解決策オプション | `outputs/phase-1/solution-options.md`        | 解決策の選択肢一覧 |
| 要件定義書       | `outputs/phase-1/requirements-definition.md` | 要件と受け入れ基準 |
| スコープ定義書   | `outputs/phase-1/scope-definition.md`        | 対象範囲の定義     |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 1での統合テスト連携アクション

- [ ] CI/CDパイプラインの正常動作を要件に明記
- [ ] ビルド成果物の検証方法を要件に含める
- [ ] GitHub Actions と electron-builder の接続要件を確認

---

## 完了条件

- [ ] 問題分析レポートが作成されている
- [ ] 解決策オプションが列挙されている
- [ ] 要件定義書が作成されている
- [ ] スコープ定義書が作成されている
- [ ] 受け入れ基準が明確に定義されている
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
