# Phase 1: 要件定義

## メタ情報

| 項目         | 内容                             |
| ------------ | -------------------------------- |
| フェーズ     | 1                                |
| フェーズ名   | 要件定義                         |
| 目的         | 目的・スコープ・受け入れ基準定義 |
| 前提フェーズ | なし                             |
| 次フェーズ   | Phase 2: 設計                    |
| 想定成果物   | 要件定義書（このドキュメント）   |

---

## 1. 目的

スキル実行時のセキュリティチェックに使用するパターン定義の要件を明確化し、実装の基準となる受け入れ条件を定義する。

---

## 2. 実行タスク

### Task 1-1: 仕様書確認

**目的**: specification.md §7.1-7.4 のセキュリティ仕様を確認し、実装対象を特定する

**手順**:

1. `docs/30-workflows/skill-import-agent-system/specification.md` を開く
2. §7.1「ツール使用制限」セクションを確認
3. §7.1.1「危険コマンドパターン（完全版）」を確認
4. §7.3.1「許可ツールホワイトリスト」を確認
5. 全てのパターンをリストアップ

**確認項目**:

- [ ] DANGEROUS_PATTERNS.BASH_COMMANDS の全パターン（18項目）
- [ ] DANGEROUS_PATTERNS.PROTECTED_PATHS の全パターン（15項目）
- [ ] ALLOWED_TOOLS_WHITELIST の全ツール（11項目）
- [ ] 入力サニタイズの要件（§7.4）

### Task 1-2: タスク定義確認

**目的**: task-2c-security-patterns.md のユーティリティ関数仕様を確認する

**手順**:

1. `docs/30-workflows/skill-import-agent-system/tasks/task-2c-security-patterns.md` を開く
2. ユーティリティ関数の仕様を確認
3. 各関数の入出力を理解

**確認項目**:

- [ ] isDangerousCommand() の仕様
- [ ] isProtectedPath() の仕様
- [ ] matchGlobPattern() の仕様
- [ ] validateAllowedTools() の仕様
- [ ] filterAllowedTools() の仕様

### Task 1-3: システム仕様確認

**目的**: aiworkflow-requirements の関連仕様を確認し、整合性を確保する

**手順**:

1. `security-principles.md` を確認（設計原則）
2. `security-input-validation.md` を確認（入力検証）
3. 既存のセキュリティパターンがあるか確認

**確認項目**:

- [ ] セキュリティ設計原則との整合性
- [ ] 入力検証パターンの適用
- [ ] 既存パターンとの重複確認

### Task 1-4: 既存コード確認

**目的**: packages/shared の既存構造を確認し、配置場所を決定する

**手順**:

1. `packages/shared/src/` のディレクトリ構造を確認
2. `packages/shared/src/constants/` が存在するか確認
3. `packages/shared/src/index.ts` のエクスポートパターンを確認

**確認項目**:

- [ ] 既存の constants ディレクトリの有無
- [ ] エクスポートパターンの把握
- [ ] 既存の security 関連ファイルの有無

---

## 3. 受け入れ基準

### 3.1 機能要件

| ID    | 要件                                                            | 優先度 |
| ----- | --------------------------------------------------------------- | ------ |
| FR-01 | DANGEROUS_PATTERNS.BASH_COMMANDS が仕様書の全18パターンを含む   | 必須   |
| FR-02 | DANGEROUS_PATTERNS.PROTECTED_PATHS が仕様書の全15パターンを含む | 必須   |
| FR-03 | ALLOWED_TOOLS_WHITELIST が仕様書の全11ツールを含む              | 必須   |
| FR-04 | isDangerousCommand() が危険コマンドを正しく検出する             | 必須   |
| FR-05 | isProtectedPath() が保護パスを正しく検出する                    | 必須   |
| FR-06 | matchGlobPattern() がGlobパターンを正しくマッチする             | 必須   |
| FR-07 | validateAllowedTools() が無効なツールを検出する                 | 必須   |
| FR-08 | filterAllowedTools() が有効なツールのみを返す                   | 必須   |
| FR-09 | AllowedTool 型が定義されている                                  | 必須   |

### 3.2 非機能要件

| ID     | 要件                                             | 優先度 |
| ------ | ------------------------------------------------ | ------ |
| NFR-01 | TypeScript strict モードでコンパイルエラーがない | 必須   |
| NFR-02 | `pnpm --filter @repo/shared build` が成功する    | 必須   |
| NFR-03 | 他パッケージ（desktop/web）からインポート可能    | 必須   |
| NFR-04 | 実行時パフォーマンスに影響しない（O(n)以下）     | 必須   |
| NFR-05 | Node.js標準ライブラリのみ使用（追加依存なし）    | 必須   |

### 3.3 品質要件

| ID    | 要件                       | 基準 |
| ----- | -------------------------- | ---- |
| QR-01 | パターンが仕様書と完全一致 | 100% |
| QR-02 | JSDoc カバレッジ           | 100% |
| QR-03 | Line Coverage              | 80%+ |
| QR-04 | eslint/prettier エラーなし | 0件  |

---

## 4. 制約事項

| ID   | 制約                                                      |
| ---- | --------------------------------------------------------- |
| C-01 | 追加依存パッケージは使用しない（Node.js標準のみ）         |
| C-02 | as const アサーションで型推論を活用する                   |
| C-03 | 正規表現は安全にエスケープする                            |
| C-04 | process.env.HOME が未定義の場合のフォールバックを用意する |

---

## 5. 前提条件

| ID   | 前提                                           |
| ---- | ---------------------------------------------- |
| P-01 | TASK-1-1（共通型定義）が完了している           |
| P-02 | specification.md §7.1-7.4 の仕様が確定している |
| P-03 | packages/shared が正常にビルドできる状態       |
| P-04 | TypeScript 5.x 環境が利用可能                  |

---

## 6. 参照資料

| 資料名               | パス                                                                             |
| -------------------- | -------------------------------------------------------------------------------- |
| 機能仕様書           | `docs/30-workflows/skill-import-agent-system/specification.md`                   |
| タスク定義           | `docs/30-workflows/skill-import-agent-system/tasks/task-2c-security-patterns.md` |
| セキュリティ設計原則 | `.claude/skills/aiworkflow-requirements/references/security-principles.md`       |
| 入力バリデーション   | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md` |

---

## 7. 完了条件

- [ ] Task 1-1 完了: 仕様書のセキュリティパターンを全て確認
- [ ] Task 1-2 完了: ユーティリティ関数の仕様を理解
- [ ] Task 1-3 完了: システム仕様との整合性を確認
- [ ] Task 1-4 完了: 既存コード構造を確認
- [ ] 受け入れ基準が明確に定義されている
- [ ] 制約事項が明確に定義されている

---

## 8. 統合テスト連携【必須】

> **N/A**: 本タスクは定数・ユーティリティ関数のみのため、統合テスト連携は対象外です。
>
> セキュリティパターンは静的定義であり、以下の接続要件は適用されません：
>
> - API 接続テスト: 該当なし
> - データフローテスト: 該当なし
> - 認証連携テスト: 該当なし
>
> **ただし、TASK-3-1-B（Hooks実装）でこれらのパターンが使用される際に統合テストを実施する。**

---

## 9. 成果物

| 成果物     | パス                                        | 状態 |
| ---------- | ------------------------------------------- | ---- |
| 要件定義書 | このドキュメント（phase-1-requirements.md） | 完了 |

---

## 10. Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100%実行完了
- [ ] 各タスクを 100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 11. サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 1-1: 仕様書確認
3. Task 1-2: タスク定義確認
4. Task 1-3: システム仕様確認
5. Task 1-4: 既存コード確認
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
