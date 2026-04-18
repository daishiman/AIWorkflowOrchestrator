# UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001 - 未タスク検出レポート

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001 |
| Phase      | 12                                        |
| 作成日     | 2026-04-16                                |
| ステータス | completed                                 |

---

## 検出サマリー

**本タスクスコープ内での未タスク: 0 件**

**関連スコープで発見された参考情報: 2 件（スコープ外・後続タスク候補）**

---

## 検出ソース別確認

### Phase 3 review（MINOR/MAJOR の残課題）

なし

### Phase 10 review（最終レビューで残った blocker）

なし

### Phase 11 manual test（N/A 記録で見つかった問題）

なし（N/A: CLEANUP タスク）

### codebase スキャン（TODO / FIXME / HACK / XXX）

```bash
grep -rn "TODO\|FIXME\|HACK\|XXX" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard*.test.tsx
```

**結果**: 0 件（SkillCreateWizard スコープ）

### 関連テストファイルの describe.skip 残存確認

```bash
grep -rn "describe\.skip\|it\.skip\|test\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/
```

**検出結果**:

| ファイル                                     | skip 件数 | スコープ |
| -------------------------------------------- | --------- | -------- |
| SkillLifecyclePanel.llm-generation.test.tsx  | 12 件     | 対象外   |
| SkillLifecyclePanel.auth-regression.test.tsx | 6 件      | 対象外   |
| SkillCreateWizard.llm-generation.test.tsx    | 削除済み  | N/A      |
| その他                                       | 0 件      | -        |

---

## スコープ外 describe.skip（後続タスク候補）

### 候補 1: SkillLifecyclePanel.llm-generation.test.tsx

| 項目     | 内容                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` |
| 件数     | 12 件（U-1, U-2, U-4, U-6, U-10, U-11, U-12, U-8b, U-18b, U-19b, U-20b, U-21）                     |
| 理由     | planSkill / executePlan 依存の旧フロー describe.skip が残存                                        |
| 対応方針 | 別タスクとして formalize（本タスクスコープ外）                                                     |

### 候補 2: SkillLifecyclePanel.auth-regression.test.tsx

| 項目     | 内容                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` |
| 件数     | 5 件（TC-03, TC-05, TC-06, TC-07, TC-08）                                                           |
| 理由     | auth 回帰テストが describe.skip で保留中                                                            |
| 対応方針 | 別タスクとして formalize（本タスクスコープ外）                                                      |

---

## formalize 方針

スコープ外の describe.skip は本タスクでは対処せず、後続タスクとして以下の 3 ステップで管理する。

1. 指示書作成: `UT-LIFECYCLE-PANEL-DESCRIBE-SKIP-CLEANUP-001` として仕様書を作成
2. `task-workflow.md` 登録: 未着手タスクとして追記
3. 関連仕様書リンク: 本ドキュメントをリンク先として記録
