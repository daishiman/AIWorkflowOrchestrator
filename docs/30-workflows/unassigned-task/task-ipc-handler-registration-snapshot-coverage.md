# IPC Handler Registration Snapshot Coverage - タスク指示書

## メタ情報

```yaml
issue_number: 2287
```

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001          |
| タスク名     | IPC handler registration snapshot coverage 拡張 |
| 分類         | 改善                                            |
| 対象機能     | desktop main IPC handler registration           |
| 優先度       | 中                                              |
| 見積もり規模 | 大規模                                          |
| ステータス   | 未実施                                          |
| 発見元       | Phase 12                                        |
| 発見日       | 2026-04-18                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`UT-IPC-HANDLER-CI-001` では `registerRuntimeSkillCreatorHandlers()` だけに対して登録スナップショットテストを導入した。ほかの `register*Handlers()` 群には同種の guard が未導入である。

### 1.2 問題点・課題

ハンドラ登録漏れや重複登録は対象関数ごとに再発する可能性がある。1 関数だけ coverage を上げても、main IPC 全体としては fail-fast にならない。

### 1.3 放置した場合の影響

別 handler 群で同種不具合が起きた場合、CI で即時検出できず、実行時障害やデバッグ工数増大につながる。

---

## 2. 何を達成するか（What）

### 2.1 目的

主要な `register*Handlers()` 関数に対して、登録一覧のスナップショット guard と重複検出テストを段階的に拡張する。

### 2.2 最終ゴール

優先対象 handler について、`ipcMain.handle()` / 必要に応じて `ipcMain.on()` の登録 surface が CI で継続監視される状態にする。

### 2.3 スコープ

#### 含むもの

- `registerSkillHandlers()` / `registerLLMHandlers()` を含む主要 handler の棚卸し
- 対象ごとの snapshot test 導入優先順位付け
- 既存テスト・CI 実行時間への影響評価

#### 含まないもの

- 今回の `UT-IPC-HANDLER-CI-001` への同梱実装
- UI/UX 変更

### 2.4 成果物

- 対象 handler 一覧
- 優先順位付き導入計画
- 必要なら分割後の個別 workflow

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `UT-IPC-HANDLER-CI-001` の成果物が確定していること
- 既存 main IPC テスト構成を把握していること

### 3.2 依存タスク

- `UT-IPC-HANDLER-CI-001`

### 3.3 必要な知識

- Electron `ipcMain.handle()` / `ipcMain.on()` の差分
- desktop main IPC handler の責務境界
- Vitest snapshot test 運用

### 3.4 推奨アプローチ

一括実装ではなく、handler 群を棚卸しして優先度順に 2〜3 wave へ分割する。CI 時間とテスト保守コストを先に見積もる。

---

## 4. 実行手順

### Phase構成

1. handler 棚卸し
2. 優先順位設計
3. wave ごとの workflow 化

### Phase 1: 対象整理

#### 目的

snapshot guard の導入対象と除外対象を切り分ける。

#### 手順

1. `apps/desktop/src/main/ipc/` 配下の `register*Handlers()` を列挙する
2. `handle` / `on` / mixed を分類する
3. 既存テスト有無と重複リスクを整理する

#### 成果物

対象一覧表

#### 完了条件

優先順位付け可能な棚卸しが完了している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 主要 handler の棚卸しが完了している
- [ ] 優先対象が明文化されている

### 品質要件

- [ ] CI コストと保守コストの評価がある
- [ ] `handle` / `on` の扱い差分が整理されている

### ドキュメント要件

- [ ] 個別 workflow へ分割する場合の方針がある

---

## 6. 検証方法

### テストケース

- 対象 handler 群で registration snapshot が有効かを机上検証する

### 検証手順

1. handler 棚卸し結果をレビューする
2. wave 分割が現実的か確認する

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                           |
| ------------------------------ | ------ | -------- | ---------------------------------------------- |
| 対象を広げすぎて CI が重くなる | 中     | 中       | wave 分割し、優先度の高い handler から導入する |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/UT-IPC-HANDLER-CI-001/outputs/phase-12/unassigned-task-detection.md`
- `apps/desktop/src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts`

### 参考資料

- `docs/30-workflows/UT-IPC-HANDLER-CI-001/outputs/phase-12/implementation-guide.md`

---

## 9. 備考

### 苦戦箇所【記入必須】

| 項目     | 内容                                                        |
| -------- | ----------------------------------------------------------- |
| 症状     | どの handler まで今回の task に含めるべきか境界が曖昧だった |
| 原因     | `register*Handlers()` 群は対象が広く、単一 task で閉じない  |
| 対応     | 大粒度の改善 task として切り出し、今回の scope 超過を防いだ |
| 再発防止 | snapshot coverage 拡張は専用 workflow として先に分離する    |

### 補足事項

今回の workflow では `registerRuntimeSkillCreatorHandlers()` の guard 導入に限定し、横展開は次 task へ委譲する。
