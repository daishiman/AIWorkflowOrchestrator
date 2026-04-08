# IPC surface 追加時のテンプレートチェックリスト改善 - タスク指示書

## メタ情報

```yaml
issue_number: 2063
```

## メタ情報

| 項目         | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| タスクID     | TASK-SC-TEMPLATE-IPC-WHITELIST-001                      |
| タスク名     | IPC surface 追加時のテンプレートチェックリスト改善      |
| 分類         | 改善                                                    |
| 対象機能     | task-specification-creator skill / IPC チャネル追加手順 |
| 優先度       | 低                                                      |
| 見積もり規模 | 小規模                                                  |
| ステータス   | 未着手                                                  |
| 発見元       | TASK-SC-13 Phase 12 スキルフィードバックレポート        |
| 発見日       | 2026-04-08                                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SC-13（`skill-creator:verify` チャネル実装）の Phase 12 フィードバックとして、
IPC surface 追加時のテンプレートに2点の抜け漏れが確認された。

### 1.2 問題点・課題

**問題1: preload whitelist チェックの欠落**

- `apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` への追加が
  チェックリスト化されていないため、実装者が見落としやすい
- IPC チャネルを実装しても preload whitelist に追加しなければ renderer からは使えない
- 今回は実装時に漏れが発生し、後工程で発見した

**問題2: 公開 method と内部 util の差分記述欄がない**

- `RuntimeSkillCreatorFacade` に `verifySkill(skillDir)` という内部 util が既存の場合、
  公開 IPC method `verifySkill(skillName)` との引数差分が設計書に明記されていない
- 同名に近い関数が2つ存在するとレビュー時に混同しやすい

### 1.3 放置した場合の影響

- IPC チャネル追加タスクのたびに同じ見落としが再発する
- whitelist 漏れは runtime エラー（`invoke channel not allowed`）として本番で初めて検出される
- 設計書の読み手が公開/内部 API を混同し、誤った実装をする可能性

---

## 2. 何を達成するか（What）

### 2.1 目的

task-specification-creator skill の IPC チャネル追加テンプレートを改善し、
whitelist 更新と public/internal method 差分の記述を標準化する。

### 2.2 最終ゴール

- IPC チャネル追加タスクの Phase 2（設計）チェックリストに whitelist 追加手順を必須項目として追加
- Phase 2 成果物テンプレートに「公開 IPC method vs 内部 util」の差分記述欄を追加
- 既存のテンプレートファイルを更新し、次の IPC タスクから自動的に適用される状態

### 2.3 スコープ

#### 含むもの

- `.claude/skills/task-specification-creator/references/` 配下の IPC 関連テンプレート更新
- `phase-2-design.md` テンプレートへの whitelist チェック項目追加
- `phase-2-design.md` テンプレートへの public/internal method 差分記述欄追加
- LOGS.md への変更記録

#### 含まないもの

- 既存タスク仕様書の遡及修正
- IPC チャネル一覧ドキュメントの作成
- whitelist 自動チェックスクリプトの実装

### 2.4 成果物

| 成果物                   | パス                                                                       |
| ------------------------ | -------------------------------------------------------------------------- |
| IPC 設計テンプレート更新 | `.claude/skills/task-specification-creator/references/` 配下の関連ファイル |
| LOGS.md 変更記録         | `.claude/skills/task-specification-creator/LOGS.md`                        |

---

## 3. 苦戦箇所（Lessons Learned）

### TASK-SC-13 での発見

| 箇所                       | 困難度 | 内容                                                                                          |
| -------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| preload whitelist 同期忘れ | 低     | `ALLOWED_INVOKE_CHANNELS` に verify を追加する手順がチェックリスト化されていなかった          |
| 公開/内部 method の混在    | 中     | `verifySkill(skillDir)` 内部 util と `verifySkill(skillName)` 公開 API の差分が設計書に未記載 |

### 再発防止策

- テンプレートのチェックリストに `shared / preload / main / DTO mapping` の4層を明示する
- Phase 2 成果物に「公開 surface 定義」と「内部 util との対応表」を必須化する

---

## 4. 実装ステップ

### Phase 1: 要件定義

- 現在の IPC 設計テンプレートを読んで不足箇所を特定する
- whitelist チェック項目の具体的な記述方法を決定する

### Phase 2: 設計

- テンプレートの変更箇所を特定する
- 追加する記述欄のフォーマットを設計する

### Phase 5: 実装

- テンプレートファイルを更新する
- LOGS.md に変更を記録する

### Phase 12: ドキュメント更新

- 変更内容を implementation-guide.md に記録する
- skill-feedback-report.md に改善効果を記録する
