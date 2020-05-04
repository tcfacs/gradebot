const playGroundCSS = `
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
export default playGroundCSS;
