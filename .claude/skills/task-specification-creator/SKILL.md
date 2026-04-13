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

| Phase | 名称             | 目的                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | 要件定義         | scope、受入条件、inventory を固定する。**既存コードの命名規則（camelCase / kebab-case 等）を分析し記録する**。**[FB-UI-02-2]** 全件 `pnpm test` が SIGKILL 終了するリスクがある場合は、targeted run ファイルリストを Phase 1 で事前列挙する（たとえば、メモリ制約が厳しい環境では vitest の対象ファイル指定が必須となる）。**[carry-over確認]** 前タスクの成果物（`git log --oneline -5` で確認）を棚卸しし、今タスクの新規作業との差異を明確化すること                                                                  |
| 2     | 設計             | topology、SubAgent lane、validation path を設計する。**[FB-SDK-07-1]** 「既存コンポーネント再利用可否」を必ず確認する。新規 UI 実装ゼロで品質・アクセシビリティ・HIG準拠を既存レベルで担保できる場合は再利用を優先する                                                                                                                                                                                                                                                                                                   |
| 3     | 設計レビュー     | Phase 4 へ進めるかを判定する                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 4     | テスト作成       | command suite と expected result を作る。**TDD Red 前に、テストパターンが Phase 1-3 で確認した命名規則と整合しているかを検証する**。**[Feedback P0-09-U1]** private method のテストは `(facade as unknown as FacadePrivate)` キャストまたは public callback 経由を使う方針を Phase 4 仕様書に明記する。**[FB-MSO-002]** テスト実行前に依存関係整合（`pnpm install` + `pnpm --filter @repo/shared build`）を確認する。esbuild darwin バイナリ mismatch は worktree 直後に多発するため、Phase 4 開始前チェックを必須とする |
| 5     | 実装             | `.claude` 正本を更新し、mirror を同期する。**[Feedback RT-03]** 実装計画に「新規作成」「修正」ファイルパス一覧を必須記載する（見落とし防止）。**[Feedback P0-09-U1]** `improve()` フローで SDK callback が不適用な場合（`llmAdapter.sendChat()` 経由など）は「canUseTool 適用可能範囲と制約」を仕様書に明記する                                                                                                                                                                                                          |
| 6     | テスト拡充       | fail path、回帰 guard、補助 command を追加する                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 7     | カバレッジ確認   | concern と dependency edge の coverage を可視化する                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 8     | リファクタリング | duplicate と navigation drift を削る。**[Feedback RT-03]** 変更内容を `対象/Before/After/理由` テーブル形式で記録する                                                                                                                                                                                                                                                                                                                                                                                                    |
| 9     | 品質保証         | line budget、link、mirror parity を一括判定する                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 10    | 最終レビュー     | acceptance criteria と blocker を判定する                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 11    | 手動テスト       | 3層評価（Semantic / Visual / AI UX）を実行し、フィードバックループで HIGH 問題を `unassigned-task/` へ自動生成する。shared path alias 系は build config と test config の parity を同時確認する。**[FB-MSO-003]** 画面証跡取得スクリプトには `try { ... } finally { browser.close(); server.close(); }` パターンを標準化し、ポート解放を確実にする                                                                                                                                                                       |
| 12    | ドキュメント更新 | implementation guide、spec sync、未タスク、feedback を完了する                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 13    | PR作成           | user の明示承認後のみ実施する                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |


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

### 必須タスク（6タスク - 全て完了必須）

| Task | 名称                             | 必須 | 詳細参照                                    |
| ---- | -------------------------------- | ---- | ------------------------------------------- |
| 1    | 実装ガイド作成（2パート構成）    | ✅   | 下記参照                                    |
| 2    | システム仕様書更新（2ステップ）  | ✅   | 下記参照                                    |
| 3    | ドキュメント更新履歴作成         | ✅   | scripts/generate-documentation-changelog.js |
| 4    | 未タスク検出レポート作成         | ✅   | **0件でも出力必須**                         |
| 5    | スキルフィードバックレポート作成 | ✅   | **改善点なしでも出力必須**                  |
| 6    | タスク仕様コンプライアンスチェック | ✅ | **Task 1〜5完了後に作成**                   |

#### non-visual task（非UIタスク）での判定基準

| Phase | 判定 | 理由 |
| ----- | ---- | ---- |
| Phase 11 スクリーンショット | N/A | UIを持たない純TS実装はスクリーンショット不要。`pnpm test`実行ログ・テスト件数・合格率を代替エビデンスとして残す |
| Phase 12-2 システム仕様書更新（Step 2） | N/A | 公開APIシグネチャ変更なし + 内部実装追加のみの場合。判定根拠を`system-spec-update-summary.md`に明記すること |

#### 未タスク0件判定の基準

以下のソースを確認し、**0件であっても** `unassigned-task-detection.md` を出力する。

| ソース | 確認内容 |
| ------ | -------- |
| 元タスク仕様書 | スコープ外として明示された項目 |
| Phase 3/10レビュー | MINOR判定の指摘事項 |
| Phase 11手動テスト | スコープ外の発見事項 |
| コードコメント | TODO/FIXME/HACK/XXX |
| `describe.skip` ブロック | 削除済みtestidの旧参照残存 |

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

| ソース                   | 確認項目                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| 元タスク仕様書           | 「スコープ外」として明示された項目                                                          |
| Phase 3/10レビュー結果   | MINOR判定の指摘事項                                                                         |
| Phase 11手動テスト       | スコープ外の発見事項・改善提案                                                              |
| コードコメント           | TODO/FIXME/HACK/XXX                                                                         |
| `describe.skip` ブロック | 削除したtestid/要素名が旧参照として残存していないか（残存時はcleanupタスクをbacklogに登録） |

```bash
# 未タスク検出スクリプト
node scripts/detect-unassigned-tasks.js --scan packages/shared/src --output .tmp/unassigned-candidates.json
```

📖 [references/phase-11-12-guide.md](references/phase-11-12-guide.md)
📖 [references/spec-update-workflow.md](references/spec-update-workflow.md)
📖 [agents/generate-unassigned-task.md](agents/generate-unassigned-task.md)

## 変更履歴

| Version                | Date                       | Changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **v10.09.45** | **2026-04-13** | **UT-W3-ANALYTICS-HTTP-PROVIDER-001 skill-feedback 反映**: 「よくある漏れ」テーブルに **[UT-W3-HTTP]** 1件（Phase 4 でガード条件の全 falsy パターン未列挙による Phase 6 追加漏れ）を追記。 |
| **v10.09.45** | **2026-04-13** | **TASK-UI-SCHEDULE-CRON-SEMANTIC-001 skill-feedback 反映**: 「よくある漏れ」テーブルに **[FB-CRONVL-001]**（Phase 2 ライブラリ採用時の複合フィールド AND/OR semantics 実測確認漏れ）・**[FB-CRONVL-002]**（NON_VISUAL renderer utility の opt-in フラグ追加時に UI 統合経路を別タスク化することを Phase 1 で明示する）を追記。`aiworkflow-requirements/SKILL.md` Trigger キーワードに `ValidateCronOptions` / `cron-parser` / `semantic（cronバリデーション）` 等を追加。LOGS.md 2ファイル同波更新。 |
| **v10.09.44** | **2026-04-12** | **UT-W3-ANALYTICS-ADAPTER-001 skill-feedback 反映**: 「よくある漏れ」テーブルに **[UT-W3]** 3件（`implementation-guide.md` の current contract 旧方針記述 / `artifacts.json` parity 未確認 / `generate-index.js` 省略によるインデックス stale）を追記。 |
| **v10.09.44**          | **2026-04-12**             | **TASK-CRON-SEMANTIC-VALIDATION-001 Phase 12完了・non-visual task判定基準追加**: 「必須タスク」テーブルを5タスク→6タスクに修正（Task 12-6コンプライアンスチェック追加）。non-visual task判定基準テーブル（Phase 11スクリーンショットN/A・Phase 12-2 Step 2 N/A条件）を追加。未タスク0件判定ソース一覧テーブルを追加。LOGS.md 2ファイル同波更新。 |
| **v10.09.43** | **2026-04-12** | **UT-W3-ANALYTICS-ADAPTER-001 Phase 12 close-out sync**: `outputs/phase-12/` canonical 6成果物の欠落を解消し、`implementation-guide.md` を Part 1/Part 2 構成で current facts に再構成。`artifacts.json` と `outputs/artifacts.json` を `phase12_completed` + `phase13 blocked` で同期し、`index.md` phase status との同値性を回復。`aiworkflow-requirements` 側の analytics / trackEvent / IPC 契約 / task-workflow completed 記録を同 wave で更新し、Phase 12 root evidence を `phase12-task-spec-compliance-check.md` に集約。 |
| **v10.09.43**          | **2026-04-11**             | **UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001 skill-feedback 反映**: 「よくある漏れ」テーブルに **[FB-TASK-01/02]**（testid 削除後の `describe.skip` 内残存参照 CI 非検出問題）を追記。`patterns-lessons-and-pitfalls.md` に describe.skip 内 testid 残存 pitfall を追加。`aiworkflow-requirements/references/lessons-learned-skill-wizard-redesign.md` に L-SKIP-001/002 を追加。LOGS.md 2ファイル同波更新。                                                                                                                    |
| **v10.09.42**          | **2026-04-11**             | **UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 skill-feedback 反映**: Phase 12 と Phase 13 の境界テーブルに Task 12-6（`phase12-task-spec-compliance-check.md` を root evidence として残す）を追加し Task 12-5 の責務を分離。`SKILL_CATEGORY_LABELS satisfies Record<SkillCategory, string>` パターンによるコンパイル時ラベルドリフト防止を lessons-learned に記録。台帳3点同期（workflow spec / artifacts.json / outputs/artifacts.json）を Phase 12 標準チェックリストに追加。LOGS.md 2ファイル + SKILL.md 2ファイル同波更新。 |
| **v10.09.41**          | **2026-04-11**             | **UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC skill-feedback 反映**: 「よくある漏れ」テーブルに **[FB-04]**（Phase 12 close-out 時の ledger / lane index / artifacts 三者同期漏れ）を追記し、Step 1-A での5ファイル同一wave同期チェックを明文化。mirror (`.agents`) 側にも同差分を反映。                                                                                                                                                                                                                                           |
| **v10.09.41**          | **2026-04-11**             | **UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 skill-feedback 反映**: Phase 12 と Phase 13 の境界テーブルに Task 12-6（`phase12-task-spec-compliance-check.md` を root evidence として残す）を追加し Task 12-5 の責務を分離。`SKILL_CATEGORY_LABELS satisfies Record<SkillCategory, string>` パターンによるコンパイル時ラベルドリフト防止を lessons-learned に記録。台帳3点同期（workflow spec / artifacts.json / outputs/artifacts.json）を Phase 12 標準チェックリストに追加。LOGS.md 2ファイル + SKILL.md 2ファイル同波更新。 |
| **v10.09.40**          | **2026-04-08**             | **TASK-SC-13-VERIFY-CHANNEL-IMPLEMENTATION skill-feedback 反映**: 「よくある漏れ」テーブルに Feedback SC-13-1（`ALLOWED_INVOKE_CHANNELS` 追記漏れ対策）・SC-13-2（公開 surface と内部エンジン名衝突時の DTO 変換表必須化）を追記。`api-ipc-system-skill-creator-part2.md` に `skill-creator:verify` チャンネル仕様・DTO 型定義・設計注意点を追加。`lessons-learned-ipc-preload-runtime-2026-04.md` に L-SC13-IPC-001/002 を追加。LOGS.md 同波更新。                                                                               |
| **v10.09.39**          | **2026-04-08**             | **UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001 skill-feedback 反映**: 「よくある漏れ」テーブルに Feedback W0-RV-001（境界値テスト文字列の実文字数確認）を追記。`aiworkflow-requirements/references/lessons-learned-current-2026-04.md` に L-RV-001・L-RV-002 を追加。LOGS.md 2ファイル + SKILL.md 同波更新。                                                                                                                                                                                                                         |
| **v10.09.38**          | **2026-04-08**             | **UT-SKILL-WIZARD-W1-par-02b skill-feedback 反映**: `patterns-lessons-and-pitfalls.md` に renderer node-only import pitfall を追加。`phase-template-phase11.md` に UI task VISUAL デフォルトガイドを追加。`phase-12-documentation-guide.md` Task 12-6 に identifier consistency check を追加。「よくある漏れ」テーブルに Feedback W1-02b-1〜4 を追記。LOGS.md 2ファイル + SKILL.md 2ファイル同波更新。                                                                                                                            |
| **v6.18.12〜v6.18.27** | **2026-03-26〜2026-04-07** | 詳細履歴はアーカイブへ移管済み。内容は [LOGS.md](LOGS.md) / [references/logs-archive-2026-march.md](references/logs-archive-2026-march.md) を参照                                                                                                                                                                                                                                                                                                                                                                                 |


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

| 漏れパターン                                                                                                                                                                                    | 防止方法                                                                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[UT-W3]** `implementation-guide.md` が current contract（trackEvent → analyticsAdapter → analytics:send）ではなく旧方針（renderer-local no-op）のまま記述される | Phase 12 Task 12-1 で `implementation-guide.md` を作成する前に `trackEvent.ts` の prod sink 分岐と `analyticsAdapter.ts` の存在を確認し、current contract を先に記録してから説明文を書く |
| **[UT-W3]** `artifacts.json` / `outputs/artifacts.json` parity 未確認のまま Phase 12 を閉じる | Phase 12 完了前に `artifacts.json` と `outputs/artifacts.json` の両ファイルを diff し、`phase12_completed` + `phase13_blocked` が同値であることを確認する |
| **[UT-W3]** Phase 12 Task 12-2/12-3/12-6 で `generate-index.js` 実行を省略してインデックスが stale になる | Task 12-2（システム仕様書更新）・Task 12-3（changelog 更新）・Task 12-6（compliance check）の完了後は `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を必ず実行し、インデックス stale を防ぐ |
| **[UT-W3-HTTP]** Phase 4 でガード条件（`if (!url)`）の全 falsy パターンを列挙せず、空文字 URL（TC-E04）が Phase 6 でしか検出されなかった | ガード節を設計する際は `undefined` / `null` / `""` / スペースのみの4パターンを同時に列挙し、`!url` が網羅するケースを Phase 4 テスト仕様に明記する |
| Step 1-C（関連タスクテーブル）を未実行                                                                                                                                                          | spec-update-workflow.md の「確認すべきファイル」表を実行前に必ず読む                                                                                                                                                                                                       |
| topic-map.md 未更新                                                                                                                                                                             | 仕様書に新規セクション追加時は必ず topic-map.md のエントリも追加                                                                                                                                                                                                           |
| documentation-changelog.md が不完全                                                                                                                                                             | 全Step（1-A/1-B/1-C/Step 2）の結果を個別に明記する（「該当なし」も記録）                                                                                                                                                                                                   |
| `system-spec-update-summary.md` を未作成で完了扱い                                                                                                                                              | Phase 12成果物一覧と `outputs/phase-12/` 実体を1対1で突合し、不足ファイルは完了前に作成する                                                                                                                                                                                |
| LOGS.md が1ファイルのみ更新                                                                                                                                                                     | 必ず aiworkflow-requirements/LOGS.md と task-specification-creator/LOGS.md の両方                                                                                                                                                                                          |
| 完了タスクセクションが簡略形式                                                                                                                                                                  | spec-update-workflow.md のテンプレート（テスト結果サマリー + 成果物テーブル）に従う                                                                                                                                                                                        |
| `artifacts.json` と `outputs/artifacts.json` が不一致                                                                                                                                           | Phase 12完了前に2ファイルを同期し、completed成果物の参照切れを0件にする                                                                                                                                                                                                    |
| **[FB-04]** Phase 12 close-out で backlog ledger / completed ledger / lane index / workflow artifacts / skill artifacts の5点を同一waveで同期せず、タスク状態が二重化する                       | Step 1-A の開始時に三者同期チェックリストで5ファイルを1件ずつ突合し、同一ターンで一括更新する。更新後は `validate-phase-output.js --phase 12` と `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator` で整合を確認する           |
| 設計タスクの workflow root を `completed` にしてしまう                                                                                                                                          | workflow root は `implementation_ready`、completed ledger は `spec_created` に分離する                                                                                                                                                                                     |
| Phase 10 MINOR指摘を未タスク化せず進行                                                                                                                                                          | **Phase 10レビュー前に** unassigned-task-guidelines.md を読み、MINOR判定→未タスク化ルールを確認                                                                                                                                                                            |
| 未タスク検出レポートで0件判定のまま未修正                                                                                                                                                       | Phase 10 MINOR指摘は必ず未タスク化の対象。「機能に影響なし」は不要判定の理由にならない                                                                                                                                                                                     |
| `task-workflow.md` の未タスクリンクが参照切れ                                                                                                                                                   | Step 1-E後に `verify-unassigned-links.js` を実行して `ALL_LINKS_EXIST` を確認する                                                                                                                                                                                          |
| **[Feedback 2]** Phase 12 着手時に `outputs/artifacts.json` と phase spec の artifact 名が照合されない                                                                                          | Phase 12 の **最初の作業**として `outputs/artifacts.json` と各 `phase-*.md` に記載されたartifact名を1対1で突合し、不一致があれば着手前に修正する                                                                                                                           |
| **[Feedback 3]** Phase 11 の UI task / docs-only task 判定がずれる                                                                                                                              | Phase 1 で記録したタスク分類（UI task / docs-only task）を Phase 11 着手時に必ず参照する。分類が変わっていた場合は再判定を明示する                                                                                                                                         |
| **[Feedback W0-01]** shared 型追加で root `@repo/shared` に再エクスポートすると `SkillCategory` が衝突する                                                                                      | 新しい共有型は subpath export（例: `@repo/shared/types/skillCreator`）に閉じ、既存 root barrel は触らない。`phase-12-docs.md` と system spec の両方で公開経路を明記する                                                                                                    |
| **[Feedback P0-09-U1-1]** Phase 4 仕様書に private method テスト方針が未記載                                                                                                                    | `(facade as unknown as FacadePrivate)` キャストと public callback 経由テストの2択を Phase 4 仕様書に必ず明記する                                                                                                                                                           |
| **[Feedback P0-09-U1-2]** `improve()` フローの canUseTool 配線先（SDK callback vs `applyImprovement()`）が仕様書から読み取れない                                                                | Phase 5 仕様書のタスク2に「canUseTool 適用可能範囲と制約」セクションを設け、`llmAdapter.sendChat()` 経由時は SDK callback 非適用と明記する                                                                                                                                 |
| **[Feedback BEFORE-QUIT-001]** Phase 11 が非 visual task なのに実地操作を要求してしまう                                                                                                         | Phase 11 では「実地操作不可」を明記し、自動テスト結果 + 既知制限リストを代替記録として残す                                                                                                                                                                                 |
| **[Feedback BEFORE-QUIT-002]** Phase 7 coverage が全ファイル一律指定だと局所検証の意図がぼやける                                                                                                | Phase 7 では coverage の対象範囲を明示し、変更したファイル/ブロック以外を対象外として書く                                                                                                                                                                                  |
| **[Feedback BEFORE-QUIT-003]** Phase 12 の system-spec update で workflow-local と global sync が混在する                                                                                       | `documentation-changelog.md` で workflow-local 同期と global skill sync を別ブロックで記録する                                                                                                                                                                             |
| **[Feedback 4]** Phase 11 NON_VISUAL のとき manual-test-result.md の証跡メタが薄い                                                                                                              | Phase 11 が NON_VISUAL の場合、`manual-test-result.md` のメタ情報に「証跡の主ソース（自動テスト名/件数）」と「スクリーンショットを作らない理由」を明記する。空メタでは reviewer が意図を読み取れない                                                                       |
| **[Feedback 5]** Phase 7 の coverage 目標が広域指定のとき変更行の保護確認が曖昧になる                                                                                                           | Phase 7 のカバレッジ目標が「全体 X%」など広域指定のとき、変更した関数/ブロックの line カバレッジと branch カバレッジの実測値を証跡に残す（例: `applyWorkflowSnapshot` 付近の line 100% / branch 100%）                                                                     |
| **[Feedback 6]** ViewType を追加した際に navigation 契約・store 型・既存テストの3点更新が漏れる                                                                                                 | `store/types.ts`（ViewType union）/ `skillLifecycleJourney.ts`（正規化関数・定数）/ renderView テスト を same-wave で更新し、`ui-ux-navigation.md` の ViewType テーブルも同時同期する。Phase 1 設計メモに「追加 ViewType: XYZ」を明示しておくと漏れが防げる                |
| **[FB-UI-02-1]** Phase 9 QA で「ファイル削除」を PASS 基準にすると stub 化タスクが FAIL 扱いになる                                                                                              | Phase 9 の削除確認は「git delete されている OR `export {}` stub 化かつ live import ゼロのいずれか」を PASS とする。たとえば、廃止ファイルを stub 化した場合は `grep -rn "import.*廃止ファイル名" src/` でゼロ件を証跡に残す                                                |
| **[Feedback TASK-UI-04]** 実装完了後に `artifacts.json` status が `spec_created` / `in_progress` のまま放置される                                                                               | 実装 Phase（Phase 5 or 最終実装 Phase）完了時に `complete-phase.js` を必ず実行し、status を `completed` に更新する。実装完了と仕様書ステータス更新は同一 wave で行う（後回しは乖離蓄積の主因）。有効値: `spec_created` / `in_progress` / `completed` / `phase12_completed` |
| **[FB-SDK-07-2]** Phase 1 で新規 IPC surface を定義する際に Preload API 経由が明記されない                                                                                                      | Phase 1（要件定義）では新規 IPC surface を定義する場合、「Preload API 経由必須」を明記する。直接 `ipcRenderer.on` は禁止パターンとして記録する                                                                                                                             |
| **[FB-SDK-07-4]** Phase 1 で既存 API の命名パターンを確認せずに新規 API を命名し、Phase 3 で MINOR 指摘を受ける                                                                                 | Phase 1（要件定義）では既存の `safeOn` / `safeInvoke` 等の命名パターンを確認し、新規 API の命名規則一貫性を担保する。命名ドリフトは Phase 3 レビューゲートの MINOR 指摘の主要因となる                                                                                      |
| **[Feedback W1-02b-1]** UI task の `screenshot-plan.json` が `mode: "NON_VISUAL"` のまま Phase 11 を迎えやすい                                                                                  | UI コンポーネント変更タスクでは `screenshot-plan.json` 生成時に `mode: "VISUAL"` をデフォルトにする。`phase11-capture-metadata.json` の `taskId` が現行タスク ID と一致するか Phase 11 着手前に確認する（`jq '.taskId' outputs/phase-11/phase11-capture-metadata.json`）   |
| **[Feedback W1-02b-2]** multi-step wizard 設計で「ステップ間の state ownership と引き渡し項目」が Phase 2 設計書に未記載                                                                        | Phase 2（設計）でウィザード / マルチステップ UI を設計する場合、「ステップ間 state 引き渡しテーブル」を必須セクションとして設ける。`smartDefaults` など推論値の反映タイミング（初回のみ / 都度上書き / ユーザー優先）は decision 欄で固定する                              |
| **[Feedback W1-02b-3]** `implementation-guide.md` の callback 名・props 名が実装と一致していない（identifier drift）                                                                            | Phase 12 Task 12-6 で `implementation-guide.md` 内の識別子を現行コードで `grep` 確認する。スニペットは型定義・props interface から引用し、手書き snippets を避ける                                                                                                         |
| **[Feedback W1-02b-4]** renderer UI コンポーネントで node-only パッケージを直接 import し、Vite browser bundle が runtime error になる                                                          | renderer コンポーネントでは node-only パッケージ（`node-cron` 等）を直接 import しない。cron/schedule 検証は browser-safe ユーティリティに切り出す。Phase 11 capture 前に「ブラウザで実際に route を開く smoke test」を必須にする                                          |
| **[Feedback W0-RV-001]** minLength / maxLength のテストケースで境界値文字列の実文字数を確認せずに誤った長さで書く（例: `"十文字以上の目的"` = 実際は 7 文字）                                   | テスト文字列を書く前に `"...".length` で実文字数を確認する。日本語の漢数字表記の意味と `.length` は別物。境界値テストは `// length: N` コメントを付けてから書く                                                                                                            |
| **[Feedback SC-13-1]** IPC surface 追加時に `apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` への追記が漏れる                                                                | IPC surface 追加タスクでは Phase 2 成果物のチェックリストに「`ALLOWED_INVOKE_CHANNELS` への追記」を必須項目として記載する。`shared/ipc/channels.ts` への定数追加だけでは Renderer から呼び出せない                                                                         |
| **[Feedback SC-13-2]** 公開 IPC メソッド名（`verify(skillName, ...)`）と内部エンジンメソッド名（`verifySkill(skillDir)`）が酷似し Phase 2 設計時に責務が不明確になる                            | 公開 surface と内部エンジンで名前が近い場合、Phase 2 成果物に「内部型 → 公開 DTO 変換表」と「解決レイヤ名称（例: `resolveVerifySkillDir`）」を必須セクションとして設ける                                                                                                   |
| **[Feedback VSCPKR-01]** JSDoc コメント内に `*/` を含む説明（例: `ステップ値 */n`）があると esbuild がコメント終端と誤認識しパースエラーになる                                                  | cron 式や数式を JSDoc コメント内で説明する場合は `*/` を避け、`* /n` のようにスペースを挿入するか、コードブロック（\`\`\`）形式で書く。`@example` タグ内の inline cron 式も同様                                                                                            |
| **[Feedback VSCPKR-02]** happy-dom 環境で `vi.stubGlobal("window", ...)` でウィンドウ全体を置き換えると React 内部の `instanceof HTMLElement` が常に false になり、コンポーネントテストが壊れる | `window.api` などの Electron Preload API をモックする場合は `Object.defineProperty(window, "api", { value: mockApi, writable: true })` を使う。`vi.stubGlobal("window", ...)` は使用禁止                                                                                   |
| **[FB-TASK-01/02]** testid 削除・改名後に `describe.skip` ブロック内の旧参照が残存し CI に検出されない（スキップ済みテストは実行されないため型エラーも発生しない）                              | testid 削除タスクでは Phase 5 完了チェックとして `grep -rn "<削除testid>" apps/` を実行し、`describe.skip` 内を含む全残存参照をゼロにする。同一 wave で削除しないと cleanup タスクが積み残される                                                                           |


### Phase 12 苦戦防止Tips

> UT-STORE-HOOKS-COMPONENT-MIGRATION-001の経験に基づく（2026-02-12）

| Tips                                                     | 説明                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **事前に空欄チェックリストを作成**                       | documentation-changelog.mdにStep 1-A〜1-D + Step 2の各欄を空欄で事前作成し、逐次消化する                                                                                                                                                                             |
| **spec-update-workflow.mdを常に参照**                    | Phase 12開始時に必ず [spec-update-workflow.md](references/spec-update-workflow.md) を開き、チェックリストを確認                                                                                                                                                      |
| **「全Step確認前に完了と記載しない」厳守**               | P4パターン。全Stepの結果を個別に記録してから「Phase 12完了」とする                                                                                                                                                                                                   |
| **LOGS.md/SKILL.md は4ファイル更新**                     | aiworkflow-requirements/LOGS.md, task-specification-creator/LOGS.md, aiworkflow-requirements/SKILL.md, task-specification-creator/SKILL.md                                                                                                                           |
| **topic-map.md再生成はセクション変更時も**               | 新規追加だけでなく、セクション更新・削除時も `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` と `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/{{FEATURE_NAME}} --regenerate` を実行 |
| **worktree環境でも `.claude` 正本を実更新する**          | worktree を理由に LOGS.md / SKILL.md / backlog / workflow の更新を先送りしない。`.agents/skills/` は `rsync` / `diff` で mirror parity を確認する                                                                                                                    |
| **並列エージェント完了後はファイルシステムで検証**       | P43/P59対策。エージェントがコンテキスト制限で応答不能になった場合、`git diff --stat` + `ls outputs/phase-*/` + `artifacts.json` のPhaseステータスで成果物の存在を確認する                                                                                            |
| **NON_VISUAL判定時は `screenshots/.gitkeep` を削除する** | `screenshots/` ディレクトリが空（PNG 0件）のまま残るとvalidator errorになる。NON_VISUAL判定で実スクリーンショットが不要な場合は `screenshots/.gitkeep` を削除してディレクトリごと除外する                                                                            |
| **worktree作成後は `pnpm install` を確認する**           | `esbuild` host/binary version drift により Vitest 起動前に停止することがある。worktree作成後は必ず `pnpm install` を実行してバイナリの整合を確保する                                                                                                                 |

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

| Task      | 完了条件                                                                             | 詳細                                                                                       |
| --------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Task 12-1 | `implementation-guide.md` が Part 1/2 を満たす                                       | [references/phase-12-documentation-guide.md](references/phase-12-documentation-guide.md)   |
| Task 12-2 | Step 1 と Step 2 の判定が記録される                                                  | [references/spec-update-workflow.md](references/spec-update-workflow.md)                   |
| Task 12-3 | `documentation-changelog.md` と artifacts が同期される                               | [references/spec-update-validation-matrix.md](references/spec-update-validation-matrix.md) |
| Task 12-4 | 0件でも `unassigned-task-detection.md` を出し、`current/baseline` を分離して記録する | [references/unassigned-task-guidelines.md](references/unassigned-task-guidelines.md)       |
| Task 12-5 | 改善点なしでも `skill-feedback-report.md` を出す                                     | [references/patterns-phase12-sync.md](references/patterns-phase12-sync.md)                 |
| Task 12-6 | `phase12-task-spec-compliance-check.md` を root evidence として残す                  | [references/patterns-phase12-sync.md](references/patterns-phase12-sync.md)                 |
| Phase 13  | commit と PR は user の明示承認後だけ                                                | [references/review-gate-criteria.md](references/review-gate-criteria.md)                   |

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

| 観点               | aiworkflow-requirements 側の参照先 |
| ------------------ | ---------------------------------- |
| セキュリティ       | `security-*.md`                    |
| UI/UX              | `ui-ux-*.md`                       |
| アーキテクチャ     | `architecture-*.md`                |
| API/IPC            | `api-*.md`                         |
| データ整合性       | `database-*.md`                    |
| エラーハンドリング | `error-handling.md`                |
| インターフェース   | `interfaces-*.md`                  |

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
- Phase 12 は `implementation-guide`、`system-spec-update-summary`、`documentation-changelog`、`unassigned-task-detection`、`skill-feedback-report`、`phase12-task-spec-compliance-check` を必ず揃える。
- **[Feedback P0-09-U1-3]** 小規模タスク（Phase 1〜3 で設計が自明）の outputs 必須度は規模（小/中/大）で tier 分けを検討する。ドキュメント作成コストが実装コストを上回るリスクを Phase 1 スコープ固定時に評価する。

### 避けるべきこと

- `.agents` 側だけ先に更新して canonical root を残すこと。
- `outputs/` を後回しにして phase 完了だけ先に付けること。
- `current` と `baseline` の監査結果を混ぜること。
- UI task で screenshot を自動テスト代替として扱うこと。
- user の明示承認なしに commit や PR を作ること。

## 変更履歴

| Version                  | Date                       | Changes                                                                                                                                           |
| ------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **v10.09.22〜v10.09.33** | **2026-03-04〜2026-04-03** | 詳細履歴はアーカイブへ移管済み。内容は [LOGS.md](LOGS.md) / [references/logs-archive-2026-march.md](references/logs-archive-2026-march.md) を参照 |

> 補足: v9.89.0 以前の履歴は `LOGS.md` に保持（監査証跡を維持）。

詳細な履歴と usage log は [LOGS.md](LOGS.md) と [references/logs-archive-index.md](references/logs-archive-index.md) を参照。
