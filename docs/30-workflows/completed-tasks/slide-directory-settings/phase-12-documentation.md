# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 12                       |
| Phase名    | ドキュメント更新         |
| 前提Phase  | Phase 11                 |
| 後続Phase  | Phase 13                 |
| ステータス | 未実施                   |
| 作成日     | 2026-01-13               |
| 機能名     | slide-directory-settings |

---

## 目的

実装した機能に関するドキュメントを作成・更新し、ユーザーや開発者が機能を理解・利用できるようにする。

## 背景

Phase 11で手動テストが完了した。このPhaseでは、新機能のドキュメントを整備し、PR作成に向けた準備を完了させる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 技術ドキュメントの更新

**目的**: 開発者向けの技術ドキュメントを作成する

**実行手順**:

1. 技術ドキュメントに含める内容:
   - アーキテクチャ概要
   - コンポーネント構成
   - IPC通信フロー
   - データスキーマ

2. ドキュメント作成:

   ```markdown
   # スライド出力ディレクトリ設定 - 技術ドキュメント

   ## アーキテクチャ

   ### コンポーネント構成

   - SlideSettingsStore: electron-storeベースの設定永続化
   - SlideSettingsHandlers: IPC通信のハンドラー
   - SlideDirectorySettings: React UIコンポーネント
   - useSlideSettings: 状態管理カスタムフック

   ### IPC チャンネル

   | チャンネル                      | 説明                     |
   | ------------------------------- | ------------------------ |
   | slideSettings:getDirectory      | 現在のディレクトリを取得 |
   | slideSettings:setDirectory      | ディレクトリを設定       |
   | slideSettings:selectDirectory   | OS標準ダイアログで選択   |
   | slideSettings:validateDirectory | パスの有効性を検証       |
   | slideSettings:getAllSettings    | 全設定を取得             |

   ### データスキーマ

   - SlideSettings型定義
   - デフォルト値
   - マイグレーション戦略
   ```

3. `docs/technical/slide-settings.md` にドキュメントを作成

4. 結果を `outputs/phase-12/technical-doc.md` に出力

**期待される成果物**:

- `docs/technical/slide-settings.md`
- `outputs/phase-12/technical-doc.md`

---

### タスク2: ユーザーガイドの作成

**目的**: エンドユーザー向けの使い方ガイドを作成する

**実行手順**:

1. ユーザーガイドに含める内容:
   - 機能概要
   - 設定手順
   - トラブルシューティング

2. ガイド作成:

   ```markdown
   # スライド出力ディレクトリ設定

   ## 概要

   生成したスライドファイルの保存先ディレクトリを設定できます。

   ## 設定方法

   1. 設定画面を開く
   2. 「スライド」タブを選択
   3. 「出力ディレクトリ」セクションで保存先を設定
   4. 「参照」ボタンでフォルダを選択
   5. 「保存」ボタンで設定を保存

   ## オプション

   - **ディレクトリ自動作成**: 存在しないディレクトリを自動で作成

   ## トラブルシューティング

   - パスが無効と表示される場合...
   - 保存に失敗する場合...
   ```

3. `docs/user-guide/slide-settings.md` にガイドを作成

4. 結果を `outputs/phase-12/user-guide.md` に出力

**期待される成果物**:

- `docs/user-guide/slide-settings.md`
- `outputs/phase-12/user-guide.md`

---

### タスク3: APIリファレンスの作成

**目的**: 内部API（IPC、フック）のリファレンスを作成する

**実行手順**:

1. APIリファレンスに含める内容:
   - IPC APIの詳細
   - カスタムフックの使用方法
   - 型定義

2. リファレンス作成:

   ````markdown
   # Slide Settings API Reference

   ## IPC API

   ### slideSettings:getDirectory

   現在設定されているディレクトリパスを取得します。

   - 引数: なし
   - 戻り値: `Result<string>`

   ### slideSettings:setDirectory

   ディレクトリパスを設定します。

   - 引数: `path: string`
   - 戻り値: `Result<void>`

   ...

   ## React Hooks

   ### useSlideSettings

   スライド設定の状態管理フック。

   ```typescript
   const {
     directory,
     autoCreate,
     isLoading,
     error,
     setDirectory,
     selectDirectory,
   } = useSlideSettings();
   ```
   ````

   ```

   ```

3. `docs/api/slide-settings-api.md` にリファレンスを作成

4. 結果を `outputs/phase-12/api-reference.md` に出力

**期待される成果物**:

- `docs/api/slide-settings-api.md`
- `outputs/phase-12/api-reference.md`

---

### タスク4: CHANGELOG更新

**目的**: CHANGELOGに新機能を追加する

**実行手順**:

1. CHANGELOGエントリを作成:

   ```markdown
   ## [Unreleased]

   ### Added

   - スライド出力ディレクトリ設定機能を追加
     - 設定画面からスライドの保存先を変更可能
     - OS標準ダイアログによるディレクトリ選択
     - ディレクトリ自動作成オプション
     - 設定の永続化（アプリ再起動後も維持）
   ```

2. `CHANGELOG.md` を更新

3. 結果を `outputs/phase-12/changelog-entry.md` に出力

**期待される成果物**:

- `CHANGELOG.md`（更新）
- `outputs/phase-12/changelog-entry.md`

---

### タスク5: ドキュメント完了確認

**目的**: ドキュメントの完成度を確認する

**実行手順**:

1. ドキュメントチェックリスト:

| ドキュメント     | 作成状況   | 内容確認   | リンク確認 |
| ---------------- | ---------- | ---------- | ---------- |
| 技術ドキュメント | [ ] 完了   | [ ] 確認済 | [ ] 確認済 |
| ユーザーガイド   | [ ] 完了   | [ ] 確認済 | [ ] 確認済 |
| APIリファレンス  | [ ] 完了   | [ ] 確認済 | [ ] 確認済 |
| CHANGELOG        | [ ] 更新済 | [ ] 確認済 | N/A        |

2. 品質確認:
   - 誤字脱字がないか
   - コード例が正しいか
   - リンクが有効か

3. 結果を `outputs/phase-12/documentation-checklist.md` に出力

**期待される成果物**:

- `outputs/phase-12/documentation-checklist.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                                    | 内容                 |
| ------------------ | --------------------------------------------------------------------------------------- | -------------------- |
| ドキュメントガイド | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | ドキュメント作成基準 |

### 関連ドキュメント

| 参照資料     | パス                | 内容           |
| ------------ | ------------------- | -------------- |
| Phase 2設計  | `outputs/phase-2/`  | 設計書         |
| Phase 11結果 | `outputs/phase-11/` | 手動テスト結果 |

---

## 成果物

| 成果物               | パス                                          | 内容               |
| -------------------- | --------------------------------------------- | ------------------ |
| 技術ドキュメント     | `docs/technical/slide-settings.md`            | 開発者向け技術文書 |
| ユーザーガイド       | `docs/user-guide/slide-settings.md`           | ユーザー向けガイド |
| APIリファレンス      | `docs/api/slide-settings-api.md`              | API仕様書          |
| CHANGELOG            | `CHANGELOG.md`                                | 変更履歴（更新）   |
| 技術ドキュメント確認 | `outputs/phase-12/technical-doc.md`           | 作成確認           |
| ユーザーガイド確認   | `outputs/phase-12/user-guide.md`              | 作成確認           |
| APIリファレンス確認  | `outputs/phase-12/api-reference.md`           | 作成確認           |
| CHANGELOGエントリ    | `outputs/phase-12/changelog-entry.md`         | 追加内容           |
| ドキュメントチェック | `outputs/phase-12/documentation-checklist.md` | 完了確認           |

---

## 完了条件

- [ ] 技術ドキュメントが作成されている
- [ ] ユーザーガイドが作成されている
- [ ] APIリファレンスが作成されている
- [ ] CHANGELOGが更新されている
- [ ] ドキュメントの品質確認が完了している
- [ ] 全成果物が `outputs/phase-12/` に配置されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11 が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/slide-directory-settings/phase-13-pr-creation.md`
