# Phase 4: テスト作成

## メタ情報

| 項目      | 値                           |
| --------- | ---------------------------- |
| Phase     | 4                            |
| Phase名   | テスト作成                   |
| カテゴリ  | テスト                       |
| 前提Phase | Phase 3（設計レビュー PASS） |
| 後続Phase | Phase 5                      |
| 作成日    | 2026-04-06                   |

## 目的

AC-1〜AC-9 に対応するテストケースを TDD Red フェーズで定義する。
テストパターンが Phase 1-3 で確認した命名規則と整合しているかを検証してから実装する。

---

## 命名規則の確認（TDD Red 前の必須確認）

Phase 1 の P50 チェックで確認した命名規則をここに記録する:

| 対象                   | 命名規則                                | 例                                      |
| ---------------------- | --------------------------------------- | --------------------------------------- |
| コンポーネントファイル | PascalCase.tsx                          | `SessionResumePrompt.tsx`               |
| テストファイル         | `__tests__/ComponentName.test.tsx`      | `SessionResumePrompt.test.tsx`          |
| IPC チャンネル名       | `skill-creator:kebab-case`（RT-06準拠） | `skill-creator:list-sessions`           |
| Preload API メソッド   | camelCase                               | `listSessions`, `resumeSession`         |
| data-testid            | kebab-case                              | `session-resume-prompt`, `session-list` |

---

## 実行タスク

1. `SessionResumePrompt` ユニットテスト定義（TC-U-01〜TC-U-09）
2. `SessionIndicator` ユニットテスト定義（TC-U-10〜TC-U-12）
3. IPC 統合テスト定義（TC-I-01〜TC-I-08）
4. `SkillLifecyclePanel` 統合テスト定義（TC-I-09〜TC-I-13）
5. テストマトリクス作成（`outputs/phase-4/test-matrix.md`）

### タスク1: `SessionResumePrompt` ユニットテスト定義

**テストファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SessionResumePrompt.test.tsx`

```typescript
describe("SessionResumePrompt", () => {
  // AC-1, AC-2 対応
  it(
    "TC-U-01: セッション一覧が表示される（data-testid='session-list' に items が存在）",
  );
  // AC-8 対応
  it("TC-U-02: isCompatible=false のセッションに互換性警告バッジが表示される");
  // AC-2, AC-3 対応
  it(
    "TC-U-03: 「続きから再開」ボタンクリックで onResume(sessionId) が呼ばれる",
  );
  // AC-3, AC-4 対応
  it(
    "TC-U-04: 「削除して新規開始」ボタンクリックで onSkip(sessionId) が呼ばれる",
  );
  // AC-1 対応（sessions.length === 0 時は非表示）
  it("TC-U-05: sessions が空配列のとき SessionResumePrompt が非表示になる");
  // AC-2 対応
  it("TC-U-06: isLoading=true のときローディングスピナーが表示される");
  // AC-8 対応
  it(
    "TC-U-07: resumeSession 失敗時（errorReason='incompatible'）にエラーバナーが表示される",
  );
  it(
    "TC-U-08: resumeSession 失敗時（errorReason='expired'）にエラーバナーが表示される",
  );
  it(
    "TC-U-09: data-testid='session-start-new-btn' が存在し onStartNew が呼ばれる",
  );
});
```

### タスク2: `SessionIndicator` ユニットテスト定義

**テストファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SessionIndicator.test.tsx`

```typescript
describe("SessionIndicator", () => {
  // AC-5 対応
  it("TC-U-10: sessionId と経過時間（startedAt からの相対時間）が表示される");
  it(
    "TC-U-11: isActive=true のとき pulse アニメーション要素（data-testid='session-indicator-pulse'）が存在する",
  );
  it("TC-U-12: isActive=false のとき pulse アニメーション要素が存在しない");
});
```

### タスク3: IPC 統合テスト定義

**テストファイル**: `apps/desktop/src/__tests__/session-resume-ipc.test.ts`

```typescript
describe("Session Resume IPC Integration", () => {
  // AC-1 対応
  it("TC-I-01: listSessions() が未完了セッション一覧を返す");
  // AC-2, AC-3, AC-7 対応
  it(
    "TC-I-02: resumeSession(sessionId) が成功し workflowSnapshot を返す（session_id が再利用される）",
  );
  // AC-4 対応
  it(
    "TC-I-03: deleteSession(sessionId) 後に listSessions() でセッションが消える",
  );
  // AC-5, AC-6 対応
  it(
    "TC-I-04: cleanupExpiredSessions() が期限切れセッションを削除して件数を返す",
  );
  // AC-8 対応
  it(
    "TC-I-05: resumeSession(sessionId) が非互換時に { success: false, errorReason: 'incompatible' } を返す",
  );
  it(
    "TC-I-06: resumeSession(sessionId) が期限切れ時に { success: false, errorReason: 'expired' } を返す",
  );
  it(
    "TC-I-07: resumeSession(sessionId) が存在しないIDに対し { success: false, errorReason: 'not_found' } を返す",
  );
  // AC-9 対応
  it(
    "TC-I-08: IPC ハンドラーが Facade のメソッドを正しく呼び出している（薄いラッパー検証）",
  );
});
```

### タスク4: `SkillLifecyclePanel` 統合テスト定義

```typescript
describe("SkillLifecyclePanel: Session Resume Integration", () => {
  it("TC-I-09: アプリ起動時（useEffect マウント）に listSessions() が呼ばれる");
  it("TC-I-10: sessions.length > 0 のとき SessionResumePrompt が表示される");
  it(
    "TC-I-11: sessions.length === 0 のとき SessionResumePrompt が表示されない",
  );
  it(
    "TC-I-12: resumeSession 成功後に SessionResumePrompt が非表示になり会話が継続される",
  );
  it(
    "TC-I-13: P0-06 の useInterviewState への永続化コードが混在していない（localStorage 不使用確認）",
  );
});
```

### タスク5: テストマトリクス作成

`outputs/phase-4/test-matrix.md` に以下を記録する:

| テストID | 対応AC | シナリオ               | 期待結果                                        | 優先度 |
| -------- | ------ | ---------------------- | ----------------------------------------------- | ------ |
| TC-U-01  | AC-1   | セッション一覧表示     | data-testid='session-list' に items あり        | 高     |
| TC-U-02  | AC-8   | 非互換セッション警告   | 警告バッジが表示される                          | 高     |
| TC-U-03  | AC-2,3 | 再開ボタン押下         | onResume(sessionId) が呼ばれる                  | 高     |
| TC-U-04  | AC-3,4 | スキップボタン押下     | onSkip(sessionId) が呼ばれる                    | 高     |
| TC-U-05  | AC-1   | sessions が空          | プロンプト非表示                                | 高     |
| TC-I-02  | AC-2,7 | resumeSession 成功     | workflowSnapshot が返される                     | 高     |
| TC-I-05  | AC-8   | 非互換時 resumeSession | { success: false, errorReason: 'incompatible' } | 高     |
| TC-I-08  | AC-9   | 薄いラッパー検証       | Facade メソッドのみ呼び出し                     | 中     |

---

## 参照資料

| 資料名         | パス                       | 説明               |
| -------------- | -------------------------- | ------------------ |
| Phase 1 要件   | `phase-1-requirements.md`  | AC-1〜AC-9         |
| Phase 2 設計   | `phase-2-design.md`        | 型定義・IPC設計    |
| Phase 3 review | `phase-3-design-review.md` | MINOR 追跡テーブル |

---

## 成果物

| 成果物         | パス                             | 説明                              |
| -------------- | -------------------------------- | --------------------------------- |
| test-matrix.md | `outputs/phase-4/test-matrix.md` | TC-U-01〜TC-I-13 の一覧と期待結果 |

---

## 統合テスト連携【必須】

| 判定項目                           | 基準 | 備考                                              |
| ---------------------------------- | ---- | ------------------------------------------------- |
| テストケース TC-U-01〜TC-I-13 定義 | 完了 | 全 AC に対応するテストが定義されていること        |
| 命名規則整合                       | PASS | TDD Red 前に Phase 1-3 の命名規則と整合確認済み   |
| テストマトリクス作成               | 完了 | `outputs/phase-4/test-matrix.md` が作成されること |

## 完了条件

- [ ] 命名規則（コンポーネント・テストファイル・data-testid・チャンネル名）が確認されている
- [ ] `SessionResumePrompt` のテストケース（TC-U-01〜TC-U-09）が定義されている
- [ ] `SessionIndicator` のテストケース（TC-U-10〜TC-U-12）が定義されている
- [ ] IPC 統合テストケース（TC-I-01〜TC-I-08）が定義されている
- [ ] `SkillLifecyclePanel` 統合テストケース（TC-I-09〜TC-I-13）が定義されている
- [ ] テストマトリクス（`outputs/phase-4/test-matrix.md`）が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 5: 実装
