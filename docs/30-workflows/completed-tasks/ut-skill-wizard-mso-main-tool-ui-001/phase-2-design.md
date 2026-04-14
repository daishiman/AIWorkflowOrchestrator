# Phase 2: 設計

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 2                                      |
| タスクID   | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001   |
| 機能名     | skill-wizard/q5-primary-tool-indicator |
| 前提Phase  | Phase 1                                |
| 後続Phase  | Phase 3                                |
| 作成日     | 2026-04-13                             |
| ステータス | completed                              |

## 目的

Q5 複数選択時の「主ツール」バッジ表示のコンポーネント設計・制御方式・aria-label 設計・削除容易性の方針を確定し、Phase 4（テスト作成）・Phase 5（実装）が迷いなく進められる状態にする。

## 実行タスク

- バッジ表示制御方式の決定: Q5キー分岐方式 vs `showPrimaryIndicator` フラグ方式の比較・採用決定
- バッジコンポーネント設計: Tailwind CSS トークン・既存バッジスタイルの流用方針確定
- aria-label 設計: AC-3 を満たすアクセシビリティ属性の設計
- AC-4 対応方針: 削除容易性を担保する設計方針の決定
- テスト設計: 検証マトリクスの定義

## 参照資料

| 資料名                         | パス                                                                                         | 用途                                       |
| ------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Phase 1 成果物                 | `outputs/phase-1/requirements-definition.md`                                                 | 要件・AC-1〜AC-6 参照                      |
| 対象コンポーネント             | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                | renderQuestion / 既存 Q5 ロジック確認      |
| テストファイル                 | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | テスト追加先の現状確認                     |
| resolveExternalIntegration実装 | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                           | selectedOptions[0] 参照パターンの確認      |
| 既存バッジスタイル             | `packages/ui/src/` 配下                                                                      | 再利用可能なバッジコンポーネントの有無確認 |

## 実行手順

### 1. バッジ表示制御方式の決定

#### 案A: Q5キー分岐方式

`renderQuestion` 内で `key === "q5"` の条件分岐を用い、Q5 専用のレンダリングロジックを追加する。

```typescript
// renderQuestion 内のボタンレンダリング部分に追加
{q.options.map((opt, optIdx) => {
  const isMainTool = shouldShowMainToolBadge({
    questionKey: key,
    optionValue: opt,
    selectedOptions,
  });

  return (
    <button
      key={opt}
      type="button"
      onClick={() => handleOptionSelect(key, opt)}
      aria-pressed={selectedOptions.includes(opt)}
      className={/* 既存クラス */}
    >
      {opt}
      {isMainTool && <MainToolBadge />}
    </button>
  );
})}
```

**長所**: 変更範囲が最小限。Q5 以外の設問に影響なし。削除時は `key === "q5"` の条件ブロックのみ除去でよい。
**短所**: `renderQuestion` 内に Q5 固有ロジックが混在する（ただし `isQ5Required` で先例あり）。

#### 案B: showPrimaryIndicator フラグ方式

`QUESTIONS` 定義に `showPrimaryIndicator?: boolean` フィールドを追加し、Q5 定義に `true` をセットする。

```typescript
// QUESTIONS 定義（概念）
{ key: "q5", label: "...", options: [...], showPrimaryIndicator: true }

// renderQuestion 内
const showPrimaryIndicator = (q as QuestionWithIndicator).showPrimaryIndicator ?? false;
```

**長所**: 設問定義レイヤーで制御できる。将来他の設問にも適用しやすい。
**短所**: QUESTIONS 型定義の変更が必要。削除時に型定義・定数・renderQuestion の3箇所を修正する必要がある。

#### 採用方針の判断基準

| 観点               | 案A（Q5キー分岐） | 案B（フラグ方式） |
| ------------------ | :---------------: | :---------------: |
| 変更範囲の最小化   |        優         |        劣         |
| 削除容易性（AC-4） |        優         |        劣         |
| 拡張性             |        劣         |        優         |
| isQ5Required先例   |       あり        |       なし        |
| QUESTIONS型変更    |       不要        |       必要        |

**採用**: 案A（Q5キー分岐方式）を採用する。理由は削除容易性（AC-4）の優先度が高く、`isQ5Required` という先例があり、本タスクは暫定対応であるため拡張性よりも変更最小・削除容易を重視する。

### 2. バッジコンポーネントの設計

#### 2-1. バッジのスタイル設計

既存の `renderQuestion` 内で使用されている「選択済み」バッジのスタイルを参考に、Tailwind CSS で統一されたバッジを実装する。

```typescript
const MAIN_TOOL_BADGE_ENABLED = true;

function shouldShowMainToolBadge({
  questionKey,
  optionValue,
  selectedOptions,
}: MainToolBadgeProps): boolean {
  return (
    MAIN_TOOL_BADGE_ENABLED &&
    questionKey === "q5" &&
    selectedOptions.length >= 2 &&
    selectedOptions[0] === optionValue
  );
}
```

- 既存「選択済み」バッジ（`rounded-full bg-[var(--bg-primary)] px-2 py-1 text-[11px]`）のスタイルと統一感を持たせる
- バッジは `bg-blue-100 text-blue-800` のピル型で補助情報として表示する
- フォントサイズを `text-xs` とし、ボタンラベルより小さく表示する

#### 2-2. ボタンとバッジの配置

```typescript
<button
  key={opt}
  type="button"
  onClick={() => handleOptionSelect(key, opt)}
  aria-pressed={selectedOptions.includes(opt)}
  aria-labelledby={optionLabelId}
  aria-describedby={isMainTool ? mainToolBadgeId : undefined}
  className={[/* 既存クラス */].join(" ")}
>
  <span id={optionLabelId}>{opt}</span>
  {isMainTool && (
    <span
      id={mainToolBadgeId}
      aria-label="主ツールとして使用される"
      className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
    >
      主ツール
    </span>
  )}
</button>
```

- `aria-labelledby` でボタン名を選択肢テキストに固定する
- `aria-describedby` でバッジを補助情報として関連付ける
- ボタン内部を `inline-flex items-center` にして、テキストとバッジを横並びにする

### 3. aria-label 設計

AC-3「`aria-label` に『主ツールとして使用される』情報が含まれる」の対応:

| 選択状態               | aria-label の値                                      | 理由                                             |
| ---------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| Q5・先頭・複数選択時   | `aria-label="主ツールとして使用される"` を持つバッジ | 補助ラベルとして意味を伝える                     |
| Q5・先頭以外・複数選択 | `undefined`                                          | 余計な情報を付加しない                           |
| Q5・単一選択時         | `undefined`                                          | AC-2: バッジ非表示のため aria-label も付加しない |
| Q5 以外の設問          | `undefined`                                          | 変更なし                                         |

### 4. AC-4（削除容易性）への対応方針

`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` 完了後にバッジ表示が不要になった場合の削除手順を最小化するための設計方針:

1. **バッジロジックの局所化**: `isMainTool` 変数と `MainToolBadge` コンポーネントを `renderQuestion` 内に閉じ込め、外部 state・context・props への影響をゼロにする
2. **削除対象の明示**: 削除時に変更するのは以下の箇所のみ
   - `ConversationRoundStep.tsx`: `isMainTool` 計算・`aria-label` 条件分岐・`<MainToolBadge />` の呼び出し・`MainToolBadge` コンポーネント定義
   - `ConversationRoundStep.test.tsx`: バッジ表示に関するテストケース（`describe` ブロック単位で削除可能）
3. **TODO コメントの付与**: 実装時に削除予定である旨と関連タスク ID をコメントで記載する

```typescript
// Q5 専用の主ツール判定
const isMainTool = shouldShowMainToolBadge({
  questionKey: key,
  optionValue: opt,
  selectedOptions,
});
```

### 5. テスト設計（検証マトリクス）

| テストケース ID | テスト内容                                                                | 対象状態                         | 期待結果                                     | AC対応 |
| --------------- | ------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------- | ------ |
| TC-1            | Q5 で2ツール選択時に先頭ツールに「主ツール」バッジあり                    | selectedOptions: ["A", "B"]      | `getByText("主ツール")` が存在する           | AC-1   |
| TC-2            | Q5 で2ツール選択時に2番目ツールにバッジなし                               | selectedOptions: ["A", "B"]      | 2番目ボタン内に「主ツール」テキストなし      | AC-1   |
| TC-3            | Q5 で1ツールのみ選択時にバッジ非表示                                      | selectedOptions: ["A"]           | `queryByText("主ツール")` が null            | AC-2   |
| TC-4            | Q5 未選択時にバッジ非表示                                                 | selectedOptions: []              | `queryByText("主ツール")` が null            | AC-2   |
| TC-5            | Q5 先頭ツールの `MainToolBadge` aria-label に「主ツールとして使用される」 | selectedOptions: ["A", "B"]      | `aria-label` が `"主ツールとして使用される"` | AC-3   |
| TC-6            | Q5 以外の設問（例: Q3）でバッジ非表示                                     | Q3 selectedOptions: ["定期実行"] | `queryByText("主ツール")` が null            | AC-1   |
| TC-7            | Q5 で3ツール選択時に先頭のみバッジあり                                    | selectedOptions: ["A", "B", "C"] | "A" のみに「主ツール」バッジが存在する       | AC-1   |

#### テストコマンド

```bash
# ConversationRoundStep のテスト実行
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

### 6. 設計上の判断記録

| 判断事項                  | 採用方針                        | 理由                                                                 |
| ------------------------- | ------------------------------- | -------------------------------------------------------------------- |
| バッジ制御方式            | 案A（Q5キー分岐）               | 削除容易性優先・isQ5Required 先例あり・変更範囲最小                  |
| バッジコンポーネント形式  | インライン定義（MainToolBadge） | 小規模タスクのため独立ファイル不要・削除時の変更箇所を最小化         |
| バッジスタイルトークン    | `bg-blue-100 text-blue-800`     | 既存バッジと揃えつつ、補助ラベルとして見分けやすくする               |
| aria-label 付与条件       | isMainTool 時のみ               | 不要な aria-label は付加しない（アクセシビリティベストプラクティス） |
| renderQuestion との共通化 | 変更しない（Q5分岐のみ追加）    | Q3/Q4 汎用 renderQuestion を崩さない（タスク指示書の注意事項）       |
| TODO コメント             | 付与必須                        | UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001 完了時の削除ガイドとして    |

## 統合テスト連携【必須】

| 判定項目             | 基準 | 結果 |
| -------------------- | ---- | ---- |
| ユニットテストLine   | 80%+ | PASS |
| ユニットテストBranch | 60%+ | PASS |
| 型チェック           | PASS | PASS |

## 成果物

| 成果物 | パス                        | 説明                                       |
| ------ | --------------------------- | ------------------------------------------ |
| 設計書 | `outputs/phase-2/design.md` | 制御方式・コンポーネント設計・判断記録一覧 |

## 完了条件

- [ ] バッジ表示制御方式（案A: Q5キー分岐）を決定済み
- [ ] `MainToolBadge` インラインコンポーネントの Tailwind CSS スタイルが確定済み
- [ ] `isMainTool` の計算ロジック（Q5・複数選択・先頭一致）が確定済み
- [ ] aria-label の付与条件（isMainTool 時のみ）が確定済み
- [ ] AC-4 対応方針（TODO コメント・削除対象箇所の明示）が確定済み
- [ ] 検証マトリクス（TC-1〜TC-7）が定義済み
- [ ] Q3/Q4 汎用 renderQuestion への影響なしが確認済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. バッジ表示制御方式の比較・決定（案A vs 案B）
2. MainToolBadge コンポーネント設計
3. isMainTool ロジック設計
4. aria-label 設計
5. AC-4（削除容易性）対応方針の確定
6. テスト設計（検証マトリクス TC-1〜TC-7）
7. 設計判断の記録
8. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 3: 設計レビュー
