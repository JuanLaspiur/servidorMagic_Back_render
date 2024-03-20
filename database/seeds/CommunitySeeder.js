'use strict'
var ObjectId = require('mongodb').ObjectId;
/*
|--------------------------------------------------------------------------
| CommunitySeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Community = use("App/Models/Community")
const communityData = [
  {
    id: 1,
    name: 'No nací en  España'
  },
  {
    id: 2,
    name: 'Andalucía'
  },
  {
    id: 3,
    name: 'Aragón'
  },
  {
    id: 4,
    name: 'Asturias'
  },
  {
    id: 5,
    name: 'Baleares'
  },
  {
    id: 6,
    name: 'Canarias'
  },
  {
    id: 7,
    name: 'Cantabria'
  },
  {
    id: 8,
    name: 'Castilla la Mancha'
  },
  {
    id: 9,
    name: 'Castilla y León'
  },
  {
    id: 10,
    name: 'Cataluña'
  },
  {
    id: 11,
    name: 'Comunidad Valenciana'
  },
  {
    id: 12,
    name: 'Extremadura'
  },
  {
    id: 13,
    name: 'Galicia'
  },
  {
    id: 14,
    name: 'La Rioja'
  },
  {
    id: 15,
    name: 'Madrid'
  },
  {
    id: 16,
    name: 'Murcia'
  },
  {
    id: 17,
    name: 'Navarra'
  },
  {
    id: 18,
    name: 'País Vasco'
  }
]

class CommunitySeeder {
  async run () {
    for (let i in communityData) {
      let community = await Community.findBy('_id', communityData[i]._id)
      if (!community) {
        await Community.create(communityData[i])
      }
    }
  }
}

module.exports = CommunitySeeder
