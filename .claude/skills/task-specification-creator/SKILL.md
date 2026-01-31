---
name: task-specification-creator
description: |
  タスクを単一責務原則で分解しPhase 1-13の実行可能な仕様書を生成。Phase 12は中学生レベル概念説明を含む。

  Anchors:
  • Clean Code / 適用: SRP / 目的: タスク分解基準
  • Continuous Delivery / 適用: フェーズゲート / 目的: 品質パイプライン
  • DDD / 適用: ユビキタス言語 / 目的: 用語統一

  Trigger:
  タスク仕様書作成, タスク分解, ワークフロー設計, Phase実行
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
---

# Task Specification Creator

開発タスクをPhase 1〜13の実行可能な仕様書に分解・生成。

## 設計原則

| 原則                   | 説明                                 |
| ---------------------- | ------------------------------------ |
| Script First           | 決定論的処理はスクリプト（100%精度） |
| LLM for Judgment       | 判断・創造のみLLM担当                |
| Progressive Disclosure | 必要時のみリソース読込               |

---

## クイックスタート

| モード            | 用途                 | 開始条件                           |
| ----------------- | -------------------- | ---------------------------------- |
| **create**        | 新規タスク仕様書作成 | ユーザーから新規タスク依頼（推奨） |
| execute           | Phase実行            | タスク仕様書に基づくPhase実行      |
| update            | 仕様書更新           | 既存仕様書の修正・更新             |
| detect-unassigned | 未タスク検出         | Phase 12での残課題検出             |

```bash
# モード判定
node scripts/detect-mode.js --request "{{USER_REQUEST}}"
```

---

## ワークフロー概要

### createモード

```
Phase 1〜3: 分析 → 生成 → 出力
      ↓
Phase 4〜5: 検証 → 完了
```

📖 [references/create-workflow.md](references/create-workflow.md)

### executeモード（Phase 1〜13）

| Phase | 名称                 | カテゴリ     |
| ----- | -------------------- | ------------ |
| 1     | 要件定義             | 要件         |
| 2     | 設計                 | 設計         |
| 3     | 設計レビューゲート   | ゲート       |
| 4     | テスト作成           | TDD-Red      |
| 5     | 実装                 | TDD-Green    |
| 6     | テスト拡充           | 品質         |
| 7     | テストカバレッジ確認 | 品質         |
| 8     | リファクタリング     | TDD-Refactor |
| 9     | 品質保証             | 品質         |
| 10    | 最終レビューゲート   | ゲート       |
| 11    | 手動テスト検証       | 検証         |
| 12    | ドキュメント更新     | 文書化       |
| 13    | PR作成               | 完了         |

📖 [references/execute-workflow.md](references/execute-workflow.md)

---

## リソース一覧

| カテゴリ    | 数  | 詳細参照                                                 |
| ----------- | --- | -------------------------------------------------------- |
| agents/     | 9   | [resource-map.md#agents](references/resource-map.md)     |
| references/ | 15  | [resource-map.md#references](references/resource-map.md) |
| scripts/    | 10  | [resource-map.md#scripts](references/resource-map.md)    |
| schemas/    | 8   | [resource-map.md#schemas](references/resource-map.md)    |
| assets/     | 9   | [resource-map.md#assets](references/resource-map.md)     |

📖 [references/resource-map.md](references/resource-map.md)

---

## 主要エントリポイント

| 用途             | リソース                           |
| ---------------- | ---------------------------------- |
| タスク分解       | agents/decompose-task.md           |
| Phase設計        | agents/design-phases.md            |
| 仕様書生成       | agents/generate-task-specs.md      |
| 品質検証         | agents/verify-specs.md             |
| システム仕様更新 | agents/update-system-specs.md      |
| 未タスク生成     | agents/generate-unassigned-task.md |
| フィードバック   | scripts/log-usage.js               |

---

## 機能別ガイド

| 機能                 | 参照先                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------ |
| 作成ワークフロー     | [references/create-workflow.md](references/create-workflow.md)                             |
| 実行ワークフロー     | [references/execute-workflow.md](references/execute-workflow.md)                           |
| テストカバレッジ基準 | [references/coverage-standards.md](references/coverage-standards.md)                       |
| Phase 11/12ガイド    | [references/phase-11-12-guide.md](references/phase-11-12-guide.md)                         |
| コマンドリファレンス | [references/commands.md](references/commands.md)                                           |
| 品質基準             | [references/quality-standards.md](references/quality-standards.md)                         |
| Phase別テンプレート  | [references/phase-templates.md](references/phase-templates.md)                             |
| レビューゲート基準   | [references/review-gate-criteria.md](references/review-gate-criteria.md)                   |
| 仕様更新フロー       | [references/spec-update-workflow.md](references/spec-update-workflow.md)                   |
| 技術ドキュメント作成 | [references/technical-documentation-guide.md](references/technical-documentation-guide.md) |
| 成果物命名規則       | [references/artifact-naming-conventions.md](references/artifact-naming-conventions.md)     |
| 未タスクガイドライン | [references/unassigned-task-guidelines.md](references/unassigned-task-guidelines.md)       |
| 成功/失敗パターン    | [references/patterns.md](references/patterns.md)                                           |
| 自己改善サイクル     | [references/self-improvement-cycle.md](references/self-improvement-cycle.md)               |

### システム開発観点チェック

各Phaseでタスクの性質に応じて、以下の観点をAIが判断して確認する：

| 観点               | 仕様参照先（aiworkflow-requirements） |
| ------------------ | ------------------------------------- |
| セキュリティ       | `security-*.md`                       |
| UI/UX（Apple HIG） | `ui-ux-*.md`                          |
| アーキテクチャ     | `architecture-*.md`                   |
| API設計            | `api-*.md`                            |
| データ整合性       | `database-*.md`                       |
| エラーハンドリング | `error-handling.md`                   |
| インターフェース   | `interfaces-*.md`                     |

### Electronデスクトップアプリ観点（本プロジェクト固有）

| 層                             | 責務                               | 仕様参照先                      |
| ------------------------------ | ---------------------------------- | ------------------------------- |
| **フロントエンド（Renderer）** | UI表示、状態管理                   | `ui-ux-*.md`, `interfaces-*.md` |
| **バックエンド（Main）**       | ビジネスロジック、システムアクセス | `architecture-*.md`             |
| **IPC通信**                    | Main-Renderer間通信                | `api-*.md`, `interfaces-*.md`   |
| **Preload**                    | セキュアなAPI公開                  | `security-api-electron.md`      |
| **ローカルストレージ**         | SQLite、ファイル管理               | `database-*.md`                 |

📖 詳細: [references/quality-standards.md](references/quality-standards.md) セクション8

---

## Task仕様ナビ

| Task                     | 責務                       | パターン | 入力             | 出力                  |
| ------------------------ | -------------------------- | -------- | ---------------- | --------------------- |
| decompose-task           | タスクを単一責務に分解     | seq      | ユーザー要求     | タスク分解リスト      |
| identify-scope           | スコープ・前提・制約を定義 | seq      | タスク分解リスト | スコープ定義          |
| design-phases            | Phase構成を設計            | seq      | スコープ定義     | フェーズ設計書        |
| generate-task-specs      | タスク仕様書を生成         | seq      | フェーズ設計書   | タスク仕様書一覧      |
| output-phase-files       | 個別Markdownファイルを出力 | par      | タスク仕様書一覧 | phase-\*.md           |
| update-dependencies      | Phase間の依存関係を設定    | par      | タスク仕様書一覧 | 依存関係マップ        |
| verify-specs             | 全13仕様書の品質検証       | seq      | 検証レポート     | PASS/FAIL判定         |
| update-system-specs      | システム仕様書を更新       | seq      | 実装サマリー     | 更新完了チェック      |
| generate-unassigned-task | 未完了タスク指示書を生成   | cond     | レビュー課題     | unassigned-task/\*.md |

凡例: `seq`=順次実行, `par`=並列実行, `cond`=条件分岐

---

## Phase 12 重要仕様

### 必須タスク（4タスク - 全て完了必須）

| Task | 名称                            | 必須 | 詳細参照                                    |
| ---- | ------------------------------- | ---- | ------------------------------------------- |
| 1    | 実装ガイド作成（2パート構成）   | ✅   | 下記参照                                    |
| 2    | システム仕様書更新（2ステップ） | ✅   | 下記参照                                    |
| 3    | ドキュメント更新履歴作成        | ✅   | scripts/generate-documentation-changelog.js |
| 4    | 未タスク検出レポート作成        | ✅   | **0件でも出力必須**                         |

---

### Task 1: 実装ガイドの2パート構成

| パート     | 対象読者                 | 内容                                       |
| ---------- | ------------------------ | ------------------------------------------ |
| **Part 1** | **初学者・中学生レベル** | **概念説明（日常の例え話、専門用語なし）** |
| **Part 2** | **開発者・技術者**       | **技術的詳細（スキーマ・API・コード例）**  |

**Part 1（中学生レベル）の必須要件**:

- 日常生活での例え話を**必ず**含める
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**Part 2（技術者レベル）の必須要件**:

- インターフェース/型定義（TypeScript）を含める
- APIシグネチャと使用例を記載
- エラーハンドリングとエッジケースを説明
- 設定可能なパラメータと定数を一覧化

---

### Task 2: システム仕様更新【4サブステップ + 条件付きStep 2】

| Step   | 必須 | 内容                                                                            |
| ------ | ---- | ------------------------------------------------------------------------------- |
| Step 1-A | ✅   | タスク完了記録（「完了タスク」セクション追加 + 関連ドキュメントリンク + 変更履歴 + LOGS.md×2 + topic-map.md） |
| Step 1-B | ✅   | 実装状況テーブル更新（api-endpoints.md等の「未実装」→「完了」）                |
| Step 1-C | ✅   | 関連タスクテーブル更新（仕様書内の「関連タスク」「未タスク候補」テーブルのステータス更新） |
| Step 2   | 条件 | システム仕様更新（新規インターフェース追加時のみ）                              |

> **⚠️ Task 1（実装ガイド作成）との境界に注意**
>
> | 活動                             | Task 1（実装ガイド） | Task 2（仕様更新） |
> | -------------------------------- | -------------------- | ------------------ |
> | Part 1/2 実装ガイド作成          | ✅ メイン責務        | ❌ 対象外          |
> | aiworkflow-requirements 仕様更新 | ❌ 対象外            | ✅ Step 2          |
> | タスク完了記録（仕様書内）       | ❌ 対象外            | ✅ Step 1-A 必須   |
> | LOGS.md更新（2ファイル）         | ❌ 対象外            | ✅ Step 1-A 必須   |

**Step 2 更新が必要な場合**:

- 新規インターフェース/型の追加
- 既存インターフェースの変更
- 新規定数/設定値の追加
- API仕様の変更

**Step 2 更新が不要な場合**:

- 内部実装の詳細変更のみ
- リファクタリング（インターフェース不変）
- バグ修正（仕様変更なし）

---

### Task 4: 未タスク検出（0件でも出力必須）

| ソース                 | 確認項目                    |
| ---------------------- | --------------------------- |
| 元タスク仕様書         | 「スコープ外」として明示された項目 |
| Phase 3/10レビュー結果 | MINOR判定の指摘事項         |
| Phase 11手動テスト     | スコープ外の発見事項・改善提案 |
| コードコメント         | TODO/FIXME/HACK/XXX         |

```bash
# 未タスク検出スクリプト
node scripts/detect-unassigned-tasks.js --scan packages/shared/src --output .tmp/unassigned-candidates.json
```

📖 [references/phase-11-12-guide.md](references/phase-11-12-guide.md)
📖 [references/spec-update-workflow.md](references/spec-update-workflow.md)
📖 [agents/generate-unassigned-task.md](agents/generate-unassigned-task.md)

---

### Phase 12 実行時によくある漏れ

| 漏れパターン                          | 防止方法                                                                         |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| Step 1-C（関連タスクテーブル）を未実行 | spec-update-workflow.md の「確認すべきファイル」表を実行前に必ず読む             |
| topic-map.md 未更新                   | 仕様書に新規セクション追加時は必ず topic-map.md のエントリも追加                 |
| documentation-changelog.md が不完全   | 全Step（1-A/1-B/1-C/Step 2）の結果を個別に明記する（「該当なし」も記録）         |
| LOGS.md が1ファイルのみ更新           | 必ず aiworkflow-requirements/LOGS.md と task-specification-creator/LOGS.md の両方 |
| 完了タスクセクションが簡略形式        | spec-update-workflow.md のテンプレート（テスト結果サマリー + 成果物テーブル）に従う |

---

## 重要ルール

### Phase完了時の必須アクション

1. **タスク完全実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

### PR作成に関する注意

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

📖 [references/commands.md](references/commands.md) - コマンド一覧

---

## よく使うコマンド

```bash
# 全体整合性検証（Phase 5）
node scripts/verify-all-specs.js --workflow docs/30-workflows/{{FEATURE_NAME}}

# Phase完了処理
node scripts/complete-phase.js --workflow docs/30-workflows/{{FEATURE_NAME}} --phase {{N}} --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"

# 未タスク検出（Phase 12）
node scripts/detect-unassigned-tasks.js --scan packages/shared/src --output .tmp/unassigned-candidates.json

# 使用ログ記録
node scripts/log-usage.js --result success --phase "Phase {{N}}"
```

📖 [references/commands.md](references/commands.md) - 全コマンド一覧

---

## ベストプラクティス

### すべきこと

| 推奨事項                               | 理由                             |
| -------------------------------------- | -------------------------------- |
| Script優先（決定論的処理）             | 100%精度を保証                   |
| LLMは判断・創造のみ                    | スクリプトで代替不可能な部分のみ |
| Progressive Disclosure                 | コンテキスト効率化               |
| 各Phaseを独立Markdownとして出力        | 管理・追跡の容易さ               |
| 100人中100人が同じ理解で実行できる粒度 | 実行可能性の保証                 |
| Phase 12でPart 1を中学生レベルで書く   | 非技術者への理解促進             |

### 避けるべきこと

| 禁止事項                        | 問題点                 |
| ------------------------------- | ---------------------- |
| 全リソースを一度に読み込む      | コンテキスト浪費       |
| Script可能な処理をLLMに任せる   | 精度・再現性が低下     |
| `artifacts.json` の更新を忘れる | ワークフロー追跡が破綻 |
| 曖昧な表現で記述する            | 実行可能性が低下       |
| Part 1に専門用語を並べる        | 中学生に理解されない   |

---

## フィードバック（必須）

実行後は必ず記録:

```bash
node scripts/log-usage.js --result success --phase "Phase {{N}}"
node scripts/log-usage.js --result failure --phase "Phase {{N}}" --error "{{ERROR_TYPE}}"
```

---

## 変更履歴

| Version    | Date           | Changes                                                                                                                                                                                                                                                                      |
| ---------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **9.17.0** | **2026-01-31** | **Phase 12改善拡充: Task 2テーブル4サブステップ化（Step 1-A/1-B/1-C/Step 2）、Task 1 vs Task 2境界テーブル追加、よくある漏れパターン5件追加、documentation-changelog-template.md新規作成、implementation-guide-template.md UIコンポーネントパターン追加、spec-update-workflow.md具体例（TASK-IMP）追加** |
| **9.16.0** | **2026-01-31** | **spec-update-workflow.md改善**: Step 1完了チェックリスト追加（詳細テンプレート必須明記）、permissionキーワードマッピング追加、詳細完了記録テンプレート参照の強化（task-imp-permission-readable-ui-001フィードバック反映） |
| **9.15.0** | **2026-01-30** | **task-imp-permission-readable-ui-001完了**: Phase 1-12全工程完了。permissionDescriptions.ts新規作成、PermissionDialog.tsx人間可読UI統合、53テスト・100%カバレッジ。4件の未タスク検出・仕様書作成 |
| 9.14.0 | 2026-01-30 | Phase 12 Step 1-C追加: 関連タスクテーブルのステータス更新手順を追加。arch-state-management.md等の「関連タスク」テーブル更新漏れ防止（TASK-7Bフィードバック反映） |
| 9.13.0 | 2026-01-29 | 未タスク指示書テンプレート準拠修正: U3/U4/U5に欠落していたSection 4(実行手順)/6(検証方法)/7(リスクと対策)を追加し9セクション完全準拠化（TASK-CI-FIX-001品質改善） |
| 9.12.0 | 2026-01-29 | 機能キーワードマッピング拡充: technology-backend.md/technology-devops.md向けキーワード追加（eslint, lint, ci, devops, backend, next.js等）（TASK-CI-FIX-001フィードバック反映） |
| 9.11.0     | 2026-01-28     | 未タスク検出ソース拡充: 元タスク仕様書の「スコープ外」項目を検出ソースに追加、Phase 11改善提案も対象に（TASK-3-2-Dフィードバック反映）                                                                                                                                     |
| 9.10.0     | 2026-01-27     | 両ブランチ統合: Phase 12 Task 3改善（artifacts.json更新統合、complete-phase.js実行例、フォールバック手順）+ TASK-3-2-A成功パターン追加（patterns.md 5件追加）+ TASK-WCE-UI-001フィードバック反映（LOGS.md 2ファイル更新要件明記）                                              |
| 9.9.0      | 2026-01-27     | TASK-3-2-A成功パターン追加: patterns.mdに5件の成功パターン追加（UX改善R-ID方式、Part 1日常例えパターン、ユーティリティ関数分離、将来改善候補の未タスク仕様書変換）                                                                                                           |
| 9.8.0      | 2026-01-27     | Phase 12 Task 3改善: artifacts.json更新をTask 3に統合、complete-phase.js実行例追加、フォールバック手順にartifacts.json手動作成参照先追加（TASK-5-1フィードバック反映）+ spec-update-workflow.mdにtask-specification-creator/LOGS.md更新手順追加                              |
| 9.7.1      | 2026-01-27     | spec-update-workflow.md改善: Phase 12 Step 1でaiworkflow-requirements/LOGS.mdとtask-specification-creator/LOGS.mdの両方を更新する要件を明記（TASK-WCE-UI-001フィードバック反映）                                                                                             |
| 9.7.0      | 2026-01-26     | 第3次整合性検証修正: SKILL.mdコマンド例修正(complete-phase.js --artifacts追加、detect-unassigned-tasks.js引数修正)、phase-templates.mdファイル名typo修正、spec-update-workflow.md外部スキル拡張子修正(.js→.mjs)、generate-task-specs.md出力先追加、verify-specs.md入力元明記 |
| 9.6.0      | 2026-01-26     | 追加整合性修正: identify-scope出力先追加、verification-report.json additionalProperties追加、ファイル名documentation-changelog.md統一                                                                                                                                        |
| 9.5.0      | 2026-01-26     | 全ファイル整合性検証: スキーマ/テンプレート不整合修正(identify-scope, design-phases)、commands.md引数仕様修正、Phase 12 4タスク構成統一、mode.json additionalProperties追加                                                                                                  |
| 9.4.0      | 2026-01-26     | 整合性検証修正: identify-scope.mdスキーマ参照修正(scope-definition.json)、phase-templates.mdサブタスク命名統一(Task N)、verify-all-specs.js ESM互換性修正                                                                                                                    |
| 9.3.0      | 2026-01-26     | skill-creatorリファクタリング: 未リンクreferences 4件を機能別ガイドに追加、commands.mdにgenerate-index.js追加、検証0エラー0警告達成                                                                                                                                          |
| 9.2.1      | 2026-01-26     | アーキテクチャ層別観点をPhase 5（実装）・Phase 12（ドキュメント）テンプレートに追加: 実装ファイル配置・ドキュメント内容の層別ガイド                                                                                                                                          |
| 9.2.0      | 2026-01-26     | Electronデスクトップアプリ観点追加: フロントエンド(Renderer)/バックエンド(Main)/IPC/Preload/ローカルストレージの層別チェック観点をPhase 1,2,4テンプレートに追加                                                                                                              |
| 9.1.0      | 2026-01-26     | システム開発観点チェック追加: セキュリティ/UI・UX/アーキテクチャ等の多角的観点をPhase共通テンプレートに追加、aiworkflow-requirements連携強化                                                                                                                                 |
| 9.0.2      | 2026-01-26     | Phase 12重要仕様を拡充: Part 2必須要件、未タスク検出、3ステップ仕様更新を追加                                                                                                                                                                                                |
| 9.0.1      | 2026-01-26     | 不足リソース追加: schemas/2, scripts/1, assets/1（合計+4ファイル）                                                                                                                                                                                                           |
| 9.0.0      | 2026-01-26     | skill-creator v7.0.1準拠: description最適化、情報保持しながらプロンプト圧縮                                                                                                                                                                                                  |
| 8.0.1      | 2026-01-26     | resource-map.md参照カウント修正                                                                                                                                                                                                                                              |
| 8.0.0      | 2026-01-26     | skill-creator v7準拠: 597→350行（41%削減）                                                                                                                                                                                                                                   |
| 7.13.0     | 2026-01-26     | patterns.md改善: Phase 12出力要件漏れパターン追加、成功パターンにPhase 12出力チェックリスト追加（TASK-3-1-Dフィードバック反映）                                                                                                                                              |
| 7.12.0     | 2026-01-25     | spec-update-workflow.md改善: 新規クラス/コンポーネント追加時のチェックリスト追加、「型は別タスクで追加済み」誤判断パターン追加（TASK-3-2フィードバック反映）                                                                                                                 |
| 7.11.0     | 2026-01-25     | spec-update-workflow.md改善: Step 1にLOGS.md・topic-map.md更新手順を追加（Phase 12ドキュメント更新漏れ防止）                                                                                                                                                                 |
| 7.10.1     | 2026-01-25     | unassigned-task-guidelines.md修正: 未タスク検出レポートファイル名をunassigned-task-detection.mdに統一（Phase 12タスク仕様との整合性確保）                                                                                                                                    |
| 7.10.0     | 2026-01-25     | spec-update-workflow.md改善: 実装状況テーブル更新を必須アクションとして明記、Step 1-B追加、よくある誤判断パターン表追加（Phase 12誤判断防止強化）                                                                                                                            |
| 7.9.0      | 2026-01-25     | Phase 12仕様ファイル特定ロジック強化: 機能キーワードから仕様ファイルへのマッピング表追加、混同しやすいファイル対照表追加、思考プロセスにステップ0/0.5追加                                                                                                                    |
| 7.8.0      | 2026-01-23     | update-system-specs.md標準フォーマット化: 5セクション構造化（メタ情報/プロフィール/知識ベース/実行仕様/インターフェース）、思考プロセステーブル追加、patterns.md新規作成                                                                                                     |
| 7.7.0      | 2026-01-23     | Phase 12 Step 1検証強化: validate-phase12-step1.js追加、Step 1必須性を「検証タスクでも必須」と明記、検証コマンド使用例追加                                                                                                                                                   |
| 7.6.0      | 2026-01-22     | Phase 12テンプレート強化: 完了条件にPhase 12-2の3ステップチェックリスト追加、フォールバック手順セクション追加、spec-update-workflow.md参照リンク追加                                                                                                                         |
| 7.5.0      | 2026-01-22     | Phase 12改善: Task 2を2ステップ化（タスク完了記録必須＋仕様更新条件付き）、Task 3自動生成スクリプト追加、spec-update-workflow.md明確化                                                                                                                                       |
| 7.4.0      | 2026-01-18     | Phase 12 Task 2強化: システム仕様更新チェックリスト追加、変更タイプ別マッピング追加、更新漏れ防止ガイダンス強化                                                                                                                                                              |
| 7.3.0      | 2026-01-17     | Phase 12-2システム仕様更新ガイダンス強化: spec-update-workflow.mdに更新判断基準・フローチャート追加、aiworkflow-requirements更新タイミング明確化                                                                                                                             |
| 7.2.0      | 2026-01-17     | Phase 11/12実行ガイダンス追加: テスト結果レポート形式、未タスク検出レポート形式（0件含む）、システム仕様書更新手順                                                                                                                                                           |
| 7.1.0      | 2026-01-17     | Phase 5「全体整合性検証」追加: verify-all-specs.js（自動13ファイル一括検証）、verify-specs.md（LLM品質検証）、verification-report.json追加                                                                                                                                   |
| 7.0.0      | 2026-01-17     | skill-creator v5.3準拠リファクタリング: Progressive Disclosure完全化、スクリプト拡張子.js統一、リソースマップ整理                                                                                                                                                            |
| 6.1.0      | 2026-01-14     | タスク完了ワークフロー追加: unassigned-task→completed-tasks移動・ステータス更新                                                                                                                                                                                              |
| 6.0.0      | 2026-01-13     | skill-creator最新仕様準拠リファクタリング: Script First原則明確化、Progressive Disclosure完全対応、schemas/追加、Self-Improvement基盤追加                                                                                                                                    |
| 5.1.0      | 2026-01-13     | Phase 12-2システムドキュメント更新を強化                                                                                                                                                                                                                                     |
| 5.0.0      | 2026-01-10     | スキル選定機能削除、シンプル化                                                                                                                                                                                                                                               |
| 4.0.0      | 2026-01-06     | Git Worktree削除、結合テストカバレッジ基準追加                                                                                                                                                                                                                               |
| 3.1.0      | 2026-01-07     | Phase 6追加（テスト拡充）、統合テスト連携必須化                                                                                                                                                                                                                              |
| 3.0.0      | 2026-01-06     | Phase再構成（1-13）、/ai:diff-to-pr統合                                                                                                                                                                                                                                      |
