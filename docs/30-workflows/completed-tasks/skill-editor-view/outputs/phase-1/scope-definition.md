# スコープ定義書 - TASK-UI-05A-SKILL-EDITOR-VIEW

## メタ情報

| 項目       | 値                            |
| ---------- | ----------------------------- |
| Phase      | 1                             |
| タスク ID  | TASK-UI-05A-SKILL-EDITOR-VIEW |
| 作成日     | 2026-03-02                    |
| 前提 Phase | なし                          |
| 後続 Phase | Phase 2: 設計                 |

## 概要

本文書は、SkillEditorView の対象範囲と除外範囲を定義し、本タスクの実装境界を明確化する。依存タスクとの関係を明示することで、設計・実装時のスコープクリープを防止する。

---

## 対象範囲

以下の機能・コンポーネントは本タスクの実装対象に含まれる。

### 1. ファイルツリー表示

- 指定 skillName のディレクトリ構造を再帰的にツリー表示する
- lucide-react によるファイル拡張子対応アイコン表示（.md → FileText, .ts → FileCode, フォルダ → Folder）
- ディレクトリの展開/折りたたみ操作（セッション中の展開状態保持）
- ファイル選択時のハイライト表示（Apple HIG systemBlue 背景）
- 未保存変更ファイルのドットインジケーター（直径 6px, systemOrange）

### 2. textarea ベースのコードエディター

- textarea 要素によるファイル内容の編集
- 等幅フォント（monospace）14px での表示
- 行番号の左側表示
- 読み取り専用モード（isReadOnly=true）での編集不可制御
- ステータスバー（行数・文字数・ファイル拡張子の表示）

### 3. ファイル保存

- 保存ボタンおよび Cmd+S / Ctrl+S キーボードショートカットによる保存
- skill:writeFile IPC チャネルを介した保存処理
- 保存成功時のトースト通知（「保存しました」、2 秒間表示）
- 保存失敗時のエラーダイアログ表示

### 4. 未保存変更検出と警告ダイアログ

- 初期読み込み内容と現在内容の文字列比較（===）による未保存変更検出
- UnsavedChangesDialog（「保存して切り替え」「保存せず切り替え」「キャンセル」の 3 選択肢）
- ファイル切り替え時およびエディタークローズ時の警告表示

### 5. バックアップ一覧表示と復元

- skill:listBackups IPC チャネルによるバックアップ一覧取得（日時降順）
- skill:restoreBackup IPC チャネルによるバックアップ復元
- 復元前の確認ダイアログ
- 復元後のファイルツリーおよびエディター内容の再読み込み

### 6. ファイル作成・削除（編集可能モードのみ）

- skill:createFile IPC チャネルによるファイル作成（ファイル名入力ダイアログ付き）
- skill:deleteFile IPC チャネルによるファイル削除（確認ダイアログ付き）
- 読み取り専用モードでのファイル操作メニュー非表示
- ファイル操作後のファイルツリー再構築

### 7. 読み取り専用モード対応

- isReadOnly Props によるエディター・ツールバー・ファイル操作の制御
- 保存ボタンの disabled 状態とツールチップ「読み取り専用ファイルです」の表示
- ファイル作成・削除メニューの非表示

### 8. レスポンシブデザイン

- 3 段階ブレークポイント対応:
  - \>= 1024px: FileTreePanel 左 240px 固定 + EditorPanel flex-1
  - 768px 〜 1023px: FileTreePanel 左 200px 固定 + EditorPanel flex-1
  - < 768px: FileTreePanel ドロワー表示 + EditorPanel フル幅

### 9. WCAG 2.1 AA 準拠のアクセシビリティ

- ファイルツリーの ARIA tree/treeitem 構造
- エディターの textbox ロールと aria-label
- Tab キーによるフォーカス順序制御
- ArrowUp/Down/Left/Right によるツリー内ナビゲーション
- コントラスト比 4.5:1 以上の確保

---

## 除外範囲

以下の機能は本タスクの実装対象から除外する。将来タスクとして検討する場合がある。

| 除外項目                                           | 除外理由                                                                            |
| -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Monaco Editor 等のリッチエディターライブラリ統合   | textarea ベースで最小限の編集機能を提供する。リッチエディターは将来タスクとして検討 |
| シンタックスハイライトのカスタマイズ（テーマ選択） | 本タスクでは基本的なテキスト編集に集中する                                          |
| リアルタイム共同編集機能                           | 単一ユーザーのローカル編集に限定する                                                |
| Git 統合（差分表示、コミット操作）                 | ファイルの読み書きに集中し、バージョン管理は将来タスクとする                        |
| ファイルアップロード・ドラッグ＆ドロップ           | IPC チャネル経由のファイル操作（作成・削除）のみを対象とする                        |
| ファイル検索・置換機能                             | 基本的なファイル編集機能に集中する                                                  |
| マルチタブエディター（複数ファイル同時表示）       | 単一ファイル表示に限定する。マルチタブは将来タスクとして検討                        |

---

## 依存タスク

本タスクは以下の完了済みタスクに依存する。

| 依存タスク ID | タスク名                        | 依存内容                                                                | ステータス |
| ------------- | ------------------------------- | ----------------------------------------------------------------------- | ---------- |
| TASK-UI-00    | Atoms コンポーネント            | Badge, Button 等の共通 UI コンポーネント                                | 完了       |
| TASK-UI-01    | Layout コンポーネント           | AppLayout, ContentPanel 等のレイアウトコンポーネント                    | 完了       |
| TASK-UI-02    | Sidebar コンポーネント          | ナビゲーションサイドバー                                                | 完了       |
| TASK-UI-05    | SkillCenterView                 | インポート済みスキル一覧表示・詳細パネル（SkillEditorView への遷移元）  | 完了       |
| TASK-9A       | SkillFileManager + IPC ハンドラ | skill:readFile, skill:writeFile 等の IPC チャネル実装（バックエンド側） | 完了       |

### 依存関係図

```
TASK-UI-00 (Atoms)
    ↓
TASK-UI-01 (Layout)
    ↓
TASK-UI-02 (Sidebar)
    ↓
TASK-UI-05 (SkillCenterView) ──→ TASK-UI-05A (SkillEditorView) [本タスク]
    ↑
TASK-9A (SkillFileManager + IPC)
```

---

## 境界条件

### TASK-UI-05（SkillCenterView）との境界

- SkillCenterView の詳細パネルから「編集」ボタンを押下した際に SkillEditorView に遷移する
- SkillEditorView は独立したビューコンポーネントとして実装し、SkillCenterView からは Props（skillName, isReadOnly, onClose）で制御する
- SkillCenterView 側の遷移ロジック（「編集」ボタンの配置・クリックハンドラ）は TASK-UI-05 で実装済みであり、本タスクでは SkillEditorView コンポーネントの内部実装のみを対象とする

### TASK-9A（SkillFileManager + IPC）との境界

- IPC チャネル（skill:readFile, skill:writeFile, skill:createFile, skill:deleteFile, skill:listBackups, skill:restoreBackup）は TASK-9A で実装済みであり、本タスクでは Renderer 側からの IPC 呼び出しのみを対象とする
- skill:getFileTree は未実装であり、UT-UI-05A-GETFILETREE-001 として別途対応予定
- IPC 呼び出しは Preload Bridge 経由（window.electronAPI.skill.xxx）で行い、ハードコード文字列ではなく IPC_CHANNELS 定数を使用する（P27 対策）

### Atoms コンポーネント（TASK-UI-00）との境界

- Button, Badge, Dialog 等の共通コンポーネントは TASK-UI-00 で提供済みのものを使用する
- 本タスクでは新規 Atoms コンポーネントの作成は行わない
- EditorToolBar, FileTreePanel, CodeEditor 等の molecules/organisms コンポーネントは本タスクで新規作成する

---

## 成果物パス

| 成果物         | パス                                                                                |
| -------------- | ----------------------------------------------------------------------------------- |
| 要件定義書     | `docs/30-workflows/skill-editor-view/outputs/phase-1/requirements-definition.md`    |
| 受入基準書     | `docs/30-workflows/skill-editor-view/outputs/phase-1/acceptance-criteria.md`        |
| スコープ定義書 | `docs/30-workflows/skill-editor-view/outputs/phase-1/scope-definition.md`（本文書） |
