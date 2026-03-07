# UT-09-002: Preload response shape 共通バリデータ導入 - タスク指示書

## メタ情報

```yaml
issue_number: 1037
task_id: UT-09-002
task_name: Preload response shape 共通バリデータ導入
category: 改善
target_feature: apps/desktop/src/preload/index.ts
priority: 低
scale: 中規模
status: 未実施
source_phase: 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001 Phase 10 OI-02
created_date: 2026-03-07
dependencies: [09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001]
```

## メタ情報

| 項目         | 値                                                                                |
| ------------ | --------------------------------------------------------------------------------- |
| タスクID     | UT-09-002                                                                         |
| タスク名     | Preload response shape 共通バリデータ導入                                         |
| 分類         | 改善（多層防御強化）                                                              |
| 対象機能     | `apps/desktop/src/preload/index.ts` および関連型定義                              |
| 優先度       | 低                                                                                |
| 見積もり規模 | 中規模                                                                            |
| ステータス   | 未実施                                                                            |
| 発見元       | 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001 Phase 10 OI-02 / Phase 12 |
| 発見日       | 2026-03-07                                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

09-TASK で `ApiKeysSection` の Renderer 側にフォールバック防御を追加したが、これは Renderer 層での「最終防衛線」であり、本質的には Preload 層（`contextBridge.exposeInMainWorld` に渡す API オブジェクト）の戻り値を共通バリデーション関数で検証するパターンが欠如している。

現在の Preload 層は `safeInvoke` / `safeOn` パターンで IPC 通信をラップしているが、Main Process からのレスポンス shape（配列・オブジェクト・null）の検証は行われておらず、`contextBridge` の structured clone 制約によって shape が崩壊した場合の検出手段がない。

### 1.2 問題点・課題

- チャネルごとに戻り値検証がバラバラで、共通パターンが不在
- 防御が Renderer 側に偏っており、Preload 層での早期検出ができない
- `contextBridge` の structured clone で `undefined` / `function` が除去された場合の挙動が未検証
- 新規チャネル追加時に検証漏れが発生しやすい

### 1.3 放置した場合の影響

- 新規チャネルで shape drift を再発しやすい（各実装者が独自の検証を行うか、または検証なしで実装する）
- 契約監査の難易度が上がり、Phase 10 レビューの指摘件数が増加する
- Renderer 側の防御コードが肥大化し、関心の分離が崩れる

---

## 2. 何を達成するか（What）

### 2.1 目的

Preload 層で共通の response shape validator を導入し、Main → Preload → Renderer の契約安定性を向上させる。多層防御（Defense in Depth）の原則に基づき、Preload 層を「第2防衛線」として機能させる。

### 2.2 最終ゴール

1. 共通 `validateResponseShape<T>` 関数の実装
2. 主要 API（apiKey.list, skill.list 等）への段階適用
3. 契約逸脱時の標準挙動（warning ログ + 正規化レスポンス）の統一
4. 型レベルでの safety guarantee（`unknown` → validated `T`）

### 2.3 スコープ

#### 含むもの

- Preload API での response shape 検証関数の実装
- 関連型定義（`preload/types.ts`）の更新
- 主要チャネルへの段階適用
- ユニットテスト追加

#### 含まないもの

- Main Process IPC ハンドラの全面書き換え
- 既存 Renderer 全画面の再設計（UT-09-001 のスコープ）
- Zod スキーマの導入（過度な依存追加を避ける）

### 2.4 成果物

- `validateResponseShape<T>` 共通関数実装
- 適用チャネル一覧
- テストコード
- 仕様同期（task-workflow / lessons-learned / documentation-changelog）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 現行 Preload API の構造（`safeInvoke` / `safeOn` パターン）を把握していること
- 型定義更新に伴うテスト修正が可能なこと
- P40 準拠: テスト実行は `cd apps/desktop` から行うこと

### 3.2 依存タスク

- task-04（Preload 層調査）
- 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001（Renderer 防御パターンの原型）

### 3.3 必要な知識

- `contextBridge.exposeInMainWorld` と structured clone の制約
- IPC Result パターン（`{ success: boolean, data?: T, error?: { message: string } }`）
- TypeScript Generics（`validateResponseShape<T>` の型設計）
- P19: 型キャスト（as）による実行時検証バイパスの危険性
- P48: non-null assertion (!) の見落としリスク

### 3.4 推奨アプローチ

1. ヘルパー関数を先に実装・テストしてから個別 API へ適用
2. 1チャネルずつテストを固定して展開（段階適用）
3. 互換性を壊さない設計（既存の `safeInvoke` に組み込む形が理想）

### 3.5 設計案: validateResponseShape

```typescript
// apps/desktop/src/preload/validators.ts

type ValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; fallback: T; reason: string };

interface ShapeSpec<T> {
  /** 検証対象フィールド名 */
  field: string;
  /** 型ガード関数 */
  guard: (value: unknown) => value is T;
  /** 検証失敗時のフォールバック値 */
  fallback: T;
}

function validateResponseShape<T>(
  response: unknown,
  spec: ShapeSpec<T>,
  context: string
): ValidationResult<T> {
  const value = (response as Record<string, unknown>)?.[spec.field];

  if (spec.guard(value)) {
    return { valid: true, data: value };
  }

  console.warn(
    `[Preload:${context}] ${spec.field} failed shape validation, ` +
    `expected type guard to pass but got: ${typeof value}. ` +
    `Falling back to default value.`
  );

  return { valid: false, fallback: spec.fallback, reason: typeof value };
}

// 使用例: apiKey.list の providers 検証
const providersSpec: ShapeSpec<ApiKeyProvider[]> = {
  field: "providers",
  guard: (v): v is ApiKeyProvider[] => Array.isArray(v),
  fallback: [],
};

// safeInvoke 内での使用
async list(): Promise<ApiKeyListResult> {
  const raw = await safeInvoke(IPC_CHANNELS.API_KEY_LIST);
  if (raw?.success && raw?.data) {
    const { valid, data, fallback } = validateResponseShape(
      raw.data, providersSpec, "apiKey.list"
    );
    return {
      success: true,
      data: { providers: valid ? data : fallback }
    };
  }
  return raw;
}
```

### 3.6 実装時の苦戦箇所と解決策（親タスクからの教訓）

| #   | 課題                                 | 発見経緯                                                                   | 解決策                                             | 教訓（標準ルール）                                                                          |
| --- | ------------------------------------ | -------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | Renderer 側のみで防御が完結しがち    | 09で UI クラッシュは止めたが upstream 未統一                               | Preload で共通 validator を導入し、多層防御を実現  | 境界の早い段階で正規化する                                                                  |
| 2   | non-null assertion (!) の見落とし    | `result.data!.providers` が TypeScript を通過するがランタイムで unsafe     | `unknown` 型で受け取り、型ガード関数で検証         | Preload 経由レスポンスに `!` を使用しない（P48）                                            |
| 3   | contextBridge 部分公開失敗の検出困難 | Preload の try-catch が console.error のみで Renderer に通知しない         | Preload 層で warning ログ + 正規化レスポンスを返す | 検出困難な失敗モードにはログとフォールバックの両方を実装する                                |
| 4   | Phase 12 成果物名ドリフト            | `unassigned-task-report.md` と `unassigned-task-detection.md` の命名不一致 | `artifacts.json` との二重突合で命名統一            | Phase 12 成果物は5点固定名を使用する                                                        |
| 5   | 未タスク管理の3ステップ不完全        | detection だけ作成され指示書未配置                                         | unassigned-task に即時作成 + 3ステップ監査         | 未タスクは (1)指示書 → (2)残課題テーブル → (3)関連仕様書リンク の全ステップが必要（P3/P38） |

---

## 4. 実行手順

### Phase 1: 設計

1. `validateResponseShape<T>` のインターフェース設計
2. 適用対象チャネルの洗い出し（`rg -n "safeInvoke" apps/desktop/src/preload/`）
3. 既存 `safeInvoke` との統合方法を検討

### Phase 2: 実装

1. `apps/desktop/src/preload/validators.ts` にヘルパー関数を実装
2. `apps/desktop/src/preload/types.ts` に `ShapeSpec<T>` / `ValidationResult<T>` を追加
3. `apiKey.list` を最初の適用対象として実装

### Phase 3: テスト

1. `validators.test.ts` にユニットテスト追加（正常系 / 非配列 / null / undefined）
2. 既存の Preload テストへの影響確認
3. `cd apps/desktop && pnpm vitest run` で全テスト実行（P40 準拠）

### Phase 4: 段階展開

1. 他の高頻度チャネル（`skill.list`, `agent.list` 等）へ適用
2. 各チャネルにテスト追加
3. カバレッジ確認

### Phase 5: 仕様同期

1. `task-workflow.md` / `lessons-learned.md` に完了記録
2. `api-ipc-system.md` / `security-electron-ipc.md` にパターン追記
3. `documentation-changelog.md` 作成

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `validateResponseShape<T>` 共通関数が実装されている
- [ ] 少なくとも `apiKey.list` チャネルに適用されている
- [ ] 契約逸脱時に warning ログが出力される
- [ ] 契約逸脱時にフォールバック値が返される

### 品質要件

- [ ] 異常系テストが追加され全 PASS している
- [ ] 既存テストが破壊されていない
- [ ] カバレッジ基準を満たしている（Line >= 80%, Branch >= 60%）
- [ ] TypeCheck が PASS している
- [ ] `any` 型を使用していない

### ドキュメント要件

- [ ] `task-workflow.md` に完了記録が追加されている
- [ ] `lessons-learned.md` に教訓が追記されている
- [ ] `documentation-changelog.md` が作成されている
- [ ] `api-ipc-system.md` にパターンが記録されている

---

## 6. 検証方法

### テスト実行

```bash
# P40準拠: 対象パッケージのディレクトリから実行
cd apps/desktop && pnpm vitest run src/preload/**/*.test.ts
cd apps/desktop && pnpm vitest run  # 全テスト
pnpm --filter @repo/desktop typecheck
```

### 型検証

```bash
# any 型の残存確認
rg -n ": any" apps/desktop/src/preload/validators.ts
# non-null assertion の残存確認
rg -n "result\.data!" apps/desktop/src/preload/
```

### 仕様検証

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-dir>
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

---

## 7. リスクと対策

| リスク                        | 影響度 | 発生確率 | 対策                                            |
| ----------------------------- | ------ | -------- | ----------------------------------------------- |
| 既存 API への適用漏れ         | 中     | 中       | 段階適用リストを管理し、チャネルごとにチェック  |
| validator 過剰で可読性低下    | 低     | 中       | 共通化し API ごとの差分を最小化                 |
| パフォーマンス影響            | 低     | 低       | O(1) の型チェックのみ（Array.isArray, typeof）  |
| 型定義の二箇所同時更新（P32） | 中     | 中       | `preload/types.ts` と `shared/types` を同時更新 |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001/` — 親タスク仕様書
- `docs/30-workflows/09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001/outputs/phase-12/unassigned-task-detection.md` — 検出レポート
- `docs/30-workflows/09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001/outputs/phase-10/release-decision.md` — OI-02 指摘

### システム仕様書参照

- `.claude/skills/aiworkflow-requirements/references/error-handling.md` — Renderer 境界防御パターン（v1.9.0）
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` — Preload Payload 防御（v1.13.0）
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md` — Renderer Response Shape Fallback（v1.6.0）
- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` — Preload shape テストパターン（v1.10.0）
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` — 完了タスク・残課題テーブル
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` — 09-TASK 苦戦箇所（L168-L227）

### 既知の落とし穴

- `.claude/rules/06-known-pitfalls.md` — P3（未タスク3ステップ不完全）、P19（型キャスト検証バイパス）、P32（型定義二箇所同時更新）、P38（未タスク配置ディレクトリ間違い）、P40（テスト実行ディレクトリ依存）、P48（non-null assertion 見落とし）

### 関連未タスク

- UT-09-001: Renderer 全体への iterable ガード横展開（本タスクと補完関係）

---

## 9. 備考

### 実装方針

- 互換性を壊さない段階導入（feature toggle なしで小さく適用）
- 失敗時は `throw` より安全フォールバックを優先する
- `safeInvoke` の既存パターンを尊重し、内部に組み込む形で実装
- Zod 等の外部ライブラリは使わず、TypeScript Generics + 型ガード関数で実現

### Phase 10 レビュー指摘の原文

```text
OI-02: Preload 層に共通バリデーション関数 validateResponseShape 導入（Low）
```

### 多層防御の位置づけ

```
Main Process (IPC Handler)
  ↓ structured clone via contextBridge
Preload Layer ← validateResponseShape (第2防衛線: 本タスク)
  ↓ contextBridge.exposeInMainWorld
Renderer Layer ← Array.isArray + optional chaining (最終防衛線: UT-09-001 / 09-TASK)
```
