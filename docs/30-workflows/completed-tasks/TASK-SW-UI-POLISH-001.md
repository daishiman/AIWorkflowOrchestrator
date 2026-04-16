# スキルウィザード UI仕上げ（CSS変数監査・カテゴリ選択上限・アニメーション追加）- タスク指示書

## メタ情報

```yaml
issue_number: 2157
task_id: TASK-SW-UI-POLISH-001
status: open
priority: low
scale: small
task_type: VISUAL
```

| 項目         | 内容                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| タスクID     | TASK-SW-UI-POLISH-001                                                          |
| タスク名     | スキルウィザード UI仕上げ（CSS変数監査・カテゴリ選択上限・アニメーション追加） |
| 分類         | UI改善（VISUAL）                                                               |
| 対象機能     | スキルウィザード / SkillCreateWizard / SkillInfoStep / InterviewProgressBar    |
| 優先度       | 低（`priority:low`）                                                           |
| 見積もり規模 | 小規模（`scale:small`）                                                        |
| ステータス   | 未実施（`status:open`）                                                        |
| 発見元       | TASK-SW-FIX-UI-001 Phase 12 改善候補検出（2026-04-14）                         |
| 発見日       | 2026-04-14                                                                     |
| タスク分類   | VISUAL タスク（CSS変数監査・UX改善・アニメーション追加）                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SW-FIX-UI-001（スキルウィザード UI整合性修正）の Phase 12 ドキュメント更新において、4件の改善候補が検出された。いずれも機能破壊レベルの問題ではないが、UI の一貫性・UX の洗練度を高めるための仕上げ項目である。TASK-SW-FIX-UI-001 ではスコープ外として分離され、本タスクとして独立した。

### 1.2 問題点・課題

**改善候補1: SkillCreateWizard 残存ハードコード確認（中優先度）**

TASK-SW-FIX-UI-001 で Step 0 の「次へ」ボタンと LLM モードの「次へ」ボタンを CSS 変数（`--status-primary` / `--text-inverse`）に統一したが、LLM モード以外のボタン（例: template モードのアクションボタン、戻るボタン等）に `bg-blue-600` がまだ残存していないか追加確認が必要である。残存箇所があればテーマ切替時に色の不一致が発生する。

**改善候補2: カテゴリ選択上限（低優先度）**

TASK-SW-FIX-UI-001 で `SkillInfoFormData.category` を `SkillCategory[]` に変更し複数選択を可能にしたが、現在は選択数の上限が設けられていない。全カテゴリ（6件）を選択できる状態であり、UX 観点では3〜5件の上限を設けることで「すべてに該当」という意味のない選択を防止し、ユーザーに適切な分類を促せる。

**改善候補3: カテゴリ解除アニメーション（低優先度）**

カテゴリボタンのトグル選択時にフェードアニメーションを追加すると、選択・解除の状態遷移がユーザーに視覚的に伝わりやすくなる。現在は即時切り替えのため、素早い操作時に状態変化を見逃す可能性がある。

**改善候補4: ProgressBar アニメーション（低優先度）**

TASK-SW-FIX-UI-001 で `InterviewProgressBar` の `currentQuestion` を動的計算に変更したが、値の変化時に CSS transition を適用していない。CSS 定義には transition 用のプロパティが既に存在する可能性があり、それを活用するだけで視覚的なフィードバックが向上する。

### 1.3 放置した場合の影響

- テーマ切替時に一部ボタンの色が不一致のまま残留する可能性がある（改善候補1）
- 全カテゴリを選択する意味のない操作が可能なままとなる（改善候補2）
- カテゴリのトグル状態変化がユーザーに伝わりにくい（改善候補3）
- ProgressBar の進捗変化が視覚的にスムーズでない（改善候補4）

いずれも機能的な破壊は発生しないが、ウィザード全体の視覚品質と UX の洗練度が向上しない。

---

## 2. 何を達成するか（What）

### 2.1 目的

TASK-SW-FIX-UI-001 で実施した UI 統一の仕上げとして、CSS 変数のハードコード残存監査、カテゴリ選択 UX の改善、状態遷移アニメーションの追加を行い、スキルウィザードの視覚品質を完成させる。

### 2.2 最終ゴール

1. スキルウィザード関連ファイルに `bg-blue-600` 等のハードコードカラークラスが 0 件であること
2. カテゴリ選択に上限（推奨: 3〜5件）が設けられ、上限到達時にユーザーへフィードバックが表示されること
3. カテゴリボタンの選択・解除時にフェードアニメーション（opacity transition）が適用されること
4. `InterviewProgressBar` の進捗変化時に CSS transition アニメーションが適用されること
5. 既存の正常フロー（カテゴリ選択・インタビュー進行）に回帰影響がないこと

### 2.3 スコープ

**含むもの**:

- `SkillCreateWizard.tsx` 全体の `bg-blue-600` / `bg-blue-500` 等ハードコードカラー監査と CSS 変数への置換
- `SkillInfoStep.tsx` のカテゴリ選択上限ロジック追加（`MAX_CATEGORY_COUNT` 定数定義）
- `SkillInfoStep.tsx` のカテゴリボタンに `transition-opacity` / `transition-colors` クラス追加
- `InterviewProgressBar` コンポーネントへの `transition-all` / `duration-300` クラス追加
- 上限到達時のユーザーフィードバック UI（disabled 状態 or ツールチップ）
- 対応するユニットテスト

**含まないもの**:

- `SkillCategory` union 型定義の変更
- カテゴリ選択順序の並び替え機能
- ProgressBar のデザイン変更（形状・色変更）
- ウィザード以外のコンポーネントの CSS 監査
- Main Process / IPC 契約の変更

### 2.4 成果物

- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`（CSS 変数監査・修正）
- `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`（カテゴリ上限・アニメーション）
- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`（ProgressBar アニメーション）
- 対応するテストファイル（新規テストケース追加）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SW-FIX-UI-001（Wave C）が完了していること
- `SkillInfoFormData.category` が `SkillCategory[]` 型に変更済みであること
- CSS 変数（`--status-primary` / `--text-inverse`）がテーマファイルに定義済みであること
- `InterviewProgressBar` の `currentQuestion` が動的計算に変更済みであること

### 3.2 依存タスク

| タスクID           | 関係     | 理由                                                               |
| ------------------ | -------- | ------------------------------------------------------------------ |
| TASK-SW-FIX-UI-001 | 必須先行 | カテゴリ複数選択・ボタン統一・ProgressBar 動的化が完了している前提 |

### 3.3 必要な知識

- Tailwind CSS の transition ユーティリティクラス（`transition-opacity`, `duration-300`, `ease-in-out`）
- CSS 変数と Tailwind CSS の `bg-[var(--xxx)]` 構文
- React のコンポーネント Props と条件付きスタイリング
- `SkillCategory` union 型の全メンバー一覧

### 3.4 推奨アプローチ

**改善候補1（CSS 変数監査）**: `grep -rn "bg-blue-" apps/desktop/src/renderer/components/skill/` で残存箇所を一括検出し、CSS 変数に置換する。ホバー状態（`hover:bg-blue-700` 等）も確認対象に含める。

**改善候補2（カテゴリ上限）**: `SkillInfoStep.tsx` に `MAX_CATEGORY_COUNT = 3` 定数を定義し、`handleCategoryClick` 内で `formData.category.length >= MAX_CATEGORY_COUNT` の場合に追加を無視する。未選択ボタンに `disabled` 状態を適用し、ツールチップで上限に達した旨を通知する。

**改善候補3（カテゴリ解除アニメーション）**: カテゴリボタンの `className` に `transition-all duration-200 ease-in-out` を追加する。選択状態と非選択状態の `opacity` / `scale` / `border-color` の差分で視覚的遷移を表現する。

**改善候補4（ProgressBar アニメーション）**: ProgressBar の width を制御する要素に `transition-all duration-300 ease-in-out` を追加する。CSS 定義に既存の transition が含まれていればそれを活用する。

---

## 4. 実行手順

### Phase 1: 要件定義

- `grep -rn "bg-blue-" apps/desktop/src/renderer/components/skill/` でハードコードカラーの残存箇所を棚卸しする
- `SkillCategory` の全メンバー数を確認し、カテゴリ上限値の妥当性を検討する（全6件であれば上限3がバランス良い）
- `InterviewProgressBar` の現行 CSS クラスを確認し、transition の追加方針を確定する
- 既存コードの命名規則（camelCase / kebab-case 等）を分析し記録する
- 含む/含まないスコープ境界を明確化する

### Phase 2: 設計

- 改善候補1: 残存ハードコード一覧と CSS 変数への置換設計（ホバー状態含む）
- 改善候補2: `MAX_CATEGORY_COUNT` 定数と上限ガード設計。上限到達時の UI フィードバック方式（disabled + ツールチップ or 視覚的フィードバック）の確定
- 改善候補3: カテゴリボタンの transition クラス設計。選択・非選択状態の CSS プロパティ差分一覧
- 改善候補4: ProgressBar の transition 適用設計。既存 CSS 定義との整合性確認

### Phase 3: 設計レビュー

- 4件の改善設計を独立レビュー
- CSS 変数未定義テーマでのフォールバック動作確認
- カテゴリ上限値の UX 妥当性確認
- transition アニメーションのパフォーマンス影響評価
- PASS / MINOR / MAJOR / CRITICAL の判定（MAJOR 以上は Phase 2 に差し戻し）

### Phase 4: テスト作成（TDD）

**CSS 変数監査テスト**:

- スキルウィザード関連ファイルに `bg-blue-600` / `bg-blue-500` が含まれないことを検証する静的テスト
- ボタン要素が `--status-primary` を参照する CSS 変数クラスを持つことを検証するテスト

**カテゴリ上限テスト（SkillInfoStep.test.tsx）**:

- カテゴリ3件選択後に4件目を選択しても追加されないことを検証するテスト
- 上限到達時に未選択ボタンが disabled になることを検証するテスト
- 上限到達状態で選択済みカテゴリを解除すると再選択が可能になることを検証するテスト

**アニメーションテスト**:

- カテゴリボタンに `transition` 関連クラスが含まれることを検証するテスト
- ProgressBar に `transition` 関連クラスが含まれることを検証するテスト

### Phase 5: 実装

**Step 1: CSS 変数監査と修正**

- `SkillCreateWizard.tsx` の全ボタン要素を検索し、`bg-blue-*` / `hover:bg-blue-*` を `bg-[var(--status-primary)]` / `hover:opacity-90` に置換する
- ダークテーマ・ライトテーマの両方で表示確認

**Step 2: カテゴリ選択上限追加**

```typescript
// SkillInfoStep.tsx
const MAX_CATEGORY_COUNT = 3;

const handleCategoryClick = (value: SkillCategory) => {
  if (formData.category.includes(value)) {
    // 解除は常に許可
    const next = formData.category.filter((c) => c !== value);
    onFormDataChange({ ...formData, category: next });
  } else if (formData.category.length < MAX_CATEGORY_COUNT) {
    // 上限未満なら追加
    const next = [...formData.category, value];
    onFormDataChange({ ...formData, category: next });
  }
  // 上限到達時は何もしない（ボタンは disabled 表示）
};

const isAtLimit = formData.category.length >= MAX_CATEGORY_COUNT;
```

**Step 3: カテゴリ解除アニメーション追加**

```tsx
// カテゴリボタンの className に追加
className={cn(
  "transition-all duration-200 ease-in-out",
  isSelected
    ? "bg-[var(--status-primary)] text-[var(--text-inverse)] scale-[1.02]"
    : isAtLimit
      ? "opacity-40 cursor-not-allowed"
      : "hover:scale-[1.01]"
)}
```

**Step 4: ProgressBar アニメーション追加**

```tsx
// ProgressBar の幅制御要素に追加
className="transition-all duration-300 ease-in-out"
style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
```

### Phase 6: テスト拡充

- エッジケース: カテゴリ上限 0 件選択時（初期状態）に全ボタンが有効であること
- エッジケース: カテゴリ上限到達後に1件解除→再選択のサイクルテスト
- ProgressBar が 0/6 → 6/6 の全パターンで transition クラスを保持すること

### Phase 7: カバレッジ確認

- `handleCategoryClick` の全分岐（選択・解除・上限到達）をカバー
- ProgressBar の transition クラス存在確認のカバレッジ
- CSS 変数監査の grep ベース静的テストのカバレッジ

### Phase 8: リファクタリング

- `MAX_CATEGORY_COUNT` を共有定数ファイルに抽出する検討
- transition クラスの共通化（ボタン用・ProgressBar 用の Tailwind ユーティリティを整理）
- 不要な `as` 型アサーションや `any` の除去

### Phase 9: 品質保証

```bash
# desktop パッケージ全チェック
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop test

# bg-blue-* 残存確認（0件であること）
grep -rn "bg-blue-" apps/desktop/src/renderer/components/skill/ --include="*.tsx"
```

### Phase 10: 最終レビュー

- 改善候補1〜4 の受け入れ基準をすべて満たしていることを確認
- CSS 変数監査の grep 結果が 0 件であることを確認
- PASS / MINOR は Phase 11 へ、MAJOR は Phase 8 に差し戻し

### Phase 11: 手動テスト（VISUAL）

ライトテーマ・ダークテーマ両方で以下を目視確認する。

- 全ボタンの色が CSS 変数に基づいて正しく表示されること
- カテゴリ3件選択後に4件目が disabled になること
- カテゴリ選択・解除時にフェードアニメーションが動作すること
- ProgressBar が回答進捗に応じてスムーズにアニメーションすること
- ウィザード全体の操作フロー（Step 0 → インタビュー → 生成）に回帰影響がないこと

### Phase 12: ドキュメント更新

- `SkillInfoStep.tsx` の `MAX_CATEGORY_COUNT` に JSDoc コメント追加
- transition クラスの設計意図をコードコメントで明記
- 詳細仕様書と実装の整合性確認

### Phase 13: PR作成

ユーザーの明示的承認を得た後に実施する。

```bash
# ブランチ作成
git checkout -b fix/task-sw-ui-polish-001-wizard-ui-polish

# コミット
git commit -m "fix(skill-wizard): TASK-SW-UI-POLISH-001 UI仕上げ（CSS変数監査・カテゴリ選択上限・アニメーション追加）"

# push
git push -u origin fix/task-sw-ui-polish-001-wizard-ui-polish

# PR 作成
gh pr create \
  --title "fix(skill-wizard): TASK-SW-UI-POLISH-001 UI仕上げ（CSS変数監査・カテゴリ上限・アニメーション）" \
  --body "..."
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] スキルウィザード関連ファイルに `bg-blue-600` / `bg-blue-500` 等のハードコードカラークラスが 0 件
- [ ] カテゴリ選択に上限（`MAX_CATEGORY_COUNT`）が設けられ、上限到達時に未選択ボタンが disabled になる
- [ ] カテゴリボタンの選択・解除時にフェードアニメーションが動作する
- [ ] `InterviewProgressBar` の進捗変化時に CSS transition アニメーションが動作する
- [ ] 既存の正常フロー（カテゴリ選択・インタビュー進行・スキル生成）に回帰影響がない

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通過する
- [ ] `pnpm --filter @repo/desktop lint` がエラーなしで通過する
- [ ] `pnpm --filter @repo/desktop test` が全件パスする
- [ ] `bg-blue-` のハードコードクラスがウィザード関連ファイルに存在しない
- [ ] `any` 型の新規使用がない
- [ ] ライトテーマ・ダークテーマの両方で目視確認が完了している

### ドキュメント要件

- [ ] `MAX_CATEGORY_COUNT` の JSDoc コメントが定義理由を含む
- [ ] transition クラスの設計意図がコードコメントに記載されている

---

## 6. 検証方法

### テストケース

| テストID | 対象           | 入力/操作                                            | 期待結果                                     | 備考                  |
| -------- | -------------- | ---------------------------------------------------- | -------------------------------------------- | --------------------- |
| TC-01    | CSS変数監査    | `grep -rn "bg-blue-" skill/` 実行                    | 該当なし（0件）                              | 静的テスト            |
| TC-02    | カテゴリ上限   | 3件選択後に4件目のカテゴリをクリック                 | `category` の長さが3のまま変化しない         | 上限ガード確認        |
| TC-03    | カテゴリ上限   | 上限到達後に未選択ボタンの状態を確認                 | disabled / opacity-40 クラスが適用されている | UI フィードバック確認 |
| TC-04    | カテゴリ上限   | 上限到達後に選択済みカテゴリを1件解除                | 未選択ボタンの disabled が解除される         | 解除→再選択サイクル   |
| TC-05    | カテゴリ解除   | 選択済みカテゴリをクリックで解除（上限未到達時）     | `category` から該当値が除去される（回帰）    | 既存トグル動作保持    |
| TC-06    | アニメーション | カテゴリボタンの className を確認                    | `transition-all` / `duration-200` を含む     | CSS クラス確認        |
| TC-07    | アニメーション | ProgressBar の className を確認                      | `transition-all` / `duration-300` を含む     | CSS クラス確認        |
| TC-08    | ProgressBar    | 全問未回答時のProgressBar表示                        | 質問 1/6 表示、width が約 16.7%              | 回帰テスト            |
| TC-09    | ProgressBar    | 全問回答済み時のProgressBar表示                      | 質問 6/6 表示、width が 100%                 | 回帰テスト            |
| TC-10    | 回帰           | ウィザード全体フロー（Step 0 → インタビュー → 生成） | 正常完了（カテゴリ上限内で操作）             | E2E 回帰              |

---

## 7. リスクと対策

| リスク                                                       | 影響度 | 発生確率 | 対策                                                                                       |
| ------------------------------------------------------------ | ------ | -------- | ------------------------------------------------------------------------------------------ |
| カテゴリ上限値が厳しすぎてユーザーが必要なカテゴリを選べない | 中     | 中       | Phase 1 で `SkillCategory` 全メンバー数を確認し、上限値を全体の半数程度に設定する          |
| transition アニメーションがパフォーマンス劣化を引き起こす    | 低     | 低       | `will-change: transform, opacity` を避け、GPU 合成プロパティ（opacity, transform）のみ使用 |
| CSS 変数未定義のカスタムテーマでボタンが透明になる           | 中     | 低       | fallback 値を含む CSS 変数参照（`var(--status-primary, #2563eb)`）を検討する               |
| ホバー状態の CSS 変数置換が Tailwind hover クラスと競合する  | 中     | 中       | ホバー状態は `hover:opacity-90` で統一し、色指定は CSS 変数に集約する                      |
| `MAX_CATEGORY_COUNT` の変更が他コンポーネントに影響する      | 低     | 低       | 定数を `SkillInfoStep.tsx` ローカルに定義し、影響範囲を限定する                            |

---

## 8. 参照情報

### 関連ドキュメント

| 資料名                    | パス                                                            | 説明                                  |
| ------------------------- | --------------------------------------------------------------- | ------------------------------------- |
| TASK-SW-FIX-UI-001 仕様書 | `docs/30-workflows/unassigned-task/TASK-SW-FIX-UI-001.md`       | 本タスクの改善候補の発見元            |
| Phase 12 改善候補記録     | `docs/30-workflows/skill-wizard-bugfix-wave/WC-par-03b-fix-ui/` | TASK-SW-FIX-UI-001 の Phase 12 成果物 |
| バグ修正ウェーブ全体      | `docs/30-workflows/skill-wizard-bugfix-wave/index.md`           | 問題番号・全体コンテキスト            |

### 関連ファイル

| ファイル                                                                      | 変更種別 | 内容                               |
| ----------------------------------------------------------------------------- | -------- | ---------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | 修正     | CSS 変数監査・残存ハードコード修正 |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`         | 修正     | カテゴリ上限・アニメーション追加   |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 修正     | ProgressBar アニメーション追加     |

---

## 9. 備考

### 苦戦箇所

| 項目                                       | 内容                                                                                                                                                                                                                                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SkillInfoFormData.category` 型変更の波及  | TASK-SW-FIX-UI-001 で `SkillCategory \| null` から `SkillCategory[]` への型変更を行った際、多くのファイルで `.includes()` への書き換えが必要だった。本タスクの上限ロジック追加は `handleCategoryClick` 内の分岐追加に留まるため影響は限定的だが、型変更の波及範囲を事前に確認しておくこと |
| CSS 変数とホバー状態の整合性               | TASK-SW-FIX-UI-001 で CSS 変数（`--status-primary`, `--text-inverse`）へ移行した際、ホバー状態の定義が CSS 変数側に移動するため、Tailwind CSS の `hover:bg-blue-700` 等のホバークラスとの整合性に注意が必要だった。本タスクの監査では残存する hover クラスも含めて確認する必要がある      |
| `currentQuestion` の動的計算のエッジケース | TASK-SW-FIX-UI-001 で `currentQuestion` を `Math.max(1, answeredCount)` で動的計算するように変更したが、0 問回答のエッジケース処理が重要だった。本タスクで ProgressBar にアニメーションを追加する際、0% → 16.7%（1/6）の遷移がスムーズに見えるか目視確認が必要                            |
| Tailwind transition クラスの重複           | Tailwind CSS の `transition-all` は `transition-property: all` を設定するため、不要なプロパティまで transition 対象になる可能性がある。パフォーマンスを考慮し `transition-colors transition-opacity` のように個別指定するか `transition-all` で許容するかを Phase 2 で方針決定すること    |

### 発見経緯

TASK-SW-FIX-UI-001（スキルウィザード UI整合性修正）の Phase 12 ドキュメント更新において、4件の改善候補が検出された。いずれも TASK-SW-FIX-UI-001 の受け入れ基準（AC-1〜AC-6）には含まれないスコープ外の項目であり、未タスク仕様書として独立させた。

改善候補1（CSS 変数監査）は中優先度、改善候補2〜4（カテゴリ上限・アニメーション）は低優先度である。4件とも小規模な変更で完結するため、1つのタスクにまとめて効率的に実施する。
