# Phase 2: 設計

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 2                              |
| 機能名 | task-ut-sdk-l34-ui-display-001 |
| 作成日 | 2026-04-03                     |

## 目的

Phase 1の要件定義をもとに、Layer別グルーピングUIのコンポーネント構成・状態管理・実装方針を設計する。

## 実行タスク

- コンポーネント構成設計: `SkillLifecyclePanel`内のLayer別UI構造を決定する
- 状態管理設計: 開閉状態・グルーピングロジックのHooks設計
- severityアイコン設計: アイコンマッピング定数とバッジ設計
- コンポーネント分離判断: `VerifyLayerGroup.tsx`として分離するか決定する
- テスト戦略設計: 追加・更新するテストの方針を決定する

## 参照資料

| 資料名             | パス                                                                              | 説明                                   |
| ------------------ | --------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 1成果物      | `outputs/phase-1/requirements.md`                                                 | 要件定義・スコープ                     |
| 既存コンポーネント | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`              | 現行実装の詳細                         |
| 型定義             | `packages/shared/src/types/skillCreator.ts`                                       | RuntimeSkillCreatorVerifyCheck型       |
| UIパターン仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | アコーディオン・グルーピングUIパターン |
| テストパターン     | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | Reactコンポーネントテスト手法          |

## 実行手順

### Step 1: コンポーネント構成設計

#### 1-1: 変更対象の特定

`SkillLifecyclePanel.tsx`の`data-testid="skill-lifecycle-verify-detail"`セクション内で、
現在の`<div className="mt-4 grid gap-3 lg:grid-cols-2">`による2列グリッド表示を
Layer別グルーピング表示に置き換える。

**変更前の構造（概念）**:

```
<div data-testid="skill-lifecycle-verify-detail">
  <div class="grid gap-3 lg:grid-cols-2">
    {checks.map(check => <CheckCard />)}
  </div>
</div>
```

**変更後の構造（概念）**:

```
<div data-testid="skill-lifecycle-verify-detail">
  {LAYERS.map(layer => (
    <VerifyLayerGroup
      key={layer}
      layerKey={layer}
      label={layerLabels[layer]}
      checks={checksByLayer[layer]}
      isExpanded={expandedLayers[layer]}
      onToggle={() => toggleLayer(layer)}
    />
  ))}
</div>
```

#### 1-2: コンポーネント分離判断

`VerifyLayerGroup`コンポーネントの行数見積もり：

- ヘッダー（ラベル+集計バッジ+トグルボタン）: ~15行
- アコーディオン展開/折りたたみ: ~5行
- checks一覧のレンダリング（既存CheckCardの再利用）: ~20行
- 合計: ~40行

**判断**: 40行程度であれば`SkillLifecyclePanel.tsx`内のローカルコンポーネントとして実装する。
ただし、Phase 5実装後に実際の行数が100行を超えた場合は`VerifyLayerGroup.tsx`として分離する。

### Step 2: 状態管理設計

#### 2-1: grouping ロジック（useMemo）

```typescript
// Phase 1で確認した命名規則: camelCase
const checksByLayer = useMemo(() => {
  const groups: Record<
    RuntimeSkillCreatorVerifyCheck["layer"],
    RuntimeSkillCreatorVerifyCheck[]
  > = {
    layer1: [],
    layer2: [],
    layer3: [],
    layer4: [],
  };
  for (const check of verifyDetail?.checks ?? []) {
    groups[check.layer]?.push(check);
  }
  return groups;
}, [verifyDetail?.checks]);
```

- 依存配列: `verifyDetail?.checks`（reverify時に再計算される）
- 空のLayerグループ: checksが0件のLayerは表示しない（`groups[layer].length > 0`で判定）

#### 2-2: 開閉状態管理（useState）

```typescript
// 初期状態: 全Layer展開
const [expandedLayers, setExpandedLayers] = useState<
  Record<RuntimeSkillCreatorVerifyCheck["layer"], boolean>
>({
  layer1: true,
  layer2: true,
  layer3: true,
  layer4: true,
});

const toggleLayer = (layer: RuntimeSkillCreatorVerifyCheck["layer"]) => {
  setExpandedLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
};
```

- 設計原則: `verifyDetail`の更新（reverify）で開閉状態をリセットしない
- `verifyDetail`が`null`になった場合は全Layer展開にリセット（useEffect）

### Step 3: severityアイコン・バッジ設計

#### 3-1: severityアイコンマッピング

```typescript
// Phase 1命名規則: camelCase定数
const verifyCheckSeverityIcon: Record<
  RuntimeSkillCreatorVerifyCheckSeverity,
  string
> = {
  info: "✓",
  warning: "⚠",
  error: "✗",
};
```

- Unicodeテキスト文字を使用（SVGライブラリ追加なし）
- 既存の`verifyCheckSeverityStyles`と同列の定数として配置

#### 3-2: Layerラベルマッピング

```typescript
const layerLabels: Record<string, string> = {
  layer1: "Layer 1 — 必須ファイル構造",
  layer2: "Layer 2 — SKILL.md セクション",
  layer3: "Layer 3 — スキーマ・コンテンツ品質",
  layer4: "Layer 4 — References整合性",
};
```

#### 3-3: 集計バッジ設計

各Layerヘッダーに表示する集計バッジ：

- `error`件数 → 赤バッジ（`bg-[var(--status-error)]/10 text-[var(--status-error)]`）
- `warning`件数 → 黄バッジ（`bg-[var(--status-warning)]/10 text-[var(--status-warning)]`）
- `info`件数 → 青バッジ（`bg-[var(--status-info)]/10 text-[var(--status-info)]`）
- 0件のseverityバッジは表示しない
- 既存の`verifyCheckSeverityStyles`と同一のCSS変数を使用

### Step 4: Layer表示順序の設計

表示順序: Layer1 → Layer2 → Layer3 → Layer4（固定順序）

```typescript
const LAYER_ORDER = ["layer1", "layer2", "layer3", "layer4"] as const;
```

### Step 5: テスト戦略設計

#### 5-1: 更新対象テスト

| テストファイル                                | 更新内容                                              |
| --------------------------------------------- | ----------------------------------------------------- |
| `SkillLifecyclePanel.test.tsx`                | Layer別グルーピング・集計バッジ・折りたたみテスト追加 |
| `SkillLifecyclePanel.llm-generation.test.tsx` | layer3 fixtureのcheck ID形式更新（`L3-001`等）        |

#### 5-2: 新規テストのカバレッジ方針

- Layer別グルーピング: 全4Layerのchecksが正しいグループに配置されるテスト
- 空グループ: checks 0件のLayerが非表示になるテスト
- 集計バッジ: error/warning/info件数が正しく表示されるテスト
- アコーディオン: ヘッダークリックで開閉するインタラクションテスト
- severityアイコン: 各severityで対応するアイコンが表示されるテスト
- 後方互換: 既存のLayer1/2 checksがグルーピング後も正しく表示されるテスト

## コンポーネント設計図（概念）

```
SkillLifecyclePanel
└── verifyDetail セクション
    ├── VerifyLayerGroup (layer1, ローカルコンポーネント)
    │   ├── ヘッダー: "Layer 1 — 必須ファイル構造" [集計バッジ] [▼]
    │   └── (展開時) CheckCard × N
    ├── VerifyLayerGroup (layer2)
    │   ├── ヘッダー: "Layer 2 — SKILL.md セクション" [集計バッジ] [▼]
    │   └── (展開時) CheckCard × N
    ├── VerifyLayerGroup (layer3) ← 今回新規表示
    │   ├── ヘッダー: "Layer 3 — スキーマ・コンテンツ品質" [⚠1] [▼]
    │   └── (展開時) CheckCard [L3-001 ⚠ output-schema.$schemaが欠損]
    └── VerifyLayerGroup (layer4) ← 今回新規表示
        ├── ヘッダー: "Layer 4 — References整合性" [✗1] [▼]
        └── (展開時) CheckCard [L4-001 ✗ Anchorsセクションが不備]
```

## データフロー設計

```
verifyDetail (IPC → store → props)
  ↓
checksByLayer (useMemo: layer別にグループ化)
  ↓
LAYER_ORDER.filter(layer => checksByLayer[layer].length > 0)
  ↓
各VerifyLayerGroup:
  - label: layerLabels[layer]
  - checks: checksByLayer[layer]
  - isExpanded: expandedLayers[layer]
  - severityCounts: {error: N, warning: N, info: N}
  - 各CheckCard内: verifyCheckSeverityIcon[check.severity]
```

## リスク評価と対策

| リスク                                       | 影響 | 対策                                                       |
| -------------------------------------------- | ---- | ---------------------------------------------------------- |
| 既存Layer1/2 checks表示が壊れる              | 高   | Phase 4でLayer1/2の既存テストをRed確認後に実装             |
| アコーディオン開閉状態がreverify後にリセット | 中   | useState初期値を固定し、verifyDetailの変更では上書きしない |
| Tailwind CSS変数のdark/light非対応           | 中   | `verifyCheckSeverityStyles`と同一のCSS変数を使用           |
| useMemoの依存配列誤り                        | 低   | ESLintの`exhaustive-deps`で検出                            |

## 統合テスト連携【必須】

設計フェーズでの確認事項：

| 確認項目                    | 確認方法                                                                           |
| --------------------------- | ---------------------------------------------------------------------------------- |
| 型定義の整合性              | `RuntimeSkillCreatorVerifyCheck.layer`の型が`layer3`/`layer4`を含むか確認          |
| 既存テストとのfixture互換性 | `layer3`フィクスチャ形式が新旧で矛盾しないか確認                                   |
| CSS変数の存在確認           | `--status-error`/`--status-warning`/`--status-info`がグローバルCSSに定義済みか確認 |

## 成果物

| 成果物 | パス                        | 説明               |
| ------ | --------------------------- | ------------------ |
| 設計書 | `outputs/phase-2/design.md` | コンポーネント設計 |

## 完了条件

- [ ] コンポーネント構成（ローカルコンポーネント vs 分離コンポーネント）が決定している
- [ ] 状態管理設計（`checksByLayer`useMemo・`expandedLayers`useState）が確定している
- [ ] severityアイコンとLayerラベルのマッピング定数設計が確定している
- [ ] Layer表示順序が確定している
- [ ] 集計バッジのCSS設計が確定している
- [ ] テスト戦略（更新対象テスト・カバレッジ方針）が確定している
- [ ] リスクと対策が評価済み
- [ ] **本Phase内の全タスクを100%実行完了**

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001 --phase 2
```

## 次のPhase

Phase 3: 設計レビュー
