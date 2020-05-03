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
import iPhone from './iphone.png';

import 'brace/mode/javascript';
import 'brace/mode/html';
import 'brace/theme/monokai';

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

  injectJS (code){
    const iFrameDoc = document.getElementById('iframe').contentWindow.document;
    const iFrameHead = iFrameDoc.head;
    const scripts = iFrameDoc.scripts;

    // Remove the old test script tag. NOT the one that call's the jQuery CDN
    // Reason we don't want to let them build up.
    if (scripts.length > 1) { scripts[1].remove(); }
    const oldLength = iFrameDoc.scripts.length
    const myScript = document.createElement('script');
    myScript.innerHTML = code;

    iFrameHead.appendChild(myScript);

    // Needed to stop Intermittent jQuery $ not
    // defined error caused when not using setTimeout
    // https://swizec.com/blog/how-to-properly-wait-for-dom-elements-to-show-up-in-modern-browsers/swizec/6663
    function waitForAppendChild() {
      if (iFrameDoc.scripts.length <= oldLength) {
        window.requestAnimationFrame(waitForAppendChild);
      }
    };
    waitForAppendChild();

    const iFrameDocument = document.getElementById('iframe')
      .contentWindow.document;
    return iFrameDocument;
  }

  makeTests = async () => {
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

    // setTimeout(() => {
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
        this.setState({
          passing: res.data,
          challengeSeed: [code],
        });
      }).then(() => {
        const scriptedCode = this.injectJS(script); // Delay or will throw
        console.log('scriptedCode: ', scriptedCode);
      }).catch((error) => {
        console.log('Error testing Code');
      })
    // }, 100);
  };
  
  async componentDidMount() {
    this._editor = this.ace.editor;
    this._editor.session.setOption('indentedSoftWrap', false);
    const params = window.location.pathname.split('/');
    this.sessionId = params[2];
    addBootstrap();
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
    }));
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
                editorProps={{ $blockScrolling: true }}
                onChange={this.onChange}
              />
              <ButtonContainer>
                <Button
                  color='lightgreen'
                  hoverColor='#1c7269'
                  disabled={loading}
                  isDisabled={loading}
                  onClick={() => this.makeTests()}
                >
                  {loading ? (
                    <ClipLoader css={override} size={20} />
                  ) : (
                    'Run Tests'
                  )}
                </Button>
                <Button
                  color='lightpink'
                  onClick={() => this.onReset}
                  hoverColor='#ce3a51'
                  isDisabled={loading}
                  disabled={loading}
                >
                  Rest Code
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
}

// Helper Functions

function addBootstrap() {
  const bootstrap = document.createElement('link');
  bootstrap.href =
    'https://static.tlmworks.org/track1/bootstrap/bootstrap3/css/bootstrap.min.css';
  bootstrap.rel = 'stylesheet';
  const head = document.getElementById('iframe').contentWindow
    .document.head;
  head.append(bootstrap);
}

// Move either all helpers to their own file of at least the CSS template
function addJQueryPlayGroundStyles() {
  const playGroundStyles = document.createElement('style');
  const cssPlayGroundStyles = `
    .well {
      width: 84px;
      padding-left: 2px;
    }
    .col-xs-6 {
      padding-left: 11px;
      padding-right: 11px;
    }
    h4 {
      height: 40px;
    }
    button:not(:first-of-type) {
      margin-top: 3px;
    }

    .animated.shake {
      /* Start the shake animation and make the animation last for 0.5 seconds */
      animation: shake 0.75s;
    
      /* When the animation is finished, start again */
      animation-iteration-count: infinite;
    }
    
    @keyframes shake {
      0% { transform: translate(1px, 1px) rotate(0deg); }
      10% { transform: translate(-1px, -2px) rotate(-1deg); }
      20% { transform: translate(-3px, 0px) rotate(1deg); }
      30% { transform: translate(3px, 2px) rotate(0deg); }
      40% { transform: translate(1px, -1px) rotate(1deg); }
      50% { transform: translate(-1px, 2px) rotate(-1deg); }
      60% { transform: translate(-3px, 1px) rotate(0deg); }
      70% { transform: translate(3px, 1px) rotate(-1deg); }
      80% { transform: translate(-1px, -1px) rotate(1deg); }
      90% { transform: translate(1px, 2px) rotate(0deg); }
      100% { transform: translate(1px, -2px) rotate(-1deg); }
    }

    .animated.bounce {
      /* Start the shake animation and make the animation last for 0.5 seconds */
      animation: bounce 1.5s;
    
      /* When the animation is finished, start again */
      animation-iteration-count: infinite;
    }
    
    @keyframes bounce {
      0% { transform: translate( 0px, 0px); }
      10% { transform: translate(0px, 3px); }
      20% { transform: translate(0px, 6px); }
      30% { transform: translate(0px, 9px); }
      40% { transform: translate(0px, 6px); }
      50% { transform: translate(0px, 3px); }
      60% { transform: translate(0px, 0px); }
      70% { transform: translate(0px, -3px); }
      80% { transform: translate(0px,-6px); }
      87% { transform: translate(0px, -9px); }
      94% { transform: translate(0px, -6px); }
      100% { transform: translate(0px, -3px); }
    }
  `;

  const head = document.getElementById('iframe').contentWindow
    .document.head;
  playGroundStyles.innerHTML = cssPlayGroundStyles;
  head.append(playGroundStyles);
}

/**
   * TODO: 
   * 1. We need to link to static's jQuery NOT a CDN
   */
  function addJQuery() {
    const jQuery = document.createElement('script');
    // jQuery.href = './static/jquery-3.4.1.min.js'; find jQuery in static
    
    jQuery.src = "https://code.jquery.com/jquery-3.5.0.js";
    jQuery.type = 'text/javascript';
    jQuery.integrity = "sha256-r/AaFHrszJtwpe+tHyNi/XCfMxYpbsRg2Uqn0x3s2zc=";
    jQuery.crossOrigin = "anonymous";
  
    const head = document.getElementById('iframe').contentWindow
      .document.head;
    head.append(jQuery);
  }
  