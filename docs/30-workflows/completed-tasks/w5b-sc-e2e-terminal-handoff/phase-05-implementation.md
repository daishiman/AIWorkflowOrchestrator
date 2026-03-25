# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 5                           |
| Phase名    | 実装                        |
| 前提Phase  | Phase 4                     |
| 後続Phase  | Phase 6                     |
| ステータス | 未実施                      |
| 作成日     | 2026-03-25                  |
| 機能名     | w5b-sc-e2e-terminal-handoff |
| タスクID   | TASK-SC-08-E2E-VALIDATION   |

---

## 目的

E2Eテストインフラを構築し、LLMモックをセットアップする。Phase 4 のテストを全て PASS させる。

## 背景

TDD Green フェーズ。テストを通すための最小限の実装を行う。Phase 4 で作成した Red 状態のテストを全て Green にすることが目標である。verify() の実装（FR-4: 生成スキルを実行し要求充足をトータル検証）も含む。SkillExecutor（claude-agent-sdk）を使用して verify を実装する。

前提タスクとの統合:

- w3a（TASK-SC-04-OUTPUT-PERSISTENCE）: SkillFileWriter + SkillStructureReader
- w3b（TASK-SC-05-IMPROVE-LLM）: improve() 差分提案 + applyDiff
- w4（TASK-SC-06-UI-RUNTIME-CONN）: UI→Runtime + 承認フロー + ライフサイクルUI

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テストインフラ構築

**目的**: E2Eテストの基盤となるインフラを構築する

**実行手順**:

1. LLMモックの実装（`vi.mock` または MSW を使用）
2. IPC 統合テスト用のセットアップファイル作成
3. テストヘルパー関数の実装:
   - `createSkillCreatorMock()`: LLMモックの初期化
   - `invokeSkillCreatorPlan(args)`: plan IPC 呼び出しのラッパー
   - `invokeSkillCreatorExecute(args)`: execute-plan IPC 呼び出しのラッパー
   - `assertTerminalHandoff(result)`: TerminalHandoff 検証アサーション

**期待される成果物**:

- テストヘルパー関数の実装ファイル

### タスク2: LLMモックサーバー設定

**目的**: 3パターンのLLMモックを構築する

**実行手順**:

1. **正常パターン**（シナリオA/D用）: 正常な plan レスポンス + execute-plan レスポンスを返すモック
2. **エラーパターン**（シナリオC用）: `{ success: false, error: { code: "LLM_ERROR", message: "..." } }` を返すモック
3. **TerminalHandoff パターン**（シナリオB用）: `terminalHandoff.suggestedCommand` を含むレスポンスを返すモック
4. `vi.fn()` でモックの呼び出し履歴を検証可能にする

**期待される成果物**:

- 3パターンのLLMモック実装

### タスク3: verify() 実装（FR-4）

**目的**: 生成スキルを実行し要求充足をトータル検証する verify 機能を実装する

**実行手順**:

1. FR-4 の仕様に基づき、`skill-creator:verify` チャネルのハンドラを実装する
2. SkillExecutor（claude-agent-sdk）を使用してスキルを実行する
3. 実行結果から要求充足度（score, passed, details）を返却する
4. `{ success: true, data: { passed: boolean, score: number, details: string[] } }` 形式のレスポンスを返す

**期待される成果物**:

- verify() 実装コード

### タスク4: テスト実行検証

**目的**: Phase 4 のテストを全て PASS させる

**実行手順**:

1. `cd apps/desktop && pnpm vitest run src/test/e2e/` でテスト実行（P40対策）
2. 全5シナリオ（A〜E）が PASS することを確認する
3. タイムアウト設定が正しく機能することを確認する
4. テスト結果の証跡を記録する

**期待される成果物**:

- テスト実行結果（全5シナリオ PASS 証跡）

### タスク5: 前提タスク（w3a/w3b/w4）との統合確認

**目的**: 前提タスクの成果物との統合が正しく動作していることを確認する

**実行手順**:

1. w3a（ファイル永続化）: SkillFileWriter がスキルファイルを正しく保存していることを確認する
2. w3b（improve LLM）: improve() メソッドがシナリオDで使用されていることを確認する
3. w4（UI-Runtime接続）: UI→Runtime パイプラインがシナリオA〜Eで使用されていることを確認する
4. `pnpm typecheck` が通過することを確認する

**期待される成果物**:

- 統合確認結果

---

## 参照資料

| 参照資料               | パス                                                                           | 内容                   |
| ---------------------- | ------------------------------------------------------------------------------ | ---------------------- |
| Phase 4 テストファイル | `phase-04-test-creation.md`                                                    | Red 状態のテストコード |
| Phase 2 設計書         | `phase-02-design.md`                                                           | IPC レスポンス形式定義 |
| 正本（全体仕様）       | `docs/30-workflows/skill-creator-llm-integration/index.md`                     | FR-4 verify 仕様       |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                           | P40, P60               |
| w3a仕様                | `docs/30-workflows/skill-creator-llm-integration/w3a-sc-output-persistence/`   | SkillFileWriter        |
| w3b仕様                | `docs/30-workflows/skill-creator-llm-integration/w3b-sc-improve-llm/`          | improve() 差分提案     |
| w4仕様                 | `docs/30-workflows/skill-creator-llm-integration/w4-sc-ui-runtime-connection/` | UI-Runtime接続         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                       | 内容                                        |
| ----------------------- | -------------------------------------------------------------------------- | ------------------------------------------- |
| Skill Creator UI/UX仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-skill-creator.md` | TerminalHandoff経路・承認フロー・進捗UI仕様 |

---

## 成果物

| 成果物         | パス                                                          | 内容                  |
| -------------- | ------------------------------------------------------------- | --------------------- |
| 本ドキュメント | `phase-05-implementation.md`                                  | Phase 5 実装仕様書    |
| テストヘルパー | `apps/desktop/src/test/helpers/skill-creator-test-helpers.ts` | ヘルパー関数実装      |
| テスト実行結果 | Phase実行記録に記載                                           | 全5シナリオ PASS 証跡 |

---

## 統合テスト連携

本Phase では以下の統合テスト連携アクションを実施する:

- LLMモック（3パターン: 正常・エラー・TerminalHandoff）を構築し、E2E統合テストで使用する
- IPC 統合テスト（Main Process ↔ Renderer）のセットアップを完了する
- 前提タスク（w3a: SkillFileWriter, w3b: improve, w4: UI-Runtime）との統合ポイントが正しく動作することを確認する
- verify() の統合テスト（SkillExecutor 経由のスキル実行）を PASS させる

---

## TDD検証

### Green フェーズ確認

テストが Green 状態（全テスト PASS）であることを確認するコマンド:

```bash
cd apps/desktop && pnpm vitest run src/test/e2e/
```

**期待される結果**: 5シナリオ全てが PASS（Green）であること。

### 型チェック確認

```bash
pnpm typecheck
```

**期待される結果**: 型エラーなし。

### 確認チェックリスト

- [ ] `pnpm vitest run src/test/e2e/` で全テストが PASS（Green）であること
- [ ] `pnpm typecheck` が通過すること
- [ ] LLMモック3パターンが全て動作していること
- [ ] テストヘルパー関数が全て動作していること

---

## 完了条件

- [ ] LLMモックが3パターン（正常・エラー・TerminalHandoff）実装されている
- [ ] テストヘルパー関数（createSkillCreatorMock, invokeSkillCreatorPlan, invokeSkillCreatorExecute, assertTerminalHandoff）が実装されている
- [ ] verify() が FR-4 に基づき実装されている
- [ ] シナリオA〜E の全テストが PASS している
- [ ] 既存 `skill:create` の後方互換テストが PASS している
- [ ] `pnpm typecheck` が通過している
- [ ] 前提タスク（w3a/w3b/w4）との統合が確認されている

---

## Phase末端アクション

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] TDD Green 状態が確認されていること

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 実行タスク

- タスク1（テストインフラ構築）:
- タスク2（LLMモックサーバー設定）:
- タスク3（verify() 実装）:
- タスク4（テスト実行検証）:
- タスク5（前提タスク統合確認）:

### TDD Green 確認結果

- テスト実行コマンド: `cd apps/desktop && pnpm vitest run src/test/e2e/`
- 結果: PASS / FAIL
- PASS テスト数: X / 5
- typecheck: PASS / FAIL

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

`docs/30-workflows/w5b-sc-e2e-terminal-handoff/phase-06-test-coverage.md`
