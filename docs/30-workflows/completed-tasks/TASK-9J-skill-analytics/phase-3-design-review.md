# Phase 3: 設計レビュー — TASK-9J スキル使用統計・分析機能

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 3                       |
| Phase名    | 設計レビュー            |
| 前提Phase  | Phase 2（設計）         |
| 後続Phase  | Phase 4（テスト作成）   |
| ステータス | 未実施                  |
| 作成日     | 2026-02-28              |
| 機能名     | TASK-9J-skill-analytics |

## 目的

Phase 2 の設計成果物（型定義、アーキテクチャ、IPC契約、Preload API、エラーハンドリング、テスト設計）をレビューし、Phase 4 開始前に契約ドリフトと設計矛盾を排除する。

## 背景

このフェーズは実装前ゲートであり、ここでの見落としは Phase 4〜10 の再作業コストを増幅する。特に `window.electronAPI.skill` 公開面、`safeInvokeUnwrap` の適用条件、ISO 8601 方針、P42 バリデーションを重点監査する。

## 実行タスク

- タスク1: 要件カバレッジレビュー
- タスク2: IPC契約整合性レビュー
- タスク3: セキュリティレビュー
- タスク4: パフォーマンスレビュー
- タスク5: 既存パターン準拠レビュー
- タスク6: ISO 8601シリアライズ整合性レビュー
- タスク7: レビュー結果判定

### タスク1: 要件カバレッジレビュー

**目的**: Phase 1 の FR/NFR が Phase 2 設計で漏れなくカバーされているか確認する。

**実行手順**:

1. `outputs/phase-1/requirements-definition.md` を参照する。
2. 以下のトレーサビリティマトリクスを作成する。

| 要件ID | 要件概要                 | 設計上の対応箇所                                              | カバー状態 |
| ------ | ------------------------ | ------------------------------------------------------------- | ---------- |
| FR-1   | イベント自動記録         | `SkillAnalytics.recordEvent` + `skill:analytics:record`       | ○/×        |
| FR-2   | スキル別統計取得         | `SkillAnalytics.getStatistics` + `skill:analytics:statistics` | ○/×        |
| FR-3   | 全体サマリー取得         | `SkillAnalytics.getSummary` + `skill:analytics:summary`       | ○/×        |
| FR-4   | トレンド分析             | `SkillAnalytics.getUsageTrend` + `skill:analytics:trend`      | ○/×        |
| FR-5   | CSV/JSONエクスポート     | `SkillAnalytics.exportData` + `skill:analytics:export`        | ○/×        |
| FR-6   | データクリア             | `SkillAnalytics.clearData(before?)`（Main内部API）            | ○/×        |
| NFR-1  | electron-store永続化     | `AnalyticsStore` + `skill-analytics-events`                   | ○/×        |
| NFR-2  | ISO 8601統一             | `timestamp` / `lastUsed` / `period.start/end`                 | ○/×        |
| NFR-3  | P42準拠3段バリデーション | 文字列引数を持つ全IPCハンドラ                                 | ○/×        |
| NFR-4  | 10,000件1秒以内集計      | パフォーマンス設計 + テスト設計                               | ○/×        |

3. `×` が1件でもあれば MAJOR 候補として記録する。

**期待される成果物**:

- `outputs/phase-3/requirements-coverage-review.md`

### タスク2: IPC契約整合性レビュー

**目的**: 5チャンネルの契約が `ipc-contract-checklist` と既存 skill API パターンに整合しているか確認する。

**実行手順**:

1. 以下を全5チャネルで確認する。

| チェック項目                                             | record | statistics | summary | trend | export |
| -------------------------------------------------------- | ------ | ---------- | ------- | ----- | ------ |
| 命名が `skill:analytics:*` に準拠                        | ○/×    | ○/×        | ○/×     | ○/×   | ○/×    |
| `IPC_CHANNELS` 定数に定義                                | ○/×    | ○/×        | ○/×     | ○/×   | ○/×    |
| `ALLOWED_INVOKE_CHANNELS` に登録                         | ○/×    | ○/×        | ○/×     | ○/×   | ○/×    |
| 引数型が明示され `any` 不使用                            | ○/×    | ○/×        | ○/×     | ○/×   | ○/×    |
| 戻り値型が明示                                           | ○/×    | ○/×        | ○/×     | ○/×   | ○/×    |
| P42バリデーションが定義                                  | ○/×    | ○/×        | ○/×     | ○/×   | ○/×    |
| `validateIpcSender` が定義                               | ○/×    | ○/×        | ○/×     | ○/×   | ○/×    |
| エラー形式が `{ success: false, error }` に統一          | ○/×    | ○/×        | ○/×     | ○/×   | ○/×    |
| Preload 呼び出しが `window.electronAPI.skill.analytics*` | ○/×    | ○/×        | ○/×     | ○/×   | ○/×    |

2. `safeInvoke` / `safeInvokeUnwrap` の適用根拠（ハンドラ戻り値形式）を記録する。
3. P44/P45 観点（引数形式一致・引数名セマンティクス一致）を確認する。

**期待される成果物**:

- `outputs/phase-3/ipc-contract-review.md`

### タスク3: セキュリティレビュー

**目的**: IPC境界防御と情報漏えい防止の設計妥当性を確認する。

**実行手順**:

1. 以下のチェック項目を監査する。

| チェック項目                                                 | 結果 | 備考 |
| ------------------------------------------------------------ | ---- | ---- |
| 全IPCハンドラで `validateIpcSender` 実施                     | ○/×  |      |
| 予期しないエラーが `"Internal error"` に正規化               | ○/×  |      |
| `contextBridge` 経由でのみ公開（`window.electronAPI.skill`） | ○/×  |      |
| ハードコードチャンネル名を使わない（`IPC_CHANNELS` のみ）    | ○/×  |      |
| PII/認証情報をイベント・exportに含めない                     | ○/×  |      |
| `period.start/end` のISO 8601検証がある                      | ○/×  |      |
| `period.start <= period.end` の整合検証がある                | ○/×  |      |

2. 攻撃ベクトルと防御策を対応付ける。

| 攻撃ベクトル                        | 防御策                        | 設計上の対応 |
| ----------------------------------- | ----------------------------- | ------------ |
| 不正SenderからのIPC呼び出し         | `validateIpcSender`           | ○/×          |
| `skillName` への不正入力            | P42 3段バリデーション         | ○/×          |
| `period` 改ざん（ISO不正/逆転期間） | ISO検証 + `start <= end` 検証 | ○/×          |
| 大量データによる処理逼迫            | 集計O(n)設計 + 性能測定計画   | ○/×          |
| エラー詳細からの情報漏えい          | 内部エラーのサニタイズ/正規化 | ○/×          |

**期待される成果物**:

- `outputs/phase-3/security-review.md`

### タスク4: パフォーマンスレビュー

**目的**: NFR-4（10,000件で1秒以内）の達成可能性を設計段階で評価する。

**実行手順**:

1. ボトルネック候補を評価する。

| 懸念点                   | リスク | 対策案                                |
| ------------------------ | ------ | ------------------------------------- |
| 全イベント走査の頻度増加 | 中     | APIごとに必要最小の走査回数に制約     |
| トレンドの粒度別集約     | 中     | `Map` 集約で O(n) を維持              |
| CSV生成時の文字列処理    | 低     | `Array.join` + 必要最小エスケープ     |
| 永続化読み込み遅延       | 中     | 起動時復元 + 破損時安全フォールバック |

2. 最適化の適用条件を明記する。

- 初期実装はキャッシュなし
- Phase 7 実測で閾値未達時のみ Phase 8 で最適化を追加

**期待される成果物**:

- `outputs/phase-3/performance-review.md`

### タスク5: 既存パターン準拠レビュー

**目的**: TASK-9F/TASK-9G と比較して不要な独自仕様が混入していないか確認する。

**実行手順**:

1. 以下の項目を比較する。

| チェック項目                                 | 結果 | 備考 |
| -------------------------------------------- | ---- | ---- |
| サービスがDIで注入される                     | ○/×  |      |
| `window.electronAPI.skill` 公開面に統一      | ○/×  |      |
| `IPC_CHANNELS` + ホワイトリスト運用          | ○/×  |      |
| `validateIpcSender` + P42 + 内部エラー正規化 | ○/×  |      |
| 共有型を `@repo/shared` 参照                 | ○/×  |      |
| テスト命名と配置が既存規約に一致             | ○/×  |      |

2. 差異がある場合、意図的差分かドリフトかを判定する。

**期待される成果物**:

- `outputs/phase-3/pattern-consistency-review.md`

### タスク6: ISO 8601シリアライズ整合性レビュー

**目的**: 日時データの扱いが全レイヤーで一貫しているか確認する。

**実行手順**:

1. 以下のフィールドをレビューする。

| 型名/契約         | フィールド  | Main Process内     | IPC境界            | 永続化             |
| ----------------- | ----------- | ------------------ | ------------------ | ------------------ |
| `SkillUsageEvent` | `timestamp` | 文字列（ISO 8601） | 文字列（ISO 8601） | 文字列（ISO 8601） |
| `SkillStatistics` | `lastUsed`  | 文字列 or null     | 文字列 or null     | -                  |
| `AnalyticsPeriod` | `start`     | 文字列（ISO 8601） | 文字列（ISO 8601） | -                  |
| `AnalyticsPeriod` | `end`       | 文字列（ISO 8601） | 文字列（ISO 8601） | -                  |
| `TrendDataPoint`  | `timestamp` | 文字列（ISO 8601） | 文字列（ISO 8601） | -                  |

2. ルール確認:

- IPC入力日時は必ず ISO 8601 妥当性を検証する
- `period.start <= period.end` を強制する
- 永続化データに `Date` オブジェクトを混在させない

**期待される成果物**:

- `outputs/phase-3/iso8601-serialization-review.md`

### タスク7: レビュー結果判定

**目的**: タスク1〜6の結果を統合し、Phase 4 進行可否を判定する。

**実行手順**:

1. 指摘事項を集約する。

| タスク | 観点             | 指摘件数 | 重大度 |
| ------ | ---------------- | -------- | ------ |
| 1      | 要件カバレッジ   | N件      | -      |
| 2      | IPC契約          | N件      | -      |
| 3      | セキュリティ     | N件      | -      |
| 4      | パフォーマンス   | N件      | -      |
| 5      | 既存パターン準拠 | N件      | -      |
| 6      | ISO 8601整合性   | N件      | -      |

2. 判定基準を適用する。

| 判定     | 条件             | 次アクション              |
| -------- | ---------------- | ------------------------- |
| PASS     | 指摘なし         | Phase 4 へ進む            |
| MINOR    | 軽微な指摘のみ   | 指摘対応後 Phase 4 へ進む |
| MAJOR    | 設計修正が必要   | Phase 2 へ戻る            |
| CRITICAL | 要件再確認が必要 | Phase 1 へ戻る            |

**期待される成果物**:

- `outputs/phase-3/design-review-result.md`

## 参照資料

| 資料名                 | パス                                                                                        | 用途                |
| ---------------------- | ------------------------------------------------------------------------------------------- | ------------------- |
| Phase 1 要件仕様       | `outputs/phase-1/requirements-definition.md`                                                | 要件カバレッジ      |
| Phase 2 設計仕様       | `phase-2-design.md`                                                                         | レビュー対象        |
| Phase 2 成果物         | `outputs/phase-2/`                                                                          | レビュー対象        |
| IPC Agent仕様          | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPC契約確認         |
| Skill SDK IF           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | preload公開契約確認 |
| IPC 契約チェック       | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC準拠確認         |
| IPC セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | セキュリティ確認    |
| Skill IPC セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | skill系境界確認     |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | unwrap運用確認      |

## 成果物

| 成果物                             | パス                                              | 形式     |
| ---------------------------------- | ------------------------------------------------- | -------- |
| 要件カバレッジレビュー             | `outputs/phase-3/requirements-coverage-review.md` | Markdown |
| IPC契約整合性レビュー              | `outputs/phase-3/ipc-contract-review.md`          | Markdown |
| セキュリティレビュー               | `outputs/phase-3/security-review.md`              | Markdown |
| パフォーマンスレビュー             | `outputs/phase-3/performance-review.md`           | Markdown |
| 既存パターン準拠レビュー           | `outputs/phase-3/pattern-consistency-review.md`   | Markdown |
| ISO 8601シリアライズ整合性レビュー | `outputs/phase-3/iso8601-serialization-review.md` | Markdown |
| 設計レビュー結果                   | `outputs/phase-3/design-review-result.md`         | Markdown |

## 統合テスト連携

| レビュー観点   | テスト要件                                      |
| -------------- | ----------------------------------------------- |
| 要件カバレッジ | 全FR/NFRに対応するテストケースが Phase 4 に存在 |
| IPC契約        | 引数/戻り値/エラー契約を Phase 4 テストで検証   |
| セキュリティ   | sender検証・P42・内部エラー正規化を検証         |
| パフォーマンス | Phase 7 で実測値が閾値を満たすことを検証        |
| ISO 8601整合性 | period/timestamp の妥当性と往復整合を検証       |

## 完了条件

- [ ] タスク1: FR/NFR カバレッジが確認されている
- [ ] タスク2: 5チャネルの契約整合性が確認されている
- [ ] タスク3: セキュリティ項目が確認されている
- [ ] タスク4: パフォーマンス懸念と対策が記録されている
- [ ] タスク5: 既存パターンとの差分が評価されている
- [ ] タスク6: ISO 8601 方針の一貫性が確認されている
- [ ] タスク7: 最終判定（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] 全成果物が `outputs/phase-3/` に配置されている
- [ ] 曖昧な抽象語を使わず、判定条件が具体的に記述されている

## Phase末端アクション【必須】

1. 全成果物の存在を確認する
2. 完了条件チェックリストを全項目チェックする
3. 判定結果に基づき次アクションを実行する
   - PASS: Phase 4 へ進む
   - MINOR: 指摘対応後に Phase 4 へ進む
   - MAJOR: Phase 2 へ戻る
   - CRITICAL: Phase 1 へ戻る

## 依存関係

- **前提**: Phase 2（設計）が完了していること

## 次のPhase

→ `phase-4-test-creation.md`（PASS/MINOR判定時）
