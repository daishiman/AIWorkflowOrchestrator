# UT-9G-004: SkillScheduler graceful shutdown 実装

## メタ情報

```yaml
issue_number: null
task_id: UT-9G-004
task_name: SkillScheduler graceful shutdown 実装
category: 改善
target_feature: skill schedule（終了処理）
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-9G Phase 12 未タスク検出
created_date: 2026-02-27
```

| 項目         | 値                                    |
| ------------ | ------------------------------------- |
| タスクID     | UT-9G-004                             |
| タスク名     | SkillScheduler graceful shutdown 実装 |
| 分類         | 改善                                  |
| 対象機能     | scheduler shutdown                    |
| 優先度       | 低                                    |
| 見積もり規模 | 小規模                                |
| ステータス   | 未実施                                |
| 発見元       | TASK-9G Phase 12                      |
| 発見日       | 2026-02-27                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

設計上は終了時クリーンアップが想定されているが、実装には `shutdown()` がない。

### 1.2 問題点・課題

アプリ終了時にタイマー停止を明示できず、終了手順が暗黙動作依存になっている。

### 1.3 放置した場合の影響

将来の終了フック拡張時に副作用調査コストが増える。

---

## 2. 何を達成するか（What）

### 2.1 目的

Scheduler の終了処理を明文化し、明示的にジョブ停止できるようにする。

### 2.2 最終ゴール

`shutdown()` が実装され、`before-quit` 連携で安全停止できる。

### 2.3 スコープ

#### 含むもの

- `shutdown()` 実装
- 全 activeJobs 停止
- 連携テスト

#### 含まないもの

- アプリ全体終了シーケンスの全面改修

### 2.4 成果物

- `SkillScheduler.ts` 追加メソッド
- IPC 初期化側の終了フック連携（必要時）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `activeJobs` 管理が現仕様で維持されていること

### 3.2 依存タスク

- なし

### 3.3 必要な知識

- Electron app lifecycle
- Timer cleanup

### 3.4 推奨アプローチ

1. `shutdown()` で `deactivateSchedule` を全IDへ適用
2. 終了フックから await 呼び出し
3. 二重呼び出し安全性をテスト

---

## 4. 実行手順

### Phase構成

- Phase A: 設計
- Phase B: 実装
- Phase C: 検証

### Phase A: 設計

#### 目的

終了時責務の境界を決める。

#### 手順

1. 呼び出し元責務（ipc/index or app lifecycle）を決定
2. 多重呼び出し挙動を定義
3. 例外時方針を定義

#### 成果物

- 仕様メモ

#### 完了条件

- 終了手順が確定

### Phase B: 実装

#### 目的

停止処理をコードに反映する。

#### 手順

1. `shutdown()` 実装
2. 終了イベント連携
3. ログ出力整理

#### 成果物

- 実装差分

#### 完了条件

- 実行中ジョブが停止される

### Phase C: 検証

#### 目的

終了時の安定性を確認する。

#### 手順

1. ユニットテスト
2. 手動終了確認
3. 仕様書更新

#### 成果物

- 検証記録

#### 完了条件

- 終了時にリークなし

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] shutdown で全ジョブ停止
- [ ] 二重呼び出しでも安全

### 品質要件

- [ ] 例外で終了処理全体が止まらない
- [ ] 回帰テスト PASS

### ドキュメント要件

- [ ] 終了フローを仕様書へ反映

---

## 6. 検証方法

### テストケース

- activeJobs 複数件停止
- activeJobs 0件停止

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run apps/desktop/src/main/services/skill/__tests__/SkillScheduler.test.ts
```

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                        |
| -------------------------- | ------ | -------- | --------------------------- |
| 停止途中で例外             | 中     | 低       | 個別停止を try/catch で保護 |
| app lifecycle との責務重複 | 低     | 中       | 呼び出し点を1か所に固定     |

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
shutdown() が未実装で、終了時クリーンアップが暗黙動作に依存している。
```

### 補足事項

- 優先度は低いが運用品質観点で実施推奨。
