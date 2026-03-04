# [#873] "[UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001] skill:ハンドラIPCレスポンス形式統一"

## メタ情報

```yaml
task_id: UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001
task_name: skill:ハンドラIPCレスポンス形式統一
category: リファクタリング
target_feature: skill:ハンドラ群（skillHandlers.ts）
priority: 中
scale: 中規模
status: 未実施
source_phase: Phase 12（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 コード調査）
created_date: 2026-02-21
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-skill-ipc-response-consistency.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-FIX-SKILL-IMPORT-RETURN-TYPE-001でskill:importハンドラの戻り値型をImportedSkillに修正した際、ハンドラ間でIPCレスポンス形式が不統一であることが判明した。現在、skillHandlers.ts内の14ハンドラで以下の3パターンが混在している：

- パターンA: `{ success: true, data: T }` ラッパー形式 + Preload側 `safeInvokeUnwrap()`（skill:list, skill:getImported, skill:get-detail, skill:execute, skill:analyze, skill:improve, skill:optimize等）
- パターンB: 直接型 `T` を返す + Preload側 `safeInvoke()`（skill:import - UT-FIX-SKILL-IMPORT-RETURN-TYPE-001で修正後のパターン）
- パターンC: 戻り値型が不明確（skill:remove - removeSkill()の戻り値をそのまま返す）

### 1.2 問題点・課題

- skill:importハンドラはImportedSkillを直接返すが、他のハンドラは{ success, data }ラッパーで返す。Preload側で呼び出し元がレスポンスの構造を正しく理解できないリスクがある
- skill:removeの戻り値型が明示されておらず、Preloadでは`Promise<void>`と宣言しているが実際の戻り値が不明確
- skill:executeはMain側で{ success, data }ラッパーを返すが、Preload側は`safeInvoke()`を使用しており、呼び出し元は`{ success, data }`オブジェクトを受け取るが型定義は`SkillExecutionResponse`になっている
- 新規ハンドラ追加時にどちらのパターンに従うべきか不明確

### 1.3 放置した場合の影響

- Renderer側でレスポンスの`.data`プロパティにアクセスするか直接値にアクセスするかの判断が不統一になり、ランタイムエラーの原因になる
- 新しい開発者がIPCハンドラを追加する際、既存パターンが混在しているため誤った形式で実装するリスクが高い
- IPC契約の信頼性が低下し、P44（IPCインターフェース不整合）パターンが再発しやすくなる

## 2. 何を達成するか（What）

### 2.1 目的

skillHandlers.ts内の全14ハンドラのIPCレスポンス形式を統一し、Preload側の呼び出しパターンとの整合性を確保する。

### 2.2 最終ゴール

- 全skill:ハンドラが統一されたレスポンス形式（`{ success: boolean, data?: T, error?: string }` または 直接型 `T` + throwパターン）を使用する
- Preload側の`safeInvoke()`/`safeInvokeUnwrap()`の使い分けがハンドラのレスポンス形式と一致する
- 型定義（preload/types.ts）がハンドラの実際の戻り値と完全に一致する
- 関連テストが全件PASS

### 2.3 スコープ

#### 含むもの

- skillHandlers.ts内の全14ハンドラのレスポンス形式統一
- Preload側skill-api.tsの呼び出しパターン（safeInvoke/safeInvokeUnwrap）統一
- preload/types.tsの型定義更新
- 既存テストの修正
- 新規テスト追加（レスポンス形式の整合性テスト）

#### 含まないもの

- skillHandlers.ts以外のIPCハンドラ（aiHandlers, authHandlers等）の修正
- safeInvoke/safeInvokeUnwrapの実装変更
- 新規IPCチャンネルの追加
- UIコンポーネントの変更（agentSlice等のStore層での対応が必要な場合は別タスク化）

### 2.4 成果物

| 成果物                   | パス                                                      |
| ------------------------ | --------------------------------------------------------- |
| 修正済みskillHandlers.ts | apps/desktop/src/main/ipc/skillHandlers.ts                |
| 修正済みskill-api.ts     | apps/desktop/src/preload/skill-api.ts                     |
| 更新済みpreload/types.ts | apps/desktop/src/preload/types.ts                         |
| 更新済みテストファイル   | apps/desktop/src/main/ipc/**tests**/skillHandlers.test.ts |

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-FIX-SKILL-IMPORT-RETURN-TYPE-001が完了していること
- UT-FIX-SKILL-IMPORT-INTERFACE-001が完了していること
- UT-FIX-SKILL-REMOVE-INTERFACE-001が完了していること

### 3.2 依存タスク

| タスクID                            | 状態 | 依存内容                   |
| ----------------------------------- | ---- | -------------------------- |
| UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 | 完了 | skill:importの戻り値型修正 |
| UT-FIX-SKILL-IMPORT-INTERFACE-001   | 完了 | skill:importの引数形式修正 |
| UT-FIX-SKILL-REMOVE-INTERFACE-001   | 完了 | skill:removeの引数形式修正 |

### 3.3 必要な知識

- Electron IPC通信（ipcMain.handle/ipcRenderer.invoke）
- contextBridge + safeInvoke/safeInvokeUnwrapパターン
- P42（3段バリデーション）、P44（IPCインターフェース不整合）、P45（引数命名ドリフト）
- S13（IPC戻り値型2ステップ変換パターン）

### 3.4 推奨アプローチ

**方針**: 全ハンドラを「直接型 T + throw パターン」に統一することを推奨。

理由：

1. skill:importが既にこのパターンで実装されている（S13パターン）
2. { success, data }ラッパーは二重ラッピングを生む（safeInvokeが既にエラーハンドリングを行うため）
3. Preload側の型定義がシンプルになる

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                  | 発見経緯                                                                               | 解決策                                                         | 教訓                                                         |
| ------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------ |
| ランタイムでのみ検出可能なIPC型不整合 | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001でPreloadモック化によりコンパイル時に検出不可と判明 | IPC契約テスト（ハンドラ戻り値の型プロパティ検証）を追加する    | コンパイル時検査だけでは不十分。ランタイム型検証テストが必須 |
| 共有フィールドゼロの型変換            | ImportResult→ImportedSkill間に共有フィールドがなく、単純なマッピングが不可能だった     | getSkillByName()による再取得パターン（S13）を適用              | 型変換時は2ステップ（操作→再取得）パターンを検討する         |
| 3層同時更新の必要性                   | ハンドラ修正時にMain/Preload/テストの3箇所を同時更新しないと不整合が発生               | P23/P32準拠で3箇所同時更新を徹底する                           | 変更前に全レイヤーの該当箇所をリストアップしてから着手       |
| レスポンス形式混在の発見遅延          | skill:import単体修正では他ハンドラとの不整合に気付きにくい                             | ハンドラ一覧テーブルを作成し、全体のレスポンス形式を可視化する | 単体修正時も横断的な整合性チェックを実施すべき               |

**参照**:

- [architecture-implementation-patterns.md S13](../../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md)
- [ipc-type-resolution-guide.md](../../.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md)
- [06-known-pitfalls.md P42/P44/P45](../../.claude/rules/06-known-pitfalls.md)

## 4. 実行手順

### Phase構成

| Phase | 名称                           | 概要                                                      |
| ----- | ------------------------------ | --------------------------------------------------------- |
| 1     | 要件定義                       | 14ハンドラの現状レスポンス形式を調査し、統一方針を決定    |
| 2     | 設計                           | 統一後のレスポンス形式とPreload側の呼び出しパターンを設計 |
| 3     | 設計レビュー                   | 設計の妥当性検証                                          |
| 4     | テスト作成                     | レスポンス形式の整合性テストを作成                        |
| 5     | 実装                           | ハンドラとPreload側を段階的に修正                         |
| 6-7   | テスト拡充・カバレッジ         | カバレッジ基準達成                                        |
| 8     | リファクタリング               | コード品質改善                                            |
| 9-10  | 品質検証・最終レビュー         | Lint/型チェック/全テスト/レビュー                         |
| 11-13 | 手動テスト・ドキュメント・完了 | 検証・文書化・PR                                          |

### Phase 1: 要件定義

#### 目的

全14ハンドラの現状レスポンス形式を調査し、統一方針を決定する。

#### 手順

1. skillHandlers.tsの全ハンドラの戻り値形式を一覧化
2. skill-api.tsの全メソッドの呼び出しパターン（safeInvoke/safeInvokeUnwrap）を一覧化
3. preload/types.tsの型定義との整合性を確認
4. 統一方針を決定（推奨: 直接型T + throwパターン）

### Phase 5: 実装

#### 目的

決定した統一方針に基づいて全ハンドラを修正する。

#### 手順

1. { success, data }ラッパーを使用しているハンドラを直接型Tに変更
2. Preload側のsafeInvokeUnwrap()をsafeInvoke()に統一（またはその逆）
3. preload/types.tsの型定義を更新
4. 既存テストをレスポンス形式の変更に合わせて修正
5. agentSlice等のStore層での呼び出し箇所を確認・修正

#### 完了条件

- [ ] 全14ハンドラが統一されたレスポンス形式を使用
- [ ] Preload側の呼び出しパターンがハンドラと整合
- [ ] 型定義が実際の戻り値と一致
- [ ] 全テストPASS

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 全14のskill:ハンドラが統一されたレスポンス形式を使用している
- [ ] Preload側のsafeInvoke/safeInvokeUnwrapの使い分けがハンドラと整合している
- [ ] preload/types.tsの型定義が実際のハンドラ戻り値と完全一致している
- [ ] Renderer側（agentSlice等）でレスポンスの受け取り方が統一されている

### 品質要件

- [ ] TypeCheck 0エラー（`pnpm typecheck`）
- [ ] ESLint 0エラー（`pnpm lint`）
- [ ] 全テストPASS
- [ ] Line Coverage 80%以上（修正対象ファイル）

### ドキュメント要件

- [ ] Phase 12 実装ガイド作成（Part 1 中学生レベル / Part 2 開発者向け）
- [ ] システム仕様書更新（interfaces-agent-sdk-skill.md等）
- [ ] documentation-changelog.md作成

## 6. 検証方法

### テストケース

1. 各ハンドラの正常系レスポンス形式が統一されていることを検証
2. 各ハンドラのエラー系レスポンス形式が統一されていることを検証
3. Preload→Main→Preloadの往復でデータ型が保持されることを検証
4. safeInvokeのエラーハンドリングが正しく動作することを検証

### 検証手順

```bash
# 型チェック
pnpm typecheck

# テスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts

# Lint
pnpm lint
```

## 7. リスクと対策

| リスク                                                       | 影響度 | 発生確率 | 対策                                                                    |
| ------------------------------------------------------------ | ------ | -------- | ----------------------------------------------------------------------- |
| レスポンス形式変更によるagentSlice側の呼び出し箇所の修正漏れ | 高     | 中       | `grep -rn "success.*data" apps/desktop/src/renderer/`で全箇所を事前調査 |
| safeInvoke/safeInvokeUnwrapの挙動差異によるランタイムエラー  | 高     | 中       | 各パターンの挙動を事前に検証し、IPC契約テストを追加                     |
| テストモックの大規模修正が必要（P21/P35パターン）            | 中     | 高       | 影響範囲を事前調査（`grep -rn "skillHandlers" **/*.test.ts`）           |
| 3層同時更新時の漏れ（P23/P32パターン）                       | 高     | 中       | チェックリストを作成し、Main/Preload/テストを1ハンドラずつ更新          |

## 8. 参照情報

### 関連ドキュメント

- [architecture-implementation-patterns.md S13](../../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md) - IPC戻り値型2ステップ変換パターン
- [ipc-type-resolution-guide.md](../../.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md) - IPC型不整合診断・解決ガイド
- [interfaces-agent-sdk-skill.md](../../.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md) - スキルAPI仕様
- [security-skill-ipc.md](../../.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md) - IPCセキュリティ仕様
- [ipc-contract-checklist.md](../../.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md) - IPC契約チェックリスト

### 関連Pitfall

- P42: 文字列引数の.trim()バリデーション漏れ
- P44: skill:import/remove IPCインターフェース不整合（解決済み）
- P45: IPC引数命名の契約ドリフト（解決済み）
- P23: API二重定義の型管理複雑性
- P32: 型定義の二箇所同時更新必須

### 関連完了タスク

- UT-FIX-SKILL-IMPORT-RETURN-TYPE-001（skill:import戻り値型修正）
- UT-FIX-SKILL-IMPORT-INTERFACE-001（skill:import引数形式修正）
- UT-FIX-SKILL-REMOVE-INTERFACE-001（skill:remove引数形式修正）
- TASK-FIX-5-1-SKILL-API-UNIFICATION（スキルAPI統一）

## 9. 備考

### 現状のハンドラ別レスポンス形式一覧

| ハンドラ                | Main側形式          | Preload側呼び出し | 不整合        |
| ----------------------- | ------------------- | ----------------- | ------------- |
| skill:list              | { success, data }   | safeInvokeUnwrap  | なし          |
| skill:scan              | { success, data }   | safeInvokeUnwrap  | なし          |
| skill:getImported       | { success, data }   | safeInvokeUnwrap  | なし          |
| skill:import            | 直接型T / throw     | safeInvoke        | **パターンB** |
| skill:remove            | removeSkill()戻り値 | safeInvoke        | **パターンC** |
| skill:get-detail        | { success, data }   | safeInvoke        | **型不一致**  |
| skill:execute           | { success, data }   | safeInvoke        | **型不一致**  |
| skill:abort             | boolean             | safeInvoke        | なし          |
| skill:get-status        | null/status         | safeInvoke        | なし          |
| skill:analyze           | { success, data }   | safeInvoke        | なし          |
| skill:improve           | { success, data }   | safeInvoke        | なし          |
| skill:optimize          | { success, data }   | safeInvoke        | なし          |
| skill:optimize:variants | { success, data }   | safeInvoke        | なし          |
| skill:optimize:evaluate | { success, data }   | safeInvoke        | なし          |

### 補足事項

本タスクはUT-FIX-SKILL-IMPORT-RETURN-TYPE-001の実装中に発見された横断的な改善課題です。skill:importの戻り値型を修正する際に、ハンドラ間でレスポンス形式が不統一であることに気付きました。単体修正ではなく、全体の統一が必要です。
