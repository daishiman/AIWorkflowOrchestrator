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
開発タスクを Phase 1〜13 の実行可能な仕様書へ落とし込む。`SKILL.md` は入口だけを持ち、詳細は `references/` と `LOGS.md` に分離する。
## 設計原則

| 原則 | 説明 |
| --- | --- |
| Script First | 決定論的処理は `scripts/` で固定する |
| LLM for Judgment | 判断、設計、レビューだけを LLM が担う |
| Progressive Disclosure | 必要な reference だけを段階的に読む |
| 1 File = 1 Responsibility | 大きくなった guide は family file へ分離する |
| `.claude` Canonical | 正本は `.claude/skills/...`、`.agents/skills/...` は mirror |
## クイックスタート

| モード | 用途 | 最初に読むもの |
| --- | --- | --- |
| `create` | 新規 workflow を作る | [references/create-workflow.md](references/create-workflow.md) |
| `execute` | Phase 1〜13 を順番に実行する | [references/execute-workflow.md](references/execute-workflow.md) |
| `update` | 既存仕様書を修正する | [references/phase-templates.md](references/phase-templates.md) |
| `detect-unassigned` | Phase 12 の残課題を formalize する | [references/phase-12-documentation-guide.md](references/phase-12-documentation-guide.md) |
```bash
node scripts/detect-mode.js --request "{{USER_REQUEST}}"
```

## 実行フロー

### create

1. `agents/decompose-task.md` で責務を分解する。
2. `agents/identify-scope.md` で前提、制約、受入条件を固定する。
3. `agents/design-phases.md` と `agents/generate-task-specs.md` で `index.md` と `phase-*.md` を作る。
4. `agents/output-phase-files.md` と `agents/update-dependencies.md` で `artifacts.json` を整える。
5. `agents/verify-specs.md`、`scripts/validate-phase-output.js`、`scripts/verify-all-specs.js` で gate を通す。

### execute

| Phase | 名称 | 目的 |
| --- | --- | --- |
| 1 | 要件定義 | scope、受入条件、inventory を固定する |
| 2 | 設計 | topology、SubAgent lane、validation path を設計する |
| 3 | 設計レビュー | Phase 4 へ進めるかを判定する |
| 4 | テスト作成 | command suite と expected result を作る |
| 5 | 実装 | `.claude` 正本を更新し、mirror を同期する |
| 6 | テスト拡充 | fail path、回帰 guard、補助 command を追加する |
| 7 | カバレッジ確認 | concern と dependency edge の coverage を可視化する |
| 8 | リファクタリング | duplicate と navigation drift を削る |
| 9 | 品質保証 | line budget、link、mirror parity を一括判定する |
| 10 | 最終レビュー | acceptance criteria と blocker を判定する |
| 11 | 手動テスト | docs navigation と UI evidence を人手で確認する |
| 12 | ドキュメント更新 | implementation guide、spec sync、未タスク、feedback を完了する |
| 13 | PR作成 | user の明示承認後のみ実施する |

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

| Task | 名称                             | 必須 | 詳細参照                                    |
| ---- | -------------------------------- | ---- | ------------------------------------------- |
| 1    | 実装ガイド作成（2パート構成）    | ✅   | 下記参照                                    |
| 2    | システム仕様書更新（2ステップ）  | ✅   | 下記参照                                    |
| 3    | ドキュメント更新履歴作成         | ✅   | scripts/generate-documentation-changelog.js |
| 4    | 未タスク検出レポート作成         | ✅   | **0件でも出力必須**                         |
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
| Step 1-B | ✅   | 実装状況テーブル更新（実装完了:「未実装」→「完了」 / 仕様書作成のみ: `spec_created`）                         |
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

| 観点             | 記録内容                               |
| ---------------- | -------------------------------------- |
| テンプレート改善 | Phaseテンプレートの漏れや曖昧さ        |
| ワークフロー改善 | 機械検証や手順分岐の改善余地           |
| ドキュメント改善 | 再利用しやすい横断ガイドライン化の候補 |

出力:

- `outputs/phase-12/skill-feedback-report.md`

---

### Phase 12 実行時によくある漏れ

| 漏れパターン                                          | 防止方法                                                                                        |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Step 1-C（関連タスクテーブル）を未実行                | spec-update-workflow.md の「確認すべきファイル」表を実行前に必ず読む                            |
| topic-map.md 未更新                                   | 仕様書に新規セクション追加時は必ず topic-map.md のエントリも追加                                |
| documentation-changelog.md が不完全                   | 全Step（1-A/1-B/1-C/Step 2）の結果を個別に明記する（「該当なし」も記録）                        |
| `spec-update-summary.md` を未作成で完了扱い           | Phase 12成果物一覧と `outputs/phase-12/` 実体を1対1で突合し、不足ファイルは完了前に作成する     |
| LOGS.md が1ファイルのみ更新                           | 必ず aiworkflow-requirements/LOGS.md と task-specification-creator/LOGS.md の両方               |
| 完了タスクセクションが簡略形式                        | spec-update-workflow.md のテンプレート（テスト結果サマリー + 成果物テーブル）に従う             |
| `artifacts.json` と `outputs/artifacts.json` が不一致 | Phase 12完了前に2ファイルを同期し、completed成果物の参照切れを0件にする                         |
| Phase 10 MINOR指摘を未タスク化せず進行                | **Phase 10レビュー前に** unassigned-task-guidelines.md を読み、MINOR判定→未タスク化ルールを確認 |
| 未タスク検出レポートで0件判定のまま未修正             | Phase 10 MINOR指摘は必ず未タスク化の対象。「機能に影響なし」は不要判定の理由にならない          |
| `task-workflow.md` の未タスクリンクが参照切れ         | Step 1-E後に `verify-unassigned-links.js` を実行して `ALL_LINKS_EXIST` を確認する               |

### Phase 12 苦戦防止Tips

> UT-STORE-HOOKS-COMPONENT-MIGRATION-001の経験に基づく（2026-02-12）

| Tips                                       | 説明                                                                                                                                                                                                                                                                 |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **事前に空欄チェックリストを作成**         | documentation-changelog.mdにStep 1-A〜1-D + Step 2の各欄を空欄で事前作成し、逐次消化する                                                                                                                                                                             |
| **spec-update-workflow.mdを常に参照**      | Phase 12開始時に必ず [spec-update-workflow.md](references/spec-update-workflow.md) を開き、チェックリストを確認                                                                                                                                                      |
| **「全Step確認前に完了と記載しない」厳守** | P4パターン。全Stepの結果を個別に記録してから「Phase 12完了」とする                                                                                                                                                                                                   |
| **LOGS.md/SKILL.md は4ファイル更新**       | aiworkflow-requirements/LOGS.md, task-specification-creator/LOGS.md, aiworkflow-requirements/SKILL.md, task-specification-creator/SKILL.md                                                                                                                           |
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
| Task | 責務 | パターン | 入力 | 出力 |
| --- | --- | --- | --- | --- |
| `decompose-task` | タスクを単一責務に分割 | `seq` | ユーザー要求 | タスク分解リスト |
| `identify-scope` | スコープ、前提、制約を定義 | `seq` | 分解結果 | スコープ定義 |
| `design-phases` | phase 構成と gate を設計 | `seq` | scope | phase 設計書 |
| `generate-task-specs` | `index.md` と `phase-*.md` を生成 | `seq` | phase 設計書 | workflow 仕様一式 |
| `output-phase-files` | phase ファイルを出力 | `par` | 仕様データ | `phase-*.md` |
| `update-dependencies` | `artifacts.json` と依存関係を更新 | `par` | phase 一式 | 依存マップ |
| `verify-specs` | workflow 全体をレビュー | `seq` | 仕様一式 | PASS/FAIL |
| `update-system-specs` | Phase 12 Task 2 を遂行 | `seq` | 実装結果 | 仕様同期結果 |
| `generate-unassigned-task` | 残課題を task spec 化 | `cond` | review 指摘 | `unassigned-task/*.md` |

凡例: `seq` = 順次、`par` = 並列、`cond` = 条件分岐。

## agent 導線

- [agents/decompose-task.md](agents/decompose-task.md)
- [agents/identify-scope.md](agents/identify-scope.md)
- [agents/design-phases.md](agents/design-phases.md)
- [agents/generate-task-specs.md](agents/generate-task-specs.md)
- [agents/output-phase-files.md](agents/output-phase-files.md)
- [agents/update-dependencies.md](agents/update-dependencies.md)
- [agents/verify-specs.md](agents/verify-specs.md)
- [agents/update-system-specs.md](agents/update-system-specs.md)
- [agents/generate-unassigned-task.md](agents/generate-unassigned-task.md)

## Phase 12 と Phase 13 の境界

| Task | 完了条件 | 詳細 |
| --- | --- | --- |
| Task 12-1 | `implementation-guide.md` が Part 1/2 を満たす | [references/phase-12-documentation-guide.md](references/phase-12-documentation-guide.md) |
| Task 12-2 | Step 1 と Step 2 の判定が記録される | [references/spec-update-workflow.md](references/spec-update-workflow.md) |
| Task 12-3 | `documentation-changelog.md` と artifacts が同期される | [references/spec-update-validation-matrix.md](references/spec-update-validation-matrix.md) |
| Task 12-4 | 0件でも `unassigned-task-detection.md` を出し、`current/baseline` を分離して記録する | [references/unassigned-task-guidelines.md](references/unassigned-task-guidelines.md) |
| Task 12-5 | 改善点なしでも `skill-feedback-report.md` を出し、`phase12-task-spec-compliance-check.md` を root evidence として残す | [references/patterns-phase12-sync.md](references/patterns-phase12-sync.md) |
| Phase 13 | commit と PR は user の明示承認後だけ | [references/review-gate-criteria.md](references/review-gate-criteria.md) |

UI/UX 実装を含む task では Phase 11 で screenshot と Apple UI/UX 視覚検証を行う。手順は [references/phase-11-screenshot-guide.md](references/phase-11-screenshot-guide.md) と [references/screenshot-verification-procedure.md](references/screenshot-verification-procedure.md) を使う。

## リソース導線

### core workflow

- [references/resource-map.md](references/resource-map.md)
- [references/create-workflow.md](references/create-workflow.md)
- [references/execute-workflow.md](references/execute-workflow.md)
- [references/commands.md](references/commands.md)
- [references/quality-standards.md](references/quality-standards.md)
- [references/coverage-standards.md](references/coverage-standards.md)
- [references/review-gate-criteria.md](references/review-gate-criteria.md)
- [references/artifact-naming-conventions.md](references/artifact-naming-conventions.md)
- [references/evidence-sync-rules.md](references/evidence-sync-rules.md)
- [references/self-improvement-cycle.md](references/self-improvement-cycle.md)

### phase templates

- [references/phase-templates.md](references/phase-templates.md)
- [references/phase-template-core.md](references/phase-template-core.md)
- [references/phase-template-execution.md](references/phase-template-execution.md)
- [references/phase-template-phase11.md](references/phase-template-phase11.md)
- [references/phase-template-phase12.md](references/phase-template-phase12.md)
- [references/phase-template-phase13.md](references/phase-template-phase13.md)

### Phase 11/12 guides

- [references/phase-11-12-guide.md](references/phase-11-12-guide.md)
- [references/phase-11-screenshot-guide.md](references/phase-11-screenshot-guide.md)
- [references/phase-12-documentation-guide.md](references/phase-12-documentation-guide.md)
- [references/phase12-checklist-definition.md](references/phase12-checklist-definition.md)
- [references/technical-documentation-guide.md](references/technical-documentation-guide.md)
- [references/screenshot-verification-procedure.md](references/screenshot-verification-procedure.md)
- [assets/phase12-task-spec-compliance-template.md](assets/phase12-task-spec-compliance-template.md)

### spec update

- [references/spec-update-workflow.md](references/spec-update-workflow.md)
- [references/spec-update-step1-completion.md](references/spec-update-step1-completion.md)
- [references/spec-update-step2-domain-sync.md](references/spec-update-step2-domain-sync.md)
- [references/spec-update-validation-matrix.md](references/spec-update-validation-matrix.md)

### pattern family

- [references/patterns.md](references/patterns.md)
- [references/patterns-workflow-generation.md](references/patterns-workflow-generation.md)
- [references/patterns-validation-and-audit.md](references/patterns-validation-and-audit.md)
- [references/patterns-phase12-sync.md](references/patterns-phase12-sync.md)

### logs and archives

- [LOGS.md](LOGS.md)
- [references/logs-archive-index.md](references/logs-archive-index.md)
- [references/logs-archive-2026-march.md](references/logs-archive-2026-march.md)
- [references/logs-archive-2026-feb.md](references/logs-archive-2026-feb.md)
- [references/logs-archive-legacy.md](references/logs-archive-legacy.md)
- [references/changelog-archive.md](references/changelog-archive.md)

## システム観点チェック

| 観点 | aiworkflow-requirements 側の参照先 |
| --- | --- |
| セキュリティ | `security-*.md` |
| UI/UX | `ui-ux-*.md` |
| アーキテクチャ | `architecture-*.md` |
| API/IPC | `api-*.md` |
| データ整合性 | `database-*.md` |
| エラーハンドリング | `error-handling.md` |
| インターフェース | `interfaces-*.md` |

Electron desktop task では Renderer、Main、IPC、Preload、ローカルストレージの境界を都度明記する。詳細は [references/quality-standards.md](references/quality-standards.md) を参照。

## 検証コマンド

```bash
node scripts/validate-phase-output.js docs/30-workflows/{{FEATURE_NAME}}
node scripts/verify-all-specs.js --workflow docs/30-workflows/{{FEATURE_NAME}}
node ../skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node ../skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
node scripts/log-usage.js --result success --phase "Phase {{N}}"
```

Phase 12 では追加で `detect-unassigned-tasks.js`、`audit-unassigned-tasks.js`、`verify-unassigned-links.js`、`validate-phase12-implementation-guide.js` を実行する。

## ベストプラクティス

### すべきこと

- 仕様、テスト、実装、検証、同期の順序を崩さない。
- `outputs/phase-N/` を phase ごとに実体化し、`artifacts.json` と同時更新する。
- SubAgent 相当の lane は 3 並列以下に抑え、validation lane は直列で締める。
- detail を増やしたくなったら `references/` へ逃がし、`SKILL.md` は入口に保つ。
- Phase 12 は `implementation-guide`、`system-spec-update-summary`、`documentation-changelog`、`unassigned-task-detection`、`skill-feedback-report` を必ず揃える。

### 避けるべきこと

- `.agents` 側だけ先に更新して canonical root を残すこと。
- `outputs/` を後回しにして phase 完了だけ先に付けること。
- `current` と `baseline` の監査結果を混ぜること。
- UI task で screenshot を自動テスト代替として扱うこと。
- user の明示承認なしに commit や PR を作ること。

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| **v10.09.5** | **2026-03-16** | **TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 完了。Phase 4-5 統合実行パターンの教訓を記録** |
| **v10.09.4** | **2026-03-15** | **UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 の Phase 12 再確認を反映**: `references/spec-update-workflow.md` / `references/unassigned-task-guidelines.md` の運用に沿って、`SKILL.md` 変更履歴更新（aiworkflow/task-spec 両方）を必須完了条件として明記。未タスクは `docs/30-workflows/unassigned-task/` の配置確認と `audit-unassigned-tasks --diff-from HEAD --target-file` の分離判定をセットで実施し、repo-wide テスト失敗を既存未タスクへ紐付ける判断基準を追補 |
| **v10.08.68** | **2026-03-15** | **UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 の system spec 詳細同期を完了** |
| **v10.08.67** | **2026-03-15** | **UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 再確認を反映**: `runtime-routing-integration-closure` workflow の Phase 11/12 検証（TC 9/9・guide 10/10）と、`artifacts.json` / `index.md` / `phase-1..12` completed 同期を同一ターンで閉じる運用を追記。Step 2 は executor/electron-services/ui/state/task-workflow/lessons の同時同期を必須化 |
| **v10.08.67** | **2026-03-15** | **UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 の教訓・完了記録を同期**: `lessons-learned-current.md` に P58（同名ファイル二重存在）判定手順、RuntimeResolver mock 戦略（P61派生）、vi.spyOn vs vi.mock セキュリティテスト判断基準の3苦戦箇所と5分解決カードを追加。LOGS.md 2ファイル + SKILL.md 2ファイルを同期 |
| **v10.08.66** | **2026-03-13** | **TASK-UI-09-ONBOARDING-WIZARD の follow-up contract drift 対策を反映**: `references/unassigned-task-guidelines.md` に、既存 follow-up 未タスクを流用する際は `2.2` / `3.1` / `3.5` / `6.検証方法` を current contract で再確認し、`audit-unassigned-tasks --diff-from HEAD --target-file` で個別監査するルールを追加。Phase 12 の 0 件報告と既存本文是正を両立させる運用を変更履歴へ追記 |
| **v10.08.65** | **2026-03-13** | **TASK-UI-09-ONBOARDING-WIZARD の監査補修知見を反映**: `references/phase-11-12-guide.md` に visual `TC-*` と non-visual check の ID 分離、および Phase 4 test-cases と Phase 10 checklist の pre-flight 突合ルールを追加。`references/spec-update-workflow.md` には `diff -qr` を伴う mirror sync 完了判定と `TC-ID` 再利用禁止を追記し、Phase 11/12 の実行例・`verify-unassigned-links.js` 既定参照先を `.claude` 正本基準へ統一 |
| **v10.08.64** | **2026-03-13** | **TASK-UI-09-ONBOARDING-WIZARD の完了同期を反映**: onboarding wizard workflow 向けに `validate-phase12-implementation-guide` / `quick_validate` / `generate-index.js` / dual-root mirror sync を同一ターンで閉じ、`outputs/verification-report.md` と `phase12-task-spec-compliance-check.md` へ実測値を書き戻す Phase 12 完了パターンを変更履歴へ追加 |
| **v10.08.63** | **2026-03-12** | **TASK-SKILL-LIFECYCLE-04 の再監査知見を反映**: `references/spec-update-workflow.md` に「既存 IPC 再利用でも public preload API 追加や shared barrel export 追加があれば Step 2 必須」とする判断ルールを追加。あわせて Phase 11 の `テストケース / 結果 / 証跡` literal、Phase 12 の必須見出し群（型定義 / APIシグネチャ / 使用例 / エラーハンドリング / エッジケース / 設定項目と定数一覧）を再確認ゲートへ固定 |
| **v10.08.62** | **2026-03-12** | **UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001 の Phase 12 再確認を反映**: `references/phase-11-12-guide.md` に docs-heavy task 向け same-day evidence review board fallback を追加し、`references/spec-update-workflow.md` に related unassigned row を completed 実績へ移した後の `verify-unassigned-links` exact count 再取得ルールを追記 |
| **v10.08.61** | **2026-03-12** | **UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001 を反映**: docs-only parent workflow 向けに `outputs/artifacts.json` 同期、manual review の N/A screenshot 記録、`current=0 / baseline=134` の未タスク分離記法、parent/index/spec/script/mirror を一括で閉じる Phase 12 記録パターンを変更履歴へ追加 |
| **v10.08.60** | **2026-03-12** | **TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 の未タスク formalize を反映**: `UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001` を `docs/30-workflows/unassigned-task/` へ formalize し、親タスクの苦戦箇所を `3.5 実装課題と解決策` へ継承する運用を変更履歴へ追加。completed workflow の `unassigned-task-detection.md` / `documentation-changelog.md` / `spec-update-summary.md` を 1件 formalize 前提へそろえるルールも追記 |
| **v10.08.59** | **2026-03-12** | **TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 の Phase 12 再確認を反映**: `references/phase-11-12-guide.md` に loopback static serve fallback と `skill-creator` 条件付き同期ルールを追加し、`references/spec-update-workflow.md` に `skill-creator/LOGS.md` / `skill-creator/SKILL.md` の条件付き更新を追記。global `unassigned-task/` 監査値と 3 skill 同値転記を root evidence へ揃える運用を変更履歴へ追加 |
| **v10.08.58** | **2026-03-12** | **TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 を反映**: guard workflow 向けに「current build static serve での harness build input 登録」「Phase 11 の Apple UI/UX 視覚レビュー」「`currentViolations=0` と `baselineViolations>0` を分離する discovered issue 記法」を変更履歴へ追加。Phase 12 では `.claude` 正本更新と `.agents` drift 記録を分離する運用を明文化 |
| **v10.08.57** | **2026-03-11** | **TASK-UI-04C follow-up の事後未タスク化を反映**: `references/phase-11-12-guide.md` と `references/patterns.md` に、初回 `新規未タスク 0件` で閉じた後でも親タスクの苦戦箇所が cross-cutting guard として再利用価値を持つ場合は、`unassigned-task-detection.md` / `spec-update-summary.md` / `documentation-changelog.md` を 0→1 へ再同期して正式な未タスク仕様書へ昇格する運用を追加 |
| **v10.08.56** | **2026-03-11** | **TASK-UI-04C の再監査知見を反映**: `references/phase12-checklist-definition.md` / `references/phase-11-12-guide.md` / `references/patterns.md` に、completed workflow の `phase-12-documentation.md` と `outputs/phase-12` から `仕様策定のみ` などの planned wording を除去するガードを追加し、実績同期と `[x]` 更新を Phase 12 完了条件へ昇格 |
| **v10.08.55** | **2026-03-11** | **TASK-UI-04C-WORKSPACE-PREVIEW の Phase 12 完了同期を反映**: current workflow の `index.md` / `artifacts.json` / `phase-1..12` status / `outputs/verification-report.md` を completed 実績へ同期し、`validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` / `verify-unassigned-links` / `audit-unassigned-tasks --diff-from HEAD` を Phase 12 完了ゲートとして明示した |
| **v10.08.54** | **2026-03-11** | **TASK-UI-04B-WORKSPACE-CHAT の Phase 12 再監査を反映**: `implementation-guide.md` を validator 要件（Part 2 の TypeScript型 / APIシグネチャ / 使用例 / エラーハンドリング / エッジケース / 設定と定数）に適合させ、`phase-11-manual-test.md` に画面カバレッジマトリクスを追補。`validate-phase12-implementation-guide` と `validate-phase11-screenshot-coverage` warning解消を完了ゲートへ明記 |
| **v10.08.53** | **2026-03-11** | **TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 の completed workflow backlog 配置を反映**: Phase 12 Task 4 の正本配置ルールを「active workflow 由来は `docs/30-workflows/unassigned-task/`、completed workflow 由来は `docs/30-workflows/completed-tasks/<workflow>/unassigned-task/`」へ明文化し、`audit-unassigned-tasks --json --diff-from HEAD --unassigned-dir <dir> --target-file <file>` を完了ゲートへ追加 |
| **v10.08.52** | **2026-03-11** | **TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 の再確認知見を反映**: `references/unassigned-task-guidelines.md` に「指定ディレクトリ配置チェック（今回差分配置 / current判定 / legacy baseline）」の3行テンプレートを追加。`currentViolations=0` と `baselineViolations>0` を混同しない報告ルールを明文化し、Phase 12 再監査時の未タスク誤判定を防止 |
| **v10.08.51** | **2026-03-11** | **TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 の Phase 11/12 再監査を反映**: Phase 11 で `capture-task-fix-apikey-chat-tool-integration-phase11.mjs` による TC-11-01..03 再撮影と Apple UI/UX 視覚検証を実施。Phase 12 では必須5成果物の不足を補完し、`phase-12-documentation.md` を Task 12-1〜12-5 構成へ是正。`artifacts.json` / `outputs/artifacts.json` 同期、`validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` を完了ゲートへ固定 |
| **v10.08.50** | **2026-03-11** | **user 指定rootを正本にする Phase 12 ガードを追加**: `references/phase12-checklist-definition.md` と `references/phase-11-12-guide.md` に、`.claude/skills/...` のような user 指定rootを canonical root として扱い、`.agents/skills/...` などの mirror root と drift がないことを完了条件に加えた |
| **v10.08.49** | **2026-03-11** | **TASK-UI-07 再監査で判明した canonical path drift を是正**: `references/spec-update-workflow.md` を user 指定root基準へ補強し、Phase 12 完了時に canonical root / mirror root / drift 記録を同時に残す運用を変更履歴へ追加 |
| **v10.08.48** | **2026-03-11** | **TASK-UI-08-NOTIFICATION-CENTER の Phase 11再監査追補を反映**: `validate-phase11-screenshot-coverage` を完了ゲートへ含め、`phase-11-manual-test.md` の `テストケース` / `画面カバレッジマトリクス` と `manual-test-result.md` の `証跡` 列を literal に保つ運用を変更履歴へ追加 |
| **v10.08.47** | **2026-03-11** | **TASK-UI-08-NOTIFICATION-CENTER の Phase 12 完了同期を反映**: `outputs/phase-12` 5成果物と workflow root 文書（`index.md` / traceability / diff reflection / verification-report）を同一ターンで同期し、spec-only stale を残さない運用を変更履歴へ追加 |
| **v10.08.48** | **2026-03-11** | **TASK-SKILL-LIFECYCLE-01 の Phase 12 未タスク0件報告を強化**: `references/unassigned-task-guidelines.md` に `currentViolations=0` かつ `baselineViolations>0` のときの推奨記述例を追加し、`今回差分` と `directory baseline` を分離するルールを明文化。`assets/phase12-task-spec-compliance-template.md` に legacy baseline と既存 remediation task の記録欄を追加し、0件報告でも backlog 導線を失わないテンプレートへ更新 |
| **v10.08.47** | **2026-03-11** | **TASK-SKILL-LIFECYCLE-01 再監査知見を反映**: `references/phase-11-12-guide.md` に representative screenshot は shell 全景より selector-based element capture を優先するルールを追加。`data-testid` または実文言を ready selector の正本とし、workflow `screenshot-plan.json` に selector を残す再利用パターンを明文化 |
| **v10.08.46** | **2026-03-10** | **TASK-UI-06-HISTORY-SEARCH-VIEW の Phase 12再監査知見を反映**: `references/spec-update-workflow.md` に「`.claude` が canonical root、`.agents` は mirror」ルールを追加し、`references/patterns.md` に Phase 12 の skill root 取り違えパターンを追加。workflow / outputs が `.agents/skills/.../references/` を正本として参照しないようにする再監査手順と、未タスク `UT-IMP-SKILL-ROOT-CANONICAL-SYNC-GUARD-001` の formalization を標準化 |
| **v10.08.45** | **2026-03-10** | **TASK-UI-03 Phase 12再監査の backlog 整合を反映**: current branch で解消済みの `UT-UI-03-TYPE-ASSERTION-001` を completed unassigned へ正規化し、Phase 11 light theme 所見を `UT-UI-03-LIGHT-SECONDARY-TEXT-CONTRAST-001` として task-spec フォーマットで formalize する運用を変更履歴へ追加。`unassigned-task-detection.md` / `task-workflow.md` / `spec-update-summary.md` の同値同期を標準化 |
| **v10.08.44** | **2026-03-10** | **TASK-UI-03 再監査で task-specification-creator の canonical script path を是正**: `.claude/skills/task-specification-creator/scripts/` を参照していた current workflow / `commands.md` / `phase-11-12-guide.md` / `phase-templates.md` / `patterns.md` / `unassigned-task-guidelines.md` を `.agents/skills/task-specification-creator/scripts/` へ統一し、`validate-phase-output.js` の位置引数契約へ再整合 |
| **v10.08.43** | **2026-03-10** | **TASK-UI-03 current workflow 同期**: Phase 11 の dedicated harness route と `manual-test-result.md` / `screenshot-plan.json` / `screenshot-coverage.md` の TC証跡構成を current workflow 実績へ反映し、Phase 12 で outputs/phase-4〜12 と `.claude/skills/...` 正本を同ターン同期する運用を変更履歴へ追加 |
| **v10.08.42** | **2026-03-10** | **TASK-10A-G完了**: スキルライフサイクル統合テスト強化（G1:14件IPC契約 + G2:21件Store駆動 + G3:17件ChatPanel結線 = 52テスト全PASS）。arch-state-management.md関連タスクステータス更新、task-workflow.md完了タスク追加。LOGS.md 2ファイル + SKILL.md 2ファイル同時更新（P1/P25対策） |
| **v10.08.41** | **2026-03-10** | **TASK-FIX-SAFEINVOKE-TIMEOUT-001 スキル改善**: Phase 4 テンプレートに P13 タイマーテスト注意事項（advanceTimersByTime 必須、cleanup 検証、fake timers スコープ管理）を追加。Phase 5 テンプレートに P13 Pitfall 行と DRY 統合パターン（重複実装の共通ユーティリティ抽出手順）を追加。Phase 7 テンプレートに小規模ユーティリティ 100% カバレッジ達成パターンを追加。patterns.md に Preload IPC タイムアウトパターン2件（Promise.race タイムアウト、cleanup 検証テスト）を追加 |
| **v10.08.40** | **2026-03-10** | **TASK-FIX-SAFEINVOKE-TIMEOUT-001 再監査運用を反映**: Phase 12 で `PR マージ時に実施予定` を残さず、その場で `.claude/skills/...` 正本・`SKILL.md` / `LOGS.md`・workflow outputs を同期するルールを追記。あわせて timeout タスクでは `cleanup` テストを acceptance に含め、明示 screenshot 要求時は非UIタスクでも影響 UI を representative capture する運用を固定 |
| **v10.08.39** | **2026-03-10** | **TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 再監査運用を反映**: 明示 screenshot 要求時は P53 代替を使わず、専用 harness route + `screenshot-plan.json` + capture metadata + `validate-phase11-screenshot-coverage` まで完了させる運用を追加。あわせて bypass view は reset 除外条件まで仕様化するルールと、worktree preflight `pnpm install --frozen-lockfile` を追記 |
| **v10.08.38** | **2026-03-09** | **TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 完了同期**: `architecture-auth-security.md` に認証状態遷移 "timed-out" 追加・Settings bypass セキュリティ記録。`arch-state-management.md` に AUTH_TIMEOUT_MS タイムアウト機構記録。`ui-ux-navigation.md` に Settings の AuthGuard 外アクセス記録。LOGS.md 2ファイル + SKILL.md 2ファイル同時更新（P1/P25対策） |
| **v10.08.39** | **2026-03-10** | **TASK-UI-04A-WORKSPACE-LAYOUT の worktree screenshot 運用を反映**: `phase-11-12-guide.md` に「複数 worktree で preview source が揺れる場合は current build `out/renderer` を static 配信する」ルールを追加。current workflow の Phase 4-12 成果物補完、screenshot 8件再取得、`audit-unassigned-tasks --diff-from HEAD` current=0 確認までを再監査標準手順へ追記 |
| **v10.08.38** | **2026-03-09** | **TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 の screenshot ルールを追補**: `phase-11-12-guide.md` に「persist bug では bug path 検証（通常ルート metadata）と screenshot path（dedicated harness）を分離し、`skipAuth=true` を唯一経路にしない」運用を追加。current workflow stale status / placeholder 除去と未タスク formalization の再監査手順も補強 |
| **v10.08.37** | **2026-03-09** | **未タスク指示書の差分監査タイミングを明文化**: `references/unassigned-task-guidelines.md` に「新規/全面更新した未タスク指示書は、作成直後に `audit-unassigned-tasks --json --diff-from HEAD --target-file <file>` を実行し、`currentViolations=0` まで閉じない」ルールを追加。配置済みとテンプレート準拠を分離して判定する運用へ補強 |
| **v10.08.36** | **2026-03-09** | **TASK-FIX-CONCURRENCY-GUARD フィードバック反映**: Phase 4 テスト仕様にモノレポテスト実行ディレクトリ注意書き（P40）を標準追加。Phase 2 設計テンプレートに「並行実行ガード検討」チェックポイントを追加 |
| **v10.08.35** | **2026-03-09** | **TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 再監査追補**: `validate-phase-output` の誤 CLI 例（`--phase`）を template / guide / agent docs から除去し、`phase-11-12-guide.md` に「BrowserRouter 配下の harness で Router を二重にしない」ルールを追加。workflow12 の Phase 11 screenshot / Phase 12 実装ガイド再同期を前提にした運用へ補強 |
| **v10.08.34** | **2026-03-09** | **TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 完了同期**: `arch-state-management.md` に executeSkill 並行実行ガードパターン追記。LOGS.md 2ファイル + SKILL.md 2ファイル同時更新（P1/P25対策）。未タスク2件検出 |
| **v10.08.33** | **2026-03-08** | **TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 苦戦箇所追補**: skill-creator によるテンプレート最適化 + 4仕様書への苦戦箇所記録 |
| **v10.08.32** | **2026-03-08** | **TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 仕様同期**: `api-ipc-system.md` / `architecture-implementation-patterns.md` / `security-electron-ipc.md` / `task-workflow.md` に Graceful Degradation 完了記録を同期。LOGS.md 2ファイル + SKILL.md 2ファイル同時更新（P1/P25対策） |
| **v10.08.31** | **2026-03-08** | **TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 の Phase 12完了条件を補強**: `references/phase-11-12-guide.md` に `phase-12-documentation.md` の Task 1-5 / Step 1-A〜3 / 完了条件チェックを実績同期する要件と、system spec 更新時に domain spec 側へ `実装内容 / 苦戦箇所 / 5分カード` または等価な lessons 参照を残す条件を追加。Phase 12 を成果物存在だけで閉じない運用へ補強 |
| **v10.08.30** | **2026-03-08** | **workflow11 再確認運用を反映**: `references/phase-11-12-guide.md` に「App shell 遷移が不安定な場合は同一 view を直描画する harness route を優先してよい」を追記。workflow11 で `TC-11-UI-01..03` screenshot, `テストケース`, `画面カバレッジマトリクス`, follow-up issue 登録までを一連運用として固定 |
| **v10.08.29** | **2026-03-08** | **TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 完了同期**: `api-ipc-auth.md` に Profile/Avatar fallback ハンドラ完了タスクセクション追加。`error-handling.md` に変更履歴追加。LOGS.md 2ファイル + SKILL.md 2ファイル同時更新（P1/P25対策） |
| **v10.08.28** | **2026-03-08** | **TASK-10A-F Phase 12タスク仕様再確認の運用を追補**: `references/phase-11-12-guide.md` に comparison baseline の completed workflow も `verify-all-specs --strict` / `validate-phase-output` PASS まで揃えてから branch 判定する手順を追加。`references/unassigned-task-guidelines.md` には `currentViolations=0` と `baselineViolations>0` の二層報告ルールと、「指定ディレクトリに配置済み」と「directory 全体健全化」を分離して記録する運用を追加 |
| **v10.08.27** | **2026-03-08** | **TASK-10A-F final sync を反映**: current workflow の Phase 11/12 同期だけでなく、comparison baseline の completed workflow も `verify-all-specs --strict` / `validate-phase-output` PASS まで同ターンで正規化する運用を変更履歴へ反映。加えて `capture-skill-analysis-view-screenshots.mjs` の `data-testid` ready selector 化、`capture-skill-create-wizard-screenshots.mjs` の Store由来フォールバック文言待機、`phase-12-documentation.md` Step 1-D の `generate-index.js` パス修正を再監査標準手順へ昇格 |
| **v10.08.26** | **2026-03-08** | **TASK-10A-F current workflow 再監査の運用穴を反映**: `SKILL.md` に `evidence-sync-rules.md` / `screenshot-verification-procedure.md` / `phase12-checklist-definition.md` の直リンクを実体として追加し、`quick_validate` warning 3件を解消。あわせて Phase 12 集約監査（Task 12-1〜12-5 + Step 1-A〜1-G / Step 2）と `spec_created` workflow の Phase 11/12 artifacts 同期方針を変更履歴へ反映 |
| **v10.08.25** | **2026-03-08** | **TASK-10A-E-D/TASK-UI-03/TASK-10A-F 仕様同期**: 5教訓・5パターン・5完了タスク・5未タスクを6並列SubAgentで仕様書正本へ同期。lessons-learned/arch-state-management/task-workflow/patterns/LOGS/SKILLを同時更新。P1/P25対策で4ファイル同時更新 |
| **v10.08.24** | **2026-03-07** | **TASK-10A-F 再確認を反映**: ユーザー要求に基づく画面検証を `SCREENSHOT` 必須運用で再実行し、`store-driven-lifecycle-ui` の Phase 11 証跡を11件へ更新。Phase 12 の不足成果物（`unassigned-task-detection.md` / `skill-feedback-report.md` / `spec-update-summary.md`）を補完し、Step 1-A〜Step 2 実更新を同ターンで完了する運用を追記 |
| **v10.08.24** | **2026-03-08** | **branch横断 Phase 12 再監査 + persist iterable hardening 仕様同期を完了**: `arch-state-management.md` に persist 復旧契約（DD-01〜DD-03）追記、`lessons-learned.md` にコード例と関連Pitfall参照追加、`task-workflow.md` に完了タスクと5分解決カード追記、`skill-creator/references/patterns.md` に persist 3段ガード + branch横断監査パターン追加。4仕様書を5並列SubAgentで同時更新 |
| **v10.08.23** | **2026-03-07** | **TASK-10A-E-C の実装知見をシステム仕様へ資産化**: `architecture-implementation-patterns.md` S18追加、`lessons-learned.md` 苦戦箇所3件追記、`06-known-pitfalls.md` P48追加。431テスト全PASS、Phase 1-12完了の実装結果を4ファイル（LOGS.md x2 + SKILL.md x2）に反映 |
| **v10.08.22** | **2026-03-06** | **TASK-10A-E-C の Phase 12再確認テンプレート適合を反映**: `phase-12-documentation.md` の完了チェック同期、`documentation-changelog.md` の実更新化、未タスク2件の9見出しテンプレート準拠化を再監査手順として追記。`validate-phase11-screenshot-coverage` と `audit --target-file` をセットで回す運用を標準化 |
| **v10.08.21** | **2026-03-06** | **TASK-10A-E-C の Phase 11/12運用を反映**: `manual-test-result.md` を `TC-ID + 証跡` 形式へ更新し、`validate-phase11-screenshot-coverage` が expected=8/covered=8 で通る証跡設計を追加。`spec-update-summary.md` の「更新予定のみ」記述を実更新結果へ置換し、未タスク2件の3ステップ登録（指示書作成/台帳同期/関連仕様参照）を標準手順に反映 |
| **v10.08.20** | **2026-03-06** | **TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 再監査の運用穴をガイドへ反映**: `references/phase-11-12-guide.md` に専用 harness を用いた Phase 11 再撮影条件、`phase11-capture-metadata.json` と `manual-test-result.md` の同期、`画面カバレッジマトリクス` の `テストケース` 列必須化を追記。`references/spec-update-workflow.md` には IPC transport 契約変更時に `references/ipc-contract-checklist.md` / `indexes/quick-reference.md` まで確認する cross-cutting doc 更新ルールを追加 |
| **v10.08.19** | **2026-03-06** | **TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 Phase 1-12 実行を反映**: `docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001` の Phase 1〜12 を実行し、Phase 11 は `TC-11-01..05` のスクリーンショット5件と Apple UI/UXレビューを必須証跡として固定。Phase 12 は 6成果物生成、`complete-phase.js` による台帳同期、`artifacts.json` / `outputs/artifacts.json` 整合、`phase-1..12*.md` completed 同期、`verify-unassigned-links` broken link 修復、`verify-all-specs` / `validate-phase-output` / `validate-phase11-screenshot-coverage` 再実行を標準運用として記録 |
| **v10.08.18** | **2026-03-06** | **Phase 12準拠チェックと親仕様参照ガードを追加**: `assets/phase12-task-spec-compliance-template.md` を新設し、Task 12-1〜12-5 / Step 1-A〜1-G / Step 2 の判定を1ファイルへ集約するテンプレートを追加。あわせて `scripts/verify-all-specs.js` で `task-*.md` / `../task-*.md` の参照実在も検証対象に拡張し、親仕様ブリッジ欠落を自動検出できるよう更新                                                                                                                                                                                                                                      |
| **v10.08.17** | **2026-03-06** | **TASK-043B 再監査の導線修復ルールを反映**: `references/phase-11-12-guide.md` に `TC-xx` 本体証跡と `VIS-xx` 補助証跡の分離運用を追加し、`references/spec-update-workflow.md` に `../task-xxx.md` 親仕様参照のブリッジ確認チェックを追記。Phase 12で workflow ディレクトリと親仕様ファイルの両方を実在確認する手順を明文化                                                                                                                                                                                                                                                                 |
| **v10.08.16** | **2026-03-06** | **TASK-043B の Phase 11/12 実行知見を反映**: `manual-test-result.md` の `TC-ID + 証跡 + 非視覚ログ` 形式、補助 screenshot warning の扱い、`validate-phase11-screenshot-coverage` を 9 TC ベースで通す運用を LOGS と合わせて追記                                                                                                                                                                                                                                                                                                                                                            |
| **v10.08.21** | **2026-03-07** | **TASK-UI-03 Phase 4 a11y テスト推奨を追加**: `references/phase-templates.md` の Phase 4 テンプレートにアクセシビリティテスト（WCAG 2.1 AA）推奨セクションを追加。ARIA ラベル / ロール属性 / キーボード操作 / コントラスト比 / 状態通知の5観点を UIタスクの Phase 4 で早期テスト設計するよう標準化。根拠: TASK-UI-03 で Phase 10 まで a11y 属性不足が検出されず4件の未タスク化が発生した教訓                                                                                                                                                                                               |
| **v10.08.20** | **2026-03-07** | **TASK-UI-03 スキルフィードバック改善を反映**: Phase 2テンプレートにUIタスク向け「z-index管理テーブル」セクションを追加（条件付き）。Phase 12テンプレート Step 1-Cに関連タスク検索コマンド例を追加し、自動化ヒントを強化                                                                                                                                                                                                                                                                                                                                                                   |
| **v10.08.19** | **2026-03-07** | **TASK-UI-03-AGENT-VIEW-ENHANCEMENT Phase 12 完了を反映**: AIアシスタント画面リデザイン（Tap & Discover）の実装ガイド・コンポーネントドキュメント・未タスク4件・スキルフィードバックレポートを作成。LOGS.md 2ファイル + SKILL.md 2ファイル同時更新（P1/P25/P29対策）                                                                                                                                                                                                                                                                                                                       |
| **v10.08.18** | **2026-03-06** | **TASK-UI-02 再々監査の workflow 本文 stale 是正を反映**: `references/phase-11-12-guide.md` と `references/spec-update-workflow.md` に「`artifacts.json` / `index.md` が completed でも `phase-1..11` 本文仕様書へ `pending` が残っていないことを確認する」チェックを追加。Phase 12 完了判定を「成果物 / 台帳 / 本文仕様書」の三層同期へ拡張                                                                                                                                                                                                                                               |
| **v10.08.17** | **2026-03-06** | **TASK-UI-02 Phase 12 再整合手順を追補**: `references/phase-11-12-guide.md` と `references/spec-update-workflow.md` に `outputs/artifacts.json` 同期後の `generate-index.js --workflow ... --regenerate` と `index.md` 状態確認を追加し、artifacts 完了済みでも workflow index が stale なまま残る再発を防止                                                                                                                                                                                                                                                                               |
| **v10.08.16** | **2026-03-06** | **TASK-UI-02 再監査の運用知見を反映**: `SKILL.md` に `screenshot-verification-procedure.md` / `phase12-checklist-definition.md` / `evidence-sync-rules.md` の直リンクを追加し、Phase 11/12 の導線不足を解消。あわせてコマンド例を canonical path へ統一し、変更履歴の version 重複を防ぐ採番確認ルールを明文化                                                                                                                                                                                                                                                                             |
| **v10.08.17** | **2026-03-06** | **Phase 12 実装ガイド内容 validator を追加**: `validate-phase12-implementation-guide.js` とテストを追加し、Task 12-1 の理由先行 / 日常例え / TypeScript型 / API・CLI シグネチャ / 使用例 / エラー処理 / 設定一覧を機械検証できるようにした。あわせて `evidence-sync-rules.md` / `phase12-checklist-definition.md` / `screenshot-verification-procedure.md` を SKILL 導線へ接続                                                                                                                                                                                                             |
| **v10.08.16** | **2026-03-06** | **UT-TASK-10A-B-008 再監査の教訓を反映**: `references/phase-11-12-guide.md` に「ユーザーが明示的にスクリーンショット検証を要求した場合は `NON_VISUAL` 単独不可」「ready 判定は root ではなく loaded-state selector を使う」「light 証跡は theme mock を撮影シナリオへ追従させる」を追加。Phase 12 の漏れパターンにも同条件を追記                                                                                                                                                                                                                                                           |

| **v10.08.15** | **2026-03-05** | **TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 再確認で判明した Phase 12台帳ドリフト対策を反映**: `references/phase-11-12-guide.md` の Task 3.5 と完了チェックへ「`phase-12-documentation.md` は `ステータス=completed` とチェックリスト同期の両方が必須」を追記。成果物実体のみで完了判定しない運用を明文化 |
| **v10.08.14** | **2026-03-05** | **TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 再監査を反映**: ユーザー追加要求に基づく Phase 11 画面回帰撮影（3スクリーンショット）を workflow 直下へ再証跡化し、`manual-test-result.md` を `TC + 証跡` 形式へ更新。併せて仕様書のDIシグネチャ旧表記を現行実装へ同期し、`validate-phase11-screenshot-coverage` を再実行する運用を追記 |
| **v10.08.13** | **2026-03-05** | **TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 実行を反映**: `docs/30-workflows/02-TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001` の Phase 1〜12 を完了。Task 12 Step 1-A/1-B/1-C として `interfaces-agent-sdk-executor.md` / `api-ipc-system.md` の完了タスク・実装状況・関連タスクを同期し、`verify-all-specs` / `validate-phase-output` / `complete-phase` をフェーズ単位で実行する運用を記録 |
| **v10.08.12** | **2026-03-05** | **TASK-UI-01-C 再監査（phase/index整合 + Phase 11 実画面証跡）を反映**: `artifacts.json` が completed でも `index.md` / `phase-1..10` に pending が残るドリフトを是正する運用を追加。`apps/desktop/scripts/capture-task-056c-notification-history-screenshots.mjs` で `TC-11-01..03` を再取得し、`manual-test-result` / `evidence-index` / `screenshot-matrix` を `SCREENSHOT + NON_VISUAL` 併用形式へ更新する再監査手順を固定 |
| **v10.08.12** | **2026-03-05** | **TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 再監査の Phase 11 TCカバレッジ是正を反映**: `phase-11-manual-test.md` の `テストケース` / `画面カバレッジマトリクス` 必須化を運用適用し、`manual-test-result.md` を `TC + 証跡` 形式へ是正。`validate-phase11-screenshot-coverage`（3/3）PASS を Phase 12成果物へ同期し、`quick_validate` warning分類（要監視/要対応）記録を追加 |
| **v10.08.11** | **2026-03-05** | **未タスク監査の `--target-file` 適用境界を明文化**: `references/unassigned-task-guidelines.md` に「`--target-file` は `docs/30-workflows/unassigned-task/` 配下のみ指定可能」「`outputs/phase-12/*.md` 監査は `--diff-from HEAD` を使う」を追記し、Phase 12 再監査時のコマンド誤用を予防 |
| **v10.08.10** | **2026-03-05** | **Phase 11 TC-ID検証の明確化を反映**: `references/phase-11-12-guide.md` に「`MT-xx` などシナリオIDのみは coverage validator 対象外」「`TC-xx` 併記必須」を追記し、`rg` で事前にTC抽出可否を確認する手順を追加。`validate-phase11-screenshot-coverage` の取りこぼし（expected TC=0）を事前に防止 |
| **v10.08.9** | **2026-03-05** | **UT-TASK-10A-B-001 最終再監査（未タスク配置是正）を反映**: Phase 12の未タスク監査を最新値（`verify-unassigned-links` 102/102、`audit --json` current=90、`audit --diff-from HEAD` current=0 baseline=90）へ更新。完了済み指示書（001）は `completed-tasks` 直下、未実施指示書（002〜008）は `unassigned-task` へ分離配置する運用を追補し、スクリーンショット5件を 11:00 JST に再取得した視覚検証ログと成果物3点（`spec-update-summary` / `documentation-changelog` / `unassigned-task-detection`）を同期 |
| **v10.08.8** | **2026-03-05** | **UT-TASK-10A-B-001 再監査追補を反映**: Phase 11 の light/dark 証跡整合チェックを強化し、`capture-ut-task-10a-b-001-screenshots.mjs` のテーマモックを `prefers-color-scheme` 連動へ修正。`documentation-changelog.md` / `unassigned-task-detection.md` に `--target-file` 監査と screenshot coverage（5/5）を追記する運用を追加 |
| **v10.08.7** | **2026-03-05** | **UT-TASK-10A-B-001 Phase 1-12 実行を反映**: UI追加タスクの実行実績（Red→Green、53テストPASS、対象カバレッジ 100/96.22/100、Phase 11 スクリーンショット5件）を運用記録へ追加。`outputs/phase-1`〜`phase-12` 成果物生成と `artifacts.json` 同期、Step 1-A〜1-G 実行ログ反映を標準手順に再適用 |
| **v10.08.6** | **2026-03-04** | **Phase 11証跡の workflow 配置ドリフト対策をガイドへ追加**: `references/phase-11-12-guide.md` に「証跡は対象workflow配下 `outputs/phase-11/screenshots` を必須」「非視覚TCは `NON_VISUAL:` 記法を必須」を追記。Phase 12チェックリストへ同条件を追加し、`validate-phase11-screenshot-coverage` 失敗（別workflow参照のみ）を再発防止 |
| **v10.08.5** | **2026-03-04** | **UI再撮影の Port 5174 競合ガードを Phase 11/12 ガイドへ追加**: `references/phase-11-12-guide.md` の preview preflight に `lsof -nP -iTCP:5174 -sTCP:LISTEN` を追加し、`Port 5174 is already in use` 発生時の分岐（停止/再利用）を `spec-update-summary.md` へ記録する完了条件を明文化。自動化コマンドとチェックリストにも同要件を同期 |
| **v10.08.4** | **2026-03-04** | **Phase 12 Step 1-C（関連タスク表の完了同期）を再確認運用へ追加**: `UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001` を対象に、`ui-ux-feature-components.md` の関連未タスク表、未タスク指示書、issue の3点ステータスを同一ターンで完了化する是正例を記録。完了状態の条件として「status更新 + チェックリスト同期 + 完了注記」を明文化 |
| **v10.08.3** | **2026-03-04** | **TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 第2回再確認を反映**: `outputs/phase-11` の画面証跡時刻を 16:50 JST に更新し、撮影コマンドを `capture-skill-center-metadata-guard-screenshots.mjs` へ統一。`spec-update-summary.md` / `unassigned-task-detection.md` / `documentation-changelog.md` の再監査値を `verify-unassigned-links` 88/88、`audit --diff-from HEAD` baseline=94 へ同期し、`phase-12-documentation.md` の引き継ぎ事項を完了移管済みへ更新 |
| **v10.08.2** | **2026-03-04** | **SkillCenter再監査の UI再撮影 preflight を標準化**: `references/phase-11-12-guide.md` に再撮影前 `preview preflight`（build成功 + `127.0.0.1:4173` 疎通確認）を追加。失敗時は `unassigned-task-detection.md` へ記録し、`docs/30-workflows/unassigned-task/` へ未タスク化する分岐を完了条件チェックへ追記 |
| **v10.08.1** | **2026-03-04** | **TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 再監査の最終固定**: `complete-phase.js` を Phase 1〜12 へ順次適用して `artifacts.json` を `completed` 同期、`outputs/artifacts.json` を生成。`generate-index`（2スキル）+ `verify-all-specs`（13/13）+ `validate-phase-output`（28項目）+ `validate-phase11-screenshot-coverage`（4/4）+ `verify-unassigned-links`（88/88）を再実行し、再監査の証跡を固定 |
| **v10.08.0** | **2026-03-04** | **TASK-FIX-SKILL-IMPORT 3連続是正の再監査を反映**: `01/02/03` workflow を再監査し、`aiworkflow-requirements` 正本6仕様書（api-ipc/interfaces/arch-state/ui-ux-feature/task-workflow/lessons）へ実装内容と苦戦箇所を同期。Phase 12 Task 5 必須の4ファイル（`LOGS.md` x2 + `SKILL.md` x2）を同一ターンで更新し、`verify-all-specs`（3workflow）/`validate-phase-output`（3workflow）/`validate-phase11-screenshot-coverage`（workflow03）/`audit --diff-from HEAD` の証跡を固定 |
| **v10.07.1** | **2026-03-03** | **TASK-10A-D 再監査追補**: Phase 11 証跡不足を是正し、`outputs/phase-11/screenshots/` に TC-01〜TC-05 を追加。`manual-test-result.md` を証跡列付きへ更新して `validate-phase11-screenshot-coverage` を PASS 化。`task-workflow.md` の未タスクリンク3件を修正し、`verify-unassigned-links` を `ALL_LINKS_EXIST` へ回復。`artifacts.json` と `index.md` を再同期して Phase 13 を `pending`（未実施）へ整合化 |
| **v10.07.0** | **2026-03-03** | **TASK-10A-D Phase 12 完了同期**: `ui-ux-components.md` / `ui-ux-feature-components.md` / `arch-ui-components.md` / `arch-state-management.md` / `interfaces-agent-sdk-skill.md` / `task-workflow.md` に実装内容と苦戦箇所3件（Suggestion型不整合、P40再発、P11パターン）を同期。LOGS.md 2ファイル・SKILL.md 2ファイル同時更新（P1/P25/P29対策）。P43準拠3ファイル以下/エージェントに分割実行 |
| **v10.06.0** | **2026-03-02** | **TASK-10A-C 再監査パターンを反映**: `phase-11-manual-test.md` / `phase-12-documentation.md` で依存Phase成果物（2/5/6/7/8/9/10）の参照資料補完を必須化し、`verify-all-specs` の依存参照warningをゼロ化する運用を追記。UIタスクでは `screenshot:*` 再実行で証跡鮮度を固定し、Step 1-A の LOGS/SKILL 4点同時更新を完了条件として明文化 |
| **v10.05.0** | **2026-03-02** | **Phase 13 PR本文セクション連携を強化**: `phase-templates.md` の Phase 13 に `/ai:diff-to-pr` Phase 3.6（`TARGET_WORKFLOW_DIR` 特定）との連携ルールを追加し、PR本文を `.github/pull_request_template.md` 準拠セクションへ同期。UI/UX変更時は `outputs/phase-11/screenshots/*.png` をPR本文 `## スクリーンショット` へ自動挿入する要件を追加。`phase-11-12-guide.md` 完了チェックへ「Phase 13で対象workflow確認」「`## その他` へのPhase 12実装ガイド反映」確認項目を追加 |
| **v10.04.0** | **2026-03-02** | **Phase 11 画面カバレッジマトリクス改善**: `phase-templates.md` に画面カバレッジマトリクス（4ステップ: 変更コンポーネント洗い出し/UI状態カバレッジ定義/撮影計画JSON作成/カバレッジレポート）を追加。`phase-11-12-guide.md` の実行フローを9ステップに拡張し、撮影コマンドをA.計画ベース一括撮影/B.個別撮影の2構成に再編。`capture-screenshots.js` を拡張版に更新（--plan/--selector/--action/--action-target/--helpオプション追加、テーマ別グループ化、カバレッジレポート自動生成） |
| **v10.05.0** | **2026-03-02** | **TASK-10A-B Phase 11/12 再監査を反映**: `phase-11-manual-test.md` に必須セクション「統合テスト連携」を追加し、`manual-test-result.md` を実スクリーンショット証跡ベースへ更新。`unassigned-task-detection.md` を 7件→5件へ再同期。`verify-all-specs` warning 13→0、`validate-phase-output` を 28項目PASS へ復帰 |
| **v10.04.0** | **2026-03-02** | **TASK-10A-B SkillAnalysisView 実装完了を反映**: Phase 1-12全完了（72テスト全PASS、カバレッジ Line100%/Branch95.83%/Function100%）。LOGS.md 2ファイル・SKILL.md 2ファイルを同時更新し、topic-map.md を再生成。`docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-12/spec-update-summary.md` を更新 |
| **v10.03.0** | **2026-03-02** | **Phase 12準拠再確認の実行パターンを反映**: `skill-editor-view` と `TASK-UI-05` の2workflowで `verify-all-specs`/`validate-phase-output` を同時実行し、Task 1/3/4/5成果物実体・implementation-guide Part 1/2・未タスク10見出しを同一ターンで突合する運用を確立。未タスク監査は `currentViolations=0` を合格基準に固定 |
| **v10.02.0** | **2026-03-02** | **TASK-UI-05A 再監査（Phase 11/12整合是正）**: `outputs/phase-11` へ 2026-03-02 再取得スクリーンショット（Dashboard/Editor/導線チェック）を追補。`outputs/phase-12/spec-update-summary.md` を追加し、未タスク正本3件（`docs/30-workflows/unassigned-task/`）と `artifacts.json`/`outputs/artifacts.json` の同期を反映 |
| **v10.01.0** | **2026-03-01** | **TASK-UI-05A 包括的監査・仕様修正反映**: Phase 1/2/4/5 に skill:getFileTree IPCチャネルを追加し、useFileTree 引数仕様を skillName ベースに統一。UT-UI-05A-GETFILETREE-001 未タスク登録を反映 |
| **v10.00.0** | **2026-03-01** | **TASK-UI-05A spec_created 再監査を反映**: Phase 12運用に「画面検証スクリーンショット必須」を明記し、`docs/30-workflows/skill-editor-view/outputs/phase-11/` への証跡（Dashboard/Editorスクリーンショット、manual-test-result、discovered-issues）同期手順を追補。併せて `verify-unassigned-links` 失敗要因になっていた completed-tasks 移管後リンクドリフトの是正運用を反映 |
| **v10.02.0** | **2026-03-02** | **TASK-UI-05B 実装完了再監査を反映**: `docs/30-workflows/skill-advanced-views` を再監査し、`spec_created` 残存を `completed` へ同期。Phase 11 画面証跡（TC-04〜TC-07）を追加。`phase-12-documentation.md` をテンプレート準拠（`実行タスク` / `参照資料` / `成果物` / `完了条件`）へ補正し、`verify-all-specs`（13/13）/`validate-phase-output`（28項目）を PASS に復帰。Phase 12 Step 1-A の `SKILL.md` / `LOGS.md` 4点同期を完了 |
| **v10.01.0-v9.97.0** | **2026-03-01〜2026-02-28** | **Phase 12 完了同期と再監査ルールの整備**: `artifacts.json` / `outputs/artifacts.json` / `index.md` / `phase-1..12` の同期、必須成果物実体確認、`validate-phase-output` / `verify-all-specs` / `verify-unassigned-links` / screenshot coverage の完了ゲート化を段階的に整理。詳細は `LOGS.md` を参照 |
| **v9.96.0-v9.92.2** | **2026-02-27〜2026-02-25** | **Phase 12 guard と quick_validate 運用の標準化**: unassigned audit、親仕様参照整合、completed-tasks 移管、`quick_validate.js` 経路統一、skill-creator 連携、`## メタ情報` 重複防止などの再発防止ルールを整備。詳細は `LOGS.md` を参照 |
| **v9.92.1** | **2026-02-25** | **履歴運用改善**: `SKILL.md` の変更履歴を直近中心に整理し、構造検証（500行上限）に適合。詳細な長期履歴は `LOGS.md` を正本として参照する方針へ統一 |
| **v9.92.0** | **2026-02-25** | **UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 再監査同期**: `references/spec-update-workflow.md` の baseline/current 判定手順を `--target-file` / `--diff-from` ベースへ更新 |
| **v9.91.0** | **2026-02-25** | **UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 実装反映**: `scripts/audit-unassigned-tasks.js` に `--target-file` / `--diff-from`、`currentViolations` / `baselineViolations` 分離、scoped 判定を追加 |
| **v9.90.0** | **2026-02-25** | **UT-IPC-AUTH-HANDLE-DUPLICATE-001 再確認反映**: `phase-11-12-guide.md` / `spec-update-workflow.md` にスキル構造検証チェックを追記（`quick_validate.js` ベース） |
> 補足: v9.89.0 以前の履歴は `LOGS.md` に保持（監査証跡を維持）。
| **v10.09.3** | **2026-03-13** | **Phase 12 root evidence と split-aware 未タスク監査を強化**: `assets/phase12-task-spec-compliance-template.md` を 4点突合 / implementation-guide 必須要素 / current-baseline 分離 / system spec 同期まで確認する root evidence 形式へ拡張し、`scripts/verify-unassigned-links.js` は親 `task-workflow.md` 指定時に sibling `task-workflow*.md` も走査するよう改善した。`references/unassigned-task-guidelines.md` にも split-aware 実行前提を追記 |
| **v10.09.2** | **2026-03-13** | **artifacts schema compatibility を修正**: `schemas/artifact-definition.json` を current workflow 実体へ合わせ、legacy string artifact array、Phase `blocked`、`metadata.taskType=improvement` を validator 互換として受理するよう更新。`references/artifact-naming-conventions.md` に object 推奨 / legacy 互換の運用ルールも追記した |
| **v10.09.1** | **2026-03-13** | **TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001 の再監査知見を反映**: `spec_created` workflow でも branch-level documentation drift を解消するために `outputs/phase-12/` の shell を補完してよいが、`artifacts.json` の `currentPhase` は execution progress の正本として維持し、implementation guide / documentation changelog / cross-skill feedback を Phase 12 checklist の細目まで満たすルールを固定した |
| **v10.09.0** | **2026-03-12** | **TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001 を反映**: `SKILL.md` を入口特化へ slim 化し、`patterns`、`phase-templates`、`spec-update-workflow`、`phase-11-12-guide`、`LOGS.md` を family file と archive へ再編した。canonical root は `.claude`、mirror は `.agents` に固定し、line budget / direct link / mirror parity / dependency integrity の検証導線を整理した |
| **v10.08.60** | **2026-03-12** | `UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001` formalize を反映 |
| **v10.08.59** | **2026-03-12** | current build static serve fallback と skill-creator 条件付き同期ルールを追加 |
| **v10.08.58** | **2026-03-12** | Apple UI/UX 視覚レビューと current/baseline 分離記法を追記 |
| **v10.08.57** | **2026-03-11** | 事後未タスク化による 0件→1件 再同期ルールを追加 |

詳細な履歴と usage log は [LOGS.md](LOGS.md) と [references/logs-archive-index.md](references/logs-archive-index.md) を参照。
