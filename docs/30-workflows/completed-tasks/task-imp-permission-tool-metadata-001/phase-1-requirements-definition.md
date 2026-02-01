# Phase 1: 要件定義

## メタ情報

| 項目      | 内容                                                  |
| --------- | ----------------------------------------------------- |
| Phase     | 1                                                     |
| Phase名   | 要件定義                                              |
| カテゴリ  | 要件                                                  |
| 機能名    | task-imp-permission-tool-metadata-001                 |
| Issue     | #606                                                  |
| 前提Phase | なし（初回Phase）                                     |
| 次Phase   | Phase 2（設計）                                       |
| 関連仕様  | security-skill-execution.md, ui-ux-agent-execution.md |

---

## 目的

PermissionDialogにツールリスクレベルバッジとセキュリティ影響説明を追加するための機能要件・非機能要件・受け入れ基準を定義する。security-skill-execution.mdとui-ux-agent-execution.mdの仕様差分を分析し、実装スコープを確定する。

---

## 背景

security-skill-execution.mdの`ALLOWED_TOOLS_WHITELIST`テーブルでは各ツールにリスクレベル（Low/Medium/High）が定義されている。一方、PermissionDialog（ui-ux-agent-execution.md）では現在ツール名と人間可読説明文のみを表示しており、セキュリティリスク情報はユーザーに提示されていない。`Bash`（High）と`Read`（Low）の許可判断が同等のUI表現で提示されている状態を改善する。

---

## 実行タスク

### Task 1: 既存仕様の分析と要件抽出

**目的**: security-skill-execution.mdとui-ux-agent-execution.mdの仕様を分析し、リスクレベルデータの正確な定義を確定する。

**手順**:

1. `security-skill-execution.md`の`ALLOWED_TOOLS_WHITELIST`テーブルを読み込み、全11ツールのリスクレベルを抽出する
2. `permissionDescriptions.ts`で定義されている12ツールのリストを抽出する
3. 両リストの差分を特定する：
   - ホワイトリストにあるがpermissionDescriptionsにないツール：`LS`, `TodoWrite`
   - permissionDescriptionsにあるがホワイトリストにないツール：`NotebookEdit`, `Skill`, `AskUser`
4. 元タスク仕様書（task-imp-permission-tool-metadata-001.md）のリスクレベル定義と実際のsecurity-skill-execution.mdの値を比較する：
   - 元仕様書: Bash=Critical, Write/Edit=High
   - security-skill-execution.md実際値: Bash=High, Write=Medium, Edit=Medium
5. リスクレベル定義の最終版を確定する（下記「リスクレベル定義の確定」セクション参照）

**期待される成果物**: リスクレベル定義の確定版（差分分析結果を含む）

### Task 2: 機能要件の定義

**目的**: PermissionDialogに追加する機能を具体的に定義する。

**手順**:

1. 以下の機能要件を定義する：

| FR-ID | 要件                                                                              | 優先度 |
| ----- | --------------------------------------------------------------------------------- | ------ |
| FR-1  | 全対象ツールにリスクレベル（Low/Medium/High/Critical）が定義されている            | 必須   |
| FR-2  | PermissionDialogのツールバッジ横にリスクレベルバッジが表示される                  | 必須   |
| FR-3  | リスクレベルに応じた色分けが適用される（Low=緑, Medium=黄, High=橙, Critical=赤） | 必須   |
| FR-4  | 各ツールの1行セキュリティ影響テキストが表示される                                 | 必須   |
| FR-5  | 未定義ツールに対するデフォルトリスクレベル（Medium）が設定される                  | 必須   |
| FR-6  | Progressive Disclosureに従い、リスクバッジはコンパクト表示される                  | 必須   |

2. 各要件に対して受け入れ基準を記述する

**期待される成果物**: 機能要件定義書（FR一覧）

### Task 3: 非機能要件の定義

**目的**: 品質・セキュリティ・アクセシビリティに関する非機能要件を定義する。

**手順**:

1. 以下の非機能要件を定義する：

| NFR-ID | 要件                                                       | 優先度 |
| ------ | ---------------------------------------------------------- | ------ |
| NFR-1  | テストカバレッジ Lines 95%以上                             | 必須   |
| NFR-2  | WCAG 2.1 AAコントラスト比4.5:1以上（リスクバッジテキスト） | 必須   |
| NFR-3  | TypeScript strict modeでエラーなし                         | 必須   |
| NFR-4  | スクリーンリーダーでリスクレベルが読み上げられる           | 必須   |
| NFR-5  | リスクバッジ追加によるレンダリング性能劣化なし             | 必須   |
| NFR-6  | 色覚多様性対応（色+テキスト+アイコンの3重表現）            | 推奨   |

**期待される成果物**: 非機能要件定義書（NFR一覧）

### Task 4: 対象ツール一覧とリスクレベルの確定

**目的**: 実装対象の全ツールとそのリスクレベルを確定する。

**手順**:

1. `permissionDescriptions.ts`の12ツールを基準に対象ツールリストを作成する
2. `security-skill-execution.md`のホワイトリストの値を基本とし、UI表示用のリスクレベルを確定する
3. ホワイトリストに定義がないツールにはデフォルト値（Medium）を適用する
4. 以下の確定版テーブルを作成する：

| ツール名     | security-skill-execution.md | UI表示用リスクレベル | セキュリティ影響テキスト（案）                           |
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

**期待される成果物**: 確定版ツール一覧テーブル

---

## リスクレベル定義の確定に関する注記

元タスク仕様書（task-imp-permission-tool-metadata-001.md）では`Bash=Critical, Write/Edit=High`と記載されているが、実際の`security-skill-execution.md`のALLOWED_TOOLS_WHITELISTでは`Bash=High, Write=Medium, Edit=Medium`と定義されている。

**推奨方針**: security-skill-execution.mdの実際の値に準拠する。元タスク仕様書との差異はPhase 3の設計レビューで最終確定する。UIでのリスクレベル表示がsecurity-skill-execution.mdと乖離すると混乱を招くため、一貫性を重視する。

---

## システム開発観点チェック

本タスクの性質に基づき、以下の観点を重点的に確認する：

| 観点               | 該当 | 理由                                                  | 参照先                        |
| ------------------ | ---- | ----------------------------------------------------- | ----------------------------- |
| セキュリティ       | ✅   | リスクレベル定義がsecurity-skill-execution.md準拠必須 | `security-skill-execution.md` |
| UI/UX（Apple HIG） | ✅   | PermissionDialogのUI変更、Progressive Disclosure適用  | `ui-ux-*.md`                  |
| アクセシビリティ   | ✅   | WCAG 2.1 AA準拠、aria-label、色覚多様性対応           | `ui-ux-design-principles.md`  |
| エラーハンドリング | ✅   | 未定義ツールへのデフォルト値フォールバック            | `error-handling.md`           |
| アーキテクチャ     | ✅   | 既存permissionDescriptions.tsとの責務分離             | `architecture-*.md`           |
| API設計            | ❌   | API変更なし（Renderer Process内のみ）                 | -                             |
| データ整合性       | ❌   | データベース変更なし                                  | -                             |
| パフォーマンス     | ❌   | 静的データ参照のみで性能影響なし                      | -                             |

---

## Electron層別観点

本タスクはRenderer Process（フロントエンド）のみに影響する。

| 層                         | 影響有無 | 分析内容                                                            |
| -------------------------- | -------- | ------------------------------------------------------------------- |
| フロントエンド（Renderer） | あり     | toolMetadata.ts新規追加、PermissionDialog.tsx修正、Tailwind CSS変更 |
| バックエンド（Main）       | なし     | リスクデータはRenderer側で静的定義するためMain Processに変更なし    |
| IPC通信                    | なし     | 新規IPC通信は不要（リスクデータはRenderer側ハードコード）           |
| Preload                    | なし     | contextBridge経由のAPI追加なし                                      |
| ローカルストレージ         | なし     | SQLite/ファイル操作なし                                             |

---

## 参照資料

| 資料名                     | パス                                                                            |
| -------------------------- | ------------------------------------------------------------------------------- |
| セキュリティ仕様           | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` |
| PermissionDialog UI仕様    | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`    |
| UI/UXデザイン原則          | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`  |
| 元タスク仕様書             | `docs/30-workflows/unassigned-task/task-imp-permission-tool-metadata-001.md`    |
| permissionDescriptions実装 | `apps/desktop/src/renderer/components/skill/permissionDescriptions.ts`          |
| PermissionDialog実装       | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`               |

---

## 統合テスト連携アクション

- permissionDescriptions.tsとtoolMetadata.tsの統合テスト観点を定義する
- PermissionDialog表示テストのテスト戦略を検討する

---

## 成果物

| 成果物名       | パス                                         | 種別     |
| -------------- | -------------------------------------------- | -------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | document |
| スコープ定義書 | `outputs/phase-1/scope-definition.md`        | document |

---

## 完了条件

- [ ] security-skill-execution.mdとpermissionDescriptions.tsの差分分析が完了している
- [ ] 12ツール全てのリスクレベルが確定している
- [ ] 機能要件（FR-1〜FR-6）が定義されている
- [ ] 非機能要件（NFR-1〜NFR-6）が定義されている
- [ ] 各ツールの1行セキュリティ影響テキスト案が作成されている
- [ ] リスクレベル定義の確定方針（security-skill-execution.md準拠）が明記されている
- [ ] 受け入れ基準が検証可能な形で記述されている

---

## 次Phase

Phase 2（設計）: 本Phaseで確定した要件に基づき、toolMetadata.tsモジュール設計とRiskBadgeコンポーネント設計を行う。
