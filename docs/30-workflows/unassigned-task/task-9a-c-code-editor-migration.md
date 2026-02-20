# SkillEditor コードエディター移行（Monaco/CodeMirror） - タスク指示書

## メタ情報

```yaml
issue_number: 832
```

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | TASK-9A-C-003                                         |
| タスク名     | SkillEditor コードエディター移行（Monaco/CodeMirror） |
| 分類         | 改善                                                  |
| 対象機能     | SkillCodeEditor                                       |
| 優先度       | 低                                                    |
| 見積もり規模 | 大規模                                                |
| ステータス   | 未実施                                                |
| 発見元       | Phase 2（設計）- 将来拡張ポイント                     |
| 発見日       | 2026-02-19                                            |
| ブロック対象 | なし                                                  |
| 前提タスク   | TASK-9A-C（SkillEditor UI基盤）完了済み               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9A-CのSkillCodeEditorは、意図的な設計判断により`<textarea>`要素ベースの最小限のコードエディターとして実装された。Phase 2設計書では`language`プロパティを「将来のシンタックスハイライト用」として定義しており、本格的なコードエディター機能は段階的に導入する計画だった。

現在のSkillCodeEditorの実装:

```typescript
interface SkillCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string; // data-language属性にのみ使用（ハイライト未実装）
  isReadOnly?: boolean;
}
```

### 1.2 問題点

`<textarea>`ベースの実装には以下の制限がある:

1. **シンタックスハイライトなし**: コードの構造が視覚的に識別できず、スキルファイル（TypeScript, Markdown, JSON, YAML等）の編集効率が低い
2. **行番号表示なし**: エラー箇所の特定やコードレビューが困難
3. **コード折りたたみなし**: 大規模なSKILL.mdやエージェント定義ファイルの全体把握が難しい
4. **検索・置換なし**: ブラウザのCtrl+Fに依存し、正規表現検索やファイル内置換ができない
5. **オートコンプリートなし**: JSON/YAMLのキー補完やTypeScriptの型補完が利用できない
6. **ミニマップなし**: ファイル全体の俯瞰ができない

### 1.3 なぜ`<textarea>` overlayパターンではなくエディター移行か

TASK-9A-C-001（シンタックスハイライト対応）では`prism-react-renderer`によるoverlayパターンが検討されている。しかし、overlayパターンには本質的な限界がある:

| 機能                   | textarea + overlay | Monaco Editor | CodeMirror 6  |
| ---------------------- | ------------------ | ------------- | ------------- |
| シンタックスハイライト | ⚠️ 部分対応        | ✅ 完全対応   | ✅ 完全対応   |
| 行番号表示             | ⚠️ 手動実装        | ✅ 内蔵       | ✅ 内蔵       |
| コード折りたたみ       | ❌ 不可            | ✅ 内蔵       | ✅ 拡張機能   |
| 検索・置換             | ❌ 不可            | ✅ 内蔵       | ✅ 拡張機能   |
| オートコンプリート     | ❌ 不可            | ✅ 内蔵       | ✅ 拡張機能   |
| ミニマップ             | ❌ 不可            | ✅ 内蔵       | ⚠️ プラグイン |
| 複数カーソル           | ❌ 不可            | ✅ 内蔵       | ✅ 内蔵       |
| 括弧マッチング         | ❌ 不可            | ✅ 内蔵       | ✅ 拡張機能   |
| スクロール同期         | ⚠️ 手動・不安定    | ✅ 不要       | ✅ 不要       |
| バンドルサイズ         | ~30KB              | ~20MB         | ~2-3MB        |

overlayパターンでは「スクロール同期のずれ」「大ファイルでのパフォーマンス劣化」「機能追加の限界」が技術的負債として蓄積する。本格的なコードエディター体験が必要になった時点で、Monaco EditorまたはCodeMirror 6への移行が効率的である。

### 1.4 放置した場合の影響

- スキル開発者の編集効率が低いまま改善されない
- overlayパターンで中途半端な拡張を続けると技術的負債が蓄積する
- 競合するスキルエディター（VS Code拡張等）に対するUX面での劣位が固定化する

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillCodeEditorの内部実装を`<textarea>`からMonaco EditorまたはCodeMirror 6に置き換え、プロフェッショナルなコードエディター体験を提供する。

### 2.2 最終ゴール

- SkillCodeEditorの外部インターフェース（Props）を維持したまま、内部をエディターライブラリに置換
- シンタックスハイライト、行番号、コード折りたたみ、検索・置換が動作する
- 既存のSkillEditor統合テストが全てPASSする
- Electronのsandboxモード（`contextIsolation: true`, `nodeIntegration: false`）で正常動作する
- バンドルサイズ増加がアプリ起動時間に与える影響が許容範囲内（起動時間増加 500ms以内）

### 2.3 スコープ

#### 含むもの

- SkillCodeEditorの内部実装置換（textarea → Monaco or CodeMirror）
- 対応言語: typescript, javascript, markdown, json, yaml, css, html, shell, python, plaintext（既存の`getLanguage()`が返す10言語）
- シンタックスハイライト
- 行番号表示
- コード折りたたみ
- 検索・置換（Ctrl+F / Cmd+F）
- 括弧マッチング
- 自動インデント
- テーマ対応（ライトモード。ダークモードは将来タスク）
- 全テストの更新・追加
- パフォーマンスベンチマーク

#### 含まないもの

- オートコンプリート / インテリセンス（Language Serverとの統合が必要なため別タスク）
- ダークモードテーマ（別タスク）
- diff表示 / マージエディター（別タスク）
- SkillCodeEditorPropsインターフェースの変更（後方互換性維持）

### 2.4 成果物

| 成果物                    | パス                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------ |
| SkillCodeEditor（置換後） | `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx`                     |
| エディター設定ファイル    | `apps/desktop/src/renderer/components/skill/editorConfig.ts`                         |
| テストファイル（更新）    | `apps/desktop/src/renderer/components/skill/__tests__/SkillCodeEditor.test.tsx`      |
| テストファイル（更新）    | `apps/desktop/src/renderer/components/skill/__tests__/SkillEditor.test.tsx`          |
| パフォーマンステスト      | `apps/desktop/src/renderer/components/skill/__tests__/SkillCodeEditor.perf.test.tsx` |

---

## 3. どのように実行するか（How）

### 3.1 技術選定: Monaco Editor vs CodeMirror 6

実装者は以下の比較を参考に、プロジェクトの状況に応じて選択する。

| 項目                       | Monaco Editor                          | CodeMirror 6                                 |
| -------------------------- | -------------------------------------- | -------------------------------------------- |
| **バンドルサイズ**         | ~20MB（全言語含む）                    | ~2-3MB（必要拡張のみ選択インストール）       |
| **TypeScript対応**         | ネイティブ（VS Codeと同一エンジン）    | 良好（型定義完備）                           |
| **React統合**              | `@monaco-editor/react`（公式ラッパー） | `@uiw/react-codemirror`（コミュニティ製）    |
| **Electron互換性**         | Web Worker設定が必要（後述）           | 問題なし                                     |
| **シンタックスハイライト** | 内蔵（全言語対応）                     | 拡張機能（`@codemirror/lang-*`で選択式）     |
| **行番号**                 | 内蔵                                   | 内蔵                                         |
| **ミニマップ**             | 内蔵                                   | プラグイン（`@replit/codemirror-minimap`等） |
| **コード折りたたみ**       | 内蔵                                   | `@codemirror/language`の`foldGutter`         |
| **検索・置換**             | 内蔵（正規表現対応）                   | `@codemirror/search`                         |
| **カスタマイズ性**         | テーマAPI（やや制限的）                | 拡張システム（高い柔軟性）                   |
| **学習コスト**             | 低（VS Code経験があれば直感的）        | 中（拡張システムの理解が必要）               |
| **コミュニティ規模**       | 非常に大きい（Microsoft管理）          | 大きい（Marijn Haverbeke管理）               |
| **ライセンス**             | MIT                                    | MIT                                          |
| **推奨シナリオ**           | フル機能が必要、バンドルサイズ許容可   | 軽量・カスタマイズ重視、バンドルサイズ制約有 |

#### 推奨アプローチ

**CodeMirror 6を第一候補として推奨する**。理由:

1. **バンドルサイズ**: Electronアプリにおいて20MBの追加は起動時間とメモリに影響する。CodeMirror 6は2-3MBで十分な機能を提供する
2. **Electron互換性**: MonacoのWeb WorkerはElectronのsandboxモードで制限される場合があり、追加設定が必要。CodeMirror 6は問題なく動作する
3. **拡張システム**: 必要な機能だけを選択的にインストールでき、将来の拡張も柔軟
4. **パフォーマンス**: 大ファイル（1000行超）でもCodeMirror 6は高速に動作する

ただし、以下の場合はMonaco Editorを選択する:

- 将来的にインテリセンス / Language Server統合が確実に必要な場合
- VS Codeとの一貫したUXが最優先の場合
- バンドルサイズの制約がない場合

### 3.2 推奨実装: CodeMirror 6

#### 必要パッケージ

```bash
pnpm --filter @repo/desktop add codemirror @codemirror/view @codemirror/state @codemirror/language @codemirror/commands @codemirror/search @codemirror/autocomplete @codemirror/lint
pnpm --filter @repo/desktop add @codemirror/lang-javascript @codemirror/lang-markdown @codemirror/lang-json @codemirror/lang-css @codemirror/lang-html @codemirror/lang-python @codemirror/legacy-modes
pnpm --filter @repo/desktop add @uiw/react-codemirror
```

#### SkillCodeEditorの実装方針

```typescript
// SkillCodeEditor.tsx - 外部インターフェースは変更しない
interface SkillCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  isReadOnly?: boolean;
}
```

内部実装で`@uiw/react-codemirror`の`CodeMirror`コンポーネントを使用し、`language`プロパティから適切な言語拡張を選択する。

#### editorConfig.ts の設計

`language`文字列から対応するCodeMirror言語拡張を返すマッピング関数を配置する:

- `typescript` / `javascript` → `@codemirror/lang-javascript`（`jsx: true`オプション含む）
- `markdown` → `@codemirror/lang-markdown`
- `json` → `@codemirror/lang-json`
- `yaml` → `@codemirror/legacy-modes/mode/yaml`（StreamLanguageラッパー経由）
- `css` → `@codemirror/lang-css`
- `html` → `@codemirror/lang-html`
- `shell` → `@codemirror/legacy-modes/mode/shell`（StreamLanguageラッパー経由）
- `python` → `@codemirror/lang-python`
- `plaintext` → 拡張なし

#### テーマ設定

Apple HIG準拠のライトテーマを`@codemirror/theme-one-light`ベースでカスタマイズ:

- 背景色: `#FFFFFF`（プロジェクト標準）
- テキスト色: `#1D1D1F`（プライマリテキスト）
- 選択色: `#007AFF` + opacity 0.2（アクセントカラー）
- 行番号色: `#86868B`（セカンダリテキスト）
- フォント: `-apple-system, BlinkMacSystemFont, 'SF Mono', Menlo, monospace`
- フォントサイズ: `13px`（macOS標準エディターサイズ）

### 3.3 代替実装: Monaco Editor

Monaco Editorを選択する場合の実装方針。

#### 必要パッケージ

```bash
pnpm --filter @repo/desktop add monaco-editor @monaco-editor/react
```

#### Electron固有の設定

MonacoのWeb WorkerがElectronのsandboxモードで制限される問題に対処する:

```typescript
// MonacoのWeb Workerを無効化し、メインスレッドで実行
import { loader } from "@monaco-editor/react";

loader.config({
  // Web Workerの代わりにメインスレッドを使用
  "vs/nls": { availableLanguages: { "*": "ja" } },
});

// webpack/vite設定でMonacoのワーカーを正しくバンドル
// vite.config.ts にmonacoEditorPlugin追加が必要
```

#### バンドルサイズ最適化

不要な言語の除外が必要:

```typescript
// vite.config.ts
import monacoEditorPlugin from "vite-plugin-monaco-editor";

export default defineConfig({
  plugins: [
    monacoEditorPlugin({
      languageWorkers: ["editorWorkerService", "typescript", "json"],
      customWorkers: [],
    }),
  ],
});
```

---

## 3.5 実装課題と解決策（TASK-9A-Cからの教訓）

| 課題                                         | 発見経緯                                              | 解決策                                                                                                | 教訓                                                 |
| -------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| P39: happy-dom環境でのuserEvent非互換        | テスト追加時にhappy-dom環境でSymbol操作エラーが発生   | `fireEvent`ベースでテスト実装。非同期ハンドラは`await act(async () => { fireEvent.click(el) })`で包む | happy-dom環境では`userEvent`使用禁止                 |
| Electronバンドルサイズ                       | Monaco Editorが約20MB、CodeMirror 6が約2-3MB          | CodeMirror 6の場合は必要な拡張のみ選択インストール。Monacoの場合は言語ワーカーを限定する              | 依存ライブラリのサイズ影響を事前調査する             |
| WCE（webContents.executeJavaScript）パターン | TASK-WCE-MONACO-001でMain→Renderer逆方向クエリの知見  | エディターの選択テキスト取得等にはWCEパターンを使用。`window.electronAPI.wce`経由でアクセス           | エディターの内部状態取得にはWCEパターンが有効        |
| 大規模仕様書のコンテキスト管理               | Phase 4/6の仕様書ファイルが40KB超になる問題           | Progressive Disclosureで要約ベース参照。Phase分割を細かくする                                         | 仕様書サイズを意識した分割設計が必要                 |
| P40: テスト実行ディレクトリ依存              | モノレポルートからの実行でhappy-dom設定が適用されない | `cd apps/desktop && pnpm vitest run`または`pnpm --filter @repo/desktop exec vitest run`で実行         | テスト実行は常に対象パッケージのディレクトリから行う |
| エディターコンポーネントのテストモック       | CodeMirror/Monacoは内部DOMが複雑でテストが困難        | エディターライブラリをモジュールレベルでモックし、Props伝播とコールバック呼び出しのみを検証する       | UIライブラリの内部動作はライブラリ側のテストに任せる |

---

## 4. 実行手順

### Phase 1: 要件定義・技術選定（1 Phase）

1. MonacoとCodeMirrorの両方をプロトタイプ実装し、以下を計測する:
   - 初期化時間（100行 / 500行 / 1000行のファイル）
   - メモリ使用量
   - バンドルサイズ増加量
   - Electron sandboxモードでの動作確認
2. 計測結果に基づき、最終的な技術選定を行う
3. 要件定義書を作成する

### Phase 2: 設計（1 Phase）

1. editorConfig.tsの言語マッピング設計
2. テーマ設定のカスタマイズ方針
3. SkillCodeEditor内部のコンポーネント構造設計
4. キーバインド設定（macOS / Windows対応）
5. アクセシビリティ対応方針（ARIA、キーボードナビゲーション）

### Phase 3: 設計レビュー（1 Phase）

1. 技術選定の妥当性検証
2. バンドルサイズ影響のレビュー
3. Electron互換性のレビュー
4. テスト戦略のレビュー

### Phase 4: テスト作成（1 Phase）

1. SkillCodeEditor単体テスト設計
   - Props伝播テスト（value, onChange, language, isReadOnly）
   - 言語切り替えテスト（10言語）
   - テーマ適用テスト
   - エディター初期化テスト
2. SkillEditor統合テスト更新
   - ファイル選択→エディター表示→編集→保存フロー
   - 未保存インジケーター連携
3. パフォーマンステスト設計
   - 100行ファイルの初期化: 200ms以内
   - 500行ファイルの初期化: 500ms以内
   - 1000行ファイルの初期化: 1000ms以内
   - キー入力からの描画更新: 16ms以内（60fps）

### Phase 5: 実装（1 Phase）

1. エディターライブラリのインストール
2. editorConfig.tsの実装（言語マッピング、テーマ定義）
3. SkillCodeEditor.tsxの内部実装置換
4. SkillCodeEditorPropsインターフェースは変更しない（後方互換性維持）
5. 既存のgetLanguage()ユーティリティとの統合

### Phase 6-7: テスト拡充・カバレッジ確認（1 Phase）

1. エッジケーステスト追加
   - 空文字列の編集
   - 1MB超の大ファイル
   - 未対応言語（フォールバック動作）
   - isReadOnlyモードでの入力拒否
2. カバレッジ基準: Line 80%以上、Branch 60%以上

### Phase 8-9: リファクタリング・品質検証（1 Phase）

1. 不要なtextarea関連コードの完全削除
2. ESLint / Prettier / TypeScript型チェック通過
3. 全テストPASS確認

### Phase 10: 最終レビュー（1 Phase）

1. バンドルサイズ増加量の最終確認
2. Electron sandboxモードでの最終動作確認
3. パフォーマンスベンチマーク結果の確認
4. アクセシビリティ検証

### Phase 11: 手動テスト（1 Phase）

1. 全10言語のシンタックスハイライト目視確認
2. 行番号表示の正確性
3. コード折りたたみの動作
4. 検索・置換（Cmd+F）の動作
5. 括弧マッチングの動作
6. 大ファイル（SKILL.md等の実ファイル）での編集体験
7. ファイル切り替え時のエディター状態リセット
8. 未保存インジケーターとの連携確認

### Phase 12: ドキュメント（1 Phase）

1. 実装ガイド（Part 1: 概念説明、Part 2: 開発者向け詳細）
2. コンポーネントドキュメント更新
3. システム仕様書更新（ui-ux-feature-components.md等）
4. 未タスク検出・報告

### Phase 13: 完了（1 Phase）

1. 全成果物の最終確認
2. PR作成

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SkillCodeEditorPropsインターフェース（value, onChange, language, isReadOnly）が変更されていない
- [ ] 全10言語（typescript, javascript, markdown, json, yaml, css, html, shell, python, plaintext）でシンタックスハイライトが動作する
- [ ] 行番号が正しく表示される
- [ ] コード折りたたみが動作する（Markdown見出し、JSONオブジェクト、TypeScript関数等）
- [ ] 検索・置換（Cmd+F / Ctrl+F）が動作する
- [ ] 括弧マッチングが動作する
- [ ] 自動インデントが動作する
- [ ] isReadOnly=trueの場合、テキスト入力が拒否される

### 非機能要件

- [ ] Electron sandboxモード（contextIsolation: true, nodeIntegration: false）で正常動作する
- [ ] アプリ起動時間の増加が500ms以内
- [ ] 100行ファイルの初期化が200ms以内
- [ ] 500行ファイルの初期化が500ms以内
- [ ] 1000行ファイルの初期化が1000ms以内
- [ ] キー入力から描画更新が16ms以内（60fps）

### テスト要件

- [ ] SkillCodeEditor単体テストが全てPASS
- [ ] SkillEditor統合テストが全てPASS
- [ ] パフォーマンステストが全てPASS
- [ ] Line Coverage 80%以上
- [ ] Branch Coverage 60%以上

### 品質要件

- [ ] `pnpm lint` が通ること
- [ ] `pnpm typecheck` が通ること
- [ ] 全テストがPASSすること
- [ ] `--no-verify`を使用していないこと

---

## 6. 検証方法

### 6.1 自動テスト

```bash
# テスト実行（apps/desktopディレクトリから実行すること - P40対策）
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillCodeEditor.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillEditor.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillCodeEditor.perf.test.tsx
```

### 6.2 パフォーマンスベンチマーク

```bash
# バンドルサイズ確認
cd apps/desktop && pnpm build
# dist/ディレクトリのサイズを移行前後で比較
```

### 6.3 手動テスト

| テスト項目           | 手順                               | 期待結果                                   |
| -------------------- | ---------------------------------- | ------------------------------------------ |
| TypeScriptハイライト | `.ts`ファイルを選択                | キーワード、文字列、型が色分け表示される   |
| Markdownハイライト   | `SKILL.md`を選択                   | 見出し、リスト、コードブロックが色分け表示 |
| JSONハイライト       | `.json`ファイルを選択              | キー、値、括弧が色分け表示される           |
| 行番号表示           | 任意のファイルを開く               | 左側に行番号が表示される                   |
| コード折りたたみ     | TypeScriptの関数定義の横をクリック | 関数本体が折りたたまれる                   |
| 検索                 | Cmd+Fを押してキーワードを入力      | 一致箇所がハイライトされる                 |
| 置換                 | 検索バーで置換モードに切り替え     | 一致箇所を個別/一括置換できる              |
| 括弧マッチング       | カーソルを括弧の横に置く           | 対応する括弧がハイライトされる             |
| 読み取り専用モード   | isReadOnly=trueの状態でキー入力    | テキストが変更されない                     |
| ファイル切り替え     | ファイルツリーで別ファイルを選択   | エディター内容が切り替わる                 |
| 未保存インジケーター | エディターで文字を入力             | ツールバーに「未保存」が表示される         |
| 大ファイル編集       | 500行超のファイルを開いて編集      | 遅延なく入力できる                         |

---

## 7. リスクと対策

### 7.1 バンドルサイズ増大

| リスク   | Monaco Editorを選択した場合、バンドルサイズが約20MB増加する                                                       |
| -------- | ----------------------------------------------------------------------------------------------------------------- |
| 影響     | アプリ起動時間の増加、ダウンロードサイズの増加                                                                    |
| 対策     | CodeMirror 6を選択することで2-3MBに抑制。Monacoの場合は不要言語を除外し、遅延読み込み（Dynamic Import）を適用する |
| 検出方法 | Phase 1のプロトタイプでバンドルサイズを計測                                                                       |

### 7.2 Electron Worker制限

| リスク   | MonacoのWeb WorkerがElectronのsandboxモードで制限される                                                               |
| -------- | --------------------------------------------------------------------------------------------------------------------- |
| 影響     | シンタックスハイライトやオートコンプリートが動作しない                                                                |
| 対策     | CodeMirror 6はWorkerを使用しないため問題なし。Monacoの場合は`loader.config()`でWorkerをメインスレッド実行に切り替える |
| 検出方法 | Phase 1のプロトタイプでsandboxモードでの動作確認                                                                      |

### 7.3 テスト環境の制約

| リスク   | happy-dom環境でエディターコンポーネントの内部DOMを操作できない（P39）                                                              |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 影響     | テストがSymbol操作エラーで失敗する                                                                                                 |
| 対策     | エディターライブラリをモジュールレベルでモックし、Props伝播とコールバック呼び出しのみを検証する。`fireEvent`ベースでテスト実装する |
| 検出方法 | Phase 4のテスト作成時に確認                                                                                                        |

### 7.4 既存テストの全面書き換え

| リスク   | textarea→エディターコンポーネント置換で既存テストの大半が壊れる                                                                                                     |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 影響     | テスト修正に大きな工数がかかる                                                                                                                                      |
| 対策     | エディターライブラリのモックを作成し、既存テストのアサーションパターンを維持する。`screen.getByRole('textbox')`等のクエリが変わるため、テストヘルパーを先に整備する |
| 検出方法 | Phase 4で既存テストの影響範囲を事前調査                                                                                                                             |

### 7.5 パフォーマンス劣化

| リスク   | 大ファイル（1MB超）でのエディター初期化遅延                                                                                                   |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 影響     | ファイル選択時にUIがフリーズする                                                                                                              |
| 対策     | 遅延読み込み（Dynamic Import）でエディターコンポーネントを非同期ロード。ローディングインジケーターを表示する。1MB超のファイルは警告を表示する |
| 検出方法 | Phase 4のパフォーマンステストで検証                                                                                                           |

### 7.6 テスト実行ディレクトリ依存（P40）

| リスク   | モノレポルートからテスト実行するとhappy-dom設定が適用されない                                 |
| -------- | --------------------------------------------------------------------------------------------- |
| 影響     | `document is not defined`エラーで全テスト失敗                                                 |
| 対策     | `cd apps/desktop && pnpm vitest run`または`pnpm --filter @repo/desktop exec vitest run`で実行 |
| 検出方法 | CI設定で実行ディレクトリを確認                                                                |

---

## 8. 参照情報

### 8.1 システム仕様書

| ドキュメント             | パス                                                                                        | 利用目的                      |
| ------------------------ | ------------------------------------------------------------------------------------------- | ----------------------------- |
| UI機能コンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillEditorコンポーネント仕様 |
| 実装パターン             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | textareaパターン・WCEパターン |
| テストパターン           | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | コンポーネントテスト戦略      |
| UI設計原則               | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | Apple HIG準拠                 |
| デザインシステム         | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | カラー・フォント仕様          |
| セキュリティ原則         | `.claude/skills/aiworkflow-requirements/references/security-principles.md`                  | Electron sandboxモード設定    |

### 8.2 既知の落とし穴（関連Pitfalls）

| Pitfall | タイトル                           | 本タスクへの影響                                                |
| ------- | ---------------------------------- | --------------------------------------------------------------- |
| P8      | 幽霊依存                           | エディターライブラリを`apps/desktop/package.json`に明示宣言する |
| P11     | PostToolUse フックによる Edit 失敗 | 大量編集後は`git diff --stat`で変更数を検証                     |
| P39     | happy-dom環境でのuserEvent非互換   | テストは`fireEvent`ベースで実装する                             |
| P40     | テスト実行ディレクトリ依存         | `cd apps/desktop && pnpm vitest run`で実行する                  |

### 8.3 外部リソース

| リソース                      | URL                                          | 用途                          |
| ----------------------------- | -------------------------------------------- | ----------------------------- |
| CodeMirror 6 公式ドキュメント | https://codemirror.net/docs/                 | CodeMirror 6のAPI・拡張ガイド |
| Monaco Editor 公式            | https://microsoft.github.io/monaco-editor/   | Monaco EditorのAPI・設定      |
| @uiw/react-codemirror         | https://uiwjs.github.io/react-codemirror/    | React統合コンポーネント       |
| @monaco-editor/react          | https://github.com/suren-atoyan/monaco-react | MonacoのReact統合             |

### 8.4 関連タスク

| タスクID            | 名称                             | 関係     |
| ------------------- | -------------------------------- | -------- |
| TASK-9A-C           | SkillEditor UIコンポーネント実装 | 前提     |
| TASK-9A-C-001       | シンタックスハイライト対応       | 代替対応 |
| TASK-9A-C-002       | ファイル作成・削除機能           | 並行可能 |
| TASK-WCE-MONACO-001 | WCEパターン最適化                | 参考知見 |

---

## 9. 備考

### 9.1 TASK-9A-C-001（シンタックスハイライト対応）との関係

本タスク（TASK-9A-C-003）は、TASK-9A-C-001のoverlayパターン（prism-react-renderer）の**上位互換**として位置づけられる。以下の選択が可能:

- **パターンA**: TASK-9A-C-001を先に実施し、その後TASK-9A-C-003で本格移行する（段階的アプローチ）
- **パターンB**: TASK-9A-C-001をスキップし、直接TASK-9A-C-003を実施する（一括移行アプローチ）

パターンBはoverlayパターンの技術的負債を回避できるが、実装規模が大きい。パターンAはリスクが低いが、overlayパターンのコードが最終的に破棄される無駄が発生する。プロジェクトのスケジュールとリスク許容度に応じて選択する。

### 9.2 将来の拡張パス

本タスク完了後、以下の拡張が可能になる:

1. **インテリセンス / オートコンプリート**: Language Server Protocol（LSP）との統合
2. **diff表示**: ファイルの変更差分を視覚的に表示
3. **マルチカーソル編集**: 複数箇所の同時編集
4. **コードスニペット**: よく使うパターンのテンプレート挿入
5. **ダークモードテーマ**: システムテーマに連動したエディターテーマ切り替え

### 9.3 実装者への注意

- SkillCodeEditorPropsインターフェースは**絶対に変更しない**。SkillEditorとの統合が壊れる
- エディターライブラリの遅延読み込み（Dynamic Import）を使用し、アプリ起動時間への影響を最小化する
- テストではエディターライブラリをモックし、内部DOM操作のテストは行わない（P39対策）
- `pnpm --filter @repo/desktop add`でパッケージを追加する（P8: 幽霊依存の防止）
- テスト実行は`cd apps/desktop && pnpm vitest run`で行う（P40対策）
