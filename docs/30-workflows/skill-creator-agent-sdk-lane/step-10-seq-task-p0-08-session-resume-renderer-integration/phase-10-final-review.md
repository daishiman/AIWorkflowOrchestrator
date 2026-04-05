# Phase 10: 最終レビュー

## メタ情報

| 項目      | 値           |
| --------- | ------------ |
| Phase     | 10           |
| Phase名   | 最終レビュー |
| カテゴリ  | レビュー     |
| 前提Phase | Phase 9      |
| 後続Phase | Phase 11     |
| 作成日    | 2026-04-06   |

## 目的

AC-1〜AC-9 の全充足確認・コード差分の最終レビュー・blockerチェックを実施し、Phase 11 手動テストへの進入可否を判定する。

---

## 実行タスク

### タスク1: 受入条件（AC-1〜AC-9）の充足確認

| ID   | 受入条件                                                                     | 実装確認（テストID）      | 充足 |
| ---- | ---------------------------------------------------------------------------- | ------------------------- | ---- |
| AC-1 | アプリ起動時に未完了セッションが自動検出される                               | TC-I-09                   | TBD  |
| AC-2 | 未完了セッションが存在する場合、SessionResumePrompt が表示される             | TC-U-01, TC-I-10          | TBD  |
| AC-3 | 「続きから再開」選択でセッションが継続される                                 | TC-U-03, TC-I-02          | TBD  |
| AC-4 | 「削除して新規開始」選択でセッションが削除・新規開始される                   | TC-U-04, TC-I-03          | TBD  |
| AC-5 | アクティブセッションの session_id と経過時間が SessionIndicator に表示される | TC-U-10, TC-U-11          | TBD  |
| AC-6 | 期限切れセッションが cleanupExpiredSessions() で削除される                   | TC-I-04, TC-E-06          | TBD  |
| AC-7 | session_id が SDK resume / continue 入力へ正しく再利用される                 | TC-I-02                   | TBD  |
| AC-8 | 互換性なし時に警告表示・新規フォールバック                                   | TC-U-02, TC-U-07, TC-I-05 | TBD  |
| AC-9 | IPC 経由でセッション一覧・詳細・削除・クリーンアップが取得・実行できる       | TC-I-01〜TC-I-08          | TBD  |

### タスク2: コード差分の最終レビュー

```bash
# 変更ファイルの差分確認
git diff main -- \
  packages/shared/src/ipc/channels.ts \
  packages/shared/src/types/skillCreator.ts \
  apps/desktop/src/main/ipc/index.ts \
  apps/desktop/src/preload/skill-creator-api.ts \
  apps/desktop/src/renderer/components/skill/SessionResumePrompt.tsx \
  apps/desktop/src/renderer/components/skill/SessionIndicator.tsx \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

**レビュー観点**:

- [ ] IPC ハンドラーが薄いラッパー（Facade 呼び出しのみ）になっている
- [ ] P0-06 の既存実装（ConversationalInterview・useInterviewState）を変更していない
- [ ] `any` 型が使用されていない
- [ ] `data-testid` 属性が全必須要素に付与されている

### タスク3: MINOR 指摘の未解決確認

Phase 3 / Phase 6 / Phase 9 で記録した MINOR 指摘が全て解決されているか確認する。
未解決の MINOR がある場合は未タスクとして `docs/30-workflows/unassigned-task/` に記録する。

### タスク4: Phase 13 blocked 条件の確認

**Phase 13 blocked 条件**: MAJOR 指摘が残っている場合は Phase 13 に進めない。
→ MAJOR がある場合は Phase 2/5 へ差し戻す。

---

## 参照資料

| 資料名           | パス                                    | 説明               |
| ---------------- | --------------------------------------- | ------------------ |
| Phase 1 要件     | `phase-1-requirements.md`               | AC-1〜AC-9         |
| Phase 3 レビュー | `outputs/phase-3/design-review-gate.md` | MINOR 追跡テーブル |
| Phase 9 QA       | `outputs/phase-9/qa-report.md`          | 品質確認結果       |

---

## 成果物

| 成果物                 | パス                                      | 説明                         |
| ---------------------- | ----------------------------------------- | ---------------------------- |
| final-review-result.md | `outputs/phase-10/final-review-result.md` | AC充足・blocker・MINOR残確認 |

---

## 統合テスト連携【必須】

| 判定項目                   | 基準   | 備考                                               |
| -------------------------- | ------ | -------------------------------------------------- |
| AC-1〜AC-9 全充足確認      | PASS   | テスト ID と実装の対応が記録されていること         |
| MAJOR 指摘数               | 0件    | MAJOR がある場合 Phase 2/5 へ差し戻し              |
| MINOR 追跡テーブル解決状況 | 記録済 | 全指摘の解決状況が `final-review-result.md` に記載 |

## 完了条件

- [ ] AC-1〜AC-9 が全て充足されていることが確認されている
- [ ] コード差分レビューが完了し、問題がない（または MINOR として記録されている）
- [ ] MAJOR 指摘が 0 件であることが確認されている
- [ ] Phase 3 MINOR 追跡テーブルの全解決状況が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 11: 手動テスト（UI タスク = VISUAL）
