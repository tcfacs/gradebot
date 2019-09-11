const vm = require('vm')
const expect = require('chai').expect
const chai = require('chai')
const config = require('../config')
const fs = require('fs')
const path = require('path')
const assert = chai.assert
const fcc = load_freecodecamp_challenges()
const jsdom = require('jsdom')
const { JSDOM } = jsdom

// Helper Functions
function getAssignment (id) {
  if (fcc.fcc_index[id]) {
    const challenge = fcc.fcc_index[id]
    // console.log('found FCC challenge',challenge)
    return challenge
  }
  console.error(`unable to find assignment with id ${id}`)
}

function load_freecodecamp_challenges () {
  const fcc_includes = [
    'seed/challenges/02-javascript-algorithms-and-data-structures/basic-javascript.json',
    'seed/challenges/02-javascript-algorithms-and-data-structures/es6.json',
    'seed/challenges/01-responsive-web-design/basic-html-and-html5.json',
    'seed/challenges/03-front-end-libraries/jquery.json',
    'seed/challenges/03-front-end-libraries/react.json'

  ]
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
  // console.log(req.params)
  const data = req.body
  const tests = data.tests
  const evalOfTests = []
  const isHTML = data.syntax === 'html'
  const code = isHTML ? `"${data.code}"` : data.code
  const { window } = new JSDOM(`<html><body>${data.html.toString()}</body></html>`)
  const $ = require('jquery')(window)
  window.document.body.innerHTML += data.html
  const sandbox = { assert, expect, chai, window, $, code }
  vm.createContext(sandbox)
  tests.forEach(test => {
    let fullTest = isHTML ? `${data.head} \n ${data.tail} \n ${test} ` : `${data.head} \n  \n ${code} \n ${data.tail} \n ${test} `
    try {
      vm.runInContext(fullTest, sandbox)
      evalOfTests.push(true)
    } catch (e) {
      evalOfTests.push(false)
    }
  })
  return evalOfTests
}

function getInit (req, res) {
  // res.sendFile(`${__dirname}/client/build/index.html`)

}

function getState (req, res) {
  const assignment = getAssignment('bad87fee1348bd9bedc08826')
  console.log(assignment)
  // req.session.assignment.syntax = req.session.syntax || 'javascript'
  // console.log(assignment.syntax)
  // console.log(req.session)
  res.send({assignment: req.session.assignment || assignment, sessionId: req.session.sessionId})
}

function check (req, res) {
  const resultsArr = codeEval(req, res)
  res.send(resultsArr)
}

module.exports = {
  getState,
  getInit,
  check
}
