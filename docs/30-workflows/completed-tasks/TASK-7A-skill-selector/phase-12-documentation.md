# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 12                     |
| 機能名 | TASK-7A-skill-selector |
| 作成日 | 2026-01-30             |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

- 技術ドキュメント作成: 実装ガイドの作成
- システムドキュメント更新: aiworkflow-requirements等の更新
- ドキュメント更新履歴作成: 変更履歴の記録
- 未タスク検出: 残課題の検出と記録

## サブフェーズ

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**Part 1（中学生レベル）の必須要件**:

- SkillSelector を日常生活の例え話で説明する
  - 例: 「スマホでアプリを選ぶとき、ホーム画面でアプリのアイコンをタップして選ぶのと同じ」
- 「なぜスキルを選ぶ必要があるのか」を先に説明
- 「ドロップダウン」「セレクター」等の専門用語は即座に平易な言葉で説明

**Part 2（技術者レベル）の必須要件**:

- SkillSelectorProps インターフェース定義
- useAppStore 経由の状態取得パターン
- キーボードナビゲーションのキーマッピング表
- ARIA属性一覧と設定値
- Tailwind CSS スタイリングパターン
- テストのモック方法（useAppStore モック例）

### Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

**2ステップで実行**:

#### Step 1: タスク完了記録【必須・全タスク】

- [ ] 該当する仕様書に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加
- [ ] `topic-map.md` に新規セクションエントリを追加（該当する場合）

#### Step 2: システム仕様更新【条件付き】

SkillSelector は新規UIコンポーネントのため、以下の仕様更新が必要と判断:

| 更新対象ファイル           | 更新内容                                                   |
| -------------------------- | ---------------------------------------------------------- |
| `arch-ui-components.md`    | SkillSelector コンポーネント定義を追加                     |
| `arch-state-management.md` | skillSlice の SkillSelector 連携情報を追加（該当する場合） |

**更新不要の判断基準**:

| 更新必要                    | 更新不要                   |
| --------------------------- | -------------------------- |
| 新規コンポーネント追加      | 内部実装の変更のみ         |
| 新規インターフェース/型追加 | リファクタリング（IF不変） |
| 新規定数/設定値追加         | バグ修正（仕様変更なし）   |

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

```bash
# Step 1: ドキュメント更新履歴生成
node scripts/generate-documentation-changelog.js --workflow docs/30-workflows/TASK-7A-skill-selector

# Step 2: Phase 12完了登録（artifacts.json更新）
node scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-7A-skill-selector \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-report.md:未タスク検出レポート"
```

**artifacts.json必須項目**:

- Phase 12のステータスが`completed`に更新されていること
- 全Phase（1-12）の成果物パスが登録されていること
- `qualityMetrics`セクションに品質指標が記録されていること

**スクリプト未存在時の代替手順**:

| スクリプト                            | 代替手順                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成                                                                               |
| `complete-phase.js`                   | 手動でartifacts.jsonを作成（参照: `docs/30-workflows/completed-tasks/TASK-4-1-ipc-channels/outputs/artifacts.json`） |

### Task 4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                                                      |
| --- | ---------------------- | ------------------------------------------------------------- |
| 1   | 元タスク仕様書         | 「スコープ外」として明示された項目（i18n対応、TASK-7B連携等） |
| 2   | Phase 3レビュー結果    | MINOR判定の指摘事項                                           |
| 3   | Phase 10レビュー結果   | MINOR判定の指摘事項                                           |
| 4   | Phase 11手動テスト結果 | スコープ外の発見事項・改善提案                                |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント                                   |

**検出対象例**:

- TASK-7B（SkillImportDialog）との `onImport` コールバック接続
- i18n対応（日本語ハードコード部分）
- アニメーション実装（specification.md 4.6H: 200ms ease-out）
- 検索/フィルター機能（specification.md 4.6E）

## アーキテクチャ層別ドキュメント（AIが判断）

実装ガイド Part 2（技術的詳細）では、以下の層のドキュメントを作成:

| 層               | ドキュメント内容                        | 更新対象                |
| ---------------- | --------------------------------------- | ----------------------- |
| Renderer Process | コンポーネント設計、Hooks、状態管理連携 | `arch-ui-components.md` |

## 参照資料

| 資料名           | パス                                      | 説明           |
| ---------------- | ----------------------------------------- | -------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | Phase 10成果物 |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`  | Phase 11成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                                 |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------------------ |
| UI/UXデザインシステム  | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`   | デザイントークン・コンポーネント規約 |
| LLMセレクター仕様      | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`    | 既存セレクターUI仕様                 |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | skillSlice定義・Zustandパターン      |
| UIコンポーネント設計   | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`    | コンポーネント階層                   |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                               | 仕様参照先                                   |
| ------------------ | -------------------------------------- | -------------------------------------------- |
| セキュリティ       | スキル名・説明文の表示時XSS防止        | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装のため適用           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | Renderer Process内完結の確認           | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | rescanSkills失敗時の表示・空リスト対応 | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 不要な再レンダリング防止               | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | WAI-ARIA Listboxパターン準拠           | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断               | 仕様参照先                            |
| -------------------------- | ---------------------- | ------------------------------------- |
| フロントエンド（Renderer） | UI/React実装のため適用 | `aiworkflow-requirements: ui-ux-*.md` |

## 成果物

| 成果物               | パス                                          | 必須 | 説明                      |
| -------------------- | --------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`  | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`      | 条件 | 検出時のみ作成            |

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Task 2 Step 1】変更履歴セクションにバージョンを追記した**
- [ ] **【Task 2 Step 1】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 1】topic-map.mdに新規セクションエントリを追加した（該当する場合）**
- [ ] **【Task 2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した**
- [ ] **アーキテクチャ層別のドキュメントが作成されている（Renderer Process）**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成                                                                               |
| `complete-phase.js`                   | 手動でartifacts.jsonを作成（参照: `docs/30-workflows/completed-tasks/TASK-4-1-ipc-channels/outputs/artifacts.json`） |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、unassigned-task-report.mdを作成                                       |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認                                                                                   |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 実装ガイド Part 1（概念的説明）の作成
2. 実装ガイド Part 2（技術的詳細）の作成
3. Task 2 Step 1: タスク完了記録の実施
4. Task 2 Step 2: システム仕様更新の判断・実施
5. Task 3: ドキュメント更新履歴 & artifacts.json更新
6. Task 4: 未タスク検出レポート作成
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7A-skill-selector --phase 12
```

## 次のPhase

Phase 13: PR作成
