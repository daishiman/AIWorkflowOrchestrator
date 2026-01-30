# 受け入れ基準: SkillImportDialog コンポーネント

## メタ情報

| 項目       | 値                |
| ---------- | ----------------- |
| タスクID   | TASK-7B           |
| 機能名     | SkillImportDialog |
| Phase      | 1 - 要件定義      |
| 作成日     | 2026-01-30        |
| ステータス | 完了              |

## 受け入れ基準一覧

### 機能要件（FR）の受け入れ基準

| 要件ID | 要件概要                            | 受け入れ基準                                                                                                  | 検証方法                 |
| ------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR-01  | isOpen プロパティで開閉制御         | `isOpen=true` でダイアログが表示される。`isOpen=false` のとき、ダイアログはDOMに存在しない（`null` を返す）   | ユニットテスト           |
| FR-02  | スキル名と説明の表示                | `skill.name` と `skill.description` がダイアログ内にテキストとして表示される                                  | ユニットテスト           |
| FR-03  | 許可ツール一覧のタグ表示            | `skill.allowedTools` の各ツール名が `<span>` 要素としてタグ形式で表示される                                   | ユニットテスト           |
| FR-04  | agents/ 一覧表示                    | `skill.agents` の各エントリがファイル名（`filename`）と説明（`description`）付きで一覧表示される              | ユニットテスト           |
| FR-05  | references/ 一覧表示                | `skill.references` の各エントリがファイル名と説明付きで一覧表示される                                         | ユニットテスト           |
| FR-06  | scripts/ 一覧表示                   | `skill.scripts` の各エントリがファイル名と説明付きで一覧表示される                                            | ユニットテスト           |
| FR-07  | assets/ 一覧表示                    | `skill.assets` の各エントリがファイル名と説明付きで一覧表示される                                             | ユニットテスト           |
| FR-08  | schemas/ 一覧表示                   | `skill.schemas` の各エントリがファイル名と説明付きで一覧表示される                                            | ユニットテスト           |
| FR-09  | indexes/ 一覧表示                   | `skill.indexes` の各エントリがファイル名と説明付きで一覧表示される                                            | ユニットテスト           |
| FR-10  | インポートボタンで importSkill 実行 | インポートボタンをクリックすると `importSkill(skill.name)` が呼び出される                                     | ユニットテスト（モック） |
| FR-11  | ローディング状態の表示              | `isImporting=true` かつ `importingSkillName===skill.name` のとき、ボタンテキストが「インポート中...」に変わる | ユニットテスト           |
| FR-12  | キャンセルボタンで閉じる            | キャンセルボタンをクリックすると `onClose` コールバックが呼び出される                                         | ユニットテスト（モック） |
| FR-13  | ESCキーで閉じる                     | ダイアログ表示中に ESC キーを押下すると `onClose` コールバックが呼び出される                                  | ユニットテスト           |
| FR-14  | インポート完了後の自動クローズ      | `importSkill` の Promise が解決した後、`onClose` が自動的に呼び出される                                       | ユニットテスト（モック） |
| FR-15  | 空セクションの非表示                | サブリソース配列の `length === 0` であるセクション（例: agents が空）はDOMにレンダリングされない              | ユニットテスト           |

### 非機能要件（NFR）の受け入れ基準

| 要件ID | 要件概要                     | 受け入れ基準                                                                                                                              | 検証方法              |
| ------ | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| NFR-01 | WAI-ARIA ダイアログロール    | ダイアログのルート要素に `role="dialog"` と `aria-modal="true"` が設定されている                                                          | ユニットテスト        |
| NFR-02 | aria-labelledby 関連付け     | ダイアログのルート要素に `aria-labelledby` 属性があり、タイトル要素の `id` を参照している                                                 | ユニットテスト        |
| NFR-03 | フォーカストラップ           | Tab キー操作でフォーカスがダイアログ内の要素間のみを循環し、ダイアログ外に抜けない                                                        | ユニットテスト        |
| NFR-04 | Tab/Shift+Tab フォーカス移動 | Tab キーで次のフォーカス可能要素へ移動し、Shift+Tab で前の要素へ移動する。最後の要素から Tab で最初の要素に戻る                           | ユニットテスト        |
| NFR-05 | インポート中のボタン無効化   | `isCurrentlyImporting=true` のとき、インポートボタンとキャンセルボタンの両方が `disabled` 属性を持つ                                      | ユニットテスト        |
| NFR-06 | オーバーレイスクロール抑制   | ダイアログ表示中は `document.body` のスクロールが抑制される（`overflow: hidden` 等）                                                      | ユニットテスト        |
| NFR-07 | コンテンツ領域のスクロール   | ダイアログ内のコンテンツ領域に `overflow-y: auto` が設定され、コンテンツが多い場合にスクロール可能である                                  | ユニットテスト / 目視 |
| NFR-08 | TypeScript 型安全性          | コンポーネントのProps、State、イベントハンドラすべてに厳密な型定義があり、`any` 型が使用されていない。`tsc --noEmit` がエラーなく通過する | 型チェック            |

## 詳細テストシナリオ

### FR-01: ダイアログ開閉

```
Given: SkillImportDialog に isOpen=false を渡す
When: コンポーネントがレンダリングされる
Then: ダイアログはDOMに存在しない（container.firstChild === null）

Given: SkillImportDialog に isOpen=true を渡す
When: コンポーネントがレンダリングされる
Then: ダイアログがDOMに存在し、role="dialog" を持つ要素がある
```

### FR-02: スキル名と説明の表示

```
Given: skill.name="test-skill", skill.description="テスト用スキル" で isOpen=true
When: コンポーネントがレンダリングされる
Then: 画面上に "test-skill" と "テスト用スキル" のテキストが表示される
```

### FR-03: 許可ツール一覧

```
Given: skill.allowedTools=["Read", "Write", "Bash"] で isOpen=true
When: コンポーネントがレンダリングされる
Then: "Read", "Write", "Bash" がそれぞれ個別のタグ（span要素）として表示される
```

### FR-04: agents/ 一覧

```
Given: skill.agents=[{filename: "main.md", relativePath: "agents/main.md", description: "メインエージェント", size: 1024}]
When: コンポーネントがレンダリングされる
Then: "main.md" と "メインエージェント" が表示される
```

### FR-10: インポート実行

```
Given: ダイアログが表示されている状態
When: インポートボタンをクリックする
Then: importSkill(skill.name) が1回呼び出される
```

### FR-11: ローディング状態

```
Given: isImporting=true かつ importingSkillName=skill.name
When: コンポーネントがレンダリングされる
Then: インポートボタンのテキストが "インポート中..." になっている
```

### FR-12: キャンセル

```
Given: ダイアログが表示されている状態
When: キャンセルボタンをクリックする
Then: onClose コールバックが1回呼び出される
```

### FR-13: ESCキー

```
Given: ダイアログが表示されている状態
When: Escape キーを押下する
Then: onClose コールバックが1回呼び出される
```

### FR-15: 空セクション非表示

```
Given: skill.agents=[], skill.references=[{...}] で isOpen=true
When: コンポーネントがレンダリングされる
Then: "agents" セクションはDOMに存在せず、"references" セクションは表示される
```

### NFR-01: WAI-ARIA属性

```
Given: isOpen=true でダイアログが表示されている
When: ダイアログのルート要素を取得する
Then: role="dialog" と aria-modal="true" が設定されている
```

### NFR-03: フォーカストラップ

```
Given: ダイアログ内の最後のフォーカス可能要素にフォーカスがある
When: Tab キーを押下する
Then: フォーカスがダイアログ内の最初のフォーカス可能要素に移動する（ダイアログ外には出ない）
```

### NFR-05: ボタン無効化

```
Given: isImporting=true かつ importingSkillName=skill.name
When: コンポーネントがレンダリングされる
Then: インポートボタンとキャンセルボタンの両方が disabled 属性を持つ
```
