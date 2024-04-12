// Copyright © 2024 Seneca Project Contributors, MIT License

import fetch from 'node-fetch';
import { Gubu, Open, Any } from 'gubu';

type VespaStoreOptions = {
  vespa: {
    endpoint: string; // Vespa endpoint
    application: string; // Vespa application name
  };
  debug: boolean;
  index: {
    prefix: string;
    suffix: string;
    exact?: string;
  };
  field: {
    zone: { name: string };
    base: { name: string };
    name: { name: string };
    vector: { name: string };
  };
  cmd: {
    list: {
      size: number;
    };
  };
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

    remove: async function (msg: any, reply: any) {
      try {
        const response = await fetch(`${options.vespa.endpoint}/${options.vespa.application}/document/v1/${msg.ent.entity$}/docid/${msg.q.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        reply(null, { status: 'removed' });
      } catch (error) {
        reply(error);
      }
    },

    list: async function (msg: any, reply: any) {
      const query = msg.query || 'select * from sources * where true;';
      const size = msg.size || options.cmd.list.size;

      try {
        const response = await fetch(`${options.vespa.endpoint}/search/?yql=${encodeURIComponent(query)}&hits=${size}`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: any = await response.json();
        const list = data.root.children.map((item: any) => item.fields);
        reply(null, list);
      } catch (error) {
        reply(error);
      }
    },
  };

  // Adding Seneca patterns for each operation
  this.add('role:vespa,cmd:save', store.save);
  this.add('role:vespa,cmd:load', store.load);
  this.add('role:vespa,cmd:remove', store.remove);
  this.add('role:vespa,cmd:list', store.list);

  return {
    name: store.name,
  };
}

export default SenecaVespaStore;

if (typeof module !== 'undefined') {
  module.exports = SenecaVespaStore;
}
