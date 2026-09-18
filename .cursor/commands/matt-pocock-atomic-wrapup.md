# /matt-pocock-atomic-wrapup

matt-pocock-atomic-workflow Phase 5 wrapup. 커밋하고 전역 상태를 갱신한다. 푸시 없음.

인자 형식: `[message]`

`matt-pocock-atomic-workflow` 스킬을 읽고 Phase 5를 수행한다.

이 단계는 서브에이전트에 넘기지 마라. 이 세션이 직접 커밋한다.

추가 메시지: 슬래시 뒤에 붙인 텍스트

1. `git status`, `git diff`, `git log`를 본다.
2. `.env`/토큰/`service_role`이 있으면 제외하고 경고한다.
3. PLAN/TASKS/REVIEW는 기본적으로 커밋하지 않는다. 슬러그 폴더(`~/.matt-pocock-workflow/docs/{shortRepo}/{slug}/` 또는 레거시 `.docs/<slug>/`, `docs/<slug>/`)의 원본은 그대로 두고, 복사본만 증거 디렉터리(Pi bash: `~/.matt-pocock-workflow/evidence/{shortRepo}/<YYYY-MM-DD>-<slug>/`, Cursor PowerShell: `%USERPROFILE%/.matt-pocock-workflow/evidence/{shortRepo}/<YYYY-MM-DD>-<slug>/` 또는 기존 하네스 `~/.pi/agent/matt-pocock-atomic-workflow/evidence/<YYYY-MM-DD>-<slug>/`)에 둔다.
4. 관련 파일만 add하고 1~2문장으로 커밋한다.
5. 푸시하지 않는다.
6. 커밋이 성공하면 전역 상태를 갱신한다. `node scripts/work-status.mjs record <slug> commit`. 사용자가 「완료」라고 하면 `node scripts/work-status.mjs complete <slug>`로 `phase: complete`를 기록한다. 푸시만으로는 완료가 되지 않는다.

한국어로 해시와 남은 일을 보고한다.

---

## Cursor 메모

- 위임은 Task 툴(`/에이전트명` 또는 "Use the ... subagent ...")로 수행한다. Pi의 `subagent` 호출과 동등하다.
- 단계별 모델은 `.cursor/agents/<에이전트>.md`의 `model` frontmatter로 지정한다(Pi의 `settings.json` `agentOverrides` 대신).
- 슬래시 뒤에 붙인 텍스트는 위 본문의 인자 자리에 들어간다.

