# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                                                           |
| ---------- | ---------------------------------------------------------------------------- |
| Phase番号  | 12                                                                           |
| Phase名    | ドキュメント更新                                                             |
| 対象タスク | TASK-P0-01: verify 実行エンジン（Layer 1/2 コア + Layer 3/4 互換）の仕様整合 |
| 関連Issue  | #1886                                                                        |
| タスク種別 | バックエンド Main Process 実装（UI変更なし、IPC変更なし）                    |
| 実施者     | Claude Code                                                                  |

## 目的

実装内容をシステム要件ドキュメントに反映し、技術ドキュメントを作成する。  
本Phaseの実施前に必ず `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目（P1, P2, P3, P4, P25〜P29）を確認すること。

## 事前チェック

```
確認対象: .claude/rules/06-known-pitfalls.md
確認項目: P1, P2, P3, P4, P25, P26, P27, P28, P29
```

各項目を確認し、該当する落とし穴を避けながら本 Phase のタスクを実施する。

## 実行タスク

| Task      | 内容                             | 主成果物                                         |
| --------- | -------------------------------- | ------------------------------------------------ |
| Task 12-1 | 実装ガイド作成（2パート構成）    | `outputs/phase-12/implementation-guide.md`       |
| Task 12-2 | システムドキュメント更新         | `outputs/phase-12/system-spec-update-summary.md` |
| Task 12-3 | ドキュメント更新履歴作成         | `outputs/phase-12/documentation-changelog.md`    |
| Task 12-4 | 未タスク検出レポート作成         | `outputs/phase-12/unassigned-task-detection.md`  |
| Task 12-5 | スキルフィードバックレポート作成 | `outputs/phase-12/skill-feedback-report.md`      |

---

### Task 12-1: 実装ガイド作成（2パート構成）

成果物: `outputs/phase-12/implementation-guide.md`

#### Part 1: 中学生レベルの概念説明

対象読者: プログラミング経験が浅い人・非エンジニア

記載内容:

- **「Layer」とは何か**
  - 日常の例え話を必ず含めること（「たとえば」を最低 1 回使用）
  - 「なぜ Layer が必要か」→「Layer が何をするか」の順序で説明する
- **「独立モジュール」とは何か**
  - 日常の例え話を必ず含めること
  - なぜ独立していることが大切なのかを説明する
- **この実装が何をするか（ざっくり説明）**

記載禁止: 技術的専門用語を説明なしに使用すること

---

#### Part 2: 技術者レベルの API リファレンス

対象読者: 本モジュールを利用・拡張する開発者

記載内容:

1. **`RuntimeSkillCreatorVerifyCheck` インターフェース**
   - `id`: チェック ID（`L1-001`〜`L4-003`）
   - `layer`: `"layer1" | "layer2" | "layer3" | "layer4"`
   - `severity`: `"info" | "warning" | "error"`
   - `summary`: 人間が読める説明文
   - `evidenceSummary?`: 補足情報（任意）
   - 使用例（TypeScript コードスニペット）

2. **`SkillCreatorVerificationEngine` API**
   - クラス概要・責務
   - コンストラクタシグネチャ（`new SkillCreatorVerificationEngine()`）
   - 公開メソッド一覧（引数・戻り値・例外）
   - `verify(skillDir: string): Promise<RuntimeSkillCreatorVerifyCheck[]>` の呼び出し例
   - 使用例（TypeScript コードスニペット）

3. **Layer 1 / Layer 2 コアチェック一覧**

   | チェックID | Layer | 内容                                  | 失敗時の severity |
   | ---------- | ----- | ------------------------------------- | ----------------- |
   | L1-001     | 1     | SKILL.md 存在確認                     | `error`           |
   | L1-002     | 1     | agents/ ディレクトリ存在確認          | `error`           |
   | L1-003     | 1     | agents/ に 1 件以上のファイル存在     | `error`           |
   | L1-004     | 1     | references/ ディレクトリ存在確認      | `warning`         |
   | L1-005     | 1     | output-schema.json 存在確認           | `warning`         |
   | L2-001     | 2     | SKILL.md H1 見出し確認                | `error`           |
   | L2-002     | 2     | SKILL.md `## 概要` セクション確認     | `error`           |
   | L2-003     | 2     | SKILL.md `## Trigger` セクション確認  | `error`           |
   | L2-004     | 2     | SKILL.md `## Anchors` セクション確認  | `warning`         |
   | L2-005     | 2     | agent ファイル H1 見出し確認          | `error`           |
   | L2-006     | 2     | agent ファイル `## 責務` 確認         | `warning`         |
   | L2-007     | 2     | output-schema.json の JSON 妥当性確認 | `error`           |

   > current facts: Layer 3/4 は既に verify 契約に含まれている。ここでは Layer 1/2 コアの説明に集中し、4-layer 互換を前提に読む。

4. **エラーハンドリングとエッジケース**
   - `SKILL.md` が読めないときの扱い
   - `agents/` が空、または `.md` 以外しかないときの扱い
   - `output-schema.json` が存在しない / 壊れているときの扱い
   - Layer 1 の失敗が Layer 2 の出力可否にどう影響するか

5. **設定可能なパラメータと定数**
   - チェック ID 形式: `L{N}-{NNN}`
   - severity: `info` / `warning` / `error`
   - 対象ファイル名: `SKILL.md`, `agents/*.md`, `references/`, `output-schema.json`
   - Layer 出力制御条件: `error` のみを前提にする
   - `verificationEngine` 未注入時の graceful degradation

6. **統合パターン（`RuntimeSkillCreatorFacade` 経由）**
   - 依存注入方法
   - graceful degradation の動作仕様
   - 後続タスク（TASK-P0-02）との連携方法

---

### Task 12-2: システムドキュメント更新

成果物: `outputs/phase-12/system-spec-update-summary.md`

#### Step 1-A: 仕様書完了記録

以下の 4 ファイルに完了記録を追記する。

- `.claude/skills/aiworkflow-requirements/LOGS.md`
- `.claude/skills/task-specification-creator/LOGS.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`
- `.claude/skills/task-specification-creator/SKILL.md`

記録内容: タスク名・実装日・実装概要・関連 Issue

#### Step 1-B: 実装状況テーブル更新

`references/` 配下の実装状況テーブルに `SkillCreatorVerificationEngine` の行を追加する。

| 項目         | 値                                |
| ------------ | --------------------------------- |
| モジュール名 | SkillCreatorVerificationEngine    |
| ステータス   | 実装済み（current contract sync） |
| 関連Issue    | #1886                             |
| 後続タスク   | TASK-P0-02, TASK-RT-03            |

#### Step 1-C: 関連タスクテーブル更新

TASK-P0-01 のステータスを「完了」に更新し、後続タスク（TASK-P0-02, TASK-RT-03）との依存関係を記録する。

#### Step 1-D: topic-map.md 再生成

`references/topic-map.md` に `SkillCreatorVerificationEngine` エントリを追加する。  
既存のトピックマップ形式に従って記載すること。

#### Step 2: システム仕様更新（current contract sync のため必須）

更新対象: `interfaces-skill-verify-contract.md`

- `RuntimeSkillCreatorVerifyCheck` 型の定義を current facts に合わせて追記する
- `layer` が 4-layer 互換であることと、Layer 1/2 コアをこの Phase の主対象にすることを明記する
- 型の追加がシステム全体の型契約に与える影響を記録する

---

### Task 12-3: ドキュメント更新履歴作成

成果物: `outputs/phase-12/documentation-changelog.md`

記載内容:

- 更新日時
- 更新したドキュメント一覧（ファイルパス・変更種別・変更概要）
- 変更者（Claude Code）
- 関連 Issue / PR
- validator 実行結果
- current / baseline の区別
- artifacts 同期結果
- 未完了表現を残さない確認結果

---

### Task 12-4: 未タスク検出レポート作成

成果物: `outputs/phase-12/unassigned-task-detection.md`（0 件でも出力必須）

以下の観点から未タスクを検出する。

- 実装中に発見した改善点で、本タスクのスコープ外のもの
- Phase 10 の MINOR 指摘で未 Issue 化のもの
- Phase 11 の `discovered-issues.md` の内容で未タスク化のもの
- 0 件でも「未タスクはありません」と明示する
- 1 件以上ある場合は `docs/30-workflows/unassigned-task/` または `docs/30-workflows/completed-tasks/unassigned-task/` の配置先を明記する

記載形式:

```markdown
## 未タスク一覧

<!-- 0件の場合 -->

未タスクは検出されませんでした。

<!-- 1件以上の場合 -->

| ID     | 概要 | 優先度 | 推奨担当 Phase |
| ------ | ---- | ------ | -------------- |
| UT-001 | ...  | Medium | TASK-RT-03     |
```

---

### Task 12-5: スキルフィードバックレポート作成

成果物: `outputs/phase-12/skill-feedback-report.md`（改善点なしでも出力必須）

以下の観点からフィードバックをまとめる。

- 本タスク実施中に気づいた `aiworkflow-requirements` スキルへの改善提案
- 本タスク実施中に気づいた `task-specification-creator` スキルへの改善提案
- `skill-fixture-runner` スキルとの連携改善提案
- Phase 仕様書フォーマットへの改善提案

#### Task 12-6: phase12-task-spec-compliance-check【必須・最終確認】

成果物: `outputs/phase-12/phase12-task-spec-compliance-check.md`

以下の内容を 1 ファイルに集約する。

- Task 12-1〜12-5 の成果物存在確認
- Task 12-1〜12-5 の実質監査
- Step 1-A〜1-G の実更新確認
- Step 2 の current fact / no-op / domain sync 確認
- validator 結果、root parity、artifacts 同期、未完了表現 0 件の記録

記載形式:

```markdown
## スキルフィードバックレポート

### task-specification-creator

<!-- 改善点なしの場合 -->

改善提案はありません。

<!-- 改善点ありの場合 -->

- FB-01: ...

### skill-fixture-runner

...

### Phase仕様書フォーマット

...
```

---

## 参照資料

- `aiworkflow-requirements`:
  - `.claude/skills/aiworkflow-requirements/LOGS.md`
  - `.claude/skills/aiworkflow-requirements/SKILL.md`
  - `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
- `task-specification-creator`:
  - `.claude/skills/task-specification-creator/SKILL.md`
  - `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`
  - `.claude/skills/task-specification-creator/references/phase-template-phase12.md`
  - `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `phase-2-design.md`（設計の前提）
- `phase-5-implementation.md`（実装の前提）
- `phase-6-test-expansion.md`（テスト拡充の前提）
- `phase-7-coverage.md`（カバレッジ確認の前提）
- `phase-8-refactoring.md`（リファクタリングの前提）
- `phase-9-quality.md`（品質保証の前提）
- `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`
- `packages/shared/src/types/skillCreator.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `.claude/rules/06-known-pitfalls.md`（事前チェック対象）
- `outputs/phase-10/final-review-result.md`（MINOR 指摘の引用元）
- `outputs/phase-11/discovered-issues.md`（未タスク検出の参照元）

## 統合テスト連携

- Phase 11（手動テスト）の完了を前提とする
- 本 Phase で作成したドキュメントは Phase 13（PR 作成）の PR 本文に引用される

## 成果物

| 成果物                       | パス                                                     | 必須                       |
| ---------------------------- | -------------------------------------------------------- | -------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | 必須                       |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | 必須                       |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 必須                       |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 必須（0 件でも出力）       |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 必須（改善点なしでも出力） |
| 仕様準拠確認                 | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 必須（root evidence）      |

## 完了条件

- [ ] 本 Phase 内の全タスク（Task 12-1 〜 12-6）を 100% 実行完了
- [ ] 事前チェック（`.claude/rules/06-known-pitfalls.md` P1, P2, P3, P4, P25〜P29）を確認した
- [ ] `outputs/phase-12/implementation-guide.md` が出力されている（Part 1 に「たとえば」を含む）
- [ ] `outputs/phase-12/system-spec-update-summary.md` が出力されている
- [ ] `outputs/phase-12/documentation-changelog.md` が出力されている
- [ ] `outputs/phase-12/unassigned-task-detection.md` が出力されている（0 件でも出力）
- [ ] `outputs/phase-12/skill-feedback-report.md` が出力されている（改善点なしでも出力）
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が出力されている
- [ ] `interfaces-skill-verify-contract.md` に `RuntimeSkillCreatorVerifyCheck` の完了記録が追記されている

## 次の Phase

Phase 13: PR 作成（`phase-13-pr-creation.md`）
