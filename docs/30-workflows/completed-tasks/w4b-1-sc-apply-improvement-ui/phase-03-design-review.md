# Phase 3: 設計レビュー

## メタ情報

| 項目       | 値                            |
| ---------- | ----------------------------- |
| Phase      | 3                             |
| タスクID   | UT-SC-05-APPLY-IMPROVEMENT-UI |
| 作成日     | 2026-03-23                    |
| レビュー日 | 2026-03-24                    |
| 前提       | Phase 2 完了                  |

## 目的

Phase 1（要件定義）と Phase 2（設計）の妥当性を、セキュリティ・型安全・UI/UX・既知パターン整合の4観点で検証する。

## 実行タスク

### Task 1: セキュリティレビュー

#### 1-1. IPC ハンドラセキュリティ

- [x] `validateIpcSender` による送信元ウィンドウ検証が全ハンドラに含まれている
  - Phase 2 Task 1-2 L47 で明示。既存 `skill-creator:improve-skill` ハンドラ（L157-161）と同一パターン
- [x] `skillName` に P42 準拠の3段バリデーション（型チェック/空文字列/トリム空文字列）が適用されている
  - Phase 2 Task 1-2 L50 `isBlank()` ヘルパー使用。既存パターン（creatorHandlers.ts L35-37）と完全一致
- [x] `suggestions` 配列に `Array.isArray()` 実行時型検証が適用されている
  - Phase 2 Task 1-2 L55
- [x] 各 suggestion 要素の全フィールドに `typeof === "string"` 検証が適用されている
  - Phase 2 Task 1-2 L63-75 で section/before/after/reason の4フィールドを検証
- [x] エラーメッセージに `sanitizeErrorMessage` が適用されている
  - Phase 2 Task 1-2 L90
- [x] `ALLOWED_INVOKE_CHANNELS` ホワイトリストにチャンネルが追加されている
  - Phase 2 Task 1-1 で明示
- [x] `unregisterRuntimeSkillCreatorHandlers` にハンドラ解除が含まれている
  - Phase 2 Task 1-3 で `ipcMain.removeHandler()` 追加

#### 1-2. パストラバーサル対策

- `skillName` はファイルパスではなくスキル名であるため、`validatePath` は不要
- `isBlank()` + `trim()` で空白のみ入力を拒否。`RuntimeSkillCreatorFacade.applyImprovement()` 内部で `skillFileManager.readFile(skillName, "SKILL.md")` がスキル名ベースのパス解決を行うため、パストラバーサルリスクは低い

### Task 2: 型安全レビュー

- [x] `RuntimeSkillCreatorImproveSuggestion` は `@repo/shared/types` から単一ソースで参照している（P32 準拠）
  - `packages/shared/src/types/skillCreator.ts` L353-358 に定義。Preload/Main 両方からこの型を参照
- [x] `ApplyImprovementResult` は `@repo/shared/types` から単一ソースで参照している（P32 準拠）
  - `packages/shared/src/types/skillCreator.ts` L372-377 に定義
- [x] Preload API のメソッドシグネチャがハンドラの引数型と一致している（P44 準拠）
  - 両方 `{ skillName: string, suggestions: RuntimeSkillCreatorImproveSuggestion[] }` オブジェクト形式
- [x] IPC レスポンスが `IpcResult<T>` wrapper 形式で統一されている（P60 準拠）
  - 成功: `{ success: true, data: ApplyImprovementResult }`、失敗: `{ success: false, error: string }`
- [x] non-null assertion (`!`) が使用されていない（P48 準拠）
- [x] `as` キャストによる型検証バイパスがない（P19/P49 準拠）
- [x] Phase 1 受入基準のメソッド名が Phase 2 設計と一致している（`applyRuntimeImprovement`）
  - M-3 対応時に修正済み

### Task 3: UI/UX レビュー

- [x] diff 表示が before（赤系）/ after（緑系）で視覚的に区別可能
  - Phase 2 Task 3-6 `diffStyles` で `--status-error`（赤）/`--status-success`（緑）を使用
- [x] CSS 変数ベースでライト/ダークモード両対応（`--status-error` / `--status-success`）
  - 既存コンポーネント（RiskPanel, ScoreDisplay）と同一パターン
- [x] チェックボックスに `aria-label` が付与されている
  - **MINOR 指摘 M-2 対応**: Phase 2 設計書のレイアウト図に `aria-label` の仕様が未記載だったが、Phase 4 テスト C-7 で `aria-label={`${suggestion.section}の改善提案を選択`}` が要求されている。Phase 5 実装時に既存パターン（SuggestionList: `aria-label={`${suggestion.description}を選択`}`）を適用して対応する
- [x] ローディング状態にフィードバック（スピナー/disabled ボタン）がある
  - Phase 2 Task 3-3 `isApplying` 状態で制御
- [x] 0 件選択時にボタンが disabled になる
  - Phase 2 Task 3-3 `selectedCount === 0` で disabled
- [x] 角丸 8-12px、8px グリッドスペーシング
  - 既存パターン準拠（`rounded-lg`, `p-4`, `gap-2`）
- [x] Atomic Design 階層（atoms/molecules/organisms）が適切
  - DiffBlock(atoms) → ProposalItem(molecules) / ApplyResult(molecules) → ProposalList(organisms)

### Task 4: 既知パターン整合チェック

| パターン | チェック項目                                                         | 結果 | 根拠                                                    |
| -------- | -------------------------------------------------------------------- | ---- | ------------------------------------------------------- |
| P23      | Preload/Main の型定義が同期しているか                                | PASS | shared/types を単一ソースとして参照                     |
| P32      | shared/types と preload/types の二箇所同時更新が計画されているか     | PASS | Phase 2 Task 2-2 で preload/types.ts への型追加を明示   |
| P42      | skillName に3段バリデーションが適用されているか                      | PASS | `isBlank()` ヘルパー使用（既存ハンドラと同一）          |
| P44      | ハンドラ引数形式と Preload 呼び出し形式が一致しているか              | PASS | 両方 `{ skillName, suggestions }` オブジェクト形式      |
| P47      | CSS 変数スタイルがテスト可能な形でエクスポートされているか           | PASS | `diffStyles` を `as const` でモジュールスコープ export  |
| P48      | IPC レスポンスに non-null assertion がないか                         | PASS | 設計書に `!` 演算子なし                                 |
| P60      | レスポンスが wrapper 形式で統一されているか                          | PASS | `IpcResult<ApplyImprovementResult>` 形式                |
| P65      | 既存 `skill-creator:*` namespace に統合されているか（dead-end 回避） | PASS | `skill-creator:apply-improvement` で既存 namespace 統合 |
| P50      | Phase 1 で既実装状態の調査が実施されているか                         | PASS | Phase 1 に P50 チェックセクション追加済み               |

### Task 5: 設計判定

**判定結果: MINOR**

全チェック項目を確認した結果、セキュリティ・型安全・既知パターン整合は問題なし。以下の軽微な指摘2件を対応後 Phase 4 へ進行する。

**MINOR 指摘一覧**:

| #   | 指摘内容                                                                                         | 対応方針                                                                                                            | 対応状況       |
| --- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | -------------- |
| M-1 | artifacts.json と各 Phase 文書の参照パスが `w4b-sc-`（`-1` なし）                                | 全ファイルで `w4b-sc-apply-improvement-ui` → `w4b-1-sc-apply-improvement-ui` に一括修正                             | 対応済み       |
| M-2 | Phase 2 設計書に aria 属性の仕様が未記載（テスト C-7 で要求あり）                                | Phase 5 実装時に既存パターン `aria-label={`${section}の改善提案を選択`}` を適用                                     | Phase 5 で対応 |
| M-3 | Preload API 修正対象が `skill-api.ts` と記載されていたが正しくは `skill-creator-api.ts`          | Runtime Skill Creator メソッドは `skill-creator-api.ts` に集約されているため、全 Phase 文書と artifacts.json を修正 | 対応済み       |
| M-4 | Phase 2 に ImprovementProposalPanel の接続先設計が未記載だった                                   | Phase 2 Task 3.5 として接続先設計を追加                                                                             | 対応済み       |
| M-5 | Phase 1 受入基準のメソッド名 `applyImprovement` が Phase 2 の `applyRuntimeImprovement` と不一致 | Phase 1 受入基準を `applyRuntimeImprovement` に修正                                                                 | 対応済み       |

## 参照資料

- `docs/30-workflows/w4b-1-sc-apply-improvement-ui/phase-01-requirements.md`
- `docs/30-workflows/w4b-1-sc-apply-improvement-ui/phase-02-design.md`
- `.claude/rules/02-code-quality.md`（TypeScript 型安全）
- `.claude/rules/04-electron-security.md`（IPC セキュリティ原則）
- `.claude/rules/06-known-pitfalls.md`（既知の落とし穴）
- `apps/desktop/src/main/ipc/creatorHandlers.ts`（既存ハンドラパターン実物確認）
- `apps/desktop/src/preload/channels.ts`（既存チャンネル定義実物確認）
- `apps/desktop/src/renderer/components/skill/SuggestionList.tsx`（既存 UI パターン実物確認）

## 成果物

- 本ファイル（`phase-03-design-review.md`）にレビュー結果を記録

## 統合テスト連携

設計レビューとして統合テスト観点を検証:

- IPC 引数形式と Preload 呼び出し形式の一致確認（P44 準拠）: PASS
- E2E フロー（improve → ProposalPanel → apply）が設計されている: PASS
- Phase 6 統合テスト（I-1 ~ I-3）の設計根拠が Phase 2 に存在する: PASS

## 多角的チェック観点

Task 1（セキュリティ）、Task 2（型安全）、Task 3（UI/UX）、Task 4（既知パターン整合）として実施済み。

## サブタスク管理

Phase 実行開始時に以下のサブタスクを作成:

1. セキュリティレビュー（Task 1）
2. 型安全レビュー（Task 2）
3. UI/UX レビュー（Task 3）
4. 既知パターン整合チェック（Task 4）
5. 設計判定（Task 5）

## タスク100%実行確認

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 完了条件

- [x] セキュリティレビュー全項目が確認されている
- [x] 型安全レビュー全項目が確認されている
- [x] UI/UX レビュー全項目が確認されている
- [x] 既知パターン整合チェック全項目が確認されている
- [x] 設計判定（MINOR）が記録されている
- [x] MINOR 指摘の対応方針が記載されている（M-1 対応済み / M-2 Phase 5 で対応）
- [x] ImprovementProposalPanel の接続先設計が Phase 2 に含まれていることを確認
- [x] Phase 1 受入基準のメソッド名が Phase 2 設計と一致していることを確認

## 次の Phase

Phase 4: テスト作成
