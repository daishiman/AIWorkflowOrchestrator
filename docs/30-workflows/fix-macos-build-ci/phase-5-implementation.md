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

Phase 2の設計に基づき、macOS CIビルドエラーを修正する実装を行う（TDD: Green状態）。

## 背景

設計レビュー完了後、実際の修正を実装する。テストが通る最小限の実装を目指す。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: electron-builder設定の修正

**目的**: DMG生成をCI環境で成功させるための設定変更

**実行手順**:

1. `apps/desktop/electron-builder.yml` を開く
2. mac セクションの target 設定を確認
3. CI環境向けの設定を追加
   - オプション1: DMGを無効化しZIPのみにする
   - オプション2: dmg セクションにCI対応設定を追加
4. 変更内容を保存

**期待される成果物**:

- 修正された `apps/desktop/electron-builder.yml`

---

### タスク2: GitHub Actionsワークフローの修正

**目的**: CI環境でのビルドが成功するようワークフローを修正

**実行手順**:

1. `.github/workflows/build-electron.yml` を開く
2. macOS ビルドジョブの設定を確認
3. 必要に応じて以下を修正:
   - ビルドコマンドの変更
   - 環境変数の追加
   - ステップの順序調整
4. アーティファクト設定を確認・修正

**期待される成果物**:

- 修正された `.github/workflows/build-electron.yml`

---

### タスク3: ローカルでのビルド検証

**目的**: 修正がローカル環境で正常に動作することを確認

**実行手順**:

1. pnpm install を実行
2. pnpm --filter @repo/shared build を実行
3. pnpm --filter @repo/desktop build を実行
4. pnpm --filter @repo/desktop package:mac を実行
5. 成果物の生成を確認

**期待される成果物**:

- ローカルビルド検証結果（`outputs/phase-5/local-build-result.md`）

---

### タスク4: 実装サマリーの作成

**目的**: 実装内容を文書化する

**実行手順**:

1. 変更したファイル一覧を記録
2. 変更内容の詳細を記録
3. 変更理由を記録
4. 注意点・制約を記録

**期待される成果物**:

- 実装サマリー（`outputs/phase-5/implementation-summary.md`）

---

## 参照資料

| 参照資料             | パス                                     | 内容               |
| -------------------- | ---------------------------------------- | ------------------ |
| 修正設計書           | `outputs/phase-2/modification-design.md` | 詳細設計           |
| テスト計画書         | `outputs/phase-4/test-plan.md`           | テスト方法         |
| electron-builder設定 | `apps/desktop/electron-builder.yml`      | 現在の設定         |
| ビルドワークフロー   | `.github/workflows/build-electron.yml`   | 現在のワークフロー |

---

## 成果物

| 成果物                       | パス                                        | 内容       |
| ---------------------------- | ------------------------------------------- | ---------- |
| 修正済みelectron-builder設定 | `apps/desktop/electron-builder.yml`         | CI対応設定 |
| 修正済みワークフロー         | `.github/workflows/build-electron.yml`      | CI修正     |
| ローカルビルド検証結果       | `outputs/phase-5/local-build-result.md`     | 検証結果   |
| 実装サマリー                 | `outputs/phase-5/implementation-summary.md` | 変更内容   |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 5での統合テスト連携アクション

- [ ] フロント/バック接続の実装が完了している（該当する場合）
- [ ] テスト支援コード（モック等）が整備されている
- [ ] CI/CDパイプラインの接続が確認されている

---

## 完了条件

- [ ] electron-builder設定が修正されている
- [ ] GitHub Actionsワークフローが修正されている
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
# ローカルビルド検証
pnpm install
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop build
pnpm --filter @repo/desktop package:mac
```

**確認項目**:

- [ ] ローカルビルドが成功することを確認（Green状態への移行）

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/fix-macos-build-ci/phase-6-test-expansion.md`
