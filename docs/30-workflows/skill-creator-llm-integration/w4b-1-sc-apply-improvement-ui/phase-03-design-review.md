# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 3                             |
| タスクID | UT-SC-05-APPLY-IMPROVEMENT-UI |
| 作成日   | 2026-03-23                    |
| 前提     | Phase 2 完了                  |

## 目的

Phase 1（要件定義）と Phase 2（設計）の妥当性を、セキュリティ・型安全・UI/UX・既知パターン整合の4観点で検証する。

## 実行タスク

### Task 1: セキュリティレビュー

#### 1-1. IPC ハンドラセキュリティ

- [ ] `validateIpcSender` による送信元ウィンドウ検証が全ハンドラに含まれている
- [ ] `skillName` に P42 準拠の3段バリデーション（型チェック/空文字列/トリム空文字列）が適用されている
- [ ] `suggestions` 配列に `Array.isArray()` 実行時型検証が適用されている
- [ ] 各 suggestion 要素の全フィールドに `typeof === "string"` 検証が適用されている
- [ ] エラーメッセージに `sanitizeErrorMessage` が適用されている
- [ ] `ALLOWED_INVOKE_CHANNELS` ホワイトリストにチャンネルが追加されている
- [ ] `unregisterRuntimeSkillCreatorHandlers` にハンドラ解除が含まれている

#### 1-2. パストラバーサル対策

- `skillName` はファイルパスではなくスキル名であるため、`validatePath` は不要
- ただし `skillName` に `../` や `\0` が含まれないことを確認するため、`isBlank()` + `trim()` で十分

### Task 2: 型安全レビュー

- [ ] `RuntimeSkillCreatorImproveSuggestion` は `@repo/shared/types` から単一ソースで参照している（P32 準拠）
- [ ] `ApplyImprovementResult` は `@repo/shared/types` から単一ソースで参照している（P32 準拠）
- [ ] Preload API のメソッドシグネチャがハンドラの引数型と一致している（P44 準拠）
- [ ] IPC レスポンスが `IpcResult<T>` wrapper 形式で統一されている（P60 準拠）
- [ ] non-null assertion (`!`) が使用されていない（P48 準拠）
- [ ] `as` キャストによる型検証バイパスがない（P19/P49 準拠）

### Task 3: UI/UX レビュー

- [ ] diff 表示が before（赤系）/ after（緑系）で視覚的に区別可能
- [ ] CSS 変数ベースでライト/ダークモード両対応（`--status-error` / `--status-success`）
- [ ] チェックボックスに `aria-label` が付与されている
- [ ] ローディング状態にフィードバック（スピナー/disabled ボタン）がある
- [ ] 0 件選択時にボタンが disabled になる
- [ ] 角丸 8-12px、8px グリッドスペーシング
- [ ] Atomic Design 階層（atoms/molecules/organisms）が適切

### Task 4: 既知パターン整合チェック

| パターン | チェック項目                                                         | 結果 |
| -------- | -------------------------------------------------------------------- | ---- |
| P23      | Preload/Main の型定義が同期しているか                                | -    |
| P32      | shared/types と preload/types の二箇所同時更新が計画されているか     | -    |
| P42      | skillName に3段バリデーションが適用されているか                      | -    |
| P44      | ハンドラ引数形式と Preload 呼び出し形式が一致しているか              | -    |
| P47      | CSS 変数スタイルがテスト可能な形でエクスポートされているか           | -    |
| P48      | IPC レスポンスに non-null assertion がないか                         | -    |
| P60      | レスポンスが wrapper 形式で統一されているか                          | -    |
| P65      | 既存 `skill-creator:*` namespace に統合されているか（dead-end 回避） | -    |

### Task 5: 設計判定

判定基準:

- **PASS**: 全チェック項目が問題なし → Phase 4 へ進行
- **MINOR**: 軽微な指摘あり → 指摘対応後 Phase 4 へ進行
- **MAJOR（要件問題）**: 要件に根本的な問題 → Phase 1 へ戻る
- **MAJOR（設計問題）**: 設計に根本的な問題 → Phase 2 へ戻る

## 参照資料

- `docs/30-workflows/w4b-sc-apply-improvement-ui/phase-01-requirements.md`
- `docs/30-workflows/w4b-sc-apply-improvement-ui/phase-02-design.md`
- `.claude/rules/02-code-quality.md`（TypeScript 型安全）
- `.claude/rules/04-electron-security.md`（IPC セキュリティ原則）
- `.claude/rules/06-known-pitfalls.md`（既知の落とし穴）

## 成果物

- 本ファイル（`phase-03-design-review.md`）にレビュー結果を記録

## 完了条件

- [ ] セキュリティレビュー全項目が確認されている
- [ ] 型安全レビュー全項目が確認されている
- [ ] UI/UX レビュー全項目が確認されている
- [ ] 既知パターン整合チェック全項目が確認されている
- [ ] 設計判定（PASS/MINOR/MAJOR）が記録されている
- [ ] MINOR/MAJOR の場合、対応方針が記載されている

## 次の Phase

Phase 4: テスト作成
