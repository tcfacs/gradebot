import styled from 'styled-components'
import { ClipLoader } from 'react-spinners';

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin-top: 1.5rem;
  @meadi()
`

export const Button = styled.button`
    background-color: ${ props => props.isDisabled ? 'gray' : props.color };
    cursor: pointer;
    text-decoration: none;
    color: #fff;
    text-align: center;
    letter-spacing: .5px;
    border: none;
    border-radius: 2px;
    height: 36px;
    width: 10rem;
    line-height: 36px;
    padding: 0 2rem;
    text-transform: uppercase;
    box-shadow: 0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12), 0 3px 1px -2px rgba(0,0,0,0.2);
    &:hover {
        background-color: ${props => props.hoverColor};
    }
`

export const Loader = styled(ClipLoader)`
    color: red;
`