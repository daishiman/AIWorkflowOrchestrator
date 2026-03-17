# スキルフィードバックレポート

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| 文書       | Phase 12 - Task 5 成果物 |
| タスクID   | TASK-SKILL-LIFECYCLE-08  |
| 更新日     | 2026-03-17               |
| 改善提案数 | 4件                      |

---

## 1. 設計テンプレート改善

観察:

- Phase 2 を concern ごとに分割したことで、Phase 3/10 の指摘解決が追跡しやすかった。

提案:

- `phase-2-design.md` テンプレートに concern 分離基準を固定する。
  - 1-2 concern: 単一設計書
  - 3-4 concern: concern 分割
  - 5+ concern: サブタスク分割検討

---

## 2. レビューゲート改善

観察:

- 設計タスクではコード品質より「契約品質」の欠陥が主要リスク。

提案:

- Phase 3 / 10 に設計タスク専用の契約チェックを標準追加する。
  - 型ごとの前提条件/事後条件
  - IPCハンドラの Port 依存
  - DI境界表の明記
  - 受入基準トレーサビリティ

---

## 3. 依存タスク連携改善

観察:

- Task06/07 の出力を Task08 判定へ接続する変換点が明示されると、依存ドリフトが減る。

提案:

- 依存タスク連携を次の形で統一する。  
  `Task-N 出力型 -> Adapter -> Task-M 入力型 -> Port -> 判定結果`

---

## 4. Phase 12 実績同期改善

観察:

- 初回成果物で planned wording が残り、実更新済みの system spec と文書が矛盾した。

提案:

- docs-only タスクでも Phase 12 内の実更新を完了条件に固定する。
- `system-spec-update-summary.md` / `documentation-changelog.md` / `phase-12-documentation.md` の3ファイルは同一ターンで同期する。
- 完了前に以下を必須実行する。
  - `validate-phase11-screenshot-coverage`
  - `validate-phase12-implementation-guide`
  - `verify-unassigned-links`
  - `rg -n "未実施扱いの表現" outputs/phase-12/`
