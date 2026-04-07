# Phase 13: PR準備・CI確認

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 13                                 |
| 機能名 | ut-health-policy-runtime-injection |
| 作成日 | 2026-04-07                         |
| 状態   | blocked                            |

## 目的

Phase 12 までの成果物を PR 化するための準備を行う。
ただし、現行スコープでは commit / push / PR 作成 / CI 実行は行わない。
user approval が得られたときだけ次段階へ進む。

---

## blocked 状態の理由

- ユーザーの明示指示で commit / PR 作成はスコープ外になっている
- `task-specification-creator` の Phase 13 ルールでも、承認がない限り blocked を維持する
- 今回は spec_created wave のため、PR 実操作ではなく準備だけを残す

---

## 実行タスク

- **タスク1**: blocked 条件と approval 状態の確認
- **タスク2**: ローカル確認結果の下書き作成
- **タスク3**: 変更要約の下書き作成
- **タスク4**: PR 情報の下書き作成
- **タスク5**: approval 後の実行手順を明記

---

## 参照資料

| 資料名                    | パス                                                     | 説明               |
| ------------------------- | -------------------------------------------------------- | ------------------ |
| Phase 12 ドキュメント更新 | `outputs/phase-12/documentation-changelog.md`            | 変更要約の根拠     |
| Phase 12 準拠チェック     | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 完了確認  |
| Phase 10 AC 検証記録      | `outputs/phase-10/ac-verification.md`                    | 受入基準の最終根拠 |
| GitHub Issue #1606        | daishiman/AIWorkflowOrchestrator#1606                    | 関連 Issue         |

---

## 実行手順

### ステップ1: blocked 条件を確認する

- user approval が未取得であれば、Phase 13 は blocked を維持する
- `commit / push / PR` は実行しない
- blocked 理由を `outputs/phase-13/pr-info.md` に記録する

### ステップ2: ローカル確認結果を下書きする

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop exec eslint \
  src/main/services/runtime/RuntimeSkillCreatorFacade.ts \
  src/main/ipc/index.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts
```

- 実行結果は `outputs/phase-13/local-check-result.md` に下書きとして残す

### ステップ3: 変更要約を下書きする

- 変更ファイル一覧を整理する
- AC-1〜AC-7 の充足根拠を整理する
- `outputs/phase-13/change-summary.md` に要約を記録する

### ステップ4: PR 情報を下書きする

- PR タイトル、本文、レビュー依頼の観点を整理する
- `outputs/phase-13/pr-info.md` に下書きとして記録する
- `PR URL` と `CI 結果` は、user approval 後の実操作でのみ作成する

### ステップ5: approval 後の実行条件を明記する

- user approval が得られた場合のみ、commit / push / PR 作成 / CI 確認へ進む
- approval がない限り、この Phase は blocked のまま維持する
- blocked の間は、準備状況の集約先として `outputs/phase-13/pr-ready-report.md` を更新する

---

## 統合テスト連携

- Phase 12 までの結果をもって、PR 化の準備だけを行う
- CI 実行は user approval 後に限定する

---

## サブタスク管理

| ID     | タスク名              | ステータス |
| ------ | --------------------- | ---------- |
| T-13-1 | blocked 条件の確認    | 未実施     |
| T-13-2 | ローカル確認の下書き  | 未実施     |
| T-13-3 | 変更要約の下書き      | 未実施     |
| T-13-4 | PR 情報の下書き       | 未実施     |
| T-13-5 | approval 後条件の明記 | 未実施     |

---

## 成果物

| 成果物           | 配置先                                   | 形式     |
| ---------------- | ---------------------------------------- | -------- |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | Markdown |
| 変更要約         | `outputs/phase-13/change-summary.md`     | Markdown |
| PR 情報          | `outputs/phase-13/pr-info.md`            | Markdown |
| PR 準備レポート  | `outputs/phase-13/pr-ready-report.md`    | Markdown |

---

## 完了条件

- [ ] blocked 理由が明文化されていること
- [ ] user approval がない限り commit / push / PR を実行しないこと
- [ ] Phase 12 の成果物をもとに PR 下書きが作成されていること
- [ ] `outputs/phase-13/local-check-result.md` / `change-summary.md` / `pr-info.md` / `pr-ready-report.md` が作成されていること

---

## タスク100%実行確認【必須】

- [ ] T-13-1: blocked 条件を確認済み
- [ ] T-13-2: ローカル確認の下書きを作成済み
- [ ] T-13-3: 変更要約の下書きを作成済み
- [ ] T-13-4: PR 情報の下書きを作成済み
- [ ] T-13-5: approval 後条件を明記済み

---

## 次のPhase

なし。user approval が得られた場合のみ Phase 13 を解放する。
