# Phase 4: テスト作成

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 4                                |
| タスクID | TASK-SC-07-STREAMING-PROGRESS-UI |
| 作成日   | 2026-03-22                       |

## 目的

GenerateStep UI改修に対するテストコードを実装前に作成する（TDDアプローチ）。happy-dom 環境の制約（P39）に従い `fireEvent` を使用する。

## 実行タスク

1. **GenerateStep 進捗表示テスト**
   - 初期状態（生成前）のUI確認
   - 各段階（planning / generating-skill / generating-agents / validating）での表示確認
   - `percent` 値に応じたプログレスバー幅の確認
   - `previewContent` が存在する場合のプレビュー表示確認
   - P39対策: `userEvent` の代わりに `fireEvent` を使用する

2. **エラー表示テスト**
   - `API_KEY_NOT_SET` エラー時: 設定画面への誘導リンクが表示されること
   - `LLM_ERROR` 時: リトライボタンが表示されること
   - `NETWORK_ERROR` 時: オフライン表示メッセージが出ること
   - エラー解除後（リトライ押下）: エラー表示が消えること

3. **キャンセルテスト**
   - キャンセルボタンが生成中にのみ表示されること（done / error 状態では非表示）
   - キャンセルボタン押下で `skill-creator:cancel` IPC が発火すること
   - キャンセル後に「キャンセルしました」メッセージが表示されること

4. **テスト設計注意事項**
   - happy-dom 環境のため `fireEvent` を使用（P39）
   - 非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む
   - IPC リスナーはモックで代替する
   - テスト間の状態共有を防ぐため `beforeEach` でストアをリセットする（P9対策）

## 参照資料

- Phase 2 設計書: `phase-02-design.md`
- `.claude/rules/06-known-pitfalls.md` (P9, P39)
- `.claude/rules/02-code-quality.md` (TDD原則)
- 既存テストファイルのインポートパターン（P63対策: `grep -n "^import" GenerateStep.test.tsx`）

## 成果物

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx`
- `apps/desktop/src/renderer/hooks/__tests__/useGenerationProgress.test.ts`

## 完了条件

- [ ] GenerateStep 進捗表示テストが作成されている（初期状態・4段階・プレビュー）
- [ ] エラー表示テスト3パターンが作成されている
- [ ] キャンセルテストが作成されている（表示タイミング・IPC発火・メッセージ）
- [ ] P39対策（`fireEvent` 使用）が徹底されている
- [ ] `beforeEach` でストアリセットが設定されている（P9対策）
- [ ] インポートパスが既存テストファイルと一致している（P63対策）
- [ ] 全テストが Red（実装前は失敗）であることが確認されている

## 次のPhase

Phase 5: 実装
