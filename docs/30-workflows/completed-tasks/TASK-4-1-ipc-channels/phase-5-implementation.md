# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容            |
| ---------- | --------------- |
| Phase      | 5               |
| Phase名    | 実装            |
| 前提Phase  | Phase 4         |
| 後続Phase  | Phase 6         |
| ステータス | 未実施          |
| 作成日     | 2026-01-25      |
| 機能名     | IPCチャネル定義 |

---

## 目的

TDD Green Phase: Phase 4で作成したテストをパスする最小限の実装を行う。

## 背景

`apps/desktop/src/preload/channels.ts`に新規チャネルを追加し、
ホワイトリストに登録する。既存のコードパターンに従い、
最小限の変更でテストをパスさせる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 新規チャネル定数の追加

**目的**: IPC_CHANNELSに新規チャネルを追加する

**実行手順**:

1. `apps/desktop/src/preload/channels.ts`を開く
2. `// Skill management operations`セクションを見つける
3. 以下のチャネルを追加する:

```typescript
// Skill management operations (追加分)
SKILL_SCAN: "skill:scan",
SKILL_UPDATE: "skill:update",
SKILL_COMPLETE: "skill:complete",
SKILL_ERROR: "skill:error",
SKILL_PERMISSION_REQUEST: "skill:permission:request",
SKILL_PERMISSION_RESPONSE: "skill:permission:response",
```

**注意事項**:

- 既存の`SKILL_*`チャネルの直後に追加する
- コメントで「追加分」を明記する
- 既存チャネルとの重複を確認する

**期待される成果物**:

- 更新されたchannels.ts

---

### タスク2: ALLOWED_INVOKE_CHANNELSへの登録

**目的**: Renderer→Mainチャネルをホワイトリストに登録する

**実行手順**:

1. `ALLOWED_INVOKE_CHANNELS`配列を見つける
2. `// Skill management channels`セクションを見つける
3. 以下のチャネルを追加する:

```typescript
// Skill management channels (追加分)
IPC_CHANNELS.SKILL_SCAN,
IPC_CHANNELS.SKILL_UPDATE,
IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
```

**期待される成果物**:

- 更新されたALLOWED_INVOKE_CHANNELS

---

### タスク3: ALLOWED_ON_CHANNELSへの登録

**目的**: Main→Rendererチャネルをホワイトリストに登録する

**実行手順**:

1. `ALLOWED_ON_CHANNELS`配列を見つける
2. `// Skill streaming channels`セクションを見つける
3. 以下のチャネルを追加する:

```typescript
// Skill streaming channels (追加分)
IPC_CHANNELS.SKILL_COMPLETE,
IPC_CHANNELS.SKILL_ERROR,
IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
```

**期待される成果物**:

- 更新されたALLOWED_ON_CHANNELS

---

### タスク4: テスト実行と確認

**目的**: 実装がテストをパスすることを確認する

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

# テスト実行
pnpm --filter @repo/desktop test
```

**期待される成果物**:

- 全テストがパス（Green状態）

---

## 参照資料

| 参照資料         | パス                                                        | 内容             |
| ---------------- | ----------------------------------------------------------- | ---------------- |
| 設計書           | `outputs/phase-2/design.md`                                 | 実装方針         |
| テスト           | `apps/desktop/src/preload/__tests__/channels.skill.test.ts` | テストケース     |
| 既存チャネル定義 | `apps/desktop/src/preload/channels.ts`                      | 実装対象ファイル |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                         | 内容                       |
| ------------------- | ---------------------------------------------------------------------------- | -------------------------- |
| IPC通信セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | ホワイトリスト実装パターン |

---

## 成果物

| 成果物                | パス                                   | 内容                         |
| --------------------- | -------------------------------------- | ---------------------------- |
| 更新されたchannels.ts | `apps/desktop/src/preload/channels.ts` | チャネル定義・ホワイトリスト |

---

## 統合テスト連携（Phase 1〜11は必須）

本タスクは定数定義のため、統合テストは不要。
以下の検証を実施:

- TypeScriptコンパイル成功
- Lint成功
- ユニットテスト成功

---

## 完了条件

- [ ] 新規チャネル定数を追加した（6チャネル）
- [ ] ALLOWED_INVOKE_CHANNELSに追加した（3チャネル）
- [ ] ALLOWED_ON_CHANNELSに追加した（3チャネル）
- [ ] TypeScriptコンパイルがパスした
- [ ] Lintがパスした
- [ ] 全テストがパスした（Green状態）

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

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-4-1-ipc-channels/phase-6-test-expansion.md`
