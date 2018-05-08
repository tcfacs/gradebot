const vm = require('vm')
const expect = require('chai').expect
const chai = require('chai')
const config = require('../config')
const fs =require('fs')
const path = require('path')
const assert = chai.assert
const fcc = load_freecodecamp_challenges()
const jsdom = require("jsdom")
const { JSDOM } = jsdom

//Helper Functions
function getAssignment(id) {
  if (fcc.fcc_index[id]) {
    const challenge = fcc.fcc_index[id]
    // console.log('found FCC challenge',challenge)
    return challenge
  }
  console.error(`unable to find assignment with id ${id}`)
}

function load_freecodecamp_challenges() {
  const fcc_includes = [ 'freeCodeCamp/seed/challenges/02-javascript-algorithms-and-data-structures/basic-javascript.json', 'freeCodeCamp/seed/challenges/01-responsive-web-design/basic-html-and-html5.json']
  const fcc_index = {}
  fcc_includes.forEach(c => {
    const fcc_data = JSON.parse(fs.readFileSync(c))   
    for (let challenge of fcc_data.challenges) {
      fcc_index[challenge.id] = challenge
    }
  })
  return {fcc_index}
}

// Helper Functions
let codeEval = (req, res, next) => {
  const data = req.body;
  const tests = data.tests
  const evalOfTests = []
  const isHTML = req.session.syntax === "html"
  const code = isHTML ? `"${data.code}"` : data.code
  const { window } = new JSDOM(`<html><body>${code.toString()}</body></html>`)
  const $ = require('jquery')(window)
  window.document.body.innerHTML += code
  const sandbox = { assert, expect, chai, window, $, code};
  vm.createContext(sandbox);
  tests.forEach(test => {
    let fullTest = isHTML ? `${data.head} \n ${data.tail} \n ${test} ` : `${data.head} \n  \n ${code} \n ${data.tail} \n ${test} `
    try {
      vm.runInContext(fullTest, sandbox);
      evalOfTests.push(true)
    } catch (e) {
      // console.log(e)
      evalOfTests.push(false)
    }
   })
  return evalOfTests;
}

function get(req, res) {
  const assignment = getAssignment('bad87fee1348bd9aedf08801')
  assignment.syntax = req.session.syntax || 'html'

  console.log(assignment.syntax)
  res.send({assignment: req.session.assignment || assignment, sessionId: req.session.sessionId})
}

function check(req, res) {
  const resultsArr = codeEval(req,res)
  res.send(resultsArr)
}

module.exports ={
  get,
  check
}