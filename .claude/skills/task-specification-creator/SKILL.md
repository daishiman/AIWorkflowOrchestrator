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

| Version    | Date           | Changes                                                                                                                                                                                                                                                                                                  |
| ---------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **v9.93.0** | **2026-02-25** | **SKILL.md 構造最適化（skill-creator準拠）**: `SKILL.md` の変更履歴を整理し、`v9.74.0` 以前を `references/changelog-archive.md` へ分離。運用情報を保持したまま 549行→424行へ圧縮し、`quick_validate.js` の 500行制約を満たす構成へ改善 |
| **v9.92.0** | **2026-02-25** | **UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001 再監査運用を標準化**: `spec-update-workflow.md` に Step 1-G-4（Phase仕様書旧参照 + outputs同期差分チェック）を追加。`phase-11-12-guide.md` の完了条件に「旧 `unassigned-task` 参照残存チェック」「docs outputs とルート outputs 差分0件チェック」を追加 |
| **v9.91.0** | **2026-02-25** | **UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001 完了反映**: `spec-update-workflow.md` に Step 1-G（検証コマンド順次実行）と baseline/current 分離監査テンプレートを追加。`phase-11-12-guide.md` に3点同期チェックリスト（task-workflow/SKILL/LOGS）を追加し、Phase 12の同期ガードを運用標準化 |
| **v9.90.0** | **2026-02-25** | **UT-IPC-AUTH-HANDLE-DUPLICATE-001 再確認反映（skill-creator連携）**: `phase-11-12-guide.md` と `spec-update-workflow.md` に追加した `quick_validate.py` 必須チェックを変更履歴へ反映。`skill-creator` の `quick_validate.py` で `task-specification-creator` / `aiworkflow-requirements` のSKILL整合を再検証し、`Skill is valid!` を確認 |
| **v9.89.0** | **2026-02-25** | **UT-IPC-AUTH-HANDLE-DUPLICATE-001 再監査運用改善**: `phase-11-12-guide.md` と `spec-update-workflow.md` に baseline/current 分離監査ルールを追加。`audit-unassigned-tasks` の全体FAILをそのまま差分FAILと誤判定しない手順（`detect-unassigned-tasks --scan` 併記）を標準化 |
| **v9.88.0** | **2026-02-25** | **UT-IPC-AUTH-HANDLE-DUPLICATE-001 Phase 1-12実行反映**: 実行ワークフロー成果物（Phase 1-12）の出力完了、Phase 12で `api-ipc-auth.md` / `security-electron-ipc.md` / `task-workflow.md` / `lessons-learned.md` を同期更新。`artifacts.json` と `outputs/artifacts.json` の同期運用を実施 |
| **v9.87.0** | **2026-02-25** | **UT-IPC-CHANNEL-NAMING-AUDIT-001 Phase 12再監査反映**: 未タスク検出1件を `UT-IPC-AUTH-HANDLE-DUPLICATE-001` として3ステップ登録（指示書作成 + task-workflow登録 + 参照検証）。`outputs/artifacts.json` 同期要件を実運用へ適用し、Phase 12成果物（spec-update-summary/documentation-changelog/unassigned-task-detection）を再整合 |
| **v9.89.0** | **2026-02-25** | **UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 派生未タスク仕様書作成**: `docs/30-workflows/unassigned-task/` に未タスク2件を追加（IPCレスポンス契約ガード、Phase 12実装ガイド品質ゲート）。両指示書へ 3.5「実装課題と解決策」を必須反映し、`task-workflow.md` と `interfaces-agent-sdk-skill.md` の残課題テーブル更新を手順化 |
| **v9.88.0** | **2026-02-25** | **UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 Phase 12要件再適合**: `implementation-guide.md` の Task 1要件不足（Part 1の例え話/理由先行、Part 2の型/API/エッジケース）を是正する運用を追記。`phase-12-documentation.md` チェックリスト同期と、既存関連未タスク2件の配置/フォーマット確認（`docs/30-workflows/unassigned-task/`）を再監査手順に明記 |
| **v9.87.0** | **2026-02-25** | **UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 Phase 12再監査反映**: `spec-update-workflow` Step 1-A〜1-E / Step 2 の実施記録を補完。`spec-update-summary.md` と `unassigned-task-detection.md` を成果物へ追加し、`task-workflow.md` / `interfaces-agent-sdk-skill.md` の未タスク参照を完了化。`verify-unassigned-links` / `validate-phase-output` / `verify-all-specs --strict` の再検証フローを実行記録化 |
| **v9.86.0** | **2026-02-24** | **Phase 12仕様の再整合（UT-IPC-DATA-FLOW-TYPE-GAPS-001再監査反映）**: Phase 12必須タスク数を 4→5（Task 5: skill-feedback-report必須）へ修正。漏れパターンに `spec-update-summary.md` 未作成と `artifacts.json` 二重管理不一致を追加し、成果物実体突合を明文化 |
| **v9.85.0** | **2026-02-24** | **UT-IPC-DATA-FLOW-TYPE-GAPS-001完了反映**: IPCデータフロー型ギャップ6件を7仕様書上で解消（仕様書修正のみタスク）。Date→ISO 8601統一/DebugSession.status拡張/onExport引数/ExportResult変換/safeOn購読/object形式統一。累計173検証項目ALL PASS。LOGS.md 2ファイル・SKILL.md 2ファイル更新 |
| **v9.84.0** | **2026-02-24** | **UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 パターン文書化反映**: 仕様書修正のみタスクのPhaseテンプレート先例化。IPCチャネル命名規則パターンの体系化を aiworkflow-requirements に委譲 |
| **9.83.2** | **2026-02-24** | **UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 Phase 12追補**: `validate-phase-output.js` のセクション抽出を終端依存から sentinel 見出し方式へ改善。`patterns.md` に失敗パターン（終端誤判定）を追加。`unassigned-task-report.md` を5検出ソース準拠へ補強、`skill-feedback-report.md` を実改善内容ベースへ更新 |
| **9.83.1** | **2026-02-24** | **UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 再監査是正**: `phase-6/11/13` ファイル名を推奨形式へ統一、各Phaseの「実行タスク」記法を機械検証準拠へ補正、`artifacts.json` と成果物実体の不一致を修正、`completed-tasks/task-vitest-tsconfig-paths-sync-automation.md` を完了内容へ更新 |
| **9.83.0** | **2026-02-24** | **UT-SKILL-IMPORT-CHANNEL-CONFLICT-001完了反映**: skill:import IPCチャネル名競合の予防的解消（仕様書修正のみ）。task-022/task-030のチャネル名修正。LOGS.md完了記録追加 |
| **9.83.0** | **2026-02-24** | **UT-FIX-SKILL-VALIDATION-CONSISTENCY-001完了反映**: skillHandlers.ts 6ハンドラP42準拠バリデーション統一のPhase 12ドキュメント更新記録。LOGS.md完了記録追加 |
| **9.83.0.1** | **2026-02-24** | **UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 Phase 1-12全完了記録**: vite-tsconfig-pathsプラグイン導入でVitest alias自動同期化、6つの双方向チェックCIガードスクリプト。60テスト全PASS、Phase 10 PASS。LOGS.md 2ファイル・SKILL.md 2ファイル更新 |
| **9.82.0** | **2026-02-23** | **TASK-UI-00-ATOMS Phase 1-12全完了記録**: 新規5+拡張2のAtoms共通コンポーネント、156テスト全PASS。Phase 10 PASS（MINOR 3件→未タスク化）、Phase 11 手動テスト51件。LOGS.md完了記録追加 |
| **9.81.0** | **2026-02-22** | **再監査是正と互換性改善**: `scripts/generate-index.js` を改善し、`artifacts.json` の文字列配列成果物も index 出力可能にした（`status` 未設定時は `in_progress` フォールバック）。`TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001` の未タスク指示書をテンプレート準拠へ再構成し、`skill-feedback-report.md` を追補 |
| **9.80.0** | **2026-02-22** | **TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001完了反映**: @repo/shared 3層整合CIガードスクリプト追加。check-module-syncジョブCI統合。43テスト全PASS。quality-requirements.md/architecture-monorepo.md/technology-devops.md更新。LOGS.md完了記録追加 |
| **9.80.0** | **2026-02-22** | **未タスク監査自動化を追加**: `scripts/audit-unassigned-tasks.js` を新規追加。`unassigned-task/` の9セクション準拠・命名規則違反・`completed-tasks/unassigned-task/` への未実施混在を一括監査可能にした。`references/commands.md`・`phase-11-12-guide.md`・`resource-map.md` に実行手順を追記 |
| **9.79.0** | **2026-02-22** | **UT-FIX-SKILL-IMPORT-ID-MISMATCH-001完了反映**: Phase 12 Task 2実行記録。interfaces-agent-sdk-skill.md・task-workflow.md更新、LOGS.md 2ファイル・SKILL.md 2ファイル同期更新 |
| **9.79.0** | **2026-02-22** | **TASK-UI-00-TOKENS Phase 1-12完了反映**: tokens.css Apple HIG System Colors light/darkテーマ定義、マイクロインタラクション変数、renderWithThemeテストヘルパー。28テスト全PASS、カバレッジ100%。LOGS.md完了記録追加 |
| **9.77.0** | **2026-02-21** | **UT-FIX-SKILL-REMOVE-INTERFACE-001 Phase実行知見反映**: patterns.mdにマルチエージェントPhase実行パターン3件追加（Phase依存順序、worktree環境代替手順、カバレッジスコープ解釈）。LOGS.md実行記録追加 |
| **9.76.0** | **2026-02-21** | **worktree運用時のPhase 12再発防止を標準化**: `spec-update-workflow.md` に「worktree環境なのでStep 1-Aを先送り」の誤判断パターンを追加。`phase-11-12-guide.md` に未実施タスク誤配置検出コマンド（completed配下の未着手/未実施/進行中検出）を追記。`patterns.md` に成功パターン「worktreeでもStep 1-Aを先送りしない」を追加 |
| **9.76.0** | **2026-02-21** | **verify-all-specs 参照パス検証の精度改善**: インラインコード抽出で改行またぎ誤検出を防止（`` `...` `` を単一行限定）。参照パス存在確認を「workflow相対 + リポジトリ相対」の両方で判定し、ワークフロー移動時の偽陽性（infoノイズ）を解消 |
| **9.78.0** | **2026-02-21** | **UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 未タスク検出（3件）**: skillHandlers.ts全14ハンドラ調査→3件検出。未タスク指示書3件作成（IPC応答形式統一/P45引数名ドリフト/P42バリデーション統一）、task-workflow.md・interfaces-agent-sdk-skill.md更新。verify-unassigned-links.js: ALL_LINKS_EXIST |
| **9.77.0** | **2026-02-21** | **UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 スキル改善**: `patterns.md` に IPC型不整合解決パターン2件追加（IPC戻り値型2ステップ変換パターン、Phase 12並列エージェント最適化パターン）。クイックナビゲーション拡張 |
| **9.76.0** | **2026-02-21** | **UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 Phase 12反映**: `skill:import` IPC戻り値型修正のPhase 12ドキュメント更新を記録 |
| **9.75.0** | **2026-02-20** | **Phase検証スクリプト整合改善**: `validate-phase-output.js` / `verify-all-specs.js` の完了条件判定を `- [ ]` と `- [x]` の両方を許容する実装に統一。Phase 12完了済み仕様書での誤警告（チェック済み判定漏れ）を解消 |
| **v9.74.0 以前** | **2026-02-20 以前** | 詳細は [references/changelog-archive.md](references/changelog-archive.md) を参照 |
