# Phase 5: 実装

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 5                                       |
| タスクID   | TASK-RALLY-001                          |
| 機能名     | skill-lifecycle-panel-dead-code-removal |
| 前提Phase  | Phase 4                                 |
| 後続Phase  | Phase 6                                 |
| 作成日     | 2026-04-21                              |
| ステータス | completed                               |

## 目的

Phase 2 で設計した削除手順に従い、`SkillLifecyclePanel.tsx` から dead code を削除する。

## 実行タスク

- タスク1: 削除前の参照再確認を行う
- タスク2: state / effect / handler を一貫して削除する
- タスク3: typecheck / lint / test で first validation を行う

## 実装手順

1. `grep -rn "_handleSubmitWorkflowInput" apps/ packages/` を実行し、参照箇所を特定する
2. 参照が `SkillLifecyclePanel.tsx` 内の定義のみであることを確認する（他参照がある場合は中断してPhase 2に差し戻す）
3. `SkillLifecyclePanel.tsx` を開き、state 宣言4行（L482〜485）を削除する
   - `const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);`
   - `const [textAnswer, setTextAnswer] = useState("");`
   - `const [secretAnswer, setSecretAnswer] = useState("");`
   - `const [confirmAnswer, setConfirmAnswer] = useState<boolean | null>(null);`
4. L607〜631 の `useEffect`（state setter のみを呼ぶ companion dead code）を削除する（Phase 1 調査で追加確認）
5. `_handleSubmitWorkflowInput` 関数定義全体を削除する（L793〜833）
6. 削除した state・useEffect・関数への残存参照がないか `grep` で再確認する
7. `pnpm --filter @repo/desktop typecheck` を実行し、エラーがないことを確認する
8. `pnpm --filter @repo/desktop lint` を実行し、エラーがないことを確認する
9. `pnpm --filter @repo/desktop test` を実行し、既存テストが通過することを確認する

## 統合テスト連携

- Phase 4 の targeted run を先に実施し、その後に必要なら full run へ拡張する
- Phase 6 は本Phaseの verification result を baseline として回帰確認する

## 変更対象ファイル

| ファイル                                                             | 変更種別 | 変更内容                                                                                                    |
| -------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 削除     | state宣言4行（L482-485）+ useEffect25行（L607-631）+ `_handleSubmitWorkflowInput`関数41行（L793-833）計70行 |

## 実装上の注意事項

- `useState` インポートが他の state 宣言でも使われている場合は、インポート自体は削除しない
- 削除後に未使用 `import` の lint 警告が出た場合は合わせて整理する
- 削除はコード変更のみ。新規機能の追加・既存ロジックの変更は行わない

## 参照資料

| 資料名               | パス                                    | 用途               |
| -------------------- | --------------------------------------- | ------------------ |
| 削除対象コードリスト | `outputs/phase-2/dead-code-list.md`     | 削除する行番号確認 |
| テスト仕様書         | `outputs/phase-4/test-specification.md` | 検証手順確認       |

## 成果物

| 成果物           | パス                                        | 説明                           |
| ---------------- | ------------------------------------------- | ------------------------------ |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 削除した行番号・内容のサマリー |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更したファイルパスと変更種別 |
| 検証結果         | `outputs/phase-5/verification-result.md`    | typecheck/lint/test の実行結果 |

## 完了条件

- [ ] state 宣言4行が削除されている
- [ ] `_handleSubmitWorkflowInput` 関数定義が削除されている
- [ ] `grep -rn "_handleSubmitWorkflowInput" apps/ packages/` の結果が空
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通過
- [ ] `pnpm --filter @repo/desktop lint` がエラーなしで通過
- [ ] 既存テストが全て通過
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] AC-1〜AC-5 全PASS確認
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 6: テスト拡充
