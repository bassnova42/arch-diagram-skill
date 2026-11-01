<p align="center">
  <a href="../README.md">简体中文</a> · <a href="README.en.md">English</a> · <a href="README.es.md">Español</a> · <a href="README.ja.md">日本語</a> · <b>한국어</b> · <a href="README.th.md">ไทย</a>
</p>

# RokoAI arch-diagram 아키텍처 다이어그램 Skill

**Claude Code**와 **Codex**에서 사용할 수 있습니다.

GitHub 저장소, 기술 글, PDF, 로컬 프로젝트를 주면 Claude Code나 Codex가 구조를 파악해 아키텍처 다이어그램을 그립니다. 기본은 어두운 "터미널 설계도" 스타일이며, 다른 7가지 스타일도 고를 수 있습니다([스타일](#스타일)). 연결선 위로 패킷이 흐르고, 모듈끼리 데이터를 주고받을 때마다 하단 로그에 한 줄씩 실시간으로 추가됩니다.

**아래는 오픈소스 프로젝트 [morluto/rea](https://github.com/morluto/rea)의 아키텍처 다이어그램으로, 이 Skill이 GitHub 저장소를 읽고 자동으로 생성했습니다:**

![morluto/rea 아키텍처 다이어그램](examples/rea.gif)

다른 예시(글, GitHub 저장소, 요구사항 문서)는 맨 아래 [예시](#예시)에 있습니다.

## 주요 기능

- **내용에 맞춘 구조**: 계층형 시스템, 파이프라인, 반복이 있는 프로세스, 허브 앤 스포크, 스윔레인, 계층 트리. 고정 템플릿을 쓰지 않습니다.
- **의미 있는 색 구분**: 박스는 종류별로 색을 입히고, 연결선은 흐름 유형(요청, 쓰기, 콜백, 비동기 등)에 따라 색과 실선/점선으로 구분합니다. 그룹 테두리는 포함 관계를 나타냅니다.
- **실시간 트레이스 로그**: 패킷이 연결선 끝에 닿으면 하단에 `시간 · 유형 · A → B · 설명` 한 줄이 추가됩니다.
- **자체 점검**: 헤드리스 Chrome으로 박스 겹침, 글자 넘침, 박스를 관통하는 선, 가려진 라벨을 찾아내고, 깔끔해질 때까지 Claude가 고칩니다.
- **8가지 스타일**: 나이트 터미널, 청사진, 제도 용지, 화이트보드 손그림, 볼드 브루탈, 형광 CRT, 소프트 카드, 아이소 샌드박스. 한마디로 바꿀 수 있습니다.
- **다양한 출력 형식**:
  - 인터랙티브 단일 HTML 파일
  - PNG (2배 해상도)
  - MP4: 기본 20초, 원하는 길이로 지정 가능, 4초 주기로 끊김 없이 반복
  - GIF: 한 주기
  - Mermaid 플로차트

## 다이어그램 언어는 프롬프트 언어를 따릅니다

요청한 언어로 다이어그램이 작성됩니다:

- **한국어**로 프롬프트를 쓰면 다이어그램 전체가 한국어
- **영어**로 쓰면 영어
- **중국어**로 쓰면 제목, 설명, 라벨, 로그가 모두 중국어
- **일본어**로 쓰면 모든 내용이 일본어

원문 글이나 소스 코드가 다른 언어여도 마찬가지입니다. 코드 식별자, 경로, 명령어는 그대로 둡니다. 범례와 상태 라벨 같은 UI 문구는 중국어·영어·일본어·한국어·스페인어·태국어가 내장되어 있고, 그 밖의 언어는 Claude가 해당 언어로 작성합니다.

## 설치

Node 18 이상과 Chrome, Chromium 또는 Edge가 필요합니다. 동영상과 GIF를 출력하려면 `ffmpeg`도 필요합니다(`brew install ffmpeg`).

**방법 1: npm** (가장 간단)

```bash
npx @rokoai/arch-diagram install
```

`~/.claude/skills/arch-diagram`에 설치됩니다. `--project`를 붙이면 현재 프로젝트의 `.claude/skills/`에 설치됩니다. 업데이트하려면 다시 실행하고, 삭제는 `npx @rokoai/arch-diagram uninstall`입니다.

Codex가 설치되어 있으면(`~/.codex`가 있으면) `~/.codex/skills/arch-diagram`에도 함께 설치됩니다. 한쪽에만 설치하려면 `--claude` 또는 `--codex`를 붙이세요.

> 이 저장소를 clone한 폴더 안에서 `npx @rokoai/arch-diagram …`를 실행하면 `arch-diagram: command not found` 오류가 납니다. npm이 현재 폴더를 이 패키지 자체로 보고 명령을 PATH에 추가하지 않기 때문입니다. 저장소 밖에서 실행하거나, clone 안에서는 `node bin/cli.mjs install`을 사용하세요(`--codex` 등 옵션은 같습니다).

**방법 2: 플러그인**. Claude Code에서는 다음을 실행합니다:

```
/plugin marketplace add bassnova42/arch-diagram-skill
/plugin install arch-diagram@arch-diagram
```

Codex CLI에서는:

```bash
codex plugin marketplace add bassnova42/arch-diagram-skill
codex plugin add arch-diagram@arch-diagram
```

**방법 3: 직접 복사**

```bash
git clone https://github.com/bassnova42/arch-diagram-skill
cp -R arch-diagram-skill/skills/arch-diagram ~/.claude/skills/
cp -R arch-diagram-skill/skills/arch-diagram ~/.codex/skills/   # Codex
```

설치 후 Claude Code 또는 Codex를 다시 시작하세요.

## 사용법

Claude Code나 Codex에서 바로 요청하면 됩니다. 예:

- `https://github.com/plausible/analytics 아키텍처 다이어그램 그려 줘`
- `이 글을 플로차트로 만들어 줘: <URL>, 30초 동영상으로 출력`
- `방금 그림을 이미지로 출력해 줘` / `mermaid로 출력해 줘`
- Skill을 명시적으로 호출하려면: Claude Code에서는 `/arch-diagram <URL>`, Codex에서는 `$arch-diagram <URL>`

다이어그램의 원본은 `<slug>.spec.json`입니다. 수정하려면 Claude Code나 Codex에게 spec을 고쳐서 다시 생성해 달라고 하면 됩니다. 명령줄에서 직접 다룰 수도 있습니다:

```bash
npx @rokoai/arch-diagram build  my.spec.json my.html
npx @rokoai/arch-diagram check  my.html
npx @rokoai/arch-diagram export my.html my.png my.mp4 --seconds 30
```

## 스타일

기본 스타일은 **나이트 터미널**(`terminal`)이고, 그 밖에 7가지 스타일이 있습니다. 요청할 때 스타일만 말하면 됩니다. 예: `블루프린트 스타일로 그려줘`, `화이트보드 손그림으로`, `3D 아이소메트릭으로 바꿔줘`. 말하지 않으면 기본 스타일로 그립니다.

- **겉모습만 바뀝니다**: 같은 spec이 모든 스타일로 그려집니다. 구조, 텍스트, 좌표는 그대로이고 자체 점검도 같습니다. 기존 다이어그램도 "소프트 카드 스타일로 바꿔줘" 한마디면 다시 그립니다.
- **색의 의미는 그대로**: 스타일마다 배색은 다르지만 파랑, 청록, 초록, 호박, 보라가 가리키는 요소 종류는 같아서 범례를 그대로 읽을 수 있습니다.
- **모든 출력 지원**: HTML, PNG, MP4, GIF는 어떤 스타일로든 내보낼 수 있습니다(Mermaid는 Mermaid가 직접 배치하므로 스타일이 없습니다).

같은 다이어그램(Elephant-Goldfish 예시)을 8가지 스타일로 나란히 본 모습:

| | |
|---|---|
| <img src="themes/terminal.jpg" width="420"><br>**나이트 터미널(기본)** · `terminal` | <img src="themes/blueprint.jpg" width="420"><br>**청사진** · `blueprint` |
| <img src="themes/drafting.jpg" width="420"><br>**제도 용지** · `drafting` | <img src="themes/whiteboard.jpg" width="420"><br>**화이트보드 손그림** · `whiteboard` |
| <img src="themes/brutalism.jpg" width="420"><br>**볼드 브루탈** · `brutalism` | <img src="themes/crt.jpg" width="420"><br>**형광 CRT** · `crt` |
| <img src="themes/saas.jpg" width="420"><br>**소프트 카드** · `saas` | <img src="themes/isometric.jpg" width="420"><br>**아이소 샌드박스** · `isometric` |

명령줄에서는 `--theme`을 쓰거나 spec에 `"theme": "blueprint"`를 넣습니다:

```bash
npx @rokoai/arch-diagram build my.spec.json my.html --theme whiteboard
```

아래는 새로 추가된 7가지 스타일의 상세 설명입니다. 예시는 모두 [morluto/rea](https://github.com/morluto/rea) 다이어그램(이 페이지 맨 위와 같은 spec)입니다.

### 청사진 · `blueprint`

![청사진](themes/blueprint.gif)

- **모습**: 진한 파란 바탕에 흰 잉크 선, 20px / 100px 이중 격자, 이중선 도면 틀. 박스 네 모서리에 맞춤 십자, 연결선 라벨은 기울임꼴, 비동기 선은 긴 점선. 색은 옅은 톤으로 바뀌어 파란 바탕에서도 구분됩니다.
- **어울리는 곳**: 설계 리뷰, 기술 제안서, "설계도" 느낌이 필요한 자리.
- **요청 예**: `블루프린트 스타일로` · `청사진처럼`

[▶ 20초 영상(MP4)](themes/blueprint.mp4)

### 제도 용지 · `drafting`

![제도 용지](themes/drafting.gif)

- **모습**: 결이 보이는 미색 제도 용지에 세리프 글꼴과 진한 잉크, 이중선 도면 틀. 각 구성 요소 왼쪽 위에 번호 동그라미가 있어 번호 순서로 설명할 수 있습니다. 연결선 시작점에 점, 비동기 선은 일점쇄선.
- **어울리는 곳**: 인쇄, PDF 내보내기, 매뉴얼과 논문 그림, 번호 순서 설명.
- **요청 예**: `제도 도면 스타일로` · `기술 매뉴얼처럼`

[▶ 20초 영상(MP4)](themes/drafting.mp4)

### 화이트보드 손그림 · `whiteboard`

![화이트보드 손그림](themes/whiteboard.gif)

- **모습**: 흰 바탕에 마커로 그린 듯 살짝 흔들리는 선, 빗금으로 칠한 박스, 열린 화살촉, 제목 아래 형광펜 자국. 흔들림은 고정 시드라서 매번 같은 결과가 나오고 영상도 이음매 없이 반복됩니다.
- **어울리는 곳**: 브레인스토밍, 초기 설계 논의, 비개발자에게 설명, 블로그 삽화.
- **요청 예**: `손그림 스타일로` · `화이트보드처럼` · `스케치로`
- **참고**: 손글씨 글꼴(Nanum Pen Script, LXGW WenKai 등)이 설치되어 있으면 더 손으로 쓴 느낌이 납니다. 없으면 글자는 시스템 글꼴로 나오고 선은 그대로 손그림입니다.

[▶ 20초 영상(MP4)](themes/whiteboard.mp4)

### 볼드 브루탈 · `brutalism`

![볼드 브루탈](themes/brutalism.gif)

- **모습**: 크림색 바탕, 2px 검은 굵은 테두리와 6px 하드 섀도, 요소 색으로 꽉 채운 면, 아주 굵은 글자. 연결선은 굵고, 라벨은 흰 바탕에 검은 테두리 태그, 제목은 검은 블록 위.
- **어울리는 곳**: README 대표 이미지, SNS, 발표 슬라이드, 포스터처럼 첫눈에 시선을 끌어야 하는 곳.
- **요청 예**: `브루탈리즘 스타일로` · `눈에 띄게` · `포스터 느낌으로`

[▶ 20초 영상(MP4)](themes/brutalism.mp4)

### 형광 CRT · `crt`

![형광 CRT](themes/crt.gif)

- **모습**: 검은 녹색 브라운관. 글자와 선이 형광체처럼 빛나고, 박스는 이중선, 화면 전체에 주사선과 비네팅, 제목 앞에 `>` 프롬프트.
- **어울리는 곳**: 보안, 리버스 엔지니어링, 인프라 주제, 레트로 발표, 영상 썸네일.
- **요청 예**: `레트로 터미널로` · `CRT 스타일` · `형광 초록`

[▶ 20초 영상(MP4)](themes/crt.mp4)

### 소프트 카드 · `saas`

![소프트 카드](themes/saas.gif)

- **모습**: 밝은 점 격자 배경에 흰 둥근 카드, 위쪽에 요소 색의 얇은 띠, 부드러운 그림자. 연결선 모서리는 둥글고, 라벨은 알약 모양, 비동기 선은 점선.
- **어울리는 곳**: 제품 문서, 웹사이트, 외부 소개, 밝은 문서 사이트(Notion, Confluence 등).
- **요청 예**: `깔끔하고 밝게` · `제품 문서 스타일로` · `SaaS 스타일`

[▶ 20초 영상(MP4)](themes/saas.mp4)

### 아이소 샌드박스 · `isometric`

![아이소 샌드박스](themes/isometric.gif)

- **모습**: 배치와 자체 점검을 마친 다이어그램을 아이소메트릭 바닥 격자 위에 눕힙니다. 박스는 두께와 그림자가 있는 입체 블록이 되고, 제목·범례·로그는 똑바로 유지됩니다. 글자를 줄이는 대신 캔버스를 약 1.5배 넓힙니다.
- **어울리는 곳**: 표지, 홍보 이미지, 구성 요소가 적은 시스템 개요.
- **요청 예**: `3D 스타일로` · `아이소메트릭으로` · `입체적으로`
- **참고**: 글자도 바닥과 함께 기울어지므로 노드 12개 정도까지가 가장 좋습니다. 노드가 많으면 다른 스타일을 권합니다.

[▶ 20초 영상(MP4)](themes/isometric.mp4)

## 디렉터리 구성

```
skills/arch-diagram/
  SKILL.md            작업 흐름: 소스 읽기 → 구조 선택 → 배치 → 자체 점검 → 출력
  assets/             렌더링 엔진, 스타일, 템플릿. themes/에 스타일별 스타일시트
  scripts/            build / check / export
  references/         spec 필드 설명, 시각 스타일
  examples/           rea(저장소), plausible(저장소), elephant-goldfish(글)
bin/cli.mjs           npm 명령: install / uninstall / build / check / export
```

## 예시

### 1. 글로 만든 아키텍처 다이어그램

출처: Dave Rensin의 글 「Elephants, Goldfish, and the New Golden Age of Software Engineering」  
<https://drensin.medium.com/elephants-goldfish-and-the-new-golden-age-of-software-engineering-c33641a48874>

![글로 만든 아키텍처 다이어그램](examples/elephant-goldfish.gif)

[▶ 전체 영상 (MP4, 30초)](examples/elephant-goldfish.mp4)

### 2. GitHub 저장소로 만든 아키텍처 다이어그램

출처: <https://github.com/morluto/rea>

![GitHub 저장소로 만든 아키텍처 다이어그램](examples/rea.gif)

[▶ 전체 영상 (MP4, 20초)](examples/rea.mp4)

### 3. 요구사항 문서로 만든 아키텍처 다이어그램

출처: 발레 동작 채점 미니 프로그램 Ballet의 요구사항 문서(PRD)와 코드. 비공개 프로젝트라 공개 링크는 없습니다.

![요구사항 문서로 만든 아키텍처 다이어그램](examples/ballet.gif)

[▶ 전체 영상 (MP4, 20초)](examples/ballet.mp4)

## 라이선스

MIT
