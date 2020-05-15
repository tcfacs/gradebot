// Helper Functions
export function addBootstrap() {
  const bootstrap = document.createElement('link');
  bootstrap.href = 'libraries/bootstrap/dist/css/bootstrap.css'
  bootstrap.rel = 'stylesheet';
  bootstrap.type = 'text/css';
  const head = document.getElementById('iframe').contentWindow
    .document.head;
  head.append(bootstrap);
}

export function addAnimateCSSLibrary() {
  const animateCSSLib = document.createElement('link');
  // animate.compat.css is a 4.0 lib file that's backwards
  // compatible w/ver-3.7 the v4.0 introduced breaking changes.
  animateCSSLib.href = 'libraries/animate/animate.css'; 
  animateCSSLib.rel = 'stylesheet';
  animateCSSLib.type = 'text/css';
  const head = document.getElementById('iframe').contentWindow
    .document.head;
    head.append(animateCSSLib);
}
export function addJQueryPlayGroundStyles() {
  const playGroundStyles = document.createElement('link');
  playGroundStyles.href = 'styles/playGroundStyles.css';
  playGroundStyles.rel = 'stylesheet';
  playGroundStyles.type = 'text/css';
  const head = document.getElementById('iframe').contentWindow
    .document.head;
  head.append(playGroundStyles);
}

export function addJQuery() {
  const jQuery = document.createElement('script');
  jQuery.src = 'libraries/jquery/jquery.js';
  jQuery.type = 'text/javascript';
  const head = document.getElementById('iframe').contentWindow
    .document.head;
  head.append(jQuery);
}
