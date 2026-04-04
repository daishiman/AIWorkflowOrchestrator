# Phase 11: 手動テスト

| 項目       | 値                                                            |
| ---------- | ------------------------------------------------------------- |
| Phase      | 11                                                            |
| 前 Phase   | 10                                                            |
| 次 Phase   | 12                                                            |
| タスク ID  | task-ut-p0-02-001-repeat-feedback-memory                      |
| タスク名   | verify→improve ループの feedback memory 構造化改善            |
| タスク分類 | 改善（内部ロジック改善、IPC/UI 変更なし） — NON_VISUAL タスク |

---

## 目的

NON_VISUAL タスクのため、自動テスト結果を代替証跡として記録する。

本タスクは Phase 1 で「改善（内部ロジック改善、IPC/UI 変更なし）」と記録されており、NON_VISUAL 判定となる。スクリーンショットによる手動テストは不要であり、自動テスト結果をもって Phase 11 の完了条件を満たす。

検証結果は `manual-test-checklist.md` / `manual-test-result.md` / `manual-test-report.md` / `discovered-issues.md` に分けて残す。

---

## タスク分類確認

Phase 1 にて以下の判定が行われた:

- **分類**: 改善（内部ロジック改善）
- **IPC 変更**: なし
- **UI 変更**: なし
- **判定結果**: NON_VISUAL

---

## 実行タスク

### タスク 1: NON_VISUAL 判定理由の明記

本タスクが NON_VISUAL と判定される理由:

- **UI 変更なし**: Renderer プロセスのコンポーネントに変更がない
- **Renderer 変更なし**: フロントエンド側のコードに一切の変更がない
- **IPC チャンネル変更なし**: 新規 IPC チャンネルの追加や既存チャンネルの変更がない
- **変更スコープ**: Main process 内の internal logic のみ
  - `packages/shared/src/types/skillCreator.ts` — 型定義の追加
  - `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — ループロジック改修

**スクリーンショットを作成しない理由**: Renderer に可視的変更がないため、スクリーンショットによる検証は意味を持たない。

### タスク 2: 自動テスト代替証跡

| 項目           | 値                                                                         |
| -------------- | -------------------------------------------------------------------------- |
| 証跡の主ソース | `RuntimeSkillCreatorFacade.test.ts` の verifyAndImproveLoop テストスイート |
| Phase 4 新規   | TC-01, TC-02, TC-03, TC-04, TC-05, TC-06                                   |
| Phase 6 拡充   | EC-01, EC-02, EC-03, EC-04, RT-03, BF-01, BF-02, BF-03, BF-04              |
| テスト結果     | 全テスト PASS                                                              |

この表を `outputs/phase-11/manual-test-checklist.md` の正本として転記する。

**テスト実行コマンド**:

```bash
pnpm --filter @repo/desktop exec vitest run RuntimeSkillCreatorFacade.test.ts
```

### タスク 3: 既知制限リスト

| #   | 制限事項                                                         | 影響度 | 備考                                |
| --- | ---------------------------------------------------------------- | ------ | ----------------------------------- |
| 1   | LLM の実際の応答品質は自動テストで検証不可（mock による代替）    | 中     | E2E テストで別途検証が望ましい      |
| 2   | maxImproveRetry > 3 の大量ループ時のプロンプトサイズ増大は未検証 | 低     | 現行デフォルト値（3回）では問題なし |

この制限リストは `outputs/phase-11/manual-test-report.md` に要約し、Blocker / Note は `outputs/phase-11/discovered-issues.md` に転記する。

### タスク 4: screenshots ディレクトリ処理

NON_VISUAL タスクのため、`screenshots/.gitkeep` を削除する（validator error 防止）。

- screenshots ディレクトリが存在する場合: `.gitkeep` を削除し、ディレクトリ自体も削除
- screenshots ディレクトリが存在しない場合: 作成しない

---

## 参照資料

- タスク仕様書: `docs/30-workflows/improve-feedback-memory-structuring/phase-1-requirements.md`
- 設計参照: `docs/30-workflows/improve-feedback-memory-structuring/phase-2-design.md`
- レビュー参照: `docs/30-workflows/improve-feedback-memory-structuring/phase-10-final-review.md`
- 実行ガイダンス: `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- テストファイル: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`

---

## 成果物

| 成果物                   | パス                                        |
| ------------------------ | ------------------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    |
| 手動テストレポート       | `outputs/phase-11/manual-test-report.md`    |
| 発見課題レポート         | `outputs/phase-11/discovered-issues.md`     |

---

## 完了条件

- [ ] NON_VISUAL 判定理由が明記されている
- [ ] `manual-test-checklist.md` が作成されている
- [ ] 自動テスト代替証跡が記録されている（テストスイート名、テスト件数、結果）
- [ ] `manual-test-report.md` が作成されている
- [ ] `discovered-issues.md` が作成されている（0件でも可）
- [ ] 既知制限リストが記載されている
- [ ] screenshots ディレクトリが適切に処理されている
- [ ] 手動テスト結果が `outputs/phase-11/manual-test-result.md` に出力されている

---

## タスク 100% 実行確認

> このフェーズの全タスク（タスク 1〜4）を 100% 実行すること。
> 部分実行や省略は許可されない。
