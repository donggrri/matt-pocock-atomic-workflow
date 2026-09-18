# /matt-pocock-atomic-explore

matt-pocock-atomic-workflow Phase 0. 코드베이스 및 기술 사전 탐색 후 EXPLORE-<slug>.md 작성.

인자 형식: `[intent | 탐색 주제]`

`matt-pocock-atomic-workflow` 스킬을 먼저 읽고 Phase 0(탐색/Recon)을 수행한다.

Cursor 세션에서는 Task 툴로 아래 서브에이전트를 호출한다. CLI 워커를 직접 설치하거나 `agy`/`codex`를 인자 없이 실행하지 마라.

모든 작업(제품 기능 및 워크플로 자체)은 단일 전역 홈 `~/.matt-pocock-workflow/docs/{shortRepo}/{slug}/EXPLORE-<slug>.md`에 쓴다 (레거시: `.docs/<slug>/`, `docs/<slug>/`). 쓰기 전 슬러그 디렉토리를 만든다. 홈·스킬·제품 루트·제품 `docs/`를 서로 혼용하지 않는다.

그 외:
1. 기존 코드, 문서, 설정, 전역 홈 및 기존 `.docs/*/`·하네스 `docs/<slug>/`의 `EXPLORE-*.md` / `PLAN-*.md`를 확인한다.
2. 사용자의 탐색 주제나 의도를 바탕으로 Task 툴로 `explorer`를 백그라운드로 띄운다. task 첫 줄에 `matt-pocock-atomic-workflow` 경로를 적는다.
3. `explorer`가 대상 파일, 핵심 코드/인터페이스, 아키텍처 흐름, 리스크를 분석하여 `~/.matt-pocock-workflow/docs/{shortRepo}/{slug}/EXPLORE-<slug>.md`(레거시: `.docs/<slug>/`, `docs/<slug>/`)를 작성한다.
4. 코드를 수정하거나 커밋·푸시하지 않는다.
5. xAI/agy 쿼터 부족은 에이전트 `model` 설정이 처리한다. 지정 모델이 실패하면 그 사실을 보고한다.
6. 완료 후 탐색 결과 핵심을 한국어로 요약하고, 이어서 `/matt-pocock-atomic-plan`을 실행할 수 있도록 안내한다.

의도: 현재 대화의 요청(슬래시 뒤에 붙인 텍스트가 있으면 그것을 우선한다)

한국어로 요약한다.

---

## Cursor 메모

- 위임은 Task 툴(`/에이전트명` 또는 "Use the ... subagent ...")로 수행한다. Pi의 `subagent` 호출과 동등하다.
- 단계별 모델은 `.cursor/agents/<에이전트>.md`의 `model` frontmatter로 지정한다(Pi의 `settings.json` `agentOverrides` 대신).
- 슬래시 뒤에 붙인 텍스트는 위 본문의 인자 자리에 들어간다.

