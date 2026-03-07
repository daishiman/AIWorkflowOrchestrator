# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 8                                                |
| 機能名     | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001   |
| タスク名   | 設定画面 apiKey.list 契約防御と providers 正規化 |
| 作成日     | 2026-03-06                                       |
| ステータス | 未実施                                           |

## 目的

Phase 5-7 の実装・テスト結果を踏まえ、振る舞いを変えずにコード品質を改善する。特に `profileHandlers.ts` と `ApiKeysSection` の防御パターン統一を検討する。

## 実行タスク

### Task 1: 防御パターン統一の検討

現状の防御パターン不統一を確認し、統一方針を決定する。

| ファイル             | 現在のパターン                         | 統一後のパターン                              |
| -------------------- | -------------------------------------- | --------------------------------------------- |
| `ApiKeysSection`     | `Array.isArray(result.data.providers)` | 維持（正しいパターン）                        |
| `profileHandlers.ts` | `identities ?? []`                     | `Array.isArray(identities) ? identities : []` |

**統一の判断基準**:

- 2 箇所以上で同一パターンの防御が必要 → 正規化ヘルパー抽出を検討
- `?? []` は `null`/`undefined` のみ防御、`Array.isArray` は全型防御
- P48（Non-null assertion 置換）準拠: 実行時型検証を優先

**抽出判断**:

```typescript
// 2箇所以上で使用されるパターン → ヘルパー抽出を検討
// 現時点: ApiKeysSection + profileHandlers の2箇所

// 案A: インラインのまま維持（2箇所なら抽出不要）
const providers = Array.isArray(result.data?.providers)
  ? result.data.providers
  : [];

// 案B: 汎用ヘルパー抽出（3箇所以上になった場合）
function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}
```

- 現時点では **2 箇所のみ**のため、案 A（インライン維持）を推奨
- 3 箇所目が発生した時点で案 B への抽出を未タスク化する

### Task 2: 重複 mock / helper の整理

Phase 5-6 で追加したテストコード内の重複を確認する。

**確認項目**:

- テストデータファクトリ `createProviderStatus()` がテストファイル間で重複していないか
- mock のセットアップが `beforeEach` で `vi.clearAllMocks()` または `mockReset()` によりリセットされているか（P9 対策）
- fixture 名が設計用語と一致しているか（EXP-01〜EXP-04 との対応）

### Task 3: テスト名・エラーメッセージの用語統一

| 対象             | 統一前（例）           | 統一後                                   |
| ---------------- | ---------------------- | ---------------------------------------- |
| テスト名         | "handles bad data"     | "EXP-01: result.data undefined fallback" |
| エラーメッセージ | "Something went wrong" | "API キー情報の取得に失敗しました"       |
| fixture 名       | `badResponse`          | `undefinedDataResponse`                  |

## 参照資料

| 資料名                 | パス                                                                          | 用途                      |
| ---------------------- | ----------------------------------------------------------------------------- | ------------------------- |
| Renderer Component     | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`     | 正規化パターンの確認      |
| profileHandlers        | `apps/desktop/src/main/ipc/profileHandlers.ts`                                | `identities ?? []` の確認 |
| development-guidelines | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | ヘルパー配置規則          |
| known-pitfalls P48     | `.claude/rules/06-known-pitfalls.md`                                          | Non-null assertion 置換   |
| Phase 5-7 成果物       | `outputs/phase-5/` 〜 `outputs/phase-7/`                                      | リファクタリング入力      |

## 成果物

| 成果物          | パス                                     | 説明                         |
| --------------- | ---------------------------------------- | ---------------------------- |
| refactor ガード | `outputs/phase-8/refactor-guardrails.md` | 振る舞い維持の条件と統一方針 |
| 簡素化ログ      | `outputs/phase-8/simplification-log.md`  | 削減した重複と残した制約     |

## 完了条件

- [ ] 防御パターン統一方針（案 A or 案 B）が決定され記録されている
- [ ] `profileHandlers.ts` の `identities ?? []` → `Array.isArray` 統一が実施 or 未タスク化されている
- [ ] テスト名・fixture 名が設計用語と一致している
- [ ] リファクタリング前後で全テストが PASS している
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了内容を実行記録へ残している

## 次の Phase

Phase 9: 品質保証

## 統合テスト連携

- 本Phaseの結果は `apps/desktop` の対象Vitest実行（`apiKeyHandlers.list` / `profileHandlers.identities` / `ApiKeysSection`）と連動して判定する。
- Phase 11 ではスクリーンショット証跡（TC-11-01〜03）を統合テスト結果と同じ実装リビジョンで取得する。
