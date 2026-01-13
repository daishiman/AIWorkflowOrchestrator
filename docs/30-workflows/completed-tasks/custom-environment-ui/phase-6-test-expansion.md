# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 6                     |
| 機能名 | custom-environment-ui |
| 作成日 | 2026-01-13            |

## 目的

エッジケース、境界値、異常系のテストを追加してカバレッジを向上させる。

## 実行タスク

- エッジケーステスト: 境界値、空入力、大量データ
- 異常系テスト: エラーハンドリング、フォールバック動作
- セキュリティ追加テスト: XSS攻撃パターン、sandbox回避試行

## 参照資料

| 資料名     | パス                                                                     | 説明           |
| ---------- | ------------------------------------------------------------------------ | -------------- |
| 既存テスト | `outputs/phase-4/`                                                       | Phase 4テスト  |
| テスト戦略 | `.claude/skills/aiworkflow-requirements/references/test-msw-coverage.md` | カバレッジ目標 |

### システム仕様（aiworkflow-requirements）

> テスト拡充時に以下のシステム仕様を参照してください。

| 参照資料               | パス                                                                         | 内容            |
| ---------------------- | ---------------------------------------------------------------------------- | --------------- |
| テストカバレッジ戦略   | `.claude/skills/aiworkflow-requirements/references/test-msw-coverage.md`     | Vitest/MSW設定  |
| Electronセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | CSP/sandbox設定 |
| UIコンポーネントガイド | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | RTLテスト方法   |

---

## 追加テストケース

### SplitLayout追加テスト

```typescript
describe("SplitLayout - エッジケース", () => {
  it("0%の比率を設定しようとするとminRatioに制限される", () => {});
  it("100%の比率を設定しようとするとmaxRatioに制限される", () => {});
  it("ウィンドウリサイズ時に比率が維持される", () => {});
  it("タッチデバイスでドラッグ操作ができる", () => {});
  it("ディバイダーにフォーカス時のスタイルが適用される", () => {});
});
```

### HTMLPreviewEnvironment追加テスト

```typescript
describe("HTMLPreviewEnvironment - セキュリティ", () => {
  it("base64エンコードされたスクリプトを検出・除去する", () => {});
  it("SVGのonloadイベントを除去する", () => {});
  it("data:text/html URLを無効化する", () => {});
  it("meta refreshタグを除去する", () => {});
  it("formタグのactionをサニタイズする", () => {});
  it("100KBを超えるHTMLでもパフォーマンスが維持される", () => {});
});
```

### sanitizeHTML追加テスト

```typescript
describe("sanitizeHTML - 攻撃パターン", () => {
  it("大文字小文字混合のタグを処理する (<ScRiPt>)", () => {});
  it("ネストしたタグを処理する (<script><script>)", () => {});
  it("エンコードされたイベントハンドラを除去する", () => {});
  it("コメント内の危険なコードを無害化する", () => {});
  it("不完全なタグを適切に処理する", () => {});
});
```

### agentSlice追加テスト

```typescript
describe("agentSlice - 境界値", () => {
  it("splitRatioが0以下にならない", () => {});
  it("splitRatioが100以上にならない", () => {});
  it("非常に大きなpreviewContentを処理できる", () => {});
  it("連続した更新をデバウンスする", () => {});
});
```

---

## カバレッジ目標

| 対象                       | 行カバレッジ | 分岐カバレッジ | 関数カバレッジ |
| -------------------------- | ------------ | -------------- | -------------- |
| SplitLayout                | 80%          | 60%            | 80%            |
| HTMLPreviewEnvironment     | 85%          | 70%            | 80%            |
| MarkdownPreviewEnvironment | 80%          | 60%            | 80%            |
| sanitizeHTML               | 90%          | 80%            | 100%           |
| agentSlice拡張             | 80%          | 60%            | 80%            |

---

## 統合テスト連携【必須】

統合ポイントの追加テストを作成する:

| 統合ポイント           | 追加テスト内容                     |
| ---------------------- | ---------------------------------- |
| agentSlice拡張         | 連続更新、大量データ、状態リセット |
| SplitLayout↔親         | 異常な比率、高速ドラッグ           |
| ExecutionEnvironment   | 無効な環境タイプ、null content     |
| HTMLPreviewEnvironment | XSS攻撃パターン、大量HTML          |

---

## 成果物

| 成果物             | パス                                    | 説明           |
| ------------------ | --------------------------------------- | -------------- |
| エッジケーステスト | `outputs/phase-6/edge-case-tests/`      | 境界値テスト   |
| 異常系テスト       | `outputs/phase-6/error-handling-tests/` | エラー処理     |
| セキュリティテスト | `outputs/phase-6/security-tests/`       | XSS対策        |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`    | カバレッジ結果 |

---

## 完了条件

- [ ] エッジケーステストが追加されている
- [ ] 異常系テストが追加されている
- [ ] セキュリティ追加テストが作成されている
- [ ] カバレッジ目標を達成している
- [ ] すべてのテストがパスする
- [ ] 統合ポイントの追加テストが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 現在のカバレッジ確認
2. SplitLayoutエッジケーステスト追加
3. HTMLPreviewEnvironmentセキュリティテスト追加
4. sanitizeHTML攻撃パターンテスト追加
5. agentSlice境界値テスト追加
6. 統合テストの追加
7. カバレッジレポート作成
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# カバレッジ確認
pnpm --filter @repo/desktop test:coverage

# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/custom-environment-ui --phase 6
```

## 次のPhase

Phase 7: カバレッジ確認
