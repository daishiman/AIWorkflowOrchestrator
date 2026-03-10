# IPC ハンドラテスト意図的 stderr 出力抑制 - タスク指示書

## メタ情報

```yaml
issue_number: 1134
```

## メタ情報

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスクID     | UT-IMP-IPC-HANDLER-TEST-STDERR-SUPPRESSION-001       |
| タスク名     | IPC ハンドラテスト意図的 stderr 出力抑制（P20 関連） |
| 分類         | 改善                                                 |
| 対象機能     | テスト基盤（Main Process IPC ハンドラテスト）        |
| 優先度       | 低                                                   |
| 見積もり規模 | 小規模                                               |
| ステータス   | 未実施                                               |
| 発見元       | TASK-10A-G Phase 10（最終レビュー）                  |
| 発見日       | 2026-03-10                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-G の Phase 10 最終レビューで、G1（Main IPC skill:create 契約テスト）のエラーハンドリングテストが意図的に IPC ハンドラのエラーパスを実行する際、`console.error` 経由で stderr に警告メッセージが出力されることが確認された。

具体例:

- `MockElectronStore` のスキーマバリデーション警告
- `skillHandlers.ts` 内の `catch` ブロックが出力するエラーログ
- `validateIpcSender` のセキュリティ警告メッセージ

これらは**テストが正しく動作している証拠**であるが、テスト出力に混ざることで以下の問題が発生する:

### 1.2 放置した場合の影響

- テスト出力のノイズが増え、本当のエラーを見落とすリスク（P20 パターン）
- CI ログの可読性低下（意図的 stderr と実際のエラーの区別が困難）
- 新規テスト作成者が stderr 出力を「テスト失敗」と誤認する可能性
- テスト数増加に伴い stderr 出力量が線形増加

---

## 2. 何を達成するか（What）

### 2.1 目的

IPC ハンドラのエラーパステスト実行時の意図的 stderr 出力を、テストの正当性を維持しつつ抑制し、テスト出力のシグナル対ノイズ比を改善する。

### 2.2 最終ゴール

- エラーパステスト実行時の `console.error` / `console.warn` が抑制されている
- 抑制された出力は必要に応じてデバッグ時に確認可能（完全削除ではない）
- 新規テスト作成時に抑制パターンが容易に適用可能
- テスト自体のアサーションは変更されていない（既存テスト全 PASS）

### 2.3 スコープ（含むもの / 含まないもの）

#### 含むもの

- `suppressConsole()` / `restoreConsole()` ユーティリティの作成
- G1 テスト（14テスト）のエラーパステストへの適用
- `beforeEach` / `afterEach` でのグローバル抑制設定
- 抑制された出力のバッファリング（デバッグ時に `--verbose` で確認可能）

#### 含まないもの

- G2/G3 テストへの適用（G2/G3 は Renderer 側で別パターン）
- `console.log` の抑制（情報ログは対象外）
- テスト実装の変更（アサーションロジックは不変）
- Vitest の Reporter カスタマイズ

### 2.4 成果物

| 成果物                        | 説明                                                |
| ----------------------------- | --------------------------------------------------- |
| console-suppression-helper.ts | suppressConsole() / restoreConsole() ユーティリティ |
| ユーティリティテスト          | ヘルパー自体の単体テスト                            |
| G1 テストリファクタリング     | エラーパステスト（約 5 テスト）への抑制適用         |
| Phase 1-12 成果物             | 各Phaseの標準出力ドキュメント                       |

---

## 3. どのように実現するか（How）

### 3.1 技術方針

1. **`apps/desktop/src/main/ipc/__tests__/helpers/console-suppression-helper.ts` を作成**
   - `suppressConsole(methods?: ('error' | 'warn')[])` で指定メソッドをモックに差し替え
   - `restoreConsole()` で元の実装に復元
   - 抑制中の出力は内部バッファに蓄積（`getBufferedOutput()` で取得可能）

2. **テストへの適用パターン**

```typescript
// パターン A: describe ブロック全体で抑制
describe("error handling", () => {
  let consoleSuppressor: ConsoleSuppressor;

  beforeEach(() => {
    consoleSuppressor = suppressConsole(["error", "warn"]);
  });

  afterEach(() => {
    consoleSuppressor.restore();
  });

  it("should return validation error for empty description", async () => {
    // console.error は抑制されるが、テスト自体は正常に動作
    const result = await handler(mockEvent, { name: "test", description: "" });
    expect(result.success).toBe(false);
  });
});

// パターン B: 個別テストで抑制
it("should handle service error", async () => {
  using _ = suppressConsoleScoped(["error"]); // Explicit Resource Management
  const result = await handler(mockEvent, invalidArgs);
  expect(result.success).toBe(false);
});
```

3. **Explicit Resource Management (using) 対応**
   - TypeScript 5.2+ の `Symbol.dispose` を活用した `using` 構文をサポート
   - スコープ終了時に自動復元（`afterEach` 忘れ防止）

### 3.2 リスクと対策

| リスク                                         | 対策                                                        |
| ---------------------------------------------- | ----------------------------------------------------------- |
| 実際のエラーも抑制してしまう                   | エラーパステストの describe ブロックのみに適用範囲を限定    |
| TypeScript 5.2 の using 構文が Vitest で未対応 | フォールバックとして beforeEach/afterEach パターンも提供    |
| バッファメモリリーク                           | restoreConsole() 時にバッファをクリア、maxBufferSize を設定 |

---

## 4. TASK-10A-G からの教訓（苦戦箇所）

### 4.1 苦戦箇所一覧

| 苦戦箇所                                     | 再発条件                                              | 対処                                                                           |
| -------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| MockElectronStore スキーマバリデーション警告 | electron-store モックが型バリデーションを実行する場合 | テスト用の MockElectronStore で console.warn をモック化                        |
| IPC ハンドラ catch ブロックのエラーログ      | エラーパステストで意図的にエラーを発生させる場合      | describe('error handling') ブロック全体で console.error を抑制                 |
| validateIpcSender セキュリティ警告           | 不正な sender でテストする場合                        | セキュリティ警告は抑制対象外とし、テスト出力に残す（セキュリティ可視性のため） |

### 4.2 再利用手順

1. Phase 4 開始前に対象テストの stderr 出力を `pnpm vitest run --reporter=verbose 2>&1 | grep -i "error\|warn"` で確認
2. 抑制対象を「意図的エラーパスの出力のみ」に限定（セキュリティ警告は除外）
3. P20（テスト環境でのログ出力汚染）の対策として、`console.error` の呼び出し回数もアサーションに含める

---

## 5. 参照資料

| 参照資料                            | パス                                                                                                                                      | 内容                                  |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| P20 テスト環境でのログ出力汚染      | `.claude/rules/06-known-pitfalls.md#P20`                                                                                                  | console.log/warn のテスト中出力ガード |
| S33 3層テストアーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md#S33`                                           | G1/G2/G3 分離の設計原則               |
| testing-component-patterns.md S17   | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md#Section17`                                               | IPC ハンドラキャプチャテストパターン  |
| lessons-learned.md v1.29.60         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                                    | TASK-10A-G 苦戦箇所                   |
| TASK-10A-G 成果物                   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-045-task-10a-g-lifecycle-test-hardening/` | 発見元タスクの全成果物                |

---

## 6. 受け入れ基準

### 機能要件

- [ ] `suppressConsole()` / `restoreConsole()` が作成されている
- [ ] エラーパステスト実行時に stderr に意図的なエラーメッセージが出力されない
- [ ] 抑制された出力が `getBufferedOutput()` で取得可能
- [ ] G1 テスト（14テスト）が全て PASS（アサーション変更なし）
- [ ] `using` 構文によるスコープ自動復元が動作する

### 検証方法

```bash
# 抑制前（stderr 出力あり）
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts 2>&1 | grep -c "Error\|Warning"

# 抑制後（stderr 出力なし）
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts 2>&1 | grep -c "Error\|Warning"
# 期待値: 0（テスト結果の PASS/FAIL 以外のエラー出力がゼロ）
```

### 品質要件

- [ ] Line Coverage >= 80%
- [ ] Branch Coverage >= 60%
- [ ] Function Coverage >= 80%
- [ ] 全テスト PASS
- [ ] ESLint エラー / 警告なし
- [ ] TypeScript 型チェックエラーなし

### ドキュメント要件

- [ ] Phase 12 実装ガイド（Part 1: 中学生レベル概念説明 / Part 2: 開発者向け実装詳細）
- [ ] LOGS.md x 2 更新
- [ ] SKILL.md x 2 更新
- [ ] documentation-changelog.md 作成
- [ ] topic-map.md 再生成

---

## 7. 関連タスク

| タスクID                                 | 関係   | 状態   | 説明                                                                |
| ---------------------------------------- | ------ | ------ | ------------------------------------------------------------------- |
| TASK-10A-G                               | 発見元 | 進行中 | G1 テスト実装（Phase 10 レビューで stderr 出力が指摘された発見元）  |
| task-imp-vitest-mock-reset-utility-001   | 関連   | 未実施 | Vitest モックリセットユーティリティ（console モック復元と相互補完） |
| UT-IMP-STORE-INTEGRATION-TEST-HELPER-001 | 関連   | 未実施 | Store 統合テストヘルパー（テスト基盤改善の同系列タスク）            |
