# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| Phase番号  | 11                                                                                    |
| Phase名    | 手動テスト検証                                                                        |
| 目的       | 自動テストでカバーできないIPC通信・セキュリティ・エラーハンドリングを実環境で検証する |
| 前提Phase  | Phase 10（最終レビューゲート）                                                        |
| 後続Phase  | Phase 12（ドキュメント更新）                                                          |
| ステータス | 未実施                                                                                |
| 作成日     | 2026-02-27                                                                            |
| 機能名     | skill-share                                                                           |

---

## 目的

DevToolsコンソールを使用して、スキル共有・インポート機能の3つのIPCチャネル（`skill:importFromSource`, `skill:export`, `skill:validateSource`）が正しく動作することを手動で検証する。自動テストでは確認が困難なネットワーク障害、セキュリティ境界、エラーメッセージの安全性を重点的に確認する。

---

## 実行タスク

- インポート機能テスト: 4種類のソース（GitHub/Gist/URL/ローカル）からのインポートを検証
- エクスポート機能テスト: 2種類のターゲット（Gist/ローカル）へのエクスポートを検証
- バリデーション機能テスト: ソース検証IPCチャネルの動作を検証
- セキュリティテスト: 不正入力・パストラバーサル・情報漏洩を検証
- エラーハンドリングテスト: ネットワーク障害・権限不足・レート制限の挙動を検証

---

## 参照資料

| 参照資料                 | パス                                                                      | 内容                                    |
| ------------------------ | ------------------------------------------------------------------------- | --------------------------------------- |
| セキュリティ仕様         | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` | IPCセキュリティ検証項目                 |
| IPC仕様                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`      | チャネル仕様・型定義                    |
| Phase 2 設計書           | `docs/30-workflows/skill-share/phase-2-design.md`                         | 手動テスト観点の設計根拠                |
| Phase 5 実装仕様         | `docs/30-workflows/skill-share/phase-5-implementation.md`                 | 実装対象の確認                          |
| Phase 6 テスト拡充       | `docs/30-workflows/skill-share/phase-6-test-expansion.md`                 | 追加した統合・異常系テスト観点          |
| Phase 7 カバレッジ確認   | `docs/30-workflows/skill-share/phase-7-coverage-check.md`                 | カバレッジ達成状況                      |
| Phase 8 リファクタリング | `docs/30-workflows/skill-share/phase-8-refactoring.md`                    | 挙動不変前提の確認                      |
| Phase 9 品質保証         | `docs/30-workflows/skill-share/phase-9-quality-assurance.md`              | 事前品質ゲート結果                      |
| 受け入れ基準             | `outputs/phase-1/acceptance-criteria.md`                                  | テスト可能な受け入れ条件                |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`                                 | レビュー判定結果                        |
| 実装コード               | `apps/desktop/src/main/services/skill/SkillShareManager.ts`               | メインの実装ファイル                    |
| 共有型定義               | `packages/shared/src/types/skill-share.ts`                                | ShareTarget/ImportResult/ExportResult型 |
| IPCハンドラ              | `apps/desktop/src/main/ipc/skillHandlers.share.ts`                        | IPCチャネル登録                         |
| Preload API              | `apps/desktop/src/preload/skill-api.ts`                                   | Renderer側API                           |
| P42対策                  | `.claude/rules/06-known-pitfalls.md#P42`                                  | 3段バリデーション基準                   |
| P44対策                  | `.claude/rules/06-known-pitfalls.md#P44`                                  | IPCインターフェース整合性               |

---

## システム仕様（aiworkflow-requirements）

| 仕様書                          | 確認内容                                                                                     |
| ------------------------------- | -------------------------------------------------------------------------------------------- |
| `security-skill-ipc.md`         | IPCハンドラのセキュリティ検証パターン（送信元検証、引数バリデーション、エラーサニタイズ）    |
| `api-ipc-agent.md`              | `skill:importFromSource`, `skill:export`, `skill:validateSource` のリクエスト/レスポンス仕様 |
| `interfaces-agent-sdk-skill.md` | ShareTarget/ImportResult/ExportResult の契約検証                                             |
| `security-api-electron.md`      | contextBridge公開APIの境界ルールと最小権限確認                                               |
| `error-handling.md`             | ネットワーク障害/認証失敗時のエラー分類とユーザー通知                                        |
| `quality-requirements.md`       | 手動テストで確認すべき品質基準（正常系/異常系/回帰）                                         |

---

## 実行手順

### Task 1: インポート機能テスト

Electronアプリを `pnpm --filter @repo/desktop dev` で起動し、DevToolsコンソールで以下を実行する。

#### 1-1. GitHubリポジトリインポート

| #   | 操作                                                                                                                                     | 期待結果                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 1   | DevToolsコンソールで `await window.electronAPI.skill.importFromSource({type:"github", repo:"owner/repo", path:"skills/example"})` を実行 | `ImportResult` オブジェクトが返却される      |
| 2   | `~/.aiworkflow/skills/` ディレクトリを確認                                                                                               | インポートしたスキルのディレクトリが存在する |
| 3   | インポートしたスキル内の `SKILL.md` を確認                                                                                               | ファイルが正常に読み取れる                   |

#### 1-2. Gistインポート

| #   | 操作                                                                                            | 期待結果                                |
| --- | ----------------------------------------------------------------------------------------------- | --------------------------------------- |
| 1   | `await window.electronAPI.skill.importFromSource({type:"gist", gistId:"有効なGist ID"})` を実行 | `ImportResult` オブジェクトが返却される |
| 2   | `~/.aiworkflow/skills/` を確認                                                                  | Gistのスキルが保存されている            |

#### 1-3. URLインポート

| #   | 操作                                                                                                                | 期待結果                                |
| --- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 1   | `await window.electronAPI.skill.importFromSource({type:"url", url:"https://raw.githubusercontent.com/..."})` を実行 | `ImportResult` オブジェクトが返却される |
| 2   | `~/.aiworkflow/skills/` を確認                                                                                      | URLから取得したスキルが保存されている   |

#### 1-4. ローカルインポート

| #   | 操作                                                                                                       | 期待結果                                |
| --- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 1   | `await window.electronAPI.skill.importFromSource({type:"local", localPath:"/path/to/valid/skill"})` を実行 | `ImportResult` オブジェクトが返却される |
| 2   | `~/.aiworkflow/skills/` を確認                                                                             | ローカルスキルがコピーされている        |

### Task 2: エクスポート機能テスト

#### 2-1. Gistエクスポート

| #   | 操作                                                                        | 期待結果                                       |
| --- | --------------------------------------------------------------------------- | ---------------------------------------------- |
| 1   | `await window.electronAPI.skill.export("skill-name", {type:"gist"})` を実行 | `ExportResult` オブジェクトが返却される        |
| 2   | `ExportResult.shareUrl` を確認                                              | 有効なGist URLが含まれている                   |
| 3   | ブラウザでGist URLにアクセス                                                | スキルのファイルが正しくアップロードされている |

#### 2-2. ローカルエクスポート

| #   | 操作                                                                                                        | 期待結果                                |
| --- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 1   | `await window.electronAPI.skill.export("skill-name", {type:"local", localPath:"/tmp/skill-export"})` を実行 | `ExportResult` オブジェクトが返却される |
| 2   | `/tmp/skill-export` ディレクトリを確認                                                                      | スキルファイルがコピーされている        |
| 3   | エクスポートされた `SKILL.md` を確認                                                                        | 元のスキルと内容が一致する              |

### Task 3: バリデーション機能テスト

| #   | 操作                                                                                                              | 期待結果                                    |
| --- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 1   | `await window.electronAPI.skill.validateSource({type:"github", repo:"owner/repo", path:"skills/example"})` を実行 | バリデーション結果（有効/無効）が返却される |
| 2   | 無効なソースで `validateSource({type:"github", repo:"", path:""})` を実行                                         | バリデーションエラーが返却される            |

### Task 4: セキュリティテスト

#### 4-1. P42準拠: 空文字列・スペースのみ入力の拒否確認

| #   | 操作                                                                                       | 期待結果                                 |
| --- | ------------------------------------------------------------------------------------------ | ---------------------------------------- |
| 1   | `await window.electronAPI.skill.importFromSource({type:"github", repo:"", path:""})`       | バリデーションエラー（空文字列拒否）     |
| 2   | `await window.electronAPI.skill.importFromSource({type:"github", repo:"   ", path:"   "})` | バリデーションエラー（スペースのみ拒否） |
| 3   | `await window.electronAPI.skill.export("", {type:"gist"})`                                 | バリデーションエラー（空文字列拒否）     |
| 4   | `await window.electronAPI.skill.export("   ", {type:"gist"})`                              | バリデーションエラー（スペースのみ拒否） |

#### 4-2. パストラバーサル攻撃の拒否確認

| #   | 操作                                                                                            | 期待結果                       |
| --- | ----------------------------------------------------------------------------------------------- | ------------------------------ |
| 1   | `await window.electronAPI.skill.importFromSource({type:"local", localPath:"../../etc/passwd"})` | セキュリティエラーが返却される |
| 2   | `await window.electronAPI.skill.importFromSource({type:"local", localPath:"/etc/passwd"})`      | セキュリティエラーが返却される |
| 3   | `await window.electronAPI.skill.export("skill-name", {type:"local", localPath:"../../tmp"})`    | セキュリティエラーが返却される |

#### 4-3. P44対策: IPCハンドラ引数形式の整合性確認

| #   | 操作                                                | 期待結果                                 |
| --- | --------------------------------------------------- | ---------------------------------------- |
| 1   | Preload APIから渡される引数の形式をDevToolsで確認   | IPCハンドラが期待する形式と一致する      |
| 2   | `typeof` による型チェックが正しく動作することを確認 | 不正な型（数値、配列、null）が拒否される |

#### 4-4. エラーメッセージの安全性確認

| #   | 操作                                                                                                                | 期待結果                                               |
| --- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 1   | 存在しないGitHubリポジトリ `importFromSource({type:"github", repo:"nonexistent/repo123456", path:"skills"})` を指定 | エラーメッセージに内部ファイルパスが含まれない         |
| 2   | 返却されたエラーオブジェクトを確認                                                                                  | スタックトレースが含まれない                           |
| 3   | エラーメッセージがユーザーフレンドリーであることを確認                                                              | 「リポジトリが見つかりません」のような明確なメッセージ |

### Task 5: エラーハンドリングテスト

#### 5-1. ネットワーク障害

| #   | 操作                                                                                                          | 期待結果                                                   |
| --- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1   | ネットワーク接続を切断した状態で `importFromSource({type:"github", repo:"owner/repo", path:"skills"})` を実行 | ネットワークエラーが返却される（アプリがクラッシュしない） |
| 2   | ネットワーク接続を切断した状態で `export("skill-name", {type:"gist"})` を実行                                 | ネットワークエラーが返却される（アプリがクラッシュしない） |

#### 5-2. GitHub API Rate Limit

| #   | 操作                                               | 期待結果                                                         |
| --- | -------------------------------------------------- | ---------------------------------------------------------------- |
| 1   | レート制限に到達した場合のエラーレスポンスを確認   | 「API制限に達しました」のような明確なメッセージが返却される      |
| 2   | リトライ可能であることがエラー情報に含まれるか確認 | External Service Error（3000番台）のエラーコードが使用されている |

#### 5-3. 権限不足（Private Repository）

| #   | 操作                                                       | 期待結果                                                                     |
| --- | ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | プライベートリポジトリを指定して `importFromSource` を実行 | 権限不足エラーが返却される                                                   |
| 2   | エラーメッセージを確認                                     | 「アクセス権限がありません」のような明確なメッセージ（認証情報は含まれない） |

---

## 成果物

| 成果物         | パス                                     | 内容                           |
| -------------- | ---------------------------------------- | ------------------------------ |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 全シナリオの実行結果・発見事項 |

### 手動テスト結果のテンプレート

```markdown
# Phase 11: 手動テスト結果

## テスト環境

- OS: macOS {{version}}
- Electron: {{version}}
- Node.js: {{version}}
- テスト日時: {{YYYY-MM-DD HH:mm}}

## テスト結果サマリー

| カテゴリ           | 合計   | 成功      | 失敗      | スキップ  |
| ------------------ | ------ | --------- | --------- | --------- |
| インポート機能     | 9      | {{n}}     | {{n}}     | {{n}}     |
| エクスポート機能   | 6      | {{n}}     | {{n}}     | {{n}}     |
| バリデーション機能 | 2      | {{n}}     | {{n}}     | {{n}}     |
| セキュリティ       | 10     | {{n}}     | {{n}}     | {{n}}     |
| エラーハンドリング | 5      | {{n}}     | {{n}}     | {{n}}     |
| **合計**           | **32** | **{{n}}** | **{{n}}** | **{{n}}** |

## 詳細結果

（各テストケースの結果を記録）

## 発見された問題

（問題がある場合に記録。問題がない場合は「問題なし」と記載）

## スコープ外の発見事項

（Phase 12の未タスク検出に引き継ぐ項目を記録）
```

---

## 統合テスト連携

### Phase 11での必須アクション

- [ ] DevToolsコンソールからのIPC呼び出しが正常に動作することを確認
- [ ] Renderer → Preload → Main → 外部API の通信フロー全体を検証
- [ ] エラー発生時にRendererがクラッシュしないことを確認
- [ ] `window.electronAPI.skill` に `importFromSource`, `export`, `validateSource` の3メソッドが公開されていることを確認
- [ ] 旧APIパターン（直接文字列引数、オブジェクト形式 `{ skillIds: string[] }` / `{ skillId: string }`、ハードコードチャネル名）が存在しないことを確認

---

## 完了条件

- [ ] 全32件の手動テストシナリオを実行完了
- [ ] テスト結果が `outputs/phase-11/manual-test-result.md` に文書化されている
- [ ] 全セキュリティテスト（P42/P44対策含む）が成功している
- [ ] エラーメッセージに内部パス・スタックトレースが含まれないことを確認済み
- [ ] 発見された問題が記録されている（0件の場合は「問題なし」と明記）
- [ ] スコープ外の発見事項がPhase 12への引き継ぎとして記録されている

---

## スキル100%実行確認【必須】

- [ ] 本Phase内の全テストシナリオを100%実行完了
- [ ] 各テスト結果を明確に記録（成功/失敗/スキップ）
- [ ] スキップしたテストがある場合、理由を明記

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-share/phase-12-documentation.md`

---

## 備考

- インポート/エクスポートのテストでは、実際のGitHub/Gist APIとの通信が発生するため、ネットワーク接続が必須
- GitHub API Rate Limitテストは、意図的にリミットに到達させる必要はなく、レスポンスヘッダの `X-RateLimit-Remaining` を確認して挙動を推測しても可
- ローカルインポート/エクスポートテストでは、テスト用の一時ディレクトリ（`/tmp/skill-test-*`）を使用し、テスト後にクリーンアップすること
