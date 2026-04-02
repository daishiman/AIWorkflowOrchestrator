# Phase 5: 実装

## メタ情報

| 項目   | 値                                                      |
| ------ | ------------------------------------------------------- |
| Phase  | 5                                                       |
| 機能名 | ut-p0-09-governance-runtime-coverage-and-ui-surface-001 |
| 作成日 | 2026-04-02                                              |

## 目的

GovernanceSummaryPanel の実装・全フェーズ governance 配線の確認・execute-only 文言の修正を行い、TDD テストを GREEN にする。

## 実行タスク

- タスク1: GovernanceSummaryPanel コンポーネント実装
- タスク2: 全フェーズ governance 配線の確認（必要時のみ修正）
- タスク3: execute-only 文言の修正
- タスク4: テスト GREEN 確認

## 参照資料

| 資料名         | パス                                                                                                 | 説明        |
| -------------- | ---------------------------------------------------------------------------------------------------- | ----------- |
| Phase 2 設計書 | `outputs/phase-2/ui-design.md`                                                                       | 実装仕様    |
| 既存設定UI     | `apps/desktop/src/renderer/components/organisms/AgentView/AdvancedSettingsPanel.tsx`                 | 統合先      |
| Facade         | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                | 配線確認先  |
| Lessons        | `.claude/skills/aiworkflow-requirements/references/lessons-learned-governance-hooks-phase-policy.md` | 文言修正先  |
| Preload API    | `apps/desktop/src/preload/skill-creator-api.ts`                                                      | IPC呼び出し |

## 新規/修正ファイルパス一覧【必須記載】

| 操作         | ファイルパス                                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| 新規作成     | `apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx`                |
| 修正         | `apps/desktop/src/renderer/components/organisms/AgentView/AdvancedSettingsPanel.tsx`                 |
| 修正（文言） | `.claude/skills/aiworkflow-requirements/references/lessons-learned-governance-hooks-phase-policy.md` |
| 確認先       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                |

## 実行手順

### ステップ1: GovernanceSummaryPanel 実装

**ファイル**: `apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx`

実装内容:

- `SkillCreatorGovernanceState` を IPC 経由で取得する React コンポーネント
- 5秒ポーリング（`useEffect` + `setInterval` + クリーンアップ）
- 表示項目: phase / permissionMode / recentDenials（最大5件） / session summary
- エラー状態: 取得失敗時のフォールバック表示

**AdvancedSettingsPanel への統合**:

- `AdvancedSettingsPanel.tsx` の governance セクションに `GovernanceSummaryPanel` を追加

### ステップ2: 全フェーズ governance 配線確認

`RuntimeSkillCreatorFacade.ts` の各フェーズメソッドを確認:

```typescript
// 確認ポイント
// plan(), execute(), verifySkill(), improve() が
// createGovernanceHooks() を適切なフェーズ引数で呼んでいるか確認
```

不足している場合のみ修正を加える。Phase 1 の current facts では配線済みのため、原則は確認のみ。

### ステップ3: execute-only 文言の修正

Phase 1 で特定したファイルの文言を修正:

- "execute phase のみ" / "execute-only" → "全フェーズ（plan/execute/verify/improve）"
- 対象: `.claude/skills/aiworkflow-requirements/references/lessons-learned-governance-hooks-phase-policy.md`

### ステップ4: テスト GREEN 確認

```bash
pnpm --filter @repo/desktop test -- --run GovernanceSummaryPanel
pnpm --filter @repo/desktop test -- --run GovernanceAllPhases
pnpm --filter @repo/desktop test -- --run governance
```

期待結果: 全テスト PASS

## 統合テスト連携

- 既存 130+ governance tests が PASS 継続
- 新規 14 テスト（GovernanceSummaryPanel 7 + GovernanceAllPhases 7）が PASS

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断 | 仕様参照先                            |
| -------------- | -------- | ------------------------------------- |
| セキュリティ   | 適用     | IPC payload に機密情報を含めない      |
| UI/UX          | 適用     | 情報密度・視認性                      |
| Electron固有   | 適用     | Main/Renderer/IPC/Preload 4層の整合性 |
| アーキテクチャ | 適用     | polling 実装のメモリリーク防止        |

## 成果物

| 成果物                 | パス                                                                                  | 説明             |
| ---------------------- | ------------------------------------------------------------------------------------- | ---------------- |
| GovernanceSummaryPanel | `apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx` | コード成果物     |
| 実装記録               | `outputs/phase-5/implementation-record.md`                                            | 変更内容サマリー |

## 完了条件

- [ ] GovernanceSummaryPanel が実装されている
- [ ] AdvancedSettingsPanel に統合されている
- [ ] 全フェーズ governance 配線が確認されている
- [ ] execute-only 文言が修正されている
- [ ] 全テストが GREEN
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理【Phase開始時】

1. Phase 2 設計書の確認
2. GovernanceSummaryPanel 実装
3. AdvancedSettingsPanel への統合
4. フェーズ配線確認
5. execute-only 文言修正
6. テスト GREEN 確認
7. 実装記録作成
8. artifacts.json 更新

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次のPhase

Phase 6: テスト拡充
