# Phase 10: 最終レビュー

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 10                            |
| タスクID | UT-SC-05-APPLY-IMPROVEMENT-UI |
| 作成日   | 2026-03-23                    |
| 前提     | Phase 9 完了（品質検証 PASS） |

## 目的

要件充足・設計整合・コード品質・セキュリティの4観点で最終的な多角レビューを実施し、本番リリース可能な品質であることを確認する。

## 実行タスク

### Task 1: 要件充足チェック

Phase 1 の受入基準を1項目ずつ確認する:

| #   | 受入基準                                                                          | 判定 |
| --- | --------------------------------------------------------------------------------- | ---- |
| 1   | `skill-creator:apply-improvement` IPC チャンネルが `channels.ts` に定義されている | -    |
| 2   | `creatorHandlers.ts` にハンドラが登録され、P42 準拠バリデーションが実装されている | -    |
| 3   | `unregisterRuntimeSkillCreatorHandlers` でハンドラが解除される                    | -    |
| 4   | Preload API に `applyRuntimeImprovement` メソッドが追加されている                 | -    |
| 5   | `ALLOWED_INVOKE_CHANNELS` にチャンネルが追加されている                            | -    |
| 6   | 改善提案一覧が section/before/after/reason を diff 形式で表示する                 | -    |
| 7   | 個別提案の承認/拒否がチェックボックスで選択可能である                             | -    |
| 8   | 承認した提案のみが SKILL.md に適用される                                          | -    |
| 9   | 適用結果（applied/skipped/errors）がユーザーに表示される                          | -    |
| 10  | 0 件選択時に「適用」ボタンが disabled になる                                      | -    |
| 11  | ライト/ダークモード両対応している                                                 | -    |
| 12  | 全テストが PASS する                                                              | -    |

### Task 2: 設計整合チェック

| チェック項目                                                        | 判定 |
| ------------------------------------------------------------------- | ---- |
| IPC レスポンスが `IpcResult<T>` wrapper 形式で統一されている（P60） | -    |
| Preload API メソッド名と IPC ハンドラ引数が一致している（P44）      | -    |
| 型定義が `@repo/shared/types` を単一ソースとして参照している（P32） | -    |
| `skill-creator:*` namespace に統合されている（P65 dead-end 回避）   | -    |
| Atomic Design 階層（atoms/molecules/organisms）が適切               | -    |

### Task 3: セキュリティ最終チェック

| チェック項目                                                              | 判定 |
| ------------------------------------------------------------------------- | ---- |
| `validateIpcSender` が全ハンドラに含まれている                            | -    |
| P42 準拠3段バリデーションが skillName に適用されている                    | -    |
| `Array.isArray()` による suggestions 実行時型検証                         | -    |
| 各 suggestion 要素の全フィールドが `typeof` / `in` 演算子で検証されている | -    |
| `sanitizeErrorMessage` がエラー経路で使用されている                       | -    |
| non-null assertion (`!`) が新コードに存在しない（P48）                    | -    |
| `as` キャストによるバリデーションバイパスがない（P19/P49）                | -    |
| ハードコード文字列のチャンネル名がない（P27）                             | -    |

### Task 4: コード品質最終チェック

| チェック項目                                                                        | 判定 |
| ----------------------------------------------------------------------------------- | ---- |
| `any` 型が使用されていない                                                          | -    |
| `@ts-ignore` / `@ts-expect-error` が使用されていない                                | -    |
| 未使用の import がない                                                              | -    |
| `React.memo` + `displayName` が全コンポーネントに設定                               | -    |
| CSS 変数ベースのスタイル定数が export されている（P47）                             | -    |
| ARIA 属性（role, aria-label, aria-checked）が全インタラクティブ要素に付与されている | -    |

### Task 5: 最終判定

判定基準:

- **PASS**: 全チェック項目が問題なし → Phase 11 へ進行
- **MINOR**: 軽微な指摘あり → 未タスク仕様書に変換後 Phase 11 へ進行（省略不可）
- **MAJOR**: 影響範囲に応じて Phase 1-5 へ戻る
- **CRITICAL**: Phase 1 へ戻り要件再確認

**判定結果**: （実行時に記入）

**MINOR 指摘一覧**（該当する場合）:

| #   | 指摘内容 | 未タスク仕様書パス |
| --- | -------- | ------------------ |

## 参照資料

- `docs/30-workflows/w4b-sc-apply-improvement-ui/phase-01-requirements.md`（受入基準）
- `docs/30-workflows/w4b-sc-apply-improvement-ui/phase-02-design.md`（設計書）
- `.claude/rules/04-electron-security.md`（IPC セキュリティ原則）
- `.claude/rules/05-task-execution.md`（Phase 10 判定基準）

## 成果物

- 最終レビュー結果（本ファイルに記録）

## 完了条件

- [ ] 受入基準 12 項目が全て確認されている
- [ ] 設計整合チェック全項目が確認されている
- [ ] セキュリティ最終チェック全項目が確認されている
- [ ] コード品質最終チェック全項目が確認されている
- [ ] 最終判定（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] MINOR の場合、全指摘が未タスク仕様書に変換されている

## 次の Phase

Phase 11: 手動テスト
