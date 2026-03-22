# Phase 4: テスト作成

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 4                             |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |

## 目的

Phase 2 設計に基づき、SkillFileWriter.persist() のユニットテスト・ディレクトリ構造生成テスト・既存ファイル上書きガードテストを TDD（テストファースト）で作成する。

## 実行タスク

1. **テストファイル配置確認**
   - 既存テストファイルのインポートパスを参照し（P63 対策）、同パターンで新規テストを配置する
   - `apps/desktop/src/main/services/skill/__tests__/SkillFileWriter.test.ts` に作成する
   - 既存テストの `import` 行を `grep -n "^import" src/main/services/skill/__tests__/SkillService.test.ts` 等で確認する
2. **基本機能テスト**
   - `persist()` が `.claude/skills/{skillName}/SKILL.md` を正しく書き込むことをテストする
   - `persist()` が `agents/{name}.md` を正しく書き込むことをテストする
   - `persist()` が `scripts/{name}` を正しく書き込むことをテストする
   - `persist()` が `references/{name}.md` を正しく書き込むことをテストする
   - `persist()` の戻り値（`{ skillPath, files }`）が正しいことをテストする
3. **ディレクトリ構造生成テスト**
   - `agents/` / `scripts/` / `references/` サブディレクトリが自動作成されることをテストする
   - 空の agents / scripts / references（配列長0）でもエラーにならないことをテストする
4. **既存ファイル上書きガードテスト**
   - 同名スキルが既に存在する場合に `SKILL_ALREADY_EXISTS` エラーが返ることをテストする
   - `overwrite: true` オプション指定時は上書きが許可されることをテストする
5. **パストラバーサル防止テスト（スケルトン、Phase 6 で拡充）**
   - `../malicious` などのスキル名でエラーが返ることをスケルトンとして記述する

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/04-phase-02-design.md`
- `docs/30-workflows/skill-creator-llm-integration/04-phase-03-design-review.md`
- `apps/desktop/src/main/services/skill/__tests__/`（既存テストのインポートパス参照）

## 成果物

- `apps/desktop/src/main/services/skill/__tests__/SkillFileWriter.test.ts`

## 完了条件

- [ ] 既存テストのインポートパスを参照してから新規テストを作成した（P63 対策）
- [ ] `persist()` の正常系テスト（SKILL.md / agents / scripts / references の書き込み）が記述されている
- [ ] ディレクトリ自動作成テストが記述されている
- [ ] 既存スキル上書きガードテストが記述されている
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillFileWriter.test.ts` でテストが実行できる（Red 状態で可）

## 次のPhase

Phase 5: 実装
