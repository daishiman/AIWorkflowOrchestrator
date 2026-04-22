# manual-test-checklist.md — Phase 11 手動テストチェックリスト

> タスクID: UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001  
> 作成日: 2026-04-21  
> フェーズ: Phase 11（手動テスト）

---

## テスト方式

UI/UX 変更なしのため Phase 11 スクリーンショット不要。`manual-test-result.md` を一次ソースとする。

---

## チェックリスト

### `levels` 関連

- [x] §3 対照テーブルの `levels` 行が「静的オブジェクト」表現になっている
- [x] §3.4 が存在し、`levels.{N}` の静的オブジェクト構造が定義されている
- [x] `LevelEntry` の `name` / `requirements.*` が required として明記されている
- [x] `description` / `unlocked` が optional として明記されている
- [x] `skill-fixture-runner` の非保持ケースが明記されている
- [x] writer / reader が明示されている
- [x] `levelHistory`（v2）との比較が断定なしで記述されている

### `average_satisfaction` 関連

- [x] §3.3 が存在し、`average_satisfaction` が独立定義されている
- [x] 型 `number` が明記されている
- [x] 観測値 `0` / `4.5` が記録されている
- [x] 固定値域は断定しないと明記されている
- [x] v1 固有（v2 対応なし）が明記されている
- [x] `skill-fixture-runner` の非保持ケースが明記されている

### v1/v2 関係・parity

- [x] §3.1 断定なし方針が変更されていない
- [x] dual root parity（`diff -qr` 差分ゼロ）が確認されている
- [x] §2（camelCase v2 定義）が変更されていない
