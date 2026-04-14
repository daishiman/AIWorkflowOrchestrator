# Phase 2 成果物: テスト戦略

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## テスト方針

1. **TDD（Red→Green）**: Phase 4で失敗テストを先に定義し、Phase 5実装後にGreenへ移行する
2. **統合テスト優先**: SkillCreateWizard.test.tsxに統合テストを追加する
3. **正規フロー固定**: Step 0→1→2→3の通過を必須とする
4. **旧残骸検出**: `generationMode` / `hasActivatedLlmMode` のコード残骸をテストで検出する

## テストケース一覧（Phase 4）

| TC-ID | 種別         | シナリオ                                | 期待結果           |
| ----- | ------------ | --------------------------------------- | ------------------ |
| TC-01 | 削除確認     | Step 0にラジオボタンが表示されない      | null               |
| TC-02 | 廃止確認     | `generation-mode-selector` が存在しない | null               |
| TC-03 | 遷移確認     | Step 0次へでStep 1に遷移                | Step 1表示         |
| TC-04 | スキップ禁止 | Step 0次へ後にStep 2が表示されない      | Step 1維持         |
| TC-05 | 正規フロー   | Step 0→1→2→3の順番で通過                | 各Stepが表示される |
| TC-06 | 残骸ゼロ     | generationMode参照がコードにない        | 0件                |

## テストファイル配置

- 新テスト: `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`
  - 既存テストに TC-01〜TC-06 を追加
- スキップ済み: `SkillCreateWizard.llm-generation.test.tsx`（`describe.skip`で全テストスキップ済み）

## テストツール

- Vitest
- @testing-library/react
- happy-dom
- fireEvent（userEvent禁止: happy-dom環境）
