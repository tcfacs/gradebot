import './GradeBot.css';

import ChallengeDescription from './components/ChallengeDescription/ChallengeDescription'
import TestSuite from './components/TestSuite/TestSuite'
import Completed from './components/Completed/Completed'
import AceEditor from 'react-ace'
import React, { Component } from 'react'
import httpClient from './httpClient.js'
import iPhone from './iphone.png'

import 'brace/mode/javascript'
import 'brace/mode/html'
import 'brace/theme/monokai'

export default class GradeBot extends Component {

  state = {
    assignment: {},
    description: [],
    challengeSeed: [],
    instructions: [],
    tests: [],
    passing:[],
    syntax: 'javascript',
    show: false,
    completed: false
  }

  runTestIframe(text, challenge) {
    return new Promise( res => {
      var iframe = document.createElement('iframe')
      iframe.src = 'https://gradebot.tlmworks.org/public/iframe-grader/testframe.html'
      iframe.style.display='none'
      document.querySelector('.test-iframe').innerHTML = ''
      document.querySelector('.test-iframe').appendChild(iframe)
      iframe.contentWindow.addEventListener('message', function(e) {
        if (e.data.loaded) {
          iframe.contentWindow.postMessage({command:'runTest',text:text,challenge:challenge},'*')
        } else {
          if (e.data.command) { return }
          res(e.data)
        }
      }, false)
    })
  }

  submit_solution = () =>{
    const body = {
      code: this._editor.getValue(),
      assignment: this.state.assignment
    }
    httpClient.grade(body, this.sessionId).then(res => {
      this.setState({
        completed: res.data.message
      })
    })
  }

  async submit_code(user_code, assignment) {
    // client side only checking, in a web worker
    var result = await this.runTestIframe(user_code, assignment)
    console.log('submit code final result',result)
    return result
  }

  makeTests = async () => {
    const assignmentId = this.state.assignment.id
    const iFrameDoc = document.getElementById('iframe').contentWindow.document
    const code = this._editor ? this._editor.getValue() : this.state.challengeSeed.join("\n")
    iFrameDoc.body.innerHTML =  code
    const data = { 
      code,
      head: this.state.assignment.head && this.state.assignment.head.join('\n'),
      tail: this.state.assignment.tail && this.state.assignment.tail.join('\n'),
      tests: this.state.assignment.tests,
      syntax: this.state.syntax
    }

    if(this.state.syntax === "html") {
      await this.runTestIframe(code, this.state.assignment)
      .then(res => this.setState({
        passing: res.result.tests,
        challengeSeed: [code]
      }))
    } else {
        await httpClient.testCode(data, assignmentId)
        .then(res => this.setState({ 
        passing: res.data,
        challengeSeed:[code],
    }))
    }

    !this.state.passing.includes(false) && document.body.classList.toggle('stop-scroll') && this.setState({ show: true })
  }

  async componentDidMount() {
    this._editor = this.ace.editor
    this._editor.session.setOption("indentedSoftWrap", false)
    const params = window.location.pathname.split("/")
    this.sessionId = params[3]
    addBootstrap()
    addjQuery()

    await httpClient.getChallenge(this.sessionId)
      .then(res => {
        const description = res.data.assignment.description
        const instructions = description.splice(res.data.assignment.description.indexOf("<hr>") + 1)
        this.setState({
          assignment: res.data.assignment,
          challengeSeed: res.data.assignment.challengeSeed,
          syntax: res.data.assignment.syntax,
          description,
          instructions,
          tests: res.data.assignment.tests
        })
      })
    this.challengeSeed = this.state.assignment.challengeSeed
    this.makeTests()
  }

  onReset = () => {
    const iframeDoc = document.getElementById('iframe').contentWindow.document
    this.setState(prevState => ({
      challengeSeed: this.challengeSeed
    }));
    iframeDoc.body.innerHTML = this.challengeSeed.join("\n")
  }

  hideModal = () => {
    this.setState({ show: false });
    document.body.classList.toggle('stop-scroll')
  };

  onChange(newValue) {
    const iFrameDoc = document.getElementById('iframe').contentWindow.document
    const code = newValue
    iFrameDoc.body.innerHTML = code
  }

  render() {
    const { assignment, 
            description, 
            challengeSeed, 
            tests,
            completed } = this.state
    // let passed = tests.length === this.state.passing.length && !this.state.passing.includes(false)
    return (
      <div>
        {/* {completed ? < Completed title={assignment.title}/> : */}
        <div className="test-iframe"></div>
        <div>
          <div>
            <Completed 
              show={this.state.show} 
              handleClose={this.hideModal} 
              title={assignment.title} 
              submit_solution={this.submit_solution}
              completed={this.state.completed}
            />
          </div>
          {/* <header id="GradeBot-header">
            <h3>{assignment.title}</h3>
            <hr/>
          </header> */}
          <div className={"challenge-description"}>
            {description.map((description, index) => {
              return <ChallengeDescription description={description} key={index} index={index}/>
            })}   
          </div>
          <div className="challenge-instructions-tests">
            <div className="challenge-instuctions">
              <h3>Instructions</h3>
              {this.state.instructions.map((line, index) => <p key={index} dangerouslySetInnerHTML={{ __html: line }}></p>)}
            </div>
            <div className="challenge-tests">
              <h3>Tests</h3>
              <TestSuite passing={this.state.passing}tests={tests}/>
            </div>
          </div>
          <div className="editor-div">
            <div className="ace-editor-div">
              <AceEditor 
                name="editor"
                mode={this.state.syntax}
                theme="monokai"
                value={challengeSeed.join("\n")}
                ref={instance => { this.ace = instance; }}
                wrapEnabled={true}
                indentedSoftWrap={false}
                editorProps={{$blockScrolling: true}}
                onChange={this.onChange}
              />
              <div className={"submit-btns"}>
                <input key={"btn1"}className={"btn"} type="button" defaultValue="Run Tests" onClick={this.makeTests} />
                <input key={"btn2"}className={"btn reset"} type="button" defaultValue="Reset code" onClick={this.onReset} />
              </div>
            </div>
            <div class="iphone" style={{display: this.state.syntax !== "html" ? 'none' : 'block'}}>
              <div>
                <img src={iPhone} />  
                <iframe id="iframe"></iframe>         
              </div>
            </div>
            
          </div>

        </div>
      </div>
    )
    
  }
  
}

//Helper Functions

function addBootstrap() {
  const bootstrap = document.createElement('link');
  bootstrap.href = "https://static.tlmworks.org/track1/bootstrap/bootstrap3/css/bootstrap.min.css";
  bootstrap.rel = "stylesheet";
  const head = document.getElementById('iframe').contentWindow.document.head;
  head.append(bootstrap);
}

function addjQuery() {
  const jQuery = document.createElement('link');
  jQuery.href = "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"
  jQuery.rel = "stylesheet";
  const head = document.getElementById('iframe').contentWindow.document.head;
  head.append(jQuery);
}


