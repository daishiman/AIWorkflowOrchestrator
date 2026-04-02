# Phase 2: 設計

## メタ情報

| 項目   | 値                                                      |
| ------ | ------------------------------------------------------- |
| Phase  | 2                                                       |
| 機能名 | ut-p0-09-governance-runtime-coverage-and-ui-surface-001 |
| 作成日 | 2026-04-02                                              |

## 目的

GovernanceSummaryPanel の UI 設計と全フェーズ governance 配線の設計を行い、Phase 4 以降の実装方針を確定する。

## 実行タスク

- タスク1: GovernanceSummaryPanel コンポーネント設計
- タスク2: 全フェーズ governance 配線の設計整理
- タスク3: execute-only 文言の修正計画作成
- タスク4: IPC/Preload 契約の変更有無確認

## 参照資料

| 資料名         | パス                                                                                 | 説明                        |
| -------------- | ------------------------------------------------------------------------------------ | --------------------------- |
| 既存設定UI     | `apps/desktop/src/renderer/components/organisms/AgentView/AdvancedSettingsPanel.tsx` | 配置先の参照                |
| 型定義         | `packages/shared/src/types/skillCreator.ts`                                          | SkillCreatorGovernanceState |
| Preload API    | `apps/desktop/src/preload/skill-creator-api.ts`                                      | getGovernanceState()        |
| Phase 1 成果物 | `outputs/phase-1/gap-analysis.md`                                                    | ギャップ分析結果            |

## 実行手順

### ステップ1: GovernanceSummaryPanel 設計

**コンポーネント仕様**:

```
GovernanceSummaryPanel
├── Props: なし（自己完結型コンポーネント）
├── 内部状態: governanceState: SkillCreatorGovernanceState | null
├── 表示要素
│   ├── 現在フェーズバッジ (state.phase)
│   ├── permissionMode 表示 (activePolicy.permissionMode)
│   ├── 許可ツール数 (activePolicy.allowedTools.length)
│   ├── 最近の denial リスト (recentDenials, 最大5件)
│   └── セッションサマリー (recentAuditEvents のサマリー)
├── データ取得: useEffect で getGovernanceState() を定期ポーリング（5秒間隔）
└── エラー状態: 取得失敗時はフォールバック表示
```

**配置先**: `AdvancedSettingsPanel.tsx` の governance セクション末尾に統合

**最小表示要件**（Issue #1791 より）:

- denial reason の表示
- recent denials リスト
- session summary

### ステップ2: 全フェーズ governance 配線設計

Phase 1 の current facts を前提に、`RuntimeSkillCreatorFacade.ts` は再設計せず確認対象として扱う：

| フェーズ | 現状                                      | 設計方針                     |
| -------- | ----------------------------------------- | ---------------------------- |
| plan     | `createGovernanceHooks("plan")` 確認要    | 全フェーズで同一パターン適用 |
| execute  | 配線済み                                  | 変更なし                     |
| verify   | `createGovernanceHooks("verify")` 確認要  | 全フェーズで同一パターン適用 |
| improve  | `createGovernanceHooks("improve")` 確認要 | 全フェーズで同一パターン適用 |

**配線パターン**（execute を参照）:

```typescript
// 全フェーズで同一パターンを適用
private async runWithGovernance<T>(
  phase: SkillCreatorGovernancePhase,
  queryFn: (hooks: SkillCreatorHooks) => Promise<T>
): Promise<T> {
  const hooks = this.createGovernanceHooks(phase);
  return queryFn(hooks);
}
```

### ステップ3: execute-only 文言修正計画

対象ファイル（Phase 1 で特定した箇所）に対して：

- "execute phase のみ" → "全フェーズ（plan/execute/verify/improve）"
- "execute-only wiring" → "全フェーズ適用"
- 仕様書内の誤った記述を修正

### ステップ4: IPC/Preload 変更有無

- `skill-creator:get-governance-state` チャネルは変更不要
- `getGovernanceState()` preload API は変更不要
- 新規 IPC チャネルの追加なし
- 型変更なし（`SkillCreatorGovernanceState` はそのまま使用）

## 統合テスト連携

- GovernanceSummaryPanel のレンダリングテストは React Testing Library で実装
- フェーズ配線テストは vitest でモック使用

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断 | 仕様参照先                                                  |
| -------------- | -------- | ----------------------------------------------------------- |
| セキュリティ   | 適用     | governance payload を renderer に露出する際の情報漏洩リスク |
| UI/UX          | 適用     | GovernanceSummaryPanel の視認性・操作性                     |
| アーキテクチャ | 適用     | ポーリング vs サブスクリプション の選択根拠                 |
| Electron固有   | 適用     | IPC 通信の効率性                                            |

## 成果物

| 成果物     | パス                                          | 説明                        |
| ---------- | --------------------------------------------- | --------------------------- |
| UI設計書   | `outputs/phase-2/ui-design.md`                | GovernanceSummaryPanel 仕様 |
| 配線設計書 | `outputs/phase-2/governance-wiring-design.md` | 全フェーズ配線設計          |

## 完了条件

- [ ] GovernanceSummaryPanel のコンポーネント仕様が定義されている
- [ ] 全フェーズ governance 配線の設計方針が確定している
- [ ] execute-only 文言の修正対象ファイルがリスト化されている
- [ ] IPC/Preload 変更の有無が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理【Phase開始時】

1. 参照資料の確認
2. GovernanceSummaryPanel 設計
3. 全フェーズ配線設計
4. execute-only 文言修正計画
5. IPC/Preload 変更確認
6. 成果物の作成・配置
7. artifacts.json 更新

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次のPhase

Phase 3: 設計レビュー
