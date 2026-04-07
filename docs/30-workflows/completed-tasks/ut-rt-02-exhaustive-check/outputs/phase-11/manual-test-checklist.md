# Phase 11: 手動テストチェックリスト

## タスク種別

NON_VISUAL（Main Process 内部変更のみ）

---

## チェックリスト

### NON_VISUAL 宣言

- [x] タスク種別（NON_VISUAL）を確認した
- [x] UI / Renderer コンポーネントへの変更がないことを確認した
- [x] IPC チャンネルの追加・変更がないことを確認した
- [x] スクリーンショット不要の理由を `manual-test-result.md` に明記した

### 自動テスト代替証跡

- [x] 証跡の主ソース（自動テスト名・件数）を `manual-test-result.md` に明記した
- [x] T-01〜T-06（既存テスト 6件）が PASS していることを確認した
- [x] TC-T4-01〜TC-T4-04（新規テスト）の実行結果を確認した
- [x] TC-08: unknown variant の smoke test が PASS することを確認した
- [x] TC-09 は it.todo であることを確認した
- [x] 型チェック（typecheck）が PASS することを確認した
- [x] Lint が PASS することを確認した

### 発見課題

- [x] `discovered-issues.md` を作成した（0件でも出力必須）

---

**全チェック完了: 2026-04-07**
