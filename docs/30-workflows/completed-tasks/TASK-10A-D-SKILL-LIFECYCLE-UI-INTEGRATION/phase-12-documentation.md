# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                                  |
| ---------- | --------------------------------------------------- |
| タスク ID  | TASK-10A-D                                          |
| Phase      | 12                                                  |
| 機能名     | スキルライフサイクルUI統合                          |
| 作成日     | 2026-03-03                                          |
| 状態       | 完了                                                |
| 再確認日   | 2026-03-04                                          |
| 前提Phase  | Phase 11（手動テスト検証 完了）                     |
| 後続Phase  | Phase 13（完了・PR準備）                            |
| 使用スキル | aiworkflow-requirements, task-specification-creator |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 事前チェック【必須】

Phase 12実行前に、以下の既知の落とし穴を確認し、漏れを防止する:

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を読む
   - P1: LOGS.md 2ファイル更新漏れ
   - P2: topic-map.md 再生成忘れ
   - P3: 未タスク管理の3ステップ不完全
   - P4: documentation-changelog への早期「完了」記載
   - P25: LOGS.md 2ファイル更新漏れ（再発）
   - P26: システム仕様書更新遅延
   - P27: topic-map.md 再生成トリガーの判断ミス
   - P28: スキルフィードバックレポート未作成
   - P43: サブエージェントのrate limit中断（3ファイル以下/エージェントに分割）

## 実行タスク

- 技術ドキュメント作成: 実装ガイド（Part 1: 概念的 + Part 2: 技術的）の作成
- コンポーネントドキュメント作成: 統合コンポーネントのAPI仕様
- システムドキュメント更新: aiworkflow-requirements 等の更新
- ドキュメント更新履歴作成: 変更履歴の記録
- 未タスク検出: 残課題の検出と記録
- スキルフィードバックレポート作成: ワークフロー改善点と技術的教訓の記録

## 参照資料

| 資料名               | パス                                                                                    | 説明                               |
| -------------------- | --------------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 11/12ガイド    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`             | 手動テスト・ドキュメント作成ガイド |
| 仕様更新フロー       | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | 仕様更新ワークフロー               |
| 未タスクガイド       | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`    | 未タスク検出・管理                 |
| 技術ドキュメント作成 | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | 実装ガイド作成ガイド               |
| 成果物命名規則       | `.claude/skills/task-specification-creator/references/artifact-naming-conventions.md`   | ファイル命名                       |
| 06-known-pitfalls    | `.claude/rules/06-known-pitfalls.md`                                                    | 既知の落とし穴                     |
| 05-task-execution    | `.claude/rules/05-task-execution.md`                                                    | Phase 12チェックリスト             |
| 設計書               | `phase-2-design.md`                                                                     | 設計仕様                           |
| 実装サマリー         | `outputs/phase-5/implementation-result.md`                                              | 実装サマリー                       |
| テスト拡充結果       | `outputs/phase-6/test-expansion-result.md`                                              | テスト拡充結果                     |
| カバレッジ結果       | `outputs/phase-7/coverage-result.md`                                                    | カバレッジ結果                     |
| リファクタ結果       | `outputs/phase-8/refactoring-result.md`                                                 | 品質改善結果                       |
| 品質検証結果         | `outputs/phase-9/quality-verification-result.md`                                        | 品質検証結果                       |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`                                               | Phase 10成果物                     |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                                                | Phase 11成果物                     |
| 発見課題リスト       | `outputs/phase-11/discovered-issues.md`                                                 | Phase 11成果物                     |

## aiworkflow-requirements 必須仕様の抽出（resource-map起点）

`indexes/resource-map.md` の「UI実装」「状態管理」「API設計」「テスト実装」「コンポーネントテスト」「アクセシビリティテスト」「タスクワークフロー」導線を起点にし、`search-spec.js` で `SkillAnalysisView` / `SkillCreateWizard` / `agentSlice` / `skill:create` を追加検索して対象仕様を確定する。

### 抽出結果（必須/条件付き）

| 区分                      | 参照先仕様書                                                                                | resource-map 抽出根拠    | 判定     | Task 2 での扱い                                          |
| ------------------------- | ------------------------------------------------------------------------------------------- | ------------------------ | -------- | -------------------------------------------------------- |
| UI/UX 必須                | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | UI実装: 最初に読む       | 必須     | Step 1-A/1-B で更新                                      |
| UI機能 必須               | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | UI実装: ui-ux-\* 関連    | 必須     | Step 1-A/1-C で更新                                      |
| UIデザイン 条件           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | UI実装: 最初に読む       | 条件付き | デザイントークン変更時のみ更新、変更なしなら確認ログ記録 |
| UI原則 必須               | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | UI実装: HIG/WCAG 原則    | 必須     | Apple HIG / WCAG 観点を Step 1-A に反映                  |
| アーキ必須                | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   | UIコンポーネント設計     | 必須     | Step 2 で更新                                            |
| 状態管理必須              | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | 状態管理設計             | 必須     | Step 2 で更新（agentSlice拡張）                          |
| 実装パターン必須          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン導線         | 必須     | P31/P42/P39 の適用証跡を同期                             |
| 全体整合必須              | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | アーキテクチャ全体像     | 必須     | Renderer/Main/IPC 境界の整合確認を記録                   |
| インターフェース必須      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | スキル管理UI実装         | 必須     | Step 2 で契約整合を更新                                  |
| IPC契約 条件              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | API設計                  | 条件付き | IPCチャネル変更時のみ更新、今回は no-change 判定を記録   |
| IPC命名 条件              | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | API設計: 命名規則        | 条件付き | 新規チャネル追加時のみ更新、今回は no-change 判定を記録  |
| セキュリティ 条件         | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | スキルIPCセキュリティ    | 条件付き | sender検証/入力検証の適合確認を記録                      |
| セキュリティ 条件         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | Electron IPCセキュリティ | 条件付き | IPC追加がないため no-change 判定を記録                   |
| Preload セキュリティ 条件 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | API/IPC セキュリティ     | 条件付き | preload 公開面の変更有無を確認し判定を記録               |
| テスト必須                | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | コンポーネントテスト     | 必須     | Step 1-A のテスト証跡へ反映                              |
| アクセシビリティ必須      | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                | アクセシビリティテスト   | 必須     | Phase 11 結果の根拠として反映                            |
| 品質必須                  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | テスト実装/品質基準      | 必須     | Step 1-A の完了記録へ反映                                |
| ワークフロー必須          | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | タスクワークフロー確認   | 必須     | Step 1-C の台帳同期に使用                                |
| フェーズ規約必須          | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`                 | Phase詳細確認            | 必須     | Step 1-C の基準参照                                      |
| 品質ゲート規約必須        | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                  | 品質ゲート導線           | 必須     | Step 1-C の判定基準同期に使用                            |

### 抽出漏れ防止トレース（実装変更ファイル × 仕様）

| 実装変更ファイル             | 必須参照仕様                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `SkillManagementPanel.tsx`   | `ui-ux-components.md`, `ui-ux-feature-components.md`, `arch-ui-components.md`, `ui-ux-design-principles.md`                     |
| `ChatPanel.tsx`              | `ui-ux-components.md`, `ui-ux-feature-components.md`, `arch-ui-components.md`, `quality-requirements.md`                        |
| `store/slices/agentSlice.ts` | `arch-state-management.md`, `interfaces-agent-sdk-skill.md`, `architecture-implementation-patterns.md`, `security-skill-ipc.md` |
| `store/index.ts`             | `arch-state-management.md`, `interfaces-agent-sdk-skill.md`                                                                     |
| テスト4ファイル              | `testing-component-patterns.md`, `testing-accessibility.md`, `quality-requirements.md`                                          |

### 除外した仕様と根拠（明示）

| 仕様書                                 | 除外根拠                                   |
| -------------------------------------- | ------------------------------------------ |
| `database-*.md`                        | DBスキーマ/SQL変更が今回の実装に含まれない |
| `api-ipc-auth.md`, `api-ipc-system.md` | 認証/システムIPCチャネルの追加変更がない   |
| `deployment-*.md`                      | 配布設定・CI設定変更がない                 |
| `interfaces-rag-*.md`                  | RAG関連の機能追加がない                    |

### 仕様書単位 SubAgent 分担（1仕様書=1担当）

| SubAgent      | 担当仕様書（単一責務）                    | 関心ごと         | 実施内容                                      | 完了条件        |
| ------------- | ----------------------------------------- | ---------------- | --------------------------------------------- | --------------- |
| SG-UI-01      | `ui-ux-components.md`                     | UI全体仕様       | 完了タスク記録と成果物リンク更新              | Step 1-A 完了   |
| SG-UI-02      | `ui-ux-feature-components.md`             | 機能別UI仕様     | Skillライフサイクル統合セクション更新         | Step 1-A 完了   |
| SG-UI-03      | `ui-ux-design-system.md`                  | デザイントークン | 変更有無を判定し no-change/更新を明記         | Step 2 判定完了 |
| SG-UI-04      | `ui-ux-design-principles.md`              | HIG/WCAG原則     | 手動テスト観点と設計原則の整合を同期          | Step 1-A 完了   |
| SG-ARCH-01    | `arch-ui-components.md`                   | UIアーキ構造     | コンポーネント統合差分を更新                  | Step 2 完了     |
| SG-ARCH-02    | `arch-state-management.md`                | Zustand設計      | agentSlice 拡張状態とセレクタ方針を更新       | Step 2 完了     |
| SG-ARCH-03    | `architecture-implementation-patterns.md` | 実装パターン     | P31/P39/P42 適用の追記                        | Step 2 完了     |
| SG-ARCH-04    | `architecture-overview.md`                | 層境界整合       | Renderer/Main/IPC の影響範囲を同期            | Step 2 完了     |
| SG-IF-01      | `interfaces-agent-sdk-skill.md`           | 型/契約整合      | analyze/apply/autoImprove/create の型契約追記 | Step 2 完了     |
| SG-API-01     | `api-ipc-agent.md`                        | IPC API契約      | 契約変更の有無を検証し記録                    | Step 2 判定完了 |
| SG-API-02     | `api-endpoints.md`                        | IPC命名規則      | チャネル命名の差分有無を確認                  | Step 2 判定完了 |
| SG-SEC-01     | `security-skill-ipc.md`                   | スキルIPC防御    | 入力検証と権限境界の適合確認を記録            | Step 2 判定完了 |
| SG-SEC-02     | `security-electron-ipc.md`                | Electron IPC防御 | sender検証・公開API最小化の適合確認を記録     | Step 2 判定完了 |
| SG-SEC-03     | `security-api-electron.md`                | Preload API防御  | contextIsolation/公開面の整合確認を記録       | Step 2 判定完了 |
| SG-TEST-01    | `testing-component-patterns.md`           | テスト品質       | テストパターン準拠を更新                      | Step 1-A 完了   |
| SG-TEST-02    | `testing-accessibility.md`                | a11yテスト品質   | Phase 11 検証観点を同期                       | Step 1-A 完了   |
| SG-QUALITY-01 | `quality-requirements.md`                 | 品質基準         | カバレッジ/品質ゲートの結果を同期             | Step 1-A 完了   |
| SG-WF-01      | `task-workflow.md`                        | 実装台帳         | TASK-10A-D 完了記録と残課題同期               | Step 1-C 完了   |
| SG-WF-02      | `task-workflow-phases.md`                 | Phase規約        | Phase 1-13 成果物整合を確認                   | Step 1-C 完了   |
| SG-WF-03      | `task-workflow-rules.md`                  | 品質ゲート規約   | 判定基準と戻し条件の同期                      | Step 1-C 完了   |

---

## サブフェーズ

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

#### Part 1: 概念的説明（中学生レベル）

日常の例えを使ってスキルライフサイクルUI統合の概念を説明する:

- **例え**: 「テーマパークの案内所みたいなもの。チャット画面（メインゲート）からスキル管理（案内所）に行ける。案内所では、持っているチケット（スキル）を一覧で見たり、チケットの中身を詳しく調べたり（分析）、新しいチケットを発行したり（作成）できる」
- **分析**: 「スキルの健康診断。お医者さんが体の状態をスコアで教えてくれるように、スキルの品質をスコア（0-100点）で表示して、改善ポイントを教えてくれる」
- **改善提案の適用**: 「お医者さんが出した処方箋を実行するボタン。ワンクリックでスキルの品質が改善される」
- **作成ウィザード**: 「料理のレシピを4ステップで作るイメージ。①何を作るか決める（Describe）→ ②材料と調味料を選ぶ（Configure）→ ③調理する（Generate）→ ④完成！（Complete）」
- **ビュー切替**: 「案内所の中にある3つの窓口。一覧窓口（list）、分析窓口（analysis）、作成窓口（create）を行き来できる」

#### Part 2: 開発者向け技術詳細

- コンポーネント統合構成（SkillManagementPanel のビュー切替ロジック: list/analysis/create）
- agentSlice 拡張（analyze, applyImprovements, autoImprove, create アクション）
- 個別セレクタ設計（P31対策: `useAnalyzeSkill()`, `useApplySkillImprovements()`, `useAutoImproveSkill()`, `useCreateSkill()` の Zustand 安定参照パターン）
- ChatPanel 統合（スキル管理パネルへのアクセスルート、状態遷移図）
- SkillAnalysisView 統合（分析結果の表示、改善提案の適用フロー）
- SkillCreateWizard 統合（4ステップウィザードの状態管理、完了後のリスト更新）
- IPC連携（skill:analyze, skill:improve, skill:create 等のチャネル利用）
- テスト設計（P31/P39/P40 対策込み、fireEvent 使用パターン）

#### コンポーネントドキュメント

`component-documentation.md` として以下を記載:

| コンポーネント       | Props インターフェース                       | 主要動作                                           |
| -------------------- | -------------------------------------------- | -------------------------------------------------- |
| SkillManagementPanel | なし（ルートパネル、内部でビュー状態管理）   | ビュー切替（list/analysis/create）、スキル選択管理 |
| SkillAnalysisView    | skillName, onBack, onApplyImprovements       | 分析実行、スコア表示、改善提案の適用               |
| SkillCreateWizard    | onComplete, onCancel                         | 4ステップウィザード、スキル生成                    |
| ChatPanel            | （既存Props + スキル管理パネルアクセス追加） | スキル管理パネルへの遷移                           |

**成果物**:

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/component-documentation.md`

---

### Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照
> **P43対策**: 仕様書更新は3ファイル以下/エージェントに分割する

#### Step 1-A: タスク完了記録【必須・全タスク】

- [ ] `ui-ux-components.md` に「完了タスク」セクションを追加
  - SkillManagementPanel のビュー統合（SkillAnalysisView、SkillCreateWizard）
  - agentSlice 拡張内容のサマリー
  - テスト結果サマリー、成果物テーブル
- [ ] `ui-ux-feature-components.md` にスキルライフサイクル統合機能セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] **aiworkflow-requirements/LOGS.md** にタスク完了エントリを追加
- [ ] **task-specification-creator/LOGS.md** にタスク完了記録を追加（**2ファイル両方必須** — P1, P25対策）
- [ ] **aiworkflow-requirements/SKILL.md** 変更履歴テーブルを更新（P29対策）
- [ ] **task-specification-creator/SKILL.md** 変更履歴テーブルを更新（P29対策）

##### LOGS.md 更新フォーマット

**aiworkflow-requirements/LOGS.md**:

```markdown
## YYYY-MM-DD（実行日）: スキルライフサイクルUI統合（TASK-10A-D）

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| タスクID     | TASK-10A-D                                                                  |
| 操作         | update-spec                                                                 |
| 対象ファイル | ui-ux-components.md, ui-ux-feature-components.md, arch-state-management.md  |
| 結果         | success                                                                     |
| 備考         | スキルライフサイクルUI統合（SkillAnalysisView/SkillCreateWizard/ChatPanel） |

### 更新詳細

- **更新**: `references/ui-ux-components.md`
  - SkillManagementPanel ビュー統合セクション追加
  - SkillAnalysisView/SkillCreateWizard 統合記録
- **更新**: `references/arch-state-management.md`
  - agentSlice拡張（analyze/applyImprovements/autoImprove/create）記録
```

**task-specification-creator/LOGS.md**:

```markdown
## YYYY-MM-DD（実行日） - スキルライフサイクルUI統合（TASK-10A-D）タスク完了

### コンテキスト

- スキル: task-specification-creator
- タスクID: TASK-10A-D
- タスク名: スキルライフサイクルUI統合
- Phase: 1-13

### 成果

- テストカバレッジ: （実行時に記録）テスト全件PASS
- 実装内容:
  - SkillManagementPanel のプレースホルダーを実コンポーネント（SkillAnalysisView/SkillCreateWizard）に差替
  - agentSlice に analyze, applyImprovements, autoImprove, create アクション追加
  - 個別セレクタ追加（P31対策）
  - ChatPanel にスキル管理パネルアクセス追加

### 結果

- ステータス: success
- 完了日時: YYYY-MM-DD（実行日）
```

#### Step 1-B: 実装状況テーブル更新（該当する場合）

- [ ] `ui-ux-components.md` の実装状況テーブルに SkillManagementPanel の統合状態を「完了」として更新
- [ ] 更新対象として列挙した仕様書が実在することを `test -f <path>` で確認

#### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "TASK-10A-D" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索
- [ ] `grep -rn "TASK-10A-D" .claude/skills/task-specification-creator/references/` で関連仕様書を検索
- [ ] 該当タスクのステータスを「**完了**」に更新
- [ ] `task-workflow.md` のTASK-10A-Dステータス更新

#### Step 1-D: topic-map.md 再生成（**仕様書に変更があれば必ず実行** — P2, P27対策）

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して topic-map.md を再生成
- [ ] `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION --regenerate` を実行
- [ ] 再生成されたtopic-map.mdに新規セクションの行番号が正しく反映されていることを確認

#### Step 2: システム仕様更新【必要】

> SkillManagementPanel のビュー統合と agentSlice 拡張があるため、システム仕様更新が**必要**。

更新対象ファイル（P43対策: 3ファイル以下/バッチで分割実行）:

**バッチ1（UIコンポーネント仕様）**: 最大3ファイル

| #   | 更新対象ファイル              | 更新内容                                                                                 |
| --- | ----------------------------- | ---------------------------------------------------------------------------------------- |
| 1   | `ui-ux-components.md`         | SkillManagementPanel ビュー統合セクション追加（list/analysis/createビュー構成）          |
| 2   | `ui-ux-feature-components.md` | スキルライフサイクル機能追加（分析フロー、改善提案適用、4ステップ作成、ChatPanel統合）   |
| 3   | `arch-ui-components.md`       | SkillManagementPanel の統合アーキテクチャ更新（SkillAnalysisView/SkillCreateWizard統合） |

**バッチ2（状態管理・台帳）**: 最大3ファイル

| #   | 更新対象ファイル                     | 更新内容                                                                             |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------ |
| 1   | `arch-state-management.md`           | agentSlice拡張記録（analyze/applyImprovements/autoImprove/create、個別セレクタ追加） |
| 2   | `aiworkflow-requirements/LOGS.md`    | タスク完了エントリ追加                                                               |
| 3   | `task-specification-creator/LOGS.md` | タスク完了記録追加                                                                   |

**バッチ3（SKILL.md・台帳・索引）**: 最大3ファイル

| #   | 更新対象ファイル                      | 更新内容                     |
| --- | ------------------------------------- | ---------------------------- |
| 1   | `aiworkflow-requirements/SKILL.md`    | 変更履歴テーブル更新         |
| 2   | `task-specification-creator/SKILL.md` | 変更履歴テーブル更新         |
| 3   | `task-workflow.md`                    | TASK-10A-Dステータス完了更新 |

---

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

ドキュメント更新履歴（documentation-changelog.md）を作成し、artifacts.jsonを更新する。

**P4対策: 全Step確認前に「完了」と記載しない**

```bash
# Step 1: ドキュメント更新履歴生成
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION

# Step 2: Phase 12完了登録（artifacts.json更新）
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/component-documentation.md:コンポーネントドキュメント,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート,outputs/phase-12/skill-feedback-report.md:スキルフィードバックレポート,outputs/phase-12/spec-update-summary.md:仕様更新サマリー"
```

**artifacts.json必須項目**:

- Phase 12のステータスが`completed`に更新されていること
- 全Phase（1-12）の成果物パスが登録されていること
- `qualityMetrics`セクションに品質指標が記録されていること

**スクリプト未存在時の代替手順**:

- 手動で `outputs/phase-12/documentation-changelog.md` を作成
- 手動で `artifacts.json` を更新
- 更新したドキュメントと変更内容を一覧化

#### documentation-changelog.md 記録内容

各Stepの完了結果を**詳細に**記録する（漏れの可視化）:

```markdown
## Step実行結果

| Step | 判定        | 理由                                                                                    |
| ---- | ----------- | --------------------------------------------------------------------------------------- |
| 1-A  | ✅/❌       | ui-ux-components.md に完了タスクセクション追加 / LOGS.md 2ファイル / SKILL.md 2ファイル |
| 1-B  | ✅/該当なし | 実装状況テーブル更新                                                                    |
| 1-C  | ✅/該当なし | grep結果と更新内容                                                                      |
| 1-D  | ✅          | generate-index.js 実行結果                                                              |
| 2    | ✅/更新不要 | 更新対象ファイル一覧と変更内容（3バッチ分割実行結果）                                   |
```

---

### Task 4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

**検出コマンド**:

```bash
# スキル関連コンポーネントのTODO/FIXME検索
grep -rn "TODO\|FIXME\|HACK\|XXX" \
  apps/desktop/src/renderer/components/skill/ \
  apps/desktop/src/renderer/store/slices/agentSlice.ts \
  apps/desktop/src/renderer/components/chat/ChatPanel.tsx

# 未タスク検出スクリプト（存在する場合）
node scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src/renderer/components/skill \
  --scan apps/desktop/src/renderer/components/chat \
  --output .tmp/unassigned-candidates.json
```

**検出した未タスクの処理（P3/P38対策 — 3ステップ全完了必須）**:

1. `docs/30-workflows/unassigned-task/` に指示書を作成（`tasks/` 直下ではない — P38対策）
2. `task-workflow.md` の残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

**0件の場合でも** `unassigned-task-detection.md` を作成し「検出結果: 0件」と明記する。

**成果物**:

- `outputs/phase-12/unassigned-task-detection.md`（**0件でも必須**）
- `docs/30-workflows/unassigned-task/*.md`（検出時のみ）

---

### Task 5: スキルフィードバックレポート作成【必須】

ワークフロー改善点と技術的教訓を記録する。**改善点がなくても「改善点なし」としてレポートを作成する（省略不可 — P28対策）。**

| セクション         | 記載内容                                             |
| ------------------ | ---------------------------------------------------- |
| ワークフロー改善点 | Phase実行中に発見したワークフロー上の改善提案        |
| 技術的教訓         | 実装中に得られた技術的な知見・注意点                 |
| スキル改善提案     | task-specification-creator/skill-creatorへの改善提案 |
| 新規Pitfall候補    | 06-known-pitfalls.mdに追加すべき新規Pitfall          |

**成果物**: `outputs/phase-12/skill-feedback-report.md`

---

## 検証コマンド順次実行

Phase 12 Task 2 の更新後は、以下を**この順序で**実行する:

### 1. 未タスク参照リンク検証（全体 + 差分）

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

- `verify-unassigned-links.js`: リポジトリ全体の既存欠損数を記録する
- `audit-unassigned-tasks.js --diff-from HEAD`: 今回差分の `currentViolations=0` を合格条件にする

### 2. 索引再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION --regenerate
git diff --stat -- .claude/skills/*/indexes/topic-map.md .claude/skills/*/indexes/keywords.json
```

### 3. SKILL検証（全3スキル）

```bash
for skill in skill-creator task-specification-creator aiworkflow-requirements; do
  echo "=== $skill ===" && \
  node .claude/skills/skill-creator/scripts/quick_validate.js ".claude/skills/$skill"
done
```

- **合格基準**: Error 0件で合格
- **Warning**: 3段階分類（許容/要監視/要対応）に基づき対応

### 4. artifacts スキーマ検証

```bash
node .claude/skills/task-specification-creator/scripts/validate-schema.js \
  --schema schemas/artifact-definition.json \
  --data docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/artifacts.json
```

---

## 成果物

| 成果物                       | パス                                            | 必須 | 説明                       |
| ---------------------------- | ----------------------------------------------- | ---- | -------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的+技術的ドキュメント  |
| コンポーネントドキュメント   | `outputs/phase-12/component-documentation.md`   | ✅   | コンポーネントAPI仕様      |
| 仕様更新サマリー             | `outputs/phase-12/spec-update-summary.md`       | ✅   | 仕様書更新の概要           |
| 仕様準拠監査レポート         | `outputs/phase-12/spec-compliance-audit.md`     | 推奨 | 2スキル観点の整合監査証跡  |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                   |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（なしでも出力）   |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | ✅   | 改善点（なしでも出力必須） |
| 未完了タスク指示書           | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成             |

## 完了条件

### Task 1: 実装ガイド

- [ ] 実装ガイド（Part 1: 概念的説明 — 日常例え必須: テーマパーク案内所の例え）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細 — agentSlice拡張、個別セレクタ、ビュー切替ロジック）が作成されている
- [ ] コンポーネントドキュメント（component-documentation.md — SkillManagementPanel/SkillAnalysisView/SkillCreateWizard/ChatPanelの統合仕様）が作成されている
- [ ] 実装ガイドのテストカテゴリテーブルがPhase 6後の実測値を反映している

### Task 2: システムドキュメント更新

- [ ] **【Step 1-A】** `ui-ux-components.md` に「完了タスク」セクション（ビュー統合内容）を追加した
- [ ] **【Step 1-A】** 関連ドキュメントセクションに実装ガイドリンクを追加した
- [ ] **【Step 1-A】** 変更履歴セクションにバージョンを追記した
- [ ] **【Step 1-A】** aiworkflow-requirements/LOGS.md にタスク完了エントリを追加した
- [ ] **【Step 1-A】** task-specification-creator/LOGS.md にタスク完了記録を追加した（P1/P25対策）
- [ ] **【Step 1-A】** aiworkflow-requirements/SKILL.md 変更履歴テーブルを更新した（P29対策）
- [ ] **【Step 1-A】** task-specification-creator/SKILL.md 変更履歴テーブルを更新した（P29対策）
- [ ] **【Step 1-B】** 実装状況テーブルの更新要否を判断し、該当する場合は「完了」に更新した
- [ ] **【Step 1-C】** `grep -rn "TASK-10A-D" references/` で関連仕様書を検索して更新した
- [ ] **【Step 1-D】** topic-map.md を再生成した（P2/P27対策）
  - 再生成トリガー: セクション追加/削除/更新、行数変更
  - コマンド: `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
- [ ] **【Step 2】** システム仕様更新を実施した（バッチ1: UIコンポーネント、バッチ2: 状態管理・台帳、バッチ3: SKILL.md・台帳・索引）
  - `ui-ux-components.md`: SkillManagementPanel ビュー統合セクション追加
  - `ui-ux-feature-components.md`: スキルライフサイクル機能追加
  - `arch-ui-components.md`: SkillManagementPanel 統合アーキテクチャ更新
  - `arch-state-management.md`: agentSlice 拡張記録

### Task 3: ドキュメント更新履歴

- [ ] documentation-changelog.md に更新した全仕様書の変更内容を記録した
- [ ] 各Stepの完了結果を詳細に記録した（漏れの可視化）
- [ ] **全Step確認前に「完了」と記載していない**（P4対策）
- [ ] artifacts.json が更新されている
- [ ] artifacts.json の全完了Phase（1-12）のステータスが completed であること

### Task 4: 未タスク検出

- [ ] 未タスク検出レポートが出力されている【0件でも必須】
- [ ] 検出された未タスクに対して指示書が `docs/30-workflows/unassigned-task/` に作成されている（該当する場合）（P3/P38対策）
- [ ] 検出された未タスクが `task-workflow.md` 残課題テーブルに登録されている（該当する場合）
- [ ] 検出された未タスクの関連仕様書に参照リンクが追加されている（該当する場合）
- [ ] 未タスク指示書の物理ファイル存在を確認した（`ls docs/30-workflows/unassigned-task/` で検証）

### Task 5: スキルフィードバック

- [ ] スキルフィードバックレポートが出力されている【改善点なしでも必須】（P28対策）

### 検証

- [ ] `verify-unassigned-links.js` の全体結果を記録し、`audit-unassigned-tasks.js --diff-from HEAD` で `currentViolations=0` を確認した
- [ ] `generate-index.js` で索引を再生成した
- [ ] `quick_validate.js` で3スキル全てが Error 0件であることを確認した
- [ ] `validate-schema.js` で artifacts.json のスキーマ準拠を確認した
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase 12 既知の落とし穴対策チェックリスト

Phase 12 完了前に、以下の全項目を確認する:

| ID  | ポイント                                    | 対策                                                                | 確認 |
| --- | ------------------------------------------- | ------------------------------------------------------------------- | ---- |
| P1  | LOGS.md 2ファイル更新漏れ                   | aiworkflow-requirements + task-specification-creator 両方を同時更新 | [ ]  |
| P2  | topic-map.md 再生成忘れ                     | セクション変更時は必ず `generate-index.js` を実行                   | [ ]  |
| P3  | 未タスク管理の3ステップ不完全               | ①指示書 → ②task-workflow.md登録 → ③関連仕様書リンク                 | [ ]  |
| P4  | documentation-changelogへの早期「完了」記載 | 全Step確認完了後にのみ「完了」を記載                                | [ ]  |
| P25 | LOGS.md 2ファイル更新漏れ（再発）           | Phase 12チェックリストで「2ファイル更新」を明示的にチェック         | [ ]  |
| P26 | システム仕様書更新遅延                      | Phase 12完了時点でシステム仕様書を更新（PRマージを待たない）        | [ ]  |
| P27 | topic-map.md再生成トリガー判断ミス          | 追加だけでなく削除・更新も再生成トリガーに含める                    | [ ]  |
| P28 | スキルフィードバックレポート未作成          | 改善点がなくても「改善点なし」としてレポート作成                    | [ ]  |
| P29 | SKILL.md 変更履歴の更新漏れ                 | LOGS.mdとは別にSKILL.mdの変更履歴テーブルも必ず更新                 | [ ]  |
| P38 | 未タスク配置ディレクトリ間違い              | `unassigned-task/` 配下に配置（`tasks/` 直下ではない）              | [ ]  |
| P43 | サブエージェントのrate limit中断            | 仕様書更新は3ファイル以下/エージェントに分割                        | [ ]  |

---

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成（`outputs/phase-12/documentation-changelog.md`の形式に従う）                  |
| `complete-phase.js`                   | 手動でartifacts.jsonを更新（参照: `docs/30-workflows/completed-tasks/TASK-4-1-ipc-channels/outputs/artifacts.json`） |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、unassigned-task-detection.mdを作成                                    |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認                                                                                   |

### スキル検証

```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 事前チェック（06-known-pitfalls.md 確認）
2. Task 1: 実装ガイド作成（Part 1 + Part 2 + コンポーネントドキュメント）
3. Task 2 バッチ1: UIコンポーネント仕様更新（ui-ux-components.md, ui-ux-feature-components.md, arch-ui-components.md）
4. Task 2 バッチ2: 状態管理・台帳更新（arch-state-management.md, LOGS.md×2）
5. Task 2 バッチ3: SKILL.md×2 + task-workflow.md 更新
6. Task 2 Step 1-D: topic-map.md 再生成
7. Task 3: documentation-changelog.md + artifacts.json 更新
8. Task 4: 未タスク検出
9. Task 5: スキルフィードバックレポート
10. 検証コマンド実行
11. 完了条件の全項目チェック

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## 統合テスト連携

- 仕様契約確認: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` と `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` を参照し、agentSlice に追加した analyze/applyImprovements/autoImprove/create アクションの入力・戻り値契約を一致させる。
- セキュリティ観点: `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` と `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` の sender 検証・入力検証方針を適用する。
- テスト接続: Phase 4/6/7 のテスト成果物を Phase 10/11 の判定基準へ接続し、差分が出た場合は Phase 2（設計）または Phase 5（実装）へ戻して再検証する。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION --phase 12
```

## 次のPhase

Phase 13: 完了・PR準備
