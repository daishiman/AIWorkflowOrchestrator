# Phase 5: 実装（TDD: Green）- Agent SDK 依存関係修正

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 5                        |
| Phase名    | 実装（TDD: Green）       |
| 前提Phase  | Phase 4（テスト作成）    |
| 後続Phase  | Phase 6（テスト拡充）    |
| ステータス | 未実施                   |
| 作成日     | 2026-01-13               |
| 機能名     | agent-sdk-dependency-fix |

---

## 目的

テストを通すための最小限の実装を行う。

## 背景

Phase 4 で作成したテストを通すために、SDK パッケージ解決問題を修正する。

---

## 実行タスク

### タスク1: electron-vite 設定修正

**目的**: Electron ビルド設定を修正して SDK を正しくバンドル/外部化する

**実行手順**:

1. `apps/desktop/electron.vite.config.ts` を編集
2. `build.rollupOptions.external` に適切な設定を追加
3. 必要に応じて `resolve.alias` を設定

**修正対象ファイル**:

- `apps/desktop/electron.vite.config.ts`

**期待される成果物**:

- electron-vite 設定修正

---

### タスク2: パッケージ依存関係修正

**目的**: pnpm/Node.js のモジュール解決を修正する

**実行手順**:

1. `apps/desktop/package.json` の依存関係を確認・修正
2. 必要に応じて `.npmrc` を修正
3. `pnpm install` で依存関係を再インストール

**修正対象ファイル**:

- `apps/desktop/package.json`
- `.npmrc`（必要に応じて）

**期待される成果物**:

- パッケージ依存関係修正

---

### タスク3: SDK 初期化コード修正

**目的**: SDK 初期化コードにエラーハンドリングを追加する

**実行手順**:

1. `AgentExecutor.ts` の SDK import 部分を確認
2. 動的インポートまたは try-catch によるエラーハンドリングを追加
3. SDK 未ロード時のフォールバック処理を実装

**修正対象ファイル**:

- `apps/desktop/src/main/services/agent/AgentExecutor.ts`
- `apps/desktop/src/main/services/agent/index.ts`

**期待される成果物**:

- SDK 初期化コード修正

---

### タスク4: ビルド検証

**目的**: 修正後のビルドが成功することを確認する

**実行手順**:

1. `pnpm --filter @repo/desktop build` でビルド実行
2. `apps/desktop/out/main/index.js` が生成されることを確認
3. SDK 依存関係が正しく処理されていることを確認

**検証コマンド**:

```bash
pnpm --filter @repo/desktop build
pnpm --filter @repo/desktop dev
```

**期待される成果物**:

- ビルド成功確認

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                         | 内容             |
| ------------------------- | ---------------------------------------------------------------------------- | ---------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | 実装仕様         |
| Electronセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | セキュリティ考慮 |

### Phase 4 成果物

| 参照資料     | パス                                    | 説明          |
| ------------ | --------------------------------------- | ------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | Phase 4成果物 |

---

## 成果物

| 成果物       | パス                                    | 説明           |
| ------------ | --------------------------------------- | -------------- |
| 実装コード   | `apps/desktop/src/main/services/agent/` | SDK解決修正    |
| 設定ファイル | `apps/desktop/electron.vite.config.ts`  | ビルド設定修正 |

---

## 統合テスト連携【必須】

フロント/バック接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                           |
| ------------------ | ---------------------------------------------- |
| SDK接続            | `query()` API が正常に呼び出せる               |
| IPC通信            | `agent:message` チャンネルでストリーミング受信 |
| エラーハンドリング | `AgentInitializationError` が適切に伝播        |

---

## 完了条件

- [ ] electron-vite 設定が修正されている
- [ ] パッケージ依存関係が修正されている
- [ ] SDK 初期化コードにエラーハンドリングが追加されている
- [ ] ビルドが成功する
- [ ] すべてのテストが成功状態（Green）
- [ ] フロント/バック接続が実装されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Phase 4 成果物の確認
2. electron-vite 設定修正
3. パッケージ依存関係修正
4. SDK 初期化コード修正
5. ビルド検証
6. TDD Green 状態の検証

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/agent-sdk-dependency-fix/phase-6-test-expansion.md`
