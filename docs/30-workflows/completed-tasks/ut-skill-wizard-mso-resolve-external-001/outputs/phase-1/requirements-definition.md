# 要件定義書: UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001

## P50チェック結果

### resolveExternalIntegration 現状確認

- **ファイル**: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- **シグネチャ**: `resolveExternalIntegration(q5Answer: ConversationAnswers["q5"], smartDefaultTool: string | null | undefined): ExternalIntegrationState`
- **M-01問題箇所** (line 183): `const selected = (q5Answer.selectedOptions[0] ?? "").trim();`
  → `selectedOptions` の先頭 1 件のみを参照しており、複数選択が無効

### バッジ実装確認

- **MAIN_TOOL_BADGE_ENABLED** (line 116): `const MAIN_TOOL_BADGE_ENABLED = true`
- **shouldShowMainToolBadge** (line 124-135): Q5 で 2 件以上選択時に先頭に「主ツール」バッジを表示
- **バッジ JSX** (line 490-498): `<span id={mainToolBadgeId} aria-label="主ツールとして使用される" ...>主ツール</span>`
- **TODO コメント** (line 465): `// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001): ...`

### テストファイル確認

- **削除対象 describe ブロック**:
  - `UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001: Q5「主ツール」バッジ表示` (TC-1〜TC-6)
  - `UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001: 拡充テスト（Phase 6）` (FP-MSO-01, FP-MSO-02, CMD-MSO-01, RG-MSO-Q4, RG-MSO-Q6)

### carry-over確認

前タスク `UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001` (#2071 完了済み) からの引き継ぎ:

- `TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)` コメントが削除の目印として付与済み
- バッジ実装は `ConversationRoundStep.tsx` 単一ファイルに局所化されており削除影響最小

## 機能要件

| ID   | 要件                                                                                |
| ---- | ----------------------------------------------------------------------------------- |
| FR-1 | `resolveExternalIntegration` が `string[]` を受け取り複数ツールを並列処理できること |
| FR-2 | 各ツールの統合情報（APIエンドポイント・認証方式・主要操作）がマージされること       |
| FR-3 | 単一ツール選択時は従来と同一の動作を維持すること                                    |
| FR-4 | 空配列・未対応ツールに対して安全にフォールバックすること                            |
| FR-5 | `SkillCreateWizard.tsx` の呼び出し箇所が複数ツールを渡すよう更新されること          |
| FR-6 | `ConversationRoundStep.tsx` の暫定バッジコードが削除されること                      |
| FR-7 | M-01 TODO コメントが削除されること                                                  |

## 非機能要件

| ID    | 要件                                                    |
| ----- | ------------------------------------------------------- |
| NFR-1 | テストカバレッジ: Line 90%+, Branch 80%+, Function 90%+ |
| NFR-2 | TypeScript 型チェック通過                               |
| NFR-3 | ESLint エラーなし                                       |
| NFR-4 | NON_VISUAL タスク（スクリーンショット証跡不要）         |
