# Phase 9: 品質検証

## メタ情報

| 項目   | 値                      |
| ------ | ----------------------- |
| Phase  | 9                       |
| 機能名 | claude-code-integration |
| 作成日 | 2026-01-12              |

## 目的

実装の品質を多角的に検証し、本番投入可能な状態であることを確認する。

## 実行タスク

- 静的解析: ESLint・TypeScriptエラーチェック
- セキュリティ検証: 脆弱性スキャン・セキュリティ要件確認
- パフォーマンス検証: 応答時間・リソース使用量確認

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                             | 内容               |
| ------------------ | -------------------------------------------------------------------------------- | ------------------ |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`      | 品質基準           |
| セキュリティ実装   | `.claude/skills/aiworkflow-requirements/references/security-implementation.md`   | セキュリティ要件   |
| 入力バリデーション | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md` | バリデーション要件 |

### Phase 8成果物

| 資料名               | パス                                     | 説明          |
| -------------------- | ---------------------------------------- | ------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-summary.md` | Phase 8成果物 |

## 品質検証項目

### 1. 静的解析

| 検証項目         | コマンド/ツール                           | 基準 | 結果 |
| ---------------- | ----------------------------------------- | ---- | ---- |
| ESLintエラー     | `pnpm lint`                               | 0件  | [ ]  |
| TypeScriptエラー | `pnpm typecheck`                          | 0件  | [ ]  |
| 未使用コード     | ESLint no-unused-vars                     | 0件  | [ ]  |
| any型使用        | ESLint @typescript-eslint/no-explicit-any | 0件  | [ ]  |

### 2. セキュリティ検証

| 検証項目                 | 確認内容                                 | 結果 |
| ------------------------ | ---------------------------------------- | ---- |
| 危険コマンド検出         | rm -rf, sudo, chmod 777, dd if= 検出     | [ ]  |
| パストラバーサル防止     | ../ パターン検出                         | [ ]  |
| IPC入力バリデーション    | Zodスキーマによる検証                    | [ ]  |
| contextBridge使用        | ipcRenderer直接公開なし                  | [ ]  |
| システムディレクトリ保護 | /etc/**, /usr/**, /var/\*\* 書き込み禁止 | [ ]  |

### 3. パフォーマンス検証

| 検証項目               | 基準    | 結果 |
| ---------------------- | ------- | ---- |
| SDK起動時間            | < 3秒   | [ ]  |
| ストリーミング遅延     | < 100ms | [ ]  |
| メモリ使用量（実行中） | < 500MB | [ ]  |
| メモリリーク           | なし    | [ ]  |

## 実行手順

### 1. 静的解析実行

```bash
# ESLint
pnpm --filter @repo/desktop lint

# TypeScript
pnpm --filter @repo/desktop typecheck

# 全パッケージ
pnpm lint && pnpm typecheck
```

### 2. セキュリティ検証

```bash
# 依存関係の脆弱性チェック
pnpm audit

# セキュリティテスト実行
pnpm --filter @repo/desktop test -- --grep "security"
```

### 3. パフォーマンス検証

```bash
# パフォーマンステスト（存在する場合）
pnpm --filter @repo/desktop test:perf
```

### 4. セキュリティチェックリスト確認

```typescript
// HooksFactoryのセキュリティチェック
describe("Security Verification", () => {
  it("should block rm -rf command", async () => {
    const result = await hooks.preToolUse({
      tool: "Bash",
      args: { command: "rm -rf /" },
    });
    expect(result.allow).toBe(false);
  });

  it("should block sudo command", async () => {
    const result = await hooks.preToolUse({
      tool: "Bash",
      args: { command: "sudo apt-get install" },
    });
    expect(result.allow).toBe(false);
  });

  it("should block path traversal", async () => {
    const result = await hooks.preToolUse({
      tool: "Read",
      args: { path: "../../../etc/passwd" },
    });
    expect(result.allow).toBe(false);
  });
});
```

## 統合テスト連携【必須】

統合テスト観点の品質検証:

| 検証項目     | 確認内容                                   | 結果 |
| ------------ | ------------------------------------------ | ---- |
| IPC通信品質  | エラーなく正常に通信できるか               | [ ]  |
| データ整合性 | ストリーミングデータが欠落なく転送されるか | [ ]  |
| エラー復旧   | エラー発生後も正常に再実行できるか         | [ ]  |
| リソース解放 | 実行完了後にリソースが適切に解放されるか   | [ ]  |

## 成果物

| 成果物             | パス                                             | 説明             |
| ------------------ | ------------------------------------------------ | ---------------- |
| 品質検証レポート   | `outputs/phase-9/quality-verification-report.md` | 検証結果         |
| セキュリティ確認書 | `outputs/phase-9/security-checklist.md`          | セキュリティ確認 |

## 完了条件

- [ ] ESLintエラーが0件である
- [ ] TypeScriptエラーが0件である
- [ ] セキュリティ検証が全項目合格している
- [ ] パフォーマンス基準を満たしている
- [ ] 品質検証レポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 品質ゲート

| 判定  | 条件                    | 対応                     |
| ----- | ----------------------- | ------------------------ |
| PASS  | 全項目合格              | Phase 10へ進行           |
| MINOR | 軽微な問題あり（1-2件） | 修正後Phase 10へ進行     |
| MAJOR | 重大な問題あり          | 問題に応じて戻り先を決定 |

## 次のPhase

Phase 10: 最終レビュー
