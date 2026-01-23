# 未タスク検出レポート

## 検出日時

2026-01-23 23:20

## 検出結果サマリー

| ソース           | 検出数  |
| ---------------- | ------- |
| Phase 3レビュー  | 0件     |
| Phase 10レビュー | 4件     |
| Phase 11発見課題 | 6件     |
| コードベース     | 0件     |
| **合計**         | **6件** |

※Phase 10とPhase 11で重複する課題があるため、実質6件

---

## 検出タスク一覧

### 高優先度（別タスク化推奨）

#### TASK-001: UIコンポーネント実装

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| 発見元   | Phase 11（ISSUE-001）                  |
| 優先度   | 高                                     |
| 影響範囲 | FR-006, FR-010, FR-012, FR-013, FR-014 |
| 推定工数 | 中〜大                                 |

**実装対象:**

- `DiffPreview.tsx` - 差分プレビューパネル
- `DiffEditor.tsx` - Monaco Diff Editor統合
- `ApplyControls.tsx` - 適用/却下ボタン
- `FileContextBadge.tsx` - 添付ファイルバッジ
- `FileContextDropZone.tsx` - D&Dドロップゾーン
- `EditCommandInput.tsx` - 編集コマンド入力

**推奨アクション:** 別タスク「workspace-chat-edit UIコンポーネント実装」として作成

---

#### TASK-002: Main Processサービス実装

| 項目     | 内容                            |
| -------- | ------------------------------- |
| 発見元   | Phase 10（ISSUE-002）, Phase 11 |
| 優先度   | 高                              |
| 影響範囲 | IPC通信、ファイルI/O、LLM連携   |
| 推定工数 | 中                              |

**実装対象:**

- `FileService.ts` - ファイル読み書き、言語検出
- `ChatEditService.ts` - プロンプト構築、LLM連携
- `ContextBuilder.ts` - コンテキスト構築
- `chatEditHandlers.ts` - IPCハンドラ
- `chatEditApi.ts` - Preload API

**推奨アクション:** 別タスク「workspace-chat-edit Main Process実装」として作成

---

### 中優先度（将来対応推奨）

#### TASK-003: TypeScriptエラー解消

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| 発見元   | Phase 9（ISSUE-003）               |
| 優先度   | 中                                 |
| 影響範囲 | useFileContext.ts, useDiffApply.ts |
| 推定工数 | 小                                 |

**対応内容:**

AppStore型定義にchatEditSliceを追加

```typescript
// apps/desktop/src/renderer/store/index.ts
interface AppStore extends ChatEditSlice {
  // 他のSlice...
}
```

**推奨アクション:** PR作成時またはUIコンポーネント実装時に対応

---

#### TASK-004: テストカバレッジ向上

| 項目     | 内容                 |
| -------- | -------------------- |
| 発見元   | Phase 7（ISSUE-004） |
| 優先度   | 中                   |
| 影響範囲 | テストカバレッジ     |
| 推定工数 | 小〜中               |

**現状:**

- Line Coverage: 69.23%（目標: 80%）
- Branch Coverage: 89.74%（達成）
- Function Coverage: 95%（達成）

**推奨アクション:** 将来タスクとして追加テスト作成

---

#### TASK-005: アクセシビリティ検証

| 項目     | 内容                  |
| -------- | --------------------- |
| 発見元   | Phase 11（ISSUE-005） |
| 優先度   | 中                    |
| 影響範囲 | WCAG 2.1 AA準拠       |
| 推定工数 | 小                    |

**検証項目:**

- TC-201: キーボードナビゲーション
- TC-202: スクリーンリーダー対応
- TC-203: フォーカス可視性
- TC-204: カラーコントラスト
- TC-205: エラー通知（ARIA live region）

**推奨アクション:** UIコンポーネント実装後に検証

---

### 低優先度（将来タスク）

#### TASK-006: 部分適用機能

| 項目     | 内容                  |
| -------- | --------------------- |
| 発見元   | Phase 10（ISSUE-006） |
| 優先度   | 低                    |
| 影響範囲 | FR-011                |
| 推定工数 | 中                    |

**実装内容:**

差分の一部のみを選択して適用する機能

**推奨アクション:** MVP後の機能拡張として対応

---

## コードベース検索結果

### TODO/FIXME/HACK検索

```bash
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/renderer/features/workspace-chat-edit/
```

**結果:** 該当なし

実装コード内にTODO/FIXME等のコメントは存在しません。

---

## 推奨アクション

### 即時対応（PR作成前）

1. **TASK-003**: TypeScriptエラー解消（AppStore統合）

### 別タスク作成（実施済み）

| タスク名                                 | 対応TASK | 優先度 | タスク指示書                                                                     |
| ---------------------------------------- | -------- | ------ | -------------------------------------------------------------------------------- |
| workspace-chat-edit UIコンポーネント実装 | TASK-001 | 高     | `docs/30-workflows/unassigned-task/task-workspace-chat-edit-ui-components.md` ✅ |
| workspace-chat-edit Main Process実装     | TASK-002 | 高     | `docs/30-workflows/unassigned-task/task-workspace-chat-edit-main-process.md` ✅  |
| workspace-chat-edit テストカバレッジ向上 | TASK-004 | 中     | 将来タスク（タスク指示書作成保留）                                               |
| workspace-chat-edit アクセシビリティ検証 | TASK-005 | 中     | 将来タスク（UIコンポーネント実装後に作成）                                       |
| workspace-chat-edit 部分適用機能         | TASK-006 | 低     | 将来タスク（MVP後に作成）                                                        |

### 将来対応

- テストカバレッジ向上（TASK-004）
- アクセシビリティ検証（TASK-005）
- 部分適用機能（TASK-006）

---

## 結論

Phase 12-3の未タスク検出で6件の未完了タスクを検出しました。

**分類:**

- 高優先度: 2件（UIコンポーネント、Main Processサービス）
- 中優先度: 3件（TypeScriptエラー、カバレッジ、アクセシビリティ）
- 低優先度: 1件（部分適用機能）

**実施済み:**

- ✅ 高優先度タスク（TASK-001, TASK-002）のタスク指示書を作成
- ✅ `docs/30-workflows/unassigned-task/` に配置完了
- ✅ システム仕様書（aiworkflow-requirements）を更新

**推奨:**

- コアロジック（Renderer側）のみでPRを作成
- UIコンポーネント・Main Processは別タスク指示書に従って実装
- TypeScriptエラーはPR作成時に解消

本タスク（workspace-chat-edit）のスコープはコアロジック実装として完結させ、残りの機能は後続タスクで対応することを推奨します。
