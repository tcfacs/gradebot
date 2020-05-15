import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './TestOutput.css'

export default class TestOutput  extends Component {
  
  static propTypes = {
    index: PropTypes.number,
    passing: PropTypes.array.isRequired,
    test: PropTypes.string.isRequired
  };
  
  makeMessage = () => {
    const splitArr = this.props.test.split("'message:")
    return splitArr[1].replace("');", "")
  }
  
  render() {
    const { index, test, passing} = this.props

    return (
      <div className="test-description">
        <span> {passing[index] ? "✅" : "❌" }</span>
        <p key={index} dangerouslySetInnerHTML={{ __html: this.makeMessage(test) }}></p>
      </div>
    )
  }
}