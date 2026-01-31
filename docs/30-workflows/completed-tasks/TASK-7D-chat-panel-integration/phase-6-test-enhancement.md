# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目      | 内容                           |
| --------- | ------------------------------ |
| Phase     | 6                              |
| Phase名   | テスト拡充                     |
| カテゴリ  | 品質                           |
| 機能名    | TASK-7D-chat-panel-integration |
| 作成日    | 2026-01-30                     |
| 前提Phase | Phase 5                        |
| 後続Phase | Phase 7                        |

## 目的

Phase 5 の実装に対して、エッジケース、アクセシビリティ、境界値、エラーケースのテストを追加し、テストカバレッジを拡充する。

## 実行タスク

### タスク1: SkillStreamingView エッジケーステスト追加

**目的**: SkillStreamingView の境界値・エッジケースをカバーするテストを追加する。

**手順**:

1. `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx` に以下のテストを追加する:

```typescript
describe("SkillStreamingView - エッジケース", () => {
  it("should handle empty messages array", () => {
    // messages=[] でエラーなくレンダリングされることを検証
  });

  it("should handle large number of messages", () => {
    // 100件以上のメッセージで正常にレンダリングされることを検証
  });

  it("should handle assistant message with empty text", () => {
    // content.text="" のメッセージが表示されることを検証
  });

  it("should handle assistant message with very long text", () => {
    // 10000文字以上のテキストが whitespace-pre-wrap で折り返されることを検証
  });

  it("should handle tool_result with empty error message", () => {
    // success: false, error: "" のケースを検証
  });

  it("should handle unknown message type gracefully", () => {
    // 未知の type のメッセージが null を返すことを検証
  });

  it("should handle status transition from running to completed", () => {
    // status が running → completed に変わったときの表示更新を検証
  });

  it("should handle status transition from running to error", () => {
    // status が running → error に変わったときの表示更新を検証
  });
});
```

**期待される成果物**:

- SkillStreamingView.test.tsx に追加されたエッジケーステスト

### タスク2: ChatPanel 統合エッジケーステスト追加

**目的**: ChatPanel 統合のエッジケースをカバーするテストを追加する。

**手順**:

1. `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx` に以下のテストを追加する:

```typescript
describe("ChatPanel - エッジケース", () => {
  it("should handle fetchSkills error gracefully", () => {
    // fetchSkills が例外をスローした場合にクラッシュしないことを検証
  });

  it("should update importDialogSkill correctly on import request", () => {
    // onImportRequest で正しい skill が設定されることを検証
  });

  it("should clear importDialogSkill on dialog close", () => {
    // onClose で importDialogSkill が null にリセットされることを検証
  });

  it("should render without crash when store returns initial state", () => {
    // Store の初期状態で正常にレンダリングされることを検証
  });

  it("should not re-render SkillStreamingView when messages unchanged", () => {
    // messages 配列の参照が変わらない場合にリレンダーしないことを検証
  });
});
```

**期待される成果物**:

- ChatPanel.test.tsx に追加されたエッジケーステスト

### タスク3: アクセシビリティテスト追加

**目的**: WCAG 2.1 AA 準拠のアクセシビリティテストを追加する。

**手順**:

1. SkillStreamingView のアクセシビリティテストを追加する:

```typescript
describe("SkillStreamingView - アクセシビリティ", () => {
  it("should have role='log' on streaming container", () => {
    // ストリーミング表示エリアに role="log" が設定されていることを検証
  });

  it("should have aria-live='polite' on streaming container", () => {
    // aria-live="polite" が設定されていることを検証
  });

  it("should have aria-label on abort button", () => {
    // 中止ボタンに aria-label="スキル実行を中止する" が設定されていることを検証
  });

  it("should have role='status' on status badge", () => {
    // StatusBadge に role="status" が設定されていることを検証
  });
});
```

2. ChatPanel のアクセシビリティテストを追加する:

```typescript
describe("ChatPanel - アクセシビリティ", () => {
  it("should have proper heading structure", () => {
    // ヘッダー領域のセマンティクスが適切であることを検証
  });
});
```

**期待される成果物**:

- アクセシビリティテストが各テストファイルに追加されている

### タスク4: テスト実行と全 Green 確認

**目的**: 追加した全テストが Green であることを確認する。

**手順**:

1. 以下のコマンドで全テストを実行する:

```bash
pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx
pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx
```

2. 全テストが PASS であることを確認する
3. 失敗しているテストがある場合は、実装に不足があるか確認し修正する

**期待される成果物**:

- テスト実行結果ログ（全 Green）

## 参照資料

| 参照資料                  | パス                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------- |
| Phase 4 テストファイル    | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`           |
| Phase 4 テストファイル    | `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx` |
| Phase 5 実装ファイル      | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`                |
| Phase 5 実装ファイル      | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                          |
| テストカバレッジ基準      | `.claude/skills/task-specification-creator/references/coverage-standards.md`       |
| 既存テスト例（162テスト） | `apps/desktop/src/renderer/components/chat/__tests__/StreamingMessage.test.tsx`    |

## 統合テスト連携

### このフェーズで追加すべき統合テスト観点

| カテゴリ           | テスト観点                                                      |
| ------------------ | --------------------------------------------------------------- |
| エラーハンドリング | fetchSkills 失敗時の UI 状態が正しいか                          |
| 状態遷移           | running → completed、running → error の遷移が UI に反映されるか |
| コンポーネント連携 | importDialog の open/close ライフサイクルが正しいか             |

## 多角的観点チェック

### Renderer（フロントエンド）層

| 観点             | 確認項目                                                 |
| ---------------- | -------------------------------------------------------- |
| エッジケース     | 空配列、大量データ、未知の型など境界値が網羅されているか |
| テスト独立性     | 各テストケースが他のテストに依存していないか             |
| アクセシビリティ | ARIA 属性のテストが含まれているか                        |

## 成果物

| 成果物                            | パス                                                                               | 種別 |
| --------------------------------- | ---------------------------------------------------------------------------------- | ---- |
| SkillStreamingView テスト（拡充） | `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx` | test |
| ChatPanel テスト（拡充）          | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`           | test |

## 完了条件

- [ ] SkillStreamingView のエッジケーステスト（8 ケース以上）が追加されている
- [ ] ChatPanel のエッジケーステスト（5 ケース以上）が追加されている
- [ ] アクセシビリティテスト（5 ケース以上）が追加されている
- [ ] 全テストが Green（PASS）である
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: SkillStreamingView エッジケーステスト追加
3. タスク2: ChatPanel 統合エッジケーステスト追加
4. タスク3: アクセシビリティテスト追加
5. タスク4: テスト実行と全 Green 確認
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-7D-chat-panel-integration --phase 6
```

## 次のPhase

Phase 7: テストカバレッジ確認 → [phase-7-coverage.md](phase-7-coverage.md)
