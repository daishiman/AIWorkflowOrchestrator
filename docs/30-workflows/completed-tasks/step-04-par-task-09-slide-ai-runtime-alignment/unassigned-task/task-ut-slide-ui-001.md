# Slide Workspace UI 4領域実装 - タスク指示書

## メタ情報

```yaml
issue_number: 1365
```

## メタ情報

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | UT-SLIDE-UI-001                                            |
| タスク名     | Slide Workspace UI 4領域実装                               |
| 分類         | UI実装                                                     |
| 対象機能     | slide-ai-runtime-alignment                                 |
| 優先度       | 高                                                         |
| 見積もり規模 | 中規模                                                     |
| ステータス   | 未実施                                                     |
| 発見元       | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 Phase 11/12 再監査 |
| 発見日       | 2026-03-19                                                 |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

task 09 では SlideWorkspace に runtime/auth-mode alignment 向け 4領域 UI を定義したが、現行画面は empty state、project info、phase panel、manual sync button、error alert までしか持っていない。

### 1.2 問題点・課題

- runtime/auth 状態が画面から読めない
- degraded / guidance 時の terminal fallback CTA がない
- watch status と sync direction が見えない
- Phase 11 screenshot は存在しても設計意図を満たしていない

### 1.3 放置した場合の影響

- slide だけ user-facing runtime UX が他 surface と分断される
- 失敗時の復旧導線が弱い
- task 09 の UI 正本が stale になる

## 2. 何を達成するか（What）

### 2.1 目的

SlideWorkspace に task 09 で定義した 4領域 UI を実装し、runtime/auth-mode と degraded/handoff 導線を user-facing にする。

### 2.2 最終ゴール

- `SlideSyncCard`
- `SlideProgressRow`
- `SlideWatchStatus`
- `SlideGuidanceBlock`

上記 4 領域が設計どおりに表示される。

### 2.3 スコープ

#### 含むもの

- SlideWorkspace の UI 再編
- terminal launcher / CTA / microcopy
- runtime/handoff / degraded 表示
- Phase 11 screenshot の live capture 再取得

#### 含まないもの

- Main IPC runtime 実装そのもの
- unrelated workspace view redesign

### 2.4 成果物

- SlideWorkspace UI 実装
- 画面テスト
- Phase 11 スクリーンショット更新

## 3. どのように実行するか（How）

### 3.1 前提条件

- `UT-SLIDE-IMPL-001` で slide runtime / store / IPC の基盤が接続済みであること

### 3.2 依存タスク

- UT-SLIDE-IMPL-001

### 3.3 必要な知識

- React / Zustand
- runtime badge / guidance UX
- Phase 11 screenshot capture 運用

### 3.4 推奨アプローチ

- view を 4 領域へ分割して責務を明確にする
- CTA は runtime 状態と 1:1 にし、silent fallback を作らない

## 4. 実行手順

### Phase構成

- Phase A: component 分割
- Phase B: runtime/guidance surface 接続
- Phase C: visual verification

### Phase A: component 分割

1. `SlideSyncCard` を追加する。
2. `SlideProgressRow` を追加する。
3. `SlideWatchStatus` を追加する。
4. `SlideGuidanceBlock` を追加する。

### Phase B: runtime/guidance surface 接続

1. store selector から runtime/auth/watch/sync state を取得する。
2. guidance と terminal launcher を handoff / degraded で露出する。
3. microcopy を task 09 正本へ揃える。

### Phase C: visual verification

1. empty / synced / guidance / running / degraded を再撮影する。
2. `validate-phase11-screenshot-coverage` を PASS 化する。
3. task 09 の manual-test-result / discovered-issues を実装後状態へ更新する。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] UI 4領域コンポーネントが存在する
- [ ] runtime/auth/watch/sync state が user-facing に見える
- [ ] degraded / guidance で terminal fallback CTA が表示される

### 品質要件

- [ ] Phase 11 screenshot が live current build で再取得されている
- [ ] visual regression が主要 5状態で確認できる

### ドキュメント要件

- [ ] task 09 workflow の Phase 11/12 成果物が更新されている
- [ ] aiworkflow-requirements の UI 正本が実装済み状態へ同期されている

## 6. 検証方法

### テストケース

- empty
- synced
- guidance
- running
- degraded / guidance

### 検証手順

1. component/unit test を実行する。
2. live build screenshot を 5ケース以上取得する。
3. visual review と validator を通す。

## 7. リスクと対策

| リスク                                                 | 影響度 | 発生確率 | 対策                                                      |
| ------------------------------------------------------ | ------ | -------- | --------------------------------------------------------- |
| Main 実装未完了で UI だけ先行すると stale state になる | 高     | 中       | UT-SLIDE-IMPL-001 完了後に着手する                        |
| guidance copy が他 surface とずれる                    | 中     | 中       | 正本は `ui-ux-feature-components-details.md` に一本化する |
| screenshot が fallback に戻る                          | 中     | 中       | current build preflight を先に確認する                    |

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-details.md` — UI 4領域の正本設計
- `.claude/skills/aiworkflow-requirements/references/arch-state-management-advanced.md` — slideSlice 個別セレクタ設計
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md` — Task09 教訓
- `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/outputs/phase-2/ui-ux-realization.md`

### 参考資料

- `apps/desktop/src/renderer/slide/SlideWorkspace.tsx`
- `apps/desktop/src/renderer/slide/useSlideProject.ts`

## 9. 備考

task 09 の再監査 screenshot は static fallback 由来であり、現状確認には使えるが最終証跡には弱い。UI 実装後は必ず live current build の証跡へ置き換える。

## 10. 苦戦箇所・実装上の注意点（教訓）

### 10.1 degraded / guidance 表示の完全欠如

現行 SlideWorkspace.tsx には degraded / guidance の表示が一切なく、エラー時は単純な赤いアラートボックスのみだった。AI Runtime 未設定時にユーザーが何をすべきか分からない状態だった。

**教訓**: UI コンポーネント設計では、正常系だけでなく degraded（一時的失敗）と guidance（設定不足）の2つの異常系を必ず設計に含めること。ui-ux-realization.md の「回復導線の同居」原則に従い、失敗理由と次アクションを同一ブロックに配置する。

### 10.2 Zustand Store の P31/P48 リスク

useSlideProject.ts が `useSlideProjectStore()` でストア全体を合成取得し、useCallback/useEffect の依存配列に渡していた。P31（無限ループ）リスクが残存。

**教訓**: Zustand セレクタは必ず個別セレクタパターン（`useSyncStatus()`, `useIsWatching()` 等）を使用する。オブジェクトを返す派生セレクタには `useShallow` を適用する（P48 対策）。

### 10.3 SyncStatusIndicator の STATUS_CONFIG 変更影響

SyncStatus 型の `"out-of-sync"` → `"idle"` 変更により、SyncStatusIndicator.tsx の `STATUS_CONFIG: Record<SyncStatus, {...}>` を更新する必要がある。

**教訓**: 型のユニオンメンバー変更は `Record<UnionType, Config>` パターンで網羅性が保証されるため、TypeScript コンパイラが変更漏れを検出してくれる。この安全網を活用すること。
