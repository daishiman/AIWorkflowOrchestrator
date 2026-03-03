# Phase 3: 設計レビュー — skill:getFileTree IPC実装

## メタ情報

| 項目               | 内容                                                                 |
| ------------------ | -------------------------------------------------------------------- |
| タスクID           | UT-UI-05A-GETFILETREE-001                                            |
| Phase              | 3                                                                    |
| タスク名           | skill:getFileTree IPC実装                                            |
| 機能名             | getfiletree-ipc                                                      |
| 作成日             | 2026-03-03                                                           |
| 前提Phase          | Phase 1（`phase-1-requirements.md`）、Phase 2（`phase-2-design.md`） |
| Issue              | #948                                                                 |
| 目的               | 要件・設計の妥当性検証                                               |
| 成果物ディレクトリ | `outputs/phase-3/`                                                   |

## 目的

Phase 1（要件定義）と Phase 2（設計）の成果物を多角的にレビューし、Phase 4（テスト作成）への進行可否を判定する。セキュリティ、型安全性、アーキテクチャ整合性、IPC 契約整合性の4観点から検証を行う。

## 実行タスク

- Task 3-1: 要件充足性チェック — Phase 2 の設計が Phase 1 の全要件（FR/NFR/AC）を満たしているか検証する
- Task 3-2: セキュリティレビュー — IPC セキュリティ設計の妥当性を P42/P44/P45 準拠で検証する
- Task 3-3: IPC 契約整合性チェック — ipc-contract-checklist.md Phase 1-6 を実施する
- Task 3-4: 型安全性レビュー — 型定義の完全性と共有戦略を検証する
- Task 3-5: アーキテクチャ整合性レビュー — 既存パターンとの一貫性を検証する
- Task 3-6: ゲート判定 — 総合判定を行い、次 Phase への進行可否を決定する

---

### Task 3-1: 要件充足性チェック

#### 機能要件カバレッジ

| 要件ID | 要件内容                     | 対応設計      | 判定 |
| ------ | ---------------------------- | ------------- | ---- |
| FR-1   | skill:getFileTree チャンネル | Task 2-1, 2-2 | -    |
| FR-1-1 | SkillFileManager.getFileTree | Task 2-3      | -    |
| FR-1-2 | SkillFileTreeNode 共有化     | Task 2-5      | -    |
| FR-1-3 | Preload API メソッド追加     | Task 2-4      | -    |
| FR-1-4 | IPC チャンネル定義           | Task 2-1      | -    |

#### 非機能要件カバレッジ

| 要件ID     | 要件内容                          | 対応設計                | 判定 |
| ---------- | --------------------------------- | ----------------------- | ---- |
| NFR-SEC-1  | validateIpcSender                 | Task 2-2 Layer1         | -    |
| NFR-SEC-2  | P42 3段バリデーション             | Task 2-2 Layer2         | -    |
| NFR-SEC-3  | findSkillDir パストラバーサル防止 | Task 2-3 → findSkillDir | -    |
| NFR-SEC-4  | 未知エラー → "Internal error"     | Task 2-2 catch句        | -    |
| NFR-SEC-5  | IPC_CHANNELS 定数参照             | Task 2-1, 2-2, 2-4      | -    |
| NFR-TYP-1  | any 型不使用                      | Task 2-2, 2-3, 2-4      | -    |
| NFR-TYP-2  | @repo/shared に型配置             | Task 2-5                | -    |
| NFR-TYP-3  | IPC レスポンス形式統一            | Task 2-2                | -    |
| NFR-TYP-4  | safeInvokeUnwrap 使用             | Task 2-4                | -    |
| NFR-PERF-1 | 100ファイル以下で500ms以内        | Task 2-3 アルゴリズム   | -    |
| NFR-PERF-2 | バックアップファイル除外          | Task 2-3 BACKUP_PATTERN | -    |
| NFR-CON-1  | 既存多層防御パターン踏襲          | Task 2-2                | -    |
| NFR-CON-2  | isKnownSkillFileError 再利用      | Task 2-2                | -    |
| NFR-CON-3  | register/unregister に統合        | Task 2-2                | -    |

#### 判定基準

| 判定  | 条件                                    |
| ----- | --------------------------------------- |
| PASS  | 全 FR/NFR が設計でカバーされている      |
| MINOR | 1-2件のカバレッジ漏れで影響が軽微       |
| MAJOR | 3件以上のカバレッジ漏れまたは重大な漏れ |

---

### Task 3-2: セキュリティレビュー

#### P42 準拠チェック（3段バリデーション）

| ID     | チェック項目                                                    | 対応設計            | 判定 |
| ------ | --------------------------------------------------------------- | ------------------- | ---- |
| SEC-01 | `typeof args?.skillName !== "string"` の型チェックがあるか      | Task 2-2 ハンドラー | -    |
| SEC-02 | `args.skillName === ""` の空文字列チェックがあるか              | Task 2-2 ハンドラー | -    |
| SEC-03 | `args.skillName.trim() === ""` のトリム空文字列チェックがあるか | Task 2-2 ハンドラー | -    |

**注意**: P42 では `typeof` チェックと `.trim() === ""` チェックを組み合わせた3段バリデーションが必要。`=== ""` チェックは `.trim() === ""` に包含されるため、実装上は `typeof args?.skillName !== "string" || args.skillName.trim() === ""` の2条件で3段バリデーションを充足する（既存ハンドラーと同一パターン）。

#### P44 準拠チェック（IPC インターフェース整合性）

| ID     | チェック項目                                                                     | 対応設計      | 判定 |
| ------ | -------------------------------------------------------------------------------- | ------------- | ---- |
| SEC-04 | ハンドラーの引数形式（`{ skillName: string }`）と Preload 側の渡し方が一致するか | Task 2-2, 2-4 | -    |
| SEC-05 | Preload が `safeInvokeUnwrap(channel, { skillName })` でオブジェクト形式を渡すか | Task 2-4      | -    |
| SEC-06 | ハンドラーが `args?.skillName` でアクセスするか                                  | Task 2-2      | -    |

#### P45 準拠チェック（引数命名の契約ドリフト）

| ID     | チェック項目                                                                      | 対応設計 | 判定 |
| ------ | --------------------------------------------------------------------------------- | -------- | ---- |
| SEC-07 | IPC 引数名 `skillName` が実際に渡される値のセマンティクス（スキル名）と一致するか | Task 2-2 | -    |
| SEC-08 | SkillFileManager.getFileTree のパラメータ名 `skillName` と一致するか              | Task 2-3 | -    |

#### 多層防御チェック

| ID     | チェック項目                                                   | 対応設計         | 判定 |
| ------ | -------------------------------------------------------------- | ---------------- | ---- |
| SEC-09 | validateIpcSender() が呼ばれる設計か                           | Task 2-2 Layer1  | -    |
| SEC-10 | P42 3段バリデーションが適用される設計か                        | Task 2-2 Layer2  | -    |
| SEC-11 | SkillFileManager.findSkillDir() でパストラバーサル防止されるか | Task 2-3         | -    |
| SEC-12 | isKnownSkillFileError() でエラーサニタイズされるか             | Task 2-2 catch句 | -    |
| SEC-13 | 未知エラーが "Internal error" に置換されるか                   | Task 2-2 catch句 | -    |

#### 判定基準

| 判定  | 条件                                               |
| ----- | -------------------------------------------------- |
| PASS  | SEC-01〜SEC-13 全項目が設計で充足されている        |
| MINOR | 1-2件の軽微な不備（命名の微修正レベル）            |
| MAJOR | セキュリティに影響する不備（バリデーション漏れ等） |

---

### Task 3-3: IPC 契約整合性チェック

#### ipc-contract-checklist.md Phase 1-6

| Phase   | チェック内容                                          | 確認対象      | 判定 |
| ------- | ----------------------------------------------------- | ------------- | ---- |
| Phase 1 | チャンネル名が IPC_CHANNELS 定数で定義されているか    | Task 2-1      | -    |
| Phase 2 | ALLOWED_INVOKE_CHANNELS に追加されているか            | Task 2-1      | -    |
| Phase 3 | ハンドラーの引数型と Preload の渡し方が一致しているか | Task 2-2, 2-4 | -    |
| Phase 4 | レスポンス型（success/data/error）が統一されているか  | Task 2-2      | -    |
| Phase 5 | エラーハンドリングが既存パターンと一致しているか      | Task 2-2      | -    |
| Phase 6 | unregister 処理が設計されているか                     | Task 2-2      | -    |

#### 契約整合性マトリクス

| 層             | ファイル                     | 追加内容                             | 整合性確認 |
| -------------- | ---------------------------- | ------------------------------------ | ---------- |
| チャンネル     | channels.ts                  | `SKILL_GET_FILE_TREE` 定数           | -          |
| ホワイトリスト | channels.ts                  | ALLOWED_INVOKE_CHANNELS に追加       | -          |
| ハンドラー     | skillFileHandlers.ts         | `skill:getFileTree` ハンドラー       | -          |
| サービス       | SkillFileManager.ts          | `getFileTree()` メソッド             | -          |
| Preload        | skill-api.ts                 | `getFileTree` メソッド               | -          |
| 型定義         | skill-file.ts (@repo/shared) | `SkillFileTreeNode` インターフェース | -          |
| フック         | useFileTree.ts               | 型安全呼び出し                       | -          |

---

### Task 3-4: 型安全性レビュー

#### レビューチェックリスト

| ID     | チェック項目                                                                         | 対応設計 | 判定 |
| ------ | ------------------------------------------------------------------------------------ | -------- | ---- |
| TYP-01 | ハンドラーの引数に `any` 型が使用されていないか                                      | Task 2-2 | -    |
| TYP-02 | レスポンス形式が `{ success: boolean, data?: T, error?: string }` に統一されているか | Task 2-2 | -    |
| TYP-03 | SkillFileTreeNode が `@repo/shared` で1箇所定義されているか                          | Task 2-5 | -    |
| TYP-04 | re-export で後方互換性が維持されるか                                                 | Task 2-5 | -    |
| TYP-05 | safeInvokeUnwrap のジェネリクス型パラメータが正しく指定されているか                  | Task 2-4 | -    |
| TYP-06 | P32（型定義の二箇所同時更新）のリスクが評価されているか                              | Task 2-5 | -    |
| TYP-07 | useFileTree の `as` キャストが完全に除去される設計か                                 | Task 2-6 | -    |

#### 判定基準

| 判定  | 条件                                        |
| ----- | ------------------------------------------- |
| PASS  | TYP-01〜TYP-07 全項目が設計で充足されている |
| MINOR | re-export の微修正のみ                      |
| MAJOR | any 型使用または型不整合                    |

---

### Task 3-5: アーキテクチャ整合性レビュー

#### レビューチェックリスト

| ID     | チェック項目                                                               | 対応設計                  | 判定 |
| ------ | -------------------------------------------------------------------------- | ------------------------- | ---- |
| ARC-01 | Renderer → Preload → Main の一方向依存が維持されているか                   | Task 2-4, 2-2             | -    |
| ARC-02 | ハンドラーが既存の skillFileHandlers.ts のパターンと一致しているか         | Task 2-2                  | -    |
| ARC-03 | registerSkillFileHandlers / unregisterSkillFileHandlers に統合されているか | Task 2-2                  | -    |
| ARC-04 | 新規ファイルの作成が最小限に抑えられているか                               | Task 2-5（1ファイル新規） | -    |
| ARC-05 | 共有型が `@repo/shared` に配置され、幽霊依存が発生しないか                 | Task 2-5                  | -    |
| ARC-06 | buildTree メソッドが既存の walkDir パターンを踏襲しているか                | Task 2-3                  | -    |
| ARC-07 | BACKUP_PATTERN の再利用が設計されているか                                  | Task 2-3                  | -    |

#### ファイル変更影響範囲

| ファイル                                                               | 変更種別 | 影響範囲                                  |
| ---------------------------------------------------------------------- | -------- | ----------------------------------------- |
| `apps/desktop/src/preload/channels.ts`                                 | 追加     | 定数1個 + ホワイトリスト1項目             |
| `apps/desktop/src/main/ipc/skillFileHandlers.ts`                       | 追加     | ハンドラー1個 + unregister1行             |
| `apps/desktop/src/main/services/skill/SkillFileManager.ts`             | 追加     | publicメソッド1個 + privateメソッド1個    |
| `apps/desktop/src/preload/skill-api.ts`                                | 追加     | インターフェース1メソッド + 実装1メソッド |
| `packages/shared/src/types/skill-file.ts`                              | 新規     | SkillFileTreeNode 型定義                  |
| `packages/shared/src/index.ts`（または types/index.ts）                | 追加     | re-export 1行                             |
| `apps/desktop/src/renderer/views/SkillEditorView/types.ts`             | 変更     | re-export に置換                          |
| `apps/desktop/src/renderer/views/SkillEditorView/hooks/useFileTree.ts` | 変更     | as キャスト除去・型安全呼び出し           |

#### 判定基準

| 判定  | 条件                                             |
| ----- | ------------------------------------------------ |
| PASS  | ARC-01〜ARC-07 全項目が充足されている            |
| MINOR | 配置位置の微修正のみ                             |
| MAJOR | レイヤー依存方向の違反または設計パターンの不一致 |

---

### Task 3-6: ゲート判定

#### 多角的チェック観点テーブル

| 観点           | Task | 重要度 | 期待結果                       |
| -------------- | ---- | ------ | ------------------------------ |
| 要件充足性     | 3-1  | 必須   | 全 FR/NFR がカバーされている   |
| セキュリティ   | 3-2  | 必須   | P42/P44/P45 準拠・多層防御     |
| IPC 契約整合性 | 3-3  | 必須   | checklist Phase 1-6 全通過     |
| 型安全性       | 3-4  | 必須   | any 不使用・型共有・後方互換   |
| アーキテクチャ | 3-5  | 必須   | 既存パターン踏襲・影響範囲最小 |

#### レビューゲート判定基準

| 判定              | 条件                                                | 対応                  |
| ----------------- | --------------------------------------------------- | --------------------- |
| PASS              | 全観点で PASS                                       | Phase 4 へ進む        |
| MINOR             | 1-2件の軽微な指摘（コメント修正、命名微修正レベル） | 指摘対応後 Phase 4 へ |
| MAJOR（要件問題） | FR/NFR のカバレッジ漏れ、スコープの不明確さ         | Phase 1 へ戻る        |
| MAJOR（設計問題） | セキュリティ不備、型不整合、アーキテクチャ違反      | Phase 2 へ戻る        |

---

## 参照資料

| 資料名                 | パス                                                                          | 参照目的           |
| ---------------------- | ----------------------------------------------------------------------------- | ------------------ |
| Phase 1 要件定義       | `docs/30-workflows/completed-tasks/getfiletree-ipc/phase-1-requirements.md`   | FR/NFR/AC 照合     |
| Phase 2 設計           | `docs/30-workflows/completed-tasks/getfiletree-ipc/phase-2-design.md`         | 設計内容レビュー   |
| IPC 契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | 契約整合性確認     |
| IPC セキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | セキュリティ基準   |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                          | P42, P44, P45 準拠 |
| 既存 IPC ハンドラー    | `apps/desktop/src/main/ipc/skillFileHandlers.ts`                              | パターン整合性確認 |

## 実行手順

1. Task 3-1: Phase 1 の全要件に対する設計カバレッジを確認する
2. Task 3-2: セキュリティ設計を P42/P44/P45 基準で検証する
3. Task 3-3: IPC 契約チェックリスト Phase 1-6 を実施する
4. Task 3-4: 型安全性と共有戦略を検証する
5. Task 3-5: アーキテクチャ整合性を検証する
6. Task 3-6: 総合ゲート判定を行い、結果を記録する
7. レビュー結果を `outputs/phase-3/design-review.md` に出力する

## 統合テスト連携

| 連携対象                   | 観点                                         | 本Phaseでの扱い                                              |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| IPC契約（Renderer → Main） | skill:getFileTree の引数・戻り値・エラー契約 | Phase 3 の定義/成果物と api-ipc-agent.md を照合する          |
| Preload API                | safeInvokeUnwrap 経由の型安全な公開契約      | interfaces-agent-sdk-skill.md のメソッド契約と整合を維持する |
| Main Process               | validateIpcSender と P42 3段バリデーション   | security-electron-ipc.md の防御要件を満たすことを確認する    |
| テスト連携                 | 単体テスト・統合観点の引き継ぎ               | 直前Phase成果物を参照し、次Phaseへ検証条件を明示する         |

## 成果物

| 成果物           | パス                               |
| ---------------- | ---------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review.md` |

## 完了条件

- [ ] Task 3-1: 全 FR（FR-1〜FR-1-4）の設計カバレッジが確認されている
- [ ] Task 3-1: 全 NFR（NFR-SEC/TYP/PERF/CON）の設計カバレッジが確認されている
- [ ] Task 3-2: P42 準拠チェック（SEC-01〜SEC-03）が全て判定されている
- [ ] Task 3-2: P44 準拠チェック（SEC-04〜SEC-06）が全て判定されている
- [ ] Task 3-2: P45 準拠チェック（SEC-07〜SEC-08）が全て判定されている
- [ ] Task 3-2: 多層防御チェック（SEC-09〜SEC-13）が全て判定されている
- [ ] Task 3-3: IPC 契約チェックリスト Phase 1-6 が全て判定されている
- [ ] Task 3-3: 契約整合性マトリクスの全層が確認されている
- [ ] Task 3-4: TYP-01〜TYP-07 が全て判定されている
- [ ] Task 3-5: ARC-01〜ARC-07 が全て判定されている
- [ ] Task 3-6: ゲート判定（PASS/MINOR/MAJOR）が記録されている
- [ ] 曖昧表現（「仕様に沿って」「要件化された場合は」）が使用されていない

## 次Phase

- **PASS** → Phase 4（テスト作成）へ進む
- **MINOR** → 指摘対応後 Phase 4 へ進む
- **MAJOR（要件問題）** → Phase 1 へ戻る
- **MAJOR（設計問題）** → Phase 2 へ戻る
