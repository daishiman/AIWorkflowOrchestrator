# Phase 2: 設計 — ConstraintChips

## メタ情報

| 項目       | 値                                                                                    |
| ---------- | ------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-LIFECYCLE-CONSTRAINT-CHIPS-001                                               |
| Phase      | 2 / 13                                                                                |
| 目的       | ConstraintChip（atom）と ConstraintChipList（molecule）のコンポーネント設計を確定する |
| 前提成果物 | `outputs/phase-1/requirements-analysis.md`（Phase 1 完了済み）                        |
| 成果物     | `outputs/phase-2/design-document.md`                                                  |

## 目的

Phase 1 で確定した要件をもとに、以下5点の設計を確定する。

1. `ConstraintChip`（atom）の Props インターフェース
2. `ConstraintChipList`（molecule）の Props インターフェースと内部ロジック
3. `SkillConstraint` 型定義の最終形
4. `SkillLifecyclePanel` への統合設計（state 管理・JSX 配置）
5. Apple HIG 準拠のビジュアルスタイル仕様

## 参照資料

| 資料                 | パス                                                                                      | 参照目的                                |
| -------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------- |
| Phase 1 成果物       | `outputs/phase-1/requirements-analysis.md`                                                | 確定済み要件・型定義案・DOM 配置位置    |
| UI/UX 正本           | `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md` L34–38               | create ステップ必須UI 仕様              |
| FilterChip atom      | `apps/desktop/src/renderer/components/atoms/FilterChip/index.tsx`                         | Props パターン・スタイル一貫性参照      |
| SkillLifecyclePanel  | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                      | 統合対象コンポーネント・既存 state 確認 |
| アーキテクチャルール | `.claude/rules/01-architecture.md`（Apple HIG カラーパレット・8px グリッド・角丸 8–12px） | ビジュアルスタイル仕様根拠              |
| コード品質ルール     | `.claude/rules/02-code-quality.md`（Atomic Design・boolean プレフィックス）               | コンポーネント設計規約                  |
| shared 型定義        | `packages/shared/src/` 配下                                                               | SkillConstraint 型配置先確認            |

## 実行手順

### Task 1: ConstraintChip（atom）の Props インターフェースを設計する

設計するインターフェース:

```typescript
export interface ConstraintChipProps {
  label: string; // chip に表示するテキスト（空文字列は不可）
  onRemove: () => void; // ×ボタン押下時に呼ぶコールバック
  disabled?: boolean; // true のとき ×ボタンを非活性にする（デフォルト: false）
}
```

設計決定事項を明記すること:

- `isSelected` を持たない理由（FilterChip との差異: ConstraintChip は「削除可能なタグ」であり「選択トグル」ではない）
- `variant` を持たない理由（Phase 1 要件で variant 分岐は不要と判定された場合）、または `variant` を持つ場合の値定義
- `×` ボタンの実装方法（`<button>` タグ内の `<span>` か、`lucide-react` の `X` アイコンか）とその選択根拠

ARIA 設計:

- chip 全体の role: `listitem`（`ConstraintChipList` の `role="list"` 内に配置するため）
- `×` ボタンの `aria-label`: `"${label} を削除"` の形式（`label` の値を埋め込む）

### Task 2: ConstraintChipList（molecule）の Props インターフェースと内部ロジックを設計する

設計するインターフェース:

```typescript
export interface ConstraintChipListProps {
  constraints: SkillConstraint[]; // 表示する制約条件リスト
  onAdd: (label: string) => void; // 入力確定時（Enter キーまたは追加ボタン）に呼ぶコールバック
  onRemove: (id: string) => void; // 特定 chip の削除時に呼ぶコールバック（id で特定）
  maxConstraints?: number; // 追加上限数（デフォルト: 10）
  disabled?: boolean; // true のとき入力フィールドと chip の×ボタンを無効化
  placeholder?: string; // 入力フィールドのプレースホルダー（デフォルト: "制約条件を追加…"）
}
```

設計決定事項を明記すること:

- `onAdd` のトリガー条件: Enter キー押下時（IME 確定中は除く: `event.isComposing === true` のとき無視）
- `maxConstraints` 超過時の挙動: 入力フィールドを `disabled` にして追加不可にする（エラーメッセージは表示しない）。プレースホルダーを「制約条件は最大{maxConstraints}件までです」に変更する。`aria-disabled="true"` を付与し、`aria-describedby` で上限到達の理由を補足する。
- `constraints` が空のときの表示: 入力フィールドのみ表示（chip 行なし）
- Backspace キー挙動: 入力フィールドが空の状態で Backspace を押した場合、最後に追加された chip を削除する。Delete キーは同様に最後の chip を削除する。この挙動は一般的なタグ入力 UI のパターンに準拠する。

内部 state の設計:

- `inputValue: string` を `useState` で管理する（入力中テキスト）
- `onAdd` / `onRemove` は親（`SkillLifecyclePanel`）が `constraints` state を管理し、コールバックで通知する（Controlled コンポーネントパターン）

### Task 3: SkillConstraint 型定義の最終形を確定する

Phase 1 の判定結果をもとに、以下を確定する。

```typescript
// 配置先: packages/shared/src/agent/types.ts（shared配置の場合）
// または: SkillLifecyclePanel.tsx 内のローカル型定義（local配置の場合）
export interface SkillConstraint {
  id: string; // 一意識別子（crypto.randomUUID() または `constraint-${Date.now()}-${index}` で生成）
  label: string; // ユーザーが入力した制約条件テキスト（trim 後、空文字列は不可）
  category?: string; // 任意のカテゴリ分類（Phase 1 調査で必要性が確定した場合のみ）
}
```

設計決定事項を明記すること:

- 配置先（`@repo/shared` か `SkillLifecyclePanel` ローカルか）とその根拠
- `id` 生成方式の選択根拠（`crypto.randomUUID()` vs `Date.now()` ベース）
- `category?` フィールドの採用可否の判定

### Task 4: SkillLifecyclePanel への統合設計を確定する

Phase 1 で特定した JSX 挿入位置をもとに、以下を設計する。

**state 追加設計:**

```typescript
const [constraints, setConstraints] = useState<SkillConstraint[]>([]);
```

**コールバック関数設計:**

```typescript
const handleAddConstraint = (label: string): void => {
  const trimmed = label.trim();
  if (!trimmed || constraints.length >= MAX_CONSTRAINTS) return;
  // 同一 label の重複追加を禁止する。重複時は追加せずに入力フィールドをクリアする。
  if (constraints.some((c) => c.label === trimmed)) return;
  setConstraints((prev) => [
    ...prev,
    { id: crypto.randomUUID(), label: trimmed },
  ]);
};

const handleRemoveConstraint = (id: string): void => {
  setConstraints((prev) => prev.filter((c) => c.id !== id));
};

const MAX_CONSTRAINTS = 10; // モジュールスコープ定数
// デフォルト値 10 の根拠:
// (1) UI スペースの確保（ConstraintChipList が create フォーム面積の 30% 以内に収まる）
// (2) LLM プロンプト長の制約（各制約は平均 20 トークン、10件で約 200 トークン）
// (3) ユーザーの認知負荷（Miller の法則: 7±2 を上限参考値とし、余裕を持たせて 10）
```

**JSX 配置設計:**

- Phase 1 で特定した textarea の JSX 位置の直下（または goal input セクション内）に `<ConstraintChipList>` を配置する
- `ConstraintChipList` は textarea と同じ `div` コンテナ内に配置し、8px のマージンで分離する

**handleCreate への連携設計:**

- `constraints` は任意入力（0件でも create を許可する）。制約条件は LLM プロンプトの精度向上に寄与するが、create 操作の必須条件ではない。
- `constraints` の値を `createSkill()` の引数に渡すか、渡さない（Phase 1 IPC 調査結果による）かを明記する
- 渡す場合: `createSkill({ request, constraints })` の引数拡張設計を記載する
- 渡さない場合: `constraints` を goal input テキストに埋め込む文字列変換ロジックを設計する

### Task 5: SkillCreatorAPI への constraints パラメータ追加設計を確定する

Phase 1 の IPC 整合性調査結果をもとに、以下のいずれかの設計を選択し根拠を明記する。

**選択肢 A: IPC 引数拡張あり**

- `SkillCreatorRuntimeApi.createSkill` 引数に `constraints?: SkillConstraint[]` を追加する
- Main Process 側の `skill:create` IPC ハンドラの引数スキーマを更新する
- この場合、P44/P45 準拠で引数名・型をPreload/Main 双方で一致させること

**選択肢 B: IPC 引数拡張なし（文字列埋め込み方式）**

- `constraints` をユーザーの `request` テキストに付記する（例: `${request}\n\n制約条件:\n${constraints.map(c => `- ${c.label}`).join('\n')}`）
- IPC 変更なしで実装できるが、制約条件の構造情報が失われる

選択した方式を明記し、その判定基準（IPC 変更コストと制約条件の構造保持の優先度）を記載する。

### Task 6: Apple HIG 準拠のビジュアルスタイルを設計する

`ConstraintChip` のスタイル設計:

> **注記**: ConstraintChip は `rounded-lg`（8px）を採用する。FilterChip の `rounded-full`（pill 形状）と異なるのは、ConstraintChip が削除操作（×ボタン）を持つタグ型コンポーネントであり、矩形に近い形状で削除ボタンの視認性を高めるため。

| 要素          | スタイル設計                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------- |
| コンテナ      | `inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1` （角丸: 8px = `rounded-lg`）        |
| 背景色        | `bg-[var(--bg-tertiary)]`（非選択状態と同等のニュートラル背景）                               |
| テキスト色    | `text-[var(--text-primary)]` / `text-sm font-medium`                                          |
| ×ボタン       | `ml-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]`                          |
| disabled 状態 | `opacity-50 cursor-not-allowed`                                                               |
| フォーカス    | `focus-visible:ring-2 focus-visible:ring-[var(--status-primary)] focus-visible:ring-offset-2` |

`ConstraintChipList` の入力フィールドスタイル設計:

| 要素           | スタイル設計                                                         |
| -------------- | -------------------------------------------------------------------- |
| 入力フィールド | `rounded-md border border-[var(--border-primary)] px-2 py-1 text-sm` |
| フォーカス     | `focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)]` |
| placeholder    | `placeholder:text-[var(--text-secondary)]`                           |
| disabled       | `disabled:opacity-50 disabled:cursor-not-allowed`                    |
| chip 行        | `flex flex-wrap gap-2 mt-2`（8px グリッド準拠: `gap-2` = 8px）       |

禁止事項（`01-architecture.md` 準拠）:

- Tailwind の `slate-*` 系カラーを使用しない
- `#007AFF`（systemBlue）を直接 hex で記述せず、`var(--status-primary)` を使用する

## 統合テスト連携

Phase 2 では設計仕様のみを確定し、テストコードは作成しない。以下を `design-document.md` に明記し、Phase 4 テスト設計に引き継ぐこと。

- `onAdd` の IME 確定中除外ロジック（`isComposing === true` のとき無視）のテスト方法
- `maxConstraints` 超過後の入力フィールド `disabled` 挙動のテスト
- `ConstraintChipList` が `role="list"` を持ち、各 chip が `role="listitem"` を持つことの ARIA テスト

## 多角的チェック観点

| 観点                  | チェック内容                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Atomic Design 準拠    | `ConstraintChip` は atom、`ConstraintChipList` は molecule として責務が分離されているか                             |
| FilterChip との一貫性 | 同系 UI（chip 形状）で別コンポーネントを作る理由が Props の意味的差異（削除可能なタグ vs 選択トグル）で説明できるか |
| Controlled パターン   | `constraints` state は親（`SkillLifecyclePanel`）が管理し、`ConstraintChipList` は Controlled コンポーネントか      |
| IPC 設計整合性        | 選択した IPC 連携方式（A or B）が P44/P45 に違反しないか                                                            |
| Apple HIG 準拠        | CSS変数（`--status-primary`, `--bg-tertiary`）を使用し、ハードコード hex カラーが存在しないか                       |
| アクセシビリティ      | `role="list"` / `role="listitem"` / `aria-label="${label} を削除"` が設計に含まれているか                           |
| 8px グリッド準拠      | `gap-2`（8px）, `px-2.5`（10px = 8+2 端数）の採用理由が記載されているか                                             |

## 成果物

### 必須出力ファイル

パス: `docs/30-workflows/skill-lifecycle-unification/tasks/step-07-par-task-10-constraint-chips-create-ui/outputs/phase-2/design-document.md`

必須セクション:

1. **ConstraintChip Props 定義**: 型定義コード + 設計決定事項（ARIA 含む）
2. **ConstraintChipList Props 定義**: 型定義コード + 内部ロジック設計（IME 考慮含む）
3. **SkillConstraint 型定義**: 最終形コード + 配置先・id 生成方式の根拠
4. **SkillLifecyclePanel 統合設計**: state 追加・コールバック・JSX 配置（行番号含む）の設計
5. **SkillCreatorAPI 連携設計**: 選択肢 A/B の判定と採用方式
6. **ビジュアルスタイル仕様**: Tailwind クラス一覧（テーブル形式）
7. **Phase 4 テスト設計への引き継ぎ事項**

## 完了条件

- [ ] `outputs/phase-2/design-document.md` が作成されている
- [ ] `ConstraintChipProps` の全フィールドが確定し、FilterChip との意味的差異が明記されている
- [ ] `ConstraintChipListProps` の全フィールドが確定し、Controlled コンポーネントパターンの採用が明記されている
- [ ] `SkillConstraint` 型の最終形と配置先（shared か local か）が確定している
- [ ] `SkillLifecyclePanel` への統合位置（行番号含む）と state 管理方針が設計されている
- [ ] IPC 連携方式（選択肢 A or B）が選択され、根拠が明記されている
- [ ] 全スタイル設計が CSS変数ベースで記述されており、ハードコード hex カラーが存在しない
- [ ] ARIA 属性設計（`role`, `aria-label`）が全コンポーネントに対して記載されている

## 次 Phase

Phase 3: 設計レビュー — `phase-3-design-review.md`

移行条件: 本 Phase の完了条件を全て満たしていること。
