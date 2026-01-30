# EnvironmentType Terminal実装 - タスク指示書

## メタ情報

```yaml
issue_number: 581
```

## メタ情報

| 項目         | 内容                          |
| ------------ | ----------------------------- |
| タスクID     | TASK-ENV-TERMINAL-001         |
| タスク名     | EnvironmentType Terminal実装  |
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

AGENT-006（Preview State Management）でEnvironmentType型を定義した際、`terminal`タイプは将来実装として定義のみ行われた。現在の実装では`none`、`html`、`markdown`のみが実際に利用可能である。

### 1.2 問題点・課題

- `EnvironmentType`に`terminal`が定義されているが、対応するPreviewコンポーネントが存在しない
- CLIツール実行結果やシェルコマンド出力を適切に表示できない
- ターミナル特有のスタイリング（ANSIカラーコード、等幅フォント）が未対応

### 1.3 放置した場合の影響

- スキル実行時のターミナル出力が適切に表示されない
- ユーザー体験が制限される
- 将来のCLI統合機能実装時に追加作業が発生

---

## 2. 何を達成するか（What）

### 2.1 目的

EnvironmentType `terminal`に対応するPreviewコンポーネントを実装し、ターミナル出力を適切に表示可能にする。

### 2.2 最終ゴール

- `EnvironmentType.terminal`選択時に専用Previewコンポーネントが表示される
- ANSIカラーコードが適切に解釈・表示される
- 等幅フォント、ダークテーマでのターミナル風表示
- スクロール可能な出力領域

### 2.3 スコープ

#### 含むもの

- TerminalPreviewコンポーネント実装
- ANSIカラーコード解釈ライブラリ統合
- 基本的なターミナルスタイリング
- ユニットテスト

#### 含まないもの

- インタラクティブシェル機能
- コマンド入力機能
- ターミナルエミュレータ機能

### 2.4 成果物

| 成果物                        | ファイルパス                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------- |
| TerminalPreviewコンポーネント | `apps/desktop/src/renderer/components/preview/TerminalPreview.tsx`                |
| ユニットテスト                | `apps/desktop/src/renderer/components/preview/__tests__/TerminalPreview.test.tsx` |
| 型定義更新                    | `packages/shared/src/types/skill.ts` (必要に応じて)                               |

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
- ANSIカラーコード仕様
- CSS スタイリング（等幅フォント、ダークテーマ）
- TypeScript 型定義

### 3.4 推奨アプローチ

1. ANSIカラーコード解釈ライブラリの選定（`ansi-to-html`または`ansi_up`）
2. TerminalPreviewコンポーネントの基本実装
3. スタイリング適用（Tailwind CSS + カスタムスタイル）
4. テスト作成

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

TerminalPreviewコンポーネントを実装する。

#### 手順

1. ANSIカラーコード解釈ライブラリをインストール
   ```bash
   pnpm --filter @repo/desktop add ansi-to-html
   ```
2. TerminalPreview.tsxを作成
3. PreviewContentのtype='terminal'時の分岐を追加
4. スタイリングを適用

#### 成果物

- `TerminalPreview.tsx`
- スタイル定義

#### 完了条件

- コンポーネントがビルドエラーなくコンパイルできる
- ANSIカラーコードが正しく解釈される

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `EnvironmentType.terminal`選択時にTerminalPreviewが表示される
- [ ] ANSIカラーコード（16色）が正しく表示される
- [ ] 等幅フォントで表示される
- [ ] 長い出力がスクロール可能である

### 品質要件

- [ ] TypeScript strictモードでエラーなし
- [ ] ESLintエラーなし
- [ ] テストカバレッジ80%以上
- [ ] Prettierフォーマット済み

### ドキュメント要件

- [ ] コンポーネントのPropsにJSDocコメント
- [ ] 使用方法のREADME記載（必要に応じて）

---

## 6. 検証方法

### テストケース

| #   | テストケース             | 期待結果                     |
| --- | ------------------------ | ---------------------------- |
| 1   | 通常テキスト表示         | テキストがそのまま表示される |
| 2   | ANSIカラーコード（赤）   | 赤色でテキストが表示される   |
| 3   | ANSIカラーコード（太字） | 太字でテキストが表示される   |
| 4   | 複数行出力               | 各行が正しく改行される       |
| 5   | 長い出力                 | スクロールバーが表示される   |

### 検証手順

1. Storybookでコンポーネントを表示
2. 各テストケースの入力を与えて視覚的に確認
3. 自動テストを実行

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                               |
| ------------------------------ | ------ | -------- | ---------------------------------- |
| ANSIライブラリのバンドルサイズ | 中     | 中       | Tree-shaking可能なライブラリを選定 |
| パフォーマンス劣化（大量出力） | 中     | 低       | 仮想スクロール検討                 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                    | パス                                                 |
| ------------------------------- | ---------------------------------------------------- |
| interfaces-agent-sdk-history.md | `.claude/skills/aiworkflow-requirements/references/` |
| Preview State仕様               | AGENT-006タスク成果物                                |

### 参考資料

- [ansi-to-html](https://www.npmjs.com/package/ansi-to-html) - ANSIカラーコード変換ライブラリ
- [ANSI escape code](https://en.wikipedia.org/wiki/ANSI_escape_code) - ANSIエスケープコード仕様

---

## 9. 備考

### 関連する残課題

- TASK-ENV-CODE-001: EnvironmentType Code実装（同種の実装）

### 補足事項

- 将来的にインタラクティブターミナル機能が必要になった場合は別タスクとして検討
- xterm.jsなどの本格的なターミナルエミュレータは本タスクのスコープ外
