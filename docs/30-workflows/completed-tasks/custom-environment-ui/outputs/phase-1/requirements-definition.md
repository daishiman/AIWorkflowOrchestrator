# 要件定義書: Custom Execution Environment UI

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| タスクID   | AGENT-006                       |
| タスク名   | Custom Execution Environment UI |
| Phase      | 1                               |
| 作成日     | 2026-01-13                      |
| 依存タスク | AGENT-004, AGENT-005            |

---

## 機能要件（FR）

### FR-001: 環境タイプの自動選択

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| 要件ID   | FR-001                                                   |
| 優先度   | 高                                                       |
| 説明     | スキルのメタデータに基づいて適切な実行環境を自動選択する |
| 受け入れ | スキル選択時に対応する環境タイプが自動的に設定される     |
| 実装対象 | agentSlice, EnvironmentSelector                          |

### FR-002: HTMLプレビュー環境

| 項目     | 内容                                         |
| -------- | -------------------------------------------- |
| 要件ID   | FR-002                                       |
| 優先度   | 高                                           |
| 説明     | HTMLコンテンツをiframe内でプレビュー表示する |
| 受け入れ | 生成されたHTMLがプレビューパネルに表示される |
| 実装対象 | HTMLPreviewEnvironment                       |

### FR-003: リアルタイム更新

| 項目     | 内容                                                   |
| -------- | ------------------------------------------------------ |
| 要件ID   | FR-003                                                 |
| 優先度   | 高                                                     |
| 説明     | エージェントの出力に応じてプレビューがリアルタイム更新 |
| 受け入れ | ストリーミング中にプレビューが自動更新される           |
| 実装対象 | agentSlice, ExecutionEnvironment                       |

### FR-004: 分割レイアウト

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| 要件ID   | FR-004                                             |
| 優先度   | 高                                                 |
| 説明     | チャットとプレビューを左右に分割表示する           |
| 受け入れ | 画面が左右に分割され、左にチャット、右にプレビュー |
| 実装対象 | SplitLayout                                        |

### FR-005: 分割比率の調整

| 項目     | 内容                                         |
| -------- | -------------------------------------------- |
| 要件ID   | FR-005                                       |
| 優先度   | 中                                           |
| 説明     | ドラッグで分割比率を調整できる               |
| 受け入れ | 分割バーをドラッグしてパネル比率を変更できる |
| 実装対象 | SplitLayout                                  |

### FR-006: 環境の手動切り替え

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| 要件ID   | FR-006                                             |
| 優先度   | 中                                                 |
| 説明     | 環境セレクターで手動で環境を切り替えられる         |
| 受け入れ | ドロップダウンから別の環境を選択して切り替えられる |
| 実装対象 | EnvironmentSelector                                |

### FR-007: Markdownプレビュー環境

| 項目     | 内容                                         |
| -------- | -------------------------------------------- |
| 要件ID   | FR-007                                       |
| 優先度   | 中                                           |
| 説明     | Markdownコンテンツをレンダリングして表示する |
| 受け入れ | Markdownがパースされて適切に表示される       |
| 実装対象 | MarkdownPreviewEnvironment                   |

### FR-008: 更新のデバウンス

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| 要件ID   | FR-008                                         |
| 優先度   | 中                                             |
| 説明     | 頻繁な更新をデバウンスしてパフォーマンスを確保 |
| 受け入れ | 500ms以内の連続更新は最後の1つのみ反映される   |
| 実装対象 | agentSlice, ExecutionEnvironment               |

---

## 非機能要件（NFR）

### NFR-001: セキュリティ（iframe sandbox）

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| 要件ID   | NFR-001                                                  |
| 優先度   | 高                                                       |
| 説明     | プレビュー内のスクリプトが親ウィンドウにアクセスできない |
| 受け入れ | sandbox属性でスクリプト実行が無効化されている            |
| 実装対象 | HTMLPreviewEnvironment                                   |

**sandbox属性設定**:

```html
<iframe sandbox="allow-same-origin"></iframe>
```

- `allow-same-origin`: CSSの読み込みに必要
- スクリプト実行、ポップアップ、親ウィンドウへのナビゲーションは禁止

### NFR-002: セキュリティ（CSP）

| 項目     | 内容                                          |
| -------- | --------------------------------------------- |
| 要件ID   | NFR-002                                       |
| 優先度   | 高                                            |
| 説明     | Content Security Policyでスクリプト実行を禁止 |
| 受け入れ | script-src 'none'が設定されている             |
| 実装対象 | HTMLPreviewEnvironment                        |

**CSP設定**:

```
default-src 'self';
script-src 'none';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'none';
frame-ancestors 'none';
form-action 'none';
```

### NFR-003: パフォーマンス

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| 要件ID   | NFR-003                            |
| 優先度   | 中                                 |
| 説明     | 大量のHTMLでもスムーズに動作する   |
| 受け入れ | 100KBのHTMLでも1秒以内に表示される |
| 実装対象 | HTMLPreviewEnvironment             |

### NFR-004: 拡張性

| 項目     | 内容                                         |
| -------- | -------------------------------------------- |
| 要件ID   | NFR-004                                      |
| 優先度   | 中                                           |
| 説明     | 新しい環境タイプを容易に追加できる設計       |
| 受け入れ | 新環境追加時に既存コードの変更が最小限で済む |
| 実装対象 | ExecutionEnvironment, EnvironmentType        |

### NFR-005: アクセシビリティ

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| 要件ID   | NFR-005                                |
| 優先度   | 中                                     |
| 説明     | WCAG 2.1 AA準拠                        |
| 受け入れ | キーボード操作、スクリーンリーダー対応 |
| 実装対象 | 全コンポーネント                       |

**具体的な要件**:

- フォーカス可能な分割バー（Tab移動対応）
- 矢印キーによる分割比率調整
- スクリーンリーダー対応（aria-label, aria-valuemin/max/now）
- フォーカスリングの表示

---

## 統合要件（接続要件）

### コンポーネント間接続

| 接続元               | 接続先                     | 接続内容                         |
| -------------------- | -------------------------- | -------------------------------- |
| AgentExecutionView   | SplitLayout                | 環境タイプに基づくレイアウト切替 |
| SplitLayout          | ExecutionEnvironment       | プレビューコンテンツの表示       |
| ExecutionEnvironment | HTMLPreviewEnvironment     | HTML環境時のプレビュー           |
| ExecutionEnvironment | MarkdownPreviewEnvironment | Markdown環境時のプレビュー       |
| EnvironmentSelector  | agentSlice                 | 環境タイプの変更                 |

### 状態管理（agentSlice拡張）

| 新規状態            | 型              | 説明                   |
| ------------------- | --------------- | ---------------------- |
| previewContent      | PreviewContent  | プレビュー用コンテンツ |
| selectedEnvironment | EnvironmentType | 選択中の環境タイプ     |
| splitRatio          | number          | 分割比率（0-1）        |

### IPC通信（将来対応）

- AGENT-007でバックエンド環境管理API追加時に拡張予定
- 現Phase（AGENT-006）ではRenderer内完結

---

## 依存関係

| 依存タスク | 依存内容                                        |
| ---------- | ----------------------------------------------- |
| AGENT-004  | Skill Registry（スキルにenvironmentConfig追加） |
| AGENT-005  | Agent Execution（agentSliceの基盤）             |

---

## 実装コンポーネント一覧

| コンポーネント             | 階層      | 責務                         |
| -------------------------- | --------- | ---------------------------- |
| SplitLayout                | Organisms | 左右分割レイアウト           |
| ExecutionEnvironment       | Organisms | 環境タイプに応じたプレビュー |
| HTMLPreviewEnvironment     | Organisms | HTMLプレビュー（sandbox）    |
| MarkdownPreviewEnvironment | Organisms | Markdownプレビュー           |
| EnvironmentSelector        | Molecules | 環境タイプ選択ドロップダウン |

---

## 型定義（packages/shared）

| 型名              | 説明                                                   |
| ----------------- | ------------------------------------------------------ |
| EnvironmentType   | 'none' \| 'html' \| 'markdown' \| 'terminal' \| 'code' |
| EnvironmentConfig | スキルの環境設定                                       |
| PreviewContent    | プレビューコンテンツ                                   |

---

## 完了確認

- [x] 機能要件（FR-001〜FR-008）が定義されている
- [x] 非機能要件（NFR-001〜NFR-005）が定義されている
- [x] セキュリティ要件（sandbox, CSP）が明確化されている
- [x] 統合要件（接続要件）が記載されている
- [x] 依存関係が明確化されている
