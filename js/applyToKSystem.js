(() => {
	///*!
	// * GaonSoft Web Serail Provider Lib v1.7
	// * date        : 2023-07-04
	// * modify      : 2023-07-05
	// * Description : 데모 참조
	// * bugfix_1.0  : port read stream 을 라인 단위로 잘라 callback 으로 넘겨 줘야하는데 불특정하게 
	// *              stream flush 가 일어나 라인을 구분하기 위해 사용자가 입력해주는 splitChar 추가
	// * update_1.1  : splitChar 추가시 옵션형으로 removeSplitChar 넣으면 splitChar를 자동으로 제거
	// * update_1.2  : debug 활성화시 buffer 내용도 함께 출력
	// * update_1.3  : 재연결 프로세스를 디바이스가 연결 끊기는 시점이 아니라 연결이 끊기고 다시 연결된 시점부터 재연결 시도
	// * update_1.4  : 디버그 비활성화시 텍스트 디코딩 로그의 성능저하를 막기위해 콜백 지원으로 변경
	// * bugfix_1.5  : DisConnection 함수 호출시 연결이 되어있지 않은 상태의 null 체크를 하지 않아 오류 수정
	// * bugfix_1.6  : 한번도 연결되지 않은 상황에서 재연결 시도 로직 제거
	// *               Serial 포트 설정을 개발자가 잘못 설정했을시 콘솔에 에러 표시 및 에러 errorMessage 콜백 추가
	// *               포트 설정 변경에대한 ConfigSerial 함수 추가
	// *               removeSplitChar 삭제 옵션 버그 수정
	// */
	class SerialProvider{constructor(e){let t=this,r=!1,i=!1,a,o,n,l,s,d=[],c={},p=()=>{(s=e.splitChar)&&("string"==typeof s?s=new TextEncoder().encode(s):"number"==typeof s&&(s=[s]))};this.on=(e,t)=>(c[e]||(c[e]=[]),c[e].push(t),this);let h=(t,r)=>{if(c[t])for(let i in c[t])c[t][i](r);e[t]?.(r)},f=()=>{r&&!i&&(i=!0,setTimeout(()=>{w("SerialProvider:reconnecting..."),t.Connection(),i=!1},e.reconnect_interval||3e3))},u=()=>{let t=new Uint8Array(d);for(h("readedStream",{text:e.removeSplitChar?new TextDecoder().decode(t).replaceAll(e.splitChar,""):new TextDecoder().decode(t),buffer:t});d.length>0;)d.pop()},v=async()=>{for(;a.readable&&r;){n=a.readable.getReader();try{for(;r;){let{value:e,done:t}=await n.read();if(t)break;e.forEach(e=>d.push(e)),w(()=>`SerialProvider:push buffer : ${new TextDecoder().decode(new Uint8Array(d))}`),s?s.every(e=>d.includes(e))&&(u(d),w("SerialProvider:read end")):(u(d),w("SerialProvider:read end"))}}catch(i){C(i)}finally{n.releaseLock(),w("SerialProvider:releaseLock")}}await a.close(),w("SerialProvider:port close")};this.ConfigSerial=async t=>{for(void 0!=t.debug&&e.debug!=t.debug&&(e.debug=t.debug),e.baudRate=t?.baudRate||e.baudRate,e.dataBits=t?.dataBits||e.dataBits,e.stopBits=t?.stopBits||e.stopBits,e.parity=t?.parity||e.parity,e.flowControl=t?.flowControl||e.flowControl,t?.splitChar&&(e.splitChar=t.splitChar,p()),await this.DisConnection(),this.Connection(),e.reconnect_interval=t?.reconnect_interval||e.reconnect_interval,e.removeSplitChar=t?.removeSplitChar||e.removeSplitChar;d.length>0;)d.pop()},this.Connection=async()=>{if(!("serial"in navigator))throw"not surported serial. check https";if(l)return l;try{a||(a=await navigator.serial.requestPort({filters:e.filter}));try{await a.open({baudRate:e.baudRate||9600,dataBits:e.dataBits||8,stopBits:e.stopBits||1,parity:e.parity||"none",flowControl:e.flowControl||"none"})}catch(t){return C(t),!1}return r=!0,l=v(),o=a.getInfo(),h("connected",o),w("SerialProvider:connected"),l}catch(i){a=n=l=null,f(),w("SerialProvider:requestPort faild!!")}},this.DisConnection=async()=>{r=!1,n?.cancel(),l&&(await l,n=l=null,w("SerialProvider:disconneted"),h("disconneted"))};let C=e=>{console.error(e),h("errorMessage",e)},w=t=>{e.debug&&console.log("string"==typeof t?t:t())};navigator.serial?.addEventListener("connect",e=>{a=e.target,f()}),navigator.serial?.addEventListener("disconnect",e=>{a=n=l=null,h("disconneted")}),p()}}

	///**
	// * Set Web Serial API Options
	// * 변수 {boolean} debug : 메세지 로그 활성화(optional). ex) debug: false
	// * 변수 {int} baudRate : 비트 레이트(필수). ex) baudRate: 9600
	// * 변수 {int} dataBits : 데이터 비트(optional). ex) dataBits: 8
	// * 변수 {int} stopBits : 스탑 비트(optional). ex) stopBits: 1
	// * 변수 {string} parity : 패리티 비트(optional). ex) parity: "none"
	// * 변수 {string} flowControl : 흐름 제어(optional). ex) flowControl: "none"
	// * 변수 {int} reconnect_interval : 연결이후 끊긴다면 자동 재연결 시간(ms:optional). ex) reconnect_interval: 3000
	// * 변수 {string} splitChar : 한줄을 구분하기 위한 구분자. ex) splitChar: "\r"
	// * 변수 {boolean} removeSplitChar : 구분자 제거 여부. ex) removeSplitChar: true
	// * 변수 {array<object>} filter : 장비 필터. 특정 장치만 찾을 수 있도록함. {ProductId, VendorId} 필요. "connected" 함수에서 portinfo 정보 (optional). ex) filter: [{ usbProductId: 0x2303, usbVendorId: 0x67b }]
	// * 함수 connected : 연결 함수 호출 이후 연결이 되면 발생(재연결 되도 발생)
	// * 함수 disconneted : 닫기 함수 호출 이후 정상 적으로 닫이면 발생
	// * 함수 readedStream : 스트림에서 읽음 세션 끝이나면 발생 { text : string, buffer : Uint8Array }
	// */
	const serialOption = {
		connected: (portinfo) => {
			console.log("connected", portinfo);
		},
		disconneted: () => {
			console.log("disconneted");
		},
		readedStream: (stream) => {
			console.log('stream', stream);
            ///**
            // * K-Studio "Control(s)"의 "명칭" 속성 값 넣기
            // * 텍스트 박스 컨트롤러는 div, label, span, input, a 5개의 엘리먼트를 가지기에 id로 가져올때 데이터를 넣어줄 엘리먼트를 명시해줘야함. ex) $('input[id^="TestInputBox"]') <- input
            // */
			if ($('input[id^="TestInputBox"]').length > 0) {
				// 엘리먼트에 데이터 넣기
				$('input[id^="TestInputBox"]').val(stream.text);
			}
		}
	}

	// 시리얼 객체
	let serialPort = null;

	// test
	const companySeq = 1, languageSeq = 1, userId = '', strYYYYMM = '202307';

	// /**
	//  * K-System API 사용
	//  *  - SP 호출 방식
	//  * 사용자코드로부터 설정값 받아오기
	//  */
	$.support.cors = true;
	let reqData = {
		"ROOT": {
			"certId": "EN_API_ID",
			"certKey": "EN_API_KEY",
			// "dsn": "en_bis",
			"dsnOper": "en_oper",
			"dsnBis": "en_bis",
			"companySeq": `${companySeq}`,
			"languageSeq": `${languageSeq}`,
			"securityType": "1",
			"userId": `${userId}`,
			"data": {
				"ROOT": {
					"DataBlock1": [{
						"TestData": `${strYYYYMM}`,
					}]
				}
			}
		}
	};

	try {
		$.ajax({
			type: "POST",
			contentType: "application/json;charset=utf-8",
			async: false,
			// url: "https://erp.enchem.net/Angkor.Ylw.Common.HttpExecute/RestOutsideService.svc/OpenApi/IsStoredProcedure/OrgDeptQuery", // K-System API - SP 호출
			url: "https://erp.enchem.net/Angkor.Ylw.Common.HttpExecute/RestOutsideService.svc/OpenApi/Genuine.enModuleName.BisEmpInPDA_en/EmpID", // K-System API - Service 호출. 로컬 테스트 시
			// url: "/Angkor.Ylw.Common.HttpExecute/RestOutsideService.svc/OpenApi/Genuine.enModuleName.BisEmpInPDA_en/EmpID", // K-System API - Service 호출. 실서버 반영 시
			data: JSON.stringify(reqData),
			dataType:  "json",
			success: function (result, textStatus) {
				// console.log("success textStatus", textStatus);
				// console.log("success result", result);
				
				if (textStatus == 'success' && !result?.ErrorMessage) {
					// 설정값 받아오기 성공

					// 설정값 옵션에 세팅

					///**
					// * 아래와 같이 변경할 옵션 세팅
					// * serialOption 객체 선언 부분 위에 있는 주석 중 "변수" 부분을 추가할 수 있음
					// */
					serialOption.debug = false;
					serialOption.reconnect_interval = 2000;
					serialOption.splitChar = "\r";

					// 생성
					serialPort = new SerialProvider(serialOption);
				} else {
					alert('설정값을 받아오는데 실패했습니다.');
				}
			},
			error: function (result, textStatus, err) {
				console.log("error result", result);
				console.log("error textStatus", textStatus);
				console.log("error err", err);
			}
		});
	} catch (e) {
		alert(e);
	}

	///**
	// * 연결 버튼 클릭 이벤트 등록
    // * 버튼 컨트롤러는 div, button 2개의 엘리먼트를 가지기에 id로 가져올때 button이라고 명시할 필요는 없음. ex) $('[id^="TestInputBox"]') 또는 $('button[id^="TestInputBox"]')
	// */
	if ($('button[id^="TestButton1"]').length > 0) {
		$('button[id^="TestButton1"]').eq($('button[id^="TestButton1"]').length - 1).on('click', () => {
			// 연결 자동화 안됨(사용자에 의한 제스처로 활성화 가능)
			try {
				serialPort.Connection();
			} catch(error) {
				alert(error)
			}
		});
	}

	///**
	// * 연결 변경 버튼 클릭 이벤트 등록 (Serial 포트 설정)
    // * 버튼 컨트롤러는 div, button 2개의 엘리먼트를 가지기에 id로 가져올때 button이라고 명시할 필요는 없음. ex) $('[id^="TestInputBox"]') 또는 $('button[id^="TestInputBox"]')
	// */
	if ($('button[id^="TestButton2"]').length > 0) {
		$('button[id^="TestButton2"]').eq($('button[id^="TestButton2"]').length - 1).on('click', () => {
			serialPort.ConfigSerial({
                dataBits: 8,
                splitChar: "\r"
            }); 
		});
	}

	///**
	// * 연결 종료 버튼 클릭 이벤트 등록
    // * 버튼 컨트롤러는 div, button 2개의 엘리먼트를 가지기에 id로 가져올때 button이라고 명시할 필요는 없음. ex) $('[id^="TestInputBox"]') 또는 $('button[id^="TestInputBox"]')
	// */
	if ($('button[id^="TestButton3"]').length > 0) {
		$('button[id^="TestButton3"]').eq($('button[id^="TestButton3"]').length - 1).on('click', () => {
			serialPort.DisConnection();
		});
	}
})();