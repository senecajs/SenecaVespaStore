require('dotenv').config({ path: '.env.local' });

const Seneca = require('seneca');
const VespaStore = require('./src/SenecaVespaStore'); // Assuming your SenecaVespaStore plugin is located here

async function run() {
  const seneca = Seneca({ legacy: false })
    .test()
    .use('promisify')
    .use('entity')
    .use(VespaStore, {
      vespa: {
        endpoint: process.env.SENECA_VESPA_ENDPOINT, // Your Vespa endpoint
        application: process.env.SENECA_VESPA_APPLICATION, // Your Vespa application
      },
      debug: true,
    });

  await seneca.ready();

  // Save an entity
  const testEntityData = {
    someField: 'Hello Vespa',
    otherField: 'Seneca test'
  };
  const entityName = 'test/entity'; // Example entity name
  const saveResult = await seneca.entity(entityName).data$(testEntityData).save$();
  console.log('Entity saved:', saveResult);

  // Assuming your entity has an id field set by Vespa or you
  const entityId = saveResult.id;
  console.log(`Loading entity with id ${entityId}`);

  // Load the entity
  const loadResult = await seneca.entity(entityName).load$(entityId);
  console.log('Entity loaded:', loadResult);
}

run().catch(err => console.error(err));
