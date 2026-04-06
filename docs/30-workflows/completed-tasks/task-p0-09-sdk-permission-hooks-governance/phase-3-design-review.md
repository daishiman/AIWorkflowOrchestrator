# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 3                                           |
| 名称       | 設計レビューゲート                          |
| タスクID   | TASK-P0-09                                  |
| ステータス | 未実施                                      |
| 依存       | Phase 2 完了                                |
| 完了条件   | レビュー判定が PASS または MINOR であること |

---

## 目的

Phase 2 で作成した設計書を review し、Phase 4（テスト作成）へ進む可否を判定する。
MAJOR 以上の問題があれば Phase 2 または Phase 1 へ戻る。

---

## レビュー観点

### RV-01: policy テーブルの完備性

| 確認項目                                                           | 判定基準                   |
| ------------------------------------------------------------------ | -------------------------- |
| 全 phase（plan/execute/verify/improve）の policy が定義されている  | MAJOR: 未定義 phase がある |
| `DESTRUCTIVE_TOOLS` が全 phase で `disallowedTools` に含まれている | MAJOR: 含まれていない      |
| `Object.freeze()` による実行時改変防止が設計されている             | MINOR: 未設計              |
| allowedTools と disallowedTools に重複がない                       | MAJOR: 重複がある          |

### RV-02: hooks インターフェースの整合性

| 確認項目                                                                                       | 判定基準                |
| ---------------------------------------------------------------------------------------------- | ----------------------- |
| 全 4 lifecycle hooks（onSessionStart/onPreToolUse/onPostToolUse/onSessionEnd）が設計されている | MAJOR: 欠落がある       |
| `onPreToolUse` が `SkillCreatorToolDecision` を返す設計になっている                            | MAJOR: 戻り値型が不正   |
| audit sink との接続方法が設計されている                                                        | MINOR: 接続方法が未設計 |
| hooks のコード側固定の理由が記録されている                                                     | MINOR: 理由未記録       |

### RV-03: audit sink の設計適切性

| 確認項目                                                                             | 判定基準                |
| ------------------------------------------------------------------------------------ | ----------------------- |
| maxEvents が設定されており、ring buffer 方式が採用されている                         | MAJOR: ring buffer なし |
| `AuditEvent` 型に timestamp / sessionId / phase / toolName / decision が含まれている | MINOR: 一部欠落         |
| `clear()` メソッドが設計されている                                                   | MINOR: 未設計           |
| 永続化（ファイル/DB）が将来スコープとして明記されている                              | MINOR: 未記録           |

### RV-04: Facade 統合の適切性

| 確認項目                                                                                | 判定基準                 |
| --------------------------------------------------------------------------------------- | ------------------------ |
| plan/execute/verify/improve の全 phase で governance hooks が使用される設計になっている | MAJOR: 欠落 phase がある |
| `createGovernanceHooks(phase)` が phase 変更に追随する設計になっている                  | MAJOR: 追随しない        |
| `_input` 未使用問題が U1 carry-forward として明示されている                             | MINOR: 未明示            |
| `auditSink` が Facade に単一インスタンスで保持される設計になっている                    | MINOR: 未記録            |

### RV-05: 型定義の整合性

| 確認項目                                                       | 判定基準          |
| -------------------------------------------------------------- | ----------------- |
| 必要な型が `@repo/shared/types` に存在することが確認されている | MAJOR: 型が未定義 |
| 不足型が特定されている（実装時に追加が必要な場合）             | MINOR: 未特定     |

### RV-06: P0-09 と U1 の責務境界

| 確認項目                                                   | 判定基準          |
| ---------------------------------------------------------- | ----------------- |
| P0-09 本体の実装スコープと U1 carry-forward の境界が明確   | MAJOR: 境界が曖昧 |
| P0-09 では `_input` を未使用のまま残す方針が明記されている | MINOR: 未明記     |

---

## 判定基準

| 判定            | 条件                              | 次のアクション                       |
| --------------- | --------------------------------- | ------------------------------------ |
| PASS            | MAJOR 指摘が 0 件                 | Phase 4 へ進む                       |
| MINOR           | MAJOR 0 件・MINOR 指摘が 3 件以下 | Phase 4 へ進む（MINOR は未タスク化） |
| MAJOR           | MAJOR 指摘が 1 件以上             | Phase 2 へ戻る                       |
| MAJOR: 要件問題 | 根本的な要件の誤り                | Phase 1 へ戻る                       |

---

## 実行タスク

### T-03-1: レビューゲートの実施

上記 RV-01〜RV-06 の全観点でレビューを実施する。

```bash
# 設計書の存在確認
ls outputs/phase-2/
# 期待: policy-table-design.md, hooks-interface-design.md,
#       audit-sink-design.md, facade-integration-design.md, change-file-list.md
```

**完了条件**:

- [ ] RV-01〜RV-06 の全観点でレビューが実施されている
- [ ] 各指摘が PASS / MINOR / MAJOR で分類されている

### T-03-2: レビュー結果の記録と判定

レビュー結果を成果物として記録し、最終判定を下す。

**MINOR 指摘の処理**:

- MINOR 指摘は未タスク化して `docs/30-workflows/unassigned-task/` へ登録する
- Phase 4 の進行は妨げない

**完了条件**:

- [ ] レビュー判定（PASS/MINOR/MAJOR）が記録されている
- [ ] MINOR 指摘が未タスク化されている（ある場合）
- [ ] Phase 4 進行の可否が明記されている

### T-03-3: 30種の思考法によるエレガンス監査

30種の思考法を使って、設計の前提・責務境界・トレードオフ・代替案を再点検する。

**記録観点**:

- 論理分析系: 前提と結論の飛躍がないか
- 構造分解系: policy / hooks / audit / Facade が MECE か
- メタ・抽象系: Phase 3 のレビューが前提の妥当性まで掘れているか
- 発想・拡張系: もっと単純な構成にできないか
- システム系: phase 間依存と副作用が閉じているか
- 戦略・価値系: 要件充足と複雑性のトレードオフが妥当か
- 問題解決系: 根本原因と改善仮説が一致しているか
- 各カテゴリ内の個別思考法を 30 種すべて少なくとも 1 回は使う

**完了条件**:

- [ ] 30種の思考法による観点別メモが記録されている
- [ ] 改善優先順位が設計レビュー結果と矛盾していない

---

## 参照資料

- `phase-2-design.md`
- `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`

---

## 成果物

| 成果物名         | パス                                         | 必須 |
| ---------------- | -------------------------------------------- | ---- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`    | ✅   |
| エレガンス監査   | `outputs/phase-3/elegance-thinking-audit.md` | ✅   |

---

## 完了条件チェックリスト

- [ ] RV-01〜RV-06 の全観点でレビューが実施されている
- [ ] 判定が PASS または MINOR である（MAJOR の場合は Phase 2 に戻る）
- [ ] MINOR 指摘は未タスク化されている
- [ ] `outputs/phase-3/design-review-result.md` が作成されている
- [ ] `outputs/phase-3/elegance-thinking-audit.md` が作成されている

---

## サブタスク管理

| SubAgent   | 責務                             |
| ---------- | -------------------------------- |
| SubAgent-A | skill 準拠レビュー               |
| SubAgent-B | 30種の思考法によるエレガンス監査 |
| SubAgent-C | 判定ログと未タスク化の整合確認   |
