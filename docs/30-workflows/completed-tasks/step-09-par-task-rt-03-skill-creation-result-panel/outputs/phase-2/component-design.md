# Phase 2: Component Design

## PlanResultDetailPanel レイアウト

```
┌──────────────────────────────────────────────────────────────┐
│ [Plan 結果]                           [estimatedSteps badge] │
│ skillName (H3)                                               │
│ description (サブテキスト)                                   │
├──────────────────────────────────────────────────────────────┤
│ Agents                                                       │
│ ├─ agentName — role                                          │
│ └─ agentName — role                                          │
├──────────────────────────────────────────────────────────────┤
│ Scripts                                                      │
│ ├─ scriptName — purpose                                      │
│ └─ scriptName — purpose                                      │
├──────────────────────────────────────────────────────────────┤
│ Triggers        [tag] [tag] [tag]                            │
├──────────────────────────────────────────────────────────────┤
│ Anchors         [tag] [tag] [tag]                            │
├──────────────────────────────────────────────────────────────┤
│ ▶ Skill Spec（折りたたみ）                                   │
│   skillSpec の全文表示                                       │
├──────────────────────────────────────────────────────────────┤
│ Plan ID: planId                                   (フッター) │
└──────────────────────────────────────────────────────────────┘
```

## ExecuteResultDetailPanel レイアウト

```
┌──────────────────────────────────────────────────────────────┐
│ [Execute 結果]                         [成功/失敗 badge]     │
│ skillName (H3)                                               │
├──────────────────────────────────────────────────────────────┤
│ ✓ スキルが正常に作成されました（成功時）                    │
│ ✗ スキルの作成に失敗しました（失敗時）                      │
│   error メッセージ表示                                       │
├──────────────────────────────────────────────────────────────┤
│ Metadata: sessionId / resultSubtype / stopReason             │
├──────────────────────────────────────────────────────────────┤
│ ▶ Permission Denials (N件)                                   │
│ ▶ SDK Events (N件)                                           │
│ ▶ Source Provenance                                          │
├──────────────────────────────────────────────────────────────┤
│ [再試行] ボタン（失敗時のみ）                                │
├──────────────────────────────────────────────────────────────┤
│ Execute ID: executeId                             (フッター) │
└──────────────────────────────────────────────────────────────┘
```

## 状態遷移

### PlanResultDetailPanel

- `isLoading: true` → スケルトンローダー
- `planResult: null, error: null` → null (非表示)
- `planResult: null, error: {..}` → ErrorBanner
- `planResult: {..}` → 通常結果パネル

### ExecuteResultDetailPanel

- `isLoading: true` → プログレスインジケーター
- `executeResult: null, error: null` → null (非表示)
- `executeResult: null, error: {..}` → ErrorBanner
- `executeResult.success: true` → 成功パネル
- `executeResult.success: false` → 失敗パネル + 再試行ボタン

## SkillLifecyclePanel 統合方式

```
currentPhase === "review" && rawPlanDetail !== null
  → <PlanResultDetailPanel planResult={rawPlanDetail} />

currentPhase === "verify" && rawExecuteDetail !== null
  → <ExecuteResultDetailPanel executeResult={rawExecuteDetail} />
```

raw detail は SkillLifecyclePanel の local state に保持。
terminal_handoff は既存 handoff card で分離。
