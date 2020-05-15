import './GradeBot.css';

import { ButtonContainer, Button } from './style';

import ChallengeDescription from '../components/ChallengeDescription/ChallengeDescription';
import TestSuite from '../components/TestSuite/TestSuite';
import Completed from '../components/Completed/Completed';
import AceEditor from 'react-ace';
import { ClipLoader } from 'react-spinners';

import { css } from '@emotion/core';
import React, { Component } from 'react';
import httpClient from '../httpClient.js';
import jsdom from 'jsdom';

import iPhone from './iphone.png';
import { addBootstrap,
  addAnimateCSSLibrary,
  addJQueryPlayGroundStyles,
  addJQuery } from './helperUtils';

import 'brace/mode/javascript';
import 'brace/mode/html';
import 'brace/theme/monokai';

const __DEBUG = false;

const override = css`
  display: block;
  margin: 0 auto;
  border-color: white;
`;

export default class GradeBot extends Component {
  state = {
    assignment: {},
    description: [],
    challengeSeed: [],
    instructions: [],
    tests: [],
    passing: [],
    syntax: 'html',
    show: false,
    completed: false,
    loading: false,
  };

  runTestIframe(text, challenge) {
    return new Promise(res => {
      var iframe = document.createElement('iframe');
      iframe.src =
        'https://gradebot.tlmworks.org/public/iframe-grader/testframe.html';
      iframe.style.display = 'none';
      document.querySelector('.test-iframe').innerHTML = '';
      document.querySelector('.test-iframe').appendChild(iframe);
      iframe.contentWindow.addEventListener(
        'message',
        function(e) {
          if (e.data.loaded) {
            iframe.contentWindow.postMessage(
              {
                command: 'runTest',
                text: text,
                challenge: challenge,
              },
              '*',
            );
          } else {
            if (e.data.command) {
              return;
            }
            res(e.data);
          }
        },
        false,
      );
    });
  }

  submitSolution = () => {
    const body = {
      code: this._editor.getValue(),
      assignment: this.state.assignment,
    };
    httpClient.grade(body, this.sessionId).then(res => {
      this.setState({
        completed: res.data.message,
      });
    });
  };

  async submit_code(user_code, assignment) {
    // client side only checking, in a web worker
    var result = await this.runTestIframe(user_code, assignment);
    console.log('submit code final result', result);
    return result;
  }

  injectJS (code, enableLocalStorage = true) {
    code = code === '</script><script>' ? '' : code;
    const iFrameDoc = document.getElementById('iframe').contentWindow.document;
    const iFrameHead = iFrameDoc.head;
    const scripts = iFrameDoc.scripts;
   
    // Remove the old test script tag. NOT the one that call's the jQuery
    // Reason - We don't want to let them build up with each failed test submission.
    __DEBUG && console.log("length: ", scripts.length);
    let length = scripts.length;
    if (length > 1) { 
      while (length > 1) {
        scripts[length - 1].remove();
        length--;
      }
     }
    
    const myScript = document.createElement('script');

    // We will use localStorage to save the contents of the JSDOM.
    // This is to get around an issue with running JSDOM on the 
    // client-side as opposed to on node.js
    // This snippet will be removed before being sent to server. 
    // Leaving it in does not affect the server or it grader.
    const jsdomLocalStorage = enableLocalStorage ? `$(function(){window.localStorage.setItem('html',document.head.innerHTML+''+document.body.innerHTML);});` : '';
    myScript.innerHTML = code + jsdomLocalStorage;
    iFrameHead.appendChild(myScript);

    const iFrameDocument = document.getElementById('iframe')
      .contentWindow.document;
    return iFrameDocument;
  }

  runTests = (enableLocalStorage = false) => {
    let { script } = this.loadEditor();     
    
    const jQueryDomEval = (_script) => {
      return new Promise((resolve, reject) => {
        const { JSDOM } = jsdom;
        const iFrame = new JSDOM(`<!DOCTYPE html> ${_script}`, { runScripts: "dangerously", resources: "usable" });
        __DEBUG && console.log('iFrame', iFrame)
        
        // JSDOM has no done() or a promise/callback so we have to wait to grab
        // processed DOM from localStorage (this is an issue workaround) 
        // Wait for the script to write to localStorage
        setTimeout(() => {
          const iFrameHTML = localStorage.getItem('html');
          localStorage.removeItem('html');
          // Remove all of the links and scripts that were added for test
          const iFrameHTMLRegEx1 = iFrameHTML && iFrameHTML.replace(/\$\(function\(\){window.localStorage.setItem\('html',document.head.innerHTML\+''\+document.body.innerHTML\);\}\);/g, '');
          const iFrameHTMLRegEx2 = iFrameHTMLRegEx1 && iFrameHTMLRegEx1.replace(/<link(.*?)$/img, "");
          const iFrameHTMLRegEx = `<script>${iFrameHTMLRegEx2}`;
          __DEBUG && console.log('iFrameHTMLRegEx output from JSDOM: ', iFrameHTMLRegEx);
          resolve(iFrameHTMLRegEx);
        }, 100); 
      });
    };
    
    this.runScriptedCode(script, true)
    .then((scriptedCode) => {
      jQueryDomEval(scriptedCode)
        .then((iFrameHTMLProcessed) => {
          __DEBUG && console.log('iFrameHTMLProcessed OUTPUT ****=>', iFrameHTMLProcessed);
          this.makeTests(iFrameHTMLProcessed);
        })
        .catch((error) => {console.error(`${error} Error retrieving iFrame data from storage`)});
    })
      .catch(error => console.error('Big error with the script injection call', error));

  } // runTests()

  loadEditor = () => {
    const assignmentId = this.state.assignment.id;
    const iFrameDoc = document.getElementById('iframe').contentWindow
      .document;
    let code = this._editor
      ? this._editor.getValue()
      : this.state.challengeSeed.join('\n');
    iFrameDoc.body.innerHTML = code;
    const script = code.substring(
      code.indexOf('<script>') + 8,
      code.indexOf('</script>'),
    );
    return {
      assignmentId,
      code,
      script
    }
  }

  runScriptedCode = (script, enableLocalStorage) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const scriptedCode = this.injectJS(script, enableLocalStorage);
        resolve(scriptedCode);
      }, 100); // Delay Needed or will throw
    });
  }

  makeTests = async (editedData = null) => {
    let { assignmentId, code, script } = this.loadEditor()
    this.runScriptedCode(script); //  Makes iFrame responsive on server call
    code = editedData || code;
    
      const data = {
        code,
        head:
        this.state.assignment.head &&
        this.state.assignment.head.join('\n'),
        tail:
        this.state.assignment.tail &&
        this.state.assignment.tail.join('\n'),
        tests: this.state.assignment.tests,
        syntax: this.state.syntax,
        html: code,
      };

      httpClient.testCode(data, assignmentId).then(res => {
        __DEBUG && console.log('data: ', data)
        __DEBUG && console.log('code: ', code)
        this.setState({
          passing: res.data,
          challengeSeed: [code],
        });
      }).catch((error) => {
        console.error(`Big Big => ${error} <= Error testing Code`);
      })
  };
  
  async componentDidMount() {
    this._editor = this.ace.editor;
    this._editor.session.setOption('indentedSoftWrap', false);
    const params = window.location.pathname.split('/');
    this.sessionId = params[2];
    addBootstrap();
    addAnimateCSSLibrary();
    addJQueryPlayGroundStyles();
    addJQuery();

    await httpClient.getChallenge(this.sessionId).then(res => {
      const description = res.data.assignment.description;
      const instructions = description.splice(
        res.data.assignment.description.indexOf('<hr>') + 1,
      );
      this.setState({
        assignment: res.data.assignment,
        challengeSeed: res.data.assignment.challengeSeed,
        syntax: 'html',
        description,
        instructions,
        tests: res.data.assignment.tests,
      });
    });
    this.challengeSeed = this.state.assignment.challengeSeed;
    this.makeTests();
  }

  onReset = () => {
    const iframeDoc = document.getElementById('iframe').contentWindow
      .document;
    this.setState(prevState => ({
      challengeSeed: this.challengeSeed,
    }), this.makeTests ); // Use callback to re-animate the iframe
    iframeDoc.body.innerHTML = this.challengeSeed.join('\n');
  };

  hideModal = () => {
    this.setState({ show: false });
    document.body.classList.toggle('stop-scroll');
  };

  onChange(newValue) {
    const iFrameDoc = document.getElementById('iframe').contentWindow
      .document;
    const code = newValue;
    iFrameDoc.body.innerHTML = code;
  }

  render() {
    const {
      assignment,
      description,
      challengeSeed,
      tests,
      completed,
      loading,
    } = this.state;

    return (
      <div>
        <div className='test-iframe'></div>
        <div>
          <div>
            <Completed
              show={this.state.show}
              handleClose={this.hideModal}
              title={assignment.title}
              submitSolution={this.submitSolution}
              completed={completed}
            />
          </div>
          <div className={'challenge-description'}>
            {description.map((description, index) => (
              <ChallengeDescription
                description={description}
                key={index}
                index={index}
              />
            ))}
          </div>
          <div className='challenge-instructions-tests'>
            <div className='challenge-instuctions'>
              <h3>Instructions</h3>
              {this.state.instructions.map((line, index) => (
                <p
                  key={index}
                  dangerouslySetInnerHTML={{ __html: line }}
                ></p>
              ))}
            </div>
            <div className='challenge-tests'>
              <h3>Tests</h3>
              <TestSuite passing={this.state.passing} tests={tests} />
            </div>
          </div>
          <div className='editor-div'>
            <div className='ace-editor-div'>
              <AceEditor
                name='editor'
                mode={this.state.syntax}
                theme='monokai'
                value={challengeSeed.join('\n')}
                ref={instance => {
                  this.ace = instance;
                }}
                wrapEnabled={true}
                indentedSoftWrap={false}
                editorProps={{ $blockScrolling: Infinity }}
                onChange={this.onChange}
              />
              <ButtonContainer>
                <Button
                  color='lightgreen'
                  hoverColor='#1c7269'
                  disabled={loading}
                  isDisabled={loading}
                  onClick={ this.runTests }
                >
                  {loading ? (
                    <ClipLoader css={override} size={20} />
                  ) : (
                    'Run Tests'
                  )}
                </Button>
                <Button
                  color='lightpink'
                  onClick={ this.onReset }
                  hoverColor='#ce3a51'
                  isDisabled={loading}
                  disabled={loading}
                >
                  Reset Code
                </Button>
              </ButtonContainer>
            </div>
            <div
              className='iphone'
              style={{
                display:
                  this.state.syntax !== 'html' ? 'none' : 'block',
              }}
            >
              <div>
                <img src={iPhone} alt='iPhone'/>
                <iframe id='iframe' title='jquery'></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
} // END OF class Gradebot

