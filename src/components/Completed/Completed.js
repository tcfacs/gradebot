import React from 'react'
import './Completed.css'

const Completed = (props) => {
  const {
    handleClose,
    show,
    title,
    submitSolution,
    completed
  } = props

  return (
    <div className={show ? 'modal display-block' : 'modal display-none'}>
      <section className='modal-main'>
        <h1>{title}</h1>
        <h1 className='completed-msg'>COMPLETED <span role='img' aria-label='Checkbox'>✅</span></h1>
        <button className='close'onClick={handleClose}>
          <i className='glyphicon glyphicon-remove' />
        </button>
        {completed
          ? <p>Please navigate back to the assignments</p>
          : <input className={'btn'} type='button' defaultValue='Submit Solution' onClick={submitSolution} />
        }
      </section>
    </div>
  )
}

export default Completed
