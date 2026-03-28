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

## 要件レビュー思考法

要件草案や設計草案を扱うときは、機能列挙のレビューで止めず、次の3系統を必ず通す。

- システム系: システム思考、因果関係分析、因果ループ、依存関係、責務境界、状態所有権
- 戦略・価値系: 価値提案、戦略的思考、why、トレードオン、プラスサム、価値とコストの均衡
- 問題解決系: 改善思考、仮説思考、論点思考、KJ法、優先順位付け

特に workflow / lane / UI統合 / runtime orchestration / verify 導入を含むタスクでは、次を明示してから Phase 1 へ進む。

1. 真の論点は何か
2. 依存関係・責務境界の問題点は何か
3. 価値とコストの不均衡箇所はどこか
4. 改善優先順位はどうあるべきか
5. 4条件の評価はどうか

### 真の論点の掘り方

- 現象ではなく主問題を1文で固定する。
- 1つの提案に複数案件が混ざっていないかを切り分ける。
- `what` / `how` だけでなく `why now` / `why this way` を仮説として書く。

### 因果と境界の確認

- 強化ループとバランスループを最低1本ずつ書く。
- 実行状態、phase 遷移、verify fail 後の意思決定権がどこにあるかを明記する。
- `Facade` / `Engine` / `Service` / `Bridge` / `Store` / `UI` の状態所有権を混在させない。

### 価値とコストの見方

- 初回スコープで得る価値と、導入コストが最も大きい部品を分けて書く。
- 将来拡張を初回価値と混同しない。
- verify / session persistence / UI統合のような高コスト項目は、初期層と将来層を分離する。

### 4条件の評価

`4条件` は原則として次で評価する。

- 価値性: 誰のどのコストをどれだけ下げるかが定義されているか
- 実現性: 初回スコープで実装可能な厚みに収まっているか
- 整合性: 責務境界、依存関係、状態所有権が矛盾なく閉じているか
- 運用性: 導入後の verify、resume、spec sync、監査運用が破綻しないか

要件レビュー出力では、上の5項目を一次結論として先に示し、その後に補足として因果ループ、KJ法クラスタ、戦略仮説を足す。
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
   **[Feedback 1 対応]** Phase 1（要件定義）でタスク分類（UI task / docs-only task）を明示的に記録し、`artifacts.json` の artifact 命名 canonical 一覧を task root 生成時に先に確定させること。後回しにすると artifact 命名ドリフトが発生する。
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

#### `spec_created` UI task の Phase 12 close-out ルール

`spec_created` ステータスの UI task でも Phase 12 実行時は Step 1-A〜1-C を N/A にせず same-wave sync で閉じる。

| Step | `spec_created` での扱い |
| --- | --- |
| Step 1-A | 完了タスク記録 + LOGS.md x2 + SKILL.md x2 + topic-map を same-wave で更新 |
| Step 1-B | 実装状況テーブルに `spec_created` を記録（`completed` ではない） |
| Step 1-C | 関連タスクテーブルのステータスを current facts へ更新 |
| Step 2 | 新規インターフェース追加がなければ N/A（ただし下記の再判定ルールを確認） |

#### docs-only task に後からコード実装が入った場合の再判定ルール

当初 docs-only / `spec_created` だった task に後から code 変更が入った場合:
1. **Step 2 再判定**: source workflow と `outputs/phase-12/*.md` を同一ターンで current facts へ戻す
2. **Screenshot 再判定**: `N/A` / `NON_VISUAL` だった Phase 11 evidence の reclassification を検討する
3. **新規未タスク 0 件固定より current gap formalize を優先**: code wave で生じた gap は即座に未タスク化する

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

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| **6.18.14** | **2026-03-27** | **Phase 12 close-out ルール hardening を反映**: (1) `spec_created` UI task でも Step 1-A〜1-C を N/A にせず same-wave sync で閉じるルール、(2) docs-only task に後から code 実装が入った場合の Step 2 / screenshot 再判定ルール、(3) Phase 12 documentation guide hardening（planned wording 残存 grep 監査、evidence reclassification）を SKILL.md に明示 |
| **6.18.13** | **2026-03-27** | **TASK-SDK-05 create-entry-mainline-unification spec sync を guide へ反映**: `spec_created` UI task の Phase 12 でも Step 1-A〜1-C を N/A にしない same-wave sync ルール、`verification-report.md` の workflow root path drift 是正、`.claude` 正本更新後の `.agents` mirror parity 確認を close-out 完了条件へ追加 |
| **6.18.12** | **2026-03-26** | **TASK-SDK-01 hardening sync を guide へ反映**: docs-only follow-up に後からコード変更が入った時は source workflow と `outputs/phase-12/*.md` を同一ターンで current facts へ戻すルールを `phase-12-documentation-guide.md` に追加 |

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
| `system-spec-update-summary.md` を未作成で完了扱い    | Phase 12成果物一覧と `outputs/phase-12/` 実体を1対1で突合し、不足ファイルは完了前に作成する     |
| LOGS.md が1ファイルのみ更新                           | 必ず aiworkflow-requirements/LOGS.md と task-specification-creator/LOGS.md の両方               |
| 完了タスクセクションが簡略形式                        | spec-update-workflow.md のテンプレート（テスト結果サマリー + 成果物テーブル）に従う             |
| `artifacts.json` と `outputs/artifacts.json` が不一致 | Phase 12完了前に2ファイルを同期し、completed成果物の参照切れを0件にする                         |
| 設計タスクの workflow root を `completed` にしてしまう | workflow root は `implementation_ready`、completed ledger は `spec_created` に分離する          |
| Phase 10 MINOR指摘を未タスク化せず進行                | **Phase 10レビュー前に** unassigned-task-guidelines.md を読み、MINOR判定→未タスク化ルールを確認 |
| 未タスク検出レポートで0件判定のまま未修正             | Phase 10 MINOR指摘は必ず未タスク化の対象。「機能に影響なし」は不要判定の理由にならない          |
| `task-workflow.md` の未タスクリンクが参照切れ         | Step 1-E後に `verify-unassigned-links.js` を実行して `ALL_LINKS_EXIST` を確認する               |
| **[Feedback 2]** Phase 12 着手時に `outputs/artifacts.json` と phase spec の artifact 名が照合されない | Phase 12 の **最初の作業**として `outputs/artifacts.json` と各 `phase-*.md` に記載されたartifact名を1対1で突合し、不一致があれば着手前に修正する |
| **[Feedback 3]** Phase 11 の UI task / docs-only task 判定がずれる | Phase 1 で記録したタスク分類（UI task / docs-only task）を Phase 11 着手時に必ず参照する。分類が変わっていた場合は再判定を明示する |

### Phase 12 苦戦防止Tips

> UT-STORE-HOOKS-COMPONENT-MIGRATION-001の経験に基づく（2026-02-12）

| Tips                                       | 説明                                                                                                                                                                                                                                                                 |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **事前に空欄チェックリストを作成**         | documentation-changelog.mdにStep 1-A〜1-D + Step 2の各欄を空欄で事前作成し、逐次消化する                                                                                                                                                                             |
| **spec-update-workflow.mdを常に参照**      | Phase 12開始時に必ず [spec-update-workflow.md](references/spec-update-workflow.md) を開き、チェックリストを確認                                                                                                                                                      |
| **「全Step確認前に完了と記載しない」厳守** | P4パターン。全Stepの結果を個別に記録してから「Phase 12完了」とする                                                                                                                                                                                                   |
| **LOGS.md/SKILL.md は4ファイル更新**       | aiworkflow-requirements/LOGS.md, task-specification-creator/LOGS.md, aiworkflow-requirements/SKILL.md, task-specification-creator/SKILL.md                                                                                                                           |
| **topic-map.md再生成はセクション変更時も** | 新規追加だけでなく、セクション更新・削除時も `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` と `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/{{FEATURE_NAME}} --regenerate` を実行 |
| **worktree環境でも `.claude` 正本を実更新する** | worktree を理由に LOGS.md / SKILL.md / backlog / workflow の更新を先送りしない。`.agents/skills/` は `rsync` / `diff` で mirror parity を確認する |
| **並列エージェント完了後はファイルシステムで検証** | P43/P59対策。エージェントがコンテキスト制限で応答不能になった場合、`git diff --stat` + `ls outputs/phase-*/` + `artifacts.json` のPhaseステータスで成果物の存在を確認する |
| **NON_VISUAL判定時は `screenshots/.gitkeep` を削除する** | `screenshots/` ディレクトリが空（PNG 0件）のまま残るとvalidator errorになる。NON_VISUAL判定で実スクリーンショットが不要な場合は `screenshots/.gitkeep` を削除してディレクトリごと除外する |
| **worktree作成後は `pnpm install` を確認する** | `esbuild` host/binary version drift により Vitest 起動前に停止することがある。worktree作成後は必ず `pnpm install` を実行してバイナリの整合を確保する |

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
| **v10.09.26** | **2026-03-28** | **TASK-SDK-08 skill-feedback 反映**: Feedback1（Phase 1での artifact 命名 canonical 一覧確定ルール追加）、Feedback2（Phase 12着手時の `outputs/artifacts.json` vs phase spec artifact 名 照合を初手チェックへ昇格）、Feedback3（Phase 1 で記録した UI/docs-only 分類を Phase 11 着手時に参照するルール）、pitfall 2件（NON_VISUAL時の screenshots/.gitkeep 削除、worktree作成後の pnpm install 確認）を追加。変更履歴を v10.09.22以前はアーカイブ参照へ圧縮し 478行以内に維持 |
| **v10.09.25** | **2026-03-26** | **UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001 完了同期**: public IPC shape が不変でも `Facade/Engine` owner 変更、`review/verify` 遷移意味変更、`success:false` / reject の failure lifecycle 変更、artifact append/upsert 方針変更があれば Step 2 必須とする判断を `spec-update-workflow.md` / `spec-update-step2-domain-sync.md` へ反映。重複未タスク防止と wider suite blocker の既存 tracker 優先も明文化 |
| **v10.09.25** | **2026-03-26** | **UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001 close-out sync を反映**: current workflow 完了時に source unassigned task の status と completed workflow root を同一ターンで整合させ、`recordExecutionFailure()` のような stale method 名を current code sweep で排除するルールを追加。Step 1-A は domain spec no-op でも completed ledger / lessons / LOGS / SKILL history を no-op にしない運用へ是正 |
| **v10.09.24** | **2026-03-26** | **要件レビュー思考法を追加**: task-specification-creator で要件草案を扱う際に、システム系 + 戦略・価値系 + 問題解決系の3系統レビュー、5つの一次出力、4条件評価、因果ループ/状態所有権/価値コスト均衡の確認を必須化 |
| **v10.09.23** | **2026-03-25** | **TASK-SC-08-E2E-VALIDATION 完了同期**: Skill Creator LLM統合 E2Eテスト + TerminalHandoff検証。Phase 1-12完了。5シナリオ36テスト全PASS。Lines 89%・Branches 77%・Functions 100%。未タスク0件。LOGS.md 2ファイル + SKILL.md 2ファイル同時更新（P1/P25/P29対策） |
| **v10.09.23** | **2026-03-25** | **TASK-SC-07-STREAMING-PROGRESS-UI 完了同期**: ストリーミング進捗UI Phase 1-13 完了。generationProgressSlice独立スライス・useStreamingProgress・useCancelGeneration・ErrorCards atoms・個別セレクタ9点。114テスト全PASS。未タスク4件（IPC cancel送信・デバウンス100ms・設定画面遷移・エラーコード構造化）。LOGS.md 2ファイル + SKILL.md 2ファイル同時更新（P1/P25/P29対策） |
| **v10.09.23** | **2026-03-25** | **TASK-IMP-HEALTH-POLICY-UNIFICATION-001 完了同期**: HealthPolicy 統一インターフェース。health-policy.ts 新規作成（HealthPolicy/HealthPolicyInput/resolveHealthPolicy）。RuntimePolicyResolver DI統合 + mainlineAccess 消費 + HealthIndicator 表示統合。apiKeyDegraded @deprecated v0.8.0。38テスト全PASS。未タスク3件（UT-HEALTH-POLICY-MAINLINE/RUNTIME-INJECTION/DEPRECATED-REMOVAL）backlog登録。LOGS.md 2ファイル + SKILL.md 2ファイル同時更新（P1/P25/P29対策） |
| **v10.09.23** | **2026-03-25** | **UT-LLM-MOD-01-005 完了同期**: completed-tasks canonical root の Phase 12 close-out を再監査。`implementation-guide.md` の 10/10 validator 要件、`manual-test-checklist.md` / `outputs/artifacts.json` / `phase12-task-spec-compliance-check.md` の補助成果物必須化、未タスク raw メモの full template 昇格、`audit-unassigned-tasks --target-file` による current/baseline 分離記録を reference 群へ反映。 |
| **v10.09.24** | **2026-03-26** | **TASK-SDK-01 Phase 12 compliance sync follow-up formalize**: execution workflow の Phase 12 task 分解を Task 12-6 まで是正し、`.claude` 参照を repo-root 基準の実在相対パスへ統一。`task-workflow.md` / backlog / topic-map / keywords と same-wave で閉じ、今回差分が未タスク formalize と台帳同期のみであるため Step 2 domain spec 更新は no-op とする判断を変更履歴へ追記 |
| **v10.09.22〜v10.08.00** | **2026-03-04〜2026-03-24** | 詳細履歴はアーカイブへ移管済み。内容は [LOGS.md](LOGS.md) / [references/logs-archive-2026-march.md](references/logs-archive-2026-march.md) を参照 |
| **v10.09.12** | **2026-03-25** | **UT-SC-02-005 の close-out を反映**: execute 型更新タスクの workflow で不足していた Phase 3/6/7/8/9/10/11/12 成果物名を仕様書と一致させ、`manual-test-result.md` / `quality-report.md` / `system-spec-update-summary.md` を current facts に同期。Phase 12 は outputs 充足だけでなく古いテスト件数・out-of-scope 記述の残骸除去まで同一ターンで行うルールを変更履歴へ追加 |
| **v10.09.13** | **2026-03-27** | **TASK-SDK-04 implementation spec sync を反映**: `references/spec-update-workflow.md` に、`spec_created` task へ code wave が混入した場合の Step 2 再判定と Phase 11 screenshot policy 見直しを追加。`新規未タスク 0件` 固定より current gap formalize を優先する close-out ルールを補強 |
| **v10.07.0-v10.03.0** | **2026-03-03〜2026-03-02** | **Phase 12 再監査・完了同期の標準化**: TASK-10A-D/C/B 再監査、Phase 13 PR本文連携強化、Phase 11 画面カバレッジマトリクス改善、Phase 12 準拠再確認パターン確立。詳細は `LOGS.md` を参照 |
| **v10.02.0-v9.90.0** | **2026-03-02〜2026-02-25** | **Phase 12 完了同期と再監査ルールの整備**: `artifacts.json` / `outputs` 同期、完了ゲート化、unassigned audit scope control、quick_validate 運用標準化。詳細は `LOGS.md` を参照 |
> 補足: v9.89.0 以前の履歴は `LOGS.md` に保持（監査証跡を維持）。

詳細な履歴と usage log は [LOGS.md](LOGS.md) と [references/logs-archive-index.md](references/logs-archive-index.md) を参照。
