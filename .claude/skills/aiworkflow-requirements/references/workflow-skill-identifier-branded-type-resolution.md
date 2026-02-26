# Skill識別子Branded Type適用ワークフロー仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。
> 管理: .claude/skills/aiworkflow-requirements/references/

---

## 概要

Skill識別子の `id` と表示名 `name` を `string` のまま扱うことで発生する契約ドリフトを、Branded Typeで再発防止するための標準ワークフローを定義する。

**トリガー**: Phase 12再監査、`skill.id` / `skill.name` 混同の検出、未タスク参照整合の再点検  
**実行環境**: ローカル（worktree）+ 仕様管理スキル運用

---

## フェーズ構造

### フェーズ一覧

| Phase | 名称 | 入力 | 出力 |
| --- | --- | --- | --- |
| Phase 1 | 型契約定義 | 既存型定義、境界API一覧 | `SkillId` / `SkillName` 契約表 |
| Phase 2 | 境界適用 | Renderer / Preload / Main のI/F | 型適用済み境界仕様 |
| Phase 3 | 仕様同期 | task-workflow / interfaces / lessons | 更新済み仕様書 |
| Phase 4 | 監査確定 | unassigned監査結果、リンク検証結果 | 完了判定と再発防止記録 |

### フロー図

1. 型契約を `SkillId` / `SkillName` に分離する
2. 境界APIに型を適用して `string` 直渡しを排除する
3. システム仕様書に実装内容と苦戦箇所を同期する
4. current/baseline を分離監査し、完了判定を固定する

### SubAgent編成（並列実行）

| SubAgent | 主責務 | 入力 | 出力 |
| --- | --- | --- | --- |
| SubAgent-A | 実装契約監査 | shared型、境界API一覧 | 型契約差分リスト |
| SubAgent-B | 仕様反映 | interfaces / api / lessons | 仕様更新案 |
| SubAgent-C | 未タスク監査 | task-workflow、監査スクリプト結果 | current/baseline判定表 |
| Lead | 統合・最終検証 | SubAgent A-C成果物 | 完了判断、更新履歴、ログ |

---

## Phase詳細

### Phase 1: 型契約定義

**目的**: 識別子と表示名の意味境界を型として明示する。

**入力**:

| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| 既存型定義 | 仕様書 | ✅ | `Skill` / IPC / Store の既存契約 |
| 問題症状 | テキスト | ✅ | `id/name` 混同、監査誤読、リンク不整合 |

**処理内容**:

1. 境界ごとに「内部識別子」か「表示名」かを分類する
2. `SkillId` / `SkillName` を境界APIで使う方針を固定する
3. 型適用対象を Renderer → Preload → Main の順で確定する

**出力**:

| 項目 | 型 | 説明 |
| --- | --- | --- |
| 契約テーブル | 表 | API/Store/IPCごとの型境界定義 |

**品質ゲート**:

| 条件 | 閾値 | 失敗時の対応 |
| --- | --- | --- |
| 型境界の曖昧項目 | 0件 | 境界APIの型名を再設計 |

### Phase 2: 境界適用

**目的**: 実装境界の `string` 直渡しを排除する。

**入力**:

| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| 契約テーブル | 表 | ✅ | Phase 1出力 |
| 境界API一覧 | 表 | ✅ | Renderer / Preload / Main |

**処理内容**:

1. Renderer 側で `SkillName` を使用する契約へ寄せる
2. Preload APIの引数を `SkillName` 文脈へ統一する
3. Main IPCハンドラで契約型と検証ルールを揃える

**出力**:

| 項目 | 型 | 説明 |
| --- | --- | --- |
| 境界適用結果 | 表 | 変更箇所と適用後契約 |

**品質ゲート**:

| 条件 | 閾値 | 失敗時の対応 |
| --- | --- | --- |
| `id/name` 契約ドリフト | 0件 | 影響範囲を再スキャンして再適用 |

### Phase 3: 仕様同期

**目的**: 実装内容と教訓をシステム仕様書へ確実に反映する。

**入力**:

| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| 境界適用結果 | 表 | ✅ | Phase 2出力 |
| 苦戦箇所 | 表 | ✅ | 実装中に発生した問題と原因 |

**処理内容**:

1. `interfaces-agent-sdk-skill.md` に実装内容を反映する
2. `lessons-learned.md` に苦戦箇所と簡潔解決手順を反映する
3. 重複記述を避けるため本ドキュメントへ集約参照を設定する

**出力**:

| 項目 | 型 | 説明 |
| --- | --- | --- |
| 仕様更新結果 | 表 | 反映先、変更理由、再発防止 |

**品質ゲート**:

| 条件 | 閾値 | 失敗時の対応 |
| --- | --- | --- |
| 実装内容の仕様反映漏れ | 0件 | 反映テーブルを追加して再確認 |

### Phase 4: 監査確定

**目的**: 今回差分と既存資産を分離して完了判定を固定する。

**入力**:

| 項目 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| 監査結果 | 数値 | ✅ | current / baseline |
| リンク検証結果 | 数値 | ✅ | missing件数 |

**処理内容**:

1. `verify-unassigned-links.js` で参照整合を確認する
2. `audit-unassigned-tasks.js --json --diff-from HEAD` で current を判定する
3. `audit-unassigned-tasks.js --json` で baseline を監視記録する

**出力**:

| 項目 | 型 | 説明 |
| --- | --- | --- |
| 完了判定結果 | 表 | current/baseline分離記録 |

**品質ゲート**:

| 条件 | 閾値 | 失敗時の対応 |
| --- | --- | --- |
| `currentViolations` | 0 | 未タスク化または修正を先行 |
| missing links | 0 | 参照パスを同期修正して再検証 |

---

## 苦戦箇所由来のリスクと先回り対策

| 苦戦箇所 | リスク | 先回り対策 |
| --- | --- | --- |
| `id/name` が同じ `string` 扱い | 境界APIで取り違えが再発する | 新規APIは `SkillId` / `SkillName` を必須化 |
| 完了移管後のリンク同期漏れ | 仕様台帳で参照切れが残る | ファイル移動・台帳更新・リンク検証を同一ターンで実行 |
| current/baseline の誤読 | 完了判定を誤る | `--diff-from HEAD` と scopeなし監査を分離記録 |

---

## 監視・ログ

### 検証コマンド

| コマンド | 目的 | 合格条件 |
| --- | --- | --- |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` | 参照整合 | missing 0 |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` | 今回差分判定 | currentViolations 0 |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json` | 既存資産監視 | baseline値を記録 |
| `node /Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements` | スキル整合 | error 0 |

### 最短実行チェックリスト

- [ ] `SkillId` / `SkillName` の境界契約を表で確認した
- [ ] Renderer → Preload → Main の順に型適用を完了した
- [ ] `interfaces-agent-sdk-skill.md` と `lessons-learned.md` を同期更新した
- [ ] current/baseline 分離の監査結果を記録した

---

## 関連ドキュメント

| ドキュメント | 説明 |
| --- | --- |
| [interfaces-agent-sdk-skill.md](./interfaces-agent-sdk-skill.md) | Skill API / Store / IPC の契約正本 |
| [lessons-learned.md](./lessons-learned.md) | 苦戦箇所と再発防止の履歴 |
| [task-workflow.md](./task-workflow.md) | 未タスク台帳と完了反映ルール |
| `docs/30-workflows/ut-type-skill-identifier-branded-001/outputs/phase-12/spec-update-summary.md` | 本タスクのPhase 12証跡 |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
| --- | --- | --- |
| 2026-02-25 | 1.0.0 | UT-TYPE-SKILL-IDENTIFIER-BRANDED-001 の実装内容・苦戦箇所・再発防止手順を、skill-creatorテンプレート準拠で新規作成 |
