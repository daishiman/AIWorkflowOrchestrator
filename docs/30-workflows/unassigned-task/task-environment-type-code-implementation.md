# EnvironmentType Code実装 - タスク指示書

## メタ情報

```yaml
issue_number: 580
```

## メタ情報

| 項目         | 内容                          |
| ------------ | ----------------------------- |
| タスクID     | TASK-ENV-CODE-001             |
| タスク名     | EnvironmentType Code実装      |
| 分類         | 改善                          |
| 対象機能     | Agent SDK Preview State       |
| 優先度       | 低                            |
| 見積もり規模 | 中規模                        |
| ステータス   | 未実施                        |
| 発見元       | aiworkflow-requirements残課題 |
| 発見日       | 2026-01-30                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

AGENT-006（Preview State Management）でEnvironmentType型を定義した際、`code`タイプは将来実装として定義のみ行われた。現在の実装では`none`、`html`、`markdown`のみが実際に利用可能である。

### 1.2 問題点・課題

- `EnvironmentType`に`code`が定義されているが、対応するPreviewコンポーネントが存在しない
- ソースコードプレビューにシンタックスハイライトが適用されない
- 行番号表示、言語自動検出などのコードプレビュー機能が利用できない

### 1.3 放置した場合の影響

- スキル実行時のコード出力が適切にハイライトされない
- 開発者向け機能のユーザー体験が制限される
- 将来のコードプレビュー機能実装時に追加作業が発生

---

## 2. 何を達成するか（What）

### 2.1 目的

EnvironmentType `code`に対応するPreviewコンポーネントを実装し、ソースコードを適切にハイライト表示可能にする。

### 2.2 最終ゴール

- `EnvironmentType.code`選択時に専用Previewコンポーネントが表示される
- シンタックスハイライトが適用される（主要言語対応）
- 行番号が表示される
- コピーボタンで全コードをコピー可能

### 2.3 スコープ

#### 含むもの

- CodePreviewコンポーネント実装
- シンタックスハイライトライブラリ統合（Prism.js or highlight.js）
- 行番号表示
- コピー機能
- ユニットテスト

#### 含まないもの

- コード編集機能
- インテリセンス
- リアルタイムコンパイル

### 2.4 成果物

| 成果物                    | ファイルパス                                                                  |
| ------------------------- | ----------------------------------------------------------------------------- |
| CodePreviewコンポーネント | `apps/desktop/src/renderer/components/preview/CodePreview.tsx`                |
| ユニットテスト            | `apps/desktop/src/renderer/components/preview/__tests__/CodePreview.test.tsx` |
| 型定義更新                | `packages/shared/src/types/skill.ts` (必要に応じて)                           |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- AGENT-006（Preview State Management）が完了していること
- `EnvironmentType`型定義が存在すること
- `PreviewContent`型が定義されていること

### 3.2 依存タスク

| タスクID  | タスク名                 | 状態 |
| --------- | ------------------------ | ---- |
| AGENT-006 | Preview State Management | 完了 |

### 3.3 必要な知識

- React コンポーネント設計
- シンタックスハイライトライブラリ（Prism.js / highlight.js）
- CSS スタイリング
- TypeScript 型定義

### 3.4 推奨アプローチ

1. シンタックスハイライトライブラリの選定（`prism-react-renderer`推奨）
2. CodePreviewコンポーネントの基本実装
3. 行番号表示の追加
4. コピー機能の追加
5. テスト作成

---

## 4. 実行手順

### Phase構成

| Phase | 名称         | 目的                         |
| ----- | ------------ | ---------------------------- |
| 1     | 要件定義     | 詳細要件の明確化             |
| 2     | 設計         | コンポーネント設計           |
| 3     | 設計レビュー | 設計品質確認                 |
| 4     | テスト作成   | TDDによるテスト先行作成      |
| 5     | 実装         | コンポーネント実装           |
| 6-10  | 品質保証     | テスト拡充・リファクタリング |
| 11-13 | 完了処理     | 手動テスト・ドキュメント・PR |

### Phase 5: 実装

#### 目的

CodePreviewコンポーネントを実装する。

#### 手順

1. シンタックスハイライトライブラリをインストール
   ```bash
   pnpm --filter @repo/desktop add prism-react-renderer
   ```
2. CodePreview.tsxを作成
3. 言語自動検出またはlanguageプロパティによる言語指定
4. 行番号表示を追加
5. コピーボタンを追加

#### 成果物

- `CodePreview.tsx`
- スタイル定義

#### 完了条件

- コンポーネントがビルドエラーなくコンパイルできる
- 主要言語（JavaScript, TypeScript, Python, JSON）がハイライトされる

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `EnvironmentType.code`選択時にCodePreviewが表示される
- [ ] JavaScript/TypeScriptのシンタックスハイライトが正しく表示される
- [ ] 行番号が表示される
- [ ] コピーボタンでコード全体をコピーできる
- [ ] 言語が指定可能である

### 品質要件

- [ ] TypeScript strictモードでエラーなし
- [ ] ESLintエラーなし
- [ ] テストカバレッジ80%以上
- [ ] Prettierフォーマット済み

### ドキュメント要件

- [ ] コンポーネントのPropsにJSDocコメント
- [ ] サポート言語一覧の記載

---

## 6. 検証方法

### テストケース

| #   | テストケース         | 期待結果                             |
| --- | -------------------- | ------------------------------------ |
| 1   | JavaScriptコード表示 | キーワードがハイライトされる         |
| 2   | TypeScriptコード表示 | 型定義がハイライトされる             |
| 3   | Pythonコード表示     | キーワードがハイライトされる         |
| 4   | JSONコード表示       | キー・値がハイライトされる           |
| 5   | 行番号表示           | 各行に番号が表示される               |
| 6   | コピー機能           | クリップボードにコードがコピーされる |

### 検証手順

1. Storybookでコンポーネントを表示
2. 各言語のサンプルコードを入力して視覚的に確認
3. コピーボタンをクリックしてクリップボードを確認
4. 自動テストを実行

---

## 7. リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                                   |
| ---------------------- | ------ | -------- | -------------------------------------- |
| バンドルサイズ増加     | 中     | 高       | 必要な言語のみをインポート             |
| 未対応言語での表示崩れ | 低     | 中       | フォールバック（プレーンテキスト表示） |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                    | パス                                                 |
| ------------------------------- | ---------------------------------------------------- |
| interfaces-agent-sdk-history.md | `.claude/skills/aiworkflow-requirements/references/` |
| Preview State仕様               | AGENT-006タスク成果物                                |

### 参考資料

- [prism-react-renderer](https://www.npmjs.com/package/prism-react-renderer) - Prism.jsのReactラッパー
- [highlight.js](https://highlightjs.org/) - シンタックスハイライトライブラリ

---

## 9. 備考

### 関連する残課題

- TASK-ENV-TERMINAL-001: EnvironmentType Terminal実装（同種の実装）

### 補足事項

- Monaco Editorなどの本格的なコードエディタは本タスクのスコープ外
- 将来的にコード編集機能が必要になった場合は別タスクとして検討
- prism-react-rendererは軽量でTree-shakingに対応しているため推奨
