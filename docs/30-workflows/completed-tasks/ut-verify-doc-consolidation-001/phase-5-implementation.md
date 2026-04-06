# Phase 5: ドキュメント更新実施 - UT-VERIFY-DOC-CONSOLIDATION-001

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 5                               |
| Phase名    | ドキュメント更新実施            |
| 前提Phase  | Phase 4                         |
| 後続Phase  | Phase 6                         |
| ステータス | 未実施                          |
| 作成日     | 2026-04-06                      |
| 機能名     | ut-verify-doc-consolidation-001 |

---

## 目的

Phase 2 の変更計画に従い、対象4ファイルへの役割ラベル付与と責務分離セクションの追記を実施する。

---

## SubAgent分担（並列実行）

Phase 5 は編集対象ファイルが分割できるため、ファイル所有権を固定して並列で進める（同一ファイルの同時編集を避ける）。

| SubAgent                | 所有ファイル                                                                            | 担当タスク |
| ----------------------- | --------------------------------------------------------------------------------------- | ---------- |
| SubAgent-IMPL-Index     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                    | タスク1    |
| SubAgent-IMPL-Completed | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`          | タスク2    |
| SubAgent-IMPL-Active    | `.claude/skills/aiworkflow-requirements/references/task-workflow-active.md`             | タスク3    |
| SubAgent-IMPL-Contract  | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md` | タスク4-5  |

## 実行タスク

### タスク1: task-workflow.md インデックス更新

**目的**: インデックステーブルに「区分」列を追加し、各ファイルの正本/履歴/契約仕様を明記する

**実行手順**:

1. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` を読む
2. インデックステーブル（`| ファイル | 役割 | ...`）を探す
3. テーブルに「区分」列を追加し、各エントリに以下の値を設定する:
   - `task-workflow-active.md` → `正本`
   - `task-workflow-completed.md`（baseline ledger）→ `履歴`
   - `task-workflow-completed-*.md`（semantic shards）→ `履歴`
   - `interfaces-skill-verify-contract.md` 相当のエントリがあれば → `契約仕様`
4. 既存のリンクが破損していないことを確認する

**完了条件**:

- [ ] インデックステーブルに「区分」列が追加されている
- [ ] 全エントリに区分値が設定されている

---

### タスク2: task-workflow-completed.md ラベル追記

**目的**: `> 区分: 履歴記録（history record）` を冒頭に追記する

**実行手順**:

1. `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` を読む
2. 冒頭の `> 役割: completed records` の直後（次の行）に `> 区分: 履歴記録（history record）` を追記する
3. 既存の記述・リンクが破損していないことを確認する

**完了条件**:

- [ ] `> 区分: 履歴記録（history record）` が冒頭5行以内に記載されている

---

### タスク3: task-workflow-active.md ラベル追記

**目的**: `> 区分: 正本（current contract）` を冒頭に追記する

**実行手順**:

1. `.claude/skills/aiworkflow-requirements/references/task-workflow-active.md` を読む
2. 冒頭の `> 役割: active guide` の直後（次の行）に `> 区分: 正本（current contract）` を追記する
3. 既存の記述・リンクが破損していないことを確認する

**完了条件**:

- [ ] `> 区分: 正本（current contract）` が冒頭5行以内に記載されている

---

### タスク4: interfaces-skill-verify-contract.md ラベル追記

**目的**: `> 区分: 契約仕様（current contract / Check ID 体系）` を概要セクション冒頭に追記する

**実行手順**:

1. `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md` を読む
2. H1 タイトルの直後（`## 概要` セクション前または概要冒頭）に `> 区分: 契約仕様（current contract / Check ID 体系）` を追記する
3. Check ID 一覧（L1-001〜L4-003、19件）に影響がないことを確認する

**完了条件**:

- [ ] `> 区分: 契約仕様（current contract / Check ID 体系）` が記載されている
- [ ] Check ID の数が 19 件のまま変化していない

---

### タスク5: 責務分離セクションの追記

**目的**: `verifySkill()` / `verifyAndImproveLoop()` / `verify()` の3関数責務比較表を追記する

**実行手順**:

1. 追記先ファイル（`interfaces-skill-verify-contract.md`）を読む
2. 適切なセクション位置に「## verify エンジン責務分離」セクションを追加する
3. 以下の責務比較表を記載する:

| 関数名                   | 実装ファイル                        | 責務                                                      | 返却値                                      |
| ------------------------ | ----------------------------------- | --------------------------------------------------------- | ------------------------------------------- |
| `verifySkill()`          | `RuntimeSkillCreatorFacade.ts`      | `verificationEngine.verify()` を呼び出し Check 配列を返す | `RuntimeSkillCreatorVerifyCheck[]`          |
| `verifyAndImproveLoop()` | `RuntimeSkillCreatorFacade.ts`      | 検証結果の severity に基づく improve ループ制御           | `RuntimeSkillCreatorVerifyAndImproveResult` |
| `verify()`               | `SkillCreatorVerificationEngine.ts` | 19 件の Check を 4 Layer で実行し結果を収集する           | `RuntimeSkillCreatorVerifyCheck[]`          |

4. 責務分離の原則を自然言語で説明するテキストを追記する:
   - `verifySkill()` は Facade の公開 API として外部から呼び出され、VerificationEngine の結果をガバナンスフック付きで中継する
   - `verifyAndImproveLoop()` は severity 判定と improve ループ制御を担い、`verifySkill()` を内部で繰り返し呼び出す
   - `verify()` は検証ロジックの本体であり、Facade からのみ呼び出される（外部公開しない）

5. `RuntimeSkillCreatorFacade.ts`（294行目・352行目）のコードと照合し、記述が正確であることを確認する

**完了条件**:

- [ ] 責務比較表が記載されている（3関数、4列）
- [ ] 責務分離の原則が自然言語で説明されている
- [ ] コードとの照合が完了している

---

## 参照資料

| 参照資料                  | パス                                                                  | 内容                     |
| ------------------------- | --------------------------------------------------------------------- | ------------------------ |
| 変更計画書                | `outputs/phase-2/change-plan.md`                                      | 変更対象・変更内容の一覧 |
| ラベル形式設計書          | `outputs/phase-2/label-design.md`                                     | 追記形式・挿入位置の設計 |
| 責務分離設計書            | `outputs/phase-2/responsibility-design.md`                            | 3関数比較表の設計        |
| RuntimeSkillCreatorFacade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | verifySkill 294行目      |

---

## 成果物

| 成果物                                       | パス                                                                                    | 内容                                       |
| -------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------ |
| 更新済み task-workflow.md                    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                    | 「区分」列追加済み                         |
| 更新済み task-workflow-completed.md          | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`          | 履歴ラベル追記済み                         |
| 更新済み task-workflow-active.md             | `.claude/skills/aiworkflow-requirements/references/task-workflow-active.md`             | 正本ラベル追記済み                         |
| 更新済み interfaces-skill-verify-contract.md | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md` | 契約仕様ラベル＋責務分離セクション追記済み |

---

## 完了条件

- [ ] タスク1〜5 が全て完了している
- [ ] 4ファイル全てに役割ラベルが付与されている
- [ ] 責務分離セクションが追記されている
- [ ] コードとの照合が完了している
- [ ] 新規ファイルを作成していない

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4（検証計画作成）が完了していること
- **後続**: Phase 6（追加確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-verify-doc-consolidation-001/phase-6-test-expansion.md`
