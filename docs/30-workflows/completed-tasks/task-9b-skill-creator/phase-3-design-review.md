# Phase 3: 設計レビューゲート — skill-creator メタスキル実装

## メタ情報

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| Phase    | 3                                               |
| タスクID | TASK-9B                                         |
| 機能名   | task-9b-skill-creator                           |
| 作成日   | 2026-02-26                                      |
| 状態     | pending                                         |
| 前Phase  | [Phase 2: 設計](phase-2-design.md)              |
| 次Phase  | [Phase 4: テスト作成](phase-4-test-creation.md) |

## 目的

Phase 1（要件定義）とPhase 2（設計）の成果物を多角的に検証し、実装フェーズに進む妥当性を判定する。12コマンドの要件カバレッジ、Facadeパターン設計の適切さ、IPC契約の整合性、セキュリティ設計、Claude Agent SDK統合設計の妥当性をレビューする。

## 参照資料テーブル

| 資料名                    | パス                                                                                        | 用途                     |
| ------------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 1成果物             | `outputs/phase-1/requirements-definition.md`                                                | 要件定義                 |
| Phase 1受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`                                                    | AC定義                   |
| Phase 1スコープ定義       | `outputs/phase-1/scope-definition.md`                                                       | 実装範囲                 |
| Phase 2アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`                                                    | レイヤー構成・パターン   |
| Phase 2ドメインモデル     | `outputs/phase-2/domain-model.md`                                                           | エンティティ・型定義     |
| Phase 2 API設計           | `outputs/phase-2/api-design.md`                                                             | IPC API仕様              |
| Phase 1仕様書             | `phase-1-requirements.md`                                                                   | 機能要件・非機能要件     |
| Phase 2仕様書             | `phase-2-design.md`                                                                         | 設計仕様                 |
| Skillインターフェース     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill型定義・IPC契約     |
| Electronサービス設計      | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Facadeパターン・DI       |
| IPC セキュリティ          | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | 3段バリデーション        |
| 実装パターン              | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC/DI/テストパターン    |
| IPC契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | P23/P32/P42/P44統合      |
| 教訓集                    | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 過去の苦戦箇所と解決策   |
| エラーハンドリング        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラー分類・リトライ戦略 |

## 実行タスク

- Task 1: 要件カバレッジレビュー -- Phase 1の12コマンドFRがPhase 2設計で全てカバーされているか
- Task 2: アーキテクチャ設計レビュー -- Facadeパターン、サブコンポーネント分割、既存サービス連携の妥当性
- Task 3: IPC契約整合性レビュー -- Preload側とMain側の引数形式一致、チャンネル命名規則
- Task 4: セキュリティ設計レビュー -- P42/P44/P45対策、sender検証、パストラバーサル防止
- Task 5: Claude Agent SDK統合レビュー -- query() API、Hooks設計、Permission制御の適切さ
- Task 6: 型安全性レビュー -- any型不使用、strict:true準拠、共有型定義の配置
- Task 7: 総合判定 -- PASS/MINOR/MAJORの判定と次Phaseへの遷移条件確認

---

## 判定基準テーブル

| 判定              | 条件                                                                    | 対応                        |
| ----------------- | ----------------------------------------------------------------------- | --------------------------- |
| PASS              | 全レビュー観点で問題なし                                                | Phase 4（テスト作成）へ進む |
| MINOR             | 軽微な改善指摘あり（機能影響なし）                                      | 指摘対応後 Phase 4 へ進む   |
| MAJOR（要件問題） | 要件定義に重大な不備（FR/NFR不足、受け入れ基準の検証不能）              | Phase 1 へ戻り要件を再定義  |
| MAJOR（設計問題） | 設計に重大な不備（アーキテクチャ矛盾、IPC契約不整合、セキュリティ欠陥） | Phase 2 へ戻り設計を修正    |

---

## レビュー観点

### Task 1: 要件カバレッジレビュー

Phase 1で定義した12コマンド（FR-1〜FR-12）が、Phase 2の設計で全てカバーされているかを検証する。

| 検証項目 | 確認内容                                                            | 判定基準                            |
| -------- | ------------------------------------------------------------------- | ----------------------------------- |
| RC-01    | FR-1（chat）のIPCチャンネル `skill:create:chat` が設計に存在するか  | チャンネル定義テーブルに記載あり    |
| RC-02    | FR-2（api）のIPCチャンネル `skill:create:api` が設計に存在するか    | チャンネル定義テーブルに記載あり    |
| RC-03    | FR-3（improve）のIPCチャンネル `skill:improve` が設計に存在するか   | チャンネル定義テーブルに記載あり    |
| RC-04    | FR-4（execute）のIPCチャンネル `skill:execute` が設計に存在するか   | チャンネル定義テーブルに記載あり    |
| RC-05    | FR-5（use）のIPCチャンネル `skill:use` が設計に存在するか           | チャンネル定義テーブルに記載あり    |
| RC-06    | FR-6（chain）のIPCチャンネル `skill:chain` が設計に存在するか       | チャンネル定義テーブルに記載あり    |
| RC-07    | FR-7（fork）のIPCチャンネル `skill:fork` が設計に存在するか         | チャンネル定義テーブルに記載あり    |
| RC-08    | FR-8（share）のIPCチャンネル `skill:share` が設計に存在するか       | チャンネル定義テーブルに記載あり    |
| RC-09    | FR-9（schedule）のIPCチャンネル `skill:schedule` が設計に存在するか | チャンネル定義テーブルに記載あり    |
| RC-10    | FR-10（debug）のIPCチャンネル `skill:debug` が設計に存在するか      | チャンネル定義テーブルに記載あり    |
| RC-11    | FR-11（docs）のIPCチャンネル `skill:docs` が設計に存在するか        | チャンネル定義テーブルに記載あり    |
| RC-12    | FR-12（stats）のIPCチャンネル `skill:stats` が設計に存在するか      | チャンネル定義テーブルに記載あり    |
| RC-13    | 12コマンド全てに対応するSkillCreatorAPIメソッドが定義されているか   | Preload API設計に12メソッド記載あり |
| RC-14    | 12コマンド全てに対応するドメインモデル（型定義）が存在するか        | エンティティ定義に対応型あり        |
| RC-15    | 受け入れ基準（AC-01〜AC-22）が設計で実現可能な形になっているか      | 各ACのテスト可能性確認              |

### Task 2: Facade設計の妥当性レビュー

SkillCreatorServiceのFacadeパターンと5サブコンポーネント分割の適切さを検証する。

| 検証項目 | 確認内容                                                                            | 判定基準                                   |
| -------- | ----------------------------------------------------------------------------------- | ------------------------------------------ |
| FD-01    | SkillCreatorServiceが単一のエントリポイントとして12コマンドを統合しているか         | 全コマンドのメソッドがFacadeに定義あり     |
| FD-02    | 5サブコンポーネントの責務が明確に分離されているか                                   | 各コンポーネントの責務記述が重複していない |
| FD-03    | サブコンポーネント間の依存関係が適切か（循環依存がないか）                          | 依存方向が一方向であること                 |
| FD-04    | Setter Injection（P34対策）がBrowserWindow依存に適用されているか                    | 設計パターン適用テーブルに記載あり         |
| FD-05    | 既存サービス（SkillService, SkillExecutor, SkillFileManager）との責務境界が明確か   | 責務境界テーブルに重複なし                 |
| FD-06    | SkillCreatorServiceが「スキル生成・改善」に特化し、管理・実行を既存に委譲しているか | 責務の侵害がないこと                       |
| FD-07    | DI設計が既存テストへの影響を最小化しているか（P35対策）                             | 影響範囲が調査・記載されている             |

### Task 3: IPC契約整合性レビュー

Preload側とMain側のインターフェース一致を検証する（P44対策）。

| 検証項目 | 確認内容                                                                                | 判定基準                                                    |
| -------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| IC-01    | 12チャンネルの引数型がPreload API定義とIPCハンドラ設計で一致しているか                  | 型定義の完全一致                                            |
| IC-02    | 12チャンネルの戻り値型がPreload API定義とIPCハンドラ設計で一致しているか                | 型定義の完全一致                                            |
| IC-03    | チャンネル名が `IPC_CHANNELS` 定数として定義されているか（P27対策）                     | ハードコード文字列がないこと                                |
| IC-04    | 引数名がセマンティクスに一致しているか（P45対策）                                       | skillName/tasksDir/format/cronExpression の意味と名前が一致 |
| IC-05    | 既存チャンネル（skill:list, skill:import等）との名前衝突がないか                        | 既存チャンネル一覧との照合                                  |
| IC-06    | skill:execute チャンネルが既存の `skill:execute`（SkillExecutor用）と競合しないか       | チャンネル名のnamespace分離確認                             |
| IC-07    | 型定義が `packages/shared/src/types/skillCreator.ts` と `preload/types.ts` で同期するか | P32準拠の2箇所同時更新が設計に含まれる                      |

### Task 4: セキュリティ設計レビュー

P42/P44/P45対策およびセキュリティ要件（NFR-1-1〜NFR-1-7）の充足を検証する。

| 検証項目 | 確認内容                                                                    | 判定基準                                  |
| -------- | --------------------------------------------------------------------------- | ----------------------------------------- |
| SR-01    | 全12チャンネルに `validateIpcSender()` が適用される設計か（NFR-1-1）        | 全ハンドラの先頭に記載あり                |
| SR-02    | 全文字列引数にP42準拠3段バリデーションが適用される設計か（NFR-1-2）         | `validateStringArg()` の適用記載あり      |
| SR-03    | パス引数（tasksDir等）にパストラバーサル防止が適用される設計か（NFR-1-3）   | `validatePath()` の適用記載あり           |
| SR-04    | エラーレスポンスがサニタイズされる設計か（NFR-1-4）                         | `sanitizeErrorMessage()` 使用記載あり     |
| SR-05    | チャンネル名がハードコードでなく定数参照か（NFR-1-5, P27対策）              | `IPC_CHANNELS` 定数使用記載あり           |
| SR-06    | 認証情報が平文保存されない設計か（NFR-1-6）                                 | 環境変数/Keychain連携記載あり             |
| SR-07    | 認証情報がMain Process内に留まる設計か（NFR-1-7）                           | Rendererへの非公開が設計に記載あり        |
| SR-08    | Preload API設計で `safeInvoke` / `safeOn` パターンが使用されているか        | Preload API設計に記載あり                 |
| SR-09    | 危険コマンド検出（Bashツール使用時）が Hooks 設計に含まれているか           | preToolUse の `isDangerousCommand` 記載   |
| SR-10    | ファイル操作パス検証（Write/Editツール使用時）が Hooks 設計に含まれているか | preToolUse の `isWithinAllowedPaths` 記載 |

### Task 5: Claude Agent SDK統合レビュー

query() API、Hooks設計、Permission制御の適切さを検証する。

| 検証項目 | 確認内容                                                                     | 判定基準                                        |
| -------- | ---------------------------------------------------------------------------- | ----------------------------------------------- |
| SDK-01   | `query()` API呼び出しがスキル生成とタスク実行の2パターンで設計されているか   | 両パターンのコード設計が記載あり                |
| SDK-02   | `preToolUse` Hook が許可ツール検証・危険コマンド検出・パス検証を含むか       | 3種の検証ロジックが記載あり                     |
| SDK-03   | `postToolUse` Hook が成果物記録・エラー検出を含むか                          | 2種のロジックが記載あり                         |
| SDK-04   | PermissionMode が使用場面ごとに規定どおり使い分けられているか                | 4パターンの使い分けテーブルあり                 |
| SDK-05   | `maxTurns` の設定値が適切か（スキル生成: 30、タスク実行: 50）                | タイムアウト・コスト観点で妥当                  |
| SDK-06   | SDK呼び出し時のエラーハンドリング（タイムアウト、API障害）が設計されているか | エラー分類（3000-3999: External Service）に対応 |
| SDK-07   | カスタム `declare module` が不要であることが確認されているか（P36対策）      | SDK実型を使用する設計であること                 |

### Task 6: 型安全性レビュー

TypeScript型安全に関する設計を検証する。

| 検証項目 | 確認内容                                                                              | 判定基準                             |
| -------- | ------------------------------------------------------------------------------------- | ------------------------------------ |
| TS-01    | 全エンティティ（SkillSpec, TaskSpec等）がTypeScriptインターフェースで定義されているか | ドメインモデルに型定義あり           |
| TS-02    | `any` 型が使用されていないか（NFR-2-2）                                               | 型定義に `any` が含まれないこと      |
| TS-03    | 共有型が `packages/shared/src/types/skillCreator.ts` に配置される設計か（NFR-2-4）    | 型定義配置先が明記あり               |
| TS-04    | IPC引数名が値のセマンティクスと一致しているか（P45対策, NFR-2-3）                     | IC-04と同一検証                      |
| TS-05    | ユニオン型の網羅に `Record<EnumType, Config>` が使用されているか                      | TaskStatus, TaskPriority等で適用     |
| TS-06    | 型アサーション（`as`）がバリデーション回避目的で使用されていないか                    | 設計にアサーション使用箇所がないこと |

---

## 統合テスト連携【必須】

| 連携カテゴリ       | レビュー観点                                                                     |
| ------------------ | -------------------------------------------------------------------------------- |
| API設計            | 12チャンネルのリクエスト/レスポンス型がPreload API定義と一致しているか           |
| データフロー       | Renderer → IPC → SkillCreatorService → FileSystem/SDK の全経路が設計されているか |
| エラーハンドリング | Service層のエラーがIPC層でサニタイズされてRendererに返される設計か               |
| 認証連携           | 外部API連携スキル生成時の認証情報がMain Process内で完結する設計か                |
| 既存サービス連携   | SkillService/SkillExecutor/SkillFileManagerとの連携ポイントが明確か              |
| スキルスキャン     | 生成後のスキルがSkillScannerで検出・パース可能な形式で出力される設計か           |

---

## 多角的チェック観点テーブル

| チェック観点       | 確認項目                                                                     |
| ------------------ | ---------------------------------------------------------------------------- |
| セキュリティ       | P42準拠3段バリデーション、IPC sender検証、パストラバーサル防止、認証情報保護 |
| アーキテクチャ     | Facadeパターン、Setter Injection（P34）、レイヤー依存方向の厳守              |
| API設計            | IPC引数形式の一貫性（P44対策）、引数命名のセマンティクス一致（P45対策）      |
| エラーハンドリング | Result<T, E>パターン、エラーカテゴリ分類（1000-5999）、サニタイズ            |
| 型安全             | strict: true、any禁止、共有型定義、型アサーション回避                        |
| テスタビリティ     | DI設計、モック可能なインターフェース、テスト間状態非共有（P9対策）           |
| SDK統合            | query() API、Hooks、Permission制御がSDK仕様に準拠しているか                  |

## Electronデスクトップアプリ観点テーブル

| プロセス           | レビュー観点                                                                 |
| ------------------ | ---------------------------------------------------------------------------- |
| Renderer           | `/skill-creator` コマンドルーティング設計の妥当性、ChatPanel統合可能性       |
| Main Process       | SkillCreatorService Facade設計、5サブコンポーネント構成の妥当性              |
| IPC通信            | 12チャンネルの命名規則、既存チャンネルとの競合検証、バリデーション設計       |
| Preload            | SkillCreatorAPI定義、safeInvoke/safeOnパターン準拠、チャンネルホワイトリスト |
| ローカルストレージ | スキルファイル出力先、統計データ保存先、スケジュール設定永続化先の妥当性     |

---

## 既知の落とし穴（Pitfall）レビューチェックリスト

レビュー時に既知のPitfallが設計に反映されているかを個別に確認する。

| Pitfall ID | 内容                                           | 設計反映の確認観点                                               |
| ---------- | ---------------------------------------------- | ---------------------------------------------------------------- |
| P42        | 文字列引数の `.trim()` バリデーション漏れ      | `validateStringArg()` が全ハンドラに適用される設計か             |
| P44        | IPC ハンドラ引数形式とPreload側の不整合        | 引数型がMain側とPreload側で一致しているか                        |
| P45        | 引数命名の契約ドリフト（skillId vs skillName） | 引数名が実際の値のセマンティクスと一致しているか                 |
| P34        | 遅延初期化が必要な依存オブジェクトのDI         | Setter Injectionパターンが適用される設計か                       |
| P35        | DI追加時のテストモック大規模修正               | 既存テストへの影響範囲が調査・記載されているか                   |
| P5         | リスナー二重登録                               | unregister/register パターンが適用される設計か                   |
| P27        | Preload ハードコード文字列の見落とし           | 全チャンネル名が `IPC_CHANNELS` 定数参照か                       |
| P32        | 型定義の二箇所同時更新必須                     | packages/shared と preload/types.ts の同時更新が設計に含まれるか |
| P23        | API二重定義の型管理複雑性                      | 型定義ファイルの管理方針が明記されているか                       |
| P36        | カスタム declare module と SDK 実型の共存問題  | カスタム .d.ts を使用しない設計か（SDK実型参照）                 |

---

## サブタスク管理セクション

Phase実行開始時に、以下のサブタスクを管理すること:

1. Phase 1成果物の確認（要件定義書、受け入れ基準、スコープ定義）
2. Phase 2成果物の確認（アーキテクチャ設計、ドメインモデル、API設計）
3. Task 1: 要件カバレッジレビュー（RC-01〜RC-15）の実施
4. Task 2: Facade設計の妥当性レビュー（FD-01〜FD-07）の実施
5. Task 3: IPC契約整合性レビュー（IC-01〜IC-07）の実施
6. Task 4: セキュリティ設計レビュー（SR-01〜SR-10）の実施
7. Task 5: Claude Agent SDK統合レビュー（SDK-01〜SDK-07）の実施
8. Task 6: 型安全性レビュー（TS-01〜TS-06）の実施
9. Pitfallレビューチェックリスト（P42/P44/P45/P34/P35/P5/P27/P32/P23/P36）の実施
10. Task 7: 総合判定（PASS/MINOR/MAJOR）
11. 設計レビュー結果の作成・配置

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## 成果物テーブル

| 成果物           | パス                                      | 内容                   |
| ---------------- | ----------------------------------------- | ---------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定結果・指摘事項一覧 |

### 設計レビュー結果の必須記載項目

| セクション     | 内容                                                 |
| -------------- | ---------------------------------------------------- |
| 総合判定       | PASS / MINOR / MAJOR（要件問題）/ MAJOR（設計問題）  |
| 要件カバレッジ | RC-01〜RC-15の各項目の判定結果（OK/NG）              |
| Facade設計     | FD-01〜FD-07の各項目の判定結果（OK/NG）              |
| IPC契約整合性  | IC-01〜IC-07の各項目の判定結果（OK/NG）              |
| セキュリティ   | SR-01〜SR-10の各項目の判定結果（OK/NG）              |
| SDK統合        | SDK-01〜SDK-07の各項目の判定結果（OK/NG）            |
| 型安全性       | TS-01〜TS-06の各項目の判定結果（OK/NG）              |
| Pitfall対策    | P42/P44/P45/P34/P35/P5/P27/P32/P23/P36の反映確認結果 |
| 指摘事項       | MINOR指摘のリスト（指摘内容、対応方針、対応先Phase） |
| 次Phase判定    | Phase 4進行可否の最終判断                            |

---

## 完了条件

- [ ] Phase 1成果物（要件定義書、受け入れ基準、スコープ定義）のレビューが完了している
- [ ] Phase 2成果物（アーキテクチャ設計、ドメインモデル、API設計）のレビューが完了している
- [ ] 要件カバレッジレビュー（RC-01〜RC-15）の全項目が判定されている
- [ ] Facade設計レビュー（FD-01〜FD-07）の全項目が判定されている
- [ ] IPC契約整合性レビュー（IC-01〜IC-07）の全項目が判定されている
- [ ] セキュリティ設計レビュー（SR-01〜SR-10）の全項目が判定されている
- [ ] Claude Agent SDK統合レビュー（SDK-01〜SDK-07）の全項目が判定されている
- [ ] 型安全性レビュー（TS-01〜TS-06）の全項目が判定されている
- [ ] Pitfallレビューチェックリスト（10項目）の全項目が確認されている
- [ ] 総合判定（PASS/MINOR/MAJOR）が決定されている
- [ ] 設計レビュー結果が `outputs/phase-3/design-review-result.md` に作成されている
- [ ] MINOR指摘がある場合、全指摘に対する対応方針が記載されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 1〜Task 7）を100%実行完了
- [ ] 設計レビュー結果が `outputs/phase-3/` に生成されている
- [ ] artifacts.json の phase-3 ステータスが更新されている
- [ ] 判定がMINORの場合、MINOR指摘が未タスク仕様書に変換されている（省略不可）

## 検証コマンド

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-9b-skill-creator --phase 3
```

---

## 次のPhase

Phase 4: テスト作成（`phase-4-test-creation.md`）

**遷移条件**:

- PASS判定: 即座にPhase 4へ進む
- MINOR判定: MINOR指摘を未タスク仕様書に変換した上でPhase 4へ進む
- MAJOR判定（要件問題）: Phase 1へ戻り要件を再定義
- MAJOR判定（設計問題）: Phase 2へ戻り設計を修正
