import axios from 'axios';

const httpClient = axios.create();

httpClient.getChallenge = function(
  // sessionId = 'bad87fee1348bd9bedc08826', // 2 Test 1P/1F test empty ready function 1P 1F  (**Check Assert**)
  // sessionId = 'bad87fee1348bd9acdd08826', // 3 3P/F Test -- add a script & document.ready tag 3P 0F
  // sessionId = 'bad87fee1348bd9aed708826', // 2 Test 1P/F -- remove an element  (**Check Assert**) #960 Fixed/wmj-5-10-20
  // sessionId = '5a61d23e84acdd9e42575aa3', // Blank jQuery intro page
  sessionId = 'bad87fee1348bd9aedc08826', // 2 2P/F Test  bounce & shake  *** DEFAULT TEST *** 
  
  // sessionId = '',  //  T Test P/F Target 
  // sessionId = '',  //  T Test P/F Target 
  // sessionId = 'bad87fee1348bd9aed608826',  //  3 T Test 3P/F Target Use appendTo to move elements
  // // sessionId = 'bad87fee1348bd9aed508826',  //  3 Test 3P/F Clone an Element
  // sessionId = 'bad87fee1348bd9aed308826', //  3  Test 3P/1F Target the parent of an element using jQuery (**Check Assert**)
  // sessionId = 'bad87fee1348bd9aed208826', // 3 Test 3P/F Target the children of a jQuery element  change rgb(255, 165, 0) to orange
  // sessionId = 'bad87fee1348bd9aed108826', //  4 Test 4P/F Use jQuery to modify the entire page 
  // sessionId = 'bad87fee1348bd9aed008826', // 3 Test 3P/F Target Even Elements  3P 0F

  // *** Drop this test *** or SUPER Hack it
  // sessionId = 'bad87fee1348bd9aecb08826', // 2 Test  Use jQuery to modify the entire page Need to Add <body></body> tag to wrap test
  
  //         Non-jQuery Test Below Cause Server Failure

  // sessionId = 'bd7158d2c442eddfbeb5bd1f', // JavaScript Unable to find assignments
  // sessionId = '56533eb9ac21ba0edf2244b3', // JavaScript Unable to find assignments
  // sessionId = 'bad87fee1348bd9aec908854', //  Bootstrap Unable to find assignments 3P/0F

) {
  return this({ method: 'get', url: `/lti/getstate/${sessionId}` });
};

httpClient.testCode = function(data) {
  return this({ method: 'post', url: `/lti/checkanswer`, data });
};

httpClient.grade = function(body, sessionId) {
  return this({
    method: 'post',
    url: `/lti/grade/${sessionId}`,
    data: body,
  });
};

export default httpClient;
