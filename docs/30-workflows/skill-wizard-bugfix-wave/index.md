# スキルウィザード バグ修正ウェーブ

## 概要

30種の思考法による多角的検証（2026-04-12）で特定された18件の問題を修正する実装タスク群。
6件の既知問題に加え、**Step 1の回答がスキル生成に一切渡されていない**という核心欠陥（問題7）を含む12件の新規問題を解消する。

## 設計根拠（30思考法による検証結果）

### 真に解くべき問題（論点思考による定義）

> **スキルウィザードのStep 1（Q1〜Q6インタビュー）で収集したユーザーの文脈情報が、スキル生成プロセスに一切引き渡されておらず、ウィザードが提供する「対話を通じた文脈に合ったスキル生成」という核心的価値が技術的に実現されていない。**

### KJ法クラスター

| クラスター                  | 問題番号                 | 本質                                                     |
| --------------------------- | ------------------------ | -------------------------------------------------------- |
| A: データフロー欠損         | 7, 17, 10                | ユーザーインプットがLLMプロンプトに到達していない        |
| B: 状態管理複雑化           | 1, 9, 12, 13, 14, 18, 19 | 状態遷移の契約が不明確でエラーケースが漏れている         |
| C: フィードバックループ欠如 | 6, 8, 20                 | 生成の成否がユーザーに正しく伝わらず一覧にも反映されない |
| D: UI整合性                 | 2, 3, 11, 15, 16         | UIが実際のフロー状態と乖離しユーザーを混乱させる         |

## ディレクトリ命名規則

| プレフィックス             | 意味                                               |
| -------------------------- | -------------------------------------------------- |
| `WA` / `WB` / `WC`         | 実行ウェーブ番号（Aが最初・Cが最後）               |
| `seq-`                     | 前ウェーブ完了まで着手不可（直列実行）             |
| `par-`                     | 同ウェーブ内で並列実行可能                         |
| `-01-` / `-02a-` / `-02b-` | タスク識別番号（アルファベットは同Wave内の並列枝） |

例: `WB-par-02a-fix-mode-mgmt` → Wave B / 並列可 / タスク02a

## タスク一覧とディレクトリ構成

```
WA-seq-01-fix-dataflow/        ← Wave A（直列・最優先・他の全タスクのブロッカー）
  └─ Step 1 Q1〜Q6回答→スキル生成連携（問題7+17）

WB-par-02a-fix-mode-mgmt/      ← Wave B（Wave A完了後・Phase 1-4/6-13 は並列、Phase 5 は共有ファイル調整が必要）
  └─ generationMode管理整理（問題1+9+10）

../WB-par-02b-fix-feedback/    ← Wave B（Wave A完了後・Phase 1-4/6-13 は並列、Phase 5 は共有ファイル調整が必要）
  └─ fetchSkills+エラー表示修正（問題6+8+14+20）

WC-par-03a-fix-state-detail/   ← Wave C（Wave B完了後・Phase 1-4/6-13 は並列、Phase 5 は共有ファイル調整が必要）
  └─ state残留・リカバリー・競合修正（問題12+13+18+19）

WC-par-03b-fix-ui/             ← Wave C（Wave B完了後・Phase 1-4/6-13 は並列、Phase 5 は共有ファイル調整が必要）
  └─ UI整合性修正（問題2+3+11+15+16）
```

## 依存グラフ

```
WA-seq-01-fix-dataflow                     （Wave A: 直列・先行必須）
  ├─→ WB-par-02a-fix-mode-mgmt ─┐         （Wave B: Phase 1-4/6-13 は並列、Phase 5 は共有ファイル調整）
  └─→ WB-par-02b-fix-feedback  ─┤
                                 ├─→ WC-par-03a-fix-state-detail  （Wave C: Phase 1-4/6-13 は並列、Phase 5 は共有ファイル調整）
                                 └─→ WC-par-03b-fix-ui            （Wave C: Phase 1-4/6-13 は並列、Phase 5 は共有ファイル調整）
```

**最短実装経路**: WA → WB（2並列）→ WC（2並列） = 3ウェーブ
**推奨並列Agent数**: Wave B: 2、Wave C: 2

**実装時の共有ファイル**: `SkillCreateWizard.tsx` は WA/WB/WC で共有され、`ConversationRoundStep.tsx` は WA/WC で共有される。Phase 5 は共有箇所を順次統合し、Phase 1-4 / 6-13 で並列化する。

## 修正優先順位（影響度 × 修正コスト）

| Wave                   | ディレクトリ名                | タスクID                     | 問題番号         | 影響度 | コスト |
| ---------------------- | ----------------------------- | ---------------------------- | ---------------- | ------ | ------ |
| **WA（即時必須）**     | `WA-seq-01-fix-dataflow`      | TASK-SW-FIX-DATAFLOW-001     | 7, 17            | 極大   | 低     |
| **WB（次スプリント）** | `WB-par-02a-fix-mode-mgmt`    | TASK-SW-FIX-MODE-MGMT-001    | 1, 9, 10         | 大     | 中     |
| **WB（次スプリント）** | `WB-par-02b-fix-feedback`     | TASK-SW-FIX-FEEDBACK-001     | 6, 8, 14, 20     | 大     | 極低   |
| **WC（後続）**         | `WC-par-03a-fix-state-detail` | TASK-SW-FIX-STATE-DETAIL-001 | 12, 13, 18, 19   | 中     | 中     |
| **WC（後続）**         | `WC-par-03b-fix-ui`           | TASK-SW-FIX-UI-001           | 2, 3, 11, 15, 16 | 小     | 低     |

## タスク種別

- 全タスク: implementation（主にUI/Renderer、WAはshared/main変更を含む）
- Phase 11: VISUAL（画面変更を伴うタスクは VISUAL、状態管理のみは NON_VISUAL）

## 参照

| ドキュメント          | パス                                                                          |
| --------------------- | ----------------------------------------------------------------------------- |
| 既存ウィザード実装    | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            |
| Step 0 コンポーネント | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`         |
| Step 1 コンポーネント | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` |
| 完了画面              | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`          |
| 型定義                | `packages/shared/src/types/skillCreator.ts`                                   |
| Redux store           | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                        |
| 既存レーン            | `docs/30-workflows/skill-wizard-redesign-lane/index.md`                       |

## 作成日

2026-04-12
