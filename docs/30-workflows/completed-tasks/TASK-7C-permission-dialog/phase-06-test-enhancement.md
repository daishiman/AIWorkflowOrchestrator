# Phase 6: テスト拡充 - PermissionDialog コンポーネント

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase     | 6                                       |
| Phase名   | テスト拡充                              |
| カテゴリ  | 品質                                    |
| Feature   | skill-import-agent-system               |
| Task      | TASK-7C PermissionDialog コンポーネント |
| 前提Phase | Phase 5（実装）                         |
| 次Phase   | Phase 7（テストカバレッジ確認）         |
| 作成日    | 2026-01-30                              |

## 目的

Phase 5の実装に対してテストカバレッジを拡充し、エッジケース・境界値・統合テストを追加して品質を確保する。

## 実行タスク

### Task 1: カバレッジ現状分析

**目的**: Phase 4/5で作成したテストの現時点のカバレッジを計測する

**手順**:

1. カバレッジ計測コマンドを実行する:
   ```bash
   pnpm --filter @repo/desktop vitest run --coverage src/renderer/components/skill/__tests__/PermissionDialog.test.tsx
   ```
2. Line/Branch/Function カバレッジを記録する
3. カバレッジが不足している箇所を特定する

**目標カバレッジ**:

| メトリクス | 目標値 |
| ---------- | ------ |
| Line       | 80%    |
| Branch     | 60%    |
| Function   | 80%    |

### Task 2: エッジケーステストの追加

**目的**: 境界値・異常系のテストを追加する

**追加テストケース**:

```typescript
describe("エッジケース", () => {
  it("args が空オブジェクトの場合に空のJSONを表示する", () => {
    // args: {} → "{}" が表示される
  });

  it("args.command が空文字の場合にJSONフォールバックする", () => {
    // args: { command: "" } → command が falsy なので JSON表示
  });

  it("args に command と path の両方がある場合に command を優先する", () => {
    // args: { command: "ls", path: "/tmp" } → "ls" が表示される
  });

  it("toolName が長い文字列の場合に適切に表示される", () => {
    // toolName: "VeryLongToolNameThatMightOverflow" → 折り返しまたは切り詰め
  });

  it("args の値に特殊文字が含まれる場合に安全に表示される", () => {
    // args: { command: "<script>alert('xss')</script>" }
    // → エスケープされて安全に表示される（React JSXのデフォルト挙動）
  });

  it("reason が空文字の場合に理由セクションを表示しない", () => {
    // reason: "" → falsy なので理由セクション非表示
  });

  it("args のネストされたオブジェクトが正しくJSON表示される", () => {
    // args: { options: { recursive: true, depth: 3 } }
    // → インデント付きJSONが表示される
  });
});
```

### Task 3: ユーザーインタラクションテストの追加

**目的**: 実際のユーザー操作フローをテストする

**追加テストケース**:

```typescript
describe("ユーザーインタラクション", () => {
  it("チェックボックスをトグルできる（ON→OFF）", () => {
    // ON → OFF のトグル操作
  });

  it("チェックボックスOFF時に「許可」ボタンで remember=false を渡す", () => {
    // チェックなしで許可 → (true, false)
  });

  it("複数回の操作でも状態が正しく管理される", () => {
    // チェックON → 拒否 → 再表示 → チェックがリセットされている
  });

  it("オーバーレイクリックでは何も起こらない", () => {
    // オーバーレイ（背景）クリックでダイアログが閉じないことを確認
    // （仕様上、背景クリックでは閉じない）
  });
});
```

### Task 4: アクセシビリティテストの拡充

**目的**: アクセシビリティ関連のテストを強化する

**追加テストケース**:

```typescript
describe("アクセシビリティ（拡充）", () => {
  it("aria-describedby が説明テキストを参照している", () => {
    // aria-describedby 属性の値がページ内要素のidと一致する
  });

  it("閉じるボタンに aria-label='閉じる' が設定されている", () => {
    // 閉じるボタンの aria-label を確認
  });

  it("フォーカストラップが正しく動作する（Tab循環）", () => {
    // Tab キーで最後の要素 → 最初の要素に循環する
  });

  it("フォーカストラップが正しく動作する（Shift+Tab逆循環）", () => {
    // Shift+Tab で最初の要素 → 最後の要素に循環する
  });

  it("ダイアログ表示時に許可ボタンにフォーカスが当たる", () => {
    // render 後に「許可」ボタンが document.activeElement である
  });
});
```

### Task 5: formatArgs 関数の追加テスト

**目的**: ヘルパー関数のカバレッジを100%にする

**追加テストケース**:

```typescript
describe("formatArgs", () => {
  it("command が数値の場合にJSONフォールバックする", () => {
    // args: { command: 123 } → typeof !== "string" なので JSON
  });

  it("path が数値の場合にJSONフォールバックする", () => {
    // args: { path: 456 } → typeof !== "string" なので JSON
  });

  it("command も path もない場合にJSONフォーマットする", () => {
    // args: { tool: "grep", pattern: "test" } → JSON
  });
});
```

## 統合テスト連携

| カテゴリ     | 確認内容                                                      |
| ------------ | ------------------------------------------------------------- |
| 状態同期     | Store状態の変更に応じたコンポーネント再レンダリング           |
| データフロー | 各ボタンクリック → respondToSkillPermission → Store更新の流れ |
| エラー処理   | 不正な引数データでの安全なレンダリング                        |

## 成果物

| 成果物名           | パス                                                                             | タイプ   |
| ------------------ | -------------------------------------------------------------------------------- | -------- |
| 拡充テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx` | test     |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                                             | document |

## 完了条件

- [ ] カバレッジ現状分析が完了している
- [ ] エッジケーステスト（7件以上）が追加されている
- [ ] ユーザーインタラクションテスト（4件以上）が追加されている
- [ ] アクセシビリティテスト（5件以上）が追加されている
- [ ] formatArgs 追加テスト（3件以上）が追加されている
- [ ] 全テストがPASSしている
- [ ] Line カバレッジ 80% 以上
- [ ] Branch カバレッジ 60% 以上
- [ ] Function カバレッジ 80% 以上
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
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
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-7C-permission-dialog --phase 6
```

## 次のPhase

Phase 7: テストカバレッジ確認

`docs/30-workflows/skill-import-agent-system/tasks/TASK-7C-permission-dialog/phase-07-coverage-verification.md`

## 参照資料

| 参照資料       | パス                                                                         | 説明           |
| -------------- | ---------------------------------------------------------------------------- | -------------- |
| Phase 4成果物  | `outputs/phase-4/`                                                           | テスト仕様書   |
| Phase 5成果物  | `outputs/phase-5/`                                                           | 実装サマリー   |
| カバレッジ基準 | `.claude/skills/task-specification-creator/references/coverage-standards.md` | カバレッジ閾値 |
