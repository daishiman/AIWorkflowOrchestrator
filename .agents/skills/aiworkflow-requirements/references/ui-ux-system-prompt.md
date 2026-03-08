# システムプロンプト設定UI

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

システムプロンプト設定機能は、ユーザーがAIの振る舞いをカスタマイズできる重要なUI機能である。ChatView内で展開可能なパネルとして実装され、プロンプトの入力・編集・テンプレート管理を統合的に提供する。

**実装期間**: 2025-12-25
**タスクドキュメント**: `docs/30-workflows/chat-system-prompt/`

## UIコンポーネント構成

| コンポーネント | ファイルパス | 責務 |
|----------------|--------------|------|
| SystemPromptPanel | `apps/desktop/.../SystemPromptPanel/` | パネル全体の統合コンポーネント |
| SystemPromptHeader | `apps/desktop/.../SystemPromptHeader/` | ヘッダー（テンプレート選択・保存等） |
| SystemPromptTextArea | `apps/desktop/.../SystemPromptTextArea/` | プロンプト入力エリア |
| CharacterCounter | `apps/desktop/.../CharacterCounter/` | 文字数カウンター（4000文字制限） |
| TemplateSelector | `apps/desktop/.../TemplateSelector/` | テンプレート選択ドロップダウン |
| SaveTemplateDialog | `apps/desktop/.../SaveTemplateDialog/` | テンプレート保存ダイアログ |
| SystemPromptToggleButton | `apps/desktop/.../SystemPromptToggleButton/` | パネル展開/折りたたみトグルボタン |

## パネル展開/折りたたみ仕様

| 要素 | 仕様 |
|------|------|
| 初期状態 | 折りたたまれた状態（closed） |
| トグルボタン配置 | ChatView内、メッセージエリア上部 |
| トグルボタンアイコン | Lucide Icons `FileText`（20px×20px） |
| aria-expanded | `true` / `false`（展開状態に応じて動的変更） |
| aria-controls | `"system-prompt-panel"`（パネルIDと関連付け） |
| アニメーション | 300ms ease-in-out（高さアニメーション） |
| キーボード操作 | `Tab` → `Enter/Space`でトグル可能 |

## システムプロンプト入力エリア仕様

| 要素 | 仕様 |
|------|------|
| タイプ | `<textarea>`（複数行テキスト入力） |
| プレースホルダー | `"システムプロンプトを入力..."` |
| 最大文字数 | 4000文字（超過時に警告表示） |
| 文字数カウンター | リアルタイム表示（`aria-live="polite"`） |
| 文字数警告（95%以上） | 赤色表示 + `aria-live="assertive"` |
| role属性 | `role="textbox"` |
| aria-multiline | `aria-multiline="true"` |
| aria-label | `"システムプロンプト入力"` |
| aria-describedby | `"character-counter"`（文字数カウンターと関連付け） |
| 最小高さ | `120px`（約4行分） |
| リサイズ | 縦方向のみ（`resize: vertical`） |
| フォント | `font-mono`（JetBrains Mono / Source Code Pro） |

## プロンプトテンプレート管理仕様

### テンプレート選択ドロップダウン

| 要素 | 仕様 |
|------|------|
| 配置 | パネルヘッダー左側 |
| role属性 | `role="button"`, `aria-haspopup="listbox"` |
| aria-expanded | `true` / `false`（ドロップダウン開閉状態） |
| プリセット数 | 3種類（翻訳・プログラミング支援・ライティング支援） |
| カスタム上限 | 制限なし（electron-storeの容量制限のみ） |
| 表示順序 | プリセット → カスタム（作成日時降順） |

### プリセットテンプレート

| ID | 名前 | 用途 |
|----|------|------|
| preset-translator | 翻訳アシスタント | 多言語翻訳支援 |
| preset-programmer | プログラミング支援 | コード説明・デバッグ・リファクタリング |
| preset-writer | ライティング支援 | 文章校正・推敲・改善提案 |

### テンプレート保存ダイアログ

| 要素 | 仕様 |
|------|------|
| 表示契機 | ヘッダー「保存」ボタンクリック時 |
| role属性 | `role="dialog"`, `aria-modal="true"` |
| aria-labelledby | `"dialog-title"`（ダイアログタイトルと関連付け） |
| テンプレート名入力 | 最大50文字、必須項目 |
| バリデーション | 重複名チェック、文字数制限チェック |
| エラー表示 | `aria-invalid="true"`, `aria-describedby="name-error"` |
| プレビュー表示 | 最大100文字（超過時は末尾に`...`） |
| Escape キー | ダイアログを閉じる |
| オーバーレイクリック | ダイアログを閉じる |

## 状態管理構造（Zustand）

### システムプロンプト状態（ChatSlice）

| 状態/アクション | 型 | 説明 |
|-----------------|------|------|
| systemPrompt | string | 現在のシステムプロンプト |
| setSystemPrompt | (prompt: string) => void | プロンプト設定 |
| clearSystemPrompt | () => void | プロンプトクリア |

### テンプレート管理状態（SystemPromptTemplateSlice）

| 状態/アクション | 型 | 説明 |
|-----------------|------|------|
| templates | PromptTemplate[] | 保存済みテンプレート一覧 |
| presetTemplates | PromptTemplate[] | プリセットテンプレート |
| selectedTemplateId | string | null | 選択中のテンプレートID |
| loadTemplates | () => Promise<void> | electron-storeから読み込み |
| saveTemplate | (name: string, content: string) => Promise<void> | テンプレート保存 |
| deleteTemplate | (id: string) => Promise<void> | テンプレート削除 |
| selectTemplate | (template: PromptTemplate) => void | テンプレート選択 |

## LLM連携仕様

| 項目 | 仕様 |
|------|------|
| 送信タイミング | チャットメッセージ送信時 |
| 送信フォーマット | LLMプロバイダーごとに適切な形式に変換 |
| 空プロンプト時 | LLMにシステムプロンプトを送信しない（デフォルト動作） |
| プロンプト変更時 | 次のメッセージから新しいプロンプトが適用 |
| LLM切り替え時 | システムプロンプトを維持 |

## データ永続化

| ストレージ | 保存先 | データ形式 | 暗号化 |
|------------|--------|------------|--------|
| 現在のシステムプロンプト | electron-store | JSON | なし |
| カスタムテンプレート | electron-store | JSON | なし |
| プリセットテンプレート | コード内定数 | TypeScript | - |

## アクセシビリティ対応

### キーボードナビゲーション

| 操作 | キー | 動作 |
|------|------|------|
| パネル展開/折りたたみ | `Tab` → `Enter/Space` | トグルボタンで展開/折りたたみ |
| テキスト入力 | `Tab` | テキストエリアにフォーカス |
| テンプレート選択 | `Tab` → `Enter` | ドロップダウンを開く |
| テンプレート移動 | `↑` / `↓` | リスト内でテンプレートを選択 |
| テンプレート確定 | `Enter` | 選択したテンプレートを適用 |
| ダイアログ閉じる | `Escape` | 保存ダイアログを閉じる |

### スクリーンリーダー対応

| 要素 | ARIA属性 |
|------|----------|
| パネル全体 | `role="region"`, `aria-labelledby="system-prompt-label"` |
| テキストエリア | `role="textbox"`, `aria-multiline="true"`, `aria-label="システムプロンプト入力"` |
| 文字数カウンター | `role="status"`, `aria-live="polite"`, `aria-atomic="true"` |
| 文字数警告 | `aria-live="assertive"`（95%超過時） |
| 保存ボタン | `aria-label="保存"` |
| クリアボタン | `aria-label="クリア"` |
| テンプレート選択 | `aria-haspopup="listbox"`, `aria-expanded="true/false"` |
| ダイアログ | `role="dialog"`, `aria-modal="true"`, `aria-labelledby="dialog-title"` |

## パフォーマンス要件

| 操作 | 目標レスポンス時間 | 実測値 | 状態 |
|------|-------------------|--------|------|
| パネル展開/折りたたみ | 300ms以内 | 280ms | ✅ 達成 |
| システムプロンプト保存 | 100ms以内 | 85ms | ✅ 達成 |
| テンプレート一覧読み込み | 200ms以内 | 150ms | ✅ 達成 |
| テンプレート適用 | 50ms以内 | 35ms | ✅ 達成 |

## E2Eテスト実装

E2Eテストは`apps/desktop/e2e/system-prompt.spec.ts`にて実装済み（6テストケース）。

| No | テスト項目 | 検証内容 |
|----|------------|----------|
| 1 | システムプロンプト入力 | テキストエリアへの入力と文字数カウンター表示 |
| 2 | システムプロンプト適用 | LLMへのプロンプト送信とAIの振る舞い変更 |
| 3 | テンプレート保存 | テンプレート保存ダイアログの動作とデータ永続化 |
| 8 | 空のプロンプト | 空プロンプト時のデフォルト動作 |
| A1 | ARIA属性検証 | スクリーンリーダー対応のARIA属性設定 |
| A2 | キーボードナビゲーション | Tabキー・Enterキーでの操作性 |

## デザイントークン

| トークン | 値 | 用途 |
|----------|------|------|
| `--panel-bg` | `rgba(31,31,40,0.95)` | パネル背景色 |
| `--panel-border` | `rgba(255,255,255,0.1)` | パネルボーダー |
| `--text-primary` | `white` | テキストエリアテキスト色 |
| `--text-secondary` | `rgba(255,255,255,0.6)` | プレースホルダー・ラベル色 |
| `--counter-normal` | `rgba(255,255,255,0.4)` | 文字数カウンター（通常時） |
| `--counter-warning` | `#f87171` | 文字数カウンター（警告時） |
| `--button-primary-bg` | `#7aa2f7` | 保存ボタン背景色 |
| `--button-primary-hover-bg` | `#5a82d7` | 保存ボタンホバー時背景色 |

## セキュリティ考慮事項

| リスク | 対策 |
|--------|------|
| プロンプトインジェクション | ローカルアプリのため影響限定的 |
| 機密情報のプロンプトへの含有 | 警告メッセージ表示（実装はスコープ外） |
| テンプレートデータの破損 | デフォルト値へのフォールバック |
| XSS | React自動エスケープ |

## 関連タスクドキュメント

| ドキュメント | 内容 |
|--------------|------|
| `docs/30-workflows/chat-system-prompt/task-step00-requirements.md` | 要件定義書 |
| `docs/30-workflows/chat-system-prompt/task-step01-ui-design.md` | UI設計書 |
| `docs/30-workflows/chat-system-prompt/task-step01-state-management.md` | 状態管理設計書 |
| `docs/30-workflows/chat-system-prompt/task-step01-template-management.md` | テンプレート管理設計書 |
| `docs/30-workflows/chat-system-prompt/task-step07-final-review.md` | 最終レビューレポート |
| `docs/30-workflows/chat-system-prompt/task-step08-e2e-test-completion.md` | E2Eテスト完了報告 |

---

## 関連ドキュメント

- [Portal実装パターン](./ui-ux-portal-patterns.md)
- [ナビゲーションUI設計](./ui-ux-navigation.md)
- [LLM選択機能](./ui-ux-llm-selector.md)
- [UI/UXパネル設計](./ui-ux-panels.md)
