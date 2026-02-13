# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 8                                 |
| Phase名    | リファクタリング（TDD: Refactor） |
| タスクID   | TASK-FIX-11-1-SDK-TEST-ENABLEMENT |
| 前提Phase  | Phase 7 (カバレッジ確認)          |
| 後続Phase  | Phase 9 (品質保証)                |
| ステータス | 未実施                            |
| 作成日     | 2026-02-13                        |
| 機能名     | sdk-test-enablement               |

---

## 目的

Phase 4-7 で有効化・実装したSDK統合テスト17箇所のコード品質を改善する。テストが成功し続けることを保証しながら、テストコードの保守性・可読性を向上させる。

## 背景

TASK-9B-I-SDK-FORMAL-INTEGRATION の完了により SDK 統合基盤が整った状態で、17箇所の TODO コメント付きテストを有効化した。有効化後のテストコードにはモック設定の重複やエラーシミュレーションの散在が予想されるため、TDD の Refactor フェーズとしてコード品質を改善する。

---

## 実行タスク

- 重複整理: モック設定やテスト構造の重複を特定し抽出可否を判断する
- 可読性改善: テスト意図が伝わる記述へ統一し保守性を上げる
- 回帰確認: リファクタ後に挙動不変であることを検証する

### Task 1: リファクタリング候補の特定

対象3ファイルを分析し、以下の観点でリファクタリング候補を特定する。

#### 1-1. テスト間のモック重複の抽出

- `skill-executor.test.ts` の `mockCreate` 設定パターンが各テストケースで重複していないかを確認する
- `agent-client.test.ts` の SDK API モック設定（`mockAgentAPI.query` の戻り値設定）が9箇所のテスト間で共通化可能かを評価する
- `sdk-integration.test.ts` のプロジェクトパス生成（`createTestProjectPath`）やモック設定の重複を確認する

#### 1-2. エラーシミュレーションヘルパーの抽出

以下のエラーパターンが複数箇所で出現する場合、ヘルパー関数への抽出を検討する:

| エラーパターン            | 対象ファイル                                                             |
| ------------------------- | ------------------------------------------------------------------------ |
| 401 Unauthorized          | `agent-client.test.ts` (SDK-AC-09)                                       |
| 500 Internal Server Error | `agent-client.test.ts` (SDK-AC-10)                                       |
| API key not found         | `skill-executor.test.ts` (SDK-SE-13), `agent-client.test.ts` (SDK-AC-03) |
| SDK call failed           | `skill-executor.test.ts` (SDK-SE-14), `sdk-integration.test.ts` (INT-05) |
| Timeout (30s)             | `skill-executor.test.ts` (SDK-SE-05)                                     |
| Invalid API key           | `sdk-integration.test.ts` (INT-02)                                       |

#### 1-3. テストケース構造の整合性確認

- `describe`/`it` のネスト構造が3ファイル間で統一されているかを確認する
- テストケースIDのプレフィックス規則（`SDK-SE-`, `SDK-AC-`, `INT-`）が正しく適用されているかを検証する

### Task 2: リファクタリング実施

#### 2-1. 共通モックファクトリの検討

リファクタリング方針:

- **既存パターンを尊重する**: 各テストファイルの既存モック構成を大幅に変更しない
- **過度な抽象化を避ける**: テストコードは「読んで理解できる」ことを最優先とする
- **重複が3箇所以上**ある場合のみヘルパー関数を抽出する
- ヘルパー関数を作成する場合は、同一ファイル内のトップレベルに配置する（別ファイルへの切り出しは行わない）

具体的な共通化候補:

```typescript
// 例: SDK エラーレスポンスのファクトリ（必要な場合のみ作成）
function createSDKErrorResponse(statusCode: number, message: string) { ... }

// 例: 認証エラーのモック設定（必要な場合のみ作成）
function setupAuthKeyMockFailure(mockAuthKeyService: MockAuthKeyService) { ... }
```

#### 2-2. テストの可読性向上

- テストケース内のコメントが TODO ではなく実装意図の説明になっていることを確認する
- Arrange / Act / Assert パターンが明確に区分されているかを確認する
- 期待値が具体的な値で記述されているか（マジックナンバーやマジックストリングがないか）を確認する

### Task 3: リファクタリング後の全テスト成功確認

```bash
# 対象3ファイルのテスト実行
pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/slide/__tests__/skill-executor.test.ts
pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/slide/__tests__/agent-client.test.ts
pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts

# 関連テスト全体の回帰確認
pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/slide/__tests__/
```

---

## 参照資料

| 参照資料               | パス                                                            | 内容                          |
| ---------------------- | --------------------------------------------------------------- | ----------------------------- |
| skill-executor テスト  | `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts`  | リファクタリング対象（5箇所） |
| agent-client テスト    | `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`    | リファクタリング対象（9箇所） |
| sdk-integration テスト | `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts` | リファクタリング対象（3箇所） |
| Phase 7 カバレッジ     | `docs/30-workflows/sdk-test-enablement/outputs/phase-7/`        | テストカバレッジ結果          |
| コード品質ルール       | `.claude/rules/02-code-quality.md`                              | コーディング規約・テスト設計  |

- 依存Phase成果物: `phase-1-requirements.md`, `phase-2-design.md`, `phase-5-implementation.md`, `phase-6-test-expansion.md`, `phase-7-coverage-check.md`

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                          | 内容              |
| ---------------- | ----------------------------------------------------------------------------- | ----------------- |
| コーディング規約 | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | 開発ガイドライン  |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`                                          | P9, P20, P21 参照 |

---

## 成果物

| 成果物               | パス                                                                          | 内容                               |
| -------------------- | ----------------------------------------------------------------------------- | ---------------------------------- |
| リファクタリング記録 | `docs/30-workflows/sdk-test-enablement/outputs/phase-8/refactoring-report.md` | リファクタリング内容・変更点の記録 |

---

## リファクタリング観点

### コード品質改善

- [ ] モック設定の重複箇所を特定し、3箇所以上の重複がある場合のみヘルパーに抽出
- [ ] エラーシミュレーションパターンの共通化を検討
- [ ] テストケースIDの命名規則（`SDK-SE-`, `SDK-AC-`, `INT-`）の整合性を確認

### 可読性向上

- [ ] 旧 TODO コメントが実装意図の説明に置き換えられていることを確認
- [ ] Arrange / Act / Assert パターンの明確な区分
- [ ] 期待値にマジックナンバー・マジックストリングがないことを確認

### テスト構造の整合性

- [ ] `describe`/`it` のネスト構造が3ファイル間で一貫していることを確認
- [ ] `beforeEach` でのモックリセットが漏れなく行われていることを確認（P9対策）

---

## 統合テスト連携（Phase 1-11は必須）

### Phase 8での必須アクション

- [ ] リファクタリング後の統合テスト継続成功を確認
- [ ] 既存テスト（17箇所以外のテストケース）が全て成功し続けることを検証
- [ ] `apps/desktop/src/main/slide/__tests__/` 配下の全テストファイルの回帰テスト実行

---

## 完了条件

- [ ] リファクタリング候補の特定が完了している
- [ ] 必要なリファクタリングが実施されている（不要な場合は「変更不要」の判断が記録されている）
- [ ] 対象3ファイルの全テストが成功している
- [ ] `__tests__/` 配下の全テストが回帰テストで成功している
- [ ] TypeScript型エラーがない
- [ ] ESLint警告がない
- [ ] リファクタリング記録（`outputs/phase-8/refactoring-report.md`）が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 本タスクでの適用判断                                      | 仕様参照先                                                                                                                                                                                                                                    |
| ------------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | APIキー・認証情報・エラー表示を扱うため適用               | `.claude/skills/aiworkflow-requirements/references/security-principles.md`, `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                                                      |
| インターフェース   | SkillExecutor と Agent SDK の接続仕様確認が必要なため適用 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`                                                                             |
| エラーハンドリング | timeout/API key not configured/SDK failure を扱うため適用 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                                                                                                         |
| テスト品質         | TODO有効化・回帰防止・カバレッジ判定が必要なため適用      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` |
| タスク運用         | 未タスク発生時の記録・追跡が必要なため適用                | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                                                                                                          |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成して進捗管理する。

1. 参照資料の確認
2. 実行タスクの実施（各タスクごと）
3. 統合テスト連携の実施（Phase 1-11）
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] `artifacts.json` が更新されている
- [ ] Phase末端アクションで完了を明記している

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 5, 6, 7 が完了していること（17箇所のテスト有効化・カバレッジ確認済み）
- **後続**: Phase 9 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 8 実行記録

### リファクタリング内容

- 変更対象ファイル数: {{数}}
- 抽出したヘルパー関数数: {{数}}
- 削除した重複コード行数: {{数}}

### 各ファイルの変更詳細

- skill-executor.test.ts: {{変更内容}}
- agent-client.test.ts: {{変更内容}}
- sdk-integration.test.ts: {{変更内容}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/sdk-test-enablement/phase-9-quality-assurance.md`
