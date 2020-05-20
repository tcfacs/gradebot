import axios from 'axios';

const httpClient = axios.create();

httpClient.getChallenge = function (
  sessionId = 'bad87fee1348bd9aedc08826', // 2 2P/F Test  bounce & shake  *** DEFAULT TEST ***
) {
  return this({ method: 'get', url: `/lti/getstate/${sessionId}` });
};

httpClient.testCode = function (data) {
  return this({ method: 'post', url: `/lti/checkanswer`, data });
};

httpClient.grade = function (body, sessionId) {
  return this({
    method: 'post',
    url: `/lti/grade/${sessionId}`,
    data: body,
  });
};

export default httpClient;
