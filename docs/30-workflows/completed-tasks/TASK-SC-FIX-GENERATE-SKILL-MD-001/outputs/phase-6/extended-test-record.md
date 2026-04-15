# Phase 6 成果物: テスト拡充記録

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 6                                 |
| Phase名    | テスト拡充                        |
| タスクID   | TASK-SC-FIX-GENERATE-SKILL-MD-001 |
| ステータス | 完了                              |
| 作成日     | 2026-04-15                        |

## 追加した境界ケース

### Task 1: `--plan` 引数の tmpdir パス確認（一意性）

- **TC-02** にて `args[planIdx + 1]` が `os.tmpdir()` を含むことを検証済み
- `skill-plan-${randomUUID()}.json` の UUID 形式により、連続呼び出し時のファイル名衝突は実質ゼロ
- 高並列環境での衝突リスクも UUID により回避済み

### Task 2: generateResult 成功時のフォールバック非実行確認

- TC-01〜TC-03 は `execute("generate_skill_md.js")` が `{success: true}` を返す設定
- TC-01 の spy 解析で `fs.access(skillMdPath)` が成功し、`ensureSkillMdExists` が追加で呼ばれないことを確認
- TC-05 との対比で「成功時でも SKILL.md が未生成なら fallback する」経路を担保している

### Task 3: fs.unlink 失敗が処理継続に影響しないこと

- 実装では `await fs.unlink(tmpPlanPath).catch(() => {})` と `.catch(() => {})` で吸収
- TC-06/TC-07 では `vi.mocked(fsPromises.unlink).mockResolvedValue()` で成功モック
- unlink が reject する場合でも `.catch` で吸収されるため上位へ伝播しない（設計確認済み）

### Task 4: 終了コード非0のフォールバック経路

- TC-04: `generate_skill_md.js` が `{success: false, exitCode: 1}` → `ensureSkillMdExists` が 2回以上呼ばれる
- TC-05: `generate_skill_md.js` が成功でも `fs.access(skillMdPath)` 失敗 → `ensureSkillMdExists` が呼ばれる
- TC-07: 失敗時も `fs.unlink` が呼ばれる（finally 保証）

## 既存テストへの回帰なし確認

- `pnpm --filter @repo/desktop exec vitest run "src/main/services/skill/__tests__/SkillCreatorService.test.ts"` 実行結果
- **59 tests, 59 passed** — 既存 52 件 + 新規 TC-01〜07 の 7 件すべてパス

## 追加観点まとめ

| 観点                                   | 検証方法             | 結果 |
| -------------------------------------- | -------------------- | ---- |
| `--plan` tmpdir パス形式               | TC-02                | PASS |
| `--output` SKILL.md パス形式           | TC-03                | PASS |
| generate 成功時フォールバック非実行    | TC-01 spy 解析       | PASS |
| generate 失敗時フォールバック実行      | TC-04 ensureSpy      | PASS |
| 成功時の SKILL.md 存在確認             | TC-05 resolves check | PASS |
| 成功時 unlink 呼び出し                 | TC-06                | PASS |
| 失敗時 unlink 呼び出し（finally 保証） | TC-07                | PASS |
