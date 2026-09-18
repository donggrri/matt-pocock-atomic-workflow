# /matt-pocock-atomic-review

matt-pocock-atomic-workflow Phase 4. REVIEW-<slug>.md 작성과 테스트 대조.

인자 형식: `[slug]`

`matt-pocock-atomic-workflow` 스킬과 스킬 디렉터리의 `testing.md`를 읽고 Phase 4를 수행한다.

Cursor 세션이다. 남은 구현이 있으면 기본 파이프라인으로 그 항목부터 돌린 다음 리뷰한다. `tester`가 완료된 후 저장소 테스트도 `run-done`으로 실행한다. 그 외에는 Task 툴로 `reviewer`를 백그라운드로 띄운다. `reviewer`는 작업자(`worker`)의 대화 맥락을 상속받지 않는 독립 fresh 컨텍스트로 실행되어, PLAN/TASKS 명세와 실제 `git diff`만을 대조하여 Standards/Spec을 객관적으로 독립 검증한다. task 첫 줄에 `matt-pocock-atomic-workflow`·`code-review` 경로를 적는다. 손자 에이전트를 시키라고 하지 마라. 산출물은 여전히 `.docs/<slug>/REVIEW-<slug>.md`(워크플로 자체는 `docs/<slug>/`)다.

대상: 현재 TASKS(슬래시 뒤에 붙인 텍스트가 있으면 그것을 우선한다)

Structured Validation 원칙: 빌드/테스트 raw 로그 전체를 채팅창에 덤프하지 말고, 결과 요약, 결함, 실패 시 `errorTail`(마지막 20줄) 및 로그 파일 경로만 간결히 보고한다. 실패한 테스트나 의미 있는 survived mutation을 통과로 쓰지 마라. 커밋하지 마라. 다음이 커밋이면 `/matt-pocock-atomic-wrapup`을 안내한다.

REVIEW 저장(또는 TASKS 재작업) 직후 `node scripts/work-status.mjs sync <slug>`로 STATUS.json을 갱신한다 (Cursor 설치: `node .agents/skills/matt-pocock-atomic-workflow/scripts/work-status.mjs sync <slug>`).

리뷰 재작업: REVIEW 결함을 열린 TASKS로 되돌리거나 새 항목을 붙인 뒤 worker → reviewer를 한 번만 자동 재실행한다. 한 바퀴 후에도 결함이면 멈추고 보고한다 (flake retry 없음). 사람 게이트는 PLAN(Phase 1)만이며 리뷰 재작업 1회는 정책으로 자동 실행된다.

---

## Cursor 메모

- 위임은 Task 툴(`/에이전트명` 또는 "Use the ... subagent ...")로 수행한다. Pi의 `subagent` 호출과 동등하다.
- 단계별 모델은 `.cursor/agents/<에이전트>.md`의 `model` frontmatter로 지정한다(Pi의 `settings.json` `agentOverrides` 대신).
- 슬래시 뒤에 붙인 텍스트는 위 본문의 인자 자리에 들어간다.

