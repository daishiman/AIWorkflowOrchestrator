# Result Panel レスポンシブデザイン対応 - タスク指示書

## メタ情報

```yaml
issue_number: 1748
task_id: TASK-RT-03-RESPONSIVE-001
task_name: Result Panel レスポンシブデザイン対応
priority: 低
scale: 小規模
status: 未実施
```

## メタ情報

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | TASK-RT-03-RESPONSIVE-001                                      |
| タスク名     | Result Panel レスポンシブデザイン対応                          |
| 分類         | UI改善                                                         |
| 対象機能     | PlanResultDetailPanel / ExecuteResultDetailPanel / ErrorBanner |
| 優先度       | LOW                                                            |
| 見積もり規模 | S（5〜10ファイル変更）                                         |
| ステータス   | unassigned                                                     |
| 発見元       | TASK-RT-03 Phase 11 未タスク検出                               |
| 作成日       | 2026-03-30                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-RT-03（Skill Creation Result Panel）の実装において、`PlanResultDetailPanel.tsx`・`ExecuteResultDetailPanel.tsx`・`ErrorBanner.tsx` の3コンポーネントはデスクトップ幅（1024px以上）を前提としたレイアウトで実装された。Electron デスクトップアプリでの現時点の利用においては実質的な影響はないが、設計仕様（`ui-ux-navigation.md`）では 768px 未満の画面幅に対するレスポンシブ対応が全コンポーネントに求められている。

Phase 11 の手動テスト（AC-7: モバイル対応 768px 未満）では、パネル内セクションの折り返し・TagList の横スクロール・フッターの位置ずれが確認された。

### 1.2 問題点・課題

- `result-panel-parts.tsx` の `TagList` コンポーネントが 768px 未満で横オーバーフローを起こす
- `PlanResultDetailPanel` のカードセクション（agents/scripts/triggers/anchors）が狭幅で並列配置のまま表示され、読み取り困難になる
- `DetailFooter` の ID 表示が狭幅で右端に押し出される
- `ExecuteResultDetailPanel` の `SdkEventsList` / `PermissionDenialsList` の展開時レイアウトが崩れる

### 1.3 放置した場合の影響

- **短期**: Electron の最小ウィンドウサイズ制約（1024x768）により実質影響なし
- **中期**: `apps/web` への展開時にモバイルユーザーが結果パネルを判読できない状態になる
- **長期**: 将来実装予定の Verify/Improve 結果パネルにも同様の問題が波及する

---

## 2. 何を達成するか（What）

### 2.1 目的

result-panel-parts.tsx 共有部品と各 Detail パネルに Tailwind CSS レスポンシブクラスを付与し、768px 未満でも読み取り可能なレイアウトを実現する。

### 2.2 最終ゴール

- 768px 未満で TagList が横スクロール対応または折り返し表示されること
- 768px 未満でカードセクションが縦積みスタック表示に切り替わること
- DetailFooter が 768px 未満で左揃えまたは上部表示に変更されること
- 既存のデスクトップ幅での表示が崩れないこと

### 2.3 スコープ

| 対象       | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| スコープ内 | result-panel-parts.tsx の TagList / SectionHeader / DetailFooter |
| スコープ内 | PlanResultDetailPanel.tsx のカードセクションレイアウト           |
| スコープ内 | ExecuteResultDetailPanel.tsx の展開セクション                    |
| スコープ外 | ErrorBanner.tsx（単純な縦方向構造のため対応不要）                |
| スコープ外 | SkillLifecyclePanel 全体のレスポンシブ対応                       |

---

## 3. どう実装するか（How）

### 3.1 対応方針

Tailwind CSS のレスポンシブプレフィックス（`sm:`, `md:`, `lg:`）を使用し、モバイルファーストで修正する。`flex-col md:flex-row` パターンでスタック/横並びを切り替える。

### 3.2 主要修正箇所

| ファイル                                         | 修正内容                                                 |
| ------------------------------------------------ | -------------------------------------------------------- |
| `result-panel-parts.tsx` - TagList               | `flex flex-wrap gap-1` に変更し折り返し許容              |
| `result-panel-parts.tsx` - DetailFooter          | `flex-col md:flex-row` で縦積み↔横並び切り替え           |
| `PlanResultDetailPanel.tsx` - セクションカード群 | `grid grid-cols-1 md:grid-cols-2` でレスポンシブグリッド |
| `ExecuteResultDetailPanel.tsx` - 展開セクション  | `overflow-x-auto` でスクロール対応                       |

### 3.3 修正案（コード例）

```tsx
// TagList - Before
<div className="flex gap-1 overflow-x-auto">

// TagList - After（モバイルファースト折り返し）
<div className="flex flex-wrap gap-1">

// DetailFooter - Before
<div className="flex items-center justify-between">

// DetailFooter - After
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
```

---

## 4. 関連する苦戦箇所・Pitfall

- **TASK-RT-03 での苦戦**: Tailwind CSS カスタムプロパティ（`--border-primary`, `--bg-secondary` 等）の正式一覧が散在しており、新規コンポーネント作成時の正しいトークン選択に工数が発生した。デザイントークン一覧の aiworkflow-requirements への追加提案は skill-feedback-report.md に記録済み
- **レスポンシブ対応のテスト**: Vitest + happy-dom 環境では CSS メディアクエリが評価されないため、レスポンシブ表示のテストに `window.innerWidth` モック等の工夫が必要
- **モバイルファーストとデスクトップ維持の両立**: 既存デスクトップ表示を壊さない形でモバイル対応クラスを追加する際は、既存クラスをベースラインとして md: プレフィックスで上書きするのではなく、ベースをモバイル用に書き換える手順が安全

---

## 5. 受入基準

- [ ] 768px 未満の画面幅で TagList が折り返し表示されること
- [ ] 768px 未満の画面幅で PlanResultDetailPanel のカードセクションが縦積み表示されること
- [ ] 768px 未満の画面幅で DetailFooter が正常にレイアウトされること
- [ ] 1024px 以上の画面幅で既存の横並びレイアウトが維持されること
- [ ] 既存テスト（ErrorBanner 5件、PlanResultDetailPanel 14件、ExecuteResultDetailPanel 11件）が全て PASS すること
- [ ] TypeScript 型チェック・ESLint がエラー 0件であること

---

## 6. 参照

### 6.1 システム仕様書

- `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md` - レスポンシブ対応仕様
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-core.md` - Tailwind デザイントークン

### 6.2 ルール・規約

- `.claude/rules/01-architecture.md` - 8px グリッドスペーシング、Apple HIG 準拠
- `.claude/rules/06-known-pitfalls.md` - 関連 Pitfall

### 6.3 タスク成果物（発見元）

- `docs/30-workflows/step-09-par-task-rt-03-skill-creation-result-panel/outputs/phase-12/unassigned-task-detection.md` - 未タスク #1
