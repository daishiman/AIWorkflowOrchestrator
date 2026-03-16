# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| タスクID   | UT-06-005                           |
| Phase      | 11                                  |
| Phase名    | 手動テスト                          |
| 機能名     | UT-06-005-abort-skip-retry-fallback |
| カテゴリ   | 機能実装                            |
| ステータス | not_started                         |
| 作成日     | 2026-03-16                          |
| 前提Phase  | Phase 10（最終レビュー PASS）       |
| 後続Phase  | Phase 12                            |

## タスク種別判定（最初に確認）

| タスク種別                 | 判定条件                                   | 適用セクション                        | 本タスク |
| -------------------------- | ------------------------------------------ | ------------------------------------- | -------- |
| **設計タスク**             | タスク種別が「設計・仕様策定」、UI実装なし | 設計タスク専用セクション（SF-01）     | -        |
| **docs-only タスク**       | UI変更なし、ドキュメント・設定変更のみ     | docs-only task テンプレ               | -        |
| **バックエンド実装タスク** | Main Process ロジック実装、UI変更なし      | docs-only task テンプレ + IPC/API検証 | **該当** |
| **UI タスク**              | Renderer コンポーネントの追加・変更あり    | docs-only + UI task 追加要件          | -        |

**判定結果**: バックエンド実装タスク（Main Process / SkillExecutor のフォールバックロジック実装）。NON_VISUAL 判定（UI実装なし）。スクリーンショット不要。

## 目的

自動テストでは検証できない実環境動作を手動で確認する。SkillExecutor の Permission 拒否時における abort/skip/retry/timeout の各フォールバックフローが、Main Process 上で正しく動作することを検証する。

**NON_VISUAL 判定**: UI 変更なし（Main Process / バックエンドロジックのみ）のため、スクリーンショットは不要。IPC/API 変更の動作確認として DevTools エビデンス取得を推奨する。

## 実行タスク

- タスク1: abort フォールバックの動作確認（TC-01）
- タスク2: skip フォールバックの動作確認（TC-02）
- タスク3: retry フォールバックの動作確認（TC-03）
- タスク4: timeout フォールバックの動作確認（TC-04）
- タスク5: リグレッションテスト — 正常 Permission 承認フロー（TC-05）
- タスク6: 全テストスイート PASS の確認

### タスク1: abort フォールバックの動作確認（TC-01）

**目的**: Permission 拒否時に abort が発動し、スキル実行が即座に停止することを確認する

**手順**:

1. SkillExecutor の Permission 拒否時フローを確認する:
   ```bash
   rg -n "abort\|PermissionDenied" apps/desktop/src/main/services/skill/SkillExecutor.ts | head -30
   ```
2. 関連するユニットテストを実行し、abort フローが正しく動作することを検証する:
   ```bash
   cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/*permission*.test.ts --reporter=verbose 2>&1 | tail -40
   ```
3. DevTools でスキル実行を試行し、Permission 拒否→abort の IPC 通知が送信されることを確認する（CLI 環境制約がある場合はユニットテストで代替）
4. abort 後のリソースクリーンアップ（プロセス停止、一時ファイル削除等）が実施されることを確認する

**合否基準**:

- Permission 拒否時に abort が発動し、スキル実行が即座に停止すること
- abort 後にリソースリークが発生しないこと
- 関連ユニットテストが全て PASS

### タスク2: skip フォールバックの動作確認（TC-02）

**目的**: Permission 拒否時に skip オプションが有効な場合、拒否されたツール呼び出しをスキップして後続処理が継続することを確認する

**手順**:

1. skip フローの実装を確認する:
   ```bash
   rg -n "skip\|skipPermission\|canSkip" apps/desktop/src/main/services/skill/SkillExecutor.ts | head -20
   ```
2. 関連するユニットテストを実行する:
   ```bash
   cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/*fallback*.test.ts --reporter=verbose 2>&1 | tail -40
   ```
3. skip 後の後続ツール呼び出しが正常に実行されることを確認する
4. skip されたツール呼び出しの結果が適切にハンドリングされていることを確認する（空結果 or エラー結果）

**合否基準**:

- Permission 拒否（skip=true）時に後続処理が継続すること
- skip されたツール呼び出しの結果が適切にハンドリングされていること
- 関連ユニットテストが全て PASS

### タスク3: retry フォールバックの動作確認（TC-03）

**目的**: Permission 拒否時に retry が最大回数まで実行され、最大回数到達後に abort にフォールバックすることを確認する

**手順**:

1. retry フローの実装を確認する:
   ```bash
   rg -n "retry\|maxRetry\|retryCount" apps/desktop/src/main/services/skill/SkillExecutor.ts | head -20
   ```
2. 関連するユニットテストを実行する:
   ```bash
   cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/*retry*.test.ts --reporter=verbose 2>&1 | tail -40
   cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/*fallback*.test.ts --reporter=verbose 2>&1 | tail -40
   ```
3. retry 回数カウントが正しくインクリメントされることを確認する
4. 最大回数（3回）到達後に abort にフォールバックすることを確認する
5. retry 間隔（指数バックオフ等）が設計どおりであることを確認する

**合否基準**:

- Permission 拒否→3回 retry→abort のフローが正しく動作すること
- retry 回数が正しくカウントされていること
- 最大回数到達後に確実に abort にフォールバックすること
- 関連ユニットテストが全て PASS

### タスク4: timeout フォールバックの動作確認（TC-04）

**目的**: Permission 応答なし時にタイムアウトが発動し、abort にフォールバックすることを確認する

**手順**:

1. timeout フローの実装を確認する:
   ```bash
   rg -n "timeout\|PERMISSION_TIMEOUT\|timeoutMs" apps/desktop/src/main/services/skill/SkillExecutor.ts | head -20
   rg -n "timeout\|PERMISSION_TIMEOUT\|timeoutMs" apps/desktop/src/main/services/skill/PermissionResolver.ts | head -20
   ```
2. 関連するユニットテストを実行する（P13: タイマーテストは `advanceTimersByTime` で1ステップずつ進める）:
   ```bash
   cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/*permission*.test.ts --reporter=verbose 2>&1 | tail -40
   cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/*fallback*.test.ts --reporter=verbose 2>&1 | tail -40
   ```
3. タイムアウト値（5分 = 300,000ms）が設計どおりであることを確認する
4. タイムアウト後のリソースクリーンアップが実施されることを確認する

**合否基準**:

- Permission 応答なし→5分 timeout→abort のフローが正しく動作すること
- タイムアウト値が設計仕様と一致すること
- タイムアウト後にリソースリークが発生しないこと
- 関連ユニットテストが全て PASS

### タスク5: リグレッションテスト — 正常 Permission 承認フロー（TC-05）

**目的**: abort/skip/retry/timeout フォールバック実装後も、既存の正常 Permission 承認→スキル実行完了フローが正しく動作することを確認する

**手順**:

1. 正常フローの実装を確認する:
   ```bash
   rg -n "grant\|approve\|allow" apps/desktop/src/main/services/skill/SkillExecutor.ts | head -20
   ```
2. 既存の全テストを実行してリグレッションがないことを確認する:
   ```bash
   cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/ --reporter=verbose 2>&1 | tail -60
   ```
3. Permission 承認→ツール実行→結果返却の一連のフローが正常に動作することを確認する

**合否基準**:

- 正常 Permission 承認→スキル実行完了のフローが正しく動作すること
- 既存の全スキル関連テストが PASS（リグレッションなし）
- フォールバック実装がデフォルトの正常フローに影響していないこと

### タスク6: 全テストスイート PASS の確認

**目的**: フォールバック実装が他の機能に影響していないことを確認する

**手順**:

1. 全テストスイートを実行する:
   ```bash
   cd apps/desktop && pnpm vitest run --reporter=verbose 2>&1 | tail -60
   ```
2. 失敗テストがある場合は原因を調査し、Phase 9 の品質検証結果と照合する
3. テスト結果を記録する

**合否基準**:

- 全テストスイートが PASS
- 新規テスト含む全テストのカバレッジが基準を満たしていること

## ウォークスルーシナリオ発見事項リアルタイム分類欄

テスト実行中に発見した事項をリアルタイムで分類・記録する。

| #   | シナリオ | 発見事項 | 分類 | 対応方針 |
| --- | -------- | -------- | ---- | -------- |
| 1   | -        | -        | -    | -        |

**分類基準**:

| 分類        | 定義                                         | 対応                        |
| ----------- | -------------------------------------------- | --------------------------- |
| **Blocker** | テスト続行不可能な重大問題                   | 即座に Phase 5 へ差し戻し   |
| **Note**    | 動作に問題はないが改善が望ましい事項         | Phase 12 で未タスク化を検討 |
| **Info**    | 参考情報（設計意図の確認結果、仕様どおり等） | 記録のみ                    |

## テストカテゴリ

- **機能テスト**: abort/skip/retry/timeout の各フォールバックフローの正常動作
- **統合テスト**: SkillExecutor-PermissionResolver-PermissionStore 間の連携
- **リグレッションテスト**: 既存の正常 Permission 承認フローへの影響確認

## スクリーンショット撮影ガイドライン

### 適用判断

| タスク種別                    | スクリーンショット | 判断基準                           |
| ----------------------------- | ------------------ | ---------------------------------- |
| UI/UX変更あり                 | **必須**           | Rendererコンポーネントの追加・変更 |
| IPC/API変更のみ               | 推奨               | DevTools動作確認エビデンスとして   |
| バックエンド/ドキュメントのみ | 不要               | UI変更を伴わないタスク             |

**本タスクの判定: NON_VISUAL**（Main Process / バックエンドロジックのみ。UI変更なし）

スクリーンショットは不要。IPC/API変更の動作確認として DevTools エビデンス取得を推奨するが、CLI環境制約がある場合はユニットテストのモック検証で代替する。

## 画面カバレッジマトリクス

**NON_VISUAL判定**: 本タスクは UI 変更を伴わない Main Process ロジック実装のため、画面カバレッジマトリクスは適用外。

- Step 1（変更コンポーネント一覧）: 該当なし（Renderer コンポーネントの変更なし）
- Step 2（UI状態カバレッジ）: 該当なし
- Step 3（撮影計画）: 該当なし
- Step 4（画面カバレッジレポート）: 該当なし

## テストケーステンプレート

| No    | カテゴリ             | テスト項目               | 前提条件                      | 操作手順                            | 期待結果                                           | 実行結果 | スクリーンショット | 備考                     |
| ----- | -------------------- | ------------------------ | ----------------------------- | ----------------------------------- | -------------------------------------------------- | -------- | ------------------ | ------------------------ |
| TC-01 | 機能テスト           | abort フォールバック     | Permission拒否設定            | Permission拒否→abortフロー実行      | スキル実行が即座に停止、リソースクリーンアップ完了 | -        | N/A（NON_VISUAL）  | -                        |
| TC-02 | 機能テスト           | skip フォールバック      | Permission拒否(skip=true)設定 | Permission拒否→skipフロー実行       | 拒否されたツール呼び出しをスキップ、後続処理が継続 | -        | N/A（NON_VISUAL）  | -                        |
| TC-03 | 機能テスト           | retry フォールバック     | Permission拒否設定            | Permission拒否→3回retry→abort       | 3回リトライ後にabortに遷移                         | -        | N/A（NON_VISUAL）  | P13: advanceTimersByTime |
| TC-04 | 機能テスト           | timeout フォールバック   | Permission応答なし設定        | Permission応答なし→5分timeout→abort | 5分後にabortに遷移、リソースクリーンアップ完了     | -        | N/A（NON_VISUAL）  | timeout=300,000ms        |
| TC-05 | リグレッションテスト | 正常Permission承認フロー | Permission承認設定            | Permission承認→スキル実行→完了      | 既存フローが正常に動作                             | -        | N/A（NON_VISUAL）  | -                        |

## 参照資料

| 参照資料         | パス                                                                                                                                            | 説明               |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Phase 10 成果物  | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/outputs/phase-10/`                                                                       | 最終レビュー結果   |
| Phase 9 成果物   | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/outputs/phase-9/`                                                                        | 品質検証結果       |
| Phase 1 受入基準 | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/outputs/phase-1/`                                                                        | 受入基準定義       |
| 未タスク指示書   | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/unassigned-task/task-ut-06-005-abort-skip-retry-fallback.md` | 元の未タスク指示書 |

### システム仕様（aiworkflow-requirements）

> テスト実行前に以下のシステム仕様を確認し、検証観点の漏れがないことを確認してください。

| 参照資料                        | パス                                                                                         | 内容                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| セキュリティ（スキル実行）      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | スキル実行時のセキュリティ要件                                     |
| セキュリティ（スキルIPC）       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                    | スキルIPC通信セキュリティ                                          |
| Agent SDK Skillインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`            | Agent SDK Skill関連の型定義                                        |
| エラーハンドリング              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                        | エラーカテゴリとリトライ方針                                       |
| エラーハンドリング（詳細）      | `.claude/skills/aiworkflow-requirements/references/error-handling-details.md`                | SkillExecutor実行エラーコード（PERMISSION_DENIED, TIMEOUT, ABORT） |
| Agent SDK Executor（詳細）      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | PermissionResolver仕様、DEFAULT_TIMEOUT_MS=300000                  |
| Phase 11-12 ガイド              | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                  | 手動テスト実行ガイドライン                                         |

## ウォークスルーシナリオ発見事項リアルタイム分類欄

各シナリオ実行中に発見した事項を即座に分類するためのテンプレート。
シナリオ完了後にまとめて分類するのではなく、発見時点でリアルタイムに記録する。

| #   | シナリオ     | 発見事項         | 分類                  | 対応方針         |
| --- | ------------ | ---------------- | --------------------- | ---------------- |
| 1   | TC-01〜TC-05 | （実行時に記録） | Blocker / Note / Info | （実行時に記録） |

**分類基準**:

- **Blocker**: Phase 12 完了前に修正必須。仕様整合性・参照リンク切れ・追跡可能性の断絶
- **Note**: 改善推奨だが Phase 12 完了をブロックしない。未タスク化を検討
- **Info**: 記録のみ。今後の参考情報として残す

## 実行手順

### ステップ1: テスト環境準備

参照資料およびシステム仕様を確認し、各テストケースの前提条件を把握する。

### ステップ2: フォールバックフロー手動検証（TC-01〜TC-04）

タスク1〜4の手順に従い、abort/skip/retry/timeout の各フォールバックフローを検証する。

### ステップ3: リグレッションテスト（TC-05）

タスク5の手順に従い、正常 Permission 承認フローが影響を受けていないことを確認する。

### ステップ4: 全テストスイート実行

タスク6の手順に従い、全テストスイートが PASS することを確認する。

### ステップ5: 成果物作成

手動テスト結果報告書（`manual-test-result.md`）と発見された課題（`discovered-issues.md`）を作成する。

## 統合テスト連携【必須】

- タスク1-4 で不具合が検出された場合、Phase 5 に差し戻して修正する
- タスク5（リグレッションテスト）で問題が検出された場合、フォールバック実装がデフォルトフローに影響していないか調査する
- タスク6（全テスト PASS）で失敗がある場合、Phase 9 の品質検証結果と照合して原因を特定する
- DevTools でのIPC通知確認が不可能な場合（CLI環境制約）、ユニットテストのモック検証で代替する

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

**本タスクでの適用**: バックエンド（Main）およびセキュリティ観点が主対象。SkillExecutor の Permission フォールバックフローはセキュリティ要件（fail-closed 原則）に直結する。

## 成果物

| 成果物               | パス                                                                                           | 必須 | 説明                        |
| -------------------- | ---------------------------------------------------------------------------------------------- | ---- | --------------------------- |
| 手動テスト結果報告書 | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/outputs/phase-11/manual-test-result.md` | 必須 | 手動テスト結果              |
| 発見された課題       | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/outputs/phase-11/discovered-issues.md`  | 必須 | 発見した課題（0件でも出力） |
| スクリーンショット   | `outputs/phase-11/screenshots/`                                                                | 不要 | NON_VISUAL判定のため不要    |

## 完了条件

- [ ] TC-01: Permission 拒否→abort→実行停止を確認済み
- [ ] TC-02: Permission 拒否(skip=true)→後続継続を確認済み
- [ ] TC-03: Permission 拒否→3回 retry→abort を確認済み
- [ ] TC-04: Permission 応答なし→5分 timeout→abort を確認済み
- [ ] TC-05: 正常 Permission 承認→スキル実行完了を確認済み（リグレッション）
- [ ] 全テストスイートが PASS
- [ ] 手動テスト結果報告書が作成されていること
- [ ] 発見された課題が記録されていること（0件でも必須）
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

| #   | サブタスク                | ステータス  |
| --- | ------------------------- | ----------- |
| 1   | 参照資料の確認            | not_started |
| 2   | TC-01: abort確認          | not_started |
| 3   | TC-02: skip確認           | not_started |
| 4   | TC-03: retry確認          | not_started |
| 5   | TC-04: timeout確認        | not_started |
| 6   | TC-05: リグレッション確認 | not_started |
| 7   | 全テストスイートPASS確認  | not_started |
| 8   | 統合テスト連携の実施      | not_started |
| 9   | 成果物作成                | not_started |
| 10  | 完了条件の検証            | not_started |

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-06-005-abort-skip-retry-fallback --phase 11
```

## 次のPhase

Phase 12: ドキュメント更新
