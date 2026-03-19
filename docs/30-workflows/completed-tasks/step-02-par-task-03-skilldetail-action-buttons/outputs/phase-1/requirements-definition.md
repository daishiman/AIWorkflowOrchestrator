# Phase 1 要件定義書 - SkillDetailPanel アクションボタン追加

## メタ情報

| 項目               | 内容                                                |
| ------------------ | --------------------------------------------------- |
| タスクID           | TASK-SKILL-LIFECYCLE-03                             |
| フェーズ           | Phase 1: 要件定義                                   |
| 作成日             | 2026-03-19                                          |
| 対象コンポーネント | SkillDetailPanel / useSkillCenter / SkillCenterView |
| 依存タスク         | TASK-SKILL-LIFECYCLE-02（CTA ルーティング基盤）     |

---

## 目的

SkillDetailPanel にスキル編集・分析への遷移ボタンを追加し、スキルライフサイクル上の「詳細確認 → 編集 / 分析」導線を完成させる。

既存の top-level CTA（SkillCenterView の「スキルを作成」「ワークスペースへ」「分析する」）は汎用遷移を担うが、DetailPanel 文脈では **選択中のスキル名を携えた context-aware 遷移** が必要になる。本タスクはその差分を実装する。

---

## P50 チェック結果（既存実装調査）

| 確認対象                                          | 結果     | 備考                        |
| ------------------------------------------------- | -------- | --------------------------- |
| `SkillDetailPanel.tsx` の `onEdit` prop           | 未実装   | 新規追加が必要              |
| `SkillDetailPanel.tsx` の `onAnalyze` prop        | 未実装   | 新規追加が必要              |
| `useSkillCenter` の `handleEditSkill`             | 未実装   | 新規追加が必要              |
| `useSkillCenter` の `handleAnalyzeSkill`          | 未実装   | 新規追加が必要              |
| `navigationSlice` の `setCurrentSkillName`        | 実装済み | 既存 API をそのまま利用可能 |
| `ViewType` の `"skill-editor"`                    | 実装済み | 既存 foundation を利用      |
| `ViewType` の `"skillAnalysis"`                   | 実装済み | 既存 foundation を利用      |
| `renderView` 分岐（skill-editor / skillAnalysis） | 実装済み | App.tsx 変更不要            |

---

## 機能要件

### FR-1: `onEdit` prop の追加

`SkillDetailPanel` の Props インターフェースに以下を追加する。

```typescript
onEdit?: (skillName: string) => void
```

- 省略可能（`?`）とし、未渡しの場合はボタンを非表示にする
- 呼び出し時の引数は当該スキルの `name` フィールド（文字列）

### FR-2: `onAnalyze` prop の追加

`SkillDetailPanel` の Props インターフェースに以下を追加する。

```typescript
onAnalyze?: (skillName: string) => void
```

- 省略可能（`?`）とし、未渡しの場合はボタンを非表示にする
- 呼び出し時の引数は当該スキルの `name` フィールド（文字列）

### FR-3: アクションボタンゾーンの追加

PanelContent の danger zone 上部に、アクションボタンゾーン（`ActionButtonZone`）を追加する。

- 「エディタで開く」ボタン（`onEdit` に対応）
- 「分析する」ボタン（`onAnalyze` に対応）
- ボタンの並び順: 「エディタで開く」→「分析する」（左から右）

### FR-4: 表示条件

以下の条件を**すべて**満たす場合のみアクションボタンゾーンを表示する。

| 条件                   | 説明                                                    |
| ---------------------- | ------------------------------------------------------- |
| `isImported === true`  | インポート済みスキルのみ対象                            |
| `onEdit` が定義済み    | prop として渡されている場合のみ「エディタで開く」を表示 |
| `onAnalyze` が定義済み | prop として渡されている場合のみ「分析する」を表示       |

- `isImported === false` の場合、ボタンゾーン全体を非表示にする
- `onEdit` のみ渡された場合、「エディタで開く」のみ表示する（片方だけの表示を許容）

### FR-5: `handleEditSkill` / `handleAnalyzeSkill` の追加

`useSkillCenter` カスタムフックに以下のハンドラを追加する。

```typescript
handleEditSkill: (skillName: string) => void
handleAnalyzeSkill: (skillName: string) => void
```

**`handleEditSkill` の処理内容:**

1. `setCurrentSkillName(skillName)` を呼び出す（navigationSlice の既存 API）
2. `setCurrentView("skill-editor")` を呼び出す

**`handleAnalyzeSkill` の処理内容:**

1. `setCurrentView("skillAnalysis")` を呼び出す
   - 分析画面は対象スキルの選択状態を別途管理するため、`setCurrentSkillName` は呼び出さない

### FR-6: SkillCenterView でのバインディング

`SkillCenterView/index.tsx` から `SkillDetailPanel` に対して以下の prop を渡す。

```typescript
<SkillDetailPanel
  ...既存props...
  onEdit={handleEditSkill}
  onAnalyze={handleAnalyzeSkill}
/>
```

---

## 非機能要件

### NFR-1: Apple HIG 準拠

- スペーシングは 8px Grid に従う（ボタン間 gap: 8px、ゾーンの上下 margin: 16px）
- ボタンスタイル: secondary ボタン相当（枠線あり、背景透明またはセカンダリ背景色）
- アイコン: 「エディタで開く」は鉛筆アイコン（pencil）、「分析する」は棒グラフアイコン（chart.bar）
- ライト/ダーク両モードで Apple システムカラーを使用する

### NFR-2: レスポンシブ対応

- デスクトップ（サイドパネル表示）とモバイル（ボトムシート表示）の両方でボタンにアクセスできる
- ボトムシート表示時もアクションボタンゾーンがスクロール可能な範囲内に収まること

### NFR-3: アクセシビリティ（WCAG 2.1 AA）

- コントラスト比 4.5:1 以上（テキスト・アイコンと背景）
- キーボード操作: Tab キーでボタンにフォーカス移動できること
- `aria-label` を適切に付与する（例: `aria-label="スキルをエディタで開く"`）
- 色だけで状態を伝えない（アイコンまたはテキストラベルを必ず併用）

---

## 受入基準

| ID   | 受入基準                                                                                                      | 検証方法                     |
| ---- | ------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| AC-1 | インポート済みスキルの SkillDetailPanel に「エディタで開く」ボタンが表示される                                | ユニットテスト / 手動確認    |
| AC-2 | 「エディタで開く」クリックで `setCurrentView("skill-editor")` + `setCurrentSkillName(skillName)` が実行される | ユニットテスト（spy）        |
| AC-3 | インポート済みスキルの SkillDetailPanel に「分析する」ボタンが表示される                                      | ユニットテスト / 手動確認    |
| AC-4 | 「分析する」クリックで `setCurrentView("skillAnalysis")` が実行される                                         | ユニットテスト（spy）        |
| AC-5 | 未インポートスキル（`isImported === false`）では編集・分析ボタンが表示されない                                | ユニットテスト               |
| AC-6 | モバイル（ボトムシート）表示時もボタンがスクロール範囲内でアクセス可能                                        | 手動確認（ウィンドウ幅縮小） |
| AC-7 | Apple HIG 準拠: 8px Grid スペーシング・セカンダリボタンスタイルが適用される                                   | 目視確認                     |
| AC-8 | Escape キーでパネルを閉じる既存動作が壊れない                                                                 | ユニットテスト / 手動確認    |

---

## 依存関係

| 依存先                                | 種別       | 説明                                |
| ------------------------------------- | ---------- | ----------------------------------- |
| `navigationSlice.setCurrentSkillName` | 既存 API   | スキル名を Store にセット           |
| `navigationSlice.setCurrentView`      | 既存 API   | ViewType を切り替え                 |
| `ViewType: "skill-editor"`            | 既存型定義 | store/types.ts に定義済み           |
| `ViewType: "skillAnalysis"`           | 既存型定義 | store/types.ts に定義済み           |
| TASK-SKILL-LIFECYCLE-02 の CTA 基盤   | 前提タスク | renderView 分岐が実装済みであること |

---

## 次フェーズ

Phase 2（設計）: コンポーネント構造・Props インターフェース・Zustand アクション呼び出し順序の詳細設計を行う。
