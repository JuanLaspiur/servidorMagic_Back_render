'use strict'

/*
|--------------------------------------------------------------------------
| AnimaleSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Animales = use("App/Models/Animale")
const animalesData = [
  {
    id: 0,
    img: 'ICONOS A COLOR-00.png'
  },
  {
    id: 1,
    img: 'ICONOS A COLOR-01.png'
  },
  {
    id: 2,
    img: 'ICONOS A COLOR-02.png'
  },
  {
    id: 3,
    img: 'ICONOS A COLOR-03.png'
  },
  {
    id: 4,
    img: 'ICONOS A COLOR-04.png'
  },
  {
    id: 5,
    img: 'ICONOS A COLOR-05.png'
  },
  {
    id: 6,
    img: 'ICONOS A COLOR-06.png'
  },
  {
    id: 7,
    img: 'ICONOS A COLOR-07.png'
  },
  {
    id: 8,
    img: 'ICONOS A COLOR-08.png'
  },
  {
    id: 9,
    img: 'ICONOS A COLOR-09.png'
  },
  {
    id: 10,
    img: 'ICONOS A COLOR-10.png'
  },
  {
    id: 11,
    img: 'ICONOS A COLOR-11.png'
  },
  {
    id: 12,
    img: 'ICONOS A COLOR-12.png'
  },
  {
    id: 13,
    img: 'ICONOS A COLOR-13.png'
  },
  {
    id: 14,
    img: 'ICONOS A COLOR-14.png'
  },
  {
    id: 15,
    img: 'ICONOS A COLOR-15.png'
  },
  {
    id: 16,
    img: 'ICONOS A COLOR-16.png'
  },
  {
    id: 17,
    img: 'ICONOS A COLOR-17.png'
  },
  {
    id: 18,
    img: 'ICONOS A COLOR-18.png'
  },
  {
    id: 19,
    img: 'ICONOS A COLOR-19.png'
  },
  {
    id: 20,
    img: 'ICONOS A COLOR-20.png'
  },
  {
    id: 21,
    img: 'ICONOS A COLOR-21.png'
  },
  {
    id: 22,
    img: 'ICONOS A COLOR-22.png'
  },
  {
    id: 23,
    img: 'ICONOS A COLOR-23.png'
  },
  {
    id: 24,
    img: 'ICONOS A COLOR-24.png'
  },
  {
    id: 25,
    img: 'ICONOS A COLOR-25.png'
  },
  {
    id: 26,
    img: 'ICONOS A COLOR-26.png'
  },
  {
    id: 27,
    img: 'ICONOS A COLOR-27.png'
  },
  {
    id: 28,
    img: 'ICONOS A COLOR-28.png'
  },
  {
    id: 29,
    img: 'ICONOS A COLOR-29.png'
  },
  {
    id: 30,
    img: 'ICONOS A COLOR-30.png'
  },
  {
    id: 31,
    img: 'ICONOS A COLOR-31.png'
  },
  {
    id: 32,
    img: 'ICONOS A COLOR-32.png'
  },
  {
    id: 33,
    img: 'ICONOS A COLOR-33.png'
  },
  {
    id: 34,
    img: 'ICONOS A COLOR-34.png'
  },
  {
    id: 35,
    img: 'ICONOS A COLOR-35.png'
  },
  {
    id: 36,
    img: 'ICONOS A COLOR-36.png'
  },
  {
    id: 37,
    img: 'ICONOS A COLOR-37.png'
  },
  {
    id: 38,
    img: 'ICONOS A COLOR-38.png'
  },
  {
    id: 39,
    img: 'ICONOS A COLOR-39.png'
  },
  {
    id: 40,
    img: 'ICONOS A COLOR-40.png'
  },
  {
    id: 41,
    img: 'ICONOS A COLOR-41.png'
  },
  {
    id: 42,
    img: 'ICONOS A COLOR-42.png'
  },
  {
    id: 43,
    img: 'ICONOS A COLOR-43.png'
  },
  {
    id: 44,
    img: 'ICONOS A COLOR-44.png'
  },
  {
    id: 45,
    img: 'ICONOS A COLOR-45.png'
  },
  {
    id: 46,
    img: 'ICONOS A COLOR-46.png'
  },
  {
    id: 47,
    img: 'ICONOS A COLOR-47.png'
  }/* ,
  {
    id: 48,
    img: 'ICONOS A COLOR-48.png'
  },
  {
    id: 49,
    img: 'ICONOS A COLOR-49.png'
  },
  {
    id: 50,
    img: 'ICONOS A COLOR-50.png'
  },
  {
    id: 51,
    img: 'ICONOS A COLOR-51.png'
  },
  {
    id: 52,
    img: 'ICONOS A COLOR-52.png'
  },
  {
    id: 53,
    img: 'ICONOS A COLOR-53.png'
  },
  {
    id: 54,
    img: 'ICONOS A COLOR-54.png'
  },
  {
    id: 55,
    img: 'ICONOS A COLOR-55.png'
  },
  {
    id: 56,
    img: 'ICONOS A COLOR-56.png'
  },
  {
    id: 57,
    img: 'ICONOS A COLOR-57.png'
  },
  {
    id: 58,
    img: 'ICONOS A COLOR-58.png'
  },
  {
    id: 59,
    img: 'ICONOS A COLOR-59.png'
  },
  {
    id: 60,
    img: 'ICONOS A COLOR-60.png'
  },
  {
    id: 61,
    img: 'ICONOS A COLOR-62.png'
  },
  {
    id: 62,
    img: 'ICONOS A COLOR-63.png'
  },
  {
    id: 63,
    img: 'ICONOS A COLOR-64.png'
  },
  {
    id: 64,
    img: 'ICONOS A COLOR-65.png'
  },
  {
    id: 65,
    img: 'ICONOS A COLOR-66.png'
  },
  {
    id: 66,
    img: 'ICONOS A COLOR-67.png'
  },
  {
    id: 67,
    img: 'ICONOS A COLOR-68.png'
  },
  {
    id: 68,
    img: 'ICONOS A COLOR-69.png'
  },
  {
    id: 69,
    img: 'ICONOS A COLOR-70.png'
  },
  {
    id: 70,
    img: 'ICONOS A COLOR-71.png'
  },
  {
    id: 71,
    img: 'ICONOS A COLOR-72.png'
  },
  {
    id: 72,
    img: 'ICONOS A COLOR-73.png'
  },
  {
    id: 73,
    img: 'ICONOS A COLOR-74.png'
  },
  {
    id: 74,
    img: 'ICONOS A COLOR-75.png'
  },
  {
    id: 75,
    img: 'ICONOS A COLOR-76.png'
  },
  {
    id: 76,
    img: 'ICONOS A COLOR-77.png'
  },
  {
    id: 77,
    img: 'ICONOS A COLOR-78.png'
  },
  {
    id: 78,
    img: 'ICONOS A COLOR-79.png'
  },
  {
    id: 79,
    img: 'ICONOS A COLOR-80.png'
  },
  {
    id: 80,
    img: 'ICONOS A COLOR-81.png'
  },
  {
    id: 81,
    img: 'ICONOS A COLOR-82.png'
  },
  {
    id: 82,
    img: 'ICONOS A COLOR-83.png'
  },
  {
    id: 83,
    img: 'ICONOS A COLOR-84.png'
  },
  {
    id: 84,
    img: 'ICONOS A COLOR-85.png'
  },
  {
    id: 85,
    img: 'ICONOS A COLOR-86.png'
  },
  {
    id: 86,
    img: 'ICONOS A COLOR-87.png'
  },
  {
    id: 87,
    img: 'ICONOS A COLOR-88.png'
  },
  {
    id: 88,
    img: 'ICONOS A COLOR-89.png'
  },
  {
    id: 89,
    img: 'ICONOS A COLOR-90.png'
  },
  {
    id: 90,
    img: 'ICONOS A COLOR-91.png'
  },
  {
    id: 90,
    img: 'ICONOS A COLOR-92.png'
  },
  {
    id: 90,
    img: 'ICONOS A COLOR-93.png'
  },
  {
    id: 90,
    img: 'ICONOS A COLOR-94.png'
  },
  {
    id: 90,
    img: 'ICONOS A COLOR-95.png'
  }, */
]

class AnimaleSeeder {
  async run () {
    for (let i in animalesData) {
      let animal = await Animales.findBy('id', animalesData[i].id)
      if (!animal) {
        await Animales.create(animalesData[i])
      } else {
        animal.id = animalesData[i].id
        animal.img = animalesData[i].img
        await animal.save()
      }
    }
  }
}

module.exports = AnimaleSeeder
