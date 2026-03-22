# Phase 11: 手動テスト

## メタ情報

| 項目          | 内容                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------- |
| Phase番号     | 11                                                                                              |
| 機能名        | LLM設定永続化修正 (TASK-FIX-LLM-CONFIG-PERSISTENCE)                                             |
| 作成日        | 2026-03-20                                                                                      |
| 担当          | -                                                                                               |
| ステータス    | 未着手                                                                                          |
| 前Phase成果物 | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-10-final-review.md` |

## 目的

Electronアプリを実際に起動し、アプリ再起動後のLLM選択状態保持を手動で確認する。Phase 1 の受入基準を実際のUI操作で検証する。

## 実行タスク

### 事前準備

```bash
# Electron アプリのビルドと起動
cd apps/desktop
pnpm dev
```

### シナリオ1: 基本的なProvider/Model選択の永続化

**目的**: アプリ再起動後もProvider/Model選択が保持されることを確認する

**手順**:

1. アプリを起動する
2. Settings画面（またはメイン画面）でProvider/Modelを選択する（例: anthropic / claude-3-5-sonnet）
3. アプリを完全に終了する（Cmd+Q またはウィンドウ×ボタン）
4. アプリを再起動する
5. Settings画面でProvider/Model選択が保持されていることを確認する

**期待結果**:

- 手順2で選択したProvider/Modelが手順5でも表示されている
- Settings画面に正しいプロバイダ名・モデル名が表示されている

**実際の結果**: （実行時に記入）

---

### シナリオ2: 再起動後のMain Process同期確認

**目的**: 再起動後にMain ProcessのcurrentConfigに選択が同期されていることを確認する

**手順**:

1. アプリを起動する
2. Providerを選択する
3. Modelを選択する
4. アプリを再起動する
5. チャット画面でメッセージを送信する
6. 選択したProvider/Modelで処理が行われることを確認する（エラーが出ず、適切なモデルが応答する）

**期待結果**:

- 再起動後もLLMリクエストが正しいProvider/Modelへ送られる
- 設定を再選択しなくても動作する

**実際の結果**: （実行時に記入）

---

### シナリオ3: 無効なProvider設定のフォールバック確認

**目的**: 存在しないProviderIDが永続化されていた場合にnull（未選択）にフォールバックすることを確認する

**手順**:

1. アプリを終了した状態で、persist storageを手動編集する

```bash
# electron-store の保存先を確認（OS ごとに異なる）
# macOS: ~/Library/Application Support/<app-name>/
# ストレージファイルを確認
ls ~/Library/Application\ Support/

# 設定ファイルを確認（JSONファイル）
# selectedProviderId の値を存在しない文字列に変更
# 例: "non-existent-provider"
```

2. アプリを起動する
3. Settings画面でProvider/Modelが未選択（null）状態になっていることを確認する
4. DEFAULT_CONFIGへの暗黙フォールバックが行われていないことを確認する（P62対策）

**期待結果**:

- Settings画面でProvider/Modelが「未選択」状態で表示される
- 意図しないデフォルトProviderが自動選択されていない

**実際の結果**: （実行時に記入）

---

### シナリオ4: 既存persist設定の互換性確認

**目的**: 既存のpersistフィールド（`currentView`, `userProfile`, `autoSyncEnabled`）が引き続き正常動作することを確認する

**手順**:

1. アプリを起動し、`autoSyncEnabled` を有効にする
2. `currentView` を変更する（例: Settings → Chat に移動）
3. アプリを再起動する
4. `autoSyncEnabled` の設定が保持されていることを確認する
5. `currentView` が再起動前の状態に戻ることを確認する（またはデフォルト動作を確認する）

**期待結果**:

- `autoSyncEnabled` の設定が保持されている
- 既存のpersistフィールドが migrate によって失われていない

**実際の結果**: （実行時に記入）

---

### シナリオ5: persist v1→v2 migration（初回起動）

**目的**: v1データがある環境でアプリを更新した際（migrate実行）に、既存設定が引き継がれることを確認する

**手順**:

1. v1のpersist設定を手動で作成する（`selectedProviderId`, `selectedModelId` フィールドなし）
2. アプリを起動する（migrate が自動実行される）
3. `currentView`, `userProfile`, `autoSyncEnabled` が引き継がれていることを確認する
4. `selectedProviderId` と `selectedModelId` が `null` になっていることを確認する

**期待結果**:

- 既存フィールドが保持されている
- 新しいフィールド（selectedProviderId/selectedModelId）がnullで初期化されている
- エラーやクラッシュが発生しない

**実際の結果**: （実行時に記入）

---

### テスト結果まとめ

| シナリオ                               | 結果 | 備考 |
| -------------------------------------- | ---- | ---- |
| シナリオ1: 基本的な永続化              | -    | -    |
| シナリオ2: Main Process 同期           | -    | -    |
| シナリオ3: 無効Provider フォールバック | -    | -    |
| シナリオ4: 既存フィールド互換性        | -    | -    |
| シナリオ5: v1→v2 migration             | -    | -    |

（Phase 11 実行時に記入）

## 参照資料

### 前Phase成果物

| 資料名                | パス                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| Phase 1 要件定義      | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-1-requirements.md`  |
| Phase 10 最終レビュー | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-10-final-review.md` |

### 既知の落とし穴

| 落とし穴ID | 説明                                  | 対策                                                                |
| ---------- | ------------------------------------- | ------------------------------------------------------------------- |
| P53        | CLI環境でのスクリーンショット取得制約 | Electron `webContents.capturePage()` を使用するか、自動テストで代替 |
| P28        | 手動テストでの削除確認忘れ            | 旧APIが削除されている場合はDevToolsで確認                           |

## 実行手順

1. **事前準備**: アプリをビルドして起動する
2. **シナリオ1〜5の実施**: 上記シナリオを順番に実行し、結果を記録する
3. **テスト結果まとめの記録**: 全シナリオの結果を表に記入する
4. **問題発見時の対応**: 問題が見つかった場合は、影響 Phase（Phase 5 等）へ戻って修正する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                        | パス                                                                                           | 説明           |
| ----------------------------- | ---------------------------------------------------------------------------------------------- | -------------- |
| Phase 11 仕様書（本ファイル） | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-11-manual-test.md` | 手動テスト結果 |

## 完了条件

- [ ] シナリオ1（基本的な永続化）が合格したことを確認した
- [ ] シナリオ2（Main Process同期）が合格したことを確認した
- [ ] シナリオ3（無効Providerフォールバック）が合格したことを確認した（P62対策の動作確認）
- [ ] シナリオ4（既存フィールド互換性）が合格したことを確認した
- [ ] シナリオ5（v1→v2 migration）が合格したことを確認した
- [ ] テスト結果まとめテーブルに全シナリオの結果を記入した

## 次Phase

Phase 12: ドキュメント（`phase-12-documentation.md`）
