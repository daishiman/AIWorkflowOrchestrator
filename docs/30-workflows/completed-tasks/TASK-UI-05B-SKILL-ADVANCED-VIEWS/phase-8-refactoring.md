# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目       | 値                                   |
| ---------- | ------------------------------------ |
| Phase      | 8                                    |
| タスクID   | TASK-UI-05B-SKILL-ADVANCED-VIEWS     |
| 機能名     | スキル高度管理ビュー（4ビュー統合）  |
| 作成日     | 2026-03-01                           |
| 状態       | 完了                                 |
| 前Phase    | Phase 7（カバレッジ確認）            |
| 依存成果物 | `outputs/phase-7/coverage-report.md` |

## 目的

Phase 5-7 で実装した4ビュー（SkillChainBuilder, ScheduleManager, DebugPanel, AnalyticsDashboard）のコード品質を、動作を変えずに改善する。4ビュー間の共通パターンを抽出し、保守性・可読性・パフォーマンスを向上させる。

---

## 実行タスク

- 重複排除: 4ビュー共通パターンを抽出して共通化する
- 責務再配置: Atomic Design 層の責務逸脱を是正する
- 状態最適化: Zustand セレクタ粒度とローカル state 境界を最適化する
- IPC統一: エラー処理/ローディング処理の実装パターンを統一する
- 表現統一: マイクロインタラクション値を CSS 変数へ集約する
- 回帰防止: リファクタ後の Green 維持を確認する

### Task 1: コード重複の検出と共通化

#### 1-1. 4ビュー共通 UI パターンの抽出

4ビューに共通する以下のパターンを共通コンポーネントとして抽出する:

| パターン             | 抽出先コンポーネント | 対象ビュー                         |
| -------------------- | -------------------- | ---------------------------------- |
| 空状態表示           | `EmptyState`         | 全4ビュー                          |
| ローディング表示     | `LoadingOverlay`     | 全4ビュー                          |
| エラー表示           | `ErrorBanner`        | 全4ビュー                          |
| 確認ダイアログ       | `ConfirmDialog`      | SkillChainBuilder, ScheduleManager |
| ヘッダー＋アクション | `ViewHeader`         | 全4ビュー                          |

抽出基準:

- 3ビュー以上で同一パターンが使用されている場合は共通コンポーネント化する
- 2ビューのみの場合は Props の差異を評価し、共通化のメリットがある場合のみ抽出する
- 1ビュー固有のパターンは抽出しない

#### 1-2. カスタム Hook の共通化

4ビューの IPC 呼び出しパターンを共通カスタム Hook に統合する:

| Hook 名              | 責務                                            | 対象ビュー |
| -------------------- | ----------------------------------------------- | ---------- |
| `useIPCQuery`        | IPC データ取得（loading/error/data 管理）       | 全4ビュー  |
| `useIPCMutation`     | IPC 更新操作（楽観的更新 + エラーロールバック） | 全4ビュー  |
| `useIPCSubscription` | IPC イベント購読（cleanup 付き）                | DebugPanel |

各 Hook の共通シグネチャ:

```typescript
// useIPCQuery の型定義
function useIPCQuery<T>(
  channel: string,
  params?: unknown,
): {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

// useIPCMutation の型定義
function useIPCMutation<TInput, TOutput>(
  channel: string,
): {
  mutate: (input: TInput) => Promise<TOutput>;
  isLoading: boolean;
  error: string | null;
};
```

### Task 2: コンポーネント責務の見直し

#### 2-1. Atomic Design 層の適切性検証

以下の基準でコンポーネント層を検証する:

| 検証項目                                     | 基準                                                | 不適合時の対応                 |
| -------------------------------------------- | --------------------------------------------------- | ------------------------------ |
| Atom が状態を持っていないか                  | Atom は Props のみで描画する                        | 状態を持つ場合 Molecule に昇格 |
| Molecule が複数の Atom を組み合わせているか  | 単一 Atom のラッパーは不要                          | 不要な Molecule は削除         |
| Organism が IPC 呼び出しを直接行っていないか | IPC は Hook 経由で行い、Organism は Hook を使用する | IPC 呼び出しを Hook に移動     |

#### 2-2. Props 型定義の整理

- 未使用の optional Props を削除する
- `string` 型で定義されている列挙値を union literal 型に変更する
- コールバック Props の命名を `onXxx` パターンに統一する

### Task 3: 状態管理の最適化

#### 3-1. Zustand セレクタの粒度確認

以下の基準で再レンダリング最適化を検証する:

```typescript
// ❌ Store 全体を取得（不要な再レンダリング発生）
const store = useSkillStore();

// ✅ 必要なフィールドのみ取得（個別セレクタ使用）
const chains = useSkillChains();
const isLoading = useSkillChainsLoading();
```

#### 3-2. ローカル状態とグローバル状態の責務分離

| 状態の種類               | 配置先                 | 例                                   |
| ------------------------ | ---------------------- | ------------------------------------ |
| ビュー横断で共有する状態 | Zustand Store（Slice） | 選択中のチェーン、デバッグセッション |
| ビュー内のUI状態         | `useState`             | ダイアログ開閉、フォーム入力値       |
| 一時的な計算結果         | `useMemo`              | フィルタリング結果、ソート結果       |

### Task 4: IPC 呼び出しパターンの統一

#### 4-1. エラーハンドリングパターンの統一

全4ビューで以下の統一パターンを使用する:

```typescript
// 統一エラーハンドリングパターン
type IPCResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ビュー側での使用
const handleSave = async () => {
  const result = await mutate(formData);
  if (!result.success) {
    setError(result.error);
    return;
  }
  // 成功処理
};
```

#### 4-2. ローディング状態管理の統一

| 操作種別   | ローディング表示         | 完了後の処理     |
| ---------- | ------------------------ | ---------------- |
| データ取得 | `LoadingOverlay` 表示    | データ描画       |
| 更新操作   | ボタン内スピナー表示     | 成功トースト表示 |
| 削除操作   | 確認ダイアログ内スピナー | リスト更新       |

### Task 5: マイクロインタラクションの CSS 変数化

ハードコードされたアニメーション値を CSS カスタムプロパティに抽出する:

```css
:root {
  --animation-duration-fast: 150ms;
  --animation-duration-normal: 200ms;
  --animation-duration-slow: 300ms;
  --animation-easing-default: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

対象:

- ホバーエフェクト（StepCard, ScheduleRow, SummaryCard）
- ダイアログ開閉アニメーション（CreateChainDialog, ScheduleDialog, StartDebugDialog）
- トランジション（タブ切り替え、パネル展開）

### Task 6: リファクタリング後のテスト確認

```bash
# 全4ビューのテストを実行し、全テスト Green を確認
cd apps/desktop && pnpm vitest run src/renderer/views/SkillChainBuilder/
cd apps/desktop && pnpm vitest run src/renderer/views/ScheduleManager/
cd apps/desktop && pnpm vitest run src/renderer/views/DebugPanel/
cd apps/desktop && pnpm vitest run src/renderer/views/AnalyticsDashboard/
```

---

## 参照資料

| 資料                       | 用途                                                                              |
| -------------------------- | --------------------------------------------------------------------------------- |
| Phase 1 要件定義書         | リファクタで保持すべき機能要件の基準                                              |
| Phase 2 設計書             | 層責務・型契約の基準                                                              |
| Phase 5 実装サマリー       | 実装済み責務境界の確認                                                            |
| Phase 6 テスト拡充レポート | 回帰防止テストの確認                                                              |
| Phase 7 カバレッジレポート | リファクタリング前の基準値                                                        |
| `02-code-quality.md`       | コーディング規約                                                                  |
| `03-state-management.md`   | Zustand 設計原則                                                                  |
| `06-known-pitfalls.md` P31 | Zustand 個別セレクタ必須                                                          |
| `06-known-pitfalls.md` P47 | CSS 変数ベーステストアサーション                                                  |
| `01-architecture.md`       | Atomic Design 原則                                                                |
| aiworkflow Feature仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   |
| aiworkflow 層設計          | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`         |
| aiworkflow 状態管理        | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      |
| aiworkflow テスト規約      | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` |

---

## 実行手順

1. `grep -rn` で4ビュー間の重複パターンを検出する
2. 共通コンポーネント（EmptyState, LoadingOverlay, ErrorBanner）を抽出する
3. 共通カスタム Hook（useIPCQuery, useIPCMutation）を作成する
4. Atomic Design 層を検証し、不適合コンポーネントを修正する
5. Props 型定義を整理する（未使用削除、union literal 化）
6. Zustand セレクタの粒度を確認し、個別セレクタに修正する
7. IPC エラーハンドリングパターンを統一する
8. CSS カスタムプロパティを定義し、ハードコード値を置換する
9. 全テストを実行し、全テスト Green を確認する
10. リファクタリングレポートを作成する

## 統合テスト連携【必須】

| 連携観点             | 実施内容                                     | 検証先                                    |
| -------------------- | -------------------------------------------- | ----------------------------------------- |
| Phase 1/2 要件・設計 | 仕様上の責務境界を壊していないことを確認する | `outputs/phase-8/refactoring-report.md`   |
| Phase 5 実装         | 公開 API/IPC 契約の後方互換性を維持する      | `outputs/phase-9/quality-report.md`       |
| Phase 6/7 テスト資産 | 既存テストとカバレッジ基準を維持する         | `outputs/phase-9/quality-report.md`       |
| Phase 10 レビュー    | リファクタ理由と影響範囲をレビュー可能にする | `outputs/phase-10/final-review-result.md` |

---

## 成果物

| 成果物                   | パス                                    | 説明                                 |
| ------------------------ | --------------------------------------- | ------------------------------------ |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md` | 変更箇所一覧、共通化内容、テスト結果 |

---

## 完了条件

- [ ] 全テストが Green のまま維持されている
- [ ] 3ビュー以上で重複するパターンが共通コンポーネントに抽出されている
- [ ] IPC 呼び出しが共通カスタム Hook（useIPCQuery, useIPCMutation）経由で統一されている
- [ ] Atomic Design 層が検証基準を満たしている（Atom は状態不保持、Organism は IPC 直接呼び出し禁止）
- [ ] Zustand セレクタが個別セレクタパターンで統一されている（P31 対策）
- [ ] CSS アニメーション値がカスタムプロパティで定義されている
- [ ] Props 型定義に未使用の optional Props が残っていない
- [ ] エラーハンドリングが `IPCResult<T>` パターンで統一されている
- [ ] リファクタリングレポート（`outputs/phase-8/refactoring-report.md`）が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 9: 品質保証
