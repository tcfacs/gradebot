// const vm = require('vm')
// const expect = require('chai').expect
// const chai = require('chai')
// const fs =require('fs')
// const path = require('path')
// const assert = chai.assert
// const jsdom = require("jsdom")
// const { JSDOM } = jsdom
// const config = require('../config')

// // Helper Functions
// let codeEval = (req, res, next) => {
//   const data = req.body;
//   const tests = data.tests
//   const evalOfTests = []
//   const isHTML = data.syntax === "html"
//   const code = isHTML ? `"${data.code}"` : data.code
//   const { window } = new JSDOM(`<html><body>${code.toString()}</body></html>`)
//   const $ = require('jquery')(window)
//   window.document.body.innerHTML += code
//   const sandbox = { assert, expect, chai, window, $, code};
//   vm.createContext(sandbox);
//   tests.forEach(test => {
//     let fullTest = isHTML ? `${data.head} \n ${data.tail} \n ${test} ` : `${data.head} \n  \n ${code}; \n ${data.tail} \n ${test} `
//     try {
//       vm.runInContext(fullTest, sandbox);
//       evalOfTests.push(true)
//     } catch (e) {
//       console.log(e)
//       evalOfTests.push(false)
//     }
//    })
//   return evalOfTests;
// }


// function getState(req, res) {
//   const assignment = req.session.cheapsession[req.params.sessionId].assignment
//   res.send({assignment, sessionId: req.session.sessionId})
// }

// function check(req, res) {
//   const resultsArr = codeEval(req,res)
//   res.send(resultsArr)
// }

// module.exports ={
//   getState,
//   check
// }