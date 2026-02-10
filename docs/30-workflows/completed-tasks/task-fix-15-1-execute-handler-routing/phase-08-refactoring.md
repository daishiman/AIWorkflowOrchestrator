# Phase 8: リファクタリング（TDD: Refactor）- タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 8                                          |
| Phase名    | リファクタリング（TDD: Refactor）          |
| タスクID   | TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING      |
| タスク名   | SKILL_EXECUTEハンドラーのSkillExecutor委譲 |
| 前提Phase  | Phase 7                                    |
| 後続Phase  | Phase 9                                    |
| ステータス | 未実施                                     |
| 作成日     | 2026-02-09                                 |
| 規模       | 小規模                                     |

---

## 目的

TDD Refactor Phase: テストをパスした状態を維持しながら、コード品質を改善する。
Phase 5で実装したskill:executeハンドラーのSkillExecutor委譲処理について、重複コード排除・命名改善・構造整理を行う。

## 背景

skill:executeハンドラーをSkillExecutorに委譲する変更を行った後、以下の観点でコード品質を確認・改善する:

- SkillService.executeSkillとSkillExecutor.executeの責務分離が明確か
- IPC Sender検証パターンの一貫性
- エラーハンドリングパターンの統一
- 命名の一貫性（変数名、メソッド名）

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 責務分離の確認と改善

**目的**: SkillServiceとSkillExecutorの責務分離を確認・改善する

**実行手順**:

1. SkillService.executeSkillメソッドの役割を確認する
2. SkillExecutor.executeメソッドの役割を確認する
3. 重複処理があれば適切に委譲する

**確認観点**:

- [ ] SkillServiceはスキル管理（CRUD、キャッシュ）に集中しているか
- [ ] SkillExecutorはスキル実行（実行、中断、状態管理）に集中しているか
- [ ] 両者間で重複した処理がないか
- [ ] 循環依存が発生していないか

**期待される成果物**:

- 責務分離チェックリスト

---

### タスク2: IPC Sender検証パターンの統一

**目的**: IPC Sender検証パターンが一貫しているか確認する

**実行手順**:

1. skill:executeハンドラーの検証パターンを確認する
2. 他のskillハンドラー（abort, get-status等）と比較する
3. 不整合があれば統一する

**確認観点**:

- [ ] validateIpcSenderの呼び出しパターンが統一されているか
- [ ] エラー時のthrow/returnパターンが統一されているか
- [ ] getAllowedWindowsの取得方法が統一されているか

**コードパターン確認**:

```typescript
// 統一すべきパターン
const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_EXECUTE, {
  getAllowedWindows: () => [mainWindow],
});
if (!validation.valid) {
  throw toIPCValidationError(validation);
}
```

**期待される成果物**:

- IPC検証パターンチェックリスト

---

### タスク3: エラーハンドリングパターンの統一

**目的**: エラーハンドリングがSkillExecutionErrorCode準拠で統一されているか確認する

**実行手順**:

1. skill:executeハンドラーのエラーハンドリングを確認する
2. SkillExecutionErrorCodeの使用状況を確認する
3. エラーメッセージのサニタイズが適切か確認する

**確認観点**:

- [ ] try-catchブロックが適切に配置されているか
- [ ] エラーコードがSkillExecutionErrorCodeに準拠しているか
- [ ] 内部エラー詳細がRendererに漏洩していないか
- [ ] ログ出力が適切か（機密情報を含まない）

**エラーハンドリングパターン**:

```typescript
// 統一すべきパターン
try {
  const result = await executor.execute(skillId, params);
  return { success: true, data: result };
} catch (error) {
  log.error("[skillHandlers] skill:execute failed:", {
    skillId,
    // paramsは機密情報の可能性があるためログしない
  });
  return {
    success: false,
    error: error instanceof Error ? error.message : "スキル実行に失敗しました",
  };
}
```

**期待される成果物**:

- エラーハンドリングチェックリスト

---

### タスク4: 命名の一貫性確認

**目的**: 変数名・メソッド名が一貫しているか確認する

**実行手順**:

1. skillHandlers.ts内の変数名を確認する
2. 既存の命名パターンと比較する
3. 不整合があれば修正する

**確認観点**:

- [ ] `_skillExecutorInstance`の命名がモジュールスコープ変数として適切か
- [ ] 引数名（skillId, params, executionId）が統一されているか
- [ ] ログメッセージの接頭辞が`[skillHandlers]`で統一されているか

**期待される成果物**:

- 命名規則チェックリスト

---

### タスク5: テストの再実行と確認

**目的**: リファクタリング後もテストがパスすることを確認する

**実行手順**:

1. TypeScriptコンパイルを実行する
2. Lintを実行する
3. テストを実行する

**検証コマンド**:

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint

# テスト実行（関連テスト）
pnpm --filter @repo/desktop test -- --testPathPattern="skillHandlers|SkillExecutor|SkillService"
```

**確認項目**:

- [ ] TypeScriptエラー: 0
- [ ] ESLintエラー: 0
- [ ] 全テストがパス

**期待される成果物**:

- テスト実行結果（全パス）

---

## 参照資料

| 参照資料           | パス                                                    | 内容                 |
| ------------------ | ------------------------------------------------------- | -------------------- |
| skillHandlers.ts   | `apps/desktop/src/main/ipc/skillHandlers.ts`            | リファクタリング対象 |
| SkillService.ts    | `apps/desktop/src/main/services/skill/SkillService.ts`  | リファクタリング対象 |
| SkillExecutor.ts   | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | リファクタリング対象 |
| セキュリティルール | `.claude/rules/04-electron-security.md`                 | IPCセキュリティ原則  |
| エラーハンドリング | `.claude/rules/02-code-quality.md`                      | エラーカテゴリ定義   |

---

## 多角的チェック観点（AIが判断）

本タスク（SKILL_EXECUTEハンドラーのSkillExecutor委譲）では以下の観点を適用：

| 観点                 | 確認内容                                    | 仕様参照先                                                  |
| -------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| セキュリティ         | IPC送信元検証、エラーメッセージのサニタイズ | `aiworkflow-requirements: security-skill-ipc.md`            |
| API設計              | チャンネル定義、入出力型の統一性            | `aiworkflow-requirements: interfaces-agent-sdk-executor.md` |
| エラーハンドリング   | SkillExecutionErrorCode準拠                 | `aiworkflow-requirements: error-handling.md`                |
| Electronセキュリティ | Main Process実装、validateIpcSender使用     | `aiworkflow-requirements: security-api-electron.md`         |

**Electronデスクトップアプリ観点**:

| 層                   | 確認内容                        | 仕様参照先                    |
| -------------------- | ------------------------------- | ----------------------------- |
| バックエンド（Main） | 責務分離確認、コード品質改善    | `architecture-*.md`           |
| IPC通信              | IPC検証パターン統一、命名一貫性 | `interfaces-*.md`, `api-*.md` |

---

## 成果物

| 成果物                   | パス                                    | 内容               |
| ------------------------ | --------------------------------------- | ------------------ |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md` | 確認項目と改善結果 |

---

## 統合テスト連携（Phase 1〜11は必須）

リファクタリング後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test

# IPC関連の統合テスト
pnpm --filter @repo/desktop test -- --testPathPattern="ipc|integration"
```

---

## 完了条件

- [ ] 責務分離の確認・改善を行った
- [ ] IPC Sender検証パターンを統一した
- [ ] エラーハンドリングパターンを統一した
- [ ] 命名の一貫性を確認した
- [ ] リファクタリング後も全テストがパスした
- [ ] リファクタリングレポートを作成した

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認（Green状態維持）

---

## 依存関係

- **前提**: Phase 7（テストカバレッジ確認）が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/task-fix-15-1-execute-handler-routing/phase-9-quality-assurance.md`
