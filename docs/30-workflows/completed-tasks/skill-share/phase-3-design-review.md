# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                                                 |
| ---------- | -------------------------------------------------------------------- |
| Phase 番号 | 3                                                                    |
| Phase 名   | 設計レビュー                                                         |
| 目的       | Phase 1の要件とPhase 2の設計の整合性・品質をレビューゲートで検証する |
| 前提Phase  | Phase 2: 設計                                                        |
| 後続Phase  | Phase 4: テスト作成                                                  |
| ステータス | 未実施                                                               |
| 作成日     | 2026-02-27                                                           |
| 機能名     | skill-share                                                          |

## 目的

Phase 1で定義した機能要件（FR-1〜FR-8）・非機能要件（NFR-1〜NFR-4）・受け入れ基準と、Phase 2で作成したアーキテクチャ設計・IPC通信設計・型定義設計・GitHub認証設計の整合性を検証する。既存アーキテクチャ（Electron 3プロセスモデル）との整合性、既知の落とし穴（P34/P35/P42/P44/P45）への対策状況を確認し、レビューゲート判定（PASS/MINOR/MAJOR）を行う。

## 実行タスク

- **Task 1: 要件カバレッジ検証** — FR-1〜FR-8の全項目がPhase 2の設計でカバーされているかを1対1で検証する
- **Task 2: NFRカバレッジ検証** — NFR-1〜NFR-4の全項目が設計で実現可能かを検証する
- **Task 3: アーキテクチャ品質検証** — 3プロセスモデル整合性、DI設計妥当性、Strategyパターン適用の妥当性を検証する
- **Task 4: セキュリティ設計検証** — P42/P44/P45対策、パストラバーサル防止、HTTPS強制、PAT保護を検証する
- **Task 5: レビューゲート判定** — PASS/MINOR/MAJORを判定し、判定理由を記録する

## 参照資料

| 参照資料               | パス                                                    | 内容                           |
| ---------------------- | ------------------------------------------------------- | ------------------------------ |
| Phase 1 要件定義       | `docs/30-workflows/skill-share/phase-1-requirements.md` | FR/NFR/受入基準                |
| Phase 2 設計           | `docs/30-workflows/skill-share/phase-2-design.md`       | アーキテクチャ/IPC/型/認証設計 |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                    | P34/P35/P42/P44/P45の教訓      |
| タスク実行ワークフロー | `.claude/rules/05-task-execution.md`                    | Phase 3レビューゲート判定基準  |
| 既存skillHandlers      | `apps/desktop/src/main/ipc/skillHandlers.share.ts`      | 既存ハンドラのパターン確認     |

## システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                                        | 内容                                 |
| --------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------ |
| アーキテクチャ        | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 3プロセスモデル・IPC登録パターン     |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DI/Setter Injection/Strategyパターン |
| IPC仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | 既存チャネル一覧・登録パターン       |
| セキュリティ          | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | contextBridge設計・validateIpcSender |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | Phase 1-6チェック項目                |

## 実行手順

### Step 1: 要件カバレッジ検証

Phase 1のFR-1〜FR-8が、Phase 2の設計で100%カバーされているかをトレーサビリティマトリクスで検証する。

#### 検証マトリクス

| FR   | 要件名                     | 設計カバー対象                            | カバー状況 |
| ---- | -------------------------- | ----------------------------------------- | ---------- |
| FR-1 | GitHubリポジトリインポート | GitHubImportStrategy + GitHubClient       | 要検証     |
| FR-2 | Gistインポート             | GistImportStrategy + GitHubClient         | 要検証     |
| FR-3 | URLインポート              | UrlImportStrategy（Node.js https module） | 要検証     |
| FR-4 | ローカルインポート         | LocalImportStrategy + FileSystemAdapter   | 要検証     |
| FR-5 | Gistエクスポート           | GistExportStrategy + GitHubClient         | 要検証     |
| FR-6 | ローカルエクスポート       | LocalExportStrategy + FileSystemAdapter   | 要検証     |
| FR-7 | インポート前スキル検証     | SkillValidator.validateImport()           | 要検証     |
| FR-8 | インポートソース検証       | 各Strategyのvalidateメソッド              | 要検証     |

#### 検証ポイント

各FRについて以下を確認する:

1. **入力型**: Phase 1で定義したShareTarget型のフィールドが、Phase 2のバリデーション関数で全てチェックされているか
2. **出力型**: Phase 1で定義したImportResult/ExportResult型の全フィールドが、Phase 2の設計で生成されるか
3. **異常系**: Phase 1で列挙した異常系（404、認証エラー、タイムアウト、パストラバーサル）が、Phase 2のエラーハンドリングでカバーされているか
4. **IPCチャネル**: 各FRに対応するIPCチャネルが設計されており、ハンドラのバリデーションが完備しているか

### Step 2: NFRカバレッジ検証

| NFR   | 要件名             | 設計カバー対象                                                                     | カバー状況 |
| ----- | ------------------ | ---------------------------------------------------------------------------------- | ---------- |
| NFR-1 | セキュリティ       | validateIpcSender, validateShareTarget, パストラバーサル検出, HTTPS強制, PAT暗号化 | 要検証     |
| NFR-2 | パフォーマンス     | 並列APIリクエスト（最大5）、ストリーミングダウンロード、プログレスイベント         | 要検証     |
| NFR-3 | エラーハンドリング | Result\<T,E\>パターン、エラーカテゴリ分類、リトライ設計                            | 要検証     |
| NFR-4 | テスタビリティ     | Constructor Injection 4依存、Setter Injection 1依存、インターフェース経由DI        | 要検証     |

#### 検証ポイント

1. **NFR-1 セキュリティ**:
   - 全3チャネルのハンドラに `validateIpcSender()` が設計されているか
   - `validateShareTarget()` でP42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）が全文字列フィールドに適用されているか
   - `localPath` のパストラバーサル検出が `..` セグメント検出だけでなくシンボリックリンク解決後の検証も含むか
   - URL入力のHTTPS強制が `validateShareTarget()` のurl typeケースに含まれているか
   - PATがMain Processの暗号化ストレージにのみ保存され、Rendererに送信されない設計か

2. **NFR-2 パフォーマンス**:
   - GitHubImportStrategy で並列APIリクエスト（`Promise.all` with concurrency limit）が設計されているか
   - 大容量スキル（10MB超）のストリーミングダウンロードがUrlImportStrategyで考慮されているか
   - ImportProgress/ExportProgress型がPhase 2で定義され、Main → Rendererのイベント送信パスが設計されているか

3. **NFR-3 エラーハンドリング**:
   - SkillShareManagerの全公開メソッドが `Result<T, SkillShareError>` を返却する設計か
   - SkillShareError のエラーコード範囲（1000-5999）がPhase 1の定義と一致しているか
   - External Service Error（3000-3999）のリトライ設計（最大3回、指数バックオフ）がGitHubClientに含まれているか

4. **NFR-4 テスタビリティ**:
   - Constructor Injection の4依存（GitHubClient, FileSystemAdapter, SkillValidator, SkillService）が全てインターフェース経由か
   - Setter Injection（setMainWindow）がP34対策として正しく設計されているか
   - テスト時のモック差し替えが可能な設計か

### Step 3: アーキテクチャ品質検証

#### 3.1 3プロセスモデル整合性

| チェック項目                                                         | 判定   |
| -------------------------------------------------------------------- | ------ |
| SkillShareManagerはMain Processに配置されているか                    | 要検証 |
| Rendererからの通信はPreload Bridge（safeInvoke）経由か               | 要検証 |
| contextBridge経由で公開されるAPIがPreload types.tsに定義されているか | 要検証 |
| GitHubClient（外部API呼び出し）はMain Processに配置されているか      | 要検証 |
| PATはMain Processに留まり、Rendererに送信されない設計か              | 要検証 |

#### 3.2 DI設計妥当性

| チェック項目                                                                        | 判定   |
| ----------------------------------------------------------------------------------- | ------ |
| Constructor Injection: 起動時に利用可能な4依存を注入する設計か                      | 要検証 |
| Setter Injection: BrowserWindow依存をsetMainWindow()で後注入する設計か（P34対策）   | 要検証 |
| SkillServiceへの依存追加時、既存テストへのモック追加影響を考慮しているか（P35対策） | 要検証 |
| 循環依存が発生しない依存グラフか                                                    | 要検証 |

**依存グラフの検証**:

```
SkillShareManager
  ├── GitHubClient (独立)
  ├── FileSystemAdapter (独立)
  ├── SkillValidator (独立)
  └── SkillService (既存、SkillShareManagerへの依存なし)

GitHubImportStrategy
  ├── GitHubClient
  └── FileSystemAdapter

GistExportStrategy
  └── GitHubClient
```

循環依存なし: SkillService → SkillShareManager の逆方向依存が存在しないことを確認する。

#### 3.3 Strategyパターン適用の妥当性

| チェック項目                                                                      | 判定   |
| --------------------------------------------------------------------------------- | ------ |
| ImportStrategy インターフェースが全インポートソースで共通メソッドを定義しているか | 要検証 |
| ExportStrategy インターフェースが全エクスポート先で共通メソッドを定義しているか   | 要検証 |
| 新しいソース追加時に既存コードを変更せず追加可能か（OCP）                         | 要検証 |
| ストラテジー選択がShareTarget.typeのdiscriminated unionで型安全に行われるか       | 要検証 |

### Step 4: セキュリティ設計検証

#### 4.1 P42対策（3段バリデーション）

| チェック対象フィールド        | 型チェック | 空文字列チェック | トリム空文字列チェック | 判定   |
| ----------------------------- | ---------- | ---------------- | ---------------------- | ------ |
| ShareTarget.repo (github)     | 要検証     | 要検証           | 要検証                 | 要検証 |
| ShareTarget.gistId (gist)     | 要検証     | 要検証           | 要検証                 | 要検証 |
| ShareTarget.url (url)         | 要検証     | 要検証           | 要検証                 | 要検証 |
| ShareTarget.localPath (local) | 要検証     | 要検証           | 要検証                 | 要検証 |
| export args.skillName         | 要検証     | 要検証           | 要検証                 | 要検証 |
| ShareTarget.branch (optional) | 要検証     | 要検証           | 要検証                 | 要検証 |
| ShareTarget.path (optional)   | 要検証     | 要検証           | 要検証                 | 要検証 |

#### 4.2 P44/P45対策（IPCインターフェース整合性）

| チェック項目                                                                   | 判定   |
| ------------------------------------------------------------------------------ | ------ |
| チャネル名がIPC_CHANNELS定数で定義されているか（ハードコード文字列禁止）       | 要検証 |
| Mainハンドラの引数型とPreload APIの呼び出し引数型が一致しているか              | 要検証 |
| 引数名がセマンティクスと一致しているか（skillName=名前, gistId=ID）            | 要検証 |
| 既存skill:importチャネルと新規skill:importFromSourceチャネルが分離されているか | 要検証 |

#### 4.3 パストラバーサル防止

| チェック項目                                                                | 判定   |
| --------------------------------------------------------------------------- | ------ |
| `..` セグメント検出がvalidateShareTargetに含まれているか                    | 要検証 |
| シンボリックリンク解決後のパス検証がFileSystemAdapterに含まれているか       | 要検証 |
| インポート先パス（~/.aiworkflow/skills/）の範囲外書き込みが防止されているか | 要検証 |
| エクスポート先パスの検証がLocalExportStrategyに含まれているか               | 要検証 |

#### 4.4 認証情報保護

| チェック項目                                                                                                                               | 判定   |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| PATはMain Process暗号化ストレージに保存される設計か                                                                                        | 要検証 |
| PATはRendererに送信されず、ステータスのみ返却する設計か                                                                                    | 要検証 |
| エラーメッセージにPATが含まれないよう sanitizeErrorMessage が適用されるか                                                                  | 要検証 |
| GitHubClient のOctokit初期化でトークンがMain Process内の暗号化ストレージから取得され、コンストラクタ引数またはSetter経由で注入されているか | 要検証 |

### Step 5: レビューゲート判定

#### 判定基準

| 判定              | 条件                                                     |
| ----------------- | -------------------------------------------------------- |
| PASS              | Step 1-4の全チェック項目がOK                             |
| MINOR             | 軽微な修正（命名改善、コメント追加）で対応可能な指摘のみ |
| MAJOR（要件問題） | FR/NFRのカバレッジ不足、受け入れ基準の未実現             |
| MAJOR（設計問題） | アーキテクチャ不整合、セキュリティ脆弱性、DI設計不備     |

#### 判定フロー

1. Step 1-4の全チェック項目を「OK」「NG」「WARNING」で評価する
2. NG項目が0件 → PASS
3. NG項目が1件以上かつ全てが軽微（命名・コメント） → MINOR
4. NG項目に要件カバレッジ不足が含まれる → MAJOR（要件問題）→ Phase 1差し戻し
5. NG項目にアーキテクチャ/セキュリティ不備が含まれる → MAJOR（設計問題）→ Phase 2差し戻し

#### 判定記録テンプレート

```markdown
## レビューゲート判定結果

| 項目           | 結果               |
| -------------- | ------------------ |
| 判定           | (PASS/MINOR/MAJOR) |
| 判定日         | YYYY-MM-DD         |
| レビュー実施者 | (記入)             |

### 指摘事項

| No  | カテゴリ | 重要度 | 内容 | 対応方針 | ステータス |
| --- | -------- | ------ | ---- | -------- | ---------- |
| 1   |          |        |      |          |            |

### MINOR指摘の処理

- MINOR判定の場合、全指摘を未タスク仕様書に変換してからPhase 4に進む
- 未タスク仕様書は `docs/30-workflows/skill-share/tasks/unassigned-task/` に配置する

### 差し戻し時の対応

- MAJOR（要件問題）→ Phase 1に戻り、該当FR/NFRを再定義する
- MAJOR（設計問題）→ Phase 2に戻り、該当設計を修正する
```

## 成果物

| 成果物           | 説明                                 | 配置先                                    |
| ---------------- | ------------------------------------ | ----------------------------------------- |
| 設計レビュー結果 | 全チェック項目の検証結果とゲート判定 | `outputs/phase-3/design-review-result.md` |

## 統合テスト連携

- レビュー結果で検出されたセキュリティ指摘は、Phase 4のテストケース設計に反映する
- P42/P44/P45対策の検証結果は、Phase 4でバリデーションテストの網羅性確認に使用する
- DI設計の検証結果は、Phase 4でモック構成の設計に使用する
- 既存機能との整合性検証結果は、Phase 4でリグレッションテストケースの設計に使用する

## 完了条件

- [ ] Step 1の要件カバレッジ検証マトリクスでFR-1〜FR-8の全8項目が「カバー済み」と確認されている
- [ ] Step 2のNFRカバレッジ検証でNFR-1〜NFR-4の全4項目が「カバー済み」と確認されている
- [ ] Step 3のアーキテクチャ品質検証で3プロセスモデル整合性・DI設計・Strategyパターンが全て「OK」と確認されている
- [ ] Step 4のセキュリティ設計検証でP42/P44/P45対策・パストラバーサル防止・認証保護が全て「OK」と確認されている
- [ ] Step 5のレビューゲート判定が実施され、判定結果が記録されている
- [ ] MINOR判定の場合、全指摘が未タスク仕様書に変換されている
- [ ] MAJOR判定の場合、差し戻し先Phaseと修正方針が記録されている
- [ ] 本Phase内の全タスクを100%実行完了
- [ ] artifacts.jsonが更新されている

## スキル100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 4: テスト作成

## 備考

- Phase 3はレビューゲートとして機能し、Phase 1-2の品質を保証する関門である。PASS判定が出るまでPhase 4には進めない
- レビュー時は既知の落とし穴（P34/P35/P42/P44/P45）の対策状況を重点的に確認する。これらは過去のTASK-9A/9Bで発生した実際の不具合パターンであり、TASK-9Fでの再発を防止する
- MINOR指摘は「機能影響なし」であっても未タスク仕様書への変換を省略しない（05-task-execution.mdの規定に従う）
- IPC契約チェックリスト（ipc-contract-checklist.md）のPhase 1-6を実施し、ハンドラ引数形式とPreload側呼び出し形式の一致を検証する
- 設計レビューでは「ShareTargetのdiscriminated unionがTypeScriptのnarrowingで正しく型推論されるか」を型レベルで検証する（実際のコードがなくても型定義の構造から判断可能）
