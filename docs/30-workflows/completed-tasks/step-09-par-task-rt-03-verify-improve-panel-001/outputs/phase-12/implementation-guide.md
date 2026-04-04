# 実装ガイド: Verify / Improve 結果パネル

## メタ情報

| 項目   | 内容                                |
| ------ | ----------------------------------- |
| タスク | TASK-RT-03-VERIFY-IMPROVE-PANEL-001 |
| 作成日 | 2026-04-03                          |

---

# Part 1: やさしい説明（初学者・中学生向け）

## このパネルは何をするの？

AIWorkflowOrchestrator というアプリでは、AI がスキル（特別な機能）を作ってくれます。でも、AI が作ったものがちゃんとしているか確認しないと困りますよね。そこで登場するのが **Verify（検証）** と **Improve（改善）** です。

### Verify は「先生が宿題をチェックするようなもの」

学校で宿題を出したとき、先生がチェックしてくれますよね。

- 名前が書いてあるか？ → OK
- 問題が全部解いてあるか？ → OK
- 答えが合っているか？ → 2問間違い！

これと同じことを、AI が作ったスキルに対して行うのが **Verify** です。

Verify パネルでは、チェック結果を **4つのレベル（Layer）** に分けて表示します:

| Layer   | やっていること             | 学校に例えると                   |
| ------- | -------------------------- | -------------------------------- |
| Layer 1 | 必要なファイルがあるか     | 宿題のプリントが全部揃っているか |
| Layer 2 | 説明書の中身が正しいか     | 名前・日付・科目が書いてあるか   |
| Layer 3 | 内容の品質が十分か         | 答えが丁寧に書いてあるか         |
| Layer 4 | 他の資料との整合性があるか | 教科書のページ番号が合っているか |

各チェック項目には、問題の深刻さを示すマークがつきます:

- ℹ（情報）: 「ここはこうなっていますよ」というメモ
- ⚠（注意）: 「ここは直したほうがいいかも」という黄色信号
- ✗（エラー）: 「ここは間違っています！」という赤信号

最終結果は **合格**・**不合格**・**検証中** のバッジで表示されます。

### Improve は「赤ペンで直すようなもの」

先生がチェックした後、「ここをこう直すといいよ」と赤ペンで書いてくれることがありますよね。

Improve パネルはまさにそれです。AI が「この部分をこう変えると良くなりますよ」という提案を見せてくれます。

各提案には:

- **Before（直す前）**: 今のコード（赤い背景）
- **After（直した後）**: 改善後のコード（緑の背景）
- **理由**: なぜ直すべきなのかの説明

が表示されます。信号の赤と緑のように、「ダメなもの」と「良いもの」が色で一目でわかるようになっています。

### なぜこの2つのパネルが必要なの？

1つのパネルに全部詰め込むと、情報が多すぎて見づらくなります。料理でいえば、「材料チェックリスト」と「レシピの改善メモ」を別々の紙に書いたほうが見やすいのと同じです。

- **Verify パネル** = チェックリスト（合格か不合格か）
- **Improve パネル** = 改善メモ（どう直すか）

この2つを分けることで、ユーザーは「まず結果を確認して、次に改善点を見る」という自然な流れで作業できます。

---

# Part 2: 技術者向け詳細

## アーキテクチャ概要

```
SkillLifecyclePanel.tsx
├── VerifyResultDetailPanel.tsx   ← NEW（本タスク）
├── ImproveResultDetailPanel.tsx  ← NEW（本タスク）
├── PlanResultDetailPanel.tsx     ← 既存
├── ExecuteResultDetailPanel.tsx  ← 既存
├── ImprovementProposalPanel.tsx  ← 既存（操作パネル、共存）
└── result-panel-parts.tsx        ← 共有部品（StatusBadge label override 追加）
```

## 1. VerifyResultDetailPanel

### Props インターフェース

```typescript
export interface VerifyResultDetailPanelProps {
  verifyDetail: RuntimeSkillCreatorVerifyDetail | null;
  error?: PanelError | null;
  isLoading?: boolean;
  onRetry?: () => void;
  onReverify?: () => void;
  isReverifying?: boolean;
  showRawGovernanceNotes?: boolean;
}
```

### 状態遷移

```
isLoading=true     → スケルトン表示
!verifyDetail+error → ErrorBanner を含むエラー表示
!verifyDetail       → null（非表示）
verifyDetail あり   → 完全なパネル表示
```

### Layer 別グループ化ロジック

`VerifyResultDetailPanel` の内部で、checks 配列を Layer 別に分類する `useMemo` フック:

```typescript
type VerifyLayerKey = RuntimeSkillCreatorVerifyCheck["layer"];

const LAYER_ORDER: readonly VerifyLayerKey[] = [
  "layer1",
  "layer2",
  "layer3",
  "layer4",
];

const checksByLayer = useMemo(() => {
  const groups: Record<VerifyLayerKey, RuntimeSkillCreatorVerifyCheck[]> = {
    layer1: [],
    layer2: [],
    layer3: [],
    layer4: [],
  };
  for (const check of verifyDetail?.checks ?? []) {
    if (check.layer in groups) {
      groups[check.layer as VerifyLayerKey].push(check);
    }
  }
  return groups;
}, [verifyDetail?.checks]);
```

表示時は `LAYER_ORDER.filter(layer => checksByLayer[layer].length > 0)` でフィルタリングし、0 件の Layer は非表示にする。各 Layer グループは `CheckGroupByLayer` コンポーネントで折りたたみ可能で、`skill-lifecycle-verify-layer-*` 系の `data-testid` を保持している。

### Severity スタイルマッピング

```typescript
const SEVERITY_ICON: Record<RuntimeSkillCreatorVerifyCheckSeverity, string> = {
  info: "ℹ",
  warning: "⚠",
  error: "✗",
};

const SEVERITY_STYLES: Record<RuntimeSkillCreatorVerifyCheckSeverity, string> =
  {
    info: "text-[var(--text-secondary)]",
    warning: "text-amber-600",
    error: "text-[var(--status-error)]",
  };
```

### Verify ステータス → StatusBadge マッピング

```typescript
const VERIFY_STATUS_MAP: Record<
  RuntimeSkillCreatorVerifyDetail["status"],
  { badgeStatus: "success" | "failure" | "pending"; label: string }
> = {
  pass: { badgeStatus: "success", label: "合格" },
  fail: { badgeStatus: "failure", label: "不合格" },
  pending: { badgeStatus: "pending", label: "検証中" },
};
```

これにより `StatusBadge` を `label` override 付きで呼び出し、verify 固有の語彙（合格/不合格/検証中）を表示する。

`VerifyResultDetailPanel` 側では、`isReverifying` を使って再検証ボタンの二重送信を抑止し、`showRawGovernanceNotes` で raw note を必要時のみ補助表示する。

### セクション構成

1. **ヘッダー**: タイトル「Verify 結果」+ StatusBadge
2. **メッセージ**: `verifyDetail.message`（optional）
3. **メタデータ行**: nextAction タグ + Phase + Evidence Count
4. **チェック項目**: Layer 別グループ化された CheckGroupByLayer
5. **Route**: type / summary / permissionMode / launcher
6. **Provenance**: root / manifest / resourceDescriptorHash / manifestCacheKey
7. **Governance Notes**: 折りたたみセクション（governanceNote + sessionNote）
8. **再検証ボタン**: `reverifyEligible` で有効/無効制御、`disabledReason` 表示
9. **フッター**: DetailFooter（Plan ID）

## 2. ImproveResultDetailPanel

### Props インターフェース

```typescript
export interface ImproveResultDetailPanelProps {
  improveResult: RuntimeSkillCreatorImproveResult | null;
  error?: PanelError | null;
  isLoading?: boolean;
  onRetry?: () => void;
}
```

### 状態遷移

```
isLoading=true       → スケルトン表示
!improveResult+error → ErrorBanner 表示
!improveResult       → null（非表示）
improveResult あり   → 完全なパネル表示
```

### SuggestionCard 構成

各提案は以下の構造で表示:

```
┌─────────────────────────────────────┐
│ section名（または「セクション未指定」）│
│                                     │
│ ┌─ Before（赤背景）───────────────┐ │
│ │ suggestion.before               │ │
│ └─────────────────────────────────┘ │
│ ┌─ After（緑背景）────────────────┐ │
│ │ suggestion.after                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ reason（テキスト）                  │
└─────────────────────────────────────┘
```

- Before: `bg-[var(--status-error)]/10` 背景
- After: `bg-[var(--status-success)]/10` 背景

### セクション構成

1. **ヘッダー**: タイトル「Improve 結果」+ 件数バッジ
2. **改善提案**: SuggestionCard リスト（0 件時は空状態メッセージ）
3. **Revised Spec**: 折りたたみ `<pre>` ブロック（optional）
4. **フッター**: DetailFooter（Improve ID）

## 3. StatusBadge の label override 設計

`result-panel-parts.tsx` の `StatusBadge` に `label?: string` を追加:

```typescript
export function StatusBadge({
  status,
  label: labelOverride,
}: {
  status: "success" | "failure" | "pending";
  label?: string;
}): JSX.Element {
  const config = {
    success: { className: "...", label: "成功" },
    failure: { className: "...", label: "失敗" },
    pending: { className: "...", label: "実行中" },
  };
  const { className, label: defaultLabel } = config[status];
  const displayLabel = labelOverride ?? defaultLabel;
  // ...
}
```

- `label` 未指定: 既存の Plan/Execute パネルと同じデフォルト動作
- `label` 指定: Verify パネルが `合格`/`不合格`/`検証中` を渡す
- 後方互換性: optional props のため既存コードへの影響なし

## 4. SkillLifecyclePanel 統合

### 変更内容

1. **import 追加**: `VerifyResultDetailPanel`, `ImproveResultDetailPanel`
2. **inline verify block 置換**: 約 170 行の inline verify detail 表示ブロックを `<VerifyResultDetailPanel verifyDetail={verifyDetail} isReverifying={isReverifying} />` に置換
3. **verify detail 競合防止**: `verifyDetailRequestSeqRef` で stale response を破棄し、`isReverifyingRef` で reverify の多重発火を止める
4. **ImproveResultDetailPanel 追加**: `ImprovementProposalPanel` の近くに `<ImproveResultDetailPanel improveResult={runtimeImproveResult} />` を追加
5. **テスト互換**: `ImprovementProposalPanel` の見出しは text collision を避けるため識別子を追加し、read-only panel と操作 panel を分離した

### ImprovementProposalPanel との共存

- `ImprovementProposalPanel`: improve の **提案操作パネル**（apply/feedback 機能付き）
- `ImproveResultDetailPanel`: improve の **結果表示パネル**（読み取り専用）
- 責務が異なるため共存する。ユーザーは結果を確認してから操作に移る
- `VerifyResultDetailPanel`: verify の **結果表示パネル**（再検証導線付き）
- verify / improve の結果パネルは、操作面と read-only 面を分けて同一画面に置く

## 5. 使用例

### 基本使用

```tsx
import { VerifyResultDetailPanel } from "./VerifyResultDetailPanel";
import { ImproveResultDetailPanel } from "./ImproveResultDetailPanel";

// Verify パネル
<VerifyResultDetailPanel
  verifyDetail={verifyDetail}
  error={verifyError}
  isLoading={isVerifying}
  onRetry={() => retryVerify()}
  onReverify={() => requestReverify()}
  isReverifying={isReverifying}
  showRawGovernanceNotes={false}
/>

// Improve パネル
<ImproveResultDetailPanel
  improveResult={improveResult}
  error={improveError}
  isLoading={isImproving}
  onRetry={() => retryImprove()}
/>
```

### エラーハンドリング

```tsx
// error のみ（データなし）→ ErrorBanner 表示
<VerifyResultDetailPanel
  verifyDetail={null}
  error={{ code: "TIMEOUT", message: "検証がタイムアウトしました" }}
  onRetry={() => retryVerify()}
/>

// データあり + error → パネル表示（error は無視）
<VerifyResultDetailPanel
  verifyDetail={verifyDetail}
  error={{ code: "STALE", message: "古いデータです" }}
/>
```

## 6. ファイル一覧

| ファイル                            | 種別 | 説明                                                              |
| ----------------------------------- | ---- | ----------------------------------------------------------------- |
| `VerifyResultDetailPanel.tsx`       | 新規 | verify 結果詳細パネル                                             |
| `ImproveResultDetailPanel.tsx`      | 新規 | improve 結果詳細パネル                                            |
| `result-panel-parts.tsx`            | 変更 | StatusBadge に label override 追加                                |
| `SkillLifecyclePanel.tsx`           | 変更 | import + 統合（inline block 置換、ImproveResultDetailPanel 追加） |
| `VerifyResultDetailPanel.test.tsx`  | 新規 | 25 テストケース                                                   |
| `ImproveResultDetailPanel.test.tsx` | 新規 | 15 テストケース                                                   |

## 7. Phase 11 visual harness

### 目的

Verify / Improve 結果パネルの視覚確認を、既存の `SkillLifecyclePanel` 実画面とは分離して再現するための専用 harness。

### 追加ファイル

| ファイル                                                                   | 種別 | 役割                                                            |
| -------------------------------------------------------------------------- | ---- | --------------------------------------------------------------- |
| `apps/desktop/src/renderer/phase11-task-rt-03-verify-improve-panel.tsx`    | 新規 | Verify pass / fail と Improve 通常状態を描画する visual harness |
| `apps/desktop/src/renderer/phase11-task-rt-03-verify-improve-panel.html`   | 新規 | Vite から直接開くための entry HTML                              |
| `apps/desktop/scripts/capture-task-rt-03-verify-improve-panel-phase11.mjs` | 新規 | Playwright で 3 状態を要素単位 capture するスクリプト           |
| `outputs/phase-11/verify-improve-panel-capture-metadata.json`              | 新規 | capture 実行メタデータ                                          |
| `outputs/phase-11/verify-improve-panel-screenshot-plan.json`               | 新規 | capture 対象と保存先の計画                                      |

### 画面証跡

| TC       | 状態            | ファイル                                                    |
| -------- | --------------- | ----------------------------------------------------------- |
| TC-11-01 | Verify pass     | `outputs/phase-11/screenshots/TC-11-01-verify-pass.png`     |
| TC-11-02 | Verify fail     | `outputs/phase-11/screenshots/TC-11-02-verify-fail.png`     |
| TC-11-03 | Improve default | `outputs/phase-11/screenshots/TC-11-03-improve-default.png` |

### 補足

- 既存の `apps/desktop/src/renderer/components/skill/*` 実装は変更せず、追加ファイルのみで証跡を生成した。
- 保存先は `docs/30-workflows/step-09-par-task-rt-03-verify-improve-panel-001/outputs/phase-11/screenshots/`。
- 3 枚の screenshot は `TC-11-01` 〜 `TC-11-03` として保存し、Phase 12 の root evidence から参照している。
