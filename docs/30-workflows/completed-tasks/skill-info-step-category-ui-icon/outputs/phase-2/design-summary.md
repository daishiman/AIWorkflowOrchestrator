# Phase 2: design-summary

## メタ情報

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| Phase    | 2                                    |
| タスクID | UT-SKILL-WIZARD-CATEGORY-UI-ICON-001 |
| 実行日   | 2026-04-11                           |

---

## CATEGORY_OPTIONS 型拡張設計

### CategoryOption インターフェース（ファイルローカル）

```typescript
interface CategoryOption {
  value: SkillCategory;
  label: string;
  icon: string; // 絵文字アイコン
  description: string; // ツールチップ説明文（title属性）
}
```

### 全5カテゴリの値

| value                | label          | icon | description                                            |
| -------------------- | -------------- | ---- | ------------------------------------------------------ |
| automation           | 自動化         | ⚡   | 繰り返し作業の自動化・スケジュール実行などのスキル     |
| external-integration | 外部連携       | 🔗   | 外部API・Webhookなど外部サービスと連携するスキル       |
| data-analysis        | データ分析     | 📊   | データの集計・分析・可視化を行うスキル                 |
| code-support         | コードサポート | 💻   | コードレビュー・生成・リファクタリングを支援するスキル |
| other                | その他         | 📦   | 上記カテゴリに当てはまらないスキル                     |

## ボタン UI 変更設計

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

## 設計判断

| 判断項目                  | 決定内容                           | 理由                         |
| ------------------------- | ---------------------------------- | ---------------------------- |
| アイコン実装方式          | 絵文字（emoji）                    | ゼロ依存・ライブラリ不要     |
| ツールチップ実装方式      | `title` 属性（ブラウザネイティブ） | 小規模タスク・シンプル最優先 |
| `aria-label` 値           | `label` と一致                     | accessible name を短く保つ   |
| アイコンの読み上げ防止    | `aria-hidden="true"` span          | スクリーンリーダー対応       |
| `CategoryOption` 定義場所 | ファイルローカル                   | shared/ への漏れ不要         |

## IPC・Props 変更確認

- IPC チャンネル変更: **なし**
- Props interface 変更: **なし**（`SkillInfoStepProps` 変更なし）
- shared 型変更: **なし**（`SkillCategory` 型はそのまま）

## concern topology

```
concern 1: CATEGORY_OPTIONS 型拡張（CategoryOption + 配列値）
concern 2: ボタン UI 変更（aria-label / title / span 構造）
```

lane数: 2（単一ファイル内）
