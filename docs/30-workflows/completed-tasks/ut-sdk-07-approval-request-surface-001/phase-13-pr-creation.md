# Phase 13: PR作成（blocked）

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 13                                     |
| 前提Phase  | Phase 12                               |
| 後続Phase  | -（最終フェーズ）                      |
| ステータス | blocked                                |
| 作成日     | 2026-04-06                             |
| 機能名     | ut-sdk-07-approval-request-surface-001 |

## 目的

この Phase は標準フレームワーク上の最終工程として残すが、本タスクでは `commit` / `PR` 作成を実行しない。ユーザーの明示的な承認があるまで blocked のまま維持する。

> **⚠️ BLOCKED**: このフェーズはユーザーの明示的な承認があるまで実行しない。
> コミット・PR作成・ブランチのpushは禁止。

---

## 実行タスク（ユーザー承認後に参照するメモ）

### タスク1: ブランチ・コミット作成

**実行手順**（ユーザー指示後のみ実行）:

1. 作業ブランチが存在することを確認する
2. 変更ファイルをステージングする
3. コミットを作成する

**変更ファイル一覧**:

- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/preload/__tests__/skill-creator-api.approval.test.ts`（新規）
- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.approval.test.tsx`（新規）
- `docs/30-workflows/ut-sdk-07-approval-request-surface-001/` （タスク仕様書一式）

**コミットメッセージ案**:

```
feat(skill-creator): add onApprovalRequest surface to SkillCreatorAPI (#1683)

- Add onApprovalRequest method to SkillCreatorAPI interface and implementation
- Subscribe to APPROVAL_REQUEST channel via safeOn in skill-creator-api.ts
- Add pendingApprovalRequest state and UI to SkillLifecyclePanel.tsx
- Add unit tests for preload and renderer approval request surface

Closes #1683
```

### タスク2: PR 作成

**PR タイトル案**:

```
feat(skill-creator): add approval:request surface to SkillCreatorAPI (#1683)
```

**PR 説明案**:

- 変更の概要（onApprovalRequest の追加）
- 受入基準 AC-1〜AC-5 の充足状況
- テスト結果サマリー

### タスク3: CI/CD 確認

**確認事項**:

- [ ] CI が PASS している
- [ ] 全自動テストが PASS している
- [ ] コードレビューが完了している

---

## 完了条件（ユーザー承認後）

- [ ] PR が作成されている
- [ ] CI が PASS している
- [ ] レビュアーが承認している
- [ ] **本 Phase 内の全タスクを 100% 実行完了**
