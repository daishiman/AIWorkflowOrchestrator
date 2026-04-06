# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 3                             |
| 機能名 | rt-04-authkey-component-dedup |
| 作成日 | 2026-04-06                    |

## 目的

Phase 2 設計の品質を検証し、Phase 4（テスト作成）への進行可否を判定する。

---

## 実行タスク

### タスク1: 設計レビュー

#### 1-A: FR/NFR 充足チェック

| 要件   | 設計での対応箇所                                                     | 充足 |
| ------ | -------------------------------------------------------------------- | ---- |
| FR-01  | `useAuthKeyManagement` フックインターフェース定義（Phase 2 タスク2） | ✅   |
| FR-02  | `ApiKeyStatus` 拡張方針・移行マッピング（Phase 2 タスク3）           | ✅   |
| FR-03  | `AuthKeySection` props 拡張設計（Phase 2 タスク4）                   | ✅   |
| FR-04  | `ApiKeySettingsPanel` 委譲パターン選択（Phase 2 タスク4）            | ✅   |
| FR-05  | バリデーション関数のフック内統合（Phase 2 タスク2）                  | ✅   |
| FR-06  | 重複テストクリーンアップ方針（Phase 2 タスク7 修正計画）             | ✅   |
| NFR-01 | 型互換性検証テーブル下書き（Phase 2 タスク6）                        | ✅   |
| NFR-04 | 委譲パターンにより AuthKeySection 既存利用箇所を保護                 | ✅   |

---

#### 1-B: 型互換性検証（Phase 2 タスク6 確認）

```bash
# AuthKeyStatus が使われている全箇所を確認
grep -rn "AuthKeyStatus" apps/desktop/src/ packages/

# ApiKeyStatus の現在の定義確認
grep -n "ApiKeyStatus" packages/shared/src/types/skillCreator.ts
```

**確認結果:**

| 対象                            | 変更前型        | 変更後型               | 互換性判定          |
| ------------------------------- | --------------- | ---------------------- | ------------------- |
| `AuthKeySection` 内 status      | `AuthKeyStatus` | `ApiKeyStatus`（拡張） | ✅ PASS             |
| `onStatusChange` コールバック   | なし            | `ApiKeyStatus`         | ✅ PASS（新規追加） |
| `ApiKeySettingsPanel` の status | `ApiKeyStatus`  | `ApiKeyStatus`         | ✅ 変更なし         |

> **判定根拠**: `ApiKeyStatus` に `"check-failed"` を追加することで `AuthKeyStatus` の全値をカバーできる。`"saved"` / `"env-fallback"` は `keySource` state で継続管理するため、情報の欠落なし。

---

#### 1-C: 同名インターフェース型ドリフト検出

```bash
# ApiKeyStatus が複数箇所に定義されていないか確認
grep -rn "type ApiKeyStatus\|interface ApiKeyStatus" packages/ apps/
grep -rn "type AuthKeyStatus\|interface AuthKeyStatus" packages/ apps/
```

**検出結果:**

- `ApiKeyStatus`: `packages/shared/src/types/skillCreator.ts` のみ（✅ 重複なし）
- `AuthKeyStatus`: `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx` のみ（統一後は廃止）

---

#### 1-D: simpler alternative 検討記録

| 代替案                                                     | 評価                                                                       | 採用/不採用 |
| ---------------------------------------------------------- | -------------------------------------------------------------------------- | ----------- |
| `AuthKeySection` を削除して `ApiKeySettingsPanel` に統一   | 主導線（SettingsView）の UI 差分（password toggle 等）が失われる           | 不採用      |
| フックを作らず両コンポーネントをそのまま維持               | IPC 変更コストが2箇所のままで残る。問題の根本解決にならない                | 不採用      |
| `ApiKeyStatus` を廃止して `AuthKeyStatus` を shared に昇格 | shared の既存 `ApiKeyStatus` 利用箇所（ApiKeySettingsPanel）が影響を受ける | 不採用      |
| **フック共通化 + `ApiKeyStatus` 拡張（採用案）**           | 既存利用箇所への影響が最小。スコープが明確                                 | **採用**    |

---

### タスク2: 指摘事項と MINOR 追跡テーブル

| MINOR ID  | 指摘内容                                                                     | 解決予定 Phase | 解決確認 Phase | 備考                                               |
| --------- | ---------------------------------------------------------------------------- | -------------- | -------------- | -------------------------------------------------- |
| TECH-M-01 | `ApiKeySettingsPanel` 廃止は委譲実装後の未タスクとして保留                   | Phase 12       | Phase 12       | 廃止は呼び出し元変更が必要なため                   |
| TECH-M-02 | `useAuthModeStatus` store 依存を `useAuthKeyManagement` に含めるか判断が必要 | Phase 5        | Phase 9        | 現行 AuthKeySection では hasCredentials を補助利用 |

**TECH-M-02 補足:**

`useAuthModeStatus` は旧実装互換のフォールバックとしてのみ使用されている。`authKey.exists()` の `source` フィールドが常に返る現実装では不要な可能性がある。Phase 5 実装時にコードを確認し判断する。

---

### タスク3: MAJOR 指摘チェック（Phase 4 進行可否判定）

| チェック項目                                     | 結果                                  |
| ------------------------------------------------ | ------------------------------------- |
| フックインターフェースに未定義・矛盾はないか     | ✅ なし                               |
| 型統一方針に後方非互換が含まれていないか         | ✅ なし                               |
| ファイル変更計画に見落とし（呼び出し元）はないか | ✅ なし（委譲パターンにより最小変更） |
| IPC 変更が発生しないことが確認されているか       | ✅ 確認済み                           |
| Phase 1 の AC-1〜AC-6 すべてに設計対応があるか   | ✅ すべて対応                         |

**MAJOR 指摘: なし**

---

### タスク4: ゲート判定

| 判定     | 条件                                           |
| -------- | ---------------------------------------------- |
| **PASS** | MAJOR 指摘なし → Phase 4 へ進む                |
| MINOR    | 2件（TECH-M-01, TECH-M-02）→ Phase 5/12 で解決 |
| MAJOR    | なし                                           |

**最終判定: PASS（Phase 4 へ進む）**

---

### タスク5: Phase 4 開始条件の確認

- [x] Phase 1（要件定義）完了
- [x] Phase 2（設計）完了
- [x] Phase 3 ゲート判定: PASS
- [x] MAJOR 指摘なし
- [x] フックインターフェース確定済み
- [x] 変更ファイル一覧確定済み

---

## 参照資料

| 参照資料 | パス                                               | 内容     |
| -------- | -------------------------------------------------- | -------- |
| Phase 1  | [phase-1-requirements.md](phase-1-requirements.md) | 要件・AC |
| Phase 2  | [phase-2-design.md](phase-2-design.md)             | 設計書   |

---

## 成果物

| 成果物           | パス                               | 説明           |
| ---------------- | ---------------------------------- | -------------- |
| 設計レビュー記録 | `outputs/phase-3/gate-decision.md` | ゲート判定結果 |

---

## 完了条件

- [x] FR/NFR 充足チェック完了
- [x] 型互換性検証完了（PASS）
- [x] 同名インターフェース型ドリフト検出完了（重複なし）
- [x] simpler alternative 検討・記録完了
- [x] MINOR 指摘テーブル作成済み（2件）
- [x] MAJOR 指摘なし（Phase 4 進行可）
- [x] ゲート判定 PASS
- [x] **本 Phase 内の全タスクを 100% 実行完了**

## タスク100%実行確認【必須】

| タスク                         | 完了 |
| ------------------------------ | ---- |
| タスク1-A: FR/NFR 充足チェック | ✅   |
| タスク1-B: 型互換性検証        | ✅   |
| タスク1-C: 型ドリフト検出      | ✅   |
| タスク1-D: simpler alternative | ✅   |
| タスク2: MINOR 追跡テーブル    | ✅   |
| タスク3: MAJOR 指摘チェック    | ✅   |
| タスク4: ゲート判定            | ✅   |
| タスク5: Phase 4 開始条件確認  | ✅   |

## 次のPhase

Phase 4: テスト作成（[phase-4-test-creation.md](phase-4-test-creation.md)）

**Phase 3 PASS 確認後にのみ Phase 4 へ進むこと。**
