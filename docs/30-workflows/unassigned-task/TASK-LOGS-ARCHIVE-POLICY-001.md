# LOGS.md アーカイブポリシー詳細化 - タスク指示書

## メタ情報

```yaml
issue_number: 2282
```

## メタ情報

| 項目         | 内容                                                                  |
| ------------ | --------------------------------------------------------------------- |
| タスクID     | TASK-LOGS-ARCHIVE-POLICY-001                                          |
| タスク名     | LOGS.md アーカイブポリシー詳細化（threshold と archive 先の確定）     |
| 分類         | 改善                                                                  |
| 対象機能     | スキル管理 / LOGS.md 運用                                             |
| 優先度       | 中                                                                    |
| 見積もり規模 | 小規模                                                                |
| ステータス   | 未実施                                                                |
| 発見元       | Phase 12（TASK-CONFLICT-PREVENT-001 の unassigned-task-detection.md） |
| 発見日       | 2026-04-18                                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`.claude/skills/*/LOGS.md` および `.agents/skills/*/LOGS.md` にはスキル実行・更新の履歴ログが蓄積される。
現在、アーカイブの閾値（行数・ファイルサイズ・期間）と archive 先（`logs-archive-YYYY-MM.md` など）が未確定のまま運用されている。

`task-specification-creator/references/logs-archive-*.md` のパターンを参照すると、月次アーカイブの実績は存在する。
しかし統一ポリシーとして文書化されておらず、スキルごとに対応が属人化している。

### 1.2 問題点・課題

- アーカイブ閾値（行数・サイズ・期間）が明文化されていないため、いつアーカイブすべきかの判断基準がない
- archive 先のパス規則（`logs-archive-YYYY-MM.md` 等）が統一されていない
- LOGS.md が肥大化するほど worktree 間でのマージ差分が増大し、コンフリクトが頻発する
- コンフリクト解消コストが蓄積するにつれ、開発速度が低下する

### 1.3 放置した場合の影響

- LOGS.md の行数が際限なく増加し、worktree マージのたびにコンフリクト解消作業が発生する
- スキルの実行履歴が一つのファイルに混在し、直近のログを見つけにくくなる
- 将来的に LOGS.md のサイズがリポジトリのクローン・操作に影響を及ぼす可能性がある
- チームメンバーや AI エージェントがアーカイブ判断を誤り、重要ログを削除するリスクがある

---

## 2. 何を達成するか（What）

### 2.1 目的

LOGS.md のアーカイブポリシーを統一文書として確定し、`worktree` 間マージコンフリクトの抑制と
スキルログ運用の属人化解消を実現する。

### 2.2 最終ゴール

- アーカイブ閾値（行数・サイズ・期間）と archive 先パス規則が文書化されている
- `.claude/skills/` と `.agents/skills/` の両ディレクトリで同一ポリシーが適用される
- ポリシー文書が `aiworkflow-requirements` の references に収録されており、参照可能な状態になっている

### 2.3 スコープ

#### 含むもの

- アーカイブ閾値の調査・決定（行数・バイトサイズ・期間の候補比較）
- archive 先パス規則の確定（ファイル名フォーマット・ディレクトリ構成）
- ポリシー文書の作成（`.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md`）
- `.agents/skills/` mirror への同期（既存 mirror sync 機構を利用）
- 既存の `logs-archive-*.md` との整合性確認

#### 含まないもの

- アーカイブ作業の自動化スクリプト実装（別タスク推奨）
- 過去の LOGS.md への遡及適用（別タスク推奨）
- LOGS.md 以外のファイルのアーカイブポリシー策定

### 2.4 成果物

| 種別     | ファイル                                                                             |
| -------- | ------------------------------------------------------------------------------------ |
| 新規作成 | `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md`           |
| 同期     | `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md`（mirror） |
| 更新     | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`（参照追加）            |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `.claude/skills/*/LOGS.md` の現行サイズ・行数を把握していること
- `task-specification-creator/references/logs-archive-*.md` の既存パターンを確認済みであること
- mirror sync 機構（TASK-CONFLICT-PREVENT-001 で構築）が動作していること

### 3.2 依存タスク

| タスクID                  | 状態 | 内容                                        |
| ------------------------- | ---- | ------------------------------------------- |
| TASK-CONFLICT-PREVENT-001 | 完了 | worktree コンフリクト防止機構の構築（前提） |

### 3.3 必要な知識

- `git` の merge strategy（ours / theirs / custom driver）の基礎
- LOGS.md の記録フォーマットと既存 `logs-archive-*.md` パターン
- `.claude/skills/` と `.agents/skills/` の mirror sync 仕組み

### 3.4 推奨アプローチ

1. 既存の `logs-archive-*.md` を調査し、使用中のファイル名パターンと内容構造を把握する
2. 現行 LOGS.md の最大行数・バイトサイズを計測し、アーカイブ閾値の候補を 3 案程度挙げる
3. 月次アーカイブ（300 行超 or 30 KB 超）を基準案として採用し、ポリシー文書を作成する
4. ポリシー文書を `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` に配置する
5. mirror sync 機構を使って `.agents/skills/` 側に同期する
6. `topic-map.md` に参照を追加する

---

## 4. 実行手順

### Phase 構成

| Phase | 内容                   | 目安 |
| ----- | ---------------------- | ---- |
| 1     | 調査・閾値候補の選定   | 1h   |
| 2     | ポリシー文書の作成     | 1h   |
| 3     | 同期・インデックス更新 | 0.5h |

### Phase 1: 調査・閾値候補の選定

#### 目的

現状を計測し、統一閾値とパス規則の基準を確定する。

#### 手順

1. `.claude/skills/` 配下の全 LOGS.md のファイルサイズと行数を計測する
2. `task-specification-creator/references/logs-archive-*.md` のファイル名パターンを確認する
3. 閾値の候補を行数・サイズ・期間の 3 軸で 2〜3 案比較し、採用案を決定する

#### 成果物

- 調査メモ（閾値候補の比較表）

#### 完了条件

- 閾値の採用案（例: 300 行超 or 30 KB 超で月次アーカイブ）が確定している

### Phase 2: ポリシー文書の作成

#### 目的

アーカイブポリシーを単一の参照文書として記述する。

#### 手順

1. 以下の項目を含む `logs-archive-policy.md` を作成する
   - アーカイブ閾値（行数・バイトサイズ・期間）
   - archive 先のパス規則（`logs-archive-YYYY-MM.md`）
   - アーカイブ手順の説明
   - `.claude/skills/` と `.agents/skills/` 両方への適用指針
2. 既存の `logs-archive-*.md` と矛盾がないことを確認する

#### 成果物

- `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md`

#### 完了条件

- 閾値・パス規則・手順の 3 要素が文書に含まれている

### Phase 3: 同期・インデックス更新

#### 目的

ポリシー文書を mirror 側に同期し、検索可能な状態にする。

#### 手順

1. mirror sync 機構を使って `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` に同期する
2. `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` に `logs-archive-policy.md` への参照を追加する

#### 成果物

- `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md`（mirror）
- 更新済み `topic-map.md`

#### 完了条件

- mirror 側に `logs-archive-policy.md` が存在する
- `topic-map.md` からポリシー文書を参照できる

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] アーカイブ閾値（行数・サイズ・期間）が明文化されている
- [ ] archive 先パス規則（ファイル名フォーマット）が確定している
- [ ] `.claude/skills/` と `.agents/skills/` の両方に適用できる統一ポリシーが文書化されている

### 品質要件

- [ ] 既存の `logs-archive-*.md` パターンと矛盾しない
- [ ] ポリシー文書が `topic-map.md` からリンクされている

### ドキュメント要件

- [ ] `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` が存在する
- [ ] `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` が mirror として存在する

---

## 6. 検証方法

### テストケース

| 確認項目                               | 確認方法                                                                          |
| -------------------------------------- | --------------------------------------------------------------------------------- |
| ポリシー文書に閾値・パス規則が含まれる | `logs-archive-policy.md` を読み、閾値セクションとパス規則セクションが存在する     |
| mirror に同期されている                | `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` が存在 |
| `topic-map.md` から参照できる          | `topic-map.md` 内に `logs-archive-policy` の記述があることを確認                  |

### 検証コマンド例

```bash
# ポリシー文書の存在確認
ls .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md
ls .agents/skills/aiworkflow-requirements/references/logs-archive-policy.md

# topic-map.md への追記確認
grep "logs-archive-policy" .claude/skills/aiworkflow-requirements/indexes/topic-map.md
```

---

## 7. リスクと対策

| リスク                                              | 影響度 | 発生確率 | 対策                                                                     |
| --------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------ |
| 閾値が低すぎて頻繁なアーカイブ操作が発生する        | 中     | 中       | 300 行・30 KB 程度を起点とし、3 か月運用後に見直す余地を文書に明記する   |
| 既存 `logs-archive-*.md` のパターンと命名が衝突する | 低     | 低       | Phase 1 で事前調査し、既存パターンを踏襲する形で命名規則を統一する       |
| mirror sync が失敗し `.agents/` 側が更新されない    | 中     | 低       | mirror sync 後に `ls` で存在確認するステップを Phase 3 に含める          |
| ポリシー文書が実態と乖離して形骸化する              | 中     | 中       | ポリシー文書に「最終更新日」と「見直しサイクル（6 か月推奨）」を記載する |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/logs-archive-*.md`（既存アーカイブパターン）
- `docs/30-workflows/conflict-prevent-skills-001/`（TASK-CONFLICT-PREVENT-001 の成果物）
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`

### 関連ファイル

- `.claude/skills/*/LOGS.md`（アーカイブ対象）
- `.agents/skills/*/LOGS.md`（アーカイブ対象・mirror 側）

---

## 9. 備考

### 苦戦箇所【記入必須】

| 症状                                                         | 原因                                                                       | 対応                                                  | 再発防止                                                                                      |
| ------------------------------------------------------------ | -------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| LOGS.md が worktree 間で diff が大きくなりコンフリクトが頻発 | アーカイブ閾値が未確定で LOGS.md が肥大化し続けていた                      | worktree マージのたびに手動でコンフリクト解消         | 本タスクでポリシーを確定し、一定サイズを超えた時点でアーカイブを実施するよう明文化            |
| いつアーカイブすべきかの判断ができなかった                   | archive threshold が不明なため、アーカイブタイミングの基準が存在しなかった | 判断を保留し、肥大化した LOGS.md をそのまま使い続けた | ポリシー文書に明確な閾値（行数・サイズ・期間）を記載し、AI エージェントも参照できるようにする |
