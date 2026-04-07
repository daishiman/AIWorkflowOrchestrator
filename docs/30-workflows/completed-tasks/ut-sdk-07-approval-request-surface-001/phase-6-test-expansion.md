# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 6                                      |
| 前提Phase  | Phase 5                                |
| 後続Phase  | Phase 7                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-06                             |
| 機能名     | ut-sdk-07-approval-request-surface-001 |

## 目的

Phase 5 の実装に対して、エッジケース・異常系・境界値テストを追加し、テストカバレッジを向上させる。

---

## 実行タスク

### タスク1: preload テストのエッジケース追加

**目的**: `onApprovalRequest` の異常系・境界値テストを追加する

**追加テストシナリオ**:

| ID    | テスト名                                                                           | 種別         |
| ----- | ---------------------------------------------------------------------------------- | ------------ |
| T-6-1 | `destination` が undefined の場合もコールバックが呼ばれること                      | 境界値       |
| T-6-2 | 複数回 `onApprovalRequest` を登録した場合、それぞれ独立して動作すること            | 複数登録     |
| T-6-3 | アンサブスクライブ後にイベントが発火してもコールバックが呼ばれないこと             | 解除後       |
| T-6-4 | `ALLOWED_ON_CHANNELS` に含まれないチャンネルで safeOn を呼ぶとエラーログが出ること | セキュリティ |

### タスク2: renderer テストのエッジケース追加

**目的**: `SkillLifecyclePanel` の approval request 表示に関する異常系テストを追加する

**追加テストシナリオ**:

| ID    | テスト名                                                              | 種別       |
| ----- | --------------------------------------------------------------------- | ---------- |
| T-6-5 | 新しい approval request が届いたとき、前の request が上書きされること | 上書き     |
| T-6-6 | `destination` が undefined の場合、宛先表示がレンダリングされないこと | 条件表示   |
| T-6-7 | コンポーネント再マウント時に前の request state がリセットされること   | 再マウント |

### タスク3: テスト実行・確認

**実行コマンド**:

```bash
# 全テスト実行
pnpm --filter @repo/desktop test -- skill-creator-api.approval
pnpm --filter @repo/desktop test -- SkillLifecyclePanel.approval
```

---

## 参照資料

| 参照資料        | パス                                                                                         | 内容                   |
| --------------- | -------------------------------------------------------------------------------------------- | ---------------------- |
| preload テスト  | `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts`                      | Phase 5 実装済みテスト |
| renderer テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx` | Phase 5 実装済みテスト |

---

## 成果物

| 成果物          | パス                                                                                         | 内容                 |
| --------------- | -------------------------------------------------------------------------------------------- | -------------------- |
| preload テスト  | `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts`                      | エッジケース追加済み |
| renderer テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx` | エッジケース追加済み |

---

## 完了条件

- [ ] T-6-1〜T-6-4 の preload エッジケーステストが追加・PASS している
- [ ] T-6-5〜T-6-7 の renderer エッジケーステストが追加・PASS している
- [ ] 全テストが Green 状態である
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 7: カバレッジ確認 → [phase-7-coverage-check.md](phase-7-coverage-check.md)
