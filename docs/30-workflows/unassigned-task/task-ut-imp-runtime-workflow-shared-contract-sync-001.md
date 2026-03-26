# UT-IMP-RUNTIME-WORKFLOW-SHARED-CONTRACT-SYNC-001: runtime workflow failure review 契約の shared 同期

## メタ情報

```yaml
issue_number: 1651
task_id: UT-IMP-RUNTIME-WORKFLOW-SHARED-CONTRACT-SYNC-001
task_name: runtime workflow failure review 契約の shared 同期
category: 仕様同期
target_feature: Runtime workflow engine の awaitingUserInput / verifyResult shared contract
priority: 中
scale: 中規模
status: 未実施
source_phase: UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001 Phase 12 再レビュー / 2回確認
created_date: 2026-03-26
dependencies:
  [
    UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001,
    TASK-SDK-04,
    TASK-SDK-08,
  ]
```

| 項目         | 内容                                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-RUNTIME-WORKFLOW-SHARED-CONTRACT-SYNC-001                                   |
| タスク名     | runtime workflow failure review 契約の shared 同期                                 |
| 分類         | 仕様同期                                                                           |
| 対象機能     | `awaitingUserInput` / `verifyResult` の shared/public 契約                         |
| 優先度       | 中                                                                                 |
| 見積もり規模 | 中規模                                                                             |
| ステータス   | 未実施                                                                             |
| 発見元       | UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001 Phase 12 再レビュー / 2回確認 |
| 発見日       | 2026-03-26                                                                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

今回の failure lifecycle 修正では `verification_review` や failure reason を engine ローカル型に追加したが、task spec は `packages/shared/src/types/skillCreator.ts` を consumer 契約のアンカーとして扱っている。Task04 / Task08 は resume・review の downstream であり、shared 契約が閉じていないと docs と実装の同一 wave 更新が成立しない。

### 1.2 問題点・課題

- `packages/shared/src/types/skillCreator.ts` に failure lifecycle 契約が反映されていない
- implementation guide は internal 型を「主要契約」として記載しているが public/shared 側の保証がない
- contract parity test が failure reason / review contract を監視していない

### 1.3 放置した場合の影響

- downstream consumer が `verification_review` を shared 契約として扱えない
- renderer / preload / resume contract が code review 依存になり、仕様同期が壊れる
- 依存関係整合 PASS を機械的に証明できない

---

## 2. 何を達成するか（What）

### 2.1 目的

failure lifecycle の review 契約を shared/public 側に明示し、engine ローカル実装と downstream consumer の間にある暗黙依存をなくす。

### 2.2 最終ゴール

- shared 型に `verification_review` を含む review/failure 契約が定義されている
- parity test が shared と runtime 実装の一致を監視する
- implementation guide と task spec が shared 契約を参照して説明できる

### 2.3 スコープ

#### 含むもの

- `packages/shared/src/types/skillCreator.ts` の型追加または既存契約の再配置
- contract parity test の更新
- Task04 / Task08 が参照する契約説明の同期

#### 含まないもの

- UI 表示ロジックそのもの
- persistence 保存機構の全面実装
- unrelated IPC channel 追加

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- runtime workflow engine が source of truth であり続ける方針は維持する
- 共有すべきのは engine 内部の全 state ではなく consumer が分岐に必要な contract のみである

### 3.2 必要な知識

- `packages/shared/src/types/skillCreator.ts`
- `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-03-par-task-04-user-interaction-bridge-and-phase-ui/index.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/index.md`

### 3.3 推奨アプローチ

1. consumer が本当に必要な最小契約を shared 側へ切り出す
2. runtime 実装と shared 契約の差分を parity test で固定する
3. docs 側の「主要契約」は internal 型ではなく shared 型を第一参照に切り替える

### 3.4 苦戦箇所

| ID     | 内容                                                                                 | 解決策                                                                     |
| ------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| S-SC-1 | engine ローカル型を追加しただけで downstream consumer まで閉じたように見えてしまった | Phase 12 では「internal 型」と「shared/public 契約」を分離して監査する     |
| S-SC-2 | 実装ガイドが code 断片の説明に寄り、公開契約の所在を曖昧にしやすい                   | implementation guide に shared 型参照を必須化し、internal 型は補足に落とす |

---

## 4. 実行手順

### Step 1: shared 契約の切り出し

1. `skillCreator.ts` の既存型を確認する
2. failure reason / review decision / verify result のうち consumer に必要な契約を shared 化する
3. runtime 側が shared 型を参照するように揃える

### Step 2: parity test 追加

1. shared 契約の列挙値と runtime 実装を比較する
2. `verification_review` を含むことを自動検証する
3. docs に記載した契約が shared 側に存在することを確認する

### Step 3: downstream 同期

1. Task04 / Task08 仕様書の参照箇所を更新する
2. implementation guide の主要契約参照を shared 側へ切り替える

---

## 5. 完了条件

- [ ] shared/public 側に failure review 契約が定義されている
- [ ] parity test が failure lifecycle 契約を検証している
- [ ] Task04 / Task08 参照文書が shared 契約を前提に読める
- [ ] implementation guide が internal 型だけに依存していない

## 6. 関連タスク

| タスクID                                             | 関係       | 説明                      |
| ---------------------------------------------------- | ---------- | ------------------------- |
| UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001 | 親タスク   | failure lifecycle 実装    |
| TASK-SDK-04                                          | downstream | review UI 契約            |
| TASK-SDK-08                                          | downstream | resume / persistence 契約 |
