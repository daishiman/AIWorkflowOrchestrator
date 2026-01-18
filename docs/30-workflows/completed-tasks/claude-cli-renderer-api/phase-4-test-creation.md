# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 4                       |
| Phase名    | テスト作成（TDD: Red）  |
| 前提Phase  | Phase 3                 |
| 後続Phase  | Phase 5                 |
| ステータス | 未実施                  |
| 作成日     | 2026-01-17              |
| 機能名     | claude-cli-renderer-api |

---

## 目的

Claude CLI Renderer APIの各機能に対するテストを作成する。TDDのRed状態として、実装を検証するテストを先に作成する。

## 背景

既存実装が存在するが、テストカバレッジが不十分な可能性がある。本Phaseでは、要件を満たすためのテストを作成し、実装の品質を検証できる状態にする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テスト環境の確認

**目的**: Preload APIテストの実行環境を確認する

**実行手順**:

1. `apps/desktop/src/preload/__tests__/`ディレクトリの存在を確認する
2. 既存のテストファイル（`index.test.ts`, `channels.test.ts`）を確認する
3. Vitestの設定（`vitest.config.ts`）を確認する
4. テスト実行コマンドを確認する: `pnpm --filter @repo/desktop test`

**期待される成果物**:

- テスト環境確認結果

---

### タスク2: claudeCliAPIユニットテストの作成

**目的**: claudeCliAPI各メソッドのユニットテストを作成する

**実行手順**:

1. `apps/desktop/src/preload/__tests__/claudeCliApi.test.ts`を作成する
2. 以下のテストケースを実装する:
   - `checkInstallation()`のテスト
   - `listSkills(request?)`のテスト
   - `getSkillDetail(request)`のテスト
   - `executeScript(request)`のテスト
   - `terminateSession(request)`のテスト
   - `listSessions()`のテスト
   - `getSession(request)`のテスト
3. 各テストで`ipcRenderer.invoke`のモックを使用する

**期待される成果物**:

- `apps/desktop/src/preload/__tests__/claudeCliApi.test.ts`

---

### タスク3: ストリーミングイベントテストの作成

**目的**: ストリーミングイベント購読のテストを作成する

**実行手順**:

1. `onSessionOutput(callback)`のテストを追加する:
   - コールバック登録のテスト
   - イベント受信のテスト
   - クリーンアップ関数のテスト
2. `onSessionStatus(callback)`のテストを追加する:
   - コールバック登録のテスト
   - イベント受信のテスト
   - クリーンアップ関数のテスト
3. `ipcRenderer.on`と`ipcRenderer.removeListener`のモックを使用する

**期待される成果物**:

- ストリーミングイベントテスト（`claudeCliApi.test.ts`に追加）

---

### タスク4: エラーハンドリングテストの作成

**目的**: エラーケースのテストを作成する

**実行手順**:

1. 以下のエラーケースをテストする:
   - 許可されていないチャンネルへのアクセス
   - IPC呼び出し失敗時の挙動
   - 不正な引数の検証
2. `safeInvoke`と`safeOn`のセキュリティ検証テストを作成する

**期待される成果物**:

- エラーハンドリングテスト（`claudeCliApi.test.ts`に追加）

---

### タスク5: チャンネル登録テストの作成

**目的**: IPCチャンネルがホワイトリストに登録されていることを検証するテストを作成する

**実行手順**:

1. `apps/desktop/src/preload/__tests__/channels.test.ts`に以下のテストを追加する:
   - Claude CLI関連の全チャンネルが`ALLOWED_INVOKE_CHANNELS`に含まれていることを検証
   - ストリーミングチャンネルが`ALLOWED_ON_CHANNELS`に含まれていることを検証

**期待される成果物**:

- チャンネル登録テスト（`channels.test.ts`に追加）

---

## 参照資料

| 参照資料      | パス                                  | 内容               |
| ------------- | ------------------------------------- | ------------------ |
| Phase 2設計書 | `outputs/phase-2/`                    | API・IPC設計       |
| 既存テスト    | `apps/desktop/src/preload/__tests__/` | 既存テストパターン |
| Vitest設定    | `apps/desktop/vitest.config.ts`       | テスト設定         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                                        | 内容                 |
| -------- | --------------------------------------------------------------------------- | -------------------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テストカバレッジ基準 |

---

## 成果物

| 成果物               | パス                                                      | 内容                 |
| -------------------- | --------------------------------------------------------- | -------------------- |
| claudeCliApiテスト   | `apps/desktop/src/preload/__tests__/claudeCliApi.test.ts` | APIユニットテスト    |
| チャンネルテスト追加 | `apps/desktop/src/preload/__tests__/channels.test.ts`     | チャンネル検証テスト |

---

## 統合テスト連携（Phase 1〜11は必須）

Preload APIの各メソッドに対するテストシナリオを作成する。具体的には:

- Main Process（ClaudeCliManager）との連携シナリオ
- ストリーミングイベントの送受信シナリオ
- エラーハンドリングシナリオ

---

## 完了条件

- [ ] テスト環境を確認した
- [ ] `claudeCliApi.test.ts`を作成した
- [ ] 全APIメソッドのユニットテストを実装した
- [ ] ストリーミングイベントのテストを実装した
- [ ] エラーハンドリングテストを実装した
- [ ] チャンネル登録テストを追加した
- [ ] テストが実行可能であることを確認した

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

- [ ] テストが実行可能であることを確認（コンパイルエラーなし）
- [ ] 既存実装に対してテストが成功/失敗することを確認

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/claude-cli-renderer-api/phase-5-implementation.md`
