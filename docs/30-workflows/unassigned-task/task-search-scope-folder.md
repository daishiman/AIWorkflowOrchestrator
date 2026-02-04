# 検索スコープ指定機能 - タスク指示書

## メタ情報

```yaml
issue_number: 702
```

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| タスクID     | task-search-scope-folder-001       |
| タスク名     | 検索スコープ指定機能               |
| 分類         | 機能追加                           |
| 対象機能     | search-replace-ui                  |
| 優先度       | 中                                 |
| 見積もり規模 | 中規模                             |
| ステータス   | 未実施                             |
| 発見元       | Phase 12（task-imp-search-ui-001） |
| 発見日       | 2026-02-04                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

task-imp-search-ui-001で実装した検索機能は、ワークスペース全体を検索対象としている。
大規模プロジェクトでは特定のフォルダのみを検索したい場面が多い。

### 1.2 問題点・課題

- 現状はワークスペース全体が検索対象で、絞り込みができない
- node_modules等の不要なフォルダも検索対象に含まれる可能性
- 大規模プロジェクトで検索パフォーマンスが低下する

### 1.3 放置した場合の影響

- 検索速度の低下（不要なファイルも検索）
- ノイズの増加（関係ないファイルがヒット）
- ユーザビリティの低下

---

## 2. 何を達成するか（What）

### 2.1 目的

検索時にフォルダ単位でスコープを指定できる機能を提供する。

### 2.2 最終ゴール

- WorkspaceSearchModalに「検索フォルダ」入力欄を追加
- フォルダ選択ダイアログからの選択をサポート
- 複数フォルダの指定をサポート
- 除外パターン（.gitignore形式）のサポート

### 2.3 スコープ

#### 含むもの

- フォルダ指定UI
- フォルダ選択ダイアログ連携
- 複数フォルダ指定
- 除外パターン（includeFiles/excludeFiles）

#### 含まないもの

- プリセット保存（別タスク）
- 検索履歴機能（別タスク）
- ワイルドカード以外のパターンマッチ

### 2.4 成果物

| 成果物                  | 説明                                |
| ----------------------- | ----------------------------------- |
| SearchScopeSelector.tsx | スコープ選択コンポーネント          |
| searchService拡張       | スコープ対応のSearchServiceメソッド |
| E2Eテスト               | スコープ指定のE2Eテストスイート     |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- task-imp-search-ui-001が完了していること
- SearchService、WorkspaceSearchModalが実装済みであること

### 3.2 依存タスク

| タスクID               | 状態 |
| ---------------------- | ---- |
| task-imp-search-ui-001 | 完了 |

### 3.3 必要な知識

- React/TypeScript
- Electron dialog API（フォルダ選択）
- glob/minimatch（除外パターン）

### 3.4 推奨アプローチ

1. SearchServiceの`search()`にオプションパラメータ`scope`を追加
2. scopeには`includePaths`と`excludePatterns`を含める
3. RendererでSearchScopeSelectorコンポーネントを作成
4. Electron dialogでフォルダ選択をサポート

### 3.5 実装課題と解決策（task-imp-search-ui-001からの学び）

| 課題ID | 課題                             | 解決策                                                                                           |
| ------ | -------------------------------- | ------------------------------------------------------------------------------------------------ |
| MR-01  | 既存実装の品質評価               | Phase 5でギャップ分析を実施し、既存SearchServiceのAPIを確認してから設計開始                      |
| MR-02  | Phase 12 Task 2 Step 1-A更新漏れ | spec-update-workflow.mdのチェックリストを完了前に必ず確認（LOGS.md×2、SKILL.md×2、topic-map.md） |
| MR-03  | generate-index.jsファイル名      | `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`（`.mjs`ではない）        |
| MR-04  | E2Eテスト設計                    | Page Objectパターンを使用し、SearchPanelPage.tsを拡張                                            |

### 3.6 システム仕様書参照テーブル

| 観点     | 参照先                       | 確認内容                      |
| -------- | ---------------------------- | ----------------------------- |
| UI/UX    | ui-ux-search-panel.md        | 検索UIの既存仕様              |
| IPC通信  | architecture-electron.md     | dialog API呼び出しパターン    |
| 入力検証 | security-input-validation.md | パス入力のバリデーション      |
| パターン | patterns.md                  | E2Eテスト Page Objectパターン |

---

## 4. 実行手順

### Phase構成

| Phase | 名称                   |
| ----- | ---------------------- |
| 1     | 要件定義               |
| 2     | 設計                   |
| 3     | 設計レビューゲート     |
| 4     | テスト作成             |
| 5     | 実装                   |
| 6-12  | 品質保証・ドキュメント |

### Phase 1: 要件定義

#### 目的

検索スコープ指定の詳細要件を定義する。

#### 手順

1. 既存SearchServiceのAPI調査
2. ユーザーフロー図の作成
3. 要件定義書の作成

#### 成果物

- `outputs/phase-1/requirements-definition.md`

#### 完了条件

- 要件定義書がレビュー可能な状態であること

### Phase 2: 設計

#### 目的

SearchScopeSelectorコンポーネントとSearchService拡張の設計を行う。

#### 手順

1. コンポーネント設計
2. SearchServiceインターフェース拡張設計
3. データフロー設計

#### 成果物

- `outputs/phase-2/component-design.md`
- `outputs/phase-2/api-design.md`

#### 完了条件

- 設計書がレビュー可能な状態であること

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] フォルダ指定UIが表示される
- [ ] フォルダ選択ダイアログが動作する
- [ ] 複数フォルダを指定できる
- [ ] 除外パターンを指定できる

### 品質要件

- [ ] E2Eテストが作成され、全件PASSしている
- [ ] パフォーマンステスト完了（1000ファイル以上）

### ドキュメント要件

- [ ] 実装ガイド（Part 1/Part 2）が作成されている
- [ ] システム仕様書が更新されている

---

## 6. 検証方法

### テストケース

| ID    | テストケース               | 期待結果                                     |
| ----- | -------------------------- | -------------------------------------------- |
| TC-01 | 単一フォルダを指定して検索 | 指定フォルダ内のみ検索される                 |
| TC-02 | 複数フォルダを指定して検索 | 複数フォルダ内が検索される                   |
| TC-03 | 除外パターンを指定         | 除外パターンに一致するファイルは検索されない |
| TC-04 | フォルダ選択ダイアログ     | ダイアログからフォルダを選択できる           |

### 検証手順

1. E2Eテストスイートを実行
2. 手動テストでUX確認
3. パフォーマンステスト

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                             |
| ------------------------ | ------ | -------- | -------------------------------- |
| 無効なパス指定           | 中     | 中       | パス存在チェックの実装           |
| 除外パターン構文エラー   | 低     | 中       | バリデーションとエラーメッセージ |
| シンボリックリンクの循環 | 中     | 低       | 最大深度制限の設定               |

---

## 8. 参照情報

### 関連ドキュメント

- [検索パネルUI仕様](/.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md)
- [入力検証](/.claude/skills/aiworkflow-requirements/references/security-input-validation.md)
- [実装パターン集](/.claude/skills/task-specification-creator/references/patterns.md)

### 参考資料

- VS Code Search Configuration: https://code.visualstudio.com/docs/editor/codebasics#_advanced-search-options
- minimatch documentation: https://github.com/isaacs/minimatch

---

## 9. 備考

### 発見元の記録

Phase 12（task-imp-search-ui-001）の未タスク検出で「将来的な拡張候補」として記録。
優先度「中」のため、正式な未タスク仕様書として登録。

### 補足事項

- .gitignore形式の除外パターンは、minimatchライブラリで実装可能
- SearchServiceの既存インターフェースを拡張する形が最も影響範囲が小さい
