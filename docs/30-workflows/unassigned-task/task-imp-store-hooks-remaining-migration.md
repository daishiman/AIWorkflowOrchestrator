# 残コンポーネントの個別セレクタHook移行 - タスク指示書

## メタ情報

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | task-imp-store-hooks-remaining-migration                       |
| タスク名     | 残コンポーネントの個別セレクタHook移行                         |
| 分類         | 改善                                                           |
| 対象機能     | Zustand Store状態管理                                          |
| 優先度       | 低                                                             |
| 見積もり規模 | 中規模                                                         |
| ステータス   | 未実施                                                         |
| Issue        | #783                                                           |
| 発見元       | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 Phase 12 スコープ外項目 |
| 発見日       | 2026-02-12                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-STORE-HOOKS-COMPONENT-MIGRATION-001（2026-02-12完了）で、P31問題（Zustand Store Hooks無限ループ）の根本対策として個別セレクタHookパターンを確立した。しかし、移行対象は3コンポーネント（LLMSelectorPanel, SkillSelector, SettingsView）に限定されており、他のコンポーネントでは依然として合成Store Hook（`useLLMStore()`, `useSkillStore()` 等の分割代入パターン）が使用されている。

### 1.2 問題点・課題

- 合成Store Hookを使用するコンポーネントでは、`useEffect`の依存配列に関数を含めると無限ループが発生するリスクが残存
- 新規コンポーネント開発時に、どちらのパターンを使うべきか統一されていない
- コードベース全体で2つのパターンが混在し、保守性が低下する

### 1.3 放置した場合の影響

- P31問題の再発リスク（新規開発者が合成Hookの関数をuseEffect依存配列に含める可能性）
- コードベースの一貫性が損なわれ、レビューコストが増加
- ESLint exhaustive-deps警告の抑制コメントが増加

---

## 2. 何を達成するか（What）

### 2.1 目的

合成Store Hookを使用している残りの全コンポーネントを、個別セレクタHookに移行する。

### 2.2 最終ゴール

- 全コンポーネントが個別セレクタHook（`useAppStore((state) => state.xxx)`）を使用している
- 合成Store Hookの使用箇所がゼロ
- 全テストがPASS

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/renderer/` 配下の全コンポーネントでの合成Store Hook使用箇所の移行
- 必要に応じた新しい個別セレクタHookの追加（store/index.ts）
- 移行後のテスト追加・更新

#### 含まないもの

- Store構造（Slice）自体の変更
- 合成Store Hookの完全削除（別タスク: task-ref-store-hooks-deprecate-composite）
- テスト以外のパフォーマンス最適化

### 2.4 成果物

| 成果物                 | 説明                                     |
| ---------------------- | ---------------------------------------- |
| 移行済みコンポーネント | 個別セレクタHookに移行したコンポーネント |
| 追加セレクタHook       | store/index.tsへの新規セレクタ追加       |
| テストファイル         | 移行後の参照安定性テスト                 |
| Phase 1-12 成果物      | 各Phaseの標準出力ドキュメント            |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-STORE-HOOKS-COMPONENT-MIGRATION-001が完了していること（完了済み）
- `apps/desktop/src/renderer/store/index.ts` に30個の個別セレクタHookが定義済み

### 3.2 依存タスク

| タスクID                               | 状態 |
| -------------------------------------- | ---- |
| UT-STORE-HOOKS-COMPONENT-MIGRATION-001 | 完了 |

### 3.3 必要な知識

- Zustandの`useStore`セレクタパターン（`useAppStore((state) => state.xxx)`が安定参照を返す仕組み）
- P31問題の原因（合成Hookが毎回新しいオブジェクトを返す → 依存配列で無限ループ）
- React `useEffect`の依存配列とオブジェクト同一性

### 3.4 推奨アプローチ

1. `grep -rn "useLLMStore\|useSkillStore\|useAuthModeStore\|useAgentStore\|useNavigationStore" apps/desktop/src/renderer/` で移行対象を特定
2. 各コンポーネントごとに個別セレクタHookに置換
3. `useRef`ガードパターンが残っている箇所はガードを除去

### 3.5 実装課題と解決策（UT-STORE-HOOKS-COMPONENT-MIGRATION-001からの学び）

| 課題                       | 原因                                     | 解決策                                  | 参照                       |
| -------------------------- | ---------------------------------------- | --------------------------------------- | -------------------------- |
| 合成Hookの関数参照が不安定 | 毎レンダーで新オブジェクト生成           | 個別セレクタで関数単体を取得            | P31 (06-known-pitfalls.md) |
| ESLint exhaustive-deps警告 | 空の依存配列でESLint警告抑制が必要だった | 個別セレクタならexhaustive-deps準拠可能 | lessons-learned.md         |
| useRefガード除去の影響確認 | ガード除去後に動作変化の可能性           | テストで無限ループ非発生を確認          | selectors.test.ts          |
| 30個のセレクタ定義の冗長性 | 単一フィールド×30の定義が必要            | 命名規則の統一で可読性を確保            | arch-state-management.md   |

---

## 4. 実行手順

### Phase構成

本タスクはPhase 1-13のフルサイクルで実行する。

### Phase 1: 要件定義

#### 目的

移行対象コンポーネントの特定と影響範囲の分析

#### 手順

1. `grep -rn "useLLMStore\|useSkillStore\|useAuthModeStore\|useAgentStore\|useNavigationStore" apps/desktop/src/renderer/` を実行
2. 各コンポーネントでの使用パターンをリストアップ
3. 移行対象コンポーネントの一覧と優先順位を決定

#### 成果物

- 要件定義書（移行対象リスト、影響範囲）

### Phase 4-5: テスト作成・実装

#### 目的

各コンポーネントの移行とテスト

#### 手順

1. 必要な新規セレクタHookをstore/index.tsに追加
2. 各コンポーネントの合成Hook呼び出しを個別セレクタに置換
3. `useRef`ガードパターンがある箇所はガードを除去
4. 参照安定性テストを追加

#### 完了条件

- 全移行対象コンポーネントが個別セレクタを使用
- 全テストPASS
- ESLint警告なし

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 全コンポーネントが合成Store Hookを使用していない
- [ ] 個別セレクタHookで必要な状態・アクションを取得している
- [ ] `useEffect`の依存配列がESLint exhaustive-deps準拠
- [ ] 無限ループが発生しないことをテストで確認

### 品質要件

- [ ] Line Coverage ≥ 80%
- [ ] Branch Coverage ≥ 60%
- [ ] Function Coverage ≥ 80%
- [ ] 全テストPASS
- [ ] ESLint / TypeScript型チェックエラーなし

### ドキュメント要件

- [ ] Phase 12 実装ガイド（Part 1: 中学生レベル / Part 2: 開発者向け）
- [ ] LOGS.md × 2 更新
- [ ] SKILL.md × 2 更新
- [ ] documentation-changelog.md 作成

---

## 6. 検証方法

### テストケース

| テストケース                                            | 期待結果                         |
| ------------------------------------------------------- | -------------------------------- |
| 各セレクタが安定した参照を返すこと                      | `Object.is(prev, next) === true` |
| useEffectで関数を依存配列に含めても無限ループしないこと | 5秒以内にレンダリング安定        |
| コンポーネントが正常に動作すること                      | UI操作が期待通り動作             |

### 検証手順

1. `pnpm --filter @repo/desktop test` でユニットテスト実行
2. `pnpm typecheck` で型チェック
3. `pnpm lint` でリントチェック
4. 手動テスト: 各画面の動作確認（無限ループ非発生を確認）

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                                         |
| ---------------------------- | ------ | -------- | -------------------------------------------- |
| 移行対象コンポーネントが多数 | 中     | 高       | バッチ移行でコンポーネントグループごとに実施 |
| 移行により既存機能が壊れる   | 高     | 低       | テストファーストで移行前後の動作を検証       |
| 新規セレクタが大量に必要     | 低     | 中       | 既存30個のセレクタを最大限再利用             |
| Phase 12チェックリスト漏れ   | 中     | 中       | documentation-changelog.mdで全Step逐次確認   |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                                                                 | 用途                     |
| ---------------------------------------------------------------------------- | ------------------------ |
| `.claude/rules/03-state-management.md`                                       | Zustand設計原則          |
| `.claude/rules/06-known-pitfalls.md` (P31)                                   | 無限ループ問題の詳細     |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | P31対策セクション        |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`       | 実装時の苦戦箇所         |
| `docs/30-workflows/completed-tasks/UT-STORE-HOOKS-COMPONENT-MIGRATION-001/`  | 先行移行タスクの全成果物 |

### 参考資料

- [Zustand GitHub - Extracting Actions](https://github.com/pmndrs/zustand#extracting-actions)
- P31対策コード例: `apps/desktop/src/renderer/store/index.ts`

---

## 9. 備考

### 先行タスクからの教訓

UT-STORE-HOOKS-COMPONENT-MIGRATION-001で得られた主な教訓:

1. **セレクタ命名規則**: `use + 状態名` パターン（例: `useLLMProviders`, `useLLMFetchProviders`）で統一
2. **テスト設計**: 参照安定性テスト（`Object.is`）と無限ループ防止テスト（レンダーカウント）の2軸
3. **Phase 12の落とし穴**: LOGS.md × 2、SKILL.md × 2 の更新漏れに注意（P1, P25再発パターン）
4. **artifacts.json**: Phase 13完了までトップレベルstatusを「in_progress」に維持

### 補足事項

- 本タスクは緊急性は低いが、コードベースの一貫性向上のために推奨
- 先行タスクの成功を受けて、同一パターンの適用であるためリスクは低い
- 本タスクは GitHub Issue #783 (UT-STORE-HOOKS-REFACTOR-003) と同一スコープ。#783のローカル仕様書として本ファイルを使用する。
