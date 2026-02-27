# Phase 10: 最終レビューゲート - TASK-9F スキル共有・インポート機能

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase番号  | 10                                         |
| Phase名    | 最終レビューゲート                         |
| 目的       | 実装完了後、全体的な品質・整合性を検証する |
| 前提Phase  | Phase 9 (品質検証)                         |
| 後続Phase  | Phase 11 (手動テスト)                      |
| ステータス | 未実施                                     |
| 作成日     | 2026-02-27                                 |
| 機能名     | skill-share                                |

---

## 目的

実装完了後、全体的な品質・整合性を検証する。
Phase 3 の設計レビューと同様に、多角的観点からレビューを実施し、ゲート判定を行う。
Phase 1 の要件、Phase 2 の設計、Phase 5 の実装、Phase 7 のカバレッジ、Phase 9 の品質検証結果を横断的に検証する。

---

## 判定基準

| 判定     | 条件             | 対応                                                      |
| -------- | ---------------- | --------------------------------------------------------- |
| PASS     | 全観点で問題なし | Phase 11へ進行                                            |
| MINOR    | 軽微な指摘あり   | 全指摘を未タスク仕様書に変換後 Phase 11へ進行（省略不可） |
| MAJOR    | 重大な問題あり   | 影響範囲に応じて Phase 1-5 へ戻る                         |
| CRITICAL | 致命的な問題あり | Phase 1 へ戻り要件を再確認                                |

> **MINOR指摘の取り扱い**: MINOR指摘は「機能影響なし」であっても全件を未タスク仕様書に変換する。省略不可。

---

## 実行タスク

### タスク1: 要件充足確認

**目的**: Phase 1 で定義した全機能要件（FR）・非機能要件（NFR）が実装されているかを確認する

**チェック項目**:

#### 機能要件（FR）

| 要件ID       | 内容                                             | 状態  | 備考 |
| ------------ | ------------------------------------------------ | ----- | ---- |
| FR-SHARE-001 | GitHubリポジトリからスキルをインポートできる     | OK/NG |      |
| FR-SHARE-002 | Gistからスキルをインポートできる                 | OK/NG |      |
| FR-SHARE-003 | URLからスキルをインポートできる                  | OK/NG |      |
| FR-SHARE-004 | ローカルディレクトリからスキルをインポートできる | OK/NG |      |
| FR-SHARE-005 | Gistへスキルをエクスポートできる                 | OK/NG |      |
| FR-SHARE-006 | ローカルディレクトリへスキルをエクスポートできる | OK/NG |      |
| FR-SHARE-007 | インポートソースのバリデーションができる         | OK/NG |      |
| FR-SHARE-008 | エクスポート後に共有URLが取得できる（Gist）      | OK/NG |      |

#### 非機能要件（NFR）

| 要件ID        | 内容                                          | 状態  | 備考 |
| ------------- | --------------------------------------------- | ----- | ---- |
| NFR-SHARE-001 | P42準拠3段バリデーション適用済み              | OK/NG |      |
| NFR-SHARE-002 | パストラバーサル防止実装済み                  | OK/NG |      |
| NFR-SHARE-003 | Sender検証（validateIpcSender）実装済み       | OK/NG |      |
| NFR-SHARE-004 | エラーメッセージに内部情報が含まれない        | OK/NG |      |
| NFR-SHARE-005 | GitHub API rate limit のリトライ対応実装済み  | OK/NG |      |
| NFR-SHARE-006 | スキルサイズ制限（10MB）のバリデーション実装  | OK/NG |      |
| NFR-SHARE-007 | インポート先が `~/.aiworkflow/skills/` に統一 | OK/NG |      |

### タスク2: 設計整合性確認

**目的**: Phase 2 の設計どおりに実装されているかを確認する

**チェック項目**:

- [ ] SkillShareManager のクラス設計が Phase 2 の設計書と一致
- [ ] DI依存（SkillService, AuthKeyService）が設計どおりに注入されている
- [ ] IPCチャネル（skill:importFromSource, skill:export, skill:validateSource）の引数・戻り値が設計と一致
- [ ] ShareTarget ユニオン型の判別方式が設計どおり
- [ ] Date型のIPCシリアライズが ISO 8601 文字列で統一されている

### タスク3: IPC契約検証

**目的**: IPC契約の整合性を最終確認する（P44/P45/P32対策）

#### 3-1. ハンドラ引数形式とPreload呼び出し形式の一致（P44対策）

| チャネル                 | ハンドラ引数形式         | Preload呼び出し形式          | 一致 |
| ------------------------ | ------------------------ | ---------------------------- | ---- |
| `skill:importFromSource` | `source: ShareTarget`    | `safeInvoke(ch, source)`     | -    |
| `skill:export`           | `skillName, destination` | `safeInvoke(ch, name, dest)` | -    |
| `skill:validateSource`   | `source: ShareTarget`    | `safeInvoke(ch, source)`     | -    |

#### 3-2. 引数名のセマンティクス一致（P45対策）

| レイヤー | 引数名      | 実際の値                 | 一致 |
| -------- | ----------- | ------------------------ | ---- |
| ハンドラ | `source`    | ShareTarget オブジェクト | -    |
| ハンドラ | `skillName` | スキル名称（文字列）     | -    |
| Preload  | `source`    | ShareTarget オブジェクト | -    |
| Preload  | `skillName` | スキル名称（文字列）     | -    |
| Service  | `source`    | ShareTarget オブジェクト | -    |
| Service  | `skillName` | スキル名称（文字列）     | -    |

#### 3-3. 型定義の二箇所同時更新確認（P32対策）

| 型定義ファイル                             | ShareTarget | ImportResult | ExportResult |
| ------------------------------------------ | ----------- | ------------ | ------------ |
| `packages/shared/src/types/skill-share.ts` | -           | -            | -            |
| `apps/desktop/src/preload/types.ts`        | -           | -            | -            |

- [ ] 両ファイルの型定義が完全に一致している
- [ ] `packages/shared/src/types/index.ts` で share.ts が re-export されている

### タスク4: コードレビュー

**目的**: コード品質の最終確認

**チェック項目**:

- [ ] SRP（単一責務）違反がない: SkillShareManager の各メソッドが単一の責務を持つ
- [ ] DIP（依存性逆転）の確認: Octokit 等の外部依存が抽象に依存している
- [ ] 命名規約の統一: P45準拠（セマンティクスに合致する引数名）
- [ ] 未使用 import / 変数が存在しない
- [ ] `any` 型が使用されていない
- [ ] `@ts-ignore` / `@ts-expect-error` が使用されていない（使用する場合は理由コメント必須）
- [ ] エラーハンドリングが Result<T, E> パターンに統一されている
- [ ] Magic number が定数化されている

### タスク5: テストカバレッジ最終確認

**目的**: Phase 7 で確認したカバレッジ基準を最終確認する

**コマンド**:

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/services/skill/SkillShareManager.ts
```

**基準**:

| 指標     | 最低基準 | 推奨基準 | 結果 | 判定 |
| -------- | -------- | -------- | ---- | ---- |
| Line     | 80%      | 90%      | -    | -    |
| Branch   | 60%      | 70%      | -    | -    |
| Function | 80%      | 90%      | -    | -    |

### タスク6: セキュリティ最終レビュー

**目的**: セキュリティ要件の最終確認

**チェック項目**:

- [ ] パストラバーサル防止: `source.localPath` が許可ディレクトリ配下であることを検証するロジックが存在
- [ ] 認証トークン非露出: PAT/OAuth トークンがログ・エラーメッセージ・Renderer側に送信されていない
- [ ] エラーメッセージのサニタイズ: 内部ファイルパス・スタックトレースがRenderer側に送信されていない
- [ ] チャネル名がホワイトリスト管理（`IPC_CHANNELS` 定数）で参照されている
- [ ] ハードコード文字列でチャネル名が指定されていない（P27対策）

---

## 参照資料

| 参照資料           | パス                                                      | 内容          |
| ------------------ | --------------------------------------------------------- | ------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md`              | Phase 1成果物 |
| 設計書             | `outputs/phase-2/architecture-design.md`                  | Phase 2成果物 |
| 実装仕様書         | `docs/30-workflows/skill-share/phase-5-implementation.md` | Phase 5成果物 |
| 品質レポート       | `outputs/phase-9/quality-report.md`                       | Phase 9成果物 |
| カバレッジレポート | `outputs/phase-7/coverage-final-report.md`                | Phase 7成果物 |

---

## システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                                        | 内容                  |
| --------------------- | ------------------------------------------------------------------------------------------- | --------------------- |
| 全体アーキテクチャ    | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 設計準拠確認          |
| IPC仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPC契約検証           |
| 型定義                | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | 型定義検証            |
| セキュリティ          | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | セキュリティ検証      |
| Preloadセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | contextBridge公開境界 |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | Phase 1-6 IPC契約検証 |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DI/テストパターン     |
| 品質要件              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 非機能要件の最終判定  |

---

## 統合テスト連携【必須】

最終レビューで統合テスト結果を確認:

| レビュー項目  | 確認内容                                             |
| ------------- | ---------------------------------------------------- |
| 全テスト結果  | SkillShareManager + IPCハンドラ テスト全件成功       |
| カバレッジ    | Line 80%+ / Branch 60%+ / Function 80%+              |
| IPC契約検証   | ハンドラ ↔ Preload ↔ Renderer の引数・戻り値型が一致 |
| セキュリティ  | P42/P44/P45準拠チェック完了                          |
| shared ビルド | `pnpm --filter @repo/shared build` 成功              |

---

## 実行手順

### Step 1: 要件充足の検証

1. タスク1のFR/NFRチェック表を1件ずつ確認
2. Phase 1 の要件定義書（`outputs/phase-1/requirements-definition.md`）と照合
3. 未充足の要件がある場合は MAJOR 判定

### Step 2: 設計整合性の検証

1. タスク2のチェック項目を1件ずつ確認
2. Phase 2 の設計書（`outputs/phase-2/architecture-design.md`）と照合
3. 設計からの大きな逸脱がある場合は MAJOR 判定

### Step 3: IPC契約の最終検証

1. タスク3の3つのサブタスク（P44/P45/P32対策）を順に確認
2. 不整合がある場合は MAJOR 判定

### Step 4: コードレビュー

1. タスク4のチェック項目を1件ずつ確認
2. 軽微な指摘は MINOR、重大な指摘は MAJOR として記録

### Step 5: カバレッジ・セキュリティ最終確認

1. タスク5のカバレッジコマンドを実行
2. タスク6のセキュリティチェック項目を確認
3. 基準未達の場合は MAJOR 判定

### Step 6: ゲート判定

1. 全タスクの結果を集約
2. 判定基準テーブルに基づき PASS/MINOR/MAJOR/CRITICAL を決定
3. 結果を `outputs/phase-10/final-review-result.md` に記録

---

## 戻り先決定基準

| 問題の種類                       | 戻り先                      |
| -------------------------------- | --------------------------- |
| 要件の不足・不一致               | Phase 1（要件定義）         |
| 設計の不整合・アーキテクチャ問題 | Phase 2（設計）             |
| テスト設計の不備                 | Phase 4（テスト作成）       |
| 実装のバグ・機能不足             | Phase 5（実装）             |
| コード品質問題                   | Phase 8（リファクタリング） |

---

## 成果物

| 成果物           | パス                                      | 内容     |
| ---------------- | ----------------------------------------- | -------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 判定結果 |

---

## 最終レビュー結果テンプレート

```markdown
# 最終レビュー結果 - Phase 10: TASK-9F スキル共有・インポート機能

## 判定: {{PASS/MINOR/MAJOR/CRITICAL}}

## レビュー観点別結果

### 要件充足（タスク1）

#### 機能要件

| 要件ID       | 内容                 | 状態  | 備考 |
| ------------ | -------------------- | ----- | ---- |
| FR-SHARE-001 | GitHubインポート     | OK/NG |      |
| FR-SHARE-002 | Gistインポート       | OK/NG |      |
| FR-SHARE-003 | URLインポート        | OK/NG |      |
| FR-SHARE-004 | ローカルインポート   | OK/NG |      |
| FR-SHARE-005 | Gistエクスポート     | OK/NG |      |
| FR-SHARE-006 | ローカルエクスポート | OK/NG |      |
| FR-SHARE-007 | ソースバリデーション | OK/NG |      |
| FR-SHARE-008 | 共有URL取得          | OK/NG |      |

#### 非機能要件

| 要件ID        | 内容                     | 状態  | 備考 |
| ------------- | ------------------------ | ----- | ---- |
| NFR-SHARE-001 | P42バリデーション        | OK/NG |      |
| NFR-SHARE-002 | パストラバーサル防止     | OK/NG |      |
| NFR-SHARE-003 | Sender検証               | OK/NG |      |
| NFR-SHARE-004 | エラーサニタイズ         | OK/NG |      |
| NFR-SHARE-005 | Rate limitリトライ       | OK/NG |      |
| NFR-SHARE-006 | サイズ制限バリデーション | OK/NG |      |
| NFR-SHARE-007 | インポート先統一         | OK/NG |      |

### 設計整合性（タスク2）

| 項目                  | 状態  | 備考 |
| --------------------- | ----- | ---- |
| クラス設計の一致      | OK/NG |      |
| DI依存の正確さ        | OK/NG |      |
| IPCチャネル設計の一致 | OK/NG |      |
| ShareTarget 判別方式  | OK/NG |      |
| Date型シリアライズ    | OK/NG |      |

### IPC契約検証（タスク3）

| 項目                    | 状態  | 備考 |
| ----------------------- | ----- | ---- |
| P44: 引数形式一致       | OK/NG |      |
| P45: 命名セマンティクス | OK/NG |      |
| P32: 型定義二箇所更新   | OK/NG |      |

### コードレビュー（タスク4）

| 項目                | 状態  | 備考 |
| ------------------- | ----- | ---- |
| SRP遵守             | OK/NG |      |
| DIP遵守             | OK/NG |      |
| 命名規約統一        | OK/NG |      |
| 未使用import排除    | OK/NG |      |
| any型不使用         | OK/NG |      |
| Result<T,E>パターン | OK/NG |      |

### テストカバレッジ（タスク5）

| 指標     | 結果 | 最低基準 | 推奨基準 | 判定      |
| -------- | ---- | -------- | -------- | --------- |
| Line     | XX%  | 80%      | 90%      | PASS/FAIL |
| Branch   | XX%  | 60%      | 70%      | PASS/FAIL |
| Function | XX%  | 80%      | 90%      | PASS/FAIL |

### セキュリティ（タスク6）

| 項目                 | 状態  | 備考 |
| -------------------- | ----- | ---- |
| パストラバーサル防止 | OK/NG |      |
| 認証トークン非露出   | OK/NG |      |
| エラーサニタイズ     | OK/NG |      |
| チャネル名定数管理   | OK/NG |      |

## 指摘事項

### MINOR指摘（該当する場合）

| No  | 指摘内容 | 対象ファイル | 未タスク仕様書パス |
| --- | -------- | ------------ | ------------------ |
| 1   |          |              |                    |

### MAJOR/CRITICAL指摘（該当する場合）

| No  | 指摘内容 | 重大度 | 戻り先Phase |
| --- | -------- | ------ | ----------- |
| 1   |          |        |             |

## 次のアクション

Phase 11（手動テスト）へ進行 / 戻り先Phase
```

---

## 完了条件

- [ ] タスク1: 全FR/NFR要件の充足確認完了
- [ ] タスク2: 設計整合性の確認完了
- [ ] タスク3: IPC契約検証完了（P44/P45/P32対策）
- [ ] タスク4: コードレビュー完了
- [ ] タスク5: テストカバレッジ最終確認完了（Line 80%+, Branch 60%+, Function 80%+）
- [ ] タスク6: セキュリティ最終レビュー完了
- [ ] 判定結果が PASS/MINOR/MAJOR/CRITICAL のいずれかで記録されている
- [ ] MINOR指摘がある場合、全件が未タスク仕様書に変換されている
- [ ] 最終レビュー結果が `outputs/phase-10/final-review-result.md` に出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## スキル100%実行確認【必須】

```bash
# テスト最終実行
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillShareManager.test.ts
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.share.test.ts

# カバレッジ確認
cd apps/desktop && pnpm vitest run --coverage src/main/services/skill/SkillShareManager.ts

# Lint + 型チェック
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop typecheck

# shared ビルド
pnpm --filter @repo/shared build
```

Phase完了時に `artifacts.json` の Phase 10 ステータスを `completed` に更新すること。

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜6）を100%実行完了
- [ ] 各タスクの完了状態を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` の Phase 10 ステータスを更新

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-share/phase-11-manual-test.md`

---

## 備考

- MINOR指摘は「機能影響なし」であっても省略せずに全件を未タスク仕様書に変換する
- MAJOR判定の場合、戻り先決定基準テーブルに基づき適切なPhaseに戻る
- P44/P45対策として、IPC契約検証は「ハンドラ → Preload → Renderer」の3レイヤーを横断的に確認する
- P32対策として、型定義ファイル（shared + preload）の整合性を必ず確認する
- セキュリティレビューで認証トークンの取り扱いを重点確認する（SecureStore経由の暗号化保存）
