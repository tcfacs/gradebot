const lti = require('ims-lti')
const config = require('../config')
const fs =require('fs')
const path = require('path')
const cheapsession = {}
const fcc = load_freecodecamp_challenges()

//Helper Functions
function getAssignment(id) {
  if (fcc.fcc_index[id]) {
    const challenge = fcc.fcc_index[id]
    // console.log('found FCC challenge',challenge)
    return challenge
  }
  // console.error(`unable to find assignment with id ${id}`)
}

function load_freecodecamp_challenges() {
  const fcc_includes = [ 'freeCodeCamp/seed/challenges/02-javascript-algorithms-and-data-structures/basic-javascript.json', 'freeCodeCamp/seed/challenges/01-responsive-web-design/basic-html-and-html5.json' ]
  const fcc_index = {}
  fcc_includes.forEach(c => {
    const fcc_data = JSON.parse(fs.readFileSync(c))   
    for (let challenge of fcc_data.challenges) {
      fcc_index[challenge.id] = challenge
    }
  })
  return {fcc_index}
}

async function post(req, res) {
  /* TODO - fetch user's previous submission */
  const provider = new lti.Provider( config.consumer_key,  config.consumer_secret )
  provider.valid_request(req, async (err, isValid) => {
    if (err) {
      // console.error('invalid request',err)
      res.send(err + ". check your consumer key and consumer secret (and nginx https proxy header)")
    } else {
      const assignment_id = req.body.custom_canvas_assignment_id || req.body.assignmentid
      const course_id = req.body.custom_canvas_course_id
      const user_id = req.body.custom_canvas_user_id
      const submitted = await canvas.req(`/courses/${course_id}/assignments/${assignment_id}/submissions/${user_id}`)
      const assignments_link = `/courses/${course_id}/assignments`
      let assignmnet;
      // console.log('provider good',provider)
      // if external tool is an assignment, then it will have outcome_service_url
      if (req.query.assignmentid) {
        assignment = getAssignment(req.query.assignmentid)
      }
      req.session.sessid = Math.floor(Math.random() * 1000000).toString()
      id = req.session.sessid
      req.session.cheapsession = {}
      cheapsession[id] = {provider, assignment, syntax:req.query.syntax}
      req.session.cheapsession[req.session.sessid] = { provider, assignment, syntax:req.query.syntax }
      // cheapsession[000] = { provider }
      // req.session.assignment = assignment
      const syntax = req.query.syntax || "javascript"

      console.log("first:", `/lti/${req.query.assignmentid}/${req.session.sessid}/${syntax}`)
      // console.log(req.session.assignment)
      return res.redirect(`/lti/${req.query.assignmentid}/${syntax}/88`)
      // return res.redirect(`/ `)
    }
  })
}

async function submit(req, res) {
  const sessid = req.session.sessid
  const data = req.session.cheapsession[sessid]
  if (data) {
    // console.log('found session',data)
    // const origbody = data.req.body
    // use these two to check if the student already made a submission
    // get single user's submission:
    // https://canvas.instructure.com/doc/api/submissions.html#method.submissions_api.show
    // const canvas_assignment_id = origbody.custom_canvas_assignment_id
    // const canvas_course_id = origbody.custom_canvas_course_id
    const assignment_id = req.body.custom_canvas_assignment_id
    const course_id = req.body.custom_canvas_course_id
    const user_id = req.body.custom_canvas_user_id
    const provider = cheapsession[sessid].provider
    const assignment = data.assignment
    const code = req.body.code
    const correct = true
    // req.body.state &&
    //     req.body.state.checked &&
    //     req.body.state.checked.result &&
    //     req.body.state.checked.result.passed
    if (!provider.outcome_service) {
      res.send({error:'you must be a student to submit'})
      return
    }
    function cb(err, result) {
      // console.log('grade submission result',err,result)
      return {f: "hello"}
      // redirect them to there grade
    }
    // console.log('user submitting grade correct:',correct)
    if (correct) {
      // console.log("this is correct")
      return provider.outcome_service.send_replace_result_with_text( 1, code, cb )
    } else {
      res.send({error:'incorrect solution.'})
      provider.outcome_service.send_replace_result_with_text( 0, code, cb )
    }
    
  } else {
    res.send({error:'session not found. try reloading'})
  }
}

function get (req,res) {
  // console.log(cheapsession)
  // console.log(req.session.cheapsession[req.params.sessionId])
  console.log("hello",req.params)
  req.session.assignment = getAssignment(req.params.challengeId)
  req.session.syntax = req.params.syntax
  // console.log("syntax:",req.session.assignment)
  // console.log("this is the session in get:", req.session)
  // req.session.syntax = req.session.cheapsession[req.params.sessionId].syntax
  res.sendFile(path.resolve(`${__dirname}/../client/build/index.html`))
}

module.exports = {
  submit,
  get,
  post,
  load_freecodecamp_challenges,
  getAssignment
}

