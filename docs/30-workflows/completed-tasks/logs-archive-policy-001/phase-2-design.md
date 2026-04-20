# Phase 2: 設計

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 2                                |
| タスクID   | TASK-LOGS-ARCHIVE-POLICY-001     |
| 機能名     | LOGS.md アーカイブポリシー詳細化 |
| 前提Phase  | Phase 1                          |
| 後続Phase  | Phase 3                          |
| 作成日     | 2026-04-19                       |
| ステータス | completed                        |

## 目的

Phase 1 で整理した現状分析を踏まえ、LOGS.md アーカイブポリシーの統一文書と
その配置・同期設計を確定する。本 Phase の成果は Phase 3 設計レビューを経て
Phase 4 以降のテスト・実装工程の基準となる。

## 実行タスク

- 閾値・命名・mirror・index 反映の 4 論点を単一決定へ収束させる
- docs-only / NON_VISUAL / `verify_existing` に合う evidence 設計へ読み替える
- `aiworkflow-requirements` Step 1 / Step 2 の更新境界を定義する
- Phase 4 以降で使う validation matrix を準備する

## 参照資料

| 資料名                  | パス                                                                           | 用途              |
| ----------------------- | ------------------------------------------------------------------------------ | ----------------- |
| Phase 1                 | `docs/30-workflows/logs-archive-policy-001/phase-1-requirements.md`            | 要件・比較軸      |
| spec-update-workflow    | `.agents/skills/task-specification-creator/references/spec-update-workflow.md` | Phase 12 同期境界 |
| aiworkflow-requirements | `.agents/skills/aiworkflow-requirements/SKILL.md`                              | 正本配置判断      |

## 設計決定事項（採用案）

### D-1: アーカイブ閾値（ハイブリッド方式）

以下のいずれかを満たした時点で、**毎月初の第1営業日に前月分を評価して**アーカイブを実施する：

| 閾値種別     | 値       | 判定タイミング     |
| ------------ | -------- | ------------------ |
| 行数         | 300 行超 | 毎月初の第1営業日  |
| バイトサイズ | 30 KB 超 | 毎月初の第1営業日  |
| 期間         | 月次     | 毎月初に前月分評価 |

**採用理由**:

- 300 行・30 KB は既存 `logs-archive-2026-march.md` 等と整合
- 行数 or サイズの OR 条件により、大きなログも長文ログも捕捉
- 月次固定にすることで自動化（別タスク）への展開が容易

### D-2: archive 先パス規則

```
.claude/skills/<skill-name>/LOGS.md                          # 現役ログ
.claude/skills/<skill-name>/logs-archive-<YYYY-MM>.md        # 月次アーカイブ
.agents/skills/<skill-name>/LOGS.md                          # mirror 現役
.agents/skills/<skill-name>/logs-archive-<YYYY-MM>.md        # mirror 月次
```

- 同一ディレクトリ配置（サブディレクトリ化しない）
- ファイル名は `logs-archive-YYYY-MM.md` で固定
- 既存の `logs-archive-2026-feb.md` 等と命名衝突しない

### D-3: ポリシー文書の配置

| 配置先                                                                     | 種別   |
| -------------------------------------------------------------------------- | ------ |
| `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` | 正本   |
| `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` | mirror |

mirror sync 機構（TASK-CONFLICT-PREVENT-001 由来）により `.claude/` → `.agents/` を同期する。

### D-4: topic-map.md への参照追加

```markdown
- [logs-archive-policy.md](../references/logs-archive-policy.md) — LOGS.md アーカイブ閾値・パス規則・手順の正本ポリシー
```

## ポリシー文書構造（logs-archive-policy.md）

```markdown
# LOGS.md アーカイブポリシー

## 1. 適用範囲

- 対象: .claude/skills/_/LOGS.md および .agents/skills/_/LOGS.md
- 除外: <除外対象があれば明記>

## 2. アーカイブ閾値

- 行数: 300 行超
- サイズ: 30 KB 超
- 期間: 月次（毎月初に前月分評価）
- 判定: 上記いずれか1つ以上を満たした時点

## 3. archive 先パス規則

- パス: 同一ディレクトリ
- ファイル名: logs-archive-YYYY-MM.md
- 例: .claude/skills/task-specification-creator/logs-archive-2026-04.md

## 4. アーカイブ手順

1. 閾値超過の検知
2. 当月末までのログ抽出
3. logs-archive-YYYY-MM.md に追記（既存があれば末尾追記）
4. LOGS.md から当該月分ログを削除
5. mirror sync 実行で .agents/skills/ 側に反映
6. 動作確認（両側の存在確認）

## 5. 運用ルール

- 見直しサイクル: 6 か月毎
- 最終更新日: 冒頭に記載
- 変更時: CHANGELOG.md またはコミットメッセージに理由を記述

## 6. 参照

- task-specification-creator の既存 logs-archive-\*.md 実例
```

## アーキテクチャ図（概念）

```
[LOGS.md（現役）]
       │
       │ 閾値判定（月次 or 行数 or サイズ）
       ▼
[アーカイブ実行]
       │
       ▼
[logs-archive-YYYY-MM.md（.claude/）]
       │
       │ mirror sync
       ▼
[logs-archive-YYYY-MM.md（.agents/）]
```

## データ契約

### ポリシー文書（logs-archive-policy.md）必須セクション

| セクション         | 必須 | 内容                             |
| ------------------ | ---- | -------------------------------- |
| 適用範囲           | 必須 | 対象・除外                       |
| アーカイブ閾値     | 必須 | 行数・サイズ・期間               |
| archive 先パス規則 | 必須 | パス・ファイル名                 |
| アーカイブ手順     | 必須 | 6 ステップ                       |
| 運用ルール         | 必須 | 見直しサイクル・最終更新日       |
| 参照               | 必須 | 既存 logs-archive-\*.md との整合 |

### archive ファイル命名規約（正規表現）

```
^logs-archive-\d{4}-(0[1-9]|1[0-2])\.md$
```

## モジュール構成

本タスクは文書作成のみで実装は発生しない。構成要素は以下の 3 つ：

| 要素                | パス                                                                       | 種別     |
| ------------------- | -------------------------------------------------------------------------- | -------- |
| ポリシー文書        | `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` | 新規作成 |
| mirror ポリシー文書 | `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` | 新規作成 |
| topic-map.md 更新   | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`              | 既存更新 |

## 不変条件（Invariants）

1. **命名規則の不変性**: `logs-archive-YYYY-MM.md` フォーマットは過去アーカイブと衝突しない
2. **閾値の一貫性**: 行数・サイズ閾値はポリシー文書と実運用で常に同期
3. **mirror 対称性**: `.claude/skills/` と `.agents/skills/` で同一内容を保持
4. **references 配置**: ポリシー文書は `references/` 配下に配置し `topic-map.md` から参照可能

## エラーハンドリング設計

| 失敗シナリオ                          | 検知方法                                | 対応                                               |
| ------------------------------------- | --------------------------------------- | -------------------------------------------------- |
| mirror sync 失敗                      | Phase 3 の `ls` 存在確認                | 手動で mirror 側にファイル配置 + sync 機構を再調査 |
| topic-map.md への参照追加漏れ         | `grep logs-archive-policy topic-map.md` | 参照行を追加                                       |
| ポリシー必須セクション欠落            | セクション存在確認コマンド              | 欠落セクションを追記                               |
| 既存 `logs-archive-*.md` との命名衝突 | `ls logs-archive-*.md` 事前確認         | 命名規則を文書化時に明示                           |

## 実行手順

1. Phase 1 の候補比較から D-1〜D-4 を決定する
2. docs-only / NON_VISUAL の primary evidence を `outputs/phase-11/TASK-LOGS-ARCHIVE-POLICY-001-manual-test-report.md` に固定する
3. Phase 12 canonical 6 成果物で必要な close-out 記録を先に定義する
4. Phase 3 で検証すべき Findings を F-001〜F-005 に限定する

## 統合テスト連携【必須】

| 判定項目                    | 基準                       | 結果 |
| --------------------------- | -------------------------- | ---- |
| D-1〜D-4 決定               | Phase 1 の比較軸で説明可能 | PASS |
| Step 1 / Step 2 境界        | docs-only close-out と整合 | PASS |
| NON_VISUAL primary evidence | task 固有 report に固定    | PASS |

## 成果物

| 成果物          | パス                                 | 説明                                  |
| --------------- | ------------------------------------ | ------------------------------------- |
| 設計書          | `outputs/phase-2/design.md`          | D-1〜D-4、validation matrix、境界条件 |
| decision matrix | `outputs/phase-2/decision-matrix.md` | 閾値・命名・mirror・index の比較結果  |

## 受け入れ基準（AC）

| ID   | 受け入れ基準                                                        | 検証方法                           |
| ---- | ------------------------------------------------------------------- | ---------------------------------- |
| AC-1 | D-1〜D-4 が Phase 1 の計測データを根拠に決定されている              | 決定根拠セクションのレビュー       |
| AC-2 | ポリシー文書構造がすべての必須セクションを含んでいる                | 必須セクション一覧との突合         |
| AC-3 | 既存 `logs-archive-*.md` と命名衝突が発生しないことが証明されている | 命名正規表現と既存ファイル名の照合 |
| AC-4 | mirror sync 機構の利用方法が具体的に記述されている                  | Phase 3 手順書との整合確認         |
| AC-5 | 不変条件 4 項目がすべて満たされる設計になっている                   | 不変条件セクションのレビュー       |

## スコープ

### 含むもの

- ポリシー文書構造の確定
- 配置パス・命名規則の確定
- mirror 同期設計
- topic-map.md 更新内容の設計
- 不変条件・エラーハンドリング設計

### 含まないもの

- 実際のポリシー文書執筆（Phase 5 で実施）
- 自動化スクリプト設計（別タスク）
- 過去 LOGS.md への遡及適用設計（別タスク）

## リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                                         |
| -------------------------- | ------ | -------- | -------------------------------------------- |
| 閾値値が実運用と乖離       | 中     | 中       | 運用 3 か月後に見直し条項を文書に明記        |
| 命名規則の文書化漏れ       | 低     | 低       | 正規表現による命名バリデーション条項を含める |
| mirror sync 機構の仕様変更 | 中     | 低       | Phase 3 レビュー時に sync 機構最新状態を確認 |

## 完了条件

- [ ] D-1〜D-4 が単一の判定タイミングで確定している
- [ ] docs-only / NON_VISUAL / `verify_existing` と整合した evidence 方針が定義されている
- [ ] `outputs/phase-2/design.md` と `decision-matrix.md` の出力方針が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

- 設計決定 D-1〜D-4 のレビュー観点
- ポリシー文書構造のレビュー観点
- 不変条件・エラーハンドリングの妥当性確認観点
- 既存パターン整合性の最終検証項目
- Phase 3: 設計レビュー
