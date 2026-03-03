# Phase 9: 品質検証

## メタ情報

| 項目      | 値                        |
| --------- | ------------------------- |
| Phase     | 9                         |
| タスクID  | UT-UI-05A-GETFILETREE-001 |
| タスク名  | skill:getFileTree IPC実装 |
| 機能名    | getfiletree-ipc           |
| 作成日    | 2026-03-03                |
| 状態      | 未着手                    |
| 前提Phase | phase-8-refactoring.md    |
| Issue     | #948                      |

## 目的

静的解析（ESLint・TypeScript型チェック）、セキュリティ確認、全テスト実行を行い、品質基準を満たしていることを検証する。IPC 実装タスク固有のセキュリティチェック（P42・P44・P45・パストラバーサル対策）を重点的に検証する。

## 実行タスク

### Task 9-1: ESLint 実行

**目的**: コードスタイルと品質ルールへの準拠を確認する

**実行手順**:

1. ESLint を実行する:

   ```bash
   cd apps/desktop && pnpm lint
   ```

2. エラーがある場合は修正する:

   ```bash
   cd apps/desktop && pnpm lint --fix
   ```

3. 修正後のテスト実行で回帰がないことを確認する

**期待結果**: ESLint エラーゼロ

---

### Task 9-2: TypeScript 型チェック

**目的**: 型安全性を確認し、IPC 契約の整合性を検証する

**実行手順**:

1. 型チェックを実行する:

   ```bash
   pnpm typecheck
   ```

2. P32 チェック: channels.ts と skill-api.ts の型整合性を確認する

   ```bash
   cd apps/desktop && grep -n "SKILL_GET_FILE_TREE\|getFileTree" src/preload/channels.ts src/preload/skill-api.ts src/preload/types.ts
   ```

3. P23 チェック: preload/types.ts と Renderer 側で使用される型が一致していることを確認する

   ```bash
   cd apps/desktop && grep -rn "SkillFileTreeNode" src/
   ```

**チェック項目**:

| チェック       | 確認内容                                                                         | 判定 |
| -------------- | -------------------------------------------------------------------------------- | ---- |
| P32 準拠       | `channels.ts` のチャネル定義と `skill-api.ts` の呼び出しが一致                   | -    |
| P23 準拠       | `preload/types.ts` の `SkillFileTreeNode` と Renderer 側の型が一致               | -    |
| any 型不使用   | `grep -n "any" skillFileHandlers.ts SkillFileManager.ts` で any 型が検出されない | -    |
| 型アサーション | `as` キャストが使用されている場合、正当な理由コメントがある                      | -    |

**期待結果**: TypeScript エラーゼロ、型整合性確認済み

---

### Task 9-3: 全テスト実行

**目的**: 全テストの安定的な PASS を確認する

**実行手順**:

1. 対象テストの実行:

   ```bash
   cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillFileHandlers.test.ts
   ```

2. SkillFileManager のテスト実行:

   ```bash
   cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillFileManager.test.ts
   ```

3. desktop パッケージ全体のテスト実行（回帰確認）:

   ```bash
   cd apps/desktop && pnpm vitest run
   ```

**期待結果**: 全テスト PASS、失敗・スキップテストなし

---

### Task 9-4: セキュリティチェック

**目的**: IPC 実装固有のセキュリティ要件を検証する

**セキュリティチェックリスト**:

| チェックID | チェック項目                                        | 根拠         | 判定 |
| ---------- | --------------------------------------------------- | ------------ | ---- |
| SEC-01     | P42準拠: 3段バリデーション実装                      | P42          | -    |
| SEC-02     | 型チェック（`typeof skillName !== "string"`）       | P42 Step1    | -    |
| SEC-03     | 空文字列チェック（`skillName === ""`）              | P42 Step2    | -    |
| SEC-04     | トリム空文字列チェック（`skillName.trim() === ""`） | P42 Step3    | -    |
| SEC-05     | P44/P45準拠: IPC インターフェース整合性             | P44, P45     | -    |
| SEC-06     | ハンドラ引数がPreload側の呼び出しと一致             | P44          | -    |
| SEC-07     | 引数名のセマンティクスが実際の値と一致（skillName） | P45          | -    |
| SEC-08     | パストラバーサル対策                                | IPC Security | -    |
| SEC-09     | skillName に `..` が含まれる場合の拒否              | IPC Security | -    |
| SEC-10     | 絶対パスの拒否（`/` で始まる skillName）            | IPC Security | -    |
| SEC-11     | validateIpcSender による送信元検証                  | IPC Security | -    |
| SEC-12     | チャネル名がホワイトリスト（IPC_CHANNELS）で定義    | IPC Security | -    |
| SEC-13     | エラーメッセージに内部パス情報が含まれない          | IPC Security | -    |

**実行手順**:

1. 実装コードを読み、各チェック項目を逐一確認する
2. バリデーションコードの確認:

   ```bash
   cd apps/desktop && grep -A 5 "getFileTree\|SKILL_GET_FILE_TREE" src/main/ipc/skillFileHandlers.ts
   ```

3. チャネル定数の確認:

   ```bash
   cd apps/desktop && grep "GET_FILE_TREE\|getFileTree" src/preload/channels.ts
   ```

4. エラーメッセージの確認（内部パス漏洩がないこと）:

   ```bash
   cd apps/desktop && grep -n "throw\|Error\|error" src/main/ipc/skillFileHandlers.ts | grep -i "getFileTree\|fileTree"
   ```

5. 全チェック項目の判定結果を品質レポートに記録する

**期待結果**: 全セキュリティチェック項目クリア

---

## 品質ゲート

| ゲート項目            | 基準         | 結果 | 判定 |
| --------------------- | ------------ | ---- | ---- |
| ESLint                | エラーゼロ   | -    | -    |
| TypeScript 型チェック | エラーゼロ   | -    | -    |
| 全テスト              | 全 PASS      | -    | -    |
| セキュリティチェック  | 全項目クリア | -    | -    |
| P42 3段バリデーション | 実装確認済み | -    | -    |
| P44/P45 IPC整合性     | 不整合なし   | -    | -    |
| パストラバーサル対策  | 実装確認済み | -    | -    |

---

## 参照資料

| 資料名                   | パス                                                                         | 説明                 |
| ------------------------ | ---------------------------------------------------------------------------- | -------------------- |
| Phase 8 リファクタリング | `outputs/phase-8/refactoring-report.md`                                      | Phase 8 成果物       |
| IPC セキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | IPC セキュリティ要件 |
| セキュリティ設計原則     | `.claude/skills/aiworkflow-requirements/references/security-principles.md`   | セキュリティ原則     |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                         | P42, P44, P45 対策   |
| コード品質ルール         | `.claude/rules/02-code-quality.md`                                           | TypeScript型安全     |

依存Phase参照: Phase 5

---

## 実行手順

1. Phase 8 の成果物を確認する
2. Task 9-1: ESLint を実行し、エラーを解消する
3. Task 9-2: TypeScript 型チェックを実行し、IPC 契約の整合性を検証する
4. Task 9-3: 全テストを実行し、安定的な PASS を確認する
5. Task 9-4: セキュリティチェックリストを逐一確認する
6. 品質ゲートの全項目をクリアしていることを確認する
7. 品質レポートを作成する
8. 完了条件を全て満たすことを確認する

---

## 多角的チェック観点（AIが判断）

本Phaseの成果物に対して、以下の観点から品質を検証する:

| 観点         | 確認内容                                                   |
| ------------ | ---------------------------------------------------------- |
| 完全性       | 静的解析・セキュリティ確認・テスト実行の全項目を実施したか |
| 一貫性       | 品質ゲートの全項目をクリアしているか                       |
| 正確性       | セキュリティチェックリストの判定が正確か                   |
| 追跡可能性   | 品質レポートに全確認結果が記録されているか                 |
| セキュリティ | P42/P44/P45 対策が実装コードレベルで検証されているか       |

---

## 統合テスト連携

| 連携対象                   | 観点                                         | 本Phaseでの扱い                                              |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| IPC契約（Renderer → Main） | skill:getFileTree の引数・戻り値・エラー契約 | Phase 9 の定義/成果物と api-ipc-agent.md を照合する          |
| Preload API                | safeInvokeUnwrap 経由の型安全な公開契約      | interfaces-agent-sdk-skill.md のメソッド契約と整合を維持する |
| Main Process               | validateIpcSender と P42 3段バリデーション   | security-electron-ipc.md の防御要件を満たすことを確認する    |
| テスト連携                 | 単体テスト・統合観点の引き継ぎ               | 直前Phase成果物を参照し、次Phaseへ検証条件を明示する         |

## 成果物

| 成果物       | パス                                | 説明                               |
| ------------ | ----------------------------------- | ---------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 静的解析・セキュリティ・テスト結果 |

---

## 完了条件

- [ ] ESLint がエラーなしで PASS している
- [ ] TypeScript 型チェックがエラーなしで PASS している
- [ ] P32 チェック: channels.ts と skill-api.ts の型整合性が確認されている
- [ ] P23 チェック: preload/types.ts と Renderer 型の整合性が確認されている
- [ ] 全テストが PASS している（失敗・スキップなし）
- [ ] セキュリティチェックリスト（SEC-01〜SEC-13）の全項目がクリアされている
- [ ] P42準拠の3段バリデーションが実装されている
- [ ] P44/P45準拠の IPC インターフェース整合性が確認されている
- [ ] パストラバーサル対策が検証されている
- [ ] 品質レポートが `outputs/phase-9/quality-report.md` に配置されている
- [ ] テスト実行は `cd apps/desktop` から実行している（P40対策）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスク     | 状態 | 備考 |
| -------------- | ---- | ---- |
| (実行時に記録) | -    | -    |

## タスク100%実行確認【必須】

- [ ] 全ての実行タスクを完了した
- [ ] 全ての成果物を作成した
- [ ] 全ての完了条件を満たした
- [ ] 成果物の品質を多角的チェック観点で検証した

> **注意**: このチェックリストが全てチェックされるまで、次のPhaseに進んではならない。

## 次のPhase

Phase 10: 最終レビュー（`phase-10-final-review.md`）
