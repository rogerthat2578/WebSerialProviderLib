/*!
 * GaonSoft Web Serail Provider Lib v1.7
 * date        : 2023-07-04
 * modify      : 2023-07-05
 * Description : 데모 참조
 * bugfix_1.0  : port read stream 을 라인 단위로 잘라 callback 으로 넘겨 줘야하는데 불특정하게 
 *              stream flush 가 일어나 라인을 구분하기 위해 사용자가 입력해주는 splitChar 추가
 * update_1.1  : splitChar 추가시 옵션형으로 removeSplitChar 넣으면 splitChar를 자동으로 제거
 * update_1.2  : debug 활성화시 buffer 내용도 함께 출력
 * update_1.3  : 재연결 프로세스를 디바이스가 연결 끊기는 시점이 아니라 연결이 끊기고 다시 연결된 시점부터 재연결 시도
 * update_1.4  : 디버그 비활성화시 텍스트 디코딩 로그의 성능저하를 막기위해 콜백 지원으로 변경
 * bugfix_1.5  : DisConnection 함수 호출시 연결이 되어있지 않은 상태의 null 체크를 하지 않아 오류 수정
 * bugfix_1.6  : 한번도 연결되지 않은 상황에서 재연결 시도 로직 제거
 *               Serial 포트 설정을 개발자가 잘못 설정했을시 콘솔에 에러 표시 및 에러 errorMessage 콜백 추가
 *               포트 설정 변경에대한 ConfigSerial 함수 추가
*                removeSplitChar 삭제 옵션 버그 수정
 */
class SerialProvider {
    constructor(options) {
        let that = this, 
            _keepReading = false,
            _reConnecting = false, 
            _port, 
            _portInfo, 
            _reader, 
            _closedPromise, 
            _splitChar,
            _buffer = [], 
            _triggers = {};

        let setSplitChar = () => {
            _splitChar = options.splitChar;
            if (_splitChar) 
                if (typeof _splitChar == "string")
                    _splitChar = new TextEncoder().encode(_splitChar);    
                else if(typeof _splitChar == "number")
                    _splitChar = [_splitChar];
        };

        this.on = (event, callback) => {
            if (!_triggers[event])
                _triggers[event] = [];
            _triggers[event].push(callback);

            return this;
        };

        let _triggerHandler = (event, params) => {
            if (_triggers[event]) 
                for (let i in _triggers[event])
                    _triggers[event][i](params);

            options[event]?.(params);
        };

        const reConnecting = () => {
            if (_keepReading && !_reConnecting) {
                _reConnecting = true;
                setTimeout(() => {
                    _log("SerialProvider:reconnecting...");
                    that.Connection();
                    _reConnecting = false;
                }, options.reconnect_interval || 3000);
            }
        };

        const readedStream = () => {
            let arr = new Uint8Array(_buffer);

            _triggerHandler("readedStream", { 
                text: options.removeSplitChar ? new TextDecoder().decode(arr).replaceAll(options.splitChar, '') : new TextDecoder().decode(arr), 
                buffer: arr 
            });
            while (_buffer.length > 0) _buffer.pop();
        };

        const readUntilClosed = async () => {
            while (_port.readable && _keepReading) {
                _reader = _port.readable.getReader();
                try {
                    while (_keepReading) {
                        const { value, done } = await _reader.read();

                        if (done) break;
                        
                        value.forEach(x => _buffer.push(x));
                        _log(() => `SerialProvider:push buffer : ${new TextDecoder().decode(new Uint8Array(_buffer))}`);

                        if (_splitChar) {
                            /* bugfix_1.0: port read stream 을 라인 단위로 잘라 callback 으로 넘겨 줘야하는데 불특정하게 
                                stream flush 가 일어나 라인을 구분하기 위해 사용자가 입력해주는 splitChar 추가 */    
                            if (_splitChar.every(x => _buffer.includes(x))) {
                                readedStream(_buffer);
                                _log("SerialProvider:read end");
                            }
                        } else {
                            readedStream(_buffer);
                            _log("SerialProvider:read end");
                        }
                    }
                } catch (error) {
                    _error(error);
                } finally {
                    _reader.releaseLock();
                    _log("SerialProvider:releaseLock");
                }
            }

            await _port.close();
            _log("SerialProvider:port close");
        };

        this.ConfigSerial = async (config) => {
            if (config.debug != undefined && options.debug != config.debug){
                options.debug = config.debug;
            }
            options.baudRate = config?.baudRate || options.baudRate;
            options.dataBits = config?.dataBits || options.dataBits;
            options.stopBits = config?.stopBits || options.stopBits;
            options.parity = config?.parity || options.parity;
            options.flowControl = config?.flowControl || options.flowControl;
            if (config?.splitChar) {
                options.splitChar = config.splitChar;
                setSplitChar();
            }
            await this.DisConnection();

            this.Connection();

            options.reconnect_interval = config?.reconnect_interval || options.reconnect_interval;
            options.removeSplitChar = config?.removeSplitChar || options.removeSplitChar;

            while (_buffer.length > 0) _buffer.pop();
        };

        this.Connection = async () => {
            if (!("serial" in navigator))
                throw "not surported serial. check https";
            if (_closedPromise) //스트림을 읽는 중이면 연결 프로세스 중단
                return _closedPromise;

            try {
                if (!_port) //포트 연결 팝업 뛰우기
                    _port = await navigator.serial.requestPort({ filters: options.filter });

                try {
                    await _port.open({
                        baudRate: options.baudRate || 9600,
                        dataBits: options.dataBits || 8,
                        stopBits: options.stopBits || 1,
                        parity: options.parity || "none",
                        flowControl: options.flowControl || "none"
                    });
                } catch(error) {
                    _error(error);
                    return false;
                }

                _keepReading = true;

                _closedPromise = readUntilClosed();

                _portInfo = _port.getInfo();

                _triggerHandler("connected", _portInfo);

                _log("SerialProvider:connected");

                return _closedPromise;
            } catch (error) {
                _port = _reader = _closedPromise = null;

                reConnecting();

                _log("SerialProvider:requestPort faild!!");
            }
        };

        this.DisConnection = async () => {
            _keepReading = false;

            _reader?.cancel();

            if (!_closedPromise) 
                return;

            await _closedPromise;

            _reader = _closedPromise = null;

            _log("SerialProvider:disconneted");

            _triggerHandler("disconneted");
        };

        let _error = (msg) => {
            console.error(msg);
            _triggerHandler("errorMessage", msg);
        };

        let _log = (dynamic) => {
            if (options.debug)
                console.log(typeof dynamic == "string" ? dynamic : dynamic());
        };

        navigator.serial?.addEventListener("connect", (event) => {
            // TODO: Automatically open event.target or warn user a port is available.
            // TODO: 자동으로 event.target을 열거나 사용자에게 포트가 사용 가능하다고 경고한다.
            _port = event.target;

            reConnecting();
        });

        navigator.serial?.addEventListener("disconnect", (event) => {
            // TODO: UI에서 |event.target|을 제거한다
            // 시리얼 포트가 열려있으면 스트림 에러도 관찰된다.
            _port = _reader = _closedPromise = null;

            _triggerHandler("disconneted");
        });

        setSplitChar();
    };
};
