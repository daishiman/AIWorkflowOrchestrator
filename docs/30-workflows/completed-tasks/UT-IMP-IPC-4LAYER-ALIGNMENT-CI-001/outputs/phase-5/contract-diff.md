# Phase 5 契約差分記録

## メタ情報

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| タスクID | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| Phase    | 5                                  |
| 作成日   | 2026-04-14                         |

---

## 既存スクリプトとの差分分析

### 比較対象

| スクリプト                      | パス                                          | 実装言語   |
| ------------------------------- | --------------------------------------------- | ---------- |
| check-ipc-contracts.ts （既存） | `apps/desktop/scripts/check-ipc-contracts.ts` | TypeScript |
| verify-ipc-4layer.cjs （新規）  | `scripts/verify-ipc-4layer.cjs`               | CommonJS   |

---

### check-ipc-contracts.ts の責務

main <-> preload 間の**引数パターン整合性**を検証する。

| ルール | 検証内容                                                     |
| ------ | ------------------------------------------------------------ |
| R-01   | main ハンドラの引数型と preload 呼び出しの引数型が一致するか |
| R-02   | 引数パターン（object/primitive/none）のセマンティック精度    |
| R-03   | main-only / preload-only のオーファンチャネル検出            |
| R-04   | 型アノテーションの正規化と比較                               |

**出力形式**: `DriftReport` オブジェクト（drifts, orphans, summary）

**検証レイヤー**: main <-> preload の2層間

---

### verify-ipc-4layer.cjs の責務

shared -> preload -> main -> renderer の**4層チャネル存在整合性**を検証する。

| ルール | 検証内容                                                               |
| ------ | ---------------------------------------------------------------------- |
| Rule-1 | shared で定義されたチャネルが preload ホワイトリストに登録されているか |
| Rule-2 | preload invoke チャネルが main ハンドラに実装されているか              |
| Rule-3 | renderer で使用されたチャネルが shared/preload に定義されているか      |

**出力形式**: テキストレポート（GitHub Actions annotations 付き）

**検証レイヤー**: shared -> preload -> main -> renderer の4層間

---

### 補完関係

```
check-ipc-contracts.ts          verify-ipc-4layer.cjs
========================        ========================
main <-> preload                shared -> preload -> main -> renderer
引数パターン整合検証            チャネル存在整合検証
R-01〜R-04                      Rule-1〜Rule-3

         |                               |
         v                               v
    型安全性保証                   チャネル網羅性保証
```

2つのスクリプトは**重複なし**の補完関係にある:

- `check-ipc-contracts.ts` は **main と preload の間**で、チャネルの**引数型パターン**が一致するかを検証する（型安全性）
- `verify-ipc-4layer.cjs` は **4層全体**で、チャネルの**存在**が一貫しているかを検証する（網羅性）

一方が検出するドリフトを他方が検出することはなく、それぞれ異なるレイヤーの問題をカバーする。

---

## IPC 契約への影響

### 変更なし

`verify-ipc-4layer.cjs` は**読み取り専用**の検証スクリプトであり、以下の IPC 契約要素を一切変更しない:

| 契約要素          | 影響                                                                          |
| ----------------- | ----------------------------------------------------------------------------- |
| チャネル定義      | なし（`packages/shared/src/ipc/channels.ts` を読み取りのみ）                  |
| 型定義            | なし                                                                          |
| セキュリティ境界  | なし（`apps/desktop/src/preload/channels.ts` のホワイトリストを読み取りのみ） |
| ハンドラ実装      | なし                                                                          |
| renderer 呼び出し | なし                                                                          |

### CI パイプラインへの影響

- `.github/workflows/ci.yml` に `verify-ipc-4layer` ジョブが追加された
- `build-app` ジョブの前提条件（`needs`）に `verify-ipc-4layer` が追加された
- これにより、4層チャネル整合性が崩れた PR はマージがブロックされる
- 既存の `check-ipc-contracts.ts`（`apps/desktop/scripts/` 配下で実行）とは独立して動作し、干渉しない
