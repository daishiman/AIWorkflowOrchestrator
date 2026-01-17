# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 12                          |
| 機能名 | claude-code-cli-integration |
| 作成日 | 2026-01-16                  |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

- 技術ドキュメント作成: 実装ガイドの作成
- システムドキュメント更新: aiworkflow-requirements等の更新
- 未タスク検出: 残課題の検出と記録

## サブフェーズ

### Phase 12-1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**Part 1: 概念的説明の内容**:

- Claude Code CLIとは何か
- なぜElectronアプリから実行する必要があるのか
- ユーザーにとってのメリット
- 基本的な使い方の流れ

**Part 2: 技術的詳細の内容**:

- IPC通信の仕組み
- 型定義とZodスキーマ
- 各モジュールの責務
- コード例と使用方法

### Phase 12-2: システムドキュメント更新

**更新対象**:

- `docs/00-requirements/` 配下
- `.claude/skills/aiworkflow-requirements/references/`

**更新原則**: 概要のみ記載、Single Source of Truth遵守

**更新内容**:

| ドキュメント             | 更新内容                     |
| ------------------------ | ---------------------------- |
| interfaces-agent-sdk.md  | Claude CLI統合セクション追加 |
| architecture-patterns.md | CLI連携パターン追加          |
| security-api-electron.md | CLI関連セキュリティ要件追加  |

### Phase 12-3: 未タスク検出【必須】

以下のソースから未完了タスクを検出する:

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

**検出コマンド**:

```bash
# コードベース内のTODO/FIXMEを検出
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/claude-cli/ packages/shared/src/claude-cli/
```

---

## 詳細タスク

### タスク1: API仕様書の最終化

**目的**: IPC API仕様書を実装に合わせて最終化する

**手順**:

1. Phase 2で作成したIPC API仕様を確認
2. 実装との差異を特定
3. 仕様書を更新

**更新内容**:

| 項目           | 確認・更新内容                     |
| -------------- | ---------------------------------- |
| チャンネル定義 | 全チャンネルが実装通りか           |
| リクエスト型   | 型定義が実装と一致しているか       |
| レスポンス型   | 型定義が実装と一致しているか       |
| エラーコード   | 全エラーコードが文書化されているか |

**期待される成果物**:

- 最終化されたIPC API仕様書

### タスク2: 型定義ドキュメント更新

**目的**: 型定義ドキュメントを実装に合わせて更新する

**手順**:

1. Phase 2で作成した型定義設計を確認
2. 実装された型定義と比較
3. ドキュメントを更新

**更新内容**:

| 項目        | 確認・更新内容                 |
| ----------- | ------------------------------ |
| 型定義      | 全型が文書化されているか       |
| Zodスキーマ | スキーマ定義が正確か           |
| エラー型    | 全エラー型が文書化されているか |
| 使用例      | 型の使用例が含まれているか     |

**期待される成果物**:

- 更新された型定義ドキュメント

### タスク3: 使用例・サンプルコード作成

**目的**: 開発者向けの使用例を作成する

**手順**:

1. 基本的な使用パターンを特定
2. コードサンプルを作成
3. コメント付きで説明を追加

**サンプルコード**:

```typescript
// CLI存在確認
const availability = await window.claudeCliAPI.check();
if (availability.available) {
  console.log(`Claude Code CLI v${availability.version} is available`);
}

// スキル一覧取得
const skills = await window.claudeCliAPI.listSkills();
skills.forEach((skill) => {
  console.log(`${skill.name}: ${skill.description}`);
});

// スキル実行
const { sessionId } = await window.claudeCliAPI.execute({
  skillPath: "task-specification-creator",
  prompt: "タスク仕様書を作成してください",
});

// ストリーミング出力の受信
window.claudeCliAPI.onStream((event, message) => {
  if (message.sessionId === sessionId) {
    console.log(message.content);
  }
});

// 完了通知の受信
window.claudeCliAPI.onComplete((event, result) => {
  if (result.sessionId === sessionId) {
    console.log("実行完了:", result.status);
  }
});

// 実行中断
await window.claudeCliAPI.abort(sessionId);
```

**期待される成果物**:

- 使用例ドキュメント

### タスク4: トラブルシューティングガイド作成

**目的**: よくある問題と解決策を文書化する

**手順**:

1. 手動テストで発見された問題を収集
2. よくある問題パターンを特定
3. 解決策を文書化

**トラブルシューティング項目**:

| 問題              | 原因                | 解決策                                                    |
| ----------------- | ------------------- | --------------------------------------------------------- |
| CLI not found     | CLIが未インストール | `npm install -g @anthropic-ai/claude-code` でインストール |
| Permission denied | 実行権限なし        | スキルファイルの権限を確認                                |
| Timeout           | 処理時間超過        | timeout オプションを増やす                                |
| Session limit     | セッション上限      | 不要なセッションを終了                                    |

**期待される成果物**:

- トラブルシューティングガイド

### タスク5: 内部ドキュメント更新

**目的**: 開発者向け内部ドキュメントを更新する

**手順**:

1. アーキテクチャ図を実装に合わせて更新
2. モジュール構成図を更新
3. データフロー図を更新

**期待される成果物**:

- 更新された内部ドキュメント

## 参照資料

| 資料名         | パス                                       | 説明           |
| -------------- | ------------------------------------------ | -------------- |
| IPC API仕様    | `outputs/phase-2/ipc-api-specification.md` | Phase 2成果物  |
| 型定義設計     | `outputs/phase-2/type-definitions.md`      | Phase 2成果物  |
| 手動テスト結果 | `outputs/phase-11/manual-test-results.md`  | Phase 11成果物 |

### システム仕様（aiworkflow-requirements）

> ドキュメント更新時に以下のシステム仕様を参照してください。

| 参照資料                  | パス                                                                        | 内容                 |
| ------------------------- | --------------------------------------------------------------------------- | -------------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 既存ドキュメント形式 |

## 成果物

| 成果物                       | パス                                           | 必須 | 説明                      |
| ---------------------------- | ---------------------------------------------- | ---- | ------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`     | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-update-log.md` | ✅   | 更新履歴                  |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-report.md`   | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書           | `docs/30-workflows/unassigned-task/*.md`       | 条件 | 検出時のみ作成            |
| API仕様書（最終版）          | `outputs/phase-12/api-specification-final.md`  |      | 最終API仕様               |
| 型定義ドキュメント（最終版） | `outputs/phase-12/type-definitions-final.md`   |      | 最終型定義                |
| 使用例ドキュメント           | `outputs/phase-12/usage-examples.md`           |      | 使用例                    |
| トラブルシューティング       | `outputs/phase-12/troubleshooting-guide.md`    |      | FAQ                       |

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている【必須】
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている【必須】
- [ ] 関連ドキュメントが更新されている
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] IPC API仕様書が実装と一致している
- [ ] 型定義ドキュメントが実装と一致している
- [ ] 使用例・サンプルコードが作成されている
- [ ] トラブルシューティングガイドが作成されている
- [ ] 全ドキュメントがレビューされている
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

### Phase 12-1: 実装ガイド作成【必須】

1. 実装ガイドPart 1（概念的説明）作成
2. 実装ガイドPart 2（技術的詳細）作成

### Phase 12-2: システムドキュメント更新

3. aiworkflow-requirements仕様更新
4. ドキュメント更新履歴作成

### Phase 12-3: 未タスク検出【必須】

5. Phase 3/10レビュー結果からMINOR指摘抽出
6. Phase 11手動テストからスコープ外発見事項抽出
7. コードベースTODO/FIXME検出
8. 未タスク検出レポート作成
9. 未完了タスク指示書作成（該当する場合）

### その他

10. API仕様書の最終化
11. 型定義ドキュメント更新
12. 使用例・サンプルコード作成
13. トラブルシューティングガイド作成
14. ドキュメントレビュー
15. 成果物の配置
16. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] Phase 12-1: 実装ガイド作成が100%完了【必須】
- [ ] Phase 12-2: システムドキュメント更新が100%完了
- [ ] Phase 12-3: 未タスク検出レポートが出力されている【必須】
- [ ] 全ドキュメントが作成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/claude-code-cli-integration --phase 12
```

## 次のPhase

Phase 13: PR作成
