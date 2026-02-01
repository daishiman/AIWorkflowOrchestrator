# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目      | 内容                                |
| --------- | ----------------------------------- |
| Phase     | 6                                   |
| Phase名   | テスト拡充                          |
| カテゴリ  | 品質                                |
| 機能名    | TASK-7D-chatpanel-agent-integration |
| 作成日    | 2026-01-31                          |
| 前提Phase | Phase 5                             |
| 後続Phase | Phase 7                             |

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標（Line 95%+, Branch 85%+）を達成する。

## 実行タスク

### タスク1: カバレッジ分析

**目的**: 現在のテストカバレッジを測定し、不足領域を特定する。

**手順**:

1. カバレッジ測定を実行する:
   ```bash
   pnpm --filter @repo/desktop vitest run --coverage apps/desktop/src/renderer/components/chat/ChatPanel.tsx apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx
   ```
2. Line/Branch/Functionの各カバレッジ値を記録する
3. 未到達の行・分岐・関数を特定する

### タスク2: テスト拡充（ChatPanel）

**目的**: ChatPanel統合テストのカバレッジを拡充する。

**手順**:

1. 以下のカテゴリで追加テストを作成する:
   - **エッジケース**: streamingMessagesが空の場合、selectedSkillNameが空文字の場合
   - **状態遷移**: isExecutingがtrue→false、skillExecutionStatusの各値遷移
   - **エラー系**: skillErrorが設定された場合のUI表示
   - **useEffect**: fetchSkillsの初回呼び出しテスト
   - **forwardRef**: handleImportRequestメソッドのテスト

### タスク3: テスト拡充（SkillStreamingView）

**目的**: SkillStreamingViewのカバレッジを拡充する。

**手順**:

1. 以下のカテゴリで追加テストを作成する:
   - **境界値**: messages配列が1件のみ、大量メッセージ
   - **メッセージタイプ網羅**: statusタイプ（表示されないことの確認）
   - **ToolExecutionHistory**: 折りたたみ展開操作、details/summaryのアクセシビリティ
   - **React.memo**: Propsが同じ場合にリレンダリングしないこと

### タスク4: 統合テスト拡充

**目的**: コンポーネント間連携テストを追加する。

**手順**:

1. ChatPanel + SkillSelector連携テスト
2. ChatPanel + PermissionDialog連携テスト（Store-direct経由）
3. 全フロー統合テスト（スキル選択→実行→ストリーミング→完了）

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 目標 |
| ----------------- | -------- | -------- | ---- |
| Line Coverage     | 80%      | 90%      | 95%+ |
| Branch Coverage   | 60%      | 70%      | 85%+ |
| Function Coverage | 80%      | 90%      | 95%+ |

## 統合テスト連携【必須】

| テストカテゴリ     | 検証項目                                            | 目標 |
| ------------------ | --------------------------------------------------- | ---- |
| データフローテスト | Store → ChatPanel → SkillStreamingView Props渡し    | 100% |
| コンポーネント連携 | SkillSelector → onImportRequest → SkillImportDialog | 100% |
| 状態遷移テスト     | skillExecutionStatus全値の表示確認                  | 100% |
| エラーハンドリング | skillError表示、tool_result失敗表示                 | 100% |

## 成果物

| 成果物             | パス                                  | 種別     |
| ------------------ | ------------------------------------- | -------- |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`  | document |
| 統合テスト結果     | `outputs/phase-6/integration-test.md` | document |

## 完了条件

- [ ] Line Coverage 95%以上達成
- [ ] Branch Coverage 85%以上達成
- [ ] Function Coverage 95%以上達成
- [ ] 統合テスト（コンポーネント間連携）が追加されている
- [ ] エッジケース・境界値テストが追加されている
- [ ] 全テスト（既存57件 + 新規）がPASS
- [ ] カバレッジレポートが出力されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: カバレッジ分析
3. タスク2: テスト拡充（ChatPanel）
4. タスク3: テスト拡充（SkillStreamingView）
5. タスク4: 統合テスト拡充
6. 統合テスト連携の実施
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7D-chatpanel-agent-integration --phase 6
```

## 次のPhase

Phase 7: テストカバレッジ確認 → [phase-7-coverage.md](phase-7-coverage.md)
