# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 12                                    |
| 機能名 | UT-06-005-A-hook-fallback-integration |
| 作成日 | 2026-03-17                            |

## 目的

PreToolUse Hook フォールバック統合の実装成果をドキュメントに記録し、システム仕様書と実装の整合性を保つ。新規追加した `handlePermissionCheck`、`sendPermissionRequestWithTimeout`、`PermissionTimeoutError` についてシステム仕様を更新する。

> **重要**: Phase 12 は漏れが最も発生しやすい Phase（P1〜P4, P25, P29, P57, P59 参照）。全タスクを**逐次確認**してから完了とすること。documentation-changelog.md は全 Step 完了後の**最終ステップ**で記録する（P4対策）。

## 実行タスク

- Task 12-1: 実装ガイド作成（Part 1: 概念説明 + Part 2: 技術詳細）
- Task 12-2: システムドキュメント更新（Step 1-A〜D + Step 2）
- Task 12-3: ドキュメント更新履歴作成（P4対策: 最終ステップで記録）
- Task 12-4: 未タスク検出レポート作成（0件でも必須）
- Task 12-5: スキルフィードバックレポート作成（改善点なしでも必須）

## 参照資料

| 資料名                    | パス                                                                                         | 説明                                    |
| ------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------- |
| Phase 1 受け入れ基準      | `outputs/phase-1/acceptance-criteria.md`                                                     | AC-001〜AC-007 の検証条件               |
| Phase 2 API 仕様          | `outputs/phase-2/api-specification.md`                                                       | 新規メソッドのインターフェース仕様      |
| Phase 5 実装成果物        | `outputs/phase-5/implementation-summary.md`                                                  | 実装差分と実装内容                      |
| Phase 6 テスト拡充        | `outputs/phase-6/coverage-report.md`                                                         | テスト拡充結果（追加カバレッジ）        |
| Phase 7 カバレッジ確認    | `outputs/phase-7/coverage-result.md`                                                         | カバレッジ履歴（基準値）                |
| Phase 8 リファクタリング  | `outputs/phase-8/refactoring-log.md`                                                         | 最終実装改善履歴                        |
| Phase 9 品質チェック      | `outputs/phase-9/quality-gate-result.md`                                                     | 品質判定（PASS/FAIL）                   |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                                                    | MINOR 指摘（あれば）                    |
| Phase 11 手動テスト結果   | `outputs/phase-11/manual-test-result.md`                                                     | 検証エビデンス                          |
| Permission フォールバック | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | abort/skip/retry の分岐ロジックと型定義 |
| セキュリティ要件          | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | fail-closed セキュリティ要件            |

### システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                                         | 内容                         |
| ---------------------- | -------------------------------------------------------------------------------------------- | ---------------------------- |
| Executor 詳細仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | 必須更新対象                 |
| セキュリティ仕様       | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | 任意更新対象                 |
| LOGS.md（aiworkflow）  | `.claude/skills/aiworkflow-requirements/LOGS.md`                                             | Step 1-A 更新対象            |
| LOGS.md（task-spec）   | `.claude/skills/task-specification-creator/LOGS.md`                                          | Step 1-A 更新対象（P1対策）  |
| SKILL.md（aiworkflow） | `.claude/skills/aiworkflow-requirements/SKILL.md`                                            | Step 1-A 更新対象（P29対策） |
| SKILL.md（task-spec）  | `.claude/skills/task-specification-creator/SKILL.md`                                         | Step 1-A 更新対象（P29対策） |

## 依存フェーズ

- Phase 10: `outputs/phase-10/final-review-result.md`（MINOR 未対応確認）
- Phase 11: `outputs/phase-11/manual-test-result.md`（受入れテスト結果）
- Phase 2: `outputs/phase-2/api-specification.md`（仕様差分）
- Phase 1: `outputs/phase-1/acceptance-criteria.md`（受け入れ基準）
- Phase 5: `outputs/phase-5/implementation-summary.md`（実装差分）
- Phase 6: `outputs/phase-6/coverage-report.md`（テスト拡充）
- Phase 7: `outputs/phase-7/coverage-result.md`（カバレッジ履歴）
- Phase 8: `outputs/phase-8/refactoring-log.md`（最終実装改善）
- Phase 9: `outputs/phase-9/quality-gate-result.md`（品質判定）

## 実行手順

---

### Task 12-1: 実装ガイド作成

#### Part 1: 中学生レベル概念説明（日常例え必須）

成果物: `outputs/phase-12/implementation-guide-part1.md`

**必須要素**:

- 「なぜ必要か」→「何をするか」の順序で説明
- 「たとえば」を最低1回含む日常的なアナロジー
- 中学生が読んで理解できるレベルの平易な言葉

**記載内容の例（執筆時に参考にすること）**:

```
なぜ必要か:
AIがパソコン上でツールを使おうとするとき、「本当にこの操作をしていいですか？」と
確認が必要な場面があります。たとえば、大事なファイルを削除するコマンドを実行しよう
としたとき、間違えて実行してしまっては取り返しがつきません。

何をするか:
この機能は「許可の返事が来なかったとき」や「許可が拒否されたとき」に、AIが安全に
止まれるようにする仕組みです。たとえば、30秒待っても返事がなければ自動的に処理を
中断します（タイムアウト）。
```

#### Part 2: 開発者向け技術詳細

成果物: `outputs/phase-12/implementation-guide-part2.md`

**記載内容**:

1. **新規追加クラス/メソッド**:

   | 名前                               | 種別             | 場所               | 説明                                |
   | ---------------------------------- | ---------------- | ------------------ | ----------------------------------- |
   | `PermissionTimeoutError`           | クラス           | `SkillExecutor.ts` | Permission タイムアウトエラー       |
   | `handlePermissionCheck`            | private メソッド | `SkillExecutor.ts` | Permission チェックのメインロジック |
   | `sendPermissionRequestWithTimeout` | private メソッド | `SkillExecutor.ts` | タイムアウト付き Permission 要求    |

2. **TypeScript 型定義**:

   ```typescript
   // PermissionTimeoutError
   export class PermissionTimeoutError extends Error {
     constructor(public readonly timeoutMs: number) {
       super(`Permission request timed out after ${timeoutMs}ms`);
       this.name = "PermissionTimeoutError";
     }
   }

   // handlePermissionCheck の戻り値型
   type PreToolUseResult =
     | { proceed: true }
     | { proceed: false; message: string };
   ```

3. **エラーハンドリング**:
   - `PermissionTimeoutError`: タイムアウト発生時、`executeAbortFlow("timeout")` を呼び出す
   - フォールバック例外: `executeAbortFlow("unknown")` で fail-closed（NFR-101）

4. **設定値**:
   - `permissionTimeoutMs`: デフォルト 30000ms（`this.config?.permissionTimeoutMs ?? 30000`）
   - `PERMISSION_MAX_RETRIES`: retry 上限（定数）

5. **既存コードへの影響**:
   - FR-001〜FR-003: 変更なし（Permission チェックは FR-003 の後に挿入）
   - `sendPermissionRequest`: ラッパー（`sendPermissionRequestWithTimeout`）を追加、既存メソッドに breaking change なし

---

### Task 12-2: システムドキュメント更新

> **P1/P25/P29 対策**: 4つのファイル（LOGS.md × 2 + SKILL.md × 2）を全て更新すること。片方の更新漏れが最も発生しやすい。

#### Step 1-A: タスク完了記録

**更新ファイル一覧（全て必須）**:

```bash
# 関連仕様書検索（Step 1-C 用）
grep -rn "UT-06-005" \
  .claude/skills/aiworkflow-requirements/references/ \
  .claude/skills/task-specification-creator/references/
```

1. **LOGS.md（aiworkflow-requirements）**: `.claude/skills/aiworkflow-requirements/LOGS.md`
   - タスク ID: `UT-06-005-A-HOOK-FALLBACK-INTEGRATION`
   - 完了日: 2026-03-17
   - 概要: PreToolUse Hook への processPermissionFallback 統合

2. **LOGS.md（task-specification-creator）**: `.claude/skills/task-specification-creator/LOGS.md` （P1/P25対策）
   - 同上の内容を記録

3. **SKILL.md（aiworkflow-requirements）**: `.claude/skills/aiworkflow-requirements/SKILL.md` （P29対策）
   - 変更履歴テーブルに追記

4. **SKILL.md（task-specification-creator）**: `.claude/skills/task-specification-creator/SKILL.md` （P29対策）
   - 変更履歴テーブルに追記

#### Step 1-B: 実装状況テーブル更新

該当する仕様書の実装ステータスを更新する:

- `interfaces-agent-sdk-executor-details.md`: `handlePermissionCheck` / `sendPermissionRequestWithTimeout` / `PermissionTimeoutError` のステータスを「実装済み」に更新

#### Step 1-C: 関連タスクテーブル更新

```bash
# 関連タスクの検索
grep -rn "UT-06-005" \
  .claude/skills/aiworkflow-requirements/references/ \
  .claude/skills/aiworkflow-requirements/
```

検出された仕様書の関連タスクテーブルに、`UT-06-005-A-HOOK-FALLBACK-INTEGRATION` の完了記録を追記する。

#### Step 1-D: topic-map.md 再生成（P2/P27対策）

> セクション更新（追加・削除・変更）があれば必ず再生成する。

```bash
cd .claude/skills/aiworkflow-requirements
node generate-index.js
```

実行後、`topic-map.md` の更新日時とインデックス内容を確認する。

#### SF-02: システム仕様書更新の2段階方式

| ステージ          | タイミング    | 内容                                        | 必須 |
| ----------------- | ------------- | ------------------------------------------- | ---- |
| Step 2A: 計画記録 | Task 2 開始時 | 更新予定ファイルと変更内容の計画を記録      | ✅   |
| Step 2B: 実更新   | Task 2 完了前 | 実際に仕様書を更新し planned wording を除去 | ✅   |

planned wording 残存確認コマンド（Step 2B 完了後に必ず実行）:

```bash
rg -n "仕様策定のみ|実行予定|保留として記録" \
  docs/30-workflows/UT-06-005-A-hook-fallback-integration/outputs/phase-12/ || echo "planned wording なし"
```

#### Step 2: システム仕様更新

**更新対象（必須）**: `interfaces-agent-sdk-executor-details.md`

新規追加した以下のメソッドとクラスを「Permission フォールバック統合」セクションとして追記する:

```markdown
## Permission フォールバック統合（UT-06-005-A）

### handlePermissionCheck

PreToolUse Hook 内で Permission チェックを行う private メソッド。

- 引数: `executionId: string`, `toolName: string`, `args: Record<string, unknown>`, `signal?: AbortSignal`
- 戻り値: `Promise<PreToolUseResult>`
- 挿入位置: FR-003（ツール実行開始通知）の後
- フォールバック: approved → continue, skip → `{ proceed: false }`, retry → ループ再実行, abort → throw

### sendPermissionRequestWithTimeout

タイムアウト付き Permission 要求を送信する private メソッド。

- 引数: `executionId: string`, `toolName: string`, `args: Record<string, unknown>`, `signal?: AbortSignal`
- 戻り値: `Promise<SkillPermissionResponse>`
- タイムアウト: `config.permissionTimeoutMs ?? 30000`ms で `PermissionTimeoutError` をスロー
- 実装: `Promise.race` + `AbortSignal` クリーンアップ

### PermissionTimeoutError

Permission 要求のタイムアウトエラークラス。

- プロパティ: `timeoutMs: number`
- `name`: `"PermissionTimeoutError"`
- 発生時: `executeAbortFlow("timeout")` が呼ばれる
```

**更新対象（任意）**: `security-skill-execution.md`

fail-closed パスが新たに追加されたことを記録する（記録すべき内容がある場合のみ）。

---

### Task 12-3: ドキュメント更新履歴作成

> **P4/P51対策**: 全 Step 完了後に記録する。実行前に「完了」と書かない。

成果物: `outputs/phase-12/documentation-changelog.md`

**記載内容（Task 12-2 の全 Step 完了後に記録）**:

```markdown
# ドキュメント更新履歴

## タスク: UT-06-005-A-HOOK-FALLBACK-INTEGRATION

## 更新日: 2026-03-17

### Step 1-A: タスク完了記録

- LOGS.md（aiworkflow-requirements）: 更新済み
- LOGS.md（task-specification-creator）: 更新済み（P1/P25対策）
- SKILL.md（aiworkflow-requirements）: 更新済み（P29対策）
- SKILL.md（task-specification-creator）: 更新済み（P29対策）

### Step 1-B: 実装状況テーブル更新

- interfaces-agent-sdk-executor-details.md: handlePermissionCheck/sendPermissionRequestWithTimeout/PermissionTimeoutError を実装済みに更新

### Step 1-C: 関連タスクテーブル更新

- 検索結果: [検出ファイル一覧を記載]
- 更新ファイル: [更新したファイルを記載]

### Step 1-D: topic-map.md 再生成

- 実行コマンド: node generate-index.js
- 実行結果: [PASS/FAIL]

### Step 2: システム仕様更新

- interfaces-agent-sdk-executor-details.md: Permission フォールバック統合セクション追加
- security-skill-execution.md: [更新あり/なし]

### Task 12-4 検出件数

- 未タスク検出数: [N 件]
- 内訳: [各タスクの説明]

### Task 12-5 スキルフィードバック

- 改善候補件数: [N 件]
```

---

### Task 12-4: 未タスク検出

> **P3/P38対策**: 0件でも必ず出力する。3ステップ全完了が必須。

成果物: `outputs/phase-12/unassigned-task-detection.md`

**検出ソース**:

1. Phase 3（設計レビュー）の MINOR 追跡テーブル
2. Phase 10（最終レビュー）の MINOR 指摘
3. Phase 11（手動テスト）で発見した問題点
4. コードコメント（TODO/FIXME）

```bash
# コード内の TODO/FIXME 検索
grep -rn "TODO\|FIXME" apps/desktop/src/main/services/skill/SkillExecutor.ts
```

**0件の場合の記載例**:

```markdown
# 未タスク検出レポート

## タスク: UT-06-005-A-HOOK-FALLBACK-INTEGRATION

## 検出日: 2026-03-17

## 検出結果

検出件数: 0件

## 検出ソース確認記録

- Phase 3 MINOR 追跡テーブル: 指摘なし
- Phase 10 MINOR 指摘: なし（PASS判定）
- Phase 11 手動テスト: 問題なし
- SkillExecutor.ts の TODO/FIXME: なし

## 判定

未タスクなし。
```

**検出した場合の3ステップ（P3対策）**:

1. `docs/30-workflows/unassigned-task/` に指示書を作成
2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

```bash
# unassigned-task-detection.md の件数・ステータス更新
# .claude/skills/aiworkflow-requirements/references/unassigned-task-detection.md
```

再評価クローズした未タスクがある場合（P56対策）:

```bash
gh issue close <number> --comment "再評価クローズ: [理由]"
```

---

### Task 12-5: スキルフィードバックレポート

> **P28対策**: 改善点なしでも必ず出力する。

成果物: `outputs/phase-12/skill-feedback-report.md`

**記載内容**:

```markdown
# スキルフィードバックレポート

## タスク: UT-06-005-A-HOOK-FALLBACK-INTEGRATION

## 作成日: 2026-03-17

## ワークフロー改善候補

| 改善候補 | 詳細 | 優先度 |
| -------- | ---- | ------ |
| [なし]   | -    | -      |

## 新規パターン検出

このタスクで新たに発見した実装パターン:

| パターン名                                | 説明                                             | 既存の落とし穴番号        |
| ----------------------------------------- | ------------------------------------------------ | ------------------------- |
| Promise.race + AbortSignal クリーンアップ | タイムアウトとキャンセルを同時に処理するパターン | P13（タイマーテスト）関連 |

## 仕様書品質への提案

なし（今回の実装範囲では特に課題なし）。
```

---

## 成果物

| 成果物                       | パス                                                     | 説明                                                         |
| ---------------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1（概念説明）+Part 2（技術詳細）を 1 つに統合したガイド |
| 実装ガイド Part 1            | `outputs/phase-12/implementation-guide-part1.md`         | 中学生向け概念説明（日常例え必須）                           |
| 実装ガイド Part 2            | `outputs/phase-12/implementation-guide-part2.md`         | 開発者向け技術詳細                                           |
| システム仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`                | Step 1-A〜Step 2 の計画・実績記録（SF-02準拠）               |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 全 Step の実行結果記録（P4対策）                             |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも必須（P3対策）                                        |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 改善点なしでも必須（P28対策）                                |
| Task 12 準拠チェックリスト   | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 の準拠チェック（全タスク完了確認）           |

## Phase 10 MINOR 追跡テーブル

Phase 10 の最終レビューで MINOR 判定があった場合、以下のテーブルで追跡する。PASS 判定（MINOR なし）の場合は「なし」と記載する。

| MINOR 指摘 ID             | 内容 | 対応方針 | 対応状態 |
| ------------------------- | ---- | -------- | -------- |
| （Phase 10 結果より転記） | -    | -        | -        |

## 完了条件

- [ ] Task 12-1: 実装ガイド Part 1（日常例え含む）が作成されている
- [ ] Task 12-1: 実装ガイド Part 2（型定義・API・エラーハンドリング）が作成されている
- [ ] Task 12-2 Step 1-A: LOGS.md（aiworkflow-requirements）が更新されている（P1/P25対策）
- [ ] Task 12-2 Step 1-A: LOGS.md（task-specification-creator）が更新されている（P1/P25対策）
- [ ] Task 12-2 Step 1-A: SKILL.md（aiworkflow-requirements）が更新されている（P29対策）
- [ ] Task 12-2 Step 1-A: SKILL.md（task-specification-creator）が更新されている（P29対策）
- [ ] Task 12-2 Step 1-B: interfaces-agent-sdk-executor-details.md の実装状況テーブルが更新されている
- [ ] Task 12-2 Step 1-C: 関連タスクテーブルが更新されている（grep 検索実施済み）
- [ ] Task 12-2 Step 1-D: topic-map.md が再生成されている（P2/P27対策）
- [ ] Task 12-2 SF-02: spec-update-summary.md が作成されている（Step 2A 計画 + Step 2B 実更新）
- [ ] Task 12-2 SF-02: planned wording 残存確認コマンドが実行済みで "planned wording なし" であること
- [ ] Task 12-2 Step 2: interfaces-agent-sdk-executor-details.md に Permission フォールバック統合セクションが追加されている
- [ ] Task 12-3: documentation-changelog.md が全 Step 完了後に記録されている（P4対策）
- [ ] Task 12-4: unassigned-task-detection.md が作成されている（0件でも必須）
- [ ] Task 12-4: 検出した未タスクがある場合、3ステップ全完了（指示書 + task-workflow.md + リンク）
- [ ] Task 12-4: 未タスク配置先が `docs/30-workflows/unassigned-task/` であること（P38対策）
- [ ] Task 12-5: skill-feedback-report.md が作成されている（改善なしでも必須）
- [ ] phase12-task-spec-compliance-check.md が作成されている（Task 12-1〜12-5 準拠チェック）
- [ ] Phase 10 MINOR 追跡テーブルが記載されている（なしの場合も明記）
- [ ] artifacts.json の Phase 12 ステータスが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 10-11 成果物 + システム仕様）
2. Task 12-1: 実装ガイド Part 1 作成
3. Task 12-1: 実装ガイド Part 2 作成
4. Task 12-2 Step 1-A: LOGS.md 2ファイル更新
5. Task 12-2 Step 1-A: SKILL.md 2ファイル更新
6. Task 12-2 Step 1-B: 実装状況テーブル更新
7. Task 12-2 Step 1-C: 関連タスクテーブル更新（grep 検索）
8. Task 12-2 Step 1-D: topic-map.md 再生成
9. Task 12-2 Step 2: interfaces-agent-sdk-executor-details.md 更新
10. Task 12-3: documentation-changelog.md 作成（最終ステップ）
11. Task 12-4: 未タスク検出レポート作成
12. Task 12-5: スキルフィードバックレポート作成
13. artifacts.json 更新
14. 完了条件の検証

## タスク100%実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-06-005-A-hook-fallback-integration --phase 12
```

## 次のPhase

Phase 13: PR 作成
