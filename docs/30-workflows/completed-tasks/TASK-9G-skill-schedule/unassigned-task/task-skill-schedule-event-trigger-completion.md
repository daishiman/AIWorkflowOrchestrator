# UT-9G-002: event スケジュール（file_change / git_commit）実行対応

## メタ情報

```yaml
issue_number: null
task_id: UT-9G-002
task_name: event スケジュール（file_change / git_commit）実行対応
category: 改善
target_feature: skill schedule（event 実行）
priority: 低
scale: 中規模
status: 未実施
source_phase: TASK-9G Phase 12 未タスク検出
created_date: 2026-02-27
```

| 項目         | 値                                                     |
| ------------ | ------------------------------------------------------ |
| タスクID     | UT-9G-002                                              |
| タスク名     | event スケジュール（file_change / git_commit）実行対応 |
| 分類         | 改善                                                   |
| 対象機能     | event schedule                                         |
| 優先度       | 低                                                     |
| 見積もり規模 | 中規模                                                 |
| ステータス   | 未実施                                                 |
| 発見元       | TASK-9G Phase 12                                       |
| 発見日       | 2026-02-27                                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

event 方式は `app_start` のみ実装済みで、`file_change` / `git_commit` はプレースホルダーのまま。

### 1.2 問題点・課題

event を選択しても一部条件で実行されず、機能仕様と実装が部分不一致になっている。

### 1.3 放置した場合の影響

将来 UI 公開時に「設定できるが動かない」状態となり、運用上の混乱を招く。

---

## 2. 何を達成するか（What）

### 2.1 目的

`file_change` / `git_commit` トリガーでスキル自動実行できる状態にする。

### 2.2 最終ゴール

event 3種（app_start/file_change/git_commit）が仕様通り動作し、検証テストが整備される。

### 2.3 スコープ

#### 含むもの

- event リスナー実装拡張
- 最低限の設定項目定義
- テスト追加

#### 含まないもの

- 高度な監視UI
- 外部サービス連携

### 2.4 成果物

- `SkillScheduler.ts` event実装
- 関連テスト
- 仕様書更新

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- event 方式仕様の再確認
- 監視対象ディレクトリ/リポジトリの定義

### 3.2 依存タスク

- なし

### 3.3 必要な知識

- ファイル監視
- Gitフック/差分検知

### 3.4 推奨アプローチ

1. `eventConfig` の最小スキーマ定義
2. `file_change` を先行実装
3. `git_commit` を同一パターンで実装

---

## 4. 実行手順

### Phase構成

- Phase A: 設計
- Phase B: 実装
- Phase C: 検証

### Phase A: 設計

#### 目的

event ごとの実行条件と設定項目を確定する。

#### 手順

1. `eventConfig` 項目を定義
2. トリガー発火条件を明文化
3. セキュリティ/負荷方針を確認

#### 成果物

- 設計メモ

#### 完了条件

- 各 event の入力・出力が定義済み

### Phase B: 実装

#### 目的

2種類の未実装 event を有効化する。

#### 手順

1. `registerEventListener()` を拡張
2. 実行デバウンス等のガード追加
3. 実行結果記録を統合

#### 成果物

- 実装差分

#### 完了条件

- `file_change` と `git_commit` で実行される

### Phase C: 検証

#### 目的

event 実行の再現性を確認する。

#### 手順

1. ユニットテスト追加
2. 手動検証シナリオ実施
3. 仕様書更新

#### 成果物

- テスト記録

#### 完了条件

- event 3種のテストが PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `file_change` 実行が可能
- [ ] `git_commit` 実行が可能

### 品質要件

- [ ] 連続イベント時の過剰実行ガードあり
- [ ] 実行履歴と nextRun の整合維持

### ドキュメント要件

- [ ] 関連仕様書を更新
- [ ] 台帳を更新

---

## 6. 検証方法

### テストケース

- ファイル変更で1回実行
- Gitコミットで1回実行
- disabled 状態で未実行

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run apps/desktop/src/main/services/skill/__tests__/SkillScheduler.test.ts
```

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                        |
| ------------------------ | ------ | -------- | --------------------------- |
| 監視対象が広すぎて高負荷 | 中     | 中       | 監視範囲の明示設定          |
| 誤検知で実行過多         | 中     | 中       | デバウンス/クールダウン導入 |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

### 参考資料

- `apps/desktop/src/main/services/skill/SkillScheduler.ts`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
file_change と git_commit は将来実装コメントのみで未実装。
```

### 補足事項

- Phase 1 でスコープ外扱いだったが、機能品質向上のため未タスク化。
