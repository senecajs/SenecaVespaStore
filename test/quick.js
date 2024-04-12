require('dotenv').config({ path: '.env.local' });

const Seneca = require('seneca');
const VespaStore = require('./src/SenecaVespaStore');

async function run() {
  const seneca = Seneca({ legacy: false })
    .test()
    .use('promisify')
    .use('entity')
    .use(VespaStore, {
      vespa: {
        endpoint: process.env.SENECA_VESPA_ENDPOINT, // Ensure this points to http://localhost:8080 for local Vespa
        application: process.env.SENECA_VESPA_APPLICATION, // Your Vespa application name
      },
      debug: true,
    });

  await seneca.ready();

  // Example: Query Vespa for music albums that contain 'head'
  const queryResult = await seneca.act('role:vespa,cmd:query', {
    query: "select * from music where album contains 'head'"
  });
  console.log('Query result:', queryResult);

  // Example: Retrieve a specific document by ID
  const documentId = 'id:mynamespace:music::a-head-full-of-dreams'; // Replace with a valid document ID
  const documentResult = await seneca.act('role:vespa,cmd:get', {
    id: documentId
  });
  console.log('Document:', documentResult);
}

run().catch(err => console.error(err));
