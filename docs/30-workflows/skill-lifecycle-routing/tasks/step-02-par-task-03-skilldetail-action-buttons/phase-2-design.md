# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 2                                       |
| Phase名    | 設計                                    |
| タスクID   | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 |
| 前提Phase  | Phase 1（要件定義）                     |
| 後続Phase  | Phase 3（設計レビュー）                 |
| ステータス | not_started                             |
| 作成日     | 2026-03-17                              |
| 機能名     | skilldetail-action-buttons              |

## 目的

SkillDetailPanel への編集・分析ボタン追加の実装設計を確定する。Props 設計・コンポーネント構造変更・遷移フロー・レスポンシブ対応を具体化する。

## 実行タスク

- Props 設計: `SkillDetailPanelProps` に `onEdit` / `onAnalyze` を追加する設計を確定する
- コンポーネント設計: `PanelContent` 内のアクションボタン配置レイアウトを設計する
- 遷移フロー設計: `useSkillCenter` に `handleEditSkill` / `handleAnalyzeSkill` を追加し、navigationSlice API と接続する経路を設計する
- SkillCenterView 接続設計: SkillCenterView から SkillDetailPanel への prop バインディングを設計する
- レスポンシブ対応設計: デスクトップ（450px スライドイン）とモバイル（ボトムシート）の両レイアウトでボタンが表示される設計を確定する
- テストケース設計: Phase 4 で作成するテストの観点を先行定義する

## 設計方針

- `isImported` prop が `true` の場合のみ編集・分析ボタンを表示する（AC-5 準拠）
- `PanelContent` にボタンを追加する際は、danger zone（削除ボタン）の上部に配置する
- ボタンは横並び 2 列（gap-3）で配置し、8px Grid に準拠する（Apple HIG 準拠・AC-7）
- `useSkillCenter` のハンドラは `handleCloseDetail` を内部で呼び出してパネルを閉じてから遷移する
- `setCurrentSkillName` は `skill-editor` 遷移時のみ使用する（分析遷移時は skillName を URL パラメータで渡すか、別スライスで管理）

## コンポーネント設計

### Props 拡張（SkillDetailPanelProps）

```typescript
export interface SkillDetailPanelProps {
  skillName: string | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (skillName: string) => void;
  isImported: boolean;
  skill?: SkillMetadata | ImportedSkill;
  /** 編集ボタンクリック時のハンドラ（インポート済みスキルのみ有効） */
  onEdit?: (skillName: string) => void;
  /** 分析ボタンクリック時のハンドラ（インポート済みスキルのみ有効） */
  onAnalyze?: (skillName: string) => void;
}
```

### PanelContent 内部構造変更

```
PanelContent
├── ヘッダー（既存）
└── ボディ（既存）
    ├── 説明（既存）
    ├── 権限バッジ（既存）
    ├── サブリソース一覧（既存）
    ├── その他のファイル（既存）
    ├── [NEW] アクションボタンゾーン（isImported === true の場合のみ表示）
    │   ├── [NEW] 「エディタで開く」ボタン (Button variant="secondary")
    │   └── [NEW] 「分析する」ボタン (Button variant="secondary")
    └── 危険な操作ゾーン（isImported === true の場合のみ・既存）
```

### アクションボタンゾーンのマークアップ設計

```tsx
{
  isImported && onEdit && onAnalyze && (
    <div className="flex gap-3" data-testid="action-buttons-zone">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => skillName && onEdit(skillName)}
        leftIcon="edit-2"
        data-testid="edit-skill-button"
        className="flex-1"
      >
        エディタで開く
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => skillName && onAnalyze(skillName)}
        leftIcon="bar-chart-2"
        data-testid="analyze-skill-button"
        className="flex-1"
      >
        分析する
      </Button>
    </div>
  );
}
```

## 遷移フロー設計

### useSkillCenter への追加ハンドラ

```typescript
// handleEditSkill: スキル編集画面へ遷移
const handleEditSkill = useCallback(
  (skillName: string) => {
    setCurrentSkillName(skillName); // navigationSlice
    setCurrentView("skill-editor"); // navigationSlice
    handleCloseDetail(); // パネルを閉じる
  },
  [setCurrentSkillName, setCurrentView, handleCloseDetail],
);

// handleAnalyzeSkill: スキル分析画面へ遷移
// NOTE: skillAnalysis ViewType は Task01 完了後に利用可能になる
const handleAnalyzeSkill = useCallback(
  (skillName: string) => {
    setCurrentSkillName(skillName); // 分析画面でも currentSkillName を利用
    setCurrentView("skillAnalysis"); // Task01 で追加される ViewType
    handleCloseDetail();
  },
  [setCurrentSkillName, setCurrentView, handleCloseDetail],
);
```

### SkillCenterView での prop バインディング

```tsx
<SkillDetailPanel
  skillName={detailSkillName}
  isOpen={isDetailOpen}
  onClose={handleCloseDetail}
  onDelete={handleRequestDelete}
  isImported={isDetailImported}
  skill={detailSkill}
  onEdit={handleEditSkill} // 追加
  onAnalyze={handleAnalyzeSkill} // 追加
/>
```

## レスポンシブ対応設計

- デスクトップ（md 以上）: `panelStyles.panel.desktop` 内の `PanelContent` にアクションボタンゾーンが含まれる
- モバイル（md 未満）: `panelStyles.panel.mobile` 内の `PanelContent` にも同じアクションボタンゾーンが含まれる
- `PanelContent` は両レイアウトで共有されているため、追加は `PanelContent` 内で一箇所のみで対応できる（AC-6 を自動的に満たす）

## テストケース設計（Phase 4 先行定義）

| TC番号 | 観点                          | 期待動作                                                                                   |
| ------ | ----------------------------- | ------------------------------------------------------------------------------------------ |
| TC-01  | isImported=true 時表示        | 「エディタで開く」「分析する」ボタンが表示される                                           |
| TC-02  | isImported=false 時非表示     | アクションボタンゾーンが DOM に存在しない                                                  |
| TC-03  | 編集ボタンクリック            | onEdit(skillName) が呼び出される                                                           |
| TC-04  | 分析ボタンクリック            | onAnalyze(skillName) が呼び出される                                                        |
| TC-05  | Escape キー                   | onClose が呼び出され、アクションボタンの動作は変わらない                                   |
| TC-06  | handleEditSkill 遷移フロー    | setCurrentSkillName + setCurrentView("skill-editor") + handleCloseDetail が順に実行される  |
| TC-07  | handleAnalyzeSkill 遷移フロー | setCurrentSkillName + setCurrentView("skillAnalysis") + handleCloseDetail が順に実行される |
| TC-08  | prop 省略時                   | onEdit / onAnalyze が undefined の場合にボタンが非表示になる                               |

## 参照資料

| 参照資料              | パス                                                                                               | 内容                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Phase 1（要件定義）   | `phase-1-requirements.md`                                                                          | 前提成果物（受入基準・スコープ境界）を確認する        |
| SkillDetailPanel 実装 | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/SkillDetailPanel.tsx` | 現行の PanelContentProps / パネル構造を確認する       |
| useSkillCenter        | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`                          | 既存ハンドラ（handleCloseDetail 等）の実装を確認する  |
| SkillCenterView 実装  | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`                                        | SkillDetailPanel へのバインディングパターンを確認する |
| navigationSlice       | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`                                        | setCurrentView / setCurrentSkillName の実装を確認する |
| Button コンポーネント | `apps/desktop/src/renderer/components/atoms/Button/index.tsx`                                      | variant / size / leftIcon の利用可能な値を確認する    |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                             | パス                                                                                        | 内容                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| ui-ux-feature-components             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillCenter / SkillDetailPanel の UI 設計仕様  |
| ui-ux-navigation                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | ViewType 遷移契約・setCurrentView の利用ルール |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand セレクタ設計・useCallback パターン     |
| arch-state-management                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | NavigationSlice の state 管理契約              |

## 実行手順

### ステップ 1: 参照資料を確認する

Phase 1 の成果物と対象ファイルの現行実装を確認し、設計の前提を固める。特に `PanelContentProps` と `useSkillCenter` の返却値を正確に把握する。

### ステップ 2: 実行タスクを上から順に実施する

Props 設計 → コンポーネント設計 → 遷移フロー設計 → SkillCenterView 接続設計 → レスポンシブ対応設計 → テストケース設計の順で処理する。

### ステップ 3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、ViewType 契約・ナビゲーション設計・コンポーネント設計のズレを残さない。

### ステップ 4: 成果物と完了条件を確認する

設計サマリーと UI/UX 実体化のドキュメントを確認し、Phase 3 レビューへの handoff 情報を整える。

## 統合テスト連携

遷移フロー（setCurrentView + setCurrentSkillName の呼び出し順序）を設計に明示し、Phase 4 のテスト設計で検証できる形にする。

## 成果物

| 成果物           | パス                                      | 内容                                                               |
| ---------------- | ----------------------------------------- | ------------------------------------------------------------------ |
| 設計サマリー     | `outputs/phase-2/design-summary.md`       | Props 設計・コンポーネント変更・遷移フロー・接続設計をまとめる     |
| UI/UX 実体化     | `outputs/phase-2/ui-ux-realization.md`    | アクションボタンゾーンの配置・スタイル・レスポンシブ対応を整理する |
| テストケース一覧 | `outputs/phase-2/test-case-definition.md` | Phase 4 で実装するテストケース TC-01〜TC-08 の詳細定義             |

## 完了条件

- [ ] `SkillDetailPanelProps` の拡張内容（onEdit / onAnalyze の型シグネチャ）が確定している
- [ ] `PanelContent` 内のアクションボタンゾーン配置（危険な操作ゾーンの上部）が確定している
- [ ] `useSkillCenter` への `handleEditSkill` / `handleAnalyzeSkill` 追加設計が確定している
- [ ] SkillCenterView から SkillDetailPanel への prop バインディング設計が確定している
- [ ] デスクトップ・モバイル両レイアウトへの対応方針が確定している
- [ ] Phase 4 のテストケース（TC-01〜TC-08）が先行定義されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

- [Phase 3（設計レビュー）](./phase-3-design-review.md) に進む
