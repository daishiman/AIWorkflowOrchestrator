# UT-9G-001: SkillScheduler cron 次回実行時刻の精度改善

## メタ情報

```yaml
issue_number: null
task_id: UT-9G-001
task_name: SkillScheduler cron 次回実行時刻の精度改善
category: 改善
target_feature: skill schedule（nextRun 計算）
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-9G Phase 12 未タスク検出
created_date: 2026-02-27
```

| 項目         | 値                                         |
| ------------ | ------------------------------------------ |
| タスクID     | UT-9G-001                                  |
| タスク名     | SkillScheduler cron 次回実行時刻の精度改善 |
| 分類         | 改善                                       |
| 対象機能     | skill schedule nextRun                     |
| 優先度       | 中                                         |
| 見積もり規模 | 小規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | TASK-9G Phase 12                           |
| 発見日       | 2026-02-27                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9G では cron スケジュール実行を追加したが、`nextRun` 計算は暫定実装（現在時刻+1分）になっている。

### 1.2 問題点・課題

cron 式と無関係な時刻が表示されるため、スケジュール一覧の次回実行時刻が実態とずれる。

### 1.3 放置した場合の影響

ユーザーが実行タイミングを誤認し、運用トラブルや信頼低下につながる。

---

## 2. 何を達成するか（What）

### 2.1 目的

cron 式から正しい次回実行時刻を算出し、`nextRun` を実行実態と一致させる。

### 2.2 最終ゴール

`calculateNextRun()` が cron 式に基づく日時を返し、テストで主要パターンを検証できる。

### 2.3 スコープ

#### 含むもの

- `SkillScheduler.calculateNextRun()` の cron 算出改善
- 必要ライブラリ導入（例: `cron-parser`）
- 単体テスト追加/更新

#### 含まないもの

- UI 表示のデザイン変更
- event 方式拡張

### 2.4 成果物

- `SkillScheduler.ts` 修正
- `SkillScheduler.test.ts` 追加テスト
- Phase成果物の更新記録

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-9G の実装が最新であること
- `pnpm` で依存追加が可能なこと

### 3.2 依存タスク

- なし

### 3.3 必要な知識

- cron 式
- TypeScript テスト実装（Vitest）

### 3.4 推奨アプローチ

1. cron 算出ライブラリ導入
2. 既存 `calculateNextRun()` を方式ごとに維持しつつ cron 部分のみ差し替え
3. テストで複数 cron パターンを固定時刻で検証

---

## 4. 実行手順

### Phase構成

- Phase A: 設計
- Phase B: 実装
- Phase C: 検証

### Phase A: 設計

#### 目的

算出ロジックとタイムゾーン方針を確定する。

#### 手順

1. 導入候補ライブラリを選定
2. UTC 基準で算出する方針を決定
3. 既存仕様書との契約確認

#### 成果物

- 算出方針メモ

#### 完了条件

- 算出方式と境界条件が決まっている

### Phase B: 実装

#### 目的

cron 式から正確に `nextRun` を計算する。

#### 手順

1. 依存追加
2. `calculateNextRun()` を修正
3. 例外時フォールバックを定義

#### 成果物

- 実装修正

#### 完了条件

- `nextRun` が cron 式に準拠して算出される

### Phase C: 検証

#### 目的

算出精度と既存機能非回帰を確認する。

#### 手順

1. 単体テスト追加
2. 既存テスト実行
3. ドキュメント更新

#### 成果物

- テスト結果

#### 完了条件

- 追加/既存テストが PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] cron 次回実行時刻が正しく計算される
- [ ] 例外時のエラー挙動が定義される

### 品質要件

- [ ] 単体テストで複数パターンを網羅
- [ ] 既存スケジュール方式へ回帰なし

### ドキュメント要件

- [ ] 関連仕様書の `nextRun` 記述を更新
- [ ] タスク台帳を更新

---

## 6. 検証方法

### テストケース

- 毎日実行 cron
- 平日実行 cron
- 月次実行 cron

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run apps/desktop/src/main/services/skill/__tests__/SkillScheduler.test.ts
pnpm --filter @repo/desktop typecheck
```

---

## 7. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                       |
| ------------------ | ------ | -------- | -------------------------- |
| ライブラリ依存増加 | 低     | 中       | 依存最小化とバージョン固定 |
| タイムゾーン差異   | 中     | 中       | UTC固定テストを追加        |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-12/unassigned-task-detection.md`

### 参考資料

- `apps/desktop/src/main/services/skill/SkillScheduler.ts`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
calculateNextRun の cron 実装が暫定（現在時刻+1分）であり、実行予定時刻の表示精度が不足している。
```

### 補足事項

- TASK-9G の Phase 12 で検出した未タスクを正式登録したもの。
