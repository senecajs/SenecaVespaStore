"use strict";
// Copyright © 2024 Seneca Project Contributors, MIT License
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
function SenecaVespaStore(options) {
    const seneca = this;
    let store = {
        name: 'SenecaVespaStore',
        save: async function (msg, reply) {
            const ent = msg.ent;
            const body = JSON.stringify(ent.data$(false));
            try {
                const response = await (0, node_fetch_1.default)(`${options.vespa.endpoint}/${options.vespa.application}/document/v1/${ent.entity$}/docid/${ent.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: body,
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                ent.data$(data.fields);
                reply(null, ent);
            }
            catch (error) {
                reply(error);
            }
        },
        load: async function (msg, reply) {
            try {
                const response = await (0, node_fetch_1.default)(`${options.vespa.endpoint}/${options.vespa.application}/document/v1/${msg.ent.entity$}/docid/${msg.q.id}`, {
                    method: 'GET',
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const ent = msg.ent.make$(data.fields);
                reply(null, ent);
            }
            catch (error) {
                reply(error);
            }
        },
        //I'm going to Add more operations here
    };
    this.add('init:SenecaVespaStore', function (msg, respond) {
        console.log('SenecaVespaStore initialized');
        respond();
    });
    return {
        name: store.name,
    };
}
exports.default = SenecaVespaStore;
if (typeof module !== 'undefined') {
    module.exports = SenecaVespaStore;
}
//# sourceMappingURL=VespaStore.js.map