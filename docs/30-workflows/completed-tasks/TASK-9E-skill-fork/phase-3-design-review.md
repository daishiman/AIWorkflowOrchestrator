# Phase 3: 設計レビューゲート

## メタ情報

| 項目     | 値                 |
| -------- | ------------------ |
| Phase    | 3                  |
| 機能名   | TASK-9E-skill-fork |
| タスクID | TASK-9E            |
| 作成日   | 2026-02-28         |

## 目的

実装開始前に Phase 1（要件定義）と Phase 2（設計）の妥当性を多角的に検証し、設計品質をゲートする。

## 判定基準

| 判定              | 条件                   | 対応                        |
| ----------------- | ---------------------- | --------------------------- |
| PASS              | 全観点で問題なし       | Phase 4（テスト作成）へ進行 |
| MINOR             | 軽微な指摘あり         | 指摘対応後 Phase 4 へ進行   |
| MAJOR（要件問題） | 要件の欠落・矛盾が発見 | Phase 1 へ戻り要件を再定義  |
| MAJOR（設計問題） | 設計の重大な問題が発見 | Phase 2 へ戻り設計を修正    |

## 実行タスク

- Task 1: 要件カバレッジ検証（FR-1〜FR-7 の設計への1対1トレーサビリティ）
- Task 2: NFRカバレッジ検証（NFR-1〜NFR-4 の実現可能性確認）
- Task 3: アーキテクチャ品質検証（SRP、DI、レイヤー依存方向）
- Task 4: セキュリティ設計検証（P42/P44/P45 対策、パストラバーサル）
- Task 5: レビューゲート判定（PASS/MINOR/MAJOR）

## 参照資料

| 資料名           | パス                                                                           | 説明                       |
| ---------------- | ------------------------------------------------------------------------------ | -------------------------- |
| Phase 1 要件定義 | `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/phase-1-requirements.md` | 要件定義成果物             |
| Phase 2 設計     | `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/phase-2-design.md`       | 設計成果物                 |
| フォーク仕様     | `docs/30-workflows/skill-import-agent-system/specification.md` §19             | 正本仕様                   |
| 設計判断         | `docs/30-workflows/skill-import-agent-system/technical-decisions.md` §20       | 設計判断根拠               |
| IPC仕様          | `aiworkflow-requirements: api-ipc-agent.md`                                    | IPC チャネル仕様           |
| セキュリティIPC  | `aiworkflow-requirements: security-electron-ipc.md`                            | セキュリティバリデーション |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`                                           | P42/P44/P45 対策           |

## 実行手順

### Task 1: 要件カバレッジ検証

Phase 1 で定義した全機能要件（FR-1〜FR-7）が Phase 2 の設計でカバーされているかを1対1で検証する。

#### 要件トレーサビリティマトリクス

| FR   | 要件名                     | 設計カバー対象                                            | カバー状況 |
| ---- | -------------------------- | --------------------------------------------------------- | ---------- |
| FR-1 | スキルフォーク実行         | SkillForker.fork() メソッド                               | 要検証     |
| FR-2 | SKILL.md 名前・説明更新    | SkillForker.modifySkillMd() メソッド                      | 要検証     |
| FR-3 | サブディレクトリ選択コピー | SkillForker.copyDirectory() + SkillForkOptions のフラグ   | 要検証     |
| FR-4 | フォークメタデータ記録     | SkillForker.writeForkMetadata() + SkillForkMetadata 型    | 要検証     |
| FR-5 | 同名スキルチェック         | SkillForker.fork() 内の exists() チェック                 | 要検証     |
| FR-6 | IPC 経由フォーク           | skill:fork ハンドラ + safeInvoke + forkSkill API          | 要検証     |
| FR-7 | allowedTools カスタマイズ  | SkillForker.modifySkillMd() の allowed-tools 更新ロジック | 要検証     |

#### 検証ポイント

- [ ] 全 FR が設計内のクラス/メソッド/型に対応しているか
- [ ] 設計に含まれるが要件に紐づかない機能がないか（スコープクリープ検出）
- [ ] 各 FR の正常系・異常系が設計のエラー処理戦略でカバーされているか

### Task 2: NFR カバレッジ検証

Phase 1 の非機能要件が設計で実現可能かを検証する。

#### NFR 実現可能性マトリクス

| NFR   | 要件名                    | 設計での実現手段                                    | 実現可能性 |
| ----- | ------------------------- | --------------------------------------------------- | ---------- |
| NFR-1 | パフォーマンス（3秒以内） | fs.cp の recursive オプション使用、同期操作なし     | 要検証     |
| NFR-2 | ロールバック              | try/catch + rollback() で destPath を rm -rf        | 要検証     |
| NFR-3 | パストラバーサル防止      | validatePath() + path.resolve() + startsWith() 検証 | 要検証     |
| NFR-4 | IPC契約整合性             | P42準拠3段バリデーション + セマンティクス一致命名   | 要検証     |

#### 検証ポイント

- [ ] NFR-1: 100ファイル規模のスキルで fs.cp のパフォーマンスが3秒以内に収まるか
- [ ] NFR-2: ロールバック処理自体が失敗した場合の対処が設計されているか
- [ ] NFR-3: シンボリックリンクの解決が validatePath() に含まれているか
- [ ] NFR-4: 全文字列フィールドに3段バリデーションが適用されているか

### Task 3: アーキテクチャ品質検証

#### 3.1 単一責務原則（SRP）の検証

| クラス/モジュール | 責務                                 | SRP準拠 |
| ----------------- | ------------------------------------ | ------- |
| SkillForker       | スキルのファイルシステムレベルコピー | 要検証  |
| SkillService      | スキル管理全般のファサード           | 要検証  |
| skillHandlers.ts  | IPC ハンドラ登録・バリデーション     | 要検証  |
| skill-api.ts      | Preload API 定義                     | 要検証  |

- [ ] SkillForker がファイルシステム操作のみに責務を限定しているか（IPC やバリデーションを含んでいないか）
- [ ] IPC バリデーションが skillHandlers.ts 内に閉じているか（SkillForker に漏洩していないか）
- [ ] SkillService が SkillForker への単純な委譲で済んでいるか（余計なロジックを持っていないか）

#### 3.2 DI 設計の妥当性

| 依存関係                   | 注入方式              | 妥当性 |
| -------------------------- | --------------------- | ------ |
| SkillForker → skillsDir    | Constructor Injection | 要検証 |
| SkillService → SkillForker | Constructor Injection | 要検証 |

- [ ] SkillForker が BrowserWindow 等の外部リソースを必要としないことを確認（Constructor Injection で十分か）
- [ ] Setter Injection（P34 パターン）が不要であることの根拠が明確か

#### 3.3 レイヤー依存方向の検証

```
Renderer → Preload (skill-api.ts) → Main (skillHandlers.ts → SkillService → SkillForker) → FileSystem
```

- [ ] 依存方向が一方向（上位→下位）であることを確認
- [ ] SkillForker が Renderer や Preload に逆依存していないことを確認
- [ ] 型定義が packages/shared に配置され、両層から参照される構造か

#### 3.4 型定義の一貫性検証（P23/P32 準拠）

| 型                 | 配置先                                    | 用途               | 一貫性 |
| ------------------ | ----------------------------------------- | ------------------ | ------ |
| SkillForkOptions   | `packages/shared/src/types/skill-fork.ts` | リクエスト型       | 要検証 |
| SkillForkResult    | `packages/shared/src/types/skill-fork.ts` | レスポンスデータ型 | 要検証 |
| SkillForkMetadata  | `packages/shared/src/types/skill-fork.ts` | メタデータ型       | 要検証 |
| SkillAPI.forkSkill | `apps/desktop/src/preload/skill-api.ts`   | Preload API 型     | 要検証 |

- [ ] Shared 型定義と Preload 型定義で SkillForkOptions/SkillForkResult の構造が一致しているか
- [ ] Preload の types.ts で `import type` を使用して Shared 型を参照しているか（二重定義でないか）
- [ ] IPC ハンドラの引数名がセマンティクスと一致しているか（P45 対策）

### Task 4: セキュリティ設計検証

#### 4.1 P42 準拠3段バリデーション検証

| フィールド          | 型チェック            | 空文字列チェック | トリム空文字列チェック | P42準拠 |
| ------------------- | --------------------- | ---------------- | ---------------------- | ------- |
| sourceSkill         | `typeof === "string"` | `=== ""`         | `.trim() === ""`       | 要検証  |
| newName             | `typeof === "string"` | `=== ""`         | `.trim() === ""`       | 要検証  |
| description（任意） | `typeof === "string"` | `=== ""`         | `.trim() === ""`       | 要検証  |

- [ ] 全文字列フィールドに3段バリデーションが適用されているか
- [ ] boolean フィールド（copyAgents 等）に `typeof === "boolean"` チェックがあるか
- [ ] modifyAllowedTools に配列チェック + 要素ごとの文字列チェックがあるか

#### 4.2 P44 準拠インターフェース整合性検証

- [ ] IPC ハンドラの引数型（`args: unknown`）と Preload 側の呼び出し形式（`safeInvoke(channel, options)`）が一致しているか
- [ ] ハンドラが `SkillForkOptions` オブジェクトを丸ごと受け取る設計か（個別引数ではなく）
- [ ] Preload の `forkSkill(options)` がオブジェクトをそのまま渡す設計か

#### 4.3 P45 準拠命名整合性検証

- [ ] 引数名 `sourceSkill` が実際に渡される値（スキル名）のセマンティクスと一致しているか
- [ ] 引数名 `newName` が実際に渡される値（新スキル名）のセマンティクスと一致しているか
- [ ] SkillForker 内部メソッドの引数名が IPC 層と一貫しているか

#### 4.4 パストラバーサル防止検証

- [ ] validatePath() が `path.resolve()` 後の結果で `startsWith(skillsDir)` を検証しているか
- [ ] シンボリックリンク解決（`fs.realpath()`）が含まれているか
- [ ] `../`, `..\\`, null バイト等の攻撃ベクタが考慮されているか

#### 4.5 送信元検証

- [ ] validateIpcSender() が skill:fork ハンドラに適用されているか
- [ ] getAllowedWindows が mainWindow のみを返す設計か

#### 4.6 エラーサニタイズ

- [ ] sanitizeErrorMessage() で内部パス、スタックトレース、機密情報が削除されるか
- [ ] Renderer に返されるエラーメッセージにファイルシステムパスが含まれていないか

### Task 5: レビューゲート判定

Task 1〜4 の検証結果を総合し、以下の判定を行う:

#### 判定マトリクス

| 検証項目                   | 結果   | 影響度 |
| -------------------------- | ------ | ------ |
| FR カバレッジ（7/7）       | 要検証 | MAJOR  |
| NFR 実現可能性（4/4）      | 要検証 | MAJOR  |
| SRP 準拠                   | 要検証 | MINOR  |
| DI 設計妥当性              | 要検証 | MINOR  |
| レイヤー依存方向           | 要検証 | MAJOR  |
| 型定義一貫性（P23/P32）    | 要検証 | MAJOR  |
| P42 バリデーション         | 要検証 | MAJOR  |
| P44 インターフェース整合性 | 要検証 | MAJOR  |
| P45 命名整合性             | 要検証 | MINOR  |
| パストラバーサル防止       | 要検証 | MAJOR  |
| 送信元検証                 | 要検証 | MAJOR  |
| エラーサニタイズ           | 要検証 | MINOR  |

#### 判定ルール

- **PASS**: 全項目で問題なし
- **MINOR**: 軽微な指摘のみ（SRP 微修正、命名改善、ドキュメント補足）→ 指摘対応後 Phase 4 へ
- **MAJOR（要件）**: FR/NFR の欠落・矛盾を発見 → Phase 1 へ戻る
- **MAJOR（設計）**: セキュリティ（P42/P44/P45/パストラバーサル）、型整合性、レイヤー違反を発見 → Phase 2 へ戻る

## 統合テスト連携【必須】

統合テスト観点のレビューゲートを実施:

| レビュー観点       | 確認項目                                                   |
| ------------------ | ---------------------------------------------------------- |
| API設計            | skill:fork チャネルのリクエスト/レスポンス型定義の妥当性   |
| データフロー       | Renderer → Preload → Main → FileSystem のデータフロー設計  |
| エラーハンドリング | ロールバック戦略、エラーサニタイズ、IpcResult 形式の一貫性 |
| セキュリティ       | P42/P44/P45 準拠、パストラバーサル防止、送信元検証         |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断 | 仕様参照先                                          |
| ------------------ | -------- | --------------------------------------------------- |
| セキュリティ       | 適用     | `aiworkflow-requirements: security-electron-ipc.md` |
| アーキテクチャ     | 適用     | `aiworkflow-requirements: architecture-overview.md` |
| API設計            | 適用     | `aiworkflow-requirements: api-ipc-agent.md`         |
| エラーハンドリング | 適用     | `aiworkflow-requirements: error-handling.md`        |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断 | 仕様参照先                                          |
| -------------------- | -------- | --------------------------------------------------- |
| バックエンド（Main） | 適用     | `aiworkflow-requirements: architecture-overview.md` |
| IPC通信              | 適用     | `aiworkflow-requirements: api-ipc-agent.md`         |
| Preload/セキュリティ | 適用     | `aiworkflow-requirements: security-api-electron.md` |

## 成果物

| 成果物       | パス                                      | 説明               |
| ------------ | ----------------------------------------- | ------------------ |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定結果と指摘事項 |

## 完了条件

- [ ] Task 1: 要件カバレッジ検証が完了（FR-1〜FR-7 全件）
- [ ] Task 2: NFR カバレッジ検証が完了（NFR-1〜NFR-4 全件）
- [ ] Task 3: アーキテクチャ品質検証が完了（SRP、DI、レイヤー依存、型一貫性）
- [ ] Task 4: セキュリティ設計検証が完了（P42/P44/P45、パストラバーサル、送信元検証）
- [ ] Task 5: レビューゲート判定結果が記録されている
- [ ] 統合テスト観点のレビューが完了している
- [ ] 判定結果に応じた次 Phase への遷移が明確である
- [ ] **本Phase内のレビュー作業を100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 1, Phase 2 成果物、06-known-pitfalls.md）
2. Task 1: 要件カバレッジ検証（FR トレーサビリティマトリクス記入）
3. Task 2: NFR カバレッジ検証（実現可能性マトリクス記入）
4. Task 3: アーキテクチャ品質検証（SRP、DI、レイヤー、型一貫性）
5. Task 4: セキュリティ設計検証（P42/P44/P45、パストラバーサル）
6. Task 5: レビューゲート判定（結果記録）
7. 統合テスト連携の実施
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-9E-skill-fork --phase 3
```

## 次のPhase

Phase 4: テスト作成（TDD: Red）
