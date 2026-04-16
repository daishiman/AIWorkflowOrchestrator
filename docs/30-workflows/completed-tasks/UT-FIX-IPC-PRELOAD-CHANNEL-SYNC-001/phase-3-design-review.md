# Phase 3 — 設計レビュー

## メタ情報

| 項目       | 値                                   |
| ---------- | ------------------------------------ |
| タスクID   | UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001  |
| 前提Phase  | Phase 1（要件定義）・Phase 2（設計） |
| ステータス | completed                            |
| 後続Phase  | Phase 4（テスト作成）以降            |

---

## 目的

本Phaseの目的は、既存本文に記載された要件を満たすこと。

## 実行タスク

- 既存本文の手順を実行する。

## 参照資料

- 本ファイル上部のメタ情報
- `index.md`
- `phase-1-requirements.md`
- `phase-2-design.md`
- `phase-3-design-review.md`
- `phase-4-test-creation.md`
- `phase-5-implementation.md`
- `phase-6-test-expansion.md`
- `phase-7-coverage-check.md`
- `phase-8-refactoring.md`
- `phase-9-quality-assurance.md`
- `phase-10-final-review.md`
- `phase-11-manual-test.md`
- `phase-12-documentation.md`
- `phase-13-pr-creation.md`

## 成果物

- 本Phaseで定義された成果物

## 完了条件

- [x] 既存本文の完了条件をすべて満たす。

## 1. Phase 1・2 完成確認チェックリスト

### Phase 1（要件定義）

| #   | 確認項目                                                           | 状態 |
| --- | ------------------------------------------------------------------ | ---- |
| 1   | タスクID・タスク名・種別・優先度が明記されている                   | 完了 |
| 2   | 背景と問題の原因が明確に記述されている                             | 完了 |
| 3   | 対象12チャネルが表形式で網羅されている（invoke 6件・on 6件）       | 完了 |
| 4   | スコープ（含む/含まない）が明確に定義されている                    | 完了 |
| 5   | 受け入れ条件が検証可能な形式（コマンド付き）で定義されている       | 完了 |
| 6   | 変更ファイルが1ファイルのみ（preload/channels.ts）と明示されている | 完了 |
| 7   | 依存関係と並列実行可能性が確認されている                           | 完了 |

### Phase 2（設計）

| #   | 確認項目                                                                  | 状態 |
| --- | ------------------------------------------------------------------------- | ---- |
| 1   | 設計アプローチ（最小変更原則）が明確に定義されている                      | 完了 |
| 2   | 追加するimport文のコードスニペットが具体的に記載されている                | 完了 |
| 3   | IPC_CHANNELSへのスプレッド展開追加設計が記載されている                    | 完了 |
| 4   | ALLOWED_INVOKE_CHANNELSへの追加コードスニペットが記載されている           | 完了 |
| 5   | ALLOWED_ON_CHANNELSへの追加コードスニペットが記載されている               | 完了 |
| 6   | 事前確認事項（grepコマンド付き）が4項目定義されている                     | 完了 |
| 7   | 定数キーマッピング表（IPC_CHANNELSキー → チャネル文字列）が完備されている | 完了 |
| 8   | リスクが4件識別され、それぞれ対策が記述されている                         | 完了 |

---

## 2. ゲートチェック

### 2-1. 受け入れ条件の妥当性

| 受け入れ条件                                 | 妥当性評価                                       |
| -------------------------------------------- | ------------------------------------------------ |
| Rule-1 がすべてPASS（verify-ipc-4layer.cjs） | 適切。本タスクの直接目標であり、客観的に計測可能 |
| TypeScriptコンパイルエラーなし               | 適切。型安全性の確保に必要                       |
| ESLintエラーなし                             | 適切。コード品質基準の維持に必要                 |
| 既存テスト全通過                             | 適切。デグレード防止に必要                       |
| 変更ファイルが preload/channels.ts のみ      | 適切。最小変更原則の担保に必要                   |

判定: **条件は妥当かつ計測可能** である。

### 2-2. 変更範囲の最小性

| 観点                   | 評価                                                             |
| ---------------------- | ---------------------------------------------------------------- |
| 変更ファイル数         | 1ファイルのみ。最小限の変更範囲                                  |
| 変更の種類             | 配列への要素追加のみ（ロジック変更なし）。影響範囲が極めて限定的 |
| sharedファイルへの影響 | なし。正本（packages/shared/src/ipc/channels.ts）は変更しない    |
| mainプロセスへの影響   | なし。preloadのホワイトリスト追加のみ                            |

判定: **変更範囲は最小限** であり、原則に従っている。

### 2-3. リスク対応の十分性

| リスク                           | 対策の十分性                                             |
| -------------------------------- | -------------------------------------------------------- |
| verify-ipc-4layer.cjs の解決精度 | 実際のスクリプト出力を根拠とした対象チャネルの特定。十分 |
| CONFIGURE_API の既登録扱い       | 既登録であることを明記し、追加対象から除外。十分         |
| FILE_SYSTEM_CHANNELS の値重複    | TypeScript上の問題なしと説明。十分                       |
| IPC_CHANNELSキー名の衝突         | TypeScriptエラーによる自動検知。十分                     |

判定: **リスク対応は十分** である。

---

## 3. 移行判定

### 判定: **GO**

#### 理由

1. **Phase 1・2 が完成基準を満たしている**: すべての確認項目がチェック済み
2. **設計の安全性が高い**: ホワイトリスト配列への要素追加のみ。副作用が発生する余地がない
3. **受け入れ条件が明確**: `node scripts/verify-ipc-4layer.cjs` のRule-1 PASS という客観的かつ自動計測可能な基準が設定されている
4. **変更範囲が最小**: 1ファイル・追加のみという最も安全な変更形態
5. **既存テストによる安全網**: 既存テスト通過により無意図のデグレードを防止できる

---

## 4. Phase 4以降実施前の前提確認事項

Phase 5（実装）着手前に、以下をgrepで確認すること。

### 4-1. CONFIGURE_API の既存登録確認（重要）

```bash
grep -n "CONFIGURE_API" apps/desktop/src/preload/channels.ts
```

**期待結果**: `IPC_CHANNELS.CONFIGURE_API` が `ALLOWED_INVOKE_CHANNELS` の配列内に存在すること。
存在する場合は本タスクの追加対象から除外する。
存在しない場合のみ、別途登録漏れとして扱う。

### 4-2. IPC_CHANNELSキーの存在確認（START_SESSION, ANSWER）

```bash
grep -n "START_SESSION\|\.ANSWER" apps/desktop/src/preload/channels.ts
```

**期待結果**: `...SKILL_CREATOR_SESSION_CHANNELS` のスプレッド展開により
`IPC_CHANNELS.START_SESSION` および `IPC_CHANNELS.ANSWER` が参照可能であること。

### 4-3. CHAT_EXPORT_CHANNELS・FILE_SYSTEM_CHANNELS 未importの確認

```bash
grep -n "CHAT_EXPORT_CHANNELS\|FILE_SYSTEM_CHANNELS" apps/desktop/src/preload/channels.ts
```

**期待結果**: どちらも存在しない（未import）こと。
存在する場合はimport追加が不要（IPC_CHANNELSへのスプレッド展開のみ追加）。

### 4-4. ALLOWED_ON_CHANNELS内のSkill Creator Session系チャネルの確認

```bash
grep -n "QUESTION_RECEIVED\|SESSION_COMPLETE\|SESSION_ERROR\|EXTERNAL_API_CONFIG" apps/desktop/src/preload/channels.ts
```

**期待結果**: どれも `ALLOWED_ON_CHANNELS` に存在しないこと（未登録の確認）。

---

## Phase 3 完了条件

- [x] Phase 1・2 の完成確認チェックリストが全項目完了済み
- [x] ゲートチェック（受け入れ条件の妥当性・変更範囲の最小性・リスク対応の十分性）が全項目GO
- [x] 移行判定が GO かつ理由が明記されている
- [x] Phase 4以降実施前の前提確認事項がgrepコマンド付きで4項目定義されている
