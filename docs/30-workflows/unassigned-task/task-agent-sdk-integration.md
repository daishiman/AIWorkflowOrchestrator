# Claude Agent SDK統合基盤の構築 - タスク指示書

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| タスクID     | task-feat-agent-sdk-integration-001 |
| タスク名     | Claude Agent SDK統合基盤の構築      |
| 分類         | 要件（新機能）                      |
| 対象機能     | スライド作成システム                |
| 優先度       | 高                                  |
| 見積もり規模 | 中規模                              |
| ステータス   | 未実施                              |
| 発見元       | 新規要件（ユーザー要求）            |
| 発見日       | 2026-01-07                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

AIWorkflowOrchestratorアプリでは、presentation-slide-generatorスキルを活用したスライド作成機能を提供したい。このスキルはClaude Code環境で動作するが、Electronデスクトップアプリから直接呼び出す仕組みが必要である。

Anthropicが提供する**Claude Agent SDK**（`@anthropic-ai/claude-agent-sdk`）を使用することで、スキルの呼び出しやセッション管理、ツール制御が可能になる。

### 1.2 問題点・課題

- 現状、Electronアプリからスキルを直接呼び出す機能がない
- スキル実行時のセッション管理・パーミッション制御が未実装
- Electron IPC通信を介したAgent API呼び出しパターンが未確立

### 1.3 放置した場合の影響

- スライド作成機能が実装できない
- ユーザーはClaude Code CLIを直接操作する必要があり、UXが著しく低下
- 後続タスク（ディレクトリ設定、依存関係管理）がすべてブロックされる

---

## 2. 何を達成するか（What）

### 2.1 目的

ElectronアプリからClaude Agent SDKを介してスキルを呼び出せる基盤を構築する。

### 2.2 最終ゴール

1. `@anthropic-ai/claude-agent-sdk`がインストールされている
2. Electronメインプロセスでエージェントを初期化できる
3. IPC通信でRendererプロセスからエージェントAPIを呼び出せる
4. `presentation-slide-generator`スキルの基本呼び出しが動作する

### 2.3 スコープ

#### 含むもの

- Claude Agent SDKのインストール・設定
- Electronメインプロセスでのエージェント初期化
- IPC通信パターンの実装（invoke/handle）
- 基本的なスキル呼び出し機能（query API）
- セッション管理の基礎実装
- 環境変数（ANTHROPIC_API_KEY）の設定方法

#### 含まないもの

- スライド出力ディレクトリの設定UI（別タスク）
- structure.md ⇔ index.html の依存関係管理（別タスク）
- スキルの4フェーズ（hearing, structure-designer, html-generator, slide-modifier）の詳細統合

### 2.4 成果物

| 成果物                         | 説明                                 |
| ------------------------------ | ------------------------------------ |
| `packages/shared/src/agent/`   | Agent SDK統合モジュール              |
| `apps/desktop/src/main/agent/` | Electronメインプロセス用エージェント |
| `apps/desktop/src/preload/`    | IPC通信用プリロードスクリプト        |
| ユニットテスト                 | Agent SDK統合のテストコード          |
| 統合テスト                     | Electron IPC通信のテストコード       |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- pnpm monorepo環境がセットアップ済み
- Electronアプリの基本構造が存在する
- ANTHROPIC_API_KEY環境変数が設定可能

### 3.2 依存タスク

- なし（本タスクが起点）

### 3.3 必要な知識・スキル

- Claude Agent SDK（TypeScript版）
- Electron IPC通信（contextBridge, ipcMain, ipcRenderer）
- TypeScript/async generator
- セッション管理パターン

### 3.4 推奨アプローチ

1. **SDK理解フェーズ**: 公式ドキュメント・デモリポジトリを参照
2. **基盤実装フェーズ**: shared packageにAgent SDK統合モジュールを作成
3. **Electron統合フェーズ**: メインプロセス・プリロードスクリプトでIPC通信を実装
4. **検証フェーズ**: スキル呼び出しの動作確認

---

## 4. 実行手順

### Phase構成

本タスクはtask-specification-creatorのPhase 1〜13フレームワークに従って実行する。
**Phase 0**として情報収集・スキル作成フェーズを追加する。

### Phase 0: 情報収集 & Claude Agent SDKスキル作成

#### 使用スキル

| スキル名          | パス                                    | 選定理由                                                 |
| ----------------- | --------------------------------------- | -------------------------------------------------------- |
| claude-code-guide | Task agent（claude-code-guide）         | Claude Agent SDK公式ドキュメント調査（Trigger: SDK調査） |
| skill-creator     | `.claude/skills/skill-creator/SKILL.md` | 新規スキル作成（Trigger: スキル作成）                    |

**実行方法**:

```
1. claude-code-guideエージェントでClaude Agent SDKの公式ドキュメントを調査
2. 調査結果を元にclaude-agent-sdkスキルを新規作成
```

#### 目的

Claude Agent SDKの公式ドキュメント・APIリファレンスを調査し、プロジェクト用のスキルを作成する。

#### 成果物

| 成果物                             | 説明                             |
| ---------------------------------- | -------------------------------- |
| Claude Agent SDK調査レポート       | SDK概要・API・ベストプラクティス |
| `.claude/skills/claude-agent-sdk/` | 新規作成するSDK利用スキル        |

#### スキル作成仕様

**スキル名**: `claude-agent-sdk`

**含める内容**:

- SDK基本API（query, ClaudeSDKClient）
- セッション管理パターン
- パーミッション制御
- Electron統合パターン
- エラーハンドリング

#### 完了条件

- [ ] Claude Agent SDK公式ドキュメントを調査完了
- [ ] SDK利用パターンを整理
- [ ] `claude-agent-sdk`スキルを作成
- [ ] **本Phase内の全スキルを100%実行完了**

### Phase 1: 要件定義

#### 使用スキル

| スキル名                               | パス                                                             | 選定理由                                        |
| -------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| functional-non-functional-requirements | `.claude/skills/functional-non-functional-requirements/SKILL.md` | 機能要件・非機能要件の定義（Trigger: 要件定義） |
| acceptance-criteria-writing            | `.claude/skills/acceptance-criteria-writing/SKILL.md`            | 受け入れ基準の作成（Trigger: 受け入れ基準）     |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

#### 目的

Agent SDK統合の詳細要件を定義する。

#### 成果物

- 要件定義書（Agent SDK統合仕様）
- 受け入れ基準

#### 完了条件

- [ ] Agent SDK APIの利用パターンが明確化されている
- [ ] Electron IPC通信のインターフェースが定義されている
- [ ] **本Phase内の全スキルを100%実行完了**

### Phase 2: 設計

#### 使用スキル

| スキル名                      | パス                                                    | 選定理由                                                 |
| ----------------------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| architectural-patterns        | `.claude/skills/architectural-patterns/SKILL.md`        | アーキテクチャ設計（Trigger: アーキテクチャ設計）        |
| clean-architecture-principles | `.claude/skills/clean-architecture-principles/SKILL.md` | クリーンアーキテクチャ原則（Anchor: Clean Architecture） |
| electron-ipc-patterns         | `.claude/skills/electron-ipc-patterns/SKILL.md`         | Electron IPC通信パターン（Trigger: IPC通信）             |
| api-contract-design           | `.claude/skills/api-contract-design/SKILL.md`           | API契約設計（Trigger: API設計）                          |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

#### 目的

Agent SDK統合のアーキテクチャ設計を行う。

#### 成果物

- コンポーネント設計書
- API設計書
- シーケンス図

#### 完了条件

- [ ] Agent SDK統合モジュールの設計が完了
- [ ] IPC通信のハンドラー設計が完了
- [ ] **本Phase内の全スキルを100%実行完了**

### Phase 4: テスト作成

#### 使用スキル

| スキル名                | パス                                              | 選定理由                                      |
| ----------------------- | ------------------------------------------------- | --------------------------------------------- |
| tdd-principles          | `.claude/skills/tdd-principles/SKILL.md`          | TDD原則（Trigger: TDD, テスト駆動）           |
| test-doubles            | `.claude/skills/test-doubles/SKILL.md`            | モック・スタブ設計（Trigger: モック, スタブ） |
| boundary-value-analysis | `.claude/skills/boundary-value-analysis/SKILL.md` | 境界値分析（Trigger: テスト設計）             |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

#### 目的

TDD: 失敗するテストを先に作成する。

#### 成果物

- Agent SDKモジュールのユニットテスト
- IPC通信の統合テスト

#### 完了条件

- [ ] すべてのテストが失敗状態（Red）
- [ ] **本Phase内の全スキルを100%実行完了**

### Phase 5: 実装

#### 使用スキル

| スキル名                    | パス                                                  | 選定理由                                      |
| --------------------------- | ----------------------------------------------------- | --------------------------------------------- |
| clean-code-practices        | `.claude/skills/clean-code-practices/SKILL.md`        | クリーンコード実践（Anchor: Clean Code）      |
| electron-architecture       | `.claude/skills/electron-architecture/SKILL.md`       | Electronアーキテクチャ（Trigger: Electron）   |
| electron-security-hardening | `.claude/skills/electron-security-hardening/SKILL.md` | Electronセキュリティ（Trigger: セキュリティ） |
| type-safety-patterns        | `.claude/skills/type-safety-patterns/SKILL.md`        | 型安全パターン（Trigger: 型安全, TypeScript） |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

#### 目的

Agent SDK統合モジュールを実装する。

#### 成果物

- `packages/shared/src/agent/agent-client.ts`
- `apps/desktop/src/main/agent/agent-handler.ts`
- `apps/desktop/src/preload/agent-api.ts`

#### 完了条件

- [ ] すべてのテストが成功（Green）
- [ ] スキル呼び出しが動作する
- [ ] **本Phase内の全スキルを100%実行完了**

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `@anthropic-ai/claude-agent-sdk`がインストールされている
- [ ] Electronメインプロセスでエージェントが初期化される
- [ ] IPC通信でRendererからスキルを呼び出せる
- [ ] セッション管理（作成・再開）が動作する

### 品質要件

- [ ] ユニットテストカバレッジ 80%以上
- [ ] 統合テストが成功している
- [ ] ESLint/Prettierエラーがない

### ドキュメント要件

- [ ] 実装ガイドが作成されている
- [ ] API仕様書が作成されている

---

## 6. 検証方法

### テストケース

1. **Agent初期化テスト**: エージェントが正常に初期化される
2. **スキル呼び出しテスト**: `presentation-slide-generator`スキルが呼び出せる
3. **IPC通信テスト**: Renderer↔Main間の通信が成功する
4. **セッション管理テスト**: セッションの作成・再開が動作する

### 検証手順

```bash
# ユニットテスト実行
pnpm --filter @repo/shared test:run

# 統合テスト実行
pnpm --filter @repo/desktop test:run

# Electronアプリ起動・手動確認
pnpm --filter @repo/desktop dev
```

---

## 7. リスクと対策

| リスク                        | 影響度 | 発生確率 | 対策                                     |
| ----------------------------- | ------ | -------- | ---------------------------------------- |
| API Key管理のセキュリティ問題 | 高     | 中       | electron-storeで暗号化保存、環境変数利用 |
| SDK APIの互換性問題           | 中     | 低       | SDK公式ドキュメントを定期確認            |
| IPC通信のパフォーマンス問題   | 中     | 低       | ストリーミング対応、バッチ処理検討       |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/presentation-slide-generator/SKILL.md`
- `.claude/skills/electron-ipc-patterns/SKILL.md`
- `.claude/skills/electron-security-hardening/SKILL.md`

### 参考資料

| リソース                         | URL                                                          |
| -------------------------------- | ------------------------------------------------------------ |
| Claude Agent SDK公式ドキュメント | https://platform.claude.com/docs/en/agent-sdk/overview       |
| TypeScript SDK GitHub            | https://github.com/anthropics/claude-agent-sdk-typescript    |
| SDK Demos                        | https://github.com/anthropics/claude-agent-sdk-demos         |
| NPM Package                      | https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk |

---

## 9. 備考

### Claude Agent SDK 主要API

```typescript
// 基本的な呼び出しパターン
import { query } from "@anthropic-ai/claude-agent-sdk";

const result = query({
  prompt: "スライドを作成してください",
  options: {
    allowedTools: ["Read", "Write", "Edit", "Bash"],
    model: "claude-opus",
  },
});

for await (const message of result) {
  if (message.type === "assistant") {
    console.log(message.message.content);
  }
}
```

### Electron IPC通信パターン

```typescript
// メインプロセス (main/agent/agent-handler.ts)
ipcMain.handle("agent:query", async (event, prompt, options) => {
  const result = await agentClient.query(prompt, options);
  return result;
});

// プリロードスクリプト (preload/agent-api.ts)
contextBridge.exposeInMainWorld("agentAPI", {
  query: (prompt, options) =>
    ipcRenderer.invoke("agent:query", prompt, options),
});
```

### 補足事項

- 本タスクは後続タスク（ディレクトリ設定、依存関係管理）の基盤となる
- SDK V2（プレビュー版）のsend()/receive()パターンも検討対象
