# [#806] "[task-imp-vitest-mock-reset-utility-001] Vitest モック 2段階リセットユーティリティ共通化"

## メタ情報

```yaml
task_id: task-imp-vitest-mock-reset-utility-001
task_name: Vitest モック 2段階リセットユーティリティ共通化
category: 改善
target_feature: テスト基盤（Desktop / Shared 共通）
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-FIX-11-1-SDK-TEST-ENABLEMENT Phase 5（実装中の苦戦箇所）
created_date: 2026-02-13
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-vitest-mock-reset-utility-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## issue_number: null

# Vitest モック 2段階リセットユーティリティ共通化

## 1. なぜこのタスクが必要か（Why）

### 背景

TASK-FIX-11-1（SDK統合テスト有効化）の実装中、`vi.clearAllMocks()` が `mockImplementation()` / `mockRejectedValue()` をリセット**しない**ことに起因するテスト間状態リーク（P9パターン）が繰り返し発生した。

現在、プロジェクト内の各テストファイルで `beforeEach` のリセット処理が個別に実装されており、以下の問題がある：

1. **不完全なリセット**: `vi.clearAllMocks()` のみで `mockImplementation` が残存するテストが存在する
2. **ボイラープレートの重複**: 「履歴クリア＋デフォルト応答再設定」の2段階パターンが各テストファイルにコピーペーストされている
3. **新規テスト作成時の罠**: `clearAllMocks` で十分と誤解し、断続的に失敗するテストを書いてしまう

### 問題点・課題

- 同一モックのデフォルト応答定義が5ファイル以上で重複
- `mockRejectedValue`（永続）と `mockRejectedValueOnce`（1回限り）の使い分けが暗黙知
- `clearAllMocks` / `resetAllMocks` / `restoreAllMocks` の差異が文書化されていない

### 放置した場合の影響

| 影響領域               | 影響度 | 説明                                                                         |
| ---------------------- | ------ | ---------------------------------------------------------------------------- |
| テスト信頼性           | High   | P9パターン（テスト間状態リーク）が新規テスト追加のたびに再発するリスクがある |
| 開発者オンボーディング | Medium | Vitest mock API の挙動差異を知らない開発者が断続的テスト失敗に遭遇する       |
| 保守コスト             | Medium | デフォルト応答の変更時に複数ファイルを同時修正する必要がある                 |
| テスト実行速度         | Low    | 不完全なリセットが原因でデバッグに時間を費やす                               |

## 2. 何を達成するか（What）

### 目的

Vitest モックの「2段階リセット」パターン（履歴クリア＋デフォルト応答再設定）を共通ユーティリティとして提供し、テスト間状態リークを構造的に防止する。

### 最終ゴール

- `createMockResetHelper()` ユーティリティ関数を作成
- SkillExecutor 関連テスト（5ファイル）のリセットロジックをユーティリティに移行
- ユーティリティ自体の単体テストを作成
- プロジェクト内テストガイドラインに使用方法を記載

### スコープ

**含むもの:**

- `createMockResetHelper()` ユーティリティ実装（`apps/desktop/src/main/slide/__tests__/helpers/` 配下）
- SkillExecutor テスト5ファイルのリファクタリング
- ユーティリティの単体テスト
- `Once` サフィックスパターンの推奨ルール明文化

**含まないもの:**

- ESLint カスタムルールの実装（別タスク）
- SkillExecutor 以外のテストファイルへの適用（段階的に横展開）
- `vi.resetAllMocks()` への全面置換

### 成果物

| 種別         | 成果物                         | 配置先                                                                    |
| ------------ | ------------------------------ | ------------------------------------------------------------------------- |
| 実装         | mockResetHelper ユーティリティ | `apps/desktop/src/main/slide/__tests__/helpers/mock-reset-helper.ts`      |
| テスト       | ユーティリティ単体テスト       | `apps/desktop/src/main/slide/__tests__/helpers/mock-reset-helper.test.ts` |
| リファクタ   | SkillExecutor テスト5ファイル  | `apps/desktop/src/main/slide/__tests__/skill-executor.*.test.ts`          |
| ドキュメント | テストガイドライン更新         | `docs/` 配下（該当ドキュメント）                                          |

## 3. どのように実行するか（How）

### 前提条件

- [x] TASK-FIX-11-1-SDK-TEST-ENABLEMENT が完了していること（2026-02-13完了）

### 依存タスク

- TASK-FIX-11-1-SDK-TEST-ENABLEMENT（完了済み）

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                          | 発見経緯                                                                  | 解決策                                                                                  | 教訓                                               |
| ------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `vi.clearAllMocks()` は `mockImplementation` をリセットしない | TASK-FIX-11-1 Phase 5: 有効化したテストの1/3が断続的に失敗                | 2段階リセットパターン（履歴クリア＋デフォルト応答再設定）を採用                         | 「履歴クリア」と「実装リセット」は別操作として扱う |
| `mockRejectedValue` が後続テストに漏洩                        | TASK-FIX-11-1 Phase 5: エラーハンドリングテスト後の正常系テストが全て失敗 | `mockRejectedValueOnce` に統一し、永続的な `mockRejectedValue` はテストコードで使用禁止 | テストの副作用は「1回限り」が安全なデフォルト      |
| `beforeEach` のリセット不足に気付きにくい                     | TASK-FIX-11-1 Phase 6: テスト実行順序変更でランダムに失敗が顕在化         | 共通ユーティリティで強制的に2段階リセットを適用                                         | テスト基盤は「忘れても安全」な設計にする           |

## 4. 実行手順

Phase 4: ユーティリティテスト作成（TDD Red）→ Phase 5: 実装 → Phase 8: テストリファクタリング

## 5. 完了条件チェックリスト

- [ ] `createMockResetHelper()` ユーティリティが実装されている
- [ ] SkillExecutor テスト5ファイルが `resetAll()` を使用している
- [ ] 全テストが PASS する（回帰テスト含む）
- [ ] ユーティリティの単体テストが5ケース以上 PASS
- [ ] ESLint / TypeScript エラーゼロ

## 6. 検証方法

```bash
pnpm vitest run apps/desktop/src/main/slide/__tests__/helpers/mock-reset-helper.test.ts
pnpm vitest run apps/desktop/src/main/slide/__tests__/skill-executor
```

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                              |
| ------------------------------------ | ------ | -------- | ------------------------------------------------- |
| 型定義の複雑化                       | Medium | Medium   | ジェネリクスを最小限にし、使用例をドキュメント化  |
| 既存テストのリファクタリング時の回帰 | Medium | Low      | 1ファイルずつ移行し、各段階で全テスト PASS を確認 |

## 8. 参照情報

- [lessons-learned.md - TASK-FIX-11-1 苦戦箇所#3](../../.claude/skills/aiworkflow-requirements/references/lessons-learned.md)
- [architecture-implementation-patterns.md](../../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md)
- [06-known-pitfalls.md#P9](../../.claude/rules/06-known-pitfalls.md)

## 9. 備考

TASK-FIX-11-1 Phase 5 で17件のTODOテスト有効化時に約1/3が断続的に失敗。`vi.clearAllMocks()` が `mockImplementation()` をリセットしない仕様に起因。SkillExecutor テスト5ファイルでの実績確認後、プロジェクト全体に段階的に適用を拡大する。
