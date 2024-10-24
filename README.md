# GaonSoft Web Serial Provider Lib v1.7
- Created date: 2023-07-04
- Description : 데모 참조
- serial 통신을 통해 받는 데이터 양식/포맷/형태에 따라 모듈 로직 수정될 수 있음
- **Web Serial API를 사용하기위해선 SSL 인증서(https)가 정상적으로 적용되어있어야 사용할 수 있음**

## 실행 방법 1
### HTML 파일을 열어 실행
1. 파일을 다운로드 (.zip 또는 git clone)
2. html 폴더 > frame.html 실행
- Chrome 또는 Edge 브라우저로 실행
- Web Serial API를 제공하는 브라우저
<img src="/img/bbb.png">

## 실행 방법 2
### for VSCode (Visual Studio Code)
1. 프로젝트를 다운받고 싶은 경로에서 git clone으로 다운로드
```
git clone https://github.com/rogerthat2578/WebSerilProviderLib.git
```
2. 해당 프로젝트 open
- Folder open으로 해당 폴더 open
3. 해당 프로젝트의 터미널에서 node 설치
- node가 설치되어있어야함.
```
npm install
```
4. web server 실행
```
node nodeWebServer.js
```
5. 브라우저 주소창에
```
localhost:3000/frame.html
또는
localhost:3000/frame
```
**frame -> test**
<br>

## Update Note
```
GaonSoft Web Serail Provider Lib v1.7
date        : 2023-07-04
modify      : 2023-07-05
Description : 데모 참조
bugfix_1.0  : port read stream 을 라인 단위로 잘라 callback 으로 넘겨 줘야하는데 불특정하게 
              stream flush 가 일어나 라인을 구분하기 위해 사용자가 입력해주는 splitChar 추가
update_1.1  : splitChar 추가시 옵션형으로 removeSplitChar 넣으면 splitChar를 자동으로 제거
update_1.2  : debug 활성화시 buffer 내용도 함께 출력
update_1.3  : 재연결 프로세스를 디바이스가 연결 끊기는 시점이 아니라 연결이 끊기고 다시 연결된 시점부터 재연결 시도
update_1.4  : 디버그 비활성화시 텍스트 디코딩 로그의 성능저하를 막기위해 콜백 지원으로 변경
bugfix_1.5  : DisConnection 함수 호출시 연결이 되어있지 않은 상태의 null 체크를 하지 않아 오류 수정
bugfix_1.6  : 한번도 연결되지 않은 상황에서 재연결 시도 로직 제거
              Serial 포트 설정을 개발자가 잘못 설정했을시 콘솔에 에러 표시 및 에러 errorMessage 콜백 추가
              포트 설정 변경에대한 ConfigSerial 함수 추가
              removeSplitChar 삭제 옵션 버그 수정
```

<br>

## K-Studio (화면)
### 필요한 컴포넌트(=Control(s) in k-studio)
- K-System에 적용할 js파일 : applyToKSystem.js
- 버튼 3개, 텍스트 박스 1개
> 버튼 : 포트 연결 버튼, 포트 변경 버튼, 포트 닫기 버튼
> 텍스트 박스 : 시리얼 통신으로 받은 문자 바인딩
<img src="/img/k-studio_view_v2.png">
<img src="/img/k-studio_controls_v3.png">

### K-System ACE를 사용중인 "엔켐"에 적용
- SSL 인증서(https)가 정상적으로 적용되어있는 사이트
- 바코드 스캔 테스트 (시리얼 통신)
<img src="/img/ksystem_ace_en_menu_1.png">
<img src="/img/ksystem_ace_en_FrmWebSerialTest_unl_1.png">
<img src="/img/ksystem_ace_en_FrmWebSerialTest_unl_2.png">
<img src="/img/ksystem_ace_en_FrmWebSerialTest_unl_3.png">
