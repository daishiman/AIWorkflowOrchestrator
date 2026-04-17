# TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001: キャンセル後の半作成スキルディレクトリ残存クリーンアップ

## メタ情報

- 検出元: TASK-SW-CANCEL-003/004 Phase 12 未タスク検出
- 優先度: Low
- 種別: バグ修正（UX改善）
- 関連ファイル:
  - `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
  - `apps/desktop/src/main/services/skill/ScriptExecutor.ts`

## 目的

スキル生成がキャンセルされた際に部分的に作成されたスキルディレクトリを自動クリーンアップし、
再作成時のディレクトリ衝突やゴミデータ残存を防止する。

## 背景

スキル作成フローのキャンセル機能（TASK-SW-CANCEL-001〜004）を実装した結果、
`SkillCreatorService.cancelCurrentOperation()` が `currentAbortController.abort()` を呼び出し、
進行中のスクリプト実行（`ScriptExecutor.execute()` 内 SIGTERM）を中断できるようになった。

しかし、キャンセル時点でスキルディレクトリの一部が既に作成されている場合、
その半作成状態のファイル/ディレクトリが残存する問題が未解決である。

### 半作成が発生するタイミング

`createSkill()` の処理フローにおいて、以下の順序でファイル/ディレクトリが生成される。
キャンセルはいずれの段階でも発生しうる。

1. `init_skill.js` 実行 → スキルディレクトリ（`skillsDir/{name}/`）が作成される
2. `initializeSkillFallback()` → `scripts/`・`agents/`・`references/`・`assets/` サブディレクトリが作成される
3. `generateSkillMd()` または `ensureSkillMdExists()` → `SKILL.md` が書き込まれる
4. `generateTaskSpecs()` → ワークフローディレクトリへタスク仕様書が生成される
5. `validateSkill()` → 検証スクリプトが実行される

段階1〜4の途中でキャンセルされた場合、不完全なスキルディレクトリが残存する。

### 残存による問題

1. **再作成時のディレクトリ衝突**: ユーザーが同名スキルを再度作成しようとした際、
   `init_skill.js` が既存ディレクトリを検出してエラーになる可能性がある。
2. **不完全なスキルの表示**: スキル一覧に `SKILL.md` だけが存在する不完全なスキルが表示される。
3. **ディスクスペースの無駄遣い**: 意図せず残ったファイルが蓄積する。

### 現在の実装状態

```typescript
// SkillCreatorService.ts - cancelCurrentOperation() の現状
public cancelCurrentOperation(): void {
  this.currentAbortController?.abort();
  this.currentAbortController = null;
  // クリーンアップ処理なし: skillDir が残存する
}

// createSkill() の finally ブロックの現状
} finally {
  // AbortController のリセットのみ。skillDir の削除は行わない。
  if (this.currentAbortController === abortController) {
    this.currentAbortController = null;
  }
}
```

### 苦戦が予想される箇所

- **SIGTERM の非同期性**: `ScriptExecutor.execute()` は SIGTERM 送信後に即座に `AbortError` で
  reject するが、子プロセスは非同期に終了する。プロセス終了前にディレクトリ削除を行うと、
  子プロセスが書き込み中のファイルに対して削除競合が発生する可能性がある。
- **削除タイミングの設計**: `cancelCurrentOperation()` の呼び出し元（IPC ハンドラ）は
  非同期ではないため、`skillDir` の特定には `createSkill()` の実行コンテキストが必要。
  `cancelCurrentOperation()` はその情報を持たない。
- **削除対象の判定**: キャンセル前から存在した既存スキルと、今回のキャンセルで中断された
  新規作成スキルを区別する必要がある（既存スキルを誤削除しないため）。

## 実行タスク

- [ ] `createSkill()` の `finally` ブロックで AbortError 判定し、半作成ディレクトリを削除する処理を追加する
  - `operationSignal.aborted` が `true` の場合のみクリーンアップを実行する
  - `skillDir` の存在確認（`fs.access()`）を経てから削除する
  - 削除は `fs.rm(skillDir, { recursive: true, force: true })` を使用する
- [ ] クリーンアップ対象のディレクトリを「今回の実行で新規に作成したか否か」で判定する仕組みを設計する
  - `createSkill()` 開始時点で `skillDir` が存在しないことを確認し、フラグ（`createdByThisRun`）を保持する
  - キャンセル時は `createdByThisRun === true` の場合のみ削除を実行する
- [ ] クリーンアップ失敗（削除エラー）を握りつぶしてログ出力に留め、クリーンアップ失敗でエラーを伝播させない
- [ ] `cancelCurrentOperation()` の JSDoc にクリーンアップが `createSkill()` 側で行われることを記載する
- [ ] ユニットテストを追加する
  - キャンセル時に新規作成されたスキルディレクトリが削除されることを検証する
  - 既存スキルディレクトリ（キャンセル前から存在）が削除されないことを検証する
  - クリーンアップ失敗時にエラーが伝播しないことを検証する
  - キャンセルなしで正常完了した場合にディレクトリが残ることを検証する

## 完了条件

- [ ] `createSkill()` をキャンセルした場合、実行前に存在しなかったスキルディレクトリが削除されること
- [ ] `createSkill()` をキャンセルした場合、実行前から存在したスキルディレクトリが削除されないこと
- [ ] クリーンアップ中に `fs.rm()` がエラーになっても `AbortError` が呼び出し元に伝播すること（クリーンアップエラーは非致命的）
- [ ] `createSkill()` が正常完了した場合、スキルディレクトリが削除されないこと
- [ ] TypeScript 型チェック PASS
- [ ] 関連テスト全件 PASS

## 設計メモ

### 推奨実装パターン

```typescript
async createSkill(options, onProgress) {
  const abortController = new AbortController();
  this.currentAbortController = abortController;
  const operationSignal = abortController.signal;

  const skillDir = path.join(this.skillsDir, options.name);

  // 事前に skillDir の存在確認（クリーンアップ判定用）
  let createdByThisRun = false;
  try {
    await fs.access(skillDir);
    // 存在した場合は今回生成でないのでクリーンアップ対象外
  } catch {
    createdByThisRun = true;
  }

  try {
    // ... 既存処理 ...
  } finally {
    if (this.currentAbortController === abortController) {
      this.currentAbortController = null;
    }
    // キャンセルされ、かつ今回新規作成した場合のみクリーンアップ
    if (operationSignal.aborted && createdByThisRun) {
      await fs.rm(skillDir, { recursive: true, force: true }).catch((err) => {
        this.logger.warn("Failed to cleanup partial skill directory", { skillDir, err });
      });
    }
  }
}
```

### 注意事項

- `skillDir` の算出は `createSkill()` の既存ロジックより前に移動する必要がある
  （現在は `init_skill.js` 実行後に `path.join(this.skillsDir, options.name)` で生成）
- `fs.rm()` の `force: true` オプションにより、ディレクトリが存在しない場合もエラーにならない
- SIGTERM 送信から子プロセス終了まで数ミリ秒の遅延があるため、
  `finally` ブロック実行時には子プロセスはほぼ終了しているが、競合の可能性はゼロではない

## 参照

- 検出元: TASK-SW-CANCEL-003 Phase 12 unassigned-task-detection.md
- 関連: TASK-SW-CANCEL-004 Phase 12 unassigned-task-detection.md
- 苦戦箇所: cancelCurrentOperation後のクリーンアップタイミング（SIGTERMの非同期性）
- 実装済みキャンセル基盤: `SkillCreatorService.ts` L88-91, `ScriptExecutor.ts` L85-93
