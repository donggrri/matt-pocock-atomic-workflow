---
description: matt-pocock-atomic-workflow Phase 5. 커밋만 한다. 푸시 없음.
argument-hint: "[message]"
---
`matt-pocock-atomic-workflow` 스킬을 읽고 Phase 5를 수행한다.

이 단계는 서브에이전트에 넘기지 마라. 이 세션이 직접 커밋한다.

추가 메시지: ${@:-}

1. `git status`, `git diff`, `git log`를 본다.
2. `.env`/토큰/`service_role`이 있으면 제외하고 경고한다.
3. PLAN/TASKS/REVIEW는 기본적으로 커밋하지 않는다. 슬러그 폴더(`.docs/<slug>/` 또는 하네스 `docs/<slug>/`)의 원본은 그대로 두고, 복사본만 증거 디렉터리(Pi bash: `~/.pi/agent/matt-pocock-atomic-workflow/evidence/<YYYY-MM-DD>-<slug>/`, Cursor PowerShell: `%USERPROFILE%/.pi/agent/matt-pocock-atomic-workflow/evidence/<YYYY-MM-DD>-<slug>/` 또는 `%USERPROFILE%/.cursor/matt-pocock-atomic-workflow/evidence/<YYYY-MM-DD>-<slug>/`)에 둔다.
4. 관련 파일만 add하고 1~2문장으로 커밋한다.
5. 푸시하지 않는다.

한국어로 해시와 남은 일을 보고한다.
