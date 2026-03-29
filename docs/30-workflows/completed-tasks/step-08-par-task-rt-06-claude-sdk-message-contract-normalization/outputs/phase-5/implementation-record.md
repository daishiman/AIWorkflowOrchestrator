# Phase 5: 実装記録 — SDK Message Normalizer

## 実装ファイル

| ファイル                                                              | 変更種別      | 内容                                                                                       |
| --------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------ |
| `packages/shared/src/types/skillCreator.ts`                           | 型追加        | `SkillCreatorSdkEventType`, `SkillCreatorSdkEventSourceProvenance`, `SkillCreatorSdkEvent` |
| `packages/shared/src/types/index.ts`                                  | re-export追加 | 上記3型のre-export                                                                         |
| `apps/desktop/src/main/services/runtime/sdkMessageNormalizer.ts`      | 新規作成      | `normalizeSdkMessage()`, `normalizeSdkStream()`, `NormalizerContext`                       |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 統合          | `normalizeSdkMessage()`, `normalizeSdkStream()`, `buildNormalizerContext()` メソッド追加   |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | ハンドラ追加  | `SKILL_CREATOR_NORMALIZE_SDK_MESSAGES` IPC ハンドラ                                        |
| `apps/desktop/src/preload/channels.ts`                                | チャネル追加  | `SKILL_CREATOR_NORMALIZE_SDK_MESSAGES` チャネル定義                                        |
| `apps/desktop/src/preload/skill-creator-api.ts`                       | API追加       | `normalizeSdkMessages()` preload API                                                       |

## TDD 状態

- **Green**: 全21テストが成功
- Phase 4 で作成したテストが全て通過

## 設計判断

1. **normalizer は Facade の内部モジュール**: Facade が owner となり、sourceProvenance の解決を一元化
2. **IPC エンドポイント追加**: renderer が直接 normalizer を呼べるよう IPC ハンドラを追加
3. **既存主線不変**: `plan()`, `execute()`, `improve()` の既存コードパスは変更なし
