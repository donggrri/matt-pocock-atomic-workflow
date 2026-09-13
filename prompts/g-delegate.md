---
description: atomic-pocock-workflow 구현 항목을 Pi 서브에이전트에 위임한다.
argument-hint: "[g-worker|agy|scout|oracle] [item-id]"
---
`atomic-pocock-workflow` 스킬과 스킬 디렉터리의 `workers.md`를 읽고 위임한다.

Pi 세션이다. PowerShell `invoke-worker.ps1`을 쓰지 마라. `subagent` 툴만 쓰고 `async: true`로 띄운 뒤 완료를 기다린다.

대상: ${@:-g-worker}

- PLAN에 막힌 질문이 있으면 위임하지 않는다.
- `g-worker` task 첫 줄에 `atomic-pocock-workflow`·`tdd` 경로를 적는다.
- 브리프에 비밀·토큰·`.env`를 넣지 않는다.
- 끝나면 이 세션이 `git diff`와 항목 `done` 테스트를 실행한다. 자식의 「완료」문장을 믿지 않는다.
- 통과면 TASKS `[x]`, 아니면 `막힘:`.

커밋·푸시하지 않는다.
