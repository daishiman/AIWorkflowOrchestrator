---
name: task-specification-creator
description: |
  タスクを単一責務原則で分解しPhase 1-13の実行可能な仕様書を生成。Phase 12は中学生レベル概念説明を含む。

  Anchors:
  • Clean Code / 適用: SRP / 目的: タスク分解基準
  • Continuous Delivery / 適用: フェーズゲート / 目的: 品質パイプライン
  • DDD / 適用: ユビキタス言語 / 目的: 用語統一

  Trigger:
  タスク仕様書作成, タスク分解, ワークフロー設計, Phase実行, IPC Bridge API統一, Preload APIパターン, safeInvoke, safeOn
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
| scripts/    | 12  | [resource-map.md#scripts](references/resource-map.md)    |
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

### 必須タスク（5タスク - 全て完了必須）

| Task | 名称                            | 必須 | 詳細参照                                    |
| ---- | ------------------------------- | ---- | ------------------------------------------- |
| 1    | 実装ガイド作成（2パート構成）   | ✅   | 下記参照                                    |
| 2    | システム仕様書更新（2ステップ） | ✅   | 下記参照                                    |
| 3    | ドキュメント更新履歴作成        | ✅   | scripts/generate-documentation-changelog.js |
| 4    | 未タスク検出レポート作成        | ✅   | **0件でも出力必須**                         |
| 5    | スキルフィードバックレポート作成 | ✅   | **改善点なしでも出力必須**                  |

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

| Step     | 必須 | 内容                                                                                                          |
| -------- | ---- | ------------------------------------------------------------------------------------------------------------- |
| Step 1-A | ✅   | タスク完了記録（「完了タスク」セクション追加 + 関連ドキュメントリンク + 変更履歴 + LOGS.md×2 + topic-map.md） |
| Step 1-B | ✅   | 実装状況テーブル更新（実装完了:「未実装」→「完了」 / 仕様書作成のみ: `spec_created`）                       |
| Step 1-C | ✅   | 関連タスクテーブル更新（仕様書内の「関連タスク」「未タスク候補」テーブルのステータス更新）                    |
| Step 2   | 条件 | システム仕様更新（新規インターフェース追加時のみ）                                                            |

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

| ソース                 | 確認項目                           |
| ---------------------- | ---------------------------------- |
| 元タスク仕様書         | 「スコープ外」として明示された項目 |
| Phase 3/10レビュー結果 | MINOR判定の指摘事項                |
| Phase 11手動テスト     | スコープ外の発見事項・改善提案     |
| コードコメント         | TODO/FIXME/HACK/XXX                |

```bash
# 未タスク検出スクリプト
node scripts/detect-unassigned-tasks.js --scan packages/shared/src --output .tmp/unassigned-candidates.json
```

📖 [references/phase-11-12-guide.md](references/phase-11-12-guide.md)
📖 [references/spec-update-workflow.md](references/spec-update-workflow.md)
📖 [agents/generate-unassigned-task.md](agents/generate-unassigned-task.md)

---

### Task 5: スキルフィードバックレポート（改善点なしでも出力必須）

| 観点 | 記録内容 |
| --- | --- |
| テンプレート改善 | Phaseテンプレートの漏れや曖昧さ |
| ワークフロー改善 | 機械検証や手順分岐の改善余地 |
| ドキュメント改善 | 再利用しやすい横断ガイドライン化の候補 |

出力:
- `outputs/phase-12/skill-feedback-report.md`

---

### Phase 12 実行時によくある漏れ

| 漏れパターン                              | 防止方法                                                                                        |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Step 1-C（関連タスクテーブル）を未実行    | spec-update-workflow.md の「確認すべきファイル」表を実行前に必ず読む                            |
| topic-map.md 未更新                       | 仕様書に新規セクション追加時は必ず topic-map.md のエントリも追加                                |
| documentation-changelog.md が不完全       | 全Step（1-A/1-B/1-C/Step 2）の結果を個別に明記する（「該当なし」も記録）                        |
| `spec-update-summary.md` を未作成で完了扱い | Phase 12成果物一覧と `outputs/phase-12/` 実体を1対1で突合し、不足ファイルは完了前に作成する        |
| LOGS.md が1ファイルのみ更新               | 必ず aiworkflow-requirements/LOGS.md と task-specification-creator/LOGS.md の両方               |
| 完了タスクセクションが簡略形式            | spec-update-workflow.md のテンプレート（テスト結果サマリー + 成果物テーブル）に従う             |
| `artifacts.json` と `outputs/artifacts.json` が不一致 | Phase 12完了前に2ファイルを同期し、completed成果物の参照切れを0件にする |
| Phase 10 MINOR指摘を未タスク化せず進行    | **Phase 10レビュー前に** unassigned-task-guidelines.md を読み、MINOR判定→未タスク化ルールを確認 |
| 未タスク検出レポートで0件判定のまま未修正 | Phase 10 MINOR指摘は必ず未タスク化の対象。「機能に影響なし」は不要判定の理由にならない          |
| `task-workflow.md` の未タスクリンクが参照切れ | Step 1-E後に `verify-unassigned-links.js` を実行して `ALL_LINKS_EXIST` を確認する                |

### Phase 12 苦戦防止Tips

> UT-STORE-HOOKS-COMPONENT-MIGRATION-001の経験に基づく（2026-02-12）

| Tips | 説明 |
| ---- | ---- |
| **事前に空欄チェックリストを作成** | documentation-changelog.mdにStep 1-A〜1-D + Step 2の各欄を空欄で事前作成し、逐次消化する |
| **spec-update-workflow.mdを常に参照** | Phase 12開始時に必ず [spec-update-workflow.md](references/spec-update-workflow.md) を開き、チェックリストを確認 |
| **「全Step確認前に完了と記載しない」厳守** | P4パターン。全Stepの結果を個別に記録してから「Phase 12完了」とする |
| **LOGS.md/SKILL.md は4ファイル更新** | aiworkflow-requirements/LOGS.md, task-specification-creator/LOGS.md, aiworkflow-requirements/SKILL.md, task-specification-creator/SKILL.md |
| **topic-map.md再生成はセクション変更時も** | 新規追加だけでなく、セクション更新・削除時も `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` と `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/{{FEATURE_NAME}} --regenerate` を実行 |

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

# 未タスク配置・フォーマット監査（Phase 12）
node scripts/audit-unassigned-tasks.js

# 未タスク参照リンク整合チェック（Phase 12 Step 1-E後）
node scripts/verify-unassigned-links.js

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

| Version | Date | Changes |
| --- | --- | --- |
| **v9.97.0** | **2026-02-28** | **TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001 再監査反映**: `outputs/phase-1`〜`phase-13` の成果物補完と `artifacts.json`/`outputs/artifacts.json` 同期を完了。Phase 12 必須成果物（implementation-guide/spec-update-summary/documentation-changelog/unassigned-task-detection-report/skill-feedback-report）の実体を固定し、未タスク差分判定（current=0, baseline分離）を再確認 |
| **v9.96.0** | **2026-02-27** | **TASK-9H 再確認運用を追補**: `references/patterns.md` に成功パターン「`phase-12-documentation.md` 完了同期」を追加。成果物5件実体確認→ステータス同期→検証4点セット固定の手順を標準化し、Phase 12 の未実施残置を防止 |
| **v9.95.0** | **2026-02-27** | **TASK-9H Phase 12再監査運用を反映**: `phase-4-test-creation.md` / `phase-5-implementation.md` の必須セクション「統合テスト連携」を明記し、`validate-phase-output` エラー2件を解消。`outputs/phase-12` 必須4成果物（`spec-update-summary.md`, `documentation-changelog.md`, `unassigned-task-detection.md`, `skill-feedback-report.md`）の作成ガードと検証証跡（current/baseline分離）を再確認 |
| **v9.97.0** | **2026-02-28** | **TASK-9I Phase 12再監査反映**: `documentation-changelog.md` の Step 進捗未同期を解消し、必須6仕様書（api-ipc/arch/security/overview/interfaces/task-workflow）を実装準拠へ更新。`UT-9I-001` / `UT-9I-002` 指示書を `docs/30-workflows/unassigned-task/` に新規作成し、未タスク3ステップ（指示書・残課題・関連仕様）を完了化 |
| **v9.97.0** | **2026-02-28** | **TASK-9J完了**: スキル使用統計・分析機能のバックエンド実装。Phase 1-12完了、テスト97件全PASS、カバレッジ全基準クリア。新規IPCチャンネル5つ、サービス2つ、型定義8インターフェース追加 |
| **v9.96.0** | **2026-02-27** | **TASK-9G Step 1-E追補**: 未タスク検出5件（UT-9G-001〜005）を `unassigned-task/` に正式登録し、`task-workflow.md` 残課題テーブル・`interfaces-agent-sdk-skill.md` 関連未タスクへ同期する運用を実適用。`unassigned-task-detection.md` の3ステップ完了化と `spec-update-summary` / `documentation-changelog` への追記を反映 |
| **v9.95.0** | **2026-02-27** | **TASK-9G Phase 12再同期反映**: 必須6仕様書更新（api-ipc/arch/security/overview/interfaces/task-workflow）と `outputs/phase-12` 必須5成果物の再生成手順を実適用。`artifacts.json` 実装パス誤記是正、`phase-12-documentation.md` チェックリスト同期、`outputs/phase-7〜13` 欠落成果物補完の運用を記録 |
| **v9.94.0** | **2026-02-27** | **UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001完了**: `quick_validate.js` name/description 空フィールドガード追加。P42準拠3段バリデーション適用、テスト21件追加、全85テストPASS。`references/spec-update-workflow.md` の既知課題リンクを `completed-tasks` 側へ同期。Issue #913 |
| **v9.94.0** | **2026-02-27** | **TASK-9F スキル共有・インポート機能 Phase 12 仕様同期**: api-ipc-agent.md（スキル共有IPCチャネル追加）、security-electron-ipc.md（skillShareAPIセキュリティパターン追加）、interfaces-agent-sdk-skill.md（スキル共有型定義10種追加）、task-workflow.md（TASK-9F完了記録）を更新 |
| **v9.93.0** | **2026-02-26** | **TASK-9B再監査の教訓反映**: `references/spec-update-workflow.md` に「IPC拡張済みでも旧チャンネル数のままでよい」誤判断パターンを追加し、更新漏れ防止チェックリストへ「チャンネル数/進捗型の実装-仕様一致確認」を追記 |
| **v9.92.9** | **2026-02-26** | **未タスク指示書メタ情報重複防止を追加**: `references/unassigned-task-guidelines.md` に `## メタ情報` 1セクション原則（YAML+表を同一セクションで管理）を追記。`rg -n "^## メタ情報"` による機械確認手順を標準化 |
| **v9.92.8** | **2026-02-26** | **UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 反映**: `references/spec-update-workflow.md` の曖昧語を除去して機械判定を安定化し、`references/phase-11-12-guide.md` に運用更新履歴を追記。Phase 11 手順書ウォークスルー証跡（`outputs/phase-11/walkthrough-log.md`）を必須成果物として定着 |
| **v9.92.7** | **2026-02-25** | **Phase 12再確認の運用ルール追補**: `references/spec-update-workflow.md` に `--target-file` の判定軸（`currentViolations.total`）と `validate-phase-output.js <workflow-dir>` の位置引数ルールを明記。`references/patterns.md` に scoped監査解釈と検証コマンド誤用防止パターンを追加 |
| **v9.92.6** | **2026-02-25** | **Phase 12参照整合ガードを追補**: `task-00-unified-implementation-sequence` の参照実在チェック（`task-013e`/`task-014` など）を Phase 12 更新手順へ追加。未タスク完了移管時に `task-workflow.md` のステータス（未実施/完了）と参照先（unassigned/completed）を同時更新するルールを明文化 |
| **v9.92.5** | **2026-02-25** | **Phase 12完了時の移管運用を反映**: Phase 12完了が確認できた場合、`docs/30-workflows/unassigned-task/` の当該未タスク指示書と、実行ワークフロー本体を `docs/30-workflows/completed-tasks/` へ移動し、`task-workflow.md` 残課題行を完了化する運用を適用 |
| **v9.92.4** | **2026-02-25** | **未タスク仕様書作成運用の追補**: `UT-IMP-PHASE12-VALIDATION-COMMAND-STANDARDIZATION-001` を9セクションテンプレート準拠で登録。Phase 12 再発防止（`quick_validate.js` 統一 / `verify-all-specs --workflow` 必須化）を未タスク化するフローを明文化 |
| **v9.92.3** | **2026-02-25** | **Phase 12最終整合（quick_validate経路統一）**: `references/spec-update-workflow.md` の SKILL検証コマンドを `ObsidianMemo` の `skill-creator/scripts/quick_validate.js` へ統一。`verify-all-specs.js` は `--workflow` 必須で実行する運用を再確認 |
| **v9.92.2** | **2026-02-25** | **Phase 12準拠再確認（skill-creator連携）**: `quick_validate.js`（system skill-creator）で `task-specification-creator` / `aiworkflow-requirements` の構造検証を再実施する運用を確定。`SKILL.md` の履歴圧縮後の再検証フローを標準化 |
| **v9.92.1** | **2026-02-25** | **履歴運用改善**: `SKILL.md` の変更履歴を直近中心に整理し、構造検証（500行上限）に適合。詳細な長期履歴は `LOGS.md` を正本として参照する方針へ統一 |
| **v9.92.0** | **2026-02-25** | **UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 再監査同期**: `references/spec-update-workflow.md` の baseline/current 判定手順を `--target-file` / `--diff-from` ベースへ更新 |
| **v9.91.0** | **2026-02-25** | **UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 実装反映**: `scripts/audit-unassigned-tasks.js` に `--target-file` / `--diff-from`、`currentViolations` / `baselineViolations` 分離、scoped 判定を追加 |
| **v9.90.0** | **2026-02-25** | **UT-IPC-AUTH-HANDLE-DUPLICATE-001 再確認反映**: `phase-11-12-guide.md` / `spec-update-workflow.md` にスキル構造検証チェックを追記（`quick_validate.js` ベース） |
| **v9.89.0** | **2026-02-25** | **再監査運用改善**: baseline/current 分離監査ルールを標準化し、全体FAILと差分FAILの誤判定を防止 |
| **v9.88.0** | **2026-02-25** | **Phase 1-12 実行反映**: 成果物出力完了、Phase 12 仕様同期、`artifacts.json` と `outputs/artifacts.json` 同期運用を明文化 |
| **v9.87.0** | **2026-02-25** | **Phase 12 再監査反映**: 未タスク登録・参照整合・成果物追補の運用ガードを更新 |
| **v9.86.0** | **2026-02-24** | **Phase 12 要件再整合**: 必須タスクを4→5へ修正し、漏れパターンに `spec-update-summary.md` と artifacts 同期不一致を追加 |
| **v9.85.0** | **2026-02-24** | **UT-IPC-DATA-FLOW-TYPE-GAPS-001 完了反映**: 仕様差分解消と検証結果を更新 |
| **v9.84.0** | **2026-02-24** | **UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 反映**: IPC命名パターンの体系化を仕様へ展開 |

> 補足: v9.83.2 以前の履歴は `LOGS.md` に保持（監査証跡を維持）。
