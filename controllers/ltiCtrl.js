const lti = require('ims-lti');
const vm = require('vm');
const chai = require('chai');
const expect = require('chai').expect;
const assert = chai.assert;
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { getAssignment } = require('../helpers/freecodecamp');
const path = require('path');
const cheapsession = {};

let codeEval = (req, res, next) => {
  const data = req.body;
  const tests = data.tests;
  const evalOfTests = [];
  const isHTML = data.syntax === 'html';
  const code = isHTML ? `"${data.code}"` : data.code;
  const { window } = new JSDOM(
    `<html><body>${code}</body></html>`,
  ).window;
  const $ = require('jquery')(window);
  const document = window.document;
  const sandbox = { assert, expect, chai, document, $, code };
  vm.createContext(sandbox);
  tests.forEach((test) => {
    let fullTest = isHTML
      ? test
      : `${data.head} \n  \n ${code};; \n ${data.tail} \n ${test} `;
    try {
      vm.runInContext(fullTest, sandbox);
      evalOfTests.push(true);
    } catch (e) {
      console.log(e);
      evalOfTests.push(false);
    }
  });
  console.log(evalOfTests);
  return evalOfTests;
};

async function post(req, res) {
  /* TODO - fetch user's previous submission */
  const provider = new lti.Provider(
    process.env.CONSUMER_KEY,
    process.env.CONSUMER_SECRET,
  );
  provider.valid_request(req, async (err, isValid) => {
    if (err) {
      console.error('invalid request', err);
      res.send(
        err +
          '. check your consumer key and consumer secret (and nginx https proxy header)',
      );
    } else {
      console.log('provider good', provider);
      const assignmentId = req.query.assignmentid;
      let assignmnet;
      // if external tool is an assignment, then it will have outcome_service_url
      if (assignmentId) {
        assignment = getAssignment(req.query.assignmentid);
      }
      const id = Math.floor(Math.random() * 1000000).toString();
      assignment.nextAssignment = {
        courseId: provider.body.custom_canvas_course_id,
        assignmentId: +provider.body.custom_canvas_assignment_id + 1,
      };
      assignment.syntax = req.query.syntax || 'javascript';
      cheapsession[id] = { provider, assignment };
      return res.redirect(`/lti/${assignmentId}/${id}/`);
    }
  });
}

function submit(req, res) {
  const sessid = req.params.sessionId;
  const data = cheapsession[sessid];
  if (data) {
    const provider = cheapsession[sessid].provider;
    const code = req.body.code;
    const correct = true;
    if (!provider.outcome_service) {
      res.send({ error: 'you must be a student to submit' });
      return;
    }
    if (correct) {
      console.log('this is correct');
      provider.outcome_service.send_replace_result_with_text(
        1,
        code,
        (err, result) => {
          if (err) {
            console.log(err);
          }
          return res.send({ message: result });
        },
      );
    }
  } else {
    res.send({ error: 'session not found. try reloading' });
  }
}

function get(req, res) {
  res.sendFile(path.resolve(`${__dirname}/../pubic/index.html`));
}

function getState(req, res) {
  const assignment = getAssignment(req.params.sessionId);
  assignment.syntax = 'js';
  console.log(assignment);
  res.send({ assignment, sessionId: req.params.sessionId });
}

function check(req, res) {
  const resultsArr = codeEval(req, res);
  res.send(resultsArr);
}

module.exports = {
  submit,
  get,
  post,
  getAssignment,
  getState,
  check,
};
