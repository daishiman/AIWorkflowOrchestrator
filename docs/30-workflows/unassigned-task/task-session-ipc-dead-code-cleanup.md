# Session IPC dead code クリーンアップ - タスク指示書

## メタ情報

```yaml
issue_number: 1979
```

## メタ情報

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | TASK-UI-SESSION-CLEANUP-01                                     |
| タスク名     | Session IPC dead code クリーンアップ                           |
| 分類         | リファクタリング                                               |
| 対象機能     | SkillCreatorIpcBridge / preload / skill-creator コンポーネント |
| 優先度       | 低                                                             |
| 見積もり規模 | 小規模                                                         |
| ステータス   | 未実施                                                         |
| 発見元       | Phase 5, 8 (TASK-UI-02 ConversationPanel 孤立解消)             |
| 発見日       | 2026-04-06                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-02 (SkillCreatorConversationPanel 孤立解消) の実施中、Session IPC
の通信経路が `creatorHandlers.ts` ベースの Runtime IPC へ全面移管された。
それに伴い、旧 Session IPC スタック（`SkillCreatorIpcBridge` / `SKILL_CREATOR_SESSION_CHANNELS` /
`skillCreatorSession` preload エントリ / `skill-creator/` 配下コンポーネント群）は
実行パスから完全に切り離された。

移管完了時点で各ファイルには以下の対応が取られた。

| ファイル                                                                 | 対応状況                                           |
| ------------------------------------------------------------------------ | -------------------------------------------------- |
| `apps/desktop/src/main/ipc/index.ts`                                     | `SkillCreatorIpcBridge` のインスタンス化を削除済み |
| `apps/desktop/src/preload/skill-creator-session-api.ts`                  | 全メソッドが no-op のスタブとして残存              |
| `apps/desktop/src/preload/types.ts` の `ElectronAPI.skillCreatorSession` | 型参照のみ残存                                     |
| `apps/desktop/src/renderer/components/skill-creator/*.tsx`               | `export {}` のみのスタブとして残存                 |
| `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`        | インスタンス化されておらず dead code として残存    |

これらは「段階的削除（stub 化 → 型除去 → git delete）」を安全に実施するために
意図的に残されたが、長期間放置するとコードベースの混乱を招く。

### 1.2 問題点・課題

1. **`SkillCreatorIpcBridge.ts` が dead code として存在し続けている**
   - `index.ts` でインスタンス化されておらず、どこからも呼ばれない
   - `SKILL_CREATOR_SESSION_CHANNELS` の IPC ハンドラー登録コードが残存するため、
     将来的な誤解や二重登録リスクを生む可能性がある
   - ファイルサイズ 308 行が無駄にバンドルビルド時間を消費する可能性がある

2. **`preload/types.ts` の `ElectronAPI` インターフェースに不要プロパティが残存している**
   - `skillCreatorSession: import("./skill-creator-session-api").SkillCreatorSessionAPI` の行が
     全てのプロセスで参照可能な型として存在し続けている
   - Renderer 側で `window.electronAPI.skillCreatorSession` にアクセスするコードを
     誤って書いても型エラーが発生しない（no-op が返るだけで気づけない）

3. **`skill-creator/` 配下のコンポーネントが `export {}` のみのスタブとして 5 ファイル残存している**
   - `ChoiceButton.tsx` / `ConversationProgress.tsx` / `FreeTextInput.tsx` /
     `QuestionCard.tsx` / `SkillCreatorResultPanel.tsx`
   - これらの代替コンポーネントは `apps/desktop/src/renderer/components/skill/` 配下に移行済み
   - スタブファイルがあることで「このディレクトリに実装がある」と誤解される可能性がある

### 1.3 放置した場合の影響

- 新規開発者が旧 Session IPC パスを参照し、誤った実装を行うリスク
- `SkillCreatorIpcBridge` のテストファイルが引き続きメンテナンス対象に残り続け、
  テスト実行コストが増加する
- TypeScript の型定義が実態と乖離し続けることで型安全性が低下する
- `SKILL_CREATOR_SESSION_CHANNELS` が `IPC_CHANNELS` に含まれたまま残るため、
  チャネル名前空間の整理が将来より困難になる

---

## 2. 何を達成するか（What）

### 2.1 目的

TASK-UI-02 で stub 化された 3 つの dead code 領域を段階的に完全削除し、
コードベースをクリーンな状態へ戻す。

### 2.2 最終ゴール

- `SkillCreatorIpcBridge.ts` がリポジトリから完全に削除されている
- `preload/types.ts` の `ElectronAPI.skillCreatorSession` プロパティが削除されている
- `preload/skill-creator-session-api.ts` がリポジトリから完全に削除されている
- `skill-creator/` 配下の 5 つのスタブファイルがリポジトリから完全に削除されている
- TypeScript ビルドが正常に通過している（型エラーなし）
- 既存テストが全て通過している（壊れたテストがなければそのまま、参照テストは削除）

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts` の git 削除
- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorIpcBridge.test.ts` の git 削除（存在する場合）
- `apps/desktop/src/preload/types.ts` の `skillCreatorSession` プロパティ行の除去
- `apps/desktop/src/preload/index.ts` の `skillCreatorSession` 参照行の除去
- `apps/desktop/src/preload/skill-creator-session-api.ts` の git 削除
- `apps/desktop/src/renderer/components/skill-creator/ChoiceButton.tsx` の git 削除
- `apps/desktop/src/renderer/components/skill-creator/ConversationProgress.tsx` の git 削除
- `apps/desktop/src/renderer/components/skill-creator/FreeTextInput.tsx` の git 削除
- `apps/desktop/src/renderer/components/skill-creator/QuestionCard.tsx` の git 削除
- `apps/desktop/src/renderer/components/skill-creator/SkillCreatorResultPanel.tsx` の git 削除
- `apps/desktop/src/renderer/components/skill-creator/__tests__/` 配下の対応テストファイルの削除確認

#### 含まないもの

- `packages/shared/src/ipc/channels.ts` の `SKILL_CREATOR_SESSION_CHANNELS` 定義の削除
  （他の将来タスクで別途整理する）
- `SkillCreatorSdkSession.ts` の変更（Session IPC のバックエンド実装ではなく SDK 層）
- `creatorHandlers.ts` の変更（Runtime IPC の正本。このタスクで触らない）
- `SkillCreatorOutputHandler.ts` の変更（別系統のパイプライン）
- `apps/desktop/src/renderer/components/skill/` 配下の変更（移行先。このタスクで触らない）

### 2.4 成果物

1. git commit: 削除対象ファイルの `git rm` を含むコミット
2. TypeScript ビルド成功のエビデンス（`pnpm --filter @repo/desktop typecheck` 出力）
3. テスト実行成功のエビデンス（`pnpm --filter @repo/desktop test` 出力）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-UI-02 が完了していること（Session IPC が Runtime IPC へ移管済みであること）
- `apps/desktop/src/main/ipc/index.ts` に `SkillCreatorIpcBridge` のインスタンス化が
  存在しないことを確認済みであること（すでに削除済みの状態が前提）
- 作業前に `pnpm --filter @repo/desktop typecheck` が通過していること（ベースラインの確認）

### 3.2 依存タスク

| タスク                                  | 状態 | 備考                 |
| --------------------------------------- | ---- | -------------------- |
| TASK-UI-02 (ConversationPanel 孤立解消) | 完了 | Session IPC 移管済み |

### 3.3 必要な知識

- Electron IPC の Renderer → Main / Main → Renderer 通信モデルの基礎
- TypeScript の `interface` プロパティ削除時の依存確認方法（`tsc --noEmit` による型チェック）
- `preload/index.ts` が `contextBridge.exposeInMainWorld` で `electronAPI` を公開している仕組み
- `git rm` と通常ファイル削除の違い（git rm はステージングまで行う）

### 3.4 推奨アプローチ

段階的削除を3フェーズで実施する。

**フェーズ分割の理由**: TypeScript の型依存グラフに沿って「型を使う側から先に除去 → 型定義本体を除去」
の順で進めることで、各フェーズ終了時点で TypeScript ビルドが通過する状態を維持できる。
これにより、誤りがあっても即座に検出できる。

---

## 4. 実行手順

### Phase 構成

```
Phase 1: 依存確認と削除計画の確定（30分）
Phase 2: preload の型・参照除去（30分）
Phase 3: Main / Renderer の dead code ファイル git 削除（30分）
```

---

### Phase 1: 依存確認と削除計画の確定

#### 目的

削除対象ファイルが他から参照されていないことを確認し、
削除計画に漏れがないことを担保する。

#### 手順

1. 作業ブランチを作成する

   ```bash
   git checkout -b refactor/session-ipc-dead-code-cleanup
   ```

2. `SkillCreatorIpcBridge` が参照されているファイルを洗い出す

   ```bash
   grep -rn "SkillCreatorIpcBridge" apps/desktop/src/ --include="*.ts" --include="*.tsx"
   ```

   期待結果: `SkillCreatorIpcBridge.ts` 本体と `__tests__/SkillCreatorIpcBridge.test.ts` のみがヒットすること。
   他ファイルでインポートされていないことを確認する。

3. `skillCreatorSession` が参照されているファイルを洗い出す

   ```bash
   grep -rn "skillCreatorSession" apps/desktop/src/ --include="*.ts" --include="*.tsx"
   ```

   期待結果: `preload/types.ts`、`preload/index.ts`、`preload/skill-creator-session-api.ts` の 3 箇所のみ。
   Renderer 側（`src/renderer/`）でこのプロパティを参照しているコードがないことを確認する。

4. `skill-creator-session-api` のインポートを洗い出す

   ```bash
   grep -rn "skill-creator-session-api" apps/desktop/src/ --include="*.ts" --include="*.tsx"
   ```

   期待結果: `preload/index.ts` と `preload/types.ts` の 2 箇所のみ。

5. `skill-creator/` 配下の各スタブファイルが他からインポートされていないことを確認する

   ```bash
   grep -rn "from.*skill-creator/ChoiceButton\|from.*skill-creator/ConversationProgress\|from.*skill-creator/FreeTextInput\|from.*skill-creator/QuestionCard\|from.*skill-creator/SkillCreatorResultPanel" apps/desktop/src/ --include="*.ts" --include="*.tsx"
   ```

   期待結果: ヒットなし。

6. ベースラインとして TypeScript ビルドが通過することを確認する

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

7. ベースラインとして関連テストが通過することを確認する
   ```bash
   pnpm --filter @repo/desktop test -- --reporter=verbose 2>&1 | tail -30
   ```

#### 成果物

- 参照確認の出力結果（手順 2〜5 の出力を記録しておく）
- ベースラインのビルド・テスト通過の確認

#### 完了条件

- 手順 2〜5 で「期待結果」通りの出力が得られること
- `pnpm --filter @repo/desktop typecheck` が 0 exit で終了すること

---

### Phase 2: preload の型・参照除去

#### 目的

`preload/types.ts` および `preload/index.ts` から `skillCreatorSession` への参照を除去し、
その後 `skill-creator-session-api.ts` を git 削除する。
「型参照を先に除去してから型定義ファイルを削除」の順序で TypeScript ビルドを通過させ続ける。

#### 手順

1. `apps/desktop/src/preload/types.ts` を編集する。
   `ElectronAPI` インターフェースの以下の行を削除する。

   ```typescript
   // 削除対象行（types.ts 1256行目付近）
   skillCreatorSession: import("./skill-creator-session-api")
     .SkillCreatorSessionAPI;
   ```

2. `apps/desktop/src/preload/index.ts` を編集する。
   以下の 2 箇所を削除する。

   ```typescript
   // 削除対象（contextBridge.exposeInMainWorld の electronAPI オブジェクト内）
   skillCreatorSession: skillCreatorSessionAPI,
   ```

   ```typescript
   // 削除対象（import 文）
   import { skillCreatorSessionAPI } from "./skill-creator-session-api";
   ```

   注意: import 文の位置はファイル末尾付近（597 行目付近）にある。

3. TypeScript ビルドを実行して型エラーがないことを確認する

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

4. エラーがなければ `skill-creator-session-api.ts` を git 削除する

   ```bash
   git rm apps/desktop/src/preload/skill-creator-session-api.ts
   ```

5. 再度 TypeScript ビルドを実行して型エラーがないことを確認する

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

6. テストを実行して既存テストが壊れていないことを確認する
   ```bash
   pnpm --filter @repo/desktop test -- --reporter=verbose 2>&1 | tail -30
   ```

#### 成果物

- 修正済み `preload/types.ts`
- 修正済み `preload/index.ts`
- `skill-creator-session-api.ts` の git rm 完了

#### 完了条件

- `pnpm --filter @repo/desktop typecheck` が 0 exit で終了すること
- `pnpm --filter @repo/desktop test` が pass すること

---

### Phase 3: Main / Renderer の dead code ファイル git 削除

#### 目的

`SkillCreatorIpcBridge.ts`（Main プロセス）および `skill-creator/` 配下のスタブファイル群
（Renderer プロセス）を git 削除する。対応するテストファイルも同時に削除する。

#### 手順

1. `SkillCreatorIpcBridge.ts` とそのテストファイルを git 削除する

   ```bash
   git rm apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts
   ```

   テストファイルが存在する場合は続けて削除する

   ```bash
   git rm apps/desktop/src/main/services/runtime/__tests__/SkillCreatorIpcBridge.test.ts 2>/dev/null || echo "テストファイルなし"
   ```

2. `skill-creator/` 配下のスタブファイルを git 削除する

   ```bash
   git rm apps/desktop/src/renderer/components/skill-creator/ChoiceButton.tsx
   git rm apps/desktop/src/renderer/components/skill-creator/ConversationProgress.tsx
   git rm apps/desktop/src/renderer/components/skill-creator/FreeTextInput.tsx
   git rm apps/desktop/src/renderer/components/skill-creator/QuestionCard.tsx
   git rm apps/desktop/src/renderer/components/skill-creator/SkillCreatorResultPanel.tsx
   ```

3. `__tests__/` 配下の対応するテストファイルを確認し、スタブコンポーネントをテストしているファイルがあれば削除する

   ```bash
   ls apps/desktop/src/renderer/components/skill-creator/__tests__/
   ```

   各テストファイルの内容を確認し、削除済みコンポーネントのみをテストしているファイルを削除する

   ```bash
   # 例: スタブをテストしているファイルを削除
   git rm apps/desktop/src/renderer/components/skill-creator/__tests__/ChoiceButton.test.tsx
   # （以下同様に各テストファイルを確認・削除）
   ```

4. TypeScript ビルドを実行して型エラーがないことを確認する

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

5. テストを実行して既存テストが壊れていないことを確認する

   ```bash
   pnpm --filter @repo/desktop test -- --reporter=verbose 2>&1 | tail -30
   ```

6. コミットする

   ```bash
   git add -u
   git commit -m "refactor: TASK-UI-SESSION-CLEANUP-01 Session IPC dead code 完全削除

   - SkillCreatorIpcBridge.ts を git 削除（TASK-UI-02 で index.ts からのインスタンス化削除済み）
   - preload/skill-creator-session-api.ts を git 削除（全メソッド no-op stub だった）
   - ElectronAPI.skillCreatorSession プロパティを types.ts / index.ts から除去
   - skill-creator/ 配下の export {} stub ファイル 5 件を git 削除
   - 対応するテストファイルも削除"
   ```

#### 成果物

- `SkillCreatorIpcBridge.ts` の git rm 完了
- `skill-creator/` スタブファイル 5 件の git rm 完了
- 対応テストファイルの git rm 完了
- git コミット

#### 完了条件

- `pnpm --filter @repo/desktop typecheck` が 0 exit で終了すること
- `pnpm --filter @repo/desktop test` が pass すること
- `git status` で削除対象ファイルが「deleted」として記録されていること

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SkillCreatorIpcBridge.ts` がリポジトリに存在しない（`git ls-files` で確認）
- [ ] `preload/skill-creator-session-api.ts` がリポジトリに存在しない
- [ ] `ElectronAPI` インターフェースに `skillCreatorSession` プロパティが存在しない
- [ ] `preload/index.ts` に `skillCreatorSessionAPI` の参照が存在しない
- [ ] `skill-creator/ChoiceButton.tsx` がリポジトリに存在しない
- [ ] `skill-creator/ConversationProgress.tsx` がリポジトリに存在しない
- [ ] `skill-creator/FreeTextInput.tsx` がリポジトリに存在しない
- [ ] `skill-creator/QuestionCard.tsx` がリポジトリに存在しない
- [ ] `skill-creator/SkillCreatorResultPanel.tsx` がリポジトリに存在しない

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` が pass する
- [ ] `pnpm --filter @repo/desktop test` が pass する
- [ ] `grep -rn "skillCreatorSession" apps/desktop/src/` の出力が 0 件である

### ドキュメント要件

- [ ] このタスク指示書のステータスを「完了」に更新する
- [ ] `task-00-master-task-list.md` から本タスクのエントリを削除または完了としてマークする

---

## 6. 検証方法

### テストケース

| #    | 確認内容                   | コマンド                                                                                                                                                                                                 | 期待結果   |
| ---- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| TC-1 | TypeScript ビルド通過      | `pnpm --filter @repo/desktop typecheck`                                                                                                                                                                  | exit 0     |
| TC-2 | 単体テスト通過             | `pnpm --filter @repo/desktop test`                                                                                                                                                                       | all passed |
| TC-3 | 削除ファイル不在確認       | `git ls-files apps/desktop/src/ \| grep -E "SkillCreatorIpcBridge\|skill-creator-session-api\|skill-creator/(ChoiceButton\|ConversationProgress\|FreeTextInput\|QuestionCard\|SkillCreatorResultPanel)"` | 出力なし   |
| TC-4 | 型参照不在確認             | `grep -rn "skillCreatorSession" apps/desktop/src/`                                                                                                                                                       | 出力なし   |
| TC-5 | IPC ハンドラー二重登録なし | アプリを起動し Electron の console に `ipcMain: duplicate handler` 等のエラーが出ないこと                                                                                                                | エラーなし |

### 検証手順

1. Phase 2 完了後に TC-1, TC-2, TC-4 を実行する
2. Phase 3 完了後に TC-1, TC-2, TC-3, TC-4, TC-5 を実行する
3. 全て pass であることを確認してコミット・PR を作成する

---

## 7. リスクと対策

| リスク                                                                                                   | 影響度 | 発生確率 | 対策                                                                                                                                                            |
| -------------------------------------------------------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `skill-creator-session-api.ts` を削除した際に TypeScript 型エラーが発生する                              | 高     | 中       | Phase 2 手順通り「型参照を先に除去してから型定義ファイルを削除」の順序を厳守する。手順 3（typecheck）で確認後に git rm を実行する                               |
| `skill-creator/__tests__/` 配下のテストが削除コンポーネントを import しており CI が壊れる                | 中     | 高       | Phase 3 手順 3 で各テストファイルの内容を事前確認し、削除コンポーネントのみを対象とするテストを合わせて削除する                                                 |
| `SkillCreatorIpcBridge` が将来のリファクタリングの参考として必要になる                                   | 低     | 低       | git 履歴に残るため、必要であれば `git log -- apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts` で復元できる                                      |
| `SKILL_CREATOR_SESSION_CHANNELS` がまだ `IPC_CHANNELS` に含まれており、他コードが参照している可能性      | 中     | 低       | 本タスクのスコープ外。チャネル名前空間の整理は別タスクで実施する。削除前に `grep -rn "SKILL_CREATOR_SESSION_CHANNELS" apps/desktop/src/` で参照元を確認すること |
| `SkillCreatorOutputHandler.ts` が `SkillCreatorIpcBridge` を参照しているコメントを持ち、削除後に混乱する | 低     | 高       | `SkillCreatorOutputHandler.ts` の NOTE コメントは削除後に「旧ブリッジ削除済み」等に更新する（Phase 3 の追加作業として行う）                                     |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/unassigned-task/TASK-UI-02-conversation-panel-orphan-resolution.md` - 本タスクの発見元
- `docs/30-workflows/unassigned-task/TASK-UI-03-ipc-session-runtime-unification.md` - IPC 統一タスク（並行参照）
- `apps/desktop/src/main/ipc/creatorHandlers.ts` - Runtime IPC の正本実装

### 参考資料

- `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts` - 削除対象ファイル（ファイル冒頭コメントに廃止経緯が記載されている）
- `apps/desktop/src/preload/skill-creator-session-api.ts` - 削除対象ファイル（冒頭コメントに廃止経緯が記載されている）

---

## 9. 備考

### レビュー指摘の原文（TASK-UI-02 Phase 5 での判断）

```
TASK-UI-02 Phase 5 時点でのコメント（SkillCreatorIpcBridge.ts 冒頭）:
"TASK-UI-02: CONFIGURE_API / SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED ハンドラーは
creatorHandlers.ts へ移管済み。このクラスは Session IPC (START_SESSION / ANSWER) のみ担う。
※ Session IPC 自体も廃止予定（index.ts からのインスタンス化を削除済み）。"

TASK-UI-02 Phase 5 時点でのコメント（skill-creator-session-api.ts 冒頭）:
"TASK-UI-02: Session IPC 廃止済み。
Runtime IPC（creatorHandlers.ts）が正本。このファイルは型互換のためのスタブ。
ElectronAPI の skillCreatorSession プロパティ型を満たすために残存。"
```

### 補足事項（苦戦箇所の記録）

TASK-UI-02 の実施中に以下の苦戦箇所があった。本タスクを実施する際の参考として残す。

#### 苦戦箇所 1: stub 化 vs git delete の判断基準が不明確だった

Phase 9 QA チェックリストには「ファイル削除確認」の項目があったが、
Phase 5 の時点では完全削除ではなく stub 化を選択した。
その結果、Phase 9 で「なぜ削除しなかったのか」の説明が必要になった（CONDITIONAL_PASS の根拠説明）。

**原因**: stub 化の判断基準として「TypeScript 型依存が解消されていない場合は stub を維持する」
というルールが暗黙知になっていた。

**解決策**: Phase 9 テンプレートに「stub 化 OR git delete のどちらでも PASS」の基準を追加し、
CONDITIONAL_PASS の理由として「型依存が残存するため stub 段階で終了、後続タスク（本タスク）で完全削除予定」
を明記すれば良い。

**本タスクへの教訓**: 本タスクの Phase 2 で型依存を解消してから Phase 3 で git delete を行う
という順序を守れば、この問題は発生しない。

#### 苦戦箇所 2: TypeScript 型互換のため `skill-creator-session-api.ts` を no-op stub のまま残す必要があった

TASK-UI-02 実施時、`preload/types.ts` の `ElectronAPI.skillCreatorSession` 型参照が残った状態では
`skill-creator-session-api.ts` を削除できなかった。

**原因**: TypeScript の動的 import 型（`import("./skill-creator-session-api").SkillCreatorSessionAPI`）を
使用していたため、ファイルが存在しないとビルドエラーになる。

**解決策**: 段階的削除（stub 化 → 型参照除去 → git delete）を以下の順序で実施する。

1. `preload/types.ts` の `skillCreatorSession` プロパティ行を削除
2. `preload/index.ts` の `skillCreatorSessionAPI` import と参照を削除
3. `pnpm --filter @repo/desktop typecheck` を実行して型エラーがないことを確認
4. `git rm preload/skill-creator-session-api.ts` を実行

この順序を本タスクの Phase 2 に組み込んでいる。
