# Phase 5: 実装（TDD: Green） - タスク仕様書

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 5                  |
| Phase名    | 実装（TDD: Green） |
| 前提Phase  | Phase 4            |
| 後続Phase  | Phase 6            |
| ステータス | 未実施             |
| 作成日     | 2026-01-10         |
| 機能名     | slide-reverse-sync |

---

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う（Green状態）。逆同期機能の実装を完了する。

## 背景

TDDアプローチに従い、失敗しているテストを通す最小限の実装を行う。過度な最適化やリファクタリングはPhase 8で行う。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: agent-lifecycle-management

**パス**: `.claude/skills/agent-lifecycle-management/SKILL.md`

**選定理由**: タスク指示書で指定されているスキル。Agent SDKのライフサイクル（初期化、実行、状態管理、シャットダウン）を管理するため。

**Trigger条件**:

- エージェントの初期化戦略設計、エージェント状態管理機構の実装を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. Agent SDK連携部分を実装

**期待される成果物**:

- Agent SDK連携コード（プロジェクトディレクトリに配置）

---

### スキル2: multi-agent-systems

**パス**: `.claude/skills/multi-agent-systems/SKILL.md`

**選定理由**: タスク指示書で指定されているスキル。modifier skillの設計とハンドオフプロトコルを実装するため。

**Trigger条件**:

- マルチエージェント協調の設計、ハンドオフプロトコルの定義を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. modifier skill実行ロジックを実装

**期待される成果物**:

- modifier skill実装コード（プロジェクトディレクトリに配置）

---

### スキル3: clean-code-practices

**パス**: `.claude/skills/clean-code-practices/SKILL.md`

**選定理由**: 可読性が高く保守しやすいコードを書くため。

**Trigger条件**:

- クリーンコード原則の適用、コード品質向上を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 実装コードに適用

**期待される成果物**:

- クリーンコード原則に従った実装

---

### スキル4: error-handling-patterns

**パス**: `.claude/skills/error-handling-patterns/SKILL.md`

**選定理由**: 堅牢なエラーハンドリングを実装するため。Agent SDK呼び出し時のエラー処理が重要。

**Trigger条件**:

- エラーハンドリングパターンの実装を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. エラーハンドリングを実装

**期待される成果物**:

- エラーハンドリングコード

---

## 参照資料

| 参照資料   | パス                                     | 内容          |
| ---------- | ---------------------------------------- | ------------- |
| 設計書     | `outputs/phase-2/architecture-design.md` | Phase 2成果物 |
| API仕様    | `outputs/phase-2/api-specification.md`   | Phase 2成果物 |
| IPC設計    | `outputs/phase-2/ipc-design.md`          | Phase 2成果物 |
| テスト仕様 | `outputs/phase-4/test-specification.md`  | Phase 4成果物 |
| 既存実装   | `apps/desktop/src/main/slide/`           | 既存コード    |

### システム仕様（aiworkflow-requirements）

> 実装時に以下のシステム仕様を参照し、準拠してください。

| 参照資料           | パス                                                                        | 内容                      |
| ------------------ | --------------------------------------------------------------------------- | ------------------------- |
| Agent SDK仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | Agent連携インターフェース |
| IPC設計            | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`        | Electron IPC設計          |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | エラー処理パターン        |

---

## 実装対象

| ファイル             | 変更内容                                              |
| -------------------- | ----------------------------------------------------- |
| `file-watcher.ts`    | index.html監視の追加                                  |
| `sync-manager.ts`    | 逆方向同期トリガー処理                                |
| `skill-executor.ts`  | modifierスキル実行ロジック                            |
| `skills/modifier.ts` | Claude Codeで HTML→Structure を変換するスキル（新規） |
| `types.ts`           | 必要な型定義の追加                                    |

---

## 成果物

| 成果物       | パス                                        | 内容           |
| ------------ | ------------------------------------------- | -------------- |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | 実装内容の要約 |
| 実装コード   | `apps/desktop/src/main/slide/`              | 機能実装       |

**注意**: 実装コード（コード成果物）は `outputs/` ではなくプロジェクトディレクトリに配置すること。

---

## 統合テスト連携【必須】

Main/Renderer接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                       |
| ------------------ | ------------------------------------------ |
| file-watcher拡張   | index.html監視追加、chokidar設定           |
| sync-manager拡張   | 逆方向トリガー、changeContextMap双方向対応 |
| skill-executor拡張 | modifierスキル実行、Agent SDK呼び出し      |
| IPC通知            | SyncStatusIndicatorへの状態通知実装        |
| エラー伝播         | Agent API障害時のエラーハンドリング        |

---

## 完了条件

- [ ] すべてのテストが成功状態（Green）
- [ ] 実装が最小限に抑えられている
- [ ] file-watcher.tsがindex.htmlを監視している
- [ ] Claude Codeによる差分解析が動作する
- [ ] structure.mdへの反映が正しく行われる
- [ ] 無限ループ防止が双方向で機能する
- [ ] フロント/バック接続が実装されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Phase 2, 4成果物の確認
2. file-watcher.ts拡張（index.html監視追加）
3. sync-manager.ts拡張（逆方向トリガー）
4. agent-lifecycle-managementスキルの実行
5. multi-agent-systemsスキルの実行
6. modifier skill実装
7. IPC通知実装
8. エラーハンドリング実装
9. テスト実行・Green状態確認
10. 成果物の作成・配置
11. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] テストがGreen状態であることを確認
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/slide-reverse-sync --phase 5
```

---

## スキルフィードバック記録（Phase完了後に記載）

```markdown
## Phase 5 実行記録

### 使用スキル

- agent-lifecycle-management: {{result}}
- multi-agent-systems: {{result}}
- clean-code-practices: {{result}}
- error-handling-patterns: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

Phase 6: テスト拡充

`docs/30-workflows/slide-reverse-sync/phase-6-test-expansion.md`
