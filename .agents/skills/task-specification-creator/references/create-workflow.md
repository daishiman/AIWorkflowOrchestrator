# タスク仕様書作成ワークフロー（createモード）

> **Progressive Disclosure**
> - 読み込みタイミング: createモード実行時
> - 読み込み条件: 新規タスク仕様書を作成するとき

---

## ワークフロー概要

```
Phase 1: 分析（LLM Task）
┌─────────────────────────────────────────────────────────┐
│ decompose-task → identify-scope → design-phases         │
│ 📖 Read: agents/decompose-task.md (必要時)               │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 2: 生成（LLM Task + Script Validation）
┌─────────────────────────────────────────────────────────┐
│ generate-task-specs → [validate-schema]                 │
│ 📖 Read: agents/generate-task-specs.md (必要時)          │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 3: 出力（Script Task - 100%精度）
┌─────────────────────────────────────────────────────────┐
│ [init-artifacts] → [generate-phase-files]               │
│ ┌─────────────────────────────────────────┐              │
│ │ output-phase-files   ← 並列実行          │              │
│ │ update-dependencies ←                  │              │
│ └─────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 4: 個別検証（Script Task - 100%精度）
┌─────────────────────────────────────────────────────────┐
│ [validate-phase-output]                                 │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 5: 全体整合性検証（Script + LLM - 自動実行）【必須】
┌─────────────────────────────────────────────────────────┐
│ [verify-all-specs] ← 13ファイル一括検証                  │
│     ├── 構造検証: 必須セクション・フォーマット           │
│     ├── 整合性検証: Phase間依存・参照資料               │
│     ├── 品質検証: 曖昧表現・検証可能性                  │
│     └── 完全性検証: 全13 Phase揃っているか              │
│                         ↓                               │
│ verify-specs (LLM) ← 品質基準チェック（必要時）          │
│ 📖 Read: agents/verify-specs.md                         │
│                         ↓                               │
│ 検証レポート生成 → outputs/verification-report.md       │
└─────────────────────────────────────────────────────────┘
                            ↓
         ┌──────────────────┴──────────────────┐
         ↓                                     ↓
    [検証PASS]                            [検証FAIL]
         ↓                                     ↓
Phase 6: 完了                           Phase 2へ戻り修正
┌─────────────────────────────────────────────────────────┐
│ [log-usage] → 完了                                      │
└─────────────────────────────────────────────────────────┘

凡例: [script] = Script Task (100%精度), 無印 = LLM Task
```

---

## Phase 5 検証項目詳細

| カテゴリ | 検証項目 | 自動/手動 |
| -------- | -------- | --------- |
| **構造** | 必須セクション（メタ情報/目的/実行タスク/参照資料/成果物/完了条件） | 自動 |
| **構造** | Markdownフォーマット正常性 | 自動 |
| **整合性** | Phase間依存関係（前Phase成果物が参照されているか） | 自動 |
| **整合性** | 参照資料パスの存在確認 | 自動 |
| **品質** | 曖昧表現の検出（「適切に」「必要に応じて」「など」） | 自動 |
| **品質** | 完了条件の検証可能性 | LLM |
| **品質** | 100人中100人が同じ理解で実行できるか | LLM |
| **完全性** | Phase 1〜13の全ファイル存在確認 | 自動 |
| **完全性** | index.md（メインタスク仕様書）存在確認 | 自動 |
| **完全性** | artifacts.json整合性 | 自動 |

---

## Task実行順序

| Task | 責務 | 実行パターン | 入力 | 出力 |
| ---- | ---- | ------------ | ---- | ---- |
| decompose-task | タスクを単一責務に分解 | seq | ユーザー要求 | タスク分解リスト |
| identify-scope | スコープ・前提・制約を定義 | seq | タスク分解リスト | スコープ定義 |
| design-phases | Phase構成を設計 | seq | スコープ定義 | フェーズ設計書 |
| generate-task-specs | タスク仕様書を生成 | seq | フェーズ設計書 | タスク仕様書一覧 |
| output-phase-files | 個別Markdownファイルを出力 | **par** | タスク仕様書一覧 | phase-\*.md |
| update-dependencies | Phase間の依存関係を設定 | **par** | タスク仕様書一覧 | 依存関係マップ |
| **verify-specs** | **全13仕様書の品質検証** | **seq** | **検証レポート** | **PASS/FAIL判定** |

**実行パターン凡例**:
- `seq`: シーケンシャル（前のTaskに依存）
- `par`: 並列実行（他と独立）

---

## システム仕様参照（aiworkflow-requirements連携）

各Phaseドキュメントの「参照資料」セクションに**必ず**含める:

```markdown
### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス | 内容 |
| -------- | ---- | ---- |
| {{SPEC_NAME}} | `.claude/skills/aiworkflow-requirements/references/{{SPEC_FILE}}.md` | {{SPEC_DESCRIPTION}} |
```

### 画面遷移 / handoff 系タスクで追加必須

- `outputs/phase-1/spec-extraction-map.md` を必須成果物にし、**system spec** と **current code anchor** の 1:1 対応を記録する。
- current code anchor は最低でも「route owner」「既存 handoff 実装」「状態 owner」「対象 view」の 4 系統を含める。
  - 例: `App.tsx` / `useSkillCenter.ts` / `navigationSlice.ts` / `skillLifecycleJourney.ts`
- Phase 1 の本文に AC-1, AC-2... を**明示列挙**し、`AC-1〜AC-7 を定義する` のような予告だけで終わらせない。
- 未実装の将来契約を書く場合は、現行 baseline 契約と分離して記述する。`previousView` など未実在 state 名は placeholder としても使わない。

---

## 変更履歴

| Date | Changes |
| ---- | ------- |
| 2026-01-26 | SKILL.mdから分離・作成 |
