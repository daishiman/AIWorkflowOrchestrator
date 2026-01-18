# 未完了タスク: task-imp-slide-agent-sdk-integration-001

## メタ情報

| 項目         | 値                                                  |
| ------------ | --------------------------------------------------- |
| タスクID     | task-imp-slide-agent-sdk-integration-001            |
| 分類         | 改善 (imp)                                          |
| 優先度       | 中                                                  |
| 見積もり規模 | 中規模（2-3 Phase、2-5日）                          |
| 発見元       | Phase 12 - コードベースTODOコメント                 |
| 関連ファイル | apps/desktop/src/main/slide/skill-executor.ts:87-89 |

## Why（なぜ必要か）

### 背景

slide-dependency-management機能の実装において、skill-executor.tsにスキル実行ロジックを実装しました。現在の実装では、スキル実行部分がスタブ（`simulateSkillExecution()`）となっており、実際のClaude Agent SDKとの統合が未完了です。

### 問題点

- skill-executor.tsの`execute()`メソッドがスタブ実装のまま
- `projectPath`パラメータが`_projectPath`として未使用
- ファイル変更検知 → スキル自動実行の本来のフローが動作しない
- ユーザーがSlide機能を使用しても、実際のスキル実行が行われない

### 放置した場合の影響

- Slide依存関係管理機能が本番環境で動作しない
- ファイル変更を検知しても、スキル実行が行われないため、structure.mdとindex.htmlの自動同期が機能しない
- ユーザー体験の低下（手動でスキルを実行する必要がある）

## What（何を達成するか）

### 目的

skill-executor.tsにClaude Agent SDKを統合し、スキルフェーズ（hearing/structure/html/modifier）を実際に実行できるようにする。

### 最終ゴール

1. skill-executor.tsがClaude Agent SDKを通じてスキルを実行できる
2. structure.md変更検知 → html-generatorスキル自動実行 → index.html更新の一連のフローが動作する
3. 進捗コールバックが正しくUI（SyncStatusIndicator）に反映される

### スコープ

#### 含む

- skill-executor.tsへのClaude Agent SDK統合
- projectPathパラメータの活用（スキル実行時のコンテキストとして渡す）
- スキルフェーズとAgent SDKのスキル名のマッピング
- エラーハンドリングの実装
- 統合テストの追加

#### 含まない

- Agent SDK自体の開発・修正
- 新しいスキルフェーズの追加
- UIコンポーネントの変更（既存のSyncStatusIndicatorで対応可能）
- 他のSlide関連モジュール（file-watcher, sync-manager）の変更

### 成果物

| 成果物                | 説明                            |
| --------------------- | ------------------------------- |
| skill-executor.ts更新 | Agent SDK統合版の実装           |
| 統合テスト            | Agent SDK連携のテストケース     |
| 実装ガイド更新        | Agent SDK統合手順のドキュメント |

## How（どのように実行するか）

### 前提条件

- Claude Agent SDK（`@anthropic-ai/agent-sdk`または同等）がインストールされていること
- Agent SDK統合基盤タスク（task-agent-sdk-integration）が完了していること
- 既存のslide-dependency-management実装が理解されていること

### 推奨スキル

| スキル                     | 用途                          |
| -------------------------- | ----------------------------- |
| implementation             | コード実装                    |
| electron-ipc               | Main/Renderer間通信           |
| integration-testing        | 統合テストの作成              |
| agent-lifecycle-management | Agent SDKのライフサイクル管理 |

### 実行手順

1. **Agent SDK依存関係の確認**
   - `@anthropic-ai/agent-sdk`（または同等）の存在を確認
   - 必要に応じてpackage.jsonに追加

2. **スキル名マッピングの実装**

   ```typescript
   // 現在のスタブ
   const getSkillName = (phase: SkillPhase): string => {
     const skillMap: Record<SkillPhase, string> = {
       hearing: "slide-hearing",
       structure: "slide-structure-designer",
       html: "slide-html-generator",
       modifier: "slide-modifier",
     };
     return skillMap[phase];
   };
   ```

3. **Agent SDK呼び出しの実装**
   - `simulateSkillExecution()`を実際のAgent SDK呼び出しに置換
   - AbortControllerによるキャンセル対応を維持
   - 進捗コールバックの実装

4. **projectPathパラメータの活用**
   - `_projectPath`を`projectPath`にリネーム
   - スキル実行時のコンテキストとして渡す

5. **エラーハンドリングの実装**
   - Agent SDKからのエラーをキャッチ
   - 適切なエラーメッセージをUIに伝達

6. **統合テストの追加**
   - Agent SDKモックを使用したテスト
   - 成功/失敗/キャンセルのシナリオ

### 完了条件

- [ ] skill-executor.tsがAgent SDKを呼び出してスキルを実行できる
- [ ] projectPathパラメータが正しく使用されている
- [ ] キャンセル機能（AbortController）が動作する
- [ ] 進捗コールバックがUIに反映される
- [ ] エラー時に適切なエラーメッセージが表示される
- [ ] 統合テストが追加され、全て通過する
- [ ] TypeScriptの型エラーが0件
- [ ] ESLintエラーが0件

### 検証方法

1. **ユニットテスト**: `pnpm --filter @repo/desktop test skill-executor`
2. **統合テスト**: Agent SDKモックを使用した統合テスト
3. **手動テスト**: Electronアプリを起動し、structure.md変更 → スキル実行 → index.html更新のフローを確認

### リスクと対策

| リスク                       | 対策                                                       |
| ---------------------------- | ---------------------------------------------------------- |
| Agent SDKのAPIが想定と異なる | Agent SDK統合基盤タスクの成果物を参照し、API仕様を確認     |
| 非同期処理のタイミング問題   | AbortController + async/awaitで適切に制御                  |
| メモリリーク                 | 使用後のリソース解放を明示的に実装                         |
| スキル実行の失敗             | リトライロジックの検討（ただし本タスクスコープ外の可能性） |

---

---

## slide-reverse-sync関連追加要件（2026-01-10追記）

### 追加対象ファイル

| ファイル                                        | 対応内容                                 |
| ----------------------------------------------- | ---------------------------------------- |
| `apps/desktop/src/main/slide/agent-client.ts`   | シミュレーション→実SDK API呼び出しに置換 |
| `apps/desktop/src/main/slide/modifier-skill.ts` | ModifierSkill実行ロジック（変更不要）    |

### 追加TODOコメント

**agent-client.ts:192**:

```typescript
// TODO: Agent SDK統合後に実際のAPI呼び出しを実装
```

### 追加PENDINGテスト項目

以下のテストがSDK統合後に実施可能：

1. SyncStatusIndicator表示（UI/UXテスト）
2. 同期成功フィードバック（UI/UXテスト）
3. エラーフィードバック（UI/UXテスト）
4. Agent SDK連携（統合テスト）
5. Main/Renderer IPC（統合テスト）

### 追加完了条件

- [ ] agent-client.tsが実Agent SDK呼び出しを行う
- [ ] APIキーがsafeStorageで暗号化保存される
- [ ] 30秒タイムアウトが正常動作する
- [ ] ModifierSkill（HTML→structure.md逆同期）が実動作する
- [ ] changeContextMapによる無限ループ防止が実環境で動作する

---

## 参照リソース

### slide-dependency-management関連

- 関連タスク: `docs/30-workflows/task-agent-sdk-integration.md`
- 実装ガイド: `docs/30-workflows/slide-dependency-management/outputs/phase-12/implementation-guide.md`
- 設計書: `docs/30-workflows/slide-dependency-management/outputs/phase-2/architecture-design.md`

### slide-reverse-sync関連

- 実装ガイド: `docs/30-workflows/slide-reverse-sync/outputs/phase-12/implementation-guide.md`
- 未タスク検出レポート: `docs/30-workflows/slide-reverse-sync/outputs/phase-12/unassigned-task-report.md`
- Agent SDKインターフェース: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`
- API仕様: `docs/30-workflows/slide-reverse-sync/outputs/phase-2/api-specification.md`
- IPC設計: `docs/30-workflows/slide-reverse-sync/outputs/phase-2/ipc-design.md`

---

**最終更新**: 2026-01-10（slide-reverse-sync Phase 12より追記）
