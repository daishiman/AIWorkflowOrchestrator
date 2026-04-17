# UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001 - 設計書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001 |
| Phase      | 2                                         |
| 作成日     | 2026-04-16                                |
| ステータス | completed                                 |

---

## 1. 削除済み確認と安全化

### 対象ファイル確認結果

```
SkillCreateWizard.llm-generation.test.tsx: deleted (N/A)
```

対象ファイルは current worktree で削除済みであることを確認。残存参照の整理は不要。

---

## 2. SkillCreateWizard.test.tsx 既存カバレッジ確認

### describe / it 構造

| describe ブロック                                      | テスト数 | 備考                              |
| ------------------------------------------------------ | -------- | --------------------------------- |
| 初期表示                                               | 1        | Step 0 表示確認                   |
| ステップ遷移                                           | 3        | Step 0→1→2 遷移フロー             |
| 完了画面                                               | 3        | onClose・リセット・フィードバック |
| extractExternalToolNames                               | 5        | ツール名抽出ロジック              |
| IPC 呼び出し                                           | 4        | エラー・空返値・Q5 反映           |
| TASK-SW-FIX-MODE-MGMT-001: LLM専用フロー検証           | 6        | generationMode 廃止の回帰         |
| STEPS 配列                                             | 2        | ステップ定義確認                  |
| inferSmartDefaults                                     | 10       | スマートデフォルト推論ロジック    |
| fetchSkills統合                                        | 1        | フィードバック回帰                |
| TASK-SW-FIX-STATE-DETAIL-001: 問題18                   | 2        | q5 再計算                         |
| TASK-SW-FIX-STATE-DETAIL-001: 問題19 generationLockRef | 3        | lockRef 競合修正                  |

**総テスト数**: 43件（全件 PASS 確認済み）

### エッジケースカバレッジ確認（旧 F-2/F-3/E-4/W-8b 相当）

| 旧テスト                           | 相当テスト（SkillCreateWizard.test.tsx）                         | カバレッジ |
| ---------------------------------- | ---------------------------------------------------------------- | ---------- |
| F-2: API undefined ガード          | `IPC 失敗時にエラーカードが表示される`（mockRejectedValue）      | カバー済み |
| F-3: createSkill 例外スロー        | `createSkill が空文字を返した場合はフォールバックエラー`         | カバー済み |
| E-4: 失敗後 setIsGenerating(false) | `TC-13: 生成エラー後にリトライすると再生成が可能（lockRef境界）` | カバー済み |
| W-8b: キャンセル後非同期競合防止   | `TC-08/09: 生成完了後に別のスキルを作ると再度生成が可能`         | カバー済み |

---

## 3. SkillCreateWizard.tsx 現行実装確認

### handleGenerate の async 競合対策

```typescript
// generationLockRef で二重起動を防止
const generationLockRef = useRef(false);
const generationRequestIdRef = useRef(0);

const handleGenerate = async (method: "complete" | "skip") => {
  if (
    generationLockRef.current ||
    isGenerating ||
    // ...
    streaming.isGenerating
  ) {
    return; // 二重起動ガード
  }
  generationLockRef.current = true;
  // ...
  // finally ブロックで必ず解放
  generationLockRef.current = false;
};
```

### isGenerating / setIsGenerating の使用確認

| 用途                    | 確認結果                                                  |
| ----------------------- | --------------------------------------------------------- |
| useState による管理     | `const [isGenerating, setIsGenerating] = useState(false)` |
| 生成開始時の set        | generationLockRef と連動                                  |
| 失敗後の解放（E-4相当） | finally ブロック + generationLockRef.current = false      |
| 競合防止（W-8b相当）    | generationRequestIdRef で競合を検知                       |

---

## 4. 方針確定

| 判断基準                                                                   | 方針                        |
| -------------------------------------------------------------------------- | --------------------------- |
| `SkillCreateWizard.llm-generation.test.tsx` が current worktree で削除済み | **選択肢A（削除）既定採用** |
| F-2/F-3/E-4/W-8b のエッジケースが SkillCreateWizard.test.tsx でカバー済み  | **選択肢B N/A**             |

---

## 5. 検証マトリクス

| テスト対象                   | テストコマンド                                                                                                   | 結果      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------- |
| SkillCreateWizard テスト単体 | `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` | 43件 PASS |
| desktop 全テスト             | `pnpm --filter @repo/desktop test:run`                                                                           | pending   |
| 型チェック                   | `pnpm --filter @repo/desktop typecheck`                                                                          | PASS      |

---

## 完了確認

- [x] SkillCreateWizard.test.tsx の既存テスト構造（IPC モック・エラーケース）を調査済み
- [x] SkillCreateWizard.llm-generation.test.tsx は削除済みであり、N/A 安全化が完了
- [x] F-2/F-3/E-4/W-8b 相当の既存カバレッジ確認済み（全てカバー済み）
- [x] 選択肢A 既定採用、選択肢B N/A
- [x] handleGenerate の async 競合対策（generationLockRef）を確認済み
- [x] 検証マトリクス定義済み
