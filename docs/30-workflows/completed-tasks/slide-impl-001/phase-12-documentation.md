# Phase 12: ドキュメント

## メタ情報

| 項目   | 値             |
| ------ | -------------- |
| Phase  | 12             |
| 機能名 | slide-impl-001 |
| 作成日 | 2026-03-24     |

## 目的

実装ガイド・システム仕様書更新・未タスク検出を行い、コードとドキュメントの整合性を確保する。

## 事前チェック【必須】

Phase 12実行前に、以下の既知の落とし穴を確認し、漏れを防止する:

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を読む
   - P1: LOGS.md 2ファイル更新漏れ
   - P2: topic-map.md 再生成忘れ
   - P3: 未タスク管理の3ステップ不完全
   - P4: documentation-changelog への早期「完了」記載
   - P25: LOGS.md 2ファイル更新漏れ（再発）
   - P26: システム仕様書更新遅延
   - P27: topic-map.md 再生成トリガーの判断ミス
   - P28: スキルフィードバックレポート未作成

## 実行タスク

| Task      | 内容                                                   | 主成果物                                         |
| --------- | ------------------------------------------------------ | ------------------------------------------------ |
| Task 12-1 | 技術ドキュメント作成（実装ガイド作成）                 | `outputs/phase-12/implementation-guide.md`       |
| Task 12-2 | システムドキュメント更新（aiworkflow-requirements 等） | `outputs/phase-12/system-spec-update-summary.md` |
| Task 12-3 | ドキュメント更新履歴作成                               | `outputs/phase-12/documentation-changelog.md`    |
| Task 12-4 | 未タスク検出（残課題の検出と記録）                     | `outputs/phase-12/unassigned-task-detection.md`  |
| Task 12-5 | スキルフィードバックレポート作成                       | `outputs/phase-12/skill-feedback-report.md`      |

- Task 12-1: 技術ドキュメント作成（実装ガイド作成）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements等の更新）
- Task 12-3: ドキュメント更新履歴作成（変更履歴の記録）
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）

> **必須**: 実行タスクは「表」と「`- Task 12-X:` 箇条書き」を**両方**残すこと（表のみ・箇条書きのみは不合格）。

### Task 1: 実装ガイド

#### 1-1. `implementation-guide.md` Part 1（中学生レベル概念説明）

日常の例えを使った概念説明:

- **ModifierResponse 拡張**: 「テストの答案に先生がコメントを書き加えるようなもの。元の答案（success/changes/error）はそのままで、新しいコメント欄（fallback_reason/suggested_action）を追加した」
- **SlideCapabilityDTO + IPC**: 「アプリのヘルスチェックカード。今の状態（synced/running/degraded/guidance）を窓口（IPC）で確認できるようにした」
- **Agent SDK adapter**: 「翻訳者を間に入れるようなもの。直接外国語で会話していたのを、専門の翻訳者（adapter）経由に変更した」

#### 1-2. `implementation-guide.md` Part 2（開発者向け実装詳細）

- 変更ファイル一覧と変更内容
- IPC channel 登録手順（channels.ts → allowlist → handler → preload API）
- DI パターンの使い方（AgentClientDependencies の構成方法）
- テストの実行方法とカバレッジ確認方法

#### 1-3. `ipc-documentation.md`

- `slide:capability:get` の API ドキュメント
- 引数形式、レスポンス形式、エラーコード
- P42 バリデーションの仕様

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

#### Step 1-A: タスク完了記録

- [x] 該当仕様書にタスク完了記録を追加
- [x] `aiworkflow-requirements/LOGS.md` 更新
- [x] `task-specification-creator/LOGS.md` 更新（**2ファイル両方** — P1/P25 対策）
- [x] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [x] `task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル

- [x] `api-endpoints.md` の IPC endpoint ステータス更新（`slide:capability:get` 追加）

#### Step 1-C: 関連タスクテーブル

```bash
grep -rn "UT-SLIDE-IMPL-001" .claude/skills/aiworkflow-requirements/references/
```

- [x] 検索結果に基づき関連仕様書を更新

#### Step 1-D: topic-map.md 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- [x] topic-map.md が再生成されている（P2/P27 対策）

#### Step 2: システム仕様更新

以下の仕様書を更新:

| 仕様書                     | 更新内容                                     |
| -------------------------- | -------------------------------------------- |
| `interfaces-agent-sdk.md`  | AgentClientDependencies インターフェース追加 |
| `api-ipc-system.md`        | `slide:capability:get` channel 追加          |
| `security-electron-ipc.md` | P42 バリデーション追加の記録                 |

#### IPC機能開発時の追加更新対象ファイル

| #   | 更新対象ファイル           | 更新内容                                     | 必須/任意 |
| --- | -------------------------- | -------------------------------------------- | --------- |
| 1   | `interfaces-agent-sdk.md`  | AgentClientDependencies インターフェース追加 | 必須      |
| 2   | `api-ipc-system.md`        | `slide:capability:get` channel 追加          | 必須      |
| 3   | `security-electron-ipc.md` | P42 バリデーション追加の記録                 | 必須      |
| 4   | `task-workflow.md`         | 残課題テーブル更新、完了タスクセクション追加 | 必須      |

#### Step 3: IPC 契約検証（本タスクは IPC 修正タスクのため必須）

- [x] `ipc-contract-checklist.md` Phase 1-6 を実施
- [x] ハンドラ引数形式と Preload 側の呼び出し形式が一致
- [x] 引数名のセマンティクスが実際の値と一致（P45 対策）
- [x] P42 準拠 3 段バリデーション

### Task 3: documentation-changelog.md

- [x] 更新した全仕様書の変更内容を記録
- [x] 各 Step の完了結果を詳細に記録
- DON'T: 全 Step 確認前に「完了」と記載しない（P4/P51 対策）

### Task 4: 未タスク検出

- [x] `unassigned-task-report.md` 作成（0件でも必須）
- [x] 検出した未タスクは 3 ステップ全完了（P3/P38 対策）:
  1. `docs/30-workflows/unassigned-task/` に指示書作成
  2. `task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンク追加
- [x] `unassigned-task-detection.md` の件数・ステータス更新
- [x] 再評価クローズした未タスクの GitHub Issue を `gh issue close` で同時に Close（P56 対策）

### Task 5: スキルフィードバックレポート作成

ワークフロー改善点と技術的教訓を記録する。**改善点がなくても「改善点なし」としてレポートを作成する（省略不可 - P28 対策）。**

| セクション         | 記載内容                                             |
| ------------------ | ---------------------------------------------------- |
| ワークフロー改善点 | Phase実行中に発見したワークフロー上の改善提案        |
| 技術的教訓         | 実装中に得られた技術的な知見・注意点                 |
| スキル改善提案     | task-specification-creator/skill-creatorへの改善提案 |
| 新規Pitfall候補    | 06-known-pitfalls.mdに追加すべき新規Pitfall          |

## 参照資料

| 資料名                 | パス                                                                             | 内容                      |
| ---------------------- | -------------------------------------------------------------------------------- | ------------------------- |
| spec-update-workflow   | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`   | 仕様書更新手順            |
| Phase 12 テンプレート  | `.claude/skills/task-specification-creator/references/phase-template-phase12.md` | Phase 12 詳細テンプレート |
| IPC 契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`    | IPC 検証手順              |

## 統合テスト連携

- Phase 12 ではドキュメント整合性の検証のみ。
- IPC 契約検証で handler と Preload の引数形式一致を確認。

## 成果物

| 成果物                       | パス                                             | 説明                                                 | 必須 |
| ---------------------------- | ------------------------------------------------ | ---------------------------------------------------- | ---- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`       | 概念説明 + 実装詳細                                  | 必須 |
| IPC ドキュメント             | `outputs/phase-12/ipc-documentation.md`          | IPC API ドキュメント                                 | 必須 |
| システム仕様書更新サマリー   | `outputs/phase-12/system-spec-update-summary.md` | システム仕様書更新内容のサマリー                     | 必須 |
| documentation-changelog      | `outputs/phase-12/documentation-changelog.md`    | 変更記録                                             | 必須 |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`  | 未タスク検出件数・ステータス（0件でも必須）          | 必須 |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`      | ワークフロー改善点と技術的教訓（改善点なしでも必須） | 必須 |

## 完了条件

- [x] 実装ガイド Part 1（中学生レベル概念説明）が作成されている
- [x] 実装ガイド Part 2（開発者向け実装詳細）が作成されている
- [x] IPC ドキュメントが作成されている
- [x] 実行タスクを「表」と「`- Task 12-X:` 箇条書き」の両方で記載している
- [x] LOGS.md が 2 ファイル両方更新されている（P1/P25 対策）
- [x] SKILL.md の変更履歴が更新されている
- [x] topic-map.md が再生成されている（P2/P27 対策）
- [x] IPC 契約検証が完了している
- [x] documentation-changelog が全 Step 完了後に記録されている（P4/P51 対策）
- [x] 未タスクレポートが作成されている（0件でも必須）
- [x] 検出した未タスクの 3 ステップが全完了している（P3/P38 対策）
- [x] スキルフィードバックレポートが出力されている（改善点なしでも作成必須 - P28 対策）
- [x] artifacts.json が更新されている
- [x] 本 Phase 内の全タスクを 100% 実行完了

## 漏れやすいポイント（06-known-pitfalls.md参照）

| ID  | ポイント                            | 対策                                                                |
| --- | ----------------------------------- | ------------------------------------------------------------------- |
| P1  | LOGS.md 2ファイル更新漏れ           | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P2  | topic-map.md 再生成忘れ             | セクション変更時は必ず `generate-index.js` を実行                   |
| P27 | topic-map.md 再生成トリガー判断ミス | 追加だけでなく削除・更新も再生成トリガー                            |
| P29 | SKILL.md 変更履歴の更新漏れ         | LOGS.md とは別に SKILL.md の変更履歴テーブルも必ず更新              |
| P3  | 未タスク管理の3ステップ不完全       | 指示書 → task-workflow.md登録 → 関連仕様書リンク                    |

## 次の Phase

Phase 13: 完了・PR作成
