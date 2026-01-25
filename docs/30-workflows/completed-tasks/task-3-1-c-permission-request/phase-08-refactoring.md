# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 8                           |
| Phase名    | リファクタリング            |
| 前提Phase  | Phase 7                     |
| 後続Phase  | Phase 9                     |
| ステータス | 未実施                      |
| 作成日     | 2026-01-25                  |
| 機能名     | PermissionRequest Hook 統合 |

---

## 目的

TDD Refactor フェーズとして、コードの品質を改善しながらテストが通る状態を維持する。

## 背景

実装とテストが完了し、カバレッジ目標を達成した。
本 Phase では、コードの可読性、保守性、パフォーマンスを改善する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コードレビューと改善点の特定

**目的**: 実装コードをレビューし、改善点を特定する

**実行手順**:

1. SkillExecutor.ts の実装をレビューする
2. コードの臭いを特定する
3. 改善点をリスト化する

**レビュー観点**:

| 観点               | 確認項目                         | 状態 |
| ------------------ | -------------------------------- | ---- |
| 命名               | 変数・関数名が意図を表しているか | [ ]  |
| 単一責任           | 各メソッドが単一の責任を持つか   | [ ]  |
| DRY                | 重複コードがないか               | [ ]  |
| エラーハンドリング | エラーが適切に処理されているか   | [ ]  |
| 型安全性           | 型が適切に定義されているか       | [ ]  |
| コメント           | 必要な箇所にコメントがあるか     | [ ]  |

**期待される成果物**:

- 改善点リスト

---

### タスク2: メソッド分割・抽出

**目的**: 大きなメソッドを小さく分割し、可読性を向上させる

**実行手順**:

1. 長いメソッドを特定する
2. 論理的な単位でメソッドを分割する
3. テストが通ることを確認する

**改善例**:

```typescript
// Before: PermissionRequest Hook 内で全て処理
PermissionRequest: async (input, toolUseId, context) => {
  const requestId = uuidv4();
  // ステータス通知
  this.sendStream({ ... });
  // IPC送信
  this.mainWindow.webContents.send(SKILL_CHANNELS.SKILL_PERMISSION_REQUEST, { ... });
  // 応答待機と処理
  try {
    const response = await this.permissionResolver.waitForResponse(...);
    if (response.approved) {
      this.sendStream({ ... });
      return { proceed: true };
    } else {
      this.sendStream({ ... });
      return { proceed: false, message: ... };
    }
  } catch (error) {
    return { proceed: false, message: ... };
  }
}

// After: ヘルパーメソッドに分割
PermissionRequest: async (input, toolUseId, context) => {
  const requestId = uuidv4();
  this.notifyPermissionRequired(executionId, input.toolName);
  this.sendPermissionRequest(executionId, requestId, input);
  return this.waitForPermissionResponse(executionId, requestId, input.toolName, context.signal);
}

private notifyPermissionRequired(executionId: string, toolName: string): void {
  this.sendStream({
    executionId,
    type: "status",
    content: {
      status: "tool_executing",
      detail: `${toolName} の実行に権限が必要です`,
    },
    timestamp: Date.now(),
  });
}

private sendPermissionRequest(
  executionId: string,
  requestId: string,
  input: { toolName: string; args: Record<string, unknown> }
): void {
  this.mainWindow.webContents.send(SKILL_CHANNELS.SKILL_PERMISSION_REQUEST, {
    executionId,
    requestId,
    toolName: input.toolName,
    args: this.sanitizeArgs(input.args),
    reason: this.getPermissionReason(input.toolName, input.args),
  });
}

private async waitForPermissionResponse(
  executionId: string,
  requestId: string,
  toolName: string,
  signal: AbortSignal
): Promise<{ proceed: true } | { proceed: false; message: string }> {
  try {
    const response = await this.permissionResolver.waitForResponse(
      requestId,
      signal,
      30000
    );
    return this.handlePermissionResult(executionId, toolName, response);
  } catch (error) {
    return { proceed: false, message: "権限確認がタイムアウトしました" };
  }
}

private handlePermissionResult(
  executionId: string,
  toolName: string,
  response: PermissionResponse
): { proceed: true } | { proceed: false; message: string } {
  if (response.approved) {
    this.sendStream({
      executionId,
      type: "status",
      content: {
        status: "tool_executing",
        detail: `${toolName} の実行が許可されました`,
      },
      timestamp: Date.now(),
    });
    return { proceed: true };
  } else {
    this.sendStream({
      executionId,
      type: "status",
      content: {
        status: "tool_completed",
        detail: `${toolName} の実行が拒否されました`,
      },
      timestamp: Date.now(),
    });
    return {
      proceed: false,
      message: response.rejectReason || "ユーザーにより拒否されました",
    };
  }
}
```

**期待される成果物**:

- リファクタリング後のコード

---

### タスク3: 型定義の改善

**目的**: 型定義を整理し、型安全性を向上させる

**実行手順**:

1. 既存の型定義をレビューする
2. 不足している型を追加する
3. 型の再利用性を向上させる

**改善例**:

```typescript
// Before: インラインで型定義
private createHooks(executionId: string) {
  return {
    PermissionRequest: async (
      input: { toolName: string; args: Record<string, unknown> },
      toolUseId: string,
      context: { signal: AbortSignal }
    ) => { ... }
  };
}

// After: 型を分離して定義
interface PermissionRequestInput {
  toolName: string;
  args: Record<string, unknown>;
}

interface HookContext {
  signal: AbortSignal;
}

type PermissionRequestResult =
  | { proceed: true }
  | { proceed: false; message: string };

private createHooks(executionId: string): SkillHooks {
  return {
    PermissionRequest: async (
      input: PermissionRequestInput,
      toolUseId: string,
      context: HookContext
    ): Promise<PermissionRequestResult> => { ... }
  };
}
```

**期待される成果物**:

- 改善された型定義

---

### タスク4: テスト再実行と確認

**目的**: リファクタリング後もテストが通ることを確認する

**実行手順**:

1. 全テストを実行する
2. 全テストが通過することを確認する
3. カバレッジが維持されていることを確認する

**実行コマンド**:

```bash
pnpm --filter @repo/desktop test -- --coverage --run src/main/services/skill/
```

**期待される結果**:

- 全テスト PASS
- カバレッジが Phase 7 と同等以上

---

### タスク5: ドキュメントコメントの追加

**目的**: コードの理解を助けるドキュメントコメントを追加する

**実行手順**:

1. パブリックメソッドにJSDocコメントを追加する
2. 複雑なロジックに説明コメントを追加する

**例**:

```typescript
/**
 * ユーザーからの権限応答を処理する
 *
 * @param requestId - 権限リクエストのID
 * @param approved - ユーザーが承認したかどうか
 * @param rememberChoice - 選択を記憶するかどうか（オプション）
 * @param rejectReason - 拒否理由（オプション）
 */
handlePermissionResponse(
  requestId: string,
  approved: boolean,
  rememberChoice?: boolean,
  rejectReason?: string
): void {
  this.permissionResolver.resolve(requestId, {
    requestId,
    approved,
    rememberChoice,
    rejectReason,
  });
}
```

**期待される成果物**:

- ドキュメントコメント付きのコード

---

## 参照資料

| 参照資料                      | パス                                                    | 内容           |
| ----------------------------- | ------------------------------------------------------- | -------------- |
| Phase 5 実装                  | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | 実装コード     |
| Phase 7 カバレッジ            | `outputs/phase-07/`                                     | カバレッジ結果 |
| TypeScript ベストプラクティス | 公式ドキュメント                                        | 型定義ガイド   |

---

## 成果物

| 成果物                   | パス                                                    | 内容                     |
| ------------------------ | ------------------------------------------------------- | ------------------------ |
| リファクタリング後コード | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | 改善されたコード         |
| 改善点リスト             | `outputs/phase-08/improvements.md`                      | 実施した改善の記録       |
| テスト結果               | `outputs/phase-08/test-results.md`                      | リファクタリング後の結果 |

---

## 統合テスト連携（Phase 1〜11は必須）

**確認項目**:

- [ ] リファクタリング後も統合テストが通過する
- [ ] コンポーネント間の連携が維持されている

---

## 完了条件

- [ ] コードレビューが完了している
- [ ] メソッド分割・抽出が適用されている
- [ ] 型定義が改善されている
- [ ] 全テストが通過している
- [ ] カバレッジが維持されている
- [ ] ドキュメントコメントが追加されている
- [ ] 成果物が全て生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
pnpm --filter @repo/desktop test -- --run src/main/services/skill/
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 依存関係

- **前提**: Phase 7（テストカバレッジ確認）が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/task-3-1-c-permission-request/phase-09-quality-assurance.md`
