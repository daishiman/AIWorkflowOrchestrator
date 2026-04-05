# Phase 6: テスト拡充

## メタ情報

| 項目      | 値         |
| --------- | ---------- |
| Phase     | 6          |
| Phase名   | テスト拡充 |
| カテゴリ  | テスト     |
| 前提Phase | Phase 5    |
| 後続Phase | Phase 7    |
| 作成日    | 2026-04-06 |

## 目的

Phase 5 の基本テストに加え、fail path・境界値・回帰ガードを追加して、エッジケースを網羅する。
P0-06/P0-08 境界侵食を防ぐ回帰ガードを必ず含める。

---

## 実行タスク

1. fail path テスト追加（TC-E-01〜TC-E-06）
2. 境界値テスト追加（TC-B-01〜TC-B-04）
3. 回帰ガードテスト追加（TC-R-01〜TC-R-04、P0-06/P0-08 境界保護）
4. 補助検証コマンドの実行（薄いラッパー・localStorage 不使用確認）

### タスク1: fail path テストの追加

```typescript
// apps/desktop/src/renderer/components/skill/__tests__/SessionResumePrompt.test.tsx に追加
it("TC-E-01: listSessions() が空配列を返した場合、プロンプトが非表示になる");
it(
  "TC-E-02: resumeSession() が not_found エラーを返した場合、エラーバナーと新規開始ボタンが表示される",
);
it("TC-E-03: deleteSession() が失敗した場合、エラーバナーが表示される");

// apps/desktop/src/__tests__/session-resume-ipc.test.ts に追加
it(
  "TC-E-04: listSessions() が IPC エラーをスローした場合、SessionResumePrompt が表示されない（サイレント失敗）",
);
it("TC-E-05: cleanupExpiredSessions() が 0 件削除した場合も正常終了する");
it("TC-E-06: 複数の期限切れセッションが一括削除される（削除件数が返される）");
```

### タスク2: 境界値テストの追加

```typescript
it("TC-B-01: sessions が 1 件のとき SessionResumePrompt に 1 件だけ表示される");
it("TC-B-02: sessions が 10 件のとき全件表示される");
it("TC-B-03: sessionId が空文字のとき resumeSession() を呼ばない");
it(
  "TC-B-04: startedAt が未来の日時（異常値）のとき elapsed time が "0s" にフォールバック表示される",
);
```

### タスク3: 回帰ガードの追加（P0-06/P0-08 境界保護）

```typescript
it(
  "TC-R-01: SkillLifecyclePanel の useEffect が localStorage 保存を含まない（回帰ガード）",
);
it(
  "TC-R-02: SessionResumePrompt が useInterviewState の messages を参照していない",
);
it(
  "TC-R-03: IPC ハンドラー内に DB 直接アクセスコードが存在しない（Facade 呼び出しのみ）",
);
it(
  "TC-R-04: P0-06 の ConversationalInterview コンポーネントが SessionResumePrompt と独立している",
);
```

### タスク4: 補助検証コマンド

```bash
# 薄いラッパー検証（Facade 呼び出しのみか確認）
grep -A 5 "SKILL_CREATOR_LIST_SESSIONS\|SKILL_CREATOR_RESUME_SESSION" \
  apps/desktop/src/main/ipc/index.ts

# P0-06/P0-08 境界コメント確認
grep -n "TASK-P0-06\|TASK-P0-08\|永続化" \
  apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts

# localStorage 使用の検出（禁止確認）
grep -n "localStorage\|sessionStorage" \
  apps/desktop/src/renderer/components/skill/SessionResumePrompt.tsx \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

---

## 参照資料

| 資料名         | パス                             | 説明             |
| -------------- | -------------------------------- | ---------------- |
| Phase 4 テスト | `outputs/phase-4/test-matrix.md` | 基本テストケース |
| Phase 5 実装   | `phase-5-implementation.md`      | 実装済みファイル |

---

## 成果物

| 成果物            | パス                                | 説明                             |
| ----------------- | ----------------------------------- | -------------------------------- |
| test-expansion.md | `outputs/phase-6/test-expansion.md` | 追加テストケース一覧（TC-E/B/R） |

---

## 統合テスト連携【必須】

| 判定項目                             | 基準 | 備考                                   |
| ------------------------------------ | ---- | -------------------------------------- |
| fail path テスト（TC-E-01〜TC-E-06） | PASS | エラーシナリオが全て網羅されていること |
| 境界値テスト（TC-B-01〜TC-B-04）     | PASS | 0件・複数件・異常値を含む              |
| 回帰ガード（TC-R-01〜TC-R-04）       | PASS | P0-06/P0-08 境界侵食がないこと         |

## 完了条件

- [ ] fail path テスト（TC-E-01〜TC-E-06）が追加・PASS している
- [ ] 境界値テスト（TC-B-01〜TC-B-04）が追加・PASS している
- [ ] 回帰ガード（TC-R-01〜TC-R-04）が追加・PASS している
- [ ] localStorage 使用が SessionResumePrompt / SkillLifecyclePanel に存在しないことが確認されている
- [ ] P0-06/P0-08 境界コメントが `useInterviewState.ts` に存在することが確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: カバレッジ確認
