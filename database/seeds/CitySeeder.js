'use strict'

/*
|--------------------------------------------------------------------------
| CiudadSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const City = use("App/Models/City")
const cityData = [
  {
    id: 1,
    name: 'Madrid'
  }
]
class CitySeeder {
  async run () {
    // await Ciudad.query().delete()
    for (let i in cityData) {
      let city = await City.findBy('id', cityData[i].id)
      if (!city) {
        await City.create(cityData[i])
      } else {
        city.name = cityData[i].name
        await city.save()
      }
    }
  }
}

module.exports = CitySeeder
