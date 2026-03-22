# Phase 4: テスト作成

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| Phase    | 4                               |
| タスクID | TASK-SC-08-E2E-TERMINAL-HANDOFF |
| 作成日   | 2026-03-22                      |

## 目的

5シナリオのE2Eテストコードを作成する。IPC レスポンス形式は Phase 2 設計書の定義を参照してアサーションを記述する（P60対策）。

## 実行タスク

1. **シナリオA: 正常フローテスト**
   - `skill-creator:plan` を呼び出し、`{ success: true, data: { steps, estimatedTime } }` が返ること
   - `skill-creator:execute` を呼び出し、`{ success: true, data: { skillPath } }` が返ること
   - スキルファイルが `skillPath` に実際に作成されていること（AC-5）

2. **シナリオB: TerminalHandoff 動作テスト**
   - `skill-creator:execute` のレスポンスに `terminalHandoff.suggestedCommand` が含まれること（AC-7）
   - `suggestedCommand` が空文字列でないこと
   - `suggestedCommand` が CLI 実行可能な形式（`/^[a-zA-Z]` から始まる文字列）であること

3. **シナリオC: LLMエラー回復フローテスト**
   - LLMがエラーを返した場合に `{ success: false, error: { code: "LLM_ERROR", message: "..." } }` が返ること（AC-6）
   - エラー後にアプリがクラッシュしないこと（NFR-4）
   - エラー後に再度 `skill-creator:plan` が実行可能であること

4. **シナリオD: improve 機能テスト**
   - 既存スキルのパスを指定して `skill-creator:plan` を呼び出すと、改善プランが返ること
   - `skill-creator:execute` で改善されたスキルが既存パスに上書き保存されること

5. **シナリオE: 後方互換テスト**
   - 既存の `skill:create` チャンネルが依然として動作すること（NFR-3）
   - 新チャンネル（`skill-creator:plan` / `skill-creator:execute`）と旧チャンネルが共存できること

6. **テスト設計注意事項**
   - P60対策: アサーションは `result.error.code`（wrapper形式）で記述する
   - P63対策: インポートパスは既存テストファイルを参照してから記述する（`grep -n "^import" 既存テスト`）
   - P40対策: テストは `cd apps/desktop` から実行する

## 参照資料

- Phase 2 設計書（IPC レスポンス形式定義）: `phase-02-design.md`
- `.claude/rules/06-known-pitfalls.md` (P40, P60, P63)
- 既存のIPCテストパターン（`grep -rn "ipcMain.handle" apps/desktop/src/main/`）

## 成果物

- `apps/desktop/src/test/e2e/skill-creator-integration.test.ts`（新規）
- `apps/desktop/src/test/e2e/terminal-handoff.test.ts`（新規）
- `apps/desktop/src/test/helpers/skill-creator-test-helpers.ts`（新規）

## 完了条件

- [ ] シナリオA（正常フロー）テストが作成されている
- [ ] シナリオB（TerminalHandoff）テストが作成されている
- [ ] シナリオC（LLMエラー回復）テストが作成されている
- [ ] シナリオD（improve機能）テストが作成されている
- [ ] シナリオE（後方互換）テストが作成されている
- [ ] P60対策（IPC レスポンスのwrapper形式でアサーション）が徹底されている
- [ ] P63対策（インポートパスを既存テストから参照）が徹底されている
- [ ] 全テストが Red（実装前は失敗）または実装済みなら Green であることが確認されている

## 次のPhase

Phase 5: 実装
