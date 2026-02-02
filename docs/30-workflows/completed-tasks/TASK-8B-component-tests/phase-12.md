# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 12                           |
| タスク | TASK-8B コンポーネントテスト |
| 機能名 | skill-import-agent-system    |
| 作成日 | 2026-02-01                   |

## 目的

実装したコンポーネントテストの内容をドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

- 技術ドキュメント作成: 実装ガイドの作成（2パート構成）
- システムドキュメント更新: aiworkflow-requirements等の更新
- ドキュメント更新履歴作成: 変更履歴の記録
- 未タスク検出: 残課題の検出と記録

## 参照資料

| 資料名         | パス                                      | 説明           |
| -------------- | ----------------------------------------- | -------------- |
| 品質レポート   | `outputs/phase-9/quality-report.md`       | Phase 9成果物  |
| レビュー結果   | `outputs/phase-10/final-review-result.md` | Phase 10成果物 |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md`  | Phase 11成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                      | 内容                 |
| ---------------- | ------------------------------------------------------------------------- | -------------------- |
| UIコンポーネント | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md` | テスト品質メトリクス |

### スキル参照資料

| 参照資料               | パス                                                                                    | 内容                    |
| ---------------------- | --------------------------------------------------------------------------------------- | ----------------------- |
| 仕様更新ワークフロー   | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Step 1-A/1-B/1-C/2 詳細 |
| 技術ドキュメントガイド | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | 5必須セクション定義     |
| 未タスクガイドライン   | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`    | 検出ソース・品質基準    |

## サブフェーズ

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート     | 対象読者         | 内容                                           |
| ---------- | ---------------- | ---------------------------------------------- |
| **Part 1** | 初学者・非技術者 | コンポーネントテストの概念説明（中学生レベル） |
| **Part 2** | 開発者・技術者   | テスト実装の技術的詳細                         |

**Part 1（中学生レベル）の記載例**:

> コンポーネントテストは、アプリの「部品」が正しく動くかを確認する検査です。
> 例えば、自動販売機のボタンを押したらジュースが出るか確認するようなものです。
> 「SkillSelector」は商品を選ぶボタン、「PermissionDialog」は「本当に買いますか？」と聞く画面です。
> テストでは「ボタンを押す」「画面を確認する」を自動でやって、壊れていないか毎回チェックします。

**Part 1必須要件**:

- 日常生活での例え話を必ず含める
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜテストが必要か」を先に説明

**Part 2必須要件**:

- テストパターン一覧（Storeモック、userEvent、waitFor等）
- 各コンポーネントのテスト設計思想
- テストデータファクトリのAPI仕様
- カバレッジ結果サマリー
- トラブルシューティング（よくあるテスト失敗パターンと対処法）

**5必須セクション構成**（`references/technical-documentation-guide.md`参照）:

| セクション       | 対応パート | 内容                                   |
| ---------------- | ---------- | -------------------------------------- |
| 概念編           | Part 1     | 中学生レベルの概念的説明・日常の例え話 |
| アーキテクチャ編 | Part 2     | テスト構成・コンポーネント間関係       |
| 技術詳細編       | Part 2     | 実装パターン・ファクトリAPI・設定      |
| 実装判断の理由編 | Part 2     | 設計判断の根拠・数値目標の理由         |
| 用語集           | Part 2     | 専門用語一覧（カテゴリ別）             |

**テンプレート**: `assets/implementation-guide-template.md`

### Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

#### Step 1-A: タスク完了記録【必須・全タスク】

- [ ] `arch-ui-components.md` に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加
- [ ] `topic-map.md` に新規セクションエントリを追加（該当する場合）

> **LOGS.md更新**: 以下の**2つの**LOGS.mdファイルを**両方**更新する（形式は`references/spec-update-workflow.md`「LOGS.md 更新」セクション参照）:
>
> | ファイル                                            | 目的                         |
> | --------------------------------------------------- | ---------------------------- |
> | `.claude/skills/aiworkflow-requirements/LOGS.md`    | システム仕様書更新の記録     |
> | `.claude/skills/task-specification-creator/LOGS.md` | タスク仕様書スキルの使用記録 |

> **⚠️ よくある漏れパターン**（`references/spec-update-workflow.md`参照）:
>
> - 「既存型を再利用しているので更新不要」→ **Step 1-B必須**（実装状況テーブルの更新）
> - 「内部実装のみなので更新不要」→ **Step 1-A必須**（タスク完了記録は常に必須）
> - 「関連タスクテーブルは確認不要」→ **Step 1-C必須**（Grepで確認が必要）

```markdown
## 完了タスク

### タスク: TASK-8B コンポーネントテスト（{{COMPLETION_DATE}}完了）

| 項目               | 内容                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| タスクID           | TASK-8B                                                                |
| ステータス         | **完了**                                                               |
| テスト数           | 55+（自動） + 13（手動）                                               |
| カバレッジ         | Line {{XX}}%, Branch {{XX}}%, Function {{XX}}%                         |
| 対象コンポーネント | SkillSelector, SkillImportDialog, PermissionDialog, SkillStreamingView |

#### テスト結果サマリー

| カテゴリ           | テスト数 | PASS  | FAIL  |
| ------------------ | -------- | ----- | ----- |
| 機能テスト         | {{N}}    | {{N}} | {{N}} |
| エラーハンドリング | {{N}}    | {{N}} | {{N}} |
| アクセシビリティ   | {{N}}    | {{N}} | {{N}} |
| 統合テスト連携     | {{N}}    | {{N}} | {{N}} |

#### 成果物

| 成果物             | パス                                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| テスト結果レポート | `docs/30-workflows/skill-import-agent-system/TASK-8B-component-tests/outputs/phase-11/manual-test-result.md`   |
| 実装ガイド         | `docs/30-workflows/skill-import-agent-system/TASK-8B-component-tests/outputs/phase-12/implementation-guide.md` |
```

> **詳細テンプレート**: `references/spec-update-workflow.md`の「タスク完了ステータス更新」セクション参照

#### Step 1-B: 実装状況テーブル更新

以下の仕様書で「TASK-8B」に関連する実装状況を「完了」に更新:

| 仕様書ファイル            | 更新箇所                     |
| ------------------------- | ---------------------------- |
| `arch-ui-components.md`   | テスト品質メトリクス更新     |
| `quality-requirements.md` | テストカバレッジ実績値の更新 |

#### Step 1-C: 関連タスクテーブル更新

関連する仕様書内の「関連タスク」テーブルでTASK-8Bのステータスを「完了」に更新:

| 仕様書                  | テーブル名 |
| ----------------------- | ---------- |
| `arch-ui-components.md` | 関連タスク |

> **⚠️ 見落とし防止**: 以下のGrepで全仕様書からTASK-8B記載を検索すること:
>
> ```bash
> grep -rl "TASK-8B" .claude/skills/aiworkflow-requirements/references/
> ```

#### 更新漏れ防止チェックリスト

> `references/spec-update-workflow.md`「更新漏れ防止チェックリスト」参照

- [ ] テスト用の共通ヘルパーを新規作成した場合 → `arch-ui-components.md` に追記
- [ ] コンポーネントにARIA属性を追加した場合 → `ui-ux-design-principles.md` に追記
- [ ] 更新したファイルの変更履歴セクションにバージョンを追記した
- [ ] `topic-map.md` に新規セクションエントリを追加した
- [ ] `completed-tasks/` 内の該当タスク仕様書のステータスを「完了」に更新した

#### Step 2: システム仕様更新【条件付き】

**TASK-8B（テスト追加タスク）の場合**:

| 更新必要                     | 更新不要                      |
| ---------------------------- | ----------------------------- |
| テストパターンの文書化       | 内部実装の変更のみ → **該当** |
| 新規テストユーティリティ追加 | リファクタリング → 該当しない |

**判断**: TASK-8Bはテスト追加のみのタスクであるため、**Step 2は原則不要**。
ただし、以下の場合は更新が必要:

- テスト用の共通ヘルパーを新規作成した場合 → `arch-ui-components.md` に追記
- コンポーネントにARIA属性を追加した場合 → `ui-ux-design-principles.md` に追記

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

```bash
# Step 1: ドキュメント更新履歴生成
node scripts/generate-documentation-changelog.js --workflow docs/30-workflows/skill-import-agent-system/TASK-8B-component-tests

# Step 2: Phase 12完了登録（artifacts.json更新）
node scripts/complete-phase.js \
  --workflow docs/30-workflows/skill-import-agent-system/TASK-8B-component-tests \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

**スクリプト未存在時の代替手順**:

- 手動で `outputs/phase-12/documentation-changelog.md` を作成
- 手動で `artifacts.json` を作成（参照: `docs/30-workflows/completed-tasks/TASK-4-1-ipc-channels/outputs/artifacts.json`）

### Task 4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                           |
| --- | ---------------------- | ---------------------------------- |
| 1   | 元タスク仕様書         | 「スコープ外」として明示された項目 |
| 2   | Phase 3レビュー結果    | MINOR判定の指摘事項                |
| 3   | Phase 10レビュー結果   | MINOR判定の指摘事項                |
| 4   | Phase 11手動テスト結果 | スコープ外の発見事項・改善提案     |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント        |

```bash
# 未タスク検出スクリプト
node scripts/detect-unassigned-tasks.js --scan apps/desktop/src/renderer/components/skill --output .tmp/unassigned-candidates.json
```

**未タスク候補例**:

- E2Eテストとの統合（Playwright）→ TASK-8C管轄
- スナップショットテストの追加
- Visual Regression テストの導入
- テストパフォーマンス最適化

## アーキテクチャ層別ドキュメント（Renderer Process）

| 層               | ドキュメント内容                                          | 更新対象                |
| ---------------- | --------------------------------------------------------- | ----------------------- |
| Renderer Process | コンポーネントテストパターン、Storeモック戦略、a11yテスト | `arch-ui-components.md` |

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断                          | 確認項目                                               |
| ---------------- | --------------------------------- | ------------------------------------------------------ |
| UI/UX            | テスト実装ドキュメント → **適用** | 実装ガイドがUI品質基準を正しく記述しているか           |
| アクセシビリティ | a11yテストドキュメント → **適用** | アクセシビリティテスト手法がドキュメント化されているか |
| セキュリティ     | テストコードのみ → **適用外**     | -                                                      |
| パフォーマンス   | ドキュメント更新のみ → **適用外** | -                                                      |

### Electronデスクトップアプリ観点

| 観点                       | 適用判断                          | 確認項目                                             |
| -------------------------- | --------------------------------- | ---------------------------------------------------- |
| フロントエンド（Renderer） | UIコンポーネントテスト → **適用** | Renderer Processのテストパターンが文書化されているか |
| バックエンド（Main）       | テスト対象外 → **適用外**         | -                                                    |
| IPC通信                    | Storeレベルでモック → **適用外**  | -                                                    |
| Preload/セキュリティ       | テスト対象外 → **適用外**         | -                                                    |
| ローカルストレージ         | テスト対象外 → **適用外**         | -                                                    |

## 成果物

| 成果物               | パス                                            | 必須 | 説明                           |
| -------------------- | ----------------------------------------------- | ---- | ------------------------------ |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | ✅   | Part 1（概念）+ Part 2（技術） |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                       |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（なしでも出力）       |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成                 |

## 完了条件

- [ ] 実装ガイド（Part 1: 中学生レベルの概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細 - テストパターン、ファクトリAPI、カバレッジ結果）が作成されている
- [ ] **【Task 2 Step 1-A】`arch-ui-components.md` に「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1-A】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Task 2 Step 1-A】変更履歴セクションにバージョンを追記した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 1-A】topic-map.mdに新規セクションエントリを追加した（該当する場合）**
- [ ] **【Task 2 Step 1-B】実装状況テーブルのテスト品質メトリクスを更新した**
- [ ] **【Task 2 Step 1-C】関連タスクテーブルのステータスを「完了」に更新した（該当する場合）**
- [ ] **【Task 2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## フォールバック手順

| スクリプト                            | 代替手順                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成                                                                               |
| `complete-phase.js`                   | 手動でartifacts.jsonを作成（参照: `docs/30-workflows/completed-tasks/TASK-4-1-ipc-channels/outputs/artifacts.json`） |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、unassigned-task-detection.mdを作成                                    |

## サブタスク管理

1. Task 1: 実装ガイド Part 1（概念的説明）作成
2. Task 1: 実装ガイド Part 2（技術的詳細）作成
3. Task 2 Step 1-A: タスク完了記録
4. Task 2 Step 1-B: 実装状況テーブル更新
5. Task 2 Step 1-C: 関連タスクテーブル更新
6. Task 2 Step 2: システム仕様更新の要否判断
7. Task 3: ドキュメント更新履歴 & artifacts.json更新
8. Task 4: 未タスク検出レポート作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/TASK-8B-component-tests --phase 12
```

## 次のPhase

Phase 13: PR作成
