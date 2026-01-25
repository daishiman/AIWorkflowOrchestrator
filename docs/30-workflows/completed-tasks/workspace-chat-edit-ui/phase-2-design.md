# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 2                             |
| Phase名    | 設計                          |
| 前提Phase  | Phase 1（要件定義）           |
| 後続Phase  | Phase 3（設計レビューゲート） |
| ステータス | 未実施                        |
| 作成日     | 2026-01-24                    |
| 機能名     | workspace-chat-edit-ui        |

---

## 目的

Phase 1で定義した要件に基づき、6種類のUIコンポーネントの詳細設計を行う。

## 背景

要件定義が完了し、コンポーネント設計に進む段階。
既存のHooks（useFileContext, useDiffApply）との統合を考慮した設計が必要。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コンポーネント設計

**目的**: 各コンポーネントのProps、内部状態、レンダリング構造を設計する

**実行手順**:

1. 各コンポーネントのPropsインターフェースを詳細定義
2. 内部状態（useState）の設計
3. コンポーネント階層構造を図示
4. スタイリング方針（Tailwind CSS）を決定

**期待される成果物**:

- `outputs/phase-2/component-design.md`

**FileContextBadge設計例**:

```typescript
interface FileContextBadgeProps {
  context: FileContext;
  onRemove?: () => void;
  showTooltip?: boolean;
  className?: string;
}

// 内部構造
// <div className="badge-container">
//   <span className="file-icon">{icon}</span>
//   <span className="file-name">{context.fileName}</span>
//   <button className="remove-button" aria-label={`${context.fileName}を削除`}>
//     <XIcon />
//   </button>
// </div>
```

---

### タスク2: 状態管理設計

**目的**: chatEditSliceとの統合方法を設計する

**実行手順**:

1. 各コンポーネントが参照するSlice状態を特定
2. 各コンポーネントが呼び出すアクションを特定
3. 状態更新フローを図示
4. 楽観的更新が必要な箇所を特定

**期待される成果物**:

- `outputs/phase-2/state-management-design.md`

**状態マッピング例**:
| コンポーネント | 参照する状態 | 呼び出すアクション |
| -------------- | ------------ | ------------------ |
| FileContextBadge | fileContexts | removeFileContext |
| ApplyControls | isLoading, currentResult | approveResult, rejectResult |
| FileContextDropZone | isDragging, fileContexts | setDragging, addFileContext |
| DiffPreview | currentResult, isDiffPreviewOpen | closeDiffPreview |
| DiffEditor | なし（Props経由） | なし |
| EditCommandInput | なし（ローカル状態） | onSubmit（Props経由） |

---

### タスク3: アクセシビリティ設計

**目的**: WCAG 2.1 AA準拠のアクセシビリティ設計を行う

**実行手順**:

1. 各コンポーネントのaria属性を設計
2. キーボード操作のマッピングを定義
3. フォーカス管理方針を決定
4. スクリーンリーダー対応を設計

**期待される成果物**:

- `outputs/phase-2/accessibility-design.md`

**キーボード操作例**:
| コンポーネント | キー | アクション |
| -------------- | ---- | ---------- |
| FileContextBadge | Delete/Backspace | ファイル削除 |
| ApplyControls | Enter | 適用実行 |
| ApplyControls | Escape | 却下実行 |
| FileContextDropZone | Space/Enter | ファイル選択ダイアログ |
| DiffPreview | Escape | プレビューを閉じる |
| EditCommandInput | Enter | コマンド送信 |

---

### タスク4: Monaco Diff Editor統合設計

**目的**: DiffEditorコンポーネントのMonaco Editor統合方法を設計する

**実行手順**:

1. @monaco-editor/reactの使用方法を確認
2. DiffEditorのオプション設定を決定
3. 言語別シンタックスハイライト設定を定義
4. レスポンシブ対応方針を決定

**期待される成果物**:

- `outputs/phase-2/monaco-integration-design.md`

---

## 参照資料

| 参照資料               | パス                                                                         | 内容                   |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| UI/UXコンポーネント    | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | コンポーネント設計原則 |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Zustand Sliceパターン  |
| Phase 1成果物          | `outputs/phase-1/`                                                           | 要件定義ドキュメント   |

---

## 成果物

| 成果物                 | パス                                           | 内容                      |
| ---------------------- | ---------------------------------------------- | ------------------------- |
| コンポーネント設計書   | `outputs/phase-2/component-design.md`          | Props、構造、スタイリング |
| 状態管理設計書         | `outputs/phase-2/state-management-design.md`   | Slice連携設計             |
| アクセシビリティ設計書 | `outputs/phase-2/accessibility-design.md`      | ARIA、キーボード操作      |
| Monaco統合設計書       | `outputs/phase-2/monaco-integration-design.md` | Diff Editor設計           |

---

## 統合テスト連携（Phase 1〜11は必須）

コンポーネント間統合ポイントを設計に反映する。

具体的なアクション:

- [ ] FileContextDropZone → useFileContext.addFileContext のデータフロー設計
- [ ] ApplyControls → useDiffApply.applyResult/rejectResult のデータフロー設計
- [ ] DiffPreview → DiffEditor → ApplyControls のコンポーネント連携設計

---

## 完了条件

- [ ] 6種類のコンポーネントのProps設計が完了している
- [ ] 状態管理（chatEditSlice連携）設計が完了している
- [ ] アクセシビリティ設計（WCAG 2.1 AA）が完了している
- [ ] Monaco Diff Editor統合設計が完了している
- [ ] コンポーネント階層図が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/workspace-chat-edit-ui/phase-3-design-review.md`
