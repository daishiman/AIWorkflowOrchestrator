# SkillStreamMessage型定義統一・Preload APIコールバック実装 - タスク指示書

## メタ情報

```yaml
issue_number: 639
```

## メタ情報

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | task-imp-skill-stream-type-preload-completion-001                 |
| タスク名     | SkillStreamMessage型定義統一・Preload APIコールバック実装         |
| 分類         | 改善                                                              |
| 対象機能     | Skill Execution（Preload API / Store Listener）                   |
| 優先度       | 中                                                                |
| 見積もり規模 | 小規模                                                            |
| ステータス   | 未実施                                                            |
| 発見元       | Phase 12（TASK-7D ChatPanel Agent統合・コードベースTODOスキャン） |
| 発見日       | 2026-02-01                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-7D ChatPanel Agent統合の実装過程で、SkillStreamMessage型の定義が複数箇所に分散しており、Renderer側のStore ListenerとMain Process側のSkillExecutorで型が不一致となっている。また、skill-api.ts（Preload API）内のonComplete/onErrorコールバックがスタブ実装のまま残されている。

これらはTASK-7Dのスコープ内で対応予定だったが、ChatPanelとSkillStreamingViewの統合を優先したため、TODOコメントとして残された。

### 1.2 問題点・課題

1. **型定義の不一致**: `setupSkillListeners.ts:23`に`// TODO: TASK-7D で型定義を統一`というコメントが残存。SkillStreamMessage型がMain Process側（SkillExecutor）とRenderer側（Store Listener）で異なる型定義を参照している
2. **Preload APIスタブ**: `skill-api.ts:231,241`に`// TODO: TASK-7D で実装`コメントが残存。`onComplete`と`onError`コールバックが空実装であり、スキル実行完了・エラー時の通知がRenderer側に伝達されない
3. **型安全性の低下**: 型不一致によりTypeScriptの型チェックが効かず、ランタイムエラーのリスクがある

### 1.3 放置した場合の影響

- スキル実行完了/エラー時のUI通知が機能しないため、ユーザーがスキル実行結果を正確に把握できない
- 型不一致によるランタイムエラーが発生する可能性がある（特にプロパティアクセス時にundefinedになるケース）
- 今後のSkill Execution機能拡張時に、型の整合性を取る作業が増大する

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillStreamMessage型を`packages/shared/src/types/`で一元管理し、Main Process・Preload・Renderer全層で同一の型定義を参照するようにする。併せて、skill-api.tsのonComplete/onErrorコールバックを実装し、スキル実行ライフサイクルの通知を完結させる。

### 2.2 最終ゴール

- `setupSkillListeners.ts`のTODOコメントが解消され、SkillStreamMessage型が統一されている
- `skill-api.ts`のonComplete/onErrorコールバックがIPC通信経由で正しく動作している
- TypeScript strict modeで型エラーが0件
- 関連する既存テスト（48件）が全てGREEN

### 2.3 スコープ

#### 含むもの

- SkillStreamMessage型定義の統一（shared パッケージへの集約）
- setupSkillListeners.tsの型参照修正
- skill-api.ts onComplete/onErrorコールバック実装
- Main Process側のIPC送信実装（skill実行完了/エラーイベント）
- 関連テストの追加・修正

#### 含まないもの

- SkillExecutor本体のロジック変更
- ChatPanel/SkillStreamingViewのUI変更
- 新規IPCチャンネルの追加（既存チャンネルの活用）
- Agent SDK統合（別タスク: task-imp-sdk-integration-test-activation-001）

### 2.4 成果物

| 成果物                     | 説明                                         |
| -------------------------- | -------------------------------------------- |
| 統一型定義ファイル         | `packages/shared/src/types/skill.ts`に型集約 |
| setupSkillListeners.ts修正 | TODO解消・型参照統一                         |
| skill-api.ts修正           | onComplete/onErrorコールバック実装           |
| テストファイル             | 新規テスト追加（コールバック検証）           |
| Phase 1-12成果物           | 各Phase出力ファイル                          |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-7D ChatPanel Agent統合が完了していること（✅ 完了済み）
- `packages/shared`のビルドが成功すること
- Vitest実行環境が整っていること

### 3.2 依存タスク

| タスク                              | ステータス |
| ----------------------------------- | ---------- |
| TASK-7D ChatPanel Agent統合         | ✅ 完了    |
| TASK-7C SkillStreamingView Organism | ✅ 完了    |

### 3.3 必要な知識

- TypeScript型定義（Discriminated Union、Exclude型）
- Electron IPC通信パターン（ipcMain.handle / ipcRenderer.invoke）
- Zustand Store + Listener パターン
- Preload API（contextBridge.exposeInMainWorld）

### 3.4 推奨アプローチ

1. `packages/shared/src/types/skill.ts`にSkillStreamMessage型を定義（正本化）
2. Main Process・Renderer双方の型importを統一
3. skill-api.tsでIPC listenerを登録し、onComplete/onErrorをStore更新に接続
4. setupSkillListeners.tsのTODO解消
5. テスト作成・カバレッジ確認

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 概要                           |
| ----- | ---------------- | ------------------------------ |
| 1     | 要件定義         | 型定義の現状分析・統一方針決定 |
| 2     | 設計             | 型構造設計・IPC通信設計        |
| 4     | テスト作成       | TDD Red：型統一後のテスト作成  |
| 5     | 実装             | 型統一・コールバック実装       |
| 6-9   | テスト・品質     | カバレッジ確認・リファクタ     |
| 12    | ドキュメント更新 | システム仕様書更新             |

### Phase 1: 要件定義

#### 目的

SkillStreamMessage型の現在の定義箇所を全て特定し、統一方針を決定する。

#### 手順

1. `setupSkillListeners.ts`の型参照を確認（現在の型定義元を特定）
2. `skill-api.ts`のonComplete/onErrorの期待する型を確認
3. Main Process側（SkillExecutor）のストリームメッセージ型を確認
4. `packages/shared/src/types/`に既存のSkill関連型を確認
5. 型統一方針をドキュメント化

#### 成果物

- 要件定義書（型マッピング表含む）

#### 完了条件

- 全ての型定義箇所が特定されている
- 統一先のファイルパスが決定している

### Phase 5: 実装

#### 目的

型定義を統一し、Preload APIコールバックを実装する。

#### 手順

1. `packages/shared/src/types/skill.ts`にSkillStreamMessage型を追加/修正
2. `setupSkillListeners.ts`のimportパスを修正、TODO解消
3. `skill-api.ts`のonComplete/onErrorにIPC listener登録を実装
4. Main Process側からskill完了/エラーイベントをIPC送信する実装を追加
5. TypeScript型チェック通過を確認

#### 成果物

- 修正済みソースファイル（4-6ファイル）

#### 完了条件

- `pnpm typecheck`がエラー0
- `pnpm test`が全テストGREEN
- TODOコメント3箇所が全て解消

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SkillStreamMessage型が`packages/shared`で一元管理されている
- [ ] setupSkillListeners.tsのTODOが解消されている
- [ ] skill-api.ts onComplete コールバックが動作する
- [ ] skill-api.ts onError コールバックが動作する
- [ ] Main Process → Renderer のIPC通信が正常に機能する

### 品質要件

- [ ] TypeScript strict mode でエラー0件
- [ ] テストカバレッジ Line 80%以上
- [ ] 既存テスト48件が全てGREEN
- [ ] ESLint エラー0件

### ドキュメント要件

- [ ] interfaces-agent-sdk-ui.md 更新（型統一記録）
- [ ] aiworkflow-requirements/LOGS.md 更新
- [ ] task-specification-creator/LOGS.md 更新

---

## 6. 検証方法

### テストケース

| #   | テストケース                                       | 期待結果                               |
| --- | -------------------------------------------------- | -------------------------------------- |
| 1   | SkillStreamMessage型をsharedからimportできる       | コンパイルエラーなし                   |
| 2   | setupSkillListeners.tsがストリームメッセージを受信 | Store状態が正しく更新される            |
| 3   | skill-api.ts onCompleteが呼ばれる                  | スキル完了時にRenderer側に通知される   |
| 4   | skill-api.ts onErrorが呼ばれる                     | スキルエラー時にRenderer側に通知される |
| 5   | 型定義変更後に既存48テストがGREEN                  | 全テストPASS                           |

### 検証手順

1. `pnpm typecheck` を実行し、型エラーが0であることを確認
2. `pnpm test` を実行し、全テストがGREENであることを確認
3. `grep -r "TODO.*TASK-7D" apps/desktop/src/` を実行し、関連TODOが0件であることを確認

---

## 7. リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                                                    |
| ---------------------------------------- | ------ | -------- | ------------------------------------------------------- |
| 型変更による既存コードのコンパイルエラー | 中     | 中       | 段階的に型を移行し、各ステップでtypecheckを実行         |
| IPC通信のタイミング問題                  | 低     | 低       | 既存のIPC通信パターンに従い、非同期処理を適切にハンドル |
| Store Listener登録タイミングの競合       | 低     | 低       | setupSkillListeners.tsの初期化順序を維持                |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                | 用途                                 |
| --------------------------- | ------------------------------------ |
| interfaces-agent-sdk-ui.md  | Agent SDK UI型定義仕様               |
| ui-ux-agent-execution.md    | Agent Execution UIフロー仕様         |
| ui-ux-feature-components.md | SkillStreamingViewコンポーネント仕様 |
| security-api-electron.md    | Preload API セキュリティ仕様         |
| architecture-patterns.md    | Electron IPCパターン                 |

### 参考資料

| ファイルパス                                             | 該当行 | 内容                 |
| -------------------------------------------------------- | ------ | -------------------- |
| `apps/desktop/src/renderer/store/setupSkillListeners.ts` | L23    | TODO: 型定義統一     |
| `apps/desktop/src/preload/skill-api.ts`                  | L231   | TODO: onComplete実装 |
| `apps/desktop/src/preload/skill-api.ts`                  | L241   | TODO: onError実装    |

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
// TODO: TASK-7D で型定義を統一（setupSkillListeners.ts:23）
// TODO: TASK-7D で実装（skill-api.ts:231 - onComplete）
// TODO: TASK-7D で実装（skill-api.ts:241 - onError）
```

### 補足事項

- TASK-7Dの開発中にChatPanel統合とSkillStreamingView実装を優先したため、型統一とコールバック実装がTODOとして残された
- 本タスクはTASK-7Dの直接的な残課題であり、Agent SDK統合（別タスク）の前に完了しておくことが望ましい
- DisplayableStatus型（`Exclude<SkillExecutionStatus, "idle">`）パターンは既にTASK-7Dで確立済みのため、同パターンを踏襲すること
