# Phase 7: テストカバレッジ確認 - タスク仕様書

## メタ情報

| 項目      | 内容                                |
| --------- | ----------------------------------- |
| Phase     | 7                                   |
| Phase名   | テストカバレッジ確認                |
| カテゴリ  | 品質                                |
| 機能名    | TASK-7D-chatpanel-agent-integration |
| 作成日    | 2026-01-31                          |
| 前提Phase | Phase 5, Phase 6                    |
| 後続Phase | Phase 8                             |

## 目的

Phase 6で拡充したテスト結果を検証し、カバレッジ基準を満たすことを確認する。

## 実行タスク

### タスク1: カバレッジ再測定

**手順**:

1. カバレッジ付きテスト実行:
   ```bash
   pnpm --filter @repo/desktop vitest run --coverage apps/desktop/src/renderer/components/chat/ChatPanel.tsx apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx
   ```
2. 各指標を記録し基準と比較する

### タスク2: 全テスト実行確認

**手順**:

1. 全テスト実行:
   ```bash
   pnpm --filter @repo/desktop test
   ```
2. 既存テスト57件 + 新規テスト全件がPASSであることを確認する

### タスク3: 未達時の対応

**手順**:

1. カバレッジ未達やテスト失敗がある場合、Phase 6へ戻って拡充する
2. 全基準を満たした場合はPhase 8へ進行する

## 統合テスト連携【必須】

| 判定項目          | 基準 | 結果       |
| ----------------- | ---- | ---------- |
| Line Coverage     | 95%+ | {{RESULT}} |
| Branch Coverage   | 85%+ | {{RESULT}} |
| Function Coverage | 95%+ | {{RESULT}} |
| 既存テスト57件    | PASS | {{RESULT}} |
| 新規テスト        | PASS | {{RESULT}} |

## 成果物

| 成果物             | パス                                 | 種別     |
| ------------------ | ------------------------------------ | -------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | document |

## 完了条件

- [ ] Line Coverage 95%以上達成
- [ ] Branch Coverage 85%以上達成
- [ ] Function Coverage 95%以上達成
- [ ] 既存テスト57件が全てPASS
- [ ] 新規テスト全件がPASS
- [ ] カバレッジレポートが出力されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. タスク1: カバレッジ再測定
2. タスク2: 全テスト実行確認
3. タスク3: 未達時の対応（該当時）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7D-chatpanel-agent-integration --phase 7
```

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）→ [phase-8-refactoring.md](phase-8-refactoring.md)
