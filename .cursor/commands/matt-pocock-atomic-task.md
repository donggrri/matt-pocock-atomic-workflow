# /matt-pocock-atomic-task

matt-pocock-atomic-workflow Phase 2. PLAN을 TASKS로 쪼갠 뒤 기본은 execute→review 자동.

인자 형식: `[slug | 태스크만]`

`matt-pocock-atomic-workflow` 스킬과 스킬 디렉터리의 `reference.md`를 읽고 Phase 2를 수행한다. 「태스크만」이 아니면 기본 파이프라인으로 구현·리뷰까지 이어간다.

Cursor 세션이다. `.docs/<slug>/TASKS-<slug>.md`(워크플로 자체는 `docs/<slug>/`)가 없고 같은 슬러그 폴더에 PLAN이 있으면 Task 툴로 `tasker`를 백그라운드로 띄운다. task 첫 줄에 `matt-pocock-atomic-workflow`·`to-tickets` 경로를 적는다. PLAN도 없으면 Phase 1부터 기본 파이프라인. 산출물은 여전히 슬러그 폴더의 `TASKS-<slug>.md`다. 이슈 트래커에 올리지 마라.

슬러그/힌트: 현재 PLAN(슬래시 뒤에 붙인 텍스트가 있으면 그것을 우선한다)

커밋하지 않는다. 한국어로 항목 수와 이어서 돌릴 워커를 보고한다.

---

## Cursor 메모

- 위임은 Task 툴(`/에이전트명` 또는 "Use the ... subagent ...")로 수행한다. Pi의 `subagent` 호출과 동등하다.
- 단계별 모델은 `.cursor/agents/<에이전트>.md`의 `model` frontmatter로 지정한다(Pi의 `settings.json` `agentOverrides` 대신).
- 슬래시 뒤에 붙인 텍스트는 위 본문의 인자 자리에 들어간다.

