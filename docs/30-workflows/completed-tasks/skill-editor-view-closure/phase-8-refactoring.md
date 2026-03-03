# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目       | 値                                   |
| ---------- | ------------------------------------ |
| Phase      | 8                                    |
| タスクID   | UT-UI-05A-IMPLEMENTATION-CLOSURE-001 |
| 機能名     | SkillEditorView 実装残課題収束       |
| 作成日     | 2026-03-03                           |
| 前Phase    | Phase 7（カバレッジ確認）            |
| 依存成果物 | `outputs/phase-7/coverage-report.md` |

## 目的

Phase 5-7 で実装した7課題（FileTree キーボードナビゲーション・モバイルドロワー・Cmd/Ctrl+S 保存ショートカット・保存成功 Toast・読み取り専用表示強化・ナビゲーション導線配線・マイクロアニメーション）のコード品質を、動作を変えずに改善する。

hooks 間の共通ロジック抽出・スタイルの共通化・コンポーネント責務の明確化・命名の統一を行い、保守性・可読性・パフォーマンスを向上させる。

---

## 実行タスク

- 重複排除: hooks 間の共通ロジック（キーボードイベント処理、状態管理パターン）を抽出して共通化する
- 責務再配置: コンポーネント・hooks・UI 層の責務逸脱を是正する
- 命名統一: 7課題実装で生じたコンポーネント間の命名不一致を解消する
- スタイル共通化: アニメーション値・ブレークポイント値を CSS 変数へ集約する
- 状態最適化: Zustand セレクタ粒度の適正化と不要な再レンダリング防止を確認する
- 回帰防止: リファクタリング後の全テスト Green 維持を確認する

### Task 1: hooks 間の共通ロジック抽出

#### 1-1. キーボードイベント処理の共通化

UT-UI-05A-001（FileTree キーボードナビゲーション）と UT-UI-05A-003（Cmd/Ctrl+S 保存ショートカット）で追加したキーボードイベント処理を検証し、重複があれば共通化する。

| 確認項目                                                      | 対応方針                                                                 |
| ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `useEffect` 内のキーボードリスナー登録が重複していないか      | 2 箇所以上で同一パターンがある場合 `useKeyboardShortcut` Hook に集約する |
| `e.metaKey \|\| e.ctrlKey` の判定ロジックが複数箇所にある     | 共通ユーティリティ関数 `isPlatformSaveKey(e)` として抽出する             |
| cleanup 関数（`removeEventListener`）が確実に実行されているか | useEffect の戻り値で cleanup を返していることを確認する                  |

#### 1-2. モーダル/ドロワー制御パターンの統一

UT-UI-05A-002（モバイルドロワー）と既存の UnsavedChangesDialog で使用している開閉制御パターンを確認し、統一する。

```typescript
// 統一開閉制御パターン
// ❌ バラバラな実装
const [isDrawerOpen, setIsDrawerOpen] = useState(false);
const [showDialog, setShowDialog] = useState(false);

// ✅ 命名統一（is プレフィックス + Open/Closed）
const [isDrawerOpen, setIsDrawerOpen] = useState(false);
const [isDialogOpen, setIsDialogOpen] = useState(false);
```

#### 1-3. Toast 通知パターンの確認

UT-UI-05A-004（保存成功 Toast）の実装で追加された Toast 表示ロジックが、既存のエラー通知パターンと整合しているか確認する。

| 確認項目                                                          | 合格基準                                                      |
| ----------------------------------------------------------------- | ------------------------------------------------------------- |
| Toast の表示・非表示ロジックが一箇所に集約されている              | `useToast` Hook または Toast コンテキスト経由で統一されている |
| 成功・エラー・警告の各 Toast が同一インターフェースを使用している | `showToast({ type, message })` のような統一 API               |
| Toast の自動消去タイムアウトが定数化されている                    | `TOAST_DURATION_MS` 等の定数で管理                            |

### Task 2: コンポーネント責務の見直し

#### 2-1. SkillEditorView の責務確認

`apps/desktop/src/renderer/views/SkillEditorView/index.tsx` の責務が肥大化していないか確認する。

| 確認項目                                                                 | 対応方針                                                                |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Cmd/Ctrl+S ショートカットロジックが index.tsx に直接記述されている       | `useSkillEditor` Hook に移動する                                        |
| ナビゲーション導線配線（UT-UI-05A-006）の処理が index.tsx に集中している | ルーティング処理を `useNavigationWiring` または既存 hook に分離する     |
| モバイルドロワーの開閉状態が index.tsx にある                            | `useDrawer` Hook または `useState` で管理（ローカル UI 状態として適切） |

#### 2-2. 読み取り専用表示の責務確認（UT-UI-05A-005）

読み取り専用モードの制御ロジックが適切な層に配置されているか確認する。

```typescript
// ❌ 複数コンポーネントで readOnly prop を個別に渡す
<EditorPanel readOnly={isReadOnly} />
<EditorToolBar readOnly={isReadOnly} />

// ✅ Hook で一元管理し、関連コンポーネントに伝搬
const { isReadOnly, readOnlyReason } = useReadOnlyMode();
```

#### 2-3. Atomic Design 層の適切性検証

| 検証項目                                      | 基準                                                                    | 不適合時の対応                 |
| --------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------ |
| Atom が状態を保持していないか                 | Atom は Props のみで描画する                                            | 状態を持つ場合 Molecule に昇格 |
| FileTreeNode が再帰的なイベント処理を持つか   | キーボードナビゲーションのイベントハンドラは親 FileTreePanel が管理する | 責務を親へ移動                 |
| EditorToolBar が IPC を直接呼び出していないか | IPC は useSkillEditor Hook 経由で実行する                               | Hook に移動                    |

### Task 3: 命名の統一

#### 3-1. Props 型定義の整理

```bash
# boolean 変数名の非準拠箇所を検出
grep -rn "readonly\b\|disabled\b\|loading\b\|saving\b" \
  apps/desktop/src/renderer/views/SkillEditorView/ \
  --include="*.tsx" --include="*.ts"
```

| 修正前     | 修正後       | 対象                   |
| ---------- | ------------ | ---------------------- |
| `readonly` | `isReadOnly` | EditorPanel Props      |
| `loading`  | `isLoading`  | 各コンポーネント Props |
| `saving`   | `isSaving`   | EditorToolBar Props    |

#### 3-2. コールバック Props の命名統一

全コンポーネントの Props でコールバックが `onXxx` パターンに統一されているか確認する。

```bash
# on プレフィックス不使用のコールバックを検出
grep -rn "handle\w*:" \
  apps/desktop/src/renderer/views/SkillEditorView/ \
  --include="*.tsx" --include="*.ts"
```

### Task 4: スタイル・アニメーションの共通化

#### 4-1. マイクロアニメーション値の CSS 変数化（UT-UI-05A-007）

UT-UI-05A-007 で追加したアニメーション値がハードコードされている場合、CSS カスタムプロパティに抽出する。

```css
/* 既存のデザイントークンに追加 */
:root {
  --animation-duration-fast: 150ms;
  --animation-duration-normal: 200ms;
  --animation-duration-slow: 300ms;
  --animation-easing-default: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

対象:

- FileTreeNode のホバーエフェクト（UT-UI-05A-001）
- モバイルドロワーのスライドインアニメーション（UT-UI-05A-002）
- Toast のフェードイン/アウト（UT-UI-05A-004）
- 読み取り専用バナーのトランジション（UT-UI-05A-005）

#### 4-2. ブレークポイントの一貫性確認

モバイルドロワー（UT-UI-05A-002）で使用しているブレークポイント値が、プロジェクト既存の Tailwind ブレークポイントと一致していることを確認する。

```bash
# ハードコードされたピクセル値を検出
grep -rn "768px\|1024px\|640px" \
  apps/desktop/src/renderer/views/SkillEditorView/ \
  --include="*.tsx" --include="*.ts"
```

### Task 5: 状態管理の最適化

#### 5-1. Zustand セレクタの粒度確認

P31 対策として、Zustand Store を一括取得していないか確認する。

```typescript
// ❌ Store 全体を取得（不要な再レンダリング発生）
const store = useSkillEditorStore();

// ✅ 必要なフィールドのみ取得（個別セレクタ使用）
const selectedFile = useSelectedFile();
const isEditorDirty = useIsEditorDirty();
```

#### 5-2. useCallback / useMemo の適切性確認

キーボードショートカットハンドラ（UT-UI-05A-003）と FileTree のキーボードナビゲーションハンドラ（UT-UI-05A-001）に `useCallback` が適用されているか確認する。

### Task 6: リファクタリング後のテスト確認

```bash
# SkillEditorView 全テスト実行
cd apps/desktop && pnpm vitest run src/renderer/views/SkillEditorView/
```

- 全テストが PASS することを確認する
- テスト数が Phase 7 完了時と同一であることを確認する
- テストが FAIL した場合、リファクタリングによる非互換を修正する（テスト側ではなく実装側を修正する）

---

## 参照資料

| 資料                       | 用途                                                                              |
| -------------------------- | --------------------------------------------------------------------------------- |
| Phase 1 要件定義書         | リファクタで保持すべき機能要件の基準                                              |
| Phase 2 設計書             | 層責務・型契約の基準                                                              |
| Phase 5 実装サマリー       | 実装済み責務境界の確認                                                            |
| Phase 6 テスト拡充結果     | リファクタ後も保持すべきテスト観点の確認                                          |
| Phase 7 カバレッジレポート | リファクタリング前の基準値                                                        |
| `01-architecture.md`       | Atomic Design 原則                                                                |
| `02-code-quality.md`       | コーディング規約                                                                  |
| `03-state-management.md`   | Zustand 設計原則                                                                  |
| `06-known-pitfalls.md` P31 | Zustand 個別セレクタ必須                                                          |
| `06-known-pitfalls.md` P39 | happy-dom userEvent 非互換                                                        |
| `06-known-pitfalls.md` P47 | CSS 変数ベーステストアサーション                                                  |
| aiworkflow Feature仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   |
| aiworkflow 層設計          | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`         |
| aiworkflow 状態管理        | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      |
| aiworkflow テスト規約      | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` |

---

## 実行手順

1. `grep -rn` で SkillEditorView 内の重複パターン（キーボードイベント、Toast、読み取り専用）を検出する
2. hooks 間で重複するキーボードイベント処理を共通ユーティリティに抽出する
3. Toast 通知パターンを統一し、`useToast` Hook を整理する
4. コンポーネント責務を検証し、IPC 呼び出しが Hook 経由になっていることを確認する
5. boolean Props 名を `is`/`has`/`can`/`should` プレフィックスに統一する
6. コールバック Props 名を `onXxx` パターンに統一する
7. アニメーション値を CSS カスタムプロパティに集約する
8. Zustand セレクタの粒度を確認し、個別セレクタパターンに修正する
9. 全テストを実行し、全テスト Green を確認する
10. リファクタリングログを作成する

## 統合テスト連携【必須】

| 連携観点             | 実施内容                                     | 検証先                                    |
| -------------------- | -------------------------------------------- | ----------------------------------------- |
| Phase 1/2 要件・設計 | 仕様上の責務境界を壊していないことを確認する | `outputs/phase-8/refactoring-log.md`      |
| Phase 5 実装         | 公開 API/IPC 契約の後方互換性を維持する      | `outputs/phase-9/quality-report.md`       |
| Phase 6/7 テスト資産 | 既存テストとカバレッジ基準を維持する         | `outputs/phase-9/quality-report.md`       |
| Phase 10 レビュー    | リファクタ理由と影響範囲をレビュー可能にする | `outputs/phase-10/final-review-result.md` |

---

## 成果物

| 成果物               | パス                                 | 説明                                 |
| -------------------- | ------------------------------------ | ------------------------------------ |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md` | 変更箇所一覧、共通化内容、テスト結果 |

---

## 完了条件

- [ ] 全テストが Green のまま維持されている
- [ ] キーボードイベント処理の重複が排除されている（3課題で共通ユーティリティを使用）
- [ ] Toast 通知パターンが統一されている
- [ ] boolean Props 名が `is`/`has`/`can`/`should` プレフィックスに統一されている
- [ ] コールバック Props 名が `onXxx` パターンに統一されている
- [ ] アニメーション値が CSS カスタムプロパティで定義されている
- [ ] Zustand セレクタが個別セレクタパターンで統一されている（P31 対策）
- [ ] 未使用の import が 0 箇所
- [ ] リファクタリングログ（`outputs/phase-8/refactoring-log.md`）が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 9: 品質保証
