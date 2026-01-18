# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 5                       |
| Phase名    | 実装（TDD: Green）      |
| 前提Phase  | Phase 4                 |
| 後続Phase  | Phase 6                 |
| ステータス | 未実施                  |
| 作成日     | 2026-01-17              |
| 機能名     | claude-cli-renderer-api |

---

## 目的

Phase 4で作成したテストを通過させるため、既存実装の確認と必要に応じた修正を行う。TDDのGreen状態を達成する。

## 背景

既存実装が存在するため、本Phaseでは新規実装ではなく、既存実装の動作確認と、テストで発見された問題の修正に注力する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 既存実装の動作確認

**目的**: 既存の`claudeCliAPI`実装がPhase 4のテストを通過するか確認する

**実行手順**:

1. テストを実行する: `pnpm --filter @repo/desktop test`
2. テスト結果を分析する:
   - 全テストがパスした場合 → タスク2はスキップ
   - 一部テストが失敗した場合 → タスク2で修正

**期待される成果物**:

- テスト実行結果

---

### タスク2: 必要に応じた実装修正

**目的**: テストで発見された問題を修正する

**実行手順**:

1. 失敗したテストの原因を分析する
2. `apps/desktop/src/preload/index.ts`の`claudeCliAPI`実装を必要に応じて修正する
3. 型定義（`types.ts`）に問題があれば修正する
4. チャンネル定義（`channels.ts`）に問題があれば修正する
5. 修正後、テストを再実行して全パスを確認する

**期待される成果物**:

- 修正済みの実装ファイル（必要な場合）

---

### タスク3: 型定義の整合性確認

**目的**: Preload API型定義と共有型定義の整合性を確認する

**実行手順**:

1. `apps/desktop/src/preload/types.ts`の`ClaudeCliAPI`関連型を確認する
2. `packages/shared/src/claude-cli/types.ts`との整合性を確認する
3. 不整合があれば修正する
4. 型チェックを実行する: `pnpm --filter @repo/desktop typecheck`

**期待される成果物**:

- 型チェック通過の確認

---

### タスク4: contextBridge公開の確認

**目的**: `claudeCliAPI`が正しく公開されていることを確認する

**実行手順**:

1. `apps/desktop/src/preload/index.ts`で以下を確認する:
   ```typescript
   contextBridge.exposeInMainWorld("claudeCliAPI", claudeCliAPI);
   ```
2. fallback処理（非isolated context）も確認する:
   ```typescript
   (window as unknown as { claudeCliAPI: ClaudeCliAPI }).claudeCliAPI =
     claudeCliAPI;
   ```
3. 確認結果を記録する

**期待される成果物**:

- contextBridge公開確認結果

---

### タスク5: IPC連携の動作確認

**目的**: Main ProcessのIPCハンドラーとの連携を確認する

**実行手順**:

1. `apps/desktop/src/main/claude-cli/ipc-handler.ts`が存在し、正しく登録されていることを確認する
2. 各チャンネルのハンドラーが対応していることを確認する:
   - `claude-cli:check-installation`
   - `claude-cli:list-skills`
   - `claude-cli:get-skill-detail`
   - `claude-cli:execute-script`
   - `claude-cli:terminate-session`
   - `claude-cli:list-sessions`
   - `claude-cli:get-session`
3. ストリーミングイベント送信元を確認する:
   - `claude-cli:session-output`
   - `claude-cli:session-status`

**期待される成果物**:

- IPC連携確認結果

---

## 参照資料

| 参照資料      | パス                                              | 内容             |
| ------------- | ------------------------------------------------- | ---------------- |
| Phase 4テスト | `apps/desktop/src/preload/__tests__/`             | テストファイル   |
| 既存実装      | `apps/desktop/src/preload/index.ts`               | claudeCliAPI実装 |
| IPC Handler   | `apps/desktop/src/main/claude-cli/ipc-handler.ts` | Main Process側   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                         | 内容                             |
| ----------------------- | ---------------------------------------------------------------------------- | -------------------------------- |
| アーキテクチャパターン  | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Claude CLI連携パターン           |
| IPC Handler登録パターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | IPC Handler Registration Pattern |

---

## 成果物

| 成果物             | パス                                | 内容            |
| ------------------ | ----------------------------------- | --------------- |
| テスト通過確認     | テスト実行ログ                      | Green状態の確認 |
| 実装修正（必要時） | `apps/desktop/src/preload/index.ts` | 修正内容        |

---

## 統合テスト連携（Phase 1〜11は必須）

既存実装の動作確認・必要に応じた修正を行う。具体的には:

- Preload API → Main Process（ClaudeCliManager）の連携確認
- ストリーミングイベント（Main → Renderer）の送受信確認
- エラーハンドリングの動作確認

---

## 完了条件

- [ ] 全テストがパスすることを確認した（Green状態）
- [ ] 型チェックがパスすることを確認した
- [ ] contextBridge公開が正しく行われていることを確認した
- [ ] IPC連携が正しく設定されていることを確認した
- [ ] 必要な修正があれば完了した

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

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/claude-cli-renderer-api/phase-6-test-expansion.md`
