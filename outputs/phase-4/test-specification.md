# Phase 4: テスト仕様書 - Custom Execution Environment UI

## タスク情報

- **タスクID**: AGENT-006
- **タスク名**: Custom Execution Environment UI
- **フェーズ**: Phase 4 - テスト作成（Red）
- **作成日**: 2026-01-13
- **ステータス**: 完了

## テスト概要

TDD（テスト駆動開発）の「Red」フェーズとして、実装前にテストを作成する。
テストフレームワーク: Vitest + @testing-library/react

## テストファイル構成

```
apps/desktop/src/renderer/
├── store/slices/__tests__/
│   └── agentSlice.preview.test.ts       # 状態管理テスト
├── utils/__tests__/
│   └── sanitize.test.ts                 # サニタイズユーティリティテスト
├── components/
│   ├── organisms/
│   │   ├── SplitLayout/__tests__/
│   │   │   └── index.test.tsx           # 分割レイアウトテスト
│   │   ├── ExecutionEnvironment/__tests__/
│   │   │   └── index.test.tsx           # 環境コンテナテスト
│   │   ├── HTMLPreviewEnvironment/__tests__/
│   │   │   └── index.test.tsx           # HTMLプレビューテスト
│   │   └── MarkdownPreviewEnvironment/__tests__/
│   │       └── index.test.tsx           # Markdownプレビューテスト
│   └── molecules/
│       └── EnvironmentSelector/__tests__/
│           └── index.test.tsx           # 環境セレクターテスト
└── security/__tests__/
    ├── iframe-sandbox.test.tsx          # iframe sandbox テスト
    └── csp.test.tsx                     # CSP テスト
```

## テストケース一覧

### 1. agentSlice.preview.test.ts

#### 状態管理テスト

| ID     | テストケース                          | 期待結果                        |
| ------ | ------------------------------------- | ------------------------------- |
| AS-001 | 初期状態でpreviewContentがnull        | previewContent === null         |
| AS-002 | 初期状態でselectedEnvironmentが'none' | selectedEnvironment === 'none'  |
| AS-003 | 初期状態でsplitRatioが50              | splitRatio === 50               |
| AS-004 | setPreviewContentでコンテンツ設定     | previewContentが更新される      |
| AS-005 | setSelectedEnvironmentで環境変更      | selectedEnvironmentが更新される |
| AS-006 | setSplitRatioで比率変更               | splitRatioが更新される          |
| AS-007 | clearPreviewでコンテンツクリア        | previewContentがnullになる      |

---

### 2. sanitize.test.ts

#### サニタイズテスト

| ID      | テストケース                         | 期待結果                  |
| ------- | ------------------------------------ | ------------------------- |
| SAN-001 | scriptタグを除去                     | `<script>`が除去される    |
| SAN-002 | onclickを除去                        | onclick属性が除去される   |
| SAN-003 | onerrorを除去                        | onerror属性が除去される   |
| SAN-004 | javascript: URLを除去                | hrefがサニタイズされる    |
| SAN-005 | iframeタグを除去                     | `<iframe>`が除去される    |
| SAN-006 | formタグを除去                       | `<form>`が除去される      |
| SAN-007 | 安全なHTMLは保持                     | `<p>`, `<div>`等は残る    |
| SAN-008 | buildCSPMetaTagが正しいCSPを生成     | script-src 'none'を含む   |
| SAN-009 | filterSandboxFlagsが危険フラグを除去 | allow-scriptsが除去される |

---

### 3. SplitLayout/index.test.tsx

#### レンダリングテスト

| ID     | テストケース                         | 期待結果                 |
| ------ | ------------------------------------ | ------------------------ |
| SL-001 | 左パネルがレンダリングされる         | leftPanel contentが表示  |
| SL-002 | 右パネルがレンダリングされる         | rightPanel contentが表示 |
| SL-003 | ディバイダーがレンダリングされる     | dividerが存在            |
| SL-004 | showRightPanel=falseで右パネル非表示 | rightPanelが非表示       |
| SL-005 | initialRatioが適用される             | 指定した比率で表示       |

#### ドラッグテスト

| ID     | テストケース               | 期待結果         |
| ------ | -------------------------- | ---------------- |
| SL-006 | ドラッグで比率が変更される | ratio変更        |
| SL-007 | minRatio未満にならない     | 最小値でクランプ |
| SL-008 | maxRatioを超えない         | 最大値でクランプ |
| SL-009 | onRatioChangeが呼ばれる    | コールバック実行 |

#### キーボードテスト

| ID     | テストケース         | 期待結果         |
| ------ | -------------------- | ---------------- |
| SL-010 | ArrowRightで比率増加 | ratio += 5       |
| SL-011 | ArrowLeftで比率減少  | ratio -= 5       |
| SL-012 | Homeで最小比率       | ratio = minRatio |
| SL-013 | Endで最大比率        | ratio = maxRatio |

#### アクセシビリティテスト

| ID     | テストケース            | 期待結果     |
| ------ | ----------------------- | ------------ |
| SL-014 | role="separator"が設定  | role属性存在 |
| SL-015 | aria-valuenowが設定     | 現在値が設定 |
| SL-016 | aria-valuemin/maxが設定 | 範囲が設定   |
| SL-017 | aria-labelが設定        | ラベルが設定 |

---

### 4. EnvironmentSelector/index.test.tsx

#### レンダリングテスト

| ID     | テストケース                     | 期待結果                     |
| ------ | -------------------------------- | ---------------------------- |
| ES-001 | セレクトボックスがレンダリング   | select要素存在               |
| ES-002 | 現在の環境が選択状態             | value === currentEnvironment |
| ES-003 | 利用可能な環境がオプションに表示 | optionが全て存在             |
| ES-004 | disabled時に操作不可             | disabled属性が設定           |

#### イベントテスト

| ID     | テストケース                               | 期待結果         |
| ------ | ------------------------------------------ | ---------------- |
| ES-005 | 環境変更でonEnvironmentChange呼び出し      | コールバック実行 |
| ES-006 | リフレッシュボタンでonRefresh呼び出し      | コールバック実行 |
| ES-007 | フルスクリーンボタンでonFullscreen呼び出し | コールバック実行 |

---

### 5. ExecutionEnvironment/index.test.tsx

#### レンダリングテスト

| ID     | テストケース                                    | 期待結果                       |
| ------ | ----------------------------------------------- | ------------------------------ |
| EE-001 | type='none'でNoPreviewPlaceholder表示           | プレースホルダー表示           |
| EE-002 | type='html'でHTMLPreviewEnvironment表示         | HTMLプレビュー表示             |
| EE-003 | type='markdown'でMarkdownPreviewEnvironment表示 | Markdownプレビュー表示         |
| EE-004 | type='terminal'でTerminalPlaceholder表示        | ターミナルプレースホルダー表示 |
| EE-005 | type='code'でCodePlaceholder表示                | コードプレースホルダー表示     |

---

### 6. HTMLPreviewEnvironment/index.test.tsx

#### レンダリングテスト

| ID     | テストケース                       | 期待結果         |
| ------ | ---------------------------------- | ---------------- |
| HP-001 | iframeがレンダリングされる         | iframe要素存在   |
| HP-002 | srcDocにサニタイズされたHTMLが設定 | 安全なHTML       |
| HP-003 | sandbox属性が設定                  | sandbox存在      |
| HP-004 | onLoadコールバックが呼ばれる       | コールバック実行 |

#### セキュリティテスト

| ID     | テストケース                       | 期待結果        |
| ------ | ---------------------------------- | --------------- |
| HP-005 | scriptタグが除去される             | script非存在    |
| HP-006 | イベントハンドラが除去される       | onclick等非存在 |
| HP-007 | allow-scriptsがsandboxに含まれない | sandbox検証     |

---

### 7. MarkdownPreviewEnvironment/index.test.tsx

#### レンダリングテスト

| ID     | テストケース                     | 期待結果         |
| ------ | -------------------------------- | ---------------- |
| MP-001 | Markdownがレンダリングされる     | HTMLに変換表示   |
| MP-002 | 見出しが正しく変換される         | h1-h6要素存在    |
| MP-003 | リストが正しく変換される         | ul/ol要素存在    |
| MP-004 | コードブロックが正しく変換される | pre/code要素存在 |

#### セキュリティテスト

| ID     | テストケース                          | 期待結果         |
| ------ | ------------------------------------- | ---------------- |
| MP-005 | Markdownに含まれるscriptが除去される  | scriptタグ非存在 |
| MP-006 | Markdownに含まれるonclickが除去される | onclick非存在    |

---

### 8. iframe-sandbox.test.tsx

#### Sandboxテスト

| ID     | テストケース                      | 期待結果                    |
| ------ | --------------------------------- | --------------------------- |
| IS-001 | デフォルトでallow-same-originのみ | sandbox="allow-same-origin" |
| IS-002 | allow-scriptsが含まれない         | allow-scripts非存在         |
| IS-003 | allow-popupsが含まれない          | allow-popups非存在          |
| IS-004 | allow-top-navigationが含まれない  | allow-top-navigation非存在  |
| IS-005 | allow-formsが含まれない           | allow-forms非存在           |
| IS-006 | カスタムフラグがフィルタされる    | 危険フラグ除去              |

---

### 9. csp.test.tsx

#### CSPテスト

| ID      | テストケース                   | 期待結果           |
| ------- | ------------------------------ | ------------------ |
| CSP-001 | script-src 'none'が設定される  | ディレクティブ存在 |
| CSP-002 | connect-src 'none'が設定される | ディレクティブ存在 |
| CSP-003 | form-action 'none'が設定される | ディレクティブ存在 |
| CSP-004 | CSPメタタグが正しい形式        | meta要素形式       |

## テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# 特定ファイルのテスト
npx vitest run src/renderer/utils/__tests__/sanitize.test.ts

# ウォッチモード
npx vitest --watch
```

## 成功基準

- 全てのテストケースが「Red」状態（実装前のため失敗）
- テストコードがTypeScriptで型エラーなし
- テストが要件IDとトレース可能

## 次のフェーズ

Phase 5: 実装（Green）

- テストを通過させるための最小限の実装
- TDDの「Green」フェーズ
