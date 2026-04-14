# 実装ガイド: UI 整合性修正（TASK-SW-FIX-UI-001）

## Part 1: 中学生向け説明

### ラベルシールのたとえ

たとえば、あなたがノートにラベルシールを貼って整理しているとします。

以前のシステムは「1 冊のノートに 1 枚のラベルシールしか貼れない」ルールでした。数学のノートには「数学」のシールだけ。でも実際には、数学の応用問題のノートは「数学」と「応用」の 2 枚のシールを貼りたいですよね。

今回の修正で「何枚でもラベルシールを貼れる」ようになりました。スキルを作るとき、「自動化」と「外部連携」の両方のカテゴリを一度に選べます。貼ったシールをはがす（再クリックで解除する）こともできます。

### 進み具合の表示

以前は「ページ 1 なら 1/6、ページ 2 なら 4/6」と固定でした。たとえば 10 問あるテストで「1 ページ目は問 1、2 ページ目は問 6」と決め打ちするようなもの。でも実際は 3 問目まで答えたら「3/10」と表示される方が分かりやすい。

今回の修正で「実際にどこまで答えたか」を数えて表示するようになりました。

### ボタンの色統一

たとえば、教室のドアが赤だったり青だったりバラバラだと、どれが出入口か分かりにくい。今回は全部のボタンの色を「テーマカラー」に統一したので、どのボタンが重要か一目でわかるようになりました。

---

## Part 2: 技術者向け説明

### 1. 型変更: `SkillInfoFormData.category`

```typescript
// Before
category: SkillCategory | null

// After
category: SkillCategory[]
```

**影響範囲:**

- `packages/shared/src/types/skillCreator.ts` — 型定義本体
- `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts` — `===` → `.includes()`
- `apps/desktop/.../wizard/utils/inferSmartDefaults.ts` — 同上
- `apps/desktop/.../wizard/SkillInfoStep.tsx` — UI ロジック全面
- `apps/desktop/.../wizard/ConversationRoundStep.tsx` — `isQ5Required`
- `apps/desktop/.../wizard/ApplySummaryCard.tsx` — `isQ5Required`
- `apps/desktop/.../SkillCreateWizard.tsx` — デフォルト値・trackEvent
- `apps/desktop/.../phase11-task-ui-schedule-visual-picker.tsx` — テストハーネス

**subpath export 方針:** `@repo/shared/types/skillCreator` サブパスに閉じた変更。ルート barrel (`@repo/shared`) には影響なし。

### 2. トグルロジック: `handleCategoryClick`

```typescript
const handleCategoryClick = (value: SkillCategory) => {
  const next = formData.category.includes(value)
    ? formData.category.filter((c) => c !== value) // 解除
    : [...formData.category, value]; // 追加
  onFormDataChange({ ...formData, category: next });
};
```

- 空配列 `[]` を正常状態として維持（null は使わない）
- 全解除時 → `isNextEnabled = false`（category.length > 0 で判定）

### 3. ProgressBar 動的計算: `currentQuestion`

```typescript
const answeredCount = QUESTION_KEYS.filter((key) =>
  isQuestionAnswered(internalAnswers[key]),
).length;
const currentQuestion = Math.max(1, answeredCount);
```

- `Math.max(1, ...)`: 0 問回答でも「質問 0/6」とは表示しない
- `isQuestionAnswered`: `selectedOptions.length > 0 || freeText.trim() !== ""`

### 4. CSS 変数統一

| 旧                  | 新                             |
| ------------------- | ------------------------------ |
| `bg-blue-600`       | `bg-[var(--status-primary)]`   |
| `text-white`        | `text-[var(--text-inverse)]`   |
| `rounded`           | `rounded-lg`                   |
| `hover:bg-blue-700` | 削除（CSS 変数がホバーも管理） |

### 5. `buildSkillContext` での代表カテゴリ

```typescript
category: resolvePrimarySkillCategory(formData.category);
```

API や trackEvent など単一値を期待するコンテキストでは、入力順に依存しない `resolvePrimarySkillCategory()` を代表カテゴリとして使用。

### 6. エッジケース

| ケース                        | 挙動                                       |
| ----------------------------- | ------------------------------------------ |
| category が空配列 `[]`        | 「次へ」無効、`isQ5Required = false`       |
| 全カテゴリ選択（5 件）        | 正常動作、制限なし                         |
| 連続クリック（高速トグル）    | React state batching により安全            |
| `external-integration` を含む | `isQ5Required = true`（Q5 必須マーク表示） |

### 7. 設定可能なパラメータ

| パラメータ         | 現在値           | 場所                        |
| ------------------ | ---------------- | --------------------------- |
| 目的の最小文字数   | 10               | `SkillInfoStep.tsx`         |
| カテゴリ選択上限   | なし（制限なし） | 将来タスク候補              |
| ProgressBar 最小値 | 1                | `ConversationRoundStep.tsx` |
| 質問総数           | 6                | `QUESTION_KEYS.length`      |

## Part 3: Phase 11 の視覚証跡

Phase 11 では、画面変更の検証として 9 枚のスクリーンショットを保存し、DevTools console audit も PASS でした。

### 参照ファイル

| 種別                   | パス                                        |
| ---------------------- | ------------------------------------------- |
| スクリーンショット一覧 | `outputs/phase-11/screenshot-manifest.json` |
| Console audit          | `outputs/phase-11/devtools-audit.md`        |

### スクリーンショット

| ファイル                                                       | 確認内容                           |
| -------------------------------------------------------------- | ---------------------------------- |
| `outputs/phase-11/screenshots/smart-defaults-applied.png`      | スマートデフォルト適用後の初期表示 |
| `outputs/phase-11/screenshots/q3-schedule-expanded.png`        | Q3 のスケジュール入力展開          |
| `outputs/phase-11/screenshots/q1-single-select.png`            | カテゴリ単一選択                   |
| `outputs/phase-11/screenshots/q1-multi-select.png`             | カテゴリ複数選択                   |
| `outputs/phase-11/screenshots/q1-all-deselected.png`           | カテゴリ全解除                     |
| `outputs/phase-11/screenshots/q3-schedule-plus-manual.png`     | スケジュール + 手動入力の表示      |
| `outputs/phase-11/screenshots/q3-schedule-collapsed.png`       | Q3 の折りたたみ状態                |
| `outputs/phase-11/screenshots/apply-summary-card-defaults.png` | ApplySummaryCard の既定表示        |
| `outputs/phase-11/screenshots/keyboard-focus-button.png`       | ボタンのキーボードフォーカス表示   |

### current facts

- Phase 11 のスクリーンショット 9 枚は `outputs/phase-11/` に保存済み
- `outputs/phase-11/devtools-audit.md` は Console error count 0、Result: PASS
- `outputs/artifacts.json` は root `artifacts.json` と parity を維持
