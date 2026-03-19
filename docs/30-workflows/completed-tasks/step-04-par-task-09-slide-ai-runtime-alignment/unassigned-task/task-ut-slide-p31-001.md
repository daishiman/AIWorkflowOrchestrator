# useSlideProject P31 セレクタ移行 - タスク指示書

## メタ情報

```yaml
issue_number: 1364
```

## メタ情報

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | UT-SLIDE-P31-001                                          |
| タスク名     | useSlideProject P31 セレクタ移行                          |
| 分類         | リファクタリング                                          |
| 対象機能     | slide-ai-runtime-alignment                                |
| 優先度       | 中                                                        |
| 見積もり規模 | 小規模                                                    |
| ステータス   | 未実施                                                    |
| 発見元       | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 Phase 11 発見事項 |
| 発見日       | 2026-03-19                                                |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`useSlideProject()` は `useSlideProjectStore()` の合成オブジェクトを保持し、そのまま `useEffect` 依存へ持ち込んでいる。

### 1.2 問題点・課題

- P31 パターンに近い store 全体参照が残っている
- selector 単位の責務が曖昧
- slide runtime 実装後に再レンダリング不安定化の温床になる

### 1.3 放置した場合の影響

- watch listener 再登録や余計な再描画が起きやすい
- slide UI 実装後に原因切り分けが難しくなる

## 2. 何を達成するか（What）

### 2.1 目的

`useSlideProject()` を個別セレクタベースへ移行し、P31 リスクを除去する。

### 2.2 最終ゴール

- store 全体参照を廃止する
- action / state を個別 selector で取得する
- effect 依存が安定参照のみで構成される

### 2.3 スコープ

#### 含むもの

- `useSlideProject.ts`
- 必要な selector 追加
- 関連テスト更新

#### 含まないもの

- slide runtime 実装本体
- UI レイアウト改善

### 2.4 成果物

- selector migration 差分
- P31 再発防止テスト

## 3. どのように実行するか（How）

### 3.1 前提条件

- slide store の state / action 契約が確定していること

### 3.2 依存タスク

- UT-SLIDE-IMPL-001（推奨）

### 3.3 必要な知識

- Zustand selector pattern
- P31 / P48

### 3.4 推奨アプローチ

- state と action を分離し、effect に合成オブジェクトを渡さない

## 4. 実行手順

1. `useSlideProjectStore()` 全体参照箇所を洗い出す。
2. 必要な state/action selector を追加する。
3. `useSlideProject()` を selector ベースへ移行する。
4. listener cleanup と dependency array を再確認する。
5. targeted test を追加する。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `useSlideProject()` に store 全体参照が残っていない
- [ ] effect 依存が安定参照のみで構成されている

### 品質要件

- [ ] P31 再発防止テストがある
- [ ] runtime 実装後も listener 再登録が起きない

### ドキュメント要件

- [ ] `arch-state-management-advanced.md` と整合している

## 6. 検証方法

1. targeted unit test を実行する。
2. render count / listener cleanup を確認する。
3. typecheck を実行する。

## 7. リスクと対策

| リスク                                    | 影響度 | 発生確率 | 対策                             |
| ----------------------------------------- | ------ | -------- | -------------------------------- |
| selector 粒度が不足して再度合成参照へ戻る | 中     | 中       | 先に必要 selector 一覧を確定する |
| runtime 実装との差分衝突                  | 中     | 中       | UT-SLIDE-IMPL-001 後に着手する   |

## 8. 参照情報

- `.claude/skills/aiworkflow-requirements/references/arch-state-management-advanced.md` — P31/P48 対策の正本
- `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference.md` — stale state 防止契約
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md` — Task09 教訓
- `apps/desktop/src/renderer/slide/useSlideProject.ts`
- `apps/desktop/src/renderer/slide/store.ts`
- `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/outputs/phase-2/design-summary.md` — 個別セレクタ15個の設計

## 9. 備考

UI 実装より優先度は下がるが、runtime 実装直後にやると drift が最小になる。

## 10. 苦戦箇所・実装上の注意点（教訓）

### 10.1 Store 全体参照の依存配列汚染

useSlideProject.ts (L19) で `const store = useSlideProjectStore()` と全体取得し、その `store` オブジェクトを useCallback/useEffect の依存配列に渡していた。Zustand のアクション関数は参照安定だが、状態フィールドを含む合成オブジェクトは毎回新しい参照になるため、依存配列に入れると不要な再実行が発生する。

**教訓**: Zustand Store から取得する際は必ず個別セレクタ（`useSlideStore(s => s.syncStatus)` 等）を使用する。合成 Hook パターンは P31 の根本原因であり、`@deprecated` として扱う。

### 10.2 リスナー再登録の副作用

useEffect 内で `window.slideApi.onStructureChange()` 等のリスナーを登録し、依存配列に `store` を含めていたため、store 更新のたびにリスナーの登録・解除が繰り返される可能性があった（P5 リスク）。

**教訓**: IPC リスナーの登録は一度だけ行い、クリーンアップ関数で確実に解除する。依存配列にストアオブジェクトを含めない。アクション関数が必要な場合は個別セレクタで取得する（Zustand アクションは参照安定）。

### 10.3 個別セレクタ設計の15個パターン

Phase 2 で設計した個別セレクタは15個。スカラー値を返すもの（P48 リスクなし）とオブジェクトを返すもの（useShallow 必須）を明確に分類した。

**教訓**: セレクタ設計時に「戻り値がスカラーかオブジェクトか」を分類表にし、オブジェクト返却のセレクタには自動的に useShallow を適用するルールを設ける。
