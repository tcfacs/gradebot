### Canvas LMS "gradebot" thing

This repository contains an "LTI" integration with canvas that lets a
student take an quiz / assignment with a fizbuzz coding / programming
problem. The grade is stored as a normal assignment's grade inside
canvas.

### Setting up Environment Variables

- Create a .env file
- Add these variables to your .env file
  - CANVAS_API_TOKEN = <\Your Canvas API Token >"
  - CANVAS_BASE = https://thelastmile.instructure.com/
  - LTI_ROOT = http://127.0.0.1:3030
  - CONSUMER_KEY = gradebot
  - CONSUMER_SECRET = consumersecret

Install instructions:

- To run gradebot `node server.js`

### Credits:

- LTI integration: https://github.com/omsmith/ims-lti
- Example coding challenges: https://github.com/freecodecamp/freecodecamp

# Gradebot

## Canvas/LMS

LTI app configuration in Canvas can happen at the course or account level. Click the "Settings" link in the left sidebar of the course or account where you want to add the app. Click the "Apps" tab and either select an app from the Canvas App Center or select "View Installed Apps" then "Add New App" to manually configure.

Enter the name, consumer key and shared secret for the app. For "configuration type" select "By URL" and paste in the full URL of the link configuration.

After the app is saved you should see it appear as configured in the course or account content. Depending on the integration type, the app may appear different places, but most apps will appear under "External Tools" when adding items to a module.

[Adding External App to Assignment](https://community.canvaslms.com/docs/DOC-10384-4152501360)

gradebot example url `https://gradebot.tlmworks.org/lti?assignmentid=bad87fee1348bd9aedf08833&syntax=html`

## Gradebot

When Canvas loads gradebot it makes a `POST` request to `/lti`. This is the funtion that runs on that route.

```js
async function post(req, res) {
  const provider = new lti.Provider(
    process.env.CONSUMER_KEY,
    process.env.CONSUMER_SECRET,
  ); // <---- gets the provider
  provider.valid_request(req, async (err, isValid) => {
    if (err) {
      console.error('invalid request', err);
      res.send(
        err +
          '. Check your consumer key and consumer secret (and nginx https proxy header)',
      );
    } else {
      console.log('provider good', provider);
      const assignmentId = req.query.assignmentid; // <--- gets the assignment id from the request query `e.g. assignmentid=bad87fee1348bd9aedf08833`
      let assignmnet;
      // if external tool is an assignment, then it will have outcome_service_url
      if (assignmentId) {
        assignment = getAssignment(req.query.assignmentid); // <-- see below for function
      }
      const id = Math.floor(Math.random() * 1000000).toString();
      assignment.syntax = req.query.syntax || 'javascript'; // <--- gets the syntax from the request query `e.g. syntax=html`
      cheapsession[id] = { provider, assignment };
      return res.redirect(`/lti/${assignmentId}/${id}/`); // <--- see *2
    }
  });
}
```

```js
const getAssignment = (id) => {
  if (fcc.fccIndex[id]) {
    const challenge = fcc.fccIndex[id];
    return challenge;
  }
  console.error(`unable to find assignment with id ${id}`);
};

function loadFreecodecampChallenges() {
  const fccIncludes = [
    'seed/challenges/02-javascript-algorithms-and-data-structures/basic-javascript.json',
    'seed/challenges/01-responsive-web-design/basic-html-and-html5.json',
    'seed/challenges/03-front-end-libraries/jquery.json',
  ]; // <-- load challenges here
  const fccIndex = {};
  fccIncludes.forEach((c) => {
    const fcc_data = JSON.parse(fs.readFileSync(c));
    for (let challenge of fcc_data.challenges) {
      fccIndex[challenge.id] = challenge;
    }
  });
  return { fccIndex };
}
```

\*2

```js
function get(req, res) {
  res.sendFile(path.resolve(`${__dirname}/../build/index.html`)) // <--- send the view (react)
```
