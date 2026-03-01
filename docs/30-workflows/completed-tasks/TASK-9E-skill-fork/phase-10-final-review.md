# Phase 10: 最終レビューゲート

## メタ情報

| 項目      | 値                               |
| --------- | -------------------------------- |
| Phase     | 10                               |
| タスクID  | TASK-9E-SKILL-FORK               |
| 機能名    | skill-fork（スキルフォーク機能） |
| 作成日    | 2026-02-28                       |
| 前提Phase | Phase 9（品質保証）              |
| 次Phase   | Phase 11（手動テスト検証）       |

## 目的

実装完了後、10 項目のレビュー観点で全体的な品質・整合性を最終検証し、Phase 11 への進行可否を判定する。

## 背景

Phase 9 で品質ゲートを通過した SkillForker の実装に対して、要件充足・コード品質・テスト品質・セキュリティ・IPC 契約整合性・ドキュメント整合性の多角的な観点から最終検証を行う。

## 判定基準

| 判定     | 条件             | 対応                                                   |
| -------- | ---------------- | ------------------------------------------------------ |
| PASS     | 全観点で問題なし | Phase 11 へ進行                                        |
| MINOR    | 軽微な指摘あり   | 未タスク仕様書に変換後 Phase 11 へ進行（**省略不可**） |
| MAJOR    | 重大な問題あり   | 影響範囲に応じて戻り先を決定（下記テーブル参照）       |
| CRITICAL | 致命的な問題あり | Phase 1 へ戻りユーザーと要件を再確認                   |

### MAJOR 判定時の戻り先決定基準

| 問題カテゴリ         | 戻り先  | 例                                   |
| -------------------- | ------- | ------------------------------------ |
| 要件の不備・認識齟齬 | Phase 1 | フォーク時のファイル選択要件が不明確 |
| 設計上の欠陥         | Phase 2 | SkillForker のクラス設計に構造的問題 |
| セキュリティ問題     | Phase 1 | パストラバーサル防止の設計不足       |
| 実装品質の問題       | Phase 5 | エラーハンドリングの根本的な欠如     |
| テスト不足           | Phase 4 | 重要な境界値テストの欠如             |

## 実行タスク

### タスク1: 10 項目レビュー実施

**目的**: 以下の 10 項目について網羅的にレビューする。

| #   | 観点               | 確認内容                                                                                        | 判定 |
| --- | ------------------ | ----------------------------------------------------------------------------------------------- | ---- |
| 1   | 機能完全性         | SkillForkOptions の全オプション（copyAgents/copyReferences/copyScripts/copyAssets）が機能するか | -    |
| 2   | コード品質         | TypeScript strict モード、any 型不使用、命名規約準拠                                            | -    |
| 3   | テスト品質         | カバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）、境界値テスト含む                   | -    |
| 4   | セキュリティ       | validateIpcSender、パストラバーサル防止、入力バリデーション                                     | -    |
| 5   | パフォーマンス     | ディレクトリコピーの効率性（大量ファイル時の応答速度）                                          | -    |
| 6   | ドキュメント整合性 | SkillForkOptions/SkillForkResult/SkillForkMetadata 型定義とコードの完全一致                     | -    |
| 7   | エラーハンドリング | ユーザーフレンドリーメッセージ、sanitizeError 適用、内部情報非漏洩                              | -    |
| 8   | 型安全性           | shared/preload/main 間の型整合（P32 準拠）                                                      | -    |
| 9   | データ整合性       | fork-metadata.json の内容（forkedFrom, forkedAt, originalDescription）が正確                    | -    |
| 10  | IPC 契約           | P44/P45 対策（引数形式一致、引数名セマンティクス一致）                                          | -    |

**確認コマンド**:

```bash
# 全テスト実行
cd apps/desktop && pnpm vitest run

# 型チェック
pnpm --filter @repo/shared exec tsc --noEmit
pnpm --filter @repo/desktop exec tsc --noEmit
```

**期待される成果物**: レビュー結果を各タスクの成果物に反映

### タスク2: セキュリティ詳細レビュー

**目的**: IPC ハンドラーのセキュリティを詳細にレビューする。

**セキュリティチェックマトリクス**:

| チャンネル   | validateIpcSender | パス検証 | sanitizeError | IPC_CHANNELS定数 | 3段バリデーション(P42) | 引数名整合(P45) | sender検証テスト |
| ------------ | ----------------- | -------- | ------------- | ---------------- | ---------------------- | --------------- | ---------------- |
| `skill:fork` | -                 | -        | -             | -                | -                      | -               | -                |

**パストラバーサル攻撃パターンのテスト有無確認**:

| #   | 攻撃パターン                             | テスト存在 | テスト結果 |
| --- | ---------------------------------------- | ---------- | ---------- |
| 1   | `../` を含むスキル名                     | -          | -          |
| 2   | 絶対パス（`/etc/passwd`）                | -          | -          |
| 3   | null バイト（`\0`）を含むスキル名        | -          | -          |
| 4   | シンボリックリンクによるディレクトリ脱出 | -          | -          |

**SkillForkOptions フィールドバリデーション確認**:

| フィールド         | 型        | バリデーション         | テスト有無 |
| ------------------ | --------- | ---------------------- | ---------- |
| sourceSkill        | string    | 3段バリデーション(P42) | -          |
| newName            | string    | 3段バリデーション(P42) | -          |
| description        | string?   | オプショナル           | -          |
| copyAgents         | boolean   | typeof チェック        | -          |
| copyReferences     | boolean   | typeof チェック        | -          |
| copyScripts        | boolean   | typeof チェック        | -          |
| copyAssets         | boolean   | typeof チェック        | -          |
| modifyAllowedTools | string[]? | Array.isArray チェック | -          |

**期待される成果物**: `outputs/phase-10/final-review-result.md`

### タスク3: 型安全性・IPC 契約レビュー

**目的**: IPC 契約の整合性と型安全性を詳細に検証する。

**IPC 契約確認テーブル**:

| 項目             | Main Process (skillHandlers.ts) | Preload (skill-api.ts) | Shared Types (skill-fork.ts) | 一致 |
| ---------------- | ------------------------------- | ---------------------- | ---------------------------- | ---- |
| チャンネル名     | -                               | -                      | -                            | -    |
| 引数型           | -                               | -                      | -                            | -    |
| 戻り値型         | -                               | -                      | -                            | -    |
| エラーレスポンス | -                               | -                      | -                            | -    |

**P44/P45 対策チェック**:

- [ ] ハンドラーの引数形式と Preload 側の呼び出し形式が一致（P44）
- [ ] 引数名のセマンティクスが実際に渡される値と一致（P45）
- [ ] `skill:fork` ハンドラーで SkillForkOptions オブジェクトを受け取る場合、Preload 側も同じオブジェクト構造を送信している

**期待される成果物**: `outputs/phase-10/final-review-result.md`

### タスク4: アーキテクチャ・ドキュメントレビュー

**目的**: アーキテクチャ原則の遵守とドキュメントの整合性を確認する。

**アーキテクチャ確認**:

- [ ] レイヤー依存方向: Renderer → Preload → Main の一方向依存
- [ ] SkillForker は Main Process のサービス層に配置されている
- [ ] 型定義は `packages/shared` に配置されている
- [ ] IPC チャンネル定数は `apps/desktop/src/preload/channels.ts` で一元管理

**ドキュメント整合性**:

- [ ] SkillForkOptions の型定義がコードと仕様書で一致
- [ ] SkillForkResult の型定義がコードと仕様書で一致
- [ ] SkillForkMetadata の型定義がコードと仕様書で一致
- [ ] IPC チャンネル名（`skill:fork`）が仕様書と実装で一致

**期待される成果物**: `outputs/phase-10/final-review-result.md`

### タスク5: 最終判定

**目的**: 全レビュー結果を集約し、最終判定を下す。

**判定プロセス**:

1. タスク1〜4の結果を集約
2. 10 項目レビューの全結果を確認
3. セキュリティ・IPC 契約レビュー結果を確認
4. 総合判定（PASS/MINOR/MAJOR/CRITICAL）を決定
5. MINOR 判定の場合、指摘事項を未タスク仕様書に変換（**省略不可** — 05-task-execution.md 準拠）

**期待される成果物**: `outputs/phase-10/final-review-result.md`

## 参照資料

| 資料名             | パス                                                                                              | 説明                    |
| ------------------ | ------------------------------------------------------------------------------------------------- | ----------------------- |
| Phase 1 成果物     | `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-1/requirements-definition.md` | 要件妥当性確認          |
| Phase 2 成果物     | `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-2/architecture-design.md`     | 設計妥当性確認          |
| Phase 5 成果物     | `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-5/implementation-summary.md`  | 実装妥当性確認          |
| Phase 9 品質結果   | `outputs/phase-9/quality-verification.md`                                                         | 品質ゲート結果          |
| SkillForker        | `apps/desktop/src/main/services/skill/SkillForker.ts`                                             | 実装コード              |
| テスト             | `apps/desktop/src/main/services/skill/__tests__/SkillForker.test.ts`                              | テストコード            |
| IPCハンドラー      | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                      | skill:fork ハンドラー   |
| Preload API        | `apps/desktop/src/preload/skill-api.ts`                                                           | fork API                |
| 型定義             | `packages/shared/src/types/skill-fork.ts`                                                         | 共有型定義              |
| セキュリティルール | `.claude/rules/04-electron-security.md`                                                           | IPC セキュリティ原則    |
| タスク実行ルール   | `.claude/rules/05-task-execution.md`                                                              | MINOR 判定時の対応      |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`                                                              | P32, P42, P44, P45 対策 |

## 統合テスト連携【必須】

最終レビューで統合テスト結果を確認:

| レビュー項目 | 確認内容                                 | 結果 |
| ------------ | ---------------------------------------- | ---- |
| 全テスト結果 | SkillForker + IPC ハンドラー全テスト成功 | -    |
| カバレッジ   | Line 80%+, Branch 60%+, Function 80%+    | -    |
| 型整合性     | shared/preload/main 間の型定義完全一致   | -    |
| セキュリティ | 全パストラバーサル攻撃パターンテスト成功 | -    |
| IPC 契約     | ハンドラー・Preload・型定義の完全一致    | -    |

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                                       |
| ------------------ | -------- | -------------------------------------------------------------- |
| セキュリティ       | ✅       | パストラバーサル攻撃4パターン、sender 検証、入力バリデーション |
| アーキテクチャ     | ✅       | レイヤー依存方向、SRP、型定義配置                              |
| API設計            | ✅       | IPC 契約整合性、P44/P45 対策                                   |
| エラーハンドリング | ✅       | sanitizeError、ユーザーフレンドリーメッセージ                  |
| パフォーマンス     | ✅       | ディレクトリコピーの効率性                                     |

**Electronデスクトップアプリ観点**:

| 層                   | 確認内容                                                |
| -------------------- | ------------------------------------------------------- |
| バックエンド（Main） | SkillForker のサービス設計・エラーハンドリング          |
| IPC通信              | skill:fork ハンドラーの契約整合性・セキュリティ         |
| Preload/セキュリティ | contextBridge API 公開、IPC_CHANNELS ホワイトリスト管理 |

## 成果物

| 成果物                 | パス                                      | 説明                                  |
| ---------------------- | ----------------------------------------- | ------------------------------------- |
| セキュリティレビュー   | `outputs/phase-10/final-review-result.md` | セキュリティ詳細レビュー              |
| 型・IPC契約レビュー    | `outputs/phase-10/final-review-result.md` | 型安全性・IPC契約レビュー             |
| アーキテクチャレビュー | `outputs/phase-10/final-review-result.md` | アーキテクチャ確認結果                |
| 最終レビュー結果       | `outputs/phase-10/final-review-result.md` | 最終判定（PASS/MINOR/MAJOR/CRITICAL） |

## 完了条件

- [ ] 10 項目レビュー全て実施完了
- [ ] セキュリティ詳細レビュー完了（パストラバーサル4パターン確認含む）
- [ ] 型安全性・IPC 契約レビュー完了（P44/P45 対策確認含む）
- [ ] アーキテクチャ・ドキュメントレビュー完了
- [ ] 最終判定（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] MINOR 判定の場合: 全指摘が未タスク仕様書に変換されている（**省略不可**）
- [ ] MAJOR 判定の場合: 戻り先 Phase が決定されている
- [ ] 4つのレビューレポートが `outputs/phase-10/` に配置されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: 10 項目レビュー実施
3. タスク2: セキュリティ詳細レビュー
4. タスク3: 型安全性・IPC 契約レビュー
5. タスク4: アーキテクチャ・ドキュメントレビュー
6. タスク5: 最終判定
7. 統合テスト連携の実施
8. 成果物の作成・配置
9. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 11: 手動テスト検証
