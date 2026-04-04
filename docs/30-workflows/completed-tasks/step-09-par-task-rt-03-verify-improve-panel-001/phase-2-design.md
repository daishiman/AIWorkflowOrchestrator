# Phase 2: 設計

## メタ情報

| 項目      | 内容                    |
| --------- | ----------------------- |
| Phase     | 2                       |
| 名称      | 設計                    |
| 前提Phase | Phase 1（要件定義）     |
| 次Phase   | Phase 3（設計レビュー） |
| 作成日    | 2026-04-03              |

## 目的

Phase 1 で定義した要件を基に、VerifyResultDetailPanel / ImproveResultDetailPanel のコンポーネント設計と SkillLifecyclePanel 統合設計を行う。concern 数は 2（Verify パネル + Improve パネル）のため、単一設計書内でセクション分割する。

## 実行タスク

### Task 2-1: コンポーネント設計 — VerifyResultDetailPanel

#### ファイル構成

| ファイル                                                                                | 種別   | 操作     |
| --------------------------------------------------------------------------------------- | ------ | -------- |
| `apps/desktop/src/renderer/components/skill/VerifyResultDetailPanel.tsx`                | コード | 新規作成 |
| `apps/desktop/src/renderer/components/skill/__tests__/VerifyResultDetailPanel.test.tsx` | テスト | 新規作成 |
| `apps/desktop/src/renderer/components/skill/result-panel-parts.tsx`                     | コード | 修正     |

#### Props インターフェース

```typescript
export interface VerifyResultDetailPanelProps {
  verifyDetail: RuntimeSkillCreatorVerifyDetail | null;
  error?: PanelError | null;
  isLoading?: boolean;
  onRetry?: () => void;
  onReverify?: () => void;
}
```

#### コンポーネント構造（Topology）

```
VerifyResultDetailPanel (memo)
├── Loading Skeleton        — isLoading === true 時
├── ErrorBanner             — verifyDetail === null && error 時
├── null                    — verifyDetail === null 時
└── Detail View
    ├── Header
    │   ├── "Verify 結果" ラベル
    │   └── StatusBadge (status: pass/fail/pending, label: 合格/不合格/検証中)
    ├── Message Section      — message がある場合
    ├── Next Action Badge    — nextAction がある場合
    ├── Phase Metadata       — currentPhase / evidenceCount
    ├── Checks Section (Layer別グループ)
    │   ├── Layer 1 グループ
    │   │   └── CheckItem × N (severity icon + summary + evidenceSummary)
    │   ├── Layer 2 グループ
    │   ├── Layer 3 グループ
    │   └── Layer 4 グループ
    ├── Route Metadata       — route.type, route.permissionMode / launcher, route.summary
    ├── Provenance Metadata  — resolvedSkillCreatorRoot / manifestPath / resourceDescriptorHash / manifestCacheKey
    ├── Governance Notes     — 折りたたみ
    │   ├── delegatedGovernanceNote
    │   └── delegatedSessionNote
    ├── Reverify Button      — reverifyEligible === true 時のみ有効 / disabledReason 表示
    └── DetailFooter (Plan ID)
```

#### 内部サブコンポーネント

| コンポーネント      | 責務                                       | export               |
| ------------------- | ------------------------------------------ | -------------------- |
| `CheckGroupByLayer` | Layer 別にチェック項目をグループ化して表示 | なし（ファイル内部） |
| `CheckItem`         | 個別チェック項目（severity icon + 内容）   | なし（ファイル内部） |
| `SeverityIcon`      | severity に応じたアイコン表示              | なし（ファイル内部） |
| `VerifyStatusBadge` | `StatusBadge` の label override を適用     | なし（ファイル内部） |

#### Severity アイコンマッピング

| severity | アイコン | 色                         |
| -------- | -------- | -------------------------- |
| info     | ✓        | `--text-secondary`         |
| warning  | ⚠        | `--status-warning` (amber) |
| error    | ✗        | `--status-error`           |

#### Layer 表示ラベル

| layer  | 表示ラベル                         |
| ------ | ---------------------------------- |
| layer1 | Layer 1 — 必須ファイル構造         |
| layer2 | Layer 2 — SKILL.md セクション      |
| layer3 | Layer 3 — スキーマ・コンテンツ品質 |
| layer4 | Layer 4 — References整合性         |

### Task 2-2: コンポーネント設計 — ImproveResultDetailPanel

#### ファイル構成

| ファイル                                                                                 | 種別   | 操作     |
| ---------------------------------------------------------------------------------------- | ------ | -------- |
| `apps/desktop/src/renderer/components/skill/ImproveResultDetailPanel.tsx`                | コード | 新規作成 |
| `apps/desktop/src/renderer/components/skill/__tests__/ImproveResultDetailPanel.test.tsx` | テスト | 新規作成 |

#### Props インターフェース

```typescript
export interface ImproveResultDetailPanelProps {
  improveResult: RuntimeSkillCreatorImproveResult | null;
  error?: PanelError | null;
  isLoading?: boolean;
  onRetry?: () => void;
}
```

#### コンポーネント構造（Topology）

```
ImproveResultDetailPanel (memo)
├── Loading Skeleton        — isLoading === true 時
├── ErrorBanner             — improveResult === null && error 時
├── null                    — improveResult === null 時
└── Detail View
    ├── Header
    │   ├── "Improve 結果" ラベル
    │   └── 提案数バッジ (suggestions.length)
    ├── Suggestions Section
    │   └── SuggestionCard × N
    │       ├── Section ヘッダー (suggestion.section)
    │       ├── Before ブロック (赤系背景)
    │       ├── After ブロック (緑系背景)
    │       └── Reason テキスト
    ├── Empty State       — suggestions.length === 0 時
    ├── Revised Spec Section — revisedSpec がある場合（折りたたみ）
    │   └── <pre><code> ブロック
    └── DetailFooter (Improve ID)
```

#### 内部サブコンポーネント

| コンポーネント   | 責務                     | export               |
| ---------------- | ------------------------ | -------------------- |
| `SuggestionCard` | 個別改善提案のカード表示 | なし（ファイル内部） |

#### Diff 風カラーリング

| 区分   | 背景色                          | テキスト色                     |
| ------ | ------------------------------- | ------------------------------ |
| Before | `bg-[var(--status-error)]/10`   | `text-[var(--status-error)]`   |
| After  | `bg-[var(--status-success)]/10` | `text-[var(--status-success)]` |

**注意**: プロジェクトは CSS 変数ベース（`var(--*)` ）を使用しているため、実装では既存パターンに合わせて design token を直接参照する。

### Task 2-3: SkillLifecyclePanel 統合設計

#### 統合対象箇所

`SkillLifecyclePanel.tsx` の JSX レンダリング部分に条件分岐を追加する。

#### State 管理

| state 名               | 型                                         | 所有者              | 用途               |
| ---------------------- | ------------------------------------------ | ------------------- | ------------------ |
| `verifyDetail`         | `RuntimeSkillCreatorVerifyDetail \| null`  | SkillLifecyclePanel | verify 結果の保持  |
| `runtimeImproveResult` | `RuntimeSkillCreatorImproveResult \| null` | SkillLifecyclePanel | improve 結果の保持 |

**既存の state パターン確認**: `verifyDetail` / `runtimeImproveResult` も `rawPlanDetail` / `rawExecuteDetail` と同じく local state で保持する前提を踏まえる。

#### 条件レンダリング追加

```tsx
{
  verifyDetail && (
    <VerifyResultDetailPanel
      verifyDetail={verifyDetail}
      onReverify={handleReverify}
    />
  );
}

{
  runtimeImproveResult && (
    <ImproveResultDetailPanel improveResult={runtimeImproveResult} />
  );
}
```

#### ファイル変更一覧（Phase 5 実装計画）

| ファイル                            | 操作     | 変更内容                             |
| ----------------------------------- | -------- | ------------------------------------ |
| `VerifyResultDetailPanel.tsx`       | 新規作成 | Verify 結果表示コンポーネント        |
| `ImproveResultDetailPanel.tsx`      | 新規作成 | Improve 結果表示コンポーネント       |
| `VerifyResultDetailPanel.test.tsx`  | 新規作成 | Verify パネルテスト                  |
| `ImproveResultDetailPanel.test.tsx` | 新規作成 | Improve パネルテスト                 |
| `SkillLifecyclePanel.tsx`           | 修正     | verify / improve 条件分岐追加        |
| `result-panel-parts.tsx`            | 修正     | StatusBadge に label override を追加 |

### Task 2-4: result-panel-parts.tsx 拡張性検証

| 共有部品           | Verify で使用       | Improve で使用 | 拡張必要            |
| ------------------ | ------------------- | -------------- | ------------------- |
| PANEL_CARD_CLASSES | ✅                  | ✅             | なし                |
| SectionHeader      | ✅                  | ✅             | なし                |
| TagList            | ✅ (nextAction)     | なし           | なし                |
| StatusBadge        | ✅ (label override) | なし           | label override 必要 |
| DetailFooter       | ✅ (planId)         | ✅ (improveId) | なし                |

**結論**: `StatusBadge` に `label` の任意プロップを追加すれば、verify status の語彙差を吸収しつつ shared component の再利用を維持できる。新規の専用 badge は不要。

### Task 2-5: IPC 非関与の確認

本タスクのスコープは UI コンポーネントの表示のみ。IPC 通信は以下の既存実装で完結している:

| IPC メソッド                 | 戻り値型                                  | 本タスクでの扱い   |
| ---------------------------- | ----------------------------------------- | ------------------ |
| `getVerifyDetail()`          | `RuntimeSkillCreatorVerifyDetailResponse` | 結果を受け取るのみ |
| `reverifyWorkflow()`         | `RuntimeSkillCreatorReverifyResponse`     | コールバック経由   |
| `improveSkillWithFeedback()` | `RuntimeSkillCreatorImproveResponse`      | 結果を受け取るのみ |

IPC ハンドラの変更は不要。4層整合性チェック対象外。

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                                                                | 内容                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| SkillLifecyclePanel 設計 | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md`      | ルーティング・レンダリング基盤 |
| 状態管理リファレンス     | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-permissions-import-lifecycle.md` | detail panel state 管理        |

## 成果物

| 成果物         | 配置先                            |
| -------------- | --------------------------------- |
| Phase 2 設計書 | `phase-2-design.md`（本ファイル） |

## 完了条件

- [ ] VerifyResultDetailPanel のコンポーネント構造・Props・内部サブコンポーネントが設計されている
- [ ] ImproveResultDetailPanel のコンポーネント構造・Props・内部サブコンポーネントが設計されている
- [ ] SkillLifecyclePanel の統合箇所・state 管理が設計されている
- [ ] result-panel-parts.tsx の拡張性が検証され、StatusBadge label override の最小拡張で済むと判定されている
- [ ] IPC 非関与が確認されている
- [ ] 新規作成・修正ファイルパス一覧が記載されている

## タスク100%実行確認【必須】

- [x] Task 2-1: VerifyResultDetailPanel コンポーネント設計 — 完了
- [x] Task 2-2: ImproveResultDetailPanel コンポーネント設計 — 完了
- [x] Task 2-3: SkillLifecyclePanel 統合設計 — 完了
- [x] Task 2-4: result-panel-parts.tsx 拡張性検証 — 完了
- [x] Task 2-5: IPC 非関与の確認 — 完了

## 次Phase

Phase 3（設計レビュー）へ進む。本設計書の PASS / MINOR / MAJOR を判定する。
