---
issue_number: null
---

# Vitest モジュールレベルモック監査・使い分けガイドライン策定

## メタ情報

| 項目             | 内容                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| タスクID         | task-ref-vitest-module-mock-audit-001                                                               |
| タスク名         | Vitest モジュールレベルモック監査・使い分けガイドライン策定                                         |
| 分類             | リファクタリング                                                                                    |
| 対象機能         | テスト基盤（Desktop / Shared 共通）                                                                 |
| 優先度           | 低                                                                                                  |
| 見積もり規模     | 小規模                                                                                              |
| ステータス       | 未実施                                                                                              |
| 発見元           | TASK-FIX-11-1-SDK-TEST-ENABLEMENT Phase 5（モジュールレベルモックによるタイムアウトテスト不可問題） |
| 発見日           | 2026-02-13                                                                                          |
| 発見エージェント | 実装担当（`vi.mock()` がモジュール内部ロジックを消失させる問題）                                    |

## 1. なぜこのタスクが必要か（Why）

### 背景

TASK-FIX-11-1（SDK統合テスト有効化）の実装中、`vi.mock("../agent-client")` でモジュール全体をモック化した状態で、内部の `setTimeout` + `AbortController` によるタイムアウトロジックをテストしようとして失敗した。

`vi.mock()` はモジュール内の**全エクスポートをモック関数に置換**するため、元の実装内部のタイマーロジック・Promise チェーン・イベントリスナーは一切実行されない。この挙動は直感に反し、テスト設計時に見落としやすい。

### 問題点・課題

現在のプロジェクトでは、`vi.mock()` の使い方に関する統一的なガイドラインが存在しない：

1. **モジュールレベルモック** (`vi.mock("../module")`) と**関数レベルモック** (`vi.spyOn(obj, "method")`) の使い分け基準が不明確
2. モジュールレベルモックで内部ロジック（タイマー、リトライ、キャンセル処理）が消失するリスクが暗黙知
3. 既存テストで `vi.mock()` を使用している箇所のうち、内部ロジックのテストが意図せず欠落している可能性がある

```typescript
// ❌ 見落としやすいパターン
vi.mock("../agent-client"); // モジュール全体をモック

// このテストはタイムアウトを検証したいが、
// agent-client 内部の setTimeout が存在しないため機能しない
it("30秒でタイムアウトする", async () => {
  vi.useFakeTimers();
  const promise = executor.execute(request);
  await vi.advanceTimersByTimeAsync(30000);
  await expect(promise).rejects.toThrow("timeout");
  // → テスト失敗: タイムアウトが発生しない
});
```

### 放置した場合の影響

| 影響領域               | 影響度 | 説明                                                                               |
| ---------------------- | ------ | ---------------------------------------------------------------------------------- |
| テストカバレッジの品質 | Medium | モジュールモックによりタイムアウト・リトライ・キャンセル処理のテストが実質的に欠落 |
| 新規テスト作成         | Medium | 開発者が `vi.mock()` の制約を知らず、動作しないテストを書いて時間を浪費する        |
| バグ検出能力           | Medium | 内部ロジックの変更がテストで捕捉されず、本番でバグが顕在化するリスクがある         |
| 保守コスト             | Low    | モック戦略の不統一により、テストのリファクタリングが困難になる                     |

## 2. 何を達成するか（What）

### 目的

プロジェクト全体の `vi.mock()` 使用箇所を監査し、モジュールレベルモックと関数レベルモックの使い分けガイドラインを策定する。内部ロジック（タイマー・リトライ・キャンセル等）のテストが欠落している箇所を特定し、改善計画を作成する。

### 最終ゴール

- ✅ `vi.mock()` 使用箇所の全数調査レポートを作成
- ✅ モック戦略使い分けガイドライン（判定フローチャート付き）を策定
- ✅ 内部ロジックテスト欠落箇所リストを作成
- ✅ `06-known-pitfalls.md` への追記（新規 Pitfall エントリ）

### スコープ

**含むもの:**

- `apps/desktop/` 配下の全テストファイルでの `vi.mock()` 使用箇所調査
- モック戦略ガイドラインの作成（判定基準テーブル＋フローチャート）
- 内部ロジックテスト欠落箇所の特定レポート
- `06-known-pitfalls.md` への Pitfall エントリ追加
- `02-code-quality.md` のテスト設計セクションへの参照追加

**含まないもの:**

- 欠落テストの実装（調査・計画のみ。実装は個別の未タスクとして分離）
- `packages/shared/` のテスト監査（Desktop 優先で段階的に拡大）
- ESLint カスタムルールの実装（ガイドライン策定後に別途判断）

### 成果物

| 種別         | 成果物                             | 配置先                                                                 |
| ------------ | ---------------------------------- | ---------------------------------------------------------------------- |
| レポート     | vi.mock() 使用箇所全数調査レポート | `docs/30-workflows/sdk-test-enablement/analysis/vitest-mock-audit.md`  |
| ガイドライン | モック戦略使い分けガイドライン     | `.claude/rules/` 配下（02-code-quality.md に統合）                     |
| レポート     | 内部ロジックテスト欠落箇所リスト   | `docs/30-workflows/sdk-test-enablement/analysis/mock-coverage-gaps.md` |
| ルール更新   | 06-known-pitfalls.md 追記          | `.claude/rules/06-known-pitfalls.md`                                   |

## 3. どのように実行するか（How）

### 前提条件

- [x] TASK-FIX-11-1-SDK-TEST-ENABLEMENT が完了していること（2026-02-13完了）
- [ ] `lessons-learned.md` の TASK-FIX-11-1 セクションが参照可能であること

### 依存タスク

先に完了している必要があるタスク:

- TASK-FIX-11-1-SDK-TEST-ENABLEMENT（完了済み）

同時実施可能なタスク:

- task-imp-vitest-mock-reset-utility-001（2段階リセットユーティリティ共通化）

### 必要な知識・スキル

- Vitest mock API 全般（`vi.mock`, `vi.spyOn`, `vi.fn`, Partial Mock）
- テスト設計手法（ブラックボックス vs ホワイトボックス）
- Shell コマンド（grep による全数調査）

### 推奨アプローチ

**Step 1: 全数調査**

```bash
# vi.mock() の使用箇所を全数取得
grep -rn "vi\.mock(" apps/desktop/src/ --include="*.test.ts" --include="*.test.tsx"

# vi.spyOn() の使用箇所も取得（比較用）
grep -rn "vi\.spyOn(" apps/desktop/src/ --include="*.test.ts" --include="*.test.tsx"
```

**Step 2: 分類基準**

| モック種別   | 使用すべき場面                                     | 使用すべきでない場面                                   |
| ------------ | -------------------------------------------------- | ------------------------------------------------------ |
| `vi.mock()`  | 外部依存（HTTP, FS, DB）の完全置換                 | 内部ロジック（タイマー、リトライ、キャンセル）のテスト |
| `vi.spyOn()` | 既存実装を保持しつつ呼び出しを検証したい場合       | モジュール全体を差し替えたい場合                       |
| Partial Mock | モジュールの一部だけモックし、残りは実装を使う場合 | 全メソッドをモックしたい場合                           |
| Manual Mock  | 複雑なモック構成が必要な場合                       | 単純な戻り値の差し替えのみの場合                       |

**Step 3: リスク判定フローチャート**

```
vi.mock() を使用しているか？
  ├─ Yes
  │   └─ モック対象モジュールに以下が含まれるか？
  │       ├─ setTimeout / setInterval → ⚠️ タイムアウトテスト欠落リスク
  │       ├─ AbortController → ⚠️ キャンセルテスト欠落リスク
  │       ├─ retry ロジック → ⚠️ リトライテスト欠落リスク
  │       ├─ EventEmitter → ⚠️ イベントテスト欠落リスク
  │       └─ なし → ✅ 問題なし
  └─ No → ✅ 対象外
```

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                             | 発見経緯                                                                                      | 解決策                                                                                 | 教訓                                                                                                               |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `vi.mock()` でモジュール内の `setTimeout` が消失 | TASK-FIX-11-1 Phase 5: `vi.advanceTimersByTimeAsync(30000)` でタイムアウトが再現できなかった  | `mockRejectedValueOnce(new Error("Request timeout"))` で直接エラーを注入する方式に変更 | モジュールレベルモックでは「内部実装の再現」ではなく「外部インターフェースでのシミュレーション」が正しいアプローチ |
| モック戦略の選択基準が暗黙知                     | TASK-FIX-11-1 Phase 5: 正しいモック方式の選択に試行錯誤が必要だった                           | 判定フローチャートとテーブルでモック戦略を明文化                                       | テスト設計の判断基準は「知っている人だけが選べる」状態から「フローに従えば誰でも選べる」状態にする                 |
| `vi.mock()` の制約がドキュメント化されていない   | TASK-FIX-11-1 Phase 5: 公式ドキュメントにも明確な記述がなく、実験で挙動を確認する必要があった | プロジェクト固有の `06-known-pitfalls.md` にエントリを追加し、具体的なコード例を記載   | フレームワークの暗黙の制約は、発見次第プロジェクトルールに記録する                                                 |

## 4. 実行手順

### Phase構成

```
Phase 1-3: 要件定義・設計・設計レビュー
  ↓
Phase 4-5: 全数調査実施・レポート作成
  ↓
Phase 6-7: ガイドライン策定・レビュー
  ↓
Phase 8: 06-known-pitfalls.md / 02-code-quality.md 更新
  ↓
Phase 9-10: 品質検証・最終レビュー
  ↓
Phase 11-12: 手動テスト・ドキュメント
```

### Phase 4-5: 全数調査・レポート作成

目的: `vi.mock()` の全使用箇所を調査し、リスクを分類する

実行コマンド:

```bash
# 全数調査
grep -rn "vi\.mock(" apps/desktop/src/ --include="*.test.ts" --include="*.test.tsx" > /tmp/vi-mock-usage.txt

# モック対象モジュールの内部ロジック確認
# 各モック対象ファイルで setTimeout, AbortController, retry を検索
```

成果物: `vitest-mock-audit.md`（使用箇所一覧＋リスク分類テーブル）

### Phase 6-7: ガイドライン策定

目的: モック戦略の選択基準を明文化する

成果物:

- 判定フローチャート（Mermaid 形式）
- モック種別×ユースケースの対応テーブル
- 具体的なコード例（Do / Don't）

### Phase 8: ルールファイル更新

対象:

- `06-known-pitfalls.md` — 新規 Pitfall エントリ追加
- `02-code-quality.md` — テスト設計セクションにガイドライン参照を追加

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `vi.mock()` 使用箇所の全数調査レポートが作成されている
- [ ] モック戦略使い分けガイドライン（判定フローチャート付き）が策定されている
- [ ] 内部ロジックテスト欠落箇所リストが作成されている

### 品質要件

- [ ] ガイドラインの判定基準が「100人中100人が同じ判断に至る」明確さである
- [ ] コード例が具体的かつ実行可能である
- [ ] ESLint / TypeScript エラーゼロ（ルールファイル更新分）

### ドキュメント要件

- [ ] `06-known-pitfalls.md` に新規 Pitfall エントリが追加されている
- [ ] `02-code-quality.md` のテスト設計セクションにガイドライン参照が追加されている
- [ ] `lessons-learned.md` に本タスクの完了記録が追加されている

## 6. 検証方法

### テストケース

本タスクはドキュメント・調査タスクのため、コードテストは最小限：

1. `06-known-pitfalls.md` の Markdown 構文が正しいこと
2. `02-code-quality.md` のリンク参照が有効であること

### 検証手順

```bash
# ルールファイルの Markdown 構文確認
npx markdownlint .claude/rules/06-known-pitfalls.md
npx markdownlint .claude/rules/02-code-quality.md

# grep 全数調査コマンドの実行確認
grep -rn "vi\.mock(" apps/desktop/src/ --include="*.test.ts" | wc -l
```

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                         |
| ---------------------------------- | ------ | -------- | -------------------------------------------- |
| 全数調査の漏れ                     | Medium | Low      | `grep` に加えて AST ベースの検索も検討       |
| ガイドラインの過度な厳格化         | Low    | Medium   | 「推奨」と「必須」を明確に分離する           |
| 欠落テストの改修タスクが大量に発生 | Medium | Medium   | 優先度を付けて段階的に対応（全て未タスク化） |

## 8. 参照情報

### 関連ドキュメント

- [lessons-learned.md - TASK-FIX-11-1 苦戦箇所#3b](../../.claude/skills/aiworkflow-requirements/references/lessons-learned.md) — モジュールレベルモックによるタイムアウトテスト不可問題
- [architecture-implementation-patterns.md - Module-level mock timeout test pattern](../../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md) — モジュールモックタイムアウトパターン仕様
- [patterns.md - Module mock timer test failure](../../.claude/skills/skill-creator/references/patterns.md) — 失敗パターン
- [06-known-pitfalls.md#P9](../../.claude/rules/06-known-pitfalls.md) — モジュールスコープ変数のテスト間リーク
- [06-known-pitfalls.md#P13](../../.claude/rules/06-known-pitfalls.md) — タイマーテストの無限ループ

### 参考資料

- [Vitest Mocking](https://vitest.dev/guide/mocking.html) — vi.mock / vi.spyOn / Partial Mock
- [Vitest Timer Mocks](https://vitest.dev/api/vi.html#vi-usefaketimers) — Fake Timer API

## 9. 備考

### 発見経緯

TASK-FIX-11-1-SDK-TEST-ENABLEMENT の Phase 5（実装）で、`sdk-types.test.ts` のタイムアウトテストを有効化した際、`vi.mock("../agent-client")` が原因でモジュール内部の `setTimeout` + `AbortController` によるタイムアウトロジックが完全に消失した。`vi.advanceTimersByTimeAsync(30000)` を実行してもタイムアウトが発生しないという非直感的な挙動に遭遇し、解決に時間を要した。

最終的に、`mockRejectedValueOnce(new Error("Request timeout"))` で直接エラーを注入する方式で解決したが、同様の問題がプロジェクト内の他のテストファイルでも潜在的に存在する可能性がある。

### 段階的アプローチ

1. **本タスク**: 調査・ガイドライン策定（コード変更なし）
2. **後続タスク**: 欠落テストの個別実装（調査結果に基づいて未タスク化）
3. **長期**: ESLint カスタムルールでの自動検出（費用対効果を判断して実施）
