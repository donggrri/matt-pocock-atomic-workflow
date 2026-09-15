---
description: matt-pocock-atomic-workflow 구현 항목을 Pi 서브에이전트에 위임한다.
argument-hint: "[worker|agy|pi|opencode|codex|claude|scout|oracle] [item-id]"
---
`matt-pocock-atomic-workflow` 스킬과 스킬 디렉터리의 `workers.md`를 읽고 위임한다.

Pi 세션이다. `agy`/`pi` CLI를 직접 호출하지 마라. `subagent` 툴만 쓴다.

- TASKS `worker:` 또는 인자가 `agy|pi|opencode|codex|claude`이면 `subagent`로 `cli-delegate`를 `async: true`로 띄운다.
- 그 외 구현 위임은 `subagent`로 `worker`를 `async: true`로.

대상: ${@:-worker}

- PLAN에 막힌 질문이 있으면 위임하지 않는다.
- `cli-delegate` / `worker` task 첫 줄에 `matt-pocock-atomic-workflow`·`tdd` 경로를 적는다.
- 브리프에 비밀·토큰·`.env`를 넣지 않는다.
- 끝나면 이 세션이 `git diff`와 항목 `done` 테스트를 실행한다. 자식의 「완료」문장을 믿지 않는다.
- 통과면 TASKS `[x]`, 아니면 `막힘:`.

커밋·푸시하지 않는다.
