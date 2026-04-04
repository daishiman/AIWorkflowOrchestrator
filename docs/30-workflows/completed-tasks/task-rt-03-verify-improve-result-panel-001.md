# Verify / Improve 結果パネル実装 - タスク指示書

## メタ情報

```yaml
issue_number: 1751
task_id: TASK-RT-03-VERIFY-IMPROVE-PANEL-001
task_name: Verify / Improve 結果パネル実装
priority: 中
scale: 中規模
status: 未実施
```

## メタ情報

| 項目         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| タスクID     | TASK-RT-03-VERIFY-IMPROVE-PANEL-001                             |
| タスク名     | Verify / Improve 結果パネル実装                                 |
| 分類         | 新機能                                                          |
| 対象機能     | SkillLifecyclePanel の verify / improve フェーズ結果表示        |
| 優先度       | MEDIUM                                                          |
| 見積もり規模 | M（新規コンポーネント 2件 + テスト + SkillLifecyclePanel 統合） |
| ステータス   | unassigned                                                      |
| 発見元       | TASK-RT-03 Phase 1 スコープ定義（スコープ外として明示）         |
| 作成日       | 2026-03-30                                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-RT-03（Skill Creation Result Panel）では、スキル作成ワークフローの `plan` / `execute` フェーズの結果表示パネルを実装した。しかし `verify` / `improve` フェーズの結果パネルは、実装スコープの制約によりスコープ外とされた（Phase 1 仕様書に明記）。

スキル作成ワークフローは plan → execute → verify → improve のフルサイクルで構成されており、verify/improve フェーズの結果が表示されない状態では、ユーザーはスキルの品質確認・改善提案の内容を視覚的に把握できない。

### 1.2 問題点・課題

- verify フェーズ完了時に `VerifyResultDetailPanel` が存在せず、結果データが表示されない
- improve フェーズ完了時に `ImproveResultDetailPanel` が存在せず、改善提案が表示されない
- `SkillLifecyclePanel.tsx` の currentPhase === 'verify' / 'improve' 時の条件レンダリングが未実装
- ユーザーは verify/improve の詳細結果を確認できず、スキル改善の意思決定が困難

### 1.3 放置した場合の影響

- **短期**: verify/improve フェーズをユーザーが実行しても結果が何も表示されず、UX が著しく低下する
- **中期**: スキル品質の確認・改善ループが機能せず、スキル作成の価値が半減する
- **長期**: フルサイクル未対応のまま他のフェーズ実装が増加し、UI の一貫性が失われる

---

## 2. 何を達成するか（What）

### 2.1 目的

`result-panel-parts.tsx` の共有部品を最大限再利用し、`VerifyResultDetailPanel` と `ImproveResultDetailPanel` を実装する。`SkillLifecyclePanel` に統合し、verify/improve フェーズ完了時に結果を視覚的に表示する。

### 2.2 最終ゴール

- verify フェーズ完了後に VerifyResultDetailPanel が表示されること
- improve フェーズ完了後に ImproveResultDetailPanel が表示されること
- 各パネルが result-panel-parts.tsx の SectionHeader/TagList/StatusBadge/DetailFooter を再利用していること
- テストカバレッジが plan/execute パネルと同水準（各パネル 10件以上）であること

### 2.3 スコープ

| 対象       | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| スコープ内 | VerifyResultDetailPanel.tsx 新規実装                             |
| スコープ内 | ImproveResultDetailPanel.tsx 新規実装                            |
| スコープ内 | SkillLifecyclePanel.tsx への verify/improve フェーズ統合         |
| スコープ内 | 各パネルのユニットテスト                                         |
| スコープ外 | verify/improve の IPC 通信・バックエンドロジック                 |
| スコープ外 | Storybook Story 作成（別タスク TASK-RT-03-STORYBOOK-001 で対応） |

---

## 3. どう実装するか（How）

### 3.1 対応方針

TASK-RT-03 で実装した `PlanResultDetailPanel.tsx` / `ExecuteResultDetailPanel.tsx` のパターンを踏襲する。result-panel-parts.tsx の共有部品を再利用し、各フェーズ固有のデータ型（`RuntimeSkillCreatorVerifyResult` / `RuntimeSkillCreatorImproveResult`）に対応する。

### 3.2 ファイル構成

```
apps/desktop/src/renderer/components/skill/
├── VerifyResultDetailPanel.tsx    # 新規
├── ImproveResultDetailPanel.tsx   # 新規
└── __tests__/
    ├── VerifyResultDetailPanel.test.tsx  # 新規
    └── ImproveResultDetailPanel.test.tsx # 新規
```

### 3.3 SkillLifecyclePanel 統合箇所（コード例）

```tsx
// SkillLifecyclePanel.tsx - currentPhase に応じた条件レンダリング追加
{
  currentPhase === "verify" && rawVerifyDetail && (
    <VerifyResultDetailPanel result={rawVerifyDetail} />
  );
}
{
  currentPhase === "improve" && rawImproveDetail && (
    <ImproveResultDetailPanel result={rawImproveDetail} />
  );
}
```

### 3.4 型定義の確認

`packages/shared/src/types/skill-*.ts` に `RuntimeSkillCreatorVerifyResult` / `RuntimeSkillCreatorImproveResult` の型定義が存在するかを先行確認すること。未定義の場合は型定義の追加も本タスクスコープに含む。

---

## 4. 関連する苦戦箇所・Pitfall

- **TASK-RT-03 での苦戦**: `RuntimeSkillCreatorExecuteResult` が通常応答と `terminal_handoff` サブタイプを持つ場合の分岐ロジックを Phase 2 設計で見落としていた。Verify/Improve のレスポンス型も同様に複数サブタイプの可能性があるため、Phase 2 設計時に型定義を先行確認することが必須
- **SkillLifecyclePanel のstate管理**: rawPlanDetail/rawExecuteDetail を local state で保持する設計を TASK-RT-03 で採用したが、verify/improve フェーズの追加により state の数が増加する。ワークフロー状態管理の全体設計（TASK-SDK-02 の SkillCreatorWorkflowEngine）との整合性を確認すること
- **result-panel-parts.tsx の再利用**: 共有部品の props インターフェースが plan/execute 前提で設計されていた場合、verify/improve 固有データに合わせた型拡張が必要になる可能性がある

---

## 5. 受入基準

- [ ] verify フェーズ完了後に VerifyResultDetailPanel が SkillLifecyclePanel に表示されること
- [ ] improve フェーズ完了後に ImproveResultDetailPanel が SkillLifecyclePanel に表示されること
- [ ] 各パネルが result-panel-parts.tsx の共有部品を再利用していること
- [ ] VerifyResultDetailPanel のユニットテストが 10件以上 PASS すること
- [ ] ImproveResultDetailPanel のユニットテストが 10件以上 PASS すること
- [ ] TypeScript 型チェック・ESLint がエラー 0件であること
- [ ] 既存テスト（53件）が全て PASS すること

---

## 6. 参照

### 6.1 システム仕様書

- `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md` - SkillLifecyclePanel 設計
- `packages/shared/src/types/skill-*.ts` - RuntimeSkillCreator 型定義

### 6.2 依存タスク

- TASK-RT-03: plan/execute 結果パネル（実装済み・参照元）
- TASK-SDK-02: SkillCreatorWorkflowEngine（state管理との統合確認が必要）

### 6.3 タスク成果物（発見元）

- `docs/30-workflows/step-09-par-task-rt-03-skill-creation-result-panel/outputs/phase-12/unassigned-task-detection.md` - 未タスク #3
- `docs/30-workflows/step-09-par-task-rt-03-skill-creation-result-panel/outputs/phase-01/task-spec.md` - スコープ外定義
