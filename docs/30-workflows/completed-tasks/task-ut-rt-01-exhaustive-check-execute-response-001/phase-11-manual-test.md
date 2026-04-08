# Phase 11: 手動テスト（NON_VISUAL）- タスク仕様書

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 11                                                  |
| Phase 名   | 手動テスト（NON_VISUAL）                            |
| 前提 Phase | Phase 10（最終レビューゲート）                      |
| 後続 Phase | Phase 12（ドキュメント更新）                        |
| ステータス | 未実施                                              |
| 作成日     | 2026-04-08                                          |
| 機能名     | task-ut-rt-01-exhaustive-check-execute-response-001 |

---

## 目的

本タスクは UI 変更を含まない内部ロジックのリファクタリングのため、`NON_VISUAL` として扱い、自動テスト結果を手動テスト代替証跡として記録する。

## 背景

> **[Feedback BEFORE-QUIT-001]** Phase 11 が非 visual task なのに実地操作を要求してしまう誤りを防ぐため、Phase 11 では「実地操作不可」を明記し、自動テスト結果と既知制限リストを代替記録として残す。

> **[Feedback 4]** Phase 11 NON_VISUAL のとき `manual-test-result.md` の証跡メタが薄い場合、「証跡の主ソース（自動テスト名/件数）」と「スクリーンショットを作らない理由」を明記する。

本タスクは `RuntimeSkillCreatorFacade.ts` の内部ロジック変更のみであり、UI コンポーネントの変更はない。よって手動操作によるスクリーンショットは不要（NON_VISUAL）。

---

## Phase 11 手動テスト方針

- `manual-test-checklist.md` を必ず作成する
- `discovered-issues.md` を必ず作成する
- `screenshot-plan.json` は生成しない（NON_VISUAL のため）
- primary evidence は `vitest` 自動テスト結果（TC-01〜TC-09 の PASS 証跡）
- `manual-test-result.md` には `TC-ID ↔ evidence`、NON_VISUAL である理由、代替 evidence を明記する
- placeholder-only の証跡は PASS 扱いにしない

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `outputs/phase-11/` へ記録する。

### タスク 1: manual-test-checklist.md 作成

**目的**: NON_VISUAL タスクとしての手動テストチェックリストを作成する。

**実行手順**:

1. `outputs/phase-11/manual-test-checklist.md` を作成する
2. 以下の内容を記載する：
   - 本タスクが NON_VISUAL である理由（UI 変更なし・内部ロジックのみ）
   - 代替証跡として使用する自動テスト一覧（TC-01〜TC-09）
   - 自動テストの実行コマンドと対応するチェック項目

**期待される成果物**:

- `outputs/phase-11/manual-test-checklist.md`

---

### タスク 2: 自動テストの最終実行と結果記録

**目的**: 自動テスト結果を Phase 11 の primary evidence として記録する。

**実行手順**:

1. 最終的な自動テストを実行し、出力を記録する：

   ```bash
   pnpm --filter @repo/desktop test -- --reporter=verbose \
     src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.exhaustive.test.ts \
     src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts
   ```

2. 出力結果（テスト件数・PASS/FAIL・実行時間）を記録する
3. typecheck・lint の最終確認結果も記録する

**期待される成果物**:

- 自動テスト実行結果の記録（件数・PASS 確認）

---

### タスク 3: manual-test-result.md 作成

**目的**: NON_VISUAL タスクの手動テスト結果ドキュメントを作成する。

**実行手順**:

1. `outputs/phase-11/manual-test-result.md` を作成する
2. 以下のメタ情報を必ず明記する：
   - **証跡の主ソース**: 自動テスト名と件数（例: TC-01〜TC-09、合計 N 件 PASS）
   - **スクリーンショットを作らない理由**: 本タスクは RuntimeSkillCreatorFacade.ts の内部ロジック変更のみであり、UI コンポーネントの変更がないため
   - **NON_VISUAL 判定根拠**: Phase 1 のタスク分類で NON_VISUAL と記録済み

3. TC-ID ↔ evidence の対応表を作成する：

   | TC    | テスト内容                               | 証跡                           | 結果 |
   | ----- | ---------------------------------------- | ------------------------------ | ---- |
   | TC-01 | success:true → phase "complete"          | 自動テスト PASS（テスト名）    | PASS |
   | TC-02 | success:false → phase "error"            | 自動テスト PASS（テスト名）    | PASS |
   | TC-03 | ErrorResponse → errorMessage 伝搬        | 自動テスト PASS（テスト名）    | PASS |
   | TC-04 | terminal_handoff → 等価遷移              | 自動テスト PASS（テスト名）    | PASS |
   | TC-05 | 型テスト（exhaustive check）             | コンパイル確認（ローカル検証） | PASS |
   | TC-06 | ErrorResponse errorMessage 伝搬          | 自動テスト PASS（テスト名）    | PASS |
   | TC-07 | success:false の fallback errorMessage   | 自動テスト PASS（テスト名）    | PASS |
   | TC-08 | terminal_handoff と success の誤判定なし | 自動テスト PASS（テスト名）    | PASS |
   | TC-09 | 詳細 error なし → Unknown execute error  | 自動テスト PASS（テスト名）    | PASS |

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`

---

### タスク 4: discovered-issues.md 作成

**目的**: Phase 11 で発見した問題・改善提案を記録する（0 件でも作成必須）。

**実行手順**:

1. `outputs/phase-11/discovered-issues.md` を作成する
2. 発見した問題があれば記録する
3. 問題がない場合は「発見なし」と明記し、Phase 10 で記録した未タスク候補（`verifyAndImproveLoop()` exhaustive check 化等）へのリンクを記載する

**期待される成果物**:

- `outputs/phase-11/discovered-issues.md`

---

## 参照資料

| 参照資料           | パス                                                                        | 内容                       |
| ------------------ | --------------------------------------------------------------------------- | -------------------------- |
| Phase 1 タスク分類 | 本ワークフロー Phase 1 完了記録                                             | NON_VISUAL 分類の根拠      |
| Phase 6 テスト一覧 | 本ワークフロー Phase 6 完了記録                                             | TC-01〜TC-09 一覧          |
| phase-11-12-guide  | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` | Phase 11 NON_VISUAL ガイド |

---

## 成果物

| 成果物                   | パス                                        | 内容                                     |
| ------------------------ | ------------------------------------------- | ---------------------------------------- |
| manual-test-checklist.md | `outputs/phase-11/manual-test-checklist.md` | NON_VISUAL チェックリスト                |
| manual-test-result.md    | `outputs/phase-11/manual-test-result.md`    | TC-ID ↔ evidence 対応表・NON_VISUAL 理由 |
| discovered-issues.md     | `outputs/phase-11/discovered-issues.md`     | 発見問題（0 件でも作成）                 |

---

## 統合テスト連携

- 自動テスト結果（TC-01〜TC-09 全件 PASS）を手動テスト代替証跡として記録する。

---

## 完了条件

- [ ] `outputs/phase-11/manual-test-checklist.md` が作成されている
- [ ] `outputs/phase-11/manual-test-result.md` が作成されている（NON_VISUAL 理由・証跡の主ソース明記）
- [ ] `outputs/phase-11/discovered-issues.md` が作成されている（0 件でも作成）
- [ ] TC-01〜TC-09 の全テストが PASS していることが記録されている
- [ ] `screenshot-plan.json` が作成されていない（NON_VISUAL のため不要）

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 10（最終レビューゲート）が PASS/MINOR で完了していること
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## Phase 実行記録

Phase 完了後、以下を記録してください：

```markdown
## Phase 11 実行記録

### NON_VISUAL 判定根拠

- 理由: RuntimeSkillCreatorFacade.ts の内部ロジック変更のみ。UI コンポーネントの変更なし。
- Phase 1 分類: NON_VISUAL として記録済み。

### 自動テスト証跡

- 自動テスト件数: N 件
- 全件 PASS: Yes
- 実行コマンド: pnpm --filter @repo/desktop test

### 成果物作成確認

- manual-test-checklist.md: 作成済み
- manual-test-result.md: 作成済み
- discovered-issues.md: 作成済み（発見件数: 0 件）

### 次 Phase への引き継ぎ事項

-
```

---

## 次の Phase

完了後、以下のファイルを実行してください：

`docs/30-workflows/task-ut-rt-01-exhaustive-check-execute-response-001/phase-12-documentation.md`
