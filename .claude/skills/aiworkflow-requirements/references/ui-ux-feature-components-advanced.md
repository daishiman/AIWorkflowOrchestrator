# 機能別 UI コンポーネント / advanced specification

> 親仕様書: [ui-ux-feature-components.md](ui-ux-feature-components.md)
> 役割: advanced specification

## コピー履歴機能（TASK-3-2-D）

SkillStreamDisplayコンポーネントにコピー履歴機能を追加。過去にコピーした内容を一覧表示し、再コピー・複数選択一括コピーを可能にする。

### コンポーネント階層

| コンポーネント      | 種類     | 親                 | 子要素                           |
| ------------------- | -------- | ------------------ | -------------------------------- |
| CopyHistoryProvider | context  | SkillStreamDisplay | history, selectedIds, methods    |
| CopyHistoryPanel    | organism | SkillStreamDisplay | CopyHistoryItem[], ActionBar     |
| CopyHistoryItem     | molecule | CopyHistoryPanel   | Checkbox, Preview, CopyButton    |
| CopyHistoryToggle   | atom     | StreamHeader       | Icon, Badge                      |

### コンポーネント仕様

#### CopyHistoryContext

| 項目     | 仕様                                                        |
| -------- | ----------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/contexts/CopyHistoryContext.tsx` |
| 責務     | コピー履歴の状態管理とContext提供                           |
| 定数     | `MAX_HISTORY_SIZE = 50`                                     |

**CopyHistoryEntry型**

| フィールド | 型     | 説明                     |
| ---------- | ------ | ------------------------ |
| id         | string | 一意識別子（uuid）       |
| content    | string | コピー内容               |
| messageId  | string | 元メッセージID           |
| timestamp  | number | コピー日時（UNIXミリ秒） |

**CopyHistoryContextValue**

| プロパティ        | 型                                         | 説明                 |
| ----------------- | ------------------------------------------ | -------------------- |
| history           | CopyHistoryEntry[]                         | 履歴配列             |
| selectedIds       | Set<string>                                | 選択中のID           |
| historyCount      | number                                     | 履歴件数             |
| selectedCount     | number                                     | 選択件数             |
| addToHistory      | (content, messageId) => void               | 履歴追加             |
| copyFromHistory   | (id) => Promise<void>                      | 個別コピー           |
| copySelectedItems | () => Promise<void>                        | 選択一括コピー       |
| clearHistory      | () => void                                 | 履歴クリア           |
| toggleSelection   | (id) => void                               | 選択トグル           |
| clearSelection    | () => void                                 | 選択クリア           |

#### CopyHistoryPanel

| 項目     | 仕様                                                                  |
| -------- | --------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/AgentView/CopyHistoryPanel.tsx` |
| 責務     | 履歴パネルUI、ユーザー操作処理                                        |
| Props    | `isOpen`, `onClose`, `className?`                                     |
| 定数     | `PREVIEW_LENGTH = 100`, `COPY_FEEDBACK_MS = 2000`                     |

**機能**

| 機能               | 説明                               |
| ------------------ | ---------------------------------- |
| 履歴一覧表示       | 最大50件、新しい順に表示           |
| プレビュー表示     | 100文字で省略、改行を空白に変換    |
| 個別コピー         | 履歴項目からクリップボードにコピー |
| 複数選択           | チェックボックスで選択             |
| 一括コピー         | 選択項目を改行区切りで結合コピー   |
| 履歴クリア         | 全履歴を削除                       |
| パネル外クリック   | パネルを閉じる                     |

#### useCopyHistory Hook

| 項目     | 仕様                                                  |
| -------- | ----------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/hooks/useCopyHistory.ts`   |
| 責務     | CopyHistoryContext へのアクセスを提供                 |
| 使用条件 | CopyHistoryProvider 内で使用必須                      |
| エラー   | Provider外で使用時に Error throw                      |

### キーボード操作

| キー   | 機能                   |
| ------ | ---------------------- |
| Tab    | フォーカス移動         |
| Enter  | 項目コピー             |
| Escape | パネル閉じる           |
| Space  | チェックボックストグル |

### ARIA属性

| 要素   | 属性                 | 値                     |
| ------ | -------------------- | ---------------------- |
| パネル | role                 | dialog                 |
| パネル | aria-label           | コピー履歴             |
| パネル | aria-modal           | true                   |
| リスト | role                 | listbox                |
| リスト | aria-multiselectable | true                   |
| 項目   | role                 | option                 |
| 項目   | aria-selected        | 選択状態に応じて       |

### テスト品質（TASK-3-2-D）

| ファイル                    | テスト数 | 結果    |
| --------------------------- | -------- | ------- |
| CopyHistoryContext.test.tsx | 18       | 全PASS  |
| useCopyHistory.test.tsx     | 8        | 全PASS  |
| CopyHistoryPanel.test.tsx   | 20       | 全PASS  |
| 合計                        | 46       | 全PASS  |

---

## アクセシビリティ（全コンポーネント共通 WCAG 2.1 AA）

| 要件                     | 実装方法                                            |
| ------------------------ | --------------------------------------------------- |
| キーボードナビゲーション | Tab順序、Enter/Escapeでの操作、全要素にtabIndex設定 |
| スクリーンリーダー       | aria-label、role属性の適切な設定、`aria-live`       |
| フォーカス管理           | パネル/モーダル開閉時のフォーカス移動               |
| 色コントラスト           | 4.5:1以上のコントラスト比確保（Tailwind CSS標準色） |

---

## SkillStreamingView コンポーネント（TASK-7D）

TASK-7D ChatPanel Agent統合で新規追加されたOrganism級コンポーネント。ChatPanel内で条件レンダーされ、Agent Executionのストリーミング表示を担当する。

### コンポーネント概要

| 項目 | 内容 |
|------|------|
| ファイル | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx` |
| レイヤー | Organism（ChatPanel子コンポーネント） |
| テスト | 36テスト（`SkillStreamingView.test.tsx` 実測、2026-03-20） |
| 表示条件 | `isExecuting && selectedSkillName` が真のとき |

### 構成サブコンポーネント

| コンポーネント | 役割 | Props |
|---------------|------|-------|
| StatusBadge | 実行ステータス表示（信号機パターン） | `status: DisplayableStatus` |
| StreamMessageItem | ストリーミングメッセージ1件の表示 | `message: SkillStreamMessage` |
| ToolExecutionHistory | ツール実行履歴の折りたたみ表示 | `messages: SkillStreamMessage[]` |

### 型定義

| 型名 | 定義 | 用途 |
|------|------|------|
| `DisplayableStatus` | `Exclude<SkillExecutionStatus, 'idle'>` | idle除外の厳密なステータス型 |
| `SkillStreamMessage` | 判別共用体（assistant/tool_use/tool_result/error/status） | メッセージ種別の型安全な分岐 |

### StatusBadge マッピング

| status | 色クラス | ラベル |
|--------|----------|--------|
| `running` | `bg-blue-500` | 実行中... |
| `permission_pending` | `bg-yellow-500` | 権限確認中 |
| `completed` | `bg-green-500` | 完了 |
| `cancelled` | `bg-gray-500` | キャンセル |
| `error` | `bg-red-500` | エラー |
| `review` | `bg-purple-500` | レビュー中 |
| `improve_ready` | `bg-orange-500` | 改善準備完了 |
| `reuse_ready` | `bg-teal-500` | 再利用準備完了 |

補足:
- `idle` は非表示状態のため `StatusBadge` の描画対象から除外する。
- `DisplayableStatus` を `Exclude<SkillExecutionStatus, 'idle'>` として定義し、`Record<DisplayableStatus, ...>` で exhaustive check を維持する。

### 適用パターン

| パターン | 内容 |
|----------|------|
| forwardRef + useImperativeHandle | ChatPanel→SkillStreamingViewへの外部メソッド公開 |
| React.memo + 個別セレクタ | Store変更時の不要再レンダー防止 |
| aria-live="polite" | ストリーミングメッセージのスクリーンリーダー通知 |

### 関連仕様

- [SkillStreamDisplay詳細仕様](./ui-ux-feature-skill-stream.md) - TASK-3-2シリーズとの統合仕様
- [ChatPanel統合UIフロー](./ui-ux-agent-execution.md) - Agent Execution UI全体フロー
- [ChatPanel統合仕様](./interfaces-agent-sdk-ui.md) - TASK-7D完了タスクセクション

---

<a id="skill-editor-ui-task-9a"></a>

## SkillEditor UI（TASK-9A / 完了）

TASK-9A-skill-editor で SkillEditor / SkillCodeEditor の実装と検証（Phase 1-12）が完了。
旧 `TASK-9A-C-skill-editor-ui` は仕様書作成フェーズの履歴として保持し、実装の正本は `docs/30-workflows/completed-tasks/TASK-9A-skill-editor/` とする。

### 実装済みコンポーネント

| コンポーネント | 役割 | 想定配置 |
| --- | --- | --- |
| SkillEditor | ファイル選択・読込・保存制御 | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx` |
| SkillCodeEditor | テキスト編集UI | `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx` |

### 進捗ステータス

| 項目 | 状態 | 参照 |
| --- | --- | --- |
| ワークフロー仕様（Phase 1-13） | ✅ 完了 | `docs/30-workflows/completed-tasks/TASK-9A-skill-editor/` |
| 実装コード | ✅ 完了 | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`, `SkillCodeEditor.tsx` |
| テスト | ✅ 完了 | `SkillEditor.test.tsx`, `SkillCodeEditor.test.tsx`, `buildFileTree.test.ts`, `getLanguage.test.ts` |

### 下流導線追補（2026-03-19）

| 観点 | 内容 |
| --- | --- |
| 入口 | imported `SkillDetailPanel` の `エディタで開く` から `skill-editor` へ到達する |
| state payload | `currentSkillName` を先に設定してから `SkillEditorView` を描画する |
| 証跡 | `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-03-skilldetail-action-buttons/outputs/phase-11/screenshots/TC-11-03-desktop-edit-handoff.png` |

### 関連ドキュメント

- [TASK-9A ワークフロー](../../../../docs/30-workflows/completed-tasks/TASK-9A-skill-editor/index.md)
- [TASK-9A 実装ガイド](../../../../docs/30-workflows/completed-tasks/TASK-9A-skill-editor/outputs/phase-12/implementation-guide.md)
- [TASK-9A 仕様更新サマリー](../../../../docs/30-workflows/completed-tasks/TASK-9A-skill-editor/outputs/phase-12/spec-update-summary.md)
- [旧 TASK-9A-C 仕様書（履歴）](../../../../docs/30-workflows/completed-tasks/TASK-9A-C-skill-editor-ui/index.md)

### 関連未タスク

| タスクID | 概要 | 仕様書 |
| --- | --- | --- |
| TASK-9A-C-001 | シンタックスハイライト機能 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-9a-c-syntax-highlighting.md` |
| ~~TASK-9A-C-002~~ | ~~ファイル作成・削除機能~~ **完了: 2026-02-26（TASK-9Aへ統合）** | `docs/30-workflows/completed-tasks/unassigned-task/task-9a-c-file-crud-operations.md` |
| TASK-9A-C-003 | Monaco/CodeMirrorエディタ移行 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-9a-c-code-editor-migration.md` |
| ~~TASK-9A-C-004~~ | ~~Phase 12仕様同期ガード自動化~~ **完了: 2026-02-26（Phase 12完了に伴い移管）** | `docs/30-workflows/completed-tasks/unassigned-task/task-9a-c-phase12-spec-sync-guard.md` |

### コンポーネント階層

| コンポーネント  | 種類     | 親           | 子要素                                       |
| --------------- | -------- | ------------ | -------------------------------------------- |
| SkillEditor     | organism | AgentView    | FileTreeSidebar, EditorToolbar, SkillCodeEditor |
| FileTreeSidebar | molecule | SkillEditor  | カテゴリ展開リスト、ファイルアイテム         |
| EditorToolbar   | molecule | SkillEditor  | 保存ボタン、閉じるボタン、未保存インジケーター |
| SkillCodeEditor | molecule | SkillEditor  | textarea（コード編集領域）                   |

### コンポーネント仕様

#### SkillEditor

| 項目     | 仕様                                                               |
| -------- | ------------------------------------------------------------------ |
| ファイル | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`       |
| 責務     | ファイル選択・読込・保存制御、全体レイアウト統括                   |
| Props    | `skill: ImportedSkill`, `onClose: () => void`                      |

**レイアウト構造**

| 領域               | 位置                | 内容                               |
| ------------------ | ------------------- | ---------------------------------- |
| FileTreeSidebar    | 左側（w-64, 256px） | カテゴリ別ファイルツリー           |
| EditorToolbar      | 右上部              | 保存/閉じるボタン、未保存表示      |
| SkillCodeEditor    | 右メイン（flex-1）  | テキスト編集エリア                 |

#### SkillCodeEditor

| 項目     | 仕様                                                                    |
| -------- | ----------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx`        |
| 責務     | textareaベースのコード編集UI（外部ライブラリ不使用）                    |
| Props    | `value: string`, `onChange: (value: string) => void`, `language: string`, `isReadOnly?: boolean` |

**機能**

| 機能           | 説明                                      |
| -------------- | ----------------------------------------- |
| Tab→2スペース  | Tabキー押下時にスペース2個を挿入          |
| spellCheck無効 | `spellCheck={false}` でスペルチェック抑制 |
| 等幅フォント   | `font-family: monospace` 適用             |
| 読み取り専用   | `isReadOnly` で編集不可モード切替         |

### 状態管理

| 状態の種類        | 管理方法                   | 判断基準                                    |
| ----------------- | -------------------------- | ------------------------------------------- |
| 選択ファイル      | `useState<string \| null>` | コンポーネント固有UI                        |
| ファイル内容      | `useState<string>`         | エディター内ローカル状態                    |
| カテゴリ展開状態  | `useState<Set<string>>`    | FileTreeSidebar固有UI                       |
| 未保存フラグ      | `useState<boolean>`        | 保存アクション制御用                        |

> **設計判断**: Zustand Storeを使用せず、useState のみで管理する（P31: Zustand Store Hooks無限ループの事前対策）

### IPC 依存

| メソッド                         | 用途               | 前提タスク |
| -------------------------------- | ------------------ | ---------- |
| `window.electronAPI.skill.readFile`  | ファイル内容読み込み | TASK-9A-B  |
| `window.electronAPI.skill.writeFile` | ファイル内容書き込み | TASK-9A-B  |

### キーボード操作

| キー       | コンポーネント  | 動作                 |
| ---------- | --------------- | -------------------- |
| Cmd+S      | SkillEditor     | ファイル保存         |
| Escape     | SkillEditor     | エディターを閉じる   |
| Tab        | SkillCodeEditor | 2スペース挿入        |

### ARIA属性

| 要素               | 属性           | 値                 |
| ------------------ | -------------- | ------------------ |
| FileTreeSidebar    | role           | tree               |
| ファイルアイテム   | role           | treeitem           |
| SkillCodeEditor    | role           | textbox            |
| SkillCodeEditor    | aria-multiline | true               |
| SkillCodeEditor    | aria-label     | コードエディター   |

### 今回実装（監査反映）内容

| 区分 | 反映内容 |
| --- | --- |
| 仕様整合 | `TASK-9A-C（spec_created）` 表記を `TASK-9A（完了）` に統合更新 |
| 機能実装 | read/write/create/delete/listBackups/restoreBackup を UI から実行可能化 |
| 成果物整合 | Phase 1-12 の outputs/artifacts と仕様書リンクを同期 |
| 品質検証 | UIテスト15件 + 回帰テスト + `verify-all-specs` / `verify-unassigned-links` の最終PASSを確認 |

---

<a id="skill-center-view-task-ui-05"></a>
