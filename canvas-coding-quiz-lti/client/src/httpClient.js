import axios from 'axios'

const httpClient = axios.create()

httpClient.getChallenge = function(sessionId) {
	return this({ method: 'get', url: `/lti/getstate/${sessionId}`})
}

httpClient.testCode = function(data) {
  return this({method: 'post', url:`/lti/checkanswer`, data})
}

httpClient.grade = function(body, sessionId) {
  return this({method:'post', url:`/lti/grade/${sessionId}`, data:body})
}

export default httpClient
