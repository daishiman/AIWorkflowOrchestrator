# 実装ガイド: Severity フィルタ機能

## メタ情報

| 項目         | 値                                                                   |
| ------------ | -------------------------------------------------------------------- |
| 機能名       | task-skill-creator-layer34-ui-display-severity-filter                |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` |
| Phase        | 12 - ドキュメント更新                                                |
| 作成日       | 2026-04-03                                                           |

---

## Part 1: 概念的な説明（初学者・非技術者向け）

### なぜ Severity フィルタが必要なのか

SkillLifecyclePanel は、スキルの品質チェック結果を Layer 3（構造）と Layer 4（意味論）に分けて一覧表示します。しかし、チェック項目が多くなると、本当に対処すべき重要な問題が大量の情報に埋もれてしまいます。

たとえば、メールの受信トレイを想像してください。毎日 100 通のメールが届くとき、すべてを同じ優先度で見ていては大事な連絡を見落とします。「重要」「注意」「通常」のラベルでフィルタリングすれば、今すぐ対応が必要なものだけを素早く見つけられます。

Severity フィルタはまさにこの「ラベルフィルタ」にあたります。チェック結果を深刻度（severity）で絞り込み、ユーザーが「エラーだけ見たい」「警告以上を見たい」「全部見たい」を切り替えられるようにする機能です。

`warning+` または `error` を選んだときは、件数サマリ `表示中 X / 全 Y 件` も併せて表示します。どれだけ絞り込まれているかを一目で把握できるので、重要な問題の見落としを防げます。

### 何をするか

画面上にセグメントコントロール（ボタンが横に3つ並んだ切り替えUI）を配置します。

| ボタン   | 表示される項目                  |
| -------- | ------------------------------- |
| すべて   | info、warning、error すべて表示 |
| Warning+ | warning と error のみ表示       |
| Error    | error のみ表示                  |

ユーザーがボタンを押すと、その場でチェック結果の表示が切り替わります。データそのものは変わらず、「見せ方」だけが変わる仕組みです。

また、別のワークフロー（作業単位）に切り替えたときには、フィルタは自動的に「すべて」にリセットされます。これにより、前の作業のフィルタ設定が残ってしまい、チェック項目が見えなくなるといった混乱を防ぎます。

---

## Part 2: 技術的な詳細（開発者向け）

### 1. 型定義

#### `SeverityFilterValue`

```typescript
type SeverityFilterValue = "all" | "warning+" | "error";
```

フィルタの選択状態を表すユニオン型です。`"all"` はすべて表示、`"warning+"` は warning 以上、`"error"` は error のみを意味します。

#### `SEVERITY_FILTER_OPTIONS`

```typescript
const SEVERITY_FILTER_OPTIONS: readonly {
  value: SeverityFilterValue;
  label: string;
}[] = [
  { value: "all", label: "すべて" },
  { value: "warning+", label: "⚠ Warning+" },
  { value: "error", label: "✗ Error" },
];
```

セグメントコントロールの描画に使用する定数配列です。`readonly` 修飾により不変性を保証しています。

### 2. `shouldShowCheck` フィルタ関数

#### シグネチャ

```typescript
function shouldShowCheck(
  severity: RuntimeSkillCreatorVerifyCheckSeverity,
  filter: SeverityFilterValue,
): boolean;
```

- **引数**: チェック項目の `severity`（`"info"` | `"warning"` | `"error"`）と、現在のフィルタ値 `filter`
- **戻り値**: そのチェック項目を表示すべきかどうかの真偽値

#### 判定ロジック

| filter       | severity=info | severity=warning | severity=error |
| ------------ | ------------- | ---------------- | -------------- |
| `"all"`      | true          | true             | true           |
| `"warning+"` | false         | true             | true           |
| `"error"`    | false         | false            | true           |

#### 使用例

```typescript
shouldShowCheck("info", "all"); // => true
shouldShowCheck("info", "warning+"); // => false
shouldShowCheck("warning", "warning+"); // => true
shouldShowCheck("error", "error"); // => true
```

この関数は純粋関数（副作用なし・同じ入力に対して常に同じ出力）として設計されており、単体テストが容易です。

### 3. `filteredChecksByLayer` useMemo

```typescript
const filteredChecksByLayer = useMemo(() => {
  const result = createVerifyChecksByLayer();
  for (const layer of VERIFY_LAYER_ORDER) {
    result[layer] = (checksByLayer[layer] ?? []).filter((check) =>
      shouldShowCheck(check.severity, severityFilter),
    );
  }
  return result;
}, [checksByLayer, severityFilter]);
```

#### 動作説明

1. `createVerifyChecksByLayer()` で空の Layer グループ（`{ layer1: [], layer2: [], layer3: [], layer4: [] }`）を生成
2. 各 Layer について、`checksByLayer` に格納されたチェック項目を `shouldShowCheck` で絞り込み
3. 依存配列は `[checksByLayer, severityFilter]` -- いずれかが変わったときだけ再計算

`checksByLayer` 自体は `verifyDetail?.checks` から派生する別の `useMemo` で、生のチェック配列を Layer 別に分類したものです。`filteredChecksByLayer` はそこからさらにフィルタリングする2段構成になっており、責務が明確に分離されています。

### 4. `severityFilter` state とリセット

```typescript
const [severityFilter, setSeverityFilter] =
  useState<SeverityFilterValue>("all");
```

デフォルト値は `"all"`（すべて表示）です。

ワークフロー切り替え時のリセット:

```typescript
useEffect(() => {
  setExpandedLayers(createDefaultExpandedLayers());
  setSeverityFilter("all");
}, [activeWorkflowId]);
```

`activeWorkflowId` が変更されると、Layer の展開状態とともに severity フィルタも `"all"` にリセットされます。これにより、前のワークフローで `"error"` にフィルタしていた状態が次のワークフローに持ち越されることを防ぎます。

### 5. セグメントコントロールの ARIA 属性仕様

```tsx
<div
  className="mt-4 flex items-center gap-1"
  role="group"
  aria-label="Severity filter"
>
  {SEVERITY_FILTER_OPTIONS.map((option) => (
    <button
      key={option.value}
      data-testid={`skill-lifecycle-severity-filter-${option.value}`}
      type="button"
      aria-pressed={severityFilter === option.value}
      onClick={() => setSeverityFilter(option.value)}
      className={...}
    >
      {option.label}
    </button>
  ))}
</div>
```

| 属性            | 値                                                                                      | 目的                                                             |
| --------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `role="group"`  | コンテナ `<div>` に付与                                                                 | ボタン群が論理的なグループであることをスクリーンリーダーに伝える |
| `aria-label`    | `"Severity filter"`                                                                     | グループの用途を説明するラベル                                   |
| `aria-pressed`  | 選択中のボタンは `true`、それ以外は `false`                                             | トグルボタンの選択状態を支援技術に伝える                         |
| `data-testid`   | `skill-lifecycle-severity-filter-{value}` （例: `skill-lifecycle-severity-filter-all`） | テストコードからボタンを特定するためのセレクタ                   |
| `type="button"` | 各 `<button>` に付与                                                                    | フォーム送信を防ぐ明示的な型指定                                 |

`warning+` または `error` のときは、同じグループ内に `role="status"` の件数サマリを置き、`表示中 X / 全 Y 件` をライブに読み上げられるようにしています。

#### 視覚的フィードバック

- **選択中**: `bg-[var(--accent-primary)] text-white` -- アクセントカラー背景 + 白文字
- **非選択**: `bg-[var(--bg-secondary)] text-[var(--text-secondary)]` -- 控えめな背景色
- **ホバー**: `hover:bg-[var(--bg-tertiary)]` -- 非選択ボタンにのみ適用

### 6. 表示フロー全体像

```
verifyDetail.checks (生データ)
  |
  v
checksByLayer (useMemo: Layer別に分類)
  |
  v
filteredChecksByLayer (useMemo: severityFilter で絞り込み)
  |
  v
VERIFY_LAYER_ORDER.filter(layer => filteredChecksByLayer[layer].length > 0)
  |
  v
VerifyLayerGroup コンポーネントへ渡して描画
```

フィルタ結果が 0 件の Layer は `.filter()` によって表示自体がスキップされるため、空のセクションが画面に残ることはありません。

### 7. 定数一覧とパラメータ

| 定数 / state              | 型                               | 初期値  | 説明                              |
| ------------------------- | -------------------------------- | ------- | --------------------------------- |
| `SeverityFilterValue`     | `"all" \| "warning+" \| "error"` | —       | フィルタ値のユニオン型            |
| `SEVERITY_FILTER_OPTIONS` | `readonly { value, label }[]`    | —       | UI ラベルと値の対応テーブル       |
| `severityFilter`          | `SeverityFilterValue`            | `"all"` | useState による現在のフィルタ状態 |

### 8. エラーハンドリングとエッジケース

#### エラー処理

- `shouldShowCheck` は引数が TypeScript 型で保護されているため、不正な severity 値は型エラーとなりコンパイル時に検出される
- `filteredChecksByLayer` は `checksByLayer[layer] ?? []` でフォールバックするため、undefined による実行時エラーは発生しない

#### エッジケース・境界条件

| ケース                         | 動作                                                                   |
| ------------------------------ | ---------------------------------------------------------------------- |
| `verifyDetail.checks` が空配列 | フィルタ UI 自体が非表示（`checks.length > 0` ガード）                 |
| 全チェックが同一 severity      | 他 severity フィルタ適用時に全 Layer が非表示になる                    |
| フィルタ後 0 件の Layer        | そのセクション自体が描画されない（0 件 Layer ガード）                  |
| reverify 後                    | `verifyDetail` 更新により `checksByLayer` が再計算、フィルタ状態は維持 |

### 9. スクリーンショット証跡

Phase 11 では Playwright harness により次のスクリーンショットを取得済みです。

| TC-ID | ファイル名                                                  |
| ----- | ----------------------------------------------------------- |
| TC-01 | `outputs/phase-11/screenshots/TC-01-default-all-light.png`  |
| TC-02 | `outputs/phase-11/screenshots/TC-02-default-all-dark.png`   |
| TC-03 | `outputs/phase-11/screenshots/TC-03-warning-plus-light.png` |
| TC-04 | `outputs/phase-11/screenshots/TC-04-warning-plus-dark.png`  |
| TC-05 | `outputs/phase-11/screenshots/TC-05-error-only-light.png`   |
| TC-06 | `outputs/phase-11/screenshots/TC-06-error-only-dark.png`    |
| TC-07 | `outputs/phase-11/screenshots/TC-07-empty-layer-light.png`  |
| TC-08 | `outputs/phase-11/screenshots/TC-08-no-checks-light.png`    |

補助メタデータ:

- `outputs/phase-11/phase11-capture-metadata.json`
- `outputs/phase-11/screenshot-coverage.md`
