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

Install instructions: to come

### Credits:
- LTI integration: https://github.com/omsmith/ims-lti
- Example coding challenges: https://github.com/freecodecamp/freecodecamp
