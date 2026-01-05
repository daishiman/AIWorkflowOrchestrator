# 検索パネル レンダリング不具合修正 - タスク指示書

## メタ情報

| 項目             | 内容                                        |
| ---------------- | ------------------------------------------- |
| タスクID         | BUG-SEARCH-001                              |
| タスク名         | ファイル内検索パネル レンダリング不具合修正 |
| 分類             | バグ修正                                    |
| 対象機能         | UnifiedSearchPanel, FileSearchPanel         |
| 優先度           | 高                                          |
| 見積もり規模     | 小規模                                      |
| ステータス       | 未実施                                      |
| 発見元           | Phase 8 手動テスト                          |
| 発見日           | 2025-12-15                                  |
| 発見エージェント | ユーザー報告                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

検索/置換機能のUI実装完了後の手動テストにおいて、ファイル内検索パネルの検索窓・置換窓が正しく表示されない問題が発生している。

### 1.2 問題点・課題

1. **ファイル内検索**: ファイルを選択した状態でCmd+Fを押しても検索窓が表示されない
2. **ファイル内置換**: Cmd+Tを押しても検索窓・置換窓が表示されない
3. **デバッグ情報**: UnifiedSearchPanelに追加したデバッグ行（黄色背景）で`currentFilePath`の値を確認する必要あり

### 1.3 放置した場合の影響

- ファイル内検索/置換機能が完全に使用不能
- ユーザー体験の著しい低下
- 検索/置換機能の主要ユースケースが動作しない

---

## 2. 何を達成するか（What）

### 2.1 目的

ファイル内検索/置換パネルの検索窓・置換窓が正しく表示されるように修正する。

### 2.2 最終ゴール

1. ファイル選択状態でCmd+Fを押すと検索窓が表示される
2. ファイル選択状態でCmd+Tを押すと検索窓・置換窓が表示される
3. 検索オプションボタン（Aa, Ab, .\*）が表示される
4. ナビゲーションボタン（↑↓）が表示される

### 2.3 スコープ

#### 含むもの

- FileSearchPanelのレンダリング問題の調査・修正
- UnifiedSearchPanelからFileSearchPanelへのprops伝達の確認
- currentFilePathの状態管理の確認
- CSS/スタイリングの問題確認

#### 含まないもの

- ワークスペース検索の修正（正常動作中）
- ファイル名検索の修正（正常動作中）
- 新機能追加

### 2.4 成果物

| 種別       | 成果物                         | 配置先                                                                              |
| ---------- | ------------------------------ | ----------------------------------------------------------------------------------- |
| 修正コード | FileSearchPanel修正            | `apps/desktop/src/renderer/components/organisms/SearchPanel/FileSearchPanel.tsx`    |
| 修正コード | UnifiedSearchPanel修正         | `apps/desktop/src/renderer/components/organisms/SearchPanel/UnifiedSearchPanel.tsx` |
| 修正コード | EditorView修正（必要に応じて） | `apps/desktop/src/renderer/views/EditorView/index.tsx`                              |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- デスクトップアプリが開発モードで起動できること
- ワークスペースにフォルダが追加されていること
- ファイルが選択可能であること

### 3.2 依存タスク

なし

### 3.3 必要な知識・スキル

- React/TypeScriptの知識
- Electronアプリケーションの構造理解
- React Developer Toolsの使用

### 3.4 推奨アプローチ

#### Step 1: デバッグ情報の確認

1. アプリを起動して検索パネルを開く
2. 黄色いデバッグ行（`DEBUG: mode=xxx, filePath=xxx`）を確認
3. `filePath`の値が`null`か実際のパスかを確認

#### Step 2: 問題の切り分け

- `filePath=null`の場合: EditorViewの`selectedFilePath`状態が更新されていない
- `filePath`がパスを持っている場合: FileSearchPanelのレンダリング問題

#### Step 3: 原因に応じた修正

**Case A: selectedFilePathが更新されない場合**

- EditorViewの`handleFileSelect`関数を確認
- `setSelectedFilePath`が正しく呼ばれているか確認

**Case B: FileSearchPanelがレンダリングされない場合**

- 条件分岐`searchMode === "file" && currentFilePath`を確認
- CSS/スタイルの問題を確認（display: none等）

---

## 4. 実行手順

### Phase 1: 問題調査

#### Claude Code スラッシュコマンド

```
/ai:debug-error "FileSearchPanel not rendering despite currentFilePath"
```

#### 調査ポイント

1. デバッグ行の出力内容を確認
2. React Developer Toolsでコンポーネントツリーを確認
3. コンソールにエラーがないか確認

### Phase 2: 修正実装

#### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/renderer/components/organisms/SearchPanel/UnifiedSearchPanel.tsx
```

### Phase 3: テスト・検証

#### Claude Code スラッシュコマンド

```
/ai:run-all-tests --coverage
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ファイル選択状態でCmd+Fを押すと検索窓が表示される
- [ ] ファイル選択状態でCmd+Tを押すと検索窓・置換窓が表示される
- [ ] 検索オプションボタン（Aa, Ab, .\*）が表示・機能する
- [ ] ナビゲーションボタン（↑↓）が表示・機能する
- [ ] 閉じるボタンが機能する

### 品質要件

- [ ] 全自動テストがパス
- [ ] TypeScriptエラーなし
- [ ] Lintエラーなし

---

## 6. 検証方法

### 検証手順

1. `pnpm --filter @repo/desktop dev` でアプリを起動
2. 左サイドバーでフォルダを追加
3. ファイルをクリックして選択（エディタにファイル内容が表示される）
4. Cmd+F を押す
5. 検索窓が表示されることを確認
6. Cmd+T を押す
7. 検索窓と置換窓が表示されることを確認

---

## 7. リスクと対策

| リスク               | 影響度 | 発生確率 | 対策                              |
| -------------------- | ------ | -------- | --------------------------------- |
| 修正が他の機能に影響 | 中     | 低       | 十分なテストカバレッジを確保      |
| 原因特定が困難       | 中     | 中       | React Developer Toolsでの詳細調査 |

---

## 8. 参照情報

### 関連ファイル

- `apps/desktop/src/renderer/components/organisms/SearchPanel/UnifiedSearchPanel.tsx`
- `apps/desktop/src/renderer/components/organisms/SearchPanel/FileSearchPanel.tsx`
- `apps/desktop/src/renderer/views/EditorView/index.tsx`

### 現在のデバッグ情報

UnifiedSearchPanelにデバッグ行を追加済み（黄色背景で`DEBUG: mode=xxx, filePath=xxx`と表示）。

---

## 9. 備考

### 正常動作中の機能

- ワークスペース検索（Cmd+Shift+F）: 正常
- ファイル名検索（Cmd+P）: 正常
- ワークスペース置換（Cmd+Shift+T）: 正常

### 問題のある機能

- ファイル内検索（Cmd+F）: 検索窓が表示されない
- ファイル内置換（Cmd+T）: 検索窓・置換窓が表示されない
