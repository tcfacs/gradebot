import axios from 'axios'

const httpClient = axios.create()

httpClient.getChallenge = function() {
	return this({ method: 'get', url: '/get-state'})
}

httpClient.testCode = function(data, assignmentId) {
  console.log(assignmentId)
  return this({method: 'post', url:`/check-answer/${assignmentId}`, data})
}

httpClient.grade = function(body) {
  return this({method:'post', url:'/lti/grade', data:body})
}

export default httpClient
