# Phase 2: 設計

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 2                                    |
| 名称       | 設計                                 |
| タスクID   | UT-SKILL-WIZARD-CATEGORY-UI-ICON-001 |
| 作成日     | 2026-04-11                           |
| ステータス | 未実施                               |

---

## 目的

- `CATEGORY_OPTIONS` の型拡張設計を確定する
- アイコン表示・ツールチップの実装方針を決定する
- アクセシビリティ対応設計を明示する
- IPC変更なし・Props変更なしを確認する

---

## 実行タスク

### Task 1: CATEGORY_OPTIONS 型拡張設計

#### 現状の型

```typescript
const CATEGORY_OPTIONS: { value: SkillCategory; label: string }[] = [
  { value: "automation", label: "自動化" },
  { value: "external-integration", label: "外部連携" },
  { value: "data-analysis", label: "データ分析" },
  { value: "code-support", label: "コードサポート" },
  { value: "other", label: "その他" },
];
```

#### 設計後の型

```typescript
interface CategoryOption {
  value: SkillCategory;
  label: string;
  icon: string; // 絵文字アイコン（例: "⚡"）
  description: string; // ツールチップ用の説明文
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: "automation",
    label: "自動化",
    icon: "⚡",
    description: "繰り返し作業の自動化・スケジュール実行などのスキル",
  },
  {
    value: "external-integration",
    label: "外部連携",
    icon: "🔗",
    description: "外部API・Webhookなど外部サービスと連携するスキル",
  },
  {
    value: "data-analysis",
    label: "データ分析",
    icon: "📊",
    description: "データの集計・分析・可視化を行うスキル",
  },
  {
    value: "code-support",
    label: "コードサポート",
    icon: "💻",
    description: "コードレビュー・生成・リファクタリングを支援するスキル",
  },
  {
    value: "other",
    label: "その他",
    icon: "📦",
    description: "上記カテゴリに当てはまらないスキル",
  },
];
```

**設計判断**:

- `CategoryOption` インターフェースはファイルローカルに定義（他ファイルで参照しないため `packages/shared/` 不要）
- アイコンは絵文字を使用（新規ライブラリ導入不要・ゼロ依存）
- `description` は `title` 属性でブラウザネイティブのツールチップとして表示

### Task 2: UI実装設計（ボタンコンポーネント）

#### 変更前

```tsx
<button
  key={value}
  type="button"
  aria-pressed={isSelected}
  onClick={() => handleCategoryClick(value)}
  className={...}
>
  {label}
</button>
```

#### 変更後

```tsx
<button
  key={value}
  type="button"
  aria-pressed={isSelected}
  aria-label={label}
  title={description}
  onClick={() => handleCategoryClick(value)}
  className={...}
>
  <span aria-hidden="true">{icon}</span>
  <span>{label}</span>
</button>
```

**設計判断**:

- `aria-label` は `label` と一致させ、アイコンを読み上げず visible label をそのまま accessible name にする
- `title` 属性で説明文をブラウザネイティブのホバーツールチップとして補足する
- `icon` は `<span aria-hidden="true">` でラップしてアクセシビリティを確保
- `label` テキストは別 `<span>` で明示

### Task 3: concern topology（影響範囲）

```
concern 1: CATEGORY_OPTIONS 型拡張
  ├── CategoryOption インターフェース定義（ローカル）
  └── CATEGORY_OPTIONS 配列へ icon/description 追加

concern 2: ボタン UI 変更
  ├── aria-label 追加
  ├── title 属性追加
  ├── icon span 追加
  └── label span ラップ
```

lane 数: 2（concern 数が 1〜2 のため単一ファイル内で設計）

### Task 4: IPC 変更確認

| 確認項目           | 結果                                       |
| ------------------ | ------------------------------------------ |
| IPC チャンネル変更 | なし                                       |
| Preload API 変更   | なし                                       |
| Main プロセス変更  | なし                                       |
| shared 型変更      | なし（`SkillCategory` 型自体は変更しない） |

### Task 5: Props interface 変更確認

`SkillInfoStepProps` は変更なし。

```typescript
interface SkillInfoStepProps {
  formData: SkillInfoFormData;
  onFormDataChange: (data: SkillInfoFormData) => void;
  onNext: () => void;
}
```

親コンポーネント（`SkillCreateWizard`）への影響: **なし**

### Task 6: ステップ間 state 引き渡し（ウィザード設計確認）

本タスクは `CATEGORY_OPTIONS` のレンダリング変更のみ。

- `formData.category` の state 管理は親コンポーネントが保持（変更なし）
- ウィザードのステップ間 state 引き渡し設計は影響を受けない

---

## 参照資料

- `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` - 変更対象
- `packages/shared/src/types/skillCreator.ts` - SkillCategory 型
- Phase 1 要件定義書: `phase-1-requirements.md`

---

## 統合テスト連携

- Props interface 変更なしのため、親コンポーネントとの統合テストへの影響なし
- `SkillInfoStep.test.tsx` の既存テストは `label` のみ参照しているが、`icon` / `description` 追加後も既存テストが壊れないことを Phase 4 で確認する

---

## 多角的チェック観点（AIが判断）

| 観点                 | 確認内容                                                                                             | 判定 |
| -------------------- | ---------------------------------------------------------------------------------------------------- | ---- |
| 絵文字互換性         | 絵文字は環境依存があるが、Electron Renderer は Chromium ベースで問題なし                             | OK   |
| ブラウザツールチップ | `title` 属性のツールチップはスタイル制御不可だが、小規模タスクとして許容                             | OK   |
| テスト容易性         | `title` 属性は `getByTitle()` / `getAttribute('title')` でテスト可能                                 | OK   |
| A11y                 | `aria-hidden="true"` + `aria-label={label}` + `title={description}` で読み上げと補足情報を分離できる | OK   |

---

## 成果物

| 成果物                       | 配置先                                                                                 |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| Phase 2 設計書（本ファイル） | `docs/30-workflows/skill-info-step-category-ui-icon/phase-2-design.md`                 |
| 設計サマリー                 | `docs/30-workflows/skill-info-step-category-ui-icon/outputs/phase-2/design-summary.md` |

---

## 完了条件

- [ ] `CategoryOption` インターフェース設計完了
- [ ] `CATEGORY_OPTIONS` 拡張後の型・値が全5カテゴリ分定義されている
- [ ] ボタン UI 変更設計（`aria-label`・`title`・`icon span`）が確定
- [ ] IPC変更なし・Props変更なしを確認
- [ ] concern topology が2以下に収まっている

---

## タスク100%実行確認【必須】

- [ ] Task 1 完了: CATEGORY_OPTIONS 型拡張設計
- [ ] Task 2 完了: UI実装設計（ボタンコンポーネント）
- [ ] Task 3 完了: concern topology 確認
- [ ] Task 4 完了: IPC変更なし確認
- [ ] Task 5 完了: Props変更なし確認
- [ ] Task 6 完了: ステップ間state確認

---

## 次Phase

Phase 2 完了後 → **Phase 3: 設計レビューゲート** へ進む
