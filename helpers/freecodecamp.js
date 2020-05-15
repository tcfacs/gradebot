const fs = require('fs');
const fcc = loadFreecodecampChallenges();

// Helper Functions
const getAssignment = id => {
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
  ];
  const fccIndex = {};
  fccIncludes.forEach(c => {
    const fcc_data = JSON.parse(fs.readFileSync(c));
    for (let challenge of fcc_data.challenges) {
      fccIndex[challenge.id] = challenge;
    }
  });
  return { fccIndex };
}

module.exports = {
  getAssignment,
};
