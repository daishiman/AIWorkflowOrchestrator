# UT-09-001: Renderer 全体への iterable ガード横展開 - タスク指示書

## メタ情報

```yaml
issue_number: 1036
task_id: UT-09-001
task_name: Renderer 全体への iterable ガード横展開
category: 改善
target_feature: Renderer 層の IPC 戻り値防御
priority: 中
scale: 中規模
status: 未実施
source_phase: 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001 Phase 10 MINOR M-03
created_date: 2026-03-07
dependencies: [09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001]
```

## メタ情報

| 項目         | 値                                                                                     |
| ------------ | -------------------------------------------------------------------------------------- |
| タスクID     | UT-09-001                                                                              |
| タスク名     | Renderer 全体への iterable ガード横展開                                                |
| 分類         | 改善（防御的プログラミング）                                                           |
| 対象機能     | Renderer 層の IPC 戻り値防御                                                           |
| 優先度       | 中                                                                                     |
| 見積もり規模 | 中規模                                                                                 |
| ステータス   | 未実施                                                                                 |
| 発見元       | 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001 Phase 10 MINOR M-03 / Phase 12 |
| 発見日       | 2026-03-07                                                                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

09-TASK で `ApiKeysSection` の `loadProviders` 関数に4段階防御ガード（optional chaining + 存在チェック + `Array.isArray` + null-safe エラー参照）を追加し、Preload 経由のレスポンスが non-array だった場合のクラッシュを防止した。しかし、同様の iterable 前提処理が他の Renderer コンポーネントにも残存している可能性がある。

Phase 10 最終レビューの MINOR 指摘 M-03 で「`electronAPI.apiKey` の save/delete/validate にも同パターンの防御が必要」と指摘されており、Phase 12 で未タスク化が決定された。

### 1.2 問題点・課題

- IPC 戻り値を `.map()` / `.find()` / `.filter()` / `.forEach()` / `for...of` で直接処理している箇所が横断管理されていない
- コンポーネントごとに防御実装が属人化しやすく、一貫性がない
- `result.data!.providers` のような non-null assertion (!) が残存している可能性がある（P48 / P19 参照）

### 1.3 放置した場合の影響

- 別画面（AgentView, EditorView, SkillSelectorPanel 等）で同種クラッシュが再発する
- Preload の try-catch 内で部分的に API 公開が失敗した場合、原因特定が困難になる
- 仕様同期コストが増え、回帰監査が難化する

---

## 2. 何を達成するか（What）

### 2.1 目的

Renderer 層の iterable 前提処理を洗い出し、09-TASK で確立した防御パターンを統一適用する。

### 2.2 最終ゴール

1. IPC 戻り値の iterable 前提箇所の完全一覧化
2. 高リスク箇所へ4段階防御パターンを適用
3. テストで非配列入力時の挙動を固定
4. non-null assertion (!) の全廃（Preload 経由レスポンスに対して）

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/renderer/` 配下の iterable 前提処理監査
- `electronAPI.apiKey.save` / `electronAPI.apiKey.delete` / `electronAPI.apiKey.validate` の防御追加
- 他の `electronAPI.*` メソッドの戻り値防御
- 異常系テスト追加

#### 含まないもの

- Main Process / Preload 層の設計変更（UT-09-002 のスコープ）
- 既存 UI/UX の大規模リデザイン
- `safeInvoke` / `safeOn` パターンの改修（task-04 スコープ）

### 2.4 成果物

- 監査結果一覧（iterable 前提箇所リスト）
- 修正コードとテスト
- カバレッジレポート
- 仕様同期（task-workflow / lessons-learned / documentation-changelog）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 09-TASK の防御実装を参照できること
- `vitest` 実行環境が整っていること（P40: `cd apps/desktop` から実行）

### 3.2 依存タスク

- 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001（防御パターンの原型）

### 3.3 必要な知識

- Renderer / Preload 契約境界（`contextBridge.exposeInMainWorld` の structured clone 制約）
- `Array.isArray` による runtime shape guard
- AuthKeySection の防御パターン（先行実装として参照可能）
- P19: 型キャスト（as）による実行時検証バイパスの危険性
- P48: non-null assertion (!) の見落としリスク

### 3.4 推奨アプローチ

1. `rg -n "\.map\(|\.find\(|\.filter\(|\.forEach\(|for\s.*of" apps/desktop/src/renderer/` で iterable 前提箇所を抽出
2. IPC 戻り値を直接操作している箇所を優先順位付け（UI クラッシュ影響度順）
3. 影響範囲が大きい画面から段階適用
4. 「warning ログ + フォールバック」の挙動を統一

### 3.5 統一防御パターン（09-TASK で確立）

```typescript
// 4段階防御パターン
const loadData = useCallback(async () => {
  // レイヤー1: API 存在チェック（optional chaining + 存在確認）
  const api = window.electronAPI?.someApi;
  if (!api?.someMethod) {
    console.warn(
      "[ComponentName] window.electronAPI.someApi.someMethod is not available",
    );
    setState((prev) => ({ ...prev, data: [], error: "機能が利用できません" }));
    return;
  }

  // レイヤー2: メソッド呼び出し + 結果検証
  const result = await api.someMethod();

  // レイヤー3: Array.isArray による iterable ガード
  if (result?.success && result?.data) {
    const items = Array.isArray(result.data.items) ? result.data.items : [];
    if (!Array.isArray(result.data.items)) {
      console.warn(
        "[ComponentName] returned non-array items, falling back to empty array:",
        typeof result.data.items,
      );
    }
    setState((prev) => ({ ...prev, data: items }));
  } else {
    // レイヤー4: null-safe エラー参照
    setState((prev) => ({
      ...prev,
      error: result?.error?.message || "データの取得に失敗しました",
    }));
  }
}, []);
```

### 3.6 実装時の苦戦箇所と解決策（親タスクからの教訓）

| #   | 課題                                 | 発見経緯                                                                   | 解決策                                                               | 教訓（標準ルール）                                                                     |
| --- | ------------------------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | 仕様書対象と実装差分の対象がずれる   | 09で AuthGuard 前提記述と ApiKeysSection 実装が不一致                      | `git diff` を起点に対象コンポーネントを確定                          | 計画ではなく実差分から仕様を更新する                                                   |
| 2   | non-null assertion (!) の見落とし    | `result.data!.providers` が TypeScript を通過するがランタイムで unsafe     | `Array.isArray()` による実行時型検証に置換                           | Preload 経由レスポンスに `!` を使用しない（P48）                                       |
| 3   | Coverage 実行ディレクトリ依存        | ルートから vitest 実行で `window is not defined`                           | `cd apps/desktop && pnpm vitest run`                                 | 対象パッケージのディレクトリから実行する（P40）                                        |
| 4   | contextBridge 部分公開失敗の検出困難 | Preload の try-catch が console.error のみで Renderer に通知しない         | Renderer 側で optional chaining + 存在チェック + warn ログの多層防御 | Renderer は Preload API の存在を前提とせず、必ず存在チェックとフォールバックを実装する |
| 5   | Phase 12 成果物名ドリフト            | `unassigned-task-report.md` と `unassigned-task-detection.md` の命名不一致 | `artifacts.json` との二重突合で命名統一                              | Phase 12 成果物は5点固定名を使用する                                                   |

---

## 4. 実行手順

### Phase 1: 監査

1. `rg -n "\.map\(|\.find\(|\.filter\(|\.forEach\(|for\s.*of" apps/desktop/src/renderer/` で iterable 前提箇所を抽出
2. IPC 戻り値を直接処理している箇所を特定（`window.electronAPI` 経由のデータ）
3. 各箇所のリスク評価（クラッシュ影響度 x 発生確率）

### Phase 2: 実装

1. 高リスク箇所から順に4段階防御パターンを適用
2. `[ComponentName]` プレフィックス付き warning ログを統一
3. フォールバック値（空配列 `[]` / null / デフォルト値）を設計

### Phase 3: テスト

1. 各コンポーネントに異常系テスト追加（electronAPI undefined / メソッド undefined / 非配列レスポンス）
2. `pnpm --filter @repo/desktop exec vitest run` でテスト実行（P40 準拠）
3. カバレッジ確認（Line >= 80%, Branch >= 60%）

### Phase 4: 仕様同期

1. `task-workflow.md` / `lessons-learned.md` に完了記録
2. `error-handling.md` / `testing-component-patterns.md` にパターン追記（該当する場合）
3. `documentation-changelog.md` 作成

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] iterable 前提箇所の監査結果一覧が作成されている
- [ ] 高リスク箇所に4段階防御ガードが実装されている
- [ ] `electronAPI.apiKey.save/delete/validate` に防御が追加されている
- [ ] non-null assertion (!) が Preload 経由レスポンスから除去されている

### 品質要件

- [ ] 異常系テストが追加され全 PASS している
- [ ] 既存テストが破壊されていない
- [ ] カバレッジ基準を満たしている（Line >= 80%, Branch >= 60%）
- [ ] TypeCheck が PASS している

### ドキュメント要件

- [ ] `task-workflow.md` に完了記録が追加されている
- [ ] `lessons-learned.md` に教訓が追記されている
- [ ] `documentation-changelog.md` が作成されている

---

## 6. 検証方法

### テスト実行

```bash
# P40準拠: 対象パッケージのディレクトリから実行
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/ApiKeysSection/__tests__/
cd apps/desktop && pnpm vitest run  # 全テスト
pnpm --filter @repo/desktop typecheck
```

### 監査検証

```bash
# iterable 前提箇所が全てガード済みかを確認
rg -n "\.map\(|\.find\(|\.filter\(" apps/desktop/src/renderer/ | grep -v "Array.isArray"
# non-null assertion の残存確認
rg -n "result\.data!" apps/desktop/src/renderer/
```

### 仕様検証

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-dir>
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

---

## 7. リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                                           |
| ---------------------- | ------ | -------- | ---------------------------------------------- |
| 監査対象が広く工数超過 | 中     | 中       | 高頻度 UI から段階導入。1回のPRで全適用しない  |
| ガード過剰で可読性低下 | 低     | 中       | 共通ヘルパー化を検討（UT-09-002 と連携）       |
| 既存テストの破壊       | 中     | 低       | 既存テスト全 PASS を確認してから PR 作成       |
| 仕様書対象の見落とし   | 低     | 中       | `git diff` 起点で対象ファイルを確定（教訓 #1） |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001/` — 親タスク仕様書
- `docs/30-workflows/09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001/outputs/phase-12/unassigned-task-detection.md` — 検出レポート
- `docs/30-workflows/09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001/outputs/phase-10/final-review-result.md` — MINOR M-03 指摘

### システム仕様書参照

- `.claude/skills/aiworkflow-requirements/references/error-handling.md` — Renderer 境界防御パターン（v1.9.0）
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` — Preload Payload 防御（v1.13.0）
- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` — Preload shape テストパターン（v1.10.0）
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` — 完了タスク・残課題テーブル
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` — 09-TASK 苦戦箇所（L168-L227）

### 既知の落とし穴

- `.claude/rules/06-known-pitfalls.md` — P19（型キャスト検証バイパス）、P40（テスト実行ディレクトリ依存）、P48（non-null assertion 見落とし）

### 関連未タスク

- UT-09-002: Preload response shape 共通バリデータ導入（本タスクと補完関係）

---

## 9. 備考

### 実装方針

- 失敗時は silent fail にせず `console.warn("[ComponentName]")` プレフィックス付き warning を残す
- UI は停止させずフォールバック値を優先する（ユーザー体験の継続性）
- 09-TASK の `ApiKeysSection` 実装を参照パターンとして活用する

### Phase 10 レビュー指摘の原文

```text
M-03: Phase 7 gap-log.md で他のelectronAPIメソッド（save/delete/validate）の同様防御を
未タスクとして検出済み。Phase 12で確実に未タスク仕様書化すること
OI-01: electronAPI.apiKey の save/delete/validate にも同パターンの防御が必要（Medium）
```
