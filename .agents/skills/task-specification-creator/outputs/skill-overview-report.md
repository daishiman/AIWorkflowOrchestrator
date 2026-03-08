# Task Specification Creator スキル 詳細レポート

> 作成日: 2026-01-28
 目的: スキルの全体像・構成・ワークフローの把握

---

## 1. 概要

**Task Specification Creator** は、開発タスクを **Phase 1〜13** の実行可能な仕様書に分解・生成するClaudeスキルです。

### 設計思想

| 原則                       | 説明                                               |
| -------------------------- | -------------------------------------------------- |
| **Script First**           | 決定論的処理はスクリプト（100%精度保証）           |
| **LLM for Judgment**       | 判断・創造的作業のみLLMが担当                      |
| **Progressive Disclosure** | 必要時のみリソースを読み込む（コンテキスト効率化） |

---

## 2. ディレクトリ構成と役割

```
task-specification-creator/
├── SKILL.md              # エントリポイント（スキル全体の説明）
├── LOGS.md               # 使用履歴・フィードバック記録
├── EVALS.json            # 評価データ
├── agents/               # LLM Task仕様書（9ファイル）
├── references/           # 詳細知識ドキュメント（15ファイル）
├── schemas/              # JSON Schema検証（8ファイル）
├── scripts/              # 決定論的スクリプト（10ファイル）
├── assets/               # 出力テンプレート（8ファイル）
└── outputs/              # 検証レポート出力先
```

### 各ディレクトリの役割

| ディレクトリ    | 目的                          | 読み込みタイミング |
| --------------- | ----------------------------- | ------------------ |
| **agents/**     | LLMが実行する各タスクの仕様書 | 該当Task実行直前   |
| **references/** | ワークフロー詳細・品質基準    | 必要時のみ         |
| **schemas/**    | 入出力データの検証用スキーマ  | 検証時             |
| **scripts/**    | 自動処理（検証・完了処理等）  | 各Phase完了時      |
| **assets/**     | Markdown出力テンプレート      | ファイル生成時     |

---

## 3. 4つの動作モード

```bash
# モード判定スクリプト
node scripts/detect-mode.js --request "{{USER_REQUEST}}"
```

| モード                | 用途                 | 典型的な開始条件                       |
| --------------------- | -------------------- | -------------------------------------- |
| **create**            | 新規タスク仕様書作成 | 「新機能を追加したい」等のユーザー依頼 |
| **execute**           | Phase実行            | 作成済みタスク仕様書に基づく作業       |
| **update**            | 仕様書更新           | 既存仕様書の修正・更新                 |
| **detect-unassigned** | 未タスク検出         | Phase 12での残課題検出                 |

---

## 4. タスク仕様書作成の流れ（createモード）

### 4.1 全体フロー

```
ユーザー要求
    ↓
【Phase 1: 分析】 ── LLM Task ──
    decompose-task → identify-scope → design-phases
    ↓
【Phase 2: 生成】 ── LLM Task + スキーマ検証 ──
    generate-task-specs → [validate-schema]
    ↓
【Phase 3: 出力】 ── Script Task（100%精度） ──
    [init-artifacts] → output-phase-files（並列）
                     → update-dependencies（並列）
    ↓
【Phase 4: 個別検証】 ── Script Task ──
    [validate-phase-output]
    ↓
【Phase 5: 全体検証】 ── Script + LLM ──
    [verify-all-specs] → verify-specs（LLM品質検証）
    ↓
    ├─ PASS → Phase 6: 完了（log-usage）
    └─ FAIL → Phase 2へ戻り修正
```

### 4.2 各Agentの責務と連携

| Agent                   | 責務                               | 入力             | 出力                      |
| ----------------------- | ---------------------------------- | ---------------- | ------------------------- |
| **decompose-task**      | ユーザー要求を単一責務タスクに分解 | ユーザー要求文   | タスク分解リスト          |
| **identify-scope**      | スコープ・前提・制約を定義         | タスク分解リスト | スコープ定義              |
| **design-phases**       | Phase 1〜13の構成を設計            | スコープ定義     | フェーズ設計書            |
| **generate-task-specs** | 各Phase仕様書を生成                | フェーズ設計書   | phase-\*.md（13ファイル） |
| **output-phase-files**  | Markdownファイル出力               | タスク仕様書一覧 | phase-1〜13.md            |
| **update-dependencies** | Phase間依存関係を設定              | タスク仕様書一覧 | 依存関係マップ            |
| **verify-specs**        | 全13仕様書の品質検証               | 検証レポート     | PASS/FAIL判定             |

### 4.3 出力される成果物

タスク仕様書作成後、以下のファイル群が生成されます：

```
docs/30-workflows/{{FEATURE_NAME}}/
├── index.md                    # メインタスク仕様書（全体概要）
├── phase-1-requirements.md     # Phase 1: 要件定義
├── phase-2-design.md           # Phase 2: 設計
├── phase-3-design-review.md    # Phase 3: 設計レビューゲート
├── phase-4-test-creation.md    # Phase 4: テスト作成（TDD-Red）
├── phase-5-implementation.md   # Phase 5: 実装（TDD-Green）
├── phase-6-test-expansion.md   # Phase 6: テスト拡充
├── phase-7-coverage-check.md   # Phase 7: テストカバレッジ確認
├── phase-8-refactoring.md      # Phase 8: リファクタリング
├── phase-9-quality-assurance.md # Phase 9: 品質保証
├── phase-10-final-review.md    # Phase 10: 最終レビューゲート
├── phase-11-manual-testing.md  # Phase 11: 手動テスト検証
├── phase-12-documentation.md   # Phase 12: ドキュメント更新
├── phase-13-pr-creation.md     # Phase 13: PR作成
└── artifacts.json              # 成果物レジストリ
```

---

## 5. Phase 1〜13 の構成

### 5.1 Phase一覧

| Phase | 名称                 | カテゴリ     | 主な成果物                                |
| ----- | -------------------- | ------------ | ----------------------------------------- |
| 1     | 要件定義             | 要件         | 要件定義書                                |
| 2     | 設計                 | 設計         | 設計書、アーキテクチャ図                  |
| 3     | 設計レビューゲート   | ゲート       | レビュー結果（PASS/MINOR/MAJOR/CRITICAL） |
| 4     | テスト作成           | TDD-Red      | 失敗するテストコード                      |
| 5     | 実装                 | TDD-Green    | テストを通す実装コード                    |
| 6     | テスト拡充           | 品質         | 追加テストコード                          |
| 7     | テストカバレッジ確認 | 品質         | カバレッジレポート                        |
| 8     | リファクタリング     | TDD-Refactor | リファクタリング済みコード                |
| 9     | 品質保証             | 品質         | 静的解析レポート                          |
| 10    | 最終レビューゲート   | ゲート       | 最終レビュー結果                          |
| 11    | 手動テスト検証       | 検証         | 手動テスト結果レポート                    |
| 12    | ドキュメント更新     | 文書化       | 実装ガイド、更新履歴                      |
| 13    | PR作成               | 完了         | Pull Request                              |

### 5.2 Phase実行フロー

```
Phase N 開始
    ↓
📖 phase-N-*.md 読み込み
    ↓
[validate-prerequisites] ← 前提条件チェック
    ↓
LLM Task: 仕様書に基づくタスク実行
    ↓
成果物生成
    ↓
[complete-phase.js] ← artifacts.json更新
    ↓
[validate-phase-output] ← 出力検証
    ↓
Phase N+1 へ
```

---

## 6. 未タスク（Unassigned Task）の作成

### 6.1 未タスクとは

Phase実行中に発見された**現スコープ外だが将来対応が必要な課題**を、「誰でも実行可能な粒度」でドキュメント化したものです。

### 6.2 未タスク検出タイミング

| Phase    | 検出ソース       | 検出対象                    |
| -------- | ---------------- | --------------------------- |
| Phase 3  | 設計レビュー結果 | MINOR判定の指摘事項         |
| Phase 10 | 最終レビュー結果 | MINOR判定の指摘事項         |
| Phase 11 | 手動テスト結果   | スコープ外の発見事項        |
| Phase 12 | コードベース     | TODO/FIXME/HACK/XXXコメント |

### 6.3 未タスク検出スクリプト

```bash
# コードベースからTODO/FIXME等を検出
node scripts/detect-unassigned-tasks.js \
  --scan packages/shared/src \
  --output .tmp/unassigned-candidates.json
```

### 6.4 未タスク指示書の構造（Why/What/How）

```json
{
  "taskId": "task-imp-auth-flow-001",
  "category": "imp", // req|imp|bug|ref|sec|perf
  "priority": "medium",
  "why": {
    "background": "背景説明（20文字以上）",
    "problem": "現状の問題点",
    "impact": "放置時の影響"
  },
  "what": {
    "objective": "達成目的",
    "goal": "最終ゴール",
    "scope": { "includes": ["..."], "excludes": ["..."] },
    "deliverables": ["..."]
  },
  "how": {
    "prerequisites": ["..."],
    "steps": ["..."],
    "completionCriteria": ["..."],
    "verification": "検証方法"
  }
}
```

### 6.5 課題分類

| 分類             | 略称 | 判定基準                         |
| ---------------- | ---- | -------------------------------- |
| 要件             | req  | 機能要件の追加・変更が必要       |
| 改善             | imp  | 既存機能の改善・拡張             |
| バグ修正         | bug  | 不具合の修正                     |
| リファクタリング | ref  | コード品質の改善（機能変更なし） |
| セキュリティ     | sec  | セキュリティ関連の対応           |
| パフォーマンス   | perf | 性能改善                         |

### 6.6 未タスク出力先

| 出力物               | 配置先                                          |
| -------------------- | ----------------------------------------------- |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` |
| 未タスク指示書       | `docs/30-workflows/unassigned-task/`            |
| 完了済み未タスク     | `docs/30-workflows/completed-tasks/`            |

**重要**: 未タスクが0件でも、検出レポートに「未対応課題は検出されませんでした」と明記する必要があります。

### 6.7 未タスク完了時のワークフロー

```
タスク実行完了（Phase 12または13）
    ↓
ステータス更新（ファイル内メタ情報: 未実施 → 完了）
    ↓
ファイル移動（unassigned-task → completed-tasks）
    ↓
完了日追記
    ↓
[log-usage]（スキル使用ログ記録）
```

---

## 7. スクリプトの役割

| スクリプト                            | 用途                  | 実行タイミング        |
| ------------------------------------- | --------------------- | --------------------- |
| `detect-mode.js`                      | モード判定            | 開始時                |
| `init-artifacts.js`                   | ワークフロー初期化    | createモード時        |
| `validate-schema.js`                  | JSON Schema検証       | 出力検証時            |
| `validate-phase-output.js`            | Phase出力検証         | 各Phase完了時         |
| `verify-all-specs.js`                 | 13ファイル一括検証    | Phase 5全体検証時     |
| `complete-phase.js`                   | Phase完了・成果物登録 | 各Phase完了時         |
| `detect-unassigned-tasks.js`          | TODO/FIXME検出        | Phase 12実行時        |
| `generate-documentation-changelog.js` | 更新履歴生成          | Phase 12 Task 3実行時 |
| `generate-index.js`                   | index.md自動生成      | create完了後          |
| `log-usage.js`                        | 使用ログ記録          | 全モード完了時        |

---

## 8. 品質基準

### 8.1 タスク仕様書の品質基準

**目標: 100人中100人が同じ理解で実行できる粒度**

| 検証項目           | 内容                                   |
| ------------------ | -------------------------------------- |
| 単一責務           | 各タスクが1つの責務のみを持つ          |
| 曖昧表現の排除     | 「適切に」「必要に応じて」等を使わない |
| 検証可能な完了条件 | チェックリスト形式で確認可能           |
| 成果物の明示       | 生成されるファイル・データを明記       |

### 8.2 レビューゲート判定基準

| 判定     | 対応                                         |
| -------- | -------------------------------------------- |
| PASS     | 次Phaseへ進行                                |
| MINOR    | 軽微な指摘 → 未タスクとして記録して進行      |
| MAJOR    | 重大な問題 → 影響範囲に応じたPhaseへ戻る     |
| CRITICAL | 致命的な問題 → Phase 1へ戻りユーザーと再確認 |

### 8.3 Phase 5 検証項目詳細

| カテゴリ | 検証項目                                                            | 自動/手動 |
| -------- | ------------------------------------------------------------------- | --------- |
| 構造     | 必須セクション（メタ情報/目的/実行タスク/参照資料/成果物/完了条件） | 自動      |
| 構造     | Markdownフォーマット正常性                                          | 自動      |
| 整合性   | Phase間依存関係（前Phase成果物が参照されているか）                  | 自動      |
| 整合性   | 参照資料パスの存在確認                                              | 自動      |
| 品質     | 曖昧表現の検出（「適切に」「必要に応じて」「など」）                | 自動      |
| 品質     | 完了条件の検証可能性                                                | LLM       |
| 品質     | 100人中100人が同じ理解で実行できるか                                | LLM       |
| 完全性   | Phase 1〜13の全ファイル存在確認                                     | 自動      |
| 完全性   | index.md（メインタスク仕様書）存在確認                              | 自動      |
| 完全性   | artifacts.json整合性                                                | 自動      |

---

## 9. Phase 12 ドキュメント更新の詳細

### 9.1 必須タスク（4タスク - 全て完了必須）

| Task | 名称                            | 必須                  |
| ---- | ------------------------------- | --------------------- |
| 1    | 実装ガイド作成（2パート構成）   | ✅                    |
| 2    | システム仕様書更新（2ステップ） | ✅                    |
| 3    | ドキュメント更新履歴作成        | ✅                    |
| 4    | 未タスク検出レポート作成        | ✅（0件でも出力必須） |

### 9.2 Task 1: 実装ガイドの2パート構成

| パート     | 対象読者                 | 内容                                       |
| ---------- | ------------------------ | ------------------------------------------ |
| **Part 1** | **初学者・中学生レベル** | **概念説明（日常の例え話、専門用語なし）** |
| **Part 2** | **開発者・技術者**       | **技術的詳細（スキーマ・API・コード例）**  |

### 9.3 Task 2: システム仕様更新【2ステップ】

| Step   | 必須 | 内容                                                                 |
| ------ | ---- | -------------------------------------------------------------------- |
| Step 1 | ✅   | タスク完了記録（「完了タスク」セクション追加、実装状況テーブル更新） |
| Step 2 | 条件 | システム仕様更新（新規インターフェース追加時のみ）                   |

---

## 10. aiworkflow-requirements との連携

各Phaseドキュメントの「参照資料」セクションにシステム仕様を含める：

| 観点               | 仕様参照先          |
| ------------------ | ------------------- |
| セキュリティ       | `security-*.md`     |
| UI/UX（Apple HIG） | `ui-ux-*.md`        |
| アーキテクチャ     | `architecture-*.md` |
| API設計            | `api-*.md`          |
| データ整合性       | `database-*.md`     |
| エラーハンドリング | `error-handling.md` |
| インターフェース   | `interfaces-*.md`   |

---

## 11. まとめ

### スキルの価値

1. **再現性の確保**: 誰が実行しても同じ結果が得られる仕様書を生成
2. **品質の担保**: 13 Phaseのゲートを通過することで品質を保証
3. **知識の蓄積**: 未タスクとして将来課題を体系的に管理
4. **自動化との連携**: スクリプトによる検証・完了処理の自動化

### 典型的なワークフロー

```
1. ユーザーが新機能開発を依頼
   ↓
2. createモードでタスク仕様書を自動生成（Phase 1〜13）
   ↓
3. executeモードで各Phaseを順次実行
   ↓
4. Phase 12で未タスクを検出・記録
   ↓
5. Phase 13でPR作成（ユーザー許可後）
   ↓
6. 未タスクは次回の開発サイクルで対応
```

### ベストプラクティス

| すべきこと                             | 理由                             |
| -------------------------------------- | -------------------------------- |
| Script優先（決定論的処理）             | 100%精度を保証                   |
| LLMは判断・創造のみ                    | スクリプトで代替不可能な部分のみ |
| Progressive Disclosure                 | コンテキスト効率化               |
| 各Phaseを独立Markdownとして出力        | 管理・追跡の容易さ               |
| 100人中100人が同じ理解で実行できる粒度 | 実行可能性の保証                 |
| Phase 12でPart 1を中学生レベルで書く   | 非技術者への理解促進             |

| 避けるべきこと                  | 問題点                 |
| ------------------------------- | ---------------------- |
| 全リソースを一度に読み込む      | コンテキスト浪費       |
| Script可能な処理をLLMに任せる   | 精度・再現性が低下     |
| `artifacts.json` の更新を忘れる | ワークフロー追跡が破綻 |
| 曖昧な表現で記述する            | 実行可能性が低下       |
| Part 1に専門用語を並べる        | 中学生に理解されない   |

---

## 参照リソース

| リソース             | パス                                       |
| -------------------- | ------------------------------------------ |
| 作成ワークフロー     | `references/create-workflow.md`            |
| 実行ワークフロー     | `references/execute-workflow.md`           |
| Phase 11/12ガイド    | `references/phase-11-12-guide.md`          |
| 未タスクガイドライン | `references/unassigned-task-guidelines.md` |
| 仕様更新フロー       | `references/spec-update-workflow.md`       |
| 品質基準             | `references/quality-standards.md`          |
| 成功/失敗パターン    | `references/patterns.md`                   |
