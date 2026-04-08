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

| 原則                      | 説明                                                        |
| ------------------------- | ----------------------------------------------------------- |
| Script First              | 決定論的処理は `scripts/` で固定する                        |
| LLM for Judgment          | 判断、設計、レビューだけを LLM が担う                       |
| Progressive Disclosure    | 必要な reference だけを段階的に読む                         |
| 1 File = 1 Responsibility | 大きくなった guide は family file へ分離する                |
| `.claude` Canonical       | 正本は `.claude/skills/...`、`.agents/skills/...` は mirror |

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

| モード              | 用途                               | 最初に読むもの                                                                           |
| ------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| `create`            | 新規 workflow を作る               | [references/create-workflow.md](references/create-workflow.md)                           |
| `execute`           | Phase 1〜13 を順番に実行する       | [references/execute-workflow.md](references/execute-workflow.md)                         |
| `update`            | 既存仕様書を修正する               | [references/phase-templates.md](references/phase-templates.md)                           |
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

| Phase | 名称             | 目的                                                                                                                                         |
| ----- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 要件定義         | scope、受入条件、inventory を固定する。**既存コードの命名規則（camelCase / kebab-case 等）を分析し記録する**。**[FB-UI-02-2]** 全件 `pnpm test` が SIGKILL 終了するリスクがある場合は、targeted run ファイルリストを Phase 1 で事前列挙する（たとえば、メモリ制約が厳しい環境では vitest の対象ファイル指定が必須となる） |
| 2     | 設計             | topology、SubAgent lane、validation path を設計する。**[FB-SDK-07-1]** 「既存コンポーネント再利用可否」を必ず確認する。新規 UI 実装ゼロで品質・アクセシビリティ・HIG準拠を既存レベルで担保できる場合は再利用を優先する |
| 3     | 設計レビュー     | Phase 4 へ進めるかを判定する                                                                                                                 |
| 4     | テスト作成       | command suite と expected result を作る。**TDD Red 前に、テストパターンが Phase 1-3 で確認した命名規則と整合しているかを検証する**。**[Feedback P0-09-U1]** private method のテストは `(facade as unknown as FacadePrivate)` キャストまたは public callback 経由を使う方針を Phase 4 仕様書に明記する |
| 5     | 実装             | `.claude` 正本を更新し、mirror を同期する。**[Feedback RT-03]** 実装計画に「新規作成」「修正」ファイルパス一覧を必須記載する（見落とし防止）。**[Feedback P0-09-U1]** `improve()` フローで SDK callback が不適用な場合（`llmAdapter.sendChat()` 経由など）は「canUseTool 適用可能範囲と制約」を仕様書に明記する |
| 6     | テスト拡充       | fail path、回帰 guard、補助 command を追加する                                                                                               |
| 7     | カバレッジ確認   | concern と dependency edge の coverage を可視化する                                                                                          |
| 8     | リファクタリング | duplicate と navigation drift を削る。**[Feedback RT-03]** 変更内容を `対象/Before/After/理由` テーブル形式で記録する                        |
| 9     | 品質保証         | line budget、link、mirror parity を一括判定する                                                                                              |
| 10    | 最終レビュー     | acceptance criteria と blocker を判定する                                                                                                    |
| 11    | 手動テスト       | 3層評価（Semantic / Visual / AI UX）を実行し、フィードバックループで HIGH 問題を `unassigned-task/` へ自動生成する。shared path alias 系は build config と test config の parity を同時確認する |
| 12    | ドキュメント更新 | implementation guide、spec sync、未タスク、feedback を完了する                                                                               |
| 13    | PR作成           | user の明示承認後のみ実施する                                                                                                                |

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

| Step     | `spec_created` での扱い                                                   |
| -------- | ------------------------------------------------------------------------- |
| Step 1-A | 完了タスク記録 + LOGS.md x2 + SKILL.md x2 + topic-map を same-wave で更新 |
| Step 1-B | 実装状況テーブルに `spec_created` を記録（`completed` ではない）          |
| Step 1-C | 関連タスクテーブルのステータスを current facts へ更新                     |
| Step 2   | 新規インターフェース追加がなければ N/A（ただし下記の再判定ルールを確認）  |

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

---

### Task 5: スキルフィードバックレポート（改善点なしでも出力必須）

| 観点             | 記録内容                               |
| ---------------- | -------------------------------------- |
| テンプレート改善 | Phaseテンプレートの漏れや曖昧さ        |
| ワークフロー改善 | 機械検証や手順分岐の改善余地           |
| ドキュメント改善 | 再利用しやすい横断ガイドライン化の候補 |

出力:

- `outputs/phase-12/skill-feedback-report.md`
