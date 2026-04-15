# Phase 13: PR作成 - UT-W3-ANALYTICS-HTTP-PROVIDER-001

## メタ情報

| 項目         | 値                                                      |
| ------------ | ------------------------------------------------------- |
| Phase        | 13                                                      |
| タスクID     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                       |
| タイトル     | Analytics HTTP プロバイダー実装（外部分析基盤への接続） |
| GitHub Issue | #2125 (CLOSED)                                          |
| 作成日       | 2026-04-14                                              |
| 状態         | blocked（ユーザーの明示承認待ち）                       |

---

## 目的

Phase 12 までの成果物を PR 化するための準備を行う。
ユーザーの明示的な承認が得られたときのみ、commit / push / PR 作成を実行する。
承認がない限り、この Phase は blocked のまま維持する。

---

## PR作成前チェックリスト

以下が全て完了していることを確認してから PR 作成を実行すること。

- [ ] `pnpm build` が成功している
- [ ] `pnpm test` が全通過している（`AnalyticsHttpProvider.test.ts` を含む）
- [ ] `pnpm typecheck` が通過している（エラー 0 件）
- [ ] `pnpm lint` が通過している（エラー 0 件）
- [ ] 手動テスト（Phase 11）が全シナリオ完了している
- [ ] Phase 10 の最終レビューが PASS になっている
- [ ] Phase 12 のドキュメント更新が全て完了している
- [ ] ユーザーの明示的な PR 作成承認を得ている

---

## PRタイトル

```
feat(analytics): UT-W3-ANALYTICS-HTTP-PROVIDER-001 Analytics HTTPプロバイダー実装
```

---

## PRブランチ

```
feat/ut-w3-analytics-http-provider-001
```

**ブランチ作成コマンド**（ユーザー承認後のみ実行）:

```bash
git checkout -b feat/ut-w3-analytics-http-provider-001
```

---

## PR本文テンプレート

````markdown
## Summary

- `analyticsHandler.ts` Line 106 の TODO を解消し、`AnalyticsHttpProvider` を新規実装した
- `ANALYTICS_ENDPOINT_URL` 環境変数が設定されている場合に analytics イベントを HTTP 送信する
- 送信失敗時は最大 3 回リトライし、成功・失敗カウントを `analyticsStore` に記録する
- `ANALYTICS_ENDPOINT_URL` 未設定時は no-op として動作し、既存機能に影響を与えない
- `AnalyticsHttpProvider.test.ts` を新規作成し、全受入基準をテストで検証済み

## 関連Issue

Closes #2125

## 影響ファイル一覧

| ファイル                                                                           | 変更種別 | 説明                                               |
| ---------------------------------------------------------------------------------- | -------- | -------------------------------------------------- |
| `apps/desktop/src/main/services/analytics/AnalyticsHttpProvider.ts`                | 新規追加 | HTTP送信プロバイダー実装                           |
| `apps/desktop/src/main/services/analytics/analyticsStore.ts`                       | 変更     | sentCount / failedCount フィールド追加             |
| `apps/desktop/src/main/ipc/analyticsHandler.ts`                                    | 変更     | Line 106 TODO 解消・AnalyticsHttpProvider 組み込み |
| `apps/desktop/src/main/services/analytics/__tests__/AnalyticsHttpProvider.test.ts` | 新規追加 | 受入基準 AC-1〜AC-6 のテスト                       |

## テスト結果

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/analytics/__tests__/AnalyticsHttpProvider.test.ts
```
````

| テスト                                                | 結果 |
| ----------------------------------------------------- | ---- |
| AC-1: ANALYTICS_ENDPOINT_URL設定時にHTTP送信される    | PASS |
| AC-2: 送信失敗時にsuccess:falseが返る                 | PASS |
| AC-3: リトライが最大3回実行される                     | PASS |
| AC-4: sentCount / failedCountが正確に記録される       | PASS |
| AC-5: ANALYTICS_ENDPOINT_URL未設定時はno-opで動作する | PASS |
| AC-6: AnalyticsHttpProvider.test.ts が全テストgreen   | PASS |

## 手動テスト確認事項

| シナリオ                            | 確認内容                                     | 結果 |
| ----------------------------------- | -------------------------------------------- | ---- |
| MT-01: ANALYTICS_ENDPOINT_URL未設定 | ログエラーなし・既存機能に影響なし           | PASS |
| MT-02: ANALYTICS_ENDPOINT_URL設定   | DevTools NetworkにPOSTリクエストが表示される | PASS |
| MT-03: 無効エンドポイントへの送信   | アプリがクラッシュしない・success:false      | PASS |
| MT-04: analytics:get-stats          | sentCount/failedCountの値が正確              | PASS |

## 型チェック・Lint

```bash
pnpm --filter @repo/desktop typecheck  # エラー 0 件
pnpm lint                              # エラー 0 件
```

```

---

## 実行コマンド

ユーザーの明示的な承認を得た後に、以下のスキルを実行する:

```

/ai:diff-to-pr

````

このスキルにより以下が自動実行される:

1. リモート main との同期・コンフリクト解消
2. 品質検証（typecheck, lint, test）
3. 差分分析・ブランチ作成・コミット
4. タスク仕様書 → Issue 同期（未同期チェック）
5. PR 本文生成・PR 作成
6. 補足コメント投稿
7. CI/CD 完了確認
8. マージ可能報告

---

## 重要な注意事項

- **PR作成は必ずユーザーの明示的な許可を得てから実行すること**
- **自動実行禁止**: ユーザーが「PR を作成してください」と明示的に指示するまで、commit / push / PR 作成は行わない
- `--no-verify` オプションは絶対に使用禁止（CLAUDE.md の Git操作の禁止事項を参照）
- PR 作成前に必ず全チェックリストが ✅ になっていることを確認すること

---

## blocked状態の理由

- ユーザーの明示指示で commit / PR 作成はスコープ外になっている
- `task-specification-creator` の Phase 13 ルールでも、承認がない限り blocked を維持する
- Phase 12 までの成果物を準備した状態で待機する

---

## 参照資料

| 資料名 | パス | 説明 |
| ------ | ---- | ---- |
| Phase 12 documentation changelog | `outputs/phase-12/documentation-changelog.md` | 変更要約の根拠 |
| Phase 12 準拠チェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 完了確認 |
| Phase 10 AC 検証記録 | `outputs/phase-10/ac-verification.md` | 受入基準の最終根拠 |
| Phase 11 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 手動テスト証拠 |
| GitHub Issue #2125 | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2125 | 関連 Issue |
| ai:diff-to-pr スキル | `.claude/skills/` 参照 | PR作成自動化スキル |
| 最終レビュー書（AC-1〜AC-8突合・MAJOR指摘0件） | `outputs/phase-10/final-review.md` | Phase 10 成果物 |
| 手動テスト記録（UI変更なし・自動テスト検証済み） | `outputs/phase-11/manual-test-record.md` | Phase 11 成果物 |
| 実装ガイド（PR本文素材・全AC充足確認） | `outputs/phase-12/implementation-guide.md` | Phase 12 成果物 |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md` | Phase 12 成果物 |
| unassigned task detection | `outputs/phase-12/unassigned-task-detection.md` | Phase 12 成果物 |
| skill feedback report | `outputs/phase-12/skill-feedback-report.md` | Phase 12 成果物 |

---

## 実行手順

### ステップ1: blocked 条件を確認する

- ユーザーの明示承認が未取得であれば、Phase 13 は blocked を維持する
- `commit / push / PR` は実行しない
- blocked 理由を `outputs/phase-13/pr-info.md` に記録する

### ステップ2: ローカル確認結果を下書きする（承認前の準備）

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop exec eslint \
  src/main/services/analytics/AnalyticsHttpProvider.ts \
  src/main/handlers/analyticsHandler.ts \
  src/main/services/analytics/__tests__/AnalyticsHttpProvider.test.ts
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/analytics/__tests__/AnalyticsHttpProvider.test.ts
````

実行結果は `outputs/phase-13/local-check-result.md` に下書きとして残す。

### ステップ3: 変更要約を下書きする

- 変更ファイル一覧を整理する
- AC-1〜AC-6 の充足根拠を整理する
- `outputs/phase-13/change-summary.md` に要約を記録する

### ステップ4: PR 情報を下書きする

- 上記「PR本文テンプレート」を `outputs/phase-13/pr-info.md` に記録する
- `PR URL` と `CI 結果` は、ユーザー承認後の実操作でのみ作成する

### ステップ5: ユーザー承認後に実行する

ユーザーの明示承認を得た後に `/ai:diff-to-pr` を実行する。

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
- [ ] ユーザーの明示承認がない限り commit / push / PR を実行しないこと
- [ ] Phase 12 の成果物をもとに PR 下書きが作成されていること
- [ ] `outputs/phase-13/local-check-result.md` が作成されていること
- [ ] `outputs/phase-13/change-summary.md` が作成されていること
- [ ] `outputs/phase-13/pr-info.md` が作成されていること
- [ ] `outputs/phase-13/pr-ready-report.md` が作成されていること
- [ ] ユーザー承認後に `/ai:diff-to-pr` を実行し PR が作成されていること

---

## タスク100%実行確認【必須】

- [ ] T-13-1: blocked 条件を確認し `outputs/phase-13/pr-info.md` に記録済み
- [ ] T-13-2: ローカル確認（typecheck / lint / test）の下書きを `outputs/phase-13/local-check-result.md` に作成済み
- [ ] T-13-3: 変更要約を `outputs/phase-13/change-summary.md` に作成済み
- [ ] T-13-4: PR 情報の下書きを `outputs/phase-13/pr-info.md` に作成済み
- [ ] T-13-5: ユーザー承認後条件（`/ai:diff-to-pr` 実行）を明記済み
