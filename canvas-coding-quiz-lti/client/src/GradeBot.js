import './GradeBot.css';

import ChallengeDescription from './components/ChallengeDescription/ChallengeDescription'
import TestSuite from './components/TestSuite/TestSuite'
import Completed from './components/Completed/Completed'
import AceEditor from 'react-ace'
import React, { Component } from 'react'
import httpClient from './httpClient.js'

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
    completed: false
  }

  submit_solution = async () =>{
    const body = {
      code: this._editor.getValue(),
      assignment: this.state.assignment
    }
    httpClient.grade(body)
    this.setState({
      completed: true
    })
  }

  makeTests = () => {
    var iframe = document.createElement('iframe')
    iframe.id = "iframe"
    document.body.appendChild(iframe)

    var doc = document.getElementById('iframe').contentWindow.document;
    var str = this._editor ? this._editor.getValue() : this.state.challengeSeed.join("\n")          // Append the text to <button>
    doc.body.innerHTML += str
    // let code = this._editor ? this._editor.getValue() : this.state.challengeSeed.join("\n")
    let code = str

    code.split("↵")
    console.log(code)
    let data = { 
      code,
      head: this.state.assignment.head && this.state.assignment.head.join('\n'),
      tail: this.state.assignment.tail && this.state.assignment.tail.join('\n'),
      tests: this.state.assignment.tests
    }

    httpClient.testCode(data)
      .then(res => this.setState({ 
        passing: res.data,
        challengeSeed:[code]
      }))
  }

  async componentDidMount() {
    this._editor = this.ace.editor
    this.challengeSeed = this.state.assignment.challengeSeed
    this._editor.session.setOption("indentedSoftWrap", false)


    await httpClient.getChallenge()
      .then(res => {
        const description = res.data.assignment.description
        const instructions = description.splice(res.data.assignment.description.indexOf("<hr>") + 1)
        this.setState({
          assignment: res.data.assignment,
          challengeSeed: res.data.assignment.challengeSeed,
          description,
          instructions,
          tests: res.data.assignment.tests,
        })
      })
    this.makeTests()
  }

  onReset = () => {
    this.setState(prevState => ({
      challengeSeed: this.challengeSeed
    }));
  }

  render() {
    const { assignment, 
            description, 
            challengeSeed, 
            tests,
            completed } = this.state
    let passed = tests.length === this.state.passing.length && !this.state.passing.includes(false)

    return (
      <div>
        {completed ? < Completed title={assignment.title}/> :
        <div>
          <header id="GradeBot-header">
            <h3>{assignment.title}</h3>
            <hr/>
          </header>
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
          <AceEditor 
            name="editor"
            mode="html"
            theme="monokai"
            value={challengeSeed.join("\n")}
            ref={instance => { this.ace = instance; }}
            wrapEnabled={true}
            indentedSoftWrap={false}
            editorProps={{$blockScrolling: true}}
          />
          <div className={"submit-btns"}>
          { !passed ? 
              [<input key={"btn1"}className="btn" type="button" defaultValue="Check Code" onClick={this.makeTests} />,
              <input key={"btn2"}className="btn reset" type="button" defaultValue="Reset Solution" onClick={this.onReset} />]
            : 
              <input className={"btn"} type="button" defaultValue="Submit Solution" onClick={this.submit_solution}/>  
          }
          </div>
        </div>
        }
      </div>
    )
    
  }
  
}



