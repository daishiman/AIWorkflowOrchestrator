# Phase 4: テスト作成

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 4                             |
| 機能名   | w3a-sc-output-persistence     |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |
| 更新日   | 2026-03-23                    |

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

- `docs/30-workflows/w3a-sc-output-persistence/phase-02-design-output.md`（設計書 - テストパターン表・エラーハンドリング表を参照）
- `docs/30-workflows/w3a-sc-output-persistence/phase-03-review-output.md`（設計レビュー - パストラバーサル9パターン確認済み）
- `apps/desktop/src/main/services/skill/__tests__/`（既存テストのインポートパス参照）

## テストインポートパターン（P63 対策: 既存テストから確認済み）

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SkillFileWriter } from "../SkillFileWriter";
import type { SkillGeneratedContent } from "@repo/shared";
```

## 成果物

- `apps/desktop/src/main/services/skill/__tests__/SkillFileWriter.test.ts`

## 完了条件

- [ ] 既存テストのインポートパスを参照してから新規テストを作成した（P63 対策）
- [ ] `persist()` の正常系テスト（SKILL.md / agents / scripts / references の書き込み）が記述されている
- [ ] ディレクトリ自動作成テストが記述されている
- [ ] 既存スキル上書きガードテストが記述されている
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillFileWriter.test.ts` でテストが実行できる（Red 状態で可）
- [ ] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携（Phase 1〜11は必須）

本Phaseはテスト作成フェーズであり、テストコードを新規作成する。TDD の Red フェーズとして、テストが実行可能であることを確認する。

| 判定項目               | 基準 | 結果                               |
| ---------------------- | ---- | ---------------------------------- |
| ユニットテストLine     | 80%+ | {{RESULT}}（Phase 5 実装後に計測） |
| ユニットテストBranch   | 60%+ | {{RESULT}}（Phase 5 実装後に計測） |
| ユニットテストFunction | 80%+ | {{RESULT}}（Phase 5 実装後に計測） |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断                                     | 仕様参照先                                   |
| ------------------ | -------------------------------------------- | -------------------------------------------- |
| セキュリティ       | **適用**: パストラバーサル防止・書き込み制限 | `aiworkflow-requirements: security-*.md`     |
| アーキテクチャ     | **適用**: SkillFileWriter の DI 設計         | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | **適用**: アトミック書き込み・ロールバック   | `aiworkflow-requirements: error-handling.md` |
| UI/UX              | 非適用（バックエンド変更のみ）               | -                                            |
| データ整合性       | 非適用（DB操作なし）                         | -                                            |
| パフォーマンス     | 非適用                                       | -                                            |
| アクセシビリティ   | 非適用                                       | -                                            |

## サブタスク管理

Phase実行開始時に、TaskCreateツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. テストファイル配置確認（P63 対策）
3. 基本機能テスト作成
4. ディレクトリ構造生成テスト作成
5. 既存ファイル上書きガードテスト作成
6. パストラバーサル防止テスト作成（スケルトン）
7. 統合テスト連携の実施
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 5: 実装
