# Phase 11: 手動テスト

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 11                                     |
| 前提Phase  | Phase 10                               |
| 後続Phase  | Phase 12                               |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-06                             |
| 機能名     | ut-sdk-07-approval-request-surface-001 |

## 目的

Electron アプリを実際に起動して、approval request の受信と UI 表示を手動で確認する。

## Phase 11 手動テスト方針

- `manual-test-checklist.md` を必ず作成する
- `discovered-issues.md` を必ず作成する
- `manual-test-result.md` には `TC-ID ↔ evidence`、NON_VISUAL である理由、代替 evidence を明記する
- placeholder-only の証跡は PASS 扱いにしない

---

## 実行タスク

### タスク1: 手動テスト環境準備

**実行手順**:

1. `outputs/phase-11/` ディレクトリを作成する
2. `manual-test-checklist.md` を作成する
3. Electron アプリをビルド・起動する

**起動コマンド**:

```bash
pnpm --filter @repo/desktop dev
```

### タスク2: テストケース実行

**テストケース一覧**:

| TC-ID | テスト内容                                            | 期待結果                                                      | 証跡形式 |
| ----- | ----------------------------------------------------- | ------------------------------------------------------------- | -------- |
| TC-01 | Skill Creator を開く                                  | SkillLifecyclePanel が正常に表示される                        | ログ確認 |
| TC-02 | approval request チャンネルに手動でイベントを送信する | `data-testid="skill-lifecycle-approval-request"` が表示される | ログ確認 |
| TC-03 | destination ありのペイロードを送信する                | 宛先情報が UI に表示される                                    | ログ確認 |
| TC-04 | destination なしのペイロードを送信する                | 宛先情報が表示されない                                        | ログ確認 |
| TC-05 | disclosure summary との併存確認                       | disclosure と approval が両方表示される                       | ログ確認 |
| TC-06 | コンポーネントの unmount / remount を実施する         | リスナーが正常に解除・再登録される                            | ログ確認 |

### タスク3: 発見事項の記録

**実行手順**:

1. テスト中に発見した問題を `outputs/phase-11/discovered-issues.md` に記録する
2. 全テストケースの結果を `outputs/phase-11/manual-test-result.md` に記録する

---

## 統合テスト連携

| 判定項目                     | 基準 | 結果            |
| ---------------------------- | ---- | --------------- |
| Electron 起動確認            | PASS | 本 Phase で確認 |
| approval request UI 表示確認 | PASS | 本 Phase で確認 |
| disclosure との併存確認      | PASS | 本 Phase で確認 |
| リスナー解除確認             | PASS | 本 Phase で確認 |

---

## 成果物

| 成果物                   | パス                                        | 内容                     |
| ------------------------ | ------------------------------------------- | ------------------------ |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | テストケース一覧         |
| テスト結果               | `outputs/phase-11/manual-test-result.md`    | TC-ID ↔ 証跡の対応       |
| 発見事項                 | `outputs/phase-11/discovered-issues.md`     | 発見したバグ・問題の記録 |

---

## 完了条件

- [ ] TC-01〜TC-06 の全テストケースが PASS している
- [ ] `manual-test-result.md` に TC-ID ↔ 証跡の対応が記録されている
- [ ] `discovered-issues.md` が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 12: ドキュメント更新 → [phase-12-documentation.md](phase-12-documentation.md)
