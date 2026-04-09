# IPC フロー図

```text
Renderer
  └─ skillCreatorAPI.verifySkill(skillName, authMode, apiKey)
       └─ safeInvoke(IPC_CHANNELS.SKILL_CREATOR_VERIFY, { skillName, authMode, apiKey })
            └─ preload/channels.ts
                 ├─ IPC_CHANNELS.SKILL_CREATOR_VERIFY
                 └─ ALLOWED_INVOKE_CHANNELS
                      └─ Main: creatorHandlers.ts
                           ├─ validateSender(...)
                           ├─ isBlank(args?.skillName)
                           └─ runtimeSkillCreatorService.verify(...)
                                └─ RuntimeSkillCreatorFacade.verify(...)
                                     ├─ SkillLocator.resolveSkillDir(skillName, process.cwd())
                                     ├─ verificationEngine.verify(skillDir)
                                     └─ RuntimeSkillCreatorVerifyCheck[] -> VerifyResult へ変換
```

## エラー経路

- `skillName` 未指定: handler で validation error
- `runtimeSkillCreatorService` 未注入: graceful degradation error
- `skillName -> skillDir` 解決失敗: Facade 例外 → handler で `sanitizeErrorMessage`
- verification engine 例外: Facade 例外 → handler で `sanitizeErrorMessage`
