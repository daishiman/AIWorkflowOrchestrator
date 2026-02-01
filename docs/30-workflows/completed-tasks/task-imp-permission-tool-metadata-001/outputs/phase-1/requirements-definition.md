# Phase 1: 要件定義書

## メタ情報

| 項目   | 内容                                  |
| ------ | ------------------------------------- |
| Phase  | 1                                     |
| 機能名 | task-imp-permission-tool-metadata-001 |
| Issue  | #606                                  |
| 作成日 | 2026-01-31                            |

---

## 1. 既存仕様の差分分析

### 1.1 security-skill-execution.md ALLOWED_TOOLS_WHITELIST（11ツール）

| ツール名  | リスクレベル |
| --------- | ------------ |
| Read      | Low          |
| Write     | Medium       |
| Edit      | Medium       |
| Bash      | High         |
| Glob      | Low          |
| Grep      | Low          |
| LS        | Low          |
| Task      | Medium       |
| WebSearch | Low          |
| WebFetch  | Medium       |
| TodoWrite | Low          |

### 1.2 permissionDescriptions.ts（12ツール）

Bash, Read, Write, Edit, Glob, Grep, WebSearch, Task, NotebookEdit, WebFetch, Skill, AskUser

### 1.3 差分分析

| 差分                                               | 詳細                                              |
| -------------------------------------------------- | ------------------------------------------------- |
| ホワイトリストにあるがpermissionDescriptionsにない | `LS`, `TodoWrite`                                 |
| permissionDescriptionsにあるがホワイトリストにない | `NotebookEdit`, `Skill`, `AskUser`                |
| 元タスク仕様書との乖離                             | 元仕様: Bash=Critical → 実際: Bash=High           |
| 元タスク仕様書との乖離                             | 元仕様: Write/Edit=High → 実際: Write/Edit=Medium |

### 1.4 リスクレベル確定方針

**security-skill-execution.mdの実際値に準拠する。** 元タスク仕様書との差異は、UIでのリスクレベル表示がsecurity-skill-execution.mdと乖離すると混乱を招くため、一貫性を重視する。

---

## 2. 確定版ツール一覧とリスクレベル

| ツール名     | security-skill-execution.md | UI表示用リスクレベル | セキュリティ影響テキスト                                 |
| ------------ | --------------------------- | -------------------- | -------------------------------------------------------- |
| Bash         | High                        | High                 | システムコマンドを実行します。任意のコード実行が可能です |
| Read         | Low                         | Low                  | ファイルの内容を読み取ります                             |
| Write        | Medium                      | Medium               | ファイルに新しい内容を書き込みます                       |
| Edit         | Medium                      | Medium               | 既存ファイルの内容を変更します                           |
| Glob         | Low                         | Low                  | ファイルパターンで検索します                             |
| Grep         | Low                         | Low                  | テキスト内容を検索します                                 |
| WebSearch    | Low                         | Low                  | Web検索を実行します                                      |
| Task         | Medium                      | Medium               | サブタスクを実行します                                   |
| NotebookEdit | （未定義）                  | Medium               | Jupyterノートブックを編集します                          |
| WebFetch     | Medium                      | Medium               | Webコンテンツを取得します                                |
| Skill        | （未定義）                  | Medium               | スキルを実行します                                       |
| AskUser      | （未定義）                  | Low                  | ユーザーに確認を行います                                 |

---

## 3. 機能要件（FR）

| FR-ID | 要件                                                                              | 優先度 | 受け入れ基準                                                                           |
| ----- | --------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------- |
| FR-1  | 全対象ツール（12種）にリスクレベル（Low/Medium/High/Critical）が定義されている    | 必須   | toolMetadata.tsに12ツール全てのリスクレベルが定義されていること                        |
| FR-2  | PermissionDialogのツールバッジ横にリスクレベルバッジが表示される                  | 必須   | ツール名の右横にリスクレベルテキストを含むバッジが表示されること                       |
| FR-3  | リスクレベルに応じた色分けが適用される（Low=緑, Medium=黄, High=橙, Critical=赤） | 必須   | 各リスクレベルに対応するTailwind CSSクラスが適用されていること                         |
| FR-4  | 各ツールの1行セキュリティ影響テキストが表示される                                 | 必須   | 人間可読説明文の直下にセキュリティ影響テキストが表示されること                         |
| FR-5  | 未定義ツールに対するデフォルトリスクレベル（Medium）が設定される                  | 必須   | TOOL_METADATAに未登録のツール名を渡した場合、riskLevel='Medium'が返ること              |
| FR-6  | Progressive Disclosureに従い、リスクバッジはコンパクト表示される                  | 必須   | リスクバッジは常時表示（Level 1）、技術的引数詳細は折りたたみ（Level 2、既存仕様通り） |

---

## 4. 非機能要件（NFR）

| NFR-ID | 要件                                                       | 優先度 | 受け入れ基準                                                               |
| ------ | ---------------------------------------------------------- | ------ | -------------------------------------------------------------------------- |
| NFR-1  | テストカバレッジ Lines 95%以上                             | 必須   | `pnpm vitest run --coverage`でtoolMetadata.tsのLine Coverage 95%以上       |
| NFR-2  | WCAG 2.1 AAコントラスト比4.5:1以上（リスクバッジテキスト） | 必須   | 4リスクレベル全てで背景色とテキスト色のコントラスト比が4.5:1以上           |
| NFR-3  | TypeScript strict modeでエラーなし                         | 必須   | `tsc --noEmit`でtoolMetadata.ts関連のエラーが0件                           |
| NFR-4  | スクリーンリーダーでリスクレベルが読み上げられる           | 必須   | aria-label属性に「リスクレベル: {level}」が設定されている                  |
| NFR-5  | リスクバッジ追加によるレンダリング性能劣化なし             | 必須   | 静的データ参照のみで動的計算なし                                           |
| NFR-6  | 色覚多様性対応（色+テキストの2重表現）                     | 推奨   | リスクレベルが色だけでなくテキスト（Low/Medium/High/Critical）でも識別可能 |

---

## 5. 統合テスト連携観点

- permissionDescriptions.tsとtoolMetadata.tsは独立モジュールとして設計し、相互依存を持たない
- PermissionDialogコンポーネントテストはReact Testing Libraryベースで実施
- 既存テストスイート（PermissionDialog.test.tsx, PermissionDialog.readable.test.tsx）との干渉なし

---

## 完了条件チェック

- [x] security-skill-execution.mdとpermissionDescriptions.tsの差分分析が完了している
- [x] 12ツール全てのリスクレベルが確定している
- [x] 機能要件（FR-1〜FR-6）が定義されている
- [x] 非機能要件（NFR-1〜NFR-6）が定義されている
- [x] 各ツールの1行セキュリティ影響テキスト案が作成されている
- [x] リスクレベル定義の確定方針（security-skill-execution.md準拠）が明記されている
- [x] 受け入れ基準が検証可能な形で記述されている
