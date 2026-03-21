# 統合ゲート確認

## メタ情報

| 項目       | 値                                                                 |
| ---------- | ------------------------------------------------------------------ |
| Phase      | 7 - カバレッジ確認                                                 |
| タスク     | TASK-02-RUNTIME-POLICY-CENTRALIZATION                              |
| 作成日     | 2026-03-21                                                         |
| 前提成果物 | phase-4/validation-matrix.md, phase-6/regression-expansion-plan.md |

---

## Phase 4-6 テスト観点の網羅確認

### Unit テスト（Ownership 4カテゴリ全対象）

| カテゴリ         | Phase 4 対応                  | Phase 6 補完           | 判定 |
| ---------------- | ----------------------------- | ---------------------- | ---- |
| runtime 実行可否 | validation-matrix AC-1 ~ AC-3 | E-1 ~ E-6 境界条件追加 | 充足 |
| health check     | validation-matrix AC-4        | E-7 タイムアウト境界   | 充足 |
| handoff bundle   | validation-matrix AC-5 ~ AC-6 | シナリオ A/B/C 追加    | 充足 |
| authMode 参照    | validation-matrix AC-7        | E-1, E-9 境界条件追加  | 充足 |

### Integration テスト（surface 横断シナリオ）

| シナリオ                         | Phase 4 定義 | Phase 6 拡充      | 判定 |
| -------------------------------- | ------------ | ----------------- | ---- |
| Chat → Agent → Skill 連続実行    | -            | シナリオ A で追加 | 充足 |
| 中途 blocked の非伝播            | -            | シナリオ B で追加 | 充足 |
| contextSummary の surface 名検証 | -            | シナリオ C で追加 | 充足 |

### Edge Case テスト（4境界条件）

| 境界条件            | Phase 4 定義 | Phase 6 定義           | 判定 |
| ------------------- | ------------ | ---------------------- | ---- |
| authMode 未定義     | -            | E-1                    | 充足 |
| apiKey 不正         | -            | E-2 ~ E-6（5パターン） | 充足 |
| health タイムアウト | -            | E-7                    | 充足 |
| surface 未知値      | -            | E-8                    | 充足 |

### 回帰テスト（Pitfall 対応）

| Pitfall | 観点                    | Phase 6 対応                  | 判定 |
| ------- | ----------------------- | ----------------------------- | ---- |
| P31     | Zustand 無限ループ      | regression-expansion-plan 1.1 | 充足 |
| P48     | useShallow 未適用       | regression-expansion-plan 1.2 | 充足 |
| P50     | 既実装防御の発見        | regression-expansion-plan 1.3 | 充足 |
| P64     | surface 未知値 fallback | regression-expansion-plan 1.4 | 充足 |
| P65     | 連続呼び出し冪等性      | regression-expansion-plan 1.5 | 充足 |

---

## 総合判定

| 観点             | 判定   | 備考                                    |
| ---------------- | ------ | --------------------------------------- |
| Unit             | 充足   | 4カテゴリ全対象、境界条件 9パターン網羅 |
| Integration      | 充足   | surface 横断 3シナリオ定義済み          |
| Edge case        | 充足   | 4境界条件全てカバー                     |
| 回帰             | 充足   | P31/P48/P50/P64/P65 の5件対応済み       |
| **Phase 8 進行** | **可** | カバレッジ目標と統合ゲートの両方を充足  |
