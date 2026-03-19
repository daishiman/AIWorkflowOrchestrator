# Phase 3 設計レビューレポート

## メタ情報

| 項目     | 値                                           |
| -------- | -------------------------------------------- |
| タスク   | step-02-par-task-02-skillcenter-create-route |
| Phase    | 3 - 設計レビュー                             |
| 日付     | 2026-03-17                                   |
| 総合判定 | PASS（MINOR 2件）                            |

---

## P50チェック結果（実装済み確認）

設計レビュー実施時点（2026-03-17）において、対象となる全コードが既に実装済みであることを確認した。
Phase 4-5（テスト作成・実装）は「検証・補完」モードで実施される。

| 確認項目                                | 実装状況 | 確認場所                                                                                        |
| --------------------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `ctaLabel` フィールド（型定義・定数値） | 実装済み | `navigation/skillLifecycleJourney.ts` L21, L56, L66, L76                                        |
| `navigateToSkillCreate` アクション      | 実装済み | `SkillCenterView/hooks/useSkillCenter.ts` L159-162                                              |
| `navigateToWorkspace` アクション        | 実装済み | `SkillCenterView/hooks/useSkillCenter.ts` L163-166                                              |
| `navigateToSkillAnalysis` アクション    | 実装済み | `SkillCenterView/hooks/useSkillCenter.ts` L167-170                                              |
| P31対策（個別セレクタ + useCallback）   | 実装済み | `SkillCenterView/hooks/useSkillCenter.ts` L157 (`useAppStore((state) => state.setCurrentView)`) |
| ヘッダーCTA レンダリング                | 実装済み | `SkillCenterView/index.tsx`（ヘッダーセクション）                                               |
| JourneyPanel CTA 条件付きレンダリング   | 実装済み | `SkillCenterView/index.tsx`（JourneyPanel インライン実装）                                      |

---

## 実際のコード構造と設計サマリーとの差分

設計サマリーに記載されたパスおよび型定義が実際のコードと一部乖離していることを確認した。
以下に実態を記録する。

| 項目                                  | 設計サマリーの記載                              | 実際のコード                                                                |
| ------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------- |
| `SkillLifecycleJobGuide` 型の定義場所 | `types/skillLifecycleJourney.ts`                | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`             |
| 型のフィールド構成                    | `jobTitle / jobStory / tools / outcome / steps` | `id / title / entryLabel / handoffLabel / summary / completion / onAction?` |
| `useSkillCenter.ts` の場所            | （パス記載なし）                                | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`   |
| ジョブ定数の名称                      | `JOB_GUIDES`                                    | `SKILL_LIFECYCLE_JOB_GUIDES`（`as const` で定義）                           |
| 3つのジョブ ID                        | （記載なし）                                    | `create` / `use` / `improve`                                                |

これらの差分はいずれも実装時に正しいパスおよびフィールド名を参照することで解消できる。
設計の意図（3ジョブ・CTA遷移・責務分離）は正しく保持されており、設計戻しは不要。

---

## 10観点 判定テーブル

| #   | 観点                       | 判定            | 概要                                                                                                                                                   |
| --- | -------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | AC整合性（AC-1/AC-2）      | PASS            | ヘッダーCTAが `setCurrentView("skillCreate")` と正しく接続。`useAppStore((state) => state.setCurrentView)` で個別取得し `useCallback` でメモ化。       |
| 2   | AC整合性（AC-3/AC-4/AC-5） | PASS            | JourneyPanel 各カードのCTAが対応するViewType遷移と接続: `create → skillCreate`、`use → workspace`、`improve → skillAnalysis`。                         |
| 3   | 責務境界（AC-6）           | PASS            | 全CTAが `setCurrentView` 呼び出しのみ。スキル作成・分析・実行のビジネスロジックを含まず。禁止責務「直接実行や詳細分析の本体を背負わない」を遵守。      |
| 4   | Task01依存整合             | PASS            | `skillCreate` / `skillAnalysis` ViewTypeはTask01で追加済み。`renderView` の `case` 分岐も実装済みであり、依存関係に未解決項目なし。                    |
| 5   | Zustand設計（P31対策）     | PASS            | `useAppStore((state) => state.setCurrentView)` で個別取得。`useCallback` でメモ化。合成Hookを使用していないためP31（無限ループ）のリスクなし。         |
| 6   | モバイル対応（AC-7）       | PASS            | `md:` ブレークポイント（768px）使用。`hidden md:inline` でラベル切り替え。タッチターゲット `min-h-[44px] min-w-[44px]` で44x44px以上を確保。           |
| 7   | Apple HIG準拠（AC-8）      | PASS            | `var(--accent)` = systemBlue。`rounded-lg` = 8px。`px-3 py-1.5` = 8pxグリッド準拠。`shadow-sm`（カード）。Apple HIG color/spacing 基準を満たす。       |
| 8   | アクセシビリティ           | PASS            | `aria-label="新しいツールを作る"` 設定。`focus:ring-2` でフォーカスリング。アイコンに `aria-hidden="true"`。WCAG 2.1 AA の主要基準を満たす。           |
| 9   | Props設計の純粋性          | PASS（MINOR-2） | `onAction` は親（SkillCenterView）から注入する設計で純粋性を確保。設計サマリーに `ctaViewType` フィールド追加提案があるが過剰設計。詳細はMINOR-2参照。 |
| 10  | 既存契約との非衝突         | PASS（MINOR-1） | Task02とTask03の変更ファイルに重複あるが追加プロパティが異なり衝突リスクは低い。設計サマリーのファイルパス誤記あり。詳細はMINOR-1参照。                |

---

## MINOR 指摘一覧

### MINOR-1: 設計サマリーのファイルパス誤記

- **観点**: #10 既存契約との非衝突
- **内容**: 設計サマリー内で `types/skillLifecycleJourney.ts` と記載されているが、実際のファイルは `navigation/skillLifecycleJourney.ts` に存在する。
- **影響範囲**: 実装担当者がパスを誤って参照するリスク。コンパイルエラーで即座に検出可能なため機能影響なし。
- **対応**: 実装時に正しいパス `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` を参照して解消。
- **対応ステータス**: **対応済み** - `design-summary.md` のセクション2「変更対象ファイル」の記載を `navigation/skillLifecycleJourney.ts` に修正し、注記を追加した（2026-03-17）。
- **未タスク候補**: task-imp-skillcenter-design-summary-path-correction-001（設計サマリー内パス誤記の修正）

### MINOR-2: ctaViewType フィールド追加提案は過剰設計

- **観点**: #9 Props設計の純粋性
- **内容**: 設計サマリーに `SKILL_LIFECYCLE_JOB_GUIDES` の各エントリへ `ctaViewType` フィールドを追加する提案があるが、既存の `id` フィールド（`create` / `use` / `improve`）との1対1マッピングで十分に遷移先ViewTypeを特定できる。フィールドを追加すると型定義とマッピングロジックが二重管理になる。
- **影響範囲**: 設計の冗長化リスク。現状では機能影響なし。
- **対応**: 実装時に `id` フィールドベースのマッピングを採用し、`ctaViewType` は追加しない。
- **対応ステータス**: **対応済み** - `design-summary.md` のセクション6「ctaViewType追加（オプション）」をADR形式（却下決定・理由・代替案）に書き換えた（2026-03-17）。
- **未タスク候補**: task-imp-skillcenter-ctaviewtype-overdesign-review-001（ctaViewType 過剰設計の再評価・ドキュメント整合）

---

## 統合テスト連携

### レビューで確認した統合テスト観点

- ViewType 遷移（skillCreate / workspace / skillAnalysis）と `setCurrentView` の接続は、Phase 4 のユニットテストで確認される予定
- P31（合成Hook無限ループ）対策として個別セレクタ形式（`useAppStore((state) => state.setCurrentView)`）が設計に組み込まれており、テストで検証可能
- Task03 との共有ファイル（`useSkillCenter.ts` / `index.tsx`）の変更は異なる行・関数への追加であり、統合後の衝突リスクは低いと判定した
- SkillLifecycleJourneyPanel の `onAction` 注入パターンは SkillCenterView 側で行われており、JourneyPanel 単体テストとコンテキストを分離した統合テストの両方で確認可能

---

## 未タスク候補一覧（Phase 10 MINOR 変換準拠）

> [05-task-execution.md#Phase10](../../../../../.claude/rules/05-task-execution.md) 準拠: MINOR 指摘は全件未タスク候補として記録する（「機能影響なし」でも省略不可）。

| ID                                                      | 観点 | 内容                                               | 推奨対応                                           |
| ------------------------------------------------------- | ---- | -------------------------------------------------- | -------------------------------------------------- |
| task-imp-skillcenter-design-summary-path-correction-001 | #10  | 設計サマリー内のファイルパス誤記を修正する         | design-summary.md の型定義場所セクションを修正する |
| task-imp-skillcenter-ctaviewtype-overdesign-review-001  | #9   | ctaViewType 追加提案を「採用しない」と明示記録する | design-summary.md の当該提案箇所に ADR を追記する  |

---

## 総合判定

**PASS（MINOR 2件）**

MINOR-1およびMINOR-2はいずれも実装時に自然に解消される軽微な指摘であり、設計の根本的な問題ではない。
Phase 4（テスト作成）へ進行可能。

> 注記: 05-task-execution.md の Phase 10 MINOR ルール準拠により、上記2件を未タスク候補として記録した。
> 本タスク（Phase 3 設計レビュー段階）では指摘の記録のみとし、unassigned-task/ への指示書作成は Phase 12 にて実施する。
