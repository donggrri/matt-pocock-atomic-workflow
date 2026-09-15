# /matt-pocock-atomic-delegate

matt-pocock-atomic-workflow 구현 항목을 Pi 서브에이전트에 위임한다.

인자 형식: `[worker|agy|pi|opencode|codex|claude|scout|oracle] [item-id]`

`matt-pocock-atomic-workflow` 스킬과 스킬 디렉터리의 `workers.md`를 읽고 위임한다.

Cursor 세션이다. `agy`/`pi` CLI를 직접 호출하지 마라. Task 툴만 쓴다.

- TASKS `worker:` 또는 인자가 `agy|pi|opencode|codex|claude`이면 Task 툴로 `cli-delegate`를 백그라운드로 띄운다.
- 그 외 구현 위임은 Task 툴로 `worker`를 `async: true`로.

대상: worker(슬래시 뒤에 붙인 텍스트가 있으면 그것을 우선한다)

- PLAN에 막힌 질문이 있으면 위임하지 않는다.
- `cli-delegate` / `worker` task 첫 줄에 `matt-pocock-atomic-workflow`·`tdd` 경로를 적는다.
- 브리프에 비밀·토큰·`.env`를 넣지 않는다.
- 끝나면 이 세션이 `git diff`와 항목 `done` 테스트를 실행한다. 자식의 「완료」문장을 믿지 않는다.
- 통과면 TASKS `[x]`, 아니면 `막힘:`.

커밋·푸시하지 않는다.

---

## Cursor 메모

- 위임은 Task 툴(`/에이전트명` 또는 "Use the ... subagent ...")로 수행한다. Pi의 `subagent` 호출과 동등하다.
- 단계별 모델은 `.cursor/agents/<에이전트>.md`의 `model` frontmatter로 지정한다(Pi의 `settings.json` `agentOverrides` 대신).
- 슬래시 뒤에 붙인 텍스트는 위 본문의 인자 자리에 들어간다.

