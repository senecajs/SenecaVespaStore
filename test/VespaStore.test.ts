require('dotenv').config({ path: '.env.local' });

import Seneca from 'seneca';
import VespaStore from '../src/VespaStore';

describe('VespaStore', () => {
  let seneca;

  beforeAll(() => {
    seneca = Seneca({ legacy: false })
      .test()
      .use('promisify')
      .use('entity')
      .use(VespaStore, {
        vespa: {
          endpoint: process.env.SENECA_VESPA_ENDPOINT, // Ensure this is set in your .env.local
          application: process.env.SENECA_VESPA_APPLICATION, // Ensure this is set in your .env.local
        },
        debug: true,
      });
  });

  test('load-plugin', async () => {
    expect(VespaStore).toBeDefined();
    await seneca.ready();
    expect(seneca.find_plugin('VespaStore')).toBeDefined();
  });

  // Test the save (indexing) functionality
  test('save-document', async () => {
    const ent = seneca.entity('foo/bar', { id: 'test-id', someField: 'testValue' });
    await ent.save$();
    // Add assertions to check if document was saved correctly
    // This might involve fetching the document back and checking its content
  });

  // Test the load (querying) functionality
  test('load-document', async () => {
    const ent = seneca.entity('foo/bar');
    const loadedEnt = await ent.load$({ id: 'test-id' });
    // Add assertions to check if the correct document was loaded
    expect(loadedEnt).toBeDefined();
    expect(loadedEnt.someField).toEqual('testValue');
  });

  // Add more tests as needed for list, remove, etc.
});

function makeSeneca() {
  return Seneca({ legacy: false })
    .test()
    .use('promisify')
    .use('entity')
    .use(VespaStore, {
      vespa: {
        endpoint: process.env.SENECA_VESPA_ENDPOINT,
        application: process.env.SENECA_VESPA_APPLICATION,
      },
      debug: true,
    });
}
