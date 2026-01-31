# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目      | 内容                           |
| --------- | ------------------------------ |
| Phase     | 4                              |
| Phase名   | テスト作成                     |
| カテゴリ  | TDD-Red                        |
| 機能名    | TASK-7D-chat-panel-integration |
| 作成日    | 2026-01-30                     |
| 前提Phase | Phase 3                        |
| 後続Phase | Phase 5                        |

## 目的

Phase 2 の設計に基づき、ChatPanel 統合と SkillStreamingView のコンポーネントテストを先に作成する（TDD Red フェーズ）。テストは全て失敗する状態で作成し、Phase 5 で実装して Green にする。

## 実行タスク

### タスク1: ChatPanel 統合テスト作成

**目的**: ChatPanel にスキル関連コンポーネントが統合されていることを検証するテストを作成する。

**手順**:

1. `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx` を作成する
2. テストファイルに必要なモック設定を記述する:
   - `useAppStore` のモック（vitest の `vi.mock`）
   - SkillSelector、SkillImportDialog、PermissionDialog のモック
3. 以下のテストケースを記述する:

```typescript
describe("ChatPanel with Skills", () => {
  it("should render SkillSelector in header", () => {
    // SkillSelector コンポーネントがレンダリングされることを検証
    // SkillSelector が header 領域内に配置されていることを検証
  });

  it("should show streaming view when skill is executing", () => {
    // isExecuting: true, selectedSkillName: "test-skill" の状態で
    // SkillStreamingView がレンダリングされることを検証
  });

  it("should hide streaming view when idle", () => {
    // isExecuting: false の状態で
    // SkillStreamingView がレンダリングされないことを検証
  });

  it("should hide streaming view when no skill selected", () => {
    // isExecuting: true, selectedSkillName: null の状態で
    // SkillStreamingView がレンダリングされないことを検証
  });

  it("should render PermissionDialog when pendingPermission exists", () => {
    // pendingPermission が設定された状態で
    // PermissionDialog がレンダリングされることを検証
  });

  it("should show SkillImportDialog when import requested", () => {
    // SkillSelector の onImportRequest を呼び出し
    // SkillImportDialog が表示されることを検証
  });

  it("should close SkillImportDialog when onClose called", () => {
    // SkillImportDialog の onClose を呼び出し
    // ダイアログが非表示になることを検証
  });

  it("should call fetchSkills on mount", () => {
    // ChatPanel マウント時に fetchSkills が呼ばれることを検証
  });
});
```

4. テストが全て Red（失敗）であることを確認する

**期待される成果物**:

- `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`

### タスク2: SkillStreamingView コンポーネントテスト作成

**目的**: SkillStreamingView の全機能をカバーするコンポーネントテストを作成する。

**手順**:

1. `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx` を作成する
2. テストファイルに必要なモック設定を記述する:
   - `useAppStore` のモック（abortExecution のモック）
   - SkillStreamMessage のテストデータファクトリ関数
3. 以下のテストケースを記述する:

```typescript
describe("SkillStreamingView", () => {
  describe("ヘッダー表示", () => {
    it("should render skill name", () => {
      // skillName="test-skill" が表示されることを検証
    });

    it("should render status badge for running", () => {
      // status="running" で "実行中..." バッジが表示されることを検証
    });

    it("should render status badge for permission_pending", () => {
      // status="permission_pending" で "権限確認" バッジが表示されることを検証
    });

    it("should render status badge for completed", () => {
      // status="completed" で "完了" バッジが表示されることを検証
    });

    it("should render status badge for cancelled", () => {
      // status="cancelled" で "キャンセル" バッジが表示されることを検証
    });

    it("should render status badge for error", () => {
      // status="error" で "エラー" バッジが表示されることを検証
    });

    it("should not render status badge for idle", () => {
      // status="idle" でバッジが表示されないことを検証
    });

    it("should not render status badge for null", () => {
      // status=null でバッジが表示されないことを検証
    });
  });

  describe("中止ボタン", () => {
    it("should show abort button when running", () => {
      // status="running" で中止ボタンが表示されることを検証
    });

    it("should hide abort button when not running", () => {
      // status="completed" で中止ボタンが表示されないことを検証
    });

    it("should call abortExecution when abort clicked", () => {
      // 中止ボタンクリックで abortExecution が呼ばれることを検証
    });
  });

  describe("メッセージ表示", () => {
    it("should render assistant messages", () => {
      // type="assistant" のメッセージテキストが表示されることを検証
    });

    it("should render partial cursor for streaming assistant message", () => {
      // isPartial: true のメッセージで ▌ カーソルが表示されることを検証
    });

    it("should not render cursor for complete assistant message", () => {
      // isPartial: false のメッセージでカーソルが表示されないことを検証
    });

    it("should render tool use notifications", () => {
      // type="tool_use" のメッセージでツール名が表示されることを検証
    });

    it("should render successful tool results", () => {
      // type="tool_result", success: true で完了表示を検証
    });

    it("should render failed tool results", () => {
      // type="tool_result", success: false でエラー表示を検証
    });

    it("should render error messages", () => {
      // type="error" のメッセージでエラーメッセージが表示されることを検証
    });
  });

  describe("ツール実行履歴", () => {
    it("should show tool execution history when tools exist", () => {
      // tool_use/tool_result メッセージがある場合に履歴セクションが表示されることを検証
    });

    it("should hide tool execution history when no tools", () => {
      // ツールメッセージがない場合に履歴セクションが非表示であることを検証
    });

    it("should show correct tool count", () => {
      // ツール数が正しく表示されることを検証（tool_use + tool_result のペア数）
    });
  });
});
```

4. テストが全て Red（失敗）であることを確認する

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx`

### タスク3: テスト実行確認（Red 確認）

**目的**: 作成した全テストが失敗（Red）することを確認する。

**手順**:

1. 以下のコマンドでテストを実行する:

```bash
pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx
pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx
```

2. 全テストが FAIL であることを確認する
3. テスト失敗理由が「コンポーネントが存在しない」または「期待する要素が見つからない」であることを確認する（テストコード自体のエラーでないこと）

**期待される成果物**:

- テスト実行結果ログ（Red 確認）

## 参照資料

| 参照資料             | パス                                                                             |
| -------------------- | -------------------------------------------------------------------------------- |
| Phase 2 設計成果物   | `outputs/phase-2/` ディレクトリ全体                                              |
| 既存テスト例         | `apps/desktop/src/renderer/components/chat/__tests__/StreamingMessage.test.tsx`  |
| 既存テスト例         | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx` |
| テストカバレッジ基準 | `.claude/skills/task-specification-creator/references/coverage-standards.md`     |

## 統合テスト連携

### このフェーズで作成すべき統合テスト観点

| カテゴリ           | テスト観点                                                     |
| ------------------ | -------------------------------------------------------------- |
| Store→UI連携       | useAppStore のモック状態が正しく UI に反映されるテスト         |
| コンポーネント連携 | SkillSelector → SkillImportDialog の表示制御テスト             |
| 条件分岐テスト     | isExecuting/selectedSkillName の組み合わせによる表示切替テスト |

## 多角的観点チェック

### Renderer（フロントエンド）層

| 観点           | 確認項目                                             |
| -------------- | ---------------------------------------------------- |
| テスタビリティ | useAppStore のモックが適切に設定されているか         |
| テスト独立性   | 各テストケースが他のテストに依存していないか         |
| テストデータ   | テストデータファクトリが再利用可能に設計されているか |

## 成果物

| 成果物                    | パス                                                                               | 種別 |
| ------------------------- | ---------------------------------------------------------------------------------- | ---- |
| ChatPanel テスト          | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`           | test |
| SkillStreamingView テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx` | test |

## 完了条件

- [ ] ChatPanel.test.tsx が作成されている（8 テストケース以上）
- [ ] SkillStreamingView.test.tsx が作成されている（20 テストケース以上）
- [ ] 全テストが Red（失敗）状態であることが確認されている
- [ ] テスト失敗理由がテストコードの不備ではなく、実装未完了であること
- [ ] テストデータファクトリ関数が作成されている
- [ ] useAppStore のモック設定が正しく記述されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: ChatPanel 統合テスト作成
3. タスク2: SkillStreamingView コンポーネントテスト作成
4. タスク3: テスト実行確認（Red 確認）
5. 統合テスト連携の実施
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-7D-chat-panel-integration --phase 4
```

## 次のPhase

Phase 5: 実装 → [phase-5-implementation.md](phase-5-implementation.md)
