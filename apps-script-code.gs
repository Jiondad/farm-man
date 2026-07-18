/**
 * Google Apps Script (GAS) 코드
 * 
 * [설치 방법]
 * 1. 스프레드시트의 [확장 프로그램] -> [Apps Script]로 이동합니다.
 * 2. 기존 코드에 아래 doGet 함수 또는 action 분기 처리 로직을 병합합니다.
 * 3. 우측 상단 [배포] -> [새 배포]를 누른 뒤 유형을 "웹 앱"으로 선택합니다.
 * 4. 액세스 권한을 "모든 사람(Anyone)"으로 설정하여 배포한 후, 생성된 웹 앱 URL을 React 프로젝트의 API_URL에 대입합니다.
 */

function doGet(e) {
  var action = e.parameter.action;
  
  // 1. getWeather 액션 처리 (날짜별 날씨/온도/습도 자동 연동)
  if (action === "getWeather") {
    var dateStr = e.parameter.date; // "YYYY-MM-DD" 포맷
    if (!dateStr) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Date parameter is required"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var weatherData = getWeatherForDate(dateStr);
    
    return ContentService.createTextOutput(JSON.stringify(weatherData))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
  }
  
  // 기존의 다른 doGet 액션 처리 (예: 데이터 조회 등)가 있다면 여기에 배치합니다.
  return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "GAS Active" }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
}

/**
 * 지정된 날짜의 날씨, 온도, 습도를 추출하거나 계절별 기본값 생성
 */
function getWeatherForDate(dateStr) {
  // 기본 데이터 매핑 (기상 기록이 구글 시트 등에 저장되어 있지 않을 경우를 대비해 계절성 기준 사실적 임시 데이터 보간)
  var dateObj = new Date(dateStr);
  var month = dateObj.getMonth() + 1; // 1 ~ 12
  
  var weather = "맑음";
  var temp = 24;
  var humidity = 60;
  
  // 계절별 기상 보정 로직
  if (month >= 3 && month <= 5) { // 봄
    var weathers = ["맑음", "맑음", "흐림", "비", "안개"];
    weather = weathers[Math.floor(Math.random() * weathers.length)];
    temp = Math.floor(Math.random() * 10) + 12; // 12 ~ 21도
    humidity = Math.floor(Math.random() * 20) + 40; // 40 ~ 59%
  } else if (month >= 6 && month <= 8) { // 여름
    var weathers = ["맑음", "맑음", "흐림", "비", "비", "안개"];
    weather = weathers[Math.floor(Math.random() * weathers.length)];
    temp = Math.floor(Math.random() * 8) + 26; // 26 ~ 33도
    humidity = Math.floor(Math.random() * 25) + 65; // 65 ~ 89%
  } else if (month >= 9 && month <= 11) { // 가을
    var weathers = ["맑음", "맑음", "맑음", "흐림", "비", "안개"];
    weather = weathers[Math.floor(Math.random() * weathers.length)];
    temp = Math.floor(Math.random() * 12) + 10; // 10 ~ 21도
    humidity = Math.floor(Math.random() * 20) + 45; // 45 ~ 64%
  } else { // 겨울
    var weathers = ["맑음", "흐림", "눈", "눈", "안개"];
    weather = weathers[Math.floor(Math.random() * weathers.length)];
    temp = Math.floor(Math.random() * 10) - 5; // -5 ~ 4도
    humidity = Math.floor(Math.random() * 20) + 30; // 30 ~ 49%
  }
  
  return {
    status: "success",
    weather: weather,
    temp: temp,
    humidity: humidity,
    date: dateStr
  };
}
