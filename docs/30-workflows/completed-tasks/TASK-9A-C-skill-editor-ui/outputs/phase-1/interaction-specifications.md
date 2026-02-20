# インタラクション仕様

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| タスクID | TASK-9A-C                    |
| Phase    | 1 (要件定義)                 |
| Task     | 4 (インタラクション仕様定義) |
| 作成日   | 2026-02-19                   |
| 依存     | TASK-9A-B (ファイル編集 IPC) |

---

## 1. キーボードショートカット仕様

### 1.1 ショートカット一覧

| ショートカット        | アクション       | 条件                     | スコープ             |
| --------------------- | ---------------- | ------------------------ | -------------------- |
| `Cmd+S` / `Ctrl+S`    | ファイル保存     | `hasChanges` が `true`   | SkillEditor 全体     |
| `Escape`              | エディター閉じる | 常時                     | SkillEditor 全体     |
| `Tab`（エディター内） | 2スペース挿入    | エディターにフォーカス中 | SkillCodeEditor のみ |

### 1.2 キーイベント処理の詳細

#### Cmd+S / Ctrl+S（保存）

| 項目           | 仕様                                                                  |
| -------------- | --------------------------------------------------------------------- |
| イベント種別   | `keydown`                                                             |
| 判定条件       | `(e.metaKey \|\| e.ctrlKey) && e.key === 's'`                         |
| デフォルト防止 | `e.preventDefault()` を必ず呼び出す（ブラウザのページ保存を抑制）     |
| 実行条件       | `hasChanges === true && isSaving === false && selectedFile !== null`  |
| 無効時の動作   | `hasChanges === false` の場合は何もしない（保存処理をスキップ）       |
| 登録方法       | `useEffect` で `document.addEventListener('keydown', handler)` を登録 |
| クリーンアップ | `useEffect` のクリーンアップ関数で `removeEventListener` を実行       |

```typescript
// 実装イメージ
const handleKeyDown = useCallback(
  (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      if (hasChanges && !isSaving && selectedFile) {
        handleSave();
      }
    }
    if (e.key === "Escape") {
      handleClose();
    }
  },
  [hasChanges, isSaving, selectedFile, handleSave, handleClose],
);

useEffect(() => {
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [handleKeyDown]);
```

#### Escape（閉じる）

| 項目           | 仕様                                                                       |
| -------------- | -------------------------------------------------------------------------- |
| イベント種別   | `keydown`                                                                  |
| 判定条件       | `e.key === 'Escape'`                                                       |
| デフォルト防止 | `e.preventDefault()` を呼び出す                                            |
| 実行条件       | 常時（確認ダイアログが表示されている場合はダイアログの Escape を優先する） |
| 動作           | `hasChanges === true` の場合は確認ダイアログを表示、`false` の場合は即閉じ |

#### Tab（2スペース挿入）

| 項目           | 仕様                                                                           |
| -------------- | ------------------------------------------------------------------------------ |
| イベント種別   | `keydown`（textarea 要素の `onKeyDown` で処理）                                |
| 判定条件       | `e.key === 'Tab'`                                                              |
| デフォルト防止 | `e.preventDefault()` を呼び出す（フォーカス移動を抑制）                        |
| 動作           | カーソル位置に2スペース（`"  "`）を挿入し、カーソルを挿入後の位置に移動する    |
| Shift+Tab      | デフォルトのフォーカス移動を許可する（行頭のインデント削除は将来拡張ポイント） |

```typescript
// 実装イメージ
const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  if (e.key === "Tab" && !e.shiftKey) {
    e.preventDefault();
    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const spaces = "  ";
    const newValue = value.substring(0, start) + spaces + value.substring(end);
    onChange(newValue);
    // 次のレンダリング後にカーソル位置を設定
    requestAnimationFrame(() => {
      target.selectionStart = start + spaces.length;
      target.selectionEnd = start + spaces.length;
    });
  }
};
```

---

## 2. ファイル選択インタラクション

### 2.1 ファイル選択フロー図

```
ファイルツリーでファイルクリック（またはキーボード Enter）
  │
  ├─ 同一ファイルを選択した場合 → 何もしない（早期リターン）
  │
  ├─ hasChanges === false の場合
  │     │
  │     ▼
  │   ファイル読み込み開始
  │     │
  │     ▼
  │   selectedFile = クリックされたファイルの relativePath
  │   isLoading = true
  │   error = null
  │     │
  │     ▼
  │   IPC: window.electronAPI.skill.readFile(skill.name, relativePath)
  │     │
  │     ├─ 成功
  │     │     │
  │     │     ▼
  │     │   content = レスポンス文字列
  │     │   isLoading = false
  │     │   hasChanges = false
  │     │
  │     └─ 失敗
  │           │
  │           ▼
  │         isLoading = false
  │         error = サニタイズ済みエラーメッセージ
  │         content = ""
  │
  └─ hasChanges === true の場合
        │
        ▼
      確認ダイアログ表示
      「未保存の変更があります。破棄しますか？」
        │
        ├─ [破棄] クリック
        │     │
        │     ▼
        │   hasChanges = false
        │   （上記「hasChanges === false」と同じフローに合流）
        │
        └─ [キャンセル] クリック
              │
              ▼
            何もしない（現在のファイルを維持）
```

### 2.2 未保存変更がある場合の確認フロー

| ステップ | アクション                         | 状態変化                              |
| -------- | ---------------------------------- | ------------------------------------- |
| 1        | ファイルツリーで別ファイルクリック | 確認ダイアログ表示                    |
| 2a       | [破棄] ボタンクリック              | ダイアログ閉じ → ファイル読み込み開始 |
| 2b       | [キャンセル] ボタンクリック        | ダイアログ閉じ → 現在のファイルを維持 |
| 2c       | Escape キー押下                    | ダイアログ閉じ → 現在のファイルを維持 |
| 2d       | オーバーレイクリック               | ダイアログ閉じ → 現在のファイルを維持 |

### 2.3 状態遷移

```
[初期状態]
  selectedFile: null
  content: ""
  isLoading: false
  hasChanges: false
  error: null

[ファイル選択] → selectedFile: "agents/main.md", isLoading: true
[読み込み完了] → content: "...", isLoading: false
[テキスト編集] → content: "...(変更後)", hasChanges: true
[別ファイル選択（未保存あり）] → 確認ダイアログ
  → [破棄] → selectedFile: 新ファイル, isLoading: true, hasChanges: false
  → [キャンセル] → 変化なし
[読み込みエラー] → error: "ファイルの読み込みに失敗しました", isLoading: false
```

---

## 3. 保存インタラクション

### 3.1 保存フロー図

```
保存トリガー: 保存ボタンクリック or Cmd+S / Ctrl+S
  │
  ├─ hasChanges === false → 何もしない（早期リターン）
  ├─ isSaving === true → 何もしない（二重送信防止）
  ├─ selectedFile === null → 何もしない（ファイル未選択）
  │
  ▼
isSaving = true
error = null
  │
  ▼
IPC: window.electronAPI.skill.writeFile(skill.name, selectedFile, content)
  │
  ├─ 成功
  │     │
  │     ▼
  │   isSaving = false
  │   hasChanges = false
  │
  └─ 失敗
        │
        ▼
      isSaving = false
      error = サニタイズ済みエラーメッセージ
        │
        ▼
      トースト通知でエラーメッセージを表示
```

### 3.2 成功フロー

| ステップ | アクション                   | 状態変化                               | UI フィードバック                    |
| -------- | ---------------------------- | -------------------------------------- | ------------------------------------ |
| 1        | 保存トリガー発火             | `isSaving = true`                      | 保存ボタン無効化 + スピナー表示      |
| 2        | IPC writeFile 呼び出し       | -                                      | スピナー回転中                       |
| 3        | IPC writeFile 成功レスポンス | `isSaving = false, hasChanges = false` | スピナー非表示、保存ボタン通常状態   |
| 4        | -                            | -                                      | ツールバーの「（未保存）」ラベル消去 |

### 3.3 エラーフロー

| ステップ | アクション                     | 状態変化                          | UI フィードバック                                  |
| -------- | ------------------------------ | --------------------------------- | -------------------------------------------------- |
| 1        | 保存トリガー発火               | `isSaving = true`                 | 保存ボタン無効化 + スピナー表示                    |
| 2        | IPC writeFile 呼び出し         | -                                 | スピナー回転中                                     |
| 3        | IPC writeFile エラーレスポンス | `isSaving = false, error = "..."` | スピナー非表示                                     |
| 4        | -                              | -                                 | トースト通知でエラーメッセージ表示                 |
| 5        | -                              | `hasChanges` は `true` のまま     | 「（未保存）」ラベルは維持（変更は失われていない） |

**エラーメッセージの仕様**:

- Main Process からサニタイズ済みの文字列を受け取る（内部パスやスタックトレースを含まない）
- ユーザー向けの表示例: 「ファイルの保存に失敗しました。再度お試しください。」

---

## 4. 確認ダイアログ仕様

### 4.1 トリガー条件

| トリガー                       | 条件                   | 確認ダイアログ表示   |
| ------------------------------ | ---------------------- | -------------------- |
| ファイルツリーで別ファイル選択 | `hasChanges === true`  | 表示する             |
| 閉じるボタンクリック           | `hasChanges === true`  | 表示する             |
| Escape キー押下                | `hasChanges === true`  | 表示する             |
| ファイルツリーで同ファイル選択 | -                      | 表示しない           |
| 閉じるボタンクリック           | `hasChanges === false` | 表示しない（即閉じ） |

### 4.2 ダイアログ UI

| 要素               | 仕様                                                      |
| ------------------ | --------------------------------------------------------- |
| オーバーレイ       | `bg-black/50` 半透明背景                                  |
| ダイアログ幅       | `max-w-sm`（384px）                                       |
| 角丸               | `rounded-xl`（12px）                                      |
| 背景色             | `bg-white` / ダークモード: `bg-slate-800`                 |
| シャドウ           | `shadow-lg`                                               |
| パディング         | `p-6`（24px）                                             |
| メッセージ         | 「未保存の変更があります。破棄しますか？」                |
| メッセージフォント | `text-sm text-slate-700` / ダークモード: `text-slate-300` |
| ボタン配置         | 右寄せ、横並び（`flex justify-end gap-3`）                |

**ボタン仕様**:

| ボタン     | ラベル     | スタイル                                         | 動作                           |
| ---------- | ---------- | ------------------------------------------------ | ------------------------------ |
| キャンセル | キャンセル | `bg-slate-100 text-slate-700 hover:bg-slate-200` | ダイアログを閉じる             |
| 破棄       | 破棄       | `bg-red-500 text-white hover:bg-red-600`         | 変更を破棄してアクションを実行 |

### 4.3 ボタンアクション

| 操作                  | 結果                                                       |
| --------------------- | ---------------------------------------------------------- |
| [キャンセル] クリック | ダイアログ閉じ → 現在のファイルと内容を維持                |
| [破棄] クリック       | ダイアログ閉じ → `hasChanges = false` → 次のアクション実行 |
| Escape キー           | [キャンセル] と同じ動作                                    |
| オーバーレイクリック  | [キャンセル] と同じ動作                                    |
| Enter キー            | デフォルトフォーカスのボタン（[キャンセル]）を実行         |

**フォーカス管理**:

- ダイアログ表示時: [キャンセル] ボタンにフォーカスを設定（安全側デフォルト — 破壊的操作は確認ダイアログで保護する原則に準拠）
- ダイアログ閉じた後: ダイアログを開いたトリガー要素にフォーカスを戻す
- フォーカストラップ: ダイアログ内の [キャンセル] と [破棄] の間で Tab/Shift+Tab によるフォーカス循環を実装する

---

## 5. アニメーション仕様

### 5.1 一覧テーブル

| 対象                       | 継続時間    | イージング  | トリガー                   | CSS プロパティ                     |
| -------------------------- | ----------- | ----------- | -------------------------- | ---------------------------------- |
| ファイルツリー項目ホバー   | 100ms       | ease-out    | マウスホバー               | `background-color`                 |
| ツールバーボタンホバー     | 100ms       | ease-out    | マウスホバー               | `background-color`, `color`        |
| 保存中スピナー             | 1000ms/回転 | linear      | `isSaving === true`        | `transform: rotate(360deg)`        |
| 読み込み中スピナー         | 1000ms/回転 | linear      | `isLoading === true`       | `transform: rotate(360deg)`        |
| エラーメッセージ表示       | 200ms       | ease-in-out | `error` が `null` → 文字列 | `opacity`, `transform: translateY` |
| 確認ダイアログ表示         | 200ms       | ease-in-out | ダイアログ表示トリガー     | `opacity`, `transform: scale`      |
| 確認ダイアログ非表示       | 150ms       | ease-in     | ダイアログ閉じ             | `opacity`, `transform: scale`      |
| ファイルツリーカテゴリ展開 | 200ms       | ease-in-out | カテゴリクリック           | `max-height`, `opacity`            |

### 5.2 CSS 実装方針

**基本方針**:

- `transform` と `opacity` を優先的に使用する（GPU アクセラレーション対象のため、パフォーマンスに優れる）
- `prefers-reduced-motion` メディアクエリに対応し、アニメーションを簡略化するオプションを提供する
- Tailwind CSS のトランジションユーティリティ（`transition-colors`, `duration-100`, `ease-out`）を基盤とする

**ホバーアニメーション**:

```css
/* ファイルツリー項目 */
.file-tree-item {
  @apply transition-colors duration-100 ease-out;
}

/* ツールバーボタン */
.toolbar-button {
  @apply transition-colors duration-100 ease-out;
}
```

**スピナーアニメーション**:

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 1s linear infinite;
}
/* Tailwind: animate-spin を使用 */
```

**エラーメッセージアニメーション**:

```css
.error-enter {
  @apply opacity-0 -translate-y-1;
}
.error-enter-active {
  @apply opacity-100 translate-y-0 transition-all duration-200 ease-in-out;
}
```

**`prefers-reduced-motion` 対応**:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
/* Tailwind: motion-reduce:transition-none を使用 */
```

---

## 6. アクセシビリティ仕様

### 6.1 ARIA 属性一覧

| 要素                   | ARIA 属性         | 値                        |
| ---------------------- | ----------------- | ------------------------- |
| ファイルツリー         | `role="tree"`     | -                         |
| ファイルツリー         | `aria-label`      | `"スキルファイル一覧"`    |
| ツリーカテゴリ         | `role="treeitem"` | -                         |
| ツリーカテゴリ         | `aria-expanded`   | `true` / `false`          |
| ツリーカテゴリ         | `aria-level`      | `1`                       |
| ツリーカテゴリ子リスト | `role="group"`    | -                         |
| ツリーファイル項目     | `role="treeitem"` | -                         |
| ツリーファイル項目     | `aria-selected`   | `true` / `false`          |
| ツリーファイル項目     | `aria-level`      | `2`                       |
| コードエディター       | `role="textbox"`  | -                         |
| コードエディター       | `aria-label`      | `"コードエディター"`      |
| コードエディター       | `aria-multiline`  | `"true"`                  |
| 保存ボタン             | `aria-label`      | `"保存"`                  |
| 保存ボタン             | `aria-disabled`   | `true`（保存不可時）      |
| 閉じるボタン           | `aria-label`      | `"閉じる"`                |
| ローディングスピナー   | `role="status"`   | -                         |
| ローディングスピナー   | `aria-label`      | `"読み込み中"`            |
| 保存中スピナー         | `role="status"`   | -                         |
| 保存中スピナー         | `aria-label`      | `"保存中"`                |
| エラーメッセージ       | `role="alert"`    | -                         |
| エラーメッセージ       | `aria-live`       | `"assertive"`             |
| 確認ダイアログ         | `role="dialog"`   | -                         |
| 確認ダイアログ         | `aria-modal`      | `"true"`                  |
| 確認ダイアログ         | `aria-labelledby` | ダイアログタイトルの `id` |
| ツールバー領域         | `role="toolbar"`  | -                         |
| ツールバー領域         | `aria-label`      | `"エディターツールバー"`  |

### 6.2 キーボード操作一覧

#### ファイルツリー

| キー       | 動作                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------- |
| ArrowDown  | 次の表示中ツリーアイテムにフォーカスを移動する                                                     |
| ArrowUp    | 前の表示中ツリーアイテムにフォーカスを移動する                                                     |
| ArrowRight | カテゴリ: 折りたたまれている場合は展開する。展開済みの場合は最初の子アイテムにフォーカスを移動する |
| ArrowLeft  | ファイル: 親カテゴリにフォーカスを移動する。カテゴリ: 展開されている場合は折りたたむ               |
| Enter      | ファイル: ファイルを選択する。カテゴリ: 展開/折りたたみをトグルする                                |
| Space      | カテゴリ: 展開/折りたたみをトグルする                                                              |
| Home       | ツリーの最初のアイテムにフォーカスを移動する                                                       |
| End        | ツリーの最後の表示中アイテムにフォーカスを移動する                                                 |

#### コードエディター

| キー     | 動作                                 |
| -------- | ------------------------------------ |
| Tab      | カーソル位置に2スペースを挿入する    |
| 標準操作 | テキスト入力、選択、コピー、ペースト |

#### 確認ダイアログ

| キー      | 動作                                   |
| --------- | -------------------------------------- |
| Tab       | [キャンセル] → [破棄] のフォーカス移動 |
| Shift+Tab | [破棄] → [キャンセル] のフォーカス移動 |
| Enter     | フォーカス中のボタンを実行             |
| Space     | フォーカス中のボタンを実行             |
| Escape    | [キャンセル] と同じ動作                |

### 6.3 フォーカス管理

| シナリオ             | フォーカス移動先                               |
| -------------------- | ---------------------------------------------- |
| SkillEditor 表示時   | ファイルツリーの最初のアイテム                 |
| ファイル選択時       | コードエディター（textarea）                   |
| 確認ダイアログ表示時 | [キャンセル] ボタン                            |
| 確認ダイアログ閉じ後 | ダイアログを開いたトリガー要素                 |
| 保存完了時           | コードエディター（textarea）にフォーカス維持   |
| エラー発生時         | エラーメッセージ領域（`aria-live` で自動通知） |
| SkillEditor 閉じる時 | 呼び出し元の `onClose` に委譲                  |

**フォーカストラップの実装方針**:

- 確認ダイアログ表示中は、ダイアログ外の要素にフォーカスが移動しないようトラップする
- Tab キーでダイアログ内の最後のフォーカス可能要素に達した場合、最初のフォーカス可能要素に戻る
- Shift+Tab キーでダイアログ内の最初のフォーカス可能要素に達した場合、最後のフォーカス可能要素に戻る

### 6.4 スクリーンリーダー対応

| 状況                   | 通知内容                                               | 通知方法                                 |
| ---------------------- | ------------------------------------------------------ | ---------------------------------------- |
| ファイル選択           | 「{ファイル名} を選択しました」                        | `aria-selected` 変更による通知           |
| ファイル読み込み中     | 「読み込み中」                                         | `role="status"` + `aria-label`           |
| ファイル読み込み完了   | 自動通知なし（エディター内容変更）                     | -                                        |
| ファイル読み込みエラー | エラーメッセージ全文                                   | `role="alert"` + `aria-live="assertive"` |
| 保存中                 | 「保存中」                                             | `role="status"` + `aria-label`           |
| 保存完了               | 自動通知なし（「（未保存）」ラベル消去で暗黙的に判明） | -                                        |
| 保存エラー             | エラーメッセージ全文                                   | `role="alert"` + `aria-live="assertive"` |
| カテゴリ展開           | 「{カテゴリ名} を展開しました」                        | `aria-expanded="true"` 変更              |
| カテゴリ折りたたみ     | 「{カテゴリ名} を折りたたみました」                    | `aria-expanded="false"` 変更             |
| 確認ダイアログ表示     | ダイアログタイトルとメッセージを読み上げ               | `role="dialog"` + `aria-modal`           |

---

## 7. エッジケース

### 7.1 急速なファイル切り替え

| シナリオ                                          | 対策                                                                                                                                               |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 読み込み中に別ファイルをクリックした場合          | 前の読み込みリクエストの結果を無視する（コンポーネントの `selectedFile` が変わっているため、レスポンスの `filePath` と照合して不一致なら破棄する） |
| 連続して3つ以上のファイルを素早くクリックした場合 | 最後のクリックのみ有効とする。中間のリクエスト結果は上記ルールで自動的に破棄される                                                                 |

**実装方針**:

```typescript
// AbortController またはリクエスト ID を使用して古いリクエストを無視する
const loadFile = async (filePath: string) => {
  const requestId = ++requestIdRef.current;
  setIsLoading(true);
  setError(null);
  try {
    const result = await window.electronAPI.skill.readFile(
      skill.name,
      filePath,
    );
    // リクエスト ID が一致する場合のみ状態を更新
    if (requestIdRef.current === requestId) {
      setContent(result);
      setIsLoading(false);
      setHasChanges(false);
    }
  } catch (err) {
    if (requestIdRef.current === requestId) {
      setError(
        err instanceof Error ? err.message : "ファイルの読み込みに失敗しました",
      );
      setIsLoading(false);
      setContent("");
    }
  }
};
```

### 7.2 保存中のファイル切り替え

| シナリオ                                 | 対策                                                                                                        |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `isSaving === true` 中にファイルクリック | 保存完了まで待たずに確認ダイアログを表示する（保存中のファイル変更は未保存扱い）                            |
| 保存完了後に画面が古いファイルを表示     | 保存完了時に `selectedFile` が変わっている場合、`hasChanges = false` の設定のみ行い、`content` は更新しない |

### 7.3 同時保存リクエスト

| シナリオ                                        | 対策                                                           |
| ----------------------------------------------- | -------------------------------------------------------------- |
| 保存ボタンを素早く2回クリックした場合           | `isSaving === true` の間は保存処理を実行しない（二重送信防止） |
| Cmd+S を素早く2回押した場合                     | 同上（`isSaving` フラグによるガード）                          |
| 保存ボタンクリックと Cmd+S が同時に発火した場合 | 同上（`isSaving` フラグによるガード）                          |

### 7.4 大容量ファイルの操作

| シナリオ                               | 対策                                                                                      |
| -------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1MB を超えるファイルを開こうとした場合 | Main Process 側でファイルサイズチェックを行い、エラーメッセージを返す（TASK-9A-B の責務） |
| 読み込みに500ms以上かかる場合          | `isLoading` スピナーが表示されるため、ユーザーは処理中であることを認識できる              |

### 7.5 ネットワーク/IPC エラー

| シナリオ                                 | 対策                                                           |
| ---------------------------------------- | -------------------------------------------------------------- |
| IPC 通信がタイムアウトした場合           | Promise の reject をキャッチし、汎用エラーメッセージを表示する |
| Main Process が応答しない場合            | タイムアウト（30秒）後にエラー状態に遷移する                   |
| エラーメッセージに内部パスが含まれる場合 | Main Process 側でサニタイズ済み（TASK-9A-B の責務）            |

### 7.6 コンポーネントのアンマウント

| シナリオ                                  | 対策                                                                                           |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 読み込み中に SkillEditor が閉じられた場合 | `useEffect` のクリーンアップで `requestIdRef` をインクリメントし、レスポンス処理をスキップする |
| 保存中に SkillEditor が閉じられた場合     | 保存処理自体は Main Process で完了するが、状態更新はスキップする                               |

---

## 参照ドキュメント

| ドキュメント              | パス                                                                           | 参照箇所                       |
| ------------------------- | ------------------------------------------------------------------------------ | ------------------------------ |
| UI デザイン原則           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | アニメーション仕様、A11y 要件  |
| デザインシステム          | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`     | カラートークン、スペーシング   |
| Electron IPC セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   | IPC 通信パターン               |
| エラーハンドリング        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | エラーメッセージのサニタイズ   |
| 既存 SkillSelector        | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`                 | キーボードナビゲーション実装例 |
| 既存 SkillImportDialog    | `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`             | ダイアログ Escape ハンドリング |
