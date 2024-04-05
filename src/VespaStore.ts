// Copyright © 2024 Seneca Project Contributors, MIT License

import fetch from 'node-fetch';
import { Gubu } from 'gubu';

export type VespaStoreOptions = {
  vespa: {
    endpoint: string; // Vespa endpoint
    application: string; // Vespa application name
  };
  debug: boolean;
};

function SenecaVespaStore(this: any, options: VespaStoreOptions) {
  const seneca: any = this;

  let store = {
    name: 'SenecaVespaStore',

    save: async function (msg: any, reply: any) {
      const ent = msg.ent;
      const body = JSON.stringify(ent.data$(false));

      try {
        const response = await fetch(`${options.vespa.endpoint}/${options.vespa.application}/document/v1/${ent.entity$}/docid/${ent.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: body,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: any = await response.json();
        ent.data$(data.fields);
        reply(null, ent);
      } catch (error) {
        reply(error);
      }
    },

    load: async function (msg: any, reply: any) {
      try {
        const response = await fetch(`${options.vespa.endpoint}/${options.vespa.application}/document/v1/${msg.ent.entity$}/docid/${msg.q.id}`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: any = await response.json();
        const ent = msg.ent.make$(data.fields);
        reply(null, ent);
      } catch (error) {
        reply(error);
      }
    },

    //I'm going to Add more operations here
  };

  this.add('init:SenecaVespaStore', function (msg: any, respond: any) {
    console.log('SenecaVespaStore initialized');
    respond();
  });

  return {
    name: store.name,
  };
}

export default SenecaVespaStore;

if (typeof module !== 'undefined') {
  module.exports = SenecaVespaStore;
}
