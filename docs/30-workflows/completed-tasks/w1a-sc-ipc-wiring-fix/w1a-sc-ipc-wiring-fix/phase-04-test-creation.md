# Phase 4: テスト作成

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 4                         |
| タスクID | TASK-SC-01-IPC-WIRING-FIX |
| 作成日   | 2026-03-22                |

## 目的

IPC 配線統合後の品質を担保するテストコードを実装前に作成する。全16チャネルのハンドラ登録確認、dead-end namespace 不在確認、P42準拠バリデーションの3軸でテストを設計する。

## 実行タスク

1. テストファイルの配置先を決定する（既存テストファイルのパス規則を確認する）
2. 全16チャネルに対してハンドラが登録されていることを確認するテストを作成する
3. `creator:*` namespace（dead-end）が Main Process に登録されていないことを確認するテストを作成する
4. `skill-creator:*` 全チャネルが Preload の allowlist に含まれることを確認するテストを作成する
5. 各チャネルの引数に対し P42準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）テストを作成する
6. IPC レスポンスの wrapper 形式（`{ success, data?, error? }`）を確認するテストを作成する（P60対策）
7. 同ディレクトリの既存テストファイルのインポートパスを参照してから各 import を記述する（P63対策）

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/01-sc-ipc-wiring-fix/phase-02-design.md`
- `.claude/rules/06-known-pitfalls.md#P42`（trim バリデーション）
- `.claude/rules/06-known-pitfalls.md#P60`（IPC レスポンス形式不一致）
- `.claude/rules/06-known-pitfalls.md#P63`（インポートパス誤り）
- `.claude/rules/06-known-pitfalls.md#P41`（v8 カバレッジ カウント）

## 成果物

- `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.test.ts`（新規 or 更新）
- `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts`（削除または統合）
- テストケース一覧（16チャネル × 正常系/バリデーション異常系）

## 完了条件

- [ ] 全16チャネルの正常系ハンドラ登録テストが作成されている
- [ ] dead-end namespace（`creator:*`）不在テストが作成されている
- [ ] allowlist 包含テストが作成されている
- [ ] 3段バリデーション（型/空文字/トリム空文字）のテストが作成されている
- [ ] IPC レスポンス wrapper 形式テストが作成されている
- [ ] `pnpm vitest run` で全テストが Red（実装前のため失敗）であることを確認している

## 次のPhase

Phase 5: 実装
