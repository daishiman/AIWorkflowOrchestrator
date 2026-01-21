# Phase 4: テスト作成（TDD Red） - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 4                              |
| Phase名    | テスト作成                     |
| 前提Phase  | Phase 3                        |
| 後続Phase  | Phase 5                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | skill-execution-implementation |

---

## 目的

スキル実行機能のテストを作成し、失敗するテストを確認する（TDD Red）。

## 背景

TDD（Test-Driven Development）のRedフェーズとして、まずテストを作成する。
テストは実装前に作成することで、要件を明確化し、実装の品質を保証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: skillAPI.execute のテスト作成

**目的**: skillAPI.execute のユニットテストを作成する

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/renderer/preload/__tests__/skillAPI.execute.test.ts`
2. 以下のテストケースを実装

| TC-ID    | テストケース                     | 期待結果                |
| -------- | -------------------------------- | ----------------------- |
| TC-4-001 | スキルIDを指定して実行できる     | success: true, data定義 |
| TC-4-002 | パラメータ付きで実行できる       | success: true           |
| TC-4-003 | 存在しないスキルIDでエラーを返す | success: false          |
| TC-4-004 | 空のスキルIDでエラーを返す       | success: false          |

3. テストコードを作成
4. `outputs/phase-4/skill-api-test-spec.md` に仕様を出力

**期待される成果物**:

- skillAPI.execute テストファイル
- テスト仕様ドキュメント

---

### タスク2: skillHandlers のテスト作成

**目的**: skill:execute ハンドラーのテストを作成する

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`
2. 以下のテストケースを実装

| TC-ID    | テストケース                    | 期待結果       |
| -------- | ------------------------------- | -------------- |
| TC-4-005 | スキルを実行して結果を返す      | 実行結果を返却 |
| TC-4-006 | skillIdが文字列でない場合エラー | エラーを返却   |
| TC-4-007 | sender検証に失敗した場合エラー  | エラーをthrow  |

3. テストコードを作成
4. `outputs/phase-4/skill-handlers-test-spec.md` に仕様を出力

**期待される成果物**:

- skillHandlers テストファイル
- テスト仕様ドキュメント

---

### タスク3: SkillService.executeSkill のテスト作成

**目的**: SkillService.executeSkill のテストを作成する

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/main/services/skill/__tests__/SkillService.execute.test.ts`
2. 以下のテストケースを実装

| TC-ID    | テストケース                   | 期待結果                       |
| -------- | ------------------------------ | ------------------------------ |
| TC-4-008 | スキルを実行して成功結果を返す | success: true, data.status定義 |
| TC-4-009 | 存在しないスキルでエラーを返す | success: false, error定義      |

3. テストコードを作成
4. `outputs/phase-4/skill-service-test-spec.md` に仕様を出力

**期待される成果物**:

- SkillService テストファイル
- テスト仕様ドキュメント

---

### タスク4: テスト実行（失敗確認）

**目的**: TDD Redフェーズとしてテストが失敗することを確認する

**実行手順**:

1. テストを実行

```bash
pnpm --filter @repo/desktop test -- --run
```

2. テストが失敗することを確認
3. 失敗結果を `outputs/phase-4/test-red-result.md` に記録

**期待される成果物**:

- テスト失敗結果ドキュメント

---

## 参照資料

| 参照資料           | パス                                                        | 内容                    |
| ------------------ | ----------------------------------------------------------- | ----------------------- |
| Phase 2設計成果物  | `outputs/phase-2/`                                          | インターフェース設計    |
| 既存テストパターン | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` | 既存skillHandlersテスト |
| Vitestドキュメント | https://vitest.dev/                                         | テストフレームワーク    |

---

## 成果物

| 成果物                  | 配置先                                                                        | 内容                |
| ----------------------- | ----------------------------------------------------------------------------- | ------------------- |
| skillAPI.executeテスト  | `apps/desktop/src/renderer/preload/__tests__/skillAPI.execute.test.ts`        | preloadテスト       |
| skillHandlersテスト     | `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`           | IPCハンドラーテスト |
| SkillServiceテスト      | `apps/desktop/src/main/services/skill/__tests__/SkillService.execute.test.ts` | サービステスト      |
| skillAPIテスト仕様      | `outputs/phase-4/skill-api-test-spec.md`                                      | テスト仕様          |
| skillHandlersテスト仕様 | `outputs/phase-4/skill-handlers-test-spec.md`                                 | テスト仕様          |
| SkillServiceテスト仕様  | `outputs/phase-4/skill-service-test-spec.md`                                  | テスト仕様          |
| テスト失敗結果          | `outputs/phase-4/test-red-result.md`                                          | Red確認結果         |

---

## 統合テスト連携

| アクション                           | 詳細                                             |
| ------------------------------------ | ------------------------------------------------ |
| 統合テストシナリオを全カテゴリで作成 | skillAPI → IPC → SkillService の統合テストを設計 |

---

## 完了条件

- [ ] skillAPI.execute のテストが作成されている
- [ ] skillHandlers のテストが作成されている
- [ ] SkillService.executeSkill のテストが作成されている
- [ ] テストが失敗することを確認（TDD Red）
- [ ] 統合テスト連携アクションが実施されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜4）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] outputs/phase-4/ ディレクトリに全成果物を配置

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）がPASSしていること
- **後続**: Phase 5（実装）へ進む

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 実行タスク

- タスク1: skillAPI.executeテスト作成 - [完了/未完了]
- タスク2: skillHandlersテスト作成 - [完了/未完了]
- タスク3: SkillServiceテスト作成 - [完了/未完了]
- タスク4: テスト実行（失敗確認） - [完了/未完了]

### TDD Red状態確認

- テスト失敗数:
- 失敗したテスト:

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-execution-implementation/phase-5-implementation.md`
