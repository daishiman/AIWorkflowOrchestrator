# ファイルタイプアイコン表示機能 - タスク指示書

## メタ情報

| 項目             | 内容                                                    |
| ---------------- | ------------------------------------------------------- |
| タスクID         | TASK-WS-FR011                                           |
| タスク名         | ファイルタイプアイコン表示機能                          |
| 分類             | 改善                                                    |
| 対象機能         | Electronデスクトップアプリ - ワークスペースマネージャー |
| 優先度           | 高                                                      |
| 見積もり規模     | 小規模                                                  |
| ステータス       | 未実施                                                  |
| 発見元           | Phase 0 (要件定義) - FR-WS-001                          |
| 発見日           | 2025-12-11                                              |
| 発見エージェント | .claude/agents/req-analyst.md                                            |

---

## 1. なぜこのタスクが必要か(Why)

### 1.1 背景

ワークスペースマネージャーの初期実装では、すべてのファイルに汎用アイコンが表示されています。ユーザーがファイルタイプを視覚的に区別できないため、操作効率が低下しています。FR-011として「Could have」(優先度: 中、スコア: 8)として要件定義されました。

### 1.2 問題点・課題

- すべてのファイルが同じアイコンで表示され、視覚的な区別ができない
- ファイル拡張子を読まないとファイルタイプが分からない
- VSCode等の競合製品では標準機能であり、使いにくさを感じさせる

### 1.3 放置した場合の影響

- **ユーザビリティ**: ファイル識別に時間がかかり、作業効率が低下
- **第一印象**: プロダクト品質が低く見える
- **影響度**: 中(Quick Winとして優先実装推奨)

---

## 2. 何を達成するか(What)

### 2.1 目的

ファイル拡張子に応じた適切なアイコンをファイルツリーに表示する機能を実装する。視覚的な識別性を向上させ、ユーザー体験を改善する。

### 2.2 最終ゴール

1. 主要なファイルタイプ(.ts, .tsx, .js, .jsx, .md, .json等)に対応したアイコン表示
2. フォルダアイコンは展開/折りたたみ状態で切り替え
3. アイコンの色でもファイルタイプを識別可能
4. 未対応の拡張子には汎用ファイルアイコンを表示

### 2.3 スコープ

#### 含むもの

- 主要ファイルタイプのアイコンマッピング(.ts, .tsx, .js, .jsx, .md, .json, .css, .html等)
- フォルダアイコン(展開/折りたたみ状態対応)
- FileTypeIconコンポーネントの実装
- アイコンライブラリの統合(vscode-icons推奨)

#### 含まないもの

- カスタムアイコンのアップロード機能(将来検討)
- アイコンテーマの切り替え機能(将来検討)
- バイナリファイルのサムネイル表示(別タスク)

### 2.4 成果物

| 成果物                 | パス                                                                  | 完了時の配置先     |
| ---------------------- | --------------------------------------------------------------------- | ------------------ |
| 機能要件書             | docs/30-workflows/workspace-manager-enhancements/task-step00-icons.md | (完了後も同じ場所) |
| アイコンコンポーネント | apps/desktop/src/renderer/components/atoms/FileTypeIcon/index.tsx     | (実装済み)         |
| アイコンマッピング     | apps/desktop/src/renderer/utils/fileTypeMapping.ts                    | (実装済み)         |
| テストファイル         | apps/desktop/src/test/components/FileTypeIcon.test.tsx                | (実装済み)         |

---

## 3. どのように実行するか(How)

### 3.1 前提条件

- ワークスペースマネージャーの初期実装(TASK-WS-001)が完了していること
- `FileTreeItem`コンポーネントが実装済み

### 3.2 依存タスク

- TASK-WS-001: ワークスペースマネージャー機能(完了必須)

### 3.3 必要な知識・スキル

- React コンポーネント設計
- Tailwind CSS アイコンスタイリング
- 拡張子パース処理

### 3.4 推奨アプローチ

**技術選定**: vscode-icons または lucide-react

- 理由: vscode-iconsはVSCodeと同じアイコンセット、lucide-reactは軽量で拡張性高い

**実装戦略**:

1. 拡張子→アイコン名のマッピング辞書を作成
2. FileTypeIconコンポーネントを作成
3. FileTreeItemコンポーネントに統合
4. 視覚的な確認テストを実施

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義
Phase 1: 設計(アイコンマッピング・UI設計)
Phase 2: 設計レビューゲート
Phase 3: テスト作成 (TDD: Red)
Phase 4: 実装 (TDD: Green)
Phase 5: リファクタリング (TDD: Refactor)
Phase 6: 品質保証
Phase 7: 最終レビューゲート
Phase 8: 手動テスト検証
Phase 9: ドキュメント更新
```

---

### Phase 0: 要件定義

#### Claude Code スラッシュコマンド

```
/ai:gather-requirements file-type-icons
```

#### 成果物

| 成果物     | パス                                                                  |
| ---------- | --------------------------------------------------------------------- |
| 機能要件書 | docs/30-workflows/workspace-manager-enhancements/task-step00-icons.md |

#### 完了条件

- [ ] 対応すべきファイルタイプが一覧化されている
- [ ] アイコンの視覚的要件が定義されている
- [ ] アクセシビリティ要件(代替テキスト)が明確化されている

---

### Phase 1: 設計

#### T-01-1: アイコンマッピング設計

##### Claude Code スラッシュコマンド

```
/ai:create-component FileTypeIcon atom
```

##### 使用エージェント

- **エージェント**: .claude/agents/ui-designer.md

##### 成果物

| 成果物   | パス                                                               |
| -------- | ------------------------------------------------------------------ |
| UI設計書 | docs/30-workflows/workspace-manager-enhancements/task-step01-ui.md |

##### 完了条件

- [ ] ファイルタイプ→アイコンマッピング辞書が設計されている
- [ ] 色分け戦略が定義されている
- [ ] フォールバック(未対応拡張子)が定義されている

---

### Phase 3: テスト作成 (TDD: Red)

#### Claude Code スラッシュコマンド

```
/ai:generate-unit-tests file-type-icon
```

#### TDD検証: Red状態確認

```bash
pnpm --filter @repo/desktop test:run -- FileTypeIcon
```

---

### Phase 4: 実装 (TDD: Green)

#### T-04-1: 依存追加

##### Claude Code スラッシュコマンド

```
/ai:add-dependency lucide-react
```

---

#### T-04-2: アイコンマッピング実装

##### Claude Code スラッシュコマンド

```
/ai:create-component FileTypeIcon atom
```

##### 実装内容(概要)

```typescript
const FILE_TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  ts: { icon: "FileCode", color: "text-blue-400" },
  tsx: { icon: "FileCode", color: "text-blue-500" },
  js: { icon: "FileCode", color: "text-yellow-400" },
  jsx: { icon: "FileCode", color: "text-yellow-500" },
  md: { icon: "FileText", color: "text-gray-300" },
  json: { icon: "Braces", color: "text-green-400" },
  css: { icon: "Palette", color: "text-pink-400" },
  html: { icon: "Code", color: "text-orange-400" },
};
```

---

#### T-04-3: FileTreeItem統合

##### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/renderer/components/molecules/FileTreeItem/index.tsx icon-extension
```

---

### Phase 8: 手動テスト検証

#### 手動テストケース

| No  | カテゴリ | テスト項目             | 前提条件                 | 操作手順                    | 期待結果                                   |
| --- | -------- | ---------------------- | ------------------------ | --------------------------- | ------------------------------------------ |
| 1   | 機能     | TypeScriptアイコン表示 | .tsファイルが存在        | 1.ファイルツリーを表示      | 青色のTypeScriptアイコンが表示される       |
| 2   | 機能     | JavaScriptアイコン表示 | .jsファイルが存在        | 1.ファイルツリーを表示      | 黄色のJavaScriptアイコンが表示される       |
| 3   | 機能     | Markdownアイコン表示   | .mdファイルが存在        | 1.ファイルツリーを表示      | グレーのドキュメントアイコンが表示される   |
| 4   | 機能     | フォルダアイコン切替   | フォルダが存在           | 1.フォルダを展開/折りたたみ | アイコンが open/close で切り替わる         |
| 5   | 異常系   | 未対応拡張子           | .xyzファイルが存在       | 1.ファイルツリーを表示      | 汎用ファイルアイコンが表示される           |
| 6   | UI/UX    | 視認性                 | 複数のファイルタイプ混在 | 1.ファイルツリーを表示      | 各ファイルタイプが色とアイコンで区別できる |

---

### Phase 9: ドキュメント更新

#### 更新対象ドキュメント

- `docs/00-requirements/16-ui-ux-guidelines.md` - ファイルアイコンパターンの追加

#### Claude Code スラッシュコマンド

```
/ai:update-all-docs
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 主要ファイルタイプにアイコンが表示される
- [ ] フォルダアイコンが展開状態で切り替わる
- [ ] 未対応拡張子に汎用アイコンが表示される
- [ ] アイコンの色でファイルタイプが区別できる

### 品質要件

- [ ] ユニットテストカバレッジ80%以上
- [ ] アイコンの代替テキスト(aria-label)が設定されている
- [ ] Lintエラー、型エラーなし

### ドキュメント要件

- [ ] システムドキュメントが更新されている

---

## 6. 検証方法

### ユニットテスト

```typescript
describe('FileTypeIcon', () => {
  it('should render TypeScript icon for .ts files', () => {
    const { container } = render(<FileTypeIcon fileName="test.ts" />);
    expect(container.querySelector('.text-blue-400')).toBeInTheDocument();
  });

  it('should render generic icon for unknown extension', () => {
    const { container } = render(<FileTypeIcon fileName="test.xyz" />);
    expect(container.querySelector('[data-icon="file"]')).toBeInTheDocument();
  });
});
```

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                 |
| ------------------------------ | ------ | -------- | ------------------------------------ |
| アイコンライブラリのサイズ増加 | 低     | 低       | Tree-shaking、必要なアイコンのみ利用 |
| 色覚異常ユーザーへの配慮不足   | 低     | 中       | 形状でも区別可能なアイコンを選定     |

---

## 8. 参照情報

### 関連ドキュメント

- [FR-WS-001: 機能要件定義書](../workspace-manager/task-step00-1-functional-requirements.md) - FR-011
- [UI-WS-001: UI設計書](../workspace-manager/task-step01-3-ui-design.md)

### 参考資料

- lucide-react: https://lucide.dev/
- VSCode Codicons: https://github.com/microsoft/vscode-codicons

---

## 9. 備考

### 補足事項

**Quick Win として優先実装推奨**:

- 実装が容易(1-2週間)
- 視覚的な改善が即座に体感できる
- ユーザー満足度への即効性が高い

**対応拡張子の初期セット**:

```typescript
const SUPPORTED_EXTENSIONS = [
  "ts",
  "tsx",
  "js",
  "jsx",
  "json",
  "md",
  "css",
  "scss",
  "html",
  "xml",
  "yaml",
  "yml",
  "sh",
  "py",
  "go",
  "rs",
];
```

---

## 変更履歴

| バージョン | 日付       | 変更者       | 変更内容                   |
| ---------- | ---------- | ------------ | -------------------------- |
| 1.0.0      | 2025-12-11 | .claude/agents/req-analyst.md | 初版作成(FR-011単一タスク) |
