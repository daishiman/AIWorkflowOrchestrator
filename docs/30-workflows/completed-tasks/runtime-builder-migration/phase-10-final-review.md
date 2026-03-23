# Phase 10: 最終レビュー

## メタ情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| タスクID | UT-RUNTIME-BUILDER-MIGRATION-001 |
| Phase    | 10（最終レビュー）               |
| 前提     | Phase 9 品質検証 完了            |
| 作成日   | 2026-03-23                       |

---

## 1. 目的

多角的な品質観点と要件との整合性を検証し、Phase 11（手動テスト）への進行可否を判定する。

---

## 参照資料

| 参照資料             | パス                                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| Phase 1 受入基準     | `docs/30-workflows/runtime-builder-migration/phase-1-requirements.md`  |
| Phase 9 品質検証     | `docs/30-workflows/runtime-builder-migration/phase-9-quality.md`       |
| Phase 3 設計レビュー | `docs/30-workflows/runtime-builder-migration/phase-3-design-review.md` |

---

## 2. レビュー観点

### 2.1 要件充足

AC-1〜AC-6 の全受入基準が満たされているかを確認する。

| AC   | 受入基準                                                                                                         | 確認方法                                                                                          | 結果 |
| ---- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---- |
| AC-1 | `buildForSurface()` メソッドが `runtime/TerminalHandoffBuilder.ts` に実装されている                              | `grep -n "buildForSurface" apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`      | [ ]  |
| AC-2 | 旧メソッド（`build`, `buildForAgentExecution`, `buildForSkillExecution`）に `@deprecated` JSDoc が付与されている | Phase 9 チェック 2.6 の結果を参照（runtime: 3件 / chat-edit: 1件）                                | [ ]  |
| AC-3 | `buildForSurface()` の unit test が 12件以上（3 surfaceType × 4 reason パターン）作成されている                  | Phase 9 チェック 2.3 の結果を参照                                                                 | [ ]  |
| AC-4 | 4箇所の呼び出し元が全て `buildForSurface()` に移行されている                                                     | `grep -rn "buildForAgentExecution\|buildForSkillExecution" apps/desktop/src/main/ipc/` で 0件確認 | [ ]  |
| AC-5 | `llm-workspace-chat-edit.md` の `buildForSurface()` 仕様が更新されている                                         | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` を確認             | [ ]  |
| AC-6 | 未知の `surfaceType` でエラーが throw される（P62 準拠）                                                         | TerminalHandoffBuilder.test.ts に該当テストケースが存在し PASS していることを確認                 | [ ]  |

---

### 2.2 型安全性

| #   | 確認項目                                                              | 確認方法                                                                                                  | 期待結果 | 結果 |
| --- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------- | ---- |
| 1   | `any` 型が新規追加されていないか                                      | `grep -n ": any\|as any" apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`                | 0件      | [ ]  |
| 2   | `@ts-ignore` / `@ts-expect-error` が使用されていないか                | `grep -n "@ts-ignore\|@ts-expect-error" apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts` | 0件      | [ ]  |
| 3   | discriminated union の exhaustive check（never 型）が実装されているか | `buildForSurface()` の switch/if 分岐末尾に never 型アサーションが存在するか確認                          | あり     | [ ]  |
| 4   | `BuildForSurfaceRequest` の型定義に unknown / any フィールドがないか  | 型定義を目視確認                                                                                          | なし     | [ ]  |

---

### 2.3 セキュリティ

| #   | 確認項目                                                                          | 確認方法                                               | 期待結果 | 結果 |
| --- | --------------------------------------------------------------------------------- | ------------------------------------------------------ | -------- | ---- |
| 1   | P55 準拠: `terminalCommand` に API key 等の機密情報が含まれていないか             | Phase 9 チェック 2.4（API key 非含有確認）の結果を参照 | 0件      | [ ]  |
| 2   | P62 準拠: 未知 surfaceType 時に DEFAULT_CONFIG への fallback がないか             | Phase 9 チェック 2.5（P62 準拠チェック）の結果を参照   | 0件      | [ ]  |
| 3   | NFR-3 準拠: `TerminalHandoffBundle` が IPC を経由して Renderer に渡されていないか | Phase 9 チェック 2.4（IPC 非通過確認）の結果を参照     | 0件      | [ ]  |
| 4   | `sanitizePrompt()` が全 surfaceType で適用されているか                            | `buildForSurface()` 実装を目視確認                     | 全面適用 | [ ]  |

---

### 2.4 テスト品質

| #   | 確認項目                                                                    | 期待結果       | 結果 |
| --- | --------------------------------------------------------------------------- | -------------- | ---- |
| 1   | テストケース数が 12件以上あるか                                             | 12件以上       | [ ]  |
| 2   | 全テストケースが PASS しているか                                            | 全件 PASS      | [ ]  |
| 3   | Line Coverage が 80% 以上か                                                 | 80% 以上       | [ ]  |
| 4   | Branch Coverage が 60% 以上か                                               | 60% 以上       | [ ]  |
| 5   | Function Coverage が 80% 以上か                                             | 80% 以上       | [ ]  |
| 6   | surfaceType 3値（chat-edit / runtime / skill-docs）が全てテストされているか | 全値テスト済み | [ ]  |
| 7   | 未知の surfaceType によるエラー throw テストが存在するか                    | あり           | [ ]  |

---

### 2.5 コード品質

| #   | 確認項目                            | 確認方法                  | 期待結果 | 結果 |
| --- | ----------------------------------- | ------------------------- | -------- | ---- |
| 1   | ESLint エラーがないか               | Phase 9 チェック 2.1 参照 | 0件      | [ ]  |
| 2   | Prettier フォーマット違反がないか   | Phase 9 チェック 2.1 参照 | 0件      | [ ]  |
| 3   | 未使用 import がないか              | Phase 9 チェック 2.1 参照 | 0件      | [ ]  |
| 4   | TypeScript コンパイルエラーがないか | Phase 9 チェック 2.2 参照 | 0件      | [ ]  |

---

### 2.6 ドキュメント整合性

| #   | 確認項目                                                         | 確認方法                                                                              | 期待結果 | 結果 |
| --- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------- | ---- |
| 1   | `llm-workspace-chat-edit.md` の `buildForSurface()` 仕様が最新か | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` を確認 | 最新     | [ ]  |
| 2   | `buildForSurface()` のシグネチャが仕様書と実装で一致しているか   | 仕様書の型定義と `TerminalHandoffBuilder.ts` のメソッドシグネチャを比較               | 一致     | [ ]  |
| 3   | surfaceType 3値の説明が仕様書に記載されているか                  | `llm-workspace-chat-edit.md` 内の surfaceType 説明を確認                              | 記載あり | [ ]  |

---

### 2.7 Phase 3 MINOR 指摘のフォロー

Phase 3（設計レビュー）で MINOR 判定となった2件が未タスク化されているかを確認する。

| 指摘番号 | 指摘内容                                                                | 期待状態                                            | 結果 |
| -------- | ----------------------------------------------------------------------- | --------------------------------------------------- | ---- |
| MINOR-1  | chat-edit/TerminalHandoffBuilder.ts の削除計画が未タスク化されているか  | Phase 12 の未タスク検出対象として記録済みであること | [ ]  |
| MINOR-2  | RuntimeSkillCreatorPlanResponse の bundle → guidance 変更の波及範囲確認 | Phase 5 実装時の影響調査が完了していること          | [ ]  |

---

## 3. 判定基準

| 判定     | 条件                                                               | 対応                                           |
| -------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| PASS     | 全確認項目が期待結果を満たしている                                 | Phase 11 へ進む                                |
| MINOR    | 軽微な改善点があるが機能要件・セキュリティ要件は全て満たされている | 未タスク仕様書に変換後 Phase 11 へ（省略不可） |
| MAJOR    | 要件充足・型安全性・セキュリティのいずれかに問題がある             | 影響範囲に応じて Phase 1-5 へ戻る              |
| CRITICAL | セキュリティ上の重大な問題または受入基準の根本的な未充足がある     | Phase 1 へ戻り要件再確認                       |

---

## 4. MINOR 指摘の未タスク変換手順

MINOR 判定となった場合は、以下の3ステップを全て実施してから Phase 11 へ進む（省略不可）。

1. `docs/30-workflows/unassigned-task/` に指示書ファイルを作成する
2. `docs/30-workflows/task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

---

## 5. 完了条件

- [ ] 上記レビュー観点 2.1〜2.7 の全確認項目が確認済みである
- [ ] 判定が PASS または MINOR（未タスク変換済み）である
- [ ] MINOR 指摘が発生した場合、未タスク変換の3ステップが全て完了している
- [ ] Phase 3 の MINOR-1, MINOR-2 のフォロー状況が確認されている

---

## 次 Phase

Phase 11（手動テスト）へ進む。

---

## 統合テスト連携

Phase 9 の品質検証結果を参照し、全テスト（単体+統合）が PASS していることをレビューで確認する。

---

## 多角的チェック観点

| 観点         | 確認内容                                               | 対応セクション |
| ------------ | ------------------------------------------------------ | -------------- |
| セキュリティ | P55/P62/NFR-3 準拠が確認されているか                   | Section 2.3    |
| 型安全性     | any型/ts-ignore の新規追加がないか                     | Section 2.2    |
| API設計      | buildForSurface() のシグネチャが仕様書と一致しているか | Section 2.6    |

---

## サブタスク管理

- [ ] 要件充足（AC-1〜AC-6）を確認する
- [ ] 型安全性を確認する
- [ ] セキュリティを確認する
- [ ] テスト品質を確認する
- [ ] コード品質を確認する
- [ ] ドキュメント整合性を確認する
- [ ] Phase 3 MINOR 指摘のフォロー状況を確認する
- [ ] PASS/MINOR/MAJOR/CRITICAL 判定を行う
