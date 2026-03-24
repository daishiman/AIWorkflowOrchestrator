# Phase 2 成果物: 設計サマリー

> タスクID: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
> 作成日: 2026-03-23
> Phase: 2 - 設計

## 1. Concern 分解（3 Lane）

Phase 1 で抽出した3つの concern を lane として設計する。

| Lane | Concern                   | 所有境界                                     | 主要成果物                |
| ---- | ------------------------- | -------------------------------------------- | ------------------------- |
| L-1  | Governance State Machine  | state 遷移定義 + type 別分岐                 | state-machine.md          |
| L-2  | Canonical Source & Bridge | source table + bridge rule + deprecation     | canonical-source-table.md |
| L-3  | Same-Wave Sync Protocol   | 同期チェックリスト + follow-up formalization | sync-protocol.md          |

## 2. Lane L-1: Governance State Machine

### 2.1 State 遷移設計

```
                ┌──────────────────────────────────────────────┐
                │         Governance State Machine             │
                │                                              │
                │  ┌─────────────┐   gate-1   ┌────────────┐  │
                │  │spec_created │──────────→│impl_ready  │  │
                │  └─────────────┘            └────────────┘  │
                │       │                         │            │
                │       │ MAJOR/CRITICAL          │ gate-2     │
                │       ↓ (rollback)              ↓            │
                │  ┌─────────────┐            ┌────────────┐  │
                │  │  (re-enter  │            │ completed  │  │
                │  │   Phase 1)  │            └────────────┘  │
                │  └─────────────┘                             │
                └──────────────────────────────────────────────┘
```

### 2.2 Type 別遷移条件（Concern C-1 解決）

| 遷移                   | 条件（type: design）                                              | 条件（type: implementation）                                               |
| ---------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------- |
| → spec_created         | Phase 3 PASS/MINOR 消化 + 設計成果物が outputs/phase-1〜3/ に存在 | 同左                                                                       |
| → implementation_ready | Phase 10 PASS + 全設計成果物が outputs/phase-4〜11/ に存在        | Phase 10 PASS + 全テスト PASS + coverage gate 充足 + 手動テスト TC 全 PASS |
| → completed            | Phase 12-13 完了 + PR マージ + branch 削除                        | 同左                                                                       |

**設計判断**: 設計タスクでは `implementation_ready` の遷移条件からテスト実行・coverage gate を除外し、設計成果物の網羅性で判定する。

### 2.3 Phase 10 MINOR 判定後の遷移パス（Concern C-1 補完）

```
Phase 10 MINOR → MINOR 全件を未タスク仕様書に変換 → Phase 11 進行可
Phase 10 MAJOR → 影響範囲に応じて Phase 1-5 へ戻る
Phase 10 CRITICAL → Phase 1 へ戻り要件再確認
```

MINOR 未タスク化は省略不可（05-task-execution.md 準拠）。

### 2.4 逆遷移（Rollback）

| 現在の State         | 逆遷移先             | 条件                                               |
| -------------------- | -------------------- | -------------------------------------------------- |
| spec_created         | (未作成状態)         | Phase 3 MAJOR/CRITICAL で要件問題が発見された場合  |
| implementation_ready | spec_created         | Phase 10 MAJOR/CRITICAL で設計問題が発見された場合 |
| completed            | implementation_ready | PR revert が必要になった場合（manual operation）   |

## 3. Lane L-2: Canonical Source & Bridge

### 3.1 Canonical Source Table 設計

5カテゴリの正本ファイルを定義する。

| カテゴリ        | 正本ファイル群                                                                     | 更新権限者        | 更新タイミング           |
| --------------- | ---------------------------------------------------------------------------------- | ----------------- | ------------------------ |
| Workflow Ledger | task-workflow.md / active / completed / backlog / history / phases / rules         | Phase 12 executor | Phase 12 Task 2          |
| Lessons Learned | lessons-learned.md / current + archive children                                    | Phase 12 executor | Phase 12 Task 2          |
| System Spec     | arch-_ / api-_ / interfaces-_ / security-_ / ui-ux-\*                              | Phase 12 executor | Phase 12 Task 2          |
| Indexes         | topic-map.md / keywords.json / resource-map.md / quick-reference.md                | generate-index.js | Phase 12 Task 2 Step 1-D |
| Skill Meta      | SKILL.md / LOGS.md（aiworkflow-requirements + task-specification-creator の2箇所） | Phase 12 executor | Phase 12 Task 2 Step 1-A |

### 3.2 Bridge Rule 設計（Concern C-3 解決）

| ルール               | 内容                                                                      |
| -------------------- | ------------------------------------------------------------------------- |
| Canonical Root       | `.claude/skills/` が唯一の正本                                            |
| Mirror Target        | `.agents/skills/` は mirror（一方向同期）                                 |
| Sync Command         | `rsync -avz --checksum ./.claude/skills/ ./.agents/skills/`               |
| Verification         | `diff -qr ./.claude/skills/ ./.agents/skills/` → 差分0件                  |
| Legacy Path          | legacy-ordinal-family-register.md に旧パス → canonical パスの逆引きを保持 |
| Deprecation Timeline | legacy register は参照専用として無期限保持。新規パス追加は canonical のみ |

**設計判断**: bridge rule に有効期限を設けず、legacy register を「参照専用の逆引き台帳」として永続化する。理由: 旧パスを参照するスクリプトやドキュメントが存在する限り、逆引き機能は必要。完全廃止よりも「新規追加禁止 + 参照のみ」の方がコストが低い。

### 3.3 Simpler Alternative（L-2）

| 代替案                              | 内容                        | 採用しない理由                                          |
| ----------------------------------- | --------------------------- | ------------------------------------------------------- |
| mirror を廃止し .claude/ のみにする | .agents/ ディレクトリを削除 | .agents/ を参照する既存ツールがある可能性を排除できない |
| legacy register を削除する          | 旧パスの逆引きを廃止        | 過去の仕様書が旧パスを参照しており、壊れるリスクがある  |

## 4. Lane L-3: Same-Wave Sync Protocol

### 4.1 同期プロトコル設計（Concern C-2 解決）

Phase 12 完了時の同期を5ステップで定義する。各ステップは前のステップ完了後に実行する（原子性の代わりに順序保証で担保）。

```
Step A: Workflow Ledger 更新
  └─ task-workflow.md + active + completed + backlog
  └─ 最大3ファイル/エージェント（P43 対策）

Step B: Lessons Learned 更新
  └─ lessons-learned.md + current child
  └─ current → baseline 移管判定（wave 完了時のみ）

Step C: System Spec 更新
  └─ 対象 arch-* / api-* / interfaces-* / security-* / ui-ux-*
  └─ 最大3ファイル/エージェント（P43 対策）

Step D: Index 再生成
  └─ node generate-index.js
  └─ topic-map.md + keywords.json の更新確認

Step E: Mirror Sync + Skill Meta
  └─ LOGS.md 2ファイル（aiworkflow-requirements + task-specification-creator）
  └─ SKILL.md 2ファイル 変更履歴更新
  └─ rsync --checksum + diff -qr で mirror 整合確認
```

**設計判断**: 5カテゴリの同期をトランザクションで保証するのではなく、Step A→B→C→D→E の順序実行で担保する。理由: ファイルシステム上のトランザクションは過度な複雑さを招く。順序実行 + documentation-changelog での事後記録の方が、復旧も容易。

### 4.2 Simpler Alternative（L-3）

| 代替案                      | 内容                                    | 採用しない理由                               |
| --------------------------- | --------------------------------------- | -------------------------------------------- |
| 全更新を1エージェントで実施 | 分割せず1エージェントが全ファイルを更新 | P43（rate limit 中断）リスクが高い           |
| changelog を廃止する        | 更新履歴を記録しない                    | P4/P51 の再発防止ができない                  |
| mirror sync を手動にする    | rsync を自動化せず毎回手動              | 忘却リスクが高い（Mirror Sync Drift の再発） |

### 4.3 Follow-up Formalization 設計

| ステップ   | 操作                                                          | 例外                                        |
| ---------- | ------------------------------------------------------------- | ------------------------------------------- |
| Step 1     | `docs/30-workflows/unassigned-task/` に独立指示書ファイル作成 | 設計タスクでも省略不可（P58）               |
| Step 2     | `task-workflow-backlog.md` 残課題テーブルに行追加             | 0件でも「0件」として記録（Phase 12 Task 4） |
| Step 3     | 発見元仕様書に参照リンク追加                                  | 同一ファイル内の場合はセクションリンク      |
| Issue Sync | `gh issue close <number>` で再評価クローズ                    | P56 対策: タスク仕様書クローズと同時実行    |

### 4.4 Current / Baseline 切り分け設計

| 区分     | 定義                                              | 移管条件                               |
| -------- | ------------------------------------------------- | -------------------------------------- |
| Current  | wave 進行中に蓄積される教訓・ルール               | lessons-learned-current.md に記録      |
| Baseline | wave 完了後の確定済み教訓                         | wave 完了宣言 → archive ファイルへ移管 |
| 移管判定 | wave 完了 = 親パック index の全 task が completed | 手動判定（自動化は後続タスク）         |

## 5. Phase 3 Review 観点

Phase 3 で重点的にレビューすべき観点:

| 観点              | drift しやすいポイント                              | blocked 条件                  |
| ----------------- | --------------------------------------------------- | ----------------------------- |
| L-1 State Machine | 設計タスクと実装タスクの遷移条件分岐が正しいか      | FR-3.2 の条件不整合           |
| L-2 Bridge Rule   | deprecation timeline の「無期限保持」が本当に適切か | FR-2.3 の代替案不足           |
| L-3 Sync Protocol | Step A→E の順序が崩れた場合のリカバリ手順があるか   | FR-4.1 のチェックリスト不完全 |
| Cross-Lane        | 3 Lane 間の責務重複がないか                         | Lane 間の曖昧な所有権         |
