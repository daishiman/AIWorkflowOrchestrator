# Phase 1: 要件定義

## タスク情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001                     |
| タスク名   | スキルウィザード Q5 複数選択時の「主ツール」UI表示       |
| 種別       | improvement                                              |
| 優先度     | medium                                                   |
| スケール   | small                                                    |
| 関連Issue  | #2071                                                    |
| 依存タスク | UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001（並列統合対応） |

---

## P50チェック（重複実装なし確認）

| 確認項目                   | 結果 | 確認内容                                                              |
| -------------------------- | ---- | --------------------------------------------------------------------- |
| 既存「主ツール」バッジ実装 | なし | `grep -r "主ツール" apps/desktop/src/` で0件                          |
| Q5バッジ関連コード         | なし | `ConversationRoundStep.tsx` に該当コードなし                          |
| 類似バッジコンポーネント   | なし | `packages/ui/` にバッジ専用コンポーネントなし（インライン実装を選択） |

**P50チェック結果**: 重複実装なし → 実装進行可

---

## Carry-Over 内容確認

| 前提タスク                                      | 完了状態 | キャリーオーバー内容                                                    |
| ----------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| skill-wizard-multi-select-options (OPT-MSO-002) | 完了     | Q5での複数ツール同時選択が可能（`selectedOptions`配列に追加順序で格納） |

**引き継ぎ事項**:

- `handleOptionSelect` はトグル方式で `selectedOptions` 配列を更新する
- `selectedOptions[0]` は最初に選択されたツールを指す（追加順序保持）
- `resolveExternalIntegration` は `selectedOptions[0]` を主ツールとして参照する（本タスクのスコープ外）

---

## 問題の背景

Q5（外部ツール連携）で複数ツールを選択できるようになったが、UI上では全チェックボックスが同等に表示される。一方、内部ロジック（`resolveExternalIntegration`）では `selectedOptions[0]` を「主ツール」として優先参照する。

**非対称性の構造**:

```
UI表示: [Slack ✓] [GitHub ✓] [その他 ✓]  ← 全て同等表示
内部ロジック: selectedOptions[0] = "Slack" が主ツール  ← 優先扱い
```

この非対称性をユーザーに明示するために「主ツール」バッジを表示する。

---

## 実装スコープ

### 含む

- `ConversationRoundStep.tsx`: Q5選択肢レンダリング部に「主ツール」バッジ表示ロジック追加
- `ConversationRoundStep.test.tsx`: Q5複数選択時のバッジ表示テストケース追加

### 含まない

- `resolveExternalIntegration` の変更（UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001 のスコープ）
- バッジの専用コンポーネント化（インライン実装で十分）
- 選択順序変更UI（将来課題）
- Q1〜Q4, Q6への影響（スコープ外）

---

## タスク分類宣言

- **分類**: UIタスク / VISUAL
- **手動テスト**: 必須（Phase 11 スクリーンショット証跡取得）
- **アクセシビリティ**: aria-label付与必須
- **暫定措置**: UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001 完了後に削除予定
