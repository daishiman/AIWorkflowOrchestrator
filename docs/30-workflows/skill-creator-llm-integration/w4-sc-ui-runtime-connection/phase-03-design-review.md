# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 3                                |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 作成日   | 2026-03-22                       |

## 目的

Phase 2 で設計した UI フロー変更の後方互換性を検証し、Zustand 状態設計の P31/P48 対策が十分かを確認する。

## 実行タスク

1. 後方互換性の検証（AC-7）
   - 既存の `skill:create` フローが破壊されないことを確認
   - 「LLM 生成を使用しない」場合のフローが従来通りに動作するか
   - 条件分岐の設計が明確か（`useLLMGeneration: boolean` などのフラグ）
2. Zustand 状態設計の P31/P48 対策確認
   - `useIsGenerating()` 等の個別セレクタが実装されているか
   - 派生セレクタ（`.filter()`, `.map()` を含む）に `useShallow` が適用されているか（P48対策）
   - 合成 Hook の戻り値関数が `useEffect` の依存配列に含まれないか（P31対策）
3. UI フロー設計の検証
   - TerminalHandoff 中のユーザー操作制限（誤操作防止）は設計されているか
   - plan 結果表示後の「キャンセル」フローは設計されているか
   - エラー時の UI フォールバック（planSkill 失敗時）は設計されているか
4. IPC 呼び出しの契約確認（P44/P45対策）
   - planSkill/executePlan のチャンネル名・引数形式が Preload 定義と一致するか
   - レスポンス wrapper 形式が Phase 2 設計と一致するか（P60対策）
5. レビュー判定（PASS / MINOR / MAJOR）

## 参照資料

- Phase 2 設計書（全成果物）
- `apps/desktop/src/preload/types.ts`
- `.claude/rules/03-state-management.md`（Zustand 設計原則）
- `.claude/rules/06-known-pitfalls.md`（P31, P44, P45, P48, P60）

## 成果物

- 設計レビュー報告書
  - 判定: PASS / MINOR / MAJOR
  - 後方互換性検証結果
  - Zustand 設計 P31/P48 対策確認結果
  - 指摘事項リスト

## 完了条件

- [ ] 既存 skill:create フローの後方互換性を検証した（AC-7）
- [ ] Zustand 個別セレクタ設計を確認した（P31対策）
- [ ] 派生セレクタへの useShallow 適用を確認した（P48対策）
- [ ] TerminalHandoff 中の誤操作防止を確認した
- [ ] planSkill エラー時の UI フォールバックを確認した
- [ ] IPC チャンネル名・引数形式の整合性を確認した（P44/P45対策）
- [ ] レビュー判定を PASS / MINOR / MAJOR で明記した
- [ ] MINOR 以上の指摘は全て対応方針を記載した

## 次のPhase

Phase 4: テスト作成
