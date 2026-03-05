# Phase 2 セレクタ規約設計（P31対策）

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| タスクID   | TASK-UI-01-A-STORE-SLICE-BASELINE |
| Phase      | 2                                 |
| 作成日     | 2026-03-05                        |
| ステータス | completed                         |

## 1. 設計目的

Zustand 合成Hookの再導入を防ぎ、P31（無限ループ）を再発させないためのセレクタ命名・利用規約を固定する。

## 2. 命名規約

| 区分               | パターン                          | 例                    | 禁止例           |
| ------------------ | --------------------------------- | --------------------- | ---------------- |
| 状態セレクタ       | `use` + 状態名 + ドメイン         | `useIsAnalyzingSkill` | `useIsAnalyzing` |
| アクションセレクタ | `use` + 動詞 + 対象 + ドメイン    | `useFetchAuthMode`    | `useFetch`       |
| 計算セレクタ       | `useIs/Has/Get` + 意味 + ドメイン | `useIsAuthModeValid`  | `useIsValid`     |

## 3. 非推奨ルール

- `useLLMStore` / `useSkillStore` / `useAuthModeStore` のような合成Hookは新規利用禁止。
- 既存互換のため export は維持するが、実装では個別セレクタのみ採用する。
- `useEffect` 依存配列に Store関数を置く場合、個別セレクタで取得した参照のみ許可する。

## 4. セレクタ実装ルール

| ルールID | ルール                                                                 | 理由                               |
| -------- | ---------------------------------------------------------------------- | ---------------------------------- |
| SP-01    | セレクタは `useAppStore((state) => state.xxx)` の単値取得を基本とする  | 再レンダリング範囲を最小化するため |
| SP-02    | 複数値をまとめる場合は計算セレクタのみ許可し、オブジェクト返却を避ける | 参照不安定化を防ぐため             |
| SP-03    | 同名になりうる状態はドメインサフィックス必須                           | `isLoading`/`error` 衝突を防ぐため |
| SP-04    | 追加セレクタには JSDoc で責務を1文記載する                             | 後続タスクの可読性を上げるため     |

## 5. 運用チェックリスト

- [x] 合成Hookの新規追加がない
- [x] 新規セレクタ名が `use{Verb}{Domain}` または `use{State}{Domain}` に従う
- [x] 汎用名（`useError`, `useLoading`, `useData`）を追加していない
- [x] 既存合成Hookは `@deprecated` を維持している

## 6. 後続フェーズ連携

- Phase 4: 本規約に基づき回帰テストを作成する。
- Phase 5: Store baseline 実装に規約を反映する。
- Phase 8: 命名差分を監査し、違反0件を確認する。

## 7. 参照

- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`
