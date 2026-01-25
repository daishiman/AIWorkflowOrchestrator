# 非機能要件定義書

## メタ情報

| 項目   | 内容                   |
| ------ | ---------------------- |
| Phase  | 1                      |
| タスク | 非機能要件の定義       |
| 作成日 | 2026-01-24             |
| 機能名 | workspace-chat-edit-ui |

---

## 1. アクセシビリティ要件（WCAG 2.1 AA準拠）

### 1.1 キーボード操作

| コンポーネント      | キー操作           | 動作                     |
| ------------------- | ------------------ | ------------------------ |
| FileContextBadge    | Tab                | フォーカス移動           |
| FileContextBadge    | Delete / Backspace | ファイル削除             |
| FileContextBadge    | Enter / Space      | 削除ボタンを実行         |
| ApplyControls       | Tab                | ボタン間フォーカス移動   |
| ApplyControls       | Enter / Space      | フォーカス中ボタン実行   |
| ApplyControls       | Escape             | 却下（オプション）       |
| FileContextDropZone | Tab                | フォーカス移動           |
| FileContextDropZone | Enter / Space      | ファイル選択ダイアログ   |
| DiffPreview         | Escape             | プレビューを閉じる       |
| DiffPreview         | Tab                | パネル内フォーカス移動   |
| DiffEditor          | Tab（内部）        | エディタ内ナビゲーション |
| EditCommandInput    | Tab                | フォーム要素間移動       |
| EditCommandInput    | Enter              | コマンド送信             |
| EditCommandInput    | Arrow Up/Down      | コマンドタイプ選択       |

### 1.2 ARIA属性

| コンポーネント      | 属性                     | 値                               |
| ------------------- | ------------------------ | -------------------------------- |
| FileContextBadge    | role                     | "listitem"                       |
| FileContextBadge    | aria-label（削除ボタン） | "${fileName}を削除"              |
| ApplyControls       | aria-label（適用）       | "変更を適用"                     |
| ApplyControls       | aria-label（却下）       | "変更を却下"                     |
| ApplyControls       | aria-busy                | ローディング時 "true"            |
| FileContextDropZone | role                     | "region"                         |
| FileContextDropZone | aria-dropeffect          | "copy"                           |
| FileContextDropZone | aria-label               | "ファイルをドロップしてください" |
| DiffPreview         | role                     | "dialog"                         |
| DiffPreview         | aria-modal               | "true"                           |
| DiffPreview         | aria-labelledby          | ヘッダーID                       |
| DiffEditor          | aria-label               | "差分エディタ"                   |
| EditCommandInput    | role（セレクタ）         | "listbox"                        |
| EditCommandInput    | aria-label               | "編集コマンドタイプを選択"       |

### 1.3 フォーカス管理

| 状況               | フォーカス制御                           |
| ------------------ | ---------------------------------------- |
| DiffPreview 開く   | プレビュー内の最初のフォーカス可能要素へ |
| DiffPreview 閉じる | トリガー要素にフォーカスを戻す           |
| エラー発生時       | エラーメッセージにフォーカス             |
| ファイル追加時     | 追加されたバッジにフォーカス             |
| ファイル削除時     | 前のバッジまたは次のバッジにフォーカス   |

### 1.4 コントラスト比

| 要素           | 最小コントラスト比 |
| -------------- | ------------------ |
| 通常テキスト   | 4.5:1              |
| 大きなテキスト | 3:1                |
| ボタン         | 3:1                |
| アイコン       | 3:1                |
| 差分ハイライト | 3:1                |

---

## 2. パフォーマンス要件

### 2.1 レンダリング性能

| 指標                           | 目標値         |
| ------------------------------ | -------------- |
| 初期レンダリング               | < 100ms        |
| コンポーネント更新             | < 16ms (60fps) |
| DiffEditor 初期化              | < 500ms        |
| 大きなファイル（10MB）差分表示 | < 2000ms       |

### 2.2 メモリ使用量

| 指標                       | 上限    |
| -------------------------- | ------- |
| コンポーネント当たり       | < 5MB   |
| DiffEditor（10MBファイル） | < 50MB  |
| FileContext（10ファイル）  | < 100MB |

### 2.3 最適化要件

| 要件ID  | 要件                                           |
| ------- | ---------------------------------------------- |
| PERF-01 | React.memo で不要な再レンダリングを防止        |
| PERF-02 | useMemo/useCallback でメモ化                   |
| PERF-03 | Monaco Editor の遅延読み込み（dynamic import） |
| PERF-04 | 仮想スクロール（大量の差分行の場合）           |

---

## 3. セキュリティ要件

### 3.1 XSS防止

| 要件ID | 要件                                       |
| ------ | ------------------------------------------ |
| SEC-01 | ファイル名表示時にHTMLエスケープ           |
| SEC-02 | ツールチップ表示時にサニタイズ             |
| SEC-03 | Monaco Editor のサンドボックス設定を有効化 |
| SEC-04 | dangerouslySetInnerHTMLを使用しない        |

### 3.2 ファイルシステムアクセス

| 要件ID | 要件                                     |
| ------ | ---------------------------------------- |
| SEC-05 | ワークスペース外のファイルアクセスを拒否 |
| SEC-06 | シンボリックリンクのtraversal攻撃を防止  |
| SEC-07 | ファイルパスのバリデーション             |

### 3.3 入力検証

| 要件ID | 要件                                     |
| ------ | ---------------------------------------- |
| SEC-08 | ドロップされたファイルのMIMEタイプ検証   |
| SEC-09 | ファイルサイズの上限チェック（10MB）     |
| SEC-10 | カスタム指示入力の長さ制限（10,000文字） |

---

## 4. レスポンシブ対応要件

### 4.1 ブレークポイント

| ブレークポイント | 幅         | 対応                      |
| ---------------- | ---------- | ------------------------- |
| sm               | < 640px    | DiffEditor インライン表示 |
| md               | 640-1024px | サイドバイサイド表示      |
| lg               | > 1024px   | フル機能表示              |

### 4.2 コンポーネント別対応

| コンポーネント      | sm対応                                     |
| ------------------- | ------------------------------------------ |
| FileContextBadge    | 省略表示の文字数を減らす（100px）          |
| ApplyControls       | アイコンのみ表示（テキスト非表示）         |
| FileContextDropZone | フルスクリーンオーバーレイ                 |
| DiffPreview         | フルスクリーンモーダル                     |
| DiffEditor          | インライン差分表示（サイドバイサイド無効） |
| EditCommandInput    | 垂直レイアウト                             |

---

## 5. 国際化（i18n）要件

### 5.1 対応言語

| 言語   | 優先度 |
| ------ | ------ |
| 日本語 | 必須   |
| 英語   | 推奨   |

### 5.2 ローカライズ対象

| 対象             | 例                         |
| ---------------- | -------------------------- |
| ボタンラベル     | "適用" / "Apply"           |
| エラーメッセージ | "ファイルが見つかりません" |
| ツールチップ     | "削除"                     |
| ARIA ラベル      | "変更を適用"               |
| プレースホルダー | "カスタム指示を入力..."    |

---

## 6. ブラウザ互換性

### 6.1 対応環境

| 環境     | バージョン              |
| -------- | ----------------------- |
| Electron | 28.x以上                |
| Chromium | 120以上（Electron内蔵） |
| Node.js  | 20.x（Electron内蔵）    |

### 6.2 必須API

| API                  | 用途                |
| -------------------- | ------------------- |
| HTML5 Drag and Drop  | FileContextDropZone |
| FileReader API       | ファイル読み込み    |
| ResizeObserver       | DiffEditor リサイズ |
| IntersectionObserver | 遅延読み込み        |

---

## 作成日時

- 作成: 2026-01-24
- 作成者: Claude Code
