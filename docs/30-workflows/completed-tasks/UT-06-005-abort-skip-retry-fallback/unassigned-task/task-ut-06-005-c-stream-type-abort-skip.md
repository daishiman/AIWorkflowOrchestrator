# UT-06-005-C: SkillStreamMessageType abort/skip 型追加 - タスク指示書

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | UT-06-005-C                              |
| タスク名     | SkillStreamMessageType abort/skip 型追加 |
| 分類         | 機能追加                                 |
| 対象機能     | SkillExecutor Permission Fallback        |
| 優先度       | 中                                       |
| 見積もり規模 | 中規模                                   |
| ステータス   | 未実施                                   |
| 発見元       | Phase 12（UT-06-005 レビュー GAP-06）    |
| 発見日       | 2026-03-16                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在 abort は `type:"error"`、skip は `type:"tool_use"` で送信されており、Renderer 側で一般エラーと abort を区別できない。`SkillStreamMessageType` に `"abort"` / `"skip"` を追加し、Renderer 側で専用 UI フィードバックを実装する必要がある。

なお GAP-01（shared 型と SkillExecutor ローカル型の `sendStream` 型不整合）もこのタスクで同時解消する。

### 1.2 問題点・課題

- abort が "error" 型で送信されるため、Renderer 側で一般エラーと Permission abort を区別できない
- skip が "tool_use" 型で送信されるため、Renderer 側で通常のツール使用とスキップを区別できない
- shared 型と SkillExecutor ローカル型の sendStream 型が不整合を起こしている（GAP-01）
- ユーザーが abort/skip の結果を視覚的に確認できない

### 1.3 放置した場合の影響

- abort/skip の IPC 通知が "error"/"tool_use" 型で代用されたまま残り、Renderer 側で abort 専用 UI を出せない
- SkillStreamMessageType の型が実態と乖離し、型安全性が損なわれる
- ユーザーが操作結果を正確に把握できず、混乱を招く

---

## 2. 何を達成するか（What）

### 2.1 目的

- ユーザーが abort/skip を視覚的に識別できるようにする（一般エラーとの混同を防ぐ）
- Renderer 側の UI でのフィードバックを改善し、操作の結果が明確に伝わるようにする

### 2.2 最終ゴール

SkillStreamMessageType に "abort" | "skip" が追加され、executeAbortFlow/executeSkipFlow がそれぞれ正しい型でストリームメッセージを送信し、Renderer 側で専用のバナー表示（abort: 赤、skip: 黄色）が実装されている状態。

### 2.3 スコープ

#### 含むもの

- SkillStreamMessageType への "abort" | "skip" リテラル追加
- executeAbortFlow / executeSkipFlow の sendStream 呼び出しの型更新
- Renderer 側 SkillStreamDisplay での abort/skip 専用表示
- shared 型と SkillExecutor ローカル型の sendStream 型不整合解消（GAP-01）

#### 含まないもの

- processPermissionFallback のロジック変更（UT-06-005 で実装済み）
- PreToolUse Hook への統合（UT-06-005-A で対応）
- PermissionStore のセッション別管理（UT-06-005-B で対応）

### 2.4 成果物

- 修正済み `packages/shared/src/types/skill.ts`（SkillStreamMessageType 拡張）
- 修正済み `apps/desktop/src/main/services/skill/SkillExecutor.ts`（sendStream 型更新）
- 修正済み Renderer 側コンポーネント（abort/skip 専用表示）
- 型統合テスト・UI テストファイル
- Phase 1〜12 の成果物一式（`docs/30-workflows/` 配下）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-06-005 が完了済みであること（executeAbortFlow/executeSkipFlow 実装済み）
- UT-06-005-A が完了済みであることが望ましい（PreToolUse Hook 統合後に型を更新するのが理想的）

### 3.2 依存タスク

- UT-06-005（完了済み: executeAbortFlow/executeSkipFlow 実装）
- UT-06-005-A（PreToolUse Hook 統合: 実行時フロー接続後に型を更新するのが望ましい）

### 3.3 必要な知識

- SkillStreamMessageType の型定義と使用箇所
- shared パッケージと desktop パッケージの型共有パターン（P23/P32）
- Renderer 側の SkillStreamDisplay コンポーネントの構造
- Apple HIG 準拠の UI カラーパレット（エラー: systemRed、警告: systemOrange）

### 3.4 推奨アプローチ

packages/shared の SkillStreamMessageType に "abort" | "skip" リテラルを追加し、Renderer 側のメッセージハンドラを拡張する。具体的には:

1. `packages/shared/src/types/skill.ts` の SkillStreamMessageType ユニオンに `"abort" | "skip"` を追加する
2. SkillExecutor の executeAbortFlow/executeSkipFlow で sendStream の type 引数を新しいリテラルに変更する
3. Renderer 側の SkillStreamDisplay で switch/case に "abort"/"skip" 分岐を追加し、専用バナーを表示する
4. shared 型と SkillExecutor ローカル型の sendStream 型不整合を解消する（GAP-01）

---

## 4. 実行手順

### Phase構成

標準 Phase 1〜12 構成に従う。本タスクは中規模で、shared 型・Main Process・Renderer の3層にまたがるため、Phase 2（設計）での影響範囲調査が重要。

### Phase 1: 要件定義

#### 目的

SkillStreamMessageType 拡張の詳細要件と影響範囲を確定する。

#### 手順

1. `grep -rn "SkillStreamMessageType"` で全使用箇所を特定する
2. sendStream の呼び出し箇所と引数の型を調査する
3. Renderer 側の SkillStreamDisplay のメッセージハンドリング構造を分析する
4. GAP-01（shared 型と SkillExecutor ローカル型の不整合）の詳細を調査する

#### 成果物

- phase-1-requirements.md

#### 完了条件

- 型変更の影響範囲が特定され、3層（shared/Main/Renderer）の変更計画が明文化されていること

### Phase 2-3: 設計・設計レビュー

#### 目的

型拡張と UI 表示の設計を行い、レビューする。

#### 手順

1. SkillStreamMessageType のユニオン拡張を設計する
2. abort バナー（赤: systemRed）と skip バナー（黄色: systemOrange）の UI を設計する
3. P23/P32 に留意し、shared 型と desktop 型の同時更新計画を立てる
4. GAP-01 の型不整合解消方針を設計する

#### 成果物

- phase-2-design.md, phase-3-design-review.md

#### 完了条件

- 設計レビューが PASS または MINOR であること

### Phase 4: テスト作成

#### 目的

型統合テストと UI テストのケースを作成する。

#### 手順

1. executeAbortFlow が type:"abort" でストリームメッセージを送信するテストを作成する
2. executeSkipFlow が type:"skip" でストリームメッセージを送信するテストを作成する
3. Renderer 側で abort/skip を識別した専用表示が実装されるテストを作成する

#### 成果物

- 型統合テストファイル、UI テストファイル

#### 完了条件

- テストケースが Red 状態であること（実装前）

### Phase 5: 実装

#### 目的

SkillStreamMessageType 拡張と Renderer 側 UI を実装する。

#### 手順

1. `packages/shared/src/types/skill.ts` の SkillStreamMessageType に "abort" | "skip" を追加する
2. executeAbortFlow / executeSkipFlow の sendStream 呼び出しを新しい型に更新する
3. shared 型と SkillExecutor ローカル型の sendStream 型不整合を解消する
4. Renderer 側 SkillStreamDisplay で abort/skip 専用表示を実装する

#### 成果物

- 修正済み型定義ファイル、修正済み SkillExecutor.ts、修正済み Renderer コンポーネント

#### 完了条件

- Phase 4 のテストが全 PASS であること

### Phase 6-12: テスト拡充〜完了

標準フェーズに従い、カバレッジ確認・リファクタリング・品質検証・最終レビュー・手動テスト・ドキュメント更新・PR 作成を実施する。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SkillStreamMessageType に "abort" | "skip" が追加されていること
- [ ] executeAbortFlow が type:"abort" でストリームメッセージを送信すること
- [ ] executeSkipFlow が type:"skip" でストリームメッセージを送信すること
- [ ] Renderer 側で abort/skip を識別した専用表示が実装されていること
- [ ] shared 型と SkillExecutor ローカル型の型不整合が解消されていること（GAP-01）

### 品質要件

- [ ] 既存テストが全 PASS であること
- [ ] 型統合テストと UI テストが追加されていること
- [ ] Line Coverage 80% 以上、Branch Coverage 60% 以上
- [ ] `pnpm typecheck` が PASS すること（P32 対策）

### ドキュメント要件

- [ ] implementation-guide.md（Part 1: 概念説明、Part 2: 実装詳細）が作成されていること
- [ ] Phase 12 の全チェックリストが完了していること

---

## 6. 検証方法

### テストケース

| #   | テストケース                                              | 期待結果                                               |
| --- | --------------------------------------------------------- | ------------------------------------------------------ |
| 1   | executeAbortFlow が type:"abort" で送信する               | sendStream の type 引数が "abort" であること           |
| 2   | executeSkipFlow が type:"skip" で送信する                 | sendStream の type 引数が "skip" であること            |
| 3   | Renderer で abort メッセージ受信時に赤バナーが表示される  | abort 専用バナーコンポーネントがレンダリングされること |
| 4   | Renderer で skip メッセージ受信時に黄色バナーが表示される | skip 専用バナーコンポーネントがレンダリングされること  |
| 5   | shared 型と SkillExecutor 型が一致する                    | typecheck が PASS すること                             |
| 6   | 既存テストが全 PASS                                       | テスト結果に failure がないこと                        |

### 検証手順

1. `pnpm --filter @repo/shared build` で shared パッケージをビルド
2. `pnpm typecheck` で型整合性を確認（P23/P32 対策）
3. `pnpm --filter @repo/desktop test` で全テスト実行
4. カバレッジレポートで基準達成を確認

---

## 7. リスクと対策

| リスク                                                | 影響度 | 発生確率 | 対策                                                                          |
| ----------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------- |
| SkillStreamMessageType の型が実態と乖離（破壊的変更） | 高     | 中       | 既存の "error"/"tool_use" 型は維持し、"abort"/"skip" を追加（後方互換性確保） |
| shared 型と desktop 型の同時更新漏れ（P23/P32）       | 高     | 中       | 3層（shared/Main/Renderer）を1つのコミットで同時更新し、typecheck で検証する  |
| Renderer 側コンポーネントの構造変更                   | 中     | 低       | switch/case への分岐追加のみとし、既存の表示ロジックは変更しない              |
| Hook API 変更との整合性（UT-06-005-A 依存）           | 中     | 中       | UT-06-005-A 完了後に着手することで、型定義の手戻りを防ぐ                      |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/` （親タスクの完了成果物）
- `.claude/rules/06-known-pitfalls.md` - P23（API 二重定義の型管理）、P32（型定義の二箇所同時更新）
- `.claude/rules/01-architecture.md` - Apple HIG カラーパレット（systemRed、systemOrange）

### 参考資料

- `packages/shared/src/types/skill.ts`（SkillStreamMessageType 定義）
- `apps/desktop/src/main/services/skill/SkillExecutor.ts`（sendStream 呼び出し箇所）
- `apps/desktop/src/renderer/`（SkillStreamDisplay または該当コンポーネント）

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
UT-06-005 Phase 12 レビューにて GAP-06 として検出:
abort は type:"error"、skip は type:"tool_use" で送信されており、
Renderer 側で一般エラーと abort を区別できない。
SkillStreamMessageType に "abort" / "skip" の追加が必要。

GAP-01 も同時対応:
shared 型と SkillExecutor ローカル型の sendStream 型不整合。
```

### 補足事項

- 発見元: UT-06-005 Phase 10/12 レビュー
- 関連 GAP: GAP-06（SkillStreamMessageType に abort/skip 未追加）、GAP-01（shared 型と SkillExecutor ローカル型の sendStream 型不整合）
