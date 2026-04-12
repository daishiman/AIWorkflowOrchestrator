# Implementation Guide: UT-SKILL-WIZARD-CATEGORY-UI-ICON-001

## Part 1（中学生レベル）

### なぜ必要か

カテゴリボタンを文字だけで見せると、似た言葉の違いが一瞬で分かりにくいです。  
たとえば、お店の棚に「文房具」とだけ書いてあるより、「✏️ えんぴつ」「📎 クリップ」と分かれている方が、ほしい物をすぐ見つけやすいですよね。

今回の変更は、この「見つけやすさ」をスキル作成ウィザードにも足すためのものです。  
ボタンに絵文字をつけ、さらに説明文もつけることで、初めて見る人でもカテゴリの意味を理解しやすくします。

### 何をするか

- 各カテゴリに「絵文字」と「説明文」を持たせる
- ボタンの見た目を「絵文字 + 文字」にする
- マウスを乗せたときに説明文が見えるようにする
- 読み上げ機能でもカテゴリ名が自然に伝わるようにする

### 変更前 / 変更後

| 観点     | 変更前         | 変更後                   |
| -------- | -------------- | ------------------------ |
| 見た目   | 文字だけ       | 絵文字 + 文字            |
| 説明     | なし           | `title` 属性で補足       |
| 読み上げ | カテゴリ名中心 | カテゴリ名をそのまま維持 |

---

## Part 2（技術者向け）

### current contract

- `SkillInfoStep` は Step 0 のカテゴリ選択 UI を担当する
- `SkillCreateWizard` 側の props は変更なし
- `packages/shared/` の型定義は変更なし
- `title` 属性は native tooltip のまま維持する

### 変更ファイル

```
apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx
apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx
apps/desktop/scripts/capture-skill-info-step-category-ui-icon-screenshots.mjs
docs/30-workflows/skill-info-step-category-ui-icon/outputs/phase-11/*
```

### 型定義

```typescript
interface CategoryOption {
  value: SkillCategory;
  label: string;
  icon: string;
  description: string;
}
```

### ボタン仕様

```tsx
<button
  type="button"
  aria-pressed={isSelected}
  aria-label={label}
  title={description}
  onClick={() => handleCategoryClick(value)}
>
  <span aria-hidden="true">{icon}</span>
  <span>{label}</span>
</button>
```

### 実装ポイント

- `aria-label` をカテゴリ名だけにして、絵文字を読み上げさせない
- `aria-hidden="true"` でアイコンを装飾要素にする
- `title` で説明文を補足する
- `handleCategoryClick` は再クリック時に state を変更しない

### テスト観点

- 全5カテゴリのラベル / アイコン / `title` が一致すること
- `aria-pressed` が選択中カテゴリだけ `true` になること
- `aria-label` がカテゴリ名と一致すること
- `within(button)` でアイコンをボタン内に限定して検証すること

### Phase 11 証跡

| ショット ID | ファイル                                            | 目的                     |
| ----------- | --------------------------------------------------- | ------------------------ |
| SS-01       | `outputs/phase-11/screenshots/ss-01-initial.png`    | 初期状態の確認           |
| SS-02       | `outputs/phase-11/screenshots/ss-02-automation.png` | 「自動化」選択状態の確認 |
| SS-03       | `outputs/phase-11/screenshots/ss-03-tooltip.png`    | tooltip 可視化の確認     |
| SS-04       | `outputs/phase-11/screenshots/ss-04-all-icons.png`  | 全カテゴリアイコンの確認 |

`SS-03` は native `title` を直接 screenshot に出せないため、capture script 内で一時 overlay を注入して説明文を可視化した。

### Phase 12 への反映

- `implementation-guide.md` で current facts を固定
- `system-spec-update-summary.md` で task-workflow / logs / index / artifacts の同期を記録
- `screenshot-coverage.md` を追加し、4枚の証跡を 100% で固定
- `unassigned-task-detection.md` は 0件で完了

### 品質結果

| 指標               | 結果     |
| ------------------ | -------- |
| Semantic テスト    | PASS     |
| Visual テスト      | PASS     |
| スクリーンショット | 4/4 PASS |
| 未タスク           | 0件      |

## 今回の開発で生成された新規Issue

| Issue | タスクID                              | 優先度 |
| ----- | ------------------------------------- | ------ |
| #2092 | UT-IPC-PRELOAD-SYNC-GUARDIAN-IMPL-001 | HIGH   |
| #2093 | UT-GOOGLE-CALENDAR-SLACK-PHASE12-001  | MEDIUM |
