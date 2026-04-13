# Phase 5 実装計画書

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001 |
| 作成日   | 2026-04-11                                     |

---

## 修正ファイル一覧【FB-RT-03 対策・必須記載】

| No  | 修正ファイル                                                                                | 変更種別 | 変更内容要約                              |
| --- | ------------------------------------------------------------------------------------------- | -------- | ----------------------------------------- |
| 1   | `.claude/skills/task-specification-creator/SKILL.md`                                        | 追記     | よくある漏れテーブル末尾に [FB-04] 行追加 |
| 2   | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | 追記     | 三者同期チェックリストセクション追加      |
| 3   | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | 追記     | Task 12-2 に三者同期ステップ追記          |
| 4   | `.agents/skills/task-specification-creator/`（mirror）                                      | 同期確認 | diff で `.claude/` と一致確認             |

---

## 実装内容詳細

### ファイル1: SKILL.md

**挿入位置**: よくある漏れテーブルの既存エントリ末尾付近（artifacts同期関連エントリの後）

**追記内容**:

```
| [FB-04] | Phase 12 close-out で backlog ledger / completed ledger / lane index / workflow artifacts / skill artifacts の5点を同一waveで同期せず、タスク状態が二重化する | Step 1-A の開始時に三者同期チェックリストで5ファイルを1件ずつ突合し、同一ターンで一括更新する。更新後は validate-phase-output.js --phase 12 と diff -qr で整合を確認する |
```

### ファイル2: phase12-task-spec-compliance-template.md

**挿入位置**: `### 4. system spec / outputs 同期` セクション内

**追記内容**:

```
- [ ] **FB-04** `ledger / lane / artifacts` 三者同期チェックを実施し、以下 5 対象を同一 wave で更新した
- [ ] `task-workflow.md`（backlog ledger）: 完了タスクが open 側に残っていない
- [ ] `task-workflow-completed.md`（completed ledger）: 完了タスク記録が current facts に一致する
- [ ] `lane/index.md`（lane index）: lane 状態とタスク参照が更新済み（lane 非採用 workflow は N/A 理由を記録）
- [ ] `outputs/artifacts.json`（workflow artifacts）: status / phase artifacts が current facts に一致する
- [ ] `.claude/skills/task-specification-creator/outputs/artifacts.json`（skill artifacts）: status / artifact metadata が current facts に一致する
```

### ファイル3: phase-12-documentation-guide.md

**挿入位置**: Task 12-2 セクション内

**追記内容**: FB-04 セクション（5ファイルの同期手順）

---

## 実装状況

全3ファイルへの追記は SKILL.md changelog（v10.09.41, 2026-04-11）時点で完了済み。
mirror（.agents/skills/）との同期も diff 0件で確認済み。

## Phase 5 実行記録

- 実装計画書作成: 完了
- SKILL.md [FB-04] 追記: 完了（行307）
- phase12-task-spec-compliance-template.md 三者同期チェックリスト追記: 完了（行74）
- phase-12-documentation-guide.md Task 12-2 三者同期ステップ追記: 完了（行63）
- .agents/skills/ mirror 同期確認: 完了（diff 0件）
