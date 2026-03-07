# ensureArray 共通ヘルパー導入 - タスク指示書

## メタ情報

```yaml
issue_number: 1043
```

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | UT-FIX-ENSURE-ARRAY-COMMON-UTIL-001                 |
| タスク名     | ensureArray 共通ヘルパー導入                        |
| 分類         | リファクタリング                                    |
| 対象機能     | `apiKeyHandlers` / `profileHandlers` の配列防御処理 |
| 優先度       | 低                                                  |
| 見積もり規模 | 小規模                                              |
| ステータス   | 未実施                                              |
| 発見元       | Phase 12                                            |
| 発見日       | 2026-03-07                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 の実装中に、`Array.isArray(x) ? x : []` パターンが5箇所で使用されていることが判明した:

- `apiKeyHandlers.ts`: 1箇所（GAP-05修正 — providers配列バリデーション）
- `profileHandlers.ts`: 3箇所（GAP-06修正 — identities配列の `?? []` を `Array.isArray` に統一）
- `ApiKeysSection/index.tsx`: 1箇所（GAP-03 Renderer側防御）

P48（`??` vs `Array.isArray`）で `??` では null/undefined 以外の非配列型（文字列、オブジェクト等）を防御できないことが判明し、全箇所を `Array.isArray` パターンに統一した。

### 1.2 問題点・課題

- 同じ防御ロジック（`Array.isArray(x) ? x : []`）が3ファイル5箇所に分散しており、仕様変更時に修正漏れが起きやすい
- `profileHandlers.ts` では GAP-06 修正時に3箇所を個別に `?? []` から `Array.isArray` に書き換えたが、パターンが同一であるため共通化の余地がある
- 型パラメータ（`T`）が各箇所で異なる（`ProviderStatus[]` / `Identity[]`）ため、ジェネリクスでの抽象化が必要

### 1.3 放置した場合の影響

- 新規 IPC ハンドラ追加時に `?? []`（P48 違反）パターンが再び使用されるリスクがある
- 配列防御の実装揺れが発生し、IPC契約の安定性が低下する
- CC-7（レスポンス配列フィールドの防御検証）チェックリストで毎回同一パターンを手動記述する非効率が続く

---

## 2. 何を達成するか（What）

### 2.1 目的

配列防御ロジックを共通化し、実装とテストの再利用性を高める。

### 2.2 最終ゴール

`ensureArray<T>(value: unknown): T[]` を共通ユーティリティとして導入し、対象箇所で利用する。

### 2.3 スコープ

#### 含むもの

- `packages/shared` への共通ユーティリティ追加
- `apiKeyHandlers.ts` / `profileHandlers.ts` の適用

#### 含まないもの

- UI挙動の変更
- 新規IPCチャネル追加

### 2.4 成果物

- 共通ユーティリティ実装
- 適用差分
- 回帰テスト結果

---

## 3. どのように実行するか（How）

### 3.1 前提条件

現在の `apiKey:list` 契約防御がPASSしていること。

### 3.2 依存タスク

- TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 完了

### 3.3 必要な知識

TypeScript ジェネリクス、IPCハンドラ実装、Vitest。

### 3.4 推奨アプローチ

共通関数を先に追加し、呼び出し側を置換した後、既存テストを回帰する。

---

## 4. 実行手順

### Phase構成

- Phase 1: ユーティリティ追加
- Phase 2: 呼び出し側置換
- Phase 3: テスト回帰

### Phase 1: ユーティリティ追加

#### 目的

配列防御の単一実装を提供する。

#### 手順

1. `ensureArray` を shared ユーティリティとして追加
2. 型注釈と最小テストを実装

#### 成果物

ユーティリティ実装ファイルとテスト

#### 完了条件

ユーティリティ単体テストPASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `ensureArray` が追加されている
- [ ] 対象2ファイルで共通関数を利用している

### 品質要件

- [ ] 既存テスト回帰PASS
- [ ] 型エラーなし

### ドキュメント要件

- [ ] 変更点を `documentation-changelog` に記録
- [ ] 必要なら system spec を更新

---

## 6. 検証方法

### テストケース

- `null/undefined/string/object` を入力したとき空配列
- 配列入力時は同内容で返る

### 検証手順

1. 対象Vitestを実行
2. typecheckを実行

---

## 7. リスクと対策

| リスク   | 影響度 | 発生確率 | 対策                               |
| -------- | ------ | -------- | ---------------------------------- |
| 置換漏れ | 中     | 中       | `rg "Array\.isArray\("` で残件確認 |
| 型崩れ   | 低     | 低       | ジェネリクス型テスト追加           |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` — S27: Renderer境界5層防御パターン
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` — v1.14.0: providers 正規化の仕様
- `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` — CC-7: レスポンス配列フィールドの防御検証
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` — TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md` — `apiKey:list` 契約定義
- `.claude/rules/06-known-pitfalls.md` — P48（`??` vs `Array.isArray`）
- `docs/30-workflows/06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001/outputs/phase-12/unassigned-task-report.md`

### 参考資料

- `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`

---

## 9. 備考

### 苦戦箇所（TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 からの教訓）

1. **`?? []` vs `Array.isArray` の防御力の差（P48）**: `profileHandlers.ts` の3箇所で `user.identities ?? []` を使用していたが、identities が文字列やオブジェクトだった場合に防御できない。`Array.isArray` への統一で全非配列型を防御できるようになった。`ensureArray` ヘルパーはこのパターンを1関数に集約する

2. **パターンの散在と一括修正の難易度**: 5箇所が3ファイルに分散しており、`grep -rn "Array.isArray"` で全箇所を特定してから修正する必要があった。共通ヘルパーに集約すれば、仕様変更時の修正は1箇所で済む

3. **ジェネリクスの型推論**: `Array.isArray` 後の要素型が `any[]` に推論されるため、呼び出し側で `ensureArray<ProviderStatus>(value)` のように型パラメータを明示する必要がある。型パラメータなしで安全に使えるオーバーロードも検討すべき

### レビュー指摘の原文

```text
UT-1: ensureArray ヘルパーの共通化 — 同一パターン（Array.isArray(x) ? x : []）が
apiKeyHandlers.ts（1箇所）と profileHandlers.ts（3箇所）で使用されている。
今後さらに同パターンが増加する場合、packages/shared に共通ヘルパーとして抽出する。
```

### 補足事項

- 本タスクは優先度低で、同種コードが6箇所以上に増えた時点で着手を推奨する
- 実装時は `packages/shared/src/utils/ensureArray.ts` に配置し、`@repo/shared` から export する
- テストでは null / undefined / string / object / number / 正常配列の6パターンを網羅すること
