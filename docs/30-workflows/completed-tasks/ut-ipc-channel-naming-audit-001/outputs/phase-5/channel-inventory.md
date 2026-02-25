# Phase 5 チャネル棚卸し

## サマリ

- 実行日: 2026-02-25
- 総チャネル数: 203
- 値重複: 0
- 正本: `apps/desktop/src/preload/channels.ts`

## ドメイン別件数

| domain         | count |
| -------------- | ----: |
| agent          |    27 |
| skill          |    26 |
| profile        |    11 |
| slide          |     9 |
| claude-cli     |     9 |
| auth           |     8 |
| llm            |     8 |
| file           |     7 |
| system-prompt  |     7 |
| conversation   |     7 |
| workspace      |     6 |
| community      |     6 |
| skill-creator  |     6 |
| replace        |     5 |
| slideSettings  |     5 |
| auth-mode      |     5 |
| store          |     4 |
| theme          |     4 |
| apiKey         |     4 |
| file-selection |     4 |
| history        |     4 |
| chat-edit      |     4 |
| auth-key       |     4 |
| ai             |     3 |
| avatar         |     3 |
| permission     |     3 |
| graph          |     2 |
| dashboard      |     2 |
| window         |     2 |
| app            |     2 |
| settings       |     2 |
| dialog         |     2 |
| search         |     2 |

## 全チャネル一覧

| key                                  | value                                | domain         | ruleStatus   |
| ------------------------------------ | ------------------------------------ | -------------- | ------------ |
| AGENT_ABORT                          | agent:abort                          | agent          | out-of-scope |
| AGENT_CLEANUP_TEMP_FILES             | agent:cleanup-temp-files             | agent          | out-of-scope |
| AGENT_CREATE_SESSION                 | agent:createSession                  | agent          | out-of-scope |
| AGENT_DESTROY_SESSION                | agent:destroySession                 | agent          | out-of-scope |
| AGENT_EXECUTE                        | agent:execute                        | agent          | out-of-scope |
| AGENT_EXECUTION_GET_ACTIVE           | agent:get-active-executions          | agent          | out-of-scope |
| AGENT_EXECUTION_PERMISSION           | agent:permission                     | agent          | out-of-scope |
| AGENT_EXECUTION_PERMISSION_RES       | agent:permission:res                 | agent          | out-of-scope |
| AGENT_EXECUTION_START                | agent:start                          | agent          | out-of-scope |
| AGENT_EXECUTION_STATUS               | agent:status                         | agent          | out-of-scope |
| AGENT_EXECUTION_STOP                 | agent:stop                           | agent          | out-of-scope |
| AGENT_EXECUTION_STOP_ALL             | agent:stop-all                       | agent          | out-of-scope |
| AGENT_EXECUTION_STREAM               | agent:stream                         | agent          | out-of-scope |
| AGENT_EXTRACT_CONTENT                | agent:extract-content                | agent          | out-of-scope |
| AGENT_GET_PREVIEW_CONTENT            | agent:get-preview-content            | agent          | out-of-scope |
| AGENT_GET_SKILL_DETAIL               | agent:get-skill-detail               | agent          | out-of-scope |
| AGENT_GET_SKILLS                     | agent:get-skills                     | agent          | out-of-scope |
| AGENT_GET_STATUS                     | agent:get-status                     | agent          | out-of-scope |
| AGENT_MESSAGE                        | agent:message                        | agent          | out-of-scope |
| AGENT_PERMISSION_REQUEST             | agent:permission-request             | agent          | out-of-scope |
| AGENT_PERMISSION_RESPOND             | agent:permission-respond             | agent          | out-of-scope |
| AGENT_QUERY                          | agent:query                          | agent          | out-of-scope |
| AGENT_RESUME_SESSION                 | agent:resumeSession                  | agent          | out-of-scope |
| AGENT_STATUS_CHANGED                 | agent:status-changed                 | agent          | out-of-scope |
| AGENT_STREAM_CHUNK                   | agent:stream-chunk                   | agent          | out-of-scope |
| AGENT_STREAM_END                     | agent:stream-end                     | agent          | out-of-scope |
| AGENT_STREAM_ERROR                   | agent:stream-error                   | agent          | out-of-scope |
| AI_CHAT                              | ai:chat                              | ai             | out-of-scope |
| AI_CHECK_CONNECTION                  | ai:check-connection                  | ai             | out-of-scope |
| AI_INDEX                             | ai:index                             | ai             | out-of-scope |
| API_KEY_DELETE                       | apiKey:delete                        | apiKey         | out-of-scope |
| API_KEY_LIST                         | apiKey:list                          | apiKey         | out-of-scope |
| API_KEY_SAVE                         | apiKey:save                          | apiKey         | out-of-scope |
| API_KEY_VALIDATE                     | apiKey:validate                      | apiKey         | out-of-scope |
| APP_GET_VERSION                      | app:get-version                      | app            | out-of-scope |
| APP_MENU_ACTION                      | app:menu-action                      | app            | out-of-scope |
| AUTH_CHECK_ONLINE                    | auth:check-online                    | auth           | out-of-scope |
| AUTH_GET_SESSION                     | auth:get-session                     | auth           | out-of-scope |
| AUTH_LOGIN                           | auth:login                           | auth           | out-of-scope |
| AUTH_LOGOUT                          | auth:logout                          | auth           | out-of-scope |
| AUTH_REFRESH                         | auth:refresh                         | auth           | out-of-scope |
| AUTH_START_OAUTH_FLOW                | auth:start-oauth-flow                | auth           | out-of-scope |
| AUTH_STATE_CHANGED                   | auth:state-changed                   | auth           | out-of-scope |
| AUTH_TEST_CALLBACK                   | auth:test-callback                   | auth           | out-of-scope |
| AUTH_KEY_DELETE                      | auth-key:delete                      | auth-key       | out-of-scope |
| AUTH_KEY_EXISTS                      | auth-key:exists                      | auth-key       | out-of-scope |
| AUTH_KEY_SET                         | auth-key:set                         | auth-key       | out-of-scope |
| AUTH_KEY_VALIDATE                    | auth-key:validate                    | auth-key       | out-of-scope |
| AUTH_MODE_CHANGED                    | auth-mode:changed                    | auth-mode      | out-of-scope |
| AUTH_MODE_GET                        | auth-mode:get                        | auth-mode      | out-of-scope |
| AUTH_MODE_SET                        | auth-mode:set                        | auth-mode      | out-of-scope |
| AUTH_MODE_STATUS                     | auth-mode:status                     | auth-mode      | out-of-scope |
| AUTH_MODE_VALIDATE                   | auth-mode:validate                   | auth-mode      | out-of-scope |
| AVATAR_REMOVE                        | avatar:remove                        | avatar         | out-of-scope |
| AVATAR_UPLOAD                        | avatar:upload                        | avatar         | out-of-scope |
| AVATAR_USE_PROVIDER                  | avatar:use-provider                  | avatar         | out-of-scope |
| CHAT_EDIT_GET_SELECTION              | chat-edit:get-selection              | chat-edit      | out-of-scope |
| CHAT_EDIT_READ_FILE                  | chat-edit:read-file                  | chat-edit      | out-of-scope |
| CHAT_EDIT_SEND_WITH_CONTEXT          | chat-edit:send-with-context          | chat-edit      | out-of-scope |
| CHAT_EDIT_WRITE_FILE                 | chat-edit:write-file                 | chat-edit      | out-of-scope |
| CLAUDE_CLI_CHECK_INSTALLATION        | claude-cli:check-installation        | claude-cli     | out-of-scope |
| CLAUDE_CLI_EXECUTE_SCRIPT            | claude-cli:execute-script            | claude-cli     | out-of-scope |
| CLAUDE_CLI_GET_SESSION               | claude-cli:get-session               | claude-cli     | out-of-scope |
| CLAUDE_CLI_GET_SKILL_DETAIL          | claude-cli:get-skill-detail          | claude-cli     | out-of-scope |
| CLAUDE_CLI_LIST_SESSIONS             | claude-cli:list-sessions             | claude-cli     | out-of-scope |
| CLAUDE_CLI_LIST_SKILLS               | claude-cli:list-skills               | claude-cli     | out-of-scope |
| CLAUDE_CLI_SESSION_OUTPUT            | claude-cli:session-output            | claude-cli     | out-of-scope |
| CLAUDE_CLI_SESSION_STATUS            | claude-cli:session-status            | claude-cli     | out-of-scope |
| CLAUDE_CLI_TERMINATE_SESSION         | claude-cli:terminate-session         | claude-cli     | out-of-scope |
| COMMUNITY_GET_ALL                    | community:getAll                     | community      | out-of-scope |
| COMMUNITY_GET_BY_ID                  | community:getById                    | community      | out-of-scope |
| COMMUNITY_GET_BY_LEVEL               | community:getByLevel                 | community      | out-of-scope |
| COMMUNITY_GET_MEMBERS                | community:getMembers                 | community      | out-of-scope |
| COMMUNITY_GET_SUMMARY                | community:getSummary                 | community      | out-of-scope |
| COMMUNITY_SEARCH                     | community:search                     | community      | out-of-scope |
| CONVERSATION_ADD_MESSAGE             | conversation:addMessage              | conversation   | out-of-scope |
| CONVERSATION_CREATE                  | conversation:create                  | conversation   | out-of-scope |
| CONVERSATION_DELETE                  | conversation:delete                  | conversation   | out-of-scope |
| CONVERSATION_GET                     | conversation:get                     | conversation   | out-of-scope |
| CONVERSATION_LIST                    | conversation:list                    | conversation   | out-of-scope |
| CONVERSATION_SEARCH                  | conversation:search                  | conversation   | out-of-scope |
| CONVERSATION_UPDATE                  | conversation:update                  | conversation   | out-of-scope |
| DASHBOARD_GET_ACTIVITY               | dashboard:get-activity               | dashboard      | out-of-scope |
| DASHBOARD_GET_STATS                  | dashboard:get-stats                  | dashboard      | out-of-scope |
| DIALOG_SHOW_OPEN                     | dialog:showOpenDialog                | dialog         | out-of-scope |
| DIALOG_SHOW_SAVE                     | dialog:showSaveDialog                | dialog         | out-of-scope |
| FILE_CHANGED                         | file:changed                         | file           | out-of-scope |
| FILE_GET_TREE                        | file:get-tree                        | file           | out-of-scope |
| FILE_READ                            | file:read                            | file           | out-of-scope |
| FILE_RENAME                          | file:rename                          | file           | out-of-scope |
| FILE_WATCH_START                     | file:watch-start                     | file           | out-of-scope |
| FILE_WATCH_STOP                      | file:watch-stop                      | file           | out-of-scope |
| FILE_WRITE                           | file:write                           | file           | out-of-scope |
| FILE_SELECTION_GET_METADATA          | file-selection:get-metadata          | file-selection | out-of-scope |
| FILE_SELECTION_GET_MULTIPLE_METADATA | file-selection:get-multiple-metadata | file-selection | out-of-scope |
| FILE_SELECTION_OPEN_DIALOG           | file-selection:open-dialog           | file-selection | out-of-scope |
| FILE_SELECTION_VALIDATE_PATH         | file-selection:validate-path         | file-selection | out-of-scope |
| GRAPH_GET                            | graph:get                            | graph          | out-of-scope |
| GRAPH_REFRESH                        | graph:refresh                        | graph          | out-of-scope |
| HISTORY_GET_CONVERSION_LOGS          | history:getConversionLogs            | history        | out-of-scope |
| HISTORY_GET_FILE_HISTORY             | history:getFileHistory               | history        | out-of-scope |
| HISTORY_GET_VERSION_DETAIL           | history:getVersionDetail             | history        | out-of-scope |
| HISTORY_RESTORE_VERSION              | history:restoreVersion               | history        | out-of-scope |
| LLM_CHECK_HEALTH                     | llm:check-health                     | llm            | out-of-scope |
| LLM_GET_PROVIDERS                    | llm:get-providers                    | llm            | out-of-scope |
| LLM_SEND_CHAT                        | llm:send-chat                        | llm            | out-of-scope |
| LLM_STREAM_CANCEL                    | llm:stream-cancel                    | llm            | out-of-scope |
| LLM_STREAM_CHAT                      | llm:stream-chat                      | llm            | out-of-scope |
| LLM_STREAM_CHUNK                     | llm:stream-chunk                     | llm            | out-of-scope |
| LLM_STREAM_END                       | llm:stream-end                       | llm            | out-of-scope |
| LLM_STREAM_ERROR                     | llm:stream-error                     | llm            | out-of-scope |
| PERMISSION_CLEAR_ALL                 | permission:clearAll                  | permission     | out-of-scope |
| PERMISSION_GET_ALLOWED_TOOLS         | permission:getAllowedTools           | permission     | out-of-scope |
| PERMISSION_REVOKE_TOOL               | permission:revokeTool                | permission     | out-of-scope |
| PROFILE_DELETE                       | profile:delete                       | profile        | out-of-scope |
| PROFILE_EXPORT                       | profile:export                       | profile        | out-of-scope |
| PROFILE_GET                          | profile:get                          | profile        | out-of-scope |
| PROFILE_GET_PROVIDERS                | profile:get-providers                | profile        | out-of-scope |
| PROFILE_IMPORT                       | profile:import                       | profile        | out-of-scope |
| PROFILE_LINK_PROVIDER                | profile:link-provider                | profile        | out-of-scope |
| PROFILE_UNLINK_PROVIDER              | profile:unlink-provider              | profile        | out-of-scope |
| PROFILE_UPDATE                       | profile:update                       | profile        | out-of-scope |
| PROFILE_UPDATE_LOCALE                | profile:update-locale                | profile        | out-of-scope |
| PROFILE_UPDATE_NOTIFICATIONS         | profile:update-notifications         | profile        | out-of-scope |
| PROFILE_UPDATE_TIMEZONE              | profile:update-timezone              | profile        | out-of-scope |
| REPLACE_FILE_ALL                     | replace:file:all                     | replace        | out-of-scope |
| REPLACE_FILE_SINGLE                  | replace:file:single                  | replace        | out-of-scope |
| REPLACE_REDO                         | replace:redo                         | replace        | out-of-scope |
| REPLACE_UNDO                         | replace:undo                         | replace        | out-of-scope |
| REPLACE_WORKSPACE_ALL                | replace:workspace:all                | replace        | out-of-scope |
| SEARCH_FILE_EXECUTE                  | search:file:execute                  | search         | out-of-scope |
| SEARCH_WORKSPACE_EXECUTE             | search:workspace:execute             | search         | out-of-scope |
| USER_SETTINGS_GET                    | settings:get                         | settings       | out-of-scope |
| USER_SETTINGS_UPDATE                 | settings:update                      | settings       | out-of-scope |
| SKILL_ABORT                          | skill:abort                          | skill          | pass         |
| SKILL_ANALYZE                        | skill:analyze                        | skill          | pass         |
| SKILL_COMPLETE                       | skill:complete                       | skill          | pass         |
| SKILL_CREATE_FILE                    | skill:createFile                     | skill          | pass         |
| SKILL_DELETE_FILE                    | skill:deleteFile                     | skill          | pass         |
| SKILL_ERROR                          | skill:error                          | skill          | pass         |
| SKILL_EXECUTE                        | skill:execute                        | skill          | pass         |
| SKILL_GET_DETAIL                     | skill:get-detail                     | skill          | violation    |
| SKILL_GET_IMPORTED                   | skill:getImported                    | skill          | pass         |
| SKILL_GET_STATUS                     | skill:get-status                     | skill          | violation    |
| SKILL_IMPORT                         | skill:import                         | skill          | pass         |
| SKILL_IMPROVE                        | skill:improve                        | skill          | pass         |
| SKILL_LIST                           | skill:list                           | skill          | pass         |
| SKILL_LIST_BACKUPS                   | skill:listBackups                    | skill          | pass         |
| SKILL_OPTIMIZE                       | skill:optimize                       | skill          | pass         |
| SKILL_OPTIMIZE_EVALUATE              | skill:optimize:evaluate              | skill          | violation    |
| SKILL_OPTIMIZE_VARIANTS              | skill:optimize:variants              | skill          | violation    |
| SKILL_PERMISSION_REQUEST             | skill:permission:request             | skill          | violation    |
| SKILL_PERMISSION_RESPONSE            | skill:permission:response            | skill          | violation    |
| SKILL_READ_FILE                      | skill:readFile                       | skill          | pass         |
| SKILL_REMOVE                         | skill:remove                         | skill          | pass         |
| SKILL_RESTORE_BACKUP                 | skill:restoreBackup                  | skill          | pass         |
| SKILL_SCAN                           | skill:scan                           | skill          | pass         |
| SKILL_STREAM                         | skill:stream                         | skill          | pass         |
| SKILL_UPDATE                         | skill:update                         | skill          | pass         |
| SKILL_WRITE_FILE                     | skill:writeFile                      | skill          | pass         |
| SKILL_CREATOR_CREATE                 | skill-creator:create                 | skill-creator  | out-of-scope |
| SKILL_CREATOR_DETECT_MODE            | skill-creator:detect-mode            | skill-creator  | out-of-scope |
| SKILL_CREATOR_EXECUTE_TASKS          | skill-creator:execute-tasks          | skill-creator  | out-of-scope |
| SKILL_CREATOR_PROGRESS               | skill-creator:progress               | skill-creator  | out-of-scope |
| SKILL_CREATOR_VALIDATE               | skill-creator:validate               | skill-creator  | out-of-scope |
| SKILL_CREATOR_VALIDATE_SCHEMA        | skill-creator:validate-schema        | skill-creator  | out-of-scope |
| SLIDE_CANCEL_EXECUTION               | slide:cancelExecution                | slide          | out-of-scope |
| SLIDE_EXECUTE_PHASE                  | slide:executePhase                   | slide          | out-of-scope |
| SLIDE_EXECUTION_PROGRESS             | slide:executionProgress              | slide          | out-of-scope |
| SLIDE_GET_SYNC_STATUS                | slide:getSyncStatus                  | slide          | out-of-scope |
| SLIDE_MANUAL_SYNC                    | slide:manualSync                     | slide          | out-of-scope |
| SLIDE_START_WATCHING                 | slide:startWatching                  | slide          | out-of-scope |
| SLIDE_STOP_WATCHING                  | slide:stopWatching                   | slide          | out-of-scope |
| SLIDE_STRUCTURE_CHANGED              | slide:structureChanged               | slide          | out-of-scope |
| SLIDE_SYNC_STATUS_CHANGED            | slide:syncStatusChanged              | slide          | out-of-scope |
| SLIDE_SETTINGS_GET_ALL               | slideSettings:getAllSettings         | slideSettings  | out-of-scope |
| SLIDE_SETTINGS_GET_DIRECTORY         | slideSettings:getDirectory           | slideSettings  | out-of-scope |
| SLIDE_SETTINGS_SELECT_DIRECTORY      | slideSettings:selectDirectory        | slideSettings  | out-of-scope |
| SLIDE_SETTINGS_SET_DIRECTORY         | slideSettings:setDirectory           | slideSettings  | out-of-scope |
| SLIDE_SETTINGS_VALIDATE_DIRECTORY    | slideSettings:validateDirectory      | slideSettings  | out-of-scope |
| STORE_GET                            | store:get                            | store          | out-of-scope |
| STORE_GET_SECURE                     | store:get-secure                     | store          | out-of-scope |
| STORE_SET                            | store:set                            | store          | out-of-scope |
| STORE_SET_SECURE                     | store:set-secure                     | store          | out-of-scope |
| SYSTEM_PROMPT_CREATE                 | system-prompt:create                 | system-prompt  | out-of-scope |
| SYSTEM_PROMPT_DELETE                 | system-prompt:delete                 | system-prompt  | out-of-scope |
| SYSTEM_PROMPT_GET                    | system-prompt:get                    | system-prompt  | out-of-scope |
| SYSTEM_PROMPT_GET_PRESETS            | system-prompt:get-presets            | system-prompt  | out-of-scope |
| SYSTEM_PROMPT_LIST                   | system-prompt:list                   | system-prompt  | out-of-scope |
| SYSTEM_PROMPT_MIGRATE                | system-prompt:migrate                | system-prompt  | out-of-scope |
| SYSTEM_PROMPT_UPDATE                 | system-prompt:update                 | system-prompt  | out-of-scope |
| THEME_GET                            | theme:get                            | theme          | out-of-scope |
| THEME_GET_SYSTEM                     | theme:get-system                     | theme          | out-of-scope |
| THEME_SET                            | theme:set                            | theme          | out-of-scope |
| THEME_SYSTEM_CHANGED                 | theme:system-changed                 | theme          | out-of-scope |
| WINDOW_GET_STATE                     | window:get-state                     | window         | out-of-scope |
| WINDOW_RESIZED                       | window:resized                       | window         | out-of-scope |
| WORKSPACE_ADD_FOLDER                 | workspace:add-folder                 | workspace      | out-of-scope |
| WORKSPACE_FOLDER_CHANGED             | workspace:folder-changed             | workspace      | out-of-scope |
| WORKSPACE_LOAD                       | workspace:load                       | workspace      | out-of-scope |
| WORKSPACE_REMOVE_FOLDER              | workspace:remove-folder              | workspace      | out-of-scope |
| WORKSPACE_SAVE                       | workspace:save                       | workspace      | out-of-scope |
| WORKSPACE_VALIDATE_PATHS             | workspace:validate-paths             | workspace      | out-of-scope |

## SubAgent-A 実行記録

- 抽出コマンド: `rg -n '^[[:space:]]+[A-Z0-9_]+:\s*"[a-zA-Z0-9:-]+"' apps/desktop/src/preload/channels.ts`
- 抽出結果: 203件
- 完了判定: PASS
