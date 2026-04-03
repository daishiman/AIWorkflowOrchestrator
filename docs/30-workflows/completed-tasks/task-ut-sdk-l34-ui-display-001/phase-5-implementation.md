# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 5                              |
| 機能名 | task-ut-sdk-l34-ui-display-001 |
| 作成日 | 2026-04-03                     |

## 目的

Phase 4で作成したテスト（Red）をGreenにする実装を行う。
`SkillLifecyclePanel.tsx`のverify detailセクションをLayer別グルーピング表示に改修する。

## 実行タスク

- `SkillLifecyclePanel.tsx` の verify detail 表示を Layer 別にグルーピングして表示する（Layer1〜4）
- 各 Layer をアコーディオン（折りたたみ可能）で表示し、開閉状態をローカル state で保持する（reverify 後も維持）
- 各 check に severity アイコン（info/warning/error）を表示する
- Layer ヘッダーに error/warning/info の件数バッジを表示する
- checks が 0 件の Layer は表示しない（空グループ非表示）
- 既存の Layer1/2 表示が壊れないことを保証する（後方互換性）
- `pnpm --filter @repo/desktop test -- --run` を実行し、Phase 4 の追加テストを含む全テストが Green であることを確認する
- `pnpm --filter @repo/desktop typecheck` と `pnpm --filter @repo/desktop lint` を実行し、エラー 0 件であることを確認する
- 実装サマリー（`outputs/phase-5/implementation-summary.md`）に変更点、分離判断、確認コマンド結果を記録する

### 新規作成・修正ファイル一覧

### 修正ファイル

| ファイルパス                                                         | 変更種別 | 変更内容                                     |
| -------------------------------------------------------------------- | -------- | -------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 修正     | Layer別グルーピング表示・定数追加・Hooks追加 |

### 新規作成ファイル（条件付き）

| ファイルパス                                                      | 変更種別 | 条件                                    |
| ----------------------------------------------------------------- | -------- | --------------------------------------- |
| `apps/desktop/src/renderer/components/skill/VerifyLayerGroup.tsx` | 新規     | 実装後に行数が100行を超えた場合のみ分離 |

## 参照資料

| 資料名             | パス                                                                            | 説明                             |
| ------------------ | ------------------------------------------------------------------------------- | -------------------------------- |
| Phase 2設計書      | `outputs/phase-2/design.md`                                                     | 実装設計・定数設計               |
| Phase 4成果物      | `outputs/phase-4/test-design.md`                                                | テストケース（実装ターゲット）   |
| 型定義             | `packages/shared/src/types/skillCreator.ts`                                     | RuntimeSkillCreatorVerifyCheck型 |
| 既存コンポーネント | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`            | 現行実装（変更対象）             |
| UIパターン仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | アコーディオン設計パターン       |

## 実行手順

### Step 1: 実装前の現行コード把握

```bash
# verifyDetail.checksの表示箇所を特定
grep -n "checks.map\|verifyCheckSeverityStyles\|verify-detail" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# 既存のchecks表示部分の現行位置を確認（verifyCheckSeverityStyles / verifyDetail / checks.map）
rg -n "verifyCheckSeverityStyles|verifyDetail|checks.map" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

### Step 2: 定数・型の追加

`SkillLifecyclePanel.tsx`のファイル上部（`verifyCheckSeverityStyles`の近く）に追加する：

```typescript
// Layer表示順序（固定）
const LAYER_ORDER = ["layer1", "layer2", "layer3", "layer4"] as const;

// Layerラベルマッピング
const layerLabels: Record<RuntimeSkillCreatorVerifyCheck["layer"], string> = {
  layer1: "Layer 1 — 必須ファイル構造",
  layer2: "Layer 2 — SKILL.md セクション",
  layer3: "Layer 3 — スキーマ・コンテンツ品質",
  layer4: "Layer 4 — References整合性",
};

// severityアイコンマッピング（SVGライブラリ不使用）
const verifyCheckSeverityIcon: Record<
  RuntimeSkillCreatorVerifyCheckSeverity,
  string
> = {
  info: "✓",
  warning: "⚠",
  error: "✗",
};
```

### Step 3: useMemo・useStateの追加

`verifyDetail`を参照しているコンポーネント内（適切な位置）に追加する：

```typescript
// Layer別グループ化（useMemo）
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

// Layer開閉状態（useState）
// reverify による verifyDetail 更新ではリセットしない（ユーザー操作の状態を保持）
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

### Step 4: 既存のchecks表示を置換

`verifyDetail.checks.map`による2列グリッド表示（`<div className="mt-4 grid gap-3 lg:grid-cols-2">`）を以下に置き換える：

```tsx
<div className="mt-4 space-y-3">
  {LAYER_ORDER.filter((layer) => (checksByLayer[layer]?.length ?? 0) > 0).map(
    (layer) => {
      const layerChecks = checksByLayer[layer] ?? [];
      const isExpanded = expandedLayers[layer] ?? true;

      // 集計バッジ用のseverity件数
      const severityCounts = layerChecks.reduce(
        (acc, check) => {
          acc[check.severity] = (acc[check.severity] ?? 0) + 1;
          return acc;
        },
        {} as Record<RuntimeSkillCreatorVerifyCheckSeverity, number>,
      );

      return (
        <div key={layer} className="rounded-lg border border-[var(--border)]">
          {/* Layerヘッダー */}
          <button
            className="flex w-full items-center justify-between px-4 py-3 text-left"
            onClick={() => toggleLayer(layer)}
          >
            <span className="text-sm font-medium">{layerLabels[layer]}</span>
            <div className="flex items-center gap-2">
              {/* 集計バッジ */}
              {(
                [
                  "error",
                  "warning",
                  "info",
                ] as RuntimeSkillCreatorVerifyCheckSeverity[]
              )
                .filter((sev) => (severityCounts[sev] ?? 0) > 0)
                .map((sev) => (
                  <span
                    key={sev}
                    className={cn(
                      "rounded px-1.5 py-0.5 text-xs",
                      verifyCheckSeverityStyles[sev],
                    )}
                  >
                    {severityCounts[sev]} {sev}
                  </span>
                ))}
              <span className="text-xs text-[var(--fg-muted)]">
                {isExpanded ? "▲" : "▼"}
              </span>
            </div>
          </button>

          {/* アコーディオン本体 */}
          {isExpanded && (
            <div className="grid gap-3 px-4 pb-4 lg:grid-cols-2">
              {layerChecks.map((check) => (
                <div
                  key={check.id}
                  className={cn(
                    "rounded-md p-3",
                    verifyCheckSeverityStyles[check.severity],
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {verifyCheckSeverityIcon[check.severity]}
                    </span>
                    <span className="text-xs font-mono opacity-60">
                      {check.id}
                    </span>
                  </div>
                  <p className="mt-1 text-xs">{check.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    },
  )}
</div>
```

### Step 5: TDD Green確認

```bash
# テスト実行
pnpm --filter @repo/desktop test -- --run 2>&1 | tail -20

# TypeScript型チェック
pnpm --filter @repo/desktop typecheck

# ESLint
pnpm --filter @repo/desktop lint
```

**期待結果**:

- Phase 4で追加したTC-01〜TC-10が全てGreenになること
- 既存テストが全てGreenのままであること
- TypeScriptエラー0件
- ESLintエラー0件

### Step 6: 行数確認とコンポーネント分離判断

```bash
# verifyDetail表示部分の行数確認
wc -l apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

Layer別グルーピングの実装が100行を超えた場合は、`VerifyLayerGroup.tsx`として分離する。

## 統合テスト連携【必須】

| 確認項目                 | 確認方法                                    | 期待結果     |
| ------------------------ | ------------------------------------------- | ------------ |
| 全テストGreen            | `pnpm --filter @repo/desktop test -- --run` | 全テストPASS |
| TypeScript型チェック通過 | `pnpm --filter @repo/desktop typecheck`     | エラー0件    |
| ESLint通過               | `pnpm --filter @repo/desktop lint`          | エラー0件    |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                                                              |
| -------------- | --------------------------------------------------------------------- |
| UI/UX          | light/darkテーマでのCSS変数動作確認、アコーディオンのアクセシビリティ |
| アーキテクチャ | Rendererのみの変更でMainプロセス・IPC変更なしであること確認           |

## 成果物

| 成果物                         | パス                                                                 | 説明                         |
| ------------------------------ | -------------------------------------------------------------------- | ---------------------------- |
| 更新済みコンポーネント         | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | Layer別グルーピング実装      |
| 新規コンポーネント（条件付き） | `apps/desktop/src/renderer/components/skill/VerifyLayerGroup.tsx`    | 100行超の場合のみ分離        |
| 実装サマリー                   | `outputs/phase-5/implementation-summary.md`                          | 変更内容・行数・分離判断結果 |

## 完了条件

- [ ] Phase 4のTC-01〜TC-10が全てGreenになっている
- [ ] 既存テストが全てGreenのままである
- [ ] `LAYER_ORDER`・`layerLabels`・`verifyCheckSeverityIcon`定数が追加されている
- [ ] `checksByLayer`（useMemo）・`expandedLayers`（useState）・`toggleLayer`が実装されている
- [ ] Layer別グルーピング表示（アコーディオン・集計バッジ・severityアイコン）が実装されている
- [ ] `pnpm --filter @repo/desktop typecheck`がエラー0件で完了する
- [ ] `pnpm --filter @repo/desktop lint`がエラー0件で完了する
- [ ] コンポーネント分離判断（100行以上ならVerifyLayerGroup.tsx分離）が実施されている
- [ ] **本Phase内の全タスクを100%実行完了**

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001 --phase 5
```

## 次のPhase

Phase 6: テスト拡充（TDD: Refine）
