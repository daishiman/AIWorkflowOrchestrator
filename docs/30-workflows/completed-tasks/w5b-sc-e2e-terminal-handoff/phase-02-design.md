# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 2                           |
| Phase名    | 設計                        |
| 前提Phase  | Phase 1                     |
| 後続Phase  | Phase 3                     |
| ステータス | 未実施                      |
| 作成日     | 2026-03-25                  |
| 機能名     | w5b-sc-e2e-terminal-handoff |
| タスクID   | TASK-SC-08-E2E-VALIDATION   |

---

## 目的

E2Eテストインフラの詳細設計を行う。LLMモック・IPC統合テスト構成・TerminalHandoff検証フロー・パフォーマンス計測方法を設計する。P60（IPC テスト応答形式不一致）を防ぐため、IPC レスポンス形式を設計段階で明確に定義する。

## 背景

Phase 1 で定義した5シナリオ（A〜E）と AC-1〜AC-8・NFR-1〜NFR-4 の検証項目を、具体的なテストインフラ設計に落とし込む。以下の技術的課題に対応する:

1. **LLMモック**: 実際のLLM APIを呼ばずにE2Eテストを実行する仕組み
2. **IPC統合テスト**: Electron Main Process のIPCハンドラをテスト環境で検証する方法
3. **TerminalHandoff**: API Key未設定時のフォールバック経路をテストする方法
4. **パフォーマンス計測**: plan 30秒 / execute 120秒の基準を自動検証する方法

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テストインフラ設計

**目的**: E2Eテストの基盤となるインフラを設計する

**実行手順**:

1. LLMモックサーバーの設計（MSW または Vitest の `vi.mock` を使用）
   - 正常レスポンスモック（シナリオA/B/D用）
   - エラーレスポンスモック（シナリオC用）
   - TerminalHandoff レスポンスモック（シナリオB用）
2. IPC統合テスト構成（Main Process のモック化方針）
   - `ipcMain.handle` のモック方法
   - `RuntimeSkillCreatorFacade` のモック方法
3. テストヘルパーの設計:
   - `createSkillCreatorMock()`: LLMモックの初期化
   - `invokeSkillCreatorPlan(args)`: plan IPC 呼び出しのラッパー
   - `invokeSkillCreatorExecute(args)`: execute-plan IPC 呼び出しのラッパー
   - `assertTerminalHandoff(result)`: TerminalHandoff 検証アサーション
4. テスト実行コマンド（P40対策: `cd apps/desktop && pnpm vitest run`）

**期待される成果物**:

- テストインフラ設計書

### タスク2: IPC レスポンス形式の明示定義（P60対策）

**目的**: テストのアサーションで使用するIPCレスポンス形式を設計段階で固定する

**実行手順**:

1. 各IPCチャネルのレスポンス形式を定義する:

   **`skill-creator:plan` 成功レスポンス**:

   ```typescript
   { success: true, data: { steps: string[], estimatedTime: number } }
   ```

   **`skill-creator:plan` エラーレスポンス**:

   ```typescript
   { success: false, error: { code: string, message: string } }
   ```

   **`skill-creator:execute-plan` 成功レスポンス**:

   ```typescript
   { success: true, data: { skillPath: string, terminalHandoff?: { suggestedCommand: string } } }
   ```

   **`skill-creator:execute-plan` エラーレスポンス**:

   ```typescript
   { success: false, error: { code: string, message: string } }
   ```

   **`skill-creator:verify` 成功レスポンス**:

   ```typescript
   { success: true, data: { passed: boolean, score: number, details: string[] } }
   ```

   **`skill-creator:improve-skill` 成功レスポンス**:

   ```typescript
   { success: true, data: { diff: SkillDiff, applied: boolean } }
   ```

2. エラーコード一覧を定義する:
   - `LLM_ERROR`: LLM API呼び出しエラー
   - `NETWORK_ERROR`: ネットワーク接続エラー
   - `API_KEY_NOT_SET`: API Key未設定
   - `TIMEOUT_ERROR`: タイムアウト
   - `VALIDATION_ERROR`: 入力バリデーションエラー

**期待される成果物**:

- IPC レスポンス形式定義書

### タスク3: TerminalHandoff 検証フロー設計

**目的**: AC-4（API Key 未設定時は TerminalHandoffBundle + CLI コマンド表示）の検証方法を設計する

**実行手順**:

1. `skill-creator:execute-plan` レスポンスの `terminalHandoff` フィールド検証方法を定義する
2. `suggestedCommand` の文字列形式の検証基準を定義する:
   - 空文字列でないこと
   - CLI実行可能な形式（`/^[a-zA-Z]` から始まる文字列）であること
   - シェルインジェクション可能な文字列を含まないこと
3. TerminalHandoff が返却された場合のUI動作（コマンドのコピーボタン表示等）の検証方法を設計する

**期待される成果物**:

- TerminalHandoff 検証フロー設計書

### タスク4: パフォーマンス計測方法設計

**目的**: NFR-2（plan 30秒以内・execute 120秒以内）の自動検証方法を設計する

**実行手順**:

1. `performance.now()` を使ったタイム計測ロジックを設計する
2. 基準値を定義する:
   - plan: 開始〜`{ success: true }` 受信まで 30,000ms 以内
   - execute: 開始〜`{ success: true }` 受信まで 120,000ms 以内
3. Vitest のタイムアウト設定（`{ timeout: 150000 }`）を定義する

**期待される成果物**:

- パフォーマンス計測設計書

### タスク5: 後方互換テスト設計

**目的**: AC-8（既存 skill:create が破壊されない）の検証方法を設計する

**実行手順**:

1. 既存 `skill:create` チャンネルが依然として動作することを確認するテストを設計する
2. 新旧チャンネルが共存できることを確認するテストを設計する
3. 既存の `skill:create` テストファイルを特定し、リグレッション検出方法を定義する

**期待される成果物**:

- 後方互換テスト設計書

### タスク6: テストファイル構成図の作成

**目的**: E2Eテストのファイル配置と責務を設計する

**実行手順**:

1. 以下のファイル構成を設計する:
   ```
   apps/desktop/src/test/e2e/
   ├── skill-creator-integration.test.ts    # シナリオA, C, D, E
   ├── terminal-handoff.test.ts             # シナリオB
   └── helpers/
       └── skill-creator-test-helpers.ts    # 共通ヘルパー
   ```
2. 各ファイルの責務境界を明確にする

**期待される成果物**:

- テストファイル構成図

---

## 参照資料

| 参照資料              | パス                                                       | 内容                        |
| --------------------- | ---------------------------------------------------------- | --------------------------- |
| Phase 1 要件定義書    | `phase-01-requirements.md`                                 | E2Eテストシナリオ・AC対応表 |
| 正本（全体仕様）      | `docs/30-workflows/skill-creator-llm-integration/index.md` | 型定義・IPC設計             |
| 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md`                       | P40, P60                    |
| Preload API           | `apps/desktop/src/preload/skill-creator-api.ts`            | IPC チャネル定義            |
| 既存IPCテストパターン | `apps/desktop/src/test/`                                   | テスト構成の参考            |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                       | 内容                         |
| ----------------------- | -------------------------------------------------------------------------- | ---------------------------- |
| Skill Creator UI/UX仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-skill-creator.md` | IPC契約・TerminalHandoff仕様 |

---

## 成果物

| 成果物                   | パス                                               | 内容               |
| ------------------------ | -------------------------------------------------- | ------------------ |
| 本ドキュメント           | `phase-02-design.md`                               | Phase 2 設計書     |
| テストインフラ設計書     | `outputs/phase-2/test-infrastructure-design.md`    | LLMモック・IPC構成 |
| IPC レスポンス形式定義書 | `outputs/phase-2/ipc-response-definitions.md`      | P60対策            |
| TerminalHandoff 検証設計 | `outputs/phase-2/terminal-handoff-verification.md` | AC-4検証フロー     |
| パフォーマンス計測設計   | `outputs/phase-2/performance-measurement.md`       | NFR-2検証方法      |
| テストファイル構成図     | `outputs/phase-2/test-file-structure.md`           | ファイル配置・責務 |

---

## 統合テスト連携

本Phase では以下の統合テスト連携アクションを実施する:

- 統合ポイント/契約（IPC チャネル・レスポンススキーマ）を設計に反映する
- Main Process ↔ Renderer 間の IPC 統合テスト構成を設計する
- TerminalHandoff の統合フロー（API Key チェック → フォールバック → CLI コマンド表示）を設計する

---

## 完了条件

- [ ] LLMモックサーバーの構成（3パターン: 正常・エラー・TerminalHandoff）が設計されている
- [ ] IPC 統合テストの構成が設計されている
- [ ] TerminalHandoff 検証フローが設計されている
- [ ] IPC レスポンス形式が明示的に定義されている（P60対策）
- [ ] IPC チャネル名が正本準拠（`skill-creator:execute-plan` 等）であることが確認されている
- [ ] パフォーマンス計測方法（plan 30秒 / execute 120秒）が設計されている
- [ ] 後方互換テスト（AC-8: `skill:create` チャンネル）の設計が完了している
- [ ] テストファイル構成図が作成されている

---

## Phase末端アクション

- [ ] 本Phase内の全タスク（6タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 実行タスク

- タスク1（テストインフラ設計）:
- タスク2（IPC レスポンス形式定義）:
- タスク3（TerminalHandoff 検証フロー設計）:
- タスク4（パフォーマンス計測方法設計）:
- タスク5（後方互換テスト設計）:
- タスク6（テストファイル構成図）:

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

`docs/30-workflows/w5b-sc-e2e-terminal-handoff/phase-03-design-review.md`
